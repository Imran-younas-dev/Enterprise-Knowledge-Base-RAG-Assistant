import { Process, Processor } from '@nestjs/bull'

/* import models */
import '../models'
import Document from '../models/Document'
import DocumentChunk from '../models/DocumentChunk'

/* import helpers */
import chunkText from '../helpers/chunk-text'
import loadUpload from '../helpers/load-upload'
import parseDocument from '../helpers/parse-document'
import storeChunkVectors from '../helpers/store-chunk-vectors'
import translate from '../helpers/translate'

const SAFE_KEYS = new Set([
    'notSupportedYet',
    'emptyText',
    'embeddingFailed',
    'ingestionFailed',
])

@Processor('ingestDocument')
export class IngestDocumentProcessor {
    @Process()
    async handle(job) {
        const documentId = job.data.documentId
        const document = await Document.findByPk(documentId)

        if (!document) {
            return
        }

        try {
            await Document.update(
                { status: 'processing', errorSummary: null },
                { where: { id: documentId } }
            )

            const buffer = await loadUpload(document.get('storageKey'))
            const parsed = parseDocument({
                filename: document.get('originalFilename'),
                buffer,
            })
            const chunks = chunkText({
                text: parsed.text,
                pageNumber: parsed.pageNumber,
            })

            await DocumentChunk.destroy({ where: { documentId } })
            const rows = await DocumentChunk.bulkCreate(
                chunks.map((chunk) => ({
                    documentId,
                    chunkIndex: chunk.index,
                    content: chunk.content,
                    pageNumber: chunk.pageNumber,
                    sectionTitle: chunk.sectionTitle,
                    metadata: chunk.metadata,
                }))
            )

            await storeChunkVectors(rows)
            await Document.update(
                { status: 'ready', errorSummary: null },
                { where: { id: documentId } }
            )
        } catch (error) {
            await Document.update(
                {
                    status: 'failed',
                    errorSummary: safeSummary(error),
                },
                { where: { id: documentId } }
            )
        }
    }
}

function safeSummary(error) {
    if (error && SAFE_KEYS.has(error.key)) {
        return translate('errors', error.key)
    }

    if (error && error.message === 'embedding-provider-failed') {
        return translate('errors', 'embeddingFailed')
    }

    return translate('errors', 'ingestionFailed')
}
