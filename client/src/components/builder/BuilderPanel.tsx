import { Fragment, useCallback, useMemo } from "react";
import { AccordionStep } from "@/components/builder/AccordionStep";
import { NextStepButton } from "@/components/builder/NextStepButton";
import {
  selectActiveVariantId,
  selectProductCardQuantity,
  selectStepSelectedCount,
} from "@/state/selectors";
import {
  useBundleCatalog,
  useBundleDispatch,
  useBundleState,
} from "@/state/bundleContext";
import type { Product } from "@/types/catalog";

export function BuilderPanel() {
  const catalog = useBundleCatalog();
  const state = useBundleState();
  const dispatch = useBundleDispatch();

  const totalSteps = catalog.steps.length;

  const openStep = useMemo(
    () => catalog.steps.find((step) => step.id === state.openStepId),
    [catalog.steps, state.openStepId],
  );

  const openStepIndex = useMemo(
    () => catalog.steps.findIndex((step) => step.id === state.openStepId),
    [catalog.steps, state.openStepId],
  );

  const getActiveVariantId = useCallback(
    (product: Product) => selectActiveVariantId(state, product),
    [state],
  );

  const getQuantity = useCallback(
    (product: Product) => selectProductCardQuantity(state, product),
    [state],
  );

  const handleOpenStep = useCallback(
    (stepId: string) => {
      dispatch({ type: "SET_OPEN_STEP", stepId });
    },
    [dispatch],
  );

  const handleVariantChange = useCallback(
    (productId: string, variantId: string) => {
      dispatch({ type: "SET_ACTIVE_VARIANT", productId, variantId });
    },
    [dispatch],
  );

  const handleQuantityChange = useCallback(
    (productId: string, variantId: string | undefined, quantity: number) => {
      dispatch({ type: "SET_QUANTITY", productId, variantId, quantity });
    },
    [dispatch],
  );

  const handleNextStep = useCallback(() => {
    const nextStep = catalog.steps[openStepIndex + 1];
    if (nextStep) {
      dispatch({ type: "SET_OPEN_STEP", stepId: nextStep.id });
    }
  }, [catalog.steps, dispatch, openStepIndex]);

  return (
    <section aria-label="Bundle builder" className="min-w-0">
      <div className="overflow-hidden rounded-card border border-gray-400 bg-surface">
        {catalog.steps.map((step) => {
          const isOpen = state.openStepId === step.id;
          const selectedCount = selectStepSelectedCount(
            catalog,
            state,
            step.id,
          );

          return (
            <Fragment key={step.id}>
              <AccordionStep
                step={step}
                totalSteps={totalSteps}
                isOpen={isOpen}
                selectedCount={selectedCount}
                currency={catalog.meta.currency}
                getActiveVariantId={getActiveVariantId}
                getQuantity={getQuantity}
                onToggle={() => handleOpenStep(step.id)}
                onVariantChange={handleVariantChange}
                onQuantityChange={handleQuantityChange}
              />
              {isOpen && step.nextStepLabel ? (
                <div className="border-t border-gray-300 bg-step-bg px-15 pb-20 md:px-20 md:pb-24 lg:px-25 lg:pb-25">
                  <NextStepButton
                    label={step.nextStepLabel}
                    onClick={handleNextStep}
                  />
                </div>
              ) : null}
            </Fragment>
          );
        })}
      </div>

      {openStep ? (
        <p className="sr-only">
          {selectStepSelectedCount(catalog, state, openStep.id)} products
          selected in {openStep.title}
        </p>
      ) : null}
    </section>
  );
}
