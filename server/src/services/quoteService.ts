import { randomUUID } from "node:crypto";
import type Database from "better-sqlite3";
import { getBundleConfig } from "../db/catalog.js";
import { getConfiguration as loadConfiguration } from "../db/configurations.js";
import { insertOrder } from "../db/orders.js";
import { NotFoundError } from "../errors.js";
import { calculateQuote } from "../lib/pricing/calculateQuote.js";
import type { CheckoutResult, Quote } from "../types/api.js";

function getConfigurationOrThrow(
  db: Database.Database,
  id: string,
): NonNullable<ReturnType<typeof loadConfiguration>> {
  const config = loadConfiguration(db, id);
  if (!config) {
    throw new NotFoundError(`Configuration not found: ${id}`);
  }
  return config;
}

export function quoteConfiguration(db: Database.Database, id: string): Quote {
  const catalog = getBundleConfig(db);
  const config = getConfigurationOrThrow(db, id);
  return calculateQuote(catalog, config);
}

export function checkoutConfiguration(
  db: Database.Database,
  id: string,
): CheckoutResult {
  const config = getConfigurationOrThrow(db, id);
  const catalog = getBundleConfig(db);
  const quote = calculateQuote(catalog, config);
  const orderId = randomUUID();

  insertOrder(db, orderId, id, quote);

  return {
    orderId,
    configurationId: id,
    quote,
  };
}
