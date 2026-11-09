import { useEffect, useState } from 'react'
import type { ReferenceItem, SearchMode, SourceDocument } from '../data/knowledge'
import { StatusBanner } from '../components/StatusBanner'
import {
  askQuestion,
  deleteDocument,
  fetchDocument,
  fetchDocumentChunks,
  fetchDocuments,
  fetchHealth,
  reprocessDocument,
  type ApiCitation,
} from '../lib/api'
import {
  API_UNREACHABLE_MESSAGE,
  isApiUnreachableMessage,
  readApiFailure,
} from '../lib/read-api-failure'
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
  const [documentsLoading, setDocumentsLoading] = useState(true)
  const [chunksLoading, setChunksLoading] = useState(false)
  const [selectedDocumentId, setSelectedDocumentId] = useState('')
  const [chunks, setChunks] = useState<ReturnType<typeof toDocumentChunk>[]>([])
  const [activeChunkId, setActiveChunkId] = useState<string | null>(null)
  const [answer, setAnswer] = useState('')
  const [citations, setCitations] = useState<ApiCitation[]>([])
  const [asked, setAsked] = useState(false)
  const [asking, setAsking] = useState(false)
  const [insufficientEvidence, setInsufficientEvidence] = useState(false)
  const [chunkNotice, setChunkNotice] = useState('')
  const [searchError, setSearchError] = useState('')
  const [apiUnreachable, setApiUnreachable] = useState(false)
  const [passagesOpen, setPassagesOpen] = useState(true)
  const [docBusy, setDocBusy] = useState(false)
  const [confirmDeleteId, setConfirmDeleteId] = useState('')

  useEffect(() => {
    let active = true
    setDocumentsLoading(true)
    setApiUnreachable(false)

    void fetchHealth()
      .then(() => {
        if (!active) {
          return null
        }
        return fetchDocuments(token)
      })
      .then((rows) => {
        if (!active || !rows) {
          return
        }
        const next = rows.map(toSourceDocument)
        setDocuments(next)
        const firstId = next[0]?.id ?? ''
        setSelectedDocumentId(firstId)
        if (firstId) {
          setChunksLoading(true)
          return fetchDocumentChunks(token, firstId)
        }
        setChunks([])
        setActiveChunkId(null)
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
        const message = readApiFailure(caught, 'Could not load documents')
        if (isApiUnreachableMessage(message)) {
          setApiUnreachable(true)
        } else {
          setChunkNotice(message)
        }
      })
      .finally(() => {
        if (active) {
          setDocumentsLoading(false)
          setChunksLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [token])

  const waitingIds = documents
    .filter((document) => document.status === 'queued' || document.status === 'processing')
    .map((document) => document.id)
    .join(',')

  useEffect(() => {
    if (!waitingIds) {
      return
    }
    let active = true
    const ids = waitingIds.split(',')
    const timer = setInterval(() => {
      void Promise.all(ids.map((id) => fetchDocument(token, id)))
        .then((rows) => {
          if (!active) {
            return
          }
          setDocuments((current) =>
            current.map((document) => {
              const fresh = rows.find((row) => row.id === document.id)
              return fresh ? toSourceDocument(fresh) : document
            }),
          )
        })
        .catch(() => {
          if (!active) {
            return
          }
        })
    }, 1500)
    return () => {
      active = false
      clearInterval(timer)
    }
  }, [token, waitingIds])

  function scrollToChunk(chunkId: string) {
    requestAnimationFrame(() => {
      document.getElementById(`chunk-${chunkId}`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    })
  }

  function highlightChunk(chunkId: string) {
    const citation = citations.find((item) => item.id === chunkId)
    setActiveChunkId(chunkId)
    setPassagesOpen(true)
    if (citation) {
      setSelectedDocumentId(citation.documentId)
    }
    scrollToChunk(chunkId)
  }

  async function showDocumentChunks(documentId: string) {
    setSelectedDocumentId(documentId)
    setChunkNotice('')
    setChunksLoading(true)
    try {
      const rows = await fetchDocumentChunks(token, documentId)
      const nextChunks = rows.map(toDocumentChunk)
      setChunks(nextChunks)
      setActiveChunkId(nextChunks[0]?.id ?? null)
      setPassagesOpen(true)
    } finally {
      setChunksLoading(false)
    }
  }

  async function showAnswer(question: string, searchMode: SearchMode) {
    setSearchError('')
    const result = await askQuestion(token, { question, mode: searchMode })
    const nextChunks = result.chunks.map(toDocumentChunk)
    const firstCitation = result.citations[0]
    setChunks(nextChunks)
    setCitations(result.citations)
    setAnswer(visibleAnswer(result.answer))
    setInsufficientEvidence(result.insufficientEvidence)
    setAsked(true)
    setPassagesOpen(mode !== 'thinking')
    setActiveChunkId(firstCitation?.id ?? nextChunks[0]?.id ?? null)
    if (firstCitation) {
      setSelectedDocumentId(firstCitation.documentId)
    }
  }

  async function selectDocument(documentId: string) {
    if (asking) {
      return
    }
    setConfirmDeleteId('')
    try {
      if (query.trim()) {
        setSelectedDocumentId(documentId)
        setAsking(true)
        await showAnswer(query.trim(), mode)
        return
      }
      setAsked(false)
      setCitations([])
      setAnswer('')
      setInsufficientEvidence(false)
      await showDocumentChunks(documentId)
    } catch (caught: unknown) {
      const message = readApiFailure(caught, 'Could not load passages')
      if (isApiUnreachableMessage(message)) {
        setApiUnreachable(true)
      } else {
        setChunkNotice(message)
      }
    } finally {
      setAsking(false)
    }
  }

  async function submitQuestion() {
    setSearchError('')
    setAsking(true)
    try {
      await showAnswer(query, mode)
    } catch (caught: unknown) {
      const message = readApiFailure(caught, 'The question could not be answered')
      if (isApiUnreachableMessage(message)) {
        setApiUnreachable(true)
      } else {
        setSearchError(message)
      }
    } finally {
      setAsking(false)
    }
  }

  async function handleReprocess(documentId: string) {
    setChunkNotice('')
    setConfirmDeleteId('')
    setDocBusy(true)
    try {
      await reprocessDocument(token, documentId)
      setDocuments((current) =>
        current.map((document) =>
          document.id === documentId ? { ...document, status: 'queued', errorSummary: null } : document,
        ),
      )
    } catch (caught: unknown) {
      const message = caught instanceof Error ? caught.message : 'Could not reprocess the document'
      setChunkNotice(message)
    } finally {
      setDocBusy(false)
    }
  }

  async function handleDelete(documentId: string) {
    if (confirmDeleteId !== documentId) {
      setConfirmDeleteId(documentId)
      return
    }
    setChunkNotice('')
    setDocBusy(true)
    try {
      await deleteDocument(token, documentId)
      const rows = await fetchDocuments(token)
      const next = rows.map(toSourceDocument)
      setDocuments(next)
      const nextId = next[0]?.id ?? ''
      setSelectedDocumentId(nextId)
      setConfirmDeleteId('')
      if (nextId) {
        await showDocumentChunks(nextId)
      } else {
        setChunks([])
        setActiveChunkId(null)
      }
    } catch (caught: unknown) {
      const message = caught instanceof Error ? caught.message : 'Could not delete the document'
      setChunkNotice(message)
    } finally {
      setDocBusy(false)
    }
  }

  const showReferences = asked && !insufficientEvidence && citations.length > 0
  const references = citations.map(toReference)
  const activeCitation = citations.find((item) => item.id === activeChunkId)
  const chunkEmptyLabel =
    documents.length === 0
      ? 'Upload a document on the Documents page to see passages here.'
      : asked
        ? 'No passages were retrieved for this question.'
        : 'Select a document or ask a question to load passages.'

  return (
    <div className="dashboard">
      <h1>AI Knowledge RAG</h1>
      {apiUnreachable ? <StatusBanner message={API_UNREACHABLE_MESSAGE} /> : null}
      <SearchBar
        query={query}
        mode={mode}
        error={searchError}
        disabled={asking || apiUnreachable}
        onQueryChange={(value) => {
          setSearchError('')
          setQuery(value)
        }}
        onModeChange={setMode}
        onSubmit={() => {
          void submitQuestion()
        }}
      />
      <div className="workspace">
        <div className="stack">
          <SourceDocuments
            documents={documents}
            selectedId={selectedDocumentId}
            loading={documentsLoading}
            emptyHint="No documents yet. Open Documents in the menu to upload your first file."
            onSelect={(id) => {
              void selectDocument(id)
            }}
            onReprocess={(id) => {
              void handleReprocess(id)
            }}
            onDelete={(id) => {
              void handleDelete(id)
            }}
            confirmDelete={confirmDeleteId === selectedDocumentId}
            busy={docBusy || asking}
          />
        </div>
        <div className="stack">
          {asking ? (
            <section className="panel answer-panel" aria-busy="true">
              <header className="panel-head panel-head-title-only">
                <h2>AI-Generated Answer</h2>
              </header>
              <div className="answer-skeleton" aria-hidden="true">
                <span />
                <span />
                <span className="short" />
              </div>
              <p className="panel-note">Searching your documents and drafting an answer…</p>
            </section>
          ) : asked ? (
            <GeneratedAnswer
              text={answer}
              insufficientEvidence={insufficientEvidence}
              marks={insufficientEvidence ? [] : citations.map((_, index) => String(index + 1))}
              onCite={(mark) => {
                const citation = citations[Number(mark) - 1]
                if (citation) {
                  highlightChunk(citation.id)
                }
              }}
            />
          ) : (
            <section className="panel answer-panel">
              <header className="panel-head panel-head-title-only">
                <h2>AI-Generated Answer</h2>
              </header>
              <p className="panel-empty">
                {documents.length === 0
                  ? 'Upload a document, then ask a question to get a cited answer.'
                  : 'Ask a question to generate an answer from your documents.'}
              </p>
            </section>
          )}
          {showReferences ? (
            <References
              items={references}
              onSelect={(id) => {
                highlightChunk(id)
              }}
            />
          ) : null}
          <DocumentChunks
            chunks={chunks}
            activeChunkId={activeChunkId}
            onSelect={highlightChunk}
            loading={chunksLoading}
            emptyLabel={chunkEmptyLabel}
            status={chunkNotice || (asked ? 'Passages retrieved for your question.' : undefined)}
            collapsible={asked}
            open={passagesOpen}
            onOpenChange={setPassagesOpen}
            highlightQuote={activeCitation?.quote}
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
