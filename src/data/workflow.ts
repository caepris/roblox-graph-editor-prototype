import type { WorkflowStep } from '../types';

export const WORKFLOW: WorkflowStep[] = [
  {
    id: 1,
    domainId: 'creation',
    title: 'Ask the AI to generate a mushroom',
    action:
      'The creator opens the assistant and asks it to “generate bioluminescent mushroom.” The AI authors a Model Graph for it.',
    stage: 1,
    runsAt: 'Offline',
    chat: true,
  },
  {
    id: 2,
    domainId: 'creation',
    title: 'Edit the mushroom’s Model Graph',
    action:
      'The generated Model Graph appears — generate → shape. The creator tweaks attributes like cap radius and stem height right on the nodes.',
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
    title: 'Create the alien’s Model Graph',
    action:
      'The creator authors a second asset — an alien creature — with its own Model Graph, producing a rigged, reusable model.',
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
