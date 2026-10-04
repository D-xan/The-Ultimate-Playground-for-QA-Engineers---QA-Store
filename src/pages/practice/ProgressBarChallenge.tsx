import { useState, useEffect } from 'react';
import { SolutionTabs } from '@/components/practice/SolutionTabs';
import { Button } from '@/components/ui/Button';
import { ChallengeResult, type ResultState } from '@/components/ui/ChallengeResult';
import { PracticeElement } from '@/components/practice/PracticeElement';
import { PracticeSection as Section } from '@/components/practice/PracticeSection';

export default function ProgressBarChallenge() {
  const [progress, setProgress] = useState(0);
  const [isStarting, setIsStarting] = useState(false);
  const [message, setMessage] = useState('');
  const [result, setResult] = useState<ResultState>('pending');
  const [reached100, setReached100] = useState(false);

  useEffect(() => { if (progress === 100) setReached100(true); }, [progress]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isStarting && progress < 100) {
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsStarting(false);
            setMessage('Process Completed Successfully!');
            return 100;
          }
          // random increment to make it realistic
          return Math.min(prev + Math.floor(Math.random() * 10) + 5, 100);
        });
      }, 500);
    } else if (progress === 100) {
      setIsStarting(false);
      setMessage('Process Completed Successfully!');
    }
    return () => clearInterval(interval);
  }, [isStarting, progress]);

  const handleStart = () => {
    setProgress(0);
    setMessage('');
    setResult('pending');
    setIsStarting(true);
  };

  const handleStop = () => {
    setIsStarting(false);
    setResult(progress >= 75 ? 'success' : 'failure');
  };

  return (
    <div className="space-y-10 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Progress Bar Challenge</h1>
        <p className="text-slate-500 max-w-3xl">
          Wait for a moving element to reach a state. The bar grows by a random step every half second, so a fixed sleep stops it at a different place each run. Each task ticks itself the moment your script gets it right.
        </p>
      </div>

      <Section n={1} title="Interactive progress bar">
        <PracticeElement
          id="progress-75" label="Stop at 75% or more"
          goal="Click Start, wait until the bar reaches at least 75%, then click Stop."
          pass={['The result box turns green: “Stopped at N% — target reached”', 'The wait reads the bar’s aria-valuenow, not its width']}
          fail={['A fixed sleep: the bar’s speed is random', 'Stopping below 75% turns the result red']}
          hint="Poll the aria-valuenow attribute with a short interval and click Stop as soon as it is 75 or more."
          code={{
            playwright: "await page.locator('#start-button').click();\nawait expect.poll(async () =>\n  Number(await page.locator('#progress-bar-fill').getAttribute('aria-valuenow')),\n  { timeout: 15000, intervals: [100] }).toBeGreaterThanOrEqual(75);\nawait page.locator('#stop-button').click();",
            seleniumJava: 'driver.findElement(By.id("start-button")).click();\nnew WebDriverWait(driver, Duration.ofSeconds(15)).pollingEvery(Duration.ofMillis(100))\n  .until(d -> Integer.parseInt(d.findElement(By.id("progress-bar-fill")).getDomAttribute("aria-valuenow")) >= 75);\ndriver.findElement(By.id("stop-button")).click();',
            seleniumPython: 'driver.find_element(By.ID, "start-button").click()\nWebDriverWait(driver, 15, poll_frequency=0.1).until(\n    lambda d: int(d.find_element(By.ID, "progress-bar-fill").get_attribute("aria-valuenow")) >= 75)\ndriver.find_element(By.ID, "stop-button").click()',
            cypress: "cy.get('#start-button').click();\ncy.get('#progress-bar-fill', { timeout: 15000 })\n  .should(($el) => expect(Number($el.attr('aria-valuenow'))).to.be.at.least(75));\ncy.get('#stop-button').click();",
          }}
          done={result === 'success'}
        >
          <div className="space-y-6">
            <div className="bg-slate-100 rounded-full h-6 w-full overflow-hidden relative shadow-inner">
              <div
                className="bg-primary h-full transition-all duration-300 ease-out flex items-center justify-end px-2"
                style={{ width: `${progress}%` }}
                id="progress-bar-fill"
                role="progressbar"
                aria-label="Process progress"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={progress}
              >
                {progress > 5 && <span className="text-slate-900 text-xs font-bold">{progress}%</span>}
              </div>
            </div>
            <div className="flex gap-4 justify-center">
              <Button id="start-button" onClick={handleStart} disabled={isStarting && progress < 100}>Start</Button>
              <Button id="stop-button" variant="outline" onClick={handleStop} disabled={!isStarting}>Stop</Button>
            </div>
            <ChallengeResult
              state={result}
              message={
                result === 'success' ? `Stopped at ${progress}% — target reached`
                : result === 'failure' ? `Stopped at ${progress}% — too early, target is 75%`
                : 'Start the bar, then stop it at 75% or more'
              }
            />
            <div className="h-8 text-center">
              {message && <p id="success-message" className="text-green-600 font-bold animate-in fade-in zoom-in">{message}</p>}
            </div>
          </div>
        </PracticeElement>

        <PracticeElement
          id="progress-100" label="Wait for 100% and the message"
          goal="Click Start, let the bar run to 100%, and assert “Process Completed Successfully!”."
          pass={['The script waits for the message, not a set time', 'The message text matches exactly']}
          fail={['Asserting the message straight after Start', 'A timeout shorter than the run: it can take up to 10 seconds']}
          hint="Wait for the success message to be visible with a generous timeout. Use the bar above."
          code={{
            playwright: "await page.locator('#start-button').click();\nawait expect(page.locator('#success-message')).toHaveText('Process Completed Successfully!', { timeout: 15000 });",
            seleniumJava: 'driver.findElement(By.id("start-button")).click();\nnew WebDriverWait(driver, Duration.ofSeconds(15)).until(\n  ExpectedConditions.textToBe(By.id("success-message"), "Process Completed Successfully!"));',
            seleniumPython: 'driver.find_element(By.ID, "start-button").click()\nWebDriverWait(driver, 15).until(\n    EC.text_to_be_present_in_element((By.ID, "success-message"), "Process Completed Successfully!"))',
            cypress: "cy.get('#start-button').click();\ncy.get('#success-message', { timeout: 15000 }).should('have.text', 'Process Completed Successfully!');",
          }}
          done={reached100}
        >
          <p className="text-sm text-slate-600">Use the progress bar above.</p>
        </PracticeElement>
      </Section>

      <SolutionTabs challengeId="progress-bar" number={2} />
    </div>
  );
}
