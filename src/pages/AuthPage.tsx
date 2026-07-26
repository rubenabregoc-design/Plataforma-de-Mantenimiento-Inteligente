import React, { useState } from 'react';
import LandingPage from '../components/LandingPage';
import Logo from '../components/Logo';
import { X } from 'lucide-react';
import { useUI } from '../context/UIContext';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { logActivity } from '../services/auditService';

export default function AuthPage() {
  const { modals, openModal, closeModal } = useUI();
  const { assets, requests } = useData();

  // Local Auth State
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authRole, setAuthRole] = useState<'client' | 'tech'>('client');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginName, setLoginName] = useState('');
  const [loginCedula, setLoginCedula] = useState('');
  const [authError, setAuthError] = useState('');

  const handleLogin = async (e: any) => {
    if (e) e.preventDefault();
    setAuthError('');
    try {
      if (authMode === 'register') {
        const res = await createUserWithEmailAndPassword(auth, loginEmail, loginPassword);
        const u = res.user;
        const tId = authRole === 'tech' ? `tech-${Date.now()}` : null;
        const defaultSub = {
          planId: authRole === 'tech' ? 'plan-basic' : 'plan-free',
          status: 'active',
          startDate: new Date().toISOString(),
          nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        };

        const userData = {
          uid: u.uid, email: loginEmail, name: loginName, role: authRole,
          cedula: loginCedula, // Registro inmutable de cédula
          techId: tId, subscription: defaultSub, createdAt: serverTimestamp()
        };

        await setDoc(doc(db, "users", u.uid), userData);

        if (authRole === 'tech' && tId) {
          await setDoc(doc(db, "technicians", tId), {
            id: tId,
            userId: u.uid,
            name: loginName,
            cedula: loginCedula,
            category: 'mecanico', // Default
            isVerified: false,
            isOnline: false,
            rating: 5,
            reviewCount: 0,
            completedJobs: 0,
            plan: 'basic',
            wallet: { balance: 0, pendingBalance: 0, transactions: [] }
          });
        }

      } else {
        const res = await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
        await logActivity(res.user.uid, res.user.email || 'user', 'LOGIN', `Acceso desde AuthPage`);
      }
    } catch (err: any) { setAuthError(err.message); }
  };

  return (
    <>
      <LandingPage
        onStart={() => openModal('auth')}
        onWatchDemo={() => openModal('demo')}
        assets={assets}
        requests={requests}
      />
      {modals.auth && (
        <div className="fixed inset-0 z-[200] bg-[#0d0e12]/90 backdrop-blur-md flex flex-col items-center justify-center p-4 overflow-y-auto custom-scrollbar">
          <div className="max-w-md w-full bg-[#121317] border border-[#2a2b2f] p-8 md:p-10 rounded-[2.5rem] space-y-6 md:space-y-8 shadow-2xl relative animate-fade-in-up my-auto">
            <button onClick={() => closeModal('auth')} className="absolute -top-4 -right-4 p-4 text-white hover:bg-rose-600 bg-[#1c1d21] border border-white/10 rounded-2xl shadow-2xl z-50 transition-all active:scale-90 group">
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
              {authMode === 'register' && (
                <>
                  <div className="space-y-2 text-left">
                    <label className="text-[10px] font-black text-[#474556] uppercase ml-1">Nombre Completo</label>
                    <input type="text" value={loginName} onChange={e => setLoginName(e.target.value)} className="w-full bg-[#0d0e12] border border-[#2a2b2f] rounded-2xl py-4 px-5 text-white" placeholder="Ej: Juan Pérez" required />
                  </div>
                  <div className="space-y-2 text-left">
                    <label className="text-[10px] font-black text-[#474556] uppercase ml-1">Cédula de Identidad</label>
                    <input type="text" value={loginCedula} onChange={e => setLoginCedula(e.target.value)} className="w-full bg-[#0d0e12] border border-[#2a2b2f] rounded-2xl py-4 px-5 text-white" placeholder="Ej: 8-888-8888" required />
                    <p className="text-[7px] text-[#474556] font-bold uppercase ml-1 mt-1">* Este dato es inmutable y será verificado.</p>
                  </div>
                </>
              )}
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
