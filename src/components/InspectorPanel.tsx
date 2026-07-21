import { useEffect } from 'react';
import { useParams } from '../ParamsContext';
import type { Layers, ParamKey } from '../types';

interface PropRow {
  key: string;
  value?: string;
  editable?: { param: ParamKey; min: number; max: number; step: number };
}

interface SceneInstance {
  id: string;
  name: string;
  type: string;
  accent: string;
  props: PropRow[];
  // The graph that authors this instance; clicking the item opens it.
  graphId?: string;
  // Nested sub-instances (e.g. a MaterialVariant under its mesh).
  children?: SceneInstance[];
}

const CREATION = '#6366f1';
const DECO = '#22c55e';
const MAT = '#14b8a6';
const ANIM = '#f59e0b';
const AUD = '#ec4899';
const WORLD = '#5b6472';

function buildInstances(layers: Layers): SceneInstance[] {
  const hero: SceneInstance = {
    id: 'hero',
    name: 'Mushroom',
    type: 'MeshPart · asset',
    accent: CREATION,
    graphId: 'creation',
    props: [
      { key: 'Class', value: 'MeshPart' },
      { key: 'Cap radius', editable: { param: 'capRadius', min: 0.5, max: 1.7, step: 0.01 } },
      { key: 'Stem height', editable: { param: 'stemHeight', min: 0.6, max: 1.8, step: 0.01 } },
      { key: 'LODs', value: '3 (auto)' },
      { key: 'Reusable', value: 'Yes' },
      { key: 'Created by', value: 'Model Graph' },
      { key: 'Exposes', value: '“glow” → Material' },
    ],
  };

  // The MaterialVariant is a sub-instance of its mesh, not a top-level entry.
  if (layers.glow)
    hero.children = [
      {
        id: 'material',
        name: 'Glow material',
        type: 'MaterialVariant',
        accent: MAT,
        graphId: 'surface',
        props: [
          { key: 'Class', value: 'MaterialVariant' },
          { key: 'Emissive', value: '#41F5D0' },
          { key: 'Glow intensity', editable: { param: 'glowIntensity', min: 0, max: 2, step: 0.01 } },
          { key: 'Pulse', value: '2 Hz' },
          { key: 'Moss by height', value: 'On' },
          { key: 'Reads', value: '“glow” ← Model Graph' },
          { key: 'Created by', value: 'Material Graph' },
        ],
      },
    ];

  const list: SceneInstance[] = [
    {
      id: 'terrain',
      name: 'Terrain surface',
      type: 'Terrain',
      accent: WORLD,
      props: [
        { key: 'Class', value: 'Terrain' },
        { key: 'Area', value: '18 × 18 studs' },
        { key: 'Provides', value: 'surface · slope · moisture' },
        { key: 'Created by', value: 'World' },
      ],
    },
    hero,
  ];

  if (layers.scatter)
    list.push({
      id: 'field',
      name: 'Mushroom field',
      type: 'Instances ×64',
      accent: DECO,
      graphId: 'decorator',
      props: [
        { key: 'Class', value: 'Model (folder)' },
        { key: 'Count', value: '64' },
        { key: 'Representation', value: 'GPU far · interactive near' },
        { key: 'Density', value: 'by moisture' },
        { key: 'Path clearance', value: '0.8 studs' },
        { key: 'Seed', value: '42' },
        { key: 'Glow variance', value: '±20% per copy' },
        { key: 'Created by', value: 'Decorator Graph' },
      ],
    });

  if (layers.creature) {
    // The alien is a model (purple) — clicking it opens its Model Graph.
    const creature: SceneInstance = {
      id: 'creature',
      name: 'Alien creature',
      type: 'Model',
      accent: CREATION,
      graphId: 'alien',
      props: [
        { key: 'Class', value: 'Model' },
        { key: 'Rig', value: '← Model Graph (Alien)' },
        { key: 'Material', value: 'Skin material' },
        { key: 'Animation', value: 'idle / walk / run' },
        { key: 'LODs', value: '3 (auto)' },
        { key: 'Created by', value: 'Model Graph (Alien)' },
      ],
    };

    const children: SceneInstance[] = [];
    // The alien's MaterialVariant is a sub-instance of its model, like the mushroom's.
    if (layers.glow)
      children.push({
        id: 'alien-material',
        name: 'Skin material',
        type: 'MaterialVariant',
        accent: MAT,
        graphId: 'surface-alien',
        props: [
          { key: 'Class', value: 'MaterialVariant' },
          { key: 'Albedo', value: '#7C4DFF (skin)' },
          { key: 'Emissive', value: '#B388FF (veins)' },
          { key: 'Pulse', value: '1.5 Hz' },
          { key: 'Belly gradient', value: 'On' },
          { key: 'Reads', value: '“glow” ← Model Graph (Alien)' },
          { key: 'Created by', value: 'Material Graph (Alien)' },
        ],
      });
    // The Animator sub-instance drives the alien from its Animation Graph.
    children.push({
      id: 'alien-anim',
      name: 'Animation',
      type: 'Animator',
      accent: ANIM,
      graphId: 'move',
      props: [
        { key: 'Class', value: 'Animator' },
        { key: 'Graph', value: 'AnimationGraphDefinition' },
        { key: 'Clips', value: 'idle / walk / run' },
        { key: 'Blend', value: 'by speed' },
        { key: 'Head-look', value: 'player' },
        { key: 'Fires', value: 'footsteps → Audio' },
        { key: 'Driven by', value: 'Animation Graph' },
      ],
    });
    creature.children = children;
    list.push(creature);
  }

  if (layers.sound)
    list.push({
      id: 'sound',
      name: 'Audio',
      type: 'Wire graph',
      accent: AUD,
      graphId: 'sound',
      props: [
        { key: 'Ambient', value: '2D AudioPlayer · Looping' },
        { key: 'Per mushroom', value: 'AudioEmitter (3D)' },
        { key: 'Footsteps', value: 'AudioPlayer · on events ← Animation' },
        { key: 'Listener', value: 'AudioListener · on character' },
        { key: 'Effects', value: 'AudioReverb' },
        { key: 'Output', value: 'AudioDeviceOutput' },
        { key: 'Routing', value: 'Wire: Output → Input' },
        { key: 'Created by', value: 'Audio Graph' },
      ],
    });

  return list;
}

