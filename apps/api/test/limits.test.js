import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { validate } from 'class-validator'

import assertChunkLimit from '../src/helpers/assert-chunk-limit'
import { CreateService } from '../src/modules/documents/create.service'
import { AskDto } from '../src/modules/chat/dto/ask.dto'
import AppValidationError from '../src/exceptions/AppValidationError'
import uploads from '../src/config/uploads'

import '../src/models'

describe('request limits', () => {
    it('rejects an empty question before ask runs', async () => {
        const dto = new AskDto()
        dto.question = ''
        dto.mode = 'web'
        const errors = await validate(dto)
        assert.ok(errors.length, 'empty question should fail validation')
        assert.match(Object.values(errors[0].constraints || {})[0], /required/i)
    })

    it('rejects uploads over the configured byte cap', async () => {
        const service = new CreateService()
        await assert.rejects(
            () =>
                service.create({
                    file: {
                        size: uploads.maxBytes + 1,
                        buffer: Buffer.from('x'),
                        originalname: 'big.txt',
                        mimetype: 'text/plain',
                    },
                    user: { id: '6f1c2a40-7b2e-4c1a-9d5e-1a2b3c4d5e6f' },
                }),
            (error) => {
                assert.ok(error instanceof AppValidationError)
                assert.equal(error.code, 422)
                assert.equal(error.validationKey, 'fileTooLarge')
                return true
            }
        )
    })

    it('rejects chunk lists above the document cap', () => {
        const chunks = Array.from({ length: 2001 }, (_, index) => ({
            index,
            content: 'section text',
        }))
        assert.throws(() => assertChunkLimit(chunks), (error) => {
            assert.ok(error instanceof AppValidationError)
            assert.equal(error.validationKey, 'tooManyChunks')
            return true
        })
    })
})
