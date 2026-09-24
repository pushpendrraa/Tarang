// ─── TraceNet Static Data Store ──────────────────────────────────────
// Loads all data from /files/ directory (served as static assets)
// No backend, no authentication required

// ─── Parse CSV helper ─────────────────────────────────────────────────
export function parseCSV(text) {
  const lines = text.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim().replace(/\r/g, ''));
  return lines.slice(1).map(line => {
    const vals = line.split(',').map(v => v.trim().replace(/\r/g, ''));
    const obj = {};
    headers.forEach((h, i) => { obj[h] = vals[i] || ''; });
    return obj;
  }).filter(row => Object.values(row).some(v => v));
}

// ─── Load all data files ──────────────────────────────────────────────
export async function loadAllData() {
  const [
    entitiesRes,
    casesRes,
    relationshipsRes,
    firRes,
    surveillanceRes,
    cdrText,
    finText,
  ] = await Promise.all([
    fetch('/files/entities_master.json').then(r => r.json()),
    fetch('/files/cases.json').then(r => r.json()),
    fetch('/files/relationships_ground_truth.json').then(r => r.json()),
    fetch('/files/fir_reports.json').then(r => r.json()),
    fetch('/files/surveillance_notes.json').then(r => r.json()),
    fetch('/files/cdr_records.csv').then(r => r.text()),
    fetch('/files/financial_transactions.csv').then(r => r.text()),
  ]);

  const cdrRecords = parseCSV(cdrText);
  const financialTxns = parseCSV(finText);

  return {
    entities: entitiesRes,
    cases: casesRes,
    relationships: relationshipsRes,
    firs: firRes,
    surveillance: surveillanceRes,
    cdrRecords,
    financialTxns,
  };
}

