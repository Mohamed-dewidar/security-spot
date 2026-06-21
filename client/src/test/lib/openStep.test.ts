import { describe, expect, it } from "vitest";
import bundle from "@/data/bundle.json";
import { resolveOpenStepId } from "@/lib/openStep";
import { createInitialState } from "@/state/bundleReducer";
import type { BundleConfig } from "@/types/catalog";

const catalog = bundle as BundleConfig;

describe("resolveOpenStepId", () => {
  it("defaults empty open step to cameras", () => {
    expect(resolveOpenStepId(catalog, "")).toBe("cameras");
    expect(resolveOpenStepId(catalog, "   ")).toBe("cameras");
    expect(resolveOpenStepId(catalog, undefined)).toBe("cameras");
  });

  it("keeps a valid non-default step id", () => {
    expect(resolveOpenStepId(catalog, "plan")).toBe("plan");
  });

  it("falls back when step id is unknown", () => {
    expect(resolveOpenStepId(catalog, "missing-step")).toBe("cameras");
  });
});

describe("createInitialState open step", () => {
  it("opens cameras when configuration has an empty openStepId", () => {
    const state = createInitialState(catalog, {
      ...catalog.initialSelections,
      openStepId: "",
    });

    expect(state.openStepId).toBe("cameras");
  });
});
