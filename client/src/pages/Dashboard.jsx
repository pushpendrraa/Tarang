import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  FolderOpen, Users, AlertTriangle, Network, ChevronRight,
  Activity, Shield, Zap, Database, Phone, FileText, ArrowUpRight,
  Crosshair, TrendingUp, Clock, MapPin, Layers, BarChart2,
  PieChart, ExternalLink, Radio, Target
} from 'lucide-react';
import { useData } from '../context/DataContext';

/* ── Constants ─────────────────────────────────────────────────── */
const CASE_STATUS_BADGE = {
  'Under Investigation': 'badge-blue',
  'Preliminary Enquiry': 'badge-orange',
  'Closed': 'badge-green',
};

const ENTITY_COLORS = {
  person:       '#0A84FF',
  phone:        '#30D158',
  account:      '#FF453A',
  vehicle:      '#FF9F0A',
  location:     '#BF5AF2',
  organization: '#64D2FF',
};

const ENTITY_ICONS = {
  person:       Users,
  phone:        Phone,
  account:      Database,
  vehicle:      Target,
  location:     MapPin,
  organization: Layers,
};

const INTEL_FEED = [
  { id: 1, time: 'Just now',  color: '#FF453A', icon: AlertTriangle, text: 'High-risk connection detected: P001 ↔ AC004'        },
  { id: 2, time: '4m ago',    color: '#0A84FF', icon: Database,      text: 'Financial batch parsed — 50 new transaction records' },
  { id: 3, time: '18m ago',   color: '#30D158', icon: Phone,         text: 'CDR analysis complete for target PH002'              },
  { id: 4, time: '1h ago',    color: '#FF9F0A', icon: Crosshair,     text: 'Location anomaly: vehicle V001 outside geofence'     },
  { id: 5, time: '2h ago',    color: '#64D2FF', icon: Layers,        text: 'New entity added: Organisation ORG007 flagged'       },
  { id: 6, time: '3h ago',    color: '#BF5AF2', icon: Radio,         text: 'Duplicate SIM detected across 3 suspects'            },
];

const QUICK_ACTIONS = [
  { label: 'Graph Explorer', icon: Network,   to: '/graph',     color: '#0A84FF' },
  { label: 'Analytics',      icon: BarChart2, to: '/analytics', color: '#30D158' },
  { label: 'Evidence',       icon: FileText,  to: '/evidence',  color: '#BF5AF2' },
  { label: 'Entities',       icon: Users,     to: '/entities',  color: '#FF9F0A' },
];

const THREAT_TIMELINE = [
  { time: '08:12', event: 'Suspect P001 pinged tower BTS-447 (Sector 18)', severity: 'high',     icon: Radio    },
  { time: '10:45', event: 'Financial transfer ₹4.2L flagged: AC001→AC004', severity: 'critical', icon: Database },
  { time: '13:30', event: 'V001 spotted near warehousing zone, Sector 63', severity: 'medium',   icon: MapPin   },
  { time: '16:20', event: 'New call pattern: P001 ↔ PH009 (12 calls/day)', severity: 'high',    icon: Phone    },
  { time: '19:05', event: 'ORG007 registered address verified — false',     severity: 'critical', icon: Shield   },
];

const SEV = {
  critical: { color: '#FF453A', bg: 'rgba(255,69,58,0.1)',  label: 'CRITICAL' },
  high:     { color: '#FF9F0A', bg: 'rgba(255,159,10,0.1)', label: 'HIGH'     },
  medium:   { color: '#FFD60A', bg: 'rgba(255,214,10,0.1)', label: 'MEDIUM'   },
  low:      { color: '#30D158', bg: 'rgba(48,209,88,0.1)',  label: 'LOW'      },
};

