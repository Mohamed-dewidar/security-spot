import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { resetLocalApiStore } from "@/api/implementations/local";
import {
  bundleStateToPatch,
  createConfigurationSyncController,
  SYNC_DEBOUNCE_MS,
} from "@/sync/optimisticSync";
import { createInitialState } from "@/state/bundleReducer";
import bundle from "@/data/bundle.json";
import type { BundleConfig } from "@/types/catalog";

const catalog = bundle as BundleConfig;

beforeEach(() => {
  vi.useFakeTimers();
  resetLocalApiStore();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("bundleStateToPatch", () => {
  it("maps reducer fields to a configuration patch", () => {
    const state = createInitialState(catalog, catalog.initialSelections);
    expect(bundleStateToPatch(state)).toEqual({
      selections: state.selections,
      activeVariants: state.activeVariants,
      openStepId: state.openStepId,
    });
  });
});

describe("createConfigurationSyncController", () => {
  it("debounces PATCH calls until the delay elapses", async () => {
    const { localApi } = await import("@/api/implementations/local");
    const patchSpy = vi.spyOn(localApi, "patchConfiguration");
    const created = await localApi.createConfiguration();
    const controller = createConfigurationSyncController(created.id, 400);

    const firstState = createInitialState(catalog, created);
    const secondState = {
      ...firstState,
      openStepId: "plan",
    };

    controller.schedule(firstState);
    controller.schedule(secondState);

    expect(patchSpy).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(SYNC_DEBOUNCE_MS);

    expect(patchSpy).toHaveBeenCalledTimes(1);
    expect(patchSpy).toHaveBeenCalledWith(created.id, {
      selections: secondState.selections,
      activeVariants: secondState.activeVariants,
      openStepId: "plan",
    });

    controller.cancel();
    patchSpy.mockRestore();
  });

  it("flush sends the pending patch immediately", async () => {
    const { localApi } = await import("@/api/implementations/local");
    const patchSpy = vi.spyOn(localApi, "patchConfiguration");
    const created = await localApi.createConfiguration();
    const controller = createConfigurationSyncController(created.id, 400);
    const state = {
      ...createInitialState(catalog, created),
      openStepId: "sensors",
    };

    controller.schedule(state);
    await controller.flush();

    expect(patchSpy).toHaveBeenCalledTimes(1);
    expect(patchSpy).toHaveBeenCalledWith(
      created.id,
      bundleStateToPatch(state),
    );

    controller.cancel();
    patchSpy.mockRestore();
  });
});
