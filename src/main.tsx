import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { legacyHashTarget } from './utils/legacyHash';

// Old links used hash URLs (/#/practice/tables). Move them to the clean URL before the router starts.
const target = legacyHashTarget(window.location.hash, import.meta.env.BASE_URL);
if (target) window.history.replaceState(null, '', target);

// Prerendered pages ship real markup in #root. Render the app off-screen and swap it in once it has
// painted actual content, so visitors never see the markup replaced by the loading fallback.
let container = document.getElementById('root')!;
if (container.hasChildNodes()) {
  const prerendered = container;
  const live = document.createElement('div');
  live.style.cssText = 'position:absolute;inset:0;visibility:hidden';
  prerendered.after(live);
  const swap = () => {
    observer.disconnect();
    prerendered.remove();
    live.removeAttribute('style');
    live.id = 'root';
  };
  const observer = new MutationObserver(() => {
    if (live.hasChildNodes() && !live.querySelector('[data-app-loading]')) swap();
  });
  observer.observe(live, { childList: true, subtree: true });
  setTimeout(() => live.id || swap(), 4000);
  container = live;
}

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>
);
