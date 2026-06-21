type NextStepButtonProps = {
  label: string;
  onClick: () => void;
  disabled?: boolean;
};

export function NextStepButton({
  label,
  onClick,
  disabled = false,
}: NextStepButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="font-semibold leading-ui w-full md:w-fit md:text-lg border border-brand-border rounded-button px-[24px] py-[10px] text-brand transition-opacity enabled:cursor-pointer enabled:hover:opacity-90 enabled:active:opacity-80 disabled:cursor-not-allowed disabled:opacity-50 "
    >
      {label}
    </button>
  );
}
