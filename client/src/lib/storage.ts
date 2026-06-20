import type { SavedConfigurationSnapshot } from "@/types/configuration";

const STORAGE_KEY = "security-spot.bundle.snapshot";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isStringRecord(value: unknown): value is Record<string, string> {
  if (!isRecord(value)) {
    return false;
  }

  return Object.values(value).every((entry) => typeof entry === "string");
}

function isNumberRecord(value: unknown): value is Record<string, number> {
  if (!isRecord(value)) {
    return false;
  }

  return Object.values(value).every((entry) => typeof entry === "number");
}

/** Validates persisted JSON before hydrating reducer state. */
export function parseSavedSnapshot(
  raw: unknown,
): SavedConfigurationSnapshot | null {
  if (!isRecord(raw)) {
    return null;
  }

  if (typeof raw.openStepId !== "string") {
    return null;
  }

  if (!isNumberRecord(raw.selections) || !isStringRecord(raw.activeVariants)) {
    return null;
  }

  const snapshot: SavedConfigurationSnapshot = {
    openStepId: raw.openStepId,
    selections: raw.selections,
    activeVariants: raw.activeVariants,
  };

  if (raw.configurationId !== undefined) {
    if (typeof raw.configurationId !== "string") {
      return null;
    }
    snapshot.configurationId = raw.configurationId;
  }

  return snapshot;
}

/** Reads the saved bundle snapshot from localStorage, if present and valid. */
export function loadSavedSnapshot(): SavedConfigurationSnapshot | null {
  if (typeof localStorage === "undefined") {
    return null;
  }

  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return parseSavedSnapshot(JSON.parse(raw));
  } catch {
    return null;
  }
}

/** Persists the current bundle selections for "Save my system for later". */
export function saveSnapshot(snapshot: SavedConfigurationSnapshot): void {
  if (typeof localStorage === "undefined") {
    return;
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
}

/** Clears persisted snapshot — for tests and explicit reset flows. */
export function clearSavedSnapshot(): void {
  if (typeof localStorage === "undefined") {
    return;
  }

  localStorage.removeItem(STORAGE_KEY);
}
