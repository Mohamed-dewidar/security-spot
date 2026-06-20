import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BundleLayout } from "@/components/layout/BundleLayout";

describe("BundleLayout", () => {
  it("renders builder and review slots with semantic regions", () => {
    const { getByRole } = render(
      <BundleLayout
        builder={<div>Builder panel</div>}
        review={<div>Review panel</div>}
      />,
    );

    expect(screen.getByText("Builder panel")).toBeInTheDocument();
    expect(screen.getByText("Review panel")).toBeInTheDocument();
    expect(getByRole("main")).toBeInTheDocument();
    expect(getByRole("complementary")).toBeInTheDocument();
  });
});
