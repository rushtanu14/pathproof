import type { Condition, Model } from "./types";
export const LIMITS = {
  inputs: 8,
  nodes: 32,
  edges: 96,
  text: 100_000,
  depth: 5,
  group: 16,
  conditions: 1024,
};
function requireThat(ok: unknown, message: string): asserts ok {
  if (!ok) throw new Error(message);
}
function object(value: unknown, path: string): Record<string, unknown> {
  requireThat(
    value !== null && typeof value === "object" && !Array.isArray(value),
    `${path}: expected an object.`,
  );
  return value as Record<string, unknown>;
}
function keys(value: Record<string, unknown>, allowed: string[], path: string) {
  requireThat(
    Object.keys(value).every((key) => allowed.includes(key)),
    `${path}: unknown field. Allowed: ${allowed.join(", ")}.`,
  );
  requireThat(
    allowed.every((key) => Object.hasOwn(value, key)),
    `${path}: required fields are ${allowed.join(", ")}.`,
  );
}
function text(value: unknown, path: string, max = 80): asserts value is string {
  requireThat(
    typeof value === "string" && value.trim().length > 0 && value.length <= max,
    `${path}: use 1–${max} characters.`,
  );
}
function id(value: unknown, path: string): asserts value is string {
  requireThat(
    typeof value === "string" &&
      /^[A-Za-z][A-Za-z0-9_-]{0,31}$/.test(value) &&
      !["constructor", "prototype", "__proto__"].includes(value),
    `${path}: use a letter followed by up to 31 letters, digits, _ or -.`,
  );
}
function list(
  value: unknown,
  path: string,
  max: number,
  min = 0,
): asserts value is unknown[] {
  requireThat(
    Array.isArray(value) && value.length >= min && value.length <= max,
    `${path}: expected ${min}–${max} entries.`,
  );
}
function unique(values: string[], path: string) {
  requireThat(
    new Set(values).size === values.length,
    `${path}: IDs must be unique.`,
  );
}
function condition(
  value: unknown,
  inputs: string[],
  path: string,
  depth: number,
  budget: { count: number },
): Condition {
  requireThat(
    depth <= LIMITS.depth,
    `${path}: condition depth exceeds ${LIMITS.depth}.`,
  );
  budget.count += 1;
  requireThat(
    budget.count <= LIMITS.conditions,
    "Model exceeds 1024 condition terms.",
  );
  const item = object(value, path);
  if (Object.hasOwn(item, "input")) {
    keys(item, ["input", "equals"], path);
    requireThat(
      typeof item.input === "string" && inputs.includes(item.input),
      `${path}.input: unknown input.`,
    );
    requireThat(
      typeof item.equals === "boolean",
      `${path}.equals: expected true or false.`,
    );
    return { input: item.input, equals: item.equals };
  }
  if (Object.hasOwn(item, "always")) {
    keys(item, ["always"], path);
    requireThat(item.always === true, `${path}.always must be true.`);
    return { always: true };
  }
  const key = Object.hasOwn(item, "all") ? "all" : "any";
  keys(item, [key], path);
  list(item[key], `${path}.${key}`, LIMITS.group, 1);
  const terms = item[key].map((term, i) =>
    condition(term, inputs, `${path}.${key}[${i}]`, depth + 1, budget),
  );
  return key === "all" ? { all: terms } : { any: terms };
}
export function validateModel(value: unknown): Model {
  const model = object(value, "model");
  keys(
    model,
    ["version", "name", "inputs", "start", "nodes", "edges"],
    "model",
  );
  requireThat(model.version === 1, "model.version must be 1.");
  text(model.name, "model.name");
  list(model.inputs, "inputs", LIMITS.inputs);
  model.inputs.forEach((v, i) => id(v, `inputs[${i}]`));
  const inputs = model.inputs as string[];
  unique(inputs, "inputs");
  list(model.nodes, "nodes", LIMITS.nodes, 1);
  const nodes = model.nodes.map((value, i) => {
    const p = `nodes[${i}]`;
    const n = object(value, p);
    keys(n, ["id", "label", "terminal"], p);
    id(n.id, `${p}.id`);
    text(n.label, `${p}.label`, 64);
    requireThat(
      typeof n.terminal === "boolean",
      `${p}.terminal must be boolean.`,
    );
    return { id: n.id, label: n.label, terminal: n.terminal };
  });
  const ids = nodes.map((n) => n.id);
  unique(ids, "nodes");
  id(model.start, "start");
  requireThat(ids.includes(model.start), "start: unknown node.");
  list(model.edges, "edges", LIMITS.edges);
  const budget = { count: 0 };
  const edges = model.edges.map((value, i) => {
    const p = `edges[${i}]`;
    const e = object(value, p);
    keys(e, ["id", "from", "to", "when"], p);
    id(e.id, `${p}.id`);
    id(e.from, `${p}.from`);
    id(e.to, `${p}.to`);
    requireThat(
      ids.includes(e.from) && ids.includes(e.to),
      `${p}: from/to must reference existing nodes.`,
    );
    requireThat(
      !nodes.find((n) => n.id === e.from)?.terminal,
      `${p}: terminal nodes cannot have outgoing edges.`,
    );
    return {
      id: e.id,
      from: e.from,
      to: e.to,
      when: condition(e.when, inputs, `${p}.when`, 0, budget),
    };
  });
  unique(
    edges.map((e) => e.id),
    "edges",
  );
  return {
    version: 1,
    name: model.name,
    inputs: [...inputs],
    start: model.start,
    nodes,
    edges,
  };
}
export function parseModel(raw: string): Model {
  requireThat(
    raw.length <= LIMITS.text,
    "JSON exceeds the 100,000 character limit.",
  );
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    throw new Error("Invalid JSON. Check commas, quotes, and brackets.");
  }
  return validateModel(value);
}
