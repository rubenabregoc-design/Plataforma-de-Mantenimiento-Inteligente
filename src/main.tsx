import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './i18n';

import {AuthProvider} from './context/AuthContext';
import {DataProvider} from './context/DataContext';
import {UIProvider} from './context/UIContext';

// Silenciar advertencia benigna de IndexedDB de Firebase Auth cuando la pestaña se oculta o recarga
window.addEventListener('unhandledrejection', (event) => {
  if (
    event.reason?.message?.includes('Database is closing') ||
    event.reason?.message?.includes('Database is closing/hidden')
  ) {
    event.preventDefault();
  }
});

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