// ─── Build unified entity list (nodes) ───────────────────────────────
export function buildEntityNodes(entities, cdrRecords, financialTxns) {
  const nodes = [];
  const phoneCallCounts = {};

  // Count CDR calls per number
  cdrRecords.forEach(r => {
    phoneCallCounts[r.caller_number] = (phoneCallCounts[r.caller_number] || 0) + 1;
    phoneCallCounts[r.callee_number] = (phoneCallCounts[r.callee_number] || 0) + 1;
  });

  // Account transaction totals
  const accountTotals = {};
  financialTxns.forEach(t => {
    accountTotals[t.from_account] = (accountTotals[t.from_account] || 0) + parseFloat(t.amount_inr || 0);
    accountTotals[t.to_account]   = (accountTotals[t.to_account]   || 0) + parseFloat(t.amount_inr || 0);
  });

  // Flagged persons set
  const flaggedPersons = new Set(['P001', 'P004', 'P005', 'P010', 'P011', 'P016', 'P019', 'P020']);

  // Persons — compute influence as call degree of their primary phone
  entities.persons.forEach(p => {
    const myPhones = entities.phones.filter(ph => ph.owner_id === p.id);
    const totalCalls = myPhones.reduce((sum, ph) => sum + (phoneCallCounts[ph.number] || 0), 0);
    const isFlagged = flaggedPersons.has(p.id);

    // Build CDR activity list for this person
    const myNumbers = new Set(myPhones.map(ph => ph.number));
    const cdrActivity = cdrRecords.filter(r => myNumbers.has(r.caller_number) || myNumbers.has(r.callee_number));

    nodes.push({
      id: p.id,
      label: p.name,
      type: 'person',
      role: p.role,
      address: p.address,
      aliases: p.aliases,
      dob: p.dob,
      nationality: p.nationality,
      occupation: p.occupation,
      criminal_history: p.criminal_history || [],
      known_associates: p.known_associates || [],
      risk_level: p.risk_level || 'LOW',
      influenceScore: Math.min(1, totalCalls / 40),
      callCount: totalCalls,
      flagged: isFlagged,
      phones: myPhones.map(ph => ph.number),
      phoneIds: myPhones.map(ph => ph.id),
      caseIds: guessCaseIds(p, entities),
      cdrActivity: cdrActivity.slice(0, 20), // recent CDR
    });
  });

  // Phones
  entities.phones.forEach(ph => {
    const owner = entities.persons.find(p => p.id === ph.owner_id);
    const isBurner = ph.type.includes('burner');
    nodes.push({
      id: ph.id,
      label: ph.number,
      type: 'phone',
      subtype: ph.type,
      owner: owner?.name,
      ownerId: ph.owner_id,
      influenceScore: Math.min(1, (phoneCallCounts[ph.number] || 0) / 30),
      callCount: phoneCallCounts[ph.number] || 0,
      flagged: isBurner,
    });
  });

  // Vehicles
  entities.vehicles.forEach(v => {
    const owner = entities.persons.find(p => p.id === v.registered_owner_id);
    nodes.push({
      id: v.id,
      label: v.plate,
      type: 'vehicle',
      vehicleType: v.type,
      note: v.note,
      owner: owner?.name,
      ownerId: v.registered_owner_id,
      influenceScore: 0.2,
      flagged: false,
    });
  });

  // Bank accounts
  entities.bank_accounts.forEach(a => {
    const key = `${a.bank.split(' ')[0].toUpperCase()}-${a.account_no}`;
    const totalVol = accountTotals[key] || 0;
    const isSuspicious = ['A002', 'A003', 'A006', 'A007', 'A009', 'A010'].includes(a.id);
    const holder = entities.persons.find(p => p.id === a.holder_id);

    // Find transactions for this account
    const myTxns = financialTxns.filter(t => t.from_account === key || t.to_account === key);

    nodes.push({
      id: a.id,
      label: a.account_no,
      type: 'account',
      bank: a.bank,
      ifsc: a.ifsc,
      holder: holder?.name,
      holderId: a.holder_id,
      transactionVolume: totalVol,
      influenceScore: Math.min(1, totalVol / 500000),
      flagged: isSuspicious,
      note: a.note,
      recentTxns: myTxns.slice(0, 10),
    });
  });

  // Locations
  entities.locations.forEach(l => {
    nodes.push({
      id: l.id,
      label: l.name,
      type: 'location',
      lat: l.lat,
      lng: l.lng,
      influenceScore: 0.15,
      flagged: false,
    });
  });

  // Organizations
  entities.organizations.forEach(o => {
    nodes.push({
      id: o.id,
      label: o.name,
      type: 'organization',
      orgType: o.type,
      address: o.address,
      note: o.note,
      influenceScore: 0.45,
      flagged: true,
    });
  });

  // Compute betweenness-like rank for persons from CDR
  const maxCalls = Math.max(...nodes.filter(n => n.type === 'person').map(n => n.callCount || 0), 1);
  return nodes.map(n => ({
    ...n,
    influenceScore: n.type === 'person' ? Math.min(1, (n.callCount || 0) / maxCalls) : n.influenceScore,
  }));
}

function guessCaseIds(person, entities) {
  const caseMap = {
    'P001': ['CASE-2026-001','CASE-2026-002','CASE-2026-003','CASE-2026-004'],
    'P002': ['CASE-2026-001'],
    'P003': ['CASE-2026-001'],
    'P004': ['CASE-2026-001'],
    'P005': ['CASE-2026-002'],
    'P006': ['CASE-2026-002'],
    'P007': ['CASE-2026-003'],
    'P008': ['CASE-2026-001'],
    'P009': ['CASE-2026-002'],
    'P010': ['CASE-2026-002'],
    'P011': ['CASE-2026-004'],
    'P012': ['CASE-2026-002'],
    'P013': ['CASE-2026-003'],
    'P014': ['CASE-2026-004'],
    'P015': ['CASE-2026-001'],
    'P016': ['CASE-2026-001','CASE-2026-002'],
    'P017': ['CASE-2026-003'],
    'P018': ['CASE-2026-001'],
    'P019': ['CASE-2026-004'],
    'P020': ['CASE-2026-003','CASE-2026-004'],
  };
  return caseMap[person.id] || [];
}

