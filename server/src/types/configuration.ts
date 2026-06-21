/** Map of selectionKey → quantity (0 means unselected). */
export type Selections = Record<string, number>;

/** Map of productId → active variantId for products with variants. */
export type ActiveVariants = Record<string, string>;

export type Configuration = {
  id: string;
  selections: Selections;
  activeVariants: ActiveVariants;
  openStepId: string;
  savedAt?: string;
};

export type ConfigurationPatch = Partial<
  Pick<Configuration, "selections" | "activeVariants" | "openStepId">
>;

export type CreateConfigurationInput = {
  selections?: Selections;
  activeVariants?: ActiveVariants;
  openStepId?: string;
};

export type SavedConfigurationSnapshot = Pick<
  Configuration,
  "selections" | "activeVariants" | "openStepId"
> & {
  configurationId?: string;
};
