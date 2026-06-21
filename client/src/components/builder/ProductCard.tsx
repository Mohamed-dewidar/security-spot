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

  return (
    <article
      className={` h-full w-full lg:w-[224px] flex items-start gap-[19px] overflow-hidden rounded-card bg-surface p-[11px] transition-colors lg:flex-col lg:py-[15px] ${
        isSelected ? "border-2 border-brand-border" : ""
      }`}
    >
      {/* Image — portrait on mobile/tablet, landscape on desktop */}
      <div className="relative h-[137px] w-[101px] shrink-0 overflow-hidden rounded-image lg:h-[117px] lg:w-[202px]">
        <img
          src={imageUrl}
          alt=""
          className="absolute inset-0 h-full w-full object-contain"
        />
        {product.badge ? (
          <span className="absolute left-0 top-0 rounded-full bg-brand px-6 py-2 text-xs font-semibold text-on-brand">
            {product.badge.text}
          </span>
        ) : null}
      </div>

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col gap-[10px] lg:w-full lg:flex-none">
        {/* Title + description */}
        <div className="space-y-[8px]">
          <h3 className="text-base font-semibold leading-snug tracking-body text-text lg:text-lg">
            {product.title}
          </h3>
          <p className="text-xs leading-body tracking-body text-text-body lg:text-sm">
            {product.description}
          </p>
        </div>

        {/* Variant chips */}
        {hasVariants && product.variants ? (
          <VariantChips
            variants={product.variants}
            activeVariantId={activeVariantId}
            onSelect={onVariantChange}
          />
        ) : null}

        {/* Stepper (left) + price column (right) */}
        <div className="flex w-full items-end gap-[10px]">
          <QuantityStepper
            value={quantity}
            min={minQuantity}
            onChange={onQuantityChange}
            ariaLabel={`${product.title} quantity`}
            compact
          />

          <div className="flex flex-1 flex-col items-end gap-[3px] text-right">
            {showCompareAt ? (
              <span className="text-base leading-none tracking-body text-sale line-through">
                {formatPrice(product.compareAtPrice!, currency)}
              </span>
            ) : null}
            <span className="text-base leading-none tracking-body text-gray-70">
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
