import { MoreIcon } from '../../components/Icons'
import type { DocumentChunk } from '../../data/knowledge'

export function DocumentChunks({
  chunks,
  activeChunkId,
  onSelect,
  status,
  loading = false,
  emptyLabel = 'No passages yet. Select a document or ask a question.',
}: {
  chunks: DocumentChunk[]
  activeChunkId: string | null
  onSelect: (id: string) => void
  status?: string
  loading?: boolean
  emptyLabel?: string
}) {
  return (
    <section className="panel">
      <header className="panel-head">
        <h2>Document Chunks</h2>
        <button type="button" className="icon-button" aria-label="Chunk actions">
          <MoreIcon />
        </button>
      </header>
      {status ? <p className="panel-note">{status}</p> : null}
      <ul className="chunk-list">
        {chunks.length === 0 ? (
          <li className="panel-empty">{loading ? 'Loading passages…' : emptyLabel}</li>
        ) : null}
        {chunks.map((chunk, index) => (
          <li key={chunk.id}>
            <button
              type="button"
              className={chunk.id === activeChunkId ? 'chunk-card is-active' : 'chunk-card'}
              onClick={() => onSelect(chunk.id)}
            >
              <strong>
                Chunk {index + 1}: ...{chunk.excerpt}
              </strong>
              <span>{chunk.sourceLabel}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
