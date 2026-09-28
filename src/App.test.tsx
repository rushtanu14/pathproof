// @vitest-environment jsdom
import { afterEach, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";
import App from "./App";
afterEach(() => {
  cleanup();
  localStorage.clear();
});
it("lets a user inspect a failure, make a model repair, and rerun all scenarios", async () => {
  const user = userEvent.setup();
  render(<App />);
  expect(screen.getByText("6 of 8 scenarios terminate")).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: /No matching route/ }));
  expect(screen.getByTestId("witness")).toHaveTextContent("training");
  await user.click(
    screen.getByRole("button", { name: "Apply example repair" }),
  );
  expect(screen.getByText(/Model changed. Run the audit/)).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Run all scenarios" }));
  expect(screen.getByText("8 of 8 scenarios terminate")).toBeInTheDocument();
  expect(
    screen.getByText("Every modeled route terminates."),
  ).toBeInTheDocument();
});
it("keeps the applied model when invalid JSON is submitted", async () => {
  const user = userEvent.setup();
  render(<App />);
  await user.click(screen.getByRole("button", { name: "Edit model" }));
  const editor = screen.getByLabelText("Model JSON");
  await user.clear(editor);
  await user.type(editor, "oops");
  await user.click(screen.getByRole("button", { name: "Validate and apply" }));
  expect(screen.getByRole("alert")).toHaveTextContent("Invalid JSON");
  await user.click(screen.getByRole("button", { name: "Inspect" }));
  expect(screen.getByText("Library equipment borrowing")).toBeInTheDocument();
});
