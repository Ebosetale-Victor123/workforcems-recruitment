import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { MapPin, Briefcase, CheckCircle } from 'lucide-react'
import { extractTextFromPDF } from '../lib/pdfExtract'
import { anonymiseCVText } from '../lib/anonymise'

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
  trackHeaderBtn: {
    background: 'transparent', border: '1px solid #2a2a2a', color: '#ffffff',
    borderRadius: '8px', padding: '10px 20px', fontSize: '14px',
    cursor: 'pointer', fontFamily: 'inherit',
  },
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
  fieldError: { color: '#ef4444', fontSize: '12px', marginTop: '4px' },
  requiredMark: { color: '#ef4444', marginLeft: '2px' },

  successOverlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
    zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  successModal: {
    background: '#141414', border: '1px solid #22c55e',
    borderRadius: '16px', padding: '40px', width: '480px',
    position: 'fixed', top: '50%', left: '50%',
    transform: 'translate(-50%, -50%)', textAlign: 'center',
  },
  successIconWrap: {
    width: '64px', height: '64px', borderRadius: '50%',
    background: 'rgba(34,197,94,0.15)', border: '2px solid #22c55e',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto 20px',
  },
  successHeading: { fontSize: '24px', fontWeight: '700', color: '#ffffff', marginBottom: '8px' },
  successSub: { fontSize: '14px', color: '#9ca3af', marginBottom: '32px' },
  refBox: {
    background: '#0a0a0a', border: '1px solid #22c55e',
    borderRadius: '12px', padding: '24px', marginBottom: '12px',
  },
  refLabel: { fontSize: '11px', color: '#6b7280', letterSpacing: '0.1em', marginBottom: '8px' },
  refCode: {
    fontSize: '36px', fontWeight: '800', color: '#22c55e',
    letterSpacing: '0.05em', fontFamily: 'monospace',
  },
  warnBox: {
    fontSize: '13px', color: '#f59e0b', marginBottom: '24px',
    background: 'rgba(245,158,11,0.1)', borderRadius: '8px',
    padding: '12px', border: '1px solid rgba(245,158,11,0.2)',
  },
  copyRefBtn: {
    width: '100%', background: '#22c55e', color: '#000000', border: 'none',
    borderRadius: '8px', padding: '12px', fontWeight: '600',
    marginBottom: '12px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '14px',
  },
  closeSuccessBtn: {
    width: '100%', background: 'transparent', border: '1px solid #2a2a2a',
    color: '#9ca3af', borderRadius: '8px', padding: '12px',
    cursor: 'pointer', fontFamily: 'inherit', fontSize: '14px',
  },

  trackModal: {
    background: '#141414', border: '1px solid #2a2a2a',
    borderRadius: '16px', padding: '32px', width: '440px',
    position: 'fixed', top: '50%', left: '50%',
    transform: 'translate(-50%, -50%)', zIndex: 9999,
  },
  trackHeading: { fontSize: '20px', fontWeight: '700', color: '#ffffff', paddingRight: '32px' },
  trackSub: { fontSize: '14px', color: '#9ca3af', marginBottom: '24px', marginTop: '4px' },
  trackInput: {
    background: '#1a1a1a', border: '1px solid #2a2a2a',
    borderRadius: '8px', padding: '12px 16px', color: '#ffffff',
    width: '100%', fontSize: '15px', textTransform: 'uppercase',
    letterSpacing: '0.05em', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
  },
  trackBtn: {
    width: '100%', background: '#22c55e', color: '#000000', border: 'none',
    borderRadius: '8px', padding: '13px', fontWeight: '700',
    marginTop: '12px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '14px',
  },
  trackResultCard: {
    background: '#0a0a0a', border: '1px solid #2a2a2a',
    borderRadius: '12px', padding: '20px', marginTop: '16px',
  },
  trackRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '8px 0', fontSize: '13px',
  },
  trackRowLabel: { color: '#9ca3af' },
  trackRowValue: { color: '#ffffff', fontWeight: '600' },
  trackErrorCard: {
    background: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444',
    borderRadius: '8px', padding: '16px', color: '#ef4444',
    textAlign: 'center', marginTop: '16px', fontSize: '13px',
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
  candidate_age: '', candidate_gender: '',
  years_experience: '', candidate_school: '',
  cv_text: '', skills: '',
}

const REQUIRED_LABELS = {
  candidate_name: 'Full Name',
  candidate_email: 'Email Address',
  candidate_phone: 'Phone Number',
  candidate_age: 'Age',
  years_experience: 'Years of Experience',
  candidate_school: 'University / School',
}

