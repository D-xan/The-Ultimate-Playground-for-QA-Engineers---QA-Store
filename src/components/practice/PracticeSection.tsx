import type { ReactNode } from 'react';

/** A numbered group of PracticeElements on a practice page. */
export const PracticeSection = ({ n, title, children }: { n: number; title: string; children: ReactNode }) => (
  <section className="rounded-3xl border border-border bg-white/40 p-4 sm:p-6">
    <h2 className="mb-5 flex items-center gap-3 text-xl font-bold text-slate-900">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary text-sm font-bold text-slate-900 shadow-sm shadow-primary/30">{n}<span className="sr-only">.</span></span>
      {title}
    </h2>
    <div className="space-y-5">{children}</div>
  </section>
);
