import { Injectable } from '@nestjs/common'

/* import models */
import '../../models'
import Document from '../../models/Document'

@Injectable()
export class GetService {
    async get(request) {
        const rows = await Document.findAll({
            where: { ownerId: request.user.id },
            order: [['createdAt', 'DESC']],
        })

        return rows.map(presentDocument)
    }
}

export function presentDocument(document) {
    return {
        id: document.get('id'),
        title: document.get('title'),
        originalFilename: document.get('originalFilename'),
        mimeType: document.get('mimeType'),
        fileSizeBytes: document.get('fileSizeBytes'),
        status: document.get('status'),
        createdAt: document.get('createdAt'),
    }
}
