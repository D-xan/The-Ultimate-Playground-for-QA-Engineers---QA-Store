import React from 'react';
import { useChallengeMode } from '@/store/useChallengeMode';
import { Settings as SettingsIcon, AlertTriangle, Bug, WifiOff, Clock } from 'lucide-react';
import { getTestId } from '@/utils/testUtils';

export default function Settings() {
  const challengeMode = useChallengeMode();

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center gap-3 mb-8 border-b border-border pb-4">
        <SettingsIcon className="h-8 w-8 text-slate-900" />
        <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
      </div>

      <div className="bg-white border border-border rounded-2xl shadow-sm overflow-hidden mb-8">
        <div className="bg-warning/10 border-b border-warning/20 p-6 flex gap-4 items-start">
          <AlertTriangle className="h-6 w-6 text-warning shrink-0" />
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-2">QA Challenge Mode</h2>
            <p className="text-slate-600 text-sm">
              Enable these toggles to intentionally break things, randomize IDs, and slow down networks. 
              Perfect for training robust automation scripts that can handle real-world flakiness!
            </p>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Dynamic IDs */}
          <div className="flex items-center justify-between border-b border-border pb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-slate-100 rounded-lg"><Bug className="h-5 w-5 text-slate-600" /></div>
              <div>
                <h3 className="font-semibold text-slate-900">Dynamic IDs</h3>
                <p className="text-sm text-slate-500">Appends random hashes to DOM IDs (e.g. `submit-btn-4f8a`)</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={challengeMode.dynamicIds}
                onChange={(e) => challengeMode.setDynamicIds(e.target.checked)}
                data-testid={getTestId('toggle-dynamic-ids')}
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          {/* Random Delays */}
          <div className="flex items-center justify-between border-b border-border pb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-slate-100 rounded-lg"><Clock className="h-5 w-5 text-slate-600" /></div>
              <div>
                <h3 className="font-semibold text-slate-900">Random Delays</h3>
                <p className="text-sm text-slate-500">Adds 500ms - 3000ms latency to API calls randomly</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={challengeMode.randomDelays}
                onChange={(e) => challengeMode.setRandomDelays(e.target.checked)}
                data-testid={getTestId('toggle-random-delays')}
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          {/* Network Errors */}
          <div className="flex items-center justify-between pb-2">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-slate-100 rounded-lg"><WifiOff className="h-5 w-5 text-slate-600" /></div>
              <div>
                <h3 className="font-semibold text-slate-900">Flaky Network Errors</h3>
                <p className="text-sm text-slate-500">Randomly fails API requests with 500 errors (10% chance)</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={challengeMode.networkErrors}
                onChange={(e) => challengeMode.setNetworkErrors(e.target.checked)}
                data-testid={getTestId('toggle-network-errors')}
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
