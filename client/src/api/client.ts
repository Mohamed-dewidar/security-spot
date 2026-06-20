import { httpApi } from "@/api/implementations/http";
import { localApi } from "@/api/implementations/local";
import type { BundleApi } from "@/api/types";

const useHttpApi = import.meta.env.VITE_USE_API === "true";

/** Single data door for catalog and configuration — never import bundle.json in UI. */
export const api: BundleApi = useHttpApi ? httpApi : localApi;

export type { BundleApi } from "@/api/types";
export { ApiError, NotFoundError } from "@/api/errors";
