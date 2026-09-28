# PathProof

A local workflow lab that finds the route you forgot. Describe a small decision flow using fixed boolean inputs, check every combination, replay a concrete failing path, then change the model and check again.

Built for **Global Innovation Build Challenge V2 — Track 03: Open**. Registered as a solo project on September 19; public release links, hosted video, and final submission remain pending.

## Run it

Node.js 22 or newer is recommended. No account, API key, backend, or paid service is required.

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:4182. For a production build:

```sh
npm run build
npm run preview
```

Static deployment uses the `dist/` directory. Vite uses relative asset paths, so a repository subpath is supported.

## Try the whole flow

1. The equipment-borrowing example starts with **6 of 8 scenarios terminating**. Select **No matching route**: an existing member without training gets stuck at “Training complete?”.
2. Use **Previous** and **Next** to replay the exact path. Each input stays fixed throughout one run.
3. Select **Apply example repair**. This adds the missing `training = false` edge to “Book training”. Old audit results are cleared immediately.
4. Select **Run all scenarios**. All **8 of 8** terminate, and every node is visited.
5. Export the audit. Its Markdown includes the complete model and all eight runs, not only a summary. Reload the page to restore the last applied model.
6. In **Edit model**, change or import JSON. **Validate and apply** checks the model before replacing your workspace. The cycle example demonstrates a repeated node and its closing edge.

## How it works

The data flow is **JSON → validated model → all boolean assignments → deterministic walks → findings and traces → interface/export**.

- `src/domain/validation.ts` is the trust boundary. It rejects unknown fields, duplicate IDs, invalid references, malformed conditions, outgoing edges from terminals, and oversized inputs.
- `src/domain/checker.ts` enumerates `2^n` assignments. A walk follows exactly one matching edge; zero means a dead end, multiple means ambiguity, and a repeated node means a cycle. Fixed inputs make repeated-node detection sufficient for this finite model.
- `src/domain/storage.ts` saves only validated models in browser local storage. A damaged saved value stays untouched until you apply another model and can be downloaded for recovery. Unsaved JSON editor drafts are not persisted.
- `src/domain/report.ts` exports the complete reproducible evidence and explicit scope limits.
- `src/components/Topology.tsx` lays out the directed graph by breadth-first layers. This layout describes structure; only the checker determines semantic reachability.
- `src/components/Evidence.tsx` replays the chosen run; `Editor.tsx` handles JSON editing/import; `App.tsx` coordinates state.

The engine is independent of React, making it straightforward to test and learn. To explore it, predict the audit result after adding an unconditional edge to the start node, then run the audit: matching edges overlap rather than silently taking priority.

## Model boundary

This is bounded exhaustive checking, not a claim that a real service is correct. Limits are **8 fixed boolean inputs (256 combinations), 32 nodes, 96 edges**, a **100,000-character JSON document**, and bounded condition depth/size. There is no arbitrary code execution.

Inputs do not change during a run. There are no timing, network, numeric, probabilistic, or external-service semantics. Ambiguous branches stop immediately; “unvisited” means a node is never reached on an unambiguous checked run. A failure group contains one representative counterexample; the exported report includes every checked run. Zero-input models are checked once.

No data is sent to a server by the application. Browser storage is local convenience, not an encrypted backup; export important work.

## Verify

```sh
npm run test:coverage
npm run build
npx playwright install chromium
npm run test:e2e
npm audit
```

Browser tests start the production preview on port 4184 and cover desktop/mobile repair, replay, persistence, corrupt-save recovery, imports, invalid input, ambiguity, cycle evidence, downloaded report contents, maximum inputs, keyboard use, reduced motion, and horizontal overflow. See [verification](docs/verification.md) for the actual results and limits.

## Submission package

- [Draft Devpost story](docs/submission-draft.md)
- [Demo script](docs/demo-script.md)
- [Screenshots and captioned demo](docs/media/README.md)
- [Credits and AI disclosure](docs/credits.md)
- [Batch eligibility evidence and release checklist](../2026-09-13-build-batch/README.md)

React, TypeScript, and Vite power the UI; the checker uses deterministic TypeScript. OpenAI Codex assisted design, implementation, tests, documentation, and media preparation. There is no runtime AI. The project is an original educational implementation of established exhaustive state-space exploration ideas, not a claim to invent model checking.

MIT licensed; see [LICENSE](LICENSE).
