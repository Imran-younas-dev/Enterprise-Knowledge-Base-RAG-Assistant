import fs from 'fs'
import path from 'path'

import parseDocument from '../helpers/parse-document'

const filePath = process.argv[2]

if (!filePath) {
    // eslint-disable-next-line no-console
    console.error('Usage: babel-node src/scripts/print-document.js <file>')
    process.exit(1)
}

async function main() {
    try {
        const parsed = await parseDocument({
            filename: path.basename(filePath),
            buffer: fs.readFileSync(filePath),
        })
        for (const page of parsed.pages) {
            // eslint-disable-next-line no-console
            console.log(`page ${page.pageNumber}`)
            // eslint-disable-next-line no-console
            console.log(page.text)
        }
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error.key || error.message)
        process.exit(1)
    }
}

main()
