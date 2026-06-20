import type { BundleConfig } from "@/types/catalog";
import type {
  Configuration,
  ConfigurationPatch,
  CreateConfigurationInput,
} from "@/types/configuration";
import type { CheckoutResult, Quote } from "@/types/api";

export type BundleApi = {
  getConfig(): Promise<BundleConfig>;
  createConfiguration(input?: CreateConfigurationInput): Promise<Configuration>;
  getConfiguration(id: string): Promise<Configuration>;
  patchConfiguration(
    id: string,
    patch: ConfigurationPatch,
  ): Promise<Configuration>;
  saveConfiguration(id: string): Promise<Configuration>;
  quote(id: string): Promise<Quote>;
  checkout(id: string): Promise<CheckoutResult>;
};
