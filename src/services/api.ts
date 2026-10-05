import axios from 'axios';
import { Capacitor } from '@capacitor/core';
import { auth } from '../firebase';

// En entorno nativo móvil (Android/iOS), las peticiones no pueden ser relativas a localhost.
// Deben dirigirse al dominio del servidor en producción o a la variable VITE_API_URL.
const PRODUCTION_API_BASE = 'https://mantech-pro.com';

export const getBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) return envUrl.replace(/\/+$/, '');
  
  if (Capacitor.isNativePlatform()) {
    return PRODUCTION_API_BASE;
  }
  
  return ''; // En entorno web, las rutas relativas (/api/...) funcionan mediante el proxy o hosting
};

export const getApiUrl = (path: string): string => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const base = getBaseUrl();
  return `${base}${cleanPath}`;
};

export const api = axios.create();

// Interceptor para inyectar Base URL y Token de Autenticación de Firebase en cada petición
api.interceptors.request.use(async (config) => {
  if (config.url && !config.url.startsWith('http')) {
    config.url = getApiUrl(config.url);
  }
  
  // Inyección de token seguro Bearer
  try {
    const currentUser = auth.currentUser;
    if (currentUser) {
      const token = await currentUser.getIdToken();
      (config.headers as any).Authorization = `Bearer ${token}`;
    }
  } catch (err) {
    console.warn("⚠️ No se pudo obtener el token para la petición API:", err);
  }

  return config;
});

export interface VerifyPaymentPayload {
  orderId: string;
  provider: 'paypal' | 'googlepay' | 'yappy' | string;
  userId: string;
  planId?: string | null;
  requestId?: string | null;
  amount?: number | string;
}

export const verifyPaymentOrder = async (payload: VerifyPaymentPayload) => {
  const response = await api.post('/api/payments/verify-order', payload);
  return response.data;
};

export default api;
