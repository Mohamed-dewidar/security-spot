import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { QuantityStepper } from "@/components/shared/QuantityStepper";

describe("QuantityStepper", () => {
  it("renders the current value", () => {
    render(<QuantityStepper value={2} onChange={() => {}} />);

    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("increments and decrements within bounds", () => {
    const onChange = vi.fn();

    render(<QuantityStepper value={1} min={0} max={3} onChange={onChange} />);

    fireEvent.click(screen.getByRole("button", { name: "Increase quantity" }));
    expect(onChange).toHaveBeenCalledWith(2);

    fireEvent.click(screen.getByRole("button", { name: "Decrease quantity" }));
    expect(onChange).toHaveBeenCalledWith(0);
  });

  it("disables controls at min and max", () => {
    const { rerender } = render(
      <QuantityStepper value={0} min={0} max={5} onChange={() => {}} />,
    );

    expect(
      screen.getByRole("button", { name: "Decrease quantity" }),
    ).toBeDisabled();

    rerender(<QuantityStepper value={5} min={0} max={5} onChange={() => {}} />);

    expect(
      screen.getByRole("button", { name: "Increase quantity" }),
    ).toBeDisabled();
  });

  it("uses larger touch targets on mobile breakpoints", () => {
    render(<QuantityStepper value={1} onChange={() => {}} />);

    expect(
      screen.getByRole("button", { name: "Increase quantity" }),
    ).toHaveClass("min-h-11", "min-w-11");
  });
});
