import React, { useRef, useState } from 'react';
import { SolutionTabs } from '@/components/practice/SolutionTabs';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ChallengeResult, type ResultState } from '@/components/ui/ChallengeResult';
import { PracticeElement } from '@/components/practice/PracticeElement';
import { PracticeSection as Section } from '@/components/practice/PracticeSection';

const OTP_CODE = '482915';
const OTP_LENGTH = 6;
const WANTED_TAGS = ['cypress', 'selenium'];

export default function Widgets() {
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [otpResult, setOtpResult] = useState<ResultState>('pending');
  const [otpMsg, setOtpMsg] = useState('Enter the code and press Verify');
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [tags, setTags] = useState<string[]>([]);
  const [tagText, setTagText] = useState('');
  const [rating, setRating] = useState(0);
  const [removedTag, setRemovedTag] = useState(false);

  const setDigit = (i: number, value: string) =>
    setDigits((prev) => prev.map((d, idx) => (idx === i ? value : d)));

  const onOtpChange = (i: number, raw: string) => {
    if (raw === '') return setDigit(i, '');
    const ch = raw.slice(-1);
    if (!/^\d$/.test(ch)) return;
    setDigit(i, ch);
    otpRefs.current[i + 1]?.focus();
  };

  const onOtpKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && digits[i] === '' && i > 0) {
      e.preventDefault();
      setDigit(i - 1, '');
      otpRefs.current[i - 1]?.focus();
    }
  };

  const onOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text/plain').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pasted) return;
    setDigits(Array.from({ length: OTP_LENGTH }, (_, i) => pasted[i] ?? ''));
    otpRefs.current[pasted.length - 1]?.focus();
  };

  const verify = () => {
    if (digits.join('') === OTP_CODE) {
      setOtpResult('success');
      setOtpMsg('Code verified');
    } else {
      setOtpResult('failure');
      setOtpMsg('Wrong code');
    }
  };

  const addTag = () => {
    const value = tagText.trim();
    if (value && !tags.some((t) => t.toLowerCase() === value.toLowerCase())) setTags([...tags, value]);
    setTagText('');
  };

  const tagsDone = removedTag && [...tags].map((t) => t.toLowerCase()).sort().join() === WANTED_TAGS.join();

  return (
    <div className="space-y-10 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Real-World Widgets</h1>
        <p className="text-slate-500">Custom components you meet in real products: OTP boxes, tag inputs and star ratings. Each element shows its goal beside it, and its task ticks itself the moment your script gets it right.</p>
      </div>

      <Section n={1} title="OTP verification">
        <PracticeElement
          id="otp" label="One-time code boxes"
          goal="Fill the six boxes with the code shown and press Verify."
          pass={['Typing 482915 auto-advances through the boxes', 'Verify shows “Code verified”', 'Pasting “48-29 15” into the first box fills all six']}
          fail={['Letters are refused', 'A wrong code shows “Wrong code”']}
          hint="Each box holds one digit and moves focus to the next. Type into the first box with real key presses, or fill each box in turn."
          code={{
            playwright: "await page.locator('#otp-0').click();\nawait page.keyboard.type('482915');\nawait page.locator('#verify-otp').click();\nawait expect(page.getByTestId('result-otp')).toHaveAttribute('data-state', 'success');",
            seleniumJava: 'String code = driver.findElement(By.id("otp-code")).getText();\nfor (int i = 0; i < code.length(); i++)\n  driver.findElement(By.id("otp-" + i)).sendKeys(String.valueOf(code.charAt(i)));\ndriver.findElement(By.id("verify-otp")).click();',
            seleniumPython: 'code = driver.find_element(By.ID, "otp-code").text\nfor i, digit in enumerate(code):\n    driver.find_element(By.ID, f"otp-{i}").send_keys(digit)\ndriver.find_element(By.ID, "verify-otp").click()',
            cypress: "[...'482915'].forEach((d, i) => cy.get(`#otp-${i}`).type(d));\ncy.get('#verify-otp').click();\ncy.get('[data-testid=result-otp]').should('have.attr', 'data-state', 'success');",
          }}
          done={otpResult === 'success'}
        >
          <p className="mb-4 text-slate-600">Your code is <strong id="otp-code">{OTP_CODE}</strong></p>
          <div className="flex flex-wrap gap-2 mb-4">
            {digits.map((d, i) => (
              <input
                key={i}
                id={`otp-${i}`}
                ref={(el) => { otpRefs.current[i] = el; }}
                value={d}
                inputMode="numeric"
                maxLength={1}
                aria-label={`Digit ${i + 1}`}
                onChange={(e) => onOtpChange(i, e.target.value)}
                onKeyDown={(e) => onOtpKeyDown(i, e)}
                onPaste={onOtpPaste}
                className="w-11 h-12 sm:w-12 text-center text-xl font-semibold border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            ))}
          </div>
          <div className="space-y-4">
            <Button id="verify-otp" onClick={verify}>Verify</Button>
            <ChallengeResult testId="result-otp" state={otpResult} message={otpMsg} />
          </div>
        </PracticeElement>
      </Section>

      <Section n={2} title="Tags input">
        <PracticeElement
          id="tags" label="Tag chips"
          goal="Add the tags selenium, playwright and cypress, then remove playwright with its × button."
          pass={['Each tag appears as a chip and the count updates', 'Only selenium and cypress are left']}
          fail={['Empty values and duplicates (ignoring case) are not added', 'Holding an old chip reference after the list re-renders']}
          hint="Press Enter to add a tag. Each chip has a remove button whose accessible name is “Remove <tag>”."
          code={{
            playwright: "const input = page.locator('#tag-input');\nfor (const t of ['selenium', 'playwright', 'cypress']) { await input.fill(t); await input.press('Enter'); }\nawait page.getByRole('button', { name: 'Remove playwright' }).click();\nawait expect(page.locator('#tag-count')).toHaveText('2 tags');",
            seleniumJava: 'WebElement input = driver.findElement(By.id("tag-input"));\nfor (String t : List.of("selenium", "playwright", "cypress")) input.sendKeys(t, Keys.ENTER);\ndriver.findElement(By.cssSelector("[aria-label=\'Remove playwright\']")).click();\nassertEquals("2 tags", driver.findElement(By.id("tag-count")).getText());',
            seleniumPython: 'box = driver.find_element(By.ID, "tag-input")\nfor t in ["selenium", "playwright", "cypress"]:\n    box.send_keys(t, Keys.ENTER)\ndriver.find_element(By.CSS_SELECTOR, "[aria-label=\'Remove playwright\']").click()\nassert driver.find_element(By.ID, "tag-count").text == "2 tags"',
            cypress: "['selenium', 'playwright', 'cypress'].forEach((t) => cy.get('#tag-input').type(`${t}{enter}`));\ncy.get('[aria-label=\"Remove playwright\"]').click();\ncy.get('#tag-count').should('have.text', '2 tags');",
          }}
          done={tagsDone}
        >
          <input
            id="tag-input"
            value={tagText}
            placeholder="Add a tag and press Enter"
            aria-label="Add a tag"
            onChange={(e) => setTagText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
            className="w-full max-w-md px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <div className="flex flex-wrap gap-2 mt-4">
            {tags.map((tag) => (
              <span key={tag} data-testid="tag" className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-sm">
                {tag}
                <button type="button" aria-label={`Remove ${tag}`} onClick={() => { setTags(tags.filter((t) => t !== tag)); setRemovedTag(true); }} className="text-slate-500 hover:text-slate-900">×</button>
              </span>
            ))}
          </div>
          <p id="tag-count" className="mt-4 text-sm text-slate-600">{tags.length} {tags.length === 1 ? 'tag' : 'tags'}</p>
        </PracticeElement>
      </Section>

      <Section n={3} title="Star rating">
        <PracticeElement
          id="star-rating" label="Star rating"
          goal="Give a rating of 4 stars."
          pass={['The rating reads 4/5 and four stars are filled', 'The 4-star radio reports aria-checked="true"']}
          fail={['Clicking stars by index in a list that re-renders', 'Asserting on star colours instead of the value']}
          hint="The stars form a radio group. Each star is a radio named “N stars”, so you can find it by role and name."
          code={{
            playwright: "await page.getByRole('radio', { name: '4 stars' }).click();\nawait expect(page.locator('#rating-value')).toHaveText('4/5');",
            seleniumJava: 'driver.findElement(By.cssSelector("#star-rating [aria-label=\'4 stars\']")).click();\nassertEquals("4/5", driver.findElement(By.id("rating-value")).getText());',
            seleniumPython: 'driver.find_element(By.CSS_SELECTOR, "#star-rating [aria-label=\'4 stars\']").click()\nassert driver.find_element(By.ID, "rating-value").text == "4/5"',
            cypress: "cy.get('#star-rating [aria-label=\"4 stars\"]').click();\ncy.get('#rating-value').should('have.text', '4/5');",
          }}
          done={rating === 4}
        >
          <div id="star-rating" role="radiogroup" aria-label="Rating" className="flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={rating === n}
                aria-label={`${n} ${n === 1 ? 'star' : 'stars'}`}
                onClick={() => setRating(n)}
                className="p-1"
              >
                <Star className={`h-8 w-8 ${n <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
              </button>
            ))}
          </div>
          <p id="rating-value" className="mt-4 text-sm text-slate-600">{rating}/5</p>
        </PracticeElement>
      </Section>

      <SolutionTabs challengeId="widgets" number={4} />
    </div>
  );
}
