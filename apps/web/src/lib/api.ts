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
