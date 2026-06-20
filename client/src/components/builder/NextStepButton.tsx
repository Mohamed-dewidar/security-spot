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
      className="mt-20 flex w-full min-h-11 items-center justify-center gap-8 rounded-button bg-brand px-20 py-12 font-button text-base font-bold leading-ui text-on-brand transition-opacity enabled:cursor-pointer enabled:hover:opacity-90 enabled:active:opacity-80 disabled:cursor-not-allowed disabled:opacity-50 md:mt-24 md:min-h-12 md:text-lg lg:mt-25"
    >
      {label}
      <svg aria-hidden="true" viewBox="0 0 20 20" className="size-20 shrink-0">
        <path
          fill="currentColor"
          d="M7.21 5.23a.75.75 0 0 1 1.08-.02l4.25 4.24a.75.75 0 0 1 0 1.06l-4.25 4.24a.75.75 0 0 1-1.06-1.06L10.94 10 7.21 6.27a.75.75 0 0 1 .02-1.04Z"
        />
      </svg>
    </button>
  );
}
