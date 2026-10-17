'use strict'

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('documents', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true,
                allowNull: false,
            },
            owner_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'RESTRICT',
            },
            title: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            original_filename: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            mime_type: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            file_size_bytes: {
                type: Sequelize.INTEGER.UNSIGNED,
                allowNull: false,
            },
            storage_key: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            content_hash: {
                type: Sequelize.STRING(64),
                allowNull: false,
            },
            status: {
                type: Sequelize.ENUM(
                    'queued',
                    'processing',
                    'ready',
                    'failed',
                    'deleting',
                    'deleted'
                ),
                allowNull: false,
                defaultValue: 'queued',
            },
            error_summary: {
                type: Sequelize.STRING,
                allowNull: true,
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
    },

    async down(queryInterface) {
        await queryInterface.dropTable('documents')
    },
}
