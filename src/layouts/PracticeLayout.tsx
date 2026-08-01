import React, { useEffect, useCallback } from 'react';
import { Outlet, NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Type, MousePointer2, List, Mouse, 
  MessageSquare, AppWindow, Activity, ArrowLeft, Save, ArrowRight, RotateCcw, Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

const sidebarLinks = [
  { to: '/practice/basic', label: 'Basic Elements', icon: <Type className="h-4 w-4" /> },
  { to: '/practice/advanced', label: 'Advanced Inputs', icon: <MousePointer2 className="h-4 w-4" /> },
  { to: '/practice/tables', label: 'Tables & Lists', icon: <List className="h-4 w-4" /> },
  { to: '/practice/interactions', label: 'Mouse & Keyboard', icon: <Mouse className="h-4 w-4" /> },
  { to: '/practice/dialogs', label: 'Popups & Dialogs', icon: <MessageSquare className="h-4 w-4" /> },
  { to: '/practice/frames', label: 'Frames & Shadow DOM', icon: <AppWindow className="h-4 w-4" /> },
  { to: '/practice/dynamic', label: 'Dynamic & Waits', icon: <Activity className="h-4 w-4" /> },
  { to: '/practice/pagination-test', label: 'Store Pagination', icon: <List className="h-4 w-4" /> },
  { to: '/practice/lazy-load', label: 'Store Lazy Loading', icon: <MousePointer2 className="h-4 w-4" /> },
];

export default function PracticeLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const savePageState = useCallback(() => {
    const inputs = document.querySelectorAll('input, select, textarea');
    const state: Record<string, any> = {};
    inputs.forEach((el: Element) => {
      const input = el as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
      if (input.id) {
        if (input.type === 'checkbox' || input.type === 'radio') {
          state[input.id] = (input as HTMLInputElement).checked;
        } else {
          state[input.id] = input.value;
        }
      }
    });
    localStorage.setItem(`qa-state-${location.pathname}`, JSON.stringify(state));
  }, [location.pathname]);

  const restorePageState = useCallback(() => {
    const saved = localStorage.getItem(`qa-state-${location.pathname}`);
    if (saved) {
      try {
        const state = JSON.parse(saved);
        const inputs = document.querySelectorAll('input, select, textarea');
        inputs.forEach((el: Element) => {
          const input = el as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
          if (input.id && state[input.id] !== undefined) {
            const val = state[input.id];
            if (input.type === 'checkbox' || input.type === 'radio') {
              const proto = window.HTMLInputElement.prototype;
              const setter = Object.getOwnPropertyDescriptor(proto, 'checked')?.set;
              if (setter) setter.call(input, val);
              else (input as HTMLInputElement).checked = val;
              input.dispatchEvent(new Event('change', { bubbles: true }));
            } else {
              let proto = window.HTMLInputElement.prototype as any;
              if (input.tagName === 'SELECT') proto = window.HTMLSelectElement.prototype;
              if (input.tagName === 'TEXTAREA') proto = window.HTMLTextAreaElement.prototype;
              const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
              if (setter) setter.call(input, val);
              else input.value = val;
              input.dispatchEvent(new Event('input', { bubbles: true }));
              input.dispatchEvent(new Event('change', { bubbles: true }));
            }
          }
        });
      } catch (e) {
        console.error("Failed to restore state", e);
      }
    }
  }, [location.pathname]);

  useEffect(() => {
    const timer = setTimeout(restorePageState, 150); // slight delay for DOM mount
    return () => clearTimeout(timer);
  }, [location.pathname, restorePageState]);

  const handleNext = () => {
    savePageState();
    const currentIndex = sidebarLinks.findIndex(l => l.to === location.pathname);
    if (currentIndex >= 0 && currentIndex < sidebarLinks.length - 1) {
      navigate(sidebarLinks[currentIndex + 1].to);
    }
  };

  const handleResetPage = () => {
    localStorage.removeItem(`qa-state-${location.pathname}`);
    window.location.reload();
  };

  const handleResetAll = () => {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('qa-state-')) {
        localStorage.removeItem(key);
      }
    });
    window.location.reload();
  };

  const isLastPage = location.pathname === sidebarLinks[sidebarLinks.length - 1].to;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col hidden md:flex">
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <AppWindow className="h-6 w-6 text-primary" />
            QA Challenges
          </h2>
          <p className="text-xs text-slate-400 mt-2">Master your automation scripts</p>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {sidebarLinks.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive 
                        ? 'bg-primary text-white' 
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`
                  }
                >
                  {link.icon}
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <Link to="/" className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Store
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto pb-24">
            <Outlet />
          </div>
        </div>
        
        {/* Bottom Action Bar */}
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-border p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={handleResetPage} className="flex items-center gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20">
                <RotateCcw className="w-4 h-4" /> Reset Page
              </Button>
              <Button variant="outline" onClick={handleResetAll} className="flex items-center gap-2 text-slate-500">
                <Trash2 className="w-4 h-4" /> Reset All
              </Button>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={() => { savePageState(); alert('Progress saved!'); }} variant="outline" className="flex items-center gap-2">
                <Save className="w-4 h-4" /> Save
              </Button>
              {!isLastPage && (
                <Button onClick={handleNext} className="flex items-center gap-2">
                  Save & Next <ArrowRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
