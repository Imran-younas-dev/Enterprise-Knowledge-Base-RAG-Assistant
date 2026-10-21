export type SourceKind = 'pdf' | 'doc' | 'link' | 'sheet' | 'report'

export type SourceDocument = {
  id: string
  title: string
  dateLabel: string
  kind: SourceKind
}

export type DocumentChunk = {
  id: string
  documentId: string
  label: string
  excerpt: string
  sourceLabel: string
}

export type ReferenceItem = {
  id: string
  kind: SourceKind
  title: string
  detail: string
  marks: string
}

export const searchModes = [
  { id: 'web', label: 'Web Search' },
  { id: 'thinking', label: 'Thinking' },
  { id: 'deep', label: 'Deep Search' },
] as const

export type SearchMode = (typeof searchModes)[number]['id']
