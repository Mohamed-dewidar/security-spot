import { PriceBlock } from "@/components/shared/PriceBlock";
import { QuantityStepper } from "@/components/shared/QuantityStepper";
import type { PriceFormat } from "@/lib/formatPrice";

export type ReviewLineProps = {
  lineKey: string;
  label: string;
  variantLabel?: string;
  imageUrl?: string;
  quantity: number;
  price: number;
  compareAtPrice?: number;
  currency: string;
  priceFormat?: PriceFormat;
  minQuantity?: number;
  onQuantityChange: (quantity: number) => void;
};

export function ReviewLine({
  lineKey,
  label,
  variantLabel,
  imageUrl,
  quantity,
  price,
  compareAtPrice,
  currency,
  priceFormat = "line",
  minQuantity = 0,
  onQuantityChange,
}: ReviewLineProps) {
  const displayLabel = variantLabel ? `${label} — ${variantLabel}` : label;

  return (
    <li
      data-testid={`review-line-${lineKey}`}
      data-line-key={lineKey}
      className="flex items-start gap-12 border-b border-gray-300 py-15 last:border-b-0 last:pb-0 md:gap-15 md:py-16"
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt=""
          className="size-15 shrink-0 rounded-image bg-gray-200 object-contain md:size-16"
        />
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col gap-10 sm:flex-row sm:items-center sm:justify-between sm:gap-12">
        <div className="min-w-0 space-y-4">
          <p className="text-sm font-medium leading-snug text-obsidian md:text-base">
            {displayLabel}
          </p>
          <PriceBlock
            price={price}
            compareAtPrice={compareAtPrice}
            currency={currency}
            format={priceFormat}
          />
        </div>

        <QuantityStepper
          value={quantity}
          min={minQuantity}
          onChange={onQuantityChange}
          ariaLabel={`${displayLabel} quantity`}
        />
      </div>
    </li>
  );
}
