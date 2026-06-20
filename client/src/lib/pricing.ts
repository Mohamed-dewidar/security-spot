import { parseSelectionKey } from "@/state/keys";
import type { Quote, QuoteLine } from "@/types/api";
import type { BundleConfig, Product } from "@/types/catalog";
import type { Selections } from "@/types/configuration";

/** Looks up a product across all builder steps in the catalog. */
export function findProductInCatalog(
  catalog: BundleConfig,
  productId: string,
): Product | undefined {
  for (const step of catalog.steps) {
    const product = step.products.find((item) => item.id === productId);
    if (product) {
      return product;
    }
  }
  return undefined;
}

/**
 * Builds review/quote line items from selections.
 * Mirrors authoritative pricing in `localApi.buildQuote` for client preview.
 */
export function buildQuoteLines(
  catalog: BundleConfig,
  selections: Selections,
): QuoteLine[] {
  const lines: QuoteLine[] = [];

  for (const [key, quantity] of Object.entries(selections)) {
    if (quantity <= 0) {
      continue;
    }

    const { productId, variantId } = parseSelectionKey(key);
    const product = findProductInCatalog(catalog, productId);
    if (!product) {
      continue;
    }

    const variant = product.variants?.find((item) => item.id === variantId);
    const unitPrice = product.price;
    const compareAtUnitPrice = product.compareAtPrice;
    const lineTotal = unitPrice * quantity;
    const compareAtLineTotal = compareAtUnitPrice
      ? compareAtUnitPrice * quantity
      : lineTotal;

    lines.push({
      selectionKey: key,
      productId,
      variantId,
      title: product.title,
      variantLabel: variant?.label,
      quantity,
      unitPrice,
      compareAtUnitPrice,
      lineTotal,
      compareAtLineTotal,
      reviewGroupId: product.reviewGroupId,
      pricingUnit: product.pricingUnit,
    });
  }

  return lines;
}

/**
 * Client-side preview totals while editing. Server quote/checkout remain authoritative.
 */
export function calculatePreviewTotals(
  catalog: BundleConfig,
  selections: Selections,
): Omit<Quote, "configurationId"> {
  const lines = buildQuoteLines(catalog, selections);
  const subtotal = lines.reduce((sum, line) => sum + line.lineTotal, 0);
  const compareAtSubtotal =
    lines.reduce(
      (sum, line) => sum + (line.compareAtLineTotal ?? line.lineTotal),
      0,
    ) + (catalog.meta.shipping.compareAtPrice ?? catalog.meta.shipping.price);
  const savings = Math.max(
    0,
    compareAtSubtotal - subtotal - catalog.meta.shipping.price,
  );
  const total = subtotal + catalog.meta.shipping.price;

  return {
    currency: catalog.meta.currency,
    lines,
    subtotal,
    compareAtSubtotal,
    savings,
    shipping: catalog.meta.shipping.price,
    shippingCompareAt: catalog.meta.shipping.compareAtPrice,
    total,
    savingsMessage: catalog.meta.savingsMessage,
  };
}
