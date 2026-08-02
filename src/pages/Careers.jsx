import { useState, useEffect, useRef, Fragment } from 'react'
import { supabase } from '../lib/supabase'
import { MapPin, Briefcase, CheckCircle, ShieldCheck } from 'lucide-react'
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
  jobCardTop: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' },
  jobTitle: { fontSize: '18px', fontWeight: '700', color: '#ffffff' },
  applyBtn: {
    background: '#22c55e', color: '#000000', border: 'none',
    borderRadius: '8px', padding: '10px 20px', fontWeight: '600',
    fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0,
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
    maxHeight: '88vh', overflowY: 'auto', position: 'relative',
  },
  modalTitle: { fontSize: '20px', fontWeight: '700', color: '#ffffff', marginBottom: '20px', paddingRight: '32px' },
  closeBtn: {
    position: 'absolute', top: '24px', right: '24px',
    background: 'transparent', border: 'none', color: '#9ca3af',
    fontSize: '22px', cursor: 'pointer', lineHeight: 1,
  },
  formGroup: { marginBottom: '16px' },
  label: { display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '6px' },
  textarea: {
    width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a',
    borderRadius: '8px', padding: '12px', color: '#ffffff', fontSize: '14px',
    fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
    minHeight: '120px', resize: 'vertical', lineHeight: '1.5',
  },
  blindNotice: {
    background: 'rgba(34,197,94,0.05)', borderLeft: '3px solid #22c55e',
    padding: '12px', borderRadius: '4px', marginBottom: '16px',
    fontSize: '13px', color: '#9ca3af', lineHeight: '1.5',
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
  successSub: { fontSize: '14px', color: '#9ca3af', marginBottom: '16px' },
  refBox: {
    background: '#0a0a0a', border: '1px solid #22c55e',
    borderRadius: '12px', padding: '24px', marginBottom: '12px',
  },
  refLabel: { fontSize: '11px', color: '#6b7280', letterSpacing: '0.1em', marginBottom: '8px' },
  refCode: { fontSize: '36px', fontWeight: '800', color: '#22c55e', letterSpacing: '0.05em', fontFamily: 'monospace' },
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
    borderRadius: '16px', padding: '32px', width: '480px',
    position: 'fixed', top: '50%', left: '50%',
    transform: 'translate(-50%, -50%)', zIndex: 9999, maxHeight: '90vh', overflowY: 'auto',
  },
  trackHeading: { fontSize: '20px', fontWeight: '700', color: '#ffffff', paddingRight: '32px' },
  trackSub: { fontSize: '14px', color: '#9ca3af', marginBottom: '20px', marginTop: '4px' },
  trackInput: {
    background: '#1a1a1a', border: '1px solid #2a2a2a',
    borderRadius: '8px', padding: '12px 16px', color: '#ffffff',
    width: '100%', fontSize: '14px',
    fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
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
    padding: '8px 0', fontSize: '13px', borderBottom: '1px solid #1a1a1a',
  },
  trackRowLabel: { color: '#9ca3af' },
  trackRowValue: { color: '#ffffff', fontWeight: '600' },
  trackErrorCard: {
    background: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444',
    borderRadius: '8px', padding: '16px', color: '#ef4444',
    textAlign: 'center', marginTop: '16px', fontSize: '13px',
  },
}

const STAGE_COLORS = {
  applied: '#9ca3af',
  screening: '#f97316',
  interview: '#3b82f6',
  offered: '#a855f7',
  hired: '#22c55e',
  rejected: '#ef4444',
}

const PIPELINE_STAGES = ['applied', 'screening', 'interview', 'offered', 'hired']

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

function genRef() {
  return 'WMS-' + Math.random().toString(36).substring(2, 8).toUpperCase()
}

function inputSty(hasError) {
  return {
    width: '100%', background: '#1a1a1a',
    border: `1px solid ${hasError ? '#ef4444' : '#2a2a2a'}`,
    borderRadius: '8px', padding: '12px', color: '#ffffff', fontSize: '14px',
    fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
  }
}

