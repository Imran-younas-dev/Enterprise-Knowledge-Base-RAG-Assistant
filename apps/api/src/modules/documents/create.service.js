import crypto from 'crypto'
import path from 'path'

import { Injectable } from '@nestjs/common'

/* import models */
import '../../models'
import Document from '../../models/Document'

/* import config */
import uploads from '../../config/uploads'

/* import helpers */
import enqueueIngest from '../../helpers/enqueue-ingest'
import storeUpload from '../../helpers/store-upload'
import translate from '../../helpers/translate'

/* import exceptions */
import AppValidationError from '../../exceptions/AppValidationError'

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

        await enqueueIngest(row.get('id'))

        return {
            id: row.get('id'),
            status: row.get('status'),
        }
    }
}

async function storeFile(buffer, storageKey) {
    try {
        return await storeUpload({ buffer, storageKey })
    } catch (_error) {
        throw new AppValidationError(translate('errors', 'uploadFailed'), 502)
    }
}
