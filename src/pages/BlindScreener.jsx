import { useState } from 'react'
import TopBar from '../components/layout/TopBar'
import { useApplications } from '../hooks/useApplications'
import { useJobs } from '../hooks/useJobs'
import { supabase } from '../lib/supabase'
import {
  Eye, EyeOff, CheckCircle, XCircle, ThumbsUp, ThumbsDown,
  FileText, BookOpen,
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
  secondaryBtn: {
    width: '100%', background: 'transparent', border: '1px solid #2a2a2a',
    color: '#9ca3af', borderRadius: '8px', padding: '10px', fontSize: '13px',
    cursor: 'pointer', fontFamily: 'inherit', marginBottom: '10px',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
  },
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
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      max_tokens,
      messages,
    }),
  })
  const data = await res.json()
  if (!res.ok) {
    throw new Error(data.error || `Groq proxy error ${res.status}`)
  }
  const raw = data.content?.[0]?.text || data.choices?.[0]?.message?.content || ''
  const cleaned = raw.replace(/```json/gi, '').replace(/```/g, '').trim()
  return JSON.parse(cleaned)
}

export default function BlindScreener() {
  const { applications, loading, error, updateStage } = useApplications()
  const { jobs } = useJobs()

  const [selectedId, setSelectedId] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [selectedApp, setSelectedApp] = useState(null)
  const [selectedJobId, setSelectedJobId] = useState('')
  const [blindMode, setBlindMode] = useState(true)

  const [analysing, setAnalysing] = useState(false)
  const [analysisError, setAnalysisError] = useState(null)
  const [result, setResult] = useState(null)

  const [actionLoading, setActionLoading] = useState(false)
  const [skillBridge, setSkillBridge] = useState(null) // { loading, data, error }

  const pendingCandidates = applications
    .filter(a => a.stage === 'applied')
    .slice()
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))

  const openJobs = jobs.filter(j => j.status === 'open')
  const selectedRole = openJobs.find(j => j.id === selectedJobId)

  const handleSelectCandidate = (id) => {
    setSelectedId(id)
    setSelectedIndex(pendingCandidates.findIndex(c => c.id === id))
    setSelectedApp(pendingCandidates.find(c => c.id === id) || null)
    setResult(null)
    setAnalysisError(null)
    setSkillBridge(null)
  }

  const runAnalysis = async () => {
    if (!selectedApp || !selectedJobId) return
    setAnalysing(true)
    setAnalysisError(null)
    setResult(null)

    const cvForAI = blindMode
      ? (selectedApp.cv_text || '')
      : (selectedApp.original_cv || selectedApp.cv_text || '')

    try {
      const parsed = await callGroq([
        {
          role: 'system',
          content: `You are an expert HR recruiter performing CV screening. Analyse this CV for the given role. Return ONLY valid JSON with no markdown, no explanation: {"score": number 0-100, "strengths": string[], "gaps": string[], "recommendation": string, "summary": string, "seniority_level": string}`,
        },
        {
          role: 'user',
          content: `Role: ${selectedRole?.title || 'the specified role'}. CV: ${cvForAI}`,
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

  const handleAccept = async () => {
    if (!selectedApp) return
    setActionLoading(true)
    try {
      await updateStage(selectedApp.id, 'interview')
      setSelectedApp(prev => ({ ...prev, stage: 'interview' }))
    } catch (e) {
      setAnalysisError(e.message)
    }
    setActionLoading(false)
  }

  const handleReject = async () => {
    if (!selectedApp) return
    setActionLoading(true)
    try {
      await updateStage(selectedApp.id, 'rejected')
      setSelectedApp(prev => ({ ...prev, stage: 'rejected' }))
      await runSkillBridge(result?.gaps)
    } catch (e) {
      setAnalysisError(e.message)
    }
    setActionLoading(false)
  }

  const candidateLabel = selectedIndex >= 0 ? `Candidate #${selectedIndex + 1}` : null

  return (
    <div style={s.page}>
      <TopBar title="Blind Screener" />
      <div style={s.content}>
        <div style={s.subtitle}>Select a candidate and role to run a blind AI screen</div>
        {error && <div style={s.error}>{error}</div>}

        {loading ? (
          <div style={s.loading}>Loading applications…</div>
        ) : (
          <div style={s.layout}>
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
                </div>

                <div style={s.formGroup}>
                  <label style={s.label}>Screen Against Role</label>
                  <select
                    style={s.select}
                    value={selectedJobId}
                    onChange={e => setSelectedJobId(e.target.value)}
                  >
                    <option value="">Choose a role…</option>
                    {openJobs.map(j => (
                      <option key={j.id} value={j.id}>{j.title}</option>
                    ))}
                  </select>
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
                  style={s.analyseBtn(!selectedApp || !selectedJobId || analysing)}
                  onClick={runAnalysis}
                  disabled={!selectedApp || !selectedJobId || analysing}
                >
                  {analysing ? 'Analysing…' : 'Analyse CV'}
                </button>

                {selectedApp?.cv_file_url && (
                  <button
                    type="button"
                    style={s.secondaryBtn}
                    onClick={() => window.open(selectedApp.cv_file_url, '_blank')}
                  >
                    <FileText size={16} /> View Original CV PDF
                  </button>
                )}

                {selectedApp?.source === 'careers_portal' && (
                  <div style={s.sourceBadge}>
                    <CheckCircle size={13} /> Auto-anonymised on submission
                  </div>
                )}

                {analysisError && <div style={s.errText}>{analysisError}</div>}
              </div>
            </div>

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
    </div>
  )
}
