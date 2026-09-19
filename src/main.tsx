import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './product/app2.css';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', async () => {
    try {
      await navigator.serviceWorker.register('/sw.js');
      const registration = await navigator.serviceWorker.ready;
      const assets = [...document.querySelectorAll<HTMLScriptElement | HTMLLinkElement>('script[src], link[rel="stylesheet"][href]')]
        .map((element) => new URL(element instanceof HTMLScriptElement ? element.src : element.href).pathname)
        .filter((path) => path.startsWith('/assets/'));
      registration.active?.postMessage({ type: 'CACHE_ASSETS', assets });
    } catch {
      // The family records still work while the app is online.
    }
  });
}
