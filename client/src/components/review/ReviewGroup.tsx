import {
  ReviewLine,
  type ReviewLineProps,
} from "@/components/review/ReviewLine";

export type ReviewGroupLine = Omit<ReviewLineProps, "onQuantityChange">;

type ReviewGroupProps = {
  title: string;
  lines: ReviewGroupLine[];
  onQuantityChange: (lineKey: string, quantity: number) => void;
};

export function ReviewGroup({
  title,
  lines,
  onQuantityChange,
}: ReviewGroupProps) {
  if (lines.length === 0) {
    return null;
  }

  return (
    <section className="space-y-12 md:space-y-13">
      <h3 className="text-xs font-semibold uppercase tracking-section text-text-muted md:text-sm">
        {title}
      </h3>
      <ul className="list-none space-y-0 p-0">
        {lines.map((line) => (
          <ReviewLine
            key={line.lineKey}
            {...line}
            onQuantityChange={(quantity) =>
              onQuantityChange(line.lineKey, quantity)
            }
          />
        ))}
      </ul>
    </section>
  );
}
