import { beforeEach, describe, expect, it } from "vitest";
import bundle from "@/data/bundle.json";
import { NotFoundError } from "@/api/errors";
import {
  localApi,
  resetLocalApiStore,
  seedLocalConfiguration,
} from "@/api/implementations/local";
import type { BundleConfig } from "@/types/catalog";

const catalog = bundle as BundleConfig;

beforeEach(() => {
  resetLocalApiStore();
});

describe("localApi.getConfig", () => {
  it("returns the catalog seed with steps and initial selections", async () => {
    const config = await localApi.getConfig();

    expect(config.meta.currency).toBe("USD");
    expect(config.steps).toHaveLength(4);
    expect(config.initialSelections.openStepId).toBe("cameras");
    expect(config.initialSelections.selections["wyze-cam-v4:white"]).toBe(1);
  });
});

describe("localApi.createConfiguration", () => {
  it("creates a draft using catalog initial selections by default", async () => {
    const created = await localApi.createConfiguration();

    expect(created.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
    expect(created.openStepId).toBe(catalog.initialSelections.openStepId);
    expect(created.selections).toEqual(catalog.initialSelections.selections);
    expect(created.activeVariants).toEqual(
      catalog.initialSelections.activeVariants,
    );
    expect(created.savedAt).toBeUndefined();
  });

  it("merges caller overrides onto catalog defaults", async () => {
    const created = await localApi.createConfiguration({
      openStepId: "plan",
      selections: { "wyze-cam-v4:black": 3 },
      activeVariants: { "wyze-cam-v4": "black" },
    });

    expect(created.openStepId).toBe("plan");
    expect(created.selections["wyze-cam-v4:black"]).toBe(3);
    expect(created.selections["wyze-cam-v4:white"]).toBe(1);
    expect(created.activeVariants["wyze-cam-v4"]).toBe("black");
  });

  it("returns a clone that does not mutate the stored configuration", async () => {
    const created = await localApi.createConfiguration();
    created.selections["wyze-cam-v4:white"] = 99;

    const loaded = await localApi.getConfiguration(created.id);
    expect(loaded.selections["wyze-cam-v4:white"]).toBe(1);
  });
});

describe("localApi.getConfiguration", () => {
  it("throws NotFoundError for unknown ids", async () => {
    await expect(
      localApi.getConfiguration("missing-id"),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});

describe("localApi.patchConfiguration", () => {
  it("merges partial selection and variant updates", async () => {
    const created = await localApi.createConfiguration();
    const patched = await localApi.patchConfiguration(created.id, {
      openStepId: "sensors",
      selections: { "wyze-sense-motion-sensor:default": 5 },
      activeVariants: { "wyze-cam-pan-v3": "black" },
    });

    expect(patched.openStepId).toBe("sensors");
    expect(patched.selections["wyze-sense-motion-sensor:default"]).toBe(5);
    expect(patched.selections["wyze-cam-v4:white"]).toBe(1);
    expect(patched.activeVariants["wyze-cam-pan-v3"]).toBe("black");
  });
});

describe("localApi.saveConfiguration", () => {
  it("sets savedAt without changing selections", async () => {
    const created = await localApi.createConfiguration();
    const saved = await localApi.saveConfiguration(created.id);

    expect(saved.savedAt).toBeDefined();
    expect(Date.parse(saved.savedAt!)).not.toBeNaN();
    expect(saved.selections).toEqual(created.selections);
  });
});

describe("localApi.quote", () => {
  it("prices every selection with quantity greater than zero", async () => {
    seedLocalConfiguration({
      id: "cfg-quote",
      openStepId: "cameras",
      selections: {
        "wyze-cam-v4:white": 1,
        "wyze-cam-pan-v3:white": 2,
        "cam-unlimited:default": 1,
      },
      activeVariants: {},
    });

    const quote = await localApi.quote("cfg-quote");

    expect(quote.configurationId).toBe("cfg-quote");
    expect(quote.currency).toBe("USD");
    expect(quote.lines).toHaveLength(3);
    expect(
      quote.lines.find((line) => line.productId === "wyze-cam-v4"),
    ).toEqual(
      expect.objectContaining({
        quantity: 1,
        unitPrice: 27.98,
        lineTotal: 27.98,
        variantLabel: "White",
      }),
    );
    const panLine = quote.lines.find(
      (line) => line.productId === "wyze-cam-pan-v3",
    );
    expect(panLine?.lineTotal).toBeCloseTo(69.96);
    expect(quote.shipping).toBe(catalog.meta.shipping.price);
    expect(quote.total).toBeCloseTo(quote.subtotal + quote.shipping);
    expect(quote.savingsMessage).toBe(catalog.meta.savingsMessage);
  });

  it("ignores zero-quantity selections", async () => {
    seedLocalConfiguration({
      id: "cfg-empty",
      openStepId: "cameras",
      selections: { "wyze-cam-v4:white": 0 },
      activeVariants: {},
    });

    const quote = await localApi.quote("cfg-empty");
    expect(quote.lines).toHaveLength(0);
    expect(quote.subtotal).toBe(0);
  });
});

describe("localApi.checkout", () => {
  it("returns an order id and authoritative quote snapshot", async () => {
    seedLocalConfiguration({
      id: "cfg-checkout",
      openStepId: "cameras",
      selections: { "wyze-cam-v4:white": 1 },
      activeVariants: {},
    });

    const result = await localApi.checkout("cfg-checkout");

    expect(result.configurationId).toBe("cfg-checkout");
    expect(result.orderId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
    expect(result.quote.lines).toHaveLength(1);
    expect(result.quote.total).toBeCloseTo(27.98);
  });
});

describe("api client switch", () => {
  it("defaults to the local implementation when VITE_USE_API is false", async () => {
    const { api } = await import("@/api/client");

    const config = await api.getConfig();
    expect(config.steps).toHaveLength(4);
  });
});
