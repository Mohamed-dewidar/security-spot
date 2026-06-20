export type PriceFormat = "unit" | "line" | "monthly";

type FormatPriceOptions = {
  format?: PriceFormat;
};

/** Formats a numeric amount as USD currency with optional monthly suffix. */
export function formatPrice(
  amount: number,
  currency = "USD",
  options: FormatPriceOptions = {},
): string {
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  if (options.format === "monthly") {
    return `${formatted}/mo`;
  }

  return formatted;
}
