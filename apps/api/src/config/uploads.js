const PDF = 'application/pdf'
const DOCX =
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
const TEXT = 'text/plain'
const MARKDOWN = new Set(['text/markdown', 'text/x-markdown'])

const EXTENSIONS = {
    '.pdf': PDF,
    '.docx': DOCX,
    '.txt': TEXT,
    '.md': 'text/markdown',
    '.markdown': 'text/markdown',
}

export default {
    maxBytes: Number(process.env.UPLOAD_MAX_BYTES || 10 * 1024 * 1024),
    isAllowed(mimeType, extension) {
        const mime = String(mimeType || '').toLowerCase()
        const ext = String(extension || '').toLowerCase()
        if (!EXTENSIONS[ext]) {
            return false
        }
        if (mime === 'application/octet-stream' || mime === '') {
            return true
        }
        if (ext === '.pdf') {
            return mime === PDF
        }
        if (ext === '.docx') {
            return mime === DOCX
        }
        if (ext === '.txt') {
            return mime === TEXT
        }
        return MARKDOWN.has(mime) || mime === TEXT
    },
}
