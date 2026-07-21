import { ReactFlow, Background, Controls, BackgroundVariant } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import PillarNode from './PillarNode';
import type { Domain } from '../types';

const nodeTypes = { pillar: PillarNode };

export default function GraphCanvas({
  domain,
  visibleIds,
  highlightIds,
}: {
  domain: Domain;
  visibleIds?: string[];
  highlightIds?: string[];
}) {
  const baseNodes = visibleIds
    ? domain.nodes.filter((n) => visibleIds.includes(n.id))
    : domain.nodes;
  const shown = new Set(baseNodes.map((n) => n.id));

  const hi = highlightIds ? new Set(highlightIds) : null;

  const nodes = hi
    ? baseNodes.map((n) => ({
        ...n,
        data: { ...n.data, highlighted: hi.has(n.id), dimmed: !hi.has(n.id) },
      }))
    : baseNodes;

  const edges = domain.edges
    .filter((e) => shown.has(e.source) && shown.has(e.target))
    .map((e) => {
      if (!hi) return e;
      const on = hi.has(e.source) && hi.has(e.target);
      return { ...e, animated: on, style: { ...e.style, opacity: on ? 1 : 0.12 } };
    });

  // Remount when the domain / visible subset / highlight set changes so the
  // (uncontrolled) React Flow graph re-applies nodes and re-fits the view.
  const key = `${domain.id}:${visibleIds ? visibleIds.join(',') : 'all'}:${
    highlightIds ? highlightIds.join(',') : 'none'
  }`;

  return (
    <div className="graph-canvas">
      <ReactFlow
        key={key}
        defaultNodes={nodes}
        defaultEdges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.08, maxZoom: 1.6 }}
        proOptions={{ hideAttribution: true }}
        minZoom={0.3}
        defaultEdgeOptions={{ style: { stroke: '#4b5566', strokeWidth: 1.5 } }}
      >
        <Background variant={BackgroundVariant.Dots} gap={22} size={1} color="#232833" />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}
