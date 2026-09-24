import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Database, FileText, ShieldAlert, Clock, ChevronDown, ChevronUp, Hash, MapPin, Search } from 'lucide-react';
import { useData } from '../context/DataContext';

export default function Evidence() {
  const { rawData, loading } = useData();
  const [activeTab, setActiveTab]   = useState('fir');
  const [search, setSearch]         = useState('');
  const [expandedRow, setExpandedRow] = useState(null);

  const firs       = rawData?.firs             || [];
  const surveillance = rawData?.surveillance   || [];
  const cdrs       = rawData?.cdrRecords       || [];
  const txns       = rawData?.financialTxns    || [];

  const tabs = [
    { id: 'fir',        label: 'FIR Reports',    icon: FileText,    count: firs.length,        badge: 'badge-blue'   },
    { id: 'surv',       label: 'Surveillance',    icon: ShieldAlert, count: surveillance.length, badge: 'badge-orange' },
    { id: 'cdr',        label: 'CDR Records',     icon: Phone,       count: cdrs.length,        badge: 'badge-green'  },
    { id: 'financial',  label: 'Transactions',    icon: Database,    count: txns.length,        badge: 'badge-red'    },
  ];

  const filteredCDR = cdrs.filter(r =>
    !search || r.caller_number.includes(search) || r.callee_number.includes(search) || r.tower_location?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredTxn = txns.filter(t =>
    !search || t.from_account?.toLowerCase().includes(search.toLowerCase()) ||
    t.to_account?.toLowerCase().includes(search.toLowerCase()) ||
    t.mode?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: '32px 24px', maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.04em' }}>Evidence</h1>
        <p style={{ margin: '4px 0 0', color: 'var(--color-text-tertiary)', fontSize: '0.875rem' }}>
          Raw investigative data across all sources. All data is read-only in demo mode.
        </p>
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '8px 16px', borderRadius: 'var(--radius-full)',
              border: activeTab === tab.id ? '2px solid var(--color-accent)' : '2px solid var(--color-bg-tertiary)',
              background: activeTab === tab.id ? 'var(--color-accent-dim)' : 'var(--color-bg-secondary)',
              cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 600,
              color: activeTab === tab.id ? 'var(--color-accent)' : 'var(--color-text-secondary)',
              transition: 'all 0.15s ease',
            }}
          >
            <tab.icon size={15} />
            {tab.label}
            <span className={`badge ${activeTab === tab.id ? 'badge-blue' : ''}`} style={{ marginLeft: 2 }}>{tab.count}</span>
          </button>
        ))}
      </div>

      {/* Search for CDR / Financial */}
      {(activeTab === 'cdr' || activeTab === 'financial') && (
        <div style={{ position: 'relative', maxWidth: 360, marginBottom: 16 }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-quaternary)' }} />
          <input className="input-field" placeholder={activeTab === 'cdr' ? 'Search by number or location…' : 'Search by account or mode…'} value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 36 }} />
        </div>
      )}

      {/* FIR Reports */}
      {activeTab === 'fir' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {firs.map((fir, i) => (
            <motion.div key={fir.fir_number} className="card" style={{ padding: '18px 20px' }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-text-quaternary)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{fir.fir_number}</div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-accent)', marginTop: 2 }}>{fir.case_id}</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-quaternary)' }}>{fir.officer}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.72rem', color: 'var(--color-text-quaternary)', marginTop: 2, justifyContent: 'flex-end' }}>
                    <Clock size={10} />{fir.date}
                  </div>
                </div>
              </div>
              <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--color-text-secondary)', lineHeight: 1.65 }}>{fir.text}</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Surveillance */}
      {activeTab === 'surv' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {surveillance.map((note, i) => (
            <motion.div key={note.note_id} className="card" style={{ padding: '16px 20px', border: '1px solid rgba(255,159,10,0.15)' }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ShieldAlert size={15} color="var(--color-warning)" />
                  <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--color-warning)' }}>{note.note_id}</span>
                  <span className="badge badge-orange">{note.linked_case_id}</span>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--color-text-quaternary)', textAlign: 'right' }}>
                  {note.date}<br/>{note.source}
                </div>
              </div>
              <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--color-text-secondary)', lineHeight: 1.65 }}>{note.text}</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* CDR Table */}
      {activeTab === 'cdr' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-bg-tertiary)', background: 'var(--color-bg-tertiary)' }}>
                  {['ID','Caller','Callee','Date/Time','Duration','Type','Tower Location'].map(h => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 700, color: 'var(--color-text-quaternary)', fontSize: '0.72rem', letterSpacing: '0.05em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredCDR.map((row, i) => {
                  const isBurner = row.caller_number === '7710099887' || row.callee_number === '7710099887';
                  return (
                    <tr key={row.call_id} style={{ borderBottom: '1px solid var(--color-bg-tertiary)', background: isBurner ? 'rgba(255,69,58,0.04)' : i % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.01)' }}>
                      <td style={{ padding: '9px 14px', color: 'var(--color-text-quaternary)', fontFamily: 'monospace', fontSize: '0.72rem' }}>{row.call_id}</td>
                      <td style={{ padding: '9px 14px', fontWeight: isBurner && row.caller_number === '7710099887' ? 700 : 400, color: isBurner && row.caller_number === '7710099887' ? 'var(--color-danger)' : 'var(--color-text-primary)', fontFamily: 'monospace' }}>{row.caller_number}</td>
                      <td style={{ padding: '9px 14px', fontWeight: isBurner && row.callee_number === '7710099887' ? 700 : 400, color: isBurner && row.callee_number === '7710099887' ? 'var(--color-danger)' : 'var(--color-text-primary)', fontFamily: 'monospace' }}>{row.callee_number}</td>
                      <td style={{ padding: '9px 14px', color: 'var(--color-text-tertiary)', whiteSpace: 'nowrap' }}>{row.timestamp}</td>
                      <td style={{ padding: '9px 14px', color: 'var(--color-text-tertiary)', textAlign: 'right' }}>{row.duration_sec}s</td>
                      <td style={{ padding: '9px 14px' }}>
                        <span className={`badge ${row.call_type === 'Voice' ? 'badge-green' : 'badge-blue'}`}>{row.call_type}</span>
                      </td>
                      <td style={{ padding: '9px 14px', color: 'var(--color-text-tertiary)', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <MapPin size={11} />{row.tower_location}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div style={{ padding: '10px 16px', fontSize: '0.75rem', color: 'var(--color-text-quaternary)', borderTop: '1px solid var(--color-bg-tertiary)', display: 'flex', justifyContent: 'space-between' }}>
            <span>Rows highlighted in red = burner number 7710099887 (key evidence)</span>
            <span>{filteredCDR.length} records</span>
          </div>
        </div>
      )}

      {/* Financial Table */}
      {activeTab === 'financial' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-bg-tertiary)', background: 'var(--color-bg-tertiary)' }}>
                  {['ID','From Account','To Account','Amount (₹)','Mode','Date/Time','Branch'].map(h => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 700, color: 'var(--color-text-quaternary)', fontSize: '0.72rem', letterSpacing: '0.05em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredTxn.map((row, i) => {
                  const isSuspect = row.from_account?.includes('5678') || row.to_account?.includes('9012') || row.from_account?.includes('Unknown');
                  return (
                    <tr key={row.transaction_id} style={{ borderBottom: '1px solid var(--color-bg-tertiary)', background: isSuspect ? 'rgba(255,69,58,0.04)' : i % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.01)' }}>
                      <td style={{ padding: '9px 14px', color: 'var(--color-text-quaternary)', fontFamily: 'monospace', fontSize: '0.72rem' }}>{row.transaction_id}</td>
                      <td style={{ padding: '9px 14px', fontFamily: 'monospace', fontSize: '0.75rem', color: isSuspect ? 'var(--color-danger)' : 'var(--color-text-primary)', fontWeight: isSuspect ? 700 : 400 }}>{row.from_account}</td>
                      <td style={{ padding: '9px 14px', fontFamily: 'monospace', fontSize: '0.75rem', color: isSuspect ? 'var(--color-danger)' : 'var(--color-text-primary)', fontWeight: isSuspect ? 700 : 400 }}>{row.to_account}</td>
                      <td style={{ padding: '9px 14px', textAlign: 'right', fontWeight: 700, color: 'var(--color-text-primary)' }}>₹{parseInt(row.amount_inr || 0).toLocaleString('en-IN')}</td>
                      <td style={{ padding: '9px 14px' }}>
                        <span className={`badge ${row.mode?.includes('Cash') ? 'badge-red' : 'badge-blue'}`} style={{ fontSize: '0.65rem' }}>{row.mode}</span>
                      </td>
                      <td style={{ padding: '9px 14px', color: 'var(--color-text-tertiary)', whiteSpace: 'nowrap' }}>{row.timestamp}</td>
                      <td style={{ padding: '9px 14px', color: 'var(--color-text-tertiary)' }}>{row.bank_branch}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div style={{ padding: '10px 16px', fontSize: '0.75rem', color: 'var(--color-text-quaternary)', borderTop: '1px solid var(--color-bg-tertiary)', display: 'flex', justifyContent: 'space-between' }}>
            <span>Highlighted rows = ICICI-5678 (Priya Nair) or SBI-9012 (Gupta Traders) — key laundry pipeline</span>
            <span>{filteredTxn.length} records</span>
          </div>
        </div>
      )}
    </div>
  );
}
