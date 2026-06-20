import type { BundleApi } from "@/api/types";

function notImplemented(method: string): Promise<never> {
  return Promise.reject(
    new Error(
      `${method} is not available. Ensure the Express API is running when VITE_USE_API=true.`,
    ),
  );
}

/** HTTP client implementation — used when `VITE_USE_API=true`. */
export const httpApi: BundleApi = {
  getConfig: () => notImplemented("getConfig"),
  createConfiguration: () => notImplemented("createConfiguration"),
  getConfiguration: () => notImplemented("getConfiguration"),
  patchConfiguration: () => notImplemented("patchConfiguration"),
  saveConfiguration: () => notImplemented("saveConfiguration"),
  quote: () => notImplemented("quote"),
  checkout: () => notImplemented("checkout"),
};
