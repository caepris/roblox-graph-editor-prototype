import { useCallback, useEffect, useState } from 'react';
import DomainRail from './components/DomainRail';
import TopBar from './components/TopBar';
import GraphCanvas from './components/GraphCanvas';
import ChatPanel from './components/ChatPanel';
import PreviewStage from './components/PreviewStage';
import InspectorPanel from './components/InspectorPanel';
import { ParamsProvider } from './ParamsContext';
import { PromptHistoryContext } from './PromptHistoryContext';
import { DOMAINS, domainById } from './data/domains';
import { WORKFLOW } from './data/workflow';
import type { LayerKey, Layers } from './types';

// Which layers are on at each guided-tour step (cumulative).
// Layers composed at each guided-tour step (1-indexed by position). Each step
// accumulates what the creator has built so far; the final step turns on
// everything for the runtime play-test.
const TOUR_LAYERS: Layers[] = [
  { glow: false, skin: false, scatter: false, creature: false, sound: false }, // 1 · ask AI (empty)
  { glow: false, skin: false, scatter: false, creature: false, sound: false }, // 2 · edit mushroom model
  { glow: true, skin: false, scatter: false, creature: false, sound: false }, // 3 · mushroom material
  { glow: true, skin: false, scatter: true, creature: false, sound: false }, // 4 · decorator (scatter)
  { glow: true, skin: false, scatter: true, creature: true, sound: false }, // 5 · alien model
  { glow: true, skin: true, scatter: true, creature: true, sound: false }, // 6 · alien material
  { glow: true, skin: true, scatter: true, creature: true, sound: false }, // 7 · alien animation
  { glow: true, skin: true, scatter: true, creature: true, sound: true }, // 8 · audio
  { glow: true, skin: true, scatter: true, creature: true, sound: true }, // 9 · play everything
];

