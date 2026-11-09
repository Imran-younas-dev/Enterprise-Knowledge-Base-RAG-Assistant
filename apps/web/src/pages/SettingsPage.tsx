import { useEffect, useState, type ReactNode } from 'react'
import profilePhoto from '../assets/profile-imran.png'
import {
  BrainIcon,
  DatabaseHealthIcon,
  DeepSearchIcon,
  GlobeIcon,
  RedisHealthIcon,
  ServerHealthIcon,
  StatusDownIcon,
  StatusOkIcon,
} from '../components/Icons'
import { StatusBanner } from '../components/StatusBanner'
import { searchModeHints, searchModes, type SearchMode } from '../data/knowledge'
import { fetchHealth, type HealthCheckItem, type HealthResponse } from '../lib/api'
import { displayNameFromEmail } from '../lib/display-name'
import { API_UNREACHABLE_MESSAGE } from '../lib/read-api-failure'

type LoadState = 'checking' | 'ready' | 'unreachable'

const modeIcons: Record<SearchMode, typeof GlobeIcon> = {
  web: GlobeIcon,
  thinking: BrainIcon,
  deep: DeepSearchIcon,
}

export function SettingsPage({ email }: { email: string }) {
  const [loadState, setLoadState] = useState<LoadState>('checking')
  const [health, setHealth] = useState<HealthResponse | null>(null)
  const name = displayNameFromEmail(email)

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
    <div className="dashboard settings-page">
      <h1>Settings</h1>
      {loadState === 'unreachable' ? <StatusBanner message={API_UNREACHABLE_MESSAGE} /> : null}
      <div className="settings-layout">
        <section className="panel settings-card settings-account">
          <h2>Account</h2>
          <div className="settings-account-row">
            <img className="avatar-photo settings-avatar" src={profilePhoto} alt="" />
            <div>
              <p className="settings-name">{name}</p>
              <p className="settings-email">{email}</p>
            </div>
          </div>
        </section>

        <section className="panel settings-card">
          <h2>Search modes</h2>
          <p className="panel-note">Hover a mode on the dashboard for the same guidance.</p>
          <ul className="settings-mode-list">
            {searchModes.map((item) => {
              const Icon = modeIcons[item.id]
              return (
                <li key={item.id} className="settings-mode-item">
                  <span className="settings-mode-icon" aria-hidden="true">
                    <Icon />
                  </span>
                  <div>
                    <p className="settings-mode-title">{item.label}</p>
                    <p className="settings-mode-hint">{searchModeHints[item.id]}</p>
                  </div>
                </li>
              )
            })}
          </ul>
        </section>

        <section className="panel settings-card settings-health-card">
          <h2>System health</h2>
          {loadState === 'checking' ? (
            <p className="panel-note">Checking API, database, and Redis…</p>
          ) : null}
          {loadState === 'ready' && health ? (
            <>
              <p
                className={
                  health.status === 'ok' ? 'settings-overall settings-overall-ok' : 'settings-overall'
                }
              >
                {health.status === 'ok' ? 'All checks passed' : 'One or more checks failed'}
              </p>
              <ul className="settings-health-grid">
                <HealthCard
                  title="API"
                  icon={<ServerHealthIcon />}
                  item={health.checks.api}
                />
                <HealthCard
                  title="Database"
                  icon={<DatabaseHealthIcon />}
                  item={health.checks.database}
                />
                <HealthCard title="Redis" icon={<RedisHealthIcon />} item={health.checks.redis} />
              </ul>
            </>
          ) : null}
        </section>
      </div>
    </div>
  )
}

function HealthCard({
  title,
  icon,
  item,
}: {
  title: string
  icon: ReactNode
  item: HealthCheckItem
}) {
  const ok = item.status === 'ok'
  return (
    <li className={ok ? 'health-card is-ok' : 'health-card is-down'}>
      <span className="health-card-icon">{icon}</span>
      <div className="health-card-body">
        <p className="health-card-title">{title}</p>
        <p className="health-card-message">{item.message}</p>
      </div>
      <span className={ok ? 'health-card-status health-card-status-ok' : 'health-card-status'}>
        {ok ? <StatusOkIcon /> : <StatusDownIcon />}
      </span>
    </li>
  )
}
