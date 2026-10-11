type IconProps = { className?: string }

export function LogoMark() {
  return (
    <span className="logo-mark" aria-hidden="true">
      <svg viewBox="0 0 24 24" width="16" height="16">
        <path
          d="M5 7h14M5 12h14M5 17h10"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    </span>
  )
}

export function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M16 16.5L20 20.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

export function GlobeIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
      <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M4 12h16M12 4c2.4 2.6 2.4 13.4 0 16M12 4c-2.4 2.6-2.4 13.4 0 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      />
    </svg>
  )
}

export function BrainIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
      <path
        d="M9 7a3 3 0 0 1 5.2-2A3 3 0 0 1 18 8a2.8 2.8 0 0 1 1 5.2A3 3 0 0 1 16 18H9a3 3 0 0 1-2.2-5A3 3 0 0 1 8 7.2 3 3 0 0 1 9 7z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      />
    </svg>
  )
}

export function DeepSearchIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
      <circle cx="10.5" cy="10.5" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M14.5 14.5L19 19" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M8.5 10.5h4M10.5 8.5v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

export function FileIcon({ kind }: { kind: string }) {
  if (kind === 'link') {
    return (
      <span className="file-badge file-badge-link" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="16" height="16">
          <path
            d="M10 13a5 5 0 0 0 7.1.1l1.4-1.4a5 5 0 0 0-7.1-7.1L10 6"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
          <path
            d="M14 11a5 5 0 0 0-7.1-.1L5.5 12.3a5 5 0 0 0 7.1 7.1L14 18"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
        </svg>
      </span>
    )
  }

  return (
    <span className={`file-badge file-badge-${kind}`} aria-hidden="true">
      <svg viewBox="0 0 24 24" width="16" height="16">
        <path
          d="M7 3.5h7l4 4V20a1.5 1.5 0 0 1-1.5 1.5h-9.5A1.5 1.5 0 0 1 5.5 20V5A1.5 1.5 0 0 1 7 3.5z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
        />
        <path d="M14 3.5V8h4.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    </span>
  )
}

export function AvatarIcon({ className }: IconProps) {
  return (
    <span className={className ?? 'avatar'} aria-hidden="true">
      <svg viewBox="0 0 24 24" width="18" height="18">
        <circle cx="12" cy="9" r="3.2" fill="currentColor" />
        <path d="M6 18.5c1.2-2.4 3.3-3.5 6-3.5s4.8 1.1 6 3.5" fill="currentColor" />
      </svg>
    </span>
  )
}

export function MoreIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
      <circle cx="6" cy="12" r="1.3" fill="currentColor" />
      <circle cx="12" cy="12" r="1.3" fill="currentColor" />
      <circle cx="18" cy="12" r="1.3" fill="currentColor" />
    </svg>
  )
}
