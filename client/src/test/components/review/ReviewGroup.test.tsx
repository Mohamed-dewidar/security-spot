import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ReviewGroup } from "@/components/review/ReviewGroup";

describe("ReviewGroup", () => {
  it("renders nothing when there are no lines", () => {
    const { container } = render(
      <ReviewGroup title="Cameras" lines={[]} onQuantityChange={() => {}} />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("renders section title and review lines", () => {
    render(
      <ReviewGroup
        title="Cameras"
        lines={[
          {
            lineKey: "wyze-cam-v4:white",
            label: "Wyze Cam v4",
            variantLabel: "White",
            quantity: 1,
            price: 27.98,
            currency: "USD",
          },
        ]}
        onQuantityChange={() => {}}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Cameras" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Wyze Cam v4")).toBeInTheDocument();
  });

  it("forwards quantity changes with the line key", () => {
    const onQuantityChange = vi.fn();

    render(
      <ReviewGroup
        title="Cameras"
        lines={[
          {
            lineKey: "wyze-cam-v4:white",
            label: "Wyze Cam v4",
            quantity: 1,
            price: 27.98,
            currency: "USD",
          },
        ]}
        onQuantityChange={onQuantityChange}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Increase Wyze Cam v4 quantity" }),
    );

    expect(onQuantityChange).toHaveBeenCalledWith("wyze-cam-v4:white", 2);
  });
});
