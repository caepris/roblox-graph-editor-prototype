import { DOMAINS } from '../data/domains';

export default function DomainRail({
  activeId,
  onSelect,
}: {
  activeId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <aside className="rail">
      <div className="rail-title">
        <div className="rail-logo">◆</div>
        <div>
          <div className="rail-h1">Graph Editor</div>
          <div className="rail-h2">one editor · every graph</div>
        </div>
      </div>

      <div className="rail-group">
        <div className="rail-group-label">Graphs</div>
        {DOMAINS.map((d) => (
          <button
            key={d.id}
            className={`rail-item ${activeId === d.id ? 'active' : ''}`}
            style={activeId === d.id ? { borderColor: d.accent } : undefined}
            onClick={() => onSelect(d.id)}
          >
            <span className="rail-item-dot" style={{ background: d.accent }} />
            <span className="rail-name">{d.name}</span>
          </button>
        ))}
      </div>

      <div className="rail-foot">Prototype · concept demo</div>
    </aside>
  );
}
