import arrowIcon from "@/assets/icons/arrow.svg";
import { StepIcon } from "@/components/builder/StepIcon";
import type { BuilderStep, StepIconId } from "@/types/catalog";

type StepHeaderProps = {
  icon: StepIconId;
  title: string;
  selectedCount: number;
  isOpen: boolean;
  step: BuilderStep;
  totalSteps: number;
  titleId?: string;
  variant?: "collapsed" | "expanded";
  onToggle: () => void;
};

function ChevronIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <img
      src={arrowIcon}
      alt=""
      aria-hidden="true"
      className={`shrink-0 object-contain ${!isOpen ? "rotate-180" : ""}`}
    />
  );
}

export function StepHeader({
  icon,
  title,
  step,
  selectedCount,
  isOpen,
  totalSteps,
  titleId,
  variant = "collapsed",
  onToggle,
}: StepHeaderProps) {
  const selectedLabel =
    selectedCount === 1 ? "1 selected" : `${selectedCount} selected`;
  const isExpanded = variant === "expanded";

  const headerButton = (
    <button
      type="button"
      aria-expanded={isOpen}
      onClick={onToggle}
      className={
        isExpanded
          ? "flex w-full min-h-11 items-center gap-8 py-0 text-left transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          : "flex w-full min-h-11 items-center gap-8 border-b border-t border-accordion-border py-20 px-15 text-left transition-colors hover:bg-gray-200/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand "
      }
    >
      <StepIcon icon={icon} className="size-20 lg:size-[26px] xl:size-[30px]" />
      <span
        id={titleId}
        className={`text-lg lg:text-2xl xl:text-3xl ${
          isExpanded
            ? "min-w-0 flex-1  font-semibold leading-none text-obsidian"
            : "min-w-0 flex-1  font-semibold leading-snug text-obsidian "
        }`}
      >
        {title}
      </span>
      {isOpen && (
        <span
          className={
            isExpanded
              ? "shrink-0 text-sm font-medium leading-ui text-brand"
              : "shrink-0 text-sm font-medium leading-body tracking-body text-text-body"
          }
        >
          {selectedLabel}
        </span>
      )}
      <ChevronIcon isOpen={isOpen} />
    </button>
  );

  if (isExpanded) {
    return headerButton;
  }

  return (
    <div className="mt-13">
      <p className="text-2xs mb-5 px-15 font-medium uppercase tracking-step-label text-text-muted lg:text-xs">
        Step {step.stepNumber} of {totalSteps}
      </p>
      {headerButton}
    </div>
  );
}
