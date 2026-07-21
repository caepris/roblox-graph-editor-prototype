import type { Domain, DomainNode, DomainNodeData, NodeKind, SliderControl } from '../types';
import type { Edge } from '@xyflow/react';

function mk(
  id: string,
  x: number,
  y: number,
  kind: NodeKind,
  label: string,
  accent: string,
  subtitle?: string,
  controls?: SliderControl[],
  linkTo?: string,
): DomainNode {
  const data: DomainNodeData = { label, subtitle, kind, accent, controls, linkTo };
  return { id, position: { x, y }, data, type: 'pillar' };
}

function link(source: string, target: string): Edge {
  return { id: `${source}->${target}`, source, target, animated: true };
}

const X = 230; // horizontal step

/* ----------------------------- MODEL GRAPH --------------------------- */
/* Generate (Gen-AI) + Shape (CSG / procedural geometry): author one
   reusable asset non-destructively. Edit-time / offline, cached. */
const creationAccent = '#6366f1';
const creation: Domain = {
  id: 'creation',
  name: 'Model Graph',
  accent: creationAccent,
  tagline:
    'Author one asset — from a prompt through generation and shaping to a reusable, non-destructive model.',
  engine: 'Content engine · cloud-AI + CPU CSG node families · edit-time / offline · cached',
  handoffs: [
    'Exposes the “glow” value → Surface',
    'Provides the mushroom asset → Decorator',
    'Provides the creature rig → Move',
  ],
  nodes: [
    // — generate —
    mk('p1', 0, 130, 'input', 'Prompt', creationAccent, 'generate · “bioluminescent mushroom”'),
    mk('p2', X, 130, 'op', 'Text → Image', creationAccent, 'generate · cloud AI'),
    mk('p3', X * 2, 130, 'op', 'Image → 3D Model', creationAccent, 'generate · cloud AI'),
    // — shape —
    mk('p4', X * 3, 10, 'param', 'Cap radius · Stem height', creationAccent, 'shape · drag to reshape', [
      { param: 'capRadius', label: 'Cap radius', min: 0.5, max: 1.7, step: 0.01 },
      { param: 'stemHeight', label: 'Stem height', min: 0.6, max: 1.8, step: 0.01 },
    ]),
    mk('p5', X * 3, 180, 'op', 'CSG carve gills', creationAccent, 'shape'),
    mk('p6', X * 4, 130, 'op', 'Generate LODs', creationAccent, 'shape'),
    mk('p7', X * 5, 20, 'attr', 'Expose “glow”', creationAccent, 'shape · → Material'),
    mk('p8', X * 5, 150, 'output', 'Mushroom asset', creationAccent, 'reusable · → Decorator'),
  ],
  edges: [
    link('p1', 'p2'),
    link('p2', 'p3'),
    link('p3', 'p5'),
    link('p4', 'p6'),
    link('p5', 'p6'),
    link('p6', 'p7'),
    link('p6', 'p8'),
  ],
};

/* --------------------------- DECORATOR GRAPH ------------------------- */
/* Scatter / populate: distribute an asset across surfaces and volumes,
   streamed and promoted at runtime. Runtime spatial engine. */
const decoratorAccent = '#22c55e';
const decorator: Domain = {
  id: 'decorator',
  name: 'Decorator Graph',
  accent: decoratorAccent,
  tagline:
    'Populate space — scatter an asset across surfaces and volumes, streamed and promoted live at runtime.',
  engine: 'Runtime spatial engine · partitioned · incremental · per-frame budgets · GPU/CPU/in-world tiers',
  layer: 'scatter',
  handoffs: [
    'Instances the mushroom asset ← Model Graph',
    'Varies the “glow” value → Surface',
    'Streams GPU far · promotes interactive near',
  ],
  nodes: [
    mk('d1', 0, 40, 'input', 'Mushroom asset', decoratorAccent, 'the authored asset', undefined, 'creation'),
    mk('d2', 0, 210, 'input', 'Terrain surface', decoratorAccent, 'moisture · slope'),
    mk('d3', X, 130, 'op', 'Sampler — density by moisture', decoratorAccent),
    mk('d4', X * 2, 130, 'op', 'Subtract path', decoratorAccent),
    mk('d5', X * 3, 130, 'op', 'Slope / height filter', decoratorAccent),
    mk('d6', X * 4, 130, 'op', 'Randomize yaw · scale · jitter', decoratorAccent),
    mk('d7', X * 5, 30, 'attr', 'Vary “glow” per copy', decoratorAccent, 'per-copy · → Material'),
    mk('d8', X * 5, 170, 'output', 'Placed instances', decoratorAccent, 'GPU far · interactive near'),
  ],
  edges: [
    link('d2', 'd3'),
    link('d3', 'd4'),
    link('d4', 'd5'),
    link('d5', 'd6'),
    link('d6', 'd7'),
    link('d6', 'd8'),
    link('d1', 'd8'),
    link('d7', 'd8'),
  ],
};

