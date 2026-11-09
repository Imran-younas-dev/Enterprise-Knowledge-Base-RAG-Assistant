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

export const searchModeHints: Record<SearchMode, string> = {
  web: 'Searches your uploaded files (top 4 passages). Expect a cited answer grounded in those passages, or an insufficient-evidence message if nothing matches.',
  thinking:
    'Same search as Web Search, but retrieved passages appear on the right before the answer so you can verify evidence first.',
  deep: 'Pulls more passages (top 8) for broader questions. Useful for vague or multi-topic questions; answers still come only from your documents.',
}
