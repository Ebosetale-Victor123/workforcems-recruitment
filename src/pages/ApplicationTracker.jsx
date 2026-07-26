import { useState } from 'react'
import TopBar from '../components/layout/TopBar'
import { useApplications } from '../hooks/useApplications'

const STAGES = ['applied', 'screening', 'interview', 'offered', 'hired', 'rejected']
const STAGE_LABELS = {
  applied: 'Applied',
  screening: 'Screening',
  interview: 'Interview',
  offered: 'Offered',
  hired: 'Hired',
  rejected: 'Rejected',
}
const NEXT_STAGE = {
  applied: 'screening',
  screening: 'interview',
  interview: 'offered',
  offered: 'hired',
  hired: null,
  rejected: null,
}

const s = {
  page: { flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 },
  boardWrap: {
    padding: '32px', flex: 1, overflowX: 'auto',
    display: 'flex', gap: '0',
  },
  board: {
    display: 'flex', gap: '12px',
    minWidth: 'max-content',
  },
  column: {
    background: '#0d0d0d', borderRadius: '12px',
    padding: '16px', width: '260px', minHeight: '400px',
    flexShrink: 0,
  },
  colHeader: {
    display: 'flex', alignItems: 'center', gap: '8px',
    marginBottom: '14px',
  },
  colTitle: { fontSize: '14px', fontWeight: '600', color: '#ffffff' },
  colCount: {
    background: '#1f1f1f', color: '#9ca3af',
    borderRadius: '999px', padding: '2px 8px', fontSize: '12px',
  },
  card: {
    background: '#141414', border: '1px solid #2a2a2a',
    borderRadius: '10px', padding: '16px', marginBottom: '10px',
  },
  cardTop: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' },
  avatar: {
    width: '36px', height: '36px', borderRadius: '50%',
    background: '#1f1f1f', color: '#ffffff', fontSize: '13px',
    fontWeight: '600', display: 'flex', alignItems: 'center',
    justifyContent: 'center', flexShrink: 0,
  },
  name: { fontSize: '14px', fontWeight: '500', color: '#ffffff' },
  role: { fontSize: '13px', color: '#9ca3af', marginBottom: '8px' },
  scoreBadge: (score) => ({
    display: 'inline-block',
    background: score > 70 ? '#052e16' : score > 40 ? '#1a0e00' : '#2a0a0a',
    color: score > 70 ? '#22c55e' : score > 40 ? '#f97316' : '#ef4444',
    border: `1px solid ${score > 70 ? '#22c55e' : score > 40 ? '#f97316' : '#ef4444'}`,
    borderRadius: '4px', padding: '2px 8px', fontSize: '11px',
    fontWeight: '600', marginBottom: '8px',
  }),
  moveBtn: (disabled) => ({
    width: '100%', background: 'transparent',
    border: '1px solid #3a3a3a', borderRadius: '6px',
    padding: '6px 10px', color: disabled ? '#3a3a3a' : '#9ca3af',
    fontSize: '12px', cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'border-color 0.15s, color 0.15s',
    marginTop: '4px',
  }),
  error: {
    background: '#2a0a0a', border: '1px solid #ef4444',
    borderRadius: '8px', padding: '16px', color: '#ef4444',
    margin: '0 32px 24px', fontSize: '14px',
  },
  loading: { color: '#9ca3af', padding: '48px', textAlign: 'center' },
}

function initials(name) {
  if (!name) return '?'
  const parts = name.trim().split(' ')
  return parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase()
}

function KanbanCard({ app, onMove }) {
  const [moving, setMoving] = useState(false)
  const [moveErr, setMoveErr] = useState(null)
  const blinded = app.is_blinded
  const displayName = blinded ? 'Anonymous' : (app.candidate_name || 'Unnamed')
  const next = NEXT_STAGE[app.stage]

  const handleMove = async () => {
    if (!next) return
    setMoving(true)
    setMoveErr(null)
    try {
      await onMove(app.id, next)
    } catch (e) {
      setMoveErr(e.message)
    }
    setMoving(false)
  }

  return (
    <div style={s.card}>
      <div style={s.cardTop}>
        <div style={s.avatar}>{blinded ? '?' : initials(app.candidate_name)}</div>
        <div style={s.name}>{displayName}</div>
      </div>
      <div style={s.role}>{app.applicant_role || app.jobs?.title || '—'}</div>
      {app.blind_score != null && (
        <div style={s.scoreBadge(app.blind_score)}>Score {app.blind_score}</div>
      )}
      {moveErr && <div style={{ fontSize: '11px', color: '#ef4444', marginBottom: '4px' }}>{moveErr}</div>}
      <button
        style={s.moveBtn(!next || moving)}
        onClick={handleMove}
        disabled={!next || moving}
      >
        {moving ? 'Moving…' : next ? `Move to ${STAGE_LABELS[next]}` : 'Final Stage'}
      </button>
    </div>
  )
}

export default function ApplicationTracker() {
  const { applications, loading, error, updateStage } = useApplications()

  const byStage = {}
  STAGES.forEach(st => { byStage[st] = [] })
  applications.forEach(app => {
    const st = app.stage?.toLowerCase() || 'applied'
    if (byStage[st]) byStage[st].push(app)
    else byStage['applied'].push(app)
  })

  return (
    <div style={s.page}>
      <TopBar title="Application Tracker" />
      {error && <div style={s.error}>{error}</div>}
      <div style={s.boardWrap}>
        {loading ? (
          <div style={s.loading}>Loading applications…</div>
        ) : (
          <div style={s.board}>
            {STAGES.map(stage => (
              <div key={stage} style={s.column}>
                <div style={s.colHeader}>
                  <span style={s.colTitle}>{STAGE_LABELS[stage]}</span>
                  <span style={s.colCount}>{byStage[stage].length}</span>
                </div>
                {byStage[stage].map(app => (
                  <KanbanCard key={app.id} app={app} onMove={updateStage} />
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
