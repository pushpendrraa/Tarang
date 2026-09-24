import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FolderOpen, Network, BarChart3, Users } from 'lucide-react';

const tabs = [
  { to: '/',          icon: LayoutDashboard, label: 'Home'     },
  { to: '/cases',     icon: FolderOpen,      label: 'Cases'    },
  { to: '/entities',  icon: Users,           label: 'Entities' },
  { to: '/graph',     icon: Network,         label: 'Graph'    },
  { to: '/analytics', icon: BarChart3,       label: 'Stats'    },
];

export default function BottomTabBar() {
  return (
    <div className="bottom-tab-bar">
      {tabs.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) => `tab-btn ${isActive ? 'active' : ''}`}
        >
          <Icon size={22} strokeWidth={2} />
          <span>{label}</span>
        </NavLink>
      ))}
    </div>
  );
}