function ApplyModal({ job, onClose, onSuccess }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [cvMode, setCvMode] = useState('text') // 'text' | 'pdf'
  const [pdfFile, setPdfFile] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [formErr, setFormErr] = useState(null)
  const [fieldErrors, setFieldErrors] = useState({})

  const set = (k) => (e) => {
    setForm(f => ({ ...f, [k]: e.target.value }))
    setFieldErrors(fe => (fe[k] ? { ...fe, [k]: undefined } : fe))
  }

  const handlePdfFile = (file) => {
    if (!file || file.type !== 'application/pdf') return
    setPdfFile(file)
    setFieldErrors(fe => (fe.cv ? { ...fe, cv: undefined } : fe))
  }

  const validate = () => {
    const errors = {}
    if (!form.candidate_name.trim()) errors.candidate_name = 'Required'
    if (!form.candidate_email.trim()) errors.candidate_email = 'Required'
    if (!form.candidate_phone.trim()) errors.candidate_phone = 'Required'
    if (!form.candidate_age) errors.candidate_age = 'Required'
    if (!form.years_experience) errors.years_experience = 'Required'
    if (!form.candidate_gender) errors.candidate_gender = 'Required'
    if (!form.skills.trim()) errors.skills = 'Required'
    if (cvMode === 'text' && !form.cv_text.trim()) errors.cv = 'Please paste your CV text'
    if (cvMode === 'pdf' && !pdfFile) errors.cv = 'Please upload your CV PDF'
    return errors
  }

  const handleSubmit = async () => {
    const errors = validate()
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }
    setSubmitting(true)
    setFormErr(null)

    // Step 1 — Get raw CV text
    let rawCVText = ''
    if (cvMode === 'pdf' && pdfFile) {
      try {
        rawCVText = await extractTextFromPDF(pdfFile)
      } catch (err) {
        setFieldErrors({ cv: err.message })
        setSubmitting(false)
        return
      }
    } else {
      rawCVText = form.cv_text.trim()
    }

    if (!rawCVText) {
      setFieldErrors({ cv: 'Please provide your CV' })
      setSubmitting(false)
      return
    }

    // Step 2 — Anonymise the CV
    const nameParts = form.candidate_name.trim().split(' ')
    const firstName = nameParts[0] || ''
    const lastName = nameParts.slice(1).join(' ') || ''
    const anonymisedCV = anonymiseCVText(rawCVText, firstName, lastName)

    // Step 3 — Upload PDF to Supabase Storage if a file was provided
    let cv_file_url = null
    if (pdfFile) {
      const safeFileName = pdfFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')
      const filePath = `candidates/${Date.now()}_${safeFileName}`

      const { error: uploadError } = await supabase
        .storage
        .from('cv-uploads')
        .upload(filePath, pdfFile, { upsert: true })

      if (!uploadError) {
        const { data: urlData } = supabase
          .storage
          .from('cv-uploads')
          .getPublicUrl(filePath)
        cv_file_url = urlData.publicUrl
      }
    }

    // Step 4 — Insert into applications
    const ref = genRef()
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
      cv_text: anonymisedCV,   // anonymised — what the AI reads
      original_cv: rawCVText,  // original — shown when blind OFF
      cv_file_url,             // PDF download URL
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
    onSuccess(ref, job.title)
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
          ['candidate_name', 'text'],
          ['candidate_email', 'email'],
          ['candidate_phone', 'text'],
          ['candidate_age', 'number'],
          ['years_experience', 'number'],
          ['candidate_school', 'text'],
        ].map(([key, type]) => (
          <div key={key} style={s.formGroup}>
            <label style={s.label}>
              {REQUIRED_LABELS[key]}
              {key !== 'candidate_school' && <span style={s.requiredMark}>*</span>}
            </label>
            <input
              style={fieldErrors[key] ? { ...s.input, borderColor: '#ef4444' } : s.input}
              type={type}
              value={form[key]}
              onChange={set(key)}
            />
            {fieldErrors[key] && <div style={s.fieldError}>{fieldErrors[key]}</div>}
          </div>
        ))}

        <div style={s.formGroup}>
          <label style={s.label}>Gender<span style={s.requiredMark}>*</span></label>
          <select
            style={fieldErrors.candidate_gender ? { ...s.select, borderColor: '#ef4444' } : s.select}
            value={form.candidate_gender}
            onChange={set('candidate_gender')}
          >
            <option value="">Select Gender</option>
            <option>Male</option>
            <option>Female</option>
            <option>Non-binary</option>
            <option>Prefer not to say</option>
          </select>
          {fieldErrors.candidate_gender && <div style={s.fieldError}>{fieldErrors.candidate_gender}</div>}
        </div>

        <div style={s.formGroup}>
          <label style={s.label}>Upload your CV<span style={s.requiredMark}>*</span></label>
          <div style={s.cvToggleRow}>
            <button style={s.cvToggle(cvMode === 'text')} onClick={() => setCvMode('text')}>Paste CV Text</button>
            <button style={s.cvToggle(cvMode === 'pdf')} onClick={() => setCvMode('pdf')}>Upload PDF</button>
          </div>
          {cvMode === 'text' ? (
            <textarea
              style={fieldErrors.cv ? { ...s.textarea, borderColor: '#ef4444' } : s.textarea}
              placeholder="Paste your CV or cover letter here..."
              value={form.cv_text}
              onChange={set('cv_text')}
            />
          ) : (
            <div
              style={fieldErrors.cv ? { ...s.dropZone, borderColor: '#ef4444' } : s.dropZone}
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
          {fieldErrors.cv && <div style={s.fieldError}>{fieldErrors.cv}</div>}
        </div>

        <div style={s.formGroup}>
          <label style={s.label}>Skills<span style={s.requiredMark}>*</span></label>
          <input
            style={fieldErrors.skills ? { ...s.input, borderColor: '#ef4444' } : s.input}
            type="text"
            placeholder="e.g. React, Node.js, Python — comma separated"
            value={form.skills}
            onChange={set('skills')}
          />
          {fieldErrors.skills && <div style={s.fieldError}>{fieldErrors.skills}</div>}
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

function SuccessModal({ info, onClose }) {
  const [copied, setCopied] = useState(false)

  const copyRef = () => {
    navigator.clipboard.writeText(info.ref)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={s.successOverlay}>
      <div style={s.successModal}>
        <div style={s.successIconWrap}>
          <CheckCircle size={32} color="#22c55e" />
        </div>
        <div style={s.successHeading}>Application Submitted!</div>
        <div style={s.successSub}>Your application for {info.jobTitle} has been received.</div>

        <div style={s.refBox}>
          <div style={s.refLabel}>YOUR APPLICATION REFERENCE</div>
          <div style={s.refCode}>{info.ref}</div>
        </div>

        <div style={s.warnBox}>
          ⚠️ Save this reference code somewhere safe. You will need it to track your application status.
        </div>

        <button style={s.copyRefBtn} onClick={copyRef}>
          {copied ? 'Copied ✓' : 'Copy Reference'}
        </button>
        <button style={s.closeSuccessBtn} onClick={onClose}>Close</button>
      </div>
    </div>
  )
}

const STAGE_COLORS = {
  applied: '#9ca3af',
  screening: '#f97316',
  interview: '#3b82f6',
  offered: '#a855f7',
  hired: '#22c55e',
  rejected: '#ef4444',
}

function TrackingModal({ onClose }) {
  const [refInput, setRefInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [notFound, setNotFound] = useState(false)

  const handleTrack = async () => {
    const cleaned = refInput.toUpperCase().trim()
    if (!cleaned) return
    setLoading(true)
    setResult(null)
    setNotFound(false)

    const { data, error } = await supabase
      .from('applications')
      .select('application_reference, applicant_role, stage, blind_score, created_at, is_blinded')
      .eq('application_reference', cleaned)
      .single()

    setLoading(false)
    if (error || !data) {
      setNotFound(true)
    } else {
      setResult(data)
    }
  }

  return (
    <div style={s.overlay} onClick={onClose}>
      <div style={s.trackModal} onClick={e => e.stopPropagation()}>
        <button style={s.closeBtn} onClick={onClose}>×</button>
        <div style={s.trackHeading}>Track Your Application</div>
        <div style={s.trackSub}>Enter your reference code to check your status.</div>

        <input
          style={s.trackInput}
          placeholder="e.g. WMS-L3E5L6"
          value={refInput}
          onChange={e => setRefInput(e.target.value)}
        />
        <button style={s.trackBtn} onClick={handleTrack} disabled={loading}>
          {loading ? 'Checking…' : 'Track Status'}
        </button>

        {result && (
          <div style={s.trackResultCard}>
            <div style={s.trackRow}>
              <span style={s.trackRowLabel}>Role Applied For</span>
              <span style={s.trackRowValue}>{result.applicant_role || '—'}</span>
            </div>
            <div style={s.trackRow}>
              <span style={s.trackRowLabel}>Current Stage</span>
              <span style={{ ...s.trackRowValue, color: STAGE_COLORS[result.stage?.toLowerCase()] || '#9ca3af' }}>
                {result.stage ? result.stage.charAt(0).toUpperCase() + result.stage.slice(1) : '—'}
              </span>
            </div>
            <div style={s.trackRow}>
              <span style={s.trackRowLabel}>Date Applied</span>
              <span style={s.trackRowValue}>{formatDate(result.created_at)}</span>
            </div>
            <div style={s.trackRow}>
              <span style={s.trackRowLabel}>Blind Score</span>
              <span style={s.trackRowValue}>{result.blind_score != null ? result.blind_score : 'Pending screening'}</span>
            </div>
          </div>
        )}

        {notFound && (
          <div style={s.trackErrorCard}>No application found with that reference code.</div>
        )}
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
  const [successInfo, setSuccessInfo] = useState(null)
  const [trackModalOpen, setTrackModalOpen] = useState(false)

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

  const handleSuccess = (ref, jobTitle) => {
    setSelectedJob(null)
    setSuccessInfo({ ref, jobTitle })
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
        <button style={s.trackHeaderBtn} onClick={() => setTrackModalOpen(true)}>Track Application</button>
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

      {successInfo && (
        <SuccessModal info={successInfo} onClose={() => setSuccessInfo(null)} />
      )}

      {trackModalOpen && (
        <TrackingModal onClose={() => setTrackModalOpen(false)} />
      )}
    </div>
  )
}
