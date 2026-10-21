import { v2 as cloudinary } from 'cloudinary'

export default async function loadUpload(publicId) {
    configure()

    const url = cloudinary.url(publicId, {
        resource_type: 'raw',
        secure: true,
    })
    const response = await fetch(url)

    if (!response.ok) {
        throw new Error('load-failed')
    }

    return Buffer.from(await response.arrayBuffer())
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
