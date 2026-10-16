import { Injectable } from '@nestjs/common'

/* import helpers */
import translate from '../../helpers/translate'

@Injectable()
export class CheckService {
    async check() {
        return { status: translate('messages', 'healthOk') }
    }
}
