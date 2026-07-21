import { PRODUCTS, domainById } from '../data/domains';

export default function DomainRail({
  activeId,
  onSelect,
}: {
  activeId: string;
  onSelect: (id: string) => void;
}) {
  const activeProduct = domainById(activeId).product;

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
        {PRODUCTS.map((p) => {
          const active = activeProduct === p.product;
          return (
            <button
              key={p.product}
              className={`rail-item ${active ? 'active' : ''}`}
              style={active ? { borderColor: p.accent } : undefined}
              // Picking a product from the rail opens its default graph; the
              // specific graph within a product is chosen from the explorer.
              onClick={() => {
                if (!active) onSelect(p.defaultId);
              }}
            >
              <span className="rail-item-dot" style={{ background: p.accent }} />
              <span className="rail-name">{p.name}</span>
            </button>
          );
        })}
      </div>

      <div className="rail-foot">Prototype · concept demo</div>
    </aside>
  );
}
