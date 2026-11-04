import { useEffect, useState } from 'react'
import { StatusBanner } from '../components/StatusBanner'
import { fetchHealth, type HealthResponse } from '../lib/api'
import { API_UNREACHABLE_MESSAGE } from '../lib/read-api-failure'

type LoadState = 'checking' | 'ready' | 'unreachable'

export function SettingsPage({ email }: { email: string }) {
  const [loadState, setLoadState] = useState<LoadState>('checking')
  const [health, setHealth] = useState<HealthResponse | null>(null)

  useEffect(() => {
    fetchHealth()
      .then((payload) => {
        setHealth(payload)
        setLoadState('ready')
      })
      .catch(() => {
        setHealth(null)
        setLoadState('unreachable')
      })
  }, [])

  return (
    <div className="dashboard">
      <h1>Settings</h1>
      {loadState === 'unreachable' ? <StatusBanner message={API_UNREACHABLE_MESSAGE} /> : null}
      <section className="panel settings-panel">
        <h2>Account</h2>
        <p>{email}</p>
        <h2>Search modes</h2>
        <ul className="settings-list">
          <li>Web Search — search the internal document index.</li>
          <li>Thinking — show the retrieved chunks before the answer.</li>
          <li>Deep Search — retrieve a larger set of chunks.</li>
        </ul>
        <h2>API health</h2>
        {loadState === 'checking' ? (
          <p className="panel-note">Checking API, database, and Redis…</p>
        ) : null}
        {loadState === 'ready' && health ? (
          <>
            <p className="panel-note">
              Overall:{' '}
              <strong>{health.status === 'ok' ? 'All checks passed' : 'One or more checks failed'}</strong>
            </p>
            <ul className="health-checks">
              <HealthCheckRow label="API" item={health.checks.api} />
              <HealthCheckRow label="Database" item={health.checks.database} />
              <HealthCheckRow label="Redis" item={health.checks.redis} />
            </ul>
          </>
        ) : null}
      </section>
    </div>
  )
}

function HealthCheckRow({
  label,
  item,
}: {
  label: string
  item: HealthResponse['checks']['api']
}) {
  return (
    <li className={item.status === 'ok' ? 'health-check is-ok' : 'health-check is-down'}>
      <span className="health-check-label">{label}</span>
      <span className="health-check-message">{item.message}</span>
    </li>
  )
}