// ── Step indicator ──────────────────────────────────────────────────────────
function StepIndicator({ step }) {
  const labels = ['Personal Details', 'Your Experience', 'Review & Submit']
  return (
    <div style={{ marginBottom: '28px' }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {labels.map((_, i) => {
          const num = i + 1
          const completed = step > num
          const active = step === num
          return (
            <Fragment key={num}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 700,
                background: active ? '#22c55e' : 'transparent',
                border: `2px solid ${(completed || active) ? '#22c55e' : '#2a2a2a'}`,
                color: completed ? '#22c55e' : active ? '#000' : '#6b7280',
              }}>
                {completed ? '✓' : num}
              </div>
              {i < labels.length - 1 && (
                <div style={{ flex: 1, height: 2, background: completed ? '#22c55e' : '#2a2a2a' }} />
              )}
            </Fragment>
          )
        })}
      </div>
      <div style={{ display: 'flex', marginTop: '8px' }}>
        {labels.map((label, i) => (
          <span key={i} style={{
            flex: 1, fontSize: 11,
            color: step === i + 1 ? '#ffffff' : step > i + 1 ? '#22c55e' : '#6b7280',
            textAlign: i === 0 ? 'left' : i === labels.length - 1 ? 'right' : 'center',
          }}>
            {label}
          </span>
        ))}
      </div>
    </div>
  )
}

