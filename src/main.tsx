import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './i18n';

import {AuthProvider} from './context/AuthContext';
import {DataProvider} from './context/DataContext';
import {UIProvider} from './context/UIContext';

// Auto-recuperación si el navegador tenía una versión en caché previa a un despliegue
window.addEventListener('vite:preloadError', (event) => {
  event.preventDefault();
  if (!sessionStorage.getItem('mantech_chunk_reloaded')) {
    sessionStorage.setItem('mantech_chunk_reloaded', 'true');
    window.location.reload();
  }
});

// Silenciar advertencia benigna de IndexedDB de Firebase Auth y auto-recargar si falla un chunk antiguo
window.addEventListener('unhandledrejection', (event) => {
  const msg = event.reason?.message || String(event.reason || '');
  if (
    msg.includes('Database is closing') ||
    msg.includes('Database is closing/hidden')
  ) {
    event.preventDefault();
    return;
  }
  if (
    msg.includes('Failed to fetch dynamically imported module') ||
    msg.includes('Importing a module script failed') ||
    msg.includes('Expected a JavaScript-or-Wasm module script')
  ) {
    event.preventDefault();
    if (!sessionStorage.getItem('mantech_chunk_reloaded')) {
      sessionStorage.setItem('mantech_chunk_reloaded', 'true');
      window.location.reload();
    }
  }
});

// Respaldo global para imágenes cuando el APK o navegador no tiene datos ni Wi-Fi (Offline)
window.addEventListener(
  'error',
  (event) => {
    const target = event.target as HTMLElement | null;
    if (target && target.tagName === 'IMG') {
      const img = target as HTMLImageElement;
      if (img.dataset.offlineFallbackApplied === 'true') return;
      img.dataset.offlineFallbackApplied = 'true';

      const src = img.src || '';
      if (src.includes('1551288049')) img.src = '/offline-img/dashboard.jpg';
      else if (src.includes('1460925895917')) img.src = '/offline-img/market.jpg';
      else if (src.includes('1557597774')) img.src = '/offline-img/security.jpg';
      else if (src.includes('1556742044')) img.src = '/offline-img/wallet.jpg';
      else if (src.includes('1519003722824')) img.src = '/offline-img/logistics.jpg';
      else if (src.includes('1581092160562')) img.src = '/offline-img/audit.jpg';
      else if (src.includes('1486406146926')) img.src = '/offline-img/b2b-ph.jpg';
      else if (src.includes('1550751827')) img.src = '/offline-img/cyber-it.jpg';
      else if (src.includes('1524661135')) img.src = '/offline-img/map-bg.jpg';
      else if (src.includes('1621905251918')) img.src = '/offline-img/hvac-service.jpg';
      else if (src.includes('1599256621730')) img.src = '/offline-img/fleet-service.jpg';
      else if (src.includes('Google_Play')) img.src = '/offline-img/google-play-badge.svg';
      else if (src.includes('App_Store')) img.src = '/offline-img/app-store-badge.svg';
      else if (src.includes('qrserver.com')) img.src = '/logo.png';
      else img.src = '/offline-img/industrial.jpg';
    }
  },
  true
);

const rootElement = document.getElementById('root');
if (rootElement) {
  try {
    createRoot(rootElement).render(
      <StrictMode>
        <AuthProvider>
          <DataProvider>
            <UIProvider>
              <App />
            </UIProvider>
          </DataProvider>
        </AuthProvider>
      </StrictMode>,
    );
  } catch (err: any) {
    console.error("Critical Boot Error:", err);
    rootElement.innerHTML = `
      <div style="height:100vh;background:#020521;color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:sans-serif;padding:20px;text-align:center;">
        <h2 style="color:#52ffac;text-transform:uppercase;">MantechPro</h2>
        <p style="color:#c8c4d9;font-size:14px;max-width:400px;">Se produjo un reinicio de sesión. Presione el botón para recargar la plataforma.</p>
        <button onclick="window.location.reload(true)" style="background:#5d3cfe;color:#fff;border:none;padding:12px 24px;border-radius:12px;font-weight:bold;cursor:pointer;margin-top:16px;">Recargar Plataforma</button>
      </div>
    `;
  }
}
