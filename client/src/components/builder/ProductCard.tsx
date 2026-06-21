import { VariantChips } from "@/components/builder/VariantChips";
import { QuantityStepper } from "@/components/shared/QuantityStepper";
import { formatPrice } from "@/lib/formatPrice";
import type { Product } from "@/types/catalog";

type ProductCardProps = {
  product: Product;
  currency: string;
  activeVariantId: string | null;
  quantity: number;
  minQuantity?: number;
  onVariantChange: (variantId: string) => void;
  onQuantityChange: (quantity: number) => void;
};

function resolveImageUrl(
  product: Product,
  activeVariantId: string | null,
): string {
  if (activeVariantId && product.variants?.length) {
    const variant = product.variants.find(
      (item) => item.id === activeVariantId,
    );
    if (variant?.imageUrl) {
      return variant.imageUrl;
    }
  }
  return product.imageUrl;
}

export function ProductCard({
  product,
  currency,
  activeVariantId,
  quantity,
  minQuantity = 0,
  onVariantChange,
  onQuantityChange,
}: ProductCardProps) {
  const hasVariants = Boolean(product.variants?.length);
  const imageUrl = resolveImageUrl(product, activeVariantId);
  const isSelected = quantity > 0;
  const showCompareAt =
    product.compareAtPrice !== undefined &&
    product.compareAtPrice > product.price;
  const isMonthly = product.pricingUnit === "monthly";
  const learnMoreUrl = product.learnMoreUrl ?? "#";

  const variantChips =
    hasVariants && product.variants ? (
      <VariantChips
        variants={product.variants}
        activeVariantId={activeVariantId}
        onSelect={onVariantChange}
      />
    ) : null;

  return (
    <article
      className={`flex gap-[19px] h-full w-full items-start overflow-hidden rounded-card bg-surface p-[11px] transition-colors lg:w-[224px] lg:min-h-[330px] lg:flex-col lg:justify-start ${
        isSelected
          ? " outline-2 outline-brand-border lg:py-[15px]"
          : "outline-none"
      }`}
    >
      <div
        className={`relative shrink-0 overflow-hidden rounded-image h-[137px] w-[101px] lg:h-[120px] lg:w-[202px] `}
      >
        <img
          src={imageUrl}
          alt=""
          className="absolute inset-0 h-full w-full object-contain"
        />
        {product.badge ? (
          <span className="absolute left-0 top-0 rounded-card bg-brand px-[6px] py-[2px] text-xs font-semibold text-on-brand">
            {product.badge.text}
          </span>
        ) : null}
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-between gap-[10px] lg:w-full lg:flex-none">
        <div className="flex flex-col gap-[8px]">
          <h3
            className={`font-semibold leading-none tracking-body text-text ${
              isSelected ? "text-base lg:text-lg" : "text-base"
            }`}
          >
            {product.title}
          </h3>
          <p
            className={`font-medium leading-body tracking-body text-text-body ${
              isSelected ? "text-xs lg:text-sm" : "text-xs"
            }`}
          >
            <span>{product.description} </span>
            <a
              href={learnMoreUrl}
              className="text-link underline decoration-solid underline-offset-auto"
            >
              Learn More
            </a>
          </p>
        </div>

        {variantChips}

        <div
          className={`flex w-full items-end ${
            isSelected ? "gap-[10px]" : "gap-[46px]"
          }`}
        >
          <QuantityStepper
            value={quantity}
            min={minQuantity}
            onChange={onQuantityChange}
            ariaLabel={`${product.title} quantity`}
            variant="compact"
          />

          <div className="flex min-w-0 flex-1 flex-col items-end gap-[3px] text-right text-base leading-none tracking-body lg:flex-row lg:items-center lg:justify-end">
            {showCompareAt ? (
              <span className="shrink-0 text-sale line-through">
                {formatPrice(product.compareAtPrice!, currency)}
              </span>
            ) : null}
            <span className="shrink-0 text-gray-70">
              {formatPrice(product.price, currency, {
                format: isMonthly ? "monthly" : undefined,
              })}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
