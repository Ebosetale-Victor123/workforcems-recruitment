import { useState, useRef } from 'react'
import TopBar from '../components/layout/TopBar'
import { Copy, Check, Upload } from 'lucide-react'
import * as pdfjsLib from 'pdfjs-dist'

pdfjsLib.GlobalWorkerOptions.workerSrc =
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'

const s = {
  page: { flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 },
  content: { padding: '32px', flex: 1, overflowY: 'auto' },
  subtitle: { fontSize: '14px', color: '#9ca3af', marginBottom: '20px' },
  toggleRow: { display: 'flex', gap: '8px', marginBottom: '16px' },
  toggleBtn: (active) => ({
    padding: '8px 16px', fontSize: '14px', cursor: 'pointer',
    borderRadius: '6px', fontFamily: 'inherit',
    background: active ? '#ffffff' : 'transparent',
    color: active ? '#000000' : '#9ca3af',
    border: active ? 'none' : '1px solid #2a2a2a',
    fontWeight: active ? '600' : '400',
  }),
  layout: { display: 'flex', gap: '24px', alignItems: 'flex-start' },
  leftPanel: { flex: '0 0 60%' },
  rightPanel: { flex: '0 0 calc(40% - 24px)', minWidth: 0 },
  textarea: {
    width: '100%', background: '#141414', border: '1px solid #2a2a2a',
    borderRadius: '12px', padding: '16px', color: '#ffffff',
    fontSize: '14px', lineHeight: '1.6', minHeight: '300px',
    resize: 'vertical', display: 'block', outline: 'none',
  },
  dropZone: (dragOver) => ({
    border: `2px dashed ${dragOver ? '#22c55e' : '#2a2a2a'}`,
    borderRadius: '12px', padding: '40px', textAlign: 'center',
    background: '#141414', cursor: 'pointer',
    transition: 'border-color 0.15s',
  }),
  dropIcon: { color: '#9ca3af', marginBottom: '12px' },
  dropText: { fontSize: '15px', color: '#9ca3af', marginBottom: '4px' },
  dropSub: { fontSize: '13px', color: '#6b7280' },
  fileName: { fontSize: '14px', color: '#22c55e', marginTop: '12px', fontWeight: '500' },
  fileSize: { fontSize: '12px', color: '#9ca3af', marginTop: '2px' },
  analyseBtn: (loading) => ({
    width: '100%', background: loading ? '#2a2a2a' : '#ffffff',
    color: loading ? '#9ca3af' : '#000000', border: 'none',
    borderRadius: '8px', padding: '14px', fontWeight: '600',
    fontSize: '14px', marginTop: '12px', cursor: loading ? 'not-allowed' : 'pointer',
    transition: 'background 0.15s',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
    fontFamily: 'inherit',
  }),
  scoreCard: {
    background: '#141414', border: '1px solid #2a2a2a',
    borderRadius: '12px', padding: '24px', marginBottom: '16px',
    textAlign: 'center',
  },
  scoreLabel: { fontSize: '13px', color: '#9ca3af', marginBottom: '8px' },
  scoreNum: (score) => ({
    fontSize: '48px', fontWeight: '700',
    color: score < 20 ? '#22c55e' : score < 50 ? '#f97316' : '#ef4444',
    lineHeight: 1, marginBottom: '8px',
  }),
  scoreSub: { fontSize: '13px', color: '#6b7280' },
  phraseCard: {
    background: '#141414', border: '1px solid #2a2a2a',
    borderRadius: '10px', padding: '16px', marginBottom: '10px',
  },
  phraseOrig: { fontSize: '14px', color: '#ef4444', marginBottom: '4px', fontWeight: '500' },
  phraseReason: { fontSize: '13px', color: '#9ca3af', marginBottom: '6px' },
  phraseSugg: { fontSize: '13px', color: '#22c55e' },
  sectionTitle: { fontSize: '16px', fontWeight: '600', color: '#ffffff', marginBottom: '12px', marginTop: '20px' },
  rewriteBox: {
    background: '#141414', border: '1px solid #2a2a2a',
    borderRadius: '12px', padding: '16px', fontSize: '14px',
    color: '#9ca3af', lineHeight: '1.6', whiteSpace: 'pre-wrap',
    position: 'relative',
  },
  copyBtn: {
    position: 'absolute', top: '12px', right: '12px',
    background: '#1a1a1a', border: '1px solid #3a3a3a',
    borderRadius: '6px', padding: '4px 10px', color: '#9ca3af',
    fontSize: '12px', cursor: 'pointer',
    display: 'flex', alignItems: 'center', gap: '4px',
  },
  emptyRight: {
    background: '#141414', border: '1px solid #2a2a2a',
    borderRadius: '12px', padding: '48px 24px',
    textAlign: 'center', color: '#6b7280', fontSize: '14px',
  },
  error: {
    background: '#2a0a0a', border: '1px solid #ef4444',
    borderRadius: '8px', padding: '16px', color: '#ef4444', marginBottom: '16px', fontSize: '14px',
  },
}

function Spinner() {
  return (
    <span style={{
      width: '16px', height: '16px', border: '2px solid #6b7280',
      borderTopColor: '#000', borderRadius: '50%',
      display: 'inline-block', animation: 'spin 0.7s linear infinite',
    }} />
  )
}

function scoreDescription(score) {
  if (score < 20) return 'Low bias — great job!'
  if (score < 50) return 'Moderate bias detected'
  return 'High bias — rewrite recommended'
}

async function extractPDFText(file) {
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  let fullText = ''
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    fullText += content.items.map(item => item.str).join(' ') + '\n'
  }
  return fullText
}

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

