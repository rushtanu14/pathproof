import { expect, test, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { broken, clean } from "../src/domain/examples";

function captureBrowserErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(`console: ${message.text()}`);
  });
  return errors;
}

async function expectNoViewportOverflow(page: Page) {
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
}

test("every inspect control changes state, downloads evidence, and persists", async ({
  page,
}) => {
  const errors = captureBrowserErrors(page);
  await page.goto("/");

  const skip = page.getByRole("link", { name: "Skip to workspace" });
  await skip.focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#workspace$/);
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Inspect", exact: true })).toBeFocused();
  await page.getByRole("link", { name: "PathProof workspace" }).click();
  await expect(page).toHaveURL(/#workspace$/);

  const inspect = page.getByRole("button", { name: "Inspect", exact: true });
  const edit = page.getByRole("button", { name: "Edit model" });
  await expect(inspect).toHaveAttribute("aria-pressed", "true");
  await edit.click();
  await expect(edit).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByLabel("Model JSON")).toBeVisible();
  await inspect.click();
  await expect(inspect).toHaveAttribute("aria-pressed", "true");

  const modelDownload = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export model ↓" }).click();
  const modelFile = await modelDownload;
  expect(modelFile.suggestedFilename()).toBe("pathproof-model.json");
  expect(JSON.parse(await readFile((await modelFile.path())!, "utf8"))).toEqual(
    broken,
  );

  const auditButton = page.getByRole("button", { name: "Export audit ↓" });
  await expect(auditButton).toBeEnabled();
  const auditDownload = page.waitForEvent("download");
  await auditButton.click();
  const auditFile = await auditDownload;
  expect(auditFile.suggestedFilename()).toBe("pathproof-audit.md");
  expect(await readFile((await auditFile.path())!, "utf8")).toContain(
    "Library equipment borrowing",
  );

  const findingButtons = page.locator(".finding-list button");
  const findingCount = await findingButtons.count();
  expect(findingCount).toBeGreaterThan(0);
  for (let index = 0; index < findingCount; index++) {
    const button = findingButtons.nth(index);
    await button.click();
    await expect(button).toHaveAttribute("aria-pressed", "true");
  }

  const scenario = page.getByLabel("Inspect a scenario");
  const scenarioValues = await scenario.locator("option:not([disabled])").evaluateAll(
    (options) => options.map((option) => (option as HTMLOptionElement).value),
  );
  expect(scenarioValues).toHaveLength(8);
  for (const value of scenarioValues) {
    await scenario.selectOption(value);
    await expect(scenario).toHaveValue(value);
    const steps = page.getByRole("button", { name: /^Replay step/ });
    for (let index = 0; index < (await steps.count()); index++) {
      await steps.nth(index).click();
      await expect(steps.nth(index)).toHaveAttribute("aria-pressed", "true");
    }
  }

  await scenario.selectOption("6");
  const replaySteps = page.getByRole("button", { name: /^Replay step/ });
  const replayCount = await replaySteps.count();
  expect(replayCount).toBeGreaterThan(1);
  for (let index = 0; index < replayCount; index++) {
    const step = replaySteps.nth(index);
    await step.click();
    await expect(step).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByText(`Step ${index + 1} / ${replayCount}`)).toBeVisible();
  }
  const previous = page.getByRole("button", { name: "← Previous" });
  const next = page.getByRole("button", { name: "Next →" });
  await expect(next).toBeDisabled();
  for (let index = replayCount - 1; index > 0; index--) await previous.click();
  await expect(previous).toBeDisabled();
  await expect(next).toBeEnabled();
  for (let index = 1; index < replayCount; index++) await next.click();
  await expect(next).toBeDisabled();

  const details = page.locator("details.route-details");
  await expect(details).not.toHaveAttribute("open", "");
  await details.locator("summary").click();
  await expect(details).toHaveAttribute("open", "");
  await expect(details.locator("tbody tr")).toHaveCount(broken.edges.length);
  await details.locator("summary").click();
  await expect(details).not.toHaveAttribute("open", "");

  await page.getByRole("button", { name: "Apply example repair" }).click();
  await expect(auditButton).toBeDisabled();
  await expect(page.getByRole("status")).toContainText("Model changed");
  await expect(page.getByRole("button", { name: "Apply example repair" })).toHaveCount(0);
  await page.getByRole("button", { name: /Run all scenarios/ }).click();
  await expect(auditButton).toBeEnabled();
  await expect(page.getByText("8 of 8 scenarios terminate")).toBeVisible();
  await page.reload();
  await expect(page.getByText("8 of 8 scenarios terminate")).toBeVisible();
  await expectNoViewportOverflow(page);
  expect(errors).toEqual([]);
});

