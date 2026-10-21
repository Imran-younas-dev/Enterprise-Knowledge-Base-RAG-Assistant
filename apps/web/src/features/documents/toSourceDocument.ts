import type { SourceDocument, SourceKind } from '../../data/knowledge'
import type { ApiDocument } from '../../lib/api'

const dateFormat = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

export function toSourceDocument(document: ApiDocument): SourceDocument {
  return {
    id: document.id,
    title: document.title || document.originalFilename,
    dateLabel: dateFormat.format(new Date(document.createdAt)),
    kind: kindFor(document.mimeType, document.originalFilename),
  }
}

export function kindFor(mimeType: string, filename: string): SourceKind {
  const name = filename.toLowerCase()
  if (mimeType.includes('pdf') || name.endsWith('.pdf')) {
    return 'pdf'
  }
  if (mimeType.includes('word') || name.endsWith('.doc') || name.endsWith('.docx')) {
    return 'doc'
  }
  if (name.startsWith('url')) {
    return 'link'
  }
  return 'report'
}
