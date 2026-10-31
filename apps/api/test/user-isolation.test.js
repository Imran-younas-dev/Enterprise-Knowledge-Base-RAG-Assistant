import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { RegisterService } from '../src/modules/auth/register.service'
import { ChunksService } from '../src/modules/documents/chunks.service'
import { GetService } from '../src/modules/documents/get.service'
import { ViewService } from '../src/modules/documents/view.service'
import AppValidationError from '../src/exceptions/AppValidationError'
import Document from '../src/models/Document'
import DocumentChunk from '../src/models/DocumentChunk'
import User from '../src/models/User'
import { SearchService } from '../src/modules/retrieval/search.service'

import '../src/models'

const USER_A_ID = '6f1c2a40-7b2e-4c1a-9d5e-1a2b3c4d5e6f'
const USER_A_DOCUMENT_ID = '8a2d4c10-1e6b-4f8a-9c3d-2b7e5a9c1d44'
const USER_B_EMAIL = 'day24-isolated@example.com'
const USER_B_PASSWORD = 'isolation-test-password'
const USER_A_SECRET =
    'retry it once and then record the error'

describe('user isolation', () => {
    it('keeps another user off the document list, detail, chunks, and search', async () => {
        const userB = await ensureUserB()
        const ownerDocument = await Document.findOne({
            where: { id: USER_A_DOCUMENT_ID, ownerId: USER_A_ID },
        })
        assert.ok(ownerDocument, 'seed owner document is required for this test')

        const ownerChunk = await DocumentChunk.findOne({
            where: { documentId: USER_A_DOCUMENT_ID },
        })
        assert.ok(ownerChunk, 'seed owner chunk is required for this test')
        assert.match(String(ownerChunk.get('content')), /retry it once/)

        const list = await new GetService().get({ user: { id: userB.get('id') } })
        const listedIds = list.map((row) => row.id)
        assert.ok(!listedIds.includes(USER_A_DOCUMENT_ID))

        await assertNotFound(async () => {
            await new ViewService().view({
                params: { id: USER_A_DOCUMENT_ID },
                user: { id: userB.get('id') },
            })
        })

        await assertNotFound(async () => {
            await new ChunksService().chunks({
                params: { id: USER_A_DOCUMENT_ID },
                user: { id: userB.get('id') },
            })
        })

        const search = await new SearchService().search({
            body: {
                question:
                    'When a reconciliation job fails, retry it once and then record the error.',
                mode: 'web',
            },
            user: { id: userB.get('id') },
        })

        const retrievedText = search.chunks.map((chunk) => chunk.content).join('\n')
        assert.ok(
            !retrievedText.includes(USER_A_SECRET),
            'user B must not retrieve user A chunk text'
        )
        assert.ok(
            !search.chunks.some(
                (chunk) => chunk.documentId === USER_A_DOCUMENT_ID
            ),
            'user B must not retrieve user A document id'
        )
    })
})

async function ensureUserB() {
    const existing = await User.findOne({ where: { email: USER_B_EMAIL } })
    if (existing) {
        return existing
    }

    await new RegisterService().register({
        body: {
            email: USER_B_EMAIL,
            password: USER_B_PASSWORD,
        },
    })

    return User.findOne({ where: { email: USER_B_EMAIL } })
}

async function assertNotFound(action) {
    try {
        await action()
        assert.fail('expected 404')
    } catch (error) {
        assert.ok(error instanceof AppValidationError)
        assert.equal(error.code, 404)
        assert.match(error.message, /Document was not found/)
    }
}
