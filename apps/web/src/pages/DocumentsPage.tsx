import { useEffect, useState } from 'react'
import type { SourceDocument } from '../data/sampleKnowledge'
import { SourceDocuments } from '../features/documents/SourceDocuments'
import { toSourceDocument } from '../features/documents/toSourceDocument'
import { fetchDocuments } from '../lib/api'

export function DocumentsPage({ token }: { token: string }) {
  const [documents, setDocuments] = useState<SourceDocument[]>([])
  const [selectedId, setSelectedId] = useState('')
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
          <p>PDF, DOCX, TXT, and Markdown. The upload action arrives with the documents API.</p>
          <button type="button" className="primary-button" disabled>
            Choose file
          </button>
        </section>
        <SourceDocuments documents={documents} selectedId={selectedId} onSelect={setSelectedId} />
      </div>
    </div>
  )
}
