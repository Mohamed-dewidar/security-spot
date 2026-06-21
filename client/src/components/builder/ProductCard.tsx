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
      className={`flex h-full w-full flex-col items-start gap-[19px] overflow-hidden rounded-card bg-surface p-[11px] transition-colors lg:flex-row lg:items-center xl:min-h-[330px] xl:w-[224px] xl:flex-col xl:items-center xl:justify-start ${
        isSelected
          ? "outline-2 outline-brand-border xl:py-[15px]"
          : "outline-none"
      }`}
    >
      <div className="relative h-[120px] w-full shrink-0 overflow-hidden rounded-image lg:h-[137px] lg:w-[101px] xl:h-[120px] xl:w-full">
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

      <div className="flex w-full flex-1 flex-col justify-start gap-[10px] xl:w-full ">
        <div className="flex flex-col gap-[8px]">
          <h3
            className={`text-base font-semibold leading-none tracking-body text-text ${
              isSelected ? "xl:text-lg" : ""
            }`}
          >
            {product.title}
          </h3>
          <p
            className={`text-xs font-medium leading-body tracking-body text-text-body ${
              isSelected ? "xl:text-sm" : ""
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

        <div className={`mt-auto flex w-full items-center justify-between `}>
          <QuantityStepper
            value={quantity}
            min={minQuantity}
            onChange={onQuantityChange}
            ariaLabel={`${product.title} quantity`}
            variant="compact"
          />

          <div className="flex min-w-0 flex-1 flex-col items-end gap-[3px] text-right text-base leading-none tracking-body xl:flex-row xl:items-center xl:justify-end">
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
