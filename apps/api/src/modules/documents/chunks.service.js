import { Injectable } from '@nestjs/common'
import { Op } from 'sequelize'

/* import models */
import '../../models'
import Document from '../../models/Document'
import DocumentChunk from '../../models/DocumentChunk'

/* import helpers */
import translate from '../../helpers/translate'

/* import exceptions */
import AppValidationError from '../../exceptions/AppValidationError'

@Injectable()
export class ChunksService {
    async chunks(request) {
        const document = await Document.findOne({
            where: {
                id: request.params.id,
                ownerId: request.user.id,
                status: { [Op.ne]: 'deleted' },
            },
        })

        if (!document) {
            throw new AppValidationError(
                translate('errors', 'notFound', { name: 'Document' }),
                404
            )
        }

        const rows = await DocumentChunk.findAll({
            where: { documentId: document.get('id') },
            order: [['chunkIndex', 'ASC']],
        })

        return rows.map((row) => ({
            id: row.get('id'),
            documentId: row.get('documentId'),
            chunkIndex: row.get('chunkIndex'),
            content: row.get('content'),
            pageNumber: row.get('pageNumber'),
            sectionTitle: row.get('sectionTitle'),
            originalFilename: document.get('originalFilename'),
        }))
    }
}
