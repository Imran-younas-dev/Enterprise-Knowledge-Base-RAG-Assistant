import { useEffect, useState } from 'react'
import {
  references,
  sampleAnswer,
  type SearchMode,
  type SourceDocument,
} from '../data/sampleKnowledge'
import { fetchDocumentChunks, fetchDocuments, searchPassages } from '../lib/api'
import { toDocumentChunk } from '../features/documents/toDocumentChunk'
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
  const [chunks, setChunks] = useState<ReturnType<typeof toDocumentChunk>[]>([])
  const [activeChunkId, setActiveChunkId] = useState<string | null>(null)
  const [asked, setAsked] = useState(true)
  const [thinking, setThinking] = useState(false)
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
        const firstId = next[0]?.id ?? ''
        setSelectedDocumentId(firstId)
        if (firstId) {
          return fetchDocumentChunks(token, firstId)
        }
        return []
      })
      .then((rows) => {
        if (!active || !rows) {
          return
        }
        const nextChunks = rows.map(toDocumentChunk)
        setChunks(nextChunks)
        setActiveChunkId(nextChunks[0]?.id ?? null)
        setThinking(false)
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

  async function showDocumentChunks(documentId: string) {
    setSelectedDocumentId(documentId)
    setListError('')
    const rows = await fetchDocumentChunks(token, documentId)
    const nextChunks = rows.map(toDocumentChunk)
    setChunks(nextChunks)
    setActiveChunkId(nextChunks[0]?.id ?? null)
    setThinking(false)
  }

  async function showSearch(question: string) {
    setListError('')
    const result = await searchPassages(token, { question, mode })
    const nextChunks = result.chunks.map(toDocumentChunk)
    setChunks(nextChunks)
    setActiveChunkId(nextChunks[0]?.id ?? null)
    setThinking(result.thinking)
    setAsked(true)
  }

  async function selectDocument(documentId: string) {
    try {
      if (query.trim()) {
        setSelectedDocumentId(documentId)
        await showSearch(query.trim())
        return
      }
      await showDocumentChunks(documentId)
    } catch (caught: unknown) {
      const message = caught instanceof Error ? caught.message : 'Could not load chunks'
      setListError(message)
    }
  }

  async function submitQuestion() {
    if (!query.trim()) {
      return
    }
    try {
      await showSearch(query.trim())
    } catch (caught: unknown) {
      const message = caught instanceof Error ? caught.message : 'Search failed'
      setListError(message)
    }
  }

  return (
    <div className="dashboard">
      <h1>AI Knowledge RAG</h1>
      <SearchBar
        query={query}
        mode={mode}
        onQueryChange={setQuery}
        onModeChange={setMode}
        onSubmit={() => {
          void submitQuestion()
        }}
      />
      <div className="workspace">
        <div className="stack">
          {listError ? <p className="form-error">{listError}</p> : null}
          <SourceDocuments
            documents={documents}
            selectedId={selectedDocumentId}
            onSelect={(id) => {
              void selectDocument(id)
            }}
          />
          <DocumentChunks
            chunks={chunks}
            activeChunkId={activeChunkId}
            onSelect={setActiveChunkId}
            status={thinking ? 'Retrieved passages for this question.' : undefined}
          />
        </div>
        <div className="stack">
          {asked ? (
            <GeneratedAnswer
              text={sampleAnswer.text}
              marks={sampleAnswer.marks}
              onCite={() => setActiveChunkId(chunks[0]?.id ?? null)}
            />
          ) : null}
          <References items={references} />
        </div>
      </div>
    </div>
  )
}
