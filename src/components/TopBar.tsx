import { RUNS_AT_META, type Domain } from '../types';
import { WORKFLOW } from '../data/workflow';
import { domainById } from '../data/domains';

export default function TopBar({
  domain,
  mode,
  onToggleMode,
  tourStep,
  onStartTour,
  onExitTour,
  onTourStep,
}: {
  domain: Domain;
  domains: Domain[];
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
            {domain.subject && <span className="tb-crumb-subject">{domain.subject}</span>}
            <span className="tb-crumb" style={{ color: domain.accent }}>
              {domain.name}
            </span>
          </div>
        </div>

        <div className="tb-controls">
          {isPlay && <div className="tb-playing">Play mode — the scene is running</div>}

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
