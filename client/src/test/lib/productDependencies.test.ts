import { describe, expect, it } from "vitest";
import bundle from "@/data/bundle.json";
import {
  applySetQuantity,
  countDependents,
  isProductLockedByDependency,
  normalizeSelections,
  selectMinQuantity,
} from "@/lib/productDependencies";
import { selectionKey } from "@/state/keys";
import type { BundleConfig } from "@/types/catalog";

const catalog = bundle as BundleConfig;

describe("productDependencies", () => {
  it("auto-adds required products when a dependent is selected", () => {
    const selections = applySetQuantity(
      catalog,
      {},
      "wyze-sense-motion-sensor",
      undefined,
      1,
    );

    expect(selections[selectionKey("wyze-sense-motion-sensor")]).toBe(1);
    expect(selections[selectionKey("wyze-sense-hub")]).toBe(1);
  });

  it("removes required products when the last dependent is cleared", () => {
    const initial = normalizeSelections(catalog, {
      [selectionKey("wyze-sense-motion-sensor")]: 2,
      [selectionKey("wyze-sense-hub")]: 1,
    });

    const selections = applySetQuantity(
      catalog,
      initial,
      "wyze-sense-motion-sensor",
      undefined,
      0,
    );

    expect(
      selections[selectionKey("wyze-sense-motion-sensor")],
    ).toBeUndefined();
    expect(selections[selectionKey("wyze-sense-hub")]).toBeUndefined();
  });

  it("locks required products while a dependent remains selected", () => {
    const selections = normalizeSelections(catalog, {
      [selectionKey("wyze-sense-motion-sensor")]: 1,
      [selectionKey("wyze-sense-hub")]: 1,
    });

    expect(
      isProductLockedByDependency(catalog, selections, "wyze-sense-hub"),
    ).toBe(true);
    expect(selectMinQuantity(catalog, selections, "wyze-sense-hub", 1)).toBe(1);

    const blocked = applySetQuantity(
      catalog,
      selections,
      "wyze-sense-hub",
      undefined,
      0,
    );

    expect(blocked[selectionKey("wyze-sense-hub")]).toBe(1);
  });

  it("allows removing a required product after the last dependent is gone", () => {
    const afterSensorRemoved = applySetQuantity(
      catalog,
      normalizeSelections(catalog, {
        [selectionKey("wyze-sense-motion-sensor")]: 1,
        [selectionKey("wyze-sense-hub")]: 1,
      }),
      "wyze-sense-motion-sensor",
      undefined,
      0,
    );

    expect(countDependents(catalog, afterSensorRemoved, "wyze-sense-hub")).toBe(
      0,
    );
    expect(afterSensorRemoved[selectionKey("wyze-sense-hub")]).toBeUndefined();
  });

  it("normalizes selections by ensuring required companions on boot", () => {
    const selections = normalizeSelections(catalog, {
      [selectionKey("wyze-sense-motion-sensor")]: 1,
    });

    expect(selections[selectionKey("wyze-sense-hub")]).toBe(1);
  });
});
