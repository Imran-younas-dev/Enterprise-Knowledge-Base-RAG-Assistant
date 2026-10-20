import path from 'path'

/* import helpers */
import translate from './translate'

/* import exceptions */
import AppValidationError from '../exceptions/AppValidationError'

const TEXT_EXTENSIONS = new Set(['.txt', '.md', '.markdown'])

export default function parseDocument({ filename, buffer }) {
    const extension = path.extname(filename || '').toLowerCase()

    if (extension === '.pdf' || extension === '.docx') {
        throw parseError('notSupportedYet')
    }

    if (!TEXT_EXTENSIONS.has(extension)) {
        throw parseError('notSupportedYet')
    }

    const text = buffer.toString('utf8').replace(/^\uFEFF/, '')
    if (!text.trim()) {
        throw parseError('emptyText')
    }

    return {
        text,
        pageNumber: 1,
    }
}

function parseError(key) {
    const error = new AppValidationError(translate('errors', key), 422)
    error.key = key
    return error
}
