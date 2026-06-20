import { describe, expect, it } from "vitest";
import bundle from "@/data/bundle.json";
import type { BundleConfig } from "@/types/catalog";
import {
  DEFAULT_VARIANT_ID,
  parseSelectionKey,
  selectionKey,
} from "@/state/keys";

describe("selectionKey", () => {
  it("uses default suffix when variant is omitted", () => {
    expect(selectionKey("wyze-duo-cam-doorbell")).toBe(
      "wyze-duo-cam-doorbell:default",
    );
  });

  it("joins product and variant ids", () => {
    expect(selectionKey("wyze-cam-v4", "white")).toBe("wyze-cam-v4:white");
  });
});

describe("parseSelectionKey", () => {
  it("round-trips keys built with selectionKey", () => {
    const key = selectionKey("wyze-cam-pan-v3", "black");
    expect(parseSelectionKey(key)).toEqual({
      productId: "wyze-cam-pan-v3",
      variantId: "black",
    });
  });

  it("falls back to default when no variant segment exists", () => {
    expect(parseSelectionKey("legacy-product")).toEqual({
      productId: "legacy-product",
      variantId: DEFAULT_VARIANT_ID,
    });
  });
});

describe("bundle.json", () => {
  const config = bundle as BundleConfig;

  it("defines four builder steps from Figma desktop seed", () => {
    expect(config.steps).toHaveLength(4);
    expect(config.steps.map((step) => step.id)).toEqual([
      "cameras",
      "plan",
      "sensors",
      "extra-protection",
    ]);
  });

  it("seeds step 1 open with two camera products selected", () => {
    expect(config.initialSelections.openStepId).toBe("cameras");
    expect(config.initialSelections.selections["wyze-cam-v4:white"]).toBe(1);
    expect(config.initialSelections.selections["wyze-cam-pan-v3:white"]).toBe(
      2,
    );
  });

  it("pre-populates plan, sensors, and accessories in initial selections", () => {
    expect(config.initialSelections.selections["cam-unlimited:default"]).toBe(
      1,
    );
    expect(
      config.initialSelections.selections["wyze-sense-motion-sensor:default"],
    ).toBe(2);
    expect(config.initialSelections.selections["wyze-sense-hub:default"]).toBe(
      1,
    );
    expect(
      config.initialSelections.selections["wyze-microsd-card-256gb:default"],
    ).toBe(2);
  });

  it("tracks active variant chips for multi-variant camera products", () => {
    expect(config.initialSelections.activeVariants["wyze-cam-v4"]).toBe(
      "white",
    );
    expect(config.initialSelections.activeVariants["wyze-cam-pan-v3"]).toBe(
      "white",
    );
  });

  it("includes review panel meta from the design", () => {
    expect(config.meta.reviewPanelTitle).toBe("Your security system");
    expect(config.meta.shipping.label).toBe("Fast Shipping");
    expect(config.meta.financing.label).toBe("as low as $19.19/mo");
  });
});
