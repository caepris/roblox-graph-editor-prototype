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
  showPromptHistory?: boolean,
): DomainNode {
  const data: DomainNodeData = { label, subtitle, kind, accent, controls, linkTo, showPromptHistory };
  return { id, position: { x, y }, data, type: 'pillar' };
}

function link(source: string, target: string): Edge {
  return { id: `${source}->${target}`, source, target, animated: true };
}

const X = 230; // horizontal step
const Y = 210; // deterministic spine baseline

/* Two-tier colour scheme communicates the determinism boundary:
   – aiAccent (purple, = RunsAt "Offline"): the Gen-AI Asset Graph — prompt →
     image → 3D mesh → texture, async on the cloud, non-deterministic.
   – firewallAccent (rose): the determinism firewall / bake node.
   – creationAccent (indigo, = RunsAt "Edit-time"): the deterministic
     CreationGraph — the real `ModelGraphNodes` C++ CSG/geometry builtins. */
const creationAccent = '#6366f1';
const aiAccent = '#a855f7';
const firewallAccent = '#f43f5e';

/* ---------------------------- CREATION GRAPH ------------------------- */
/* The deterministic modeling recipe. It Fetches a baked mesh produced by the
   Asset Graph (gen-AI, offline) and shapes it with the real `ModelGraphNodes`
   builtins from the ModelGraph prototype (getBuiltinRegistry in
   ProceduralBehaviorSchedulerService.cpp): Fetch, Transform, CSGUnion,
   CSGSubtract, Repeat, Mirror, SmoothNormals, BasicShape, CreateMeshPart —
   plus attribute pins. The gen-AI + firewall now live in the Asset Graph. */
const creation: Domain = {
  id: 'creation',
  product: 'model',
  name: 'CreationGraph',
  subject: 'Mushroom',
  accent: creationAccent,
  tagline:
    'Shape one asset — Fetch a baked mesh from the Asset Graph, then re-evaluatably shape it with deterministic CSG/geometry builtins.',
  engine:
    'ModelGraphNodes CSG/geometry builtins · edit-time · cached · re-evaluatable (mesh comes baked from the Asset Graph)',
  handoffs: [
    'Fetches the baked mesh ← Asset Graph',
    'Exposes the “glow” attribute → Material',
    'Provides the mushroom asset → Decorator',
  ],
  nodes: [
    // — CreationGraph · deterministic ModelGraphNodes builtins · Edit-time —
    mk('gA', X * 5, 20, 'attr', 'Attribute pins', creationAccent, 'exposed params · re-evaluate on change', [
      { param: 'capRadius', label: 'Cap radius', min: 0.5, max: 1.7, step: 0.01 },
      { param: 'stemHeight', label: 'Stem height', min: 0.6, max: 1.8, step: 0.01 },
    ]),
    // Fetch is the entry point — it reads the baked mesh from the Asset Graph.
    mk('g6', X * 5, Y, 'op', 'Fetch', creationAccent, 'MeshContent(id) · baked mesh ← Asset Graph', undefined, 'asset'),
    mk('g7', X * 6, Y, 'op', 'Transform', creationAccent, 'CFrame · Size · scale cap by attributes'),
    mk('s1', X * 6, 380, 'op', 'BasicShape', creationAccent, 'Cylinder primitive · stem'),
    mk('g8', X * 7, Y, 'op', 'CSGUnion', creationAccent, 'MainMesh + ToolMeshes · cap ∪ stem'),
    mk('g9', X * 8, Y, 'op', 'Repeat', creationAccent, 'union N copies · CFrames · scatter spots'),
    mk('s2', X * 9, 380, 'op', 'BasicShape', creationAccent, 'Wedge primitive · gill cutter'),
    mk('g10', X * 9, Y, 'op', 'CSGSubtract', creationAccent, 'MainMesh − ToolMeshes · carve gills'),
    mk('g11', X * 10, Y, 'op', 'Mirror', creationAccent, 'reflect across CFrame plane · symmetry'),
    mk('g12', X * 11, Y, 'op', 'SmoothNormals', creationAccent, 'recompute normals · crease 30°'),
    mk('g13', X * 12, 40, 'attr', 'Expose “glow” attribute', creationAccent, 'attribute pin · → Material'),
    mk('g14', X * 12, Y, 'op', 'CreateMeshPart', creationAccent, 'SolidMeshObject → MeshPart'),
    mk('g15', X * 12, 380, 'input', 'Material', creationAccent, 'applied appearance ← Material Graph', undefined, 'surface'),
    mk('g16', X * 13, Y, 'output', 'Mushroom asset', creationAccent, 'reusable model · → Decorator'),
  ],
  edges: [
    // deterministic build (mesh arrives pre-baked from the Asset Graph)
    link('gA', 'g7'),
    link('g6', 'g7'),
    link('g7', 'g8'),
    link('s1', 'g8'),
    link('g8', 'g9'),
    link('g9', 'g10'),
    link('s2', 'g10'),
    link('g10', 'g11'),
    link('g11', 'g12'),
    link('g12', 'g14'),
    link('g14', 'g13'),
    link('g14', 'g16'),
    link('g15', 'g16'),
  ],
};

