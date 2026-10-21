'use strict'

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('documents', 'error_code', {
            type: Sequelize.STRING,
            allowNull: true,
        })
    },

    async down(queryInterface) {
        await queryInterface.removeColumn('documents', 'error_code')
    },
}
