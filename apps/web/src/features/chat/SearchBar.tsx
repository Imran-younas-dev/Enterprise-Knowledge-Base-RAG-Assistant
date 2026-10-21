import { FormEvent } from 'react'
import { BrainIcon, DeepSearchIcon, GlobeIcon, SearchIcon } from '../../components/Icons'
import { searchModes, type SearchMode } from '../../data/knowledge'

const modeIcons = {
  web: GlobeIcon,
  thinking: BrainIcon,
  deep: DeepSearchIcon,
}

export function SearchBar({
  query,
  mode,
  onQueryChange,
  onModeChange,
  onSubmit,
}: {
  query: string
  mode: SearchMode
  onQueryChange: (value: string) => void
  onModeChange: (mode: SearchMode) => void
  onSubmit: () => void
}) {
  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    onSubmit()
  }

  return (
    <form className="search-row" onSubmit={handleSubmit}>
      <label className="search-field">
        <SearchIcon />
        <input
          value={query}
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
              className={mode === item.id ? 'mode-button is-active' : 'mode-button'}
              onClick={() => onModeChange(item.id)}
            >
              <Icon />
              <span>{item.label}</span>
            </button>
          )
        })}
      </div>
    </form>
  )
}