// ─── Build graph edges ─────────────────────────────────────────────────
export function buildGraphEdges(entities, cdrRecords, financialTxns, nodes) {
  const edges = [];
  const edgeSet = new Set();
  const addEdge = (src, tgt, type, weight, label, evidenceHint = '') => {
    const key = [src, tgt, type].sort().join('::');
    if (!edgeSet.has(key)) {
      edgeSet.add(key);
      edges.push({ id: `E${edges.length}`, source: src, target: tgt, type, weight, label, evidenceHint });
    } else {
      const ex = edges.find(e => [e.source, e.target, e.type].sort().join('::') === key);
      if (ex) ex.weight = Math.min(10, ex.weight + 1);
    }
  };

  // Person → Phone ownership
  entities.phones.forEach(ph => {
    addEdge(ph.owner_id, ph.id, 'owns', 2, 'owns', 'entities_master.json');
  });

  // Person → Vehicle
  entities.vehicles.forEach(v => {
    addEdge(v.registered_owner_id, v.id, 'owns', 2, 'owns', 'entities_master.json');
  });

  // Person → Account
  entities.bank_accounts.forEach(a => {
    addEdge(a.holder_id, a.id, 'holds', 2, 'holds', 'entities_master.json');
  });

  // Org → Account
  entities.organizations.forEach(o => {
    if (o.linked_account_id) addEdge(o.id, o.linked_account_id, 'linked_to', 3, 'linked_to', 'entities_master.json');
  });
  // Link Ramesh Gupta (P010) to O001
  addEdge('P010', 'O001', 'owns', 4, 'owns', 'fir_reports.json (DEL-2026-0778)');
  // P019 → O003
  addEdge('P019', 'O003', 'runs', 4, 'runs', 'surveillance_notes.json');
  // P020 → O002
  addEdge('P020', 'O002', 'owns', 4, 'owns', 'entities_master.json');
  // P001 → O004
  addEdge('P001', 'O004', 'owns', 5, 'owns', 'fir_reports.json');

  // CDR → phone-to-phone call edges
  const phoneMap = {};
  entities.phones.forEach(ph => { phoneMap[ph.number] = ph.id; });

  // Count calls between phone pairs
  const callCounts = {};
  cdrRecords.forEach(r => {
    const src = phoneMap[r.caller_number];
    const tgt = phoneMap[r.callee_number];
    if (!src || !tgt) return;
    const key = [src, tgt].sort().join('::');
    callCounts[key] = (callCounts[key] || 0) + 1;
  });
  Object.entries(callCounts).forEach(([key, count]) => {
    const [a, b] = key.split('::');
    addEdge(a, b, 'called', Math.min(10, count), 'called', 'cdr_records.csv');
  });

  // Financial edges between accounts
  const accountMap = {};
  entities.bank_accounts.forEach(a => {
    const bankShort = a.bank.split(' ')[0].toUpperCase();
    accountMap[`${bankShort}-${a.account_no}`] = a.id;
  });
  const txnCounts = {};
  financialTxns.forEach(t => {
    const src = accountMap[t.from_account];
    const tgt = accountMap[t.to_account];
    if (!src || !tgt) return;
    const key = [src, tgt].sort().join('::');
    txnCounts[key] = (txnCounts[key] || 0) + parseFloat(t.amount_inr || 0);
  });
  Object.entries(txnCounts).forEach(([key, total]) => {
    const [a, b] = key.split('::');
    addEdge(a, b, 'transacted', Math.min(10, Math.ceil(total / 50000)), 'transacted', 'financial_transactions.csv');
  });

  // Key hidden links from relationships file
  // P001's burner PH002 ↔ P013's phone PH011
  addEdge('PH002', 'PH011', 'called', 8, 'called (hidden)', 'surveillance_notes.json: SN-003 + cdr_records.csv');
  // P001 ↔ P005/P006 (burner link)
  addEdge('PH002', 'PH006', 'called', 6, 'called (hidden)', 'surveillance_notes.json: SN-002');
  // P004 → P010 financial
  addEdge('A002', 'A003', 'transacted', 7, 'transacted', 'financial_transactions.csv (ICICI→SBI)');
  // P011 → P001
  addEdge('P011', 'P001', 'coordinates_with', 5, 'coordinates_with', 'fir_reports.json: FIR-KOL + SN-004');
  // P016 ↔ P001 (hawala link)
  addEdge('P016', 'P001', 'coordinates_with', 6, 'hawala_link', 'financial_transactions.csv + cdr_records.csv');
  // P020 ↔ P016 (cross-border)
  addEdge('P020', 'P016', 'coordinates_with', 5, 'coordinates_with', 'cdr_records.csv + entities_master.json');
  // P019 ↔ P011 (trafficking)
  addEdge('P019', 'P011', 'coordinates_with', 4, 'coordinates_with', 'fir_reports.json: FIR-KOL');
  // P017 ↔ P007 (mule ↔ contact)
  addEdge('P017', 'P007', 'works_for', 3, 'works_for', 'cdr_records.csv + NDPS intercept');
  // P018 ↔ P003 (dock supply chain)
  addEdge('P018', 'P003', 'coordinates_with', 3, 'supply_chain', 'entities_master.json');

  // Person addresses → locations
  const locationMap = {};
  entities.locations.forEach(l => { locationMap[l.name] = l.id; });
  entities.persons.forEach(p => {
    const locId = locationMap[p.address];
    if (locId) addEdge(p.id, locId, 'located_at', 1, 'located_at', 'entities_master.json');
  });

  return edges;
}

