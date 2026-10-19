import { useState } from 'react'
import { AppShell } from './components/AppShell'
import type { AppPage } from './components/TopBar'
import { readSession, writeSession, type Session } from './lib/api'
import { DashboardPage } from './pages/DashboardPage'
import { DocumentsPage } from './pages/DocumentsPage'
import { SettingsPage } from './pages/SettingsPage'
import { SignInPage } from './pages/SignInPage'

export function App() {
  const [page, setPage] = useState<AppPage>('dashboard')
  const [session, setSession] = useState<Session | null>(() => readSession())

  function handleSignIn(next: Session) {
    writeSession(next)
    setSession(next)
    setPage('dashboard')
  }

  return (
    <AppShell page={page} onPageChange={setPage} email={session?.user.email}>
      {session ? (
        <>
          {page === 'dashboard' ? <DashboardPage token={session.token} /> : null}
          {page === 'documents' ? <DocumentsPage token={session.token} /> : null}
          {page === 'settings' ? <SettingsPage email={session.user.email} /> : null}
        </>
      ) : (
        <SignInPage onSuccess={handleSignIn} />
      )}
    </AppShell>
  )
}
