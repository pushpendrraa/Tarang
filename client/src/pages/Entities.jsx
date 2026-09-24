import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Phone, Car, Landmark, MapPin, Building, Search,
  AlertTriangle, X, ChevronRight, Hash, Shield, Info
} from 'lucide-react';
import { useData } from '../context/DataContext';

const TYPE_CONFIG = {
  person:       { icon: Users,    color: '#0A84FF', label: 'Person'       },
  phone:        { icon: Phone,    color: '#30D158', label: 'Phone'        },
  vehicle:      { icon: Car,      color: '#FF9F0A', label: 'Vehicle'      },
  account:      { icon: Landmark, color: '#FF453A', label: 'Bank Account' },
  location:     { icon: MapPin,   color: '#BF5AF2', label: 'Location'     },
  organization: { icon: Building, color: '#64D2FF', label: 'Organization' },
};

function EntityDetailDrawer({ node, onClose }) {
  if (!node) return null;
  const cfg = TYPE_CONFIG[node.type] || TYPE_CONFIG.person;
  const Icon = cfg.icon;

  return (
    <motion.div
      className="drawer"
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', stiffness: 280, damping: 28 }}
    >
      <div style={{ padding: '20px 20px 0', position: 'sticky', top: 0, background: 'var(--color-bg-secondary)', zIndex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: `${cfg.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon size={22} color={cfg.color} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.0625rem', letterSpacing: '-0.02em', color: 'var(--color-text-primary)' }}>{node.label}</div>
              <span className="badge" style={{ background: `${cfg.color}18`, color: cfg.color }}>{cfg.label}</span>
            </div>
          </div>
          <button className="btn-pill btn-ghost" style={{ padding: '6px 8px' }} onClick={onClose}><X size={16} /></button>
        </div>

        {node.flagged && (
          <div style={{ background: 'rgba(255,69,58,0.1)', border: '1px solid rgba(255,69,58,0.25)', borderRadius: 'var(--radius-md)', padding: '10px 14px', marginBottom: 14 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <AlertTriangle size={14} color="var(--color-danger)" style={{ flexShrink: 0, marginTop: 1 }} />
              <div>
                <div style={{ fontWeight: 700, color: 'var(--color-danger)', fontSize: '0.8125rem', marginBottom: 3 }}>Flagged as Suspicious Lead</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--color-text-tertiary)', lineHeight: 1.5 }}>This entity requires priority investigation. Verify against source documents before any action.</div>
              </div>
            </div>
          </div>
        )}
        <div className="divider" />
      </div>

      <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        {/* Influence score */}
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-quaternary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Network Influence Score</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 8 }}>
            <span style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.05em', color: 'var(--color-accent)' }}>{((node.influenceScore || 0) * 100).toFixed(1)}</span>
            <span style={{ fontSize: '0.875rem', color: 'var(--color-text-tertiary)' }}>/ 100</span>
          </div>
          <div style={{ height: 8, background: 'var(--color-bg-tertiary)', borderRadius: 99 }}>
            <motion.div initial={{ width: 0 }} animate={{ width: `${(node.influenceScore || 0) * 100}%` }} transition={{ delay: 0.2, duration: 0.7, ease: 'easeOut' }} style={{ height: '100%', background: 'linear-gradient(90deg, #0A84FF, #409CFF)', borderRadius: 99 }} />
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--color-text-quaternary)', marginTop: 4 }}>Based on network degree centrality from CDR + financial data</div>
        </div>

        {/* Properties */}
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-quaternary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Properties</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {node.role && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--color-text-quaternary)' }}>Role</span>
                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-primary)', maxWidth: '65%', textAlign: 'right' }}>{node.role}</span>
              </div>
            )}
            {node.address && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--color-text-quaternary)' }}>Address</span>
                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-primary)', maxWidth: '65%', textAlign: 'right' }}>{node.address}</span>
              </div>
            )}
            {node.phones?.length > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-md)', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--color-text-quaternary)', flexShrink: 0 }}>Phones</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'flex-end' }}>
                  {node.phones.map(ph => <span key={ph} style={{ fontSize: '0.78rem', fontWeight: 700, fontFamily: 'monospace', color: ph === '7710099887' ? 'var(--color-danger)' : 'var(--color-text-primary)' }}>{ph}{ph === '7710099887' ? ' ⚠️ BURNER' : ''}</span>)}
                </div>
              </div>
            )}
            {node.bank && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--color-text-quaternary)' }}>Bank</span>
                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>{node.bank}</span>
              </div>
            )}
            {node.callCount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--color-text-quaternary)' }}>CDR Activity</span>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-accent)' }}>{node.callCount || node.degreeScore} records</span>
              </div>
            )}
            {node.transactionVolume > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--color-text-quaternary)' }}>Txn Volume</span>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-danger)' }}>₹{node.transactionVolume.toLocaleString('en-IN')}</span>
              </div>
            )}
            {node.caseIds?.length > 0 && (
              <div style={{ padding: '8px 12px', background: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--color-text-quaternary)', marginBottom: 5 }}>Linked Cases</div>
                <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                  {node.caseIds.map(id => <span key={id} className="badge badge-blue" style={{ fontSize: '0.65rem' }}>{id}</span>)}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Aliases */}
        {node.aliases?.length > 0 && (
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-quaternary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Known Aliases</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {node.aliases.map(a => <span key={a} className="tag-chip">{a}</span>)}
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <div style={{ background: 'rgba(255,159,10,0.06)', border: '1px solid rgba(255,159,10,0.18)', borderRadius: 'var(--radius-md)', padding: '10px 12px' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--color-warning)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 5 }}>
            <Shield size={11} /> Investigator lead only. Verify all data against original source documents.
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function Entities() {
  const { nodes, loading } = useData();
  const [typeFilter, setTypeFilter] = useState('');
  const [search, setSearch]         = useState('');
  const [selected, setSelected]     = useState(null);
  const [flaggedOnly, setFlaggedOnly] = useState(false);

  const types = Object.keys(TYPE_CONFIG);

  const filtered = nodes.filter(n => {
    if (typeFilter && n.type !== typeFilter) return false;
    if (flaggedOnly && !n.flagged) return false;
    if (search) {
      const q = search.toLowerCase();
      return n.label.toLowerCase().includes(q) ||
        n.role?.toLowerCase().includes(q) ||
        n.aliases?.some(a => a.toLowerCase().includes(q)) ||
        n.address?.toLowerCase().includes(q);
    }
    return true;
  });

  const selectedNode = nodes.find(n => n.id === selected);

  return (
    <div className="page-container" style={{ maxWidth: 1200 }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Entities</h1>
          <p style={{ margin: '4px 0 0', color: 'var(--color-text-tertiary)', fontSize: '0.875rem' }}>
            {nodes.length} total entities · {nodes.filter(n => n.flagged).length} flagged leads
          </p>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 220px', maxWidth: 300 }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-quaternary)' }} />
          <input className="input-field" placeholder="Search name, role, alias…" value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 34 }} />
        </div>

        <div className="segmented-control">
          <button className={`segmented-option ${typeFilter === '' ? 'active' : ''}`} onClick={() => setTypeFilter('')}>All</button>
          {types.map(t => (
            <button key={t} className={`segmented-option ${typeFilter === t ? 'active' : ''}`} onClick={() => setTypeFilter(t)}>
              {TYPE_CONFIG[t].label}
            </button>
          ))}
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 600, color: flaggedOnly ? 'var(--color-danger)' : 'var(--color-text-tertiary)', flexShrink: 0 }}>
          <input type="checkbox" checked={flaggedOnly} onChange={e => setFlaggedOnly(e.target.checked)} />
          Flagged Only
        </label>

        <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-quaternary)', marginLeft: 'auto' }}>{filtered.length} results</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 400px' : '1fr', gap: 20, alignItems: 'start' }}>
        {/* Entity grid */}
        <motion.div
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}
          initial="hidden" animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.04 } } }}
        >
          {filtered.map(node => {
            const cfg = TYPE_CONFIG[node.type] || TYPE_CONFIG.person;
            const Icon = cfg.icon;
            const isSelected = selected === node.id;
            return (
              <motion.div
                key={node.id}
                className="card tap-scale"
                style={{
                  padding: '16px 18px', cursor: 'pointer',
                  border: isSelected ? `2px solid ${cfg.color}` : node.flagged ? '2px solid rgba(255,69,58,0.3)' : '2px solid transparent',
                }}
                variants={{ hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1 } }}
                onClick={() => setSelected(isSelected ? null : node.id)}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: `${cfg.color}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={17} color={cfg.color} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 5 }}>
                      {node.label}
                      {node.flagged && <AlertTriangle size={13} color="var(--color-danger)" />}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--color-text-quaternary)', marginTop: 1 }}>
                      {cfg.label}
                      {node.subtype && ` · ${node.subtype}`}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: cfg.color }}>{((node.influenceScore || 0) * 100).toFixed(0)}</div>
                    <div style={{ fontSize: '0.6rem', color: 'var(--color-text-quaternary)' }}>score</div>
                  </div>
                </div>

                {node.role && (
                  <div style={{ fontSize: '0.78rem', color: 'var(--color-text-tertiary)', lineHeight: 1.4, marginBottom: 8, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    {node.role}
                  </div>
                )}

                {/* Score bar */}
                <div style={{ height: 3, background: 'var(--color-bg-tertiary)', borderRadius: 99 }}>
                  <div style={{ height: '100%', width: `${(node.influenceScore || 0) * 100}%`, background: cfg.color, borderRadius: 99 }} />
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Entity detail drawer */}
        <AnimatePresence>
          {selectedNode && (
            <motion.div
              className="card"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              style={{ position: 'sticky', top: 24, overflow: 'hidden', padding: 0 }}
            >
              <EntityDetailDrawer node={selectedNode} onClose={() => setSelected(null)} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
