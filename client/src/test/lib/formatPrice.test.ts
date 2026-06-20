import { describe, expect, it } from "vitest";
import { formatPrice } from "@/lib/formatPrice";

describe("formatPrice", () => {
  it("formats USD currency with two decimals", () => {
    expect(formatPrice(27.98)).toBe("$27.98");
  });

  it("appends monthly suffix when format is monthly", () => {
    expect(formatPrice(19.19, "USD", { format: "monthly" })).toBe("$19.19/mo");
  });
});
