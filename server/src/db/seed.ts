import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type Database from "better-sqlite3";
import type { BundleConfig } from "../types/catalog.js";

const moduleDir = dirname(fileURLToPath(import.meta.url));

function bundleJsonPath(): string {
  return join(moduleDir, "../../data/bundle.json");
}

function loadBundleJson(): BundleConfig {
  const raw = readFileSync(bundleJsonPath(), "utf8");
  return JSON.parse(raw) as BundleConfig;
}

function isCatalogEmpty(db: Database.Database): boolean {
  const row = db.prepare("SELECT COUNT(*) AS count FROM products").get() as {
    count: number;
  };
  return row.count === 0;
}

export function seedCatalog(db: Database.Database): void {
  if (!isCatalogEmpty(db)) {
    return;
  }

  const bundle = loadBundleJson();

  const seed = db.transaction(() => {
    const insertReviewGroup = db.prepare(
      "INSERT INTO review_groups (id, title) VALUES (?, ?)",
    );
    for (const group of bundle.meta.reviewGroups) {
      insertReviewGroup.run(group.id, group.title);
    }

    db.prepare(
      `INSERT INTO catalog_meta (
        id,
        currency,
        review_panel_title,
        review_panel_subtitle,
        savings_message,
        shipping_json,
        guarantee_json,
        financing_json
      ) VALUES (1, ?, ?, ?, ?, ?, ?, ?)`,
    ).run(
      bundle.meta.currency,
      bundle.meta.reviewPanelTitle,
      bundle.meta.reviewPanelSubtitle,
      bundle.meta.savingsMessage,
      JSON.stringify(bundle.meta.shipping),
      JSON.stringify(bundle.meta.guarantee),
      JSON.stringify(bundle.meta.financing),
    );

    const insertStep = db.prepare(
      `INSERT INTO builder_steps (
        id,
        step_number,
        title,
        icon,
        next_step_label,
        sort_order
      ) VALUES (?, ?, ?, ?, ?, ?)`,
    );

    const insertProduct = db.prepare(
      `INSERT INTO products (
        id,
        title,
        description,
        image_url,
        price,
        compare_at_price,
        badge_json,
        review_group_id,
        pricing_unit,
        learn_more_url,
        requires_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    );

    const insertVariant = db.prepare(
      `INSERT INTO product_variants (
        product_id,
        id,
        label,
        image_url,
        sort_order
      ) VALUES (?, ?, ?, ?, ?)`,
    );

    const insertStepProduct = db.prepare(
      "INSERT INTO step_products (step_id, product_id, sort_order) VALUES (?, ?, ?)",
    );

    bundle.steps.forEach((step, stepIndex) => {
      insertStep.run(
        step.id,
        step.stepNumber,
        step.title,
        step.icon,
        step.nextStepLabel,
        stepIndex,
      );

      step.products.forEach((product, productIndex) => {
        insertProduct.run(
          product.id,
          product.title,
          product.description,
          product.imageUrl,
          product.price,
          product.compareAtPrice ?? null,
          product.badge ? JSON.stringify(product.badge) : null,
          product.reviewGroupId,
          product.pricingUnit ?? null,
          product.learnMoreUrl ?? null,
          product.requires ? JSON.stringify(product.requires) : null,
        );

        product.variants?.forEach((variant, variantIndex) => {
          insertVariant.run(
            product.id,
            variant.id,
            variant.label,
            variant.imageUrl ?? null,
            variantIndex,
          );
        });

        insertStepProduct.run(step.id, product.id, productIndex);
      });
    });

    db.prepare(
      `INSERT INTO initial_selections (
        id,
        open_step_id,
        selections_json,
        active_variants_json
      ) VALUES (1, ?, ?, ?)`,
    ).run(
      bundle.initialSelections.openStepId,
      JSON.stringify(bundle.initialSelections.selections),
      JSON.stringify(bundle.initialSelections.activeVariants),
    );
  });

  seed();
}
