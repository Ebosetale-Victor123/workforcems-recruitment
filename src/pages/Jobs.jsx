import { useState } from 'react'
import { MapPin, Building2, Users, Star, UserCheck, Calendar } from 'lucide-react'
import TopBar from '../components/layout/TopBar'
import StatCard from '../components/ui/StatCard'
import { StatusBadge } from '../components/ui/Badge'
import { useJobs } from '../hooks/useJobs'
import { useApplications } from '../hooks/useApplications'

const FILTERS = ['All', 'Open', 'Closed', 'Filled', 'Draft']

const s = {
  page: { flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 },
  content: { padding: '32px', flex: 1, overflowY: 'auto' },
  statsRow: { display: 'flex', gap: '16px', marginBottom: '28px' },
  pillRow: { display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' },
  pill: (active) => ({
    border: `1px solid ${active ? '#ffffff' : '#3a3a3a'}`,
    background: active ? '#ffffff' : 'transparent',
    color: active ? '#000000' : '#9ca3af',
    borderRadius: '999px',
    padding: '6px 16px',
    fontSize: '14px',
    fontWeight: active ? '600' : '400',
    cursor: 'pointer',
  }),
  jobCard: {
    background: '#141414',
    border: '1px solid #2a2a2a',
    borderRadius: '12px',
    padding: '20px 24px',
    marginBottom: '12px',
    cursor: 'pointer',
    transition: 'background 0.15s',
  },
  row: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' },
  jobTitle: { fontSize: '16px', fontWeight: '600', color: '#ffffff' },
  meta: { display: 'flex', alignItems: 'center', gap: '16px', color: '#9ca3af', fontSize: '13px', marginBottom: '10px' },
  metaItem: { display: 'flex', alignItems: 'center', gap: '4px' },
  pillTag: {
    border: '1px solid #3a3a3a',
    background: 'transparent',
    color: '#9ca3af',
    borderRadius: '4px',
    padding: '3px 10px',
    fontSize: '12px',
    marginRight: '6px',
  },
  pillTagRow: { marginBottom: '10px' },
  statsLine: { display: 'flex', alignItems: 'center', gap: '16px', color: '#9ca3af', fontSize: '13px' },
  statsItem: { display: 'flex', alignItems: 'center', gap: '4px' },
  error: {
    background: '#2a0a0a', border: '1px solid #ef4444',
    borderRadius: '8px', padding: '16px', color: '#ef4444', marginBottom: '24px', fontSize: '14px',
  },
  loading: { color: '#9ca3af', padding: '48px', textAlign: 'center' },
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
    zIndex: 100, display: 'flex', justifyContent: 'flex-end',
  },
  drawer: {
    background: '#141414', borderLeft: '1px solid #2a2a2a',
    width: '480px', height: '100vh', overflowY: 'auto', padding: '32px',
  },
  drawerTitle: { fontSize: '20px', fontWeight: '700', color: '#ffffff', marginBottom: '4px' },
  drawerClose: {
    background: 'transparent', border: 'none', color: '#9ca3af',
    fontSize: '20px', cursor: 'pointer', float: 'right',
  },
  drawerLabel: { fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px', marginTop: '16px' },
  drawerValue: { fontSize: '14px', color: '#ffffff' },
  drawerSec: { fontSize: '14px', color: '#9ca3af', lineHeight: '1.6' },
  modalBg: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
    zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  modal: {
    background: '#141414', border: '1px solid #2a2a2a',
    borderRadius: '16px', padding: '32px', width: '560px', maxHeight: '90vh', overflowY: 'auto',
  },
  modalTitle: { fontSize: '20px', fontWeight: '700', color: '#ffffff', marginBottom: '24px' },
  formGroup: { marginBottom: '16px' },
  label: { display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '6px' },
  input: {
    width: '100%', background: '#0d0d0d', border: '1px solid #2a2a2a',
    borderRadius: '8px', padding: '10px 14px', color: '#ffffff', fontSize: '14px',
  },
  textarea: {
    width: '100%', background: '#0d0d0d', border: '1px solid #2a2a2a',
    borderRadius: '8px', padding: '10px 14px', color: '#ffffff', fontSize: '14px',
    minHeight: '100px', resize: 'vertical', lineHeight: '1.5',
  },
  btnRow: { display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' },
  primaryBtn: {
    background: '#ffffff', color: '#000000', border: 'none',
    borderRadius: '8px', padding: '10px 20px', fontWeight: '600', fontSize: '14px',
  },
  cancelBtn: {
    background: 'transparent', color: '#9ca3af',
    border: '1px solid #3a3a3a', borderRadius: '8px',
    padding: '10px 20px', fontSize: '14px',
  },
  appRow: {
    padding: '12px 0', borderBottom: '1px solid #1f1f1f',
    fontSize: '13px', color: '#9ca3af',
  },
}

function isOverdue(date) {
  return date && new Date(date) < new Date()
}

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function JobCard({ job, appCounts = {}, onClick }) {
  const [hovered, setHovered] = useState(false)
  const overdue = isOverdue(job.closing_date)
  const counts = appCounts[job.id] || {}
  return (
    <div
      style={{ ...s.jobCard, background: hovered ? '#1c1c1c' : '#141414' }}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={s.row}>
        <span style={s.jobTitle}>{job.title}</span>
        <StatusBadge status={job.status} />
      </div>
      <div style={s.meta}>
        {job.department && (
          <span style={s.metaItem}><Building2 size={13} />{job.department}</span>
        )}
        {job.location && (
          <span style={s.metaItem}><MapPin size={13} />{job.location}</span>
        )}
      </div>
      <div style={s.pillTagRow}>
        {job.employment_type && <span style={s.pillTag}>{job.employment_type}</span>}
        {job.salary_range && <span style={s.pillTag}>{job.salary_range}</span>}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={s.statsLine}>
          <span style={s.statsItem}><Users size={13} />{counts.applied ?? 0} Applied</span>
          <span style={s.statsItem}><Star size={13} />{counts.shortlisted ?? 0} Shortlisted</span>
          <span style={s.statsItem}><UserCheck size={13} />{counts.interviewed ?? 0} Interviewed</span>
        </div>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: overdue ? '#ef4444' : '#22c55e' }}>
          <Calendar size={12} />{formatDate(job.closing_date)}
        </span>
      </div>
    </div>
  )
}

