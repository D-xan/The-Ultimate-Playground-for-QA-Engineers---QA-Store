import { useChallengeMode } from '@/store/useChallengeMode';
import React, { useEffect, useCallback, useState } from 'react';
import { Outlet, NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import { PageGuide } from '@/seo/PageGuide';
import { SiteFooter } from '@/components/SiteFooter';
import { Store, Save, ArrowRight, RotateCcw, Trash2, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useProgressStore } from '../store/useProgressStore';
import { isPageComplete, pageDone, pageTotal } from '../store/progressLogic';
import { challenges, practiceChallenges, tools, challengePath } from '@/data/challenges';
import { CheckCircle2 } from 'lucide-react';
import SelectorLab from '@/components/practice/SelectorLab';


const FloatingProgress = () => {
  const progress = useProgressStore();
  const location = useLocation();
  const isDashboard = location.pathname === '/practice' || location.pathname === '/practice/';
  
  // The hub's hero card already shows overall progress, so the pill only appears on challenge pages.
  if (isDashboard) return null;
  const challengeId = location.pathname.split('/').pop() || '';
  const currentTotal = pageTotal(progress, challengeId);
  if (currentTotal === 0) return null; // no task elements registered yet, or a page without tasks
  const currentCompleted = pageDone(progress, challengeId);
  const progressPercent = Math.round((currentCompleted / currentTotal) * 100);
  const label = "Task Progress";
  const countStr = `${currentCompleted} of ${currentTotal} Tasks`;

  return (
    <div data-testid="task-progress" className="relative mx-4 mt-3 self-end md:absolute md:mx-0 md:mt-0 md:top-6 md:right-8 z-30 bg-white/90 backdrop-blur-md shadow-lg rounded-full px-4 py-2 md:px-5 md:py-2.5 border border-slate-200 flex items-center gap-3 md:gap-4 animate-in fade-in zoom-in-95 duration-300 pointer-events-none">
      <div className="flex flex-col">
        <span className="text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-wider">{label}</span>
        <span className="text-xs md:text-sm font-semibold text-slate-900 leading-tight">{countStr}</span>
      </div>
      <div className="w-24 md:w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
        <div 
          className="h-full bg-primary transition-all duration-700 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      <div className="font-bold text-primary text-sm min-w-[2.5rem] text-right">
        {progressPercent}%
      </div>
    </div>
  );
};

export default function PracticeLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const progress = useProgressStore();

  const savePageState = useCallback(() => {
    const inputs = document.querySelectorAll('input, select, textarea');
    const state: Record<string, any> = {};
    inputs.forEach((el: Element) => {
      const input = el as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
      if (input.id && !input.hasAttribute('data-no-persist')) {
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
          if (input.id && !input.hasAttribute('data-no-persist') && state[input.id] !== undefined) {
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
    const currentIndex = practiceChallenges.findIndex(l => challengePath(l) === location.pathname);
    if (currentIndex >= 0 && currentIndex < practiceChallenges.length - 1) {
      navigate(challengePath(practiceChallenges[currentIndex + 1]));
    }
  };

  const handleResetPage = () => {
    localStorage.removeItem(`qa-state-${location.pathname}`);
    useProgressStore.getState().resetPage(location.pathname.split('/').pop() || '');
    window.location.reload();
  };

  const handleResetAll = () => {
    useProgressStore.getState().resetProgress();
    useChallengeMode.getState().resetBugHunt();
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('qa-state-')) {
        localStorage.removeItem(key);
      }
    });
    window.location.reload();
  };

  const isLastPage = location.pathname === challengePath(practiceChallenges[practiceChallenges.length - 1]);

    const currentLink = challenges.find(l => challengePath(l) === location.pathname);
    const currentChallengeId = currentLink?.id;
    const isToolPage = currentLink?.kind === 'tool';
    const isCurrentCompleted = currentChallengeId ? isPageComplete(progress, currentChallengeId) : false;

    return (
      <div className="flex flex-col md:flex-row h-screen bg-slate-100 overflow-hidden relative">
        {/* Mobile Top Bar */}
        <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-border shadow-sm z-20">
          <Link to="/practice" className="flex items-center gap-2">
            <img src={`${import.meta.env.BASE_URL}brand/randomly-logo-64.webp`} alt="" width={24} height={24} className="h-6 w-6" />
            <span className="font-bold text-slate-900">QA Playground</span>
          </Link>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-600" aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'} aria-expanded={isMobileMenuOpen}>
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
  
        {/* Overlay for mobile */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-30 md:hidden" 
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
  
        {/* Sidebar */}
        <aside className={`w-64 bg-slate-900 text-white flex-col ${isMobileMenuOpen ? 'flex absolute inset-y-0 left-0 z-40' : 'hidden'} md:relative md:flex`}>
          <div className="p-6 border-b border-slate-800 flex justify-between items-center">
            <div>
              <Link to="/practice" className="text-xl font-bold flex items-center gap-2 hover:text-primary transition-colors">
                <img src={`${import.meta.env.BASE_URL}brand/randomly-logo-64.webp`} alt="" width={28} height={28} className="h-7 w-7" />
                QA Playground
              </Link>
              <a href="https://randomly.online/" className="mt-2 block text-xs text-slate-400 hover:text-white" data-testid="brand-parent-link">
                by <span className="font-semibold text-slate-300">Randomly.online</span>
              </a>
            </div>
            <button className="md:hidden text-slate-400" onClick={() => setIsMobileMenuOpen(false)}>
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <nav className="flex-1 overflow-y-auto py-4">
            {[practiceChallenges, tools].map((list, idx) => (
              <React.Fragment key={idx}>
                {idx === 1 && list.length > 0 && <div className="text-xs uppercase text-slate-500 px-3 mt-4 mb-1">TOOLS</div>}
            <ul className="space-y-1 px-3">
              {list.map((link) => {
                const completed = isPageComplete(progress, link.id);
                return (
                  <li key={link.id}>
                    <NavLink
                      to={challengePath(link)}
                      data-testid={`nav-${link.id}`}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                          isActive 
                            ? 'bg-primary text-stone-900' 
                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                        }`
                      }
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <div className="flex-1 flex items-center gap-3">
                        <link.icon className="h-4 w-4" />
                        {link.label}
                      </div>
                      {completed && <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
              </React.Fragment>
            ))}
          </nav>
  
          <div className="p-4 border-t border-slate-800">
            <Link to="/" data-testid="sidebar-store-link" className="flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors">
              <Store className="h-4 w-4" /> QA Store demo
            </Link>
          </div>
        </aside>
  
        {/* Main Content */}
        <main className="flex-1 min-h-0 min-w-0 flex flex-col overflow-hidden relative">
          <FloatingProgress />
          <SelectorLab />
          <div className="flex-1 overflow-y-auto p-4 sm:p-8">
            <div className="max-w-6xl mx-auto pb-24">
              <Outlet />
              <PageGuide />
              <SiteFooter />
            </div>
          </div>
          
          {/* Bottom Action Bar */}
          {location.pathname !== '/practice' && !isToolPage && (
            <div className="action-bar absolute bottom-0 left-0 right-0 border-t border-border p-3 md:p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10">
              <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
                <div className="flex items-center gap-2 md:gap-3 w-full sm:w-auto justify-center sm:justify-start">
                  <Button variant="outline" onClick={handleResetPage} size="sm" className="flex items-center gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20 w-full sm:w-auto">
                    <RotateCcw className="w-4 h-4" /> Reset Page
                  </Button>
                  <Button variant="outline" onClick={handleResetAll} size="sm" className="flex items-center gap-2 text-slate-500 w-full sm:w-auto">
                    <Trash2 className="w-4 h-4" /> Reset All
                  </Button>
                </div>
                <div className="flex items-center gap-2 md:gap-3 w-full sm:w-auto justify-center sm:justify-end">
                  <Button onClick={() => { savePageState(); alert('Progress saved!'); }} size="sm" variant="outline" className="flex items-center gap-2 w-full sm:w-auto">
                    <Save className="w-4 h-4" /> Save
                  </Button>
                  {!isLastPage && (
                    <Button onClick={handleNext} size="sm" className="flex items-center gap-2 w-full sm:w-auto">
                      Save & Next <ArrowRight className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    );
  }
