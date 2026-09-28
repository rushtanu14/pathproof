export type Condition =
  | { input: string; equals: boolean }
  | { all: Condition[] }
  | { any: Condition[] }
  | { always: true };
export type FlowNode = { id: string; label: string; terminal: boolean };
export type Edge = { id: string; from: string; to: string; when: Condition };
export type Model = {
  version: 1;
  name: string;
  inputs: string[];
  start: string;
  nodes: FlowNode[];
  edges: Edge[];
};
export type Assignment = Record<string, boolean>;
export type Outcome = "terminal" | "dead-end" | "ambiguous" | "cycle";
export type Run = {
  assignment: Assignment;
  path: string[];
  edges: string[];
  outcome: Outcome;
  node: string;
  matchingEdges: string[];
};
export type Finding = {
  id: string;
  kind: Exclude<Outcome, "terminal"> | "unreachable";
  node: string;
  count: number;
  witness?: Run;
};
export type Audit = {
  total: number;
  completed: number;
  runs: Run[];
  findings: Finding[];
  reached: string[];
};
