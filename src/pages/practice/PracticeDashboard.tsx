import React from 'react';
import { Link } from 'react-router-dom';
import { useProgressStore } from '../../store/useProgressStore';
import { AppWindow, Activity, Network, CheckCircle2, ArrowRight } from 'lucide-react';
import { challenges, challengePath } from '@/data/challenges';
import { Button } from '@/components/ui/Button';


export default function PracticeDashboard() {
  const { completedTasks, totalTasks } = useProgressStore();
  
  let fullyCompletedCount = 0;
  challenges.forEach(c => {
    if (totalTasks[c.id] && completedTasks[c.id]?.length === totalTasks[c.id]) {
      fullyCompletedCount++;
    }
  });

  const progressPercentage = Math.round((fullyCompletedCount / challenges.length) * 100) || 0;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header section */}
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">QA Practice Arena</h1>
          <p className="text-slate-500 max-w-xl text-lg">
            Master test automation by solving real-world UI challenges. Perfect for Selenium, Playwright, and Cypress.
          </p>
        </div>
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center gap-4 min-w-[200px]">
          <div className="relative h-16 w-16 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-200"
                strokeWidth="3"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-primary transition-all duration-1000 ease-out"
                strokeDasharray={`${progressPercentage}, 100`}
                strokeWidth="3"
                stroke="currentColor"
                fill="none"
                strokeLinecap="round"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center font-bold text-slate-900 text-sm">
              {progressPercentage}%
            </div>
          </div>
          <div>
            <div className="font-semibold text-slate-900">Your Progress</div>
            <div className="text-sm text-slate-500">{fullyCompletedCount} of {challenges.length} completed</div>
          </div>
        </div>
      </div>

      {/* What You Will Learn Section */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-6">What You Will Learn</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-100 text-green-700 rounded-lg">
                <AppWindow className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Selenium WebDriver</h3>
            </div>
            <ul className="space-y-2 text-slate-600 text-sm">
              <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" /> Master the Page Object Model (POM)</li>
              <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" /> Handle Explicit & Implicit Waits</li>
              <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" /> Switch between iFrames and Windows</li>
            </ul>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
                <Network className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Playwright</h3>
            </div>
            <ul className="space-y-2 text-slate-600 text-sm">
              <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" /> Leverage native Auto-Waiting</li>
              <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" /> Intercept and mock API requests</li>
              <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" /> Use Browser Contexts for isolation</li>
            </ul>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-100 text-purple-700 rounded-lg">
                <Activity className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Cypress</h3>
            </div>
            <ul className="space-y-2 text-slate-600 text-sm">
              <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" /> Time-travel debugging & snapshots</li>
              <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" /> Stub network responses with fixtures</li>
              <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" /> Master asynchronous command chaining</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Challenge Grid */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Interactive Challenges</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {challenges.map((challenge) => {
            const completed = totalTasks[challenge.id] && completedTasks[challenge.id]?.length === totalTasks[challenge.id];
            const difficultyColor = 
              challenge.difficulty === 'Beginner' ? 'bg-emerald-100 text-emerald-700' :
              challenge.difficulty === 'Intermediate' ? 'bg-amber-100 text-amber-700' :
              'bg-rose-100 text-rose-700';

            return (
              <Link 
                key={challenge.id} 
                to={challengePath(challenge)}
                data-testid={`challenge-card-${challenge.id}`}
                className={`relative group p-6 rounded-xl border transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${
                  completed 
                    ? 'bg-primary/5 border-primary/20 hover:border-primary/40' 
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                {completed && (
                  <div className="absolute top-4 right-4 text-primary">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                )}
                <div className="flex items-start gap-4 mb-4">
                  <div className={`p-3 rounded-lg ${completed ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 group-hover:bg-primary group-hover:text-white transition-colors'}`}>
                    <challenge.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold mb-2 ${difficultyColor}`}>
                      {challenge.difficulty}
                    </span>
                    <h3 className="font-bold text-slate-900 text-lg leading-tight">{challenge.label}</h3>
                  </div>
                </div>
                <p className="text-slate-500 text-sm mb-6 min-h-[40px]">
                  {challenge.desc}
                </p>
                <div className="flex items-center text-sm font-semibold text-primary group-hover:translate-x-1 transition-transform">
                  {completed ? 'Replay Challenge' : 'Start Challenge'} <ArrowRight className="ml-1 h-4 w-4" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
