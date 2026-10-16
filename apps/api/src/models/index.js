import { Sequelize } from 'sequelize-typescript'

import databaseConfig from '../config/database'

const models = []
const env = process.env.NODE_ENV || 'development'
const config = databaseConfig[env]

export const sequelize = new Sequelize({
    database: config.database,
    dialect: config.dialect,
    username: config.username,
    password: config.password,
    host: config.host,
    port: Number(config.port),
    models,
    logging: false,
})

export default models
