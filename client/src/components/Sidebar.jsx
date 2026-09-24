import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, FolderOpen, Upload, Network, BarChart3,
  Users, Moon, Sun, ChevronRight, Shield
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const navItems = [
  { to: '/',          icon: LayoutDashboard, label: 'Dashboard'      },
  { to: '/cases',     icon: FolderOpen,      label: 'Cases'          },
  { to: '/evidence',  icon: Upload,          label: 'Evidence'       },
  { to: '/entities',  icon: Users,           label: 'Entities'       },
  { to: '/graph',     icon: Network,         label: 'Graph Explorer' },
  { to: '/analytics', icon: BarChart3,       label: 'Analytics'      },
];

/** Inline TARANG wordmark – uses currentColor so it adapts to dark/light */
function TarangLogo({ collapsed }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 0,
      overflow: 'hidden',
      transition: 'all 0.35s cubic-bezier(0.4,0,0.2,1)',
    }}>
      {/* Icon mark — always visible */}
      <div style={{
        flexShrink: 0,
        width: 38, height: 38,
        borderRadius: 11,
        background: 'linear-gradient(145deg, #003366 0%, #005599 60%, #00B4D8 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 4px 14px rgba(0,100,200,0.35)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Wave lines */}
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M3 14 Q7 10 12 14 Q17 18 21 14" stroke="rgba(255,255,255,0.4)" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
          <path d="M3 10 Q7 6 12 10 Q17 14 21 10" stroke="rgba(255,255,255,0.7)" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
          <path d="M3 18 Q7 14 12 18 Q17 22 21 18" stroke="#00D4FF" strokeWidth="2" strokeLinecap="round" fill="none"/>
        </svg>
      </div>

      {/* Text wordmark — slides in on expand */}
      <div style={{
        maxWidth: collapsed ? 0 : 180,
        opacity: collapsed ? 0 : 1,
        overflow: 'hidden',
        transition: 'max-width 0.35s cubic-bezier(0.4,0,0.2,1), opacity 0.25s ease',
        whiteSpace: 'nowrap',
        paddingLeft: collapsed ? 0 : 10,
      }}>
        {/* TARANG wordmark SVG */}
        <svg
          width="100"
          height="28"
          viewBox="0 0 200 44"
          fill="none"
          style={{ display: 'block', color: 'var(--color-text-primary)' }}
        >
          {/* T */}
          <rect x="0" y="2" width="30" height="5" rx="2.5" fill="currentColor"/>
          <rect x="12.5" y="2" width="5" height="32" rx="2.5" fill="currentColor"/>

          {/* A */}
          <path d="M40 34 L51 6 L62 34" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round"/>
          <line x1="43.5" y1="24" x2="58.5" y2="24" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>

          {/* R */}
          <rect x="71" y="6" width="5" height="28" rx="2.5" fill="currentColor"/>
          <path d="M76 6 C92 6 92 22 76 22" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" fill="none"/>
          <line x1="80" y1="21" x2="92" y2="34" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round"/>

          {/* A */}
          <path d="M100 34 L111 6 L122 34" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round"/>
          <line x1="103.5" y1="24" x2="118.5" y2="24" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>

          {/* N */}
          <rect x="130" y="6" width="5" height="28" rx="2.5" fill="currentColor"/>
          <rect x="153" y="6" width="5" height="28" rx="2.5" fill="currentColor"/>
          <line x1="135" y1="6" x2="153" y2="34" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round"/>

          {/* G */}
          <path d="M167 20 C167 11 174 5 182 5 C189 5 194 9 196 14" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" fill="none"/>
          <line x1="183" y1="19" x2="196" y2="19" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round"/>
          <path d="M196 19 L196 34 L167 34 L167 20" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          {/* Teal wave on G */}
          <path d="M169 28 Q176 23 182 28 Q189 33 196 28" stroke="#00B4D8" strokeWidth="2.8" strokeLinecap="round" fill="none"/>
        </svg>

        <div style={{ fontSize: '0.6rem', color: 'var(--color-text-quaternary)', letterSpacing: '0.06em', textTransform: 'uppercase', marginTop: 1 }}>
          SIH 2026 · MHA · SIH26189
        </div>
      </div>
    </div>
  );
}

export default function Sidebar() {
  const { dark, toggle } = useTheme();

  return (
    <aside
      className="sidebar sidebar-collapsible"
      onMouseEnter={() => document.body.classList.add('sidebar-open')}
      onMouseLeave={() => document.body.classList.remove('sidebar-open')}
    >
      {/* Logo */}
      <div style={{ padding: '22px 13px 18px', flexShrink: 0 }}>
        <TarangLogo collapsed={false} />
      </div>

      <div className="divider" style={{ margin: '0 14px 10px' }} />

      {/* Nav */}
      <nav style={{ flex: 1, padding: '0 8px', display: 'flex', flexDirection: 'column', gap: 2, overflow: 'hidden' }}>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => `nav-item sidebar-nav-item ${isActive ? 'active' : ''}`}
          >
            <Icon size={18} strokeWidth={2} style={{ flexShrink: 0 }} />
            <span className="sidebar-nav-label" style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden' }}>{label}</span>
            <ChevronRight size={13} className="sidebar-nav-chevron" style={{ opacity: 0.25, flexShrink: 0 }} />
          </NavLink>
        ))}
      </nav>

      <div className="divider" style={{ margin: '10px 14px' }} />

      {/* Footer */}
      <div style={{ padding: '0 8px 18px', display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0 }}>
        <button className="nav-item sidebar-nav-item" onClick={toggle} style={{ justifyContent: 'space-between' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {dark
              ? <Sun size={17} strokeWidth={2} style={{ flexShrink: 0 }} />
              : <Moon size={17} strokeWidth={2} style={{ flexShrink: 0 }} />}
            <span className="sidebar-nav-label" style={{ whiteSpace: 'nowrap' }}>{dark ? 'Light Mode' : 'Dark Mode'}</span>
          </span>
        </button>

        <div className="sidebar-demo-badge" style={{
          marginTop: 6, padding: '9px 11px',
          background: 'rgba(255,159,10,0.08)',
          border: '1px solid rgba(255,159,10,0.2)',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
            <Shield size={12} color="var(--color-warning)" style={{ flexShrink: 0 }} />
            <span className="sidebar-nav-label" style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-warning)', whiteSpace: 'nowrap' }}>Demo Mode</span>
          </div>
          <p className="sidebar-nav-label" style={{ margin: 0, fontSize: '0.62rem', color: 'var(--color-text-quaternary)', lineHeight: 1.4 }}>
            All insights are investigator leads requiring human verification. No output constitutes legal evidence.
          </p>
        </div>
      </div>
    </aside>
  );
}
