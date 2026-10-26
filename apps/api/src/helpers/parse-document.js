import path from 'path'

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

    if (extension === '.docx' || !TEXT_EXTENSIONS.has(extension)) {
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
