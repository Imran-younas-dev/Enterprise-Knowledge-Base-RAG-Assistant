export function StatusBanner({
  message,
  tone = 'error',
}: {
  message: string
  tone?: 'error' | 'info'
}) {
  return (
    <p className={tone === 'error' ? 'status-banner is-error' : 'status-banner'} role="status">
      {message}
    </p>
  )
}
