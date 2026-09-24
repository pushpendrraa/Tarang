import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Shield, Search, Filter, User, Clock } from 'lucide-react';
import api from '../services/api';

const ACTION_COLORS = {
  USER_LOGIN:        '#0A84FF',
  USER_REGISTERED:   '#30D158',
  LOGIN_FAILED:      '#FF453A',
  CASE_CREATED:      '#30D158',
  CASE_VIEWED:       '#0A84FF',
  CASE_UPDATED:      '#FF9F0A',
  CASE_DELETED:      '#FF453A',
  EVIDENCE_UPLOADED: '#BF5AF2',
  EVIDENCE_LISTED:   '#64D2FF',
  EVIDENCE_VIEWED:   '#64D2FF',
  ENTITIES_LISTED:   '#0A84FF',
  ENTITY_VIEWED:     '#0A84FF',
  ENTITY_MERGED:     '#FF9F0A',
  GRAPH_VIEWED:      '#30D158',
  INFLUENCERS_VIEWED:'#30D158',
  PROFILE_VIEWED:    '#8E8E93',
};

function formatTime(ts) {
  const d = new Date(ts);
  return d.toLocaleString('en-IN', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' });
}

export default function AuditLog() {
  const [logs, setLogs]       = useState([]);
  const [total, setTotal]     = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [page, setPage]       = useState(0);
  const LIMIT = 50;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { limit: LIMIT, skip: page * LIMIT };
      if (search) params.action = search;
      const { data } = await api.get('/audit', { params });
      setLogs(data.logs || []);
      setTotal(data.total || 0);
    } catch (_) {}
    setLoading(false);
  }, [page, search]);

  useEffect(() => { load(); }, [load]);

  return (
    <div style={{ padding: '32px 24px', maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.03em', display: 'flex', alignItems: 'center', gap: 10 }}>
          <Shield size={24} color="var(--color-accent)" /> Audit Log
        </h1>
        <p style={{ margin: '6px 0 0', color: 'var(--color-text-tertiary)', fontSize: '0.875rem' }}>
          Full accountability trail — every data access and action recorded. Admin-only view.
        </p>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', maxWidth: 360, marginBottom: 20 }}>
        <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-quaternary)' }} />
        <input
          className="input-field"
          placeholder="Filter by action (e.g. CASE_VIEWED)"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(0); }}
          style={{ paddingLeft: 40 }}
        />
      </div>

      {/* Stat */}
      <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-quaternary)', marginBottom: 16 }}>
        {total} total entries
      </div>

      {/* Log list */}
      {loading ? (
        Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="skeleton" style={{ height: 62, borderRadius: 'var(--radius-lg)', marginBottom: 8 }} />
        ))
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {logs.map((log, i) => (
            <motion.div
              key={log._id}
              className="card"
              style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 14 }}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.02 }}
            >
              {/* Action badge */}
              <span style={{
                padding: '3px 10px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.04em',
                background: `${ACTION_COLORS[log.action] || '#8E8E93'}18`,
                color: ACTION_COLORS[log.action] || '#8E8E93',
                flexShrink: 0, whiteSpace: 'nowrap',
              }}>
                {log.action}
              </span>

              {/* User */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, minWidth: 0 }}>
                <User size={13} color="var(--color-text-quaternary)" />
                <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {log.userId?.name || log.userEmail || 'System'}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-quaternary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {log.userEmail}
                </span>
              </div>

              {/* Target */}
              {log.targetType && (
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-quaternary)', flexShrink: 0 }}>
                  {log.targetType}
                </span>
              )}

              {/* Time */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                <Clock size={12} color="var(--color-text-quaternary)" />
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-quaternary)', whiteSpace: 'nowrap' }}>
                  {formatTime(log.timestamp)}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {total > LIMIT && (
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 20 }}>
          <button className="btn-pill btn-ghost" onClick={() => setPage(p => Math.max(0, p-1))} disabled={page === 0}>
            Previous
          </button>
          <span style={{ padding: '8px 16px', fontSize: '0.875rem', color: 'var(--color-text-tertiary)' }}>
            Page {page + 1} of {Math.ceil(total / LIMIT)}
          </span>
          <button className="btn-pill btn-ghost" onClick={() => setPage(p => p+1)} disabled={(page+1)*LIMIT >= total}>
            Next
          </button>
        </div>
      )}
    </div>
  );
}
