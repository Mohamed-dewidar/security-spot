import type { ProductVariant } from "@/types/catalog";

type VariantChipsProps = {
  variants: ProductVariant[];
  activeVariantId: string | null;
  onSelect: (variantId: string) => void;
};

export function VariantChips({
  variants,
  activeVariantId,
  onSelect,
}: VariantChipsProps) {
  return (
    <div
      role="listbox"
      aria-label="Product variants"
      className="flex max-w-full flex-wrap gap-[6px] overflow-x-auto  scrollbar-none"
    >
      {variants.map((variant) => {
        const isActive = variant.id === activeVariantId;

        return (
          <button
            key={variant.id}
            type="button"
            role="option"
            aria-selected={isActive}
            onClick={() => onSelect(variant.id)}
            className={`inline-flex h-[26px] w-fit shrink-0 items-center justify-center overflow-hidden rounded-chip border-hairline p transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
              isActive
                ? "border-success bg-success-bg "
                : "border-chip-border bg-surface  hover:border-gray-500"
            }`}
          >
            {variant.imageUrl ? (
              <img
                src={variant.imageUrl}
                alt=""
                className="size-[22px] shrink-0 rounded-image object-cover"
              />
            ) : null}
            <span className="whitespace-nowrap px-[4px] text-[10px] font-medium leading-none tracking-body text-text">
              {variant.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
