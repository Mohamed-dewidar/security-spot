export const DEFAULT_VARIANT_ID = "default";

/** Builds the reducer/storage key for a product variant quantity. */
export function selectionKey(productId: string, variantId?: string): string {
  const suffix = variantId ?? DEFAULT_VARIANT_ID;
  return `${productId}:${suffix}`;
}

export function parseSelectionKey(key: string): {
  productId: string;
  variantId: string;
} {
  const separatorIndex = key.lastIndexOf(":");
  if (separatorIndex === -1) {
    return { productId: key, variantId: DEFAULT_VARIANT_ID };
  }

  return {
    productId: key.slice(0, separatorIndex),
    variantId: key.slice(separatorIndex + 1),
  };
}