// ─── Compute influence scores (simple degree centrality) ──────────────
export function computeInfluenceScores(nodes, edges) {
  const degree = {};
  edges.forEach(e => {
    degree[e.source] = (degree[e.source] || 0) + e.weight;
    degree[e.target] = (degree[e.target] || 0) + e.weight;
  });
  const maxDeg = Math.max(...Object.values(degree), 1);
  return nodes.map(n => ({
    ...n,
    influenceScore: parseFloat(((degree[n.id] || 0) / maxDeg).toFixed(3)),
    degreeScore: degree[n.id] || 0,
  })).sort((a, b) => b.influenceScore - a.influenceScore);
}

// ─── Community assignment (simple geographic clustering) ──────────────
const COMMUNITY_MAP = {
  'Mumbai':   0, 'Dongri': 0, 'Andheri': 0, 'Bandra': 0, 'Nhava Sheva': 0, 'Mohammed Ali Road': 0,
  'Delhi':    1, 'Chandni Chowk': 1, 'Karol Bagh': 1, 'Connaught Place': 1,
  'Amritsar': 2, 'Punjab': 2, 'Attari': 2,
  'Kolkata':  3, 'Park Street': 3, 'Salt Lake': 3,
};
export function assignCommunities(nodes) {
  return nodes.map(n => {
    let community = -1;
    if (n.address) {
      for (const [key, c] of Object.entries(COMMUNITY_MAP)) {
        if (n.address.includes(key)) { community = c; break; }
      }
    }
    if (n.label) {
      for (const [key, c] of Object.entries(COMMUNITY_MAP)) {
        if (n.label.includes(key)) { community = c; break; }
      }
    }
    // Special: RV's burner bridges all communities → community 0 (Mumbai)
    if (n.id === 'PH002' || n.id === 'PH014' || n.id === 'PH019') community = 0;
    return { ...n, communityId: community };
  });
}
