import type { DocumentChunk } from '../../data/knowledge'

function excerptBody(excerpt: string, highlightQuote?: string) {
  if (!highlightQuote) {
    return excerpt
  }
  const index = excerpt.indexOf(highlightQuote)
  if (index < 0) {
    return excerpt
  }
  return (
    <>
      {excerpt.slice(0, index)}
      <mark className="chunk-highlight">{highlightQuote}</mark>
      {excerpt.slice(index + highlightQuote.length)}
    </>
  )
}

export function DocumentChunks({
  chunks,
  activeChunkId,
  onSelect,
  status,
  loading = false,
  emptyLabel = 'No passages yet. Select a document or ask a question.',
  collapsible = false,
  open = true,
  onOpenChange,
  highlightQuote,
}: {
  chunks: DocumentChunk[]
  activeChunkId: string | null
  onSelect: (id: string) => void
  status?: string
  loading?: boolean
  emptyLabel?: string
  collapsible?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
  highlightQuote?: string
}) {
  const activeQuote = highlightQuote && activeChunkId ? highlightQuote : undefined

  return (
    <section className="panel chunks-panel">
      <header className="panel-head">
        <h2>Retrieved passages</h2>
        {collapsible && onOpenChange ? (
          <button
            type="button"
            className="text-button collapsible-toggle"
            onClick={() => onOpenChange(!open)}
            aria-expanded={open}
          >
            {open ? 'Hide' : 'Show'}
          </button>
        ) : null}
      </header>
      {open ? (
        <>
          {status ? <p className="panel-note">{status}</p> : null}
          <div className="chunk-list-scroll">
            <ul className="chunk-list">
              {chunks.length === 0 ? (
                <li className="panel-empty">{loading ? 'Loading passages…' : emptyLabel}</li>
              ) : null}
              {chunks.map((chunk, index) => (
                <li key={chunk.id} id={`chunk-${chunk.id}`}>
                  <button
                    type="button"
                    className={chunk.id === activeChunkId ? 'chunk-card is-active' : 'chunk-card'}
                    onClick={() => onSelect(chunk.id)}
                  >
                    <div className="chunk-card-head">
                      <strong>
                        Passage {index + 1}: …{excerptBody(chunk.excerpt, chunk.id === activeChunkId ? activeQuote : undefined)}
                      </strong>
                      {chunk.relevanceScore != null ? (
                        <span className="chunk-score" title="Similarity to your question (higher is closer)">
                          {chunk.relevanceScore.toFixed(2)}
                        </span>
                      ) : null}
                    </div>
                    <span>{chunk.sourceLabel}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </>
      ) : (
        <p className="panel-note panel-note-muted">
          {chunks.length > 0
            ? `${chunks.length} passage${chunks.length === 1 ? '' : 's'} hidden.`
            : 'No passages loaded.'}
        </p>
      )}
    </section>
  )
}
