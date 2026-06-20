import { beforeEach, describe, expect, it } from "vitest";
import bundle from "@/data/bundle.json";
import {
  localApi,
  resetLocalApiStore,
  seedLocalConfiguration,
} from "@/api/implementations/local";
import { clearSavedSnapshot, saveSnapshot } from "@/lib/storage";
import { bootBundleConfiguration } from "@/state/bootBundle";
import type { BundleConfig } from "@/types/catalog";

const catalog = bundle as BundleConfig;

beforeEach(() => {
  resetLocalApiStore();
  clearSavedSnapshot();
});

describe("bootBundleConfiguration", () => {
  it("creates a fresh draft when no snapshot exists", async () => {
    const result = await bootBundleConfiguration();

    expect(result.catalog.steps).toHaveLength(4);
    expect(result.configuration.openStepId).toBe(
      catalog.initialSelections.openStepId,
    );
    expect(result.configuration.selections).toEqual(
      catalog.initialSelections.selections,
    );
  });

  it("loads an existing configuration when snapshot id is valid", async () => {
    const created = await localApi.createConfiguration({
      openStepId: "plan",
      selections: { "wyze-cam-v4:black": 4 },
      activeVariants: { "wyze-cam-v4": "black" },
    });

    saveSnapshot({
      configurationId: created.id,
      openStepId: created.openStepId,
      selections: created.selections,
      activeVariants: created.activeVariants,
    });

    const result = await bootBundleConfiguration();

    expect(result.configuration.id).toBe(created.id);
    expect(result.configuration.openStepId).toBe("plan");
    expect(result.configuration.selections["wyze-cam-v4:black"]).toBe(4);
  });

  it("creates a draft from snapshot when stored configuration id is stale", async () => {
    saveSnapshot({
      configurationId: "missing-id",
      openStepId: "sensors",
      selections: { "wyze-sense-motion-sensor:default": 3 },
      activeVariants: { "wyze-cam-v4": "grey" },
    });

    const result = await bootBundleConfiguration();

    expect(result.configuration.id).not.toBe("missing-id");
    expect(result.configuration.openStepId).toBe("sensors");
    expect(
      result.configuration.selections["wyze-sense-motion-sensor:default"],
    ).toBe(3);
    expect(result.configuration.activeVariants["wyze-cam-v4"]).toBe("grey");
  });

  it("creates a draft from snapshot without configuration id", async () => {
    saveSnapshot({
      openStepId: "extra",
      selections: { "wyze-lock:default": 1 },
      activeVariants: {},
    });

    const result = await bootBundleConfiguration();

    expect(result.configuration.openStepId).toBe("extra");
    expect(result.configuration.selections["wyze-lock:default"]).toBe(1);
  });

  it("prefers server configuration over stale snapshot fields when id is valid", async () => {
    const created = await localApi.createConfiguration({
      openStepId: "plan",
      selections: { "wyze-cam-v4:black": 2 },
      activeVariants: { "wyze-cam-v4": "black" },
    });

    seedLocalConfiguration({
      ...created,
      openStepId: "sensors",
      selections: { "wyze-sense-motion-sensor:default": 9 },
      activeVariants: {},
    });

    saveSnapshot({
      configurationId: created.id,
      openStepId: "cameras",
      selections: { "wyze-cam-v4:white": 1 },
      activeVariants: { "wyze-cam-v4": "white" },
    });

    const result = await bootBundleConfiguration();

    expect(result.configuration.id).toBe(created.id);
    expect(result.configuration.openStepId).toBe("sensors");
    expect(
      result.configuration.selections["wyze-sense-motion-sensor:default"],
    ).toBe(9);
  });
});
