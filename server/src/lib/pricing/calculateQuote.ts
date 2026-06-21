import { findProductInCatalog } from "../findProductInCatalog.js";
import { parseSelectionKey } from "../selectionKeys.js";
import type { Quote, QuoteLine } from "../../types/api.js";
import type { BundleConfig } from "../../types/catalog.js";
import type { Configuration } from "../../types/configuration.js";

/**
 * Computes an authoritative {@link Quote} for a stored configuration.
 * Resolves every price from the catalog, not from client-sent amounts.
 */
export function calculateQuote(
  catalog: BundleConfig,
  config: Configuration,
): Quote {
  const lines: QuoteLine[] = [];

  for (const [key, quantity] of Object.entries(config.selections)) {
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
    configurationId: config.id,
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
