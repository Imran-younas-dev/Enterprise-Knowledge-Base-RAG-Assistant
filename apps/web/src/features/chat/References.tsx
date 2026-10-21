import { FileIcon } from '../../components/Icons'
import type { ReferenceItem } from '../../data/knowledge'

export function References({
  items,
  onSelect,
}: {
  items: ReferenceItem[]
  onSelect?: (id: string) => void
}) {
  return (
    <section className="references">
      <h2>References</h2>
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            <FileIcon kind={item.kind} />
            <p>
              <span>{item.title}</span>
              {item.detail ? <span className="ref-link">{item.detail}</span> : null}{' '}
              {onSelect ? (
                <button type="button" className="cite" onClick={() => onSelect(item.id)}>
                  {item.marks}
                </button>
              ) : (
                <strong>{item.marks}</strong>
              )}
            </p>
          </li>
        ))}
      </ul>
    </section>
  )
}
