import React, { Suspense, useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import AuthPage from '../pages/AuthPage';
import DashboardLayout from '../layouts/DashboardLayout';
import ClientDashboard from '../pages/client/ClientDashboard';
import TechDashboard from '../pages/tech/TechDashboard';
import AdminDashboard from '../pages/admin/AdminDashboard';
import DriverDashboard from '../pages/driver/DriverDashboard';

export default function AppRouter(props: any) {
  const { isLoggedIn, role, isAuthResolving } = useAuth();
  const [minSplashElapsed, setMinSplashElapsed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMinSplashElapsed(true);
    }, 2200);
    return () => clearTimeout(timer);
  }, []);

  if (isAuthResolving || !minSplashElapsed) {
    return (
      <div className="fixed inset-0 z-[9999] w-screen h-screen bg-[#02051d] overflow-hidden select-none">
        {/* Móvil / APK: Imagen original intacta */}
        <img
          src="/splash-welcome.png"
          alt="MantechPro Bienvenida"
          className="md:hidden w-full h-full object-cover object-center"
        />

        {/* Web Escritorio: Splash Vectorial 16:9 idéntico al pre-loader */}
        <div
          className="hidden md:flex w-full h-full flex-col items-center justify-center relative"
          style={{
            background: 'radial-gradient(circle at 50% 45%, #07113a 0%, #02051d 70%)'
          }}
        >
          <svg viewBox="0 0 1440 900" preserveAspectRatio="none" className="absolute inset-0 w-full h-full pointer-events-none z-[1]">
            <defs>
              <radialGradient id="topLeftOrbReact" cx="0%" cy="0%" r="55%">
                <stop offset="0%" stopColor="#3b28ff" stopOpacity="0.45" />
                <stop offset="50%" stopColor="#1d35b8" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#02051d" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="bottomRightOrbReact" cx="90%" cy="90%" r="60%">
                <stop offset="0%" stopColor="#00f5d4" stopOpacity="0.28" />
                <stop offset="45%" stopColor="#0077ff" stopOpacity="0.16" />
                <stop offset="100%" stopColor="#02051d" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="waveLineGradReact" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#4c2bd6" stopOpacity="0.5" />
                <stop offset="50%" stopColor="#00bbf9" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#00f5d4" stopOpacity="0.95" />
              </linearGradient>
            </defs>
            <rect width="1440" height="900" fill="url(#topLeftOrbReact)" />
            <rect width="1440" height="900" fill="url(#bottomRightOrbReact)" />
            <path d="M -80,260 Q 220,160 360,-60" fill="none" stroke="url(#waveLineGradReact)" strokeWidth="2.5" opacity="0.55" />
            <path d="M -100,880 Q 650,740 1520,460" fill="none" stroke="url(#waveLineGradReact)" strokeWidth="3" opacity="0.75" />
            <path d="M 150,940 Q 760,680 1380,940" fill="none" stroke="#1e40af" strokeWidth="1.5" opacity="0.35" />
          </svg>

          <div className="relative z-10 flex flex-col items-center text-center px-6">
            <svg width="112" height="104" viewBox="0 0 120 110" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-[18px] drop-shadow-[0_12px_30px_rgba(0,187,249,0.28)]">
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
            <h1 className="text-[clamp(36px,5vw,54px)] font-black tracking-[-0.03em] leading-[1.05] text-white m-0">
              Mantech<span className="bg-gradient-to-r from-[#1d8cf8] to-[#00f5d4] bg-clip-text text-transparent">Pro</span>
            </h1>
            <p className="mt-3 text-[clamp(10px,1.2vw,13px)] font-bold text-[#dbeafe] uppercase tracking-[0.28em]">
              TU ALIADO EN SERVICIOS TÉCNICOS
            </p>
            <div className="mt-7 w-[150px] h-1 rounded-full bg-white/10 overflow-hidden">
              <div className="w-full h-full rounded-full bg-gradient-to-r from-[#6c3bff] via-[#00bbf9] to-[#00f5d4] animate-pulse" />
            </div>
            <div className="mt-[26px] text-[clamp(13px,1.5vw,16px)] font-extrabold tracking-[-0.01em]">
              <span className="text-white">Abrego </span>
              <span className="bg-gradient-to-r from-[#1d8cf8] to-[#00f5d4] bg-clip-text text-transparent">Tech Solutions</span>
            </div>
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
