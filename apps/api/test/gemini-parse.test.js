import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
    INSUFFICIENT_ANSWER,
    parseGeminiGroundedAnswer,
} from '../src/helpers/complete-answer'

const PASSAGE_ID = '6f1c2a40-7b2e-4c1a-9d5e-1a2b3c4d5e6f'
const FAKE_ID = '00000000-0000-4000-8000-000000000001'

describe('gemini grounded parse', () => {
    it('keeps answers that cite retrieved passage ids', () => {
        const result = parseGeminiGroundedAnswer(
            `After 6 hours you must take a 20 minute break. [${PASSAGE_ID}]`,
            [{ id: PASSAGE_ID, content: 'break text' }]
        )

        assert.equal(result.insufficientEvidence, false)
        assert.deepEqual(result.citations, [PASSAGE_ID])
        assert.match(result.answer, /20 minute break/)
    })

    it('drops answers that cite only invented ids', () => {
        const result = parseGeminiGroundedAnswer(
            `A guess without evidence [${FAKE_ID}]`,
            [{ id: PASSAGE_ID, content: 'real text' }]
        )

        assert.equal(result.insufficientEvidence, true)
        assert.equal(result.answer, INSUFFICIENT_ANSWER)
        assert.deepEqual(result.citations, [])
    })
})
