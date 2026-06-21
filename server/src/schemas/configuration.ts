import { z } from "zod";

const selectionsSchema = z.record(z.string().min(1), z.number().int().min(0));

const activeVariantsSchema = z.record(z.string().min(1), z.string().min(1));

const openStepIdSchema = z.string().min(1);

/** POST /configurations — optional overrides merged onto catalog initialSelections. */
export const createConfigurationSchema = z
  .object({
    selections: selectionsSchema.optional(),
    activeVariants: activeVariantsSchema.optional(),
    openStepId: openStepIdSchema.optional(),
  })
  .strict();

/** PATCH /configurations/:id — partial selections, activeVariants, openStepId only. */
export const patchConfigurationSchema = z
  .object({
    selections: selectionsSchema.optional(),
    activeVariants: activeVariantsSchema.optional(),
    openStepId: openStepIdSchema.optional(),
  })
  .strict();

export type CreateConfigurationBody = z.infer<typeof createConfigurationSchema>;
export type PatchConfigurationBody = z.infer<typeof patchConfigurationSchema>;
