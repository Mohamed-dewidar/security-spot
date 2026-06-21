import type { PricingUnit, ReviewGroupId } from "./catalog.js";

export type QuoteLine = {
  selectionKey: string;
  productId: string;
  variantId: string;
  title: string;
  variantLabel?: string;
  quantity: number;
  unitPrice: number;
  compareAtUnitPrice?: number;
  lineTotal: number;
  compareAtLineTotal?: number;
  reviewGroupId: ReviewGroupId;
  pricingUnit?: PricingUnit;
};

export type Quote = {
  configurationId: string;
  currency: string;
  lines: QuoteLine[];
  subtotal: number;
  compareAtSubtotal: number;
  savings: number;
  shipping: number;
  shippingCompareAt?: number;
  total: number;
  savingsMessage: string;
};

export type CheckoutResult = {
  orderId: string;
  configurationId: string;
  quote: Quote;
};
