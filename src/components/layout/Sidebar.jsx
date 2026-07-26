import { useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Briefcase,
  Users,
  Eye,
  Kanban,
  FileSearch,
  LogOut,
} from 'lucide-react'

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/jobs', label: 'Job Postings', icon: Briefcase },
  { path: '/candidates', label: 'Candidates', icon: Users },
  { path: '/screener', label: 'Blind Screener', icon: Eye },
  { path: '/tracker', label: 'Application Tracker', icon: Kanban },
  { path: '/job-ad-checker', label: 'Job Ad Checker', icon: FileSearch },
]

const styles = {
  sidebar: {
    width: '210px',
    minWidth: '210px',
    background: '#0a0a0a',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    position: 'sticky',
    top: 0,
    overflowY: 'auto',
  },
  logoArea: {
    padding: '24px 16px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  logoText: {
    display: 'flex',
    flexDirection: 'column',
  },
  logoName: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#ffffff',
    lineHeight: 1.2,
  },
  logoSub: {
    fontSize: '11px',
    color: '#9ca3af',
    lineHeight: 1.2,
  },
  nav: {
    flex: 1,
    padding: '4px 8px',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  navBtn: (active) => ({
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 12px',
    borderRadius: '8px',
    border: 'none',
    background: active ? '#1a1a1a' : 'transparent',
    color: active ? '#ffffff' : '#9ca3af',
    fontSize: '14px',
    fontWeight: active ? '500' : '400',
    textAlign: 'left',
    transition: 'background 0.15s, color 0.15s',
  }),
  navIcon: (active) => ({
    color: active ? '#ffffff' : '#6b7280',
    flexShrink: 0,
  }),
  bottom: {
    padding: '8px 8px 16px',
  },
  signOutBtn: {
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
  },
}

export default function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <aside style={styles.sidebar}>
      <div style={styles.logoArea}>
        <img
          src="/WOMS PNG.png"
          alt="WorkforceMS"
          style={{ width: '32px', height: '32px', borderRadius: '6px', objectFit: 'contain', flexShrink: 0 }}
        />
        <div style={styles.logoText}>
          <span style={styles.logoName}>WorkforceMS</span>
          <span style={styles.logoSub}>Recruitment</span>
        </div>
      </div>

      <nav style={styles.nav}>
        {navItems.map(({ path, label, icon: Icon }) => {
          const active = location.pathname === path
          return (
            <button
              key={path}
              style={styles.navBtn(active)}
              onClick={() => navigate(path)}
            >
              <Icon size={18} style={styles.navIcon(active)} />
              {label}
            </button>
          )
        })}
      </nav>

      <div style={styles.bottom}>
        <button style={styles.signOutBtn}>
          <LogOut size={18} style={{ color: '#ef4444' }} />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
