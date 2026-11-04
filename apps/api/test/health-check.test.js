import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import logRequest from '../src/helpers/log-request'
import translate from '../src/helpers/translate'

describe('health and request logs', () => {
    it('keeps request log lines free of document text', () => {
        const lines = []
        // eslint-disable-next-line no-console
        const original = console.log
        // eslint-disable-next-line no-console
        console.log = (...args) => {
            lines.push(args.join(' '))
        }
        try {
            logRequest({
                requestId: 'req-123',
                method: 'POST',
                path: '/api/chat/ask',
                status: 200,
                durationMs: 42,
            })
        } finally {
            // eslint-disable-next-line no-console
            console.log = original
        }

        assert.equal(lines.length, 1)
        assert.match(lines[0], /req-123/)
        assert.match(lines[0], /POST \/api\/chat\/ask 200 42ms/)
        assert.doesNotMatch(lines[0], /chunk|prompt|password/i)
    })

    it('uses safe dependency messages without credentials', () => {
        const databaseDown = translate('messages', 'healthDatabaseDown')
        const redisDown = translate('messages', 'healthRedisDown')

        assert.doesNotMatch(databaseDown, /password|@|:\d+/i)
        assert.doesNotMatch(redisDown, /password|@|:\d+/i)
        assert.match(databaseDown, /database/i)
        assert.match(redisDown, /redis/i)
    })
})
