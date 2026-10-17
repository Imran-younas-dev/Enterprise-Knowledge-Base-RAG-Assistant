import { sequelize } from '../models'

async function main() {
    await sequelize.authenticate()
    // eslint-disable-next-line no-console
    console.log('MySQL answered')
    await sequelize.close()
}

main().catch((error) => {
    // eslint-disable-next-line no-console
    console.error(error.message)
    process.exit(1)
})
