export type HealthResponse = {
  status: string
}

export type AuthUser = {
  id: string
  email: string
}

export type LoginResponse = {
  token: string
  user: AuthUser
}

export type Session = {
  token: string
  user: AuthUser
}

const SESSION_KEY = 'rag.session'

export function readSession(): Session | null {
  const raw = localStorage.getItem(SESSION_KEY)
  if (!raw) {
    return null
  }
  try {
    const parsed = JSON.parse(raw) as Session
    if (!parsed.token || !parsed.user?.id || !parsed.user?.email) {
      return null
    }
    return parsed
  } catch {
    return null
  }
}

export function writeSession(session: Session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

type Envelope<T> = {
  data: T
}

export async function fetchHealth(): Promise<HealthResponse> {
  const response = await fetch('/api/health')
  if (!response.ok) {
    throw new Error(`Health check failed: ${response.status}`)
  }
  const body = (await response.json()) as Envelope<HealthResponse>
  return body.data
}

type ErrorEnvelope = {
  message?: string
}

export type ApiDocument = {
  id: string
  title: string
  originalFilename: string
  mimeType: string
  fileSizeBytes: number
  status: string
  errorCode: string | null
  errorSummary: string | null
  createdAt: string
}

export async function fetchDocuments(token: string): Promise<ApiDocument[]> {
  const response = await fetch('/api/documents', {
    headers: { authorization: `Bearer ${token}` },
  })
  const body = (await response.json()) as Envelope<ApiDocument[]> & ErrorEnvelope
  if (!response.ok) {
    throw new Error(body.message || 'Could not load documents')
  }
  return body.data
}

export async function fetchDocument(token: string, documentId: string): Promise<ApiDocument> {
  const response = await fetch(`/api/documents/${documentId}`, {
    headers: { authorization: `Bearer ${token}` },
  })
  const body = (await response.json()) as Envelope<ApiDocument> & ErrorEnvelope
  if (!response.ok) {
    throw new Error(body.message || 'Could not load the document')
  }
  return body.data
}

export async function reprocessDocument(
  token: string,
  documentId: string,
): Promise<{ id: string; status: string }> {
  const response = await fetch(`/api/documents/${documentId}/reprocess`, {
    method: 'POST',
    headers: { authorization: `Bearer ${token}` },
  })
  const body = (await response.json()) as Envelope<{ id: string; status: string }> &
    ErrorEnvelope
  if (!response.ok) {
    throw new Error(body.message || 'Could not reprocess the document')
  }
  return body.data
}

export async function deleteDocument(
  token: string,
  documentId: string,
): Promise<{ id: string; status: string }> {
  const response = await fetch(`/api/documents/${documentId}`, {
    method: 'DELETE',
    headers: { authorization: `Bearer ${token}` },
  })
  const body = (await response.json()) as Envelope<{ id: string; status: string }> &
    ErrorEnvelope
  if (!response.ok) {
    throw new Error(body.message || 'Could not delete the document')
  }
  return body.data
}

export async function uploadDocument(
  token: string,
  file: File,
): Promise<{ id: string; status: string; duplicate?: boolean; message?: string }> {
  const payload = new FormData()
  payload.append('file', file)
  const response = await fetch('/api/documents', {
    method: 'POST',
    headers: { authorization: `Bearer ${token}` },
    body: payload,
  })
  const body = (await response.json()) as Envelope<{
    id: string
    status: string
    duplicate?: boolean
    message?: string
  }> &
    ErrorEnvelope
  if (!response.ok) {
    throw new Error(body.message || 'Upload failed')
  }
  return body.data
}

export type ApiChunk = {
  id: string
  documentId: string
  chunkIndex: number
  content: string
  pageNumber: number | null
  sectionTitle: string | null
  originalFilename: string
  distance?: number
}

export type SearchResult = {
  thinking: boolean
  chunks: ApiChunk[]
}

export async function fetchDocumentChunks(token: string, documentId: string): Promise<ApiChunk[]> {
  const response = await fetch(`/api/documents/${documentId}/chunks`, {
    headers: { authorization: `Bearer ${token}` },
  })
  const body = (await response.json()) as Envelope<ApiChunk[]> & ErrorEnvelope
  if (!response.ok) {
    throw new Error(body.message || 'Could not load chunks')
  }
  return body.data
}

export type ApiCitation = {
  id: string
  documentId: string
  title: string
  page: number | null
  section: string | null
  quote: string
}

export type AskResult = {
  answer: string
  insufficientEvidence: boolean
  citations: ApiCitation[]
  chunks: ApiChunk[]
  metadata: {
    retrievalMs: number
    modelMs: number
  }
}

export async function askQuestion(
  token: string,
  input: { question: string; mode: string },
): Promise<AskResult> {
  const response = await fetch('/api/chat/ask', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify(input),
  })
  const body = (await response.json()) as Envelope<AskResult> & ErrorEnvelope
  if (!response.ok) {
    throw new Error(body.message || 'The question could not be answered')
  }
  return body.data
}

export async function searchPassages(
  token: string,
  input: { question: string; mode: string },
): Promise<SearchResult> {
  const response = await fetch('/api/retrieval/search', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify(input),
  })
  const body = (await response.json()) as Envelope<SearchResult> & ErrorEnvelope
  if (!response.ok) {
    throw new Error(body.message || 'Search failed')
  }
  return body.data
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const body = (await response.json()) as Envelope<LoginResponse> & ErrorEnvelope
  if (!response.ok) {
    throw new Error(body.message || 'Sign in failed')
  }
  return body.data
}
