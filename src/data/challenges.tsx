import type { LucideIcon } from 'lucide-react';
import { Type, MousePointer2, List, Mouse, MessageSquare, AppWindow, Activity, Network, MousePointerClick, ScanSearch, Layers, Shuffle, Puzzle, Database, Server, GraduationCap, Award } from 'lucide-react';

export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export interface Challenge {
  id: string;
  label: string;
  desc: string;
  difficulty: Difficulty;
  icon: LucideIcon;
  kind?: 'tool';
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
  { id: 'locator-traps', label: 'Locator Traps', desc: 'Dynamic IDs, shuffled classes, hidden spaces and shifting layouts', icon: ScanSearch, difficulty: 'Intermediate' },
  { id: 'deep-dom', label: 'Deep DOM', desc: 'Nested iframes, closed shadow roots and shadow DOM inside frames', icon: Layers, difficulty: 'Advanced' },
  { id: 'flaky', label: 'Flaky Page', desc: 'Random failures, random delays and re-rendered elements', icon: Shuffle, difficulty: 'Advanced' },
  { id: 'widgets', label: 'Real-World Widgets', desc: 'OTP boxes, tag inputs and star ratings', icon: Puzzle, difficulty: 'Intermediate' },
  { id: 'data-generator', label: 'Test Data Generator', desc: 'Unlimited fake users, orders and cards as CSV, JSON or SQL', icon: Database, difficulty: 'Beginner', kind: 'tool' },
  { id: 'api-playground', label: 'API Playground', desc: 'Mock REST API with auth, status codes, delays and rate limits', icon: Server, difficulty: 'Intermediate', kind: 'tool' },
  { id: 'interview', label: 'Interview Kit', desc: '60+ QA and SDET interview questions with answers and flashcards', icon: GraduationCap, difficulty: 'Beginner', kind: 'tool' },
  { id: 'certificate', label: 'Certificate', desc: 'Finish every challenge and download your certificate', icon: Award, difficulty: 'Beginner', kind: 'tool' },
];

export const practiceChallenges: Challenge[] = challenges.filter(c => c.kind !== 'tool');
export const tools: Challenge[] = challenges.filter(c => c.kind === 'tool');

export const challengePath = (c: Challenge) => `/practice/${c.id}`;
