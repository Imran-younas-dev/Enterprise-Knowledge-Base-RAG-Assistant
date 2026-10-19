import { useEffect, useMemo, useState } from 'react'
import {
  documentChunks,
  references,
  sampleAnswer,
  type SearchMode,
  type SourceDocument,
} from '../data/sampleKnowledge'
import { fetchDocuments } from '../lib/api'
import { toSourceDocument } from '../features/documents/toSourceDocument'
import { GeneratedAnswer } from '../features/chat/GeneratedAnswer'
import { References } from '../features/chat/References'
import { SearchBar } from '../features/chat/SearchBar'
import { DocumentChunks } from '../features/documents/DocumentChunks'
import { SourceDocuments } from '../features/documents/SourceDocuments'

export function DashboardPage({ token }: { token: string }) {
  const [query, setQuery] = useState('')
  const [mode, setMode] = useState<SearchMode>('web')
  const [documents, setDocuments] = useState<SourceDocument[]>([])
  const [selectedDocumentId, setSelectedDocumentId] = useState('')
  const [activeChunkId, setActiveChunkId] = useState<string | null>(documentChunks[0].id)
  const [asked, setAsked] = useState(true)
  const [listError, setListError] = useState('')

  useEffect(() => {
    let active = true
    fetchDocuments(token)
      .then((rows) => {
        if (!active) {
          return
        }
        const next = rows.map(toSourceDocument)
        setDocuments(next)
        setSelectedDocumentId(next[0]?.id ?? '')
      })
      .catch((caught: unknown) => {
        if (!active) {
          return
        }
        const message = caught instanceof Error ? caught.message : 'Could not load documents'
        setListError(message)
      })
    return () => {
      active = false
    }
  }, [token])

  const shownChunks = useMemo(() => {
    const matched = documentChunks.filter((chunk) => chunk.documentId === selectedDocumentId)
    return matched.length > 0 ? matched : documentChunks.slice(0, 2)
  }, [selectedDocumentId])

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
          {listError ? <p className="form-error">{listError}</p> : null}
          <SourceDocuments
            documents={documents}
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
