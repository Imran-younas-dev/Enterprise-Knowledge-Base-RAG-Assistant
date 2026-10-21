import { MoreIcon } from '../../components/Icons'
import type { DocumentChunk } from '../../data/knowledge'

export function DocumentChunks({
  chunks,
  activeChunkId,
  onSelect,
  status,
}: {
  chunks: DocumentChunk[]
  activeChunkId: string | null
  onSelect: (id: string) => void
  status?: string
}) {
  return (
    <section className="panel">
      <header className="panel-head">
        <h2>Document Chunks</h2>
        <button type="button" className="icon-button" aria-label="Chunk actions">
          <MoreIcon />
        </button>
      </header>
      {status ? <p className="page-note">{status}</p> : null}
      {chunks.length === 0 ? <p className="page-note">No chunks for this document yet.</p> : null}
      <ul className="chunk-list">
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
