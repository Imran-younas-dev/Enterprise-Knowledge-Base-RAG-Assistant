import { FormEvent } from 'react'
import { BrainIcon, DeepSearchIcon, GlobeIcon, SearchIcon } from '../../components/Icons'
import { searchModeHints, searchModes, searchScopeNote, type SearchMode } from '../../data/knowledge'

const modeIcons = {
  web: GlobeIcon,
  thinking: BrainIcon,
  deep: DeepSearchIcon,
}

export function SearchBar({
  query,
  mode,
  error,
  disabled = false,
  onQueryChange,
  onModeChange,
  onSubmit,
}: {
  query: string
  mode: SearchMode
  error?: string
  disabled?: boolean
  onQueryChange: (value: string) => void
  onModeChange: (mode: SearchMode) => void
  onSubmit: () => void
}) {
  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    onSubmit()
  }

  return (
    <div className="search-block">
      <form
        className={disabled ? 'search-row is-busy' : 'search-row'}
        onSubmit={handleSubmit}
        aria-busy={disabled}
      >
        <label className="search-field">
          <SearchIcon />
          <input
            value={query}
            disabled={disabled}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Ask anything to your internal knowledge base..."
          />
        </label>
        <div className="mode-group" role="group" aria-label="Search mode">
          {searchModes.map((item) => {
            const Icon = modeIcons[item.id]
            return (
              <button
                key={item.id}
                type="button"
                disabled={disabled}
                className={mode === item.id ? 'mode-button is-active' : 'mode-button'}
                title={searchModeHints[item.id]}
                aria-describedby={`mode-tip-${item.id}`}
                onClick={() => onModeChange(item.id)}
              >
                <span className="mode-tooltip" id={`mode-tip-${item.id}`} role="tooltip">
                  {searchModeHints[item.id]}
                </span>
                <Icon />
                <span>{item.label}</span>
              </button>
            )
          })}
        </div>
      </form>
      <p className="search-scope-note">{searchScopeNote}</p>
      {error ? <p className="form-error search-error">{error}</p> : null}
    </div>
  )
}
