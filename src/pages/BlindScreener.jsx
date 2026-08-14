import { useState, useEffect } from 'react'
import TopBar from '../components/layout/TopBar'
import { useApplications } from '../hooks/useApplications'
import { useJobs } from '../hooks/useJobs'
import { supabase } from '../lib/supabase'
import {
  Eye, EyeOff, CheckCircle, XCircle, ThumbsUp, ThumbsDown,
  BookOpen,
} from 'lucide-react'

const s = {
  page: { flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 },
  content: { padding: '32px', flex: 1, overflowY: 'auto' },
  subtitle: { fontSize: '14px', color: '#9ca3af', marginBottom: '24px' },
  layout: { display: 'flex', gap: '24px', alignItems: 'flex-start' },
  leftPanel: { flex: '0 0 40%' },
  rightPanel: { flex: '0 0 calc(60% - 24px)', minWidth: 0 },

  card: {
    background: '#141414', border: '1px solid #2a2a2a',
    borderRadius: '12px', padding: '24px', marginBottom: '16px',
  },
  formGroup: { marginBottom: '16px' },
  label: { display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '6px' },
  select: {
    width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a',
    borderRadius: '8px', padding: '10px 12px', color: '#ffffff', fontSize: '14px',
    fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
  },

  toggleBtn: (blindMode) => ({
    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
    background: blindMode ? '#22c55e' : '#f59e0b',
    color: '#000000', border: 'none', borderRadius: '8px',
    padding: '12px', fontWeight: '700', fontSize: '13px',
    cursor: 'pointer', fontFamily: 'inherit', marginBottom: '8px',
  }),
  unblindWarning: {
    background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)',
    borderRadius: '8px', padding: '10px 12px', color: '#f59e0b',
    fontSize: '12px', marginBottom: '16px', lineHeight: '1.5',
  },

  analyseBtn: (disabled) => ({
    width: '100%', background: disabled ? '#2a2a2a' : '#ffffff',
    color: disabled ? '#6b7280' : '#000000', border: 'none',
    borderRadius: '8px', padding: '14px', fontWeight: '700', fontSize: '14px',
    cursor: disabled ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
    marginBottom: '10px',
  }),
  sourceBadge: {
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)',
    color: '#22c55e', borderRadius: '999px', padding: '5px 12px', fontSize: '12px',
  },

  emptyState: { color: '#6b7280', fontSize: '14px', textAlign: 'center', padding: '48px' },
  loading: { color: '#9ca3af', padding: '48px', textAlign: 'center' },
  error: {
    background: '#2a0a0a', border: '1px solid #ef4444',
    borderRadius: '8px', padding: '16px', color: '#ef4444', marginBottom: '24px', fontSize: '14px',
  },
  errText: { fontSize: '13px', color: '#ef4444', marginTop: '8px' },

  identityCard: (blindMode) => ({
    background: '#141414', border: `1px solid ${blindMode ? '#3b82f6' : '#f59e0b'}`,
    borderRadius: '12px', padding: '20px', marginBottom: '16px',
  }),
  identityTitle: { fontSize: '13px', fontWeight: '600', color: '#ffffff', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' },
  identityRow: { display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '13px' },
  identityLabel: { color: '#9ca3af' },
  identityValue: { color: '#ffffff', fontWeight: '500' },
  redacted: { color: '#6b7280', fontStyle: 'italic' },

  resultCard: {
    background: '#141414', border: '1px solid #2a2a2a',
    borderRadius: '12px', padding: '24px', marginBottom: '16px', textAlign: 'center',
  },
  scoreNum: (color) => ({ fontSize: '48px', fontWeight: '700', color, lineHeight: 1, marginBottom: '8px' }),
  recBadge: (color) => ({
    display: 'inline-block', color, border: `1px solid ${color}`,
    borderRadius: '999px', padding: '4px 14px', fontSize: '13px', fontWeight: '600', marginBottom: '8px',
  }),
  seniorityBadge: {
    display: 'inline-block', color: '#9ca3af', border: '1px solid #3a3a3a',
    borderRadius: '6px', padding: '3px 10px', fontSize: '12px', marginLeft: '8px',
  },
  sectionLabel: { fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', marginTop: '18px', textAlign: 'left' },
  listRow: { display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: '#ffffff', textAlign: 'left', marginBottom: '6px' },
  summaryText: { fontSize: '14px', color: '#9ca3af', lineHeight: '1.6', textAlign: 'left', marginTop: '18px' },

  comparisonCard: {
    background: '#141414', border: '1px solid #2a2a2a',
    borderRadius: '12px', padding: '24px', marginBottom: '16px', textAlign: 'center',
  },
  comparisonRow: { display: 'flex', justifyContent: 'center', gap: '48px', marginBottom: '16px' },
  comparisonNum: (color) => ({ fontSize: '36px', fontWeight: '700', color }),
  comparisonLabel: { fontSize: '12px', color: '#9ca3af', marginTop: '4px' },
  comparisonDiff: { fontSize: '14px', color: '#ffffff', fontWeight: '500' },

  actionRow: { display: 'flex', gap: '12px', marginBottom: '16px' },
  acceptBtn: {
    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
    background: '#22c55e', color: '#000000', border: 'none', borderRadius: '8px',
    padding: '12px', fontWeight: '700', fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit',
  },
  rejectBtn: {
    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
    background: '#ef4444', color: '#ffffff', border: 'none', borderRadius: '8px',
    padding: '12px', fontWeight: '700', fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit',
  },
  stageNotice: {
    fontSize: '13px', color: '#9ca3af', textAlign: 'center', marginBottom: '16px',
  },

  skillBridgeCard: {
    background: '#141414', border: '1px solid #2a2a2a',
    borderRadius: '12px', padding: '24px',
  },
  skillBridgeTitle: { fontSize: '16px', fontWeight: '700', color: '#ffffff', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' },
  skillBridgeSub: { fontSize: '13px', color: '#9ca3af', marginBottom: '16px' },
  encouragement: {
    background: '#0a0a0a', border: '1px solid #2a2a2a', borderRadius: '8px',
    padding: '14px', fontSize: '13px', color: '#9ca3af', lineHeight: '1.6', marginBottom: '16px',
  },
  courseCard: {
    background: '#0a0a0a', border: '1px solid #2a2a2a', borderRadius: '10px',
    padding: '16px', marginBottom: '10px',
  },
  courseTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' },
  courseName: { fontSize: '14px', fontWeight: '600', color: '#ffffff' },
  priorityBadge: (priority) => ({
    fontSize: '11px', fontWeight: '600', textTransform: 'uppercase',
    padding: '2px 8px', borderRadius: '4px',
    color: priority === 'high' ? '#ef4444' : priority === 'medium' ? '#f59e0b' : '#9ca3af',
    border: `1px solid ${priority === 'high' ? '#ef4444' : priority === 'medium' ? '#f59e0b' : '#3a3a3a'}`,
  }),
  courseMeta: { fontSize: '12px', color: '#9ca3af', marginBottom: '4px' },
  courseGap: { fontSize: '12px', color: '#6b7280' },

  emptyRight: {
    background: '#141414', border: '1px solid #2a2a2a',
    borderRadius: '12px', padding: '48px 24px', textAlign: 'center', color: '#6b7280', fontSize: '14px',
  },
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function scoreColor(score) {
  if (score >= 80) return '#22c55e'
  if (score >= 60) return '#f59e0b'
  return '#ef4444'
}

function recommendationLabel(score) {
  if (score >= 80) return 'Strong Match'
  if (score >= 60) return 'Moderate Match'
  return 'Below Requirements'
}

async function callGroq(messages, max_tokens) {
  const res = await fetch('/api/groq', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'openai/gpt-oss-20b', max_tokens, messages }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || `Groq proxy error ${res.status}`)
  const raw = data.content?.[0]?.text || data.choices?.[0]?.message?.content || ''
  const cleaned = raw.replace(/```json/gi, '').replace(/```/g, '').trim()
  return JSON.parse(cleaned)
}

async function callGroqRaw(messages, max_tokens) {
  const res = await fetch('/api/groq', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'openai/gpt-oss-20b', max_tokens, messages }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || `Groq proxy error ${res.status}`)
  return data.content?.[0]?.text || data.choices?.[0]?.message?.content || ''
}

function ModalSpinner({ color }) {
  return (
    <span style={{
      width: '16px', height: '16px',
      border: `2px solid #3a3a3a`,
      borderTopColor: color || '#22c55e',
      borderRadius: '50%', display: 'inline-block',
      animation: 'spin 0.7s linear infinite', flexShrink: 0,
    }} />
  )
}

// ── Accept Modal ─────────────────────────────────────────────────────────────

function AcceptModal({ candidate, candidateLabel, result, onClose, onConfirm, loading }) {
  const [email, setEmail] = useState('')
  const [generating, setGenerating] = useState(true)

  useEffect(() => {
    let cancelled = false
    callGroqRaw([{
      role: 'user',
      content: `Generate a professional, warm acceptance email for a job candidate who has been shortlisted for interview.

Role: ${candidate.applicant_role || 'the specified role'}
Blind Score: ${result?.score ?? 'N/A'}/100
Strengths identified: ${result?.strengths?.join(', ') || 'strong overall profile'}

The email should:
- Congratulate them on being shortlisted
- Mention next steps (interview invitation)
- Be warm and professional
- Be 3-4 short paragraphs
- NOT mention BlindHire, WorkforceMS, or the screening process
- NOT include a subject line

Return ONLY the email body text.`,
    }], 500)
      .then(text => { if (!cancelled) setEmail(text) })
      .catch(() => { if (!cancelled) setEmail('Could not generate email. Please write one manually.') })
      .finally(() => { if (!cancelled) setGenerating(false) })
    return () => { cancelled = true }
  }, [])

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#141414', border: '1px solid #22c55e', borderRadius: '16px', padding: '32px', width: '520px', position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', zIndex: 1001, maxHeight: '90vh', overflowY: 'auto' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', border: 'none', color: '#9ca3af', fontSize: '22px', cursor: 'pointer', lineHeight: 1 }}>×</button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
          <CheckCircle size={24} color="#22c55e" />
          <div style={{ fontSize: '20px', fontWeight: '700', color: '#ffffff' }}>Accept Candidate</div>
        </div>
        <div style={{ fontSize: '14px', color: '#9ca3af', marginBottom: '20px' }}>
          {candidateLabel} — {candidate.applicant_role}
        </div>

        {generating ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#9ca3af', padding: '20px 0' }}>
            <ModalSpinner color="#22c55e" />
            Generating email...
          </div>
        ) : (
          <textarea
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{
              background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '8px',
              padding: '16px', color: '#ffffff', fontSize: '14px', lineHeight: '1.7',
              width: '100%', minHeight: '200px', marginTop: '12px',
              fontFamily: 'inherit', outline: 'none', resize: 'vertical', boxSizing: 'border-box',
            }}
          />
        )}

        <div style={{ background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '8px', padding: '12px', marginTop: '12px' }}>
          <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>
            📧 This is a demo simulation. In production, this email would be sent to the candidate's registered email address.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
          <button onClick={onClose} style={{ flex: 1, background: 'transparent', border: '1px solid #2a2a2a', color: '#9ca3af', borderRadius: '8px', padding: '10px 20px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '14px' }}>
            Cancel
          </button>
          <button
            onClick={() => onConfirm(email)}
            disabled={loading || generating}
            style={{ flex: 1, background: (loading || generating) ? '#1a3d28' : '#22c55e', color: (loading || generating) ? '#4a7a5a' : '#000000', border: 'none', borderRadius: '8px', padding: '10px 20px', fontWeight: '700', fontSize: '14px', cursor: (loading || generating) ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}
          >
            {loading ? 'Processing…' : 'Send & Move to Interview'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Reject Modal ─────────────────────────────────────────────────────────────

function RejectModal({ candidate, candidateLabel, result, onClose, onConfirm, loading }) {
  const [email, setEmail] = useState('')
  const [generating, setGenerating] = useState(false)
  const [reason, setReason] = useState('')

  const generateEmail = async (selectedReason) => {
    if (!selectedReason) return
    setGenerating(true)
    setEmail('')
    try {
      const text = await callGroqRaw([{
        role: 'user',
        content: `Generate a professional, empathetic rejection email for a job candidate.

Role: ${candidate.applicant_role || 'the specified role'}
Blind Score: ${result?.score ?? 'N/A'}/100
Skill gaps identified: ${result?.gaps?.join(', ') || 'various areas'}
Rejection reason: ${selectedReason}

The email should:
- Thank them sincerely for applying
- Professionally communicate they were not selected
- Encourage them to keep developing their skills
- Be empathetic and respectful
- Be 3-4 short paragraphs
- NOT mention specific scores or the screening system
- NOT be harsh or discouraging
- End with encouragement

Return ONLY the email body text.`,
      }], 500)
      setEmail(text)
    } catch {
      setEmail('Could not generate email. Please write one manually.')
    }
    setGenerating(false)
  }

  const handleReasonChange = (e) => {
    const val = e.target.value
    setReason(val)
    if (val) generateEmail(val)
    else setEmail('')
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#141414', border: '1px solid #ef4444', borderRadius: '16px', padding: '32px', width: '520px', position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', zIndex: 1001, maxHeight: '90vh', overflowY: 'auto' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', border: 'none', color: '#9ca3af', fontSize: '22px', cursor: 'pointer', lineHeight: 1 }}>×</button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
          <XCircle size={24} color="#ef4444" />
          <div style={{ fontSize: '20px', fontWeight: '700', color: '#ffffff' }}>Reject Candidate</div>
        </div>
        <div style={{ fontSize: '14px', color: '#9ca3af', marginBottom: '20px' }}>
          {candidateLabel} — {candidate.applicant_role}
        </div>

        <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '6px' }}>Reason for rejection</label>
        <select
          value={reason}
          onChange={handleReasonChange}
          style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '8px', padding: '10px', color: reason ? '#ffffff' : '#6b7280', width: '100%', marginBottom: '16px', fontFamily: 'inherit', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
        >
          <option value="">Select a reason...</option>
          <option value="Skills gap — does not meet requirements">Skills gap — does not meet requirements</option>
          <option value="Insufficient experience">Insufficient experience</option>
          <option value="Better candidates selected">Better candidates selected</option>
          <option value="Role has been filled">Role has been filled</option>
          <option value="Application incomplete">Application incomplete</option>
        </select>

        {generating && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#9ca3af', padding: '12px 0' }}>
            <ModalSpinner color="#ef4444" />
            Generating email...
          </div>
        )}

        {!generating && email && (
          <textarea
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{
              background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '8px',
              padding: '16px', color: '#ffffff', fontSize: '14px', lineHeight: '1.7',
              width: '100%', minHeight: '200px', marginTop: '4px',
              fontFamily: 'inherit', outline: 'none', resize: 'vertical', boxSizing: 'border-box',
            }}
          />
        )}

        {!generating && email && (
          <div style={{ background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '8px', padding: '12px', marginTop: '12px' }}>
            <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>
              📧 This is a demo simulation. In production, this email would be sent to the candidate's registered email address.
            </p>
          </div>
        )}

        <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
          <button onClick={onClose} style={{ flex: 1, background: 'transparent', border: '1px solid #2a2a2a', color: '#9ca3af', borderRadius: '8px', padding: '10px 20px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '14px' }}>
            Cancel
          </button>
          <button
            onClick={() => onConfirm(email, reason)}
            disabled={loading || !reason}
            style={{ flex: 1, background: (!reason || loading) ? '#2a0a0a' : '#ef4444', color: (!reason || loading) ? '#6b7280' : '#ffffff', border: 'none', borderRadius: '8px', padding: '10px 20px', fontWeight: '700', fontSize: '14px', cursor: (!reason || loading) ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}
          >
            {loading ? 'Processing…' : 'Send & Reject'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main page ────────────────────────────────────────────────────────────────

export default function BlindScreener() {
  const { applications, loading, error, updateStage } = useApplications()
  const { jobs } = useJobs()

  const [selectedId, setSelectedId] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [selectedApp, setSelectedApp] = useState(null)
  const [blindMode, setBlindMode] = useState(true)

  const [analysing, setAnalysing] = useState(false)
  const [analysisError, setAnalysisError] = useState(null)
  const [result, setResult] = useState(null)

  const [actionLoading, setActionLoading] = useState(false)
  const [skillBridge, setSkillBridge] = useState(null)

  const [acceptModal, setAcceptModal] = useState(false)
  const [rejectModal, setRejectModal] = useState(false)
  const [actionToast, setActionToast] = useState('')

  const pendingCandidates = applications
    .filter(a => a.stage === 'applied')
    .slice()
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))

  const candidateJob = selectedApp ? jobs.find(j => j.id === selectedApp.job_id) : null

  const handleSelectCandidate = (id) => {
    setSelectedId(id)
    setSelectedIndex(pendingCandidates.findIndex(c => c.id === id))
    setSelectedApp(pendingCandidates.find(c => c.id === id) || null)
    setResult(null)
    setAnalysisError(null)
    setSkillBridge(null)
  }

  const runAnalysis = async () => {
    if (!selectedApp) return
    setAnalysing(true)
    setAnalysisError(null)
    setResult(null)

    const cvForAI = blindMode
      ? (selectedApp.cv_text || '')
      : (selectedApp.original_cv || selectedApp.cv_text || '')

    const jobForScoring = candidateJob || {
      title: selectedApp.applicant_role,
      department: '',
      description: '',
      requirements: '',
    }

    try {
      const parsed = await callGroq([
        {
          role: 'system',
          content: `You are an expert HR recruiter performing CV screening. Analyse this CV for the given role. Return ONLY valid JSON with no markdown, no explanation: {"score": number 0-100, "strengths": string[], "gaps": string[], "recommendation": string, "summary": string, "seniority_level": string}`,
        },
        {
          role: 'user',
          content: `Role: ${jobForScoring.title || 'the specified role'}. CV: ${cvForAI}`,
        },
      ], 1000)

      setResult(parsed)

      const patch = blindMode
        ? { blind_score: parsed.score, ai_summary: parsed.summary }
        : { unblind_score: parsed.score }

      const { error: updateErr } = await supabase
        .from('applications')
        .update(patch)
        .eq('id', selectedApp.id)
      if (updateErr) console.error(updateErr)

      setSelectedApp(prev => ({ ...prev, ...patch }))
    } catch (e) {
      setAnalysisError(e.message)
    }
    setAnalysing(false)
  }

  const runSkillBridge = async (gaps) => {
    if (!gaps || gaps.length === 0) return
    setSkillBridge({ loading: true, data: null, error: null })
    try {
      const parsed = await callGroq([
        {
          role: 'system',
          content: `You are a career coach helping a rejected candidate grow. Given their skill gaps for the role, suggest a constructive development path. Return ONLY valid JSON with no markdown: {"candidate_level": string, "career_path": string, "courses": [{"course_name": string, "platform": string, "duration": string, "cost": string, "skill_gap": string, "priority": "high"|"medium"|"low"}], "encouragement_message": string}`,
        },
        {
          role: 'user',
          content: `Skill gaps: ${gaps.join(', ')}`,
        },
      ], 1200)
      setSkillBridge({ loading: false, data: parsed, error: null })
    } catch (e) {
      setSkillBridge({ loading: false, data: null, error: e.message })
    }
  }

  const showToast = (msg) => {
    setActionToast(msg)
    setTimeout(() => setActionToast(''), 3000)
  }

  const handleAccept = () => {
    if (!selectedApp || !result) return
    setAcceptModal(true)
  }

  const handleReject = () => {
    if (!selectedApp) return
    setRejectModal(true)
  }

  const handleAcceptConfirm = async () => {
    setActionLoading(true)
    try {
      await supabase
        .from('applications')
        .update({ stage: 'interview', updated_at: new Date().toISOString() })
        .eq('id', selectedApp.id)
      await updateStage(selectedApp.id, 'interview')
      setAcceptModal(false)
      showToast('✓ Candidate moved to Interview')
      setSelectedId('')
      setSelectedApp(null)
      setResult(null)
      setSelectedIndex(-1)
      setSkillBridge(null)
    } catch (e) {
      setAnalysisError(e.message)
    }
    setActionLoading(false)
  }

  const handleRejectConfirm = async () => {
    setActionLoading(true)
    try {
      await supabase
        .from('applications')
        .update({ stage: 'rejected', updated_at: new Date().toISOString() })
        .eq('id', selectedApp.id)
      await updateStage(selectedApp.id, 'rejected')
      setSelectedApp(prev => ({ ...prev, stage: 'rejected' }))
      setRejectModal(false)
      showToast('✗ Candidate rejected')
      await runSkillBridge(result?.gaps)
    } catch (e) {
      setAnalysisError(e.message)
    }
    setActionLoading(false)
  }

  const candidateLabel = selectedIndex >= 0 ? `Candidate #${selectedIndex + 1}` : null

  return (
    <div style={s.page}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <TopBar title="Blind Screener" />
      <div style={s.content}>
        <div style={s.subtitle}>Select a candidate to run a blind AI screen against their applied role</div>
        {error && <div style={s.error}>{error}</div>}

        {loading ? (
          <div style={s.loading}>Loading applications…</div>
        ) : (
          <div style={s.layout}>
            {/* Left panel */}
            <div style={s.leftPanel}>
              <div style={s.card}>
                <div style={s.formGroup}>
                  <label style={s.label}>Select Candidate</label>
                  <select
                    style={s.select}
                    value={selectedId}
                    onChange={e => handleSelectCandidate(e.target.value)}
                  >
                    <option value="">
                      {pendingCandidates.length === 0 ? 'No candidates pending' : 'Choose a candidate…'}
                    </option>
                    {pendingCandidates.map((c, i) => (
                      <option key={c.id} value={c.id}>Candidate #{i + 1}</option>
                    ))}
                  </select>
                  {selectedApp && (
                    <div style={{ fontSize: '13px', color: '#9ca3af', marginTop: '8px' }}>
                      Screening for: {candidateJob?.title || selectedApp.applicant_role || 'Unknown role'}
                    </div>
                  )}
                </div>

                <button type="button" style={s.toggleBtn(blindMode)} onClick={() => setBlindMode(m => !m)}>
                  {blindMode ? <EyeOff size={16} /> : <Eye size={16} />}
                  {blindMode ? 'Blind Mode ON — Identity hidden from AI' : 'Blind Mode OFF — Full identity visible'}
                </button>

                {!blindMode && (
                  <div style={s.unblindWarning}>
                    ⚠️ You are viewing unblinded CV. This may introduce bias.
                  </div>
                )}

                <button
                  type="button"
                  style={s.analyseBtn(!selectedApp || analysing)}
                  onClick={runAnalysis}
                  disabled={!selectedApp || analysing}
                >
                  {analysing ? 'Analysing…' : 'Analyse CV'}
                </button>

                {selectedApp?.cv_file_url && (
                  <button
                    type="button"
                    onClick={() => {
                      const link = document.createElement('a')
                      link.href = selectedApp.cv_file_url
                      link.download = `candidate-cv-${selectedApp.application_reference || selectedApp.id}.pdf`
                      link.target = '_blank'
                      document.body.appendChild(link)
                      link.click()
                      document.body.removeChild(link)
                    }}
                    style={{
                      display: 'block', textAlign: 'center', marginTop: '8px',
                      color: '#3b82f6', fontSize: '13px', cursor: 'pointer',
                      textDecoration: 'underline', background: 'none',
                      border: 'none', padding: '4px', width: '100%',
                    }}
                  >
                    Download Original CV
                  </button>
                )}

                {selectedApp?.source === 'careers_portal' && (
                  <div style={{ ...s.sourceBadge, marginTop: '10px' }}>
                    <CheckCircle size={13} /> Auto-anonymised on submission
                  </div>
                )}

                {analysisError && <div style={s.errText}>{analysisError}</div>}
              </div>
            </div>

            {/* Right panel */}
            <div style={s.rightPanel}>
              {!selectedApp ? (
                <div style={s.emptyRight}>Select a candidate to begin screening.</div>
              ) : (
                <>
                  <div style={s.identityCard(blindMode)}>
                    <div style={s.identityTitle}>{candidateLabel} — Identity</div>
                    <div style={s.identityRow}>
                      <span style={s.identityLabel}>Email</span>
                      <span style={s.identityValue}>
                        {blindMode ? <span style={s.redacted}>[REDACTED]</span> : (selectedApp.candidate_email || '—')}
                      </span>
                    </div>
                    <div style={s.identityRow}>
                      <span style={s.identityLabel}>Phone</span>
                      <span style={s.identityValue}>
                        {blindMode ? <span style={s.redacted}>[REDACTED]</span> : (selectedApp.candidate_phone || '—')}
                      </span>
                    </div>
                    <div style={s.identityRow}>
                      <span style={s.identityLabel}>Years of Experience</span>
                      <span style={s.identityValue}>
                        {blindMode ? <span style={s.redacted}>[REDACTED]</span> : (selectedApp.years_experience ?? '—')}
                      </span>
                    </div>
                    <div style={s.identityRow}>
                      <span style={s.identityLabel}>Applicant Role</span>
                      <span style={s.identityValue}>
                        {blindMode ? <span style={s.redacted}>[REDACTED]</span> : (selectedApp.applicant_role || '—')}
                      </span>
                    </div>
                  </div>

                  {result && (
                    <div style={s.resultCard}>
                      <div style={s.scoreNum(scoreColor(result.score))}>
                        {result.score}<span style={{ fontSize: '18px', color: '#6b7280' }}>/100</span>
                      </div>
                      <div style={s.recBadge(scoreColor(result.score))}>
                        {recommendationLabel(result.score)}
                        {result.seniority_level && <span style={s.seniorityBadge}>{result.seniority_level}</span>}
                      </div>

                      {result.strengths?.length > 0 && (
                        <>
                          <div style={s.sectionLabel}>Strengths</div>
                          {result.strengths.map((str, i) => (
                            <div key={i} style={s.listRow}>
                              <CheckCircle size={15} color="#22c55e" style={{ flexShrink: 0, marginTop: '1px' }} />
                              {str}
                            </div>
                          ))}
                        </>
                      )}

                      {result.gaps?.length > 0 && (
                        <>
                          <div style={s.sectionLabel}>Gaps</div>
                          {result.gaps.map((g, i) => (
                            <div key={i} style={s.listRow}>
                              <XCircle size={15} color="#ef4444" style={{ flexShrink: 0, marginTop: '1px' }} />
                              {g}
                            </div>
                          ))}
                        </>
                      )}

                      {result.summary && <div style={s.summaryText}>{result.summary}</div>}
                    </div>
                  )}

                  {selectedApp.blind_score != null && selectedApp.unblind_score != null && (
                    <div style={s.comparisonCard}>
                      <div style={s.comparisonRow}>
                        <div>
                          <div style={s.comparisonNum('#3b82f6')}>{selectedApp.blind_score}</div>
                          <div style={s.comparisonLabel}>Blind Score</div>
                        </div>
                        <div>
                          <div style={s.comparisonNum('#f59e0b')}>{selectedApp.unblind_score}</div>
                          <div style={s.comparisonLabel}>Unblind Score</div>
                        </div>
                      </div>
                      <div style={s.comparisonDiff}>
                        {Math.abs(selectedApp.blind_score - selectedApp.unblind_score)} point difference. Skill was never the question.
                      </div>
                    </div>
                  )}

                  {result && selectedApp.stage === 'applied' && (
                    <div style={s.actionRow}>
                      <button type="button" style={s.acceptBtn} onClick={handleAccept} disabled={actionLoading}>
                        <ThumbsUp size={16} /> Accept
                      </button>
                      <button type="button" style={s.rejectBtn} onClick={handleReject} disabled={actionLoading}>
                        <ThumbsDown size={16} /> Reject
                      </button>
                    </div>
                  )}

                  {selectedApp.stage === 'interview' && (
                    <div style={s.stageNotice}>Candidate moved to Interview stage.</div>
                  )}

                  {selectedApp.stage === 'rejected' && !skillBridge && (
                    <div style={s.stageNotice}>Candidate has been rejected.</div>
                  )}

                  {skillBridge?.loading && (
                    <div style={s.skillBridgeCard}>
                      <div style={s.skillBridgeTitle}><BookOpen size={18} /> SkillBridge</div>
                      <div style={s.skillBridgeSub}>Generating a development path…</div>
                    </div>
                  )}

                  {skillBridge?.error && (
                    <div style={s.skillBridgeCard}>
                      <div style={s.skillBridgeTitle}><BookOpen size={18} /> SkillBridge</div>
                      <div style={s.errText}>{skillBridge.error}</div>
                    </div>
                  )}

                  {skillBridge?.data && (
                    <div style={s.skillBridgeCard}>
                      <div style={s.skillBridgeTitle}><BookOpen size={18} /> SkillBridge</div>
                      <div style={s.skillBridgeSub}>
                        {skillBridge.data.candidate_level} · {skillBridge.data.career_path}
                      </div>

                      {skillBridge.data.encouragement_message && (
                        <div style={s.encouragement}>{skillBridge.data.encouragement_message}</div>
                      )}

                      {skillBridge.data.courses?.map((course, i) => (
                        <div key={i} style={s.courseCard}>
                          <div style={s.courseTop}>
                            <div style={s.courseName}>{course.course_name}</div>
                            <span style={s.priorityBadge(course.priority)}>{course.priority}</span>
                          </div>
                          <div style={s.courseMeta}>{course.platform} · {course.duration} · {course.cost}</div>
                          <div style={s.courseGap}>Addresses: {course.skill_gap}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {acceptModal && selectedApp && (
        <AcceptModal
          candidate={selectedApp}
          candidateLabel={candidateLabel}
          result={result}
          onClose={() => setAcceptModal(false)}
          onConfirm={handleAcceptConfirm}
          loading={actionLoading}
        />
      )}

      {rejectModal && selectedApp && (
        <RejectModal
          candidate={selectedApp}
          candidateLabel={candidateLabel}
          result={result}
          onClose={() => setRejectModal(false)}
          onConfirm={handleRejectConfirm}
          loading={actionLoading}
        />
      )}

      {/* Toast */}
      {actionToast && (
        <div style={{
          position: 'fixed', bottom: '24px', right: '24px',
          background: actionToast.startsWith('✓') ? '#22c55e' : '#ef4444',
          color: actionToast.startsWith('✓') ? '#000000' : '#ffffff',
          padding: '12px 20px', borderRadius: '8px',
          fontWeight: '600', fontSize: '14px', zIndex: 9999,
        }}>
          {actionToast}
        </div>
      )}
    </div>
  )
}
