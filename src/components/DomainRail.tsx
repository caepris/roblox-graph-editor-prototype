import { PRODUCTS, domainById } from '../data/domains';

const ASSISTANT_ACCENT = '#a855f7';

// The Asset Graph is reached via entry points (not the rail); the Assistant is
// rendered as its own bespoke item, so both are filtered from the graph list.
const GRAPH_PRODUCTS = PRODUCTS.filter((p) => p.product !== 'asset' && p.product !== 'assistant');

export default function DomainRail({
  activeId,
  onSelect,
}: {
  activeId: string;
  onSelect: (id: string) => void;
}) {
  const activeProduct = domainById(activeId).product;
  const assistantActive = activeProduct === 'assistant';

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
        <div className="rail-group-label">Assistant</div>
        <button
          className={`rail-item ${assistantActive ? 'active' : ''}`}
          style={assistantActive ? { borderColor: ASSISTANT_ACCENT } : undefined}
          onClick={() => {
            if (!assistantActive) onSelect('assistant');
          }}
        >
          <span className="rail-item-dot" style={{ background: ASSISTANT_ACCENT }} />
          <span className="rail-name">Assistant</span>
        </button>
      </div>

      <div className="rail-group">
        <div className="rail-group-label">Graphs</div>
        {GRAPH_PRODUCTS.map((p) => {
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
