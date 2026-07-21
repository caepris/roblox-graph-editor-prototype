import type { Node, Edge } from '@xyflow/react';

export type NodeKind = 'input' | 'op' | 'param' | 'attr' | 'output';

export type LayerKey = 'glow' | 'scatter' | 'creature' | 'sound';

export type Layers = Record<LayerKey, boolean>;

export const DEFAULT_LAYERS: Layers = {
  glow: false,
  scatter: false,
  creature: false,
  sound: false,
};

export const LAYER_META: Record<LayerKey, { label: string; accent: string }> = {
  glow: { label: 'Glow + moss', accent: '#14b8a6' },
  scatter: { label: 'Scatter', accent: '#22c55e' },
  creature: { label: 'Creature', accent: '#f59e0b' },
  sound: { label: 'Sound', accent: '#ec4899' },
};

export type ParamKey = 'capRadius' | 'stemHeight' | 'glowIntensity';

export interface SliderControl {
  param: ParamKey;
  label: string;
  min: number;
  max: number;
  step: number;
}

export interface DomainNodeData extends Record<string, unknown> {
  label: string;
  subtitle?: string;
  kind: NodeKind;
  accent: string;
  controls?: SliderControl[];
  highlighted?: boolean;
  dimmed?: boolean;
  // When set, this node hands off to / reads from another graph; the id of that
  // domain. Rendered as a clickable entry point that navigates there.
  linkTo?: string;
}

export type Params = Record<ParamKey, number>;

export const DEFAULT_PARAMS: Params = {
  capRadius: 1,
  stemHeight: 1,
  glowIntensity: 1,
};

export type DomainNode = Node<DomainNodeData>;

export interface Domain {
  id: string;
  // The product this graph belongs to (one rail entry per product). Several
  // concrete graphs can share a product — e.g. the Mushroom and Alien graphs
  // are both the "Model Graph" product, picked via the explorer.
  product: string;
  name: string; // e.g. "Model Graph" — the product name shown in the rail
  subject?: string; // e.g. "Mushroom" — the specific asset a per-asset graph authors
  accent: string;
  tagline: string;
  engine: string;
  handoffs: string[];
  layer?: LayerKey; // the scene layer this domain authors (auto-enabled on select)
  nodes: DomainNode[];
  edges: Edge[];
}

export type RunsAt = 'Edit-time' | 'Offline' | 'Runtime';

export const RUNS_AT_META: Record<RunsAt, { accent: string; blurb: string }> = {
  'Edit-time': { accent: '#4f8cff', blurb: 'Re-runs in the editor the moment you change a parameter.' },
  Offline: { accent: '#a855f7', blurb: 'Runs async on a backend; results come back when ready.' },
  Runtime: { accent: '#f59e0b', blurb: 'Runs live every frame while the experience plays.' },
};

export interface WorkflowStep {
  id: number;
  domainId: string;
  title: string;
  action: string;
  stage: number;
  runsAt: RunsAt;
  // When set, the guided tour reveals only these node ids from the graph.
  // Omit to show the whole graph for that step.
  nodeIds?: string[];
  // When set, the whole graph shows but only these nodes are emphasized (rest dim).
  highlightIds?: string[];
  // When true, this step shows the AI assistant chat instead of the node graph.
  chat?: boolean;
}

