import { Injectable } from '@nestjs/common'

/* import models */
import { sequelize } from '../../models'

/* import helpers */
import embedTexts from '../../helpers/embed-texts'
import translate from '../../helpers/translate'

/* import exceptions */
import AppValidationError from '../../exceptions/AppValidationError'

const MODES = {
    web: { topK: 4, thinking: false },
    deep: { topK: 8, thinking: false },
    thinking: { topK: 4, thinking: true },
}

@Injectable()
export class SearchService {
    async search(request) {
        const question = String(request.body.question || '').trim()
        const mode = request.body.mode || 'web'
        const settings = MODES[mode] || MODES.web
        const topK = limitFor(settings.topK)

        if (!question) {
            throw new AppValidationError(
                translate('validations', 'required', { field: 'question' }),
                422
            )
        }

        let vector
        try {
            const vectors = await embedTexts([question])
            vector = vectors[0]
        } catch {
            throw new AppValidationError(
                translate('errors', 'embeddingFailed'),
                502
            )
        }

        const major = await mysqlMajor()
        const rows =
            major >= 9
                ? await searchMysql9(request.user.id, vector, topK)
                : await searchMysql8(request.user.id, vector, topK)

        return {
            thinking: settings.thinking,
            chunks: rows.map(presentChunk),
        }
    }
}

function limitFor(fallback) {
    if (fallback === 8) {
        return 8
    }

    const configured = Number(process.env.RETRIEVAL_TOP_K || fallback)

    if (!Number.isInteger(configured) || configured < 1 || configured > 50) {
        return fallback
    }

    return configured
}

async function mysqlMajor() {
    const [rows] = await sequelize.query('SELECT VERSION() AS version')

    return Number(String(rows[0].version).split('.')[0])
}

async function searchMysql9(ownerId, vector, topK) {
    const [rows] = await sequelize.query(
        `
        SELECT
            c.id,
            c.document_id AS documentId,
            c.chunk_index AS chunkIndex,
            c.content,
            c.page_number AS pageNumber,
            c.section_title AS sectionTitle,
            d.original_filename AS originalFilename,
            DISTANCE(c.embedding, STRING_TO_VECTOR(:vector), 'COSINE') AS distance
        FROM document_chunks AS c
        INNER JOIN documents AS d ON d.id = c.document_id
        WHERE d.owner_id = :ownerId
          AND d.status NOT IN ('deleted', 'deleting')
          AND c.embedding IS NOT NULL
        ORDER BY distance ASC
        LIMIT ${topK}
        `,
        {
            replacements: {
                ownerId,
                vector: JSON.stringify(vector),
            },
        }
    )

    return rows
}

async function searchMysql8(ownerId, vector, topK) {
    const [rows] = await sequelize.query(
        `
        SELECT
            c.id,
            c.document_id AS documentId,
            c.chunk_index AS chunkIndex,
            c.content,
            c.page_number AS pageNumber,
            c.section_title AS sectionTitle,
            d.original_filename AS originalFilename,
            c.embedding
        FROM document_chunks AS c
        INNER JOIN documents AS d ON d.id = c.document_id
        WHERE d.owner_id = :ownerId
          AND d.status NOT IN ('deleted', 'deleting')
          AND c.embedding IS NOT NULL
        `,
        { replacements: { ownerId } }
    )

    return rows
        .map((row) => ({
            ...row,
            distance: cosineDistance(vector, asVector(row.embedding)),
        }))
        .filter((row) => Number.isFinite(row.distance))
        .sort((left, right) => left.distance - right.distance)
        .slice(0, topK)
}

function asVector(value) {
    if (Array.isArray(value)) {
        return value.map(Number)
    }

    if (typeof value === 'string') {
        return JSON.parse(value).map(Number)
    }

    return []
}

function cosineDistance(left, right) {
    if (left.length === 0 || left.length !== right.length) {
        return Number.NaN
    }

    let dot = 0
    let leftNorm = 0
    let rightNorm = 0

    for (let index = 0; index < left.length; index += 1) {
        dot += left[index] * right[index]
        leftNorm += left[index] * left[index]
        rightNorm += right[index] * right[index]
    }

    const denominator = Math.sqrt(leftNorm) * Math.sqrt(rightNorm)

    if (!denominator) {
        return 1
    }

    return 1 - dot / denominator
}

function presentChunk(row) {
    return {
        id: row.id,
        documentId: row.documentId,
        chunkIndex: row.chunkIndex,
        content: row.content,
        pageNumber: row.pageNumber,
        sectionTitle: row.sectionTitle,
        originalFilename: row.originalFilename,
        distance: Number(row.distance),
    }
}
