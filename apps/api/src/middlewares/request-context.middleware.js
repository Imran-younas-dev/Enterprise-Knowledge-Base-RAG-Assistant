import crypto from 'crypto'

import { Injectable } from '@nestjs/common'

/* import helpers */
import logRequest from '../helpers/log-request'

const TRACKED = [
    { method: 'POST', path: '/api/chat/ask' },
    { method: 'POST', path: '/api/documents' },
]

@Injectable()
export class RequestContextMiddleware {
    use(request, response, next) {
        const requestId = crypto.randomUUID()
        request.requestId = requestId

        const tracked = isTracked(request)
        if (tracked) {
            response.setHeader('X-Request-Id', requestId)
        }

        if (!tracked) {
            next()
            return
        }

        const started = process.hrtime.bigint()
        response.on('finish', () => {
            const durationMs = Number(process.hrtime.bigint() - started) / 1e6
            logRequest({
                requestId,
                method: request.method,
                path: requestPath(request),
                status: response.statusCode,
                durationMs: Math.round(durationMs),
            })
        })

        next()
    }
}

function isTracked(request) {
    const method = request.method
    const path = requestPath(request)
    return TRACKED.some((item) => item.method === method && item.path === path)
}

function requestPath(request) {
    const raw = request.originalUrl || request.url || ''
    const query = raw.indexOf('?')
    return query === -1 ? raw : raw.slice(0, query)
}
