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
    <section className="panel chunks-panel">
      <header className="panel-head panel-head-title-only">
        <h2>Document Chunks</h2>
      </header>
      {status ? <p className="panel-note">{status}</p> : null}
      <div className="chunk-list-scroll">
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
      </div>
    </section>
  )
}
