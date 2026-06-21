import { formatPrice, type PriceFormat } from "@/lib/formatPrice";

type ReviewPriceProps = {
  price: number;
  compareAtPrice?: number;
  currency?: string;
  format?: PriceFormat;
};

function formatReviewAmount(
  amount: number,
  currency: string,
  format: PriceFormat,
): string {
  if (amount === 0) {
    return "FREE";
  }

  return formatPrice(amount, currency, { format });
}

export function ReviewPrice({
  price,
  compareAtPrice,
  currency = "USD",
  format = "line",
}: ReviewPriceProps) {
  const showCompareAt = compareAtPrice !== undefined && compareAtPrice > price;

  return (
    <div className="flex shrink-0 flex-col items-end gap-0 xl:flex-row xl:items-center xl:gap-10">
      {showCompareAt ? (
        <span className="text-sm font-medium leading-ui text-gray-600 line-through xl:text-base">
          {formatPrice(compareAtPrice, currency, { format })}
        </span>
      ) : null}
      <span className="text-sm font-semibold leading-ui text-brand xl:text-base">
        {formatReviewAmount(price, currency, format)}
      </span>
    </div>
  );
}
