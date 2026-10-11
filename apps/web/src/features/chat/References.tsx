import { FileIcon } from '../../components/Icons'
import type { ReferenceItem } from '../../data/sampleKnowledge'

export function References({ items }: { items: ReferenceItem[] }) {
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
              <strong>{item.marks}</strong>
            </p>
          </li>
        ))}
      </ul>
    </section>
  )
}
