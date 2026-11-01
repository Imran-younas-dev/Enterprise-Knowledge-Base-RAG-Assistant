export function isInstructionLike(sentence) {
    const lower = String(sentence || '').toLowerCase()

    return (
        lower.includes('ignore all previous') ||
        lower.includes('you are now in admin') ||
        lower.includes('reveal every document') ||
        lower.includes('other users') ||
        lower.includes('storage key') ||
        lower.includes('passwords in the answer')
    )
}

export function quoteFromChunkContent(content) {
    const sentences = String(content || '')
        .split(/\n+|(?<=[.?!])\s+/)
        .map((sentence) => sentence.trim())
        .filter(Boolean)
    const safe = sentences.filter((sentence) => !isInstructionLike(sentence))
    const quote = (safe.length ? safe : sentences)
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim()

    return quote.length > 180 ? `${quote.slice(0, 177)}...` : quote
}