/* ------------------------ CREATION GRAPH · ALIEN -------------------- */
/* Per-asset CreationGraph for the alien creature — same type as the mushroom's:
   it Fetches a baked mesh from the Asset Graph and shapes it with deterministic
   ModelGraphNodes builtins. Uses Mirror for bilateral symmetry; produces a
   rigged mesh whose rig feeds the Animation Graph. */
const alien: Domain = {
  id: 'alien',
  product: 'model',
  name: 'CreationGraph',
  subject: 'Alien',
  accent: creationAccent,
  tagline:
    'Shape the creature — Fetch a baked mesh from the Asset Graph, then shape it with deterministic CSG builtins into a rigged, reusable alien model.',
  engine:
    'ModelGraphNodes CSG/geometry builtins · edit-time · cached · re-evaluatable (mesh comes baked from the Asset Graph)',
  layer: 'creature',
  handoffs: [
    'Fetches the baked mesh ← Asset Graph',
    'Provides the creature rig → Animation',
    'Uses a Material ← Material Graph',
  ],
  nodes: [
    // — CreationGraph · deterministic ModelGraphNodes builtins · Edit-time —
    mk('kA', X * 5, 20, 'attr', 'Attribute pins', creationAccent, 'height · limb length · re-evaluate on change'),
    // Fetch is the entry point — it reads the baked body mesh from the Asset Graph.
    mk('k6', X * 5, Y, 'op', 'Fetch', creationAccent, 'MeshContent(id) · baked body mesh ← Asset Graph', undefined, 'asset'),
    mk('k7', X * 6, Y, 'op', 'Transform', creationAccent, 'CFrame · Size · scale body by attributes'),
    mk('ks1', X * 6, 380, 'op', 'BasicShape', creationAccent, 'Cylinder primitive · limb'),
    mk('k8', X * 7, Y, 'op', 'CSGUnion', creationAccent, 'MainMesh + ToolMeshes · body ∪ limbs'),
    mk('k9', X * 8, Y, 'op', 'Mirror', creationAccent, 'reflect across CFrame · bilateral limbs'),
    mk('k10', X * 9, Y, 'op', 'SmoothNormals', creationAccent, 'recompute normals · crease 40°'),
    mk('k11', X * 10, Y, 'op', 'CreateMeshPart', creationAccent, 'SolidMeshObject → MeshPart'),
    mk('k12', X * 11, Y, 'op', 'Auto-rig skeleton', creationAccent, 'rig authoring · bones + joints'),
    mk('kx1', X * 11, 40, 'attr', 'Expose “Rig” attribute', creationAccent, 'attribute pin · → Animation'),
    mk('kx2', X * 11, 380, 'input', 'Material', creationAccent, 'applied appearance ← Material Graph', undefined, 'surface-alien'),
    mk('k13', X * 12, Y, 'output', 'Alien asset', creationAccent, 'reusable model · rigged'),
  ],
  edges: [
    // deterministic build (mesh arrives pre-baked from the Asset Graph)
    link('kA', 'k7'),
    link('k6', 'k7'),
    link('k7', 'k8'),
    link('ks1', 'k8'),
    link('k8', 'k9'),
    link('k9', 'k10'),
    link('k10', 'k11'),
    link('k11', 'k12'),
    link('k12', 'kx1'),
    link('k12', 'k13'),
    link('kx2', 'k13'),
  ],
};

