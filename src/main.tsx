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

createRoot(document.getElementById('root')!).render(
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
