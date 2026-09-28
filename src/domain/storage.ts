import type { Model } from "./types";
import { parseModel, validateModel } from "./validation";
export const STORAGE_KEY = "pathproof:model:v1";
export type StoragePort = Pick<Storage, "getItem" | "setItem">;
export function loadModel(storage: StoragePort): {
  model?: Model;
  warning?: string;
  raw?: string;
} {
  let raw: string | null;
  try {
    raw = storage.getItem(STORAGE_KEY);
  } catch {
    return {
      warning:
        "Browser storage is unavailable. Your work stays in this tab; export a copy before leaving.",
    };
  }
  if (raw === null) return {};
  try {
    return { model: parseModel(raw) };
  } catch {
    return {
      raw,
      warning:
        "The saved model could not be loaded. A sample is open; your saved text is untouched until you apply a model.",
    };
  }
}
export function saveModel(
  storage: StoragePort,
  model: Model,
): string | undefined {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(validateModel(model)));
  } catch {
    return "Could not save in this browser. Export your model before leaving.";
  }
}
