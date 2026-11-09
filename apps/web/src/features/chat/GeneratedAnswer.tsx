const REFUSAL_COPY = 'No relevant information found in your documents.'

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
  const refused = insufficientEvidence

  return (
    <section className={refused ? 'panel answer-panel is-refusal' : 'panel answer-panel'}>
      <header className="panel-head panel-head-title-only">
        <h2>{refused ? 'No match in your documents' : 'AI-Generated Answer'}</h2>
      </header>
      {refused ? (
        <p className="answer-refusal">{REFUSAL_COPY}</p>
      ) : (
        <p className="answer-copy">
          {text}
          {marks.length === 0 ? (
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
      )}
    </section>
  )
}
