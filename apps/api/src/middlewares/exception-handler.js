import { Catch, HttpException, HttpStatus } from '@nestjs/common'

import AppValidationError from '../exceptions/AppValidationError'
import translate from '../helpers/translate'

@Catch()
export class AllExceptionsFilter {
    catch(exception, host) {
        const response = host.switchToHttp().getResponse()

        if (exception instanceof AppValidationError) {
            const payload = { message: exception.message }
            if (exception.validationKey) {
                payload.key = exception.validationKey
            }
            if (exception.errors) {
                payload.errors = exception.errors
            }
            return response.status(exception.code).json(payload)
        }

        if (exception && exception.name === 'MulterError') {
            if (exception.code === 'LIMIT_FILE_SIZE') {
                return response.status(422).json({
                    message: translate('errors', 'fileTooLarge'),
                    key: 'fileTooLarge',
                })
            }
        }

        if (exception instanceof HttpException) {
            const status = exception.getStatus()
            if (status === HttpStatus.TOO_MANY_REQUESTS) {
                return response.status(status).json({
                    message: translate('errors', 'tooManyRequests'),
                    key: 'tooManyRequests',
                })
            }

            return response.status(status).json({
                message: readHttpMessage(exception),
            })
        }

        return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            message: 'Internal server error',
        })
    }
}

function readHttpMessage(exception) {
    const body = exception.getResponse()
    if (typeof body === 'string') {
        return body
    }
    if (body && typeof body.message === 'string') {
        return body.message
    }
    if (body && Array.isArray(body.message) && body.message.length) {
        return body.message[0]
    }
    return exception.message
}
