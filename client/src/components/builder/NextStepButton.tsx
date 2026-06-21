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
      className="h-[39px] w-full rounded-button border border-brand px-24 py-5 font-semibold text-lg leading-ui text-brand transition-opacity enabled:cursor-pointer enabled:hover:opacity-90 enabled:active:opacity-80 disabled:cursor-not-allowed disabled:opacity-50 lg:w-fit"
    >
      {label}
    </button>
  );
}
