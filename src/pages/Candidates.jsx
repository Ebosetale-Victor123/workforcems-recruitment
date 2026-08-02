import { useState } from 'react'
import TopBar from '../components/layout/TopBar'
import { StageBadge } from '../components/ui/Badge'
import { useApplications } from '../hooks/useApplications'
import { Trash2 } from 'lucide-react'

const STAGES = ['All', 'Applied', 'Screening', 'Interview', 'Offered', 'Hired', 'Rejected']

const s = {
  page: { flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 },
  content: { padding: '32px', flex: 1, overflowY: 'auto' },
  filterRow: {
    display: 'flex', alignItems: 'flex-start',
    justifyContent: 'space-between', marginBottom: '24px', gap: '16px', flexWrap: 'wrap',
  },
  pillRow: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
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
  sliderWrap: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' },
  sliderLabel: { fontSize: '13px', color: '#9ca3af', whiteSpace: 'nowrap' },
  slider: { width: '200px', accentColor: '#22c55e', background: 'transparent', cursor: 'pointer' },
  matchCount: { fontSize: '12px', color: '#6b7280' },
  tableWrap: {
    background: '#141414', border: '1px solid #2a2a2a',
    borderRadius: '12px', overflow: 'hidden',
  },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: {
    background: '#1a1a1a', color: '#9ca3af', fontSize: '12px',
    textTransform: 'uppercase', letterSpacing: '0.05em',
    padding: '12px 20px', textAlign: 'left', fontWeight: '500',
  },
  td: { padding: '14px 20px', borderBottom: '1px solid #1f1f1f', fontSize: '13px', color: '#ffffff' },
  tdSec: { padding: '14px 20px', borderBottom: '1px solid #1f1f1f', fontSize: '13px', color: '#9ca3af' },
  avatar: {
    width: '36px', height: '36px', borderRadius: '50%',
    background: '#1f1f1f', color: '#ffffff', fontSize: '13px',
    fontWeight: '600', display: 'flex', alignItems: 'center',
    justifyContent: 'center', flexShrink: 0,
  },
  candidateCell: { display: 'flex', alignItems: 'center', gap: '10px' },
  viewBtn: {
    background: 'transparent', border: '1px solid #3a3a3a',
    borderRadius: '6px', padding: '5px 14px', color: '#9ca3af',
    fontSize: '12px', cursor: 'pointer',
  },
  deleteBtn: {
    background: 'transparent', border: '1px solid #3a3a3a',
    borderRadius: '6px', padding: '6px 8px', cursor: 'pointer',
    color: '#ef4444', marginLeft: '8px', display: 'inline-flex',
    alignItems: 'center',
  },
  infoNote: { fontSize: '12px', color: '#6b7280', marginBottom: '16px' },
  confirmOverlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
    zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  confirmModal: {
    background: '#141414', border: '1px solid #2a2a2a',
    borderRadius: '12px', padding: '24px',
    position: 'fixed', top: '50%', left: '50%',
    transform: 'translate(-50%, -50%)', zIndex: 1000, width: '360px',
  },
  confirmIconWrap: { display: 'flex', justifyContent: 'center', marginBottom: '12px' },
  confirmHeading: { fontSize: '18px', fontWeight: '700', color: '#ffffff', textAlign: 'center' },
  confirmBody: { fontSize: '14px', color: '#9ca3af', textAlign: 'center', marginTop: '8px' },
  confirmActions: { display: 'flex', gap: '12px', marginTop: '20px' },
  confirmCancelBtn: {
    background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#ffffff',
    borderRadius: '8px', padding: '10px 20px', flex: 1, cursor: 'pointer',
  },
  confirmDeleteBtn: {
    background: '#ef4444', border: 'none', color: '#ffffff',
    borderRadius: '8px', padding: '10px 20px', flex: 1, fontWeight: '600', cursor: 'pointer',
  },
  toast: {
    position: 'fixed', bottom: '24px', right: '24px',
    background: '#ef4444', color: '#ffffff',
    padding: '12px 20px', borderRadius: '8px', zIndex: 9999,
  },
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
  drawerTitle: { fontSize: '20px', fontWeight: '700', color: '#ffffff', marginBottom: '16px' },
  drawerClose: { background: 'transparent', border: 'none', color: '#9ca3af', fontSize: '20px', cursor: 'pointer' },
  sectionLabel: { fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px', marginTop: '16px' },
  sectionValue: { fontSize: '14px', color: '#ffffff', lineHeight: '1.6' },
  sectionSec: { fontSize: '14px', color: '#9ca3af', lineHeight: '1.6' },
  skillPill: {
    border: '1px solid #3a3a3a', background: 'transparent',
    color: '#9ca3af', borderRadius: '4px', padding: '3px 10px',
    fontSize: '12px', marginRight: '6px', marginBottom: '6px', display: 'inline-block',
  },
}

function initials(name) {
  if (!name) return '?'
  const parts = name.trim().split(' ')
  return parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase()
}

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function CandidateDrawer({ app, onClose }) {
  const blinded = app.is_blinded
  const displayName = blinded ? 'Anonymous Candidate' : (app.candidate_name || 'Unnamed')
  return (
    <div style={s.overlay} onClick={onClose}>
      <div style={s.drawer} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ ...s.avatar, width: '44px', height: '44px', fontSize: '15px' }}>
              {blinded ? '?' : initials(app.candidate_name)}
            </div>
            <div>
              <div style={s.drawerTitle}>{displayName}</div>
              <StageBadge stage={app.stage} />
            </div>
          </div>
          <button style={s.drawerClose} onClick={onClose}>×</button>
        </div>

        {!blinded && (
          <>
            <div style={s.sectionLabel}>Email</div>
            <div style={s.sectionValue}>{app.candidate_email || '—'}</div>
            <div style={s.sectionLabel}>Phone</div>
            <div style={s.sectionValue}>{app.candidate_phone || app.phone || '—'}</div>
            <div style={s.sectionLabel}>School / Institution</div>
            <div style={s.sectionValue}>{app.candidate_school || '—'}</div>
          </>
        )}

        <div style={s.sectionLabel}>Role Applied For</div>
        <div style={s.sectionValue}>{app.applicant_role || app.jobs?.title || '—'}</div>

        <div style={s.sectionLabel}>Date Applied</div>
        <div style={s.sectionValue}>{formatDate(app.created_at)}</div>

        {app.blind_score != null && (
          <>
            <div style={s.sectionLabel}>Blind Score</div>
            <div style={{
              fontSize: '28px', fontWeight: '700',
              color: app.blind_score > 70 ? '#22c55e' : app.blind_score > 40 ? '#f97316' : '#ef4444',
            }}>{app.blind_score}</div>
          </>
        )}

        {app.ai_summary && (
          <>
            <div style={s.sectionLabel}>AI Summary</div>
            <div style={s.sectionSec}>{app.ai_summary}</div>
          </>
        )}

        {app.skills && app.skills.length > 0 && (
          <>
            <div style={s.sectionLabel}>Skills</div>
            <div style={{ marginTop: '4px' }}>
              {app.skills.map((sk, i) => (
                <span key={i} style={s.skillPill}>{sk}</span>
              ))}
            </div>
          </>
        )}

        {!blinded && app.cv_text && (
          <>
            <div style={s.sectionLabel}>CV</div>
            <div style={{ ...s.sectionSec, whiteSpace: 'pre-wrap', marginTop: '4px' }}>{app.cv_text}</div>
          </>
        )}

        {blinded && app.cv_text && (
          <>
            <div style={s.sectionLabel}>Anonymised CV</div>
            <div style={{ ...s.sectionSec, whiteSpace: 'pre-wrap', marginTop: '4px' }}>
              {app.cv_text.slice(0, 600)}{app.cv_text.length > 600 ? '…' : ''}
            </div>
          </>
        )}

        {app.cv_file_url && (
          <a
            href={app.cv_file_url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: '#141414',
              border: '1px solid #2a2a2a',
              color: '#9ca3af',
              borderRadius: '8px',
              padding: '10px 16px',
              fontSize: '14px',
              textDecoration: 'none',
              marginTop: '12px',
            }}
          >
            View CV PDF
          </a>
        )}
      </div>
    </div>
  )
}

