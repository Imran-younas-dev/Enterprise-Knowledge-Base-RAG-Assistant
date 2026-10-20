import fs from 'fs'
import path from 'path'

import chunkText from '../helpers/chunk-text'
import parseDocument from '../helpers/parse-document'
import { sequelize } from '../models'
import DocumentChunk from '../models/DocumentChunk'

const SEEDED_DOCUMENT_ID = '8a2d4c10-1e6b-4f8a-9c3d-2b7e5a9c1d44'
const filePath = process.argv[2]
const documentId = process.argv[3] || SEEDED_DOCUMENT_ID

if (!filePath) {
    // eslint-disable-next-line no-console
    console.error(
        'Usage: babel-node src/scripts/write-chunks.js <file> [documentId]'
    )
    process.exit(1)
}

async function main() {
    const parsed = parseDocument({
        filename: path.basename(filePath),
        buffer: fs.readFileSync(filePath),
    })
    const chunks = chunkText({
        text: parsed.text,
        pageNumber: parsed.pageNumber,
    })

    await DocumentChunk.destroy({ where: { documentId } })
    await DocumentChunk.bulkCreate(
        chunks.map((chunk) => ({
            documentId,
            chunkIndex: chunk.index,
            content: chunk.content,
            pageNumber: chunk.pageNumber,
            sectionTitle: chunk.sectionTitle,
            metadata: chunk.metadata,
        }))
    )

    const rows = await DocumentChunk.findAll({
        where: { documentId },
        order: [['chunkIndex', 'ASC']],
    })

    for (const row of rows) {
        // eslint-disable-next-line no-console
        console.log(
            [
                `index ${row.get('chunkIndex')}`,
                `page ${row.get('pageNumber')}`,
                `section ${row.get('sectionTitle') || ''}`,
            ].join(' | ')
        )
        // eslint-disable-next-line no-console
        console.log(row.get('content'))
    }

    await sequelize.close()
}

main().catch((error) => {
    // eslint-disable-next-line no-console
    console.error(error.message)
    process.exit(1)
})
