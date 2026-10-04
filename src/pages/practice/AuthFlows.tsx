import React, { useEffect, useRef, useState } from 'react';
import { Mail } from 'lucide-react';
import { SolutionTabs } from '@/components/practice/SolutionTabs';
import { Button } from '@/components/ui/Button';
import { ChallengeResult } from '@/components/ui/ChallengeResult';
import { PracticeElement } from '@/components/practice/PracticeElement';
import { PracticeSection as Section } from '@/components/practice/PracticeSection';
import {
  DEMO_USER, SESSION_KEY, SESSION_COOKIE, ELEVATED_MS, PROCESSING_MS, INBOX_DELAY_MS,
  checkCredentials, makeOtp, otpValid, encodeSession, decodeSession,
} from '@/utils/mockAuth';

const FIELD = 'w-full max-w-sm px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary';

type Phase = 'login' | 'otp' | 'in';

function readStoredSession() {
  try { return localStorage.getItem(SESSION_KEY); } catch { return null; }
}

function storeSession(token: string | null) {
  try {
    if (token) localStorage.setItem(SESSION_KEY, token);
    else localStorage.removeItem(SESSION_KEY);
  } catch { /* storage blocked */ }
  document.cookie = token
    ? `${SESSION_COOKIE}=${token}; path=/; max-age=3600; SameSite=Lax`
    : `${SESSION_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
}

export default function AuthFlows() {
  const [restoredOnLoad] = useState(() => {
    const session = decodeSession(readStoredSession(), Date.now());
    if (!session && readStoredSession() !== null) storeSession(null);
    return session !== null;
  });
  /** True while the current dashboard came from storage; a logout ends it, the result stays earned. */
  const [restored, setRestored] = useState(restoredOnLoad);
  const [phase, setPhase] = useState<Phase>(restored ? 'in' : 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [loginError, setLoginError] = useState(false);
  const [otp, setOtp] = useState<{ code: string; issuedAt: number } | null>(null);
  const [otpInput, setOtpInput] = useState('');
  const [otpError, setOtpError] = useState('');
  const [twoFactorDone, setTwoFactorDone] = useState(false);
  const inboxTimer = useRef(0);

  const [step, setStep] = useState(0); // 0 = wizard not started
  const [processing, setProcessing] = useState(false);
  const [elevatedUntil, setElevatedUntil] = useState(0);
  const [expiredOpen, setExpiredOpen] = useState(false);
  const [reauthPassword, setReauthPassword] = useState('');
  const [reauthError, setReauthError] = useState(false);
  const [reauthCount, setReauthCount] = useState(0);
  const [sessionDone, setSessionDone] = useState(false);

  useEffect(() => () => clearTimeout(inboxTimer.current), []);

  useEffect(() => {
    if (step !== 2) return;
    setProcessing(true);
    const t = setTimeout(() => setProcessing(false), PROCESSING_MS);
    return () => clearTimeout(t);
  }, [step]);

  const login = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkCredentials(email, password)) {
      setLoginError(true);
      return;
    }
    setLoginError(false);
    setPhase('otp');
    setOtp(null);
    setOtpInput('');
    setOtpError('');
    clearTimeout(inboxTimer.current);
    inboxTimer.current = window.setTimeout(() => setOtp({ code: makeOtp(), issuedAt: Date.now() }), INBOX_DELAY_MS);
  };

  const verify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otpInput.trim() !== otp.code) return setOtpError('Wrong code');
    if (!otpValid(otp.issuedAt, Date.now())) return setOtpError('Code expired, log in again for a new one');
    if (remember) storeSession(encodeSession(DEMO_USER.email, Date.now()));
    setTwoFactorDone(true);
    setPhase('in');
  };

  const logout = () => {
    storeSession(null);
    setRestored(false);
    setPhase('login');
    setStep(0);
    setPassword('');
  };

  /** Runs a wizard action, or asks for the password again if the elevated session ran out. */
  const guarded = (action: () => void) => {
    if (Date.now() > elevatedUntil) {
      setReauthPassword('');
      setReauthError(false);
      setExpiredOpen(true);
      return;
    }
    action();
  };

  const reauth = (e: React.FormEvent) => {
    e.preventDefault();
    if (reauthPassword !== DEMO_USER.password) return setReauthError(true);
    setElevatedUntil(Date.now() + ELEVATED_MS);
    setReauthCount((n) => n + 1);
    setExpiredOpen(false);
  };

  const startWizard = () => {
    setStep(1);
    setReauthCount(0);
    setElevatedUntil(Date.now() + ELEVATED_MS);
  };

  const finish = () => guarded(() => {
    setStep(0);
    if (reauthCount > 0) setSessionDone(true);
  });

  return (
    <div className="space-y-10 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Auth Flows</h1>
        <p className="text-slate-500">Real login flows: a one-time code from an inbox, a session that expires halfway through a wizard, and a remember-me session that survives a new browser. Test account: tester@qa.test / Passw0rd!. Each task ticks itself when its result box turns green.</p>
      </div>

      <Section n={1} title="Two-Step Login">
        <PracticeElement
          id="2fa" label="Two-step login"
          goal={`Log in as ${DEMO_USER.email} / ${DEMO_USER.password}. A code arrives in the inbox after a moment; enter it to finish.`}
          pass={["The right code within 60 seconds logs you in and the result turns green."]}
          fail={["A wrong password shows an error.","A wrong or expired code shows an error."]}
          hint={"Wait until #inbox-code holds six digits, read it, then type it. It changes on every login."}
          code={{
            playwright: "await page.locator('#auth-email').fill('tester@qa.test');\nawait page.locator('#auth-password').fill('Passw0rd!');\nawait page.locator('#auth-login').click();\nconst code = page.locator('#inbox-code');\nawait expect(code).toHaveText(/^\\d{6}$/, { timeout: 5000 }); // the code arrives late\nawait page.locator('#auth-otp').fill(await code.innerText());\nawait page.locator('#auth-verify').click();\nawait expect(page.locator('#auth-dashboard')).toBeVisible();",
            seleniumJava: "driver.findElement(By.id(\"auth-email\")).sendKeys(\"tester@qa.test\");\ndriver.findElement(By.id(\"auth-password\")).sendKeys(\"Passw0rd!\");\ndriver.findElement(By.id(\"auth-login\")).click();\nString code = new WebDriverWait(driver, Duration.ofSeconds(5))\n  .until(d -> { String t = d.findElement(By.id(\"inbox-code\")).getText(); return t.matches(\"\\\\d{6}\") ? t : null; });\ndriver.findElement(By.id(\"auth-otp\")).sendKeys(code);\ndriver.findElement(By.id(\"auth-verify\")).click();",
            seleniumPython: "driver.find_element(By.ID, \"auth-email\").send_keys(\"tester@qa.test\")\ndriver.find_element(By.ID, \"auth-password\").send_keys(\"Passw0rd!\")\ndriver.find_element(By.ID, \"auth-login\").click()\ncode = WebDriverWait(driver, 5).until(\n    lambda d: (t := d.find_element(By.ID, \"inbox-code\").text).isdigit() and len(t) == 6 and t)\ndriver.find_element(By.ID, \"auth-otp\").send_keys(code)\ndriver.find_element(By.ID, \"auth-verify\").click()",
            cypress: "cy.get('#auth-email').type('tester@qa.test');\ncy.get('#auth-password').type('Passw0rd!');\ncy.get('#auth-login').click();\ncy.get('#inbox-code', { timeout: 5000 }).should('match', /^\\d{6}$/).invoke('text')\n  .then((code) => cy.get('#auth-otp').type(code));\ncy.get('#auth-verify').click();\ncy.get('#auth-dashboard').should('be.visible');",
          }}
          done={twoFactorDone}
        >
          <p className="mb-4 text-sm text-slate-600">Demo account: <code>{DEMO_USER.email}</code> / <code>{DEMO_USER.password}</code></p>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              {phase === 'login' && (
                <form onSubmit={login} className="space-y-3">
                  <input id="auth-email" data-testid="auth-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" aria-label="Email" className={FIELD} />
                  <input id="auth-password" data-testid="auth-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" aria-label="Password" className={FIELD} />
                  <label className="flex items-center gap-2 text-sm text-slate-700">
                    <input id="remember-me" data-testid="remember-me" type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                    Remember me
                  </label>
                  {loginError && <p id="login-error" data-testid="login-error" role="alert" className="text-sm text-red-600">Wrong email or password</p>}
                  <Button id="auth-login" data-testid="auth-login" type="submit">Log in</Button>
                </form>
              )}
              {phase === 'otp' && (
                <form onSubmit={verify} className="space-y-3">
                  <p className="text-sm text-slate-600">Enter the 6-digit code we sent to your inbox.</p>
                  <input id="auth-otp" data-testid="auth-otp" inputMode="numeric" value={otpInput} onChange={(e) => setOtpInput(e.target.value)} placeholder="Code" aria-label="Code" className={FIELD} />
                  {otpError && <p id="otp-error" data-testid="otp-error" role="alert" className="text-sm text-red-600">{otpError}</p>}
                  <Button id="auth-verify" data-testid="auth-verify" type="submit">Verify</Button>
                </form>
              )}
              {phase === 'in' && (
                <div id="auth-dashboard" data-testid="auth-dashboard" className="space-y-3">
                  <p className="font-semibold text-slate-900">Welcome, tester</p>
                  {restored && <p id="session-restored" data-testid="session-restored" className="text-sm text-green-700">Restored your session from storage.</p>}
                  <Button id="auth-logout" data-testid="auth-logout" variant="outline" onClick={logout}>Log out</Button>
                </div>
              )}
            </div>
            <div id="inbox" data-testid="inbox" className="rounded-xl border border-border bg-slate-50 p-4">
              <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700"><Mail className="h-4 w-4" aria-hidden="true" /> Inbox</h3>
              {phase === 'otp' && otp ? (
                <div className="rounded-lg bg-white p-3 text-sm shadow-sm">
                  <p className="font-medium">Your login code</p>
                  <p>Use <strong id="inbox-code" data-testid="inbox-code">{otp.code}</strong> to finish logging in. It expires in 60 seconds.</p>
                </div>
              ) : (
                <p className="text-sm text-slate-500">No new mail</p>
              )}
            </div>
          </div>
          <div className="mt-4"><ChallengeResult testId="result-2fa" state={twoFactorDone ? 'success' : 'pending'} message={twoFactorDone ? 'Logged in with the code' : 'Log in with email, password and code'} /></div>
        </PracticeElement>
      </Section>

      <Section n={2} title="Session Expires Mid-Task">
        <PracticeElement
          id="session" label="Session expires mid-task"
          goal={"Start the wizard and finish all three steps. Your session lasts 8 seconds and step 2 takes longer than that, so you will be asked for your password again."}
          pass={["After entering the password, the wizard continues on the same step.","Finishing after logging in again turns the result green."]}
          fail={["A wrong password keeps the dialog open."]}
          hint={"Step 2 keeps Next disabled for about 9 seconds. After each click, check whether the 'Session expired' dialog opened and enter the password if it did."}
          code={{
            playwright: "// after logging in\nawait page.locator('#start-wizard').click();\nawait page.locator('#wizard-next').click();\nawait expect(page.locator('#wizard-next')).toBeEnabled({ timeout: 12000 });\nawait page.locator('#wizard-next').click();\nawait expect(page.locator('#session-expired-modal')).toBeVisible();\nawait page.locator('#reauth-password').fill('Passw0rd!');\nawait page.locator('#reauth-submit').click();\nawait expect(page.locator('#wizard-step')).toHaveText('Step 2 of 3'); // progress kept\nawait page.locator('#wizard-next').click();\nawait page.locator('#wizard-finish').click();",
            seleniumJava: "driver.findElement(By.id(\"start-wizard\")).click();\ndriver.findElement(By.id(\"wizard-next\")).click();\nnew WebDriverWait(driver, Duration.ofSeconds(12)).until(ExpectedConditions.elementToBeClickable(By.id(\"wizard-next\"))).click();\nwait.until(ExpectedConditions.visibilityOfElementLocated(By.id(\"session-expired-modal\")));\ndriver.findElement(By.id(\"reauth-password\")).sendKeys(\"Passw0rd!\");\ndriver.findElement(By.id(\"reauth-submit\")).click();\nwait.until(ExpectedConditions.textToBe(By.id(\"wizard-step\"), \"Step 2 of 3\"));\ndriver.findElement(By.id(\"wizard-next\")).click();\ndriver.findElement(By.id(\"wizard-finish\")).click();",
            seleniumPython: "driver.find_element(By.ID, \"start-wizard\").click()\ndriver.find_element(By.ID, \"wizard-next\").click()\nWebDriverWait(driver, 12).until(EC.element_to_be_clickable((By.ID, \"wizard-next\"))).click()\nwait.until(EC.visibility_of_element_located((By.ID, \"session-expired-modal\")))\ndriver.find_element(By.ID, \"reauth-password\").send_keys(\"Passw0rd!\")\ndriver.find_element(By.ID, \"reauth-submit\").click()\nwait.until(EC.text_to_be_present_in_element((By.ID, \"wizard-step\"), \"Step 2 of 3\"))\ndriver.find_element(By.ID, \"wizard-next\").click()\ndriver.find_element(By.ID, \"wizard-finish\").click()",
            cypress: "cy.get('#start-wizard').click();\ncy.get('#wizard-next').click();\ncy.get('#wizard-next', { timeout: 12000 }).should('be.enabled').click();\ncy.get('#session-expired-modal').should('be.visible');\ncy.get('#reauth-password').type('Passw0rd!');\ncy.get('#reauth-submit').click();\ncy.get('#wizard-step').should('have.text', 'Step 2 of 3');\ncy.get('#wizard-next').click();\ncy.get('#wizard-finish').click();",
          }}
          done={sessionDone}
        >
          {phase !== 'in' ? (
            <p className="text-sm text-slate-500">Log in first (section 1) to start the wizard.</p>
          ) : step === 0 ? (
            <Button id="start-wizard" data-testid="start-wizard" onClick={startWizard}>Start wizard</Button>
          ) : (
            <div className="space-y-3">
              <p id="wizard-step" data-testid="wizard-step" className="font-semibold">Step {step} of 3</p>
              {step === 2 && processing && <p id="wizard-processing" data-testid="wizard-processing" className="text-sm text-slate-500">Processing…</p>}
              {step < 3 ? (
                <Button id="wizard-next" data-testid="wizard-next" disabled={step === 2 && processing} onClick={() => guarded(() => setStep((s) => s + 1))}>Next</Button>
              ) : (
                <Button id="wizard-finish" data-testid="wizard-finish" onClick={finish}>Finish</Button>
              )}
            </div>
          )}
          <div className="mt-4"><ChallengeResult testId="result-session" state={sessionDone ? 'success' : 'pending'} message={sessionDone ? 'Wizard finished after logging in again' : 'Finish the wizard'} /></div>
        </PracticeElement>
      </Section>

      <Section n={3} title="Remember Me">
        <PracticeElement
          id="remember" label="Remember me"
          goal={"Log in with 'Remember me' ticked. Then open this page in a fresh browser context that starts with the saved storage. You should be logged in without the form."}
          pass={["A fresh context with the saved storage shows 'Restored your session from storage.'"]}
          fail={["Without 'Remember me', a reload shows the login form again.","A corrupt stored session is ignored."]}
          hint={"Log in once with Remember me ticked, save the cookies and localStorage, and load the page in a new browser context that starts with them."}
          code={{
            playwright: "// log in with #remember-me checked, then save and reuse the browser state\nconst state = await page.context().storageState();\nconst ctx = await browser.newContext({ storageState: state });\nconst fresh = await ctx.newPage();\nawait fresh.goto('/practice/auth-flows');\nawait expect(fresh.locator('#session-restored')).toBeVisible();",
            seleniumJava: "// log in with #remember-me checked, copy the stored session, then load it in a new browser\nString saved = (String) ((JavascriptExecutor) driver).executeScript(\"return localStorage.getItem('qa-auth-session')\");\nWebDriver fresh = new ChromeDriver();\nfresh.get(URL);\n((JavascriptExecutor) fresh).executeScript(\"localStorage.setItem('qa-auth-session', arguments[0])\", saved);\nfresh.navigate().refresh();\nnew WebDriverWait(fresh, Duration.ofSeconds(5)).until(ExpectedConditions.visibilityOfElementLocated(By.id(\"session-restored\")));",
            seleniumPython: "saved = driver.execute_script(\"return localStorage.getItem('qa-auth-session')\")\nfresh = webdriver.Chrome()\nfresh.get(URL)\nfresh.execute_script(\"localStorage.setItem('qa-auth-session', arguments[0])\", saved)\nfresh.refresh()\nWebDriverWait(fresh, 5).until(EC.visibility_of_element_located((By.ID, \"session-restored\")))",
            cypress: "// cy.session caches the logged-in state and restores it in later tests\ncy.session('tester', () => {\n  cy.visit('/practice/auth-flows');\n  cy.get('#remember-me').check();\n  // ...log in with the code as in task 1\n});\ncy.visit('/practice/auth-flows');\ncy.get('#session-restored').should('be.visible');",
          }}
          done={restoredOnLoad}
        >
          <ChallengeResult testId="result-remember" state={restoredOnLoad ? 'success' : 'pending'} message={restoredOnLoad ? 'Session restored from storage' : 'Load this page with a saved session'} />
        </PracticeElement>
      </Section>

      {expiredOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <form id="session-expired-modal" data-testid="session-expired-modal" role="dialog" aria-modal="true" aria-labelledby="session-expired-title" onSubmit={reauth} className="w-full max-w-sm space-y-3 rounded-2xl bg-white p-6 shadow-xl">
            <h3 id="session-expired-title" className="text-lg font-bold">Session expired</h3>
            <p className="text-sm text-slate-600">Enter your password to continue where you left off.</p>
            <input id="reauth-password" data-testid="reauth-password" type="password" autoFocus value={reauthPassword} onChange={(e) => setReauthPassword(e.target.value)} aria-label="Password" className={FIELD} />
            {reauthError && <p id="reauth-error" data-testid="reauth-error" role="alert" className="text-sm text-red-600">Wrong password</p>}
            <Button id="reauth-submit" data-testid="reauth-submit" type="submit">Continue</Button>
          </form>
        </div>
      )}

      <SolutionTabs challengeId="auth-flows" number={4} />
    </div>
  );
}
