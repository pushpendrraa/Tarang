import { useEffect, useRef, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import cytoscape from 'cytoscape';
import {
  Network, Search, X, AlertTriangle, Shield, ZoomIn, ZoomOut,
  Maximize, Users, Phone, Car, Landmark, MapPin, Building, Info,
  Link2, FileText, Activity, ChevronRight, Eye, Calendar, Hash,
  CreditCard, TrendingUp, Clock, ArrowRight, ArrowLeft, Fingerprint,
  AlertCircle, CheckCircle, RadioTower
} from 'lucide-react';
import { useData } from '../context/DataContext';

const TYPE_CONFIG = {
  person:       { color: '#0A84FF', icon: Users    },
  phone:        { color: '#30D158', icon: Phone    },
  vehicle:      { color: '#FF9F0A', icon: Car      },
  account:      { color: '#FF453A', icon: Landmark },
  location:     { color: '#BF5AF2', icon: MapPin   },
  organization: { color: '#64D2FF', icon: Building },
};
const COMMUNITY_COLORS = ['#0A84FF', '#FF9F0A', '#30D158', '#BF5AF2', '#FF453A', '#64D2FF', '#FFD60A'];

const RISK_CONFIG = {
  CRITICAL: { color: '#FF453A', bg: 'rgba(255,69,58,0.12)', label: 'Critical Risk' },
  HIGH:     { color: '#FF9F0A', bg: 'rgba(255,159,10,0.12)', label: 'High Risk' },
  MEDIUM:   { color: '#FFD60A', bg: 'rgba(255,214,10,0.12)', label: 'Medium Risk' },
  LOW:      { color: '#30D158', bg: 'rgba(48,209,88,0.12)', label: 'Low Risk' },
};

// ──────────────────────────────────────────────────────────────────────
// Tab pill component
// ──────────────────────────────────────────────────────────────────────
function TabPill({ label, active, onClick, count }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1, padding: '7px 4px', border: 'none', cursor: 'pointer',
        borderRadius: 'var(--radius-md)',
        background: active ? 'var(--color-accent)' : 'transparent',
        color: active ? '#fff' : 'var(--color-text-tertiary)',
        fontWeight: active ? 700 : 500, fontSize: '0.75rem',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
        transition: 'all 0.2s ease',
      }}
    >
      {label}
      {count != null && (
        <span style={{
          background: active ? 'rgba(255,255,255,0.25)' : 'var(--color-bg-tertiary)',
          color: active ? '#fff' : 'var(--color-text-quaternary)',
          fontSize: '0.65rem', fontWeight: 700, borderRadius: 99,
          padding: '1px 5px', minWidth: 16, textAlign: 'center',
        }}>{count}</span>
      )}
    </button>
  );
}

