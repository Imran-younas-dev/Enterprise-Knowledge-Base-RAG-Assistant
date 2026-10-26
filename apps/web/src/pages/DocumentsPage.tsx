import { useEffect, useRef, useState } from 'react'
import type { SourceDocument } from '../data/knowledge'
import { SourceDocuments } from '../features/documents/SourceDocuments'
import { toSourceDocument } from '../features/documents/toSourceDocument'
import {
  deleteDocument,
  fetchDocument,
  fetchDocuments,
  reprocessDocument,
  uploadDocument,
} from '../lib/api'

export function DocumentsPage({ token }: { token: string }) {
  const fileInput = useRef<HTMLInputElement>(null)
  const [documents, setDocuments] = useState<SourceDocument[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [listError, setListError] = useState('')
  const [pending, setPending] = useState(false)
  const [confirmDeleteId, setConfirmDeleteId] = useState('')

  useEffect(() => {
    let active = true
    fetchDocuments(token)
      .then((rows) => {
        if (!active) {
          return
        }
        const next = rows.map(toSourceDocument)
        setDocuments(next)
        setSelectedId(next[0]?.id ?? '')
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

  async function handleFile(file: File | undefined) {
    if (!file) {
      return
    }
    setListError('')
    setPending(true)
    try {
      await uploadDocument(token, file)
      const rows = await fetchDocuments(token)
      const next = rows.map(toSourceDocument)
      setDocuments(next)
      setSelectedId(next[0]?.id ?? '')
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : 'Upload failed'
      setListError(message)
    } finally {
      setPending(false)
      if (fileInput.current) {
        fileInput.current.value = ''
      }
    }
  }

  async function handleReprocess(documentId: string) {
    setListError('')
    setConfirmDeleteId('')
    setPending(true)
    try {
      await reprocessDocument(token, documentId)
      setDocuments((current) =>
        current.map((document) =>
          document.id === documentId ? { ...document, status: 'queued', errorSummary: null } : document,
        ),
      )
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : 'Could not reprocess the document'
      setListError(message)
    } finally {
      setPending(false)
    }
  }

  async function handleDelete(documentId: string) {
    if (confirmDeleteId !== documentId) {
      setConfirmDeleteId(documentId)
      return
    }
    setListError('')
    setPending(true)
    try {
      await deleteDocument(token, documentId)
      setDocuments((current) => {
        const next = current.filter((document) => document.id !== documentId)
        setSelectedId(next[0]?.id ?? '')
        return next
      })
      setConfirmDeleteId('')
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : 'Could not delete the document'
      setListError(message)
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="dashboard">
      <h1>Documents</h1>
      <p className="page-note">
        Upload stays on this page. This list is the same one shown on the dashboard.
      </p>
      {listError ? <p className="form-error">{listError}</p> : null}
      <div className="workspace single">
        <section className="panel upload-panel">
          <h2>Add a document</h2>
          <p>PDF, DOCX, TXT, and Markdown. The file is stored, then read in the background.</p>
          <input
            ref={fileInput}
            type="file"
            accept=".pdf,.docx,.txt,.md,.markdown"
            hidden
            onChange={(event) => {
              void handleFile(event.target.files?.[0])
            }}
          />
          <button
            type="button"
            className="primary-button"
            disabled={pending}
            onClick={() => fileInput.current?.click()}
          >
            {pending ? 'Working…' : 'Choose file'}
          </button>
        </section>
        <SourceDocuments
          documents={documents}
          selectedId={selectedId}
          onSelect={(id) => {
            setConfirmDeleteId('')
            setSelectedId(id)
          }}
          onReprocess={(id) => {
            void handleReprocess(id)
          }}
          onDelete={(id) => {
            void handleDelete(id)
          }}
          confirmDelete={confirmDeleteId === selectedId}
          busy={pending}
        />
      </div>
    </div>
  )
}