test("every example option applies and audits its expected result", async ({ page }) => {
  const errors = captureBrowserErrors(page);
  await page.goto("/");
  const examples = page.getByLabel("Load an example");
  const cases = [
    { value: "broken", heading: broken.name, result: "6 of 8 scenarios terminate" },
    { value: "clean", heading: clean.name, result: "8 of 8 scenarios terminate" },
    { value: "cycle", heading: "Borrowing with a referral loop", result: "6 of 8 scenarios terminate" },
  ];
  for (const sample of cases) {
    await examples.selectOption(sample.value);
    await expect(page.getByRole("heading", { name: sample.heading })).toBeVisible();
    await expect(page.getByRole("button", { name: "Export audit ↓" })).toBeDisabled();
    await page.getByRole("button", { name: /Run all scenarios/ }).click();
    await expect(page.getByText(sample.result)).toBeVisible();
    await expect(page.getByRole("button", { name: "Export audit ↓" })).toBeEnabled();
    const findings = page.locator(".finding-list button");
    for (let index = 0; index < (await findings.count()); index++) {
      await findings.nth(index).click();
      await expect(findings.nth(index)).toHaveAttribute("aria-pressed", "true");
    }
  }
  await expectNoViewportOverflow(page);
  expect(errors).toEqual([]);
});

test("import, validation, apply, and keyboard controls preserve the last valid model", async ({
  page,
}) => {
  const errors = captureBrowserErrors(page);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.getByRole("button", { name: "Edit model" }).click();

  const editor = page.getByLabel("Model JSON");
  await editor.fill("not json");
  await page.getByRole("button", { name: "Validate and apply" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("alert")).toContainText("Invalid JSON");
  await expect(page.getByText("6 of 8 scenarios terminate")).toBeVisible();

  const imported = { ...clean, name: "Imported keyboard model" };
  await page.locator('input[type="file"]').setInputFiles({
    name: "imported.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(imported)),
  });
  await expect(editor).toHaveValue(JSON.stringify(imported));
  await expect(page.getByRole("alert")).toHaveCount(0);
  await page.getByRole("button", { name: "Validate and apply" }).click();
  await expect(page.getByRole("heading", { name: imported.name })).toBeVisible();
  await expect(page.getByRole("button", { name: "Export audit ↓" })).toBeDisabled();
  await page.getByRole("button", { name: /Run all scenarios/ }).click();
  await expect(page.getByText("8 of 8 scenarios terminate")).toBeVisible();
  await expect(
    page.evaluate(() => JSON.parse(localStorage.getItem("pathproof:model:v1")!).name),
  ).resolves.toBe(imported.name);
  expect(
    await page
      .getByRole("button", { name: /Run all scenarios/ })
      .evaluate((element) => getComputedStyle(element).transitionDuration),
  ).toBe("0s");
  await expectNoViewportOverflow(page);
  expect(errors).toEqual([]);
});

test("corrupt saved text remains downloadable and untouched", async ({ page }) => {
  const errors = captureBrowserErrors(page);
  const corrupt = "{saved but invalid";
  await page.addInitScript((raw) => {
    localStorage.setItem("pathproof:model:v1", raw);
  }, corrupt);
  await page.goto("/");
  await expect(page.getByRole("alert")).toContainText("saved model could not be loaded");
  const recoveredDownload = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download saved text" }).click();
  const recovered = await recoveredDownload;
  expect(recovered.suggestedFilename()).toBe("pathproof-recovered.txt");
  expect(await readFile((await recovered.path())!, "utf8")).toBe(corrupt);
  expect(await page.evaluate(() => localStorage.getItem("pathproof:model:v1"))).toBe(corrupt);
  await expectNoViewportOverflow(page);
  expect(errors).toEqual([]);
});