// ──────────────────────────────────────────────────────────────────────
// Info row
// ──────────────────────────────────────────────────────────────────────
function InfoRow({ icon: Icon, label, value, highlight }) {
  if (!value) return null;
  return (
    <div style={{
      background: highlight ? 'rgba(255,69,58,0.06)' : 'var(--color-bg-tertiary)',
      border: highlight ? '1px solid rgba(255,69,58,0.18)' : '1px solid transparent',
      borderRadius: 'var(--radius-md)', padding: '8px 12px',
      display: 'flex', alignItems: 'flex-start', gap: 9, fontSize: '0.78rem',
    }}>
      {Icon && <Icon size={13} color={highlight ? 'var(--color-danger)' : 'var(--color-text-quaternary)'} style={{ flexShrink: 0, marginTop: 1 }} />}
      <div style={{ flex: 1 }}>
        <div style={{ color: 'var(--color-text-quaternary)', fontWeight: 600, fontSize: '0.7rem', marginBottom: 2 }}>{label}</div>
        <div style={{ color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>{value}</div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────
// Connection card
// ──────────────────────────────────────────────────────────────────────
function ConnectionCard({ edge, node, allNodes, onNodeClick }) {
  const otherId = edge.source === node.id ? edge.target : edge.source;
  const direction = edge.source === node.id ? 'out' : 'in';
  const other = allNodes.find(n => n.id === otherId);
  if (!other) return null;
  const cfg = TYPE_CONFIG[other.type] || TYPE_CONFIG.person;
  const Icon = cfg.icon;

  const edgeTypeLabel = {
    'called': 'Called',
    'owns': 'Owns / Owned by',
    'holds': 'Holds / Held by',
    'transacted': 'Transacted',
    'located_at': 'Located at',
    'coordinates_with': 'Coordinates with',
    'linked_to': 'Linked to',
    'works_for': 'Works for',
    'hawala_link': 'Hawala link',
    'supply_chain': 'Supply chain',
    'runs': 'Runs',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-md)',
        padding: '9px 12px', display: 'flex', alignItems: 'center', gap: 10,
        cursor: 'pointer', border: '1px solid transparent',
        transition: 'border-color 0.15s',
      }}
      onClick={() => onNodeClick(other)}
      onMouseEnter={e => e.currentTarget.style.borderColor = cfg.color + '50'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}
    >
      <div style={{
        width: 30, height: 30, borderRadius: 'var(--radius-sm)',
        background: `${cfg.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <Icon size={14} color={cfg.color} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: '0.78rem', color: 'var(--color-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {other.label}
        </div>
        <div style={{ fontSize: '0.68rem', color: 'var(--color-text-quaternary)', marginTop: 1 }}>
          <span style={{ color: edge.type === 'called' ? '#30D158' : edge.type === 'transacted' ? '#FF453A' : 'var(--color-text-quaternary)', fontWeight: 600 }}>
            {edgeTypeLabel[edge.type] || edge.type}
          </span>
          {edge.weight > 1 && <span style={{ marginLeft: 4 }}>×{edge.weight}</span>}
          {' · '}{other.type}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
        {direction === 'out'
          ? <ArrowRight size={12} color="var(--color-text-quaternary)" />
          : <ArrowLeft size={12} color="var(--color-text-quaternary)" />}
        {other.flagged && <AlertTriangle size={11} color="var(--color-danger)" />}
      </div>
    </motion.div>
  );
}

// ──────────────────────────────────────────────────────────────────────
// CDR row
// ──────────────────────────────────────────────────────────────────────
function CdrRow({ record, myNumbers }) {
  const isOut = myNumbers.has(record.caller_number);
  return (
    <div style={{
      background: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-sm)',
      padding: '7px 10px', display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.72rem',
    }}>
      {isOut
        ? <ArrowRight size={11} color="#30D158" />
        : <ArrowLeft size={11} color="#0A84FF" />}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ color: 'var(--color-text-secondary)', fontWeight: 600 }}>
          {isOut ? record.callee_number : record.caller_number}
        </div>
        <div style={{ color: 'var(--color-text-quaternary)', marginTop: 1 }}>
          {record.timestamp?.slice(0, 16)} · {record.duration_sec}s · {record.call_type}
        </div>
      </div>
      <div style={{ color: 'var(--color-text-quaternary)', fontSize: '0.65rem', textAlign: 'right', flexShrink: 0 }}>
        {record.tower_location?.split(',')[0]}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────
// ENTITY DRAWER
// ──────────────────────────────────────────────────────────────────────
function EntityDrawer({ node, onClose, allNodes, allEdges, onNodeClick }) {
  const [activeTab, setActiveTab] = useState('overview');
  if (!node) return null;
  const cfg = TYPE_CONFIG[node.type] || TYPE_CONFIG.person;
  const Icon = cfg.icon;

  // Find all connected edges for this node
  const connectedEdges = allEdges.filter(e => e.source === node.id || e.target === node.id);
  const risk = RISK_CONFIG[node.risk_level] || RISK_CONFIG.LOW;

  // CDR set for person
  const myNumbers = new Set(node.phones || []);

  // Filter CDR activity
  const cdrLines = (node.cdrActivity || []);

  return (
    <motion.div
      className="drawer"
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', stiffness: 280, damping: 28 }}
      style={{ display: 'flex', flexDirection: 'column', maxHeight: '100%' }}
    >
      {/* ── Sticky Header ── */}
      <div style={{ padding: '18px 18px 0', position: 'sticky', top: 0, background: 'var(--color-bg-secondary)', zIndex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 46, height: 46, borderRadius: 'var(--radius-md)',
              background: `${cfg.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: `1.5px solid ${cfg.color}30`,
            }}>
              <Icon size={22} color={cfg.color} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.01em', color: 'var(--color-text-primary)' }}>{node.label}</div>
              <div style={{ display: 'flex', gap: 5, marginTop: 4, flexWrap: 'wrap', alignItems: 'center' }}>
                <span className="badge" style={{ background: `${cfg.color}18`, color: cfg.color }}>{node.type}</span>
                {node.risk_level && (
                  <span className="badge" style={{ background: risk.bg, color: risk.color, fontSize: '0.62rem' }}>
                    {node.risk_level}
                  </span>
                )}
                {node.flagged && (
                  <span className="badge" style={{ background: 'rgba(255,69,58,0.12)', color: 'var(--color-danger)', fontSize: '0.62rem' }}>
                    <AlertTriangle size={9} style={{ display: 'inline' }} /> FLAGGED
                  </span>
                )}
              </div>
            </div>
          </div>
          <button className="btn-pill btn-ghost" style={{ padding: '6px 8px' }} onClick={onClose}><X size={16} /></button>
        </div>

        {/* Flagged alert */}
        {node.flagged && (
          <div style={{ background: 'rgba(255,69,58,0.08)', border: '1px solid rgba(255,69,58,0.22)', borderRadius: 'var(--radius-md)', padding: '9px 12px', marginBottom: 10 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <AlertTriangle size={13} color="var(--color-danger)" style={{ flexShrink: 0, marginTop: 1 }} />
              <div>
                <div style={{ fontWeight: 700, color: 'var(--color-danger)', fontSize: '0.78rem', marginBottom: 2 }}>Flagged Suspicious Lead</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--color-text-tertiary)', lineHeight: 1.5 }}>⚠️ Investigator lead — requires human verification.</div>
              </div>
            </div>
          </div>
        )}

        {/* Burner note */}
        {node.id === 'PH002' && (
          <div style={{ background: 'rgba(255,69,58,0.08)', border: '1px solid rgba(255,69,58,0.2)', borderRadius: 'var(--radius-md)', padding: '9px 12px', marginBottom: 10 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <Info size={13} color="var(--color-danger)" />
              <div style={{ fontSize: '0.72rem', color: 'var(--color-danger)', fontWeight: 600, lineHeight: 1.5 }}>
                This burner phone connects Mumbai drug case (CASE-001), Delhi extortion (CASE-002), and Punjab interception (CASE-003). Key evidence: SN-002, SN-003, multiple CDR records.
              </div>
            </div>
          </div>
        )}

        {/* P001 special note */}
        {node.id === 'P001' && (
          <div style={{ background: 'rgba(10,132,255,0.08)', border: '1px solid rgba(10,132,255,0.2)', borderRadius: 'var(--radius-md)', padding: '9px 12px', marginBottom: 10 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <Info size={13} color="var(--color-accent)" />
              <div style={{ fontSize: '0.72rem', color: 'var(--color-accent)', fontWeight: 600, lineHeight: 1.5 }}>
                Suspected central coordinator. Never named explicitly in any single FIR — referred to as "Sir", "RV", or via burner 7710099887. Cross-referencing all 4 cases surfaces him as the top-centrality hub.
              </div>
            </div>
          </div>
        )}

        {/* Influence score bar */}
        <div style={{ marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <TrendingUp size={11} color="var(--color-text-quaternary)" />
              <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--color-text-quaternary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Network Influence</span>
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: cfg.color }}>{((node.influenceScore || 0) * 100).toFixed(1)}%</span>
          </div>
          <div style={{ height: 5, background: 'var(--color-bg-tertiary)', borderRadius: 99 }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(node.influenceScore || 0) * 100}%` }}
              transition={{ delay: 0.15, duration: 0.55 }}
              style={{ height: '100%', background: `linear-gradient(90deg, ${cfg.color}, ${cfg.color}cc)`, borderRadius: 99 }}
            />
          </div>
        </div>

        {/* Tab bar */}
        <div style={{ display: 'flex', gap: 3, background: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-md)', padding: 3, marginBottom: 0 }}>
          <TabPill label="Overview" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
          <TabPill label="Connections" active={activeTab === 'connections'} onClick={() => setActiveTab('connections')} count={connectedEdges.length} />
          <TabPill label="Evidence" active={activeTab === 'evidence'} onClick={() => setActiveTab('evidence')} count={cdrLines.length || undefined} />
        </div>

        <div className="divider" style={{ margin: '10px 0 0' }} />
      </div>

      {/* ── Scrollable Content ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 18px 20px' }}>
        <AnimatePresence mode="wait">

          {/* ────── OVERVIEW TAB ────── */}
          {activeTab === 'overview' && (
            <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>

              {/* Person-specific fields */}
              {node.type === 'person' && (
                <>
                  <InfoRow icon={Fingerprint} label="Role" value={node.role} />
                  <InfoRow icon={MapPin} label="Address" value={node.address} />
                  <InfoRow icon={Calendar} label="Date of Birth" value={node.dob} />
                  <InfoRow icon={Users} label="Nationality / Occupation" value={node.nationality ? `${node.nationality} · ${node.occupation}` : null} />
                  {node.phones?.length > 0 && (
                    <div style={{ background: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-md)', padding: '8px 12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                        <Phone size={11} color="var(--color-text-quaternary)" />
                        <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--color-text-quaternary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Phone Numbers</span>
                      </div>
                      {node.phones.map(ph => (
                        <div key={ph} style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', fontFamily: 'monospace', padding: '2px 0' }}>{ph}</div>
                      ))}
                    </div>
                  )}
                  {node.callCount > 0 && (
                    <div style={{ background: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-md)', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <RadioTower size={13} color="#30D158" />
                      <div>
                        <span style={{ fontSize: '0.7rem', color: 'var(--color-text-quaternary)', fontWeight: 600 }}>CDR Activity: </span>
                        <span style={{ fontSize: '0.78rem', color: '#30D158', fontWeight: 700 }}>{node.callCount} records</span>
                      </div>
                    </div>
                  )}
                  {node.criminal_history?.length > 0 && (
                    <div style={{ background: 'rgba(255,69,58,0.06)', border: '1px solid rgba(255,69,58,0.15)', borderRadius: 'var(--radius-md)', padding: '8px 12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                        <AlertCircle size={11} color="var(--color-danger)" />
                        <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--color-danger)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Criminal History</span>
                      </div>
                      {node.criminal_history.map((h, i) => (
                        <div key={i} style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', padding: '2px 0', lineHeight: 1.4 }}>• {h}</div>
                      ))}
                    </div>
                  )}
                  {node.aliases?.length > 0 && (
                    <div style={{ background: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-md)', padding: '8px 12px' }}>
                      <div style={{ fontSize: '0.68rem', color: 'var(--color-text-quaternary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Aliases</div>
                      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                        {node.aliases.map(a => <span key={a} className="tag-chip">{a}</span>)}
                      </div>
                    </div>
                  )}
                  {node.caseIds?.length > 0 && (
                    <div style={{ background: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-md)', padding: '8px 12px' }}>
                      <div style={{ fontSize: '0.68rem', color: 'var(--color-text-quaternary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Linked Cases</div>
                      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                        {node.caseIds.map(id => <span key={id} className="badge badge-blue" style={{ fontSize: '0.65rem' }}>{id}</span>)}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Phone-specific */}
              {node.type === 'phone' && (
                <>
                  <InfoRow icon={Phone} label="Number" value={node.label} />
                  <InfoRow icon={Hash} label="Type" value={node.subtype} highlight={node.flagged} />
                  <InfoRow icon={Users} label="Owner" value={node.owner} />
                  <InfoRow icon={Activity} label="Call Activity" value={node.callCount ? `${node.callCount} records in dataset` : null} />
                </>
              )}

              {/* Vehicle-specific */}
              {node.type === 'vehicle' && (
                <>
                  <InfoRow icon={Car} label="Plate" value={node.label} />
                  <InfoRow icon={Hash} label="Vehicle Type" value={node.vehicleType} />
                  <InfoRow icon={Users} label="Registered Owner" value={node.owner} />
                  <InfoRow icon={Info} label="Investigation Note" value={node.note} highlight />
                </>
              )}

              {/* Account-specific */}
              {node.type === 'account' && (
                <>
                  <InfoRow icon={CreditCard} label="Account No." value={node.label} />
                  <InfoRow icon={Landmark} label="Bank" value={node.bank} />
                  <InfoRow icon={Hash} label="IFSC" value={node.ifsc} />
                  <InfoRow icon={Users} label="Account Holder" value={node.holder} />
                  {node.transactionVolume > 0 && (
                    <div style={{ background: 'rgba(255,69,58,0.06)', border: '1px solid rgba(255,69,58,0.15)', borderRadius: 'var(--radius-md)', padding: '8px 12px' }}>
                      <div style={{ fontSize: '0.68rem', color: 'var(--color-danger)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>Transaction Volume</div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>₹{node.transactionVolume.toLocaleString('en-IN')}</div>
                      {node.recentTxns?.length > 0 && (
                        <div style={{ marginTop: 8, fontSize: '0.7rem', color: 'var(--color-text-quaternary)' }}>{node.recentTxns.length} transactions in dataset</div>
                      )}
                    </div>
                  )}
                  {node.note && <InfoRow icon={Info} label="Note" value={node.note} highlight />}
                </>
              )}

              {/* Location */}
              {node.type === 'location' && (
                <>
                  <InfoRow icon={MapPin} label="Location" value={node.label} />
                  <InfoRow icon={Hash} label="Coordinates" value={node.lat ? `${node.lat.toFixed(4)}, ${node.lng.toFixed(4)}` : null} />
                </>
              )}

              {/* Organization */}
              {node.type === 'organization' && (
                <>
                  <InfoRow icon={Building} label="Name" value={node.label} />
                  <InfoRow icon={Hash} label="Type" value={node.orgType} highlight />
                  <InfoRow icon={MapPin} label="Address" value={node.address} />
                  <InfoRow icon={Info} label="Investigation Note" value={node.note} highlight />
                </>
              )}

              <div style={{ background: 'rgba(255,159,10,0.06)', border: '1px solid rgba(255,159,10,0.15)', borderRadius: 'var(--radius-md)', padding: '8px 11px', fontSize: '0.7rem', color: 'var(--color-warning)', display: 'flex', alignItems: 'center', gap: 5, marginTop: 4 }}>
                <Shield size={10} /> All scores are algorithmic estimates. Verify against source documents.
              </div>
            </motion.div>
          )}

          {/* ────── CONNECTIONS TAB ────── */}
          {activeTab === 'connections' && (
            <motion.div key="connections" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>

              {connectedEdges.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--color-text-quaternary)', fontSize: '0.8rem' }}>
                  No connections found
                </div>
              ) : (
                <>
                  {/* Group by edge type */}
                  {['called', 'transacted', 'coordinates_with', 'owns', 'holds', 'linked_to', 'works_for', 'runs', 'located_at', 'hawala_link', 'supply_chain'].map(edgeType => {
                    const typeEdges = connectedEdges.filter(e => e.type === edgeType);
                    if (typeEdges.length === 0) return null;
                    const labels = {
                      called: '📞 Call Links',
                      transacted: '💰 Financial Links',
                      coordinates_with: '🔗 Coordination Links',
                      owns: '🔑 Ownership',
                      holds: '🏦 Account Holdings',
                      linked_to: '🔗 Linked',
                      works_for: '👤 Employment',
                      runs: '🏢 Runs',
                      located_at: '📍 Location',
                      hawala_link: '💴 Hawala Network',
                      supply_chain: '📦 Supply Chain',
                    };
                    return (
                      <div key={edgeType}>
                        <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--color-text-quaternary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5, marginTop: 6 }}>
                          {labels[edgeType] || edgeType} ({typeEdges.length})
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          {typeEdges.map(edge => (
                            <ConnectionCard key={edge.id} edge={edge} node={node} allNodes={allNodes} onNodeClick={onNodeClick} />
                          ))}
                        </div>
                      </div>
                    );
                  })}

                  {/* Evidence hints */}
                  <div style={{ marginTop: 8, background: 'rgba(10,132,255,0.06)', border: '1px solid rgba(10,132,255,0.15)', borderRadius: 'var(--radius-md)', padding: '9px 12px' }}>
                    <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--color-accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>Source Evidence</div>
                    {[...new Set(connectedEdges.map(e => e.evidenceHint).filter(Boolean))].map((hint, i) => (
                      <div key={i} style={{ fontSize: '0.7rem', color: 'var(--color-text-tertiary)', padding: '2px 0', lineHeight: 1.5 }}>
                        <span style={{ color: 'var(--color-accent)', marginRight: 4 }}>▸</span>{hint}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </motion.div>
          )}

          {/* ────── EVIDENCE TAB ────── */}
          {activeTab === 'evidence' && (
            <motion.div key="evidence" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>

              {/* CDR Activity for persons */}
              {node.type === 'person' && cdrLines.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--color-text-quaternary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                    📞 CDR Activity ({cdrLines.length} records shown)
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {cdrLines.map((r, i) => <CdrRow key={i} record={r} myNumbers={myNumbers} />)}
                  </div>
                </div>
              )}

              {/* Account transactions */}
              {node.type === 'account' && node.recentTxns?.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--color-text-quaternary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                    💰 Recent Transactions ({node.recentTxns.length} records)
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {node.recentTxns.map((t, i) => {
                      const bankKey = `${node.bank?.split(' ')[0].toUpperCase()}-${node.label}`;
                      const isOut = t.from_account === bankKey;
                      return (
                        <div key={i} style={{ background: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-sm)', padding: '7px 10px', fontSize: '0.72rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                              {isOut ? <ArrowRight size={10} color="#FF453A" /> : <ArrowLeft size={10} color="#30D158" />}
                              <span style={{ fontWeight: 700, color: isOut ? 'var(--color-danger)' : '#30D158' }}>
                                {isOut ? '-' : '+'}₹{parseFloat(t.amount_inr).toLocaleString('en-IN')}
                              </span>
                            </div>
                            <span style={{ color: 'var(--color-text-quaternary)', fontSize: '0.65rem' }}>{t.timestamp?.slice(0, 10)}</span>
                          </div>
                          <div style={{ color: 'var(--color-text-quaternary)', lineHeight: 1.4 }}>
                            {isOut ? t.to_account : t.from_account} · {t.mode}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Edge evidence summary */}
              <div>
                <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--color-text-quaternary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                  📁 Source File Evidence
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {[...new Set(connectedEdges.map(e => e.evidenceHint).filter(Boolean))].map((hint, i) => (
                    <div key={i} style={{ background: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-sm)', padding: '7px 10px', fontSize: '0.72rem', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
                      <span style={{ color: 'var(--color-accent)', marginRight: 5 }}>▸</span>{hint}
                    </div>
                  ))}
                  {connectedEdges.length === 0 && (
                    <div style={{ color: 'var(--color-text-quaternary)', fontSize: '0.78rem', textAlign: 'center', padding: '20px 0' }}>No evidence records</div>
                  )}
                </div>
              </div>

              <div style={{ background: 'rgba(255,159,10,0.06)', border: '1px solid rgba(255,159,10,0.15)', borderRadius: 'var(--radius-md)', padding: '8px 11px', fontSize: '0.7rem', color: 'var(--color-warning)', display: 'flex', alignItems: 'center', gap: 5, marginTop: 4 }}>
                <Shield size={10} /> All scores are algorithmic estimates. Verify against source documents.
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ──────────────────────────────────────────────────────────────────────
// MAIN GRAPH EXPLORER
// ──────────────────────────────────────────────────────────────────────
export default function GraphExplorer() {
  const { nodes, edges, rawData, loading } = useData();
  const cyRef  = useRef(null);
  const cyInst = useRef(null);

  const [caseFilter, setCaseFilter]   = useState('');
  const [typeFilter, setTypeFilter]   = useState('');
  const [search, setSearch]           = useState('');
  const [colorBy, setColorBy]         = useState('type');
  const [selectedNode, setSelectedNode] = useState(null);
  const [flaggedOnly, setFlaggedOnly] = useState(false);

  const cases = rawData?.cases || [];

  // Filter nodes
  const visibleNodes = nodes.filter(n => {
    if (selectedNode) {
      if (n.id === selectedNode.id) return true;
      const isConnected = edges.some(e => (e.source === selectedNode.id && e.target === n.id) || (e.target === selectedNode.id && e.source === n.id));
      if (!isConnected) return false;
      return true;
    }
    if (typeFilter && n.type !== typeFilter) return false;
    if (flaggedOnly && !n.flagged) return false;
    if (caseFilter && n.type === 'person' && !n.caseIds?.includes(caseFilter)) return false;
    if (search && !n.label.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });
  const visibleIds = new Set(visibleNodes.map(n => n.id));
  const visibleEdges = edges.filter(e => visibleIds.has(e.source) && visibleIds.has(e.target));

  // All edges for the selected node (not just visible)
  const selectedNodeEdges = useMemo(() => {
    if (!selectedNode) return [];
    return edges.filter(e => e.source === selectedNode.id || e.target === selectedNode.id);
  }, [selectedNode, edges]);

  useEffect(() => {
    if (!cyRef.current || loading || visibleNodes.length === 0) return;
    if (cyInst.current) { cyInst.current.destroy(); }

    const maxInfluence = Math.max(...visibleNodes.map(n => n.influenceScore || 0), 0.01);

    const cyNodes = visibleNodes.map(n => {
      const size = 20 + (n.influenceScore / maxInfluence) * 28;
      const color = colorBy === 'community'
        ? (COMMUNITY_COLORS[n.communityId >= 0 ? n.communityId : 6] || '#8E8E93')
        : (TYPE_CONFIG[n.type]?.color || '#8E8E93');
      const displayLabel = n.label?.length > 14 ? n.label.slice(0, 13) + '\u2026' : (n.label || n.id);
      return {
        data: { ...n, id: n.id, displayLabel, size, nodeColor: color },
      };
    });


    const cyEdges = visibleEdges.map(e => ({
      data: { id: e.id, source: e.source, target: e.target, label: e.type, weight: e.weight },
      style: {
        width: Math.max(1, e.weight * 0.6),
        'line-color': e.type === 'called' ? 'rgba(48,209,88,0.35)'
          : e.type === 'transacted' ? 'rgba(255,69,58,0.35)'
          : 'rgba(142,142,147,0.3)',
        'target-arrow-color': 'rgba(142,142,147,0.3)',
        'target-arrow-shape': ['coordinates_with','called'].includes(e.type) ? 'triangle' : 'none',
        'curve-style': 'bezier',
        label: e.type,
        'font-size': 7,
        'color': 'rgba(142,142,147,0.8)',
        'text-rotation': 'autorotate',
      },
    }));

    const cy = cytoscape({
      container: cyRef.current,
      elements: { nodes: cyNodes, edges: cyEdges },
      style: [
        {
          selector: 'node',
          style: {
            'background-color': 'data(nodeColor)',
            width: 'data(size)', height: 'data(size)',
            content: 'data(displayLabel)',
            'font-size': 9, color: '#fff',
            'text-valign': 'bottom', 'text-margin-y': 4,
            'font-weight': 600,
            'text-background-color': 'rgba(0,0,0,0.55)',
            'text-background-opacity': 0.7,
            'text-background-padding': '2px',
            'text-background-shape': 'roundrectangle',
            'border-style': 'solid',
          },
        },
        {
          selector: 'node[?flagged]',
          style: { 'border-width': 3, 'border-color': '#FF453A' },
        },
        {
          selector: 'node[!flagged]',
          style: { 'border-width': 0 },
        },
        { selector: 'node:selected', style: { 'border-width': 3, 'border-color': '#0A84FF', 'overlay-opacity': 0 } },
        { selector: 'edge:selected', style: { 'line-color': '#0A84FF', width: 2 } },
        { selector: '.dimmed', style: { opacity: 0.12 } },
        { selector: '.highlighted', style: { opacity: 1 } },
      ],
      layout: {
        name: 'cose',
        animate: true, animationDuration: 600,
        randomize: true, nodeRepulsion: 12000,
        gravity: 0.04, edgeElasticity: 200, numIter: 800,
      },
      wheelSensitivity: 0.3,
    });

    cy.on('tap', 'node', evt => {
      const data = evt.target.data();
      setSelectedNode(data);

      // Highlight connected nodes
      const connectedIds = new Set([data.id]);
      cy.edges().forEach(edge => {
        if (edge.data('source') === data.id || edge.data('target') === data.id) {
          connectedIds.add(edge.data('source'));
          connectedIds.add(edge.data('target'));
        }
      });

      cy.nodes().forEach(node => {
        if (connectedIds.has(node.id())) {
          node.removeClass('dimmed').addClass('highlighted');
        } else {
          node.removeClass('highlighted').addClass('dimmed');
        }
      });
      cy.edges().forEach(edge => {
        if (connectedIds.has(edge.data('source')) && connectedIds.has(edge.data('target'))) {
          edge.removeClass('dimmed').addClass('highlighted');
        } else {
          edge.removeClass('highlighted').addClass('dimmed');
        }
      });
    });

    cy.on('tap', evt => {
      if (evt.target === cy) {
        setSelectedNode(null);
        cy.nodes().removeClass('dimmed highlighted');
        cy.edges().removeClass('dimmed highlighted');
      }
    });

    cyInst.current = cy;
    return () => { if (cyInst.current) { cyInst.current.destroy(); cyInst.current = null; } };
  }, [visibleNodes, visibleEdges, colorBy, loading]);

  // When selectedNode changes from drawer navigation, focus graph
  const handleNodeClickFromDrawer = (targetNode) => {
    setSelectedNode(targetNode);
    const cy = cyInst.current;
    if (cy) {
      const cyNode = cy.getElementById(targetNode.id);
      if (cyNode.length) {
        cy.animate({ center: { eles: cyNode }, zoom: Math.max(cy.zoom(), 1.5) }, { duration: 400 });

        // Re-highlight
        const connectedIds = new Set([targetNode.id]);
        cy.edges().forEach(edge => {
          if (edge.data('source') === targetNode.id || edge.data('target') === targetNode.id) {
            connectedIds.add(edge.data('source'));
            connectedIds.add(edge.data('target'));
          }
        });
        cy.nodes().forEach(node => {
          if (connectedIds.has(node.id())) node.removeClass('dimmed').addClass('highlighted');
          else node.removeClass('highlighted').addClass('dimmed');
        });
        cy.edges().forEach(edge => {
          if (connectedIds.has(edge.data('source')) && connectedIds.has(edge.data('target'))) edge.removeClass('dimmed').addClass('highlighted');
          else edge.removeClass('highlighted').addClass('dimmed');
        });
      }
    }
  };

  const fit    = () => cyInst.current?.fit(undefined, 50);
  const zoomIn = () => { const cy = cyInst.current; if (cy) cy.zoom({ level: cy.zoom() * 1.3, renderedPosition: { x: cyRef.current.offsetWidth / 2, y: cyRef.current.offsetHeight / 2 } }); };
  const zoomOut = () => { const cy = cyInst.current; if (cy) cy.zoom({ level: cy.zoom() * 0.7, renderedPosition: { x: cyRef.current.offsetWidth / 2, y: cyRef.current.offsetHeight / 2 } }); };

  return (
    <div className="graph-container">
      {/* Header row */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', flexShrink: 0 }}>Graph Explorer</h1>

        {/* Case filter */}
        <select className="input-field" value={caseFilter} onChange={e => setCaseFilter(e.target.value)} style={{ maxWidth: 220 }}>
          <option value="">All Cases</option>
          {cases.map(c => <option key={c.case_id} value={c.case_id}>{c.case_id} — {c.title}</option>)}
        </select>

        {/* Type filter */}
        <select className="input-field" value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={{ maxWidth: 150 }}>
          <option value="">All Types</option>
          <option value="person">Person</option>
          <option value="phone">Phone</option>
          <option value="account">Account</option>
          <option value="vehicle">Vehicle</option>
          <option value="location">Location</option>
          <option value="organization">Organization</option>
        </select>

        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 160px', maxWidth: 220 }}>
          <Search size={13} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-quaternary)' }} />
          <input className="input-field" placeholder="Search entity…" value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 30 }} />
        </div>

        {/* Color by */}
        <div className="segmented-control">
          <button className={`segmented-option ${colorBy === 'type' ? 'active' : ''}`} onClick={() => setColorBy('type')}>Type</button>
          <button className={`segmented-option ${colorBy === 'community' ? 'active' : ''}`} onClick={() => setColorBy('community')}>City</button>
        </div>

        {/* Flagged toggle */}
        <label style={{ display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 600, color: flaggedOnly ? 'var(--color-danger)' : 'var(--color-text-tertiary)', flexShrink: 0 }}>
          <input type="checkbox" checked={flaggedOnly} onChange={e => setFlaggedOnly(e.target.checked)} />
          Flagged
        </label>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <span className="badge badge-blue">{visibleNodes.length} nodes</span>
          <span className="badge badge-green">{visibleEdges.length} edges</span>
          <span className="badge badge-red"><AlertTriangle size={10} /> {visibleNodes.filter(n => n.flagged).length} flagged</span>
        </div>
      </div>

      {/* Canvas */}
      <div style={{ flex: 1, position: 'relative', minHeight: 400 }}>
        {loading && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-xl)', zIndex: 5 }}>
            <div style={{ textAlign: 'center' }}>
              <Network size={32} color="var(--color-accent)" style={{ animation: 'pulse 1.5s infinite', margin: '0 auto 12px' }} />
              <span style={{ color: 'var(--color-text-tertiary)', fontSize: '0.875rem' }}>Building network from data files…</span>
            </div>
          </div>
        )}

        {selectedNode && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)',
              background: 'var(--color-bg-glass)', backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.15)', borderRadius: 99,
              padding: '5px 14px', fontSize: '0.72rem', color: 'var(--color-text-secondary)',
              display: 'flex', alignItems: 'center', gap: 6, zIndex: 4, whiteSpace: 'nowrap',
            }}
          >
            <Eye size={11} color="var(--color-accent)" />
            <span>Showing connections for <strong style={{ color: 'var(--color-text-primary)' }}>{selectedNode.label}</strong></span>
            <span style={{ opacity: 0.5 }}>· Click graph to deselect</span>
          </motion.div>
        )}

        <div ref={cyRef} style={{ width: '100%', height: '100%', borderRadius: 'var(--radius-xl)' }} />

        {/* Zoom controls */}
        <div style={{ position: 'absolute', bottom: 16, right: selectedNode ? 460 : 16, display: 'flex', flexDirection: 'column', gap: 6, transition: 'right 0.3s ease' }}>
          {[{ icon: ZoomIn, action: zoomIn }, { icon: ZoomOut, action: zoomOut }, { icon: Maximize, action: fit }].map(({ icon: Icon, action }, i) => (
            <button key={i} onClick={action} style={{ width: 36, height: 36, background: 'var(--color-bg-glass)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <Icon size={15} color="var(--color-text-secondary)" />
            </button>
          ))}
        </div>

        {/* Legend */}
        {colorBy === 'type' && (
          <div style={{ position: 'absolute', bottom: 16, left: 16, background: 'var(--color-bg-glass)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 'var(--radius-lg)', padding: '12px 14px' }}>
            {Object.entries(TYPE_CONFIG).map(([type, { color }]) => (
              <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 4 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
                {type}
              </div>
            ))}
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: '0.7rem', color: 'var(--color-danger)', fontWeight: 600, marginTop: 6, paddingTop: 6, borderTop: '1px solid var(--color-bg-tertiary)' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', border: '2px solid var(--color-danger)' }} />
              flagged
            </div>
          </div>
        )}
        {colorBy === 'community' && (
          <div style={{ position: 'absolute', bottom: 16, left: 16, background: 'var(--color-bg-glass)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 'var(--radius-lg)', padding: '12px 14px' }}>
            {['Mumbai', 'Delhi', 'Amritsar', 'Kolkata'].map((city, i) => (
              <div key={city} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 4 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: COMMUNITY_COLORS[i] }} />
                {city}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Entity drawer */}
      <AnimatePresence>
        {selectedNode && (
          <EntityDrawer
            node={selectedNode}
            onClose={() => {
              setSelectedNode(null);
              const cy = cyInst.current;
              if (cy) {
                cy.nodes().removeClass('dimmed highlighted');
                cy.edges().removeClass('dimmed highlighted');
              }
            }}
            allNodes={nodes}
            allEdges={edges}
            onNodeClick={handleNodeClickFromDrawer}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
