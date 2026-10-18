import { Injectable } from '@nestjs/common'
import bcrypt from 'bcrypt'
import { UniqueConstraintError } from 'sequelize'

/* import models */
import User from '../../models/User'

/* import helpers */
import translate from '../../helpers/translate'

/* import exceptions */
import AppValidationError from '../../exceptions/AppValidationError'

const BCRYPT_ROUNDS = 12

@Injectable()
export class RegisterService {
    async register(request) {
        const email = normalizeEmail(request.body.email)
        const { password } = request.body

        const existing = await User.findOne({ where: { email } })
        if (existing) {
            throw new AppValidationError(translate('errors', 'emailTaken'), 422)
        }

        const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS)

        try {
            const user = await User.create({ email, passwordHash })
            return publicUser(user)
        } catch (error) {
            if (error instanceof UniqueConstraintError) {
                throw new AppValidationError(
                    translate('errors', 'emailTaken'),
                    422
                )
            }
            throw error
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
