import type { BundleConfig } from "@/types/catalog";

/** Ensures a valid accordion step is open; defaults to catalog seed (cameras). */
export function resolveOpenStepId(
  catalog: BundleConfig,
  openStepId?: string,
): string {
  const fallback =
    catalog.initialSelections.openStepId || catalog.steps[0]?.id || "cameras";

  if (!openStepId?.trim()) {
    return fallback;
  }

  if (!catalog.steps.some((step) => step.id === openStepId)) {
    return fallback;
  }

  return openStepId;
}
