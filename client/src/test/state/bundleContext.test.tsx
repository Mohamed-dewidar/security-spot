import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import bundle from "@/data/bundle.json";
import {
  resetLocalApiStore,
  seedLocalConfiguration,
} from "@/api/implementations/local";
import { clearSavedSnapshot, loadSavedSnapshot } from "@/lib/storage";
import {
  BundleProvider,
  useBundle,
  useBundleCatalog,
  useBundleDispatch,
  useBundleState,
} from "@/state/bundleContext";
import type { BundleConfig } from "@/types/catalog";
import type { Configuration } from "@/types/configuration";

const catalog = bundle as BundleConfig;

function Probe() {
  const { configurationId, saveForLater } = useBundle();
  const state = useBundleState();
  const dispatch = useBundleDispatch();
  const loadedCatalog = useBundleCatalog();

  return (
    <div>
      <span data-testid="configuration-id">{configurationId}</span>
      <span data-testid="open-step">{state.openStepId}</span>
      <span data-testid="step-count">{loadedCatalog.steps.length}</span>
      <button
        type="button"
        onClick={() => dispatch({ type: "SET_OPEN_STEP", stepId: "plan" })}
      >
        Open plan
      </button>
      <button type="button" onClick={() => void saveForLater()}>
        Save for later
      </button>
    </div>
  );
}

describe("BundleProvider", () => {
  beforeEach(() => {
    resetLocalApiStore();
    clearSavedSnapshot();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("provides catalog, configuration id, and reducer state", () => {
    const configuration: Configuration = {
      id: "cfg-test",
      openStepId: "cameras",
      selections: catalog.initialSelections.selections,
      activeVariants: catalog.initialSelections.activeVariants,
    };

    render(
      <BundleProvider catalog={catalog} configuration={configuration}>
        <Probe />
      </BundleProvider>,
    );

    expect(screen.getByTestId("configuration-id")).toHaveTextContent(
      "cfg-test",
    );
    expect(screen.getByTestId("open-step")).toHaveTextContent("cameras");
    expect(screen.getByTestId("step-count")).toHaveTextContent("4");
  });

  it("throws when bundle hooks are used outside the provider", () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    expect(() => render(<Probe />)).toThrow(
      "Bundle hooks must be used within BundleProvider",
    );

    consoleError.mockRestore();
  });

  it("debounces optimistic sync after local dispatch", async () => {
    const { localApi } = await import("@/api/implementations/local");
    const patchSpy = vi.spyOn(localApi, "patchConfiguration");
    const configuration: Configuration = {
      id: "cfg-sync",
      openStepId: "cameras",
      selections: catalog.initialSelections.selections,
      activeVariants: catalog.initialSelections.activeVariants,
    };
    seedLocalConfiguration(configuration);

    render(
      <BundleProvider catalog={catalog} configuration={configuration}>
        <Probe />
      </BundleProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Open plan" }));
    expect(screen.getByTestId("open-step")).toHaveTextContent("plan");
    expect(patchSpy).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(400);

    await waitFor(() => {
      expect(patchSpy).toHaveBeenCalledWith("cfg-sync", {
        selections: configuration.selections,
        activeVariants: configuration.activeVariants,
        openStepId: "plan",
      });
    });

    patchSpy.mockRestore();
  });

  it("persists snapshot when saveForLater is called", async () => {
    const configuration: Configuration = {
      id: "cfg-save",
      openStepId: "cameras",
      selections: catalog.initialSelections.selections,
      activeVariants: catalog.initialSelections.activeVariants,
    };
    seedLocalConfiguration(configuration);

    render(
      <BundleProvider catalog={catalog} configuration={configuration}>
        <Probe />
      </BundleProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Save for later" }));

    await waitFor(() => {
      expect(loadSavedSnapshot()).toEqual({
        configurationId: "cfg-save",
        openStepId: "cameras",
        selections: configuration.selections,
        activeVariants: configuration.activeVariants,
      });
    });
  });
});
