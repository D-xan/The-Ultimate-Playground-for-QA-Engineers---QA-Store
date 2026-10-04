import React, { useState } from 'react';
import { ClipboardList, Info, CheckCircle2, XCircle, CheckSquare, Square, Lightbulb } from 'lucide-react';
import { useProgressStore } from '../../store/useProgressStore';
import { taskKey } from '../../store/progressLogic';
import { useLocation } from 'react-router-dom';

export interface TaskDetail {
  title: string;
  description: string;
  positive: string[];
  negative: string[];
  /** A nudge shown only when the learner asks for it. */
  hint?: string;
}

interface TaskQuestionsProps {
  tasks: TaskDetail[];
  /** Distinguishes several task lists on one page. */
  groupId?: string;
}

export const TaskQuestions: React.FC<TaskQuestionsProps> = ({ tasks, groupId = 'main' }) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [hintsShown, setHintsShown] = useState<number[]>([]);
  
  const location = useLocation();
  const challengeId = location.pathname.split('/').pop() || '';
  const { completed, toggleTask, registerGroup } = useProgressStore();

  React.useEffect(() => {
    if (challengeId) {
      registerGroup(challengeId, groupId, tasks.length);
    }
  }, [challengeId, groupId, tasks.length, registerGroup]);

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 mb-8 mt-6 shadow-sm">
      <h3 className="font-bold text-primary flex items-center gap-2 mb-1">
        <ClipboardList className="w-5 h-5" />
        Challenge Tasks ({tasks.length})
      </h3>
      <p className="text-xs text-slate-500 mb-4">Tick a task when your script passes it. Tasks with a pass/fail box tick themselves.</p>
      <ul className="space-y-3">
        {tasks.map((task, index) => {
          const key = taskKey(groupId, index);
          const isCompleted = (completed[challengeId] ?? []).includes(key);
          
          return (
          <li key={index} className="flex flex-col border border-border rounded-lg shadow-sm overflow-hidden bg-card text-card-foreground">
            <div className="w-full flex items-center p-2 hover:bg-muted/10 transition-colors">
              <button 
                onClick={() => toggleTask(challengeId, key)}
                data-testid={`task-toggle-${groupId}-${index}`}
                className="p-2 text-slate-400 hover:text-primary transition-colors focus:outline-none"
                title="Mark task as complete"
              >
                {isCompleted ? <CheckSquare className="w-5 h-5 text-green-500" /> : <Square className="w-5 h-5" />}
              </button>
              <button 
                onClick={() => toggleExpand(index)}
                data-testid={`task-expand-${groupId}-${index}`}
                aria-expanded={expandedIndex === index}
                className="flex-1 flex items-center justify-between p-2 text-left cursor-pointer outline-none"
              >
                <div className="flex items-center gap-3">
                  <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${isCompleted ? 'bg-green-100 text-green-600' : 'bg-primary/10 text-primary'}`}>
                    {index + 1}
                  </span>
                  <span className={`font-medium ${isCompleted ? 'text-slate-500 line-through' : ''}`}>{task.title}</span>
                </div>
                <svg 
                  className={`w-5 h-5 opacity-50 transition-transform duration-200 ${expandedIndex === index ? 'rotate-180' : ''}`} 
                  fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
            
            {expandedIndex === index && (
              <div className="p-4 border-t border-border text-sm animate-in slide-in-from-top-2 fade-in duration-200 bg-muted/30">
                <div className="mb-4">
                  <h4 className="font-semibold mb-1">What to do:</h4>
                  <p className="opacity-80 leading-relaxed">{task.description}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-green-500/10 p-3 rounded-md border border-green-500/20">
                    <h4 className="font-semibold text-green-600 dark:text-green-400 flex items-center gap-1.5 mb-2">
                      <CheckCircle2 className="w-4 h-4" /> Positive Test Cases
                    </h4>
                    <ul className="list-disc list-inside text-green-700 dark:text-green-400 space-y-1 text-xs">
                      {task.positive.map((tc, i) => <li key={i}>{tc}</li>)}
                    </ul>
                  </div>
                  
                  <div className="bg-red-500/10 p-3 rounded-md border border-red-500/20">
                    <h4 className="font-semibold text-red-600 dark:text-red-400 flex items-center gap-1.5 mb-2">
                      <XCircle className="w-4 h-4" /> Negative Test Cases
                    </h4>
                    <ul className="list-disc list-inside text-red-700 dark:text-red-400 space-y-1 text-xs">
                      {task.negative.map((tc, i) => <li key={i}>{tc}</li>)}
                    </ul>
                  </div>
                </div>

                {task.hint && (
                  hintsShown.includes(index) ? (
                    <p data-testid={`task-hint-${groupId}-${index}`} className="mt-4 flex gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                      <Lightbulb className="h-4 w-4 shrink-0 text-amber-500" aria-hidden="true" />
                      <span>{task.hint}</span>
                    </p>
                  ) : (
                    <button
                      type="button"
                      data-testid={`show-hint-${groupId}-${index}`}
                      onClick={() => setHintsShown((h) => [...h, index])}
                      className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 hover:text-amber-900"
                    >
                      <Lightbulb className="h-4 w-4" aria-hidden="true" /> Show hint
                    </button>
                  )
                )}
              </div>
            )}
          </li>
          );
        })}
      </ul>
    </div>
  );
};
