import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { DomainNode, NodeKind } from '../types';
import { useParams } from '../ParamsContext';
import { useGraphNav } from '../GraphNavContext';
import { domainById } from '../data/domains';

const KIND_LABEL: Record<NodeKind, string> = {
  input: 'INPUT',
  op: 'OP',
  param: 'PARAM',
  attr: 'ATTR',
  output: 'OUTPUT',
};

export default function PillarNode({ data }: NodeProps<DomainNode>) {
  const { label, subtitle, kind, accent, controls, highlighted, dimmed, linkTo } = data;
  const { params, setParam } = useParams();
  const navigate = useGraphNav();
  const isOutput = kind === 'output';
  const isInput = kind === 'input';
  const target = linkTo ? domainById(linkTo) : null;

  const boxShadow = highlighted
    ? `0 0 0 2px ${accent}, 0 0 18px ${accent}66`
    : '0 0 0 1px #2a2f3a';

  return (
    <div
      className="pillar-node"
      style={{
        borderLeft: `3px solid ${accent}`,
        boxShadow,
        opacity: dimmed ? 0.32 : 1,
        transition: 'opacity 0.2s, box-shadow 0.2s',
      }}
    >
      {!isInput && <Handle type="target" position={Position.Left} className="pn-handle" />}
      <div className="pn-kind" style={{ color: accent }}>
        {KIND_LABEL[kind]}
      </div>
      <div className="pn-label">{label}</div>
      {subtitle && <div className="pn-sub">{subtitle}</div>}

      {target && (
        <button
          className="pn-entry nodrag"
          style={{ borderColor: target.accent, color: target.accent }}
          title={`Open ${target.name}`}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            navigate(target.id);
          }}
        >
          <span className="pn-entry-dot" style={{ background: target.accent }} />
          {target.name}
          <span className="pn-entry-arrow">↗</span>
        </button>
      )}

      {controls?.map((c) => (
        <div className="pn-control nodrag" key={c.param}>
          <div className="pn-control-row">
            <span className="pn-control-label">{c.label}</span>
            <span className="pn-control-val" style={{ color: accent }}>
              {params[c.param].toFixed(2)}
            </span>
          </div>
          <input
            type="range"
            min={c.min}
            max={c.max}
            step={c.step}
            value={params[c.param]}
            style={{ accentColor: accent }}
            onChange={(e) => setParam(c.param, parseFloat(e.target.value))}
            onPointerDown={(e) => e.stopPropagation()}
          />
        </div>
      ))}

      {!isOutput && <Handle type="source" position={Position.Right} className="pn-handle" />}
    </div>
  );
}
