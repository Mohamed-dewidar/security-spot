import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ReviewActions } from "@/components/review/ReviewActions";

describe("ReviewActions", () => {
  it("renders checkout and save actions", () => {
    render(<ReviewActions onCheckout={() => {}} onSaveForLater={() => {}} />);

    expect(
      screen.getByRole("button", { name: "Checkout" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Save my system for later" }),
    ).toBeInTheDocument();
  });

  it("invokes callbacks when clicked", () => {
    const onCheckout = vi.fn();
    const onSaveForLater = vi.fn();

    render(
      <ReviewActions onCheckout={onCheckout} onSaveForLater={onSaveForLater} />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Checkout" }));
    fireEvent.click(
      screen.getByRole("button", { name: "Save my system for later" }),
    );

    expect(onCheckout).toHaveBeenCalledOnce();
    expect(onSaveForLater).toHaveBeenCalledOnce();
  });

  it("shows saving and saved feedback", () => {
    const { rerender } = render(
      <ReviewActions
        onCheckout={() => {}}
        onSaveForLater={() => {}}
        isSaving
      />,
    );

    expect(screen.getByRole("button", { name: "Saving…" })).toBeInTheDocument();

    rerender(
      <ReviewActions
        onCheckout={() => {}}
        onSaveForLater={() => {}}
        saved
        saveStatusMessage="Your system was saved for later."
      />,
    );

    expect(
      screen.getByRole("button", { name: "Saved for later" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Your system was saved for later."),
    ).toBeInTheDocument();
  });

  it("renders save errors in an alert region", () => {
    render(
      <ReviewActions
        onCheckout={() => {}}
        onSaveForLater={() => {}}
        saveErrorMessage="Could not save right now."
      />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Could not save right now.",
    );
  });
});
