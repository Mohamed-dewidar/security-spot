import { formatPrice, type PriceFormat } from "@/lib/formatPrice";

type PriceBlockProps = {
  price: number;
  compareAtPrice?: number;
  currency?: string;
  format?: PriceFormat;
};

const priceSizeByFormat: Record<PriceFormat, string> = {
  unit: "text-lg font-semibold md:text-xl",
  line: "text-base font-semibold md:text-lg",
  monthly: "text-lg font-semibold md:text-xl",
};

const compareSizeByFormat: Record<PriceFormat, string> = {
  unit: "text-sm md:text-base",
  line: "text-xs md:text-sm",
  monthly: "text-sm md:text-base",
};

export function PriceBlock({
  price,
  compareAtPrice,
  currency = "USD",
  format = "unit",
}: PriceBlockProps) {
  const showCompareAt = compareAtPrice !== undefined && compareAtPrice > price;

  return (
    <div className="flex max-w-full flex-wrap items-baseline gap-x-8 gap-y-4">
      <span
        className={`tracking-tight-sm text-text ${priceSizeByFormat[format]}`}
      >
        {formatPrice(price, currency, { format })}
      </span>
      {showCompareAt ? (
        <span
          className={`text-sale line-through ${compareSizeByFormat[format]}`}
        >
          {formatPrice(compareAtPrice, currency, { format })}
        </span>
      ) : null}
    </div>
  );
}
