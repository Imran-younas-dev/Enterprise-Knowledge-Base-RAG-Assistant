import { useState } from 'react'
import { AppShell } from './components/AppShell'
import type { AppPage } from './components/TopBar'
import { DashboardPage } from './pages/DashboardPage'
import { DocumentsPage } from './pages/DocumentsPage'
import { SettingsPage } from './pages/SettingsPage'

export function App() {
  const [page, setPage] = useState<AppPage>('dashboard')

  return (
    <AppShell page={page} onPageChange={setPage}>
      {page === 'dashboard' ? <DashboardPage /> : null}
      {page === 'documents' ? <DocumentsPage /> : null}
      {page === 'settings' ? <SettingsPage /> : null}
    </AppShell>
  )
}
