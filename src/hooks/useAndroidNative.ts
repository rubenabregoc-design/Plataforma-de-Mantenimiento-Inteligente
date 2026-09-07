import { useEffect, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { toast } from 'react-hot-toast';

interface UseAndroidNativeOptions {
  modals: Record<string, boolean>;
  closeModal: (name: any) => void;
  closeAllModals: () => void;
  isMobileMenuOpen?: boolean;
  setIsMobileMenuOpen?: (open: boolean) => void;
  role?: 'client' | 'tech' | 'admin' | 'driver' | null;
  tabs?: { client: string; tech: string; admin: string; driver?: string };
  setTab?: (role: 'client' | 'tech' | 'admin' | 'driver', tab: string) => void;
}

/**
 * Triggers safe haptic feedback on supported Android / mobile devices.
 */
export async function triggerHaptic(type: 'light' | 'medium' | 'heavy' | 'selection' | 'success' | 'warning' | 'error' = 'light') {
  if (!Capacitor.isPluginAvailable('Haptics')) return;
  // En navegadores web, evitar vibración si el usuario no ha interactuado aún con la página (evita advertencia de Chrome)
  if (!Capacitor.isNativePlatform() && typeof navigator !== 'undefined') {
    const userAct = (navigator as any).userActivation;
    if (userAct && !userAct.hasBeenActive) return;
  }
  try {
    switch (type) {
      case 'selection':
        await Haptics.selectionChanged();
        break;
      case 'light':
        await Haptics.impact({ style: ImpactStyle.Light });
        break;
      case 'medium':
        await Haptics.impact({ style: ImpactStyle.Medium });
        break;
      case 'heavy':
        await Haptics.impact({ style: ImpactStyle.Heavy });
        break;
      case 'success':
        await Haptics.notification({ type: NotificationType.Success });
        break;
      case 'warning':
        await Haptics.notification({ type: NotificationType.Warning });
        break;
      case 'error':
        await Haptics.notification({ type: NotificationType.Error });
        break;
    }
  } catch {
    // Fail silently on unsupported platforms
  }
}

export function useAndroidNative({
  modals,
  closeModal,
  closeAllModals,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  role,
  tabs,
  setTab
}: UseAndroidNativeOptions) {
  const lastBackPressRef = useRef<number>(0);

  // Initialize Android system UI (Status Bar & Splash Screen)
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const initSystemUI = async () => {
      try {
        if (Capacitor.isPluginAvailable('StatusBar')) {
          await StatusBar.setStyle({ style: Style.Dark });
          await StatusBar.setBackgroundColor({ color: '#0d0e12' });
          await StatusBar.setOverlaysWebView({ overlay: false });
        }
      } catch (err) {
        console.warn('Android StatusBar init notice:', err);
      }

      try {
        if (Capacitor.isPluginAvailable('SplashScreen')) {
          await SplashScreen.hide();
        }
      } catch (err) {
        console.warn('Android SplashScreen notice:', err);
      }
    };

    initSystemUI();
  }, []);

  // Hardware Back Button / Android Gesture Back handling
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const backListenerPromise = App.addListener('backButton', () => {
      // 1. If any modal is open, close the top-most modal
      const openModalKeys = Object.entries(modals)
        .filter(([_, isOpen]) => isOpen)
        .map(([key]) => key);

      if (openModalKeys.length > 0) {
        const lastModal = openModalKeys[openModalKeys.length - 1];
        closeModal(lastModal);
        triggerHaptic('light');
        return;
      }

      // 2. If mobile drawer menu is open, close it
      if (isMobileMenuOpen && setIsMobileMenuOpen) {
        setIsMobileMenuOpen(false);
        triggerHaptic('light');
        return;
      }

      // 3. If in a secondary tab, navigate back to the primary dashboard tab
      if (role && tabs && setTab) {
        const currentTab = tabs[role];
        const defaultTab = role === 'client' ? 'dashboard' : role === 'tech' ? 'received' : role === 'driver' ? 'cockpit' : 'finance';

        if (currentTab !== defaultTab) {
          setTab(role, defaultTab);
          triggerHaptic('selection');
          return;
        }
      }

      // 4. If on root view, prompt double-tap to exit
      const now = Date.now();
      if (now - lastBackPressRef.current < 2000) {
        App.exitApp();
      } else {
        lastBackPressRef.current = now;
        triggerHaptic('warning');
        toast('Presione nuevamente para salir de MantechPro', {
          icon: '🚪',
          duration: 2000,
          style: {
            background: '#1c1d21',
            color: '#fff',
            border: '1px solid #5d3cfe',
            borderRadius: '1.2rem',
            fontSize: '11px',
            fontWeight: '800',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }
        });
      }
    });

    return () => {
      backListenerPromise.then(handler => handler.remove());
    };
  }, [modals, closeModal, isMobileMenuOpen, setIsMobileMenuOpen, role, tabs, setTab]);

  return {
    triggerHaptic
  };
}
