import { useEffect, useState } from 'react'
import { fetchHealth } from '../lib/api'

export function SettingsPage({ email }: { email: string }) {
  const [apiStatus, setApiStatus] = useState('checking')

  useEffect(() => {
    fetchHealth()
      .then((health) => setApiStatus(health.status))
      .catch(() => setApiStatus('unreachable'))
  }, [])

  return (
    <div className="dashboard">
      <h1>Settings</h1>
      <section className="panel settings-panel">
        <h2>Account</h2>
        <p>{email}</p>
        <h2>Search modes</h2>
        <ul className="settings-list">
          <li>Web Search — search the internal document index.</li>
          <li>Thinking — show the retrieved chunks before the answer.</li>
          <li>Deep Search — retrieve a larger set of chunks.</li>
        </ul>
        <p>
          API health: <strong>{apiStatus}</strong>
        </p>
      </section>
    </div>
  )
}
