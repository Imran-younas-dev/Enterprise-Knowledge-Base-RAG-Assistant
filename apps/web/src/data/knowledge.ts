export type SourceKind = 'pdf' | 'doc' | 'link' | 'sheet' | 'report'

export type SourceDocument = {
  id: string
  title: string
  dateLabel: string
  kind: SourceKind
  status: string
  errorSummary: string | null
}

export type DocumentChunk = {
  id: string
  documentId: string
  label: string
  excerpt: string
  sourceLabel: string
  relevanceScore?: number
}

export type ReferenceItem = {
  id: string
  kind: SourceKind
  title: string
  detail: string
  marks: string
}

export const searchModes = [
  { id: 'web', label: 'Quick' },
  { id: 'thinking', label: 'Passages first' },
  { id: 'deep', label: 'Wide' },
] as const

export type SearchMode = (typeof searchModes)[number]['id']

export const searchScopeNote =
  'Answers use only your uploaded documents — not the public web.'

export const searchModeHints: Record<SearchMode, string> = {
  web: 'Retrieves the top 4 passages, then generates a cited answer (or a no-match message).',
  thinking:
    'Same retrieval as Quick; after you ask, expand “Retrieved passages” first if you want to read evidence before the answer.',
  deep: 'Retrieves the top 8 passages for broader questions. Still limited to your library.',
}
