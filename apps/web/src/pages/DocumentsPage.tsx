import { sourceDocuments } from '../data/sampleKnowledge'
import { SourceDocuments } from '../features/documents/SourceDocuments'
import { useState } from 'react'

export function DocumentsPage() {
  const [selectedId, setSelectedId] = useState(sourceDocuments[0].id)

  return (
    <div className="dashboard">
      <h1>Documents</h1>
      <p className="page-note">
        Upload stays on this page. The dashboard reads the same document list once ingestion is
        connected.
      </p>
      <div className="workspace single">
        <section className="panel upload-panel">
          <h2>Add a document</h2>
          <p>PDF, DOCX, TXT, and Markdown. The upload action arrives with the documents API.</p>
          <button type="button" className="primary-button" disabled>
            Choose file
          </button>
        </section>
        <SourceDocuments
          documents={sourceDocuments}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
      </div>
    </div>
  )
}
