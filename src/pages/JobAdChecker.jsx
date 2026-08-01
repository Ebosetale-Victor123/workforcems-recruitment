import { useState, useRef } from 'react'
import TopBar from '../components/layout/TopBar'
import { Copy, Check, Upload } from 'lucide-react'

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

const readPDFAsBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const base64 = e.target.result.split(',')[1]
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
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
  const fileInputRef = useRef(null)

  const canAnalyse = mode === 'text' ? textInput.trim().length > 0 : pdfFile !== null

  const handleFile = (file) => {
    if (!file || file.type !== 'application/pdf') return
    setPdfFile(file)
    setError(null)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    handleFile(e.dataTransfer.files[0])
  }

  const analyseJobAd = async () => {
    if (!pdfFile && !textInput.trim()) return

    setLoading(true)
    setLoadingText('Analysing job description...')
    setError(null)
    setResult(null)

    try {
      let messageContent

      if (mode === 'pdf' && pdfFile) {
        setLoadingText('Reading PDF...')
        const base64 = await readPDFAsBase64(pdfFile)

        // Send as multipart message with base64 file
        // Since Groq may not support document blocks directly,
        // extract text first using this binary-safe approach:

        // Read as ArrayBuffer and extract text manually
        const arrayBuffer = await pdfFile.arrayBuffer()
        const bytes = new Uint8Array(arrayBuffer)

        // Convert bytes to string safely
        let rawText = ''
        for (let i = 0; i < bytes.length; i++) {
          const byte = bytes[i]
          // Only include printable ASCII and common chars
          if (byte >= 32 && byte <= 126) {
            rawText += String.fromCharCode(byte)
          } else if (byte === 10 || byte === 13) {
            rawText += ' '
          }
        }

        // Extract readable text segments (PDF text is between
        // parentheses in the binary stream)
        const textMatches = rawText.match(/\(([^)]{2,})\)/g) || []
        const extractedText = textMatches
          .map(m => m.slice(1, -1))
          .filter(s => /[a-zA-Z]{2,}/.test(s))
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim()

        if (!extractedText || extractedText.length < 50) {
          throw new Error(
            'Could not extract readable text from this PDF. ' +
            'Please try "Paste Text" mode and copy the job ' +
            'description text manually.'
          )
        }

        messageContent = extractedText
        setLoadingText('Analysing for bias...')

      } else {
        messageContent = textInput.trim()
      }

      // Call Groq API with extracted text
      const response = await fetch(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
          },
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
        }
      )

      const data = await response.json()
      const raw = data.choices?.[0]?.message?.content || ''

      // Strip any markdown backticks if present
      const cleaned = raw
        .replace(/```json/gi, '')
        .replace(/```/g, '')
        .trim()

      const parsed = JSON.parse(cleaned)
      setResult(parsed)

    } catch (err) {
      if (err.message.includes('Could not extract')) {
        setError(err.message)
      } else if (err instanceof SyntaxError) {
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
              <textarea
                style={s.textarea}
                placeholder="Paste your job description here…"
                value={textInput}
                onChange={e => setTextInput(e.target.value)}
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
