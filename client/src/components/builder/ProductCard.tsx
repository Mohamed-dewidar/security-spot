import { VariantChips } from "@/components/builder/VariantChips";
import { PriceBlock } from "@/components/shared/PriceBlock";
import { QuantityStepper } from "@/components/shared/QuantityStepper";
import type { PriceFormat } from "@/lib/formatPrice";
import type { Product } from "@/types/catalog";

type ProductCardProps = {
  product: Product;
  currency: string;
  activeVariantId: string | null;
  quantity: number;
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

function priceFormatForProduct(product: Product): PriceFormat {
  return product.pricingUnit === "monthly" ? "monthly" : "unit";
}

export function ProductCard({
  product,
  currency,
  activeVariantId,
  quantity,
  onVariantChange,
  onQuantityChange,
}: ProductCardProps) {
  const hasVariants = Boolean(product.variants?.length);
  const imageUrl = resolveImageUrl(product, activeVariantId);
  const priceFormat = priceFormatForProduct(product);
  const minQuantity = product.required && quantity > 0 ? 1 : 0;

  return (
    <article className="flex flex-col gap-15 border-b border-gray-300 pb-20 last:border-b-0 last:pb-0 md:flex-row md:items-start md:gap-20 lg:gap-24">
      <div className="relative mx-auto w-full max-w-[11.25rem] shrink-0 md:mx-0 md:w-[11.25rem] lg:w-[12.5rem]">
        <img
          src={imageUrl}
          alt=""
          className="aspect-square w-full rounded-image bg-gray-200 object-contain"
        />
        {product.badge ? (
          <span className="absolute left-0 top-0 rounded-badge-sm bg-success px-8 py-4 text-2xs font-semibold uppercase tracking-section text-success">
            {product.badge.text}
          </span>
        ) : null}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-12 md:gap-13">
        <div className="space-y-6">
          <h3 className="text-lg font-semibold leading-snug text-obsidian md:text-xl">
            {product.title}
          </h3>
          <p className="text-sm leading-body tracking-body text-text-body md:text-base">
            {product.description}
          </p>
        </div>

        {hasVariants && product.variants ? (
          <VariantChips
            variants={product.variants}
            activeVariantId={activeVariantId}
            onSelect={onVariantChange}
          />
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-12 md:gap-16">
          <PriceBlock
            price={product.price}
            compareAtPrice={product.compareAtPrice}
            currency={currency}
            format={priceFormat}
          />
          <QuantityStepper
            value={quantity}
            min={minQuantity}
            onChange={onQuantityChange}
            ariaLabel={`${product.title} quantity`}
          />
        </div>
      </div>
    </article>
  );
}
