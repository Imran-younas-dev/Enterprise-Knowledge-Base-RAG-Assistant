'use strict'

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('document_chunks', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true,
                allowNull: false,
            },
            document_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'documents',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
            chunk_index: {
                type: Sequelize.INTEGER.UNSIGNED,
                allowNull: false,
            },
            content: {
                type: Sequelize.TEXT,
                allowNull: false,
            },
            page_number: {
                type: Sequelize.INTEGER.UNSIGNED,
                allowNull: true,
            },
            section_title: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            metadata: {
                type: Sequelize.JSON,
                allowNull: false,
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
            },
            updated_at: {
                type: Sequelize.DATE,
                allowNull: false,
            },
        })

        await queryInterface.addIndex(
            'document_chunks',
            ['document_id', 'chunk_index'],
            {
                unique: true,
                name: 'document_chunks_document_id_chunk_index',
            }
        )
    },

    async down(queryInterface) {
        await queryInterface.dropTable('document_chunks')
    },
}
