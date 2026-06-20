import bundleData from "@/data/bundle.json";
import { NotFoundError } from "@/api/errors";
import type { BundleApi } from "@/api/types";
import { parseSelectionKey } from "@/state/keys";
import type { BundleConfig, Product } from "@/types/catalog";
import type { CheckoutResult, Quote, QuoteLine } from "@/types/api";
import type {
  ActiveVariants,
  Configuration,
  ConfigurationPatch,
  CreateConfigurationInput,
  Selections,
} from "@/types/configuration";

const catalog = bundleData as BundleConfig;

const configurations = new Map<string, Configuration>();

/** Generates a unique id for configurations and checkout order drafts. */
function createId(): string {
  return crypto.randomUUID();
}

/** Returns a shallow copy so callers cannot mutate the in-memory store. */
function cloneConfiguration(config: Configuration): Configuration {
  return {
    ...config,
    selections: { ...config.selections },
    activeVariants: { ...config.activeVariants },
  };
}

/** Loads a stored configuration or throws {@link NotFoundError}. */
function getConfigurationOrThrow(id: string): Configuration {
  const config = configurations.get(id);
  if (!config) {
    throw new NotFoundError(`Configuration not found: ${id}`);
  }
  return config;
}

/** Looks up a product across all builder steps in the catalog seed. */
function findProduct(productId: string): Product | undefined {
  for (const step of catalog.steps) {
    const product = step.products.find((item) => item.id === productId);
    if (product) {
      return product;
    }
  }
  return undefined;
}

/**
 * Computes an authoritative {@link Quote} for a stored configuration.
 *
 * Used by `localApi.quote` and `localApi.checkout`. Resolves every price from
 * the catalog, not from client reducer state or amounts shown in the review panel.
 *
 * Line items are built from `config.selections` only:
 * - Each `productId:variantId` key with quantity > 0 becomes one {@link QuoteLine}.
 * - Keys with quantity 0 or unknown product ids are skipped.
 * - Unit and compare-at prices come from {@link Product} in the catalog.
 *
 * Totals roll up as:
 * - `subtotal` — sum of line totals (products only)
 * - `compareAtSubtotal` — sum of compare-at line totals plus shipping compare-at
 * - `savings` — `max(0, compareAtSubtotal - subtotal - shipping)`
 * - `total` — `subtotal + shipping` (shipping from `catalog.meta.shipping`)
 *
 * The review panel shows live preview totals via `lib/pricing` while editing;
 * use this path for the validated snapshot at quote and checkout.
 */
function buildQuote(configurationId: string, config: Configuration): Quote {
  const lines: QuoteLine[] = [];

  for (const [key, quantity] of Object.entries(config.selections)) {
    if (quantity <= 0) {
      continue;
    }

    const { productId, variantId } = parseSelectionKey(key);
    const product = findProduct(productId);
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
    configurationId,
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

/** Merges a partial patch into selections and activeVariants without replacing whole maps. */
function applyPatch(
  config: Configuration,
  patch: ConfigurationPatch,
): Configuration {
  return {
    ...config,
    ...(patch.openStepId !== undefined ? { openStepId: patch.openStepId } : {}),
    ...(patch.selections !== undefined
      ? { selections: { ...config.selections, ...patch.selections } }
      : {}),
    ...(patch.activeVariants !== undefined
      ? {
          activeVariants: { ...config.activeVariants, ...patch.activeVariants },
        }
      : {}),
  };
}

/** Merges caller input onto catalog {@link BundleConfig.initialSelections} defaults. */
function resolveCreateInput(
  input: CreateConfigurationInput = {},
): Pick<Configuration, "selections" | "activeVariants" | "openStepId"> {
  return {
    openStepId: input.openStepId ?? catalog.initialSelections.openStepId,
    selections: {
      ...catalog.initialSelections.selections,
      ...input.selections,
    },
    activeVariants: {
      ...catalog.initialSelections.activeVariants,
      ...input.activeVariants,
    },
  };
}

export const localApi: BundleApi = {
  async getConfig(): Promise<BundleConfig> {
    return catalog;
  },

  async createConfiguration(
    input: CreateConfigurationInput = {},
  ): Promise<Configuration> {
    const id = createId();
    const resolved = resolveCreateInput(input);
    const config: Configuration = { id, ...resolved };
    configurations.set(id, config);
    return cloneConfiguration(config);
  },

  async getConfiguration(id: string): Promise<Configuration> {
    return cloneConfiguration(getConfigurationOrThrow(id));
  },

  async patchConfiguration(
    id: string,
    patch: ConfigurationPatch,
  ): Promise<Configuration> {
    const current = getConfigurationOrThrow(id);
    const updated = applyPatch(current, patch);
    configurations.set(id, updated);
    return cloneConfiguration(updated);
  },

  async saveConfiguration(id: string): Promise<Configuration> {
    const current = getConfigurationOrThrow(id);
    const saved: Configuration = {
      ...current,
      savedAt: new Date().toISOString(),
    };
    configurations.set(id, saved);
    return cloneConfiguration(saved);
  },

  /**
   * Returns an authoritative {@link Quote} for the configuration.
   * Loads the stored draft by id, then prices it via {@link buildQuote}.
   * Use preview totals in the review panel while editing; call this at checkout
   * or whenever the bundle must be priced against the catalog.
   */
  async quote(id: string): Promise<Quote> {
    const config = getConfigurationOrThrow(id);
    return buildQuote(id, config);
  },

  /**
   * Creates an order draft from a quoted configuration.
   * Quotes first (same rules as {@link quote}), then returns a new `orderId`
   * and the quote snapshot the order is priced against.
   */
  async checkout(id: string): Promise<CheckoutResult> {
    const config = getConfigurationOrThrow(id);
    const quote = buildQuote(id, config);
    return {
      orderId: createId(),
      configurationId: id,
      quote,
    };
  },
};

/** Resets the in-memory store — for tests only. */
export function resetLocalApiStore(): void {
  configurations.clear();
}

/** Seeds a configuration directly — for tests only. */
export function seedLocalConfiguration(config: Configuration): void {
  configurations.set(config.id, { ...config });
}

export type { Selections, ActiveVariants };