export default function App() {
  // Start on guided-tour step 1, with domain + layers matching that step so
  // there's no flash of a non-tour state before the tour opens.
  const [activeId, setActiveId] = useState(WORKFLOW[0].domainId);
  const [layers, setLayers] = useState<Layers>({ ...TOUR_LAYERS[0] });
  const [tourStep, setTourStep] = useState<number | null>(1);
  const [selectedInstance, setSelectedInstance] = useState('hero');
  const [mode, setMode] = useState<'edit' | 'play'>('edit');
  const [animPreview, setAnimPreview] = useState(false); // in-graph animation loop preview
  const [promptSent, setPromptSent] = useState(!WORKFLOW[0].chat); // step 1: has the AI generated yet
  // Every prompt sent to the assistant, tracked + shown in the Asset Graph.
  const [promptHistory, setPromptHistory] = useState<string[]>(['bioluminescent mushroom, glowing teal cap']);
  const addPrompt = useCallback((text: string) => setPromptHistory((h) => [...h, text]), []);

  const domain = domainById(activeId);
  const isAssistant = domain.product === 'assistant';
  const activeStep = tourStep !== null ? WORKFLOW[tourStep - 1] : null;
  const isChat = activeStep?.chat ?? false;
  const visibleIds = activeStep && !activeStep.chat ? activeStep.nodeIds : undefined;
  const highlightIds = activeStep && !activeStep.chat ? activeStep.highlightIds : undefined;

  const isPlay = mode === 'play';
  // Play turns the whole scene on and running; Edit uses the composed layers.
  const effectiveLayers: Layers = isPlay
    ? { glow: true, skin: true, scatter: true, creature: true, sound: true }
    : layers;
  // Animation Graph in Edit keeps the whole grove but focuses on the creature.
  const focus: 'none' | 'creature' = !isPlay && domain.id === 'move' ? 'creature' : 'none';
  const rigLoop = focus === 'creature' && animPreview;
  const showAnimPreviewBtn = focus === 'creature' && !isChat;
  // Step 1 starts with an empty world until the assistant "generates" the graph.
  const emptyStage = isChat && !promptSent;

  // Opening the Animation Graph in Edit selects & focuses the creature.
  useEffect(() => {
    if (!isPlay && domain.id === 'move') setSelectedInstance('creature');
  }, [domain.id, isPlay]);

  const selectDomain = useCallback((id: string) => {
    setTourStep(null); // leaving the tour when you free-navigate
    setActiveId(id);
    const d = domainById(id);
    // Editing a domain turns on the layer it authors, so your edits are visible.
    if (d.layer) setLayers((l) => ({ ...l, [d.layer as LayerKey]: true }));
  }, []);

  const toggleLayer = useCallback((key: LayerKey) => {
    setLayers((l) => ({ ...l, [key]: !l[key] }));
  }, []);

  const goToTourStep = useCallback((step: number) => {
    const clamped = Math.min(WORKFLOW.length, Math.max(1, step));
    setTourStep(clamped);
    setActiveId(WORKFLOW[clamped - 1].domainId);
    setLayers({ ...TOUR_LAYERS[clamped - 1] });
    // Re-entering the chat step resets to an empty, ungenerated world.
    if (WORKFLOW[clamped - 1].chat) setPromptSent(false);
    // The final step runs the finished scene at runtime; earlier steps author in edit.
    setMode(clamped === WORKFLOW.length ? 'play' : 'edit');
  }, []);

  const startTour = useCallback(() => goToTourStep(1), [goToTourStep]);
  const exitTour = useCallback(() => {
    setTourStep(null);
    setMode('edit'); // leaving the tour always returns to the editable scene
  }, []);
  const toggleMode = useCallback(() => setMode((m) => (m === 'play' ? 'edit' : 'play')), []);

  return (
    <ParamsProvider>
      <PromptHistoryContext.Provider value={promptHistory}>
      <div className="app">
        <DomainRail activeId={domain.id} onSelect={selectDomain} />
        <div className="main">
          <TopBar
            domain={domain}
            domains={DOMAINS}
            mode={mode}
            onToggleMode={toggleMode}
            tourStep={tourStep}
            onStartTour={startTour}
            onExitTour={exitTour}
            onTourStep={goToTourStep}
          />
          <PreviewStage
            layers={effectiveLayers}
            selected={selectedInstance}
            animate={isPlay}
            focus={focus}
            rigLoop={rigLoop}
            empty={emptyStage}
          />
          <div className="graph-area">
            {isChat && tourStep !== null ? (
              <ChatPanel
                accent={domain.accent}
                onOpenGraph={() => goToTourStep(tourStep + 1)}
                onGenerated={() => setPromptSent(true)}
                onPrompt={addPrompt}
              />
            ) : isAssistant ? (
              <ChatPanel
                accent={domain.accent}
                standalone
                onOpenGraph={() => selectDomain('creation')}
                onOpenAssetGraph={() => selectDomain('asset')}
                onGenerated={() => {}}
                onPrompt={addPrompt}
              />
            ) : (
              <GraphCanvas
                domain={domain}
                visibleIds={visibleIds}
                highlightIds={highlightIds}
                onNavigate={selectDomain}
              />
            )}
            {showAnimPreviewBtn && (
              <button
                className={`anim-preview-btn ${animPreview ? 'on' : ''}`}
                style={{ borderColor: domain.accent, color: animPreview ? '#0b0e15' : domain.accent, background: animPreview ? domain.accent : undefined }}
                onClick={() => setAnimPreview((p) => !p)}
              >
                {animPreview ? '❚❚ Stop preview' : '▶ Preview animation'}
              </button>
            )}
          </div>
        </div>
        <InspectorPanel
          layers={effectiveLayers}
          selectedId={selectedInstance}
          onSelect={setSelectedInstance}
          onOpenGraph={selectDomain}
          onToggleLayer={toggleLayer}
        />
      </div>
      </PromptHistoryContext.Provider>
    </ParamsProvider>
  );
}
