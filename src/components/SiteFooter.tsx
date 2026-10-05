import { Link } from 'react-router-dom';
import { PARENT_URL, REPO_URL } from '@/config/brand';

const links = [
  { to: '/about', label: 'About' },
  { to: '/privacy-policy', label: 'Privacy Policy' },
  { to: '/terms-of-service', label: 'Terms of Service' },
  { to: '/contact', label: 'Contact' },
];

/** Shared footer for the practice portal, the store and the info pages. */
export function SiteFooter({ dark = false }: { dark?: boolean }) {
  const muted = dark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900';
  return (
    <footer data-testid="site-footer" className={`border-t ${dark ? 'border-slate-800' : 'border-border'} py-6 text-sm`}>
      <nav aria-label="Site" className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
        {links.map((l) => <Link key={l.to} to={l.to} className={muted}>{l.label}</Link>)}
        <a href={REPO_URL} className={muted}>GitHub</a>
        <a href={PARENT_URL} className={muted}>Randomly.online</a>
      </nav>
      <p className={`mt-3 text-center text-xs ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
        © 2025–{new Date().getFullYear()} Randomly.online. QA Playground is free and open source under the MIT licence.
      </p>
    </footer>
  );
}
