import type { ReactNode } from "react";

type BundleLayoutProps = {
  builder: ReactNode;
  review: ReactNode;
};

export function BundleLayout({ builder, review }: BundleLayoutProps) {
  return (
    <div className="mx-auto min-h-svh w-full max-w-360 bg-surface  md:py-25 font-sans md:px-20 ">
      <div className="flex flex-col gap-20 md:flex-row md:gap-24 lg:flex-col lg:items-start lg:gap-16">
        <h1 className="text-[32px] font-bold mt-[31px] md:hidden text-center">
          Let’s get started!
        </h1>
        <main className="w-full">{builder}</main>
        <aside
          aria-label="Your security system"
          className="w-full lg:sticky lg:top-20 lg:max-h-[calc(100svh-2.5rem)] lg:shrink-0 lg:overflow-y-auto"
        >
          {review}
        </aside>
      </div>
    </div>
  );
}
