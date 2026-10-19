'use strict'

require('../src/config/database')

const ownerId = '6f1c2a40-7b2e-4c1a-9d5e-1a2b3c4d5e6f'
const documentId = '8a2d4c10-1e6b-4f8a-9c3d-2b7e5a9c1d44'

module.exports = {
    async up(queryInterface) {
        const env = process.env.NODE_ENV || 'development'
        if (env !== 'development') {
            return
        }

        const [existing] = await queryInterface.sequelize.query(
            'SELECT id FROM documents WHERE id = :id LIMIT 1',
            { replacements: { id: documentId } }
        )
        if (existing.length) {
            return
        }

        const createdAt = new Date('2024-03-03T00:00:00.000Z')

        await queryInterface.bulkInsert('documents', [
            {
                id: documentId,
                owner_id: ownerId,
                title: 'Project_Phoenix.pdf',
                original_filename: 'Project_Phoenix.pdf',
                mime_type: 'application/pdf',
                file_size_bytes: 12000,
                storage_key: 'seed/project-phoenix.pdf',
                content_hash: 'a'.repeat(64),
                status: 'queued',
                error_summary: null,
                created_at: createdAt,
                updated_at: createdAt,
            },
        ])
    },

    async down(queryInterface) {
        await queryInterface.bulkDelete('documents', { id: documentId })
    },
}
