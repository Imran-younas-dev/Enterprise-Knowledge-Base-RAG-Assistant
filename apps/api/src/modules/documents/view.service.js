import { Injectable } from '@nestjs/common'

/* import models */
import '../../models'
import Document from '../../models/Document'

/* import helpers */
import translate from '../../helpers/translate'

/* import exceptions */
import AppValidationError from '../../exceptions/AppValidationError'

/* import services */
import { presentDocument } from './get.service'

@Injectable()
export class ViewService {
    async view(request) {
        const document = await Document.findOne({
            where: {
                id: request.params.id,
                ownerId: request.user.id,
            },
        })

        if (!document) {
            throw new AppValidationError(
                translate('errors', 'notFound', { name: 'Document' }),
                404
            )
        }

        return presentDocument(document)
    }
}
