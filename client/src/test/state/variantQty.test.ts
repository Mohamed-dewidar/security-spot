import { describe, expect, it } from "vitest";
import bundle from "@/data/bundle.json";
import { calculatePreviewTotals } from "@/lib/pricing";
import {
  bundleReducer,
  createInitialState,
  type BundleState,
} from "@/state/bundleReducer";
import { selectionKey } from "@/state/keys";
import {
  selectProductCardQuantity,
  selectProductMinQuantity,
  selectReviewLines,
  selectStepSelectedCount,
  selectTotals,
} from "@/state/selectors";
import type { BundleConfig, Product } from "@/types/catalog";

const catalog = bundle as BundleConfig;

function findProduct(productId: string): Product {
  for (const step of catalog.steps) {
    const product = step.products.find((item) => item.id === productId);
    if (product) {
      return product;
    }
  }
  throw new Error(`Product not found: ${productId}`);
}

function reduceFromInitial(
  ...actions: Parameters<typeof bundleReducer>[2][]
): BundleState {
  let state = createInitialState(catalog, catalog.initialSelections);
  for (const action of actions) {
    state = bundleReducer(catalog, state, action);
  }
  return state;
}

describe("bundleReducer", () => {
  it("hydrates selections, active variants, and open step", () => {
    const state = bundleReducer(
      catalog,
      createInitialState(catalog, catalog.initialSelections),
      {
        type: "HYDRATE",
        payload: {
          openStepId: "plan",
          selections: { "wyze-cam-v4:black": 3 },
          activeVariants: { "wyze-cam-v4": "black" },
        },
      },
    );

    expect(state.openStepId).toBe("plan");
    expect(state.selections).toEqual({ "wyze-cam-v4:black": 3 });
    expect(state.activeVariants).toEqual({ "wyze-cam-v4": "black" });
  });

  it("removes selection keys when quantity drops to zero", () => {
    const state = reduceFromInitial({
      type: "SET_QUANTITY",
      productId: "wyze-cam-v4",
      variantId: "white",
      quantity: 0,
    });

    expect(state.selections["wyze-cam-v4:white"]).toBeUndefined();
  });

  it("uses active variant when SET_QUANTITY omits variantId", () => {
    const state = reduceFromInitial(
      {
        type: "SET_ACTIVE_VARIANT",
        productId: "wyze-cam-v4",
        variantId: "grey",
      },
      { type: "SET_QUANTITY", productId: "wyze-cam-v4", quantity: 4 },
    );

    expect(state.selections["wyze-cam-v4:grey"]).toBe(4);
    expect(state.selections["wyze-cam-v4:white"]).toBe(1);
  });

  it("removes the hub when the last motion sensor is cleared", () => {
    const state = reduceFromInitial({
      type: "SET_QUANTITY",
      productId: "wyze-sense-motion-sensor",
      quantity: 0,
    });

    expect(
      state.selections[selectionKey("wyze-sense-motion-sensor")],
    ).toBeUndefined();
    expect(state.selections[selectionKey("wyze-sense-hub")]).toBeUndefined();
  });
});