function Drawer({ job, onClose }) {
  const { applications, loading } = useApplications(job.id)
  return (
    <div style={s.overlay} onClick={onClose}>
      <div style={s.drawer} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={s.drawerTitle}>{job.title}</div>
            <StatusBadge status={job.status} />
          </div>
          <button style={s.drawerClose} onClick={onClose}>×</button>
        </div>

        <div style={s.drawerLabel}>Department</div>
        <div style={s.drawerValue}>{job.department || '—'}</div>

        <div style={s.drawerLabel}>Location</div>
        <div style={s.drawerValue}>{job.location || '—'}</div>

        <div style={s.drawerLabel}>Employment Type</div>
        <div style={s.drawerValue}>{job.employment_type || '—'}</div>

        <div style={s.drawerLabel}>Salary Range</div>
        <div style={s.drawerValue}>{job.salary_range || '—'}</div>

        <div style={s.drawerLabel}>Closing Date</div>
        <div style={{ ...s.drawerValue, color: isOverdue(job.closing_date) ? '#ef4444' : '#22c55e' }}>
          {formatDate(job.closing_date)}
        </div>

        <div style={s.drawerLabel}>Description</div>
        <div style={s.drawerSec}>{job.description || '—'}</div>

        <div style={s.drawerLabel}>Requirements</div>
        <div style={s.drawerSec}>{job.requirements || '—'}</div>

        <div style={{ ...s.drawerLabel, marginTop: '24px' }}>Applicants</div>
        {loading ? (
          <div style={{ color: '#9ca3af', fontSize: '13px' }}>Loading…</div>
        ) : applications.length === 0 ? (
          <div style={{ color: '#6b7280', fontSize: '13px' }}>No applicants yet.</div>
        ) : (
          applications.map(app => (
            <div key={app.id} style={s.appRow}>
              <span style={{ color: '#ffffff' }}>
                {app.is_blinded ? 'Anonymous Candidate' : app.candidate_name || 'Unnamed'}
              </span>
              {' · '}
              <span>{app.stage}</span>
              {app.blind_score != null && (
                <span style={{ marginLeft: '8px', color: '#22c55e' }}>Score: {app.blind_score}</span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

const EMPTY_FORM = {
  title: '', department: '', description: '', requirements: '',
  employment_type: '', salary_range: '', location: '', closing_date: '',
}

function PostJobModal({ onClose, onSubmit }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState(null)

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const submit = async () => {
    if (!form.title.trim()) { setErr('Job title is required.'); return }
    setSaving(true)
    setErr(null)
    try {
      await onSubmit(form)
      onClose()
    } catch (e) {
      setErr(e.message)
    }
    setSaving(false)
  }

  return (
    <div style={s.modalBg} onClick={onClose}>
      <div style={s.modal} onClick={e => e.stopPropagation()}>
        <div style={s.modalTitle}>Post New Job</div>
        {err && <div style={{ ...s.error, marginBottom: '16px' }}>{err}</div>}
        {[
          ['title', 'Job Title *', 'input'],
          ['department', 'Department', 'input'],
          ['location', 'Location', 'input'],
          ['employment_type', 'Employment Type', 'input'],
          ['salary_range', 'Salary Range', 'input'],
          ['closing_date', 'Closing Date', 'date'],
          ['description', 'Description', 'textarea'],
          ['requirements', 'Requirements', 'textarea'],
        ].map(([key, lbl, type]) => (
          <div key={key} style={s.formGroup}>
            <label style={s.label}>{lbl}</label>
            {type === 'textarea' ? (
              <textarea style={s.textarea} value={form[key]} onChange={set(key)} />
            ) : (
              <input
                style={s.input}
                type={type === 'date' ? 'date' : 'text'}
                value={form[key]}
                onChange={set(key)}
              />
            )}
          </div>
        ))}
        <div style={s.btnRow}>
          <button style={s.cancelBtn} onClick={onClose}>Cancel</button>
          <button style={s.primaryBtn} onClick={submit} disabled={saving}>
            {saving ? 'Posting…' : 'Post Job'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Jobs() {
  const { jobs, loading, error, createJob } = useJobs()
  const { applications } = useApplications()
  const [filter, setFilter] = useState('All')
  const [selectedJob, setSelectedJob] = useState(null)
  const [showModal, setShowModal] = useState(false)

  const appCounts = {}
  applications.forEach(app => {
    if (!appCounts[app.job_id]) appCounts[app.job_id] = { applied: 0, shortlisted: 0, interviewed: 0 }
    appCounts[app.job_id].applied += 1
    if (app.stage === 'screening' || app.stage === 'shortlisted') appCounts[app.job_id].shortlisted += 1
    if (app.stage === 'interview') appCounts[app.job_id].interviewed += 1
  })

  const filtered = filter === 'All' ? jobs : jobs.filter(j => j.status?.toLowerCase() === filter.toLowerCase())

  const openCount = jobs.filter(j => j.status === 'open').length
  const filledCount = jobs.filter(j => j.status === 'filled').length

  return (
    <div style={s.page}>
      <TopBar
        title="Job Postings"
        action={{ label: '+ Post Job', onClick: () => setShowModal(true) }}
      />
      <div style={s.content}>
        {error && <div style={s.error}>{error}</div>}

        <div style={s.statsRow}>
          <StatCard label="Open Roles" value={openCount} color="#22c55e" />
          <StatCard label="Filled" value={filledCount} color="#3b82f6" />
          <StatCard label="Total Applicants" value={applications.length} />
        </div>

        <div style={s.pillRow}>
          {FILTERS.map(f => (
            <button key={f} style={s.pill(filter === f)} onClick={() => setFilter(f)}>{f}</button>
          ))}
        </div>

        {loading ? (
          <div style={s.loading}>Loading jobs…</div>
        ) : filtered.length === 0 ? (
          <div style={{ color: '#6b7280', fontSize: '14px', textAlign: 'center', padding: '48px' }}>
            No jobs found.
          </div>
        ) : (
          filtered.map(job => (
            <JobCard
              key={job.id}
              job={job}
              appCounts={appCounts}
              onClick={() => setSelectedJob(job)}
            />
          ))
        )}
      </div>

      {selectedJob && <Drawer job={selectedJob} onClose={() => setSelectedJob(null)} />}
      {showModal && <PostJobModal onClose={() => setShowModal(false)} onSubmit={createJob} />}
    </div>
  )
}
