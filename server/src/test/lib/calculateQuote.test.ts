import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { getBundleConfig } from "../../db/catalog.js";
import { closeDb, createMemoryDatabase, getDb, setDb } from "../../db/index.js";
import { calculateQuote } from "../../lib/pricing/calculateQuote.js";
import type { BundleConfig } from "../../types/catalog.js";
import type { Configuration } from "../../types/configuration.js";

let catalog: BundleConfig;

function makeConfig(
  overrides: Partial<Configuration> & Pick<Configuration, "id">,
): Configuration {
  return {
    openStepId: "cameras",
    selections: {},
    activeVariants: {},
    ...overrides,
  };
}

describe("calculateQuote", () => {
  beforeEach(() => {
    setDb(createMemoryDatabase());
    catalog = getBundleConfig(getDb());
  });

  afterEach(() => {
    closeDb();
  });

  it("prices every selection with quantity greater than zero", () => {
    const quote = calculateQuote(
      catalog,
      makeConfig({
        id: "cfg-quote",
        selections: {
          "wyze-cam-v4:white": 1,
          "wyze-cam-pan-v3:white": 2,
          "cam-unlimited:default": 1,
        },
      }),
    );

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

  it("ignores zero-quantity selections", () => {
    const quote = calculateQuote(
      catalog,
      makeConfig({
        id: "cfg-empty",
        selections: { "wyze-cam-v4:white": 0 },
      }),
    );

    expect(quote.lines).toHaveLength(0);
    expect(quote.subtotal).toBe(0);
  });

  it("includes shipping in total and compare-at subtotal", () => {
    const quote = calculateQuote(
      catalog,
      makeConfig({
        id: "cfg-shipping",
        selections: { "wyze-cam-v4:white": 1 },
      }),
    );

    expect(quote.shipping).toBe(0);
    expect(quote.shippingCompareAt).toBe(catalog.meta.shipping.compareAtPrice);
    expect(quote.total).toBeCloseTo(27.98);
    expect(quote.compareAtSubtotal).toBeCloseTo(35.98 + 5.99);
  });

  it("computes savings from compare-at line totals", () => {
    const quote = calculateQuote(
      catalog,
      makeConfig({
        id: "cfg-savings",
        selections: { "wyze-cam-v4:white": 1 },
      }),
    );

    expect(quote.savings).toBeCloseTo(35.98 + 5.99 - 27.98);
  });
});
