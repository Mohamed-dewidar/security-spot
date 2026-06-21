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
      className="flex max-w-full flex-wrap gap-[6px] overflow-x-auto pb-px scrollbar-none rounded-chip "
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
            className={`inline-flex h-[26px] lg:px-px lg:py-[3px] shrink-0 items-center overflow-hidden rounded-chip border-hairline transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
              isActive
                ? "border-success bg-success-bg px-[3px]"
                : "border-chip-border bg-surface px-[5px] hover:border-gray-500"
            }`}
          >
            {variant.imageUrl ? (
              <img
                src={variant.imageUrl}
                alt=""
                className="size-20 shrink-0 rounded-image object-contain"
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
