import { useState } from 'react'
import TopBar from '../components/layout/TopBar'

const SAMPLE_BIASED_JD = `We're looking for a young and energetic Marketing Executive to join our growing team in Lagos. The ideal candidate is a true rockstar and social media ninja who is a digital native, always plugged into the latest trends.

This role is perfect for a recent graduate looking to make their mark. He/she must be a native English speaker with a strong command of English, both written and spoken, and should demonstrate strong culture fit with our work hard, play hard environment.

Responsibilities:
- Plan and execute social media campaigns across all platforms
- Man the front desk during community events and product launches
- Report directly to the Chairman of the marketing committee

Requirements:
- Bachelor's degree in Marketing, Communications or a related field
- Must be under 30 years old
- Excellent communication and organizational skills
- Comfortable working in a fast-paced startup environment`

const BIAS_PATTERNS = [
  { regex: /young and energetic/gi, category: 'Ageist', suggestion: 'motivated and driven' },
  { regex: /digital native/gi, category: 'Ageist', suggestion: 'digitally proficient' },
  { regex: /recent graduate/gi, category: 'Ageist', suggestion: 'early-career professional' },
  { regex: /under \d+ years old/gi, category: 'Ageist', suggestion: 'meets the experience requirements for this role' },
  { regex: /\bfresh graduate\b/gi, category: 'Ageist', suggestion: 'early-career candidate' },
  { regex: /\byoung\b/gi, category: 'Ageist', suggestion: 'motivated' },
  { regex: /\benergetic\b/gi, category: 'Ageist', suggestion: 'driven' },
  { regex: /he\/she/gi, category: 'Gendered', suggestion: 'they' },
  { regex: /\bman the\b/gi, category: 'Gendered', suggestion: 'staff' },
  { regex: /\bchairman\b/gi, category: 'Gendered', suggestion: 'chairperson' },
  { regex: /\bguy[s]?\b/gi, category: 'Gendered', suggestion: 'everyone / the team' },
  { regex: /\bmanpower\b/gi, category: 'Gendered', suggestion: 'workforce' },
  { regex: /\blockstar\b/gi, category: 'Cultural', suggestion: 'high performer' },
  { regex: /\bninja\b/gi, category: 'Cultural', suggestion: 'expert' },
  { regex: /work hard,?\s*play hard/gi, category: 'Cultural', suggestion: 'high-performance and balanced' },
  { regex: /rockstar/gi, category: 'Cultural', suggestion: 'high performer' },
  { regex: /native English speaker/gi, category: 'Exclusionary', suggestion: 'fluent English speaker' },
  { regex: /strong command of English/gi, category: 'Exclusionary', suggestion: 'effective written and verbal communication skills' },
  { regex: /culture fit/gi, category: 'Exclusionary', suggestion: 'culture add' },
]

const CATEGORY_COLOR = {
  Ageist: '#f59e0b',
  Gendered: '#3b82f6',
  Cultural: '#a855f7',
  Exclusionary: '#ef4444',
}

