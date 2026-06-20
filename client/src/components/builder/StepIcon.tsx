import type { StepIconId } from "@/types/catalog";

type StepIconProps = {
  icon: StepIconId;
  className?: string;
};

const iconPaths: Record<StepIconId, string> = {
  camera:
    "M3.5 5.5A1.5 1.5 0 0 1 5 4h1.18l.64-1.28A1 1 0 0 1 7.72 2h4.56c.42 0 .8.26.94.66L13.86 4H15a1.5 1.5 0 0 1 1.5 1.5v8A1.5 1.5 0 0 1 15 15H5a1.5 1.5 0 0 1-1.5-1.5v-8ZM10 12.25a2.75 2.75 0 1 0 0-5.5 2.75 2.75 0 0 0 0 5.5Z",
  plan: "M4 3.5A1.5 1.5 0 0 1 5.5 2h9A1.5 1.5 0 0 1 16 3.5v9A1.5 1.5 0 0 1 14.5 14h-9A1.5 1.5 0 0 1 4 12.5v-9ZM7 5.75a.75.75 0 0 0 0 1.5h6a.75.75 0 0 0 0-1.5H7Zm0 3a.75.75 0 0 0 0 1.5h4a.75.75 0 0 0 0-1.5H7Z",
  sensors:
    "M10 2a6 6 0 0 1 4.24 10.24l-1.06-1.06A4.5 4.5 0 1 0 10 14.5V16a6 6 0 0 1 0-12Zm0 3a3 3 0 1 1 0 6 3 3 0 0 1 0-6Z",
  extra:
    "M10 2l1.76 3.57 3.94.57-2.85 2.78.67 3.92L10 11.27 6.48 12.84l.67-3.92L4.3 6.14l3.94-.57L10 2Z",
};

export function StepIcon({ icon, className = "size-20" }: StepIconProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className={`shrink-0 text-text ${className}`}
    >
      <path fill="currentColor" d={iconPaths[icon]} />
    </svg>
  );
}