function DeleteConfirmModal({ candidate, onCancel, onConfirm }) {
  return (
    <div style={s.confirmOverlay} onClick={onCancel}>
      <div style={s.confirmModal} onClick={e => e.stopPropagation()}>
        <div style={s.confirmIconWrap}>
          <Trash2 size={24} color="#ef4444" />
        </div>
        <div style={s.confirmHeading}>Delete Candidate?</div>
        <div style={s.confirmBody}>
          This will permanently remove this application from the database. This cannot be undone.
        </div>
        <div style={s.confirmActions}>
          <button style={s.confirmCancelBtn} onClick={onCancel}>Cancel</button>
          <button style={s.confirmDeleteBtn} onClick={() => onConfirm(candidate)}>Delete</button>
        </div>
      </div>
    </div>
  )
}

export default function Candidates() {
  const { applications, loading, error, deleteApplication } = useApplications()
  const [stageFilter, setStageFilter] = useState('All')
  const [minScore, setMinScore] = useState(0)
  const [selectedApp, setSelectedApp] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [toast, setToast] = useState(null)

  const handleConfirmDelete = async (candidate) => {
    await deleteApplication(candidate.id)
    setDeleteTarget(null)
    setToast('Candidate removed')
    setTimeout(() => setToast(null), 3000)
  }

  const filtered = applications
    .filter(a => stageFilter === 'All' || a.stage === stageFilter.toLowerCase())
    .filter(a => minScore === 0 || (a.blind_score != null && a.blind_score >= minScore))

  return (
    <div style={s.page}>
      <TopBar title="Candidates" />
      <div style={s.content}>
        {error && <div style={s.error}>{error}</div>}

        <div style={s.filterRow}>
          <div style={s.pillRow}>
            {STAGES.map(stage => (
              <button key={stage} style={s.pill(stageFilter === stage)} onClick={() => setStageFilter(stage)}>
                {stage}
              </button>
            ))}
          </div>

          <div style={s.sliderWrap}>
            <span style={s.sliderLabel}>
              Min Blind Score: <strong style={{ color: '#ffffff' }}>{minScore}</strong>
            </span>
            <input
              type="range"
              min={0}
              max={100}
              value={minScore}
              onChange={e => setMinScore(Number(e.target.value))}
              style={s.slider}
            />
            <span style={s.matchCount}>{filtered.length} candidate{filtered.length !== 1 ? 's' : ''} match</span>
          </div>
        </div>

        <div style={s.infoNote}>⚡ Rejected applications are automatically removed after 3 days</div>

        {loading ? (
          <div style={s.loading}>Loading candidates…</div>
        ) : (
          <div style={s.tableWrap}>
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>Candidate</th>
                  <th style={s.th}>Role</th>
                  <th style={s.th}>Stage</th>
                  <th style={s.th}>Blind Score</th>
                  <th style={s.th}>Date Applied</th>
                  <th style={s.th}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ ...s.td, textAlign: 'center', color: '#6b7280' }}>
                      No candidates found.
                    </td>
                  </tr>
                ) : (
                  filtered.map(app => {
                    const blinded = app.is_blinded
                    const displayName = blinded ? 'Anonymous' : (app.candidate_name || 'Unnamed')
                    return (
                      <tr
                        key={app.id}
                        onMouseEnter={e => e.currentTarget.style.background = '#1c1c1c'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={s.td}>
                          <div style={s.candidateCell}>
                            <div style={s.avatar}>
                              {blinded ? '?' : initials(app.candidate_name)}
                            </div>
                            <span>{displayName}</span>
                          </div>
                        </td>
                        <td style={s.tdSec}>{app.applicant_role || app.jobs?.title || '—'}</td>
                        <td style={s.td}><StageBadge stage={app.stage} /></td>
                        <td style={s.td}>
                          {app.blind_score != null ? (
                            <span style={{
                              color: app.blind_score > 70 ? '#22c55e' : app.blind_score > 40 ? '#f97316' : '#ef4444',
                              fontWeight: '600',
                            }}>{app.blind_score}</span>
                          ) : '—'}
                        </td>
                        <td style={s.tdSec}>{formatDate(app.created_at)}</td>
                        <td style={s.td}>
                          <button style={s.viewBtn} onClick={() => setSelectedApp(app)}>View</button>
                          <button style={s.deleteBtn} onClick={() => setDeleteTarget(app)}>
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedApp && <CandidateDrawer app={selectedApp} onClose={() => setSelectedApp(null)} />}
      {deleteTarget && (
        <DeleteConfirmModal
          candidate={deleteTarget}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleConfirmDelete}
        />
      )}
      {toast && <div style={s.toast}>{toast}</div>}
    </div>
  )
}
