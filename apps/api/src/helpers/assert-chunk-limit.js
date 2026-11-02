/* import config */
import limits from '../config/limits'

/* import helpers */
import translate from './translate'

/* import exceptions */
import AppValidationError from '../exceptions/AppValidationError'

export default function assertChunkLimit(chunks) {
    if (chunks.length <= limits.maxChunksPerDocument) {
        return
    }

    const error = new AppValidationError(
        translate('errors', 'tooManyChunks'),
        422
    )
    error.validationKey = 'tooManyChunks'
    throw error
}
