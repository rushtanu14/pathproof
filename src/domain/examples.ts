import type { Model } from "./types";
export const broken: Model = {
  version: 1,
  name: "Library equipment borrowing",
  inputs: ["member", "training", "itemAvailable"],
  start: "membership",
  nodes: [
    { id: "membership", label: "Library member?", terminal: false },
    { id: "training", label: "Training complete?", terminal: false },
    { id: "stock", label: "Item available?", terminal: false },
    { id: "join", label: "Become a member", terminal: true },
    { id: "learn", label: "Book training", terminal: true },
    { id: "borrow", label: "Borrow equipment", terminal: true },
    { id: "wait", label: "Join the waitlist", terminal: true },
  ],
  edges: [
    {
      id: "member-yes",
      from: "membership",
      to: "training",
      when: { input: "member", equals: true },
    },
    {
      id: "member-no",
      from: "membership",
      to: "join",
      when: { input: "member", equals: false },
    },
    {
      id: "trained-yes",
      from: "training",
      to: "stock",
      when: { input: "training", equals: true },
    },
    {
      id: "stock-yes",
      from: "stock",
      to: "borrow",
      when: { input: "itemAvailable", equals: true },
    },
    {
      id: "stock-no",
      from: "stock",
      to: "wait",
      when: { input: "itemAvailable", equals: false },
    },
  ],
};
export const repairEdge = {
  id: "trained-no",
  from: "training",
  to: "learn",
  when: { input: "training", equals: false },
} as const;
export const clean: Model = { ...broken, edges: [...broken.edges, repairEdge] };
export const cycle: Model = {
  ...clean,
  name: "Borrowing with a referral loop",
  edges: clean.edges.map((e) =>
    e.id === "trained-yes" ? { ...e, to: "membership" } : e,
  ),
};
export function canRepair(model: Model) {
  return JSON.stringify(model) === JSON.stringify(broken);
}
export function repair(model: Model): Model {
  if (!canRepair(model))
    throw new Error(
      "This repair applies only to the unchanged broken library example.",
    );
  return { ...model, edges: [...model.edges, repairEdge] };
}
export const examples = { broken, clean, cycle };
