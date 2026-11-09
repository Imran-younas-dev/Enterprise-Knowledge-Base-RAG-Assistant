const DEFAULT_BASE = 'https://generativelanguage.googleapis.com/v1beta'

export default async function geminiGenerate({ model, prompt }) {
    const key = process.env.GEMINI_API_KEY
    if (!key) {
        const error = new Error('GEMINI_API_KEY is not set')
        error.key = 'authNotConfigured'
        throw error
    }

    const base = String(process.env.GEMINI_API_BASE || DEFAULT_BASE).replace(
        /\/$/,
        ''
    )
    const modelName = model || 'gemini-3-flash-preview'
    const url = `${base}/models/${modelName}:generateContent`

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
            'x-goog-api-key': key,
        },
        body: JSON.stringify({
            contents: [
                {
                    parts: [{ text: prompt }],
                },
            ],
            generationConfig: {
                temperature: 0.2,
                maxOutputTokens: 1024,
            },
        }),
    })

    const body = await response.json().catch(() => ({}))

    if (!response.ok) {
        const message =
            body.error && body.error.message
                ? body.error.message
                : `Gemini request failed (${response.status})`
        const error = new Error(message)
        error.key = 'answerFailed'
        throw error
    }

    const text = extractText(body)
    if (!text) {
        const error = new Error('answer-provider-failed')
        error.key = 'answerFailed'
        throw error
    }

    return text
}

function extractText(body) {
    const parts = body?.candidates?.[0]?.content?.parts
    if (!Array.isArray(parts)) {
        return ''
    }

    return parts
        .map((part) => (part && part.text ? String(part.text) : ''))
        .join('')
        .trim()
}
