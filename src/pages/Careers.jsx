import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { MapPin, Briefcase } from 'lucide-react'

const s = {
  page: { minHeight: '100vh', background: '#000000', color: '#ffffff', fontFamily: 'system-ui, -apple-system, sans-serif' },
  header: {
    background: '#0a0a0a', padding: '20px 40px',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    borderBottom: '1px solid #1a1a1a',
  },
  headerLeft: { display: 'flex', alignItems: 'center', gap: '12px' },
  headerBrand: { display: 'flex', flexDirection: 'column' },
  brandName: { fontSize: '16px', fontWeight: '700', color: '#ffffff', lineHeight: 1.2 },
  brandSub: { fontSize: '12px', color: '#22c55e', lineHeight: 1.2 },
  hero: { padding: '60px 40px 40px', maxWidth: '900px', margin: '0 auto' },
  heroTitle: { fontSize: '48px', fontWeight: '700', color: '#ffffff', marginBottom: '12px', lineHeight: 1.1 },
  heroSub: { fontSize: '18px', color: '#9ca3af' },
  jobsSection: { padding: '0 40px 60px', maxWidth: '900px', margin: '0 auto' },
  jobCard: {
    background: '#141414', border: '1px solid #2a2a2a',
    borderRadius: '12px', padding: '24px', marginBottom: '16px',
    transition: 'border-color 0.15s',
  },
  jobCardTop: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' },
  jobTitle: { fontSize: '18px', fontWeight: '700', color: '#ffffff' },
  applyBtn: {
    background: '#22c55e', color: '#000000', border: 'none',
    borderRadius: '8px', padding: '10px 20px', fontWeight: '600',
    fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit',
    flexShrink: 0,
  },
  jobMeta: { display: 'flex', alignItems: 'center', gap: '16px', color: '#9ca3af', fontSize: '14px', marginBottom: '10px' },
  metaItem: { display: 'flex', alignItems: 'center', gap: '5px' },
  pillRow: { display: 'flex', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' },
  pill: {
    border: '1px solid #2a2a2a', borderRadius: '4px',
    padding: '3px 10px', color: '#9ca3af', fontSize: '12px', background: 'transparent',
  },
  closingDate: { fontSize: '13px', color: '#9ca3af' },
  empty: { textAlign: 'center', color: '#9ca3af', padding: '60px 0', fontSize: '16px' },
  loading: { textAlign: 'center', color: '#9ca3af', padding: '60px 0' },
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
    zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  modal: {
    background: '#141414', border: '1px solid #2a2a2a',
    borderRadius: '16px', padding: '32px', width: '560px',
    maxHeight: '80vh', overflowY: 'auto',
    position: 'relative',
  },
  modalTitle: { fontSize: '20px', fontWeight: '700', color: '#ffffff', marginBottom: '24px', paddingRight: '32px' },
  closeBtn: {
    position: 'absolute', top: '24px', right: '24px',
    background: 'transparent', border: 'none', color: '#9ca3af',
    fontSize: '22px', cursor: 'pointer', lineHeight: 1,
  },
  formGroup: { marginBottom: '16px' },
  label: { display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '6px' },
  input: {
    width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a',
    borderRadius: '8px', padding: '12px', color: '#ffffff', fontSize: '14px',
    fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
  },
  select: {
    width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a',
    borderRadius: '8px', padding: '12px', color: '#ffffff', fontSize: '14px',
    fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', appearance: 'none',
  },
  textarea: {
    width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a',
    borderRadius: '8px', padding: '12px', color: '#ffffff', fontSize: '14px',
    fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
    minHeight: '120px', resize: 'vertical', lineHeight: '1.5',
  },
  cvToggleRow: { display: 'flex', gap: '8px', marginBottom: '12px' },
  cvToggle: (active) => ({
    padding: '8px 16px', fontSize: '13px', cursor: 'pointer', borderRadius: '6px',
    fontFamily: 'inherit', border: '1px solid #2a2a2a',
    background: active ? '#ffffff' : 'transparent',
    color: active ? '#000000' : '#9ca3af',
    fontWeight: active ? '600' : '400',
  }),
  dropZone: {
    border: '2px dashed #2a2a2a', borderRadius: '8px', padding: '20px',
    textAlign: 'center', color: '#9ca3af', cursor: 'pointer',
    background: '#0d0d0d',
  },
  blindNotice: {
    background: '#1a1a1a', borderLeft: '3px solid #22c55e',
    padding: '12px', borderRadius: '4px', marginBottom: '16px',
    fontSize: '13px', color: '#9ca3af', lineHeight: '1.5',
  },
  submitBtn: {
    width: '100%', background: '#22c55e', color: '#000000',
    border: 'none', borderRadius: '8px', padding: '14px',
    fontWeight: '700', fontSize: '15px', cursor: 'pointer', fontFamily: 'inherit',
  },
  submitBtnDisabled: {
    width: '100%', background: '#1a3d28', color: '#4a7a5a',
    border: 'none', borderRadius: '8px', padding: '14px',
    fontWeight: '700', fontSize: '15px', cursor: 'not-allowed', fontFamily: 'inherit',
  },
  formError: { fontSize: '13px', color: '#ef4444', marginBottom: '12px' },
  toast: {
    position: 'fixed', bottom: '24px', right: '24px',
    background: '#22c55e', color: '#000000',
    padding: '16px 24px', borderRadius: '8px',
    fontWeight: '600', fontSize: '14px', zIndex: 9999,
    boxShadow: '0 4px 20px rgba(34,197,94,0.4)',
  },
}

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function genRef() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = 'WMS-'
  for (let i = 0; i < 6; i++) result += chars[Math.floor(Math.random() * chars.length)]
  return result
}

