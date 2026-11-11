import { FileIcon } from '../../components/Icons'
import type { SourceDocument } from '../../data/knowledge'

export function SourceDocuments({
  documents,
  selectedId,
  loading = false,
  onSelect,
  onReprocess,
  onDelete,
  confirmDelete = false,
  busy = false,
  emptyHint,
}: {
  documents: SourceDocument[]
  selectedId: string
  loading?: boolean
  onSelect: (id: string) => void
  onReprocess?: (id: string) => void
  onDelete?: (id: string) => void
  confirmDelete?: boolean
  busy?: boolean
  emptyHint?: string
}) {
  const selected = documents.find((document) => document.id === selectedId)

  return (
    <section className="panel">
      <header className="panel-head panel-head-title-only">
        <h2>Source Documents</h2>
      </header>
      {selected && onReprocess && onDelete ? (
        <div className="doc-actions">
          <button
            type="button"
            className="text-button"
            disabled={busy}
            onClick={() => onReprocess(selected.id)}
          >
            Reprocess
          </button>
          <button
            type="button"
            className="text-button danger"
            disabled={busy}
            onClick={() => onDelete(selected.id)}
          >
            {confirmDelete ? 'Confirm delete' : 'Delete'}
          </button>
        </div>
      ) : null}
      <ul className="doc-list">
        {documents.length === 0 ? (
          <li className="panel-empty">
            {loading ? 'Loading documents…' : emptyHint ?? 'No documents yet.'}
          </li>
        ) : (
          documents.map((document) => (
            <li key={document.id}>
              <button
                type="button"
                className={rowClass(document, selectedId)}
                onClick={() => onSelect(document.id)}
              >
                <FileIcon kind={document.kind} />
                <span className="doc-title">
                  {document.title}
                  <span className="doc-title-sep"> · </span>
                  <span
                    className={`doc-status-inline ${statusToneClass(document.status)}`}
                    title={statusLabel(document)}
                  >
                    {statusLabel(document)}
                  </span>
                </span>
                <span className="doc-date">{document.dateLabel}</span>
              </button>
            </li>
          ))
        )}
      </ul>
    </section>
  )
}

function rowClass(document: SourceDocument, selectedId: string) {
  const parts = ['doc-row']
  if (document.id === selectedId) {
    parts.push('is-selected')
  }
  if (document.status === 'failed') {
    parts.push('is-failed')
  }
  return parts.join(' ')
}

function statusToneClass(status: string) {
  if (status === 'ready') {
    return 'is-ready'
  }
  if (status === 'queued' || status === 'processing') {
    return 'is-pending'
  }
  if (status === 'failed') {
    return 'is-failed'
  }
  return ''
}

function statusLabel(document: SourceDocument) {
  if (document.status === 'failed' && document.errorSummary) {
    return `failed — ${document.errorSummary}`
  }
  if (document.status === 'processing') {
    return 'processing…'
  }
  if (document.status === 'queued') {
    return 'queued'
  }
  if (document.status === 'failed') {
    return 'failed'
  }
  return document.status || 'unknown'
}
