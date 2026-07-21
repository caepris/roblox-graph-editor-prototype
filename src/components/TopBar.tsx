import { LAYER_META, RUNS_AT_META, type Domain, type LayerKey, type Layers } from '../types';
import { WORKFLOW } from '../data/workflow';
import { domainById } from '../data/domains';

const LAYER_ORDER: LayerKey[] = ['glow', 'scatter', 'creature', 'sound'];

export default function TopBar({
  domain,
  layers,
  onToggleLayer,
  mode,
  onToggleMode,
  tourStep,
  onStartTour,
  onExitTour,
  onTourStep,
}: {
  domain: Domain;
  domains: Domain[];
  layers: Layers;
  onToggleLayer: (key: LayerKey) => void;
  mode: 'edit' | 'play';
  onToggleMode: () => void;
  tourStep: number | null;
  onStartTour: () => void;
  onExitTour: () => void;
  onTourStep: (step: number) => void;
}) {
  const isPlay = mode === 'play';
  return (
    <header className="topbar">
      <div className="tb-row">
        <div className="tb-brand">
          <div className="tb-project">Untitled grove</div>
          <div className="tb-breadcrumb">
            <span className="tb-crumb" style={{ color: domain.accent }}>
              {domain.name}
            </span>
          </div>
        </div>

        <div className="tb-controls">
          {isPlay ? (
            <div className="tb-playing">Play mode — the scene is running</div>
          ) : (
            <div className="tb-layers" role="group" aria-label="Scene layers">
              <span className="tb-layers-label">Layers</span>
              {LAYER_ORDER.map((key) => {
                const meta = LAYER_META[key];
                const on = layers[key];
                return (
                  <button
                    key={key}
                    className={`layer-chip ${on ? 'on' : ''}`}
                    style={on ? { borderColor: meta.accent, color: meta.accent } : undefined}
                    onClick={() => onToggleLayer(key)}
                    title={`Toggle ${meta.label} in the scene`}
                  >
                    <span
                      className="layer-chip-dot"
                      style={{ background: on ? meta.accent : 'transparent', borderColor: meta.accent }}
                    />
                    {meta.label}
                  </button>
                );
              })}
            </div>
          )}

          {!isPlay && tourStep !== null ? (
            <button className="tb-tour-btn on" onClick={onExitTour}>
              ✕ Exit tour
            </button>
          ) : !isPlay ? (
            <button className="tb-tour-btn" onClick={onStartTour}>
              ▷ Guided tour
            </button>
          ) : null}

          <button className={`tb-play-btn ${isPlay ? 'on' : ''}`} onClick={onToggleMode}>
            {isPlay ? '❚❚ Stop' : '▶ Play'}
          </button>
        </div>
      </div>

      {tourStep !== null && <TourSubbar step={tourStep} onTourStep={onTourStep} />}
    </header>
  );
}

function TourSubbar({ step, onTourStep }: { step: number; onTourStep: (step: number) => void }) {
  const tour = WORKFLOW[step - 1];
  const runsAt = RUNS_AT_META[tour.runsAt];
  return (
    <div className="tour-subbar">
      <div className="tour-info">
        <span className="tour-step" style={{ color: domainById(tour.domainId).accent }}>
          Step {tour.id}/{WORKFLOW.length}
        </span>
        <span className="tour-title">{tour.title}</span>
        <span
          className="tour-runsat"
          style={{ color: runsAt.accent, borderColor: runsAt.accent }}
          title={runsAt.blurb}
        >
          {tour.runsAt}
        </span>
        <span className="tour-action">{tour.action}</span>
      </div>
      <div className="tour-nav">
        <div className="tour-dots">
          {WORKFLOW.map((w) => (
            <button
              key={w.id}
              className={`tour-dot ${w.id === step ? 'active' : ''}`}
              style={w.id <= step ? { background: domainById(w.domainId).accent } : undefined}
              title={`${w.id}. ${w.title}`}
              onClick={() => onTourStep(w.id)}
            />
          ))}
        </div>
        <button className="tour-btn" disabled={step <= 1} onClick={() => onTourStep(step - 1)}>
          ‹ Back
        </button>
        <button
          className="tour-btn primary"
          disabled={step >= WORKFLOW.length}
          onClick={() => onTourStep(step + 1)}
        >
          Next ›
        </button>
      </div>
    </div>
  );
}
