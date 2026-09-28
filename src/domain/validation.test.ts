import { expect, it } from "vitest";
import { parseModel, validateModel } from "./validation";
const model = {
  version: 1,
  name: "A form",
  inputs: ["ready"],
  start: "s",
  nodes: [
    { id: "s", label: "Start", terminal: false },
    { id: "t", label: "End", terminal: true },
  ],
  edges: [
    { id: "e", from: "s", to: "t", when: { input: "ready", equals: true } },
  ],
};
it("accepts a complete declarative model and preserves all valid data", () =>
  expect(parseModel(JSON.stringify(model))).toEqual(model));
it.each([
  null,
  [],
  {},
  { ...model, version: 2 },
  { ...model, extra: "ignored?" },
  { ...model, name: "" },
  { ...model, inputs: ["x", "x"] },
  { ...model, inputs: ["__proto__"] },
  { ...model, inputs: Array.from({ length: 9 }, (_, i) => "x" + i) },
  { ...model, start: "missing" },
  { ...model, nodes: [...model.nodes, model.nodes[0]] },
  { ...model, nodes: [] },
  {
    ...model,
    nodes: Array.from({ length: 33 }, (_, i) => ({
      id: "n" + i,
      label: "x",
      terminal: true,
    })),
  },
  { ...model, edges: [...model.edges, model.edges[0]] },
  { ...model, edges: [{ ...model.edges[0], to: "missing" }] },
  { ...model, edges: [{ ...model.edges[0], from: "t" }] },
  {
    ...model,
    edges: [{ ...model.edges[0], when: { input: "other", equals: true } }],
  },
  { ...model, edges: [{ ...model.edges[0], when: { always: false } }] },
  { ...model, edges: [{ ...model.edges[0], when: { all: [] } }] },
  { ...model, edges: [{ ...model.edges[0], when: { any: [] } }] },
  {
    ...model,
    edges: [{ ...model.edges[0], when: { input: "ready", equals: "true" } }],
  },
  { ...model, edges: [{ ...model.edges[0], when: { expression: "true" } }] },
])("rejects malformed models without silently dropping fields %#", (value) =>
  expect(() => validateModel(value)).toThrow(),
);
it("rejects oversized text before JSON parsing and gives syntax feedback", () => {
  expect(() => parseModel(" ".repeat(100001))).toThrow(/100/);
  expect(() => parseModel("{")).toThrow(/JSON/);
});
it("bounds recursive condition depth", () => {
  let when: unknown = { always: true };
  for (let i = 0; i < 8; i++) when = { all: [when] };
  expect(() =>
    validateModel({ ...model, edges: [{ ...model.edges[0], when }] }),
  ).toThrow(/depth/);
});
it("bounds edges and condition group width", () => {
  expect(() =>
    validateModel({
      ...model,
      edges: Array.from({ length: 97 }, (_, i) => ({
        ...model.edges[0],
        id: "e" + i,
      })),
    }),
  ).toThrow();
  expect(() =>
    validateModel({
      ...model,
      edges: [
        {
          ...model.edges[0],
          when: { all: Array.from({ length: 17 }, () => ({ always: true })) },
        },
      ],
    }),
  ).toThrow();
});
it("accepts nested all/any and always", () => {
  const value = {
    ...model,
    edges: [
      {
        ...model.edges[0],
        when: {
          any: [{ all: [{ input: "ready", equals: false }] }, { always: true }],
        },
      },
    ],
  };
  expect(validateModel(value)).toEqual(value);
});
