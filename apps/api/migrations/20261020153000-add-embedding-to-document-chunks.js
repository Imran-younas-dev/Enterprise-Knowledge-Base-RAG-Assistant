'use strict'

const path = require('path')

require('dotenv').config({
    path: path.resolve(__dirname, '../../../.env'),
})

function embeddingSize() {
    const size = Number(process.env.EMBEDDING_DIMENSIONS || 384)

    if (!Number.isInteger(size) || size < 1 || size > 4096) {
        throw new Error('EMBEDDING_DIMENSIONS must be an integer from 1 to 4096')
    }

    return size
}

async function mysqlMajor(queryInterface) {
    const [rows] = await queryInterface.sequelize.query(
        'SELECT VERSION() AS version'
    )

    return Number(String(rows[0].version).split('.')[0])
}

module.exports = {
    async up(queryInterface) {
        const size = embeddingSize()
        const major = await mysqlMajor(queryInterface)
        const column =
            major >= 9
                ? `embedding VECTOR(${size}) NULL`
                : 'embedding JSON NULL'

        await queryInterface.sequelize.query(
            `ALTER TABLE document_chunks ADD COLUMN ${column}`
        )
    },

    async down(queryInterface) {
        await queryInterface.sequelize.query(
            'ALTER TABLE document_chunks DROP COLUMN embedding'
        )
    },
}
