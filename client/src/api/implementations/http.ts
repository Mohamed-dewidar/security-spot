import { fetchJson } from "@/api/httpClient";
import type { BundleApi } from "@/api/types";
import type { CheckoutResult, Quote } from "@/types/api";
import type { BundleConfig } from "@/types/catalog";
import type {
  Configuration,
  ConfigurationPatch,
  CreateConfigurationInput,
} from "@/types/configuration";

function configurationPath(id: string, suffix = ""): string {
  return `/configurations/${encodeURIComponent(id)}${suffix}`;
}

/** HTTP client implementation — used when `VITE_USE_API=true`. */
export const httpApi: BundleApi = {
  getConfig: () => fetchJson<BundleConfig>("/config"),

  createConfiguration: (input: CreateConfigurationInput = {}) =>
    fetchJson<Configuration>("/configurations", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  getConfiguration: (id: string) =>
    fetchJson<Configuration>(configurationPath(id)),

  patchConfiguration: (id: string, patch: ConfigurationPatch) =>
    fetchJson<Configuration>(configurationPath(id), {
      method: "PATCH",
      body: JSON.stringify(patch),
    }),

  saveConfiguration: (id: string) =>
    fetchJson<Configuration>(configurationPath(id, "/save"), {
      method: "POST",
    }),

  quote: (id: string) =>
    fetchJson<Quote>(configurationPath(id, "/quote"), {
      method: "POST",
    }),

  checkout: (id: string) =>
    fetchJson<CheckoutResult>(configurationPath(id, "/checkout"), {
      method: "POST",
    }),
};
