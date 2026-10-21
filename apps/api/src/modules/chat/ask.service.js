import { Injectable } from '@nestjs/common'

/* import services */
import { SearchService } from '../retrieval/search.service'

/* import helpers */
import completeAnswer from '../../helpers/complete-answer'
import translate from '../../helpers/translate'

/* import exceptions */
import AppValidationError from '../../exceptions/AppValidationError'

const INSUFFICIENT_ANSWER =
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

        const retrievalIds = retrieved.chunks.map((chunk) => chunk.id)
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
        const citations = knownCitations(completed.citations, retrievalIds)
        const insufficientEvidence =
            completed.insufficientEvidence || citations.length === 0

        // eslint-disable-next-line no-console
        console.log(`retrievalMs=${retrievalMs} modelMs=${modelMs}`)

        const citedIds = insufficientEvidence ? [] : citations

        return {
            answer: insufficientEvidence
                ? INSUFFICIENT_ANSWER
                : stripUnknownCitations(completed.answer, retrievalIds),
            insufficientEvidence,
            citations: citedIds.map((id) =>
                presentCitation(id, retrieved.chunks)
            ),
            chunks: retrieved.chunks,
            metadata: {
                retrievalMs,
                modelMs,
            },
        }
    }
}

function presentCitation(id, chunks) {
    const chunk = chunks.find((item) => item.id === id)
    const quote = String(chunk.content || '')
        .replace(/\s+/g, ' ')
        .trim()

    return {
        id,
        documentId: chunk.documentId,
        title: chunk.originalFilename,
        page: chunk.pageNumber,
        quote: quote.length > 180 ? `${quote.slice(0, 177)}...` : quote,
    }
}

export function knownCitations(citedIds, retrievalIds) {
    const allowed = new Set(retrievalIds)

    return [...new Set((citedIds || []).filter((id) => allowed.has(id)))]
}

function stripUnknownCitations(answer, retrievalIds) {
    const allowed = new Set(retrievalIds)

    return String(answer || '')
        .replace(/\s*\[([^\]]+)\]/g, (match, id) =>
            allowed.has(id) ? ` [${id}]` : ''
        )
        .trim()
}
