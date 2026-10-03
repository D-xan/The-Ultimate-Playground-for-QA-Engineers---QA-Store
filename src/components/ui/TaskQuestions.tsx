import React, { useState } from 'react';
import { ClipboardList, Info, CheckCircle2, XCircle, CheckSquare, Square } from 'lucide-react';
import { useProgressStore } from '../../store/useProgressStore';
import { useLocation } from 'react-router-dom';

export interface TaskDetail {
  title: string;
  description: string;
  positive: string[];
  negative: string[];
}

interface TaskQuestionsProps {
  tasks: TaskDetail[];
}

export const TaskQuestions: React.FC<TaskQuestionsProps> = ({ tasks }) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  
  const location = useLocation();
  const challengeId = location.pathname.split('/').pop() || '';
  const { isTaskCompleted, toggleTask, setTotalTasks } = useProgressStore();

  React.useEffect(() => {
    if (challengeId) {
      setTotalTasks(challengeId, tasks.length);
    }
  }, [challengeId, tasks.length, setTotalTasks]);

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 mb-8 mt-6 shadow-sm">
      <h3 className="font-bold text-primary flex items-center gap-2 mb-4">
        <ClipboardList className="w-5 h-5" />
        Challenge Tasks ({tasks.length})
      </h3>
      <ul className="space-y-3">
        {tasks.map((task, index) => {
          const isCompleted = isTaskCompleted(challengeId, index);
          
          return (
          <li key={index} className="flex flex-col border border-border rounded-lg shadow-sm overflow-hidden bg-card text-card-foreground">
            <div className="w-full flex items-center p-2 hover:bg-muted/10 transition-colors">
              <button 
                onClick={() => toggleTask(challengeId, index)}
                className="p-2 text-slate-400 hover:text-primary transition-colors focus:outline-none"
                title="Mark task as complete"
              >
                {isCompleted ? <CheckSquare className="w-5 h-5 text-green-500" /> : <Square className="w-5 h-5" />}
              </button>
              <button 
                onClick={() => toggleExpand(index)}
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
              </div>
            )}
          </li>
          );
        })}
      </ul>
    </div>
  );
};
