import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { legacyHashTarget } from './utils/legacyHash';

// Old links used hash URLs (/#/practice/tables). Move them to the clean URL before the router starts.
const target = legacyHashTarget(window.location.hash, import.meta.env.BASE_URL);
if (target) window.history.replaceState(null, '', target);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
