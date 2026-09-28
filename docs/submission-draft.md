# PathProof

**Tagline:** Find the missing routes in a workflow, replay the evidence, and verify the repair.

**Target:** Global Innovation Build Challenge V2, Track 03: Open. Local draft; public repository, live URL, video upload, registration, and submission are pending.

## Inspiration

Small forms and decision trees can look complete while leaving someone stranded. A library member who has not completed training should get a next step, not a dead end. PathProof makes these omissions concrete and explainable.

## What it does

PathProof checks every combination of up to eight fixed boolean inputs in a finite workflow. It detects missing routes, overlapping decisions, cycles, and nodes never visited by an unambiguous run. Each execution failure comes with an exact input assignment, node path, and edge path that can be replayed visually.

The included borrowing example starts with six of eight scenarios terminating. A visible repair adds the missing training route; rerunning checks all eight combinations and reaches every node. Users can import or edit their own declarative JSON, save a validated model locally, and export a Markdown audit containing the entire model and every scenario.

## How we built it

React presents a responsive workspace and SVG topology. A separate TypeScript engine validates the model, enumerates boolean assignments, and performs deterministic graph walks. Exactly one matching edge continues execution; zero or multiple matching edges stop with evidence. Repeating a node under fixed inputs identifies a cycle.

The app runs entirely in the browser. It needs no login, API key, or paid infrastructure. Vite produces a static build. Vitest checks domain behavior and React interactions; Playwright exercises the production build at desktop and mobile sizes.

## Challenges

The important design choice was defining what a result means. PathProof stops at ambiguous decisions instead of inventing an edge priority. “Unvisited” is relative to those semantics, and both UI and exported evidence state that boundary. Imported JSON is bounded and validated before it can replace the current model. Damaged browser saves remain recoverable.

## Accomplishments

A complete inspect → replay → repair → rerun → export loop works with reproducible evidence. The model engine remains separate from presentation so its behavior can be understood and tested directly. Validation, application checks, and desktop/mobile browser checks pass; details are in `docs/verification.md`.

## What we learned

Exhaustive checks become practical when a model is deliberately small. Counterexamples are more useful than a pass/fail badge, and a correctness claim is only meaningful when its assumptions are visible. Graph layout and semantic reachability are different problems.

## What's next

A visual edge editor and additional classroom examples would make authoring easier. These are future ideas, not shipped features. Testing mutable input values or live services would require a different state model.

## Built With

TypeScript, React, Vite, SVG, HTML, CSS, browser localStorage, Vitest, Testing Library, Playwright, Node.js, npm, FFmpeg, OpenAI Codex.

## AI assistance disclosure

OpenAI Codex assisted project planning, product/interface design, code, test creation, debugging, review, documentation, and demo preparation. Runtime checking is deterministic TypeScript; the application does not call an AI model. Rushil should review and be able to explain the submitted code and claims before submitting.

## Links to fill after publication

- Public source repository: pending.
- Live demo: pending.
- Public/unlisted 2–5 minute video on an accepted platform: pending upload.
- At least three screenshots: prepared under `docs/media/` when media capture is complete.
- Full real participant name and current guardian permission: supplied/confirmed by the participant during registration, not inferred by this draft.

This draft does not claim field deployment, user research, measured social impact, or certification of a real system.
