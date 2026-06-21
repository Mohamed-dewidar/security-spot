type ReviewActionsProps = {
  onCheckout: () => void;
  onSaveForLater: () => void;
  isSaving?: boolean;
  saved?: boolean;
  saveStatusMessage?: string | null;
  saveErrorMessage?: string | null;
};

export function ReviewActions({
  onCheckout,
  onSaveForLater,
  isSaving = false,
  saved = false,
  saveStatusMessage,
  saveErrorMessage,
}: ReviewActionsProps) {
  return (
    <div className="space-y-8">
      <button
        type="button"
        onClick={onCheckout}
        className="flex w-full items-center justify-center rounded-control bg-brand px-16 py-13 font-button text-md font-bold text-on-brand transition-opacity hover:opacity-90 active:opacity-80"
      >
        Checkout
      </button>

      <button
        type="button"
        onClick={onSaveForLater}
        disabled={isSaving}
        className="w-full text-center font-sans text-xs italic leading-snug tracking-tight text-text-muted underline transition-opacity enabled:cursor-pointer enabled:hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
      >
        {isSaving
          ? "Saving…"
          : saved
            ? "Saved for later"
            : "Save my system for later"}
      </button>

      <div aria-live="polite" aria-atomic="true" className="min-h-5">
        {saveStatusMessage ? (
          <p className="text-center text-sm font-medium text-success">
            {saveStatusMessage}
          </p>
        ) : null}
        {saveErrorMessage ? (
          <p
            role="alert"
            className="text-center text-sm font-medium text-red-600"
          >
            {saveErrorMessage}
          </p>
        ) : null}
      </div>
    </div>
  );
}
