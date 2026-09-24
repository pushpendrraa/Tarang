import { useState } from 'react';
import { motion } from 'framer-motion';
import { FolderOpen, MapPin, Calendar, User, FileText, Hash, Search } from 'lucide-react';
import { useData } from '../context/DataContext';

const STATUS_BADGE = {
  'Under Investigation': 'badge-blue',
  'Preliminary Enquiry': 'badge-orange',
};

const CRIME_COLORS = {
  'NDPS Act - Drug Trafficking':    '#FF453A',
  'IPC 384 - Extortion':            '#FF9F0A',
  'NDPS Act / Customs Violation':   '#FF453A',
  'Human Trafficking - Preliminary':'#BF5AF2',
};

export default function Cases() {
  const { rawData, nodes, loading } = useData();
  const [selected, setSelected] = useState(null);
  const [search, setSearch]     = useState('');

  const cases = rawData?.cases || [];
  const firs  = rawData?.firs  || [];
  const surveillance = rawData?.surveillance || [];

  const filtered = cases.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.case_id.toLowerCase().includes(search.toLowerCase()) ||
    c.crime_type.toLowerCase().includes(search.toLowerCase())
  );

  const selectedCase = cases.find(c => c.case_id === selected);
  const caseFirs     = firs.filter(f => f.case_id === selected);
  const caseNotes    = surveillance.filter(s => s.linked_case_id === selected);
  const casePersons  = nodes.filter(n => n.type === 'person' && n.caseIds?.includes(selected));

  return (
    <div className="page-container" style={{ maxWidth: 1200 }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Cases</h1>
          <p style={{ margin: '4px 0 0', color: 'var(--color-text-tertiary)', fontSize: '0.875rem' }}>
            {cases.length} active investigation{cases.length !== 1 ? 's' : ''} · SIH26189
          </p>
        </div>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', maxWidth: 360, marginBottom: 20 }}>
        <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-quaternary)' }} />
        <input className="input-field" placeholder="Search cases…" value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 40 }} />
      </div>

      <div className={`cases-layout ${selected ? 'has-selected' : ''}`}>
        {/* Case list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map((c, i) => (
            <motion.div
              key={c.case_id}
              className={`card tap-scale`}
              style={{ padding: '18px 20px', cursor: 'pointer', border: selected === c.case_id ? '2px solid var(--color-accent)' : '2px solid transparent' }}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              onClick={() => setSelected(selected === c.case_id ? null : c.case_id)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--color-text-quaternary)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4 }}>
                    {c.case_id}
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, letterSpacing: '-0.01em', color: 'var(--color-text-primary)', marginBottom: 8 }}>
                    {c.title}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: 'var(--color-text-tertiary)' }}>
                      <User size={12} /> {c.assigned_investigator}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: 'var(--color-text-tertiary)' }}>
                      <MapPin size={12} /> {c.police_station}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: 'var(--color-text-tertiary)' }}>
                      <Calendar size={12} /> {c.date_registered}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5, alignItems: 'flex-end', flexShrink: 0 }}>
                  <span className={`badge ${STATUS_BADGE[c.status] || 'badge-green'}`}>{c.status}</span>
                  <span style={{
                    fontSize: '0.62rem', fontWeight: 700, padding: '2px 8px', borderRadius: 99,
                    background: `${CRIME_COLORS[c.crime_type] || '#8E8E93'}18`,
                    color: CRIME_COLORS[c.crime_type] || '#8E8E93',
                  }}>{c.crime_type}</span>
                  <span className="tag-chip" style={{ fontSize: '0.62rem' }}>{c.linked_fir}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Case detail panel */}
        {selectedCase && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
          >
            <div className="card" style={{ padding: '20px 22px' }}>
              <h2 style={{ margin: '0 0 4px', fontSize: '1.125rem', fontWeight: 800, letterSpacing: '-0.02em' }}>{selectedCase.title}</h2>
              <p style={{ margin: '0 0 14px', fontSize: '0.8125rem', color: 'var(--color-text-quaternary)' }}>
                {selectedCase.case_id} · {selectedCase.crime_type}
              </p>
              <div className="divider" style={{ margin: '0 0 14px' }} />

              {/* FIR reports */}
              <h3 style={{ margin: '0 0 10px', fontSize: '0.875rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                <FileText size={15} color="var(--color-accent)" /> FIR Report
              </h3>
              {caseFirs.map(fir => (
                <div key={fir.fir_number} style={{
                  background: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-md)',
                  padding: '14px 16px', marginBottom: 10,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontWeight: 700, fontSize: '0.8125rem', color: 'var(--color-accent)' }}>{fir.fir_number}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-quaternary)' }}>{fir.date} · {fir.officer}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>{fir.text}</p>
                </div>
              ))}
            </div>

            {/* Surveillance notes */}
            {caseNotes.length > 0 && (
              <div className="card" style={{ padding: '20px 22px' }}>
                <h3 style={{ margin: '0 0 12px', fontSize: '0.875rem', fontWeight: 700 }}>
                  🕵️ Surveillance Notes ({caseNotes.length})
                </h3>
                {caseNotes.map(note => (
                  <div key={note.note_id} style={{
                    background: 'rgba(255,159,10,0.06)', border: '1px solid rgba(255,159,10,0.15)',
                    borderRadius: 'var(--radius-md)', padding: '12px 14px', marginBottom: 8,
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontWeight: 700, fontSize: '0.78rem', color: 'var(--color-warning)' }}>{note.note_id}</span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--color-text-quaternary)' }}>{note.date} · {note.source}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>{note.text}</p>
                  </div>
                ))}
              </div>
            )}

            {/* People linked */}
            {casePersons.length > 0 && (
              <div className="card" style={{ padding: '20px 22px' }}>
                <h3 style={{ margin: '0 0 12px', fontSize: '0.875rem', fontWeight: 700 }}>
                  👤 Persons of Interest ({casePersons.length})
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {casePersons.map(p => (
                    <div key={p.id} style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      background: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-md)', padding: '10px 14px',
                      border: p.flagged ? '1px solid rgba(255,69,58,0.2)' : 'none',
                    }}>
                      <div style={{
                        width: 34, height: 34, borderRadius: '50%',
                        background: p.flagged ? 'rgba(255,69,58,0.12)' : 'rgba(10,132,255,0.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.875rem', fontWeight: 700,
                        color: p.flagged ? 'var(--color-danger)' : 'var(--color-accent)',
                        flexShrink: 0,
                      }}>
                        {p.label.charAt(0)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                          {p.label}
                          {p.flagged && <span style={{ fontSize: '0.62rem', background: 'rgba(255,69,58,0.12)', color: 'var(--color-danger)', padding: '1px 6px', borderRadius: 99, fontWeight: 700 }}>FLAGGED</span>}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-quaternary)' }}>{p.role}</div>
                      </div>
                      <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-accent)' }}>
                        {((p.influenceScore || 0) * 100).toFixed(0)}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