function flatten(list: SceneInstance[]): SceneInstance[] {
  return list.flatMap((i) => [i, ...(i.children ?? [])]);
}

export default function InspectorPanel({
  layers,
  selectedId,
  onSelect,
  onOpenGraph,
}: {
  layers: Layers;
  selectedId: string;
  onSelect: (id: string) => void;
  onOpenGraph: (graphId: string) => void;
}) {
  const { params, setParam } = useParams();

  const instances = buildInstances(layers);
  const flat = flatten(instances);

  // If a selected instance disappears (its layer was removed), fall back to the
  // mushroom. An empty selection ('') is intentional (deselected) and kept as-is.
  useEffect(() => {
    const ids = flatten(buildInstances(layers)).map((i) => i.id);
    if (selectedId && !ids.includes(selectedId)) onSelect('hero');
  }, [layers, selectedId, onSelect]);

  const selected = flat.find((i) => i.id === selectedId) ?? null;

  // Selecting an instance highlights it in the scene and opens its graph.
  // Clicking the already-selected item deselects it (no navigation).
  const handleClick = (inst: SceneInstance) => {
    if (selectedId === inst.id) {
      onSelect('');
      return;
    }
    onSelect(inst.id);
    if (inst.graphId) onOpenGraph(inst.graphId);
  };

  const renderItem = (i: SceneInstance, child = false) => (
    <button
      key={i.id}
      className={`insp-item ${child ? 'child' : ''} ${selectedId === i.id ? 'active' : ''}`}
      style={selectedId === i.id ? { borderColor: i.accent } : undefined}
      onClick={() => handleClick(i)}
      title={
        selectedId === i.id
          ? 'Click to deselect'
          : i.graphId
            ? `Select ${i.name} · opens its graph`
            : `Select ${i.name}`
      }
    >
      <span className="insp-item-dot" style={{ background: i.accent }} />
      <span className="insp-item-text">
        <span className="insp-item-name">{i.name}</span>
        <span className="insp-item-type">{i.type}</span>
      </span>
    </button>
  );

  return (
    <aside className="inspector">
      <div className="insp-head">
        Explorer
        <span className="insp-count">{flat.length} in scene</span>
      </div>

      <div className="insp-explorer">
        {instances.map((i) => (
          <div key={i.id} className="insp-node">
            {renderItem(i)}
            {i.children?.map((c) => renderItem(c, true))}
          </div>
        ))}
      </div>

      <div className="insp-props">
        {selected ? (
          <>
            <div className="insp-props-head" style={{ color: selected.accent }}>
              {selected.name}
              <span className="insp-props-type">{selected.type}</span>
            </div>
            <div className="insp-props-list">
              {selected.props.map((p) => (
                <div className="insp-prop" key={p.key}>
                  <span className="insp-prop-key">{p.key}</span>
                  {p.editable ? (
                    <div className="insp-prop-edit">
                      <input
                        type="range"
                        min={p.editable.min}
                        max={p.editable.max}
                        step={p.editable.step}
                        value={params[p.editable.param]}
                        style={{ accentColor: selected.accent }}
                        onChange={(e) => setParam(p.editable!.param, parseFloat(e.target.value))}
                      />
                      <span className="insp-prop-num" style={{ color: selected.accent }}>
                        {params[p.editable.param].toFixed(2)}
                      </span>
                    </div>
                  ) : (
                    <span className="insp-prop-val">{p.value}</span>
                  )}
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="insp-empty">Select an instance to see its properties.</div>
        )}
      </div>
    </aside>
  );
}