const EMPTY_FORM = {
  candidate_name: '', candidate_email: '', candidate_phone: '',
  candidate_age: '', candidate_gender: 'Prefer not to say',
  years_experience: '', candidate_school: '',
  cv_text: '', skills: '',
}

function ApplyModal({ job, onClose, onSuccess }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [cvMode, setCvMode] = useState('text') // 'text' | 'pdf'
  const [pdfFile, setPdfFile] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [formErr, setFormErr] = useState(null)

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handlePdfFile = (file) => {
    if (!file || file.type !== 'application/pdf') return
    setPdfFile(file)
  }

  const handleSubmit = async () => {
    if (!form.candidate_name.trim()) { setFormErr('Full name is required.'); return }
    if (!form.candidate_email.trim()) { setFormErr('Email is required.'); return }
    setSubmitting(true)
    setFormErr(null)

    const ref = genRef()
    let cv_text = null
    let cv_file_url = null

    if (cvMode === 'pdf' && pdfFile) {
      // Store PDF as base64 in cv_file_url, note in cv_text
      const reader = new FileReader()
      const base64 = await new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result)
        reader.onerror = reject
        reader.readAsDataURL(pdfFile)
      })
      cv_file_url = base64
      cv_text = 'PDF uploaded — see cv_file_url'
    } else {
      cv_text = form.cv_text || null
    }

    const skills = form.skills
      ? form.skills.split(',').map(s => s.trim()).filter(Boolean)
      : []

    const payload = {
      job_id: job.id,
      applicant_role: job.title,
      candidate_name: form.candidate_name,
      candidate_email: form.candidate_email,
      candidate_phone: form.candidate_phone || null,
      candidate_age: form.candidate_age ? parseInt(form.candidate_age) : null,
      candidate_gender: form.candidate_gender,
      years_experience: form.years_experience ? parseInt(form.years_experience) : null,
      candidate_school: form.candidate_school || null,
      cv_text,
      cv_file_url,
      skills,
      is_blinded: true,
      source: 'careers_portal',
      stage: 'applied',
      application_reference: ref,
    }

    const { error } = await supabase.from('applications').insert([payload])
    if (error) {
      setFormErr(error.message)
      setSubmitting(false)
      return
    }

    setSubmitting(false)
    onSuccess(ref)
  }

  return (
    <div style={s.overlay} onClick={onClose}>
      <div style={s.modal} onClick={e => e.stopPropagation()}>
        <button style={s.closeBtn} onClick={onClose}>×</button>
        <div style={s.modalTitle}>Apply for {job.title}</div>

        <div style={s.blindNotice}>
          🔒 Your application will be anonymised. Your name, contact details, and school will be hidden from recruiters during screening.
        </div>

        {formErr && <div style={s.formError}>{formErr}</div>}

        {[
          ['candidate_name', 'Full Name *', 'text'],
          ['candidate_email', 'Email Address *', 'email'],
          ['candidate_phone', 'Phone Number', 'text'],
          ['candidate_age', 'Age', 'number'],
          ['years_experience', 'Years of Experience', 'number'],
          ['candidate_school', 'University / School', 'text'],
        ].map(([key, lbl, type]) => (
          <div key={key} style={s.formGroup}>
            <label style={s.label}>{lbl}</label>
            <input style={s.input} type={type} value={form[key]} onChange={set(key)} />
          </div>
        ))}

        <div style={s.formGroup}>
          <label style={s.label}>Gender</label>
          <select style={s.select} value={form.candidate_gender} onChange={set('candidate_gender')}>
            <option>Prefer not to say</option>
            <option>Male</option>
            <option>Female</option>
            <option>Non-binary</option>
          </select>
        </div>

        <div style={s.formGroup}>
          <label style={s.label}>Upload your CV</label>
          <div style={s.cvToggleRow}>
            <button style={s.cvToggle(cvMode === 'text')} onClick={() => setCvMode('text')}>Paste CV Text</button>
            <button style={s.cvToggle(cvMode === 'pdf')} onClick={() => setCvMode('pdf')}>Upload PDF</button>
          </div>
          {cvMode === 'text' ? (
            <textarea
              style={s.textarea}
              placeholder="Paste your CV or cover letter here..."
              value={form.cv_text}
              onChange={set('cv_text')}
            />
          ) : (
            <div
              style={s.dropZone}
              onClick={() => document.getElementById('careers-pdf-input').click()}
            >
              <input
                id="careers-pdf-input"
                type="file"
                accept=".pdf"
                style={{ display: 'none' }}
                onChange={e => handlePdfFile(e.target.files[0])}
              />
              {pdfFile ? (
                <>
                  <div style={{ color: '#22c55e', fontWeight: '500', marginBottom: '2px' }}>{pdfFile.name}</div>
                  <div style={{ fontSize: '12px', color: '#9ca3af' }}>Click to change</div>
                </>
              ) : (
                <>
                  <div>Click to browse or drop PDF here</div>
                  <div style={{ fontSize: '12px', marginTop: '4px', color: '#6b7280' }}>.pdf files only</div>
                </>
              )}
            </div>
          )}
        </div>

        <div style={s.formGroup}>
          <label style={s.label}>Skills</label>
          <input
            style={s.input}
            type="text"
            placeholder="e.g. React, Node.js, Python — comma separated"
            value={form.skills}
            onChange={set('skills')}
          />
        </div>

        <button
          style={submitting ? s.submitBtnDisabled : s.submitBtn}
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? 'Submitting…' : 'Submit Application'}
        </button>
      </div>
    </div>
  )
}

