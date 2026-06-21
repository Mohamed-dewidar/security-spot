import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it } from "vitest";
import type { BundleConfig } from "../../types/catalog.js";
import type { Configuration } from "../../types/configuration.js";
import { getBundleConfig } from "../../db/catalog.js";
import {
  getConfiguration,
  insertConfiguration,
  setConfigurationSavedAt,
  updateConfiguration,
} from "../../db/configurations.js";
import { closeDb, createMemoryDatabase } from "../../db/index.js";
import { seedCatalog } from "../../db/seed.js";

const bundleJson = JSON.parse(
  readFileSync(
    join(dirname(fileURLToPath(import.meta.url)), "../../../data/bundle.json"),
    "utf8",
  ),
) as BundleConfig;

afterEach(() => {
  closeDb();
});

describe("seed + getBundleConfig", () => {
  it("assembles catalog matching bundle.json", () => {
    const db = createMemoryDatabase();
    const config = getBundleConfig(db);

    expect(config.meta.currency).toBe(bundleJson.meta.currency);
    expect(config.meta.reviewPanelTitle).toBe(bundleJson.meta.reviewPanelTitle);
    expect(config.meta.reviewGroups).toEqual(bundleJson.meta.reviewGroups);
    expect(config.meta.shipping).toEqual(bundleJson.meta.shipping);
    expect(config.steps).toHaveLength(bundleJson.steps.length);

    for (let i = 0; i < bundleJson.steps.length; i++) {
      expect(config.steps[i]?.id).toBe(bundleJson.steps[i]?.id);
      expect(config.steps[i]?.products).toHaveLength(
        bundleJson.steps[i]?.products.length ?? 0,
      );
    }

    expect(config.initialSelections).toEqual(bundleJson.initialSelections);
  });

  it("does not re-seed when catalog already exists", () => {
    const db = createMemoryDatabase();
    db.prepare("UPDATE products SET title = ? WHERE id = ?").run(
      "Mutated title",
      "wyze-cam-v4",
    );

    seedCatalog(db);

    const product = db
      .prepare("SELECT title FROM products WHERE id = ?")
      .get("wyze-cam-v4") as { title: string };

    expect(product.title).toBe("Mutated title");
  });
});

describe("configuration accessors", () => {
  it("round-trips configuration rows", () => {
    const db = createMemoryDatabase();
    const config: Configuration = {
      id: "cfg-1",
      openStepId: "cameras",
      selections: {
        "wyze-cam-v4:white": 1,
        "wyze-cam-pan-v3:white": 2,
      },
      activeVariants: {
        "wyze-cam-v4": "white",
        "wyze-cam-pan-v3": "white",
      },
    };

    insertConfiguration(db, config);
    expect(getConfiguration(db, "cfg-1")).toEqual(config);
  });

  it("updates selections and active variants", () => {
    const db = createMemoryDatabase();
    const initial: Configuration = {
      id: "cfg-2",
      openStepId: "cameras",
      selections: { "wyze-cam-v4:white": 1 },
      activeVariants: { "wyze-cam-v4": "white" },
    };

    insertConfiguration(db, initial);

    const updated: Configuration = {
      ...initial,
      openStepId: "plan",
      selections: {
        "wyze-cam-v4:white": 1,
        "wyze-cam-v4:black": 2,
      },
      activeVariants: { "wyze-cam-v4": "black" },
    };

    updateConfiguration(db, updated);
    expect(getConfiguration(db, "cfg-2")).toEqual(updated);
  });

  it("sets savedAt without dropping selections", () => {
    const db = createMemoryDatabase();
    const config: Configuration = {
      id: "cfg-3",
      openStepId: "cameras",
      selections: { "wyze-cam-v4:white": 1 },
      activeVariants: {},
    };

    insertConfiguration(db, config);
    const saved = setConfigurationSavedAt(
      db,
      "cfg-3",
      "2026-06-21T12:00:00.000Z",
    );

    expect(saved).toEqual({
      ...config,
      savedAt: "2026-06-21T12:00:00.000Z",
    });
  });

  it("returns null for unknown configuration ids", () => {
    const db = createMemoryDatabase();
    expect(getConfiguration(db, "missing")).toBeNull();
    expect(
      setConfigurationSavedAt(db, "missing", "2026-06-21T12:00:00.000Z"),
    ).toBeNull();
  });
});
