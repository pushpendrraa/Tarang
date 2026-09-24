import nlp from 'compromise';

// ─── Regex patterns ───────────────────────────────────────────────────
const PHONE_RE      = /(?:\+91[\-\s]?)?[6-9]\d{9}/g;
const ACCOUNT_RE    = /\b\d{9,18}\b/g;
const VEHICLE_RE    = /[A-Z]{2}[\s-]?\d{2}[\s-]?[A-Z]{1,2}[\s-]?\d{4}/g;
const IP_RE         = /\b(?:\d{1,3}\.){3}\d{1,3}\b/g;
const EMAIL_RE      = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;
const COORD_RE      = /\b\d{1,3}\.\d+[NS]?,?\s*\d{1,3}\.\d+[EW]?\b/g;

/**
 * Extract structured entities using regex, then NLP for names/locations/orgs.
 * Returns array of { name, type, context } objects.
 */
export function extractEntities(text) {
  if (!text || typeof text !== 'string') return [];

  const entities = [];
  const seen = new Set();

  const add = (name, type, context = '') => {
    const key = `${type}::${name.trim().toLowerCase()}`;
    if (!seen.has(key) && name.trim().length > 0) {
      seen.add(key);
      entities.push({ name: name.trim(), type, context: context.slice(0, 200) });
    }
  };

  // ─── Regex extractions ────────────────────────────────────────────
  const phones = text.match(PHONE_RE) || [];
  phones.forEach(p => add(p.replace(/[\s\-]/g, ''), 'phone'));

  const emails = text.match(EMAIL_RE) || [];
  emails.forEach(e => add(e, 'email'));

  const ips = text.match(IP_RE) || [];
  ips.forEach(ip => add(ip, 'ip'));

  const vehicles = text.match(VEHICLE_RE) || [];
  vehicles.forEach(v => add(v.replace(/\s/g, ' ').trim(), 'vehicle'));

  // ─── NLP extractions (compromise.js) ─────────────────────────────
  const doc = nlp(text);

  // People
  doc.people().forEach(p => {
    const name = p.text('normal');
    if (name.length > 2) add(name, 'person', p.out('text'));
  });

  // Locations
  doc.places().forEach(pl => {
    const name = pl.text('normal');
    if (name.length > 2) add(name, 'location', pl.out('text'));
  });

  // Organizations
  doc.organizations().forEach(o => {
    const name = o.text('normal');
    if (name.length > 2) add(name, 'organization', o.out('text'));
  });

  return entities;
}

/**
 * Parse CDR CSV rows into call relationships.
 * Expected columns: caller, callee, duration, timestamp, tower_id
 */
export function parseCDR(csvText) {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return { entities: [], calls: [] };

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  const callerIdx  = headers.indexOf('caller');
  const calleeIdx  = headers.indexOf('callee');
  const durIdx     = headers.indexOf('duration');
  const tsIdx      = headers.indexOf('timestamp');
  const towerIdx   = headers.indexOf('tower_id');

  const entities = [];
  const calls = [];
  const seen = new Set();

  const addPhone = (num) => {
    if (!seen.has(num)) { seen.add(num); entities.push({ name: num, type: 'phone' }); }
  };

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',').map(c => c.trim());
    if (cols.length < 2) continue;
    const caller = cols[callerIdx] || '';
    const callee = cols[calleeIdx] || '';
    if (!caller || !callee) continue;
    addPhone(caller);
    addPhone(callee);
    calls.push({
      caller,
      callee,
      duration: parseInt(cols[durIdx] || '0', 10),
      timestamp: cols[tsIdx] || '',
      towerId: cols[towerIdx] || '',
    });
  }

  return { entities, calls };
}

/**
 * Parse financial transaction CSV.
 * Expected columns: sender_account, receiver_account, amount, timestamp, description
 */
export function parseFinancial(csvText) {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return { entities: [], transactions: [] };

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  const senderIdx  = headers.indexOf('sender_account');
  const receiverIdx= headers.indexOf('receiver_account');
  const amountIdx  = headers.indexOf('amount');
  const tsIdx      = headers.indexOf('timestamp');
  const descIdx    = headers.indexOf('description');

  const entities = [];
  const transactions = [];
  const seen = new Set();

  const addAccount = (acc) => {
    if (!seen.has(acc)) { seen.add(acc); entities.push({ name: acc, type: 'account' }); }
  };

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',').map(c => c.trim());
    if (cols.length < 2) continue;
    const sender   = cols[senderIdx]   || '';
    const receiver = cols[receiverIdx] || '';
    if (!sender || !receiver) continue;
    addAccount(sender);
    addAccount(receiver);
    transactions.push({
      sender,
      receiver,
      amount: parseFloat(cols[amountIdx] || '0'),
      timestamp: cols[tsIdx] || '',
      description: cols[descIdx] || '',
    });
  }

  return { entities, transactions };
}
