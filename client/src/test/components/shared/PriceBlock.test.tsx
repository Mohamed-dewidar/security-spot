import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PriceBlock } from "@/components/shared/PriceBlock";

describe("PriceBlock", () => {
  it("renders formatted current price", () => {
    render(<PriceBlock price={27.98} />);

    expect(screen.getByText("$27.98")).toBeInTheDocument();
  });

  it("renders compare-at when it is higher than the current price", () => {
    render(<PriceBlock price={27.98} compareAtPrice={35.98} />);

    expect(screen.getByText("$35.98")).toHaveClass("line-through");
  });

  it("omits compare-at when it is not higher", () => {
    render(<PriceBlock price={35.98} compareAtPrice={27.98} />);

    expect(
      screen.queryByText("$27.98", { selector: "span.line-through" }),
    ).not.toBeInTheDocument();
  });

  it("wraps prices on narrow layouts", () => {
    const { container } = render(
      <PriceBlock price={27.98} compareAtPrice={35.98} />,
    );

    expect(container.firstChild).toHaveClass("flex-wrap");
  });

  it("appends monthly suffix", () => {
    render(<PriceBlock price={19.19} format="monthly" />);

    expect(screen.getByText("$19.19/mo")).toBeInTheDocument();
  });
});
