import type { DocumentChunk, ReferenceItem, SourceDocument } from './knowledge'

export type { DocumentChunk, ReferenceItem, SearchMode, SourceDocument, SourceKind } from './knowledge'

export const sourceDocuments: SourceDocument[] = [
  { id: 'phoenix', title: 'Project_Phoenix.pdf', dateLabel: 'Mar 3, 2024', kind: 'pdf', status: 'ready', errorSummary: null },
  { id: 'market', title: 'Market_Report.doc', dateLabel: 'Dec 4, 2024', kind: 'doc', status: 'ready', errorSummary: null },
  {
    id: 'aprm',
    title: 'URL: https://www.aprm.com/...',
    dateLabel: 'Dec 2024',
    kind: 'link',
    status: 'ready',
    errorSummary: null,
  },
  { id: 'market-url', title: 'URL: Market_Phoenix.pdf', dateLabel: 'Dec 2024', kind: 'sheet', status: 'ready', errorSummary: null },
  { id: 'report', title: 'URL: Project report.pdf', dateLabel: 'May 2024', kind: 'report', status: 'ready', errorSummary: null },
]

export const documentChunks: DocumentChunk[] = [
  {
    id: 'chunk-1',
    documentId: 'phoenix',
    label: 'Chunk 1',
    excerpt:
      'Q2 2024 projections show the expansion strategy depends on more corporate accounts in the existing regions.',
    sourceLabel: 'Source: Doc 1, p. 5',
  },
  {
    id: 'chunk-2',
    documentId: 'market',
    label: 'Chunk 2',
    excerpt:
      'Q2 2024 projections show the expansion strategy covers three market topics: pricing, coverage, and partner load.',
    sourceLabel: 'Source: Doc 1, p. 5',
  },
  {
    id: 'chunk-3',
    documentId: 'phoenix',
    label: 'Chunk 3',
    excerpt:
      'Recovery steps stay with the owning team until the reconciliation job is marked ready again.',
    sourceLabel: 'Source: Doc 1, p. 6',
  },
]

export const sampleAnswer = {
  text: 'Based on the retrieved sources, the market expansion strategy focuses on corporate accounts, pricing, and partner coverage. The indexed passages support those points and do not add claims beyond them.',
  marks: ['1', '2'],
}

export const references: ReferenceItem[] = [
  {
    id: 'ref-1',
    kind: 'sheet',
    title: 'Title: Project_Plan sources, the market expansion strategy involves...',
    detail: '',
    marks: '[1]',
  },
  {
    id: 'ref-2',
    kind: 'doc',
    title: 'Market_Report.doc: Autumnal Resource:',
    detail: 'https://mnmairearch.com/',
    marks: '[1, 2]',
  },
  {
    id: 'ref-3',
    kind: 'link',
    title: 'URL: https://www.svamangragastorser...',
    detail: 'https://www.aimarisearch.com/',
    marks: '[2]',
  },
]

export { searchModes } from './knowledge'