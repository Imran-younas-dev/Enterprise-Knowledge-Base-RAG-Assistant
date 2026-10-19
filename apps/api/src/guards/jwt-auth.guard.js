import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'

/* import config */
import jwtOptions from '../config/jwt'

/* import helpers */
import translate from '../helpers/translate'

/* import exceptions */
import AppValidationError from '../exceptions/AppValidationError'

@Injectable()
export class AuthGuard {
    constructor() {
        this.jwtService = new JwtService(jwtOptions())
    }

    async canActivate(context) {
        const request = context.switchToHttp().getRequest()
        const token = bearerToken(request.headers.authorization)

        if (!token) {
            throw new AppValidationError(
                translate('errors', 'unauthorized'),
                401
            )
        }

        try {
            const payload = await this.jwtService.verifyAsync(token)
            request.user = {
                id: payload.sub,
                email: payload.email,
                scopes: Array.isArray(payload.scopes) ? payload.scopes : [],
            }
        } catch (_error) {
            throw new AppValidationError(
                translate('errors', 'unauthorized'),
                401
            )
        }

        return true
    }
}

function bearerToken(header) {
    if (typeof header !== 'string') {
        return ''
    }

    const [scheme, token] = header.split(' ')
    if (scheme !== 'Bearer' || !token) {
        return ''
    }

    return token
}
