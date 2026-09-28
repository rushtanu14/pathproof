import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { broken, clean } from "../src/domain/examples";

test("repairs a real counterexample, replays it, persists and exports full evidence", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(page.getByText("6 of 8 scenarios terminate")).toBeVisible();
  await page.getByRole("button", { name: /No matching route/ }).click();
  await expect(page.getByTestId("witness")).toContainText("member true");
  await expect(page.getByTestId("witness")).toContainText("training false");
  await expect(page.locator('[data-edge="member-yes"]')).toHaveClass(
    /edge-active/,
  );
  await page.getByRole("button", { name: "← Previous" }).click();
  await expect(page.getByText("Step 1 / 2")).toBeVisible();
  await expect(page.locator('[data-edge="member-yes"]')).not.toHaveClass(
    /edge-active/,
  );
  await page.getByRole("button", { name: "Next →" }).click();
  await expect(page.getByText("Step 2 / 2")).toBeVisible();
  await page.getByRole("button", { name: "Apply example repair" }).click();
  await expect(
    page.getByRole("button", { name: "Export audit ↓" }),
  ).toBeDisabled();
  await expect(page.getByRole("status")).toContainText("Model changed");
  await page.getByRole("button", { name: "Run all scenarios" }).click();
  await expect(page.getByText("8 of 8 scenarios terminate")).toBeVisible();
  await expect(page.getByText("Every modeled route terminates.")).toBeVisible();
  const downloaded = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export audit ↓" }).click();
  const download = await downloaded;
  const report = await readFile((await download.path())!, "utf8");
  const evidence = JSON.parse(report.split("```json\n")[1].split("\n```")[0]);
  expect(evidence.audit.completed).toBe(8);
  expect(evidence.audit.runs).toHaveLength(8);
  expect(
    evidence.model.edges.find(
      (edge: { id: string }) => edge.id === "trained-no",
    ),
  ).toBeTruthy();
  expect(evidence.scope).toContain("fixed boolean");
  await page.reload();
  await expect(page.getByText("8 of 8 scenarios terminate")).toBeVisible();
  expect(errors).toEqual([]);
});

test("validates imported JSON, preserves the applied model on error, and detects ambiguity", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Edit model" }).click();
  await page.getByLabel("Model JSON").fill("not JSON");
  await page.getByRole("button", { name: "Validate and apply" }).click();
  await expect(page.getByRole("alert")).toContainText("Invalid JSON");
  await expect(page.getByText("6 of 8 scenarios terminate")).toBeVisible();
  const ambiguous = {
    ...clean,
    name: "Conflicting rules",
    edges: [
      ...clean.edges,
      { id: "conflict", from: clean.start, to: "join", when: { always: true } },
    ],
  };
  await page.locator('input[type="file"]').setInputFiles({
    name: "conflict.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(ambiguous)),
  });
  await page.getByRole("button", { name: "Validate and apply" }).click();
  await expect(page.getByRole("alert")).toHaveCount(0);
  await page.getByRole("button", { name: "Run all scenarios" }).click();
  await expect(page.getByText("0 of 8 scenarios terminate")).toBeVisible();
  await page.getByRole("button", { name: /Overlapping routes/ }).click();
  await expect(page.getByTestId("witness")).toContainText(
    "member-no, conflict",
  );
  await expect(page.getByTestId("witness")).toContainText("no edge priority");
});

test("cycle sample has exact closing edge and corrupted storage stays recoverable", async ({
  page,
}) => {
  await page.addInitScript(() =>
    localStorage.setItem("pathproof:model:v1", "broken saved text"),
  );
  await page.goto("/");
  await expect(page.getByRole("alert")).toContainText(
    "saved model could not be loaded",
  );
  expect(
    await page.evaluate(() => localStorage.getItem("pathproof:model:v1")),
  ).toBe("broken saved text");
  const savedDownload = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download saved text" }).click();
  const download = await savedDownload;
  expect(await readFile((await download.path())!, "utf8")).toBe(
    "broken saved text",
  );
  await page.getByLabel("Load an example").selectOption("cycle");
  await page.getByRole("button", { name: "Run all scenarios" }).click();
  await page.getByRole("button", { name: /Cycle detected/ }).click();
  await expect(page.getByTestId("witness")).toContainText("Step 3 / 3");
  await expect(page.locator('[data-edge="trained-yes"]')).toHaveClass(
    /edge-active/,
  );
  await expect(page.getByTestId("witness")).toContainText("final node repeats");
});

test("zero-input and maximum-input models are usable and return accurate counts", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Edit model" }).click();
  const terminal = {
    version: 1,
    name: "One terminal",
    inputs: [],
    start: "end",
    nodes: [{ id: "end", label: "Finished", terminal: true }],
    edges: [],
  };
  await page.getByLabel("Model JSON").fill(JSON.stringify(terminal));
  await page.getByRole("button", { name: "Validate and apply" }).click();
  await page.getByRole("button", { name: "Run all scenarios" }).click();
  await expect(page.getByText("1 of 1 scenarios terminate")).toBeVisible();
  await expect(page.getByTestId("witness")).toContainText("No inputs");
  await page.getByRole("button", { name: "Edit model" }).click();
  await page.getByLabel("Model JSON").fill(
    JSON.stringify({
      ...terminal,
      inputs: Array.from({ length: 8 }, (_, i) => `input${i}`),
    }),
  );
  await page.getByRole("button", { name: "Validate and apply" }).click();
  await page.getByRole("button", { name: "Run all scenarios" }).click();
  await expect(page.getByText("256 of 256 scenarios terminate")).toBeVisible();
});

test("mobile viewport contains the page, keyboard controls work, reduced motion is respected", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Skip to workspace" }),
  ).toBeFocused();
  await page.getByRole("button", { name: "Apply example repair" }).focus();
  await page.keyboard.press("Enter");
  await page.getByRole("button", { name: "Run all scenarios" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByText("8 of 8 scenarios terminate")).toBeVisible();
  expect(
    await page
      .getByRole("button", { name: "Run all scenarios" })
      .evaluate((el) => getComputedStyle(el).transitionDuration),
  ).toBe("0s");
  await page.getByRole("button", { name: "Edit model" }).click();
  await page
    .getByLabel("Model JSON")
    .fill(JSON.stringify({ ...broken, name: "<script>alert(1)</script>" }));
  await page.getByRole("button", { name: "Validate and apply" }).click();
  await expect(
    page.getByRole("heading", { name: "<script>alert(1)</script>" }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});
