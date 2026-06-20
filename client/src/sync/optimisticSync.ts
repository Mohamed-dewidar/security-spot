import { api } from "@/api/client";
import type { BundleState } from "@/state/bundleReducer";
import type { ConfigurationPatch } from "@/types/configuration";

export const SYNC_DEBOUNCE_MS = 400;

/** Maps reducer state to the configuration PATCH body (no client prices). */
export function bundleStateToPatch(state: BundleState): ConfigurationPatch {
  return {
    selections: state.selections,
    activeVariants: state.activeVariants,
    openStepId: state.openStepId,
  };
}

export type ConfigurationSyncController = {
  schedule: (state: BundleState) => void;
  flush: () => Promise<void>;
  cancel: () => void;
};

/**
 * Debounced PATCH queue for optimistic UI.
 * Dispatch updates reducer immediately; call `schedule` to sync server draft.
 */
export function createConfigurationSyncController(
  configurationId: string,
  debounceMs = SYNC_DEBOUNCE_MS,
): ConfigurationSyncController {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let pendingState: BundleState | null = null;

  const flush = async () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }

    const state = pendingState;
    pendingState = null;
    if (!state) {
      return;
    }

    await api.patchConfiguration(configurationId, bundleStateToPatch(state));
  };

  return {
    schedule(state: BundleState) {
      pendingState = state;
      if (timer) {
        clearTimeout(timer);
      }
      timer = setTimeout(() => {
        timer = null;
        void flush();
      }, debounceMs);
    },
    flush,
    cancel() {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      pendingState = null;
    },
  };
}
