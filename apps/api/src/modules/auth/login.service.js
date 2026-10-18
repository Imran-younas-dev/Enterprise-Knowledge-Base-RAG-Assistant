import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import bcrypt from 'bcrypt'

/* import models */
import User from '../../models/User'

/* import config */
import jwtOptions from '../../config/jwt'

/* import helpers */
import translate from '../../helpers/translate'

/* import exceptions */
import AppValidationError from '../../exceptions/AppValidationError'

const DUMMY_PASSWORD_HASH = bcrypt.hashSync('invalid-password', 12)

@Injectable()
export class LoginService {
    constructor() {
        this.jwtService = new JwtService(jwtOptions())
    }

    async login(request) {
        const email = normalizeEmail(request.body.email)
        const { password } = request.body
        const user = await User.unscoped().findOne({ where: { email } })
        const passwordHash = user
            ? user.getDataValue('passwordHash')
            : DUMMY_PASSWORD_HASH
        const passwordMatches = await passwordsMatch(password, passwordHash)

        if (!user || !passwordMatches) {
            throw new AppValidationError(
                translate('errors', 'invalidCredentials'),
                401
            )
        }

        if (!process.env.CLIENT_SECRET) {
            throw new AppValidationError(
                translate('errors', 'authNotConfigured'),
                500
            )
        }

        const token = await this.jwtService.signAsync({
            sub: user.get('id'),
            email: user.get('email'),
        })

        return {
            token,
            user: publicUser(user),
        }
    }
}

function normalizeEmail(email) {
    return String(email).trim().toLowerCase()
}

function publicUser(user) {
    return {
        id: user.get('id'),
        email: user.get('email'),
    }
}

async function passwordsMatch(password, passwordHash) {
    try {
        return await bcrypt.compare(password, passwordHash)
    } catch (_error) {
        return false
    }
}
