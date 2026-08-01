import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Briefcase,
  Users,
  Eye,
  Kanban,
  FileSearch,
  LogOut,
} from 'lucide-react'

const menuItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/jobs', label: 'Job Postings', icon: Briefcase },
  { path: '/candidates', label: 'Candidates', icon: Users },
  { path: '/screener', label: 'Blind Screener', icon: Eye },
  { path: '/tracker', label: 'Application Tracker', icon: Kanban },
  { path: '/job-ad-checker', label: 'Job Ad Checker', icon: FileSearch },
]

export default function Sidebar() {
  const location = useLocation()

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <img
          src="/WOMS PNG.png"
          alt="WorkforceMS"
          style={{ width: '32px', height: '32px', borderRadius: '6px', objectFit: 'contain', flexShrink: 0 }}
        />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '-0.5px', color: '#ffffff', lineHeight: 1.1 }}>WorkforceMS</span>
          <span style={{ fontSize: '11px', color: '#9ca3af', lineHeight: 1.2 }}>Recruitment</span>
        </div>
      </div>

      <ul className="sidebar-menu">
        <li className="menu-section"></li>
        {menuItems.map(({ path, label, icon: Icon }) => {
          const active = location.pathname === path
          return (
            <li key={path}>
              <Link to={path} className={`menu-item ${active ? 'active' : ''}`}>
                <Icon className="menu-item-icon" />
                <span>{label}</span>
              </Link>
            </li>
          )
        })}
      </ul>

      <div className="sidebar-footer">
        <button
          type="button"
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 12px',
            borderRadius: '8px',
            border: 'none',
            background: 'transparent',
            color: '#ef4444',
            fontSize: '14px',
            fontWeight: '400',
            textAlign: 'left',
            cursor: 'pointer',
          }}
        >
          <LogOut size={18} style={{ color: '#ef4444' }} />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
