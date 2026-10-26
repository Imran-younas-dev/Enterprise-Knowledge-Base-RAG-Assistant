import { Injectable } from '@nestjs/common'
import { Op } from 'sequelize'

/* import models */
import '../../models'
import Document from '../../models/Document'

/* import helpers */
import enqueueIngest from '../../helpers/enqueue-ingest'
import translate from '../../helpers/translate'

/* import exceptions */
import AppValidationError from '../../exceptions/AppValidationError'

@Injectable()
export class ReprocessService {
    async reprocess(request) {
        const id = request.params.id
        const document = await Document.findOne({
            where: {
                id,
                ownerId: request.user.id,
                status: { [Op.notIn]: ['deleted', 'deleting'] },
            },
        })

        if (!document) {
            throw new AppValidationError(
                translate('errors', 'notFound', { name: 'Document' }),
                404
            )
        }

        await Document.update(
            { status: 'queued', errorCode: null, errorSummary: null },
            {
                where: {
                    id,
                    ownerId: request.user.id,
                    status: { [Op.notIn]: ['deleted', 'deleting'] },
                },
            }
        )

        await enqueueIngest(id)

        return { id, status: 'queued' }
    }
}
