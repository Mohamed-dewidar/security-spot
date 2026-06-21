import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ReviewTotals } from "@/components/review/ReviewTotals";

const meta = {
  guarantee: {
    title: "30-day hassle-free returns",
    body: "If you're not totally in love with the product, we will refund you 100%.",
  },
  financing: { label: "as low as $19.19/mo" },
};

describe("ReviewTotals", () => {
  it("renders shipping, guarantee, financing, total, and savings", () => {
    render(
      <ReviewTotals
        totals={{
          currency: "USD",
          subtotal: 100,
          compareAtSubtotal: 150,
          savings: 50,
          shipping: 0,
          shippingCompareAt: 5.99,
          total: 100,
          savingsMessage:
            "Congrats! You're saving $50 on your security bundle!",
        }}
        meta={meta}
      />,
    );

    const compactTotals = screen.getByTestId("review-totals-compact");
    expect(compactTotals).toHaveTextContent("as low as $19.19/mo");
    expect(compactTotals).toHaveTextContent("$100.00");
    expect(
      screen.getByText("Congrats! You're saving $50 on your security bundle!"),
    ).toBeInTheDocument();
  });
});
