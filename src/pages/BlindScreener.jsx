import { useState } from 'react'
import TopBar from '../components/layout/TopBar'
import { useApplications } from '../hooks/useApplications'
import { supabase } from '../lib/supabase'

const s = {
  page: { flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 },
  content: { padding: '32px', flex: 1, overflowY: 'auto' },
  subtitle: { fontSize: '14px', color: '#9ca3af', marginBottom: '28px' },
  card: {
    background: '#141414', border: '1px solid #2a2a2a',
    borderRadius: '12px', padding: '24px', marginBottom: '16px',
  },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' },
  actionRow: { display: 'flex', alignItems: 'center' },
  candidateId: { fontSize: '16px', fontWeight: '600', color: '#ffffff' },
  roleText: { fontSize: '13px', color: '#9ca3af', marginTop: '2px' },
  cvPreview: { fontSize: '13px', color: '#6b7280', lineHeight: '1.6', marginBottom: '12px' },
  cvUnavailable: { fontSize: '13px', color: '#6b7280', fontStyle: 'italic', marginBottom: '12px' },
  downloadBtn: {
    background: 'transparent', border: '1px solid #2a2a2a',
    color: '#9ca3af', borderRadius: '8px', padding: '8px 16px',
    fontSize: '13px', cursor: 'pointer', marginRight: '8px',
  },
  skillPill: {
    border: '1px solid #3a3a3a', background: 'transparent',
    color: '#9ca3af', borderRadius: '4px', padding: '3px 10px',
    fontSize: '12px', marginRight: '6px', marginBottom: '6px', display: 'inline-block',
  },
  screenBtn: (loading) => ({
    background: loading ? '#2a2a2a' : '#ffffff',
    color: loading ? '#9ca3af' : '#000000',
    border: 'none', borderRadius: '8px',
    padding: '8px 18px', fontWeight: '600', fontSize: '13px',
    cursor: loading ? 'not-allowed' : 'pointer',
    transition: 'background 0.15s',
    display: 'flex', alignItems: 'center', gap: '6px',
  }),
  resultBox: {
    marginTop: '16px', paddingTop: '16px',
    borderTop: '1px solid #2a2a2a',
  },
  scoreNum: (score) => ({
    fontSize: '40px', fontWeight: '700',
    color: score > 70 ? '#22c55e' : score > 40 ? '#f97316' : '#ef4444',
    marginBottom: '12px',
  }),
  sectionLabel: { fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px', marginTop: '12px' },
  strengthPill: {
    background: '#052e16', border: '1px solid #22c55e',
    color: '#22c55e', borderRadius: '4px', padding: '3px 10px',
    fontSize: '12px', marginRight: '6px', marginBottom: '6px', display: 'inline-block',
  },
  gapPill: {
    background: '#2a0a0a', border: '1px solid #ef4444',
    color: '#ef4444', borderRadius: '4px', padding: '3px 10px',
    fontSize: '12px', marginRight: '6px', marginBottom: '6px', display: 'inline-block',
  },
  summaryText: { fontSize: '14px', color: '#9ca3af', lineHeight: '1.6' },
  recText: { fontSize: '14px', color: '#ffffff', lineHeight: '1.6' },
  errText: { fontSize: '13px', color: '#ef4444', marginTop: '8px' },
  error: {
    background: '#2a0a0a', border: '1px solid #ef4444',
    borderRadius: '8px', padding: '16px', color: '#ef4444', marginBottom: '24px', fontSize: '14px',
  },
  loading: { color: '#9ca3af', padding: '48px', textAlign: 'center' },
  emptyState: { color: '#6b7280', fontSize: '14px', textAlign: 'center', padding: '48px' },
}

function Spinner() {
  return (
    <span style={{
      width: '14px', height: '14px', border: '2px solid #6b7280',
      borderTopColor: '#ffffff', borderRadius: '50%',
      display: 'inline-block', animation: 'spin 0.7s linear infinite',
    }} />
  )
}

const spinKeyframes = `@keyframes spin { to { transform: rotate(360deg); } }`

function ScreenCard({ app, index }) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [err, setErr] = useState(null)

  const runScreen = async (e) => {
    if (e) e.preventDefault()
    setLoading(true)
    setErr(null)
    const groqKey = import.meta.env.VITE_GROQ_API_KEY
    const role = app.applicant_role || 'the specified role'
    const cv = app.cv_text || ''

    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${groqKey}`,
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [
            {
              role: 'system',
              content: `You are an expert HR recruiter performing blind CV screening. Analyse this CV for the given role. Return ONLY valid JSON with no markdown, no explanation: {"score": number 0-100, "strengths": string[], "gaps": string[], "recommendation": string, "summary": string}`,
            },
            {
              role: 'user',
              content: `Role: ${role}. CV: ${cv}`,
            },
          ],
          temperature: 0.3,
        }),
      })

      if (!res.ok) {
        const body = await res.text()
        throw new Error(`Groq API error ${res.status}: ${body}`)
      }

      const data = await res.json()
      const content = data.choices?.[0]?.message?.content || ''
      const parsed = JSON.parse(content)
      setResult(parsed)

      const { error: updateErr } = await supabase
        .from('applications')
        .update({ blind_score: parsed.score, ai_summary: parsed.summary })
        .eq('id', app.id)
      if (updateErr) console.error(updateErr)
    } catch (e) {
      setErr(e.message)
    }
    setLoading(false)
  }

  const handleDownload = () => {
    if (app.cv_file_url) {
      window.open(app.cv_file_url, '_blank')
    } else if (app.cv_text) {
      const blob = new Blob([app.cv_text], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `candidate-${index + 1}-cv.txt`
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  return (
    <div style={s.card}>
      <style>{spinKeyframes}</style>
      <div style={s.cardTop}>
        <div>
          <div style={s.candidateId}>Candidate #{index + 1}</div>
          <div style={s.roleText}>{app.applicant_role || 'Unknown Role'}</div>
        </div>
        <div style={s.actionRow}>
          {(app.cv_file_url || app.cv_text) && (
            <button type="button" style={s.downloadBtn} onClick={handleDownload}>
              Download CV
            </button>
          )}
          <button type="button" style={s.screenBtn(loading)} onClick={runScreen} disabled={loading}>
            {loading && <Spinner />}
            {loading ? 'Screening…' : 'Run AI Screen'}
          </button>
        </div>
      </div>

      {app.cv_text ? (
        <div style={s.cvPreview}>
          {app.cv_text.slice(0, 300)}{app.cv_text.length > 300 ? '…' : ''}
        </div>
      ) : (
        <div style={s.cvUnavailable}>CV text not available for this application.</div>
      )}

      {app.skills && app.skills.length > 0 && (
        <div>
          {app.skills.map((sk, i) => <span key={i} style={s.skillPill}>{sk}</span>)}
        </div>
      )}

      {err && <div style={s.errText}>{err}</div>}

      {result && (
        <div style={s.resultBox}>
          <div style={s.scoreNum(result.score)}>{result.score}<span style={{ fontSize: '16px', color: '#6b7280' }}>/100</span></div>

          {result.strengths?.length > 0 && (
            <>
              <div style={s.sectionLabel}>Strengths</div>
              <div>{result.strengths.map((str, i) => <span key={i} style={s.strengthPill}>{str}</span>)}</div>
            </>
          )}

          {result.gaps?.length > 0 && (
            <>
              <div style={s.sectionLabel}>Gaps</div>
              <div>{result.gaps.map((g, i) => <span key={i} style={s.gapPill}>{g}</span>)}</div>
            </>
          )}

          {result.recommendation && (
            <>
              <div style={s.sectionLabel}>Recommendation</div>
              <div style={s.recText}>{result.recommendation}</div>
            </>
          )}

          {result.summary && (
            <>
              <div style={s.sectionLabel}>Summary</div>
              <div style={s.summaryText}>{result.summary}</div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default function BlindScreener() {
  const { applications, loading, error } = useApplications()
  const pending = applications.filter(a => a.blind_score == null)

  return (
    <div style={s.page}>
      <TopBar title="Blind Screener" />
      <div style={s.content}>
        <div style={s.subtitle}>Applications pending AI screening</div>
        {error && <div style={s.error}>{error}</div>}

        {loading ? (
          <div style={s.loading}>Loading applications…</div>
        ) : pending.length === 0 ? (
          <div style={s.emptyState}>All applications have been screened.</div>
        ) : (
          pending.map((app, i) => (
            <ScreenCard
              key={app.id}
              app={app}
              index={i}
            />
          ))
        )}
      </div>
    </div>
  )
}
