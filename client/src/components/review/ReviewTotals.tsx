import { formatPrice } from "@/lib/formatPrice";
import type { Quote } from "@/types/api";
import type { CatalogMeta } from "@/types/catalog";

type ReviewTotalsProps = {
  totals: Omit<Quote, "configurationId" | "lines">;
  meta: Pick<CatalogMeta, "shipping" | "guarantee" | "financing">;
};

export function ReviewTotals({ totals, meta }: ReviewTotalsProps) {
  const showShippingCompareAt =
    meta.shipping.compareAtPrice !== undefined &&
    meta.shipping.compareAtPrice > meta.shipping.price;
  const showTotalCompareAt = totals.compareAtSubtotal > totals.total;

  return (
    <div className="space-y-16 border-t border-gray-300 pt-20 md:space-y-20 md:pt-24">
      <dl className="space-y-12 text-sm md:text-base">
        <div className="flex items-baseline justify-between gap-12">
          <dt className="font-medium text-text-body">{meta.shipping.label}</dt>
          <dd className="flex flex-wrap items-baseline justify-end gap-x-8 gap-y-4">
            <span className="font-semibold text-text">
              {formatPrice(meta.shipping.price, totals.currency)}
            </span>
            {showShippingCompareAt ? (
              <span className="text-sale line-through">
                {formatPrice(meta.shipping.compareAtPrice!, totals.currency)}
              </span>
            ) : null}
          </dd>
        </div>
      </dl>

      <div className="space-y-6 rounded-control bg-gray-200 px-15 py-12 md:px-16 md:py-13">
        <p className="text-sm font-semibold text-obsidian md:text-base">
          {meta.guarantee.title}
        </p>
        <p className="text-xs leading-body tracking-body text-text-body md:text-sm">
          {meta.guarantee.body}
        </p>
      </div>

      <p className="text-sm font-medium text-text-body md:text-base">
        {meta.financing.label}
      </p>

      <div className="space-y-8">
        <div className="flex flex-wrap items-baseline justify-between gap-x-12 gap-y-4">
          <span className="text-lg font-semibold text-obsidian md:text-xl">
            Total
          </span>
          <div className="flex flex-wrap items-baseline justify-end gap-x-8 gap-y-4">
            <span className="text-2xl font-bold leading-total tracking-tight-sm text-obsidian md:text-3xl">
              {formatPrice(totals.total, totals.currency)}
            </span>
            {showTotalCompareAt ? (
              <span className="text-base text-sale line-through md:text-lg">
                {formatPrice(totals.compareAtSubtotal, totals.currency)}
              </span>
            ) : null}
          </div>
        </div>

        {totals.savings > 0 ? (
          <p className="text-sm font-semibold text-success md:text-base">
            {totals.savingsMessage}
          </p>
        ) : null}
      </div>
    </div>
  );
}