describe("variant quantity rules", () => {
  const wyzeCamV4 = findProduct("wyze-cam-v4");
  const doorbell = findProduct("wyze-duo-cam-doorbell");
  const hub = findProduct("wyze-sense-hub");

  it("card stepper qty reflects the active variant only", () => {
    const state = createInitialState(catalog, catalog.initialSelections);

    expect(selectProductCardQuantity(state, wyzeCamV4)).toBe(1);

    const updated = reduceFromInitial({
      type: "SET_QUANTITY",
      productId: "wyze-cam-v4",
      variantId: "black",
      quantity: 2,
    });

    expect(selectProductCardQuantity(updated, wyzeCamV4)).toBe(1);
    expect(updated.selections["wyze-cam-v4:black"]).toBe(2);
  });

  it("switching chip shows that variant's count", () => {
    let state = reduceFromInitial(
      {
        type: "SET_QUANTITY",
        productId: "wyze-cam-v4",
        variantId: "white",
        quantity: 1,
      },
      {
        type: "SET_QUANTITY",
        productId: "wyze-cam-v4",
        variantId: "black",
        quantity: 3,
      },
    );

    expect(selectProductCardQuantity(state, wyzeCamV4)).toBe(1);

    state = bundleReducer(catalog, state, {
      type: "SET_ACTIVE_VARIANT",
      productId: "wyze-cam-v4",
      variantId: "black",
    });

    expect(selectProductCardQuantity(state, wyzeCamV4)).toBe(3);

    state = bundleReducer(catalog, state, {
      type: "SET_ACTIVE_VARIANT",
      productId: "wyze-cam-v4",
      variantId: "grey",
    });

    expect(selectProductCardQuantity(state, wyzeCamV4)).toBe(0);
  });

  it("review lists every variant with qty > 0", () => {
    const state = reduceFromInitial(
      {
        type: "SET_QUANTITY",
        productId: "wyze-cam-v4",
        variantId: "white",
        quantity: 1,
      },
      {
        type: "SET_QUANTITY",
        productId: "wyze-cam-v4",
        variantId: "black",
        quantity: 2,
      },
      {
        type: "SET_ACTIVE_VARIANT",
        productId: "wyze-cam-v4",
        variantId: "black",
      },
    );

    const lines = selectReviewLines(catalog, state);
    const wyzeLines = lines.filter((line) => line.productId === "wyze-cam-v4");

    expect(wyzeLines).toHaveLength(2);
    expect(wyzeLines).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ variantId: "white", quantity: 1 }),
        expect.objectContaining({ variantId: "black", quantity: 2 }),
      ]),
    );
  });

  it("uses productId:default for products without variants", () => {
    const state = reduceFromInitial({
      type: "SET_QUANTITY",
      productId: "wyze-duo-cam-doorbell",
      quantity: 2,
    });

    expect(state.selections[selectionKey("wyze-duo-cam-doorbell")]).toBe(2);
    expect(selectProductCardQuantity(state, doorbell)).toBe(2);

    const lines = selectReviewLines(catalog, state);
    expect(lines).toContainEqual(
      expect.objectContaining({
        productId: "wyze-duo-cam-doorbell",
        variantId: "default",
        quantity: 2,
      }),
    );
  });

  it("does not store totals in reducer state", () => {
    const state = reduceFromInitial({
      type: "SET_QUANTITY",
      productId: "wyze-cam-v4",
      variantId: "white",
      quantity: 5,
    });

    expect(state).toEqual({
      openStepId: catalog.initialSelections.openStepId,
      selections: expect.any(Object),
      activeVariants: expect.any(Object),
    });
    expect("subtotal" in state).toBe(false);
    expect("total" in state).toBe(false);

    const totals = selectTotals(catalog, state);
    expect(totals.subtotal).toBeGreaterThan(0);
    expect(totals.total).toBeGreaterThan(totals.subtotal - 1);
  });

  it("derives min quantity for hub while motion sensor is selected", () => {
    const state = createInitialState(catalog, catalog.initialSelections);

    expect(selectProductMinQuantity(catalog, state, hub)).toBe(1);
  });
});

describe("selectStepSelectedCount", () => {
  it("counts products with any variant qty > 0 in a step", () => {
    const state = createInitialState(catalog, catalog.initialSelections);

    expect(selectStepSelectedCount(catalog, state, "cameras")).toBe(2);
    expect(selectStepSelectedCount(catalog, state, "plan")).toBe(1);
    expect(selectStepSelectedCount(catalog, state, "sensors")).toBe(2);
  });
});

describe("calculatePreviewTotals", () => {
  it("matches local API quote math for the Figma seed selections", () => {
    const preview = calculatePreviewTotals(
      catalog,
      catalog.initialSelections.selections,
    );

    expect(preview.lines.length).toBeGreaterThan(0);
    expect(preview.shipping).toBe(catalog.meta.shipping.price);
    expect(preview.total).toBe(preview.subtotal + preview.shipping);
    expect(preview.savings).toBe(
      Math.max(
        0,
        preview.compareAtSubtotal - preview.subtotal - preview.shipping,
      ),
    );
  });
});
