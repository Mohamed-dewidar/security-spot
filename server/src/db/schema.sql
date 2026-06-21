PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS review_groups (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS catalog_meta (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  currency TEXT NOT NULL,
  review_panel_title TEXT NOT NULL,
  review_panel_subtitle TEXT NOT NULL,
  savings_message TEXT NOT NULL,
  shipping_json TEXT NOT NULL,
  guarantee_json TEXT NOT NULL,
  financing_json TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS builder_steps (
  id TEXT PRIMARY KEY,
  step_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  icon TEXT NOT NULL,
  next_step_label TEXT,
  sort_order INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT NOT NULL,
  price REAL NOT NULL,
  compare_at_price REAL,
  badge_json TEXT,
  review_group_id TEXT NOT NULL REFERENCES review_groups (id),
  pricing_unit TEXT,
  learn_more_url TEXT,
  requires_json TEXT
);

CREATE TABLE IF NOT EXISTS product_variants (
  product_id TEXT NOT NULL REFERENCES products (id) ON DELETE CASCADE,
  id TEXT NOT NULL,
  label TEXT NOT NULL,
  image_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (product_id, id)
);

CREATE TABLE IF NOT EXISTS step_products (
  step_id TEXT NOT NULL REFERENCES builder_steps (id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES products (id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL,
  PRIMARY KEY (step_id, product_id)
);

CREATE TABLE IF NOT EXISTS initial_selections (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  open_step_id TEXT NOT NULL,
  selections_json TEXT NOT NULL,
  active_variants_json TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS configurations (
  id TEXT PRIMARY KEY,
  open_step_id TEXT NOT NULL,
  saved_at TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS configuration_items (
  configuration_id TEXT NOT NULL REFERENCES configurations (id) ON DELETE CASCADE,
  selection_key TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  PRIMARY KEY (configuration_id, selection_key)
);

CREATE TABLE IF NOT EXISTS configuration_active_variants (
  configuration_id TEXT NOT NULL REFERENCES configurations (id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  variant_id TEXT NOT NULL,
  PRIMARY KEY (configuration_id, product_id)
);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  configuration_id TEXT NOT NULL REFERENCES configurations (id),
  quote_json TEXT NOT NULL,
  created_at TEXT NOT NULL
);
