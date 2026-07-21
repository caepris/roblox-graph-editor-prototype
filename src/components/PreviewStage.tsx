import Scene3D from './Scene3D';
import { useParams } from '../ParamsContext';
import type { Layers } from '../types';

function groveCaption(layers: Layers, animate: boolean): string {
  if (!animate) {
    if (layers.sound) return 'Edit mode — static instances. Press Play to hear the grove come alive.';
    if (layers.creature) return 'Edit mode — the creature stands still until you press Play.';
    if (layers.scatter) return 'Hundreds scattered across the grove, the path kept clear.';
    if (layers.glow) return 'A glowing, mossy hero mushroom — the look is applied.';
    return 'A refined hero mushroom. Reshape it live from the graph.';
  }
  return 'Playing — use WASD to roam the grove as the creature. The world is alive.';
}

export default function PreviewStage({
  layers,
  selected,
  animate,
  focus,
  rigLoop,
  empty = false,
}: {
  layers: Layers;
  selected: string;
  animate: boolean;
  focus: 'none' | 'creature';
  rigLoop: boolean;
  empty?: boolean;
}) {
  const { params } = useParams();

  let caption: string;
  if (empty) {
    caption = 'Empty world — ask the assistant to generate something.';
  } else if (animate) {
    caption = groveCaption(layers, animate);
  } else if (focus === 'creature') {
    caption = rigLoop
      ? 'Previewing the animation on the creature in the grove.'
      : 'Editing the creature’s Animation Graph — it’s selected and focused in the scene.';
  } else {
    caption = groveCaption(layers, animate);
  }

  return (
    <div className="stage">
      <Scene3D
        layers={layers}
        params={params}
        selected={selected}
        animate={animate}
        focus={focus}
        rigLoop={rigLoop}
        empty={empty}
      />
      <div className="stage-caption">{caption}</div>
      <div className={`stage-mode ${animate ? 'live' : ''}`}>{animate ? '● Live' : 'Edit'}</div>
      {!empty && (
        <div className="stage-badge">{animate ? 'WASD to move · drag to look' : 'drag to orbit'}</div>
      )}
    </div>
  );
}
