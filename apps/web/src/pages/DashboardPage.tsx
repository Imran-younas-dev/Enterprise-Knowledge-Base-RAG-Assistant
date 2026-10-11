import { useMemo, useState } from 'react'
import {
  documentChunks,
  references,
  sampleAnswer,
  sourceDocuments,
  type SearchMode,
} from '../data/sampleKnowledge'
import { GeneratedAnswer } from '../features/chat/GeneratedAnswer'
import { References } from '../features/chat/References'
import { SearchBar } from '../features/chat/SearchBar'
import { DocumentChunks } from '../features/documents/DocumentChunks'
import { SourceDocuments } from '../features/documents/SourceDocuments'

export function DashboardPage() {
  const [query, setQuery] = useState('')
  const [mode, setMode] = useState<SearchMode>('web')
  const [selectedDocumentId, setSelectedDocumentId] = useState(sourceDocuments[0].id)
  const [activeChunkId, setActiveChunkId] = useState<string | null>(documentChunks[0].id)
  const [asked, setAsked] = useState(true)

  const shownChunks = useMemo(
    () => documentChunks.filter((chunk) => chunk.documentId === selectedDocumentId),
    [selectedDocumentId],
  )

  return (
    <div className="dashboard">
      <h1>AI Knowledge RAG</h1>
      <SearchBar
        query={query}
        mode={mode}
        onQueryChange={setQuery}
        onModeChange={setMode}
        onSubmit={() => setAsked(true)}
      />
      <div className="workspace">
        <div className="stack">
          <SourceDocuments
            documents={sourceDocuments}
            selectedId={selectedDocumentId}
            onSelect={setSelectedDocumentId}
          />
          <DocumentChunks
            chunks={shownChunks}
            activeChunkId={activeChunkId}
            onSelect={setActiveChunkId}
          />
        </div>
        <div className="stack">
          {asked ? (
            <GeneratedAnswer
              text={sampleAnswer.text}
              marks={sampleAnswer.marks}
              onCite={(mark) => setActiveChunkId(mark === '1' ? 'chunk-1' : 'chunk-2')}
            />
          ) : null}
          <References items={references} />
        </div>
      </div>
    </div>
  )
}
