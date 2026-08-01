import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import TopBar from '../components/layout/TopBar'
import StatCard from '../components/ui/StatCard'
import { StageBadge } from '../components/ui/Badge'

const styles = {
  page: { flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 },
  content: { padding: '32px', flex: 1, overflowY: 'auto' },
  greeting: { marginBottom: '32px' },
  greetingTitle: { fontSize: '24px', fontWeight: '700', color: '#ffffff', marginBottom: '4px' },
  greetingDate: { fontSize: '14px', color: '#9ca3af' },
  statsRow: { display: 'flex', gap: '16px', marginBottom: '32px', flexWrap: 'wrap', alignItems: 'stretch' },
  sectionTitle: { fontSize: '18px', fontWeight: '600', color: '#ffffff', marginBottom: '16px' },
  tableWrap: {
    background: '#141414',
    border: '1px solid #2a2a2a',
    borderRadius: '12px',
    overflow: 'hidden',
  },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: {
    background: '#1a1a1a',
    color: '#9ca3af',
    fontSize: '12px',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    padding: '12px 20px',
    textAlign: 'left',
    fontWeight: '500',
  },
  td: {
    padding: '14px 20px',
    borderBottom: '1px solid #1f1f1f',
    fontSize: '13px',
    color: '#ffffff',
  },
  tdSec: {
    padding: '14px 20px',
    borderBottom: '1px solid #1f1f1f',
    fontSize: '13px',
    color: '#9ca3af',
  },
  loading: { color: '#9ca3af', padding: '48px', textAlign: 'center' },
  error: {
    background: '#2a0a0a',
    border: '1px solid #ef4444',
    borderRadius: '8px',
    padding: '16px',
    color: '#ef4444',
    marginBottom: '24px',
    fontSize: '14px',
  },
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

function displayRef(app) {
  if (app.application_reference &&
      app.application_reference !== '30000000' &&
      app.application_reference.trim() !== '') {
    return app.application_reference
  }
  return 'ID-' + app.id.slice(0, 8).toUpperCase()
}

export default function Dashboard() {
  const [stats, setStats] = useState({ openRoles: 0, totalApplicants: 0, blindScreened: 0 })
  const [recent, setRecent] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const [jobsRes, appsRes] = await Promise.all([
          supabase.from('jobs').select('id, status'),
          supabase.from('applications')
            .select('id, applicant_role, stage, blind_score, is_blinded, created_at, application_reference, jobs(title)')
            .order('created_at', { ascending: false })
            .limit(10),
        ])
        if (jobsRes.error) throw new Error(jobsRes.error.message)
        if (appsRes.error) throw new Error(appsRes.error.message)

        const openRoles = (jobsRes.data || []).filter(j => j.status === 'open').length
        const all = appsRes.data || []
        setStats({
          openRoles,
          totalApplicants: all.length,
          blindScreened: all.filter(a => a.is_blinded).length,
        })

        const [totalAppsRes, blindCountRes] = await Promise.all([
          supabase.from('applications').select('id', { count: 'exact', head: true }),
          supabase.from('applications').select('id', { count: 'exact', head: true }).eq('is_blinded', true),
        ])

        setStats(prev => ({
          ...prev,
          totalApplicants: totalAppsRes.count || 0,
          blindScreened: blindCountRes.count || 0,
        }))
        setRecent(all)
      } catch (e) {
        setError(e.message)
      }
      setLoading(false)
    }
    load()
  }, [])

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

  return (
    <div style={styles.page}>
      <TopBar title="Dashboard" />
      <div style={styles.content}>
        <div style={styles.greeting}>
          <div style={styles.greetingTitle}>{getGreeting()}, HR.</div>
          <div style={styles.greetingDate}>{today}</div>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        {loading ? (
          <div style={styles.loading}>Loading dashboard…</div>
        ) : (
          <>
            <div style={styles.statsRow}>
              <StatCard label="Open Roles" value={stats.openRoles} color="#22c55e" />
              <StatCard label="Total Applicants" value={stats.totalApplicants} />
              <StatCard label="Blind Screened" value={stats.blindScreened} />
            </div>

            <div style={styles.sectionTitle}>Recent Applications</div>
            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Reference</th>
                    <th style={styles.th}>Role</th>
                    <th style={styles.th}>Stage</th>
                    <th style={styles.th}>Blind Score</th>
                    <th style={styles.th}>Date Applied</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ ...styles.td, textAlign: 'center', color: '#6b7280' }}>
                        No applications yet.
                      </td>
                    </tr>
                  ) : (
                    recent.map(app => (
                      <tr key={app.id} style={{ transition: 'background 0.1s' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#1c1c1c'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={styles.tdSec}>{displayRef(app)}</td>
                        <td style={styles.td}>{app.jobs?.title || app.applicant_role || '—'}</td>
                        <td style={styles.td}><StageBadge stage={app.stage} /></td>
                        <td style={styles.td}>
                          {app.blind_score != null ? (
                            <span style={{
                              color: app.blind_score > 70 ? '#22c55e' : app.blind_score > 40 ? '#f97316' : '#ef4444',
                              fontWeight: '600',
                            }}>{app.blind_score}</span>
                          ) : '—'}
                        </td>
                        <td style={styles.tdSec}>{formatDate(app.created_at)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
