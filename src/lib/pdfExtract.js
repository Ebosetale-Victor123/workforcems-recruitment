import * as pdfjsLib from 'pdfjs-dist'

// Set worker source once globally using import.meta.url
// This is the proven fix for singleton race conditions.
// Note: pdfjs-dist v6+ only ships the worker as .mjs (no .js build).
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString()

export async function extractTextFromPDF(file) {
  try {
    const arrayBuffer = await file.arrayBuffer()

    // Re-assert worker URL before every getDocument call
    // Critical fix for singleton race conditions
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.min.mjs',
      import.meta.url
    ).toString()

    const pdf = await pdfjsLib.getDocument({
      data: arrayBuffer
    }).promise

    let fullText = ''

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const textContent = await page.getTextContent()
      const pageText = textContent.items
        .map(item => item.str)
        .join(' ')
      fullText += pageText + '\n'
    }

    const extracted = fullText.trim()

    if (extracted.length < 50) {
      throw new Error(
        'Could not extract readable text from this PDF. ' +
        'Please paste your text instead.'
      )
    }

    return extracted

  } catch (error) {
    if (error.message.includes('Could not extract')) {
      throw error
    }
    throw new Error(
      'PDF reading failed. Please paste your text instead.'
    )
  }
}
