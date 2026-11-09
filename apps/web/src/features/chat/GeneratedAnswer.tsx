export function GeneratedAnswer({
  text,
  marks,
  onCite,
  insufficientEvidence = false,
}: {
  text: string
  marks: string[]
  onCite: (mark: string) => void
  insufficientEvidence?: boolean
}) {
  return (
    <section className="panel answer-panel">
      <header className="panel-head panel-head-title-only">
        <h2>AI-Generated Answer</h2>
      </header>
      <p className="answer-copy">
        {text}
        {insufficientEvidence || marks.length === 0 ? (
          '.'
        ) : (
          <>
            {' '}
            {marks.map((mark, index) => (
              <span key={mark}>
                <button type="button" className="cite" onClick={() => onCite(mark)}>
                  {mark}
                </button>
                {index < marks.length - 1 ? ', ' : '.'}
              </span>
            ))}
          </>
        )}
      </p>
    </section>
  )
}
