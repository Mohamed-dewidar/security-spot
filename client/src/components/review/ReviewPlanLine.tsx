import { ReviewPrice } from "@/components/review/ReviewPrice";
import type { PriceFormat } from "@/lib/formatPrice";

type ReviewPlanLineProps = {
  lineKey: string;
  price: number;
  compareAtPrice?: number;
  currency: string;
  priceFormat?: PriceFormat;
};

export function ReviewPlanLine({
  lineKey,
  price,
  compareAtPrice,
  currency,
  priceFormat = "monthly",
}: ReviewPlanLineProps) {
  return (
    <li
      data-testid={`review-line-${lineKey}`}
      data-line-key={lineKey}
      className="flex items-start justify-between gap-16"
    >
      <div className="flex min-w-0 items-center gap-3">
        <img
          src="/images/review/wyze-plan-logo.png"
          alt=""
          className="h-[17px] w-[14px] shrink-0 object-contain md:h-[24px] md:w-[20px] lg:h-[31px] lg:w-[26px]"
        />
        <p className="text-sm font-bold leading-none tracking-tight text-text md:text-base lg:text-xl">
          <span>Cam </span>
          <span className="text-brand">Unlimited</span>
        </p>
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
