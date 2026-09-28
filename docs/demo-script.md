# PathProof demo

Target duration: **2 minutes 10 seconds to 2 minutes 25 seconds**, within GIBC's 2–5 minute requirement. Record actual browser interactions and retain readable English captions. Media capture and exact final duration are documented in `media/README.md`.

| Time | Screen/action | Caption/narration |
| --- | --- | --- |
| 0:00–0:15 | Seeded workspace | Small decision flows can strand people. PathProof checks every combination of the inputs you model. |
| 0:15–0:30 | Audit bar and graph | This library borrowing model has three boolean inputs, so there are eight scenarios. Only six currently terminate. |
| 0:30–0:50 | Select missing-route finding | A member without training reaches a decision with no matching outgoing route. These are the exact fixed inputs and the failing path. |
| 0:50–1:05 | Previous/Next replay | Replay highlights the selected nodes and edges. The evidence explains where execution stops. |
| 1:05–1:25 | Apply repair, run all scenarios | Add the missing false-training route to Book training. The old audit clears; rerun checks all eight combinations. All terminate and every node is visited. |
| 1:25–1:40 | Export audit | Download a Markdown report with the complete model and every checked scenario, not just a success badge. |
| 1:40–2:00 | Editor and cycle sample | Models are editable JSON with bounded, declarative conditions. A separate sample shows a cycle and its exact closing edge. |
| 2:00–2:15 | Scope note | The result is exhaustive only for the fixed boolean model. It does not test a live service, timing, or changing inputs. Runs locally with no account or runtime AI. |

Avoid claiming that all real-world paths are safe or that model checking itself is a new invention. Show the actual app, not fabricated data or interface states.
