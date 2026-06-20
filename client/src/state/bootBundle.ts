import { api } from "@/api/client";
import { NotFoundError } from "@/api/errors";
import { loadSavedSnapshot } from "@/lib/storage";
import type { BundleConfig } from "@/types/catalog";
import type { Configuration } from "@/types/configuration";

export type BootBundleResult = {
  catalog: BundleConfig;
  configuration: Configuration;
};

/**
 * Boot sequence: load catalog, restore saved snapshot or create a fresh draft.
 * Saved configuration ids are validated against the API; stale ids fall back to
 * creating a new draft seeded from the snapshot.
 */
export async function bootBundleConfiguration(): Promise<BootBundleResult> {
  const catalog = await api.getConfig();
  const saved = loadSavedSnapshot();

  if (saved) {
    if (saved.configurationId) {
      try {
        const configuration = await api.getConfiguration(saved.configurationId);
        return { catalog, configuration };
      } catch (error) {
        if (!(error instanceof NotFoundError)) {
          throw error;
        }
      }
    }

    const configuration = await api.createConfiguration({
      selections: saved.selections,
      activeVariants: saved.activeVariants,
      openStepId: saved.openStepId,
    });
    return { catalog, configuration };
  }

  const configuration = await api.createConfiguration({});
  return { catalog, configuration };
}
