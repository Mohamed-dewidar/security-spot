import { mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import Database from "better-sqlite3";
import { seedCatalog } from "./seed.js";

const moduleDir = dirname(fileURLToPath(import.meta.url));

let dbInstance: Database.Database | null = null;

function schemaPath(): string {
  return join(moduleDir, "schema.sql");
}

function defaultDatabasePath(): string {
  return join(moduleDir, "../../data/bundle.db");
}

function runSchema(db: Database.Database): void {
  const schema = readFileSync(schemaPath(), "utf8");
  db.exec(schema);
}

export function initDatabase(
  databasePath: string = defaultDatabasePath(),
): Database.Database {
  mkdirSync(dirname(databasePath), { recursive: true });

  const db = new Database(databasePath);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  runSchema(db);
  seedCatalog(db);

  return db;
}

export function getDb(): Database.Database {
  if (!dbInstance) {
    dbInstance = initDatabase();
  }
  return dbInstance;
}

export function setDb(db: Database.Database | null): void {
  dbInstance = db;
}

export function closeDb(): void {
  dbInstance?.close();
  dbInstance = null;
}

export function createMemoryDatabase(): Database.Database {
  const db = new Database(":memory:");
  db.pragma("foreign_keys = ON");
  runSchema(db);
  seedCatalog(db);
  return db;
}
