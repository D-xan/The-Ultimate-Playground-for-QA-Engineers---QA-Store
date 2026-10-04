import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { PracticeElement } from '@/components/practice/PracticeElement';
import { PracticeSection as Section } from '@/components/practice/PracticeSection';

const code = (prefix: string) => `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`;

const FRAME_STYLE = `<style>
  body { font: 14px system-ui, sans-serif; margin: 16px; color: #0f172a; background: #f8fafc; }
  input { padding: 6px 10px; border: 1px solid #cbd5e1; border-radius: 6px; }
  button { padding: 6px 14px; border: 0; border-radius: 6px; background: #0f172a; color: #fff; cursor: pointer; }
  iframe { width: 100%; height: 70px; border: 2px dashed #cbd5e1; border-radius: 6px; background: #fff; }
</style>`;

const SHADOW_STYLE = `<style>
  .box { background: #f8fafc; border: 2px dashed #cbd5e1; padding: 20px; border-radius: 8px; text-align: center; font-family: system-ui, sans-serif; color: #0f172a; }
  button { background: #0f172a; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; margin-top: 10px; }
</style>`;

export default function FramesDOM() {
  // Values a script can only know by reading the page (or the frame), so a correct answer proves it did.
  const [accessCode] = useState(() => code('ACCESS'));
  const [innerCode] = useState(() => code('INNER'));
  const [shadowCode] = useState(() => code('SHADOW'));

  const [frameDone, setFrameDone] = useState(false);
  const [backOnMain, setBackOnMain] = useState(false);
  const [shadowClicked, setShadowClicked] = useState(false);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const shadowHostRef = useRef<HTMLDivElement>(null);
  const nestedHostRef = useRef<HTMLDivElement>(null);

  // The frame is same-origin (srcdoc), so the page can listen to its button directly.
  const wireFrame = () => {
    const doc = frameRef.current?.contentDocument;
    const btn = doc?.getElementById('frame-submit');
    if (!doc || !btn || btn.dataset.wired) return;
    btn.dataset.wired = '1';
    btn.addEventListener('click', () => {
      const ok = (doc.getElementById('frame-input') as HTMLInputElement).value.trim() === accessCode;
      doc.getElementById('frame-status')!.textContent = ok ? 'Code accepted' : 'Wrong code';
      if (ok) setFrameDone(true);
    });
  };
  useEffect(wireFrame);

  useEffect(() => {
    const host = shadowHostRef.current;
    if (host && !host.shadowRoot) {
      const shadow = host.attachShadow({ mode: 'open' });
      shadow.innerHTML = `${SHADOW_STYLE}<div class="box"><h3 id="shadow-title">I live inside a Shadow DOM!</h3><p>Ordinary document queries cannot see me.</p><button id="shadow-btn">Click me if you can</button><p id="shadow-status"></p></div>`;
      shadow.getElementById('shadow-btn')!.addEventListener('click', () => {
        shadow.getElementById('shadow-status')!.textContent = 'Shadow button clicked';
        setShadowClicked(true);
      });
    }
    const outer = nestedHostRef.current;
    if (outer && !outer.shadowRoot) {
      const outerRoot = outer.attachShadow({ mode: 'open' });
      outerRoot.innerHTML = `${SHADOW_STYLE}<div class="box"><p>Outer shadow root</p><div id="inner-host"></div></div>`;
      const innerRoot = outerRoot.getElementById('inner-host')!.attachShadow({ mode: 'open' });
      innerRoot.innerHTML = `<p style="font-family: system-ui; margin: 8px 0 0">Inner shadow root. Code: <strong id="nested-code">${shadowCode}</strong></p>`;
    }
  }, [shadowCode]);

  return (
    <div className="space-y-10 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Frames & Shadow DOM</h1>
        <p className="text-slate-500">Isolated contexts: iframes, nested iframes and shadow roots. Each element shows its goal beside it, and its task ticks itself the moment your script gets it right. New tabs and popup windows have their own page: <Link to="/practice/windows" className="text-primary underline">Windows &amp; Tabs</Link>.</p>
      </div>

      <Section n={1} title="Frames (iframe)">
        <PracticeElement
          id="practice-iframe" label="Switch into an iframe"
          goal="Read the access code on the main page, switch into the frame, type the code there and press Submit."
          pass={['The frame says “Code accepted”']}
          fail={['Looking for #frame-input from the main document: it is not there', 'Typing the code before switching into the frame']}
          hint="Read the code first, while you are still on the main page. Then switch to the frame by its id or element."
          code={{
            playwright: "const accessCode = await page.locator('#access-code').textContent();\nconst frame = page.frameLocator('#practice-iframe');\nawait frame.locator('#frame-input').fill(accessCode!);\nawait frame.locator('#frame-submit').click();\nawait expect(frame.locator('#frame-status')).toHaveText('Code accepted');",
            seleniumJava: 'String accessCode = driver.findElement(By.id("access-code")).getText();\ndriver.switchTo().frame("practice-iframe");\ndriver.findElement(By.id("frame-input")).sendKeys(accessCode);\ndriver.findElement(By.id("frame-submit")).click();',
            seleniumPython: 'access_code = driver.find_element(By.ID, "access-code").text\ndriver.switch_to.frame("practice-iframe")\ndriver.find_element(By.ID, "frame-input").send_keys(access_code)\ndriver.find_element(By.ID, "frame-submit").click()',
            cypress: "cy.get('#access-code').invoke('text').then((accessCode) => {\n  cy.get('#practice-iframe').its('0.contentDocument.body').within(() => {\n    cy.get('#frame-input').type(accessCode);\n    cy.get('#frame-submit').click();\n  });\n});",
          }}
          done={frameDone}
        >
          <p className="mb-3 text-sm text-slate-600">Access code: <code id="access-code" className="font-semibold text-slate-900">{accessCode}</code></p>
          <iframe
            ref={frameRef}
            onLoad={wireFrame}
            id="practice-iframe"
            name="practice-iframe"
            title="Practice iframe"
            className="h-40 w-full rounded-lg border border-border bg-slate-50"
            srcDoc={`${FRAME_STYLE}<p><strong>Inside the iframe</strong></p><input id="frame-input" placeholder="Access code" aria-label="Access code"> <button id="frame-submit">Submit</button><p id="frame-status"></p>`}
          />
        </PracticeElement>

        <PracticeElement
          id="frame-back" label="Back to the main page"
          goal="After the frame task, switch back to the main document and click “Confirm on main page”."
          pass={['The page says “Back on the main page”', 'It only counts once the frame code was accepted']}
          fail={['Staying inside the frame: Selenium cannot find main-page elements from there', 'Switching to the parent of a top-level frame instead of the default content']}
          hint="Selenium stays in a frame until you switch out. Playwright and Cypress scope to frames per call, so there is nothing to undo."
          code={{
            playwright: "// frameLocator scopes only the calls made through it\nawait page.locator('#btn-main-confirm').click();",
            seleniumJava: 'driver.switchTo().defaultContent();\ndriver.findElement(By.id("btn-main-confirm")).click();',
            seleniumPython: 'driver.switch_to.default_content()\ndriver.find_element(By.ID, "btn-main-confirm").click()',
            cypress: "// within() ends with its callback\ncy.get('#btn-main-confirm').click();",
          }}
          done={backOnMain}
        >
          <Button id="btn-main-confirm" variant="outline" onClick={() => frameDone && setBackOnMain(true)}>Confirm on main page</Button>
          <p className="mt-2 text-sm text-slate-600" id="main-confirm-status">
            {backOnMain ? 'Back on the main page' : frameDone ? 'Ready: the frame code was accepted' : 'Solve the frame task first'}
          </p>
        </PracticeElement>

        <PracticeElement
          id="nested-iframe" label="Nested iframe"
          goal="Read the code inside the inner frame (a frame inside a frame) and type it in the answer box."
          pass={['The answer matches the inner frame’s code']}
          fail={['Switching straight to the inner frame from the main page', 'Forgetting to come back out before typing the answer']}
          hint="Frames are entered one level at a time: outer frame first, then the inner one."
          code={{
            playwright: "const inner = page.frameLocator('#outer-frame').frameLocator('#inner-frame');\nconst text = await inner.locator('#inner-code').textContent();\nawait page.getByTestId('answer-nested-iframe').fill(text!);",
            seleniumJava: 'driver.switchTo().frame("outer-frame").switchTo().frame("inner-frame");\nString text = driver.findElement(By.id("inner-code")).getText();\ndriver.switchTo().defaultContent();\ndriver.findElement(By.cssSelector("[data-testid=answer-nested-iframe]")).sendKeys(text);',
            seleniumPython: 'driver.switch_to.frame("outer-frame")\ndriver.switch_to.frame("inner-frame")\ntext = driver.find_element(By.ID, "inner-code").text\ndriver.switch_to.default_content()\ndriver.find_element(By.CSS_SELECTOR, "[data-testid=answer-nested-iframe]").send_keys(text)',
            cypress: "cy.get('#outer-frame').its('0.contentDocument.body')\n  .find('#inner-frame').its('0.contentDocument.body')\n  .find('#inner-code').invoke('text')\n  .then((t) => cy.get('[data-testid=answer-nested-iframe]').type(t));",
          }}
          answer={{ prompt: 'Inner code:', expected: innerCode }}
        >
          <iframe
            id="outer-frame"
            name="outer-frame"
            title="Outer frame"
            className="h-44 w-full rounded-lg border border-border bg-slate-50"
            srcDoc={`${FRAME_STYLE}<p><strong>Outer frame</strong></p><iframe id="inner-frame" name="inner-frame" title="Inner frame" srcdoc="<p style='font-family:system-ui'>Inner frame. Code: <strong id='inner-code'>${innerCode}</strong></p>"></iframe>`}
          />
        </PracticeElement>
      </Section>

      <Section n={2} title="Shadow DOM">
        <PracticeElement
          id="shadow-host" label="Open shadow root"
          goal="Click the button inside the shadow root."
          pass={['The shadow root shows “Shadow button clicked”']}
          fail={['document.querySelector("#shadow-btn") returns null', 'An XPath locator: XPath cannot cross a shadow boundary']}
          hint="Find the host element first, then search inside its shadow root. Playwright CSS locators pierce open shadow roots on their own."
          code={{
            playwright: "await page.locator('#shadow-host #shadow-btn').click();\nawait expect(page.locator('#shadow-status')).toHaveText('Shadow button clicked');",
            seleniumJava: 'SearchContext root = driver.findElement(By.id("shadow-host")).getShadowRoot();\nroot.findElement(By.cssSelector("#shadow-btn")).click();',
            seleniumPython: 'root = driver.find_element(By.ID, "shadow-host").shadow_root\nroot.find_element(By.CSS_SELECTOR, "#shadow-btn").click()',
            cypress: "cy.get('#shadow-host').shadow().find('#shadow-btn').click();\ncy.get('#shadow-host').shadow().find('#shadow-status').should('have.text', 'Shadow button clicked');",
          }}
          done={shadowClicked}
        >
          <div ref={shadowHostRef} id="shadow-host" />
        </PracticeElement>

        <PracticeElement
          id="nested-shadow" label="Nested shadow roots"
          goal="Read the code from the shadow root inside another shadow root and type it in the answer box."
          pass={['The answer matches the code']}
          fail={['Searching the outer shadow root only: the code is one level deeper', 'Selenium CSS with descendant combinators across both roots']}
          hint="Each shadow root has to be opened from its own host. Chain them: outer host, its root, inner host, its root."
          code={{
            playwright: "// Playwright pierces every open shadow root in one CSS locator\nconst text = await page.locator('#nested-shadow-host #nested-code').textContent();\nawait page.getByTestId('answer-nested-shadow').fill(text!);",
            seleniumJava: 'SearchContext outer = driver.findElement(By.id("nested-shadow-host")).getShadowRoot();\nSearchContext inner = outer.findElement(By.cssSelector("#inner-host")).getShadowRoot();\nString text = inner.findElement(By.cssSelector("#nested-code")).getText();',
            seleniumPython: 'outer = driver.find_element(By.ID, "nested-shadow-host").shadow_root\ninner = outer.find_element(By.CSS_SELECTOR, "#inner-host").shadow_root\ntext = inner.find_element(By.CSS_SELECTOR, "#nested-code").text',
            cypress: "cy.get('#nested-shadow-host').shadow().find('#inner-host').shadow().find('#nested-code').invoke('text')\n  .then((t) => cy.get('[data-testid=answer-nested-shadow]').type(t));",
          }}
          answer={{ prompt: 'Nested code:', expected: shadowCode }}
        >
          <div ref={nestedHostRef} id="nested-shadow-host" />
        </PracticeElement>
      </Section>
    </div>
  );
}