function HighlightedText({ text, found }) {
  if (!found || found.length === 0) {
    return (
      <p style={{ color: '#9ca3af', fontSize: 14, lineHeight: 1.7, whiteSpace: 'pre-wrap', margin: 0 }}>
        {text}
      </p>
    )
  }

  const sorted = [...found].sort((a, b) => b.phrase.length - a.phrase.length)
  const escaped = sorted.map(f => f.phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  const pattern = new RegExp(`(${escaped.join('|')})`, 'gi')
  const parts = text.split(pattern)

  return (
    <p style={{ fontSize: 14, lineHeight: 1.8, whiteSpace: 'pre-wrap', color: '#e5e7eb', margin: 0 }}>
      {parts.map((part, i) => {
        const match = found.find(f => f.phrase.toLowerCase() === part.toLowerCase())
        if (match) {
          const color = CATEGORY_COLOR[match.category] || '#9ca3af'
          return (
            <span
              key={i}
              title={`${match.category}: Replace with "${match.suggestion}"`}
              style={{
                background: color + '22',
                border: `1px solid ${color}`,
                borderRadius: 4,
                padding: '1px 4px',
                color,
                fontWeight: 600,
                cursor: 'help',
              }}
            >
              {part}
            </span>
          )
        }
        return <span key={i}>{part}</span>
      })}
    </p>
  )
}

export default function JobAdChecker() {
  const [text, setText] = useState(SAMPLE_BIASED_JD)
  const [result, setResult] = useState(null)
  const [scanning, setScanning] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleScan = () => {
    if (!text.trim()) return
    setScanning(true)
    setResult(null)

    setTimeout(() => {
      const found = []
      let rewritten = text

      BIAS_PATTERNS.forEach(({ regex, category, suggestion }) => {
        const matches = text.match(regex)
        if (matches) {
          matches.forEach(match => {
            if (!found.find(f => f.phrase.toLowerCase() === match.toLowerCase())) {
              found.push({ phrase: match, category, suggestion })
            }
          })
          rewritten = rewritten.replace(regex, suggestion)
        }
      })

      const score = found.length === 0 ? 'Low' : found.length <= 3 ? 'Medium' : 'High'
      setResult({ found, rewritten, score })
      setScanning(false)
    }, 800)
  }

  const handleReset = () => {
    setText(SAMPLE_BIASED_JD)
    setResult(null)
  }

  const handleUseRewrite = () => {
    setText(result.rewritten)
    setResult(null)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(result.rewritten)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const scoreBadge = result ? (() => {
    if (result.score === 'Low') return {
      text: '✓ Low Bias',
      bg: 'rgba(34,197,94,0.15)', color: '#22c55e', border: '1px solid #22c55e',
    }
    if (result.score === 'Medium') return {
      text: '⚠ Bias Detected',
      bg: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: '1px solid #f59e0b',
    }
    return {
      text: '🚨 High Bias Detected',
      bg: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid #ef4444',
    }
  })() : null

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <TopBar title="Job Ad Checker" />
      <div style={{ padding: '32px', flex: 1, overflowY: 'auto' }}>

        {/* Subtitle + action row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px', gap: '16px' }}>
          <p style={{ fontSize: '14px', color: '#9ca3af', margin: 0 }}>
            Paste a job description to check for bias and get an inclusive rewrite instantly.
          </p>
          <div style={{ display: 'flex', gap: '10px', flexShrink: 0 }}>
            <button
              type="button"
              onClick={handleReset}
              style={{
                background: 'transparent', border: '1px solid #2a2a2a',
                color: '#9ca3af', borderRadius: '8px', padding: '8px 16px',
                fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              Reset Sample
            </button>
            <button
              type="button"
              onClick={handleScan}
              disabled={scanning}
              style={{
                background: scanning ? '#2a2a2a' : '#ffffff',
                color: scanning ? '#9ca3af' : '#000000',
                border: 'none', borderRadius: '8px', padding: '10px 24px',
                fontWeight: '700', fontSize: '14px',
                cursor: scanning ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
              }}
            >
              {scanning ? 'Scanning...' : 'Scan for Bias'}
            </button>
          </div>
        </div>

        {/* Pre-scan: full-width textarea */}
        {!result && (
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            style={{
              width: '100%', background: '#141414', border: '1px solid #2a2a2a',
              borderRadius: '12px', padding: '16px', color: '#ffffff',
              fontSize: '14px', lineHeight: '1.7', minHeight: '400px',
              resize: 'vertical', display: 'block', outline: 'none',
              fontFamily: 'system-ui', boxSizing: 'border-box',
            }}
          />
        )}

        {/* Post-scan: two-column layout */}
        {result && (
          <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>

            {/* LEFT — analysis */}
            <div style={{ flex: '0 0 55%' }}>
              <div style={{
                background: '#141414', border: '1px solid #2a2a2a',
                borderRadius: '12px', padding: '24px',
              }}>
                {/* Header row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <span style={{ fontSize: '14px', color: '#9ca3af' }}>Analysis</span>
                  {scoreBadge && (
                    <span style={{
                      background: scoreBadge.bg, color: scoreBadge.color,
                      border: scoreBadge.border, borderRadius: '999px',
                      padding: '4px 12px', fontSize: '12px', fontWeight: '600',
                    }}>
                      {scoreBadge.text}
                    </span>
                  )}
                </div>

                {/* Highlighted text */}
                <HighlightedText text={text} found={result.found} />

                {/* Flagged phrases */}
                {result.found.length > 0 && (
                  <div style={{ marginTop: '24px' }}>
                    <div style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '12px' }}>
                      {result.found.length} phrase{result.found.length !== 1 ? 's' : ''} flagged
                    </div>
                    {result.found.map((f, i) => {
                      const color = CATEGORY_COLOR[f.category] || '#9ca3af'
                      return (
                        <div key={i} style={{
                          padding: '10px 0',
                          borderBottom: i < result.found.length - 1 ? '1px solid #1f1f1f' : 'none',
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: color, flexShrink: 0 }} />
                            <span style={{ color: '#ffffff', fontSize: '14px' }}>"{f.phrase}"</span>
                          </div>
                          <div style={{ paddingLeft: '16px', fontSize: '13px', color }}>
                            → {f.suggestion}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Legend */}
                <div style={{ display: 'flex', gap: '16px', marginTop: '20px', flexWrap: 'wrap' }}>
                  {Object.entries(CATEGORY_COLOR).map(([label, color]) => (
                    <span key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: color }} />
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT — rewrite */}
            <div style={{ flex: '0 0 calc(45% - 24px)', minWidth: 0 }}>
              <div style={{
                background: '#141414', border: '1px solid #22c55e',
                borderRadius: '12px', padding: '24px',
              }}>
                <div style={{ fontSize: '16px', fontWeight: '700', color: '#ffffff', marginBottom: '4px' }}>
                  Inclusive Rewrite
                </div>
                <div style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '0' }}>
                  AI-suggested neutral version
                </div>

                <div style={{
                  background: '#0a0a0a', border: '1px solid #1f1f1f',
                  borderRadius: '8px', padding: '16px', fontSize: '14px',
                  lineHeight: '1.7', color: '#e5e7eb', whiteSpace: 'pre-wrap',
                  margin: '16px 0', maxHeight: '400px', overflowY: 'auto',
                }}>
                  {result.rewritten}
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    type="button"
                    onClick={handleCopy}
                    style={{
                      flex: 1, background: 'transparent', border: '1px solid #2a2a2a',
                      color: '#9ca3af', borderRadius: '8px', padding: '10px 16px',
                      fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit',
                    }}
                  >
                    {copied ? 'Copied ✓' : 'Copy Rewrite'}
                  </button>
                  <button
                    type="button"
                    onClick={handleUseRewrite}
                    style={{
                      flex: 1, background: '#22c55e', color: '#000000',
                      border: 'none', borderRadius: '8px', padding: '10px 16px',
                      fontWeight: '700', fontSize: '14px',
                      cursor: 'pointer', fontFamily: 'inherit',
                    }}
                  >
                    Use This Version
                  </button>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  )
}
