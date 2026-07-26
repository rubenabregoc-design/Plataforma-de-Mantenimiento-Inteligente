import React from 'react';
import LandingPage from '../components/LandingPage';
import Logo from '../components/Logo';
import { X } from 'lucide-react';

interface AuthPageProps {
  showAuthForm: boolean;
  setShowAuthForm: (val: boolean) => void;
  isDemoModalOpen: boolean;
  setIsDemoModalOpen: (val: boolean) => void;
  assets: any[];
  requests: any[];
  authMode: 'login' | 'register';
  setAuthMode: (val: 'login' | 'register') => void;
  loginName: string;
  setLoginName: (val: string) => void;
  loginEmail: string;
  setLoginEmail: (val: string) => void;
  loginPassword: string;
  setLoginPassword: (val: string) => void;
  authRole: 'client' | 'tech';
  setAuthRole: (val: 'client' | 'tech') => void;
  authError: string;
  handleLogin: (e: any) => void;
}

export default function AuthPage(props: AuthPageProps) {
  const {
    showAuthForm, setShowAuthForm, isDemoModalOpen, setIsDemoModalOpen,
    assets, requests, authMode, setAuthMode, loginName, setLoginName,
    loginEmail, setLoginEmail, loginPassword, setLoginPassword,
    authRole, setAuthRole, authError, handleLogin
  } = props;

  return (
    <>
      <LandingPage
        onStart={() => setShowAuthForm(true)}
        onWatchDemo={() => setIsDemoModalOpen(true)}
        assets={assets}
        requests={requests}
      />
      {showAuthForm && (
        <div className="fixed inset-0 z-[200] bg-[#0d0e12]/90 backdrop-blur-md flex flex-col items-center justify-center p-4 overflow-y-auto custom-scrollbar">
          <div className="max-w-md w-full bg-[#121317] border border-[#2a2b2f] p-8 md:p-10 rounded-[2.5rem] space-y-6 md:space-y-8 shadow-2xl relative animate-fade-in-up my-auto">
            <button onClick={() => setShowAuthForm(false)} className="absolute -top-4 -right-4 p-4 text-white hover:bg-rose-600 bg-[#1c1d21] border border-white/10 rounded-2xl shadow-2xl z-50 transition-all active:scale-90 group">
              <X className="w-5 h-5 group-hover:rotate-90 transition-transform" />
            </button>
            <div className="text-center space-y-3 flex flex-col items-center">
              <Logo size="md" className="md:scale-125 mb-1" />
              <p className="text-[#c8c4d9] text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em]">Central Logística Panamá</p>
            </div>
            <div className="flex bg-[#1c1d21] p-1.5 rounded-2xl border border-[#2a2b2f]">
               <button onClick={() => setAuthMode('login')} className={`flex-1 py-3 text-[10px] font-black uppercase rounded-xl ${authMode === 'login' ? 'bg-[#5d3cfe] text-white shadow-lg shadow-[#5d3cfe]/20' : 'text-[#474556]'}`}>Ingresar</button>
               <button onClick={() => setAuthMode('register')} className={`flex-1 py-3 text-[10px] font-black uppercase rounded-xl ${authMode === 'register' ? 'bg-[#5d3cfe] text-white shadow-lg shadow-[#5d3cfe]/20' : 'text-[#474556]'}`}>Registrarse</button>
            </div>
            <form onSubmit={handleLogin} className="space-y-6">
              {authMode === 'register' && <div className="space-y-2 text-left"><label className="text-[10px] font-black text-[#474556] uppercase ml-1">Nombre</label><input type="text" value={loginName} onChange={e => setLoginName(e.target.value)} className="w-full bg-[#0d0e12] border border-[#2a2b2f] rounded-2xl py-4 px-5 text-white" required /></div>}
              <div className="space-y-2 text-left"><label className="text-[10px] font-black text-[#474556] uppercase ml-1">Correo</label><input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} className="w-full bg-[#0d0e12] border border-[#2a2b2f] rounded-2xl py-4 px-5 text-white" required /></div>
              <div className="space-y-2 text-left"><label className="text-[10px] font-black text-[#474556] uppercase ml-1">Clave</label><input type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} className="w-full bg-[#0d0e12] border border-[#2a2b2f] rounded-2xl py-4 px-5 text-white" required /></div>
              {authMode === 'register' && <div className="space-y-2 text-left"><label className="text-[10px] font-black text-[#474556] uppercase ml-1">Tipo</label><select value={authRole} onChange={e => setAuthRole(e.target.value as any)} className="w-full bg-[#0d0e12] border border-[#2a2b2f] rounded-2xl py-4 px-5 text-white"><option value="client">Cliente</option><option value="tech">Técnico</option></select></div>}
              {authError && <p className="text-rose-500 text-[10px] font-black uppercase text-center">{authError}</p>}
              <button type="submit" className="w-full py-5 bg-[#5d3cfe] text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-[#5d3cfe]/30 hover:brightness-110 active:scale-95 transition-all">Entrar ➔</button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
