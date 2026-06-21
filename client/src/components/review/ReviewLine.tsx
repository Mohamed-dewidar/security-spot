import { ReviewPrice } from "@/components/review/ReviewPrice";
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
  showStepper?: boolean;
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
  showStepper = true,
  onQuantityChange,
}: ReviewLineProps) {
  const ariaLabel = variantLabel ? `${label} — ${variantLabel}` : label;

  return (
    <li
      data-testid={`review-line-${lineKey}`}
      data-line-key={lineKey}
      className="flex items-start gap-16 lg:items-center"
    >
      <div className="flex min-w-0 flex-1 items-center gap-12">
        {imageUrl ? (
          <div className="relative size-[41px] shrink-0 overflow-hidden rounded-image bg-surface">
            <img src={imageUrl} alt="" className="size-full object-contain" />
          </div>
        ) : null}

        <p className="min-w-0 flex-1 text-xs font-medium leading-ui text-obsidian md:text-sm lg:text-lg">
          {label}
        </p>

        {showStepper ? (
          <QuantityStepper
            value={quantity}
            min={minQuantity}
            onChange={onQuantityChange}
            ariaLabel={`${ariaLabel} quantity`}
            variant="review"
          />
        ) : null}
      </div>

      <ReviewPrice
        price={price}
        compareAtPrice={compareAtPrice}
        currency={currency}
        format={priceFormat}
      />
    </li>
  );
}
