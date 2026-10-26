import { Injectable } from '@nestjs/common'

/* import models */
import { sequelize } from '../../models'
import Document from '../../models/Document'
import DocumentChunk from '../../models/DocumentChunk'

/* import helpers */
import removeUpload from '../../helpers/remove-upload'
import translate from '../../helpers/translate'

/* import exceptions */
import AppValidationError from '../../exceptions/AppValidationError'

@Injectable()
export class RemoveService {
    async remove(request) {
        const id = request.params.id
        const document = await Document.findOne({
            where: {
                id,
                ownerId: request.user.id,
            },
        })

        if (!document || document.get('status') === 'deleted') {
            throw new AppValidationError(
                translate('errors', 'notFound', { name: 'Document' }),
                404
            )
        }

        const previous = document.get('status')
        await Document.update(
            { status: 'deleting', errorCode: null, errorSummary: null },
            { where: { id, ownerId: request.user.id } }
        )

        try {
            await removeUpload(document.get('storageKey'))
        } catch {
            await Document.update(
                { status: previous },
                {
                    where: {
                        id,
                        ownerId: request.user.id,
                        status: 'deleting',
                    },
                }
            )
            throw new AppValidationError(
                translate('errors', 'deleteFailed'),
                502
            )
        }

        await sequelize.transaction(async (transaction) => {
            await DocumentChunk.destroy({
                where: { documentId: id },
                transaction,
            })
            await Document.update(
                { status: 'deleted', errorCode: null, errorSummary: null },
                { where: { id, ownerId: request.user.id }, transaction }
            )
        })

        return { id, status: 'deleted' }
    }
}
