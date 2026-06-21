type QuantityStepperProps = {
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  /** Distinguishes multiple steppers on one screen for assistive tech. */
  ariaLabel?: string;
  /**
   * compact — card-style stepper (no outer container border; smaller 20px
   * buttons). Use on ProductCard. Default style is used in ReviewPanel.
   */
  compact?: boolean;
};

const defaultButtonClassName =
  "inline-flex shrink-0 items-center justify-center border-0 bg-transparent text-text transition-colors enabled:cursor-pointer enabled:hover:bg-gray-200 enabled:active:bg-gray-300 disabled:cursor-not-allowed disabled:text-gray-500 disabled:bg-stepper-disabled min-h-11 min-w-11 text-base leading-stepper md:min-h-9 md:min-w-9 md:text-sm";

function CompactMinusIcon() {
  return (
    <svg
      width="8"
      height="10"
      viewBox="0 0 8 10"
      fill="none"
      aria-hidden
      className="shrink-0"
    >
      <path
        d="M0 5H8"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CompactPlusIcon() {
  return (
    <svg
      width="8"
      height="8"
      viewBox="0 0 8 8"
      fill="none"
      aria-hidden
      className="shrink-0"
    >
      <path
        d="M4 0V8M0 4H8"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function QuantityStepper({
  value,
  min = 0,
  max = 99,
  onChange,
  disabled = false,
  ariaLabel = "Quantity",
  compact = false,
}: QuantityStepperProps) {
  const atMin = value <= min;
  const atMax = value >= max;

  const decrement = () => {
    if (!atMin) onChange(value - 1);
  };

  const increment = () => {
    if (!atMax) onChange(value + 1);
  };

  if (compact) {
    const minusButtonClassName = atMin
      ? "inline-flex size-[20px] shrink-0 items-center justify-center rounded-control border-2 border-gray-300 bg-surface text-text transition-colors disabled:cursor-not-allowed disabled:opacity-40"
      : "inline-flex size-[20px] shrink-0 items-center justify-center rounded-control bg-gray-200 text-text transition-colors enabled:cursor-pointer enabled:hover:bg-gray-300 enabled:active:bg-gray-400 disabled:cursor-not-allowed disabled:opacity-40";

    return (
      <div
        role="group"
        aria-label={ariaLabel}
        className="inline-flex shrink-0 items-center justify-center gap-[10px] py-[4px]"
      >
        <button
          type="button"
          aria-label={`Decrease ${ariaLabel}`}
          disabled={disabled || atMin}
          onClick={decrement}
          className={minusButtonClassName}
        >
          <CompactMinusIcon />
        </button>
        <span
          aria-live="polite"
          aria-atomic="true"
          className="min-w-[16px] text-center text-base font-medium leading-stepper text-obsidian tabular-nums"
        >
          {value}
        </span>
        <button
          type="button"
          aria-label={`Increase ${ariaLabel}`}
          disabled={disabled || atMax}
          onClick={increment}
          className="inline-flex size-[20px] shrink-0 items-center justify-center rounded-control bg-gray-200 text-text transition-colors enabled:cursor-pointer enabled:hover:bg-gray-300 enabled:active:bg-gray-400 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <CompactPlusIcon />
        </button>
      </div>
    );
  }

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className="inline-flex items-stretch overflow-hidden rounded-control border border-gray-400 bg-surface"
    >
      <button
        type="button"
        className={`${defaultButtonClassName} rounded-l-control border-r border-gray-400`}
        aria-label={`Decrease ${ariaLabel}`}
        disabled={disabled || atMin}
        onClick={decrement}
      >
        −
      </button>
      <span
        aria-live="polite"
        aria-atomic="true"
        className="flex min-w-11 items-center justify-center border-r border-gray-400 px-8 text-base font-medium leading-stepper text-text tabular-nums md:min-w-9 md:px-6 md:text-sm"
      >
        {value}
      </span>
      <button
        type="button"
        className={`${defaultButtonClassName} rounded-r-control`}
        aria-label={`Increase ${ariaLabel}`}
        disabled={disabled || atMax}
        onClick={increment}
      >
        +
      </button>
    </div>
  );
}
