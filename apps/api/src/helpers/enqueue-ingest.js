import Queue from 'bull'

/* import models */
import '../models'
import Document from '../models/Document'

/* import config */
import bullConfig from '../config/bull'

/* import helpers */
import translate from './translate'

/* import exceptions */
import AppValidationError from '../exceptions/AppValidationError'

const INGEST_ATTEMPTS = 3

let ingestDocument

export default async function enqueueIngest(documentId) {
    try {
        await queue().add(
            { documentId },
            {
                attempts: INGEST_ATTEMPTS,
                backoff: { type: 'fixed', delay: 500 },
            }
        )
    } catch {
        await Document.update(
            {
                status: 'failed',
                errorCode: 'ingestionFailed',
                errorSummary: translate('errors', 'ingestionFailed'),
            },
            { where: { id: documentId } }
        )
        throw new AppValidationError(
            translate('errors', 'ingestionFailed'),
            502
        )
    }
}

function queue() {
    if (!ingestDocument) {
        ingestDocument = new Queue('ingestDocument', bullConfig)
    }

    return ingestDocument
}
