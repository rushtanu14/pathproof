import { useState } from "react";
import { check } from "./domain/checker";
import { broken, canRepair, examples, repair } from "./domain/examples";
import { reportMarkdown } from "./domain/report";
import { loadModel, saveModel } from "./domain/storage";
import type { Audit, Finding, Model, Run } from "./domain/types";
import { Editor } from "./components/Editor";
import { Evidence, outcomeLabel } from "./components/Evidence";
import { Topology, conditionLabel } from "./components/Topology";

function initialState() {
  try {
    return loadModel(window.localStorage);
  } catch {
    return {
      warning:
        "Browser storage is unavailable. Export your model before leaving.",
    };
  }
}
function download(name: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function App() {
  const [initial] = useState(initialState);
  const [model, setModel] = useState<Model>(initial.model ?? broken);
  const [audit, setAudit] = useState<Audit | undefined>(() =>
    check(initial.model ?? broken),
  );
  const [selected, setSelected] = useState<string | undefined>(
    audit?.findings[0]?.id,
  );
  const [run, setRun] = useState<Run | undefined>(audit?.findings[0]?.witness);
  const [step, setStep] = useState(run ? run.path.length - 1 : 0);
  const [view, setView] = useState<"inspect" | "edit">("inspect");
  const [raw, setRaw] = useState(JSON.stringify(model, null, 2));
  const [error, setError] = useState<string>();
  const [warning, setWarning] = useState(initial.warning);
  const [message, setMessage] = useState("");

  function selectRun(next: Run) {
    setRun(next);
    setStep(next.path.length - 1);
    setSelected(undefined);
  }
  function selectFinding(finding: Finding) {
    setSelected(finding.id);
    setRun(finding.witness);
    setStep(finding.witness ? finding.witness.path.length - 1 : 0);
  }
  function apply(next: Model) {
    setModel(next);
    setRaw(JSON.stringify(next, null, 2));
    setError(undefined);
    setAudit(undefined);
    setRun(undefined);
    setSelected(undefined);
    setStep(0);
    setMessage("Model changed. Run the audit to check every scenario again.");
    try {
      setWarning(saveModel(window.localStorage, next));
    } catch {
      setWarning(
        "Could not save in this browser. Export your model before leaving.",
      );
    }
  }
  function auditModel() {
    const next = check(model);
    setAudit(next);
    setSelected(next.findings[0]?.id);
    const firstRun = next.findings[0]?.witness ?? next.runs[0];
    setRun(firstRun);
    setStep(firstRun.path.length - 1);
    setMessage(
      `Audit complete. Checked all ${next.total} modeled input combinations.`,
    );
    setView("inspect");
  }
  const finding = audit?.findings.find((item) => item.id === selected);
  const label = (id: string) =>
    model.nodes.find((node) => node.id === id)?.label ?? id;
  return (
    <>
      <a className="skip-link" href="#workspace">
        Skip to workspace
      </a>
      <header className="topbar">
        <a className="brand" href="#workspace" aria-label="PathProof workspace">
          <img src="./favicon.svg" width="32" height="32" alt="" />
          PathProof<span className="edition">WORKFLOW LAB</span>
        </a>
        <span className="local-badge">
          <span />
          Runs in your browser
        </span>
      </header>
      <main id="workspace">
        <section className="intro">
          <div className="intro-copy">
            <p className="eyebrow">Check every modeled path.</p>
            <h1>
              Find the route
              <br />
              <span>you forgot.</span>
            </h1>
            <p className="intro-deck">
              Before a form sends someone in circles,
              <br className="desktop-break" /> put its decisions to the test.
              <br />
              <span className="muted">
                Every input combination. A trace for every failure.
              </span>
            </p>
            <div className="hero-proof" aria-label="PathProof capabilities">
              <span>
                <strong>256</strong>
                paths max
              </span>
              <span>
                <strong>0</strong>
                uploads
              </span>
              <span>
                <strong>1</strong>
                replayable truth
              </span>
            </div>
          </div>
          <img
            className="intro-art"
            src="./art/pathproof-terrain.jpg"
            alt=""
            width="1920"
            height="1080"
            fetchPriority="high"
          />
        </section>
        <div className="workspace-bar">
          <div className="view-switch" aria-label="Workspace view">
            <button
              aria-pressed={view === "inspect"}
              onClick={() => setView("inspect")}
            >
              Inspect
            </button>
            <button
              aria-pressed={view === "edit"}
              onClick={() => setView("edit")}
            >
              Edit model
            </button>
          </div>
          <div className="toolbar-actions">
            <button
              onClick={() =>
                download(
                  "pathproof-model.json",
                  JSON.stringify(model, null, 2),
                  "application/json",
                )
              }
            >
              Export model ↓
            </button>
            <button
              disabled={!audit}
              onClick={() =>
                download(
                  "pathproof-audit.md",
                  reportMarkdown(model),
                  "text/markdown",
                )
              }
            >
              Export audit ↓
            </button>
          </div>
        </div>
        {warning && (
          <div className="error-box" role="alert">
            {warning}
            {initial.raw && (
              <button
                onClick={() =>
                  download(
                    "pathproof-recovered.txt",
                    initial.raw!,
                    "text/plain",
                  )
                }
              >
                Download saved text
              </button>
            )}
          </div>
        )}
        <div className="model-header">
          <div>
            <span className="eyebrow">
              Current model · {model.nodes.length} nodes / {model.edges.length}{" "}
              routes
            </span>
            <h2>{model.name}</h2>
          </div>
          <label className="sample-select">
            Load an example
            <select
              value=""
              onChange={(event) => {
                apply(examples[event.target.value as keyof typeof examples]);
                setView("inspect");
              }}
            >
              <option value="" disabled>
                Select example…
              </option>
              <option value="broken">Missing route</option>
              <option value="clean">Complete borrowing flow</option>
              <option value="cycle">Referral cycle</option>
            </select>
          </label>
        </div>
        <div className="audit-bar">
          <div>
            <span
              className={`status-dot ${audit && audit.completed === audit.total && !audit.findings.length ? "good" : ""}`}
            />
            <strong>
              {audit
                ? `${audit.completed} of ${audit.total} scenarios terminate`
                : "Changes ready to check"}
            </strong>
            <span className="muted">
              {audit
                ? `${audit.findings.length} finding groups · ${model.inputs.length} fixed inputs`
                : "Previous results cleared"}
            </span>
          </div>
          <button className="primary" onClick={auditModel}>
            Run all scenarios <span aria-hidden="true">↗</span>
          </button>
        </div>
        <p className="live-status" role="status">
          {message ||
            "The sample audit is ready. Select a finding to see exactly how it happens."}
        </p>
        {view === "edit" ? (
          <Editor
            raw={raw}
            setRaw={setRaw}
            error={error}
            setError={setError}
            apply={apply}
          />
        ) : (
          <>
            <div className="inspection-grid">
              <section className="diagram" aria-labelledby="diagram-title">
                <div className="section-heading">
                  <div>
                    <p className="eyebrow">01 / Follow the system</p>
                    <h2 id="diagram-title">The whole decision flow.</h2>
                  </div>
                  <span className="legend">
                    <i />
                    Selected path
                  </span>
                </div>
                <Topology
                  model={model}
                  run={run}
                  step={step}
                  focusedNode={
                    finding?.kind === "unreachable" ? finding.node : undefined
                  }
                />
                <div className="diagram-foot">
                  <span>→ Directed route</span>
                  <span>● Terminal node</span>
                  <span>Conditions listed below</span>
                </div>
              </section>
              <aside className="findings" aria-labelledby="findings-title">
                <div className="section-heading">
                  <h2 id="findings-title">Findings</h2>
                  <span className="count">{audit?.findings.length ?? "—"}</span>
                </div>
                {!audit ? (
                  <p className="empty-copy">
                    Your model has changed. Run all scenarios to see the new
                    results.
                  </p>
                ) : audit.findings.length === 0 ? (
                  <div className="clear-state">
                    <span className="clear-mark">✓</span>
                    <h3>Every modeled route terminates.</h3>
                    <p>
                      All {audit.total} combinations reached a terminal, and
                      every node was visited.
                    </p>
                    <p className="muted">
                      This conclusion applies only to the model below.
                    </p>
                  </div>
                ) : (
                  <div className="finding-list">
                    {audit.findings.map((item, index) => (
                      <button
                        key={item.id}
                        className={`finding ${selected === item.id ? "selected" : ""}`}
                        onClick={() => selectFinding(item)}
                        aria-pressed={selected === item.id}
                      >
                        <span className="finding-number">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span>
                          <strong>{outcomeLabel[item.kind]}</strong>
                          <span>{label(item.node)}</span>
                          <small>
                            {item.witness
                              ? `${item.count} affected scenario${item.count === 1 ? "" : "s"} · inspect trace →`
                              : "Not reached in any checked run"}
                          </small>
                        </span>
                      </button>
                    ))}
                  </div>
                )}
                {canRepair(model) && (
                  <div className="repair">
                    <p className="eyebrow">Try a real change</p>
                    <h3>Give untrained members a next step.</h3>
                    <p>
                      Add <code>training = false</code> from “Training
                      complete?” to “Book training”.
                    </p>
                    <button onClick={() => apply(repair(model))}>
                      Apply example repair
                    </button>
                  </div>
                )}
                {finding?.kind === "unreachable" && (
                  <p className="explanation">
                    No unambiguous checked execution visits this node. A missing
                    or overlapping earlier route may prevent it from being
                    reached.
                  </p>
                )}
              </aside>
            </div>
            <Evidence
              model={model}
              audit={audit}
              run={run}
              step={step}
              setStep={setStep}
              selectRun={selectRun}
            />
            <details className="route-details">
              <summary>
                Inspect route conditions{" "}
                <span>{model.edges.length} directed edges</span>
              </summary>
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Edge</th>
                      <th>From → To</th>
                      <th>Matches when</th>
                    </tr>
                  </thead>
                  <tbody>
                    {model.edges.map((edge) => (
                      <tr key={edge.id}>
                        <td>
                          <code>{edge.id}</code>
                        </td>
                        <td>
                          {label(edge.from)} → {label(edge.to)}
                        </td>
                        <td>
                          <code>{conditionLabel(edge.when)}</code>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {model.edges.length === 0 && <p>This model has no edges.</p>}
              </div>
            </details>
          </>
        )}
        <footer className="scope">
          <strong>
            Exhaustive inside the model. Honest about the boundary.
          </strong>
          <p>
            Checks all combinations of up to 8 fixed boolean inputs. Ambiguous
            branches stop; unvisited means never reached on an unambiguous run.
            This does not test a live form, external services, timing, changing
            inputs, or unmodeled behavior.
          </p>
          <div>
            <span>Client-only · No account · No runtime AI</span>
            <span>PathProof / v1.0</span>
          </div>
        </footer>
      </main>
    </>
  );
}
