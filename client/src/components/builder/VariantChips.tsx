import type { ProductVariant } from "@/types/catalog";

type VariantChipsProps = {
  variants: ProductVariant[];
  activeVariantId: string | null;
  onSelect: (variantId: string) => void;
};

const chipClassName =
  "inline-flex shrink-0 items-center justify-center rounded-chip border px-12 py-8 text-sm leading-body tracking-body text-text transition-colors min-h-11 md:min-h-0 md:px-10 md:py-6 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

export function VariantChips({
  variants,
  activeVariantId,
  onSelect,
}: VariantChipsProps) {
  return (
    <div
      role="listbox"
      aria-label="Product variants"
      className="flex max-w-full gap-8 overflow-x-auto pb-1 scrollbar-none [-ms-overflow-style:none] max-md:flex-nowrap md:flex-wrap md:overflow-visible [&::-webkit-scrollbar]:hidden"
    >
      {variants.map((variant) => {
        const isActive = variant.id === activeVariantId;

        return (
          <button
            key={variant.id}
            type="button"
            role="option"
            aria-selected={isActive}
            className={`${chipClassName} ${
              isActive
                ? "border-brand bg-step-bg font-medium"
                : "border-chip-border bg-surface hover:border-gray-500"
            }`}
            onClick={() => onSelect(variant.id)}
          >
            {variant.label}
          </button>
        );
      })}
    </div>
  );
}
