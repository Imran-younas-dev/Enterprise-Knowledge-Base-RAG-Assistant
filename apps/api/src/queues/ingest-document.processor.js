import { Process, Processor } from '@nestjs/bull'
import { Op } from 'sequelize'

/* import models */
import { sequelize } from '../models'
import Document from '../models/Document'
import DocumentChunk from '../models/DocumentChunk'

/* import helpers */
import { chunkPages } from '../helpers/chunk-text'
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

const TRANSIENT_CODES = new Set(['embeddingFailed', 'ingestionFailed'])

@Processor('ingestDocument')
export class IngestDocumentProcessor {
    @Process()
    async handle(job) {
        const documentId = job.data.documentId
        const document = await Document.findByPk(documentId)

        if (!document || isClosed(document.get('status'))) {
            return
        }

        try {
            const [started] = await Document.update(
                { status: 'processing', errorCode: null, errorSummary: null },
                {
                    where: {
                        id: documentId,
                        status: { [Op.notIn]: ['deleted', 'deleting'] },
                    },
                }
            )

            if (!started) {
                return
            }

            const buffer = await loadUpload(document.get('storageKey'))
            const parsed = await parseDocument({
                filename: document.get('originalFilename'),
                buffer,
            })
            const chunks = chunkPages(parsed.pages)

            const current = await Document.findByPk(documentId)
            if (!current || isClosed(current.get('status'))) {
                return
            }

            const rows = await replaceChunks(documentId, chunks)
            await storeChunkVectors(rows)
            await Document.update(
                { status: 'ready', errorCode: null, errorSummary: null },
                { where: { id: documentId, status: 'processing' } }
            )
        } catch (error) {
            const code = safeCode(error)
            if (willRetry(job, code)) {
                // eslint-disable-next-line no-console
                console.log(
                    `ingestDocument retry ${Number(job.attemptsMade || 0) + 1}`
                )
                throw error
            }

            await Document.update(
                {
                    status: 'failed',
                    errorCode: code,
                    errorSummary: safeSummary(code),
                },
                {
                    where: {
                        id: documentId,
                        status: { [Op.notIn]: ['deleted', 'deleting'] },
                    },
                }
            )

            if (TRANSIENT_CODES.has(code)) {
                throw error
            }
        }
    }
}

async function replaceChunks(documentId, chunks) {
    return sequelize.transaction(async (transaction) => {
        await DocumentChunk.destroy({
            where: { documentId },
            transaction,
        })

        return DocumentChunk.bulkCreate(
            chunks.map((chunk) => ({
                documentId,
                chunkIndex: chunk.index,
                content: chunk.content,
                pageNumber: chunk.pageNumber,
                sectionTitle: chunk.sectionTitle,
                metadata: chunk.metadata,
            })),
            { transaction }
        )
    })
}

function isClosed(status) {
    return status === 'deleted' || status === 'deleting'
}

function willRetry(job, code) {
    if (!TRANSIENT_CODES.has(code)) {
        return false
    }

    const attempts = Number(job.opts && job.opts.attempts) || 1
    const made = Number(job.attemptsMade || 0)

    return made + 1 < attempts
}

function safeCode(error) {
    if (error && SAFE_KEYS.has(error.key)) {
        return error.key
    }

    if (error && error.message === 'embedding-provider-failed') {
        return 'embeddingFailed'
    }

    return 'ingestionFailed'
}

function safeSummary(code) {
    return translate('errors', code)
}
