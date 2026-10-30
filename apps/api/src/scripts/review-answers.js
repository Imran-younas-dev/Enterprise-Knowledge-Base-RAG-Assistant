import fs from 'fs'
import path from 'path'

import { AskService, INSUFFICIENT_ANSWER } from '../modules/chat/ask.service'

const ownerId =
    process.env.EVAL_OWNER_ID || '6f1c2a40-7b2e-4c1a-9d5e-1a2b3c4d5e6f'

async function main() {
    const questionsPath =
        process.argv[2] ||
        path.resolve(__dirname, '../../../../evals/questions.jsonl')
    const rows = loadQuestions(questionsPath).slice(0, 10)
    const askService = new AskService()

    const review = []

    for (const row of rows) {
        const question = String(row.question || '').trim()
        const result = await askService.ask({
            body: { question, mode: 'web' },
            user: { id: ownerId },
        })

        const faithful = scoreFaithfulness(row, result)
        const citationsMatch = scoreCitations(result)

        review.push({
            question,
            expectedDocument: row.expectedDocument,
            insufficientEvidence: result.insufficientEvidence,
            faithful,
            citationsMatch,
            answer: result.answer,
            citationCount: result.citations.length,
        })

        // eslint-disable-next-line no-console
        console.log(
            [
                faithful ? 'faithful' : 'not-faithful',
                citationsMatch ? 'cites-ok' : 'cites-bad',
                result.insufficientEvidence ? 'insufficient' : 'answered',
                question,
            ].join('\t')
        )
    }

    const faithfulCount = review.filter((row) => row.faithful).length
    const citeOkCount = review.filter((row) => row.citationsMatch).length

    // eslint-disable-next-line no-console
    console.log(
        `Review summary: faithful ${faithfulCount}/10, citations match ${citeOkCount}/10`
    )

    return { faithfulCount, citeOkCount, review }
}

function loadQuestions(filePath) {
    return fs
        .readFileSync(filePath, 'utf8')
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => JSON.parse(line))
}

function scoreFaithfulness(row, result) {
    const expectsNoAnswer = !row.expectedDocument

    if (expectsNoAnswer) {
        return (
            result.insufficientEvidence &&
            result.answer === INSUFFICIENT_ANSWER &&
            result.citations.length === 0
        )
    }

    if (result.insufficientEvidence) {
        return false
    }

    if (result.citations.length === 0) {
        return false
    }

    const answerWords = words(result.answer)
    const quoteWords = words(
        result.citations.map((item) => item.quote).join(' ')
    )

    const overlap = answerWords.filter((word) => quoteWords.includes(word))

    return overlap.length >= Math.min(3, answerWords.length)
}

function scoreCitations(result) {
    if (result.insufficientEvidence) {
        return result.citations.length === 0
    }

    return result.citations.every((citation) => {
        const quote = String(citation.quote || '').toLowerCase()
        const answer = String(result.answer || '').toLowerCase()

        if (!quote) {
            return false
        }

        const quoteWords = words(citation.quote)
        return quoteWords.some((word) => answer.includes(word))
    })
}

function words(text) {
    return String(text || '')
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter((word) => word.length > 2)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        // eslint-disable-next-line no-console
        console.error(error.message)
        process.exit(1)
    })
