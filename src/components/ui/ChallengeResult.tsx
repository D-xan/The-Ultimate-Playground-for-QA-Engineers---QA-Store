import { CheckCircle2, XCircle, Circle } from 'lucide-react';

export type ResultState = 'pending' | 'success' | 'failure';

const styles: Record<ResultState, string> = {
  pending: 'bg-slate-50 text-slate-500 border-slate-200',
  success: 'bg-green-50 text-green-700 border-green-200',
  failure: 'bg-red-50 text-red-700 border-red-200',
};

const icons = { pending: Circle, success: CheckCircle2, failure: XCircle };

export function ChallengeResult({ state, message }: { state: ResultState; message: string }) {
  const Icon = icons[state];
  return (
    <div
      data-testid="challenge-result"
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
