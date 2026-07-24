import { useEffect } from 'react';
import { useParams } from '../ParamsContext';
import type { Layers, LayerKey, ParamKey } from '../types';

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
  // The scene layer this instance's visibility maps to (renders an eye toggle).
  layerKey?: LayerKey;
  // Whether this row's content is currently absent from the scene (dimmed row).
  hidden?: boolean;
}

const CREATION = '#6366f1';
const DECO = '#22c55e';
const MAT = '#14b8a6';
const ANIM = '#f59e0b';
const AUD = '#ec4899';
const WORLD = '#5b6472';

// Every toggleable instance is ALWAYS listed so its eye can turn its layer
// back on; `hidden` drives the dimmed state and eye-off icon.
function buildInstances(layers: Layers): SceneInstance[] {
  const glowOff = !layers.glow;
  const creatureHidden = !layers.creature;

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
      { key: 'Created by', value: 'CreationGraph' },
      { key: 'Exposes', value: '“glow” → Material' },
    ],
    // The MaterialVariant is a sub-instance of its mesh; its eye toggles glow.
    children: [
      {
        id: 'material',
        name: 'Glow material',
        type: 'MaterialVariant',
        accent: MAT,
        graphId: 'surface',
        layerKey: 'glow',
        hidden: glowOff,
        props: [
          { key: 'Class', value: 'MaterialVariant' },
          { key: 'Emissive', value: '#41F5D0' },
          { key: 'Glow intensity', editable: { param: 'glowIntensity', min: 0, max: 2, step: 0.01 } },
          { key: 'Pulse', value: '2 Hz' },
          { key: 'Moss by height', value: 'On' },
          { key: 'Reads', value: '“glow” ← CreationGraph' },
          { key: 'Created by', value: 'Material Graph' },
        ],
      },
    ],
  };

  const creature: SceneInstance = {
    id: 'creature',
    name: 'Alien creature',
    type: 'Model',
    accent: CREATION,
    graphId: 'alien',
    layerKey: 'creature',
    hidden: creatureHidden,
    props: [
      { key: 'Class', value: 'Model' },
      { key: 'Rig', value: '← CreationGraph (Alien)' },
      { key: 'Material', value: 'Skin material' },
      { key: 'Animation', value: 'idle / walk / run' },
      { key: 'LODs', value: '3 (auto)' },
      { key: 'Created by', value: 'CreationGraph (Alien)' },
    ],
    children: [
      {
        id: 'alien-material',
        name: 'Skin material',
        type: 'MaterialVariant',
        accent: MAT,
        graphId: 'surface-alien',
        layerKey: 'skin',
        hidden: !layers.skin || creatureHidden,
        props: [
          { key: 'Class', value: 'MaterialVariant' },
          { key: 'Albedo', value: '#7C4DFF (skin)' },
          { key: 'Emissive', value: '#B388FF (veins)' },
          { key: 'Pulse', value: '1.5 Hz' },
          { key: 'Belly gradient', value: 'On' },
          { key: 'Reads', value: '“glow” ← CreationGraph (Alien)' },
          { key: 'Created by', value: 'Material Graph (Alien)' },
        ],
      },
      {
        id: 'alien-anim',
        name: 'Animation',
        type: 'Animator',
        accent: ANIM,
        graphId: 'move',
        hidden: creatureHidden,
        props: [
          { key: 'Class', value: 'Animator' },
          { key: 'Graph', value: 'AnimationGraphDefinition' },
          { key: 'Clips', value: 'idle / walk / run' },
          { key: 'Blend', value: 'by speed' },
          { key: 'Head-look', value: 'player' },
          { key: 'Fires', value: 'footsteps → Audio' },
          { key: 'Driven by', value: 'Animation Graph' },
        ],
      },
    ],
  };

  return [
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
    {
      id: 'field',
      name: 'Mushroom field',
      type: 'Instances ×64',
      accent: DECO,
      graphId: 'decorator',
      layerKey: 'scatter',
      hidden: !layers.scatter,
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
    },
    creature,
    {
      id: 'sound',
      name: 'Audio',
      type: 'Wire graph',
      accent: AUD,
      graphId: 'sound',
      layerKey: 'sound',
      hidden: !layers.sound,
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
    },
  ];
}

function flatten(list: SceneInstance[]): SceneInstance[] {
  return list.flatMap((i) => [i, ...(i.children ?? [])]);
}

function EyeIcon({ off }: { off: boolean }) {
  const common = {
    width: 15,
    height: 15,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
  return off ? (
    <svg {...common}>
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  ) : (
    <svg {...common}>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export default function InspectorPanel({
  layers,
  selectedId,
  onSelect,
  onOpenGraph,
  onToggleLayer,
}: {
  layers: Layers;
  selectedId: string;
  onSelect: (id: string) => void;
  onOpenGraph: (graphId: string) => void;
  onToggleLayer: (key: LayerKey) => void;
}) {
  const { params, setParam } = useParams();

  const instances = buildInstances(layers);
  const flat = flatten(instances);
  const visibleCount = flat.filter((i) => !i.hidden).length;

  // Keep a sane selection if the current one somehow leaves the list.
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
    <div
      key={i.id}
      className={`insp-item ${child ? 'child' : ''} ${selectedId === i.id ? 'active' : ''} ${
        i.hidden ? 'hidden' : ''
      }`}
      style={selectedId === i.id ? { borderColor: i.accent } : undefined}
      onClick={() => handleClick(i)}
      role="button"
      tabIndex={0}
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
      {i.layerKey && (
        <button
          className="insp-eye"
          onClick={(e) => {
            e.stopPropagation();
            onToggleLayer(i.layerKey!);
          }}
          title={i.hidden ? `Show ${i.name}` : `Hide ${i.name}`}
          aria-label={i.hidden ? `Show ${i.name}` : `Hide ${i.name}`}
        >
          <EyeIcon off={!!i.hidden} />
        </button>
      )}
    </div>
  );

  return (
    <aside className="inspector">
      <div className="insp-head">
        Explorer
        <span className="insp-count">{visibleCount} in scene</span>
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
