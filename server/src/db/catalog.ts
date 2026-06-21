import type Database from "better-sqlite3";
import type {
  BuilderStep,
  BundleConfig,
  CatalogMeta,
  InitialSelections,
  PricingUnit,
  Product,
  ProductBadge,
  ProductVariant,
  ReviewGroupId,
  StepIconId,
} from "../types/catalog.js";

type MetaRow = {
  currency: string;
  review_panel_title: string;
  review_panel_subtitle: string;
  savings_message: string;
  shipping_json: string;
  guarantee_json: string;
  financing_json: string;
};

type StepRow = {
  id: string;
  step_number: number;
  title: string;
  icon: string;
  next_step_label: string | null;
  sort_order: number;
};

type ProductRow = {
  id: string;
  title: string;
  description: string;
  image_url: string;
  price: number;
  compare_at_price: number | null;
  badge_json: string | null;
  review_group_id: string;
  pricing_unit: string | null;
  learn_more_url: string | null;
  requires_json: string | null;
  sort_order: number;
};

type VariantRow = {
  product_id: string;
  id: string;
  label: string;
  image_url: string | null;
  sort_order: number;
};

type InitialSelectionsRow = {
  open_step_id: string;
  selections_json: string;
  active_variants_json: string;
};

function mapProduct(row: ProductRow, variants: ProductVariant[]): Product {
  const badge = row.badge_json
    ? (JSON.parse(row.badge_json) as ProductBadge)
    : undefined;
  const requires = row.requires_json
    ? (JSON.parse(row.requires_json) as string[])
    : undefined;

  return {
    id: row.id,
    title: row.title,
    description: row.description,
    imageUrl: row.image_url,
    price: row.price,
    ...(row.compare_at_price != null
      ? { compareAtPrice: row.compare_at_price }
      : {}),
    ...(badge ? { badge } : {}),
    reviewGroupId: row.review_group_id as ReviewGroupId,
    ...(row.pricing_unit
      ? { pricingUnit: row.pricing_unit as PricingUnit }
      : {}),
    ...(row.learn_more_url ? { learnMoreUrl: row.learn_more_url } : {}),
    ...(requires ? { requires } : {}),
    ...(variants.length > 0 ? { variants } : {}),
  };
}

function loadMeta(db: Database.Database): CatalogMeta {
  const metaRow = db
    .prepare(
      `SELECT
        currency,
        review_panel_title,
        review_panel_subtitle,
        savings_message,
        shipping_json,
        guarantee_json,
        financing_json
      FROM catalog_meta
      WHERE id = 1`,
    )
    .get() as MetaRow | undefined;

  if (!metaRow) {
    throw new Error("Catalog meta is not seeded");
  }

  const reviewGroups = db
    .prepare("SELECT id, title FROM review_groups ORDER BY rowid")
    .all() as { id: ReviewGroupId; title: string }[];

  return {
    currency: metaRow.currency,
    reviewPanelTitle: metaRow.review_panel_title,
    reviewPanelSubtitle: metaRow.review_panel_subtitle,
    reviewGroups,
    shipping: JSON.parse(metaRow.shipping_json),
    guarantee: JSON.parse(metaRow.guarantee_json),
    financing: JSON.parse(metaRow.financing_json),
    savingsMessage: metaRow.savings_message,
  };
}

function loadSteps(db: Database.Database): BuilderStep[] {
  const stepRows = db
    .prepare(
      `SELECT id, step_number, title, icon, next_step_label, sort_order
       FROM builder_steps
       ORDER BY sort_order`,
    )
    .all() as StepRow[];

  const productRows = db
    .prepare(
      `SELECT
        p.id,
        p.title,
        p.description,
        p.image_url,
        p.price,
        p.compare_at_price,
        p.badge_json,
        p.review_group_id,
        p.pricing_unit,
        p.learn_more_url,
        p.requires_json,
        sp.step_id,
        sp.sort_order
      FROM step_products sp
      JOIN products p ON p.id = sp.product_id
      ORDER BY sp.step_id, sp.sort_order`,
    )
    .all() as (ProductRow & { step_id: string })[];

  const variantRows = db
    .prepare(
      `SELECT product_id, id, label, image_url, sort_order
       FROM product_variants
       ORDER BY product_id, sort_order`,
    )
    .all() as VariantRow[];

  const variantsByProduct = new Map<string, ProductVariant[]>();
  for (const variant of variantRows) {
    const list = variantsByProduct.get(variant.product_id) ?? [];
    list.push({
      id: variant.id,
      label: variant.label,
      ...(variant.image_url ? { imageUrl: variant.image_url } : {}),
    });
    variantsByProduct.set(variant.product_id, list);
  }

  const productsByStep = new Map<string, Product[]>();
  for (const row of productRows) {
    const list = productsByStep.get(row.step_id) ?? [];
    list.push(mapProduct(row, variantsByProduct.get(row.id) ?? []));
    productsByStep.set(row.step_id, list);
  }

  return stepRows.map((step) => ({
    id: step.id,
    stepNumber: step.step_number,
    title: step.title,
    icon: step.icon as StepIconId,
    nextStepLabel: step.next_step_label,
    products: productsByStep.get(step.id) ?? [],
  }));
}

function loadInitialSelections(db: Database.Database): InitialSelections {
  const row = db
    .prepare(
      `SELECT open_step_id, selections_json, active_variants_json
       FROM initial_selections
       WHERE id = 1`,
    )
    .get() as InitialSelectionsRow | undefined;

  if (!row) {
    throw new Error("Initial selections are not seeded");
  }

  return {
    openStepId: row.open_step_id,
    selections: JSON.parse(row.selections_json) as Record<string, number>,
    activeVariants: JSON.parse(row.active_variants_json) as Record<
      string,
      string
    >,
  };
}

export function getBundleConfig(db: Database.Database): BundleConfig {
  return {
    meta: loadMeta(db),
    steps: loadSteps(db),
    initialSelections: loadInitialSelections(db),
  };
}
