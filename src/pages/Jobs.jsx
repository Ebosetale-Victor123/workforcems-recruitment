import { useState } from 'react'
import { MapPin, Building2, Users, Star, UserCheck, Calendar, Trash2, Pencil } from 'lucide-react'
import TopBar from '../components/layout/TopBar'
import StatCard from '../components/ui/StatCard'
import { StatusBadge } from '../components/ui/Badge'
import { useJobs } from '../hooks/useJobs'
import { useApplications } from '../hooks/useApplications'

const FILTERS = ['All', 'Open', 'Closed', 'Filled', 'Draft']

const s = {
  page: { flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 },
  content: { padding: '32px', flex: 1, overflowY: 'auto' },
  statsRow: { display: 'flex', gap: '16px', marginBottom: '28px', flexWrap: 'wrap', alignItems: 'stretch' },
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
  statusRow: { display: 'flex', alignItems: 'center' },
  editIconBtn: {
    background: 'transparent', border: 'none', cursor: 'pointer',
    color: '#9ca3af', padding: '4px', display: 'inline-flex',
    alignItems: 'center', marginLeft: '8px', opacity: 0.7,
    transition: 'opacity 0.15s',
  },
  deleteIconBtn: {
    background: 'transparent', border: 'none', cursor: 'pointer',
    color: '#ef4444', padding: '4px', display: 'inline-flex',
    alignItems: 'center', marginLeft: '12px', opacity: 0.7,
    transition: 'opacity 0.15s',
  },
  deleteOverlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
    zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  deleteModal: {
    background: '#141414', border: '1px solid #2a2a2a',
    borderRadius: '12px', padding: '24px',
    position: 'fixed', top: '50%', left: '50%',
    transform: 'translate(-50%, -50%)', width: '360px', zIndex: 1001,
  },
  deleteIconWrap: { display: 'flex', justifyContent: 'center', marginBottom: '12px' },
  deleteHeading: { fontSize: '18px', fontWeight: '700', color: '#ffffff', textAlign: 'center' },
  deleteBody: { fontSize: '14px', color: '#9ca3af', textAlign: 'center', marginTop: '8px' },
  deleteActions: { display: 'flex', gap: '12px', marginTop: '20px' },
  deleteCancelBtn: {
    background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#ffffff',
    borderRadius: '8px', padding: '10px 20px', flex: 1, cursor: 'pointer',
  },
  deleteConfirmBtn: {
    background: '#ef4444', border: 'none', color: '#ffffff',
    borderRadius: '8px', padding: '10px 20px', flex: 1, fontWeight: '600', cursor: 'pointer',
  },
  deleteToast: {
    background: '#ef4444', color: '#ffffff',
    padding: '12px 20px', borderRadius: '8px',
    position: 'fixed', bottom: '24px', right: '24px',
    zIndex: 9999, fontWeight: '500',
  },
  successToast: {
    background: '#22c55e', color: '#000000',
    padding: '12px 20px', borderRadius: '8px',
    position: 'fixed', bottom: '24px', right: '24px',
    zIndex: 9999, fontWeight: '600',
  },
}

function isOverdue(date) {
  return date && new Date(date) < new Date()
}

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function JobCard({ job, appCounts = {}, onClick, onEditClick, onDeleteClick }) {
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
        <div style={s.statusRow}>
          <StatusBadge status={job.status} />
          <button
            type="button"
            style={s.editIconBtn}
            onClick={e => { e.stopPropagation(); onEditClick(job) }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.color = '#ffffff' }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '0.7'; e.currentTarget.style.color = '#9ca3af' }}
          >
            <Pencil size={16} />
          </button>
          <button
            type="button"
            style={s.deleteIconBtn}
            onClick={e => { e.stopPropagation(); onDeleteClick(job) }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '1' }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '0.7' }}
          >
            <Trash2 size={16} />
          </button>
        </div>
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

