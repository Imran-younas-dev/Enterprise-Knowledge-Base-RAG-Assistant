import { Catch, HttpException, HttpStatus } from '@nestjs/common'

import AppValidationError from '../exceptions/AppValidationError'

@Catch()
export class AllExceptionsFilter {
    catch(exception, host) {
        const response = host.switchToHttp().getResponse()

        if (exception instanceof AppValidationError) {
            const payload = { message: exception.message }
            if (exception.errors) {
                payload.errors = exception.errors
            }
            return response.status(exception.code).json(payload)
        }

        if (exception instanceof HttpException) {
            return response.status(exception.getStatus()).json({
                message: exception.message,
            })
        }

        return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            message: 'Internal server error',
        })
    }
}
