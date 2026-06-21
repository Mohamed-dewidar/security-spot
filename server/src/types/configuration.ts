export type Selections = Record<string, number>;

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
