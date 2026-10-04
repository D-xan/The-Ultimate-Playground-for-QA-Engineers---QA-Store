import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { PracticeElement } from '@/components/practice/PracticeElement';
import { PracticeSection as Section } from '@/components/practice/PracticeSection';

const box = 'p-6 bg-slate-100 rounded-lg text-center select-none border-2 border-dashed border-slate-300';

export default function Interactions() {
  const [singleClicks, setSingleClicks] = useState(0);
  const [doubleClicked, setDoubleClicked] = useState(false);
  const [rightClicked, setRightClicked] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [hoverAction, setHoverAction] = useState(false);
  const [dropped, setDropped] = useState(false);
  const [lastKey, setLastKey] = useState('Awaiting keypress...');
  const [combo, setCombo] = useState(false);

  return (
    <div className="space-y-10 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Mouse & Keyboard Interactions</h1>
        <p className="text-slate-500">Double click, right click, hover, drag and drop, and key combinations. Each element shows its goal beside it, and its task ticks itself the moment your script gets it right.</p>
      </div>

      <Section n={1} title="Mouse actions">
        <PracticeElement
          id="box-double-click" label="Double click"
          goal="Double-click the box so it reports success."
          pass={['The box reads “Double Click Successful!”', 'Single clicks alone never change it']}
          fail={['Two separate click() calls: they may be too slow to count as a double click', 'Asserting before the event lands']}
          hint="Use the tool's own double-click action. It sends both clicks with the right timing."
          code={{
            playwright: "await page.locator('#box-double-click').dblclick();\nawait expect(page.locator('#box-double-click')).toHaveText('Double Click Successful!');",
            seleniumJava: 'new Actions(driver).doubleClick(driver.findElement(By.id("box-double-click"))).perform();\nassertEquals("Double Click Successful!", driver.findElement(By.id("box-double-click")).getText());',
            seleniumPython: 'ActionChains(driver).double_click(driver.find_element(By.ID, "box-double-click")).perform()\nassert driver.find_element(By.ID, "box-double-click").text == "Double Click Successful!"',
            cypress: "cy.get('#box-double-click').dblclick().should('have.text', 'Double Click Successful!');",
          }}
          done={doubleClicked}
        >
          <div className={`${box} cursor-pointer`} id="box-double-click" onClick={() => setSingleClicks((n) => n + 1)} onDoubleClick={() => setDoubleClicked(true)}>
            {doubleClicked ? 'Double Click Successful!' : 'Not double-clicked yet'}
          </div>
          <p className="mt-2 text-xs text-slate-500" data-testid="single-click-count">Single clicks so far: {singleClicks}</p>
        </PracticeElement>

        <PracticeElement
          id="box-right-click" label="Right click (custom context menu)"
          goal="Right-click the box to open its custom menu, then choose “Copy link”."
          pass={['The custom menu appears where you clicked', 'Choosing “Copy link” reports success']}
          fail={['Expecting the browser menu: this page replaces it', 'Clicking the menu item before the menu opens']}
          hint="A right click is a context click. Once the custom menu is in the DOM, it is an ordinary element you can click."
          code={{
            playwright: "await page.locator('#box-right-click').click({ button: 'right' });\nawait page.getByRole('menuitem', { name: 'Copy link' }).click();",
            seleniumJava: 'new Actions(driver).contextClick(driver.findElement(By.id("box-right-click"))).perform();\ndriver.findElement(By.xpath("//*[@role=\'menuitem\' and text()=\'Copy link\']")).click();',
            seleniumPython: 'ActionChains(driver).context_click(driver.find_element(By.ID, "box-right-click")).perform()\ndriver.find_element(By.XPATH, "//*[@role=\'menuitem\' and text()=\'Copy link\']").click()',
            cypress: "cy.get('#box-right-click').rightclick();\ncy.contains('[role=menuitem]', 'Copy link').click();",
          }}
          done={rightClicked}
        >
          <ContextMenuBox onPick={(item) => item === 'Copy link' && setRightClicked(true)} />
        </PracticeElement>

        <PracticeElement
          id="box-hover" label="Hover to reveal"
          goal="Hover over the box to reveal its hidden button, then click that button."
          pass={['The button appears only while hovering', 'Clicking it shows “Hover action done”']}
          fail={['Clicking the button before hovering: it is not rendered yet', 'Moving the mouse away first: the button disappears']}
          hint="Hover first, wait for the button to be visible, then click it. The pointer stays over the box while you click."
          code={{
            playwright: "await page.locator('#box-hover').hover();\nawait page.locator('#hover-reveal-btn').click();",
            seleniumJava: 'new Actions(driver).moveToElement(driver.findElement(By.id("box-hover"))).perform();\nwait.until(ExpectedConditions.elementToBeClickable(By.id("hover-reveal-btn"))).click();',
            seleniumPython: 'ActionChains(driver).move_to_element(driver.find_element(By.ID, "box-hover")).perform()\nwait.until(EC.element_to_be_clickable((By.ID, "hover-reveal-btn"))).click()',
            cypress: "// Cypress has no native hover; trigger the events the page listens to\ncy.get('#box-hover').trigger('mouseover');\ncy.get('#hover-reveal-btn').click();",
          }}
          done={hoverAction}
        >
          <div className={`${box} cursor-pointer transition-colors hover:bg-primary/20`} id="box-hover"
            onMouseOver={() => setHovering(true)} onMouseLeave={() => setHovering(false)}>
            <p>{hovering ? 'Hovering!' : 'Hover over me'}</p>
            {hovering && <Button className="mt-3" id="hover-reveal-btn" onClick={() => setHoverAction(true)}>Hidden action</Button>}
            {hoverAction && <p className="mt-2 text-sm font-medium text-green-700" data-testid="hover-result">Hover action done</p>}
          </div>
        </PracticeElement>

        <PracticeElement
          id="drag-drop" label="Drag and drop (HTML5)"
          goal="Drag “Drag Me” into the drop zone."
          pass={['The zone reads “Dropped!” and turns green']}
          fail={['Selenium’s dragAndDrop() on HTML5 draggable elements: it moves the mouse but fires no drag events', 'Dropping outside the zone']}
          hint="This uses the HTML5 drag API. Playwright handles it natively. Selenium and Cypress need the drag events fired from JavaScript."
          code={{
            playwright: "await page.locator('#draggable-item').dragTo(page.locator('#droppable-zone'));\nawait expect(page.locator('#droppable-zone')).toHaveText('Dropped!');",
            seleniumJava: '// Actions.dragAndDrop does not fire HTML5 drag events, so dispatch them in the page\nString js = "const [s, t] = arguments; const dt = new DataTransfer();"\n  + "for (const [el, type] of [[s,\'dragstart\'],[t,\'dragover\'],[t,\'drop\']])"\n  + " el.dispatchEvent(new DragEvent(type, {bubbles: true, cancelable: true, dataTransfer: dt}));";\n((JavascriptExecutor) driver).executeScript(js,\n  driver.findElement(By.id("draggable-item")), driver.findElement(By.id("droppable-zone")));',
            seleniumPython: 'js = """const [s, t] = arguments; const dt = new DataTransfer();\nfor (const [el, type] of [[s,\'dragstart\'],[t,\'dragover\'],[t,\'drop\']])\n  el.dispatchEvent(new DragEvent(type, {bubbles: true, cancelable: true, dataTransfer: dt}));"""\ndriver.execute_script(js, driver.find_element(By.ID, "draggable-item"), driver.find_element(By.ID, "droppable-zone"))',
            cypress: "const dataTransfer = new DataTransfer();\ncy.get('#draggable-item').trigger('dragstart', { dataTransfer });\ncy.get('#droppable-zone').trigger('dragover', { dataTransfer }).trigger('drop', { dataTransfer });\ncy.get('#droppable-zone').should('have.text', 'Dropped!');",
          }}
          done={dropped}
        >
          <div className="flex flex-wrap gap-4">
            <div className="w-24 h-24 bg-primary text-slate-900 font-semibold flex items-center justify-center rounded-lg cursor-grab active:cursor-grabbing"
              draggable onDragStart={(e) => e.dataTransfer.setData('text/plain', 'dragged')} id="draggable-item">
              Drag Me
            </div>
            <div className={`w-32 h-24 border-2 border-dashed rounded-lg flex items-center justify-center transition-colors ${dropped ? 'bg-green-100 border-green-500 text-green-800' : 'border-slate-300 bg-slate-50'}`}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); if (e.dataTransfer.getData('text/plain') === 'dragged') setDropped(true); }}
              id="droppable-zone">
              {dropped ? 'Dropped!' : 'Drop Here'}
            </div>
          </div>
        </PracticeElement>
      </Section>

      <Section n={2} title="Keyboard actions">
        <PracticeElement
          id="keyboard-input" label="Key combination"
          goal="Focus the input and press Ctrl+Shift+K."
          pass={['The logger shows “Key Pressed: K” with Ctrl and Shift held']}
          fail={['Typing the letters “ctrl+shift+k” as text', 'Releasing Ctrl before pressing K']}
          hint="Hold the modifiers down while the key is pressed. Every tool has a way to send a chord or to key-down, press, key-up."
          code={{
            playwright: "await page.locator('#keyboard-input').press('Control+Shift+K');\nawait expect(page.locator('#key-output')).toContainText('Ctrl+Shift');",
            seleniumJava: 'driver.findElement(By.id("keyboard-input")).click();\nnew Actions(driver).keyDown(Keys.CONTROL).keyDown(Keys.SHIFT).sendKeys("k")\n  .keyUp(Keys.SHIFT).keyUp(Keys.CONTROL).perform();',
            seleniumPython: 'driver.find_element(By.ID, "keyboard-input").click()\nActionChains(driver).key_down(Keys.CONTROL).key_down(Keys.SHIFT).send_keys("k") \\\n    .key_up(Keys.SHIFT).key_up(Keys.CONTROL).perform()',
            cypress: "cy.get('#keyboard-input').type('{ctrl}{shift}k');\ncy.get('#key-output').should('contain', 'Ctrl+Shift');",
          }}
          done={combo}
        >
          <input
            type="text" placeholder="Type here..." aria-label="Key event logger" id="keyboard-input"
            className="w-full border border-border rounded-md p-4 text-lg font-mono focus:ring-2 focus:ring-primary focus:outline-none"
            onKeyDown={(e) => {
              const mods = [e.ctrlKey && 'Ctrl', e.shiftKey && 'Shift', e.altKey && 'Alt', e.metaKey && 'Meta'].filter(Boolean).join('+');
              setLastKey(`Key Pressed: ${e.key.length === 1 ? e.key.toUpperCase() : e.key} | Code: ${e.code}${mods ? ` | Modifiers: ${mods}` : ''}`);
              if (e.ctrlKey && e.shiftKey && e.code === 'KeyK') { e.preventDefault(); setCombo(true); }
            }}
          />
          <div className="mt-4 p-4 bg-slate-900 text-green-400 font-mono rounded-lg text-sm break-words" id="key-output" aria-live="polite">{lastKey}</div>
        </PracticeElement>
      </Section>
    </div>
  );
}

const MENU = ['Open', 'Copy link', 'Delete'];

function ContextMenuBox({ onPick }: { onPick: (item: string) => void }) {
  const [menu, setMenu] = useState<{ x: number; y: number } | null>(null);
  const [picked, setPicked] = useState<string | null>(null);
  return (
    <div className="relative">
      <div
        className={`${box} cursor-context-menu`} id="box-right-click"
        onContextMenu={(e) => {
          e.preventDefault();
          const r = e.currentTarget.getBoundingClientRect();
          setMenu({ x: e.clientX - r.left, y: e.clientY - r.top });
        }}
        onClick={() => setMenu(null)}
      >
        {picked ? `${picked} chosen. Right Click Successful!` : 'Right-click me'}
      </div>
      {menu && (
        <ul role="menu" data-testid="context-menu" className="absolute z-10 min-w-[9rem] rounded-lg border border-border bg-white py-1 text-sm shadow-lg" style={{ left: menu.x, top: menu.y }}>
          {MENU.map((m) => (
            <li key={m} role="menuitem" tabIndex={-1} className="cursor-pointer px-3 py-1.5 hover:bg-primary/10"
              onClick={() => { setPicked(m); setMenu(null); onPick(m); }}>{m}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
