import { StepIcon } from "@/components/builder/StepIcon";
import type { BuilderStep, StepIconId } from "@/types/catalog";

type StepHeaderProps = {
  icon: StepIconId;
  title: string;
  selectedCount: number;
  isOpen: boolean;
  step: BuilderStep;
  totalSteps: number;
  onToggle: () => void;
};

function ChevronIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className={`size-20 shrink-0 text-text transition-transform ${isOpen ? "rotate-180" : ""}`}
    >
      <path
        fill="currentColor"
        d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.94l3.71-3.71a.75.75 0 1 1 1.06 1.06l-4.24 4.25a.75.75 0 0 1-1.06 0L5.21 8.29a.75.75 0 0 1 .02-1.08Z"
      />
    </svg>
  );
}

export function StepHeader({
  icon,
  title,
  step,
  selectedCount,
  isOpen,
  totalSteps,
  onToggle,
}: StepHeaderProps) {
  const selectedLabel =
    selectedCount === 1 ? "1 selected" : `${selectedCount} selected`;

  return (
    <div className="mt-13">
      <p className="text-xs font-medium uppercase tracking-step-label text-text-muted">
        Step {step.stepNumber} of {totalSteps}
      </p>
      <button
        type="button"
        aria-expanded={isOpen}
        onClick={onToggle}
        className="flex w-full min-h-11 items-center gap-8 border-b border-t border-accordion-border py-15 text-left transition-colors hover:bg-gray-200/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand md:py-16 lg:py-19"
      >
        <StepIcon icon={icon} />
        <span className="min-w-0 flex-1 text-base font-semibold leading-snug text-obsidian md:text-lg">
          {title}
        </span>
        <span className="shrink-0 text-sm font-medium leading-body tracking-body text-text-body">
          {selectedLabel}
        </span>
        <ChevronIcon isOpen={isOpen} />
      </button>
    </div>
  );
}
