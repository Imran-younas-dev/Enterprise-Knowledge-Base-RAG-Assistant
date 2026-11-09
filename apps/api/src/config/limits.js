export default {
    maxQuestionLength: Number(process.env.MAX_QUESTION_LENGTH || 2000),
    maxChunksPerDocument: Number(process.env.MAX_CHUNKS_PER_DOCUMENT || 2000),
}
