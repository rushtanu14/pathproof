import type {
  Assignment,
  Audit,
  Condition,
  Finding,
  Model,
  Run,
} from "./types";
import { validateModel } from "./validation";
export function matches(condition: Condition, assignment: Assignment): boolean {
  if ("always" in condition) return true;
  if ("input" in condition)
    return assignment[condition.input] === condition.equals;
  if ("all" in condition)
    return condition.all.every((term) => matches(term, assignment));
  return condition.any.some((term) => matches(term, assignment));
}
function walk(model: Model, assignment: Assignment): Run {
  let node = model.start;
  let path: string[] = [];
  let edges: string[] = [];
  while (true) {
    const repeated = path.includes(node);
    path = [...path, node];
    const result = {
      assignment: { ...assignment },
      path,
      edges,
      node,
      matchingEdges: [],
    };
    if (repeated) return { ...result, outcome: "cycle" };
    if (model.nodes.find((n) => n.id === node)!.terminal)
      return { ...result, outcome: "terminal" };
    const matching = model.edges.filter(
      (edge) => edge.from === node && matches(edge.when, assignment),
    );
    if (matching.length !== 1)
      return {
        ...result,
        outcome: matching.length === 0 ? "dead-end" : "ambiguous",
        matchingEdges: matching.map((e) => e.id),
      };
    edges = [...edges, matching[0].id];
    node = matching[0].to;
  }
}
export function simulate(value: Model, assignment: Assignment): Run {
  const model = validateModel(value);
  if (
    Object.keys(assignment).length !== model.inputs.length ||
    model.inputs.some(
      (key) =>
        !Object.hasOwn(assignment, key) || typeof assignment[key] !== "boolean",
    )
  )
    throw new Error(
      "Scenario must contain exactly the modeled boolean inputs.",
    );
  return walk(model, assignment);
}
export function check(value: Model): Audit {
  const model = validateModel(value);
  const runs = Array.from({ length: 2 ** model.inputs.length }, (_, bits) =>
    walk(
      model,
      Object.fromEntries(
        model.inputs.map((name, i) => [name, Boolean(bits & (1 << i))]),
      ),
    ),
  );
  const reached = [...new Set(runs.flatMap((run) => run.path))];
  const findings: Finding[] = [];
  for (const run of runs) {
    if (run.outcome === "terminal") continue;
    const id = `${run.outcome}:${run.node}`;
    const previous = findings.findIndex((f) => f.id === id);
    if (previous >= 0)
      findings[previous] = {
        ...findings[previous],
        count: findings[previous].count + 1,
      };
    else
      findings.push({
        id,
        kind: run.outcome,
        node: run.node,
        count: 1,
        witness: run,
      });
  }
  model.nodes
    .filter((n) => !reached.includes(n.id))
    .forEach((node) =>
      findings.push({
        id: `unreachable:${node.id}`,
        kind: "unreachable",
        node: node.id,
        count: 0,
      }),
    );
  return {
    total: runs.length,
    completed: runs.filter((r) => r.outcome === "terminal").length,
    runs,
    findings,
    reached,
  };
}
