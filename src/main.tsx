import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { LanguageProvider } from './context/LanguageContext';
import { registerPushServiceWorker } from './lib/fcm';

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    registerPushServiceWorker().then((reg) => {
      if (reg && typeof reg.update === 'function') {
        reg.update().catch(() => {});
      }
    });
  });
}

createRoot(document.getElementById('root')!).render(
  <LanguageProvider>
    <App />
  </LanguageProvider>
);
