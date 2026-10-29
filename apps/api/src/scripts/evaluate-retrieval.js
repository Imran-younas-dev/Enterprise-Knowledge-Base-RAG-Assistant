import fs from 'fs'
import path from 'path'

import { Op } from 'sequelize'

/* import models */
import '../models'
import Document from '../models/Document'

/* import services */
import { SearchService } from '../modules/retrieval/search.service'

const DEFAULT_OWNER = '6f1c2a40-7b2e-4c1a-9d5e-1a2b3c4d5e6f'

async function main() {
    const questionsPath =
        process.argv[2] ||
        path.resolve(__dirname, '../../../../evals/questions.jsonl')
    const ownerId = process.env.EVAL_OWNER_ID || DEFAULT_OWNER
    const topK = limitFor(Number(process.env.EVAL_TOP_K || 4))
    const rows = loadQuestions(questionsPath)
    const searchService = new SearchService()

    let answerable = 0
    let hits = 0

    for (const row of rows) {
        const question = String(row.question || '').trim()
        const expectedDocument = row.expectedDocument || null

        if (!question) {
            continue
        }

        const result = await searchService.search({
            body: { question, mode: 'web' },
            user: { id: ownerId },
        })

        const rankedDocumentIds = result.chunks
            .slice(0, topK)
            .map((chunk) => chunk.documentId)

        if (!expectedDocument) {
            // eslint-disable-next-line no-console
            console.log(`unanswerable\t${question}`)
            continue
        }

        answerable += 1
        const expectedIds = await documentIdsForFilename(
            ownerId,
            expectedDocument
        )
        const hit = expectedIds.some((id) => rankedDocumentIds.includes(id))
        if (hit) {
            hits += 1
        }

        // eslint-disable-next-line no-console
        console.log(
            [
                hit ? 'hit' : 'miss',
                expectedDocument,
                row.paraphrase ? 'paraphrase' : 'literal',
                question,
            ].join('\t')
        )
    }

    const rate = answerable ? hits / answerable : 0
    // eslint-disable-next-line no-console
    console.log(`Hit Rate@${topK}: ${rate.toFixed(3)} (${hits}/${answerable})`)
}

function loadQuestions(filePath) {
    return fs
        .readFileSync(filePath, 'utf8')
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => JSON.parse(line))
}

async function documentIdsForFilename(ownerId, filename) {
    const rows = await Document.findAll({
        where: {
            ownerId,
            originalFilename: filename,
            status: { [Op.notIn]: ['deleted', 'deleting'] },
        },
        attributes: ['id'],
    })

    return rows.map((row) => row.get('id'))
}

function limitFor(fallback) {
    const configured = Number(process.env.RETRIEVAL_TOP_K || fallback)

    if (!Number.isInteger(configured) || configured < 1 || configured > 50) {
        return fallback
    }

    return configured
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        // eslint-disable-next-line no-console
        console.error(error.message)
        process.exit(1)
    })
