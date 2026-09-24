import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  FolderOpen, Users, AlertTriangle, Network, ChevronRight,
  Activity, Shield, Zap, Database, Phone, MapPin, TrendingUp, FileText
} from 'lucide-react';
import { useData } from '../context/DataContext';

const CASE_STATUS_BADGE = {
  'Under Investigation': 'badge-blue',
  'Preliminary Enquiry': 'badge-orange',
  'Closed': '',
};
const CRIME_TYPE_COLORS = {
  'NDPS Act - Drug Trafficking':    '#FF453A',
  'IPC 384 - Extortion':            '#FF9F0A',
  'NDPS Act / Customs Violation':   '#FF453A',
  'Human Trafficking - Preliminary':'#BF5AF2',
};

function StatCard({ label, value, icon: Icon, color, accentClass, index, to }) {
  const inner = (
    <motion.div
      className={`stat-card ${accentClass}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{
          width: 40, height: 40, borderRadius: 'var(--radius-md)',
          background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={20} color={color} strokeWidth={2} />
        </div>
        {to && <ChevronRight size={14} color="var(--color-text-quaternary)" />}
      </div>
      <div style={{ fontSize: '2.25rem', fontWeight: 800, letterSpacing: '-0.05em', color: 'var(--color-text-primary)' }}>
        {value}
      </div>
      <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-tertiary)', fontWeight: 500 }}>{label}</div>
    </motion.div>
  );
  if (to) return <Link to={to} style={{ textDecoration: 'none' }}>{inner}</Link>;
  return inner;
}

export default function Dashboard() {
  const { nodes, edges, rawData, loading } = useData();

  const cases       = rawData?.cases || [];
  const firs        = rawData?.firs  || [];
  const flagged     = nodes.filter(n => n.flagged);
  const persons     = nodes.filter(n => n.type === 'person');
  const topNode     = persons[0];

  if (loading) return (
    <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          style={{ width: 48, height: 48, border: '3px solid var(--color-accent)', borderTopColor: 'transparent', borderRadius: '50%', margin: '0 auto 16px' }}
        />
        <p style={{ color: 'var(--color-text-tertiary)', fontSize: '0.875rem' }}>Loading TraceNet data…</p>
      </div>
    </div>
  );

  return (
    <div style={{ padding: '32px 24px', maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28 }}>
        <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--color-text-primary)' }}>
          Investigative Overview
        </h1>
        <p style={{ margin: '6px 0 0', color: 'var(--color-text-tertiary)', fontSize: '0.9375rem' }}>
          Operation Syndicate — SIH26189 · Ministry of Home Affairs
        </p>
      </motion.div>

      {/* Disclaimer */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
        style={{
          background: 'rgba(255,159,10,0.08)', border: '1px solid rgba(255,159,10,0.25)',
          borderRadius: 'var(--radius-lg)', padding: '12px 18px',
          display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28,
        }}
      >
        <Shield size={15} color="var(--color-warning)" />
        <span style={{ fontSize: '0.8125rem', color: 'var(--color-warning)', fontWeight: 500 }}>
          Decision Support System — All insights are investigator leads requiring human verification. No AI output constitutes legal evidence.
        </span>
      </motion.div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 14, marginBottom: 32 }}>
        <StatCard index={0} label="Active Cases"      value={cases.length}    icon={FolderOpen}    color="var(--color-accent)"  accentClass="accent"  to="/cases" />
        <StatCard index={1} label="Entities Tracked"  value={nodes.length}    icon={Users}         color="var(--color-success)" accentClass="success" to="/entities" />
        <StatCard index={2} label="Flagged Leads"     value={flagged.length}  icon={AlertTriangle} color="var(--color-danger)"  accentClass="danger"  to="/analytics" />
        <StatCard index={3} label="CDR Records"       value={rawData?.cdrRecords?.length || 0} icon={Phone} color="var(--color-purple)" accentClass="" to="/evidence" />
        <StatCard index={4} label="Financial Txns"    value={rawData?.financialTxns?.length || 0} icon={Database} color="var(--color-warning)" accentClass="warning" to="/evidence" />
        <StatCard index={5} label="Network Edges"     value={edges.length}    icon={Network}       color="var(--color-teal)"    accentClass=""        to="/graph" />
      </div>

      {/* Key insight banner */}
      {topNode && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          style={{
            background: 'linear-gradient(135deg, rgba(10,132,255,0.08) 0%, rgba(191,90,242,0.06) 100%)',
            border: '1px solid rgba(10,132,255,0.2)',
            borderRadius: 'var(--radius-xl)',
            padding: '20px 24px',
            marginBottom: 28,
            display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap',
          }}
        >
          <div style={{
            width: 52, height: 52, borderRadius: 'var(--radius-lg)',
            background: 'rgba(255,69,58,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <Zap size={26} color="var(--color-danger)" strokeWidth={2.5} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-quaternary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
              Top Influence Lead
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '-0.02em', marginBottom: 4 }}>
              {topNode.label}
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-tertiary)' }}>
              {topNode.role} · Linked across {topNode.caseIds?.length || 0} case{(topNode.caseIds?.length || 0) !== 1 ? 's' : ''} · Influence score: {((topNode.influenceScore || 0) * 100).toFixed(1)}%
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-danger)', fontWeight: 600, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
              <AlertTriangle size={11} /> Burner number 7710099887 links Mumbai, Delhi, Punjab and Kolkata cases
            </div>
          </div>
          <Link to="/graph" className="btn-pill btn-primary" style={{ textDecoration: 'none', flexShrink: 0 }}>
            View in Graph <ChevronRight size={15} />
          </Link>
        </motion.div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, alignItems: 'start' }}>
        {/* Cases */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h2 style={{ margin: 0, fontSize: '1.0625rem', fontWeight: 700 }}>Active Cases</h2>
            <Link to="/cases" style={{ display: 'flex', alignItems: 'center', gap: 3, color: 'var(--color-accent)', fontSize: '0.8125rem', fontWeight: 600, textDecoration: 'none' }}>
              View all <ChevronRight size={14} />
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {cases.map((c, i) => (
              <motion.div
                key={c.case_id}
                className="card"
                style={{ padding: '14px 18px', cursor: 'default' }}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.07 }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-text-quaternary)', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 3 }}>
                      {c.case_id}
                    </div>
                    <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 4, letterSpacing: '-0.01em' }}>
                      {c.title}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-text-tertiary)' }}>
                      {c.assigned_investigator} · {c.police_station?.split(',')[0]}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                    <span className={`badge ${CASE_STATUS_BADGE[c.status] || 'badge-green'}`}>{c.status}</span>
                    <span style={{
                      fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px', borderRadius: 99,
                      background: `${CRIME_TYPE_COLORS[c.crime_type] || '#8E8E93'}18`,
                      color: CRIME_TYPE_COLORS[c.crime_type] || '#8E8E93',
                    }}>{c.crime_type}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Recent FIR snippets */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h2 style={{ margin: 0, fontSize: '1.0625rem', fontWeight: 700 }}>FIR Reports</h2>
            <Link to="/evidence" style={{ display: 'flex', alignItems: 'center', gap: 3, color: 'var(--color-accent)', fontSize: '0.8125rem', fontWeight: 600, textDecoration: 'none' }}>
              View all <ChevronRight size={14} />
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {firs.map((fir, i) => (
              <motion.div
                key={fir.fir_number}
                className="card"
                style={{ padding: '14px 18px' }}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.07 }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 'var(--radius-md)', background: 'rgba(10,132,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                    <FileText size={15} color="var(--color-accent)" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 3 }}>
                      {fir.fir_number}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', lineHeight: 1.5 }}>
                      {fir.text.slice(0, 110)}…
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-text-quaternary)', marginTop: 5 }}>
                      {fir.officer} · {fir.date}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
