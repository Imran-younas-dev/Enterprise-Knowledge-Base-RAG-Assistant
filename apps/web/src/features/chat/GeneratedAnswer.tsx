import { MoreIcon } from '../../components/Icons'

export function GeneratedAnswer({
  text,
  marks,
  onCite,
}: {
  text: string
  marks: string[]
  onCite: (mark: string) => void
}) {
  return (
    <section className="panel answer-panel">
      <header className="panel-head">
        <h2>AI-Generated Answer</h2>
        <button type="button" className="icon-button" aria-label="Answer actions">
          <MoreIcon />
        </button>
      </header>
      <p className="answer-copy">
        {text}{' '}
        {marks.map((mark, index) => (
          <span key={mark}>
            <button type="button" className="cite" onClick={() => onCite(mark)}>
              {mark}
            </button>
            {index < marks.length - 1 ? ', ' : '.'}
          </span>
        ))}
      </p>
    </section>
  )
}
