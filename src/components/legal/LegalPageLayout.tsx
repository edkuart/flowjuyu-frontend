import type { ReactNode } from "react";

type LegalPageLayoutProps = {
  title: string;
  summary: string;
  updatedAt: string;
  children: ReactNode;
};

export function LegalPageLayout({
  title,
  summary,
  updatedAt,
  children,
}: LegalPageLayoutProps) {
  return (
    <main className="min-h-screen bg-[#f6f2ea] px-4 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-3xl rounded-[28px] border border-black/5 bg-white px-6 py-8 shadow-sm sm:px-10 sm:py-12">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#0f3d3a]/65">
          Legal
        </p>
        <h1 className="mt-3 font-serif text-3xl leading-tight text-neutral-900 sm:text-5xl">
          {title}
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-neutral-600 sm:text-base">
          {summary}
        </p>
        <p className="mt-5 text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
          Última actualización: {updatedAt}
        </p>

        <div className="mt-10 space-y-10 text-[15px] leading-7 text-neutral-700">
          {children}
        </div>
      </div>
    </main>
  );
}
