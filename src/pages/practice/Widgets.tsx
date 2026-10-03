import React, { useRef, useState } from 'react';
import { Star } from 'lucide-react';
import { TaskQuestions } from '@/components/ui/TaskQuestions';
import { Button } from '@/components/ui/Button';
import { HintAccordion } from '@/components/ui/HintAccordion';
import { ChallengeResult, type ResultState } from '@/components/ui/ChallengeResult';

const OTP_CODE = '482915';
const OTP_LENGTH = 6;
const SECTION = 'bg-white p-6 rounded-2xl shadow-sm border border-border';
const H2 = 'text-xl font-bold mb-6 border-b border-border pb-2';

export default function Widgets() {
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [otpResult, setOtpResult] = useState<ResultState>('pending');
  const [otpMsg, setOtpMsg] = useState('Enter the code and press Verify');
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [tags, setTags] = useState<string[]>([]);
  const [tagText, setTagText] = useState('');
  const [rating, setRating] = useState(0);

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

  return (
    <div className="space-y-12 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Real-World Widgets</h1>
        <p className="text-slate-500">Practice automating custom components you meet in real products: OTP boxes, tag inputs and star ratings.</p>
        <HintAccordion hints={[
          "<strong>Selenium:</strong> Type digits with <code>sendKeys</code> on the first box and rely on auto-advance, or send keys to each box. Use <code>Keys.BACK_SPACE</code> to test going back.",
          "<strong>Playwright:</strong> <code>page.keyboard.type('482915')</code> after focusing <code>#otp-0</code>; use <code>getByRole('radio', { name: '4 stars' })</code> for the rating.",
          "<strong>Cypress:</strong> <code>cy.get('#otp-0').type('482915')</code> does not auto-advance focus in every version; type into each box or use <code>cy.focused()</code>. Press Enter with <code>{enter}</code> in the tag input.",
          "Chips and stars are re-rendered on every change, so re-query them instead of holding on to old element references."
        ]} />
      </div>

      <section className={SECTION}>
        <h2 className={H2}>1. OTP Verification</h2>
        <div className="mb-4 mt-2"><TaskQuestions groupId="otp" tasks={[
          {
            title: "Enter the one-time code",
            description: "Fill the six boxes with the code shown, then press Verify. Try pasting it as well.",
            positive: ["Typing 482915 fills the boxes and Verify shows 'Code verified'.", "Pasting text such as '48-29 15' fills all six boxes."],
            negative: ["Letters are rejected.", "A wrong code shows 'Wrong code'."]
          }
        ]} /></div>
        <p className="mb-4 text-slate-600">Your code is <strong id="otp-code">{OTP_CODE}</strong></p>
        <div className="flex gap-2 mb-4">
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
              className="w-12 h-12 text-center text-xl font-semibold border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          ))}
        </div>
        <div className="space-y-4">
          <Button id="verify-otp" onClick={verify}>Verify</Button>
          <ChallengeResult testId="result-otp" state={otpResult} message={otpMsg} />
        </div>
      </section>

      <section className={SECTION}>
        <h2 className={H2}>2. Tags Input</h2>
        <div className="mb-4 mt-2"><TaskQuestions groupId="tags" tasks={[
          {
            title: "Add and remove tags",
            description: "Type a tag and press Enter to add it. Remove a tag with its x button.",
            positive: ["Each new tag appears as a chip and the count updates.", "Removing a chip lowers the count."],
            negative: ["Empty values and duplicates (ignoring case) are not added."]
          }
        ]} /></div>
        <input
          id="tag-input"
          value={tagText}
          placeholder="Add a tag and press Enter"
          onChange={(e) => setTagText(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
          className="w-full max-w-md px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <div className="flex flex-wrap gap-2 mt-4">
          {tags.map((tag) => (
            <span key={tag} data-testid="tag" className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-sm">
              {tag}
              <button type="button" aria-label={`Remove ${tag}`} onClick={() => setTags(tags.filter((t) => t !== tag))} className="text-slate-500 hover:text-slate-900">×</button>
            </span>
          ))}
        </div>
        <p id="tag-count" className="mt-4 text-sm text-slate-600">{tags.length} {tags.length === 1 ? 'tag' : 'tags'}</p>
      </section>

      <section className={SECTION}>
        <h2 className={H2}>3. Star Rating</h2>
        <div className="mb-4 mt-2"><TaskQuestions groupId="rating" tasks={[
          {
            title: "Rate with stars",
            description: "Click a star to set the rating.",
            positive: ["Clicking the 4th star shows 4/5 and fills four stars."],
            negative: ["Nothing is rated until a star is clicked (0/5)."]
          }
        ]} /></div>
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
      </section>
    </div>
  );
}
