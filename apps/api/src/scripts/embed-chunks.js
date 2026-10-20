import { sequelize } from '../models'
import Document from '../models/Document'
import DocumentChunk from '../models/DocumentChunk'
import embedTexts from '../helpers/embed-texts'
import translate from '../helpers/translate'

const SEEDED_DOCUMENT_ID = '8a2d4c10-1e6b-4f8a-9c3d-2b7e5a9c1d44'
const documentId = process.argv[2] || SEEDED_DOCUMENT_ID

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

async function markFailed() {
    await Document.update(
        {
            status: 'failed',
            errorSummary: translate('errors', 'embeddingFailed'),
        },
        { where: { id: documentId } }
    )
}

async function main() {
    const chunks = await DocumentChunk.findAll({
        where: { documentId },
        order: [['chunkIndex', 'ASC']],
    })

    if (chunks.length === 0) {
        // eslint-disable-next-line no-console
        console.error('No chunks to embed')
        process.exitCode = 1
        return
    }

    const kind = await columnKind()
    const vectors = await embedTexts(
        chunks.map((chunk) => chunk.get('content'))
    )

    for (let index = 0; index < chunks.length; index += 1) {
        const id = chunks[index].get('id')
        await storeVector(id, vectors[index], kind)
        const dimensions = await readDimensions(id, kind)

        // eslint-disable-next-line no-console
        console.log(
            `chunk ${chunks[index].get('chunkIndex')} dimensions ${dimensions} column ${kind}`
        )
    }

    const document = await Document.findByPk(documentId)

    if (document && document.get('status') === 'failed') {
        await Document.update(
            { status: 'queued', errorSummary: null },
            { where: { id: documentId } }
        )
        return
    }

    await Document.update({ errorSummary: null }, { where: { id: documentId } })
}

main()
    .catch(async () => {
        await markFailed()
        // eslint-disable-next-line no-console
        console.error(translate('errors', 'embeddingFailed'))
        process.exitCode = 1
    })
    .finally(async () => {
        await sequelize.close()
    })
