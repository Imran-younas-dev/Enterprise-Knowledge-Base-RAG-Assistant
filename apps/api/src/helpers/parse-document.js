import path from 'path'

import mammoth from 'mammoth'
import pdfParse from 'pdf-parse'

/* import helpers */
import translate from './translate'

/* import exceptions */
import AppValidationError from '../exceptions/AppValidationError'

const TEXT_EXTENSIONS = new Set(['.txt', '.md', '.markdown'])

export default async function parseDocument({ filename, buffer }) {
    const extension = path.extname(filename || '').toLowerCase()

    if (extension === '.pdf') {
        return parsePdf(buffer)
    }

    if (extension === '.docx') {
        return parseDocx(buffer)
    }

    if (!TEXT_EXTENSIONS.has(extension)) {
        throw parseError('notSupportedYet')
    }

    const text = buffer.toString('utf8').replace(/^\uFEFF/, '')
    if (!text.trim()) {
        throw parseError('emptyText')
    }

    return {
        pages: [
            {
                text,
                pageNumber: null,
            },
        ],
    }
}

async function parsePdf(buffer) {
    const pages = []

    try {
        await pdfParse(buffer, {
            pagerender: async (pageData) => {
                const textContent = await pageData.getTextContent()
                const text = pageText(textContent && textContent.items)
                if (!text.trim()) {
                    return ''
                }

                pages.push({
                    text,
                    pageNumber: exposedPageNumber(pageData),
                })
                return text
            },
        })
    } catch (error) {
        if (error && error.key) {
            throw error
        }
        throw parseError('ingestionFailed')
    }

    if (pages.length === 0) {
        throw parseError('emptyText')
    }

    return { pages }
}

async function parseDocx(buffer) {
    let html
    try {
        const result = await mammoth.convertToHtml({ buffer })
        html = result.value || ''
    } catch (error) {
        if (error && error.key) {
            throw error
        }
        throw parseError('ingestionFailed')
    }

    const text = docxHtmlToText(html)
    const sections = headingSections(text).filter((section) => section.trim())
    if (sections.length === 0) {
        throw parseError('emptyText')
    }

    return {
        pages: sections.map((section) => ({
            text: section,
            pageNumber: null,
        })),
    }
}

function headingSections(text) {
    const sections = []
    let current = []

    for (const line of text.split('\n')) {
        const startsHeading = /^#{1,6}\s+\S/.test(line.trim())
        if (startsHeading && current.some((item) => item.trim())) {
            sections.push(current.join('\n').trim())
            current = [line]
        } else {
            current.push(line)
        }
    }

    if (current.some((item) => item.trim())) {
        sections.push(current.join('\n').trim())
    }

    return sections
}

function docxHtmlToText(html) {
    const withHeadings = String(html).replace(
        /<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi,
        (_, level, inner) => {
            const title = stripTags(inner).trim()
            if (!title) {
                return '\n'
            }
            return `\n${'#'.repeat(Number(level))} ${title}\n`
        }
    )
    const withBreaks = withHeadings
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/p>/gi, '\n')
        .replace(/<\/li>/gi, '\n')

    return decodeHtml(stripTags(withBreaks))
        .replace(/\n{3,}/g, '\n\n')
        .trim()
}

function stripTags(value) {
    return String(value).replace(/<[^>]+>/g, '')
}

function decodeHtml(value) {
    return value
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
}

function pageText(items) {
    if (!Array.isArray(items)) {
        return ''
    }

    return items
        .map((item) => {
            if (!item || typeof item.str !== 'string') {
                return ''
            }
            return item.hasEOL ? `${item.str}\n` : item.str
        })
        .join('')
}

function exposedPageNumber(page) {
    const number = page && page.pageNumber
    if (!Number.isInteger(number) || number < 1) {
        return null
    }
    return number
}

function parseError(key) {
    const error = new AppValidationError(translate('errors', key), 422)
    error.key = key
    return error
}
