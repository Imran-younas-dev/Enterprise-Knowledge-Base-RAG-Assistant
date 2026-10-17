'use strict'

require('../src/config/database')

const seedEmail = 'imran@localhost'

module.exports = {
    async up(queryInterface) {
        const env = process.env.NODE_ENV || 'development'
        if (env !== 'development') {
            return
        }

        await queryInterface.bulkInsert('users', [
            {
                id: '6f1c2a40-7b2e-4c1a-9d5e-1a2b3c4d5e6f',
                email: seedEmail,
                password_hash: 'seed-only-not-for-login',
                created_at: new Date(),
                updated_at: new Date(),
            },
        ])
    },

    async down(queryInterface) {
        await queryInterface.bulkDelete('users', { email: seedEmail })
    },
}
