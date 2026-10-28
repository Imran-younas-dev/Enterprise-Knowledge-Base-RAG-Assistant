import { useEffect, useState } from 'react'
import type { ReferenceItem, SearchMode, SourceDocument } from '../data/knowledge'
import { askQuestion, fetchDocumentChunks, fetchDocuments, type ApiCitation } from '../lib/api'
import { toDocumentChunk } from '../features/documents/toDocumentChunk'
import { kindFor, toSourceDocument } from '../features/documents/toSourceDocument'
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
  const [answer, setAnswer] = useState('')
  const [citations, setCitations] = useState<ApiCitation[]>([])
  const [asked, setAsked] = useState(false)
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

  function highlightChunk(chunkId: string) {
    const citation = citations.find((item) => item.id === chunkId)
    setActiveChunkId(chunkId)
    if (citation) {
      setSelectedDocumentId(citation.documentId)
    }
  }

  async function showDocumentChunks(documentId: string) {
    setSelectedDocumentId(documentId)
    setListError('')
    const rows = await fetchDocumentChunks(token, documentId)
    const nextChunks = rows.map(toDocumentChunk)
    setChunks(nextChunks)
    setActiveChunkId(nextChunks[0]?.id ?? null)
  }

  async function showAnswer(question: string, searchMode: SearchMode) {
    setListError('')
    const result = await askQuestion(token, { question, mode: searchMode })
    const nextChunks = result.chunks.map(toDocumentChunk)
    const firstCitation = result.citations[0]
    setChunks(nextChunks)
    setCitations(result.citations)
    setAnswer(visibleAnswer(result.answer))
    setAsked(true)
    setActiveChunkId(firstCitation?.id ?? nextChunks[0]?.id ?? null)
    if (firstCitation) {
      setSelectedDocumentId(firstCitation.documentId)
    }
  }

  async function selectDocument(documentId: string) {
    try {
      if (query.trim()) {
        setSelectedDocumentId(documentId)
        await showAnswer(query.trim(), mode)
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
      await showAnswer(query.trim(), mode)
    } catch (caught: unknown) {
      const message = caught instanceof Error ? caught.message : 'The question could not be answered'
      setListError(message)
    }
  }

  const references = citations.map(toReference)
  const thinkingLayout = mode === 'thinking' && asked
  const chunkPanel = (
    <DocumentChunks
      chunks={chunks}
      activeChunkId={activeChunkId}
      onSelect={highlightChunk}
      status={thinkingLayout ? 'Retrieved passages for this question.' : undefined}
    />
  )

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
          {thinkingLayout ? null : chunkPanel}
        </div>
        <div className="stack">
          {thinkingLayout ? chunkPanel : null}
          {asked ? (
            <GeneratedAnswer
              text={answer}
              marks={citations.map((_, index) => String(index + 1))}
              onCite={(mark) => {
                const citation = citations[Number(mark) - 1]
                if (citation) {
                  highlightChunk(citation.id)
                }
              }}
            />
          ) : null}
          <References
            items={references}
            onSelect={(id) => {
              highlightChunk(id)
            }}
          />
        </div>
      </div>
    </div>
  )
}

function visibleAnswer(answer: string) {
  return answer.replace(/\s*\[[0-9a-f-]{36}\]/gi, '').trim()
}

function referenceTitle(citation: ApiCitation) {
  const parts = [citation.title]
  if (citation.page != null) {
    parts.push(`p. ${citation.page}`)
  } else if (citation.section) {
    parts.push(citation.section)
  }
  return parts.join(', ')
}

function toReference(citation: ApiCitation, index: number): ReferenceItem {
  const title = referenceTitle(citation)
  return {
    id: citation.id,
    kind: kindFor('', citation.title),
    title,
    detail: citation.quote,
    marks: `[${index + 1}]`,
  }
}
