import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import Sidebar from './components/layout/Sidebar'
import Dashboard from './pages/Dashboard'
import Jobs from './pages/Jobs'
import Candidates from './pages/Candidates'
import BlindScreener from './pages/BlindScreener'
import ApplicationTracker from './pages/ApplicationTracker'
import JobAdChecker from './pages/JobAdChecker'
import Careers from './pages/Careers'

function MainLayout() {
  return (
    <div style={{ minHeight: '100vh', background: '#000', overflowX: 'hidden' }}>
      <Sidebar />
      <div style={{ marginLeft: 'var(--sidebar-width)', width: 'calc(100vw - var(--sidebar-width))', minHeight: '100vh', overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/candidates" element={<Candidates />} />
          <Route path="/screener" element={<BlindScreener />} />
          <Route path="/tracker" element={<ApplicationTracker />} />
          <Route path="/job-ad-checker" element={<JobAdChecker />} />
        </Routes>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/careers" element={<Careers />} />
        <Route path="/*" element={<MainLayout />} />
      </Routes>
    </BrowserRouter>
  )
}
