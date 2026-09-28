import type { Model } from "./types";
import { check } from "./checker";
import { LIMITS, validateModel } from "./validation";
const scope =
  "Exhaustive over every combination of the modeled, fixed boolean inputs only. Inputs never change during execution. Ambiguous decisions stop immediately; reachability means visited under these deterministic semantics. This is not a certification of a live form, external services, human behavior, timing, or unmodeled states.";
export function reportJson(value: Model): string {
  const model = validateModel(value);
  return JSON.stringify(
    {
      tool: "PathProof",
      reportVersion: 1,
      generatedAt: new Date().toISOString(),
      scope,
      limits: LIMITS,
      model,
      audit: check(model),
    },
    null,
    2,
  );
}
export function reportMarkdown(model: Model): string {
  const audit = check(model);
  return [
    "# PathProof workflow audit",
    "",
    `${audit.completed} of ${audit.total} modeled scenarios terminate. ${audit.findings.length} finding groups.`,
    "",
    scope,
    "",
    "## Reproducible model and complete evidence",
    "",
    "The JSON below contains the model, every checked scenario, exact node and edge paths, and one counterexample per finding group.",
    "",
    "```json",
    reportJson(model),
    "```",
    "",
  ].join("\n");
}
