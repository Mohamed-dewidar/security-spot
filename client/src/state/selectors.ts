import { DEFAULT_VARIANT_ID, selectionKey } from "@/state/keys";
import { buildQuoteLines, calculatePreviewTotals } from "@/lib/pricing";
import type { Quote, QuoteLine } from "@/types/api";
import type { BundleConfig, Product, ReviewGroupId } from "@/types/catalog";
import type { Selections } from "@/types/configuration";
import type { BundleState } from "@/state/bundleReducer";

export function selectActiveVariantId(
  state: BundleState,
  product: Product,
): string {
  if (!product.variants?.length) {
    return DEFAULT_VARIANT_ID;
  }

  const active = state.activeVariants[product.id];
  if (active && product.variants.some((variant) => variant.id === active)) {
    return active;
  }

  return product.variants[0].id;
}

/** Card stepper quantity for the product's active variant chip. */
export function selectProductCardQuantity(
  state: BundleState,
  product: Product,
): number {
  const variantId = selectActiveVariantId(state, product);
  const key = selectionKey(product.id, variantId);
  return state.selections[key] ?? 0;
}

function productHasSelection(
  selections: Selections,
  product: Product,
): boolean {
  if (product.variants?.length) {
    return product.variants.some(
      (variant) => (selections[selectionKey(product.id, variant.id)] ?? 0) > 0,
    );
  }

  return (selections[selectionKey(product.id)] ?? 0) > 0;
}

/** Number of products in a builder step with at least one variant qty > 0. */
export function selectStepSelectedCount(
  catalog: BundleConfig,
  state: BundleState,
  stepId: string,
): number {
  const step = catalog.steps.find((item) => item.id === stepId);
  if (!step) {
    return 0;
  }

  return step.products.filter((product) =>
    productHasSelection(state.selections, product),
  ).length;
}

/** Every selection with qty > 0 as review line items (all variants, not just active chip). */
export function selectReviewLines(
  catalog: BundleConfig,
  state: BundleState,
): QuoteLine[] {
  return buildQuoteLines(catalog, state.selections);
}

export function selectReviewLinesByGroup(
  catalog: BundleConfig,
  state: BundleState,
): Record<ReviewGroupId, QuoteLine[]> {
  const grouped = Object.fromEntries(
    catalog.meta.reviewGroups.map((group) => [group.id, [] as QuoteLine[]]),
  ) as Record<ReviewGroupId, QuoteLine[]>;

  for (const line of selectReviewLines(catalog, state)) {
    grouped[line.reviewGroupId].push(line);
  }

  return grouped;
}

/** Derived order summary — never stored in reducer state. */
export function selectTotals(
  catalog: BundleConfig,
  state: BundleState,
): Omit<Quote, "configurationId"> {
  return calculatePreviewTotals(catalog, state.selections);
}