// ── Apply modal (3-step) ────────────────────────────────────────────────────
function ApplyModal({ job, onClose, onSuccess }) {
  const [step, setStep] = useState(1)

  // Step 1
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [age, setAge] = useState('')
  const [gender, setGender] = useState('')
  const [yearsExperience, setYearsExperience] = useState('')
  const [school, setSchool] = useState('')
  const [step1Errors, setStep1Errors] = useState({})

  // Step 2
  const [cvFile, setCvFile] = useState(null)
  const [cvText, setCvText] = useState('')
  const [skills, setSkills] = useState('')
  const [extracting, setExtracting] = useState(false)
  const [extractDone, setExtractDone] = useState(false)
  const [extractStatus, setExtractStatus] = useState('')
  const [fileError, setFileError] = useState('')
  const [step2Error, setStep2Error] = useState('')

  // Step 3
  const [consent, setConsent] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formErr, setFormErr] = useState(null)

  const fileInputRef = useRef(null)

  const validateStep1 = () => {
    const errors = {}
    if (!fullName.trim()) errors.fullName = 'Required'
    if (!email.trim()) errors.email = 'Required'
    else if (!/\S+@\S+\.\S+/.test(email)) errors.email = 'Invalid email address'
    if (!phone.trim()) errors.phone = 'Required'
    if (!age) errors.age = 'Required'
    if (!gender) errors.gender = 'Required'
    if (!yearsExperience) errors.yearsExperience = 'Required'
    else if (isNaN(Number(yearsExperience))) errors.yearsExperience = 'Must be a number'
    return errors
  }

  const handleNext = () => {
    if (step === 1) {
      const errors = validateStep1()
      if (Object.keys(errors).length > 0) { setStep1Errors(errors); return }
      setStep1Errors({})
      setStep(2)
    } else if (step === 2) {
      if (!cvFile && cvText.trim().length < 200) {
        setStep2Error('Please upload a CV or paste at least 200 characters')
        return
      }
      setStep2Error('')
      setStep(3)
    }
  }

  const handleFileChange = async (file) => {
    if (!file) return
    const ext = file.name.split('.').pop().toLowerCase()
    if (!['pdf', 'txt'].includes(ext)) {
      setFileError('Only .pdf and .txt files accepted')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setFileError('File must be under 5MB')
      return
    }
    setFileError('')
    setCvFile(file)

    if (ext === 'pdf') {
      setExtracting(true)
      setExtractStatus('Reading PDF...')
      try {
        const text = await extractTextFromPDF(file, (status) => {
          setExtractStatus(status)
        })
        setCvText(text)
        setExtractDone(true)
        setFileError('')
      } catch (err) {
        setFileError(err.message)
        setCvFile(null)
      } finally {
        setExtracting(false)
        setExtractStatus('')
      }
      return
    }

    if (ext === 'txt') {
      const reader = new FileReader()
      reader.onload = (e) => setCvText(e.target.result || '')
      reader.readAsText(file)
    }
  }

  const clearFile = (e) => {
    e.stopPropagation()
    setCvFile(null)
    setCvText('')
    setExtractDone(false)
    setExtractStatus('')
    setFileError('')
  }

  const handleSubmit = async () => {
    if (!consent) { setFormErr('Please confirm your consent before submitting.'); return }
    setSubmitting(true)
    setFormErr(null)

    const rawCVText = cvText.trim()
    const nameParts = fullName.trim().split(' ')
    const firstName = nameParts[0] || ''
    const lastName = nameParts.slice(1).join(' ') || ''
    const anonymisedCV = anonymiseCVText(rawCVText, firstName, lastName)

    let cv_file_url = null
    if (cvFile) {
      const safeFileName = cvFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')
      const filePath = `candidates/${Date.now()}_${safeFileName}`
      const { error: uploadError } = await supabase.storage.from('cv-uploads').upload(filePath, cvFile, { upsert: true })
      if (uploadError) {
        console.error('PDF upload error:', uploadError)
      } else {
        const { data: urlData } = supabase.storage.from('cv-uploads').getPublicUrl(filePath)
        cv_file_url = urlData.publicUrl
        console.log('PDF uploaded successfully:', cv_file_url)
      }
    }

    const reference = genRef()
    const { error } = await supabase.from('applications').insert([{
      job_id: job.id,
      candidate_name: fullName,
      candidate_email: email,
      candidate_phone: phone,
      candidate_age: parseInt(age),
      candidate_gender: gender,
      candidate_school: school || null,
      cv_text: anonymisedCV,
      original_cv: rawCVText,
      cv_file_url,
      skills: skills.split(',').map(sk => sk.trim()).filter(Boolean),
      years_experience: parseInt(yearsExperience),
      applicant_role: job.title,
      source: 'careers_portal',
      application_reference: reference,
      stage: 'applied',
      is_blinded: true,
    }])

    if (error) { setFormErr(error.message); setSubmitting(false); return }
    setSubmitting(false)
    onSuccess(reference, job.title)
  }

  const cvCharCount = cvText.trim().length

  const removeBtn = (
    <button type="button" onClick={clearFile} style={{
      marginTop: '8px', background: 'transparent', border: '1px solid #2a2a2a',
      color: '#9ca3af', borderRadius: '6px', padding: '4px 12px',
      fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit',
    }}>
      Remove
    </button>
  )

  return (
    <div style={s.overlay} onClick={onClose}>
      <div style={s.modal} onClick={e => e.stopPropagation()}>
        <button style={s.closeBtn} onClick={onClose}>×</button>
        <div style={s.modalTitle}>Apply for {job.title}</div>

        <StepIndicator step={step} />

        {/* ── STEP 1 ── */}
        {step === 1 && (
          <>
            {[
              { key: 'fullName', label: 'Full Name', val: fullName, set: setFullName, type: 'text' },
              { key: 'email', label: 'Email Address', val: email, set: setEmail, type: 'email' },
              { key: 'phone', label: 'Phone Number', val: phone, set: setPhone, type: 'text' },
              { key: 'age', label: 'Age', val: age, set: setAge, type: 'number' },
              { key: 'yearsExperience', label: 'Years of Experience', val: yearsExperience, set: setYearsExperience, type: 'number' },
            ].map(({ key, label, val, set, type }) => (
              <div key={key} style={s.formGroup}>
                <label style={s.label}>{label}<span style={s.requiredMark}>*</span></label>
                <input
                  style={inputSty(!!step1Errors[key])}
                  type={type}
                  value={val}
                  onChange={e => { set(e.target.value); setStep1Errors(prev => ({ ...prev, [key]: undefined })) }}
                />
                {step1Errors[key] && <div style={s.fieldError}>{step1Errors[key]}</div>}
              </div>
            ))}

            <div style={s.formGroup}>
              <label style={s.label}>Gender<span style={s.requiredMark}>*</span></label>
              <select
                style={inputSty(!!step1Errors.gender)}
                value={gender}
                onChange={e => { setGender(e.target.value); setStep1Errors(prev => ({ ...prev, gender: undefined })) }}
              >
                <option value="">Select Gender</option>
                <option>Male</option>
                <option>Female</option>
                <option>Non-binary</option>
                <option>Prefer not to say</option>
              </select>
              {step1Errors.gender && <div style={s.fieldError}>{step1Errors.gender}</div>}
            </div>

            <div style={s.formGroup}>
              <label style={s.label}>University / School <span style={{ color: '#6b7280', fontSize: '12px' }}>(optional)</span></label>
              <input style={inputSty(false)} type="text" value={school} onChange={e => setSchool(e.target.value)} />
            </div>
          </>
        )}

        {/* ── STEP 2 ── */}
        {step === 2 && (
          <>
            <div style={s.formGroup}>
              <label style={s.label}>
                Option A — Upload CV File{' '}
                <span style={{ color: '#6b7280', fontSize: '12px' }}>(.pdf or .txt, max 5MB)</span>
              </label>
              <div
                style={{
                  border: `2px dashed ${fileError ? '#ef4444' : '#2a2a2a'}`,
                  borderRadius: '8px', padding: '32px', textAlign: 'center',
                  color: '#6b7280', cursor: extracting ? 'default' : 'pointer', background: '#0d0d0d',
                }}
                onClick={() => !extracting && fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.txt"
                  style={{ display: 'none' }}
                  onChange={e => handleFileChange(e.target.files[0])}
                />
                {extracting ? (
                  <p style={{ fontSize: 13, color: '#22c55e', marginTop: 8, margin: 0 }}>
                    {extractStatus || 'Reading your CV...'}
                  </p>
                ) : cvFile && extractDone ? (
                  <>
                    <div style={{ color: '#22c55e', fontSize: '13px', fontWeight: '500', marginBottom: '4px' }}>
                      ✓ CV text extracted successfully
                    </div>
                    <div style={{ fontSize: '13px', color: '#9ca3af' }}>{cvFile.name} ({formatBytes(cvFile.size)})</div>
                    {removeBtn}
                  </>
                ) : cvFile ? (
                  <>
                    <div style={{ fontSize: '13px', color: '#9ca3af' }}>{cvFile.name} ({formatBytes(cvFile.size)})</div>
                    {removeBtn}
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: '14px', marginBottom: '4px' }}>Click to browse or drop file here</div>
                    <div style={{ fontSize: '12px' }}>.pdf and .txt files only</div>
                  </>
                )}
              </div>
              {fileError && <div style={s.fieldError}>{fileError}</div>}
            </div>

            <div style={s.formGroup}>
              <label style={s.label}>Or paste your CV below</label>
              <textarea
                style={{ ...s.textarea, minHeight: '200px', fontFamily: 'monospace', fontSize: '14px' }}
                placeholder="Paste your CV text here..."
                value={cvText}
                onChange={e => setCvText(e.target.value)}
              />
              <div style={{ marginTop: '4px', fontSize: '12px', color: cvCharCount >= 500 ? '#22c55e' : '#f59e0b' }}>
                {cvCharCount >= 500 ? '✓ Cv Extracted' : `${500 - cvCharCount} more characters needed`}
              </div>
            </div>

            {step2Error && <div style={{ ...s.fieldError, marginBottom: '12px' }}>{step2Error}</div>}

            <div style={s.formGroup}>
              <label style={s.label}>Skills <span style={{ color: '#6b7280', fontSize: '12px' }}>(comma separated)</span></label>
              <input
                style={inputSty(false)}
                type="text"
                placeholder="e.g. React, Node.js, Python"
                value={skills}
                onChange={e => setSkills(e.target.value)}
              />
            </div>

            <div style={s.blindNotice}>
              🔒 Your name, email, phone, and university will be automatically removed before any HR manager sees your application. You are scored on skill only.
            </div>
          </>
        )}

        {/* ── STEP 3 ── */}
        {step === 3 && (
          <>
            <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '10px', padding: '16px', marginBottom: '16px' }}>
              <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: '600', letterSpacing: '0.08em', marginBottom: '12px' }}>APPLICATION SUMMARY</div>
              {[
                ['Full Name', fullName],
                ['Email', email],
                ['Phone', phone],
                ['Years of Experience', yearsExperience],
                ['Role', job.title],
              ].map(([label, val], i, arr) => (
                <div key={label} style={{
                  display: 'flex', justifyContent: 'space-between', padding: '7px 0',
                  borderBottom: i < arr.length - 1 ? '1px solid #2a2a2a' : 'none', fontSize: '13px',
                }}>
                  <span style={{ color: '#9ca3af' }}>{label}</span>
                  <span style={{ color: '#ffffff', fontWeight: '500' }}>{val}</span>
                </div>
              ))}
            </div>

            {cvText && (
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '12px', color: '#6b7280', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>CV Preview</div>
                <div style={{ position: 'relative', background: '#0a0a0a', border: '1px solid #1f1f1f', borderRadius: '8px', padding: '12px', maxHeight: '80px', overflow: 'hidden' }}>
                  <p style={{ fontSize: '13px', color: '#9ca3af', margin: 0, lineHeight: 1.5 }}>
                    {cvText.slice(0, 200)}...
                  </p>
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '32px', background: 'linear-gradient(transparent, #0a0a0a)' }} />
                </div>
                <div style={{ fontSize: '11px', color: '#22c55e', marginTop: '4px' }}>anonymised before submission</div>
              </div>
            )}

            <div style={{ background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '8px', padding: '16px', marginBottom: '16px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <ShieldCheck size={20} color="#22c55e" style={{ flexShrink: 0, marginTop: '2px' }} />
              <p style={{ margin: 0, fontSize: '13px', color: '#9ca3af', lineHeight: 1.6 }}>
                On submission your name, email, phone, and university will be automatically stripped from your CV. The hiring team sees skills only.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '16px' }}>
              <input
                type="checkbox"
                id="apply-consent"
                checked={consent}
                onChange={e => setConsent(e.target.checked)}
                style={{ marginTop: '3px', accentColor: '#22c55e' }}
              />
              <label htmlFor="apply-consent" style={{ fontSize: '13px', color: '#9ca3af', cursor: 'pointer', lineHeight: 1.5 }}>
                I confirm this information is accurate and consent to WorkforceMS processing my application.
              </label>
            </div>

            {formErr && <div style={s.formError}>{formErr}</div>}
          </>
        )}

        {/* Navigation */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
          <button
            type="button"
            onClick={step === 1 ? onClose : () => setStep(prev => prev - 1)}
            style={{
              flexShrink: 0, background: 'transparent', border: '1px solid #2a2a2a',
              color: '#9ca3af', borderRadius: '8px', padding: '12px 20px',
              fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            {step === 1 ? 'Cancel' : 'Back'}
          </button>
          <button
            type="button"
            onClick={step === 3 ? handleSubmit : handleNext}
            disabled={submitting}
            style={{
              flex: 1,
              background: submitting ? '#1a3d28' : step === 3 ? '#22c55e' : '#ffffff',
              color: submitting ? '#4a7a5a' : step === 3 ? '#000000' : '#000000',
              border: 'none', borderRadius: '8px', padding: '12px',
              fontWeight: '700', fontSize: '14px',
              cursor: submitting ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
            }}
          >
            {step === 3 ? (submitting ? 'Submitting…' : 'Submit Application') : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Success modal ───────────────────────────────────────────────────────────
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

        <div style={{ fontSize: '13px', color: '#22c55e', marginBottom: '20px', lineHeight: 1.5 }}>
          Your personal details have been automatically removed. The hiring team will evaluate you on skills only.
        </div>

        <div style={s.refBox}>
          <div style={s.refLabel}>YOUR APPLICATION REFERENCE</div>
          <div style={s.refCode}>{info.ref}</div>
        </div>

        <div style={s.warnBox}>
          ⚠️ Save this reference code somewhere safe. You will need it to track your application status.
        </div>

        <button style={s.copyRefBtn} onClick={copyRef}>{copied ? 'Copied ✓' : 'Copy Reference'}</button>
        <button style={s.closeSuccessBtn} onClick={onClose}>Close</button>
      </div>
    </div>
  )
}

// ── Tracking modal (ref + email, pipeline UI) ───────────────────────────────
function TrackingModal({ onClose }) {
  const [trackRef, setTrackRef] = useState('')
  const [trackEmail, setTrackEmail] = useState('')
  const [trackResult, setTrackResult] = useState(null)
  const [trackSearched, setTrackSearched] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleTrack = async () => {
    if (!trackRef.trim() || !trackEmail.trim()) return
    setLoading(true)
    setTrackResult(null)
    setTrackSearched(false)

    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .eq('application_reference', trackRef.trim().toUpperCase())
      .eq('candidate_email', trackEmail.trim().toLowerCase())
      .single()

    setLoading(false)
    setTrackSearched(true)
    if (error || !data) {
      setTrackResult(null)
    } else {
      setTrackResult(data)
    }
  }

  const stageKey = trackResult?.stage?.toLowerCase()
  const stageIndex = PIPELINE_STAGES.indexOf(stageKey)
  const isRejected = stageKey === 'rejected'

  return (
    <div style={s.overlay} onClick={onClose}>
      <div style={s.trackModal} onClick={e => e.stopPropagation()}>
        <button style={s.closeBtn} onClick={onClose}>×</button>
        <div style={s.trackHeading}>Track Your Application</div>
        <div style={s.trackSub}>Enter your reference and email to check your status.</div>

        <input
          style={{ ...s.trackInput, textTransform: 'uppercase', letterSpacing: '0.05em' }}
          placeholder="Reference e.g. WMS-L3E5L6"
          value={trackRef}
          onChange={e => setTrackRef(e.target.value)}
        />
        <input
          style={{ ...s.trackInput, marginTop: '10px' }}
          placeholder="Email address used when applying"
          value={trackEmail}
          onChange={e => setTrackEmail(e.target.value)}
          type="email"
        />
        <button style={s.trackBtn} onClick={handleTrack} disabled={loading}>
          {loading ? 'Checking…' : 'Track Status'}
        </button>

        {trackResult && !isRejected && (
          <div style={s.trackResultCard}>
            {/* Pipeline */}
            <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '20px' }}>
              {PIPELINE_STAGES.map((stage, i) => {
                const done = stageIndex > i
                const current = stageIndex === i
                return (
                  <Fragment key={stage}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 11, fontWeight: 700,
                        background: (done || current) ? '#22c55e' : 'transparent',
                        border: `2px solid ${(done || current) ? '#22c55e' : '#2a2a2a'}`,
                        color: (done || current) ? '#000' : '#6b7280',
                      }}>
                        {done ? '✓' : i + 1}
                      </div>
                      <span style={{ fontSize: 10, color: '#9ca3af', textTransform: 'capitalize', textAlign: 'center' }}>
                        {stage}
                      </span>
                    </div>
                    {i < PIPELINE_STAGES.length - 1 && (
                      <div style={{ flex: 1, height: 2, marginTop: '14px', background: done ? '#22c55e' : '#2a2a2a' }} />
                    )}
                  </Fragment>
                )
              })}
            </div>

            <div style={s.trackRow}>
              <span style={s.trackRowLabel}>Date Applied</span>
              <span style={s.trackRowValue}>{formatDate(trackResult.created_at)}</span>
            </div>
            <div style={s.trackRow}>
              <span style={s.trackRowLabel}>Role</span>
              <span style={s.trackRowValue}>{trackResult.applicant_role || '—'}</span>
            </div>
            <div style={{ ...s.trackRow, borderBottom: 'none' }}>
              <span style={s.trackRowLabel}>Current Stage</span>
              <span style={{ ...s.trackRowValue, color: STAGE_COLORS[stageKey] || '#9ca3af' }}>
                {trackResult.stage ? trackResult.stage.charAt(0).toUpperCase() + trackResult.stage.slice(1) : '—'}
              </span>
            </div>
          </div>
        )}

        {trackResult && isRejected && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444', borderRadius: '8px', padding: '16px', marginTop: '16px', color: '#ef4444', fontSize: '13px' }}>
            This application was not progressed further.
          </div>
        )}

        {trackSearched && !trackResult && (
          <div style={s.trackErrorCard}>No application found with those details.</div>
        )}
      </div>
    </div>
  )
}

