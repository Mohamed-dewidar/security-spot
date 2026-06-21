import type { BundleConfig, Product } from "../types/catalog.js";

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
