import { sequelize } from '../models'
import embedTexts from './embed-texts'

export default async function storeChunkVectors(rows) {
    const vectors = await embedTexts(rows.map((row) => row.get('content')))
    const kind = await columnKind()

    for (let index = 0; index < rows.length; index += 1) {
        const id = rows[index].get('id')
        await storeVector(id, vectors[index], kind)
        const dimensions = await readDimensions(id, kind)

        if (dimensions !== vectors[index].length) {
            const error = new Error('embedding-provider-failed')
            error.key = 'embeddingFailed'
            throw error
        }
    }
}

async function columnKind() {
    const [rows] = await sequelize.query('SELECT VERSION() AS version')
    const major = Number(String(rows[0].version).split('.')[0])

    return major >= 9 ? 'vector' : 'json'
}

async function storeVector(id, vector, kind) {
    const payload = JSON.stringify(vector)

    if (kind === 'vector') {
        await sequelize.query(
            'UPDATE document_chunks SET embedding = STRING_TO_VECTOR(:vector) WHERE id = :id',
            { replacements: { vector: payload, id } }
        )
        return
    }

    await sequelize.query(
        'UPDATE document_chunks SET embedding = CAST(:vector AS JSON) WHERE id = :id',
        { replacements: { vector: payload, id } }
    )
}

async function readDimensions(id, kind) {
    const expression =
        kind === 'vector' ? 'VECTOR_DIM(embedding)' : 'JSON_LENGTH(embedding)'
    const [rows] = await sequelize.query(
        `SELECT ${expression} AS dimensions FROM document_chunks WHERE id = :id`,
        { replacements: { id } }
    )

    return Number(rows[0].dimensions)
}
