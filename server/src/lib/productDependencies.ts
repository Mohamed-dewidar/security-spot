import { findProductInCatalog } from "./findProductInCatalog.js";
import { selectionKey } from "./selectionKeys.js";
import type { BundleConfig, Product } from "../types/catalog.js";
import type { Selections } from "../types/configuration.js";

/** True when the product has at least one variant line with qty > 0. */
export function productHasAnySelection(
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

/** Product ids with any selection qty > 0 in the catalog. */
export function getSelectedProductIds(
  catalog: BundleConfig,
  selections: Selections,
): Set<string> {
  const ids = new Set<string>();

  for (const step of catalog.steps) {
    for (const product of step.products) {
      if (productHasAnySelection(selections, product)) {
        ids.add(product.id);
      }
    }
  }

  return ids;
}

/**
 * How many currently selected products list `requiredProductId` in their
 * `requires` array. Used to decide when auto-added products can be removed.
 */
export function countDependents(
  catalog: BundleConfig,
  selections: Selections,
  requiredProductId: string,
): number {
  let count = 0;
  const selectedIds = getSelectedProductIds(catalog, selections);

  for (const step of catalog.steps) {
    for (const product of step.products) {
      if (!selectedIds.has(product.id)) {
        continue;
      }
      if (product.requires?.includes(requiredProductId)) {
        count += 1;
      }
    }
  }

  return count;
}

/** Derived lock — another selected product still requires this one. */
export function isProductLockedByDependency(
  catalog: BundleConfig,
  selections: Selections,
  productId: string,
): boolean {
  return countDependents(catalog, selections, productId) > 0;
}

/** Stepper floor while the product remains selected and locked. */
export function selectMinQuantity(
  catalog: BundleConfig,
  selections: Selections,
  productId: string,
  currentQuantity: number,
): number {
  if (currentQuantity <= 0) {
    return 0;
  }

  return isProductLockedByDependency(catalog, selections, productId) ? 1 : 0;
}

function defaultVariantId(product: Product): string | undefined {
  if (!product.variants?.length) {
    return undefined;
  }

  return product.variants[0].id;
}

function setProductQuantity(
  selections: Selections,
  productId: string,
  variantId: string | undefined,
  quantity: number,
): Selections {
  const key = selectionKey(productId, variantId);
  const next = { ...selections };

  if (quantity <= 0) {
    delete next[key];
  } else {
    next[key] = quantity;
  }

  return next;
}

function clearAllProductSelections(
  catalog: BundleConfig,
  selections: Selections,
  productId: string,
): Selections {
  const product = findProductInCatalog(catalog, productId);
  if (!product) {
    return selections;
  }

  const next = { ...selections };

  if (product.variants?.length) {
    for (const variant of product.variants) {
      delete next[selectionKey(productId, variant.id)];
    }
  } else {
    delete next[selectionKey(productId)];
  }

  return next;
}

function ensureRequiredProducts(
  catalog: BundleConfig,
  selections: Selections,
  productId: string,
): Selections {
  const product = findProductInCatalog(catalog, productId);
  if (!product?.requires?.length) {
    return selections;
  }

  let next = selections;

  for (const requiredId of product.requires) {
    const requiredProduct = findProductInCatalog(catalog, requiredId);
    if (!requiredProduct || productHasAnySelection(next, requiredProduct)) {
      continue;
    }

    next = setProductQuantity(
      next,
      requiredId,
      defaultVariantId(requiredProduct),
      1,
    );
    next = ensureRequiredProducts(catalog, next, requiredId);
  }

  return next;
}

function removeUnneededRequiredProducts(
  catalog: BundleConfig,
  selections: Selections,
  requiredIds: string[],
): Selections {
  let next = selections;

  for (const requiredId of requiredIds) {
    if (countDependents(catalog, next, requiredId) > 0) {
      continue;
    }

    next = clearAllProductSelections(catalog, next, requiredId);

    const requiredProduct = findProductInCatalog(catalog, requiredId);
    if (requiredProduct?.requires?.length) {
      next = removeUnneededRequiredProducts(
        catalog,
        next,
        requiredProduct.requires,
      );
    }
  }

  return next;
}

/**
 * Applies a single quantity change with product dependency rules:
 * - Selecting a product auto-adds its `requires` at qty 1
 * - Removing the last dependent removes auto-required products
 * - Locked products cannot drop below qty 1
 */
export function applySetQuantity(
  catalog: BundleConfig,
  selections: Selections,
  productId: string,
  variantId: string | undefined,
  quantity: number,
): Selections {
  const product = findProductInCatalog(catalog, productId);
  if (!product) {
    return selections;
  }

  const requested = Math.max(0, quantity);

  if (
    requested === 0 &&
    isProductLockedByDependency(catalog, selections, productId)
  ) {
    return setProductQuantity(selections, productId, variantId, 1);
  }

  let next = setProductQuantity(selections, productId, variantId, requested);

  if (requested > 0) {
    next = ensureRequiredProducts(catalog, next, productId);
    return next;
  }

  if (product.requires?.length) {
    next = removeUnneededRequiredProducts(catalog, next, product.requires);
  }

  return next;
}

/** Ensures required companions exist for boot, hydrate, and API create/patch. */
export function normalizeSelections(
  catalog: BundleConfig,
  selections: Selections,
): Selections {
  let next = { ...selections };

  for (const [key, quantity] of Object.entries(next)) {
    if (quantity <= 0) {
      delete next[key];
    }
  }

  for (const step of catalog.steps) {
    for (const product of step.products) {
      if (productHasAnySelection(next, product)) {
        next = ensureRequiredProducts(catalog, next, product.id);
      }
    }
  }

  return next;
}
