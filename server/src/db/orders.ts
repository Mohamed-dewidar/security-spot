import type Database from "better-sqlite3";
import type { Quote } from "../types/api.js";

export function insertOrder(
  db: Database.Database,
  orderId: string,
  configurationId: string,
  quote: Quote,
  createdAt = new Date().toISOString(),
): void {
  db.prepare(
    `INSERT INTO orders (id, configuration_id, quote_json, created_at)
     VALUES (?, ?, ?, ?)`,
  ).run(orderId, configurationId, JSON.stringify(quote), createdAt);
}
