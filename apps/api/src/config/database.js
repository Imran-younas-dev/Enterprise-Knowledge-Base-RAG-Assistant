module.exports = {
    development: {
        username: process.env.DB_USER || 'rag',
        password: process.env.DB_PASSWORD || 'rag',
        database: process.env.DB_NAME || 'rag',
        host: process.env.DB_HOST || '127.0.0.1',
        port: process.env.DB_PORT || 3306,
        dialect: 'mysql',
    },
}
