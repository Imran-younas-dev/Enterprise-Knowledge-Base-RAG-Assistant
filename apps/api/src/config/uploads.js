import path from 'path'

export default {
    directory: process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads'),
    maxBytes: Number(process.env.UPLOAD_MAX_BYTES || 10 * 1024 * 1024),
}
