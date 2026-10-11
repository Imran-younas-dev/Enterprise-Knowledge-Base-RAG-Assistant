import { Injectable } from '@nestjs/common'

@Injectable()
export class CheckService {
    async check() {
        return { status: 'ok' }
    }
}
