import { Dependencies, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'

/* import decorators */
import { CHECK_SCOPE_KEY } from '../decorators/check-scope.decorator'

/* import helpers */
import translate from '../helpers/translate'

/* import exceptions */
import AppValidationError from '../exceptions/AppValidationError'

const SUPER_ADMIN_SCOPE = 'super-admin'

@Injectable()
@Dependencies(Reflector)
export class CheckScopeGuard {
    constructor(reflector) {
        this.reflector = reflector
    }

    canActivate(context) {
        const required =
            this.reflector.getAllAndOverride(CHECK_SCOPE_KEY, [
                context.getHandler(),
                context.getClass(),
            ]) || []

        if (!required.length) {
            return true
        }

        const request = context.switchToHttp().getRequest()
        const scopes = request.user?.scopes || []

        if (scopes.includes(SUPER_ADMIN_SCOPE)) {
            return true
        }

        const allowed = required.some((scope) => scopes.includes(scope))
        if (!allowed) {
            throw new AppValidationError(
                translate('errors', 'insufficientScope'),
                403
            )
        }

        return true
    }
}