// ── Job card ────────────────────────────────────────────────────────────────
function JobCard({ job, onApply, appCount }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      style={{ ...s.jobCard, borderColor: hovered ? '#3a3a3a' : '#2a2a2a' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={s.jobCardTop}>
        <div>
          <div style={s.jobTitle}>{job.title}</div>
          <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '3px' }}>
            {appCount} applicant{appCount !== 1 ? 's' : ''}
          </div>
        </div>
        <button style={s.applyBtn} onClick={() => onApply(job)}>Apply Now</button>
      </div>
      <div style={s.jobMeta}>
        {job.department && <span style={s.metaItem}><Briefcase size={14} />{job.department}</span>}
        {job.location && <span style={s.metaItem}><MapPin size={14} />{job.location}</span>}
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

// ── Main page ───────────────────────────────────────────────────────────────
export default function Careers() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [appCounts, setAppCounts] = useState({})
  const [selectedJob, setSelectedJob] = useState(null)
  const [successInfo, setSuccessInfo] = useState(null)
  const [trackModalOpen, setTrackModalOpen] = useState(false)

  useEffect(() => {
    supabase.from('jobs').select('*').eq('status', 'open').order('created_at', { ascending: false })
      .then(({ data }) => { setJobs(data || []); setLoading(false) })

    supabase.from('applications').select('job_id').then(({ data }) => {
      const map = {}
      data?.forEach(a => { map[a.job_id] = (map[a.job_id] || 0) + 1 })
      setAppCounts(map)
    })
  }, [])

  const filtered = jobs.filter(job => {
    const q = search.trim().toLowerCase()
    const matchesSearch = !q ||
      job.title?.toLowerCase().includes(q) ||
      job.department?.toLowerCase().includes(q)
    const matchesType =
      typeFilter === 'all' ||
      job.type === typeFilter ||
      job.employment_type === typeFilter
    return matchesSearch && matchesType && job.status === 'open'
  })

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
        {!loading && jobs.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '10px' }}>
              <input
                type="text"
                placeholder="Search by title or department..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  flex: 1, background: '#141414', border: '1px solid #2a2a2a',
                  borderRadius: '8px', padding: '10px 16px', color: '#ffffff',
                  fontSize: '14px', outline: 'none', fontFamily: 'inherit',
                }}
              />
              <select
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}
                style={{
                  background: '#141414', border: '1px solid #2a2a2a',
                  borderRadius: '8px', padding: '10px 16px', color: '#ffffff',
                  fontSize: '14px', outline: 'none', fontFamily: 'inherit', cursor: 'pointer',
                }}
              >
                <option value="all">All Types</option>
                <option value="full-time">Full Time</option>
                <option value="contract">Contract</option>
                <option value="part-time">Part Time</option>
              </select>
            </div>
            <div style={{ fontSize: '13px', color: '#9ca3af' }}>
              {filtered.length} open role{filtered.length !== 1 ? 's' : ''}
            </div>
          </div>
        )}

        {loading ? (
          <div style={s.loading}>Loading open positions…</div>
        ) : filtered.length === 0 ? (
          <div style={s.empty}>
            {jobs.length === 0 ? 'No open positions at the moment. Check back soon.' : 'No roles match your search.'}
          </div>
        ) : (
          filtered.map(job => (
            <JobCard key={job.id} job={job} onApply={setSelectedJob} appCount={appCounts[job.id] || 0} />
          ))
        )}
      </div>

      {selectedJob && <ApplyModal job={selectedJob} onClose={() => setSelectedJob(null)} onSuccess={handleSuccess} />}
      {successInfo && <SuccessModal info={successInfo} onClose={() => setSuccessInfo(null)} />}
      {trackModalOpen && <TrackingModal onClose={() => setTrackModalOpen(false)} />}
    </div>
  )
}
