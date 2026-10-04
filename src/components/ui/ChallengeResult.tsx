import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { CheckCircle2, XCircle, Circle } from 'lucide-react';
import { useProgressStore } from '@/store/useProgressStore';

export type ResultState = 'pending' | 'success' | 'failure';

const styles: Record<ResultState, string> = {
  pending: 'bg-slate-50 text-slate-500 border-slate-200',
  success: 'bg-green-50 text-green-700 border-green-200',
  failure: 'bg-red-50 text-red-700 border-red-200',
};

const icons = { pending: Circle, success: CheckCircle2, failure: XCircle };

/**
 * Pass/fail box for a challenge. Turning green ticks the matching task in the progress tracker:
 * `task` names it ("group:index"); by default `result-<group>` ticks the first task of <group>.
 */
export function ChallengeResult({ state, message, testId = 'challenge-result', task }: { state: ResultState; message: string; testId?: string; task?: string }) {
  const Icon = icons[state];
  const pageId = useLocation().pathname.split('/').pop() || '';
  const completeTask = useProgressStore((s) => s.completeTask);
  const key = task ?? (testId.startsWith('result-') ? `${testId.slice('result-'.length)}:0` : undefined);

  useEffect(() => {
    if (state === 'success' && key && pageId) completeTask(pageId, key);
  }, [state, key, pageId, completeTask]);

  return (
    <div
      data-testid={testId}
      role="status"
      aria-live="polite"
      data-state={state}
      className={`flex items-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium ${styles[state]}`}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {message}
    </div>
  );
}
