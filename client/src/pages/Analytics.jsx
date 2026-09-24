import { useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Award, BarChart3, Users, AlertTriangle, Shield, Info, ChevronDown, ChevronUp
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import { useData } from '../context/DataContext';

const TYPE_CONFIG = {
  person:       { color: '#0A84FF' },
  phone:        { color: '#30D158' },
  vehicle:      { color: '#FF9F0A' },
  account:      { color: '#FF453A' },
  location:     { color: '#BF5AF2' },
  organization: { color: '#64D2FF' },
};

function InfluencerCard({ node, index }) {
  const [expanded, setExpanded] = useState(false);
  const color = TYPE_CONFIG[node.type]?.color || '#8E8E93';
  const MEDALS = ['🥇', '🥈', '🥉'];

  // Explainability reasons
  const reasons = {
    P001: 'Referred to as "Sir" and "RV" across all 4 FIRs. Burner phone (7710099887) detected in tower dumps for Delhi, Punjab, and Mumbai cases. Highest cross-case centrality.',
    P004: 'Account A002 (ICICI-5678) receives layered cash deposits from unknown depositors. Transfers observed to Gupta Traders (A003) — shared laundering pipeline.',
    PH002: 'Burner number (7710099887) appears in CDR with Delhi extortion numbers and Bhupinder Singh (Punjab). Surveillance SN-002 and SN-003 both reference this number.',
    P005: 'Named directly in Delhi extortion FIR. CDR links his number to P010 (Gupta Traders account).',
    P010: 'Gupta Traders account (SBI-9012) receives ₹2,00,000 cash deposit (TXN0026) — extortion proceeds. Also receives transfers from ICICI-5678.',
  };

  return (
    <motion.div
      className="card"
      style={{ padding: '14px 18px', cursor: 'pointer' }}
      initial={{ opacity: 0, x: -14 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06 }}
      onClick={() => setExpanded(!expanded)}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: `${color}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>
          {MEDALS[index] || `#${index + 1}`}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
            <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{node.label}</span>
            {node.flagged && <AlertTriangle size={13} color="var(--color-danger)" />}
          </div>
          <span className="badge" style={{ background: `${color}18`, color, fontSize: '0.65rem' }}>{node.type}</span>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: '1.125rem', fontWeight: 800, letterSpacing: '-0.02em', color }}>
            {((node.influenceScore || 0) * 100).toFixed(1)}
          </div>
          <div style={{ fontSize: '0.65rem', color: 'var(--color-text-quaternary)' }}>score</div>
        </div>
        {expanded ? <ChevronUp size={14} color="var(--color-text-quaternary)" /> : <ChevronDown size={14} color="var(--color-text-quaternary)" />}
      </div>

      {expanded && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--color-bg-tertiary)' }}>
          {/* Bar */}
          <div style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>Network Centrality</span>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color }}>{((node.influenceScore || 0) * 100).toFixed(1)}%</span>
            </div>
            <div style={{ height: 5, background: 'var(--color-bg-tertiary)', borderRadius: 99 }}>
              <motion.div initial={{ width: 0 }} animate={{ width: `${(node.influenceScore || 0) * 100}%` }} transition={{ duration: 0.5 }} style={{ height: '100%', background: color, borderRadius: 99 }} />
            </div>
          </div>

          {/* Role */}
          {node.role && <div style={{ fontSize: '0.78rem', color: 'var(--color-text-tertiary)', marginBottom: 8 }}>{node.role}</div>}

          {/* Explainability */}
          {(reasons[node.id] || node.flagged) && (
            <div style={{ background: node.flagged ? 'rgba(255,69,58,0.07)' : 'rgba(10,132,255,0.07)', border: `1px solid ${node.flagged ? 'rgba(255,69,58,0.2)' : 'rgba(10,132,255,0.2)'}`, borderRadius: 'var(--radius-md)', padding: '10px 12px' }}>
              <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                <Info size={13} color={node.flagged ? 'var(--color-danger)' : 'var(--color-accent)'} style={{ flexShrink: 0, marginTop: 1 }} />
                <div>
                  <div style={{ fontWeight: 700, color: node.flagged ? 'var(--color-danger)' : 'var(--color-accent)', fontSize: '0.78rem', marginBottom: 4 }}>Why High-Ranked?</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', lineHeight: 1.5 }}>{reasons[node.id] || `High network degree from CDR/financial data. Active in ${node.caseIds?.length || 0} case(s).`}</div>
                </div>
              </div>
            </div>
          )}

          {/* Cases */}
          {node.caseIds?.length > 0 && (
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 8 }}>
              {node.caseIds.map(id => <span key={id} className="badge badge-blue" style={{ fontSize: '0.65rem' }}>{id}</span>)}
            </div>
          )}

          <div style={{ fontSize: '0.7rem', color: 'var(--color-text-quaternary)', marginTop: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
            <Shield size={10} /> Investigator lead — verify before action
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

export default function Analytics() {
  const { nodes, edges, rawData, loading } = useData();

  const persons     = nodes.filter(n => n.type === 'person').slice(0, 12);
  const topNodes    = [...nodes].sort((a, b) => b.influenceScore - a.influenceScore).slice(0, 12);

  // Entity type distribution
  const typeDist = Object.entries(
    nodes.reduce((acc, n) => { acc[n.type] = (acc[n.type] || 0) + 1; return acc; }, {})
  ).map(([name, value]) => ({ name, value }));

  // Influence chart data
  const influenceChart = persons.map(n => ({
    name: n.label.split(' ')[0],
    score: parseFloat(((n.influenceScore || 0) * 100).toFixed(1)),
    cases: n.caseIds?.length || 0,
  }));

  // CDR call volume by location
  const locationVol = (rawData?.cdrRecords || []).reduce((acc, r) => {
    const loc = r.tower_location?.split(',')[0] || 'Unknown';
    acc[loc] = (acc[loc] || 0) + 1;
    return acc;
  }, {});
  const locationChart = Object.entries(locationVol).map(([name, calls]) => ({ name, calls })).sort((a, b) => b.calls - a.calls);

  // Financial volume by account
  const txnVol = (rawData?.financialTxns || []).reduce((acc, t) => {
    acc[t.from_account] = (acc[t.from_account] || 0) + parseFloat(t.amount_inr || 0);
    return acc;
  }, {});
  const totalTxnVol = Object.values(txnVol).reduce((a, b) => a + b, 0);
  const flaggedAccounts = ['ICICI-XXXXXXXX5678', 'SBI-XXXXXXXX9012', 'AXIS-XXXXXXXX3456'];

  return (
    <div className="page-container" style={{ maxWidth: 1200 }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Network Analytics</h1>
          <p style={{ margin: '4px 0 0', color: 'var(--color-text-tertiary)', fontSize: '0.875rem' }}>
            Algorithmic influence scoring from CDR + financial data. All rankings are investigator leads.
          </p>
        </div>
      </div>

      {/* Summary stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 28 }}>
        {[
          { label: 'Entities', value: nodes.length,       color: 'var(--color-accent)',  cls: 'accent' },
          { label: 'Connections', value: edges.length,    color: 'var(--color-success)', cls: 'success' },
          { label: 'Flagged Leads', value: nodes.filter(n => n.flagged).length, color: 'var(--color-danger)', cls: 'danger' },
          { label: 'CDR Records', value: rawData?.cdrRecords?.length || 0, color: 'var(--color-purple)', cls: '' },
          { label: 'Financial Txns', value: rawData?.financialTxns?.length || 0, color: 'var(--color-warning)', cls: 'warning' },
          { label: 'Total Txn Vol', value: `₹${(totalTxnVol/100000).toFixed(1)}L`, color: 'var(--color-danger)', cls: '' },
        ].map((s, i) => (
          <motion.div key={s.label} className={`stat-card ${s.cls}`} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--color-text-primary)' }}>{s.value}</div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-tertiary)' }}>{s.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="analytics-layout">
        {/* Charts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Influence chart */}
          <div className="card" style={{ padding: '20px 20px 16px' }}>
            <h3 style={{ margin: '0 0 18px', fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
              <BarChart3 size={16} color="var(--color-accent)" /> Person Influence Scores
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={influenceChart} margin={{ top: 0, right: 0, bottom: 24, left: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--color-text-quaternary)' }} angle={-30} textAnchor="end" interval={0} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--color-text-quaternary)' }} domain={[0, 100]} />
                <Tooltip contentStyle={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-bg-tertiary)', borderRadius: 10, fontSize: 12 }} />
                <Bar dataKey="score" name="Influence %" radius={[4,4,0,0]}>
                  {influenceChart.map((entry, i) => <Cell key={i} fill={entry.name === 'Rajesh' ? '#FF453A' : '#0A84FF'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div style={{ fontSize: '0.72rem', color: 'var(--color-text-quaternary)', marginTop: 8 }}>Rajesh Verma (highlighted red) is the top-ranked suspect across all 4 cases.</div>
          </div>

          {/* CDR call volume by location */}
          <div className="card" style={{ padding: '20px 20px 16px' }}>
            <h3 style={{ margin: '0 0 18px', fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Users size={16} color="var(--color-accent)" /> CDR Activity by City
            </h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={locationChart} margin={{ top: 0, right: 0, bottom: 20, left: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--color-text-quaternary)' }} angle={-20} textAnchor="end" interval={0} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--color-text-quaternary)' }} />
                <Tooltip contentStyle={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-bg-tertiary)', borderRadius: 10, fontSize: 12 }} />
                <Bar dataKey="calls" name="Calls" fill="#30D158" radius={[3,3,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Entity type pie */}
          <div className="card" style={{ padding: '20px 20px 16px' }}>
            <h3 style={{ margin: '0 0 18px', fontSize: '1rem', fontWeight: 700 }}>Entity Type Distribution</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={typeDist} cx="50%" cy="50%" outerRadius={75} dataKey="value" label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`} labelLine={{ stroke: 'var(--color-text-quaternary)', strokeWidth: 1 }}>
                  {typeDist.map((entry, i) => <Cell key={entry.name} fill={TYPE_CONFIG[entry.name]?.color || '#8E8E93'} />)}
                </Pie>
                <Tooltip contentStyle={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-bg-tertiary)', borderRadius: 10, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Influencer leaderboard */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <Award size={18} color="var(--color-accent)" />
            <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Key Influencer Leads</h2>
          </div>
          <div style={{ background: 'rgba(255,159,10,0.07)', border: '1px solid rgba(255,159,10,0.18)', borderRadius: 'var(--radius-md)', padding: '8px 12px', marginBottom: 12, fontSize: '0.75rem', color: 'var(--color-warning)', fontWeight: 500 }}>
            <Shield size={11} style={{ display: 'inline', marginRight: 4 }} />
            Rankings are investigative leads — not evidence of guilt.
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {topNodes.map((n, i) => <InfluencerCard key={n.id} node={n} index={i} />)}
          </div>
        </div>
      </div>
    </div>
  );
}