export default function JobAdChecker() {
  const [mode, setMode] = useState('text') // 'text' | 'pdf'
  const [text, setText] = useState('')
  const [pdfFile, setPdfFile] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const [loadingPhase, setLoadingPhase] = useState(null) // null | 'reading' | 'analysing'
  const [result, setResult] = useState(null)
  const [err, setErr] = useState(null)
  const [copied, setCopied] = useState(false)
  const fileInputRef = useRef(null)

  const isLoading = loadingPhase !== null
  const canAnalyse = mode === 'text' ? text.trim().length > 0 : pdfFile !== null

  const handleFile = (file) => {
    if (!file || file.type !== 'application/pdf') return
    setPdfFile(file)
    setErr(null)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    handleFile(e.dataTransfer.files[0])
  }

  const analyse = async () => {
    if (!canAnalyse) return
    setLoadingPhase(mode === 'pdf' ? 'reading' : 'analysing')
    setErr(null)
    setResult(null)

    let content = text
    if (mode === 'pdf') {
      try {
        content = await extractPDFText(pdfFile)
      } catch (e) {
        setErr('Failed to read PDF: ' + e.message)
        setLoadingPhase(null)
        return
      }
      setLoadingPhase('analysing')
    }

    const groqKey = import.meta.env.VITE_GROQ_API_KEY
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
              content: `You are an expert in inclusive hiring language. Analyse the job description for biased, exclusionary, or gendered language. Return ONLY valid JSON with no markdown: {"biasedPhrases": [{"phrase": string, "reason": string, "suggestion": string}], "overallScore": number 0-100, "rewrittenJD": string, "summary": string}`,
            },
            { role: 'user', content },
          ],
          temperature: 0.3,
        }),
      })

      if (!res.ok) {
        const body = await res.text()
        throw new Error(`Groq API error ${res.status}: ${body}`)
      }

      const data = await res.json()
      const raw = data.choices?.[0]?.message?.content || ''
      const parsed = JSON.parse(raw)
      setResult(parsed)
    } catch (e) {
      setErr(e.message)
    }
    setLoadingPhase(null)
  }

  const copyRewrite = () => {
    if (!result?.rewrittenJD) return
    navigator.clipboard.writeText(result.rewrittenJD)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const loadingLabel = loadingPhase === 'reading' ? 'Reading PDF…' : 'Analysing…'

  return (
    <div style={s.page}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <TopBar title="Job Ad Checker" />
      <div style={s.content}>
        <div style={s.subtitle}>Paste a job description or upload a PDF to check for bias</div>
        <div style={s.layout}>
          <div style={s.leftPanel}>
            <div style={s.toggleRow}>
              <button style={s.toggleBtn(mode === 'text')} onClick={() => setMode('text')}>Paste Text</button>
              <button style={s.toggleBtn(mode === 'pdf')} onClick={() => setMode('pdf')}>Upload PDF</button>
            </div>

            {mode === 'text' ? (
              <textarea
                style={s.textarea}
                placeholder="Paste your job description here…"
                value={text}
                onChange={e => setText(e.target.value)}
              />
            ) : (
              <div
                style={s.dropZone(dragOver)}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  style={{ display: 'none' }}
                  onChange={e => handleFile(e.target.files[0])}
                />
                <div style={s.dropIcon}><Upload size={40} /></div>
                <div style={s.dropText}>Drop your PDF here or click to browse</div>
                <div style={s.dropSub}>.pdf files only</div>
                {pdfFile && (
                  <>
                    <div style={s.fileName}>{pdfFile.name}</div>
                    <div style={s.fileSize}>{formatBytes(pdfFile.size)}</div>
                  </>
                )}
              </div>
            )}

            {err && <div style={s.error}>{err}</div>}
            <button
              style={s.analyseBtn(isLoading)}
              onClick={analyse}
              disabled={isLoading || !canAnalyse}
            >
              {isLoading && <Spinner />}
              {isLoading ? loadingLabel : 'Analyse for Bias'}
            </button>
          </div>

          <div style={s.rightPanel}>
            {!result ? (
              <div style={s.emptyRight}>
                Results will appear here after analysis.
              </div>
            ) : (
              <>
                <div style={s.scoreCard}>
                  <div style={s.scoreLabel}>Overall Bias Score</div>
                  <div style={s.scoreNum(result.overallScore)}>{result.overallScore}</div>
                  <div style={s.scoreSub}>{scoreDescription(result.overallScore)}</div>
                </div>

                {result.summary && (
                  <div style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '16px', lineHeight: '1.6' }}>
                    {result.summary}
                  </div>
                )}

                {result.biasedPhrases?.length > 0 && (
                  <>
                    <div style={s.sectionTitle}>Biased Phrases</div>
                    {result.biasedPhrases.map((p, i) => (
                      <div key={i} style={s.phraseCard}>
                        <div style={s.phraseOrig}>"{p.phrase}"</div>
                        <div style={s.phraseReason}>{p.reason}</div>
                        <div style={s.phraseSugg}>→ {p.suggestion}</div>
                      </div>
                    ))}
                  </>
                )}

                {result.rewrittenJD && (
                  <>
                    <div style={s.sectionTitle}>Rewritten Job Description</div>
                    <div style={s.rewriteBox}>
                      <button style={s.copyBtn} onClick={copyRewrite}>
                        {copied ? <Check size={12} /> : <Copy size={12} />}
                        {copied ? 'Copied' : 'Copy'}
                      </button>
                      {result.rewrittenJD}
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
