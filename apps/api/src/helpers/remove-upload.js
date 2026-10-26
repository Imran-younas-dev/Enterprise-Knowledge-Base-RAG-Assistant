import { v2 as cloudinary } from 'cloudinary'

export default async function removeUpload(publicId) {
    configure()

    const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: 'raw',
    })

    if (result && result.result !== 'ok' && result.result !== 'not found') {
        throw new Error('remove-failed')
    }
}

function configure() {
    const stored = process.env.CLOUDINARY_URL
    if (!stored) {
        return
    }

    const parsed = new URL(stored)
    cloudinary.config({
        cloud_name: parsed.hostname,
        api_key: decodeURIComponent(parsed.username),
        api_secret: decodeURIComponent(parsed.password),
        secure: true,
    })
}
