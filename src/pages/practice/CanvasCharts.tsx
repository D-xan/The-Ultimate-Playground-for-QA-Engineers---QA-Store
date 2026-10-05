import React, { useEffect, useRef, useState } from 'react';
import { SolutionTabs } from '@/components/practice/SolutionTabs';
import { Button } from '@/components/ui/Button';
import { ChallengeResult, type ResultState } from '@/components/ui/ChallengeResult';
import { PracticeElement } from '@/components/practice/PracticeElement';
import { PracticeSection as Section } from '@/components/practice/PracticeSection';
import { targetAt, isHit, SALES, TARGET_W, TARGET_H, TARGET_R, type Point } from '@/utils/canvasMath';


const DRAW_W = 600;
const DRAW_H = 200;
const START_BOX = { x: 20, y: 60, w: 80, h: 80 };
const END_BOX = { x: 500, y: 60, w: 80, h: 80 };
const MIN_MOVES = 5;
const HITS_NEEDED = 3;

const CHART_W = 600;
const CHART_H = 260;
const CHART_MAX = 8000;
const BAR_SLOT = CHART_W / SALES.length;

const inBox = (p: Point, b: typeof START_BOX) => p.x >= b.x && p.x <= b.x + b.w && p.y >= b.y && p.y <= b.y + b.h;

/** Sizes the backing store for sharp drawing and returns a context scaled to drawing units. */
function setupCanvas(canvas: HTMLCanvasElement, w: number, h: number) {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  const ctx = canvas.getContext('2d');
  ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
  return ctx;
}

/** Converts a pointer event to the canvas's drawing coordinates (the canvas may be shrunk on phones). */
function toDrawing(e: React.PointerEvent<HTMLCanvasElement>, w: number): Point {
  const rect = e.currentTarget.getBoundingClientRect();
  const scale = w / rect.width;
  return { x: (e.clientX - rect.left) * scale, y: (e.clientY - rect.top) * scale };
}

declare global {
  interface Window {
    qaCanvas?: { target(): { x: number; y: number; r: number } };
  }
}

/** Keeps pointer events coming while the pointer leaves the element. Synthetic events (Cypress, dispatchEvent) have no active pointer to capture. */
function capturePointer(e: React.PointerEvent<Element>) {
  try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* not a real pointer */ }
}

