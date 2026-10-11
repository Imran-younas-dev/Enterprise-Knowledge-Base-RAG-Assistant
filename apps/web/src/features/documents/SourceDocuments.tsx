import { FileIcon, MoreIcon } from '../../components/Icons'
import type { SourceDocument } from '../../data/sampleKnowledge'

export function SourceDocuments({
  documents,
  selectedId,
  onSelect,
}: {
  documents: SourceDocument[]
  selectedId: string
  onSelect: (id: string) => void
}) {
  return (
    <section className="panel">
      <header className="panel-head">
        <h2>Source Documents</h2>
        <button type="button" className="icon-button" aria-label="Document actions">
          <MoreIcon />
        </button>
      </header>
      <ul className="doc-list">
        {documents.map((document) => (
          <li key={document.id}>
            <button
              type="button"
              className={document.id === selectedId ? 'doc-row is-selected' : 'doc-row'}
              onClick={() => onSelect(document.id)}
            >
              <FileIcon kind={document.kind} />
              <span className="doc-title">{document.title}</span>
              <span className="doc-date">{document.dateLabel}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
