const STOP_WORDS = new Set([
    'a',
    'an',
    'the',
    'what',
    'when',
    'where',
    'who',
    'why',
    'how',
    'does',
    'do',
    'did',
    'is',
    'are',
    'was',
    'were',
    'be',
    'to',
    'of',
    'and',
    'or',
    'in',
    'on',
    'for',
    'from',
    'with',
    'this',
    'that',
    'it',
    'if',
    'then',
    'into',
    'about',
])

const INSUFFICIENT_ANSWER =
    'The passages do not contain enough information to answer this question.'

export function buildPrompt(question, passages) {
    const evidence = passages.length
        ? passages
              .map((passage) => `Passage ${passage.id}\n${passage.content}`)
              .join('\n\n')
        : 'No passages were retrieved.'

    return [
        'Answer only from the passages.',
        'Cite the passage ids that support the answer.',
        'If the passages do not contain the answer, say the evidence is insufficient.',
        'Do not add facts that are not written in the passages.',
        '',
        evidence,
        '',
        `Question: ${question}`,
    ].join('\n')
}

export default async function completeAnswer({ question, passages }) {
    const provider = process.env.CHAT_PROVIDER || 'local'
    const model = process.env.CHAT_MODEL || 'local-grounded-reader'

    if (provider !== 'local' || model !== 'local-grounded-reader') {
        throw new Error('answer-provider-failed')
    }

    const prompt = buildPrompt(question, passages)

    return readGroundedAnswer(question, passages, prompt)
}

function readGroundedAnswer(question, passages, prompt) {
    if (!prompt.includes('Answer only from the passages.')) {
        throw new Error('answer-provider-failed')
    }

    const questionWords = words(question)
    const ranked = passages
        .map((passage) => ({
            passage,
            hits: questionWords.filter((word) =>
                words(passage.content).includes(word)
            ),
        }))
        .sort((left, right) => right.hits.length - left.hits.length)

    const best = ranked[0]
    const supported =
        best &&
        questionWords.length > 0 &&
        best.hits.length / questionWords.length >= 0.5

    if (!supported) {
        return {
            answer: INSUFFICIENT_ANSWER,
            insufficientEvidence: true,
            citations: [],
        }
    }

    return {
        answer: `${supportingText(best.passage.content, best.hits)} [${best.passage.id}]`,
        insufficientEvidence: false,
        citations: [best.passage.id],
    }
}

function words(text) {
    return String(text || '')
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter((word) => word.length > 2 && !STOP_WORDS.has(word))
}

function supportingText(content, hits) {
    const sentences = String(content)
        .split(/\n+|(?<=[.?!])\s+/)
        .map((sentence) => sentence.trim())
        .filter(Boolean)
    const matched = sentences.filter((sentence) =>
        hits.some((hit) => words(sentence).includes(hit))
    )
    const chosen = (matched.length ? matched : sentences).slice(0, 2)

    return chosen.join(' ')
}
