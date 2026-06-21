import { NextStepButton } from "@/components/builder/NextStepButton";
import { ProductList } from "@/components/builder/ProductList";
import { StepHeader } from "@/components/builder/StepHeader";
import type { BuilderStep, Product } from "@/types/catalog";

type AccordionStepProps = {
  step: BuilderStep;
  totalSteps: number;
  isOpen: boolean;
  selectedCount: number;
  currency: string;
  nextStepLabel?: string;
  getActiveVariantId: (product: Product) => string;
  getQuantity: (product: Product) => number;
  getMinQuantity: (product: Product) => number;
  onToggle: () => void;
  onNextStep?: () => void;
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
  nextStepLabel,
  getActiveVariantId,
  getQuantity,
  getMinQuantity,
  onToggle,
  onNextStep,
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
        step={step}
        totalSteps={totalSteps}
        onToggle={onToggle}
      />
    );
  }

  const titleId = `step-${step.id}-title`;

  return (
    <section
      aria-labelledby={titleId}
      className="mt-13 overflow-hidden rounded-card bg-step-bg pt-15"
    >
      <p className="px-15 mb-5 text-xs font-medium uppercase tracking-step-label text-text-muted">
        Step {step.stepNumber} of {totalSteps}
      </p>

      <div className="flex flex-col gap-15 border-t border-accordion-border px-15 py-20">
        <StepHeader
          icon={step.icon}
          title={step.title}
          selectedCount={selectedCount}
          isOpen
          step={step}
          totalSteps={totalSteps}
          titleId={titleId}
          variant="expanded"
          onToggle={onToggle}
        />

        <ProductList
          products={step.products}
          currency={currency}
          getActiveVariantId={getActiveVariantId}
          getQuantity={getQuantity}
          getMinQuantity={getMinQuantity}
          onVariantChange={onVariantChange}
          onQuantityChange={onQuantityChange}
        />

        {nextStepLabel && onNextStep ? (
          <div className="flex justify-center">
            <NextStepButton label={nextStepLabel} onClick={onNextStep} />
          </div>
        ) : null}
      </div>
    </section>
  );
}
