import { useState, useRef } from 'react'
import TopBar from '../components/layout/TopBar'
import { Copy, Check, Upload, CheckCircle, AlertTriangle } from 'lucide-react'
import { extractTextFromPDF } from '../lib/pdfExtract'

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
  biasIcon: { marginBottom: '8px' },
  biasHeading: (color) => ({ color, fontSize: '20px', fontWeight: '700' }),
  biasSubtext: { fontSize: '14px', color: '#9ca3af', marginTop: '4px' },
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
  pdfNotice: { fontSize: '13px', color: '#22c55e', marginBottom: '8px' },
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

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

export default function JobAdChecker() {
  const [mode, setMode] = useState('text') // 'text' | 'pdf'
  const [textInput, setTextInput] = useState('')
  const [pdfFile, setPdfFile] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadingText, setLoadingText] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(false)
  const [extractingPDF, setExtractingPDF] = useState(false)
  const [extractedFromPDF, setExtractedFromPDF] = useState(false)
  const fileInputRef = useRef(null)

  const canAnalyse = mode === 'text' ? textInput.trim().length > 0 : pdfFile !== null

  const handlePDFSelect = async (file) => {
    if (!file || file.type !== 'application/pdf') return
    setPdfFile(file)
    setExtractingPDF(true)
    setError(null)

    try {
      const text = await extractTextFromPDF(file)
      setTextInput(text)
      setMode('text')
      setExtractedFromPDF(true)
    } catch (err) {
      setError(err.message)
      setMode('text')
      setTextInput('')
      setExtractedFromPDF(false)
    } finally {
      setExtractingPDF(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    handlePDFSelect(e.dataTransfer.files[0])
  }

  const analyseJobAd = async () => {
    if (!textInput.trim()) return

    setLoading(true)
    setLoadingText('Analysing job description...')
    setError(null)
    setResult(null)

    try {
      const messageContent = textInput.trim()

      // Call Groq through the server-side proxy — keeps the API key server-only
      const response = await fetch('/api/groq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          max_tokens: 1000,
          messages: [
            {
              role: 'system',
              content: `You are an expert in inclusive hiring language.
Analyse the job description for biased, exclusionary, or gendered language.
Return ONLY valid JSON with no markdown backticks, no explanation,
no text before or after the JSON object:
{"biasedPhrases":[{"phrase":"string","reason":"string","suggestion":"string"}],"overallScore":0,"rewrittenJD":"string","summary":"string"}`,
            },
            {
              role: 'user',
              content: `Analyse this job description for bias:\n\n${messageContent}`,
            },
          ],
        }),
      })

      const data = await response.json()
      const raw = data.content?.[0]?.text || data.choices?.[0]?.message?.content || ''

      // Strip any markdown backticks if present
      const cleaned = raw
        .replace(/```json/gi, '')
        .replace(/```/g, '')
        .trim()

      const parsed = JSON.parse(cleaned)
      setResult(parsed)

    } catch (err) {
      if (err instanceof SyntaxError) {
        setError('AI returned invalid response. Please try again.')
      } else {
        setError('Analysis failed: ' + err.message)
      }
    } finally {
      setLoading(false)
      setLoadingText('')
    }
  }

  const copyRewrite = () => {
    if (!result?.rewrittenJD) return
    navigator.clipboard.writeText(result.rewrittenJD)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={s.page}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <TopBar title="Job Ad Checker" />
      <div style={s.content}>
        <div style={s.subtitle}>Paste a job description or upload a PDF to check for bias</div>
        <div style={s.layout}>
          <div style={s.leftPanel}>
            <div style={s.toggleRow}>
              <button type="button" style={s.toggleBtn(mode === 'text')} onClick={() => setMode('text')}>Paste Text</button>
              <button type="button" style={s.toggleBtn(mode === 'pdf')} onClick={() => setMode('pdf')}>Upload PDF</button>
            </div>

            {mode === 'text' ? (
              <>
                {extractedFromPDF && (
                  <div style={s.pdfNotice}>📄 Text extracted from your PDF. Review and edit before analysing.</div>
                )}
                <textarea
                  style={s.textarea}
                  placeholder="Paste your job description here…"
                  value={textInput}
                  onChange={e => setTextInput(e.target.value)}
                />
              </>
            ) : (
              <div
                style={s.dropZone(dragOver)}
                onClick={() => !extractingPDF && fileInputRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  style={{ display: 'none' }}
                  onChange={e => handlePDFSelect(e.target.files[0])}
                />
                {extractingPDF ? (
                  <>
                    <div style={s.dropIcon}><Upload size={40} /></div>
                    <div style={{ fontSize: '15px', color: '#22c55e', marginBottom: '4px' }}>Reading PDF...</div>
                    <div style={{ fontSize: '13px', color: '#9ca3af' }}>Extracting text...</div>
                  </>
                ) : (
                  <>
                    <div style={s.dropIcon}><Upload size={40} /></div>
                    <div style={s.dropText}>Drop your PDF here or click to browse</div>
                    <div style={s.dropSub}>.pdf files only</div>
                    {pdfFile && (
                      <>
                        <div style={s.fileName}>{pdfFile.name}</div>
                        <div style={s.fileSize}>{formatBytes(pdfFile.size)}</div>
                      </>
                    )}
                  </>
                )}
              </div>
            )}

            {error && <div style={s.error}>{error}</div>}
            <button
              type="button"
              style={s.analyseBtn(loading)}
              onClick={analyseJobAd}
              disabled={loading || !canAnalyse}
            >
              {loading && <Spinner />}
              {loading ? loadingText || 'Analysing...' : 'Analyse for Bias'}
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
                  {result.biasedPhrases?.length > 0 ? (
                    <>
                      <div style={s.biasIcon}><AlertTriangle size={32} color="#f59e0b" /></div>
                      <div style={s.biasHeading('#f59e0b')}>⚠ Bias Detected</div>
                      <div style={s.biasSubtext}>
                        {result.biasedPhrases.length} biased phrase{result.biasedPhrases.length !== 1 ? 's' : ''} found
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={s.biasIcon}><CheckCircle size={32} color="#22c55e" /></div>
                      <div style={s.biasHeading('#22c55e')}>✓ No Bias Detected</div>
                    </>
                  )}
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
                      <button type="button" style={s.copyBtn} onClick={copyRewrite}>
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
