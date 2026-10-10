import type { ReactNode } from 'react';

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: '3rem 1.5rem' }}>
      <p style={{ letterSpacing: '0.08em', textTransform: 'uppercase', fontSize: 12 }}>
        Enterprise knowledge base
      </p>
      {children}
    </main>
  );
}