/* ── Sub-components ─────────────────────────────────────────────── */
function StatCard({ label, value, icon: Icon, color, accentClass, index, to, trend }) {
  const inner = (
    <motion.div
      className={`stat-card tap-scale ${accentClass}`}
      initial={{ opacity: 0, y: 22, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.07, duration: 0.45, ease: [0.34, 1.56, 0.64, 1] }}
      style={{ cursor: to ? 'pointer' : 'default' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{
          width: 44, height: 44, borderRadius: '13px',
          background: `linear-gradient(135deg, ${color}28 0%, ${color}10 100%)`,
          border: `1px solid ${color}33`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={20} color={color} strokeWidth={2} />
        </div>
        {to && <ArrowUpRight size={15} color="var(--color-text-quaternary)" />}
      </div>
      <div>
        <div style={{ fontSize: '2.2rem', fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--color-text-primary)', lineHeight: 1 }}>
          {value}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 5 }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--color-text-tertiary)', fontWeight: 600 }}>{label}</span>
          {trend && (
            <span style={{ fontSize: '0.68rem', color: '#30D158', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 2 }}>
              <TrendingUp size={9} /> {trend}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
  if (to) return <Link to={to} style={{ textDecoration: 'none', display: 'block' }}>{inner}</Link>;
  return inner;
}

function IntelItem({ item, isActive }) {
  const Ic = item.icon;
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 12px',
      borderRadius: 'var(--radius-md)',
      background: isActive ? `${item.color}10` : 'transparent',
      border: `1px solid ${isActive ? item.color + '30' : 'transparent'}`,
      transition: 'all 0.3s ease',
    }}>
      <div style={{ width: 30, height: 30, borderRadius: 8, background: `${item.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Ic size={14} color={item.color} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-primary)', fontWeight: 500, lineHeight: 1.4 }}>{item.text}</p>
        <span style={{ fontSize: '0.68rem', color: 'var(--color-text-quaternary)', fontWeight: 600 }}>{item.time}</span>
      </div>
      {isActive && <div style={{ width: 6, height: 6, borderRadius: '50%', background: item.color, flexShrink: 0, marginTop: 5 }} />}
    </div>
  );
}

export default function Dashboard() {
  const { nodes, edges, rawData, loading } = useData();
  const [intelIndex, setIntelIndex] = useState(0);
  const [clockTime, setClockTime]   = useState(new Date());

  const cases       = rawData?.cases || [];
  const firs        = rawData?.firs  || [];
  const flagged     = nodes.filter(n => n.flagged);
  const persons     = nodes.filter(n => n.type === 'person');
  const topNode     = [...persons].sort((a, b) => (b.influenceScore || 0) - (a.influenceScore || 0))[0];
  const topEntities = [...nodes]
    .filter(n => n.influenceScore)
    .sort((a, b) => (b.influenceScore || 0) - (a.influenceScore || 0))
    .slice(0, 5);

  const entityCounts  = nodes.reduce((acc, n) => { acc[n.type] = (acc[n.type] || 0) + 1; return acc; }, {});
  const totalEntities = nodes.length || 1;

  useEffect(() => {
    const iv = setInterval(() => setIntelIndex(p => (p + 1) % INTEL_FEED.length), 3500);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    const iv = setInterval(() => setClockTime(new Date()), 1000);
    return () => clearInterval(iv);
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          style={{ width: 50, height: 50, border: '3px solid var(--color-accent)', borderTopColor: 'transparent', borderRadius: '50%', margin: '0 auto 20px' }}
        />
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', fontWeight: 500 }}>Decrypting intelligence...</p>
      </div>
    </div>
  );

  return (
    <div className="dashboard-root">

      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="dash-header">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="dash-title">Investigative Overview</h1>
          <p className="dash-subtitle">
            <Activity size={13} color="var(--color-accent)" />
            Operation Syndicate — SIH26189 · Ministry of Home Affairs
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
          className="glass-card live-ticker"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            <span className="status-dot active" />
            <span style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-secondary)', letterSpacing: '0.06em' }}>Live</span>
          </div>
          <div style={{ width: 1, height: 13, background: 'var(--color-bg-tertiary)', flexShrink: 0 }} />
          <div style={{ flex: 1, position: 'relative', height: 18, overflow: 'hidden', minWidth: 0 }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={intelIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.22 }}
                style={{ position: 'absolute', width: '100%', fontSize: '0.76rem', color: INTEL_FEED[intelIndex].color, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
              >
                {INTEL_FEED[intelIndex].text}
              </motion.div>
            </AnimatePresence>
          </div>
          <span className="dash-clock">
            {clockTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
        </motion.div>
      </div>

      {/* ── Disclaimer ────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
        className="dash-disclaimer"
      >
        <Shield size={15} color="var(--color-warning)" style={{ flexShrink: 0 }} />
        <span>Decision Support System — All insights are investigator leads requiring human verification. No AI output constitutes legal evidence.</span>
      </motion.div>

      {/* ── Stat Grid ─────────────────────────────────────────── */}
      <div className="stats-grid">
        <StatCard index={0} label="Active Cases"     value={cases.length}                           icon={FolderOpen}    color="#0A84FF" accentClass="accent"  to="/cases"     trend="+1 today" />
        <StatCard index={1} label="Entities Tracked" value={nodes.length}                           icon={Users}         color="#30D158" accentClass="success" to="/entities"  trend="+5 new"   />
        <StatCard index={2} label="Flagged Leads"    value={flagged.length}                         icon={AlertTriangle} color="#FF453A" accentClass="danger"  to="/analytics" />
        <StatCard index={3} label="CDR Records"      value={rawData?.cdrRecords?.length    || 0}    icon={Phone}         color="#BF5AF2" accentClass=""        to="/evidence"  />
        <StatCard index={4} label="Financial Txns"   value={rawData?.financialTxns?.length || 0}    icon={Database}      color="#FF9F0A" accentClass="warning" to="/evidence"  />
        <StatCard index={5} label="Network Edges"    value={edges.length}                           icon={Network}       color="#64D2FF" accentClass=""        to="/graph"     />
      </div>

      {/* ── Quick Actions ─────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32 }}
        className="quick-actions-row"
      >
        {QUICK_ACTIONS.map(qa => {
          const Ic = qa.icon;
          return (
            <Link key={qa.to} to={qa.to} style={{ textDecoration: 'none', flex: 1, minWidth: 0 }}>
              <motion.div
                className="quick-action-btn"
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.96 }}
                style={{ '--qa-color': qa.color }}
              >
                <div className="qa-icon-wrap" style={{ background: `${qa.color}18`, border: `1px solid ${qa.color}30` }}>
                  <Ic size={18} color={qa.color} strokeWidth={2} />
                </div>
                <span className="qa-label">{qa.label}</span>
                <ChevronRight size={13} color="var(--color-text-quaternary)" style={{ marginLeft: 'auto', flexShrink: 0 }} />
              </motion.div>
            </Link>
          );
        })}
      </motion.div>

      {/* ── 2-col main grid ───────────────────────────────────── */}
      <div className="dash-main-grid">

        {/* LEFT COL */}
        <div className="dash-col">

          {/* Primary Target Banner */}
          {topNode && (
            <motion.div
              initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.38 }}
              className="glass-card target-banner"
            >
              <div className="target-glow" />
              <div className="target-inner">
                <div className="target-avatar">
                  <Zap size={26} color="#FF453A" strokeWidth={2.5} />
                </div>
                <div style={{ flex: 1, zIndex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--color-text-quaternary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                      Primary Target Lead
                    </div>
                    <span className="badge badge-red" style={{ fontSize: '0.62rem' }}>CRITICAL</span>
                  </div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '-0.02em', marginBottom: 3 }}>
                    {topNode.label}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', fontWeight: 500, marginBottom: 12 }}>
                    {topNode.role} · Linked across {topNode.caseIds?.length || 0} case{(topNode.caseIds?.length || 0) !== 1 ? 's' : ''}
                  </div>
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', fontWeight: 600, color: 'var(--color-text-tertiary)', marginBottom: 5 }}>
                      <span>Network Influence</span>
                      <span style={{ color: '#0A84FF' }}>{((topNode.influenceScore || 0) * 100).toFixed(1)}%</span>
                    </div>
                    <div style={{ height: 5, background: 'var(--color-bg-tertiary)', borderRadius: 3, overflow: 'hidden' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(topNode.influenceScore || 0) * 100}%` }}
                        transition={{ delay: 0.9, duration: 1.2 }}
                        style={{ height: '100%', background: 'linear-gradient(90deg,#0A84FF,#BF5AF2)', borderRadius: 3 }}
                      />
                    </div>
                  </div>
                  <Link to="/graph" className="btn-pill btn-primary" style={{ textDecoration: 'none', display: 'inline-flex', fontSize: '0.82rem', padding: '8px 16px', boxShadow: '0 4px 14px rgba(10,132,255,0.4)' }}>
                    Analyze in Graph <ChevronRight size={14} />
                  </Link>
                </div>
              </div>
            </motion.div>
          )}

          {/* Active Investigations */}
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="glass-card dash-section">
            <div className="section-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 4, height: 20, borderRadius: 2, background: '#0A84FF' }} />
                <h2 className="section-title">Active Investigations</h2>
              </div>
              <Link to="/cases" className="section-link" style={{ color: '#0A84FF', background: 'rgba(10,132,255,0.1)' }}>
                View All <ArrowUpRight size={12} />
              </Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {cases.slice(0, 4).map((c, i) => (
                <Link key={c.case_id} to="/cases" style={{ textDecoration: 'none', color: 'inherit' }}>
                  <motion.div
                    className="card case-row tap-scale"
                    initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.52 + i * 0.06 }}
                  >
                    <div className="case-icon-wrap">
                      <FolderOpen size={16} color="var(--color-text-tertiary)" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                        <span style={{ fontSize: '0.68rem', color: 'var(--color-text-quaternary)', fontWeight: 700 }}>{c.case_id}</span>
                        <span className={`badge ${CASE_STATUS_BADGE[c.status] || 'badge-green'}`} style={{ fontSize: '0.6rem', padding: '1px 6px' }}>{c.status}</span>
                      </div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--color-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.title}</div>
                    </div>
                    <ChevronRight size={15} color="var(--color-text-quaternary)" style={{ flexShrink: 0 }} />
                  </motion.div>
                </Link>
              ))}
              {cases.length === 0 && <div style={{ textAlign: 'center', padding: '20px', color: 'var(--color-text-quaternary)', fontSize: '0.83rem' }}>No active cases</div>}
            </div>
          </motion.div>

          {/* Threat Timeline */}
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-card dash-section">
            <div className="section-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 4, height: 20, borderRadius: 2, background: '#FF453A' }} />
                <h2 className="section-title">Threat Timeline</h2>
              </div>
              <span className="section-link" style={{ color: '#FF453A', background: 'rgba(255,69,58,0.1)' }}>
                <Clock size={11} /> Today
              </span>
            </div>
            <div className="timeline-list">
              {THREAT_TIMELINE.map((evt, i) => {
                const EvtIcon = evt.icon;
                const sev = SEV[evt.severity];
                return (
                  <motion.div
                    key={i} className="timeline-item"
                    initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.58 + i * 0.07 }}
                  >
                    <div className="timeline-time">{evt.time}</div>
                    <div className="timeline-line">
                      <div className="timeline-dot" style={{ background: sev.color, boxShadow: `0 0 6px ${sev.color}88` }} />
                      {i < THREAT_TIMELINE.length - 1 && <div className="timeline-connector" />}
                    </div>
                    <div className="timeline-content" style={{ background: sev.bg, border: `1px solid ${sev.color}22` }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3 }}>
                        <EvtIcon size={11} color={sev.color} />
                        <span style={{ fontSize: '0.6rem', fontWeight: 800, color: sev.color, letterSpacing: '0.06em' }}>{sev.label}</span>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>{evt.event}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* RIGHT COL */}
        <div className="dash-col">

          {/* Entity Distribution */}
          <motion.div initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.38 }} className="glass-card dash-section">
            <div className="section-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 4, height: 20, borderRadius: 2, background: '#64D2FF' }} />
                <h2 className="section-title">Data Ontology</h2>
              </div>
              <Link to="/entities" className="section-link" style={{ color: '#64D2FF', background: 'rgba(100,210,255,0.1)' }}>
                <PieChart size={11} /> Entities
              </Link>
            </div>
            <div style={{ display: 'flex', height: 8, borderRadius: 5, overflow: 'hidden', marginBottom: 14 }}>
              {Object.entries(entityCounts).sort((a,b)=>b[1]-a[1]).map(([type, count], i) => (
                <motion.div
                  key={type}
                  initial={{ width: 0 }}
                  animate={{ width: `${(count / totalEntities) * 100}%` }}
                  transition={{ delay: 0.65 + i * 0.08, duration: 0.8, ease: 'easeOut' }}
                  style={{ height: '100%', background: ENTITY_COLORS[type] || '#8E8E93' }}
                  title={`${type}: ${count}`}
                />
              ))}
            </div>
            <div className="entity-dist-list">
              {Object.entries(entityCounts).sort((a,b)=>b[1]-a[1]).map(([type, count]) => {
                const EntIc = ENTITY_ICONS[type] || Layers;
                return (
                  <div key={type} className="entity-dist-row">
                    <div style={{ width: 26, height: 26, borderRadius: 7, background: `${ENTITY_COLORS[type] || '#8E8E93'}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <EntIc size={13} color={ENTITY_COLORS[type] || '#8E8E93'} />
                    </div>
                    <span style={{ flex: 1, fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'capitalize' }}>{type}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 52, height: 3, background: 'var(--color-bg-tertiary)', borderRadius: 2, overflow: 'hidden' }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(count / totalEntities) * 100}%` }}
                          transition={{ delay: 0.75, duration: 0.8 }}
                          style={{ height: '100%', background: ENTITY_COLORS[type] || '#8E8E93', borderRadius: 2 }}
                        />
                      </div>
                      <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--color-text-primary)', minWidth: 18, textAlign: 'right' }}>{count}</span>
                    </div>
                  </div>
                );
              })}
              {Object.keys(entityCounts).length === 0 && <p style={{ color: 'var(--color-text-quaternary)', fontSize: '0.8rem', textAlign: 'center', padding: '12px 0' }}>No entity data</p>}
            </div>
          </motion.div>

          {/* Live Intelligence Feed */}
          <motion.div initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.44 }} className="glass-card dash-section">
            <div className="section-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 4, height: 20, borderRadius: 2, background: '#30D158' }} />
                <h2 className="section-title">Intelligence Feed</h2>
              </div>
              <span className="section-link" style={{ color: '#30D158', background: 'rgba(48,209,88,0.1)' }}>
                <span className="status-dot active" style={{ width: 5, height: 5 }} /> Live
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {INTEL_FEED.map((item, i) => (
                <IntelItem key={item.id} item={item} isActive={i === intelIndex} />
              ))}
            </div>
          </motion.div>

          {/* Top Influence Nodes */}
          <motion.div initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} className="glass-card dash-section">
            <div className="section-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 4, height: 20, borderRadius: 2, background: '#BF5AF2' }} />
                <h2 className="section-title">Top Influence Nodes</h2>
              </div>
              <Link to="/graph" className="section-link" style={{ color: '#BF5AF2', background: 'rgba(191,90,242,0.1)' }}>
                Graph <ExternalLink size={11} />
              </Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {topEntities.length > 0 ? topEntities.map((entity, i) => (
                <motion.div
                  key={entity.id}
                  className="top-entity-row"
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.62 + i * 0.06 }}
                >
                  <div className="top-entity-rank" style={{ background: i === 0 ? 'rgba(255,214,10,0.15)' : 'var(--color-bg-tertiary)', color: i === 0 ? '#FFD60A' : 'var(--color-text-quaternary)' }}>
                    #{i + 1}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {entity.label}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-text-quaternary)', fontWeight: 500 }}>
                      {entity.type} · {entity.caseIds?.length || 0} cases
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                    <div style={{ width: 44, height: 3, background: 'var(--color-bg-tertiary)', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${(entity.influenceScore || 0) * 100}%`, background: 'linear-gradient(90deg,#0A84FF,#BF5AF2)', borderRadius: 2 }} />
                    </div>
                    <span style={{ fontSize: '0.73rem', fontWeight: 800, color: '#0A84FF', minWidth: 34 }}>
                      {((entity.influenceScore || 0) * 100).toFixed(0)}%
                    </span>
                  </div>
                </motion.div>
              )) : (
                <div style={{ textAlign: 'center', padding: '18px 0', color: 'var(--color-text-quaternary)', fontSize: '0.8rem' }}>
                  No influence data yet
                </div>
              )}
            </div>
          </motion.div>

          {/* Intelligence Reports */}
          <motion.div initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.56 }} className="glass-card dash-section">
            <div className="section-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 4, height: 20, borderRadius: 2, background: '#BF5AF2' }} />
                <h2 className="section-title">Intelligence Reports</h2>
              </div>
              <Link to="/evidence" className="section-link" style={{ color: '#BF5AF2', background: 'rgba(191,90,242,0.1)' }}>
                Browse All <ArrowUpRight size={12} />
              </Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {firs.slice(0, 3).map((fir, i) => (
                <Link key={fir.fir_number} to="/evidence" style={{ textDecoration: 'none', color: 'inherit' }}>
                  <motion.div
                    className="card fir-row tap-scale"
                    initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.63 + i * 0.06 }}
                  >
                    <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(191,90,242,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <FileText size={15} color="#BF5AF2" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>{fir.fir_number}</span>
                        <span style={{ fontSize: '0.65rem', color: 'var(--color-text-quaternary)', fontWeight: 600 }}>{fir.date}</span>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.76rem', color: 'var(--color-text-secondary)', lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {fir.text?.slice(0, 90)}...
                      </p>
                    </div>
                  </motion.div>
                </Link>
              ))}
              {firs.length === 0 && <div style={{ textAlign: 'center', padding: '18px 0', color: 'var(--color-text-quaternary)', fontSize: '0.8rem' }}>No FIR reports yet</div>}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
