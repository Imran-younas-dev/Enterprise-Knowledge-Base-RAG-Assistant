// 500 characters with 50 characters of overlap.
// Shorter pieces lose the surrounding sentence. Longer pieces can exceed
// the model context. Change these only after comparing retrieval on the
// same notes.

export const CHUNK_SIZE = 500
export const CHUNK_OVERLAP = 50

export function chunkPages(pages) {
    const chunks = []

    for (const page of pages) {
        const pageChunks = chunkText({
            text: page.text,
            pageNumber: page.pageNumber,
        })
        for (const chunk of pageChunks) {
            chunks.push({
                ...chunk,
                index: chunks.length,
            })
        }
    }

    return chunks
}

export default function chunkText({
    text,
    pageNumber = null,
    size = CHUNK_SIZE,
    overlap = CHUNK_OVERLAP,
}) {
    if (size <= overlap) {
        throw new Error('Chunk size must be larger than the overlap')
    }

    const chunks = []
    let start = 0
    let index = 0

    while (start < text.length) {
        const end = Math.min(start + size, text.length)
        chunks.push({
            index,
            content: text.slice(start, end),
            pageNumber,
            sectionTitle: sectionTitleAt(text, start),
            metadata: {
                characterStart: start,
                characterEnd: end,
            },
        })
        if (end >= text.length) {
            break
        }
        start = end - overlap
        index += 1
    }

    return chunks
}

function sectionTitleAt(text, start) {
    const ownLine = text.slice(start).split('\n')[0]
    const ownHeading = headingText(ownLine)
    if (ownHeading) {
        return ownHeading
    }

    const lines = text.slice(0, start).split('\n')
    let title = null
    for (const line of lines) {
        const heading = headingText(line)
        if (heading) {
            title = heading
        }
    }
    return title
}

function headingText(line) {
    const match = /^(#{1,6})\s+(\S.*)$/.exec(line.trim())
    if (!match) {
        return null
    }
    return match[2].trim()
}
