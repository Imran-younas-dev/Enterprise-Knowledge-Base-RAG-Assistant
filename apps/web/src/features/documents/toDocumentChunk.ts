import type { DocumentChunk } from '../../data/knowledge'
import type { ApiChunk } from '../../lib/api'

export function toDocumentChunk(chunk: ApiChunk): DocumentChunk {
  const parts = [chunk.originalFilename]
  if (chunk.sectionTitle) {
    parts.push(chunk.sectionTitle)
  }
  if (chunk.pageNumber != null) {
    parts.push(`p. ${chunk.pageNumber}`)
  }

  const relevanceScore =
    chunk.distance != null && Number.isFinite(chunk.distance)
      ? Math.max(0, Math.min(1, Number((1 - chunk.distance).toFixed(2))))
      : undefined

  return {
    id: chunk.id,
    documentId: chunk.documentId,
    label: `Chunk ${chunk.chunkIndex + 1}`,
    excerpt: chunk.content,
    sourceLabel: `Source: ${parts.join(', ')}`,
    relevanceScore,
  }
}
