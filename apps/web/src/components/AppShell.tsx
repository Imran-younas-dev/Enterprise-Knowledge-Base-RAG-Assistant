import type { ReactNode } from 'react'
import { TopBar, type AppPage } from './TopBar'

export function AppShell({
  page,
  onPageChange,
  children,
}: {
  page: AppPage
  onPageChange: (page: AppPage) => void
  children: ReactNode
}) {
  return (
    <div className="app-bg">
      <section className="app-frame">
        <TopBar page={page} onPageChange={onPageChange} />
        {children}
      </section>
    </div>
  )
}
