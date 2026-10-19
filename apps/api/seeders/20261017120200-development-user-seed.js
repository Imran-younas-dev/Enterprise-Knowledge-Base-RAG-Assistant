'use strict'

const bcrypt = require('bcrypt')

require('../src/config/database')

const seedEmail = 'imran@localhost'
const seedPassword = 'development-password'
const passwordHash = bcrypt.hashSync(seedPassword, 12)

module.exports = {
    async up(queryInterface) {
        const env = process.env.NODE_ENV || 'development'
        if (env !== 'development') {
            return
        }

        const [existing] = await queryInterface.sequelize.query(
            'SELECT id FROM users WHERE email = :email LIMIT 1',
            { replacements: { email: seedEmail } }
        )
        if (existing.length) {
            return
        }

        await queryInterface.bulkInsert('users', [
            {
                id: '6f1c2a40-7b2e-4c1a-9d5e-1a2b3c4d5e6f',
                email: seedEmail,
                password_hash: passwordHash,
                created_at: new Date(),
                updated_at: new Date(),
            },
        ])
    },

    async down(queryInterface) {
        await queryInterface.bulkDelete('users', { email: seedEmail })
    },
}
