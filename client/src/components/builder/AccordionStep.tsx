import { ProductList } from "@/components/builder/ProductList";
import { StepHeader } from "@/components/builder/StepHeader";
import type { BuilderStep, Product } from "@/types/catalog";

type AccordionStepProps = {
  step: BuilderStep;
  totalSteps: number;
  isOpen: boolean;
  selectedCount: number;
  currency: string;
  getActiveVariantId: (product: Product) => string;
  getQuantity: (product: Product) => number;
  onToggle: () => void;
  onVariantChange: (productId: string, variantId: string) => void;
  onQuantityChange: (
    productId: string,
    variantId: string | undefined,
    quantity: number,
  ) => void;
};

export function AccordionStep({
  step,
  totalSteps,
  isOpen,
  selectedCount,
  currency,
  getActiveVariantId,
  getQuantity,
  onToggle,
  onVariantChange,
  onQuantityChange,
}: AccordionStepProps) {
  if (!isOpen) {
    return (
      <StepHeader
        icon={step.icon}
        title={step.title}
        selectedCount={selectedCount}
        isOpen={false}
        onToggle={onToggle}
      />
    );
  }

  return (
    <section
      aria-labelledby={`step-${step.id}-title`}
      className="bg-step-bg px-15 py-20 md:px-20 md:py-24 lg:px-25 lg:py-25"
    >
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-step-label text-text-muted">
          Step {step.stepNumber} of {totalSteps}
        </p>
        <h2
          id={`step-${step.id}-title`}
          className="mt-15 text-2xl font-semibold leading-tight text-obsidian md:text-3xl"
        >
          {step.title}
        </h2>
      </div>

      <div className="mt-20 md:mt-24 lg:mt-25">
        <ProductList
          products={step.products}
          currency={currency}
          getActiveVariantId={getActiveVariantId}
          getQuantity={getQuantity}
          onVariantChange={onVariantChange}
          onQuantityChange={onQuantityChange}
        />
      </div>
    </section>
  );
}
