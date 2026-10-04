import { Link, Outlet } from 'react-router-dom';
import { SiteFooter } from '@/components/SiteFooter';

/** About, privacy, terms and contact: plain reading pages with the brand bar and footer. */
export default function InfoLayout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-border bg-white">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3 px-4 py-4">
          <Link to="/practice" className="flex items-center gap-2 font-bold text-slate-900">
            <img src={`${import.meta.env.BASE_URL}brand/randomly-logo-64.webp`} alt="" width={28} height={28} className="h-7 w-7" />
            QA Playground
          </Link>
          <nav aria-label="Main" className="flex gap-4 text-sm text-slate-600">
            <Link to="/practice" className="hover:text-slate-900">Practice</Link>
            <Link to="/" className="hover:text-slate-900">QA Store demo</Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-10">
        <article className="info-prose rounded-2xl border border-border bg-white p-6 sm:p-10">
          <Outlet />
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
