import crypto from 'crypto'
import path from 'path'

import { Injectable } from '@nestjs/common'
import Queue from 'bull'

/* import models */
import '../../models'
import Document from '../../models/Document'

/* import config */
import bullConfig from '../../config/bull'
import uploads from '../../config/uploads'

/* import helpers */
import storeUpload from '../../helpers/store-upload'
import translate from '../../helpers/translate'

/* import exceptions */
import AppValidationError from '../../exceptions/AppValidationError'

let ingestDocument

@Injectable()
export class CreateService {
    async create(request) {
        const file = request.file
        if (!file) {
            throw new AppValidationError(
                translate('errors', 'fileRequired'),
                422
            )
        }

        if (!process.env.CLOUDINARY_URL) {
            throw new AppValidationError(
                translate('errors', 'uploadNotConfigured'),
                500
            )
        }

        if (file.size > uploads.maxBytes) {
            throw new AppValidationError(
                translate('errors', 'fileTooLarge'),
                422
            )
        }

        const originalFilename = path.basename(file.originalname || 'document')
        const extension = path.extname(originalFilename).toLowerCase()
        if (!uploads.isAllowed(file.mimetype, extension)) {
            throw new AppValidationError(
                translate('errors', 'unsupportedType'),
                422
            )
        }

        const id = crypto.randomUUID()
        const storageKey = `rag/${id}`
        const stored = await storeFile(file.buffer, storageKey)

        let row
        try {
            row = await Document.create({
                id,
                ownerId: request.user.id,
                title: originalFilename,
                originalFilename,
                mimeType: file.mimetype || 'application/octet-stream',
                fileSizeBytes: file.size,
                storageKey: stored.publicId,
                contentHash: crypto
                    .createHash('sha256')
                    .update(file.buffer)
                    .digest('hex'),
                status: 'queued',
            })
        } catch (error) {
            await stored.remove()
            throw error
        }

        await enqueue(row.get('id'))

        return {
            id: row.get('id'),
            status: row.get('status'),
        }
    }
}

function queue() {
    if (!ingestDocument) {
        ingestDocument = new Queue('ingestDocument', bullConfig)
    }

    return ingestDocument
}

async function enqueue(documentId) {
    try {
        await queue().add({ documentId })
    } catch {
        await Document.update(
            {
                status: 'failed',
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

async function storeFile(buffer, storageKey) {
    try {
        return await storeUpload({ buffer, storageKey })
    } catch (_error) {
        throw new AppValidationError(translate('errors', 'uploadFailed'), 502)
    }
}
