import type { DocumentChunk } from '../../data/knowledge'
import type { ApiChunk } from '../../lib/api'

export function toDocumentChunk(chunk: ApiChunk): DocumentChunk {
  const page = chunk.pageNumber ?? 1
  const section = chunk.sectionTitle ? `${chunk.sectionTitle}, ` : ''

  return {
    id: chunk.id,
    documentId: chunk.documentId,
    label: `Chunk ${chunk.chunkIndex + 1}`,
    excerpt: chunk.content,
    sourceLabel: `Source: ${chunk.originalFilename}, ${section}p. ${page}`,
  }
}
