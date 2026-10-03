import { Link, useLocation } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import { challenges } from '@/data/challenges';
import { SEO, seoIdForPath, PARENT_SITE } from './seo';

const RANDOMLY_TOOLS: Record<string, { name: string; path: string }> = {
  json: { name: 'JSON Formatter', path: 'dev-tools/json-formatter' },
  jwt: { name: 'JWT Decoder', path: 'dev-tools/jwt-decoder' },
  regex: { name: 'Regex Tester', path: 'dev-tools/regex-tester' },
  csv: { name: 'CSV to JSON', path: 'dev-tools/csv-to-json' },
  uuid: { name: 'UUID Generator', path: 'dev-tools/uuid-generator' },
  diff: { name: 'Code Diff Checker', path: 'dev-tools/code-diff-checker' },
  sql: { name: 'SQL Playground', path: 'dev-tools/sql-playground' },
  html: { name: 'HTML Formatter', path: 'dev-tools/html-formatter' },
};

/** Which Randomly.online tools are most useful next to each page. */
const TOOLS_FOR: Record<string, string[]> = {
  'api-interception': ['json', 'jwt', 'diff'],
  'api-playground': ['json', 'jwt', 'uuid'],
  'auth-flows': ['jwt', 'json', 'uuid'],
  'data-generator': ['csv', 'uuid', 'sql'],
  'locator-traps': ['regex', 'html', 'diff'],
  'deep-dom': ['html', 'regex', 'diff'],
  frames: ['html', 'regex', 'diff'],
  tables: ['csv', 'json', 'sql'],
  'virtual-table': ['csv', 'json', 'sql'],
  interview: ['regex', 'json', 'sql'],
};
const DEFAULT_TOOLS = ['json', 'regex', 'diff'];

const label = (id: string) => challenges.find((c) => c.id === id)?.label ?? id;

/** Answer-first summary, FAQ and links at the foot of every indexed practice page. */
export function PageGuide() {
  const { pathname } = useLocation();
  const id = seoIdForPath(pathname);
  if (!id || id === 'home') return null;
  const s = SEO[id];
  const related = id === 'practice' ? s.relatedIds : s.relatedIds.filter((r) => r !== id);
  const tools = (TOOLS_FOR[id] ?? DEFAULT_TOOLS).map((k) => RANDOMLY_TOOLS[k]);

  return (
    <section data-testid="page-guide" aria-labelledby="page-guide-title" className="mt-12 bg-white p-6 rounded-2xl shadow-sm border border-border space-y-8">
      <div>
        <h2 id="page-guide-title" className="text-xl font-bold mb-3">{id === 'practice' ? 'About QA Playground' : `About this ${label(id)} page`}</h2>
        <p className="text-slate-700 leading-relaxed">{s.answer}</p>
      </div>

      <div>
        <h2 className="text-lg font-bold mb-3">Frequently asked questions</h2>
        <div className="divide-y divide-border rounded-xl border border-border">
          {s.faqs.map((f) => (
            <details key={f.q} className="group p-4">
              <summary className="cursor-pointer font-medium text-slate-900 list-none flex justify-between gap-4">
                <h3 className="text-base font-medium">{f.q}</h3>
                <span aria-hidden="true" className="text-slate-400 group-open:rotate-45 transition-transform">+</span>
              </summary>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">{f.a}</p>
            </details>
          ))}
        </div>
      </div>

      {related.length > 0 && (
        <nav aria-label="Related practice pages">
          <h2 className="text-lg font-bold mb-3">Practice next</h2>
          <ul className="grid gap-2 sm:grid-cols-2">
            {related.map((r) => (
              <li key={r}>
                <Link data-testid="related-link" to={`/practice/${r}`} className="block rounded-lg border border-border px-4 py-3 text-sm hover:border-primary hover:bg-primary/5">
                  <span className="font-semibold text-slate-900">{label(r)}</span>
                  <span className="block text-slate-500">{challenges.find((c) => c.id === r)?.desc}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}

      <div>
        <h2 className="text-lg font-bold mb-3">Free developer tools on {PARENT_SITE.name}</h2>
        <p className="text-sm text-slate-600 mb-3">QA Playground is part of {PARENT_SITE.name}. These tools help while you write and debug tests:</p>
        <ul className="flex flex-wrap gap-2">
          {tools.map((t) => (
            <li key={t.path}>
              <a href={`${PARENT_SITE.url}${t.path}`} className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-sm hover:border-primary">
                {t.name} <ExternalLink className="h-3 w-3" aria-hidden="true" />
              </a>
            </li>
          ))}
          <li>
            <a href={`${PARENT_SITE.url}dev-tools/all-development-tools`} className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-sm hover:border-primary">
              All developer tools <ExternalLink className="h-3 w-3" aria-hidden="true" />
            </a>
          </li>
        </ul>
      </div>
    </section>
  );
}
