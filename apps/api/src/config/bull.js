import redis from './redis'

export default {
    redis,
    prefix: process.env.BULL_PREFIX || 'rag',
}
