type ReviewActionsProps = {
  onCheckout: () => void;
  onSaveForLater: () => void;
  isSaving?: boolean;
  saved?: boolean;
};

export function ReviewActions({
  onCheckout,
  onSaveForLater,
  isSaving = false,
  saved = false,
}: ReviewActionsProps) {
  return (
    <div className="space-y-12 border-t border-gray-300 pt-20 md:space-y-13 md:pt-24">
      <button
        type="button"
        onClick={onCheckout}
        className="flex w-full min-h-11 items-center justify-center rounded-button bg-brand px-20 py-12 font-button text-base font-bold leading-ui text-on-brand transition-opacity hover:opacity-90 active:opacity-80 md:min-h-12 md:text-lg"
      >
        Checkout
      </button>

      <button
        type="button"
        onClick={onSaveForLater}
        disabled={isSaving}
        aria-live="polite"
        className="flex w-full min-h-11 items-center justify-center rounded-button border border-brand-border bg-surface px-20 py-12 font-button text-base font-bold leading-ui text-brand transition-opacity enabled:cursor-pointer enabled:hover:bg-gray-200 enabled:active:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50 md:min-h-12 md:text-lg"
      >
        {isSaving
          ? "Saving…"
          : saved
            ? "Saved for later"
            : "Save my system for later"}
      </button>
    </div>
  );
}
