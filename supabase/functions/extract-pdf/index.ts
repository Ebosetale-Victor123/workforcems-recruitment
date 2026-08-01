import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('pdf') as File

    if (!file) {
      return new Response(
        JSON.stringify({ error: 'No PDF file provided' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Read file as ArrayBuffer
    const arrayBuffer = await file.arrayBuffer()
    const bytes = new Uint8Array(arrayBuffer)

    // Extract text using parenthesis stream parsing
    // (works for uncompressed PDFs)
    let extractedText = ''
    let i = 0

    while (i < bytes.length) {
      if (bytes[i] === 40) { // '('
        let text = ''
        i++
        let depth = 1
        while (i < bytes.length && depth > 0) {
          const c = bytes[i]
          if (c === 40) depth++
          else if (c === 41) {
            depth--
            if (depth === 0) break
          } else if (c === 92) {
            i++
            const escaped = bytes[i]
            if (escaped === 110) text += '\n'
            else if (escaped === 116) text += '\t'
            else if (escaped === 114) text += '\r'
            else if (escaped >= 32 && escaped <= 126) {
              text += String.fromCharCode(escaped)
            }
          } else if (c >= 32 && c <= 126) {
            text += String.fromCharCode(c)
          }
          i++
        }
        if (text.length > 1 && /[a-zA-Z]{2,}/.test(text)) {
          extractedText += text + ' '
        }
      }
      i++
    }

    // Clean extracted text
    const cleaned = extractedText
      .replace(/[A-Z]{20,}/g, '')
      .replace(/[^a-zA-Z0-9\s.,!?;:'"()\-@]/g, ' ')
      .replace(/\b\w{25,}\b/g, '')
      .replace(/\s+/g, ' ')
      .trim()

    // Check if we got readable text
    const words = cleaned.split(/\s+/).filter(w =>
      w.length > 2 && /[a-zA-Z]/.test(w)
    )
    const noisyTokens = words.filter(w =>
      /[a-z][A-Z]/.test(w) || /[0-9][a-zA-Z]|[a-zA-Z][0-9]/.test(w)
    )
    const noisyRatio = words.length > 0
      ? noisyTokens.length / words.length
      : 1

    const isReadable = words.length >= 30 && noisyRatio < 0.15

    if (!isReadable) {
      // PDF is compressed/encoded — byte-scanning cannot recover
      // real text from it. Tell the caller plainly rather than
      // fabricating placeholder content.
      return new Response(
        JSON.stringify({
          text: '',
          error: 'compressed',
          message: 'PDF uses compressed encoding. Please paste text manually.'
        }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      )
    }

    return new Response(
      JSON.stringify({ text: cleaned, method: 'extracted' }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )

  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
