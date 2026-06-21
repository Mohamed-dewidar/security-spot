import { useCallback, useMemo, useState } from "react";
import { ReviewActions } from "@/components/review/ReviewActions";
import {
  ReviewGroup,
  type ReviewGroupLine,
} from "@/components/review/ReviewGroup";
import { ReviewShippingLine } from "@/components/review/ReviewShippingLine";
import { ReviewTotals } from "@/components/review/ReviewTotals";
import type { PriceFormat } from "@/lib/formatPrice";
import { findProductInCatalog } from "@/lib/pricing";
import { selectMinQuantity } from "@/lib/productDependencies";
import { parseSelectionKey } from "@/state/keys";
import { selectReviewLinesByGroup, selectTotals } from "@/state/selectors";
import {
  useBundle,
  useBundleCatalog,
  useBundleDispatch,
  useBundleState,
} from "@/state/bundleContext";
import type { BundleConfig } from "@/types/catalog";
import type { QuoteLine } from "@/types/api";
import type { Selections } from "@/types/configuration";

function priceFormatForLine(line: QuoteLine): PriceFormat {
  return line.pricingUnit === "monthly" ? "monthly" : "line";
}

function resolveLineImageUrl(
  catalog: BundleConfig,
  line: QuoteLine,
): string | undefined {
  const product = findProductInCatalog(catalog, line.productId);
  if (!product) {
    return undefined;
  }

  if (line.variantId && product.variants?.length) {
    const variant = product.variants.find((item) => item.id === line.variantId);
    if (variant?.imageUrl) {
      return variant.imageUrl;
    }
  }

  return product.imageUrl;
}

function resolveMinQuantity(
  catalog: BundleConfig,
  selections: Selections,
  line: QuoteLine,
): number {
  return selectMinQuantity(catalog, selections, line.productId, line.quantity);
}

export function ReviewPanel() {
  const catalog = useBundleCatalog();
  const state = useBundleState();
  const dispatch = useBundleDispatch();
  const { saveForLater } = useBundle();
  const [isSaving, setIsSaving] = useState(false);
  const [savedSnapshotKey, setSavedSnapshotKey] = useState<string | null>(null);
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);
  const [saveErrorState, setSaveErrorState] = useState<{
    snapshotKey: string;
    message: string;
  } | null>(null);

  const snapshotKey = useMemo(
    () =>
      JSON.stringify({
        selections: state.selections,
        activeVariants: state.activeVariants,
        openStepId: state.openStepId,
      }),
    [state.activeVariants, state.openStepId, state.selections],
  );

  const saved = savedSnapshotKey === snapshotKey;
  const saveError =
    saveErrorState?.snapshotKey === snapshotKey ? saveErrorState.message : null;

  const groupedLines = useMemo(
    () => selectReviewLinesByGroup(catalog, state),
    [catalog, state],
  );

  const totals = useMemo(() => selectTotals(catalog, state), [catalog, state]);

  const groupLines = useMemo(() => {
    const result: Record<string, ReviewGroupLine[]> = {};

    for (const group of catalog.meta.reviewGroups) {
      result[group.id] = groupedLines[group.id].map((line) => ({
        lineKey: line.selectionKey,
        label: line.title,
        variantLabel: line.variantLabel,
        imageUrl: resolveLineImageUrl(catalog, line),
        quantity: line.quantity,
        price: line.lineTotal,
        compareAtPrice: line.compareAtLineTotal,
        currency: totals.currency,
        priceFormat: priceFormatForLine(line),
        minQuantity: resolveMinQuantity(catalog, state.selections, line),
        isPlan: group.id === "plan",
        showStepper: group.id !== "plan",
      }));
    }

    return result;
  }, [catalog, groupedLines, state.selections, totals.currency]);

  const handleQuantityChange = useCallback(
    (lineKey: string, quantity: number) => {
      const { productId, variantId } = parseSelectionKey(lineKey);
      dispatch({ type: "SET_QUANTITY", productId, variantId, quantity });
    },
    [dispatch],
  );

  const handleCheckout = useCallback(() => {
    window.alert("Checkout is not available in this demo.");
  }, []);

  const handleSaveForLater = useCallback(async () => {
    setIsSaving(true);
    setSaveErrorState(null);
    try {
      await saveForLater();
      setSavedSnapshotKey(snapshotKey);
      setSaveFeedback("Your system was saved for later.");
    } catch (error) {
      setSavedSnapshotKey(null);
      setSaveFeedback(null);
      setSaveErrorState({
        snapshotKey,
        message:
          error instanceof Error
            ? error.message
            : "Could not save your system right now. Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  }, [saveForLater, snapshotKey]);

  return (
    <section className="rounded-card bg-step-bg pt-15">
      <p className="px-15 text-2xs font-medium uppercase tracking-step-label text-text-muted lg:text-xs xl:hidden">
        Review
      </p>

      <div className="flex flex-col gap-10 px-20 py-20">
        <div className="flex flex-col gap-20 xl:flex-row xl:items-start xl:justify-center xl:gap-52">
          <div className="min-w-0 flex-1 space-y-10 xl:max-w-[552px]">
            <header className="space-y-5 tracking-body">
              <h2 className="text-2xl font-semibold leading-none text-text xl:text-3xl">
                {catalog.meta.reviewPanelTitle}
              </h2>
              <p className="text-xs leading-body font-medium text-text-body lg:text-sm xl:text-base">
                {catalog.meta.reviewPanelSubtitle}
              </p>
            </header>

            <div className="space-y-10">
              {catalog.meta.reviewGroups.map((group) => (
                <ReviewGroup
                  key={group.id}
                  title={group.title}
                  className={
                    group.id === "plan" ? "review-plan-group" : undefined
                  }
                  lines={groupLines[group.id]}
                  onQuantityChange={handleQuantityChange}
                />
              ))}

              <div className="border-t border-gray-400 pt-15">
                <ReviewShippingLine
                  label={catalog.meta.shipping.label}
                  price={catalog.meta.shipping.price}
                  compareAtPrice={catalog.meta.shipping.compareAtPrice}
                  currency={totals.currency}
                />
              </div>
            </div>
          </div>

          <div className="w-full space-y-8 xl:w-[486px] xl:shrink-0">
            <ReviewTotals totals={totals} meta={catalog.meta} />
            <ReviewActions
              onCheckout={handleCheckout}
              onSaveForLater={() => void handleSaveForLater()}
              isSaving={isSaving}
              saved={saved}
              saveStatusMessage={saved ? saveFeedback : null}
              saveErrorMessage={saveError}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
