import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { api } from '@/utils/api';
import { ProductCard } from '@/components/customer/ProductCard';
import { PracticeElement } from '@/components/practice/PracticeElement';
import { PracticeSection as Section } from '@/components/practice/PracticeSection';
import { shuffled, uniqueBy } from '@/components/practice/shuffle';

type Product = Awaited<ReturnType<typeof api.products.getAll>>[number];
const BATCH = 4;
const NTH = 13;

export default function LazyLoadingChallenge() {
  const [products, setProducts] = useState<Product[]>([]);
  const [visible, setVisible] = useState(BATCH);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const sentinel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let live = true;
    api.products.getAll().then((all) => {
      if (!live) return;
      // A random length and order every visit, so counts and names must be read from the page.
      setProducts(uniqueBy(shuffled(all), (p) => p.name).slice(0, 18 + Math.floor(Math.random() * 13)));
      setLoading(false);
    });
    return () => { live = false; };
  }, []);

  const hasMore = visible < products.length;

  // The batch timer lives outside the observer effect, which re-runs when loading starts.
  const batchTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(batchTimer.current), []);

  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !loadingMore) {
        setLoadingMore(true);
        // Simulated network delay for the next batch.
        batchTimer.current = setTimeout(() => { setVisible((v) => v + BATCH); setLoadingMore(false); }, 800 + Math.random() * 1200);
      }
    }, { threshold: 0.1 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, loading]);

  const reachedEnd = !loading && !hasMore;

  return (
    <div className="space-y-10 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Store Lazy Loading</h1>
        <p className="text-slate-500">An infinite-scroll catalogue that loads four products at a time as you scroll. Its length and order change on every visit. Each task ticks itself when the answer is right.</p>
      </div>

      <Section n={1} title="Tasks">
        <PracticeElement
          id="lazy-count" label="Scroll to the end and count"
          goal="Scroll until “You’ve reached the end of the catalog!” appears, then type how many products are loaded."
          pass={['The end message is visible', 'The answer matches the number of product cards']}
          fail={['Counting after one scroll: more batches are still to come', 'Scrolling once to the bottom and assuming that loads everything']}
          hint="Loop: scroll the last card into view, wait for the card count to grow or the end message to appear, repeat. The cards are in the catalogue below."
          code={{
            playwright: "// The spinner can vanish mid-scroll, so find and scroll in one step inside the page\nconst scrollDown = () => page.evaluate(() =>\n  document.querySelector('#lazy-loading-indicator, #lazy-end-message')?.scrollIntoView());\nwhile (!(await page.locator('#lazy-end-message').isVisible())) {\n  await scrollDown();\n  await page.waitForTimeout(250); // let the next batch arrive, then loop\n}\nconst count = await page.getByTestId('product-card').count();\nawait page.getByTestId('answer-lazy-count').fill(String(count));",
            seleniumJava: '// Scroll in the page itself: the spinner can be removed between a find and a scroll\nString js = "document.querySelector(\'#lazy-loading-indicator, #lazy-end-message\').scrollIntoView()";\nwhile (driver.findElements(By.id("lazy-end-message")).isEmpty()) {\n  ((JavascriptExecutor) driver).executeScript(js);\n  Thread.sleep(250);\n}\nint count = driver.findElements(By.cssSelector("[data-testid=product-card]")).size();',
            seleniumPython: '# Scroll in the page itself: the spinner can be removed between a find and a scroll\njs = "document.querySelector(\'#lazy-loading-indicator, #lazy-end-message\').scrollIntoView()"\nwhile not driver.find_elements(By.ID, "lazy-end-message"):\n    driver.execute_script(js)\n    time.sleep(0.25)\ncount = len(driver.find_elements(By.CSS_SELECTOR, "[data-testid=product-card]"))',
            cypress: "const scrollToEnd = () => cy.get('body').then(($b) => {\n  if ($b.find('#lazy-end-message').length) return;\n  cy.get('#lazy-loading-indicator, #lazy-end-message').first().scrollIntoView();\n  cy.wait(250);\n  scrollToEnd();\n});\nscrollToEnd();\ncy.get('[data-testid=product-card]').its('length')\n  .then((n) => cy.get('[data-testid=answer-lazy-count]').type(String(n)));",
          }}
          answer={loading ? undefined : { prompt: 'Products loaded:', expected: String(products.length) }}
        >
          <p className="text-sm text-slate-600">Loaded so far: <span id="lazy-loaded-count">{Math.min(visible, products.length)}</span>{reachedEnd ? ' (all)' : ''}</p>
        </PracticeElement>

        <PracticeElement
          id="lazy-nth" label={`Product number ${NTH}`}
          goal={`Type the name of product number ${NTH} in the catalogue.`}
          pass={[`The answer matches card ${NTH}, counting from 1`]}
          fail={[`Reading index ${NTH} from a zero-based list: that is card ${NTH + 1}`, 'Reading before that card has loaded']}
          hint={`Card ${NTH} arrives in the fourth batch. Keep scrolling until at least ${NTH} cards exist.`}
          code={{
            playwright: `const cards = page.getByTestId('product-card');\nwhile ((await cards.count()) < ${NTH}) {\n  await page.evaluate(() => document.querySelector('#lazy-loading-indicator')?.scrollIntoView());\n  await page.waitForTimeout(250);\n}\nconst name = await cards.nth(${NTH - 1}).locator('h3').textContent();\nawait page.getByTestId('answer-lazy-nth').fill(name!.trim());`,
            seleniumJava: `By cards = By.cssSelector("[data-testid=product-card]");\nwhile (driver.findElements(cards).size() < ${NTH}) {\n  ((JavascriptExecutor) driver).executeScript("document.querySelector('#lazy-loading-indicator')?.scrollIntoView()");\n  Thread.sleep(250);\n}\nString name = driver.findElements(cards).get(${NTH - 1}).findElement(By.tagName("h3")).getText();`,
            seleniumPython: `cards = (By.CSS_SELECTOR, "[data-testid=product-card]")\nwhile len(driver.find_elements(*cards)) < ${NTH}:\n    driver.execute_script("document.querySelector('#lazy-loading-indicator')?.scrollIntoView()")\n    time.sleep(0.25)\nname = driver.find_elements(*cards)[${NTH - 1}].find_element(By.TAG_NAME, "h3").text`,
            cypress: `const loadUntil = () => cy.get('[data-testid=product-card]').then(($c) => {\n  if ($c.length >= ${NTH}) return;\n  cy.get('#lazy-loading-indicator').scrollIntoView();\n  cy.wait(250);\n  loadUntil();\n});\nloadUntil();\ncy.get('[data-testid=product-card]').eq(${NTH - 1}).find('h3').invoke('text')\n  .then((t) => cy.get('[data-testid=answer-lazy-nth]').type(t.trim()));`,
          }}
          answer={loading ? undefined : { prompt: 'Product name:', expected: products[NTH - 1].name }}
        >
          <p className="text-sm text-slate-600">Use the catalogue below.</p>
        </PracticeElement>
      </Section>

      <Section n={2} title="Catalogue">
        {loading ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4" aria-busy="true">
            {[...Array(4)].map((_, i) => <div key={i} className="animate-pulse h-64 rounded-xl bg-slate-200" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4" id="lazy-product-grid">
            {products.slice(0, visible).map((p) => <div key={p.id} data-testid="product-card"><ProductCard product={p} /></div>)}
          </div>
        )}
        {!loading && hasMore && (
          <div ref={sentinel} className="flex justify-center py-8" id="lazy-loading-indicator">
            {loadingMore && <div className="flex items-center text-slate-500" role="status"><Loader2 className="mr-2 h-6 w-6 animate-spin text-primary" /><span>Loading more products...</span></div>}
          </div>
        )}
        {reachedEnd && (
          <div className="text-center text-slate-500 font-medium bg-slate-50 py-4 rounded-xl border border-slate-200" id="lazy-end-message">
            You've reached the end of the catalog!
          </div>
        )}
      </Section>
    </div>
  );
}
