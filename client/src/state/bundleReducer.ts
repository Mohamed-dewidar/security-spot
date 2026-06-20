import { selectionKey } from "@/state/keys";
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
  configuration: Pick<
    Configuration,
    "selections" | "activeVariants" | "openStepId"
  >,
): BundleState {
  return {
    selections: { ...configuration.selections },
    activeVariants: { ...configuration.activeVariants },
    openStepId: configuration.openStepId,
  };
}

export function bundleReducer(
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
      const key = selectionKey(action.productId, variantId);
      const quantity = Math.max(0, action.quantity);
      const selections = { ...state.selections };

      if (quantity === 0) {
        delete selections[key];
      } else {
        selections[key] = quantity;
      }

      return { ...state, selections };
    }

    case "HYDRATE":
      return {
        openStepId: action.payload.openStepId,
        selections: { ...action.payload.selections },
        activeVariants: { ...action.payload.activeVariants },
      };

    default:
      return state;
  }
}
