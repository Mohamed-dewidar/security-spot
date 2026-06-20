import type { ReactNode } from "react";

type BundleLayoutProps = {
  builder: ReactNode;
  review: ReactNode;
};

export function BundleLayout({ builder, review }: BundleLayoutProps) {
  return (
    <div className="mx-auto min-h-svh w-full max-w-360 bg-surface px-15 py-20 font-sans md:px-20 lg:px-25">
      <div className="flex flex-col gap-20 md:gap-24 lg:flex-row lg:items-start lg:gap-16">
        <main className="min-w-0 flex-1">{builder}</main>
        <aside
          aria-label="Your security system"
          className="min-w-0 lg:sticky lg:top-20 lg:max-h-[calc(100svh-2.5rem)] lg:w-[min(100%,30.375rem)] lg:shrink-0 lg:overflow-y-auto"
        >
          {review}
        </aside>
      </div>
    </div>
  );
}
