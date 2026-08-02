import * as pdfjsLib from 'pdfjs-dist'
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl

async function renderPageToBase64(page) {
  const viewport = page.getViewport({ scale: 2.0 })
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  canvas.width = viewport.width
  canvas.height = viewport.height

  await page.render({ canvasContext: context, viewport }).promise

  const base64 = canvas.toDataURL('image/png').split(',')[1]

  canvas.width = 0
  canvas.height = 0

  return base64
}

async function extractTextViaGroqVision(base64Image, pageNum) {
  const response = await fetch('/api/groq', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Extract ALL text from this CV/resume page exactly as written.
Return only the text content, nothing else.
No commentary, no formatting changes, no markdown.
Just the raw text from the document.`
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/png;base64,${base64Image}`
              }
            }
          ]
        }
      ]
    })
  })

  const data = await response.json()
  const text = data.content?.[0]?.text ||
               data.choices?.[0]?.message?.content || ''
  return text.trim()
}

export async function extractTextFromPDF(file, onProgress) {
  // Re-assert worker — defensive singleton fix
  pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl

  try {
    if (onProgress) onProgress('Loading PDF...')

    const arrayBuffer = await file.arrayBuffer()

    pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl

    const pdf = await pdfjsLib.getDocument({
      data: arrayBuffer
    }).promise

    // Stage 1 — Try native text extraction first (fast path)
    if (onProgress) onProgress('Reading PDF...')

    let nativeText = ''
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const textContent = await page.getTextContent()
      nativeText += textContent.items.map(item => item.str).join(' ') + '\n'
    }
    nativeText = nativeText.trim()

    if (nativeText.length >= 50) {
      return nativeText
    }

    // Stage 2 — PDF has no text layer (scanned/image-based)
    // Render pages to images and send to Groq Vision
    if (onProgress) {
      onProgress('Scanning PDF with AI vision — please wait...')
    }

    const maxPages = Math.min(pdf.numPages, 3)
    let fullText = ''

    for (let i = 1; i <= maxPages; i++) {
      if (onProgress) {
        onProgress(`Reading page ${i} of ${maxPages}...`)
      }

      const page = await pdf.getPage(i)
      const base64 = await renderPageToBase64(page)
      const pageText = await extractTextViaGroqVision(base64, i)
      fullText += pageText + '\n\n'
    }

    fullText = fullText.trim()

    if (fullText.length >= 50) {
      return fullText
    }

    throw new Error(
      'Could not extract readable text from this PDF. ' +
      'Please paste your CV text in the box below instead.'
    )

  } catch (error) {
    if (
      error.message.includes('Could not extract') ||
      error.message.includes('Please paste')
    ) {
      throw error
    }
    throw new Error(
      'PDF reading failed: ' + error.message +
      '. Please paste your CV text below instead.'
    )
  }
}
