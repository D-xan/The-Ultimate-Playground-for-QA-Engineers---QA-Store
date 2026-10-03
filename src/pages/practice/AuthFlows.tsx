import React, { useEffect, useRef, useState } from 'react';
import { Mail } from 'lucide-react';
import { SolutionTabs } from '@/components/practice/SolutionTabs';
import { TaskQuestions } from '@/components/ui/TaskQuestions';
import { Button } from '@/components/ui/Button';
import { HintAccordion } from '@/components/ui/HintAccordion';
import { ChallengeResult } from '@/components/ui/ChallengeResult';
import {
  DEMO_USER, SESSION_KEY, SESSION_COOKIE, ELEVATED_MS, PROCESSING_MS, INBOX_DELAY_MS,
  checkCredentials, makeOtp, otpValid, encodeSession, decodeSession,
} from '@/utils/mockAuth';

const SECTION = 'bg-white p-6 rounded-2xl shadow-sm border border-border';
const H2 = 'text-xl font-bold mb-6 border-b border-border pb-2';
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
  const [restored] = useState(() => {
    const session = decodeSession(readStoredSession(), Date.now());
    if (!session && readStoredSession() !== null) storeSession(null);
    return session !== null;
  });
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
    <div className="space-y-12 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Auth Flows</h1>
        <p className="text-slate-500">Practice the login flows that make end-to-end tests hard: a second step with a code from your inbox, a session that runs out in the middle of a task, and staying logged in between tests.</p>
        <HintAccordion hints={[
          "Wait for the code to arrive in the inbox before reading it. Never hardcode it: it is new every time.",
          "The wizard's session always runs out during step 2. Write a helper that checks for the 'Session expired' dialog after each action, logs in again and carries on.",
          "<strong>Playwright:</strong> log in once, save <code>context.storageState()</code> and start later tests with <code>browser.newContext({ storageState })</code>. <strong>Cypress:</strong> wrap the login in <code>cy.session()</code>.",
          "<strong>Selenium:</strong> there is no storage-state API. Copy the <code>qa-auth-session</code> localStorage value (and the <code>qa_session</code> cookie) with <code>executeScript</code> and restore them before loading the page."
        ]} />
      </div>

      <section className={SECTION}>
        <h2 className={H2}>1. Two-Step Login</h2>
        <div className="mb-4 mt-2"><TaskQuestions groupId="2fa" tasks={[
          {
            title: "Log in with a one-time code",
            description: `Log in as ${DEMO_USER.email} / ${DEMO_USER.password}. A code arrives in the inbox after a moment; enter it to finish.`,
            positive: ["The right code within 60 seconds logs you in and the result turns green."],
            negative: ["A wrong password shows an error.", "A wrong or expired code shows an error."],
            hint: "Wait until #inbox-code holds six digits, read it, then type it. It changes on every login."
          }
        ]} /></div>
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
      </section>

      <section className={SECTION}>
        <h2 className={H2}>2. Session Expires Mid-Task</h2>
        <div className="mb-4 mt-2"><TaskQuestions groupId="session" tasks={[
          {
            title: "Finish the wizard",
            description: "Start the wizard and finish all three steps. Your session lasts 8 seconds and step 2 takes longer than that, so you will be asked for your password again.",
            positive: ["After entering the password, the wizard continues on the same step.", "Finishing after logging in again turns the result green."],
            negative: ["A wrong password keeps the dialog open."],
            hint: "Step 2 keeps Next disabled for about 9 seconds. After each click, check whether the 'Session expired' dialog opened and enter the password if it did."
          }
        ]} /></div>
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
      </section>

      <section className={SECTION}>
        <h2 className={H2}>3. Remember Me</h2>
        <div className="mb-4 mt-2"><TaskQuestions groupId="remember" tasks={[
          {
            title: "Reuse a saved session",
            description: "Log in with 'Remember me' ticked. Then open this page in a fresh browser context that starts with the saved storage. You should be logged in without the form.",
            positive: ["A fresh context with the saved storage shows 'Restored your session from storage.'"],
            negative: ["Without 'Remember me', a reload shows the login form again.", "A corrupt stored session is ignored."],
            hint: "Log in once with Remember me ticked, save the cookies and localStorage, and load the page in a new browser context that starts with them."
          }
        ]} /></div>
        <ChallengeResult testId="result-remember" state={restored ? 'success' : 'pending'} message={restored ? 'Session restored from storage' : 'Load this page with a saved session'} />
      </section>

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
