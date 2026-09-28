import type { Model } from "../domain/types";
import { LIMITS, parseModel } from "../domain/validation";

export function Editor({
  raw,
  setRaw,
  error,
  setError,
  apply,
}: {
  raw: string;
  setRaw: (raw: string) => void;
  error?: string;
  setError: (error: string | undefined) => void;
  apply: (model: Model) => void;
}) {
  async function importFile(file?: File) {
    if (!file) return;
    if (file.size > LIMITS.text * 4) {
      setError("File is too large. Use a JSON file under 400 KB.");
      return;
    }
    try {
      setRaw(await file.text());
      setError(undefined);
    } catch {
      setError("Could not read this file. Paste the JSON below instead.");
    }
  }
  function validate() {
    try {
      apply(parseModel(raw));
      setError(undefined);
    } catch (issue) {
      setError(
        issue instanceof Error ? issue.message : "Model could not be read.",
      );
    }
  }
  return (
    <section className="editor-layout">
      <div>
        <div className="section-heading">
          <div>
            <p className="eyebrow">01 / Define the system</p>
            <h2>Your rules, in plain JSON.</h2>
          </div>
          <label className="file-button">
            Import JSON
            <input
              type="file"
              accept="application/json,.json"
              onChange={(event) => {
                void importFile(event.target.files?.[0]);
                event.target.value = "";
              }}
            />
          </label>
        </div>
        <label className="editor-label" htmlFor="model-json">
          Model JSON
        </label>
        <textarea
          id="model-json"
          value={raw}
          onChange={(event) => setRaw(event.target.value)}
          spellCheck={false}
          maxLength={LIMITS.text + 1}
          aria-describedby="editor-help"
        />
        {error && (
          <p role="alert" className="error-box">
            {error}
          </p>
        )}
        <div className="editor-actions">
          <button className="primary" onClick={validate}>
            Validate and apply
          </button>
          <span id="editor-help" className="muted">
            Edits take effect only after validation. Then run the audit.
          </span>
        </div>
      </div>
      <aside className="schema">
        <p className="eyebrow">Model vocabulary</p>
        <h3>Small enough to check completely.</h3>
        <p>
          Describe a finite workflow with up to 8 boolean inputs, 32 nodes, and
          96 directed edges.
        </p>
        <dl>
          <dt>inputs</dt>
          <dd>Named true/false values, fixed for the entire run.</dd>
          <dt>nodes</dt>
          <dd>
            Every node has an ID, label, and terminal flag. A terminal ends the
            run.
          </dd>
          <dt>edges</dt>
          <dd>
            A source, destination, and declarative condition. Exactly one
            matching edge must leave each nonterminal.
          </dd>
          <dt>when</dt>
          <dd>
            <code>{'{ "input": "member", "equals": true }'}</code>
            <br />
            Combine with <code>all</code> / <code>any</code>, or use{" "}
            <code>{'{ "always": true }'}</code>.
          </dd>
        </dl>
        <p className="scope-note">
          No scripts or expressions execute. Conditions support at most 5
          nesting levels, 16 terms per group, and 1,024 terms total.
        </p>
      </aside>
    </section>
  );
}
