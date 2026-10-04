import React, { useState, useEffect } from 'react';
import { SolutionTabs } from '@/components/practice/SolutionTabs';
import { TaskQuestions } from '../../components/ui/TaskQuestions';
import { Button } from '@/components/ui/Button';
import { ChallengeResult, type ResultState } from '@/components/ui/ChallengeResult';
import { useProgressStore } from '@/store/useProgressStore';

export default function ProgressBarChallenge() {
  const [progress, setProgress] = useState(0);
  const [isStarting, setIsStarting] = useState(false);
  const [message, setMessage] = useState('');
  const [result, setResult] = useState<ResultState>('pending');
  const completeTask = useProgressStore((s) => s.completeTask);

  // Task 2 passes once the bar runs to 100% and the success message shows.
  useEffect(() => {
    if (progress === 100) completeTask('progress-bar', 'main:1');
  }, [progress, completeTask]);

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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Progress Bar Challenge</h1>
          <p className="text-slate-600 max-w-2xl">
            Test your automation script's ability to wait for a dynamic element to reach a specific state. 
            Progress bars are common in web apps and often require smart waits instead of hardcoded sleeps.
          </p>
        </div>
      </div>

      <TaskQuestions 
        tasks={[
          {
            title: "Wait for 75%",
            description: "Click 'Start' and write a script that waits exactly until the progress bar hits 75% or higher, then click 'Stop'.",
            positive: ["Script successfully stops the progress bar when it is >= 75%"],
            negative: ["Script uses hardcoded Thread.sleep() instead of explicit/fluent waits"]
          },
          {
            title: "Wait for 100% and Verify Message",
            description: "Click 'Start' and wait for the progress bar to reach 100%. Then verify the success message appears.",
            positive: ["Script waits for progress to be 100%", "Script asserts 'Process Completed Successfully!'"],
            negative: ["Script fails with TimeoutException", "Script asserts too early before message appears"]
          }
        ]} 
      />

      <div className="bg-white rounded-xl border border-border shadow-sm p-8">
        <h2 className="text-xl font-bold text-slate-900 mb-6">1. Interactive Progress Bar</h2>
        
        <div className="max-w-md mx-auto space-y-6">
          <div className="bg-slate-100 rounded-full h-6 w-full overflow-hidden relative shadow-inner">
            <div 
              className="bg-primary h-full transition-all duration-300 ease-out flex items-center justify-end px-2"
              style={{ width: `${progress}%` }}
              id="progress-bar-fill"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progress}
            >
              {progress > 5 && <span className="text-white text-xs font-bold">{progress}%</span>}
            </div>
          </div>
          
          <div className="flex gap-4 justify-center">
            <Button 
              id="start-button"
              onClick={handleStart} 
              disabled={isStarting && progress < 100}
            >
              Start
            </Button>
            <Button 
              id="stop-button"
              variant="outline" 
              onClick={handleStop}
              disabled={!isStarting}
            >
              Stop
            </Button>
          </div>

          <ChallengeResult
            task="main:0"
            state={result}
            message={
              result === 'success' ? `Stopped at ${progress}% — target reached`
              : result === 'failure' ? `Stopped at ${progress}% — too early, target is 75%`
              : 'Start the bar, then stop it at 75% or more'
            }
          />

          <div className="h-8 text-center">
            {message && (
              <p id="success-message" className="text-green-600 font-bold animate-in fade-in zoom-in">
                {message}
              </p>
            )}
          </div>
        </div>
      </div>

      <SolutionTabs challengeId="progress-bar" number={2} />
    </div>
  );
}
