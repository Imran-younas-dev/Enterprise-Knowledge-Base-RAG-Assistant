import { Injectable } from '@nestjs/common'

@Injectable()
export class MeService {
    async me(request) {
        const { id, email, scopes } = request.user
        return { id, email, scopes }
    }
}
