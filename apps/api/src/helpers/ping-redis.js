import Redis from 'ioredis'

/* import config */
import redisConfig from '../config/redis'

export default async function pingRedis() {
    const client = new Redis({
        host: redisConfig.host,
        port: redisConfig.port,
        maxRetriesPerRequest: 1,
        connectTimeout: 2500,
        lazyConnect: true,
    })

    try {
        await client.connect()
        const reply = await client.ping()
        return reply === 'PONG'
    } finally {
        client.disconnect()
    }
}
