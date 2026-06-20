import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ReviewLine } from "@/components/review/ReviewLine";

describe("ReviewLine", () => {
  it("renders label, line price, and quantity stepper", () => {
    render(
      <ReviewLine
        lineKey="wyze-cam-v4:white"
        label="Wyze Cam v4"
        variantLabel="White"
        quantity={2}
        price={55.96}
        compareAtPrice={71.96}
        currency="USD"
        onQuantityChange={() => {}}
      />,
    );

    expect(screen.getByText("Wyze Cam v4 — White")).toBeInTheDocument();
    expect(screen.getByText("$55.96")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("calls onQuantityChange from the stepper", () => {
    const onQuantityChange = vi.fn();

    render(
      <ReviewLine
        lineKey="wyze-cam-v4:white"
        label="Wyze Cam v4"
        quantity={1}
        price={27.98}
        currency="USD"
        onQuantityChange={onQuantityChange}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Increase Wyze Cam v4 quantity" }),
    );

    expect(onQuantityChange).toHaveBeenCalledWith(2);
  });

  it("uses monthly price formatting when requested", () => {
    render(
      <ReviewLine
        lineKey="cam-unlimited:default"
        label="Cam Unlimited"
        quantity={1}
        price={9.99}
        currency="USD"
        priceFormat="monthly"
        onQuantityChange={() => {}}
      />,
    );

    expect(screen.getByText("$9.99/mo")).toBeInTheDocument();
  });
});
