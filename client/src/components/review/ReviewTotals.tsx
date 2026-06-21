import { formatPrice } from "@/lib/formatPrice";
import type { Quote } from "@/types/api";
import type { CatalogMeta } from "@/types/catalog";

type ReviewTotalsProps = {
  totals: Omit<Quote, "configurationId" | "lines">;
  meta: Pick<CatalogMeta, "guarantee" | "financing">;
};

export function ReviewTotals({ totals, meta }: ReviewTotalsProps) {
  const showTotalCompareAt = totals.compareAtSubtotal > totals.total;

  return (
    <div className="space-y-16">
      <div className="flex items-center justify-between gap-16 xl:items-center xl:gap-25">
        <img
          src="/images/review/satisfaction-badge.png"
          alt=""
          className="size-[78px] shrink-0 object-cover xl:size-[131px]"
        />

        <div className="hidden min-w-0 flex-1 xl:block">
          <p className="text-lg font-semibold leading-tight tracking-body text-text">
            {meta.guarantee.title}
          </p>
          <p className="mt-11 text-lg leading-tight tracking-body text-text xl:mt-20">
            {meta.guarantee.body}
          </p>
        </div>

        <div
          className="flex flex-col items-end justify-center gap-8 xl:hidden"
          data-testid="review-totals-compact"
        >
          <span className="rounded-badge-sm bg-brand px-8 py-5 text-xs leading-tight tracking-tight-sm text-on-brand">
            {meta.financing.label}
          </span>
          <div className="flex items-baseline gap-8">
            {showTotalCompareAt ? (
              <span className="text-lg font-medium leading-stepper text-gray-600 line-through">
                {formatPrice(totals.compareAtSubtotal, totals.currency)}
              </span>
            ) : null}
            <span className="text-2xl font-bold leading-total tracking-tight-sm text-brand">
              {formatPrice(totals.total, totals.currency)}
            </span>
          </div>
        </div>
      </div>

      <div
        className="hidden items-center justify-between gap-25 xl:flex"
        data-testid="review-totals-desktop"
      >
        <span className="rounded-badge-sm bg-brand px-8 py-8 text-base leading-tight tracking-tight-sm text-on-brand">
          {meta.financing.label}
        </span>
        <div className="flex items-baseline gap-8">
          {showTotalCompareAt ? (
            <span className="text-[1.375rem] font-medium leading-stepper text-gray-600 line-through">
              {formatPrice(totals.compareAtSubtotal, totals.currency)}
            </span>
          ) : null}
          <span className="text-3xl font-bold leading-total tracking-tight-sm text-brand">
            {formatPrice(totals.total, totals.currency)}
          </span>
        </div>
      </div>

      {totals.savings > 0 ? (
        <p className="pt-10 text-center text-xs font-semibold leading-none tracking-tight-sm text-success lg:text-sm">
          {totals.savingsMessage}
        </p>
      ) : null}
    </div>
  );
}
