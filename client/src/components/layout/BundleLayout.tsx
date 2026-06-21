import type { ReactNode } from "react";

type BundleLayoutProps = {
  builder: ReactNode;
  review: ReactNode;
};

export function BundleLayout({ builder, review }: BundleLayoutProps) {
  return (
    <div className="mx-auto min-h-svh w-full max-w-7xl bg-surface font-sans lg:px-20 lg:py-[62px]">
      <div className="flex flex-col gap-20 lg:flex-row lg:items-start lg:gap-16 xl:flex-col xl:gap-13">
        <h1 className="mt-[31px] text-center text-[32px] font-bold lg:hidden">
          Let’s get started!
        </h1>
        <main className="min-w-0 w-full lg:flex-1 xl:w-full">{builder}</main>
        <aside
          aria-label="Your security system"
          className="w-full lg:sticky lg:top-20 lg:max-h-[calc(100svh-2.5rem)] lg:w-[399px] lg:shrink-0 lg:overflow-y-auto xl:static xl:max-h-none xl:w-full"
        >
          {review}
        </aside>
      </div>
    </div>
  );
}
