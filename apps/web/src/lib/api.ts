export type HealthResponse = {
  status: string
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
