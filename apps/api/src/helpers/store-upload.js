import { Readable } from 'stream'

import { v2 as cloudinary } from 'cloudinary'

export default function storeUpload({ buffer, storageKey }) {
    configure()

    return new Promise((resolve, reject) => {
        const upload = cloudinary.uploader.upload_stream(
            {
                resource_type: 'raw',
                public_id: storageKey,
                use_filename: false,
                unique_filename: false,
                overwrite: false,
            },
            (error, result) => {
                if (error || !result) {
                    reject(error || new Error('Upload failed'))
                    return
                }
                resolve({
                    publicId: result.public_id,
                    remove() {
                        return cloudinary.uploader.destroy(result.public_id, {
                            resource_type: 'raw',
                        })
                    },
                })
            }
        )

        Readable.from(buffer).pipe(upload)
    })
}

function configure() {
    const url = process.env.CLOUDINARY_URL
    if (!url) {
        return
    }
    const parsed = new URL(url)
    cloudinary.config({
        cloud_name: parsed.hostname,
        api_key: decodeURIComponent(parsed.username),
        api_secret: decodeURIComponent(parsed.password),
        secure: true,
    })
}
