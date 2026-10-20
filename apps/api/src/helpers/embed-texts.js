import path from 'path'

const BATCH_SIZE = 16

let extractorPromise

function dimensions() {
    const size = Number(process.env.EMBEDDING_DIMENSIONS || 384)

    if (!Number.isInteger(size) || size < 1) {
        throw new Error('embedding-provider-failed')
    }

    return size
}

function rowsFromOutput(output, batchLength, size) {
    const list = output.tolist()

    if (
        batchLength === 1 &&
        list.length === size &&
        typeof list[0] === 'number'
    ) {
        return [list]
    }

    return list
}

async function localExtractor(model) {
    if (!extractorPromise) {
        extractorPromise = (async () => {
            const { pipeline, env } = await import('@xenova/transformers')

            env.cacheDir = path.resolve(process.cwd(), '.cache/transformers')

            return pipeline('feature-extraction', model)
        })()
    }

    return extractorPromise
}

export default async function embedTexts(texts) {
    const provider = process.env.EMBEDDING_PROVIDER || 'local'
    const model = process.env.EMBEDDING_MODEL || 'Xenova/all-MiniLM-L6-v2'
    const size = dimensions()

    if (provider !== 'local') {
        throw new Error('embedding-provider-failed')
    }

    const extractor = await localExtractor(model)
    const vectors = []

    for (let start = 0; start < texts.length; start += BATCH_SIZE) {
        const batch = texts.slice(start, start + BATCH_SIZE)
        const output = await extractor(batch, {
            pooling: 'mean',
            normalize: true,
        })
        const rows = rowsFromOutput(output, batch.length, size)

        for (const vector of rows) {
            if (!Array.isArray(vector) || vector.length !== size) {
                throw new Error('embedding-provider-failed')
            }

            vectors.push(vector)
        }
    }

    return vectors
}
