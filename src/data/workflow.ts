import type { WorkflowStep } from '../types';

export const WORKFLOW: WorkflowStep[] = [
  {
    id: 1,
    domainId: 'creation',
    title: 'Ask the AI to generate a mushroom',
    action:
      'The creator asks the assistant to “generate bioluminescent mushroom.” The Asset Graph runs gen-AI on the cloud (prompt → image → 3D mesh → texture) — non-deterministic and async.',
    stage: 1,
    runsAt: 'Offline',
    chat: true,
  },
  {
    id: 2,
    domainId: 'creation',
    title: 'Edit the mushroom’s CreationGraph',
    action:
      'The Asset Graph froze the gen-AI output into a cached mesh (stable asset id + hash); the CreationGraph fetches it and shapes it with the deterministic ModelGraphNodes builtins — Fetch, Transform, CSGUnion/Subtract, Repeat, Mirror, SmoothNormals. The creator tweaks attribute pins like cap radius and stem height right on the nodes and it re-evaluates.',
    stage: 2,
    runsAt: 'Edit-time',
  },
  {
    id: 3,
    domainId: 'surface',
    title: 'Add a material to the mushroom',
    action:
      'The creator adds a material and the mushroom’s Material Graph opens — a ShaderVM surface program driving its glowing, mossy look.',
    stage: 3,
    runsAt: 'Runtime',
  },
  {
    id: 4,
    domainId: 'decorator',
    title: 'Scatter it across the grove',
    action:
      'A Decorator Graph scatters hundreds of the mushroom across the grove — avoiding the path and varying each copy, streamed at runtime.',
    stage: 4,
    runsAt: 'Runtime',
  },
  {
    id: 5,
    domainId: 'alien',
    title: 'Create the alien’s CreationGraph',
    action:
      'The creator authors a second asset — an alien creature — with its own CreationGraph: it fetches a baked mesh from the Asset Graph, then deterministic CSG builtins (with Mirror for bilateral symmetry) produce a rigged, reusable model.',
    stage: 5,
    runsAt: 'Offline',
  },
  {
    id: 6,
    domainId: 'surface-alien',
    title: 'Add a material to the alien',
    action:
      'The creator gives the alien a skin material; its own Material Graph opens, driving the bioluminescent skin.',
    stage: 6,
    runsAt: 'Runtime',
  },
  {
    id: 7,
    domainId: 'move',
    title: 'Animate the alien',
    action:
      'An Animation Graph blends idle, walk, and run from live game state so the alien roams — evaluated every frame.',
    stage: 7,
    runsAt: 'Runtime',
  },
  {
    id: 8,
    domainId: 'sound',
    title: 'Add audio instances',
    action:
      'They wire up an ambient bed, a hum on each mushroom, and footstep sounds through the Audio Graph.',
    stage: 8,
    runsAt: 'Runtime',
  },
  {
    id: 9,
    domainId: 'sound',
    title: 'Press play and test it',
    action:
      'Everything runs together at runtime — press Play to bring the grove to life and move the creature.',
    stage: 9,
    runsAt: 'Runtime',
  },
];
