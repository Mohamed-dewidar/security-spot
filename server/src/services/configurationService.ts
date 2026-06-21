import { randomUUID } from "node:crypto";
import type Database from "better-sqlite3";
import { getBundleConfig } from "../db/catalog.js";
import {
  getConfiguration as loadConfiguration,
  insertConfiguration,
  setConfigurationSavedAt,
  updateConfiguration,
} from "../db/configurations.js";
import { NotFoundError } from "../errors.js";
import { resolveOpenStepId } from "../lib/openStep.js";
import { normalizeSelections } from "../lib/productDependencies.js";
import type {
  Configuration,
  ConfigurationPatch,
  CreateConfigurationInput,
} from "../types/configuration.js";

function cloneConfiguration(config: Configuration): Configuration {
  return {
    ...config,
    selections: { ...config.selections },
    activeVariants: { ...config.activeVariants },
  };
}

function getConfigurationOrThrow(
  db: Database.Database,
  id: string,
): Configuration {
  const config = loadConfiguration(db, id);
  if (!config) {
    throw new NotFoundError(`Configuration not found: ${id}`);
  }
  return config;
}

function applyPatch(
  catalog: ReturnType<typeof getBundleConfig>,
  config: Configuration,
  patch: ConfigurationPatch,
): Configuration {
  return {
    ...config,
    ...(patch.openStepId !== undefined
      ? { openStepId: resolveOpenStepId(catalog, patch.openStepId) }
      : {}),
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

function resolveCreateInput(
  catalog: ReturnType<typeof getBundleConfig>,
  input: CreateConfigurationInput = {},
): Pick<Configuration, "selections" | "activeVariants" | "openStepId"> {
  return {
    openStepId: resolveOpenStepId(
      catalog,
      input.openStepId ?? catalog.initialSelections.openStepId,
    ),
    selections: normalizeSelections(catalog, {
      ...catalog.initialSelections.selections,
      ...input.selections,
    }),
    activeVariants: {
      ...catalog.initialSelections.activeVariants,
      ...input.activeVariants,
    },
  };
}

export function createConfiguration(
  db: Database.Database,
  input: CreateConfigurationInput = {},
): Configuration {
  const catalog = getBundleConfig(db);
  const id = randomUUID();
  const resolved = resolveCreateInput(catalog, input);
  const config: Configuration = { id, ...resolved };

  insertConfiguration(db, config);
  return cloneConfiguration(config);
}

export function getConfiguration(
  db: Database.Database,
  id: string,
): Configuration {
  return cloneConfiguration(getConfigurationOrThrow(db, id));
}

export function patchConfiguration(
  db: Database.Database,
  id: string,
  patch: ConfigurationPatch,
): Configuration {
  const catalog = getBundleConfig(db);
  const current = getConfigurationOrThrow(db, id);
  const merged = applyPatch(catalog, current, patch);
  const updated: Configuration = {
    ...merged,
    selections: normalizeSelections(catalog, merged.selections),
  };

  updateConfiguration(db, updated);
  return cloneConfiguration(updated);
}

export function saveConfiguration(
  db: Database.Database,
  id: string,
): Configuration {
  getConfigurationOrThrow(db, id);
  const savedAt = new Date().toISOString();
  const saved = setConfigurationSavedAt(db, id, savedAt);

  if (!saved) {
    throw new NotFoundError(`Configuration not found: ${id}`);
  }

  return cloneConfiguration(saved);
}
