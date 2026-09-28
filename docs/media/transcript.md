# pathproof — real browser walkthrough

Sound-off demonstration. Every product interaction recorded against the local running app.

## 00:00:00,122 · 01 / THE PROBLEM

A decision form can strand someone on a missing route. PathProof checks a finite model and shows the exact failure.

## 00:00:08,125 · 02 / DEFINE THE INPUTS

This equipment-loan model has three fixed true/false inputs. That creates eight combinations to check.

## 00:00:16,142 · 02 / DEFINE THE INPUTS

The input is plain JSON: named inputs, nodes and conditions. No scripts or arbitrary expressions execute.

## 00:00:24,234 · 03 / RUN EVERY SCENARIO

Validate the model, then run all eight combinations. Six terminate; two are missing a next route.

## 00:00:32,235 · 04 / FIND THE FAILURE

Two finding groups summarize the problem: a missing route and a training node no run visits.

## 00:00:40,237 · 04 / FIND THE FAILURE

Here is a counterexample: member=true, training=false. The run stops at “Training complete?” with no matching edge.

## 00:00:48,239 · 05 / REPLAY THE EVIDENCE

Replay the path one step at a time. The fixed inputs explain why this member cannot reach a terminal.

## 00:00:56,241 · 05 / REPLAY THE EVIDENCE

Inspect the actual conditions. The model has a route for trained members, but none for training=false.

## 00:01:04,244 · 06 / REPAIR THE MODEL

The example repair adds training=false → Book training. This is a real model edit, so the old results are cleared.

## 00:01:12,246 · 07 / RERUN, THEN CONCLUDE

Run every scenario again. All eight now terminate, and every modeled node is visited.

## 00:01:20,248 · 07 / RERUN, THEN CONCLUDE

The findings panel is clear. This conclusion covers only this finite model and its fixed boolean inputs.

## 00:01:28,250 · 07 / RERUN, THEN CONCLUDE

Inspect scenario 2 again: the untrained member now reaches Book training instead of stopping at the question.

## 00:01:36,251 · 08 / EXPORT THE AUDIT

Export the audit and the model. The Markdown audit includes findings, traces and the complete JSON model.

## 00:01:44,252 · 09 / A SECOND FAILURE MODE

A second built-in example has a referral cycle. Load it and run the same exhaustive check.

## 00:01:52,253 · 09 / A SECOND FAILURE MODE

The replay repeats a node under the same fixed inputs. That is evidence of a cycle inside this model.

## 00:02:00,255 · 10 / KEEP THE VERIFIED RESULT

Return to the complete borrowing flow and rerun it. The saved export preserves the repair and its evidence.

## 00:02:08,256 · 10 / THE HONEST BOUNDARY

Model → check → trace → repair → rerun. This does not test a live form, timing, services or unmodeled behavior.
