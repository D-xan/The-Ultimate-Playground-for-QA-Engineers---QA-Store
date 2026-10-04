import { useEffect, useState } from 'react';
import { api } from '@/utils/api';
import { ProductCard } from '@/components/customer/ProductCard';
import { Button } from '@/components/ui/Button';
import { PracticeElement } from '@/components/practice/PracticeElement';
import { PracticeSection as Section } from '@/components/practice/PracticeSection';
import { shuffled, uniqueBy } from '@/components/practice/shuffle';

type Product = Awaited<ReturnType<typeof api.products.getAll>>[number];
const CATALOGUE_SIZE = 40;
const PER_PAGE = 4;

export default function PaginationChallenge() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [target, setTarget] = useState<{ name: string; page: number } | null>(null);

  useEffect(() => {
    let live = true;
    api.products.getAll().then((all) => {
      if (!live) return;
      // A new order every visit, so the answers have to be read from the page.
      const picked = uniqueBy(shuffled(all), (p) => p.name).slice(0, CATALOGUE_SIZE);
      const t = 8 + Math.floor(Math.random() * (CATALOGUE_SIZE - 12));
      setProducts(picked);
      setTarget({ name: picked[t].name, page: Math.floor(t / PER_PAGE) + 1 });
      setLoading(false);
    });
    return () => { live = false; };
  }, []);

  const totalPages = Math.ceil(products.length / PER_PAGE);
  const current = products.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const lastName = products[products.length - 1]?.name ?? '';
  const goTo = (p: number) => { if (p >= 1 && p <= totalPages) setPage(p); };

  const pageNumbers = (): (number | '...')[] => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (page <= 4) return [1, 2, 3, 4, 5, '...', totalPages];
    if (page >= totalPages - 3) return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, '...', page - 1, page, page + 1, '...', totalPages];
  };

  return (
    <div className="space-y-10 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Store Pagination</h1>
        <p className="text-slate-500">Page through a catalogue of {CATALOGUE_SIZE} real store products, four at a time. The order changes on every visit, so the answers can only come from your script reading the page. Each task ticks itself when the answer is right.</p>
      </div>

      <Section n={1} title="Catalogue">
        {loading ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4" aria-busy="true">
            {[...Array(4)].map((_, i) => <div key={i} className="animate-pulse h-64 rounded-xl bg-slate-200" />)}
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-white p-4 sm:p-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4" id="pagination-product-grid">
              {current.map((p) => <div key={p.id} data-testid="product-card"><ProductCard product={p} /></div>)}
            </div>
            <nav aria-label="Pagination" className="mt-6 flex flex-col items-center gap-4">
              <div className="text-sm text-slate-500" id="pagination-info" aria-live="polite">Showing page {page} of {totalPages}</div>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <Button variant="outline" disabled={page === 1} onClick={() => goTo(page - 1)} id="pagination-prev">Previous</Button>
                {pageNumbers().map((p, i) => p === '...'
                  ? <span key={`dots-${i}`} className="px-2 text-slate-400">...</span>
                  : <Button key={p} variant="outline" aria-current={page === p ? 'page' : undefined} className={page === p ? 'bg-primary text-slate-900 hover:bg-primary/90 border-primary' : ''} onClick={() => goTo(p)} id={`pagination-${p}`}>{p}</Button>)}
                <Button variant="outline" disabled={page === totalPages} onClick={() => goTo(page + 1)} id="pagination-next">Next</Button>
              </div>
            </nav>
          </div>
        )}
      </Section>

      <Section n={2} title="Tasks">
        <PracticeElement
          id="pagination-last" label="The last product"
          goal="Go to the last page and type the name of the last product on it."
          pass={['Next is disabled on the last page', 'The answer matches the last card’s name']}
          fail={['Assuming there are 10 pages: read the total from the info text', 'Reading the name before the new page renders']}
          hint="Read the total from “Showing page X of Y”, jump there, wait until the info text says so, then read the last card."
          code={{
            playwright: "const info = await page.locator('#pagination-info').textContent();\nconst total = info!.match(/of (\\d+)/)![1];\nawait page.locator(`#pagination-${total}`).click();\nawait expect(page.locator('#pagination-info')).toHaveText(`Showing page ${total} of ${total}`);\nconst name = await page.getByTestId('product-card').last().locator('h3').textContent();\nawait page.getByTestId('answer-pagination-last').fill(name!.trim());",
            seleniumJava: 'String info = driver.findElement(By.id("pagination-info")).getText();\nString total = info.replaceAll(".*of (\\\\d+).*", "$1");\ndriver.findElement(By.id("pagination-" + total)).click();\nwait.until(ExpectedConditions.textToBe(By.id("pagination-info"), "Showing page " + total + " of " + total));\nList<WebElement> names = driver.findElements(By.cssSelector("[data-testid=product-card] h3"));\nString name = names.get(names.size() - 1).getText();',
            seleniumPython: 'info = driver.find_element(By.ID, "pagination-info").text\ntotal = re.search(r"of (\\d+)", info).group(1)\ndriver.find_element(By.ID, f"pagination-{total}").click()\nwait.until(EC.text_to_be_present_in_element((By.ID, "pagination-info"), f"Showing page {total} of {total}"))\nname = driver.find_elements(By.CSS_SELECTOR, "[data-testid=product-card] h3")[-1].text',
            cypress: "cy.get('#pagination-info').invoke('text').then((info) => {\n  const total = info.match(/of (\\d+)/)[1];\n  cy.get(`#pagination-${total}`).click();\n  cy.get('#pagination-info').should('have.text', `Showing page ${total} of ${total}`);\n  cy.get('[data-testid=product-card] h3').last().invoke('text')\n    .then((name) => cy.get('[data-testid=answer-pagination-last]').type(name.trim()));\n});",
          }}
          answer={loading ? undefined : { prompt: 'Last product:', expected: lastName }}
        >
          <p className="text-sm text-slate-600">Use the catalogue above.</p>
        </PracticeElement>

        <PracticeElement
          id="pagination-find" label="Find a product’s page"
          goal={target ? `Find which page “${target.name}” is on and type the page number.` : 'Find which page the named product is on and type the page number.'}
          pass={['The answer is the page number where that product appears']}
          fail={['Stopping on the first partial name match', 'Looping forever when the product is not found: stop when Next is disabled']}
          hint="Start on page 1. On each page, check the card names; if it is not there, click Next and wait for the info text to change."
          code={{
            playwright: "const wanted = await page.locator('#find-target').textContent();\nwhile (!(await page.getByTestId('product-card').locator('h3', { hasText: wanted! }).count())) {\n  const before = await page.locator('#pagination-info').textContent();\n  await page.locator('#pagination-next').click();\n  await expect(page.locator('#pagination-info')).not.toHaveText(before!);\n}\nconst pageNo = (await page.locator('#pagination-info').textContent())!.match(/page (\\d+)/)![1];\nawait page.getByTestId('answer-pagination-find').fill(pageNo);",
            seleniumJava: 'String wanted = driver.findElement(By.id("find-target")).getText();\nBy names = By.cssSelector("[data-testid=product-card] h3");\nwhile (driver.findElements(names).stream().noneMatch(e -> e.getText().equals(wanted))) {\n  String before = driver.findElement(By.id("pagination-info")).getText();\n  driver.findElement(By.id("pagination-next")).click();\n  wait.until(d -> !d.findElement(By.id("pagination-info")).getText().equals(before));\n}',
            seleniumPython: 'wanted = driver.find_element(By.ID, "find-target").text\nnames = (By.CSS_SELECTOR, "[data-testid=product-card] h3")\nwhile wanted not in [e.text for e in driver.find_elements(*names)]:\n    before = driver.find_element(By.ID, "pagination-info").text\n    driver.find_element(By.ID, "pagination-next").click()\n    wait.until(lambda d: d.find_element(By.ID, "pagination-info").text != before)',
            cypress: "// Recursion instead of a loop: Cypress commands are queued, not run inline\nconst findPage = (wanted) => cy.get('[data-testid=product-card] h3').then(($h) => {\n  if ([...$h].some((h) => h.innerText.trim() === wanted)) return;\n  cy.get('#pagination-next').click();\n  findPage(wanted);\n});\ncy.get('#find-target').invoke('text').then(findPage);",
          }}
          answer={target ? { prompt: 'Page number:', expected: String(target.page) } : undefined}
        >
          <p className="text-sm text-slate-600">Product to find: <strong id="find-target" className="text-slate-900">{target?.name ?? 'loading...'}</strong></p>
        </PracticeElement>
      </Section>
    </div>
  );
}
