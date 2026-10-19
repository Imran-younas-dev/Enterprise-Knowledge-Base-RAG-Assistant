import { AvatarIcon, LogoMark } from './Icons'

export type AppPage = 'dashboard' | 'documents' | 'settings'

const pages: { id: AppPage; label: string }[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'documents', label: 'Documents' },
  { id: 'settings', label: 'Settings' },
]

export function TopBar({
  page,
  onPageChange,
  email,
}: {
  page: AppPage
  onPageChange: (page: AppPage) => void
  email?: string
}) {
  return (
    <header className="topbar">
      <div className="brand">
        <LogoMark />
        <span>AI SEARCH</span>
      </div>
      <nav className="nav" aria-label="Primary">
        {pages.map((item) => (
          <button
            key={item.id}
            type="button"
            className={page === item.id ? 'nav-link is-active' : 'nav-link'}
            onClick={() => onPageChange(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>
      <button type="button" className="avatar-button">
        <AvatarIcon />
        <span>{email ? <EmailLabel email={email} /> : 'Sign in'}</span>
        <span className="chevron" aria-hidden="true">
          ▾
        </span>
      </button>
    </header>
  )
}

function EmailLabel({ email }: { email: string }) {
  const [local, domain] = email.split('@')
  if (!domain) {
    return email
  }
  return (
    <>
      {local}
      <br />@{domain}
    </>
  )
}
