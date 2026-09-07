import axios from 'axios';
import { Capacitor } from '@capacitor/core';

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

api.interceptors.request.use((config) => {
  if (config.url && !config.url.startsWith('http')) {
    config.url = getApiUrl(config.url);
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