function DeleteJobModal({ job, onCancel, onConfirm }) {
  return (
    <div style={s.deleteOverlay} onClick={onCancel}>
      <div style={s.deleteModal} onClick={e => e.stopPropagation()}>
        <div style={s.deleteIconWrap}>
          <Trash2 size={24} color="#ef4444" />
        </div>
        <div style={s.deleteHeading}>Delete Job Posting?</div>
        <div style={s.deleteBody}>
          This will permanently delete '{job.title}' and cannot be undone. Existing applications for this role will not be deleted.
        </div>
        <div style={s.deleteActions}>
          <button type="button" style={s.deleteCancelBtn} onClick={onCancel}>Cancel</button>
          <button type="button" style={s.deleteConfirmBtn} onClick={() => onConfirm(job)}>Delete Job</button>
        </div>
      </div>
    </div>
  )
}

function EditJobModal({ form, setForm, onClose, onSubmit }) {
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState(null)

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const submit = async () => {
    if (!form.title.trim()) { setErr('Job title is required.'); return }
    if (!form.department.trim()) { setErr('Department is required.'); return }
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
        <div style={s.modalTitle}>Edit Job</div>
        {err && <div style={{ ...s.error, marginBottom: '16px' }}>{err}</div>}
        {[
          ['title', 'Job Title *', 'input'],
          ['department', 'Department *', 'input'],
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
        <div style={s.formGroup}>
          <label style={s.label}>Status</label>
          <select style={s.input} value={form.status} onChange={set('status')}>
            <option value="open">open</option>
            <option value="closed">closed</option>
            <option value="filled">filled</option>
            <option value="draft">draft</option>
          </select>
        </div>
        <div style={s.btnRow}>
          <button type="button" style={s.cancelBtn} onClick={onClose}>Cancel</button>
          <button type="button" style={s.primaryBtn} onClick={submit} disabled={saving}>
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
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
  const { jobs, loading, error, createJob, deleteJob, updateJob } = useJobs()
  const { applications } = useApplications()
  const [filter, setFilter] = useState('All')
  const [selectedJob, setSelectedJob] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [jobToDelete, setJobToDelete] = useState(null)
  const [toast, setToast] = useState(null)
  const [jobToEdit, setJobToEdit] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [successToast, setSuccessToast] = useState(null)

  const handleConfirmDelete = async (job) => {
    await deleteJob(job.id)
    setJobToDelete(null)
    setToast('Job posting deleted')
    setTimeout(() => setToast(null), 3000)
  }

  const handleEditClick = (job) => {
    setJobToEdit(job)
    setEditForm({
      title: job.title || '',
      department: job.department || '',
      location: job.location || '',
      employment_type: job.employment_type || job.type || 'full-time',
      salary_range: job.salary_range || '',
      closing_date: job.closing_date || '',
      description: job.description || '',
      requirements: job.requirements || '',
      status: job.status || 'open',
    })
  }

  const handleUpdateJob = async (form) => {
    const updates = {
      title: form.title,
      department: form.department,
      location: form.location,
      employment_type: form.employment_type,
      salary_range: form.salary_range,
      closing_date: form.closing_date || null,
      description: form.description,
      requirements: form.requirements,
      status: form.status,
      type: form.employment_type,
    }
    const { error: err } = await updateJob(jobToEdit.id, updates)
    if (err) throw new Error(err.message)
    setJobToEdit(null)
    setSuccessToast('Job updated successfully')
    setTimeout(() => setSuccessToast(null), 3000)
  }

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
              onEditClick={handleEditClick}
              onDeleteClick={setJobToDelete}
            />
          ))
        )}
      </div>

      {selectedJob && <Drawer job={selectedJob} onClose={() => setSelectedJob(null)} />}
      {showModal && <PostJobModal onClose={() => setShowModal(false)} onSubmit={createJob} />}
      {jobToEdit && (
        <EditJobModal
          form={editForm}
          setForm={setEditForm}
          onClose={() => setJobToEdit(null)}
          onSubmit={handleUpdateJob}
        />
      )}
      {jobToDelete && (
        <DeleteJobModal
          job={jobToDelete}
          onCancel={() => setJobToDelete(null)}
          onConfirm={handleConfirmDelete}
        />
      )}
      {toast && <div style={s.deleteToast}>{toast}</div>}
      {successToast && <div style={s.successToast}>{successToast}</div>}
    </div>
  )
}
