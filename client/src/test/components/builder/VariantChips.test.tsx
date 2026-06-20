import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { VariantChips } from "@/components/builder/VariantChips";

const variants = [
  { id: "white", label: "White" },
  { id: "grey", label: "Grey" },
  { id: "black", label: "Black" },
];

describe("VariantChips", () => {
  it("renders all variant labels", () => {
    render(
      <VariantChips
        variants={variants}
        activeVariantId="white"
        onSelect={() => {}}
      />,
    );

    expect(screen.getByRole("option", { name: "White" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Grey" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Black" })).toBeInTheDocument();
  });

  it("marks the active variant and calls onSelect", () => {
    const onSelect = vi.fn();

    render(
      <VariantChips
        variants={variants}
        activeVariantId="white"
        onSelect={onSelect}
      />,
    );

    expect(screen.getByRole("option", { name: "White" })).toHaveAttribute(
      "aria-selected",
      "true",
    );

    fireEvent.click(screen.getByRole("option", { name: "Black" }));
    expect(onSelect).toHaveBeenCalledWith("black");
  });

  it("scrolls horizontally on mobile and wraps on tablet+", () => {
    const { container } = render(
      <VariantChips
        variants={variants}
        activeVariantId={null}
        onSelect={() => {}}
      />,
    );

    const listbox = container.firstChild as HTMLElement;
    expect(listbox).toHaveClass("overflow-x-auto", "max-md:flex-nowrap");
    expect(listbox).toHaveClass("md:flex-wrap");
  });

  it("uses touch-friendly chip height on mobile", () => {
    render(
      <VariantChips
        variants={variants}
        activeVariantId={null}
        onSelect={() => {}}
      />,
    );

    expect(screen.getByRole("option", { name: "White" })).toHaveClass(
      "min-h-11",
    );
  });
});
