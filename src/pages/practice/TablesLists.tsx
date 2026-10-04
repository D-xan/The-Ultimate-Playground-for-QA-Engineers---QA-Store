import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { PracticeElement } from '@/components/practice/PracticeElement';
import { PracticeSection as Section } from '@/components/practice/PracticeSection';

type Stock = 'In Stock' | 'Low Stock' | 'Out of Stock';
const STOCKS: Stock[] = ['In Stock', 'Low Stock', 'Out of Stock'];
const PRODUCTS = ['Laptop', 'Smartphone', 'Headphones', 'Monitor', 'Keyboard', 'Mouse', 'Webcam', 'Speaker', 'Tablet', 'Charger', 'Router', 'Printer'];
const LIST_ITEMS = ['Write the test plan', 'Set up the framework', 'Automate the smoke suite', 'Add API checks', 'Wire up CI', 'Review flaky tests'];
const TOTAL_PAGES = 10;

const rand = (min: number, max: number) => min + Math.floor(Math.random() * (max - min + 1));
const badge = (s: Stock) => s === 'In Stock' ? 'bg-green-100 text-green-800' : s === 'Out of Stock' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800';
const th = 'px-4 py-3';
const td = 'px-4 py-3';

export default function TablesLists() {
  // A fresh catalogue every visit, so answers must be read from the page.
  const [rows] = useState(() => {
    const out = PRODUCTS.map((name, i) => ({ id: i + 1, name, price: rand(15, 1500), stock: STOCKS[rand(0, 2)] }));
    // The first three rows form the static table: exactly one of them is out of stock.
    const gone = rand(0, 2);
    for (let i = 0; i < 3; i++) out[i].stock = i === gone ? 'Out of Stock' : STOCKS[rand(0, 1)];
    // Some rows are always Low Stock, so the filter task never has an empty answer.
    out[rand(3, out.length - 1)].stock = 'Low Stock';
    return out;
  });
  const staticRows = rows.slice(0, 3);
  const [listLength] = useState(() => rand(3, LIST_ITEMS.length));

  const [sortOrder, setSortOrder] = useState<'none' | 'asc' | 'desc'>('none');
  const sorted = useMemo(() => sortOrder === 'none' ? rows.slice(0, 5) : [...rows.slice(0, 5)].sort((a, b) => sortOrder === 'asc' ? a.price - b.price : b.price - a.price), [rows, sortOrder]);
  const [filter, setFilter] = useState<Stock | ''>('');
  const filtered = filter ? rows.filter((r) => r.stock === filter) : rows;
  const [page, setPage] = useState(1);
  const [reachedLast, setReachedLast] = useState(false);
  const goTo = (p: number) => {
    if (p < 1 || p > TOTAL_PAGES) return;
    setPage(p);
    if (p === TOTAL_PAGES) setReachedLast(true);
  };

  const outOfStock = staticRows.find((r) => r.stock === 'Out of Stock')!;
  const pageBtn = (p: number) => <Button key={p} variant="outline" aria-current={page === p ? 'page' : undefined} className={page === p ? 'bg-primary text-slate-900 hover:bg-primary/90 border-primary' : ''} onClick={() => goTo(p)} id={`pagination-${p}`}>{p}</Button>;

  return (
    <div className="space-y-10 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Tables & Lists</h1>
        <p className="text-slate-500">Read cells, sort columns, filter rows, count list items and page through results. The data changes on every visit, so read tasks can only be solved by reading the page. Each task ticks itself the moment your script gets it right.</p>
      </div>

      <Section n={1} title="Tables">
        <PracticeElement
          id="table-static" label="Find a cell by its row"
          goal="Find the product that is Out of Stock and type its price (digits only) in the answer box."
          pass={['The answer matches that row’s price', 'The script finds the row by its status, not its position']}
          fail={['Reading row 3 because it was out of stock last time: statuses change every visit', 'Typing the $ sign']}
          hint="Locate the row that contains the text Out of Stock, then read the Price cell in that same row."
          code={{
            playwright: "const row = page.locator('#table-static tbody tr').filter({ hasText: 'Out of Stock' });\nconst price = (await row.locator('td').nth(2).textContent())!.replace(/\\D/g, '');\nawait page.getByTestId('answer-table-static').fill(price);",
            seleniumJava: 'WebElement cell = driver.findElement(By.xpath(\n  "//table[@id=\'table-static\']//tr[td[normalize-space()=\'Out of Stock\']]/td[3]"));\nString price = cell.getText().replaceAll("\\\\D", "");\ndriver.findElement(By.cssSelector("[data-testid=answer-table-static]")).sendKeys(price);',
            seleniumPython: 'cell = driver.find_element(By.XPATH,\n    "//table[@id=\'table-static\']//tr[td[normalize-space()=\'Out of Stock\']]/td[3]")\nprice = re.sub(r"\\D", "", cell.text)\ndriver.find_element(By.CSS_SELECTOR, "[data-testid=answer-table-static]").send_keys(price)',
            cypress: "cy.contains('#table-static tbody tr', 'Out of Stock').find('td').eq(2).invoke('text')\n  .then((t) => cy.get('[data-testid=answer-table-static]').type(t.replace(/\\D/g, '')));",
          }}
          answer={{ prompt: 'Price:', expected: String(outOfStock.price) }}
        >
          <div className="overflow-x-auto border border-border rounded-lg">
            <table className="w-full text-sm text-left" id="table-static">
              <thead className="bg-slate-50 text-slate-700 font-medium border-b border-border">
                <tr><th className={th}>ID</th><th className={th}>Product Name</th><th className={th}>Price</th><th className={th}>Status</th></tr>
              </thead>
              <tbody>
                {staticRows.map((r) => (
                  <tr key={r.id} className="border-b border-border last:border-0 hover:bg-slate-50">
                    <td className={td}>{r.id}</td>
                    <td className={`${td} font-medium`}>{r.name}</td>
                    <td className={td}>${r.price}</td>
                    <td className={td}><span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${badge(r.stock)}`}>{r.stock}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </PracticeElement>

        <PracticeElement
          id="table-sortable" label="Sortable column"
          goal="Sort the table by price, highest first, and assert the prices are in descending order."
          pass={['The header shows a down arrow', 'Every price is lower than or equal to the one above it']}
          fail={['Checking only the first row', 'Assuming one click sorts descending: the first click sorts ascending']}
          hint="Read all the price cells into a list, then compare it with a sorted copy of itself."
          code={{
            playwright: "const header = page.locator('#table-sort-price');\nawait header.click();\nawait header.click();\nawait expect(header).toHaveAttribute('aria-sort', 'descending');\nconst prices = (await page.locator('#table-sortable tbody td:nth-child(2)').allTextContents()).map((t) => +t.slice(1));\nexpect(prices).toEqual([...prices].sort((a, b) => b - a));",
            seleniumJava: 'WebElement header = driver.findElement(By.id("table-sort-price"));\nheader.click();\nheader.click();\nList<Integer> prices = driver.findElements(By.cssSelector("#table-sortable tbody td:nth-child(2)"))\n  .stream().map(e -> Integer.parseInt(e.getText().substring(1))).toList();\nList<Integer> expected = new ArrayList<>(prices);\nexpected.sort(Comparator.reverseOrder());\nassertEquals(expected, prices);',
            seleniumPython: 'header = driver.find_element(By.ID, "table-sort-price")\nheader.click()\nheader.click()\nprices = [int(e.text[1:]) for e in driver.find_elements(By.CSS_SELECTOR, "#table-sortable tbody td:nth-child(2)")]\nassert prices == sorted(prices, reverse=True)',
            cypress: "cy.get('#table-sort-price').click().click().should('have.attr', 'aria-sort', 'descending');\ncy.get('#table-sortable tbody td:nth-child(2)').then(($td) => {\n  const prices = [...$td].map((td) => +td.innerText.slice(1));\n  expect(prices).to.deep.equal([...prices].sort((a, b) => b - a));\n});",
          }}
          done={sortOrder === 'desc'}
        >
          <div className="overflow-x-auto border border-border rounded-lg">
            <table className="w-full text-sm text-left" id="table-sortable">
              <thead className="bg-slate-50 text-slate-700 font-medium border-b border-border">
                <tr>
                  <th className={th}>Product Name</th>
                  <th className={`${th} cursor-pointer select-none hover:bg-slate-100 transition-colors`} id="table-sort-price"
                    aria-sort={sortOrder === 'asc' ? 'ascending' : sortOrder === 'desc' ? 'descending' : 'none'}
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}>
                    <div className="flex items-center gap-2">
                      Price {sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : sortOrder === 'desc' ? <ChevronDown className="h-4 w-4" /> : <span className="text-slate-400">↕</span>}
                    </div>
                  </th>
                  <th className={th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((r) => (
                  <tr key={r.id} className="border-b border-border last:border-0">
                    <td className={`${td} font-medium`}>{r.name}</td>
                    <td className={td}>${r.price}</td>
                    <td className={td}>{r.stock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </PracticeElement>

        <PracticeElement
          id="table-filter" label="Filter and count rows"
          goal="Filter the catalogue to “Low Stock” and type how many rows are left."
          pass={['Every visible row says Low Stock', 'The answer matches the row count and the “Showing N of 12” text']}
          fail={['Counting before the filter applies', 'Counting the header row too']}
          hint="Choose the status in the dropdown, then count the rows in tbody only."
          code={{
            playwright: "await page.locator('#table-filter-status').selectOption('Low Stock');\nconst count = await page.locator('#table-filter tbody tr').count();\nawait page.getByTestId('answer-table-filter').fill(String(count));",
            seleniumJava: 'new Select(driver.findElement(By.id("table-filter-status"))).selectByValue("Low Stock");\nint count = driver.findElements(By.cssSelector("#table-filter tbody tr")).size();\ndriver.findElement(By.cssSelector("[data-testid=answer-table-filter]")).sendKeys(String.valueOf(count));',
            seleniumPython: 'Select(driver.find_element(By.ID, "table-filter-status")).select_by_value("Low Stock")\ncount = len(driver.find_elements(By.CSS_SELECTOR, "#table-filter tbody tr"))\ndriver.find_element(By.CSS_SELECTOR, "[data-testid=answer-table-filter]").send_keys(str(count))',
            cypress: "cy.get('#table-filter-status').select('Low Stock');\ncy.get('#table-filter tbody tr').its('length')\n  .then((n) => cy.get('[data-testid=answer-table-filter]').type(String(n)));",
          }}
          answer={{ prompt: 'Low Stock rows:', expected: String(rows.filter((r) => r.stock === 'Low Stock').length) }}
        >
          <div className="mb-3 flex flex-wrap items-center gap-3">
            <label htmlFor="table-filter-status" className="text-sm font-medium">Status</label>
            <select id="table-filter-status" value={filter} onChange={(e) => setFilter(e.target.value as Stock | '')} className="rounded-md border border-border bg-white p-2 text-sm">
              <option value="">All</option>
              {STOCKS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <span className="text-sm text-slate-500" id="table-filter-info">Showing {filtered.length} of {rows.length}</span>
          </div>
          <div className="max-h-80 overflow-auto border border-border rounded-lg">
            <table className="w-full text-sm text-left" id="table-filter">
              <thead className="sticky top-0 bg-slate-50 text-slate-700 font-medium border-b border-border">
                <tr><th className={th}>Product Name</th><th className={th}>Price</th><th className={th}>Status</th></tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className="border-b border-border last:border-0">
                    <td className={`${td} font-medium`}>{r.name}</td>
                    <td className={td}>${r.price}</td>
                    <td className={td}><span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${badge(r.stock)}`}>{r.stock}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </PracticeElement>
      </Section>

      <Section n={2} title="Lists">
        <PracticeElement
          id="list-unordered" label="Count and read list items"
          goal="Type the text of the last item in the checklist."
          pass={['The answer matches the last item exactly']}
          fail={['Assuming the list always has the same length: it changes every visit']}
          hint="Collect all the li elements and take the last one, rather than a fixed position."
          code={{
            playwright: "const last = await page.locator('#list-unordered li').last().textContent();\nawait page.getByTestId('answer-list-unordered').fill(last!);",
            seleniumJava: 'List<WebElement> items = driver.findElements(By.cssSelector("#list-unordered li"));\nString last = items.get(items.size() - 1).getText();\ndriver.findElement(By.cssSelector("[data-testid=answer-list-unordered]")).sendKeys(last);',
            seleniumPython: 'items = driver.find_elements(By.CSS_SELECTOR, "#list-unordered li")\ndriver.find_element(By.CSS_SELECTOR, "[data-testid=answer-list-unordered]").send_keys(items[-1].text)',
            cypress: "cy.get('#list-unordered li').last().invoke('text')\n  .then((t) => cy.get('[data-testid=answer-list-unordered]').type(t));",
          }}
          answer={{ prompt: 'Last item:', expected: LIST_ITEMS[listLength - 1] }}
        >
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <h3 className="mb-2 text-sm font-semibold">Checklist (unordered)</h3>
              <ul className="list-disc list-inside space-y-1.5 text-slate-700" id="list-unordered">
                {LIST_ITEMS.slice(0, listLength).map((t) => <li key={t}>{t}</li>)}
              </ul>
            </div>
            <div>
              <h3 className="mb-2 text-sm font-semibold">Steps (ordered)</h3>
              <ol className="list-decimal list-inside space-y-1.5 text-slate-700" id="list-ordered">
                <li>Step one</li><li>Step two</li><li>Step three</li>
              </ol>
            </div>
          </div>
        </PracticeElement>
      </Section>

      <Section n={3} title="Pagination">
        <PracticeElement
          id="pagination" label="Pager"
          goal="Jump to the last page, then use Previous to go back to page 9."
          pass={['The info text reads “Showing page 9 of 10”', 'Next is disabled on page 10']}
          fail={['Clicking Next nine times when a direct link exists', 'Clicking Previous on page 1: it is disabled']}
          hint="Assert the info text after each step instead of counting clicks."
          code={{
            playwright: "await page.locator('#pagination-10').click();\nawait expect(page.locator('#pagination-next')).toBeDisabled();\nawait page.locator('#pagination-prev').click();\nawait expect(page.locator('#pagination-info')).toHaveText('Showing page 9 of 10');",
            seleniumJava: 'driver.findElement(By.id("pagination-10")).click();\nassertFalse(driver.findElement(By.id("pagination-next")).isEnabled());\ndriver.findElement(By.id("pagination-prev")).click();\nassertEquals("Showing page 9 of 10", driver.findElement(By.id("pagination-info")).getText());',
            seleniumPython: 'driver.find_element(By.ID, "pagination-10").click()\nassert not driver.find_element(By.ID, "pagination-next").is_enabled()\ndriver.find_element(By.ID, "pagination-prev").click()\nassert driver.find_element(By.ID, "pagination-info").text == "Showing page 9 of 10"',
            cypress: "cy.get('#pagination-10').click();\ncy.get('#pagination-next').should('be.disabled');\ncy.get('#pagination-prev').click();\ncy.get('#pagination-info').should('have.text', 'Showing page 9 of 10');",
          }}
          done={reachedLast && page === 9}
        >
          <div className="flex flex-col items-center gap-4">
            <div className="text-sm text-slate-500" id="pagination-info" aria-live="polite">Showing page {page} of {TOTAL_PAGES}</div>
            <nav aria-label="Pagination" className="flex flex-wrap items-center justify-center gap-2">
              <Button variant="outline" disabled={page === 1} onClick={() => goTo(page - 1)} id="pagination-prev">Previous</Button>
              {[1, 2, 3].map(pageBtn)}
              <span className="px-2">...</span>
              {page > 3 && page < TOTAL_PAGES && pageBtn(page)}
              {pageBtn(TOTAL_PAGES)}
              <Button variant="outline" disabled={page === TOTAL_PAGES} onClick={() => goTo(page + 1)} id="pagination-next">Next</Button>
            </nav>
          </div>
        </PracticeElement>
      </Section>
    </div>
  );
}