/* ------------------------------ SURFACE ----------------------------- */
const surfaceAccent = '#14b8a6';
const surface: Domain = {
  id: 'surface',
  name: 'Material Graph',
  accent: surfaceAccent,
  tagline: 'Give it a look — define materials, texture, and appearance.',
  engine: 'Separate GPU shader engine · per-fragment · runtime',
  layer: 'glow',
  handoffs: ['Reads the “glow” value ← Model Graph', 'Assigns the material → mushroom instances'],
  nodes: [
    mk('m1', 0, 120, 'attr', '“glow” value', surfaceAccent, 'exposed parameter', undefined, 'creation'),
    mk('m2', X, 110, 'op', 'Emissive (glow)', surfaceAccent, 'drag to brighten →', [
      { param: 'glowIntensity', label: 'Glow intensity', min: 0, max: 2, step: 0.01 },
    ]),
    mk('m3', X * 2, 120, 'op', 'Pulse over time', surfaceAccent),
    mk('m4', X * 3, 120, 'op', 'Moss by height', surfaceAccent),
    mk('m5', X * 4, 120, 'output', 'Material', surfaceAccent, '→ assigned to mushroom'),
  ],
  edges: [link('m1', 'm2'), link('m2', 'm3'), link('m3', 'm4'), link('m4', 'm5')],
};

/* ------------------------------- MOVE ------------------------------- */
const moveAccent = '#f59e0b';
const move: Domain = {
  id: 'move',
  name: 'Animation Graph',
  accent: moveAccent,
  tagline: 'Bring it to life — blend poses and motion from live game state.',
  engine: 'Separate CPU pose engine · per-frame · runtime',
  layer: 'creature',
  handoffs: ['Uses the creature rig ← Model Graph', 'Fires footstep events → Sound'],
  nodes: [
    mk('a1', 0, 140, 'input', 'Creature rig', moveAccent, 'skeleton', undefined, 'creation'),
    mk('a2', X, 140, 'op', 'Blend idle / walk / run', moveAccent),
    mk('a3', X, 20, 'param', 'by speed', moveAccent),
    mk('a4', X * 2, 140, 'op', 'Head-look at player', moveAccent),
    mk('a5', X * 3, 140, 'op', 'Tail sway', moveAccent),
    mk('a6', X * 4, 140, 'output', 'Footstep events', moveAccent, '→ Audio'),
  ],
  edges: [
    link('a1', 'a2'),
    link('a3', 'a2'),
    link('a2', 'a4'),
    link('a4', 'a5'),
    link('a5', 'a6'),
  ],
};

/* ------------------------------- SOUND ------------------------------ */
const soundAccent = '#ec4899';
const sound: Domain = {
  id: 'sound',
  name: 'Audio Graph',
  accent: soundAccent,
  tagline: 'Bring it to life — route sources through effects into a live mix.',
  engine: 'Separate CPU DSP engine · per audio frame · runtime',
  layer: 'sound',
  handoffs: ['Attaches a hum emitter to each mushroom ← Decorator', 'Triggers footstep SFX ← Move'],
  nodes: [
    mk('u1', 0, 40, 'input', 'Ambient grove bed', soundAccent),
    mk('u2', 0, 150, 'op', 'Hum emitter per mushroom', soundAccent, 'per placed instance', undefined, 'decorator'),
    mk('u3', 0, 260, 'input', 'Footstep events', soundAccent, 'gameplay events', undefined, 'move'),
    mk('u4', X, 260, 'op', 'Footstep SFX', soundAccent),
    mk('u5', X * 2, 150, 'op', 'Reverb zone', soundAccent),
    mk('u6', X * 3, 150, 'output', 'Mix → listener', soundAccent),
  ],
  edges: [
    link('u1', 'u5'),
    link('u2', 'u5'),
    link('u3', 'u4'),
    link('u4', 'u5'),
    link('u5', 'u6'),
  ],
};

export const DOMAINS: Domain[] = [creation, decorator, surface, move, sound];

export function domainById(id: string): Domain {
  return DOMAINS.find((d) => d.id === id) ?? DOMAINS[0];
}