/* --------------------------- DECORATOR GRAPH ------------------------- */
/* Scatter / populate: distribute an asset across surfaces and volumes,
   streamed and promoted at runtime. Runtime spatial engine. */
const decoratorAccent = '#22c55e';
const decorator: Domain = {
  id: 'decorator',
  product: 'decorator',
  name: 'Decorator Graph',
  accent: decoratorAccent,
  tagline:
    'Populate space — scatter an asset across surfaces and volumes, streamed and promoted live at runtime.',
  engine: 'Runtime spatial engine · partitioned · incremental · per-frame budgets · GPU/CPU/in-world tiers',
  layer: 'scatter',
  handoffs: [
    'Instances the mushroom asset ← CreationGraph',
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
/* ShaderVM surface program: read Input.* values, sample DiffuseMap / NormalMap
   / SpecularMap, run float4 ALU, and write the Surface.* channels. Single basic
   block, per-fragment, no branching or loops. */
const surfaceAccent = '#14b8a6';
const surface: Domain = {
  id: 'surface',
  product: 'material',
  name: 'Material Graph',
  subject: 'Mushroom',
  accent: surfaceAccent,
  tagline: 'Give it a look — a ShaderVM surface program: sample, blend, and write the Surface.* channels.',
  engine: 'ShaderVM surface shader · float4 ALU + texture fetch · per-fragment · one basic block (no branch/loop)',
  layer: 'glow',
  handoffs: [
    'Reads the “glow” value ← CreationGraph',
    'Writes Surface.Color · Normal · Material · Emissive',
  ],
  nodes: [
    // — inputs (Input.* namespace) —
    mk('m1', 0, 60, 'input', 'Input.UV', surfaceAccent, 'mesh texcoords'),
    mk('m2', 0, 175, 'input', 'Input.WorldPosition', surfaceAccent, '.Y drives moss height'),
    mk('m3', 0, 290, 'input', 'Input.Time', surfaceAccent, 'seconds · drives pulse'),
    mk('m4', 0, 405, 'input', '“glow” param', surfaceAccent, '← “glow” from CreationGraph'),
    // — texture fetches —
    mk('m5', X, 20, 'op', 'SampleAlbedo(UV)', surfaceAccent, 'DiffuseMap · rgba'),
    mk('m6', X, 140, 'op', 'SampleNormal(UV)', surfaceAccent, 'NormalMap · tangent-space'),
    mk('m7', X, 260, 'op', 'SampleParams(UV)', surfaceAccent, 'metalness · roughness'),
    // — float4 ALU —
    mk('m8', X * 2, 20, 'op', 'Tint · albedo × BrickColor', surfaceAccent),
    mk('m9', X * 2, 150, 'op', 'Moss blend · Lerp by WorldPos.Y', surfaceAccent),
    mk('m10', X * 2, 300, 'op', 'SinCos(Time) → pulse', surfaceAccent, 'sc.xxxx * 0.5 + 0.5'),
    mk('m11', X * 3, 320, 'op', 'Emissive · glowColor × pulse', surfaceAccent, 'drag to brighten →', [
      { param: 'glowIntensity', label: 'Glow intensity', min: 0, max: 2, step: 0.01 },
    ]),
    // — Surface.* outputs —
    mk('m12', X * 4, 30, 'output', 'Surface.Color', surfaceAccent, 'rgb albedo · a opacity'),
    mk('m13', X * 4, 140, 'output', 'Surface.Normal', surfaceAccent, 'tangent-space'),
    mk('m14', X * 4, 250, 'output', 'Surface.Material', surfaceAccent, 'metal · rough · reflect'),
    mk('m15', X * 4, 360, 'output', 'Surface.Emissive', surfaceAccent, 'rgb glow light'),
  ],
  edges: [
    link('m1', 'm5'),
    link('m1', 'm6'),
    link('m1', 'm7'), // UV → all three samplers
    link('m5', 'm8'), // albedo → tint
    link('m8', 'm9'),
    link('m2', 'm9'), // tint + world position → moss blend
    link('m9', 'm12'), // → Surface.Color
    link('m6', 'm13'), // normal → Surface.Normal
    link('m7', 'm14'), // params → Surface.Material
    link('m3', 'm10'), // time → SinCos
    link('m10', 'm11'),
    link('m4', 'm11'), // pulse + glow → emissive
    link('m11', 'm15'), // → Surface.Emissive
  ],
};

/* -------------------------- SURFACE · ALIEN ------------------------- */
/* The alien's own ShaderVM surface program — same graph type as the mushroom's,
   but its own rules: skin tint, a belly→back gradient, and pulsing vein glow. */
const alienSurface: Domain = {
  id: 'surface-alien',
  product: 'material',
  name: 'Material Graph',
  subject: 'Alien',
  accent: surfaceAccent,
  tagline: 'Give the alien its look — a ShaderVM surface program: skin, scales, and pulsing veins.',
  engine: 'ShaderVM surface shader · float4 ALU + texture fetch · per-fragment · one basic block (no branch/loop)',
  layer: 'creature',
  handoffs: [
    'Reads the “glow” value ← Alien CreationGraph',
    'Writes Surface.Color · Normal · Material · Emissive',
  ],
  nodes: [
    // — inputs (Input.* namespace) —
    mk('am1', 0, 60, 'input', 'Input.UV', surfaceAccent, 'mesh texcoords'),
    mk('am2', 0, 175, 'input', 'Input.WorldPosition', surfaceAccent, '.Y drives belly gradient'),
    mk('am3', 0, 290, 'input', 'Input.Time', surfaceAccent, 'seconds · drives vein pulse'),
    mk('am4', 0, 405, 'input', '“glow” param', surfaceAccent, '← “glow” from Alien CreationGraph'),
    // — texture fetches —
    mk('am5', X, 20, 'op', 'SampleAlbedo(UV)', surfaceAccent, 'SkinMap · rgba'),
    mk('am6', X, 140, 'op', 'SampleNormal(UV)', surfaceAccent, 'ScaleMap · tangent-space'),
    mk('am7', X, 260, 'op', 'SampleParams(UV)', surfaceAccent, 'metalness · roughness'),
    // — float4 ALU —
    mk('am8', X * 2, 20, 'op', 'Tint · albedo × SkinColor', surfaceAccent),
    mk('am9', X * 2, 150, 'op', 'Belly gradient · Lerp by WorldPos.Y', surfaceAccent),
    mk('am10', X * 2, 300, 'op', 'SinCos(Time) → pulse', surfaceAccent, 'sc.xxxx * 0.5 + 0.5'),
    mk('am11', X * 3, 320, 'op', 'Emissive · veinColor × pulse', surfaceAccent, 'bioluminescent veins'),
    // — Surface.* outputs —
    mk('am12', X * 4, 30, 'output', 'Surface.Color', surfaceAccent, 'rgb albedo · a opacity'),
    mk('am13', X * 4, 140, 'output', 'Surface.Normal', surfaceAccent, 'tangent-space'),
    mk('am14', X * 4, 250, 'output', 'Surface.Material', surfaceAccent, 'metal · rough · reflect'),
    mk('am15', X * 4, 360, 'output', 'Surface.Emissive', surfaceAccent, 'rgb vein light'),
  ],
  edges: [
    link('am1', 'am5'),
    link('am1', 'am6'),
    link('am1', 'am7'), // UV → all three samplers
    link('am5', 'am8'), // albedo → tint
    link('am8', 'am9'),
    link('am2', 'am9'), // tint + world position → belly gradient
    link('am9', 'am12'), // → Surface.Color
    link('am6', 'am13'), // normal → Surface.Normal
    link('am7', 'am14'), // params → Surface.Material
    link('am3', 'am10'), // time → SinCos
    link('am10', 'am11'),
    link('am4', 'am11'), // pulse + glow → emissive
    link('am11', 'am15'), // → Surface.Emissive
  ],
};

/* ------------------------------- MOVE ------------------------------- */
const moveAccent = '#f59e0b';
const move: Domain = {
  id: 'move',
  product: 'animation',
  name: 'Animation Graph',
  accent: moveAccent,
  tagline: 'Bring it to life — blend poses and motion from live game state.',
  engine: 'Separate CPU pose engine · per-frame · runtime',
  layer: 'creature',
  handoffs: ['Uses the creature rig ← Alien CreationGraph', 'Fires footstep events → Sound'],
  nodes: [
    mk('a1', 0, 140, 'input', 'Creature rig', moveAccent, 'skeleton', undefined, 'alien'),
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
/* Roblox audio API: AudioPlayer sources feed AudioEmitter (3D) / AudioDeviceOutput
   (2D); AudioListener picks up 3D streams; every connection is a Wire carrying a
   stream from a source "Output" pin to a target "Input" pin. */
const soundAccent = '#ec4899';
const sound: Domain = {
  id: 'sound',
  product: 'audio',
  name: 'Audio Graph',
  accent: soundAccent,
  tagline: 'Bring it to life — wire AudioPlayers through emitters, a listener, and effects to the output.',
  engine: 'Wire processing graph · AudioPlayer → Emitter/Listener → Output · per audio frame · runtime',
  layer: 'sound',
  handoffs: [
    'Attaches an AudioEmitter to each mushroom ← Decorator',
    'Plays footstep SFX on events ← Animation',
    'Mixes to the player’s AudioDeviceOutput',
  ],
  nodes: [
    // 2D non-directional bed: AudioPlayer → Wire → AudioDeviceOutput
    mk('u1', 0, 20, 'input', 'AudioPlayer — ambient', soundAccent, '2D · Looping · Volume 0.2'),
    // 3D positional hum on every scattered mushroom
    mk('u2', 0, 150, 'input', 'AudioPlayer — hum', soundAccent, 'Looping · per mushroom'),
    mk('u3', X, 150, 'op', 'AudioEmitter', soundAccent, '3D · on each placed mushroom', undefined, 'decorator'),
    // 3D footsteps triggered by animation events
    mk('u4', 0, 300, 'input', 'Footstep events', soundAccent, 'trigger ← Animation', undefined, 'move'),
    mk('u5', X, 300, 'input', 'AudioPlayer — footsteps', soundAccent, 'one-shot :Play() on event'),
    mk('u6', X * 2, 300, 'op', 'AudioEmitter', soundAccent, '3D · on the creature'),
    // Listener picks up 3D streams, runs through effects, out to the device
    mk('u7', X * 3, 210, 'op', 'AudioListener', soundAccent, 'on character · hears 3D'),
    mk('u8', X * 4, 120, 'op', 'AudioReverb', soundAccent, 'grove space'),
    mk('u9', X * 5, 120, 'output', 'AudioDeviceOutput', soundAccent, 'speakers / headphones'),
  ],
  edges: [
    link('u2', 'u3'), // hum player → emitter
    link('u4', 'u5'), // event → footstep player
    link('u5', 'u6'), // footstep player → emitter
    link('u3', 'u7'), // emitter → listener (spatial)
    link('u6', 'u7'), // emitter → listener (spatial)
    link('u7', 'u8'), // listener → reverb
    link('u8', 'u9'), // reverb → device output
    link('u1', 'u9'), // 2D ambient → device output directly
  ],
};

/* ------------------------------ ASSET GRAPH ------------------------- */
/* Gen-AI asset generation, offline & non-deterministic: prompt → image →
   3D mesh → texture, frozen at a determinism firewall into a cached mesh with a
   stable rbxassetid + content hash. This is what the CreationGraph's Fetch node
   reads. It also tracks every prompt sent to the Creation Assistant. */
const asset: Domain = {
  id: 'asset',
  product: 'asset',
  name: 'Asset Graph',
  accent: aiAccent,
  tagline:
    'Generate a mesh with gen-AI — prompt → image → 3D mesh → texture, then freeze it into a cached asset. Every prompt you send the assistant is tracked here.',
  engine:
    'Gen-AI · async cloud · offline · non-deterministic → determinism firewall (bake → stable rbxassetid + content hash)',
  handoffs: [
    'Tracks every prompt sent from the Assistant',
    'Freezes gen-AI output → cached mesh (stable id + hash)',
    'Provides the baked mesh → CreationGraph',
  ],
  nodes: [
    mk('a_hist', 0, 20, 'attr', 'Prompt history', aiAccent, 'every prompt sent to the assistant', undefined, undefined, true),
    mk('a1', 0, 280, 'input', 'Prompt', aiAccent, 'current · latest request'),
    mk('a2', X, 210, 'op', 'Text → Image', aiAccent, 'gen-AI · async cloud'),
    mk('a3', X * 2, 210, 'op', 'Image → 3D Mesh', aiAccent, 'gen-AI · async cloud'),
    mk('a4', X * 3, 210, 'op', 'Mesh → Texture', aiAccent, 'gen-AI · async cloud'),
    mk('a5', X * 4, 210, 'firewall', 'Bake · Freeze asset', firewallAccent, 'firewall · caches mesh → stable rbxassetid + hash'),
    mk('a6', X * 5, 210, 'output', 'Baked mesh asset', aiAccent, 'cached · stable id → CreationGraph'),
  ],
  edges: [
    link('a_hist', 'a2'),
    link('a1', 'a2'),
    link('a2', 'a3'),
    link('a3', 'a4'),
    link('a4', 'a5'),
    link('a5', 'a6'),
  ],
};

/* ------------------------------ ASSISTANT --------------------------- */
/* Not a node graph — the AI chat surface. Rail entry opens the chat; it drives
   the Asset Graph (and its prompt history) and hands off to the CreationGraph. */
const assistant: Domain = {
  id: 'assistant',
  product: 'assistant',
  name: 'Assistant',
  accent: aiAccent,
  tagline: 'Chat with AI to generate assets and author graphs.',
  engine: 'Gen-AI assistant · drives the Asset Graph',
  handoffs: [],
  nodes: [],
  edges: [],
};

export const DOMAINS: Domain[] = [creation, alien, decorator, surface, alienSurface, move, sound, asset, assistant];

export function domainById(id: string): Domain {
  return DOMAINS.find((d) => d.id === id) ?? DOMAINS[0];
}

export interface Product {
  product: string;
  name: string;
  accent: string;
  defaultId: string; // the graph shown when you pick this product from the rail
}

// One rail entry per product; the first-declared graph is its default view.
export const PRODUCTS: Product[] = DOMAINS.reduce<Product[]>((acc, d) => {
  if (!acc.some((p) => p.product === d.product))
    acc.push({ product: d.product, name: d.name, accent: d.accent, defaultId: d.id });
  return acc;
}, []);
