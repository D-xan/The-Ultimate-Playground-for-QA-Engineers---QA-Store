import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { useChallengeMode } from '@/store/useChallengeMode';
import { CustomerNavbar } from '@/components/customer/CustomerNavbar';

export default function CustomerLayout() {
  const bugHunt = useChallengeMode(s => s.bugHunt);
  const updateSettings = useChallengeMode(s => s.updateSettings);
  return (
    <div className="flex min-h-screen flex-col bg-slate-100 font-sans">
      <CustomerNavbar />
      {bugHunt && (
        <div data-testid="bug-hunt-banner" role="status" className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-amber-300 bg-amber-100 px-4 py-2 text-sm font-medium text-amber-900">
          <span className="min-w-0 flex-1 basis-60">Bug Hunt mode is on — this store has planted defects.</span>
          <Link to="/practice/bug-hunt" className="underline hover:no-underline">Open Bug Hunt</Link>
          <button id="bug-hunt-banner-off" type="button" onClick={() => updateSettings({ bugHunt: false })} className="rounded-md border border-amber-400 bg-white px-3 py-1 text-amber-900 hover:bg-amber-50">
            Turn off
          </button>
        </div>
      )}
      
      <main className="flex-1">
        <Outlet />
      </main>
      
      <footer className="border-t border-border bg-white py-12 mt-12">
        <div className="container mx-auto grid gap-8 px-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <h4 className="mb-4 text-lg font-bold text-slate-900">QA Store</h4>
            <p className="text-sm text-slate-500">The ultimate frontend automation practice platform masquerading as a premium e-commerce store.</p>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-900">Shop</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><a href="#" className="hover:text-primary">All Products</a></li>
              <li><a href="#" className="hover:text-primary">Weekly Deals</a></li>
              <li><a href="#" className="hover:text-primary">New Arrivals</a></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-900">Support</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><a href="#" className="hover:text-primary">Track Order</a></li>
              <li><a href="#" className="hover:text-primary">Returns</a></li>
              <li><a href="#" className="hover:text-primary">FAQ</a></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-900">Legal</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><a href="#" className="hover:text-primary">Terms of Service</a></li>
              <li><a href="#" className="hover:text-primary">Privacy Policy</a></li>
            </ul>
          </div>
        </div>
        <div className="container mx-auto mt-12 border-t border-border pt-8 text-center text-sm text-slate-400">
          © {new Date().getFullYear()} QA Automation Playground. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