export default function CanvasCharts() {
  const targetRef = useRef<HTMLCanvasElement>(null);
  const startedAt = useRef(performance.now());
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);

  const drawRef = useRef<HTMLCanvasElement>(null);
  const stroke = useRef<{ points: Point[]; moves: number } | null>(null);
  const [drawResult, setDrawResult] = useState<ResultState>('pending');

  const [hovered, setHovered] = useState<number | null>(null);
  const [peak, setPeak] = useState('');
  const [peakResult, setPeakResult] = useState<ResultState>('pending');

  const elapsed = () => (performance.now() - startedAt.current) / 1000;

  useEffect(() => {
    const canvas = targetRef.current;
    if (!canvas) return;
    const ctx = setupCanvas(canvas, TARGET_W, TARGET_H);
    let frame = 0;
    const draw = () => {
      if (ctx) {
        const p = targetAt(elapsed());
        ctx.clearRect(0, 0, TARGET_W, TARGET_H);
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(0, 0, TARGET_W, TARGET_H);
        ctx.beginPath();
        ctx.arc(p.x, p.y, TARGET_R, 0, Math.PI * 2);
        ctx.fillStyle = '#ef4444';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(p.x, p.y, TARGET_R / 2.5, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();
      }
      frame = requestAnimationFrame(draw);
    };
    draw();
    // Test hook, the way real canvas apps expose state: position in CSS pixels relative to the canvas box.
    window.qaCanvas = {
      target() {
        const scale = canvas.getBoundingClientRect().width / TARGET_W;
        const p = targetAt(elapsed());
        return { x: p.x * scale, y: p.y * scale, r: TARGET_R * scale };
      },
    };
    return () => {
      cancelAnimationFrame(frame);
      delete window.qaCanvas;
    };
  }, []);

  const paintDrawCanvas = (points: Point[] = []) => {
    const canvas = drawRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, DRAW_W, DRAW_H);
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, DRAW_W, DRAW_H);
    for (const [box, color, label] of [[START_BOX, '#3b82f6', 'Start'], [END_BOX, '#22c55e', 'End']] as const) {
      ctx.fillStyle = color + '33';
      ctx.fillRect(box.x, box.y, box.w, box.h);
      ctx.strokeStyle = color;
      ctx.strokeRect(box.x, box.y, box.w, box.h);
      ctx.fillStyle = '#334155';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(label, box.x + box.w / 2, box.y + box.h / 2 + 5);
    }
    if (points.length > 1) {
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (const p of points.slice(1)) ctx.lineTo(p.x, p.y);
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 3;
      ctx.stroke();
    }
  };

  useEffect(() => {
    if (drawRef.current) setupCanvas(drawRef.current, DRAW_W, DRAW_H);
    paintDrawCanvas();
  }, []);

  const onTargetDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const p = toDrawing(e, TARGET_W);
    if (isHit(p, targetAt(elapsed()), TARGET_R)) setHits((n) => n + 1);
    else setMisses((n) => n + 1);
  };

  const onDrawDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    capturePointer(e);
    stroke.current = { points: [toDrawing(e, DRAW_W)], moves: 0 };
  };

  const onDrawMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const s = stroke.current;
    if (!s) return;
    s.points.push(toDrawing(e, DRAW_W));
    s.moves += 1;
    paintDrawCanvas(s.points);
  };

  const onDrawUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const s = stroke.current;
    stroke.current = null;
    if (!s) return;
    s.points.push(toDrawing(e, DRAW_W));
    paintDrawCanvas(s.points);
    const inside = s.points.every((p) => p.x >= 0 && p.x <= DRAW_W && p.y >= 0 && p.y <= DRAW_H);
    const ok = inside && s.moves >= MIN_MOVES && inBox(s.points[0], START_BOX) && inBox(s.points[s.points.length - 1], END_BOX);
    setDrawResult((prev) => (prev === 'success' ? prev : ok ? 'success' : 'failure'));
  };

  const clearDraw = () => {
    stroke.current = null;
    setDrawResult('pending');
    paintDrawCanvas();
  };

  const checkPeak = () => {
    if (peakResult === 'success') return;
    setPeakResult(['aug', 'august'].includes(peak.trim().toLowerCase()) ? 'success' : 'failure');
  };

  const targetDone = hits >= HITS_NEEDED;
  const hoveredBar = hovered === null ? null : SALES[hovered];

  return (
    <div className="space-y-10 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Canvas &amp; Charts</h1>
        <p className="text-slate-500">Canvas has no DOM inside it, so locators stop at its edge. Click by coordinates, draw with the mouse, and read chart values from tooltips. Each task ticks itself when its result box turns green.</p>
      </div>

      <Section n={1} title="Moving Target">
        <PracticeElement
          id="target" label="Moving target"
          goal={"Click the moving red circle three times. Clicks that miss are counted too."}
          pass={["Three hits turn the result green."]}
          fail={["Clicking where the target used to be is a miss."]}
          hint={"Call window.qaCanvas.target() right before each click and click at the canvas's left + x, top + y."}
          code={{
            playwright: "// The page exposes the target's position: window.qaCanvas.target() returns {x, y}\nconst canvas = page.locator('#target-canvas');\nawait canvas.evaluate((el) => el.scrollIntoView({ block: 'center' }));\nfor (let i = 0; i < 3; i++) {\n  const box = (await canvas.boundingBox())!;\n  const t = await page.evaluate(() => (window as any).qaCanvas.target());\n  await page.mouse.click(box.x + t.x, box.y + t.y);\n}\nawait expect(page.locator('#canvas-hits')).toHaveText('3');",
            seleniumJava: "WebElement canvas = driver.findElement(By.id(\"target-canvas\"));\nJavascriptExecutor js = (JavascriptExecutor) driver;\njs.executeScript(\"arguments[0].scrollIntoView({block: 'center'})\", canvas);\nfor (int i = 0; i < 3; i++) {\n  Map<String, Number> t = (Map<String, Number>) js.executeScript(\"return window.qaCanvas.target()\");\n  // moveToElement offsets are from the element's centre\n  int dx = t.get(\"x\").intValue() - canvas.getSize().getWidth() / 2;\n  int dy = t.get(\"y\").intValue() - canvas.getSize().getHeight() / 2;\n  new Actions(driver).moveToElement(canvas, dx, dy).click().perform();\n}",
            seleniumPython: "canvas = driver.find_element(By.ID, \"target-canvas\")\ndriver.execute_script(\"arguments[0].scrollIntoView({block: 'center'})\", canvas)\nfor _ in range(3):\n    t = driver.execute_script(\"return window.qaCanvas.target()\")\n    dx = t[\"x\"] - canvas.size[\"width\"] / 2   # offsets are from the centre\n    dy = t[\"y\"] - canvas.size[\"height\"] / 2\n    ActionChains(driver).move_to_element_with_offset(canvas, dx, dy).click().perform()",
            cypress: "Cypress._.times(3, () => {\n  cy.window().then((win) => {\n    const t = win.qaCanvas.target();\n    cy.get('#target-canvas').click(t.x, t.y); // x, y from the top-left corner\n  });\n});\ncy.get('#canvas-hits').should('have.text', '3');",
          }}
          done={targetDone}
        >
          <canvas
            ref={targetRef}
            id="target-canvas"
            data-testid="target-canvas"
            onPointerDown={onTargetDown}
            aria-label="Moving target"
            role="img"
            style={{ aspectRatio: `${TARGET_W} / ${TARGET_H}` }}
            className="block w-full max-w-[600px] h-auto rounded-xl border border-border cursor-crosshair touch-none"
          />
          <p className="mt-4 mb-4 text-sm text-slate-600">Hits: <strong id="canvas-hits" data-testid="canvas-hits">{hits}</strong> · Misses: <strong id="canvas-misses" data-testid="canvas-misses">{misses}</strong></p>
          <ChallengeResult testId="result-target" state={targetDone ? 'success' : 'pending'} message={targetDone ? 'Three hits' : `Hit the target ${HITS_NEEDED} times`} />
        </PracticeElement>
      </Section>

      <Section n={2} title="Draw a Line">
        <PracticeElement
          id="draw" label="Draw a line"
          goal={"Press inside Start, drag to End in one continuous stroke and release inside End."}
          pass={["A continuous stroke from Start to End turns the result green."]}
          fail={["Jumping straight to End without the moves in between fails.","Starting or ending outside the boxes fails."]}
          hint={"Press inside Start, move to End in ten or more small steps, then release. One big jump is ignored."}
          code={{
            playwright: "const canvas = page.locator('#draw-canvas');\nawait canvas.evaluate((el) => el.scrollIntoView({ block: 'center' }));\nconst b = (await canvas.boundingBox())!;\nawait page.mouse.move(b.x + b.width * 0.1, b.y + b.height / 2);\nawait page.mouse.down();\nawait page.mouse.move(b.x + b.width * 0.9, b.y + b.height / 2, { steps: 20 }); // a stroke needs steps\nawait page.mouse.up();",
            seleniumJava: "WebElement canvas = driver.findElement(By.id(\"draw-canvas\"));\nint w = canvas.getSize().getWidth();\nActions a = new Actions(driver).moveToElement(canvas, (int) (-w * 0.4), 0).clickAndHold();\nfor (int i = 0; i < 16; i++) a.moveByOffset((int) (w * 0.05), 0); // many small moves, not one jump\na.release().perform();",
            seleniumPython: "canvas = driver.find_element(By.ID, \"draw-canvas\")\nw = canvas.size[\"width\"]\nchain = ActionChains(driver).move_to_element_with_offset(canvas, -w * 0.4, 0).click_and_hold()\nfor _ in range(16):\n    chain.move_by_offset(w * 0.05, 0)\nchain.release().perform()",
            cypress: "cy.get('#draw-canvas').then(($c) => {\n  const { width, height } = $c[0].getBoundingClientRect();\n  cy.wrap($c).trigger('pointerdown', width * 0.1, height / 2, { pointerId: 1 });\n  for (let i = 2; i <= 9; i++) cy.wrap($c).trigger('pointermove', width * 0.1 * i, height / 2, { pointerId: 1 });\n  cy.wrap($c).trigger('pointerup', width * 0.9, height / 2, { pointerId: 1 });\n});",
          }}
          done={drawResult === 'success'}
        >
          <canvas
            ref={drawRef}
            id="draw-canvas"
            data-testid="draw-canvas"
            onPointerDown={onDrawDown}
            onPointerMove={onDrawMove}
            onPointerUp={onDrawUp}
            aria-label="Drawing area"
            role="img"
            style={{ aspectRatio: `${DRAW_W} / ${DRAW_H}` }}
            className="block w-full max-w-[600px] h-auto rounded-xl border border-border cursor-crosshair touch-none"
          />
          <div className="mt-4 space-y-4">
            <Button id="clear-draw" data-testid="clear-draw" variant="outline" onClick={clearDraw}>Clear</Button>
            <ChallengeResult testId="result-draw" state={drawResult} message={drawResult === 'success' ? 'Line drawn' : drawResult === 'failure' ? 'Draw one continuous line from the left box to the right box' : 'Draw a line from Start to End'} />
          </div>
        </PracticeElement>
      </Section>

      <Section n={3} title="Chart Tooltip">
        <PracticeElement
          id="chart" label="Chart tooltip"
          goal={"Hover the bars to read each month's sales, then enter the month with the highest sales."}
          pass={["Hovering a bar shows a tooltip such as 'Mar: 4,210'.","Entering the peak month turns the result green."]}
          fail={["The values are not in the page until you hover."]}
          hint={"Hover each bar, wait for the tooltip to name that month, and keep the largest number."}
          code={{
            playwright: "const bars = page.locator('#sales-chart [data-month]');\nlet best = { month: '', value: -1 };\nfor (let i = 0; i < (await bars.count()); i++) {\n  const month = (await bars.nth(i).getAttribute('data-month'))!;\n  await bars.nth(i).hover();\n  await expect(page.locator('#chart-tooltip')).toContainText(month);\n  const value = Number((await page.locator('#chart-tooltip').innerText()).replace(/\\D/g, ''));\n  if (value > best.value) best = { month, value };\n}\nawait page.locator('#peak-month').fill(best.month);\nawait page.locator('#check-peak').click();",
            seleniumJava: "String bestMonth = \"\"; int best = -1;\nfor (WebElement bar : driver.findElements(By.cssSelector(\"#sales-chart [data-month]\"))) {\n  String month = bar.getDomAttribute(\"data-month\");\n  new Actions(driver).moveToElement(bar).perform();\n  wait.until(ExpectedConditions.textToBePresentInElementLocated(By.id(\"chart-tooltip\"), month));\n  int value = Integer.parseInt(driver.findElement(By.id(\"chart-tooltip\")).getText().replaceAll(\"\\\\D\", \"\"));\n  if (value > best) { best = value; bestMonth = month; }\n}\ndriver.findElement(By.id(\"peak-month\")).sendKeys(bestMonth);\ndriver.findElement(By.id(\"check-peak\")).click();",
            seleniumPython: "best_month, best = \"\", -1\nfor bar in driver.find_elements(By.CSS_SELECTOR, \"#sales-chart [data-month]\"):\n    month = bar.get_attribute(\"data-month\")\n    ActionChains(driver).move_to_element(bar).perform()\n    wait.until(EC.text_to_be_present_in_element((By.ID, \"chart-tooltip\"), month))\n    value = int(re.sub(r\"\\D\", \"\", driver.find_element(By.ID, \"chart-tooltip\").text))\n    if value > best:\n        best_month, best = month, value\ndriver.find_element(By.ID, \"peak-month\").send_keys(best_month)\ndriver.find_element(By.ID, \"check-peak\").click()",
            cypress: "let best = { month: '', value: -1 };\ncy.get('#sales-chart [data-month]').each(($bar) => {\n  const month = $bar.attr('data-month');\n  cy.wrap($bar).trigger('mouseover');\n  cy.get('#chart-tooltip').should('contain', month).invoke('text').then((t) => {\n    const value = Number(t.replace(/\\D/g, ''));\n    if (value > best.value) best = { month, value };\n  });\n}).then(() => {\n  cy.get('#peak-month').type(best.month);\n  cy.get('#check-peak').click();\n});",
          }}
          done={peakResult === 'success'}
        >
          <div className="relative max-w-[600px]">
            {hoveredBar && (
              <div
                id="chart-tooltip"
                data-testid="chart-tooltip"
                role="tooltip"
                style={{ left: `${Math.min(88, Math.max(12, ((hovered! + 0.5) / SALES.length) * 100))}%` }}
                className="pointer-events-none absolute top-0 -translate-x-1/2 rounded-md bg-slate-900 px-2 py-1 text-xs font-medium text-white"
              >
                {hoveredBar.month}: {hoveredBar.value.toLocaleString('en-US')}
              </div>
            )}
            <svg id="sales-chart" data-testid="sales-chart" viewBox={`0 0 ${CHART_W} ${CHART_H}`} className="w-full h-auto" role="group" aria-label="Monthly sales">
              {SALES.map((s, i) => {
                const h = (s.value / CHART_MAX) * 200;
                return (
                  <g key={s.month}>
                    <rect
                      data-month={s.month}
                      x={i * BAR_SLOT + 8}
                      y={230 - h}
                      width={BAR_SLOT - 16}
                      height={h}
                      rx={4}
                      tabIndex={0}
                      role="img"
                      aria-label={s.month}
                      onMouseEnter={() => setHovered(i)}
                      onFocus={() => setHovered(i)}
                      onMouseLeave={() => setHovered(null)}
                      onBlur={() => setHovered(null)}
                      className={hovered === i ? 'fill-primary' : 'fill-primary/60'}
                    />
                    <text x={i * BAR_SLOT + BAR_SLOT / 2} y={252} textAnchor="middle" className="fill-slate-500 text-[13px]">{s.month}</text>
                  </g>
                );
              })}
            </svg>
          </div>
          <div className="flex flex-wrap items-center gap-3 mt-4 mb-4">
            <input
              id="peak-month"
              data-testid="peak-month"
              value={peak}
              onChange={(e) => setPeak(e.target.value)}
              placeholder="Month, e.g. Mar"
              aria-label="Peak month"
              className="w-full max-w-xs px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Button id="check-peak" data-testid="check-peak" onClick={checkPeak}>Check</Button>
          </div>
          <ChallengeResult testId="result-chart" state={peakResult} message={peakResult === 'success' ? 'That is the best month' : peakResult === 'failure' ? 'Not the best month' : 'Enter the month with the highest sales'} />
        </PracticeElement>
      </Section>

      <SolutionTabs challengeId="canvas" number={4} />
    </div>
  );
}