function JobCard({ job, onApply }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      style={{ ...s.jobCard, borderColor: hovered ? '#3a3a3a' : '#2a2a2a' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={s.jobCardTop}>
        <div style={s.jobTitle}>{job.title}</div>
        <button style={s.applyBtn} onClick={() => onApply(job)}>Apply Now</button>
      </div>
      <div style={s.jobMeta}>
        {job.department && (
          <span style={s.metaItem}><Briefcase size={14} />{job.department}</span>
        )}
        {job.location && (
          <span style={s.metaItem}><MapPin size={14} />{job.location}</span>
        )}
      </div>
      <div style={s.pillRow}>
        {job.employment_type && <span style={s.pill}>{job.employment_type}</span>}
        {job.salary_range && <span style={s.pill}>{job.salary_range}</span>}
      </div>
      {job.closing_date && (
        <div style={s.closingDate}>Closes: {formatDate(job.closing_date)}</div>
      )}
    </div>
  )
}

export default function Careers() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedJob, setSelectedJob] = useState(null)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    supabase
      .from('jobs')
      .select('*')
      .eq('status', 'open')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setJobs(data || [])
        setLoading(false)
      })
  }, [])

  const handleSuccess = (ref) => {
    setSelectedJob(null)
    setToast(`Application submitted! Your reference is ${ref}`)
    setTimeout(() => setToast(null), 5000)
  }

  return (
    <div style={s.page}>
      <header style={s.header}>
        <div style={s.headerLeft}>
          <img src="/WOMS PNG.png" alt="WorkforceMS" style={{ height: '36px', borderRadius: '6px', objectFit: 'contain' }} />
          <div style={s.headerBrand}>
            <span style={s.brandName}>WorkforceMS</span>
            <span style={s.brandSub}>Recruitment</span>
          </div>
        </div>
      </header>

      <div style={s.hero}>
        <h1 style={s.heroTitle}>Find Your Next Opportunity</h1>
        <p style={s.heroSub}>Join a company that values skill over everything else.</p>
      </div>

      <div style={s.jobsSection}>
        {loading ? (
          <div style={s.loading}>Loading open positions…</div>
        ) : jobs.length === 0 ? (
          <div style={s.empty}>No open positions at the moment. Check back soon.</div>
        ) : (
          jobs.map(job => (
            <JobCard key={job.id} job={job} onApply={setSelectedJob} />
          ))
        )}
      </div>

      {selectedJob && (
        <ApplyModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
          onSuccess={handleSuccess}
        />
      )}

      {toast && <div style={s.toast}>{toast}</div>}
    </div>
  )
}
