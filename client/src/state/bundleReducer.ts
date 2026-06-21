import {
  applySetQuantity,
  normalizeSelections,
} from "@/lib/productDependencies";
import { resolveOpenStepId } from "@/lib/openStep";
import type { BundleConfig } from "@/types/catalog";
import type {
  ActiveVariants,
  Configuration,
  Selections,
} from "@/types/configuration";

export type BundleState = {
  selections: Selections;
  activeVariants: ActiveVariants;
  openStepId: string;
};

export type BundleAction =
  | { type: "SET_OPEN_STEP"; stepId: string }
  | { type: "SET_ACTIVE_VARIANT"; productId: string; variantId: string }
  | {
      type: "SET_QUANTITY";
      productId: string;
      variantId?: string;
      quantity: number;
    }
  | {
      type: "HYDRATE";
      payload: Pick<
        BundleState,
        "selections" | "activeVariants" | "openStepId"
      >;
    };

export function createInitialState(
  catalog: BundleConfig,
  configuration: Pick<
    Configuration,
    "selections" | "activeVariants" | "openStepId"
  >,
): BundleState {
  return {
    selections: normalizeSelections(catalog, configuration.selections),
    activeVariants: { ...configuration.activeVariants },
    openStepId: resolveOpenStepId(catalog, configuration.openStepId),
  };
}

export function bundleReducer(
  catalog: BundleConfig,
  state: BundleState,
  action: BundleAction,
): BundleState {
  switch (action.type) {
    case "SET_OPEN_STEP":
      return { ...state, openStepId: action.stepId };

    case "SET_ACTIVE_VARIANT":
      return {
        ...state,
        activeVariants: {
          ...state.activeVariants,
          [action.productId]: action.variantId,
        },
      };

    case "SET_QUANTITY": {
      const variantId =
        action.variantId ?? state.activeVariants[action.productId] ?? undefined;
      const selections = applySetQuantity(
        catalog,
        state.selections,
        action.productId,
        variantId,
        action.quantity,
      );

      return { ...state, selections };
    }

    case "HYDRATE":
      return {
        openStepId: resolveOpenStepId(catalog, action.payload.openStepId),
        selections: normalizeSelections(catalog, action.payload.selections),
        activeVariants: { ...action.payload.activeVariants },
      };

    default:
      return state;
  }
}
