import { Injectable } from '@nestjs/common'

/* import services */
import { SearchService } from '../retrieval/search.service'

/* import helpers */
import completeAnswer from '../../helpers/complete-answer'
import { quoteFromChunkContent } from '../../helpers/chunk-quote'
import translate from '../../helpers/translate'

/* import exceptions */
import AppValidationError from '../../exceptions/AppValidationError'

export const INSUFFICIENT_ANSWER =
    'The passages do not contain enough information to answer this question.'

@Injectable()
export class AskService {
    constructor() {
        this.searchService = new SearchService()
    }

    async ask(request) {
        const retrievalStarted = Date.now()
        const retrieved = await this.searchService.search(request)
        const retrievalMs = Date.now() - retrievalStarted

        let completed
        const modelStarted = Date.now()

        try {
            completed = await completeAnswer({
                question: String(request.body.question || '').trim(),
                passages: retrieved.chunks.map((chunk) => ({
                    id: chunk.id,
                    content: chunk.content,
                })),
            })
        } catch {
            throw new AppValidationError(
                translate('errors', 'answerFailed'),
                502
            )
        }

        const modelMs = Date.now() - modelStarted

        // eslint-disable-next-line no-console
        console.log(`retrievalMs=${retrievalMs} modelMs=${modelMs}`)

        const trusted = buildTrustedAskResult(completed, retrieved.chunks)

        return {
            ...trusted,
            chunks: retrieved.chunks,
            metadata: {
                retrievalMs,
                modelMs,
            },
        }
    }
}

export function buildTrustedAskResult(completed, chunks) {
    const retrievalIds = chunks.map((chunk) => chunk.id)
    const citations = knownCitations(completed.citations, retrievalIds)
    const insufficientEvidence =
        completed.insufficientEvidence || citations.length === 0

    return {
        answer: insufficientEvidence
            ? INSUFFICIENT_ANSWER
            : stripUnknownCitations(completed.answer, retrievalIds),
        insufficientEvidence,
        citations: insufficientEvidence
            ? []
            : citations.map((id) => presentCitation(id, chunks)),
    }
}

export function presentCitation(id, chunks) {
    const chunk = chunks.find((item) => item.id === id)
    const quote = quoteFromChunk(chunk && chunk.content)

    return {
        id,
        documentId: chunk.documentId,
        title: chunk.originalFilename,
        page: chunk.pageNumber,
        section: chunk.sectionTitle || null,
        quote,
    }
}

export function quoteFromChunk(content) {
    return quoteFromChunkContent(content)
}

export function knownCitations(citedIds, retrievalIds) {
    const allowed = new Set(retrievalIds)

    return [...new Set((citedIds || []).filter((id) => allowed.has(id)))]
}

export function stripUnknownCitations(answer, retrievalIds) {
    const allowed = new Set(retrievalIds)

    return String(answer || '')
        .replace(/\s*\[([^\]]+)\]/g, (match, id) =>
            allowed.has(id) ? ` [${id}]` : ''
        )
        .trim()
}
