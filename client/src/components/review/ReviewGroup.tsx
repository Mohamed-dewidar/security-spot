import {
  ReviewLine,
  type ReviewLineProps,
} from "@/components/review/ReviewLine";
import { ReviewPlanLine } from "@/components/review/ReviewPlanLine";

export type ReviewGroupLine = Omit<ReviewLineProps, "onQuantityChange"> & {
  isPlan?: boolean;
};

type ReviewGroupProps = {
  title: string;
  lines: ReviewGroupLine[];
  className?: string;
  onQuantityChange: (lineKey: string, quantity: number) => void;
};

export function ReviewGroup({
  title,
  lines,
  className,
  onQuantityChange,
}: ReviewGroupProps) {
  if (lines.length === 0) {
    return null;
  }

  return (
    <section className={`border-t border-gray-400 pt-15 ${className ?? ""}`}>
      <h3 className="mb-8 text-xs font-normal uppercase tracking-section text-gray-500">
        {title}
      </h3>
      <ul className="list-none space-y-12 p-0 lg:space-y-12">
        {lines.map((line) =>
          line.isPlan ? (
            <ReviewPlanLine
              key={line.lineKey}
              lineKey={line.lineKey}
              price={line.price}
              compareAtPrice={line.compareAtPrice}
              currency={line.currency}
              priceFormat={line.priceFormat}
            />
          ) : (
            <ReviewLine
              key={line.lineKey}
              {...line}
              showStepper={line.showStepper ?? !line.isPlan}
              onQuantityChange={(quantity) =>
                onQuantityChange(line.lineKey, quantity)
              }
            />
          ),
        )}
      </ul>
    </section>
  );
}
