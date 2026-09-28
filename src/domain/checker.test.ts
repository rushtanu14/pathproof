import { describe, expect, it } from "vitest";
import { check, simulate } from "./checker";
import type { Model } from "./types";
const base: Model = {
  version: 1,
  name: "Gate",
  inputs: ["member"],
  start: "start",
  nodes: [
    { id: "start", label: "Start", terminal: false },
    { id: "yes", label: "Yes", terminal: true },
    { id: "no", label: "No", terminal: true },
  ],
  edges: [
    {
      id: "a",
      from: "start",
      to: "yes",
      when: { input: "member", equals: true },
    },
    {
      id: "b",
      from: "start",
      to: "no",
      when: { input: "member", equals: false },
    },
  ],
};
describe("bounded exhaustive checker", () => {
  it("checks both input assignments and terminates on complementary edges", () => {
    const a = check(base);
    expect(a.total).toBe(2);
    expect(a.completed).toBe(2);
    expect(a.findings).toEqual([]);
    expect(a.runs.map((r) => r.path)).toEqual([
      ["start", "no"],
      ["start", "yes"],
    ]);
  });
  it("returns exact counterexample for a missing route plus an unreachable node", () => {
    const a = check({ ...base, edges: [base.edges[0]] });
    expect(a.completed).toBe(1);
    expect(a.findings.map((f) => f.kind)).toEqual(["dead-end", "unreachable"]);
    expect(a.findings[0].witness).toMatchObject({
      assignment: { member: false },
      path: ["start"],
      edges: [],
      outcome: "dead-end",
    });
  });
  it("stops when multiple edges match instead of silently choosing a priority", () => {
    const a = check({
      ...base,
      edges: [
        ...base.edges,
        { id: "c", from: "start", to: "no", when: { always: true } },
      ],
    });
    expect(a.completed).toBe(0);
    expect(a.findings[0]).toMatchObject({ kind: "ambiguous", count: 2 });
    expect(a.runs[0].matchingEdges).toEqual(["b", "c"]);
  });
  it("reports cycle with the closing edge and repeated node", () => {
    const a = simulate(
      {
        ...base,
        edges: [
          { id: "loop", from: "start", to: "start", when: { always: true } },
        ],
      },
      { member: true },
    );
    expect(a).toMatchObject({
      outcome: "cycle",
      path: ["start", "start"],
      edges: ["loop"],
    });
  });
  it("evaluates nested all/any conditions without expression evaluation", () => {
    const model = {
      ...base,
      inputs: ["member", "trained"],
      edges: [
        {
          ...base.edges[0],
          when: {
            all: [
              { input: "member", equals: true },
              { any: [{ input: "trained", equals: true }] },
            ],
          },
        },
      ],
    };
    const a = check(model);
    expect(a.total).toBe(4);
    expect(a.completed).toBe(1);
    expect(a.findings[0].count).toBe(3);
  });
  it("checks a zero-input model once and a max eight-input model 256 times", () => {
    expect(
      check({
        ...base,
        inputs: [],
        edges: [{ ...base.edges[0], when: { always: true } }],
      }).total,
    ).toBe(1);
    expect(
      check({
        ...base,
        inputs: Array.from({ length: 8 }, (_, i) => "v" + i),
        edges: [],
      }).total,
    ).toBe(256);
  });
  it("fails closed for unknown or missing scenario inputs", () => {
    expect(() => simulate(base, {})).toThrow();
    expect(() => simulate(base, { member: true, extra: false })).toThrow();
  });
  it("does not mutate the supplied model", () => {
    const before = JSON.stringify(base);
    check(base);
    expect(JSON.stringify(base)).toBe(before);
  });
});
