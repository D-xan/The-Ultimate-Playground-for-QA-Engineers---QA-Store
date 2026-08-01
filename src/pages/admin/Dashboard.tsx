import React from 'react';

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-xl bg-white p-6 shadow-sm border border-slate-200">
            <div className="h-4 w-1/2 rounded bg-slate-200 mb-4"></div>
            <div className="h-8 w-3/4 rounded bg-slate-200"></div>
          </div>
        ))}
      </div>
      
      <div className="rounded-xl bg-white shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 rounded bg-slate-50 border border-slate-100"></div>
          ))}
        </div>
      </div>
    </div>
  );
}
