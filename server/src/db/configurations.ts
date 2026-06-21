import type Database from "better-sqlite3";
import type {
  ActiveVariants,
  Configuration,
  Selections,
} from "../types/configuration.js";

type ConfigurationRow = {
  id: string;
  open_step_id: string;
  saved_at: string | null;
};

type ConfigurationItemRow = {
  selection_key: string;
  quantity: number;
};

type ConfigurationActiveVariantRow = {
  product_id: string;
  variant_id: string;
};

function loadSelections(
  db: Database.Database,
  configurationId: string,
): Selections {
  const rows = db
    .prepare(
      `SELECT selection_key, quantity
       FROM configuration_items
       WHERE configuration_id = ?`,
    )
    .all(configurationId) as ConfigurationItemRow[];

  const selections: Selections = {};
  for (const row of rows) {
    selections[row.selection_key] = row.quantity;
  }
  return selections;
}

function loadActiveVariants(
  db: Database.Database,
  configurationId: string,
): ActiveVariants {
  const rows = db
    .prepare(
      `SELECT product_id, variant_id
       FROM configuration_active_variants
       WHERE configuration_id = ?`,
    )
    .all(configurationId) as ConfigurationActiveVariantRow[];

  const activeVariants: ActiveVariants = {};
  for (const row of rows) {
    activeVariants[row.product_id] = row.variant_id;
  }
  return activeVariants;
}

function rowToConfiguration(
  db: Database.Database,
  row: ConfigurationRow,
): Configuration {
  return {
    id: row.id,
    openStepId: row.open_step_id,
    selections: loadSelections(db, row.id),
    activeVariants: loadActiveVariants(db, row.id),
    ...(row.saved_at ? { savedAt: row.saved_at } : {}),
  };
}

function persistConfigurationMaps(
  db: Database.Database,
  configurationId: string,
  selections: Selections,
  activeVariants: ActiveVariants,
): void {
  db.prepare("DELETE FROM configuration_items WHERE configuration_id = ?").run(
    configurationId,
  );
  db.prepare(
    "DELETE FROM configuration_active_variants WHERE configuration_id = ?",
  ).run(configurationId);

  const insertItem = db.prepare(
    `INSERT INTO configuration_items (configuration_id, selection_key, quantity)
     VALUES (?, ?, ?)`,
  );
  for (const [selectionKey, quantity] of Object.entries(selections)) {
    insertItem.run(configurationId, selectionKey, quantity);
  }

  const insertVariant = db.prepare(
    `INSERT INTO configuration_active_variants (
      configuration_id,
      product_id,
      variant_id
    ) VALUES (?, ?, ?)`,
  );
  for (const [productId, variantId] of Object.entries(activeVariants)) {
    insertVariant.run(configurationId, productId, variantId);
  }
}

export function insertConfiguration(
  db: Database.Database,
  config: Configuration,
  createdAt = new Date().toISOString(),
): void {
  const insert = db.transaction(() => {
    db.prepare(
      `INSERT INTO configurations (id, open_step_id, saved_at, created_at)
       VALUES (?, ?, ?, ?)`,
    ).run(config.id, config.openStepId, config.savedAt ?? null, createdAt);

    persistConfigurationMaps(
      db,
      config.id,
      config.selections,
      config.activeVariants,
    );
  });

  insert();
}

export function getConfiguration(
  db: Database.Database,
  id: string,
): Configuration | null {
  const row = db
    .prepare(
      `SELECT id, open_step_id, saved_at
       FROM configurations
       WHERE id = ?`,
    )
    .get(id) as ConfigurationRow | undefined;

  if (!row) {
    return null;
  }

  return rowToConfiguration(db, row);
}

export function updateConfiguration(
  db: Database.Database,
  config: Configuration,
): void {
  const update = db.transaction(() => {
    const result = db
      .prepare(
        `UPDATE configurations
         SET open_step_id = ?, saved_at = ?
         WHERE id = ?`,
      )
      .run(config.openStepId, config.savedAt ?? null, config.id);

    if (result.changes === 0) {
      throw new Error(`Configuration not found: ${config.id}`);
    }

    persistConfigurationMaps(
      db,
      config.id,
      config.selections,
      config.activeVariants,
    );
  });

  update();
}

export function setConfigurationSavedAt(
  db: Database.Database,
  id: string,
  savedAt: string,
): Configuration | null {
  const result = db
    .prepare("UPDATE configurations SET saved_at = ? WHERE id = ?")
    .run(savedAt, id);

  if (result.changes === 0) {
    return null;
  }

  return getConfiguration(db, id);
}

export function configurationExists(
  db: Database.Database,
  id: string,
): boolean {
  const row = db
    .prepare("SELECT 1 AS found FROM configurations WHERE id = ?")
    .get(id) as { found: number } | undefined;
  return row != null;
}
