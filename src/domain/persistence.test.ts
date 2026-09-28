import { expect, it } from "vitest";
import { loadModel, saveModel, STORAGE_KEY } from "./storage";
import { reportJson, reportMarkdown } from "./report";
import { broken, clean, repair, canRepair } from "./examples";
import { check } from "./checker";
const memory = () => {
  const map = new Map<string, string>();
  return {
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => {
      map.set(k, v);
    },
  };
};
it("persists the validated model and reads it back", () => {
  const store = memory();
  expect(saveModel(store, clean)).toBeUndefined();
  expect(loadModel(store).model).toEqual(clean);
});
it("keeps corrupt saved text available for recovery and does not overwrite it", () => {
  const store = memory();
  store.setItem(STORAGE_KEY, "broken");
  expect(loadModel(store)).toMatchObject({
    warning: expect.any(String),
    raw: "broken",
  });
  expect(store.getItem(STORAGE_KEY)).toBe("broken");
});
it("reports denied browser storage without crashing", () => {
  const denied = {
    getItem: () => {
      throw new Error("denied");
    },
    setItem: () => {
      throw new Error("denied");
    },
  };
  expect(loadModel(denied).warning).toBeTruthy();
  expect(saveModel(denied, clean)).toBeTruthy();
});
it("treats missing storage as a fresh workspace", () =>
  expect(loadModel(memory())).toEqual({}));
it("exports independently reproducible witness and full bounded model", () => {
  const output = JSON.parse(reportJson(broken));
  expect(output.model).toEqual(broken);
  expect(output.audit.total).toBe(8);
  expect(output.audit.completed).toBe(6);
  expect(output.audit.findings[0].witness.assignment).toEqual({
    member: true,
    training: false,
    itemAvailable: false,
  });
  expect(output.scope).toMatch(/fixed/);
  expect(reportMarkdown(broken)).toContain("```json");
  expect(reportMarkdown(broken)).toContain('"member": true');
});
it("makes the precise repair without altering the original and fixes all eight cases", () => {
  expect(canRepair(broken)).toBe(true);
  expect(canRepair(clean)).toBe(false);
  expect(() => repair(clean)).toThrow();
  expect(repair(broken).edges).toHaveLength(6);
  expect(broken.edges).toHaveLength(5);
  expect(check(repair(broken))).toMatchObject({
    total: 8,
    completed: 8,
    findings: [],
  });
});
