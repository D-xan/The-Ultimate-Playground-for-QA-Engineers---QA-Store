import type { LucideIcon } from 'lucide-react';
import { Type, MousePointer2, List, Mouse, MessageSquare, AppWindow, Activity, Network, MousePointerClick } from 'lucide-react';

export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export interface Challenge {
  id: string;
  label: string;
  desc: string;
  difficulty: Difficulty;
  icon: LucideIcon;
}

export const challenges: Challenge[] = [
  { id: 'basic', label: 'Basic Elements', desc: 'Interact with inputs, buttons, and forms', icon: Type, difficulty: 'Beginner' },
  { id: 'advanced', label: 'Advanced Inputs', desc: 'Handle date pickers, range sliders, and uploads', icon: MousePointer2, difficulty: 'Intermediate' },
  { id: 'tables', label: 'Tables & Lists', desc: 'Extract data from dynamic data grids', icon: List, difficulty: 'Intermediate' },
  { id: 'interactions', label: 'Mouse & Keyboard', desc: 'Drag-and-drop, hover, right-click, and hotkeys', icon: Mouse, difficulty: 'Advanced' },
  { id: 'dialogs', label: 'Popups & Dialogs', desc: 'Manage alerts, confirm prompts, and modals', icon: MessageSquare, difficulty: 'Beginner' },
  { id: 'frames', label: 'Frames & Shadow DOM', desc: 'Switching contexts into iframes and shadow roots', icon: AppWindow, difficulty: 'Advanced' },
  { id: 'dynamic', label: 'Dynamic & Waits', desc: 'Handle elements appearing asynchronously', icon: Activity, difficulty: 'Intermediate' },
  { id: 'pagination-test', label: 'Store Pagination', desc: 'Navigate multiple pages of products', icon: List, difficulty: 'Intermediate' },
  { id: 'lazy-load', label: 'Store Lazy Loading', desc: 'Scroll to trigger dynamic content fetching', icon: MousePointer2, difficulty: 'Intermediate' },
  { id: 'api-interception', label: 'API Interception', desc: 'Mock and modify network requests directly', icon: Network, difficulty: 'Advanced' },
  { id: 'progress-bar', label: 'Progress Bar', desc: 'Test waits on a dynamic progress bar', icon: Activity, difficulty: 'Intermediate' },
  { id: 'click-traps', label: 'Click Traps', desc: 'Covered, moving and delayed elements that break naive clicks', icon: MousePointerClick, difficulty: 'Advanced' },
];

export const challengePath = (c: Challenge) => `/practice/${c.id}`;
