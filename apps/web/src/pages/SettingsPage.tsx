import { useEffect, useState } from 'react'
import { StatusBanner } from '../components/StatusBanner'
import { fetchHealth } from '../lib/api'
import { API_UNREACHABLE_MESSAGE } from '../lib/read-api-failure'

export function SettingsPage({ email }: { email: string }) {
  const [apiStatus, setApiStatus] = useState<'checking' | 'ok' | 'unreachable'>('checking')

  useEffect(() => {
    fetchHealth()
      .then(() => setApiStatus('ok'))
      .catch(() => setApiStatus('unreachable'))
  }, [])

  return (
    <div className="dashboard">
      <h1>Settings</h1>
      {apiStatus === 'unreachable' ? <StatusBanner message={API_UNREACHABLE_MESSAGE} /> : null}
      <section className="panel settings-panel">
        <h2>Account</h2>
        <p>{email}</p>
        <h2>Search modes</h2>
        <ul className="settings-list">
          <li>Web Search — search the internal document index.</li>
          <li>Thinking — show the retrieved chunks before the answer.</li>
          <li>Deep Search — retrieve a larger set of chunks.</li>
        </ul>
        <p className="panel-note">
          API health:{' '}
          <strong>
            {apiStatus === 'checking'
              ? 'Checking…'
              : apiStatus === 'ok'
                ? 'Reachable'
                : 'Not reachable'}
          </strong>
        </p>
      </section>
    </div>
  )
}
