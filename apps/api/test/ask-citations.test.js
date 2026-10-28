import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
    buildTrustedAskResult,
    INSUFFICIENT_ANSWER,
    knownCitations,
    presentCitation,
    quoteFromChunk,
} from '../src/modules/chat/ask.service'

const REAL_ID = '6f1c2a40-7b2e-4c1a-9d5e-1a2b3c4d5e6f'
const FAKE_ID = '00000000-0000-4000-8000-000000000001'

const sampleChunk = {
    id: REAL_ID,
    documentId: '8a2d4c10-1e6b-4f8a-9c3d-2b7e5a9c1d44',
    content:
        'When a reconciliation job fails, retry it once and then record the error.',
    originalFilename: 'Project_Phoenix.pdf',
    pageNumber: 1,
    sectionTitle: 'Payment note',
}

describe('trusted citations', () => {
    it('removes a fake model citation id that was not retrieved', () => {
        const filtered = knownCitations([REAL_ID, FAKE_ID], [REAL_ID])
        assert.deepEqual(filtered, [REAL_ID])
    })

    it('drops invented ids from the answer and keeps chunk-backed references', () => {
        const result = buildTrustedAskResult(
            {
                answer: `Retry once after failure [${REAL_ID}] [${FAKE_ID}]`,
                insufficientEvidence: false,
                citations: [REAL_ID, FAKE_ID],
            },
            [sampleChunk]
        )

        assert.equal(result.insufficientEvidence, false)
        assert.deepEqual(result.citations.map((item) => item.id), [REAL_ID])
        assert.match(result.answer, new RegExp(REAL_ID))
        assert.doesNotMatch(result.answer, new RegExp(FAKE_ID))
        assert.equal(
            result.citations[0].quote,
            quoteFromChunk(sampleChunk.content)
        )
        assert.equal(result.citations[0].title, 'Project_Phoenix.pdf')
        assert.equal(result.citations[0].page, 1)
        assert.equal(result.citations[0].section, 'Payment note')
    })

    it('treats an answer with only invented ids as insufficient evidence', () => {
        const result = buildTrustedAskResult(
            {
                answer: `Invented claim [${FAKE_ID}]`,
                insufficientEvidence: false,
                citations: [FAKE_ID],
            },
            [sampleChunk]
        )

        assert.equal(result.insufficientEvidence, true)
        assert.equal(result.answer, INSUFFICIENT_ANSWER)
        assert.deepEqual(result.citations, [])
    })

    it('returns insufficient evidence with an empty reference list', () => {
        const result = buildTrustedAskResult(
            {
                answer: 'The purple telescope has twelve moons.',
                insufficientEvidence: true,
                citations: [],
            },
            [sampleChunk]
        )

        assert.equal(result.insufficientEvidence, true)
        assert.equal(result.answer, INSUFFICIENT_ANSWER)
        assert.deepEqual(result.citations, [])
    })

    it('uses section title when no page number is stored', () => {
        const chunk = {
            ...sampleChunk,
            pageNumber: null,
            sectionTitle: 'Crane log',
        }
        const citation = presentCitation(REAL_ID, [chunk])

        assert.equal(citation.page, null)
        assert.equal(citation.section, 'Crane log')
        assert.equal(citation.quote, quoteFromChunk(chunk.content))
    })
})
