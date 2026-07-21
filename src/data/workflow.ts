import type { WorkflowStep } from '../types';

export const WORKFLOW: WorkflowStep[] = [
  {
    id: 1,
    domainId: 'creation',
    title: 'Ask the AI to generate it',
    action:
      'The creator opens the assistant and asks it to “generate bioluminescent mushroom.” The AI authors a Model Graph for it.',
    stage: 1,
    runsAt: 'Offline',
    chat: true,
  },
  {
    id: 2,
    domainId: 'creation',
    title: 'Edit the generated graph',
    action:
      'The Model Graph the AI generated appears — generate → shape. The creator edits attributes like cap radius and stem height directly on the nodes.',
    stage: 2,
    runsAt: 'Edit-time',
  },
  {
    id: 3,
    domainId: 'surface',
    title: 'Surface it',
    action: 'They give the cap a glowing, mossy look — the glow driven by the exposed “glow” value.',
    stage: 3,
    runsAt: 'Runtime',
  },
  {
    id: 4,
    domainId: 'decorator',
    title: 'Scatter it',
    action:
      'A Decorator Graph scatters hundreds of the mushroom asset across the grove, avoiding the path and varying each copy — streamed at runtime.',
    stage: 4,
    runsAt: 'Runtime',
  },
  {
    id: 5,
    domainId: 'move',
    title: 'Move it',
    action: 'They add an alien creature and make it blend between idle, walk, and run as it roams.',
    stage: 5,
    runsAt: 'Runtime',
  },
  {
    id: 6,
    domainId: 'sound',
    title: 'Sound it — press play',
    action:
      'They layer in an ambient bed, a hum on each mushroom, and footsteps — and the grove comes alive.',
    stage: 6,
    runsAt: 'Runtime',
  },
];
