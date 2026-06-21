import { ReviewPrice } from "@/components/review/ReviewPrice";

type ReviewShippingLineProps = {
  label: string;
  price: number;
  compareAtPrice?: number;
  currency: string;
};

export function ReviewShippingLine({
  label,
  price,
  compareAtPrice,
  currency,
}: ReviewShippingLineProps) {
  return (
    <div className="flex items-center gap-16">
      <div className="flex min-w-0 flex-1 items-center gap-12">
        <div className="flex size-[41px] shrink-0 items-center justify-center overflow-hidden rounded-image bg-surface">
          <img
            src="/images/review/delivery.png"
            alt=""
            className="size-[29px] object-contain"
          />
        </div>
        <p className="min-w-0 flex-1 text-xs font-medium leading-ui text-obsidian lg:text-sm xl:text-lg">
          {label}
        </p>
      </div>

      <ReviewPrice
        price={price}
        compareAtPrice={compareAtPrice}
        currency={currency}
      />
    </div>
  );
}
