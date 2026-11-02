export default {
    ttlMs: Number(process.env.THROTTLE_TTL_MS || 60_000),
    defaultLimit: Number(process.env.THROTTLE_DEFAULT_LIMIT || 300),
    askLimit: Number(process.env.THROTTLE_ASK_LIMIT || 30),
    uploadLimit: Number(process.env.THROTTLE_UPLOAD_LIMIT || 20),
}
