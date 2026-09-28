import type { Audit, Model, Run } from "../domain/types";

export const outcomeLabel = {
  terminal: "Terminates",
  "dead-end": "No matching route",
  ambiguous: "Overlapping routes",
  cycle: "Cycle detected",
  unreachable: "Unvisited node",
};

export function Evidence({
  model,
  audit,
  run,
  step,
  setStep,
  selectRun,
}: {
  model: Model;
  audit?: Audit;
  run?: Run;
  step: number;
  setStep: (step: number) => void;
  selectRun: (run: Run) => void;
}) {
  const label = (id: string) =>
    model.nodes.find((node) => node.id === id)?.label ?? id;
  return (
    <section className="evidence" aria-labelledby="evidence-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">02 / Trace the evidence</p>
          <h2 id="evidence-title">A path you can replay.</h2>
        </div>
        {audit && (
          <label className="scenario-select">
            Inspect a scenario
            <select
              value={run ? audit.runs.indexOf(run) : ""}
              onChange={(event) =>
                selectRun(audit!.runs[Number(event.target.value)])
              }
            >
              <option value="" disabled>
                Choose one of {audit.total}
              </option>
              {audit.runs.map((scenario, index) => (
                <option key={index} value={index}>
                  #{index + 1} · {outcomeLabel[scenario.outcome]}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>
      {!run ? (
        <p className="empty-copy">
          {audit
            ? "Choose a finding with a counterexample, or select any scenario to replay its exact route."
            : "Run the audit to generate fresh evidence for this model."}
        </p>
      ) : (
        <div data-testid="witness" className="witness">
          <div className="witness-inputs">
            <span
              className={`status-dot ${run.outcome === "terminal" ? "good" : ""}`}
            />
            <strong>{outcomeLabel[run.outcome]}</strong>
            <span className="mono muted">Fixed inputs</span>
            {Object.entries(run.assignment).map(([key, value]) => (
              <span className="input-chip" key={key}>
                {key} <b>{String(value)}</b>
              </span>
            ))}
            {model.inputs.length === 0 && <span>No inputs</span>}
          </div>
          <ol className="trace">
            {run.path.map((node, index) => (
              <li key={`${index}-${node}`}>
                <button
                  aria-label={`Replay step ${index + 1}: ${label(node)}`}
                  aria-pressed={step === index}
                  className={index <= step ? "trace-active" : ""}
                  onClick={() => setStep(index)}
                >
                  <span className="mono">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {label(node)}
                </button>
                {index < run.path.length - 1 && (
                  <span className="trace-arrow" aria-hidden="true">
                    →
                  </span>
                )}
              </li>
            ))}
          </ol>
          <div className="replay-controls">
            <button disabled={step === 0} onClick={() => setStep(step - 1)}>
              ← Previous
            </button>
            <span className="mono" aria-live="polite">
              Step {step + 1} / {run.path.length}
            </span>
            <button
              disabled={step === run.path.length - 1}
              onClick={() => setStep(step + 1)}
            >
              Next →
            </button>
            <span className="muted">
              {step < run.path.length - 1
                ? `Next edge: ${run.edges[step]}`
                : `Stopped at ${run.node}`}
            </span>
          </div>
          {run.outcome === "ambiguous" && (
            <p className="explanation">
              Matching edges: <code>{run.matchingEdges.join(", ")}</code>.
              Execution stops here; no edge priority is assumed.
            </p>
          )}
          {run.outcome === "cycle" && (
            <p className="explanation">
              The final node repeats a prior node under the same fixed inputs.
              Execution cannot reach a terminal.
            </p>
          )}
        </div>
      )}
    </section>
  );
}
