type QuantityStepperProps = {
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  /** Distinguishes multiple steppers on one screen for assistive tech. */
  ariaLabel?: string;
};

const buttonClassName =
  "inline-flex shrink-0 items-center justify-center border-0 bg-transparent text-text transition-colors enabled:cursor-pointer enabled:hover:bg-gray-200 enabled:active:bg-gray-300 disabled:cursor-not-allowed disabled:text-gray-500 disabled:bg-stepper-disabled min-h-11 min-w-11 text-base leading-stepper md:min-h-9 md:min-w-9 md:text-sm";

export function QuantityStepper({
  value,
  min = 0,
  max = 99,
  onChange,
  disabled = false,
  ariaLabel = "Quantity",
}: QuantityStepperProps) {
  const atMin = value <= min;
  const atMax = value >= max;

  const decrement = () => {
    if (!atMin) {
      onChange(value - 1);
    }
  };

  const increment = () => {
    if (!atMax) {
      onChange(value + 1);
    }
  };

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className="inline-flex items-stretch overflow-hidden rounded-control border border-gray-400 bg-surface"
    >
      <button
        type="button"
        className={`${buttonClassName} rounded-l-control border-r border-gray-400`}
        aria-label="Decrease quantity"
        disabled={disabled || atMin}
        onClick={decrement}
      >
        −
      </button>
      <span
        aria-live="polite"
        className="flex min-w-11 items-center justify-center border-r border-gray-400 px-8 text-base font-medium leading-stepper text-text tabular-nums md:min-w-9 md:px-6 md:text-sm"
      >
        {value}
      </span>
      <button
        type="button"
        className={`${buttonClassName} rounded-r-control`}
        aria-label="Increase quantity"
        disabled={disabled || atMax}
        onClick={increment}
      >
        +
      </button>
    </div>
  );
}
