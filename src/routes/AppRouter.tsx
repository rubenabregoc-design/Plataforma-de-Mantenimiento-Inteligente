import React, { Suspense, lazy } from 'react';
import { useAuth } from '../context/AuthContext';
import AuthPage from '../pages/AuthPage';
import DashboardLayout from '../layouts/DashboardLayout';

const ClientDashboard = lazy(() => import('../pages/client/ClientDashboard'));
const TechDashboard = lazy(() => import('../pages/tech/TechDashboard'));
const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard'));
const DriverDashboard = lazy(() => import('../pages/driver/DriverDashboard'));

export default function AppRouter(props: any) {
  const { isLoggedIn, role, isAuthResolving } = useAuth();

  if (isAuthResolving) {
    return (
      <div className="fixed inset-0 w-screen h-screen bg-[#02051d] flex flex-col items-center justify-center overflow-hidden select-none">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 50% 45%, #07113a 0%, #02051d 70%)'
          }}
        />
        <div className="relative z-10 flex flex-col items-center text-center px-6">
          <svg width="104" height="96" viewBox="0 0 120 110" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-4 drop-shadow-[0_12px_30px_rgba(0,187,249,0.3)]">
            <defs>
              <linearGradient id="mpSplashGrad" x1="16" y1="88" x2="104" y2="24" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#6c3bff" />
                <stop offset="48%" stopColor="#00bbf9" />
                <stop offset="100%" stopColor="#00f5d4" />
              </linearGradient>
            </defs>
            <circle cx="60" cy="16" r="8.5" fill="#00f5d4" className="animate-pulse" />
            <path d="M 24 86 V 38 L 60 66 L 96 38 V 86" stroke="url(#mpSplashGrad)" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white">
            Mantech<span className="bg-gradient-to-r from-[#1d8cf8] to-[#00f5d4] bg-clip-text text-transparent">Pro</span>
          </h1>
          <p className="mt-3 text-[10px] sm:text-xs font-bold text-blue-100 uppercase tracking-[0.28em]">
            TU ALIADO EN SERVICIOS TÉCNICOS
          </p>
          <div className="mt-7 w-36 h-1 rounded-full bg-white/10 overflow-hidden">
            <div className="w-full h-full rounded-full bg-gradient-to-r from-[#6c3bff] via-[#00bbf9] to-[#00f5d4] animate-pulse" />
          </div>
          <div className="mt-6 text-xs sm:text-sm font-extrabold tracking-tight">
            <span className="text-white">Abrego </span>
            <span className="bg-gradient-to-r from-[#1d8cf8] to-[#00f5d4] bg-clip-text text-transparent">Tech Solutions</span>
          </div>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <AuthPage />;
  }

  return (
    <DashboardLayout {...props}>
      <Suspense fallback={<div className="p-20 text-center text-[#474556] font-black uppercase tracking-[0.3em] animate-pulse">Iniciando Plataforma...</div>}>
        {!role && <div className="p-20 text-center text-[#474556] font-black uppercase tracking-[0.3em] animate-pulse">Cargando perfil...</div>}
        {role === 'client' && <ClientDashboard />}
        {role === 'tech' && <TechDashboard />}
        {role === 'admin' && <AdminDashboard />}
        {role === 'driver' && <DriverDashboard />}
      </Suspense>
    </DashboardLayout>
  );
}
