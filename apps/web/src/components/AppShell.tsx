import type { ReactNode } from 'react'
import { TopBar, type AppPage } from './TopBar'

export function AppShell({
  page,
  onPageChange,
  email,
  children,
}: {
  page: AppPage
  onPageChange: (page: AppPage) => void
  email?: string
  children: ReactNode
}) {
  return (
    <div className="app-bg">
      <section className="app-frame">
        <TopBar page={page} onPageChange={onPageChange} email={email} />
        {children}
      </section>
    </div>
  )
}
