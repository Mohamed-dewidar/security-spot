export type ReviewGroupId = "cameras" | "sensors" | "accessories" | "plan";

export type StepIconId = "camera" | "plan" | "sensors" | "extra";

export type PricingUnit = "one_time" | "monthly";

export type ProductBadge = {
  text: string;
};

export type ProductVariant = {
  id: string;
  label: string;
  imageUrl?: string;
};

export type Product = {
  id: string;
  title: string;
  description: string;
  /** Optional product detail page; card shows "Learn More" when set. */
  learnMoreUrl?: string;
  imageUrl: string;
  price: number;
  compareAtPrice?: number;
  badge?: ProductBadge;
  variants?: ProductVariant[];
  reviewGroupId: ReviewGroupId;
  pricingUnit?: PricingUnit;
  /** Product ids auto-added at qty 1 when this product is selected (qty > 0). */
  requires?: string[];
};

export type BuilderStep = {
  id: string;
  stepNumber: number;
  title: string;
  icon: StepIconId;
  nextStepLabel: string | null;
  products: Product[];
};

export type ReviewGroup = {
  id: ReviewGroupId;
  title: string;
};

export type ShippingMeta = {
  label: string;
  price: number;
  compareAtPrice?: number;
};

export type GuaranteeMeta = {
  title: string;
  body: string;
};

export type FinancingMeta = {
  label: string;
};

export type CatalogMeta = {
  currency: string;
  reviewPanelTitle: string;
  reviewPanelSubtitle: string;
  reviewGroups: ReviewGroup[];
  shipping: ShippingMeta;
  guarantee: GuaranteeMeta;
  financing: FinancingMeta;
  savingsMessage: string;
};

export type InitialSelections = {
  openStepId: string;
  selections: Record<string, number>;
  activeVariants: Record<string, string>;
};

export type BundleConfig = {
  meta: CatalogMeta;
  steps: BuilderStep[];
  initialSelections: InitialSelections;
};
