# Roblox Graph Editor — Prototype

A clickable **concept prototype** of a single, unified node-graph editor that spans every Roblox procedural-authoring domain — with a guided creator workflow built in (**"the bioluminescent alien mushroom grove"**).

It's a demo/pitch tool, not the real engine: the graphs are pre-wired and the previews are stylized.

## The idea it demonstrates

**One editor. Two products. The pillars underneath.**

- **Build the world**: **Model Graph** (generate → shape: author one reusable asset, edit-time/offline) · **Decorator Graph** (scatter/populate that asset across surfaces, streamed at runtime) · **Material Graph** (surface it, GPU)
- **Bring it to life**: **Animation Graph** · **Audio Graph**

Every domain shares the same node editor; each just adds its own node library, preview type, and engine underneath. The right-hand panel calls out how each graph **connects to the others** (e.g. the Model Graph exposes a `glow` value that the Material Graph reads, and hands its asset to the Decorator Graph). Model and Decorator graphs are kept **separate** because they run on different engines: the Model Graph is edit-time/offline asset authoring on the content engine, while the Decorator Graph is a runtime spatial-streaming engine (partitioned, incremental, per-frame budgets, GPU/CPU/in-world tiers).

## The built-in workflow

A 6-step guided tour (top bar → *Back / Next* or the step dots). Each step switches to the matching graph and updates the live 3D preview as the grove is built up:

1. **Generate** — a prompt makes a first mushroom mesh
2. **Shape** — refine geometry, carve gills, LODs
3. **Surface** — glowing, mossy look
4. **Scatter** — hundreds placed across the grove, path kept clear
5. **Move** — an alien creature roams
6. **Sound** — ambient bed, hums, footsteps → the grove comes alive

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build
```

## Stack

- **React + Vite + TypeScript**
- **@xyflow/react** (React Flow) — the node canvas
- **@react-three/fiber + drei + three** — the live 3D preview

## Where things live

```
src/
  data/
    domains.ts     # the six graphs: nodes, wires, engine notes, cross-graph handoffs
    workflow.ts    # the 6-step guided grove tour
  components/
    DomainRail.tsx    # left rail: buckets + domain switcher
    WorkflowBar.tsx   # top: step tour + prev/next
    GraphCanvas.tsx   # center: React Flow graph for the active domain
    PillarNode.tsx    # custom node
    PreviewPanel.tsx  # right: 3D preview + engine/handoff info
    Scene3D.tsx       # the stylized grove (reacts to the current step)
  App.tsx            # ties it together (single `step` drives everything)
```

To change what the demo says, edit `src/data/domains.ts` and `src/data/workflow.ts` — no component changes needed.
