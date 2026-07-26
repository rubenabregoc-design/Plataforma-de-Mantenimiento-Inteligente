import { Toaster, toast } from 'react-hot-toast';
import React, { useState, useEffect } from 'react';
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import { AnimatePresence } from 'framer-motion';
import { useAuth } from './context/AuthContext';
import { useData } from './context/DataContext';
import { useUI } from './context/UIContext';
import { useGpsTracking } from './hooks/useGpsTracking';
import { useBusinessLogic } from './hooks/useBusinessLogic';
import { db } from './firebase';
import { doc, updateDoc, setDoc, query, collection, where, onSnapshot } from 'firebase/firestore';

// Router & Components
import AppRouter from './routes/AppRouter';
import NotificationCenter from './components/NotificationCenter';
import SupportModal from './components/SupportModal';
import AssetRegisterModal from './components/AssetRegisterModal';
import TechnicianProfileModal from './components/TechnicianProfileModal';
import SignaturePad from './components/SignaturePad';
import Star from 'lucide-react/dist/esm/icons/star';
import X from 'lucide-react/dist/esm/icons/x';
import Globe from 'lucide-react/dist/esm/icons/globe';
import BrainCircuit from 'lucide-react/dist/esm/icons/brain-circuit';
import ShieldCheck from 'lucide-react/dist/esm/icons/shield-check';
import BadgeCheck from 'lucide-react/dist/esm/icons/badge-check';
import Truck from 'lucide-react/dist/esm/icons/truck';
import MessageSquare from 'lucide-react/dist/esm/icons/message-square';
import Logo from './components/Logo';

import { AssetService } from './services/assetService';
import { cleanForFirebase } from './utils/firebaseHelpers';

export default function App() {
  const { user, isLoggedIn, subscription, logout, role } = useAuth();
  const { assets } = useData();
  const { modals, activeData, closeModal, openModal } = useUI();
  const business = useBusinessLogic();
  const gps = useGpsTracking();

  const [ratingVal, setRatingVal] = useState(5);
  const [unreadCount, setUnreadCount] = useState(0);

  // Listen for notifications unread count
  useEffect(() => {
    if (!isLoggedIn || !user) return;
    const qNotif = query(collection(db, "notifications"), where("userId", "==", user.uid), where("read", "==", false));
    return onSnapshot(qNotif, (snap) => setUnreadCount(snap.size));
  }, [isLoggedIn, user]);

  // --- PLAN LIMITS LOGIC ---
  const getPlanLimits = (planId: string) => {
    switch(planId) {
      case 'plan-pro': return { maxAssets: 25, fleet: 'lite', diag: 'assisted', history: 50 };
      case 'plan-enterprise': return { maxAssets: 9999, fleet: 'full', diag: 'auto', history: 'unlimited' };
      case 'plan-basic': return { maxAssets: 5, fleet: 'none', diag: 'manual', history: 10 };
      default: return { maxAssets: 2, fleet: 'none', diag: 'manual', history: 5 };
    }
  };

  const planLimits = getPlanLimits(subscription.planId);

  // --- HANDLERS ---
  const handleAddAsset = async (data: any) => {
    if (!user) return;

    // Limpieza profunda de datos para Firebase (Elimina undefined)
    const cleanData = cleanForFirebase(data);

    try {
      if (activeData.asset) {
        await AssetService.updateAsset(activeData.asset.id, cleanData);
        toast.success("Equipo actualizado.");
      } else {
        await AssetService.createAsset({ ...cleanData, clientId: user.uid, registeredAt: new Date().toISOString() });
        toast.success("Equipo registrado.");
      }
    } catch (err) {
      console.error("Firebase Error:", err);
      toast.error("Error al guardar el activo.");
    }
    closeModal('asset');
  };

  const handleUploadAvatar = async (file: File) => {
    if (!user) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      await setDoc(doc(db, "users", user.uid), { profileImage: reader.result as string }, { merge: true });
      toast.success("Avatar actualizado.");
    };
    reader.readAsDataURL(file);
  };

  return (
    <PayPalScriptProvider options={{ clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID || "sb", currency: "USD", intent: "capture" }}>
      <Toaster position="top-center" />

      <AppRouter
        unreadCount={unreadCount}
        onShowNotifications={() => openModal('notification')}
        onShowSupport={() => openModal('support')}
        planLimits={planLimits}
        handleUploadAvatar={handleUploadAvatar}
        {...business}
        {...gps}
      />

      <AnimatePresence>
        {modals.asset && (
          <AssetRegisterModal
            isOpen={modals.asset}
            onClose={() => closeModal('asset')}
            onAdd={handleAddAsset}
            assetToEdit={activeData.asset}
            maxAssets={planLimits.maxAssets}
            currentAssetsCount={assets.length}
          />
        )}

        {modals.tech && (
          <TechnicianProfileModal
            isOpen={modals.tech}
            onClose={() => closeModal('tech')}
            tech={activeData.tech}
            assets={assets}
            onRequestQuote={business.handleRequestQuote}
            isAdmin={role === 'admin'}
            onVerifyTech={(tid) => business.handleVerifyTechnician(tid, true)}
          />
        )}

        {modals.signature && activeData.requestId && (
          <div className="fixed inset-0 z-[500] bg-black/80 backdrop-blur-xl flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-[#121317] border border-[#2a2b2f] p-10 rounded-[3rem] space-y-10 shadow-2xl text-center">
               <h3 className="text-2xl font-black text-white uppercase tracking-tight">Cierre de <span className="text-[#5d3cfe]">Garantía</span></h3>
               <div className="flex justify-center gap-3 py-4 border-y border-[#2a2b2f]/50">
                  {[1,2,3,4,5].map(s => <button key={s} onClick={() => setRatingVal(s)} className="hover:scale-110 transition-transform"><Star className={`w-10 h-10 ${ratingVal >= s ? 'fill-amber-500 text-amber-500' : 'text-[#2a2b2f]'}`} /></button>)}
               </div>
               <SignaturePad onSave={sig => { business.handleCompleteJob(activeData.requestId!, sig, ratingVal, ""); closeModal('signature'); }} onCancel={() => closeModal('signature')} />
            </div>
          </div>
        )}

        {modals.support && (
          <SupportModal isOpen={modals.support} onClose={() => closeModal('support')} />
        )}

        {modals.notification && user && (
          <NotificationCenter userId={user.uid} onClose={() => closeModal('notification')} />
        )}

        {modals.demo && (
          <div className="fixed inset-0 z-[300] bg-[#0d0e12]/98 backdrop-blur-3xl flex items-center justify-center p-4">
            <div className="w-full max-w-5xl bg-[#121317] border border-white/10 rounded-[3rem] overflow-hidden shadow-[0_0_100px_rgba(93,60,254,0.15)] animate-fade-in-up relative flex flex-col md:flex-row h-full max-h-[85vh]">
              <button onClick={() => closeModal('demo')} className="absolute top-8 right-8 z-50 p-3 bg-white/5 hover:bg-rose-600 text-white rounded-2xl border border-white/10 transition-all active:scale-90 group"><X className="w-6 h-6 group-hover:rotate-90 transition-transform" /></button>
              <div className="md:w-1/3 bg-[#1c1d21] p-12 flex flex-col justify-between border-r border-white/5">
                <div className="space-y-8">
                  <Logo size="md" />
                  <div className="space-y-4">
                    <h3 className="text-3xl font-black text-white leading-none uppercase tracking-tighter">Ecosistema <br /><span className="text-[#5d3cfe]">Master V4</span></h3>
                    <p className="text-xs font-bold text-[#c8c4d9] uppercase tracking-widest opacity-60">Infraestructura de Grado Industrial.</p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="p-5 bg-black/40 rounded-3xl border border-white/5 space-y-3">
                    <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#52ffac] animate-pulse"></span><span className="text-[9px] font-black text-[#52ffac] uppercase tracking-[0.2em]">Servidores Activos</span></div>
                    <p className="text-[10px] text-white/40 font-medium">Uptime del 99.9% con redundancia satelital.</p>
                  </div>
                  <p className="text-[8px] font-black text-[#474556] uppercase tracking-[0.3em] text-center">© 2026 MantechPro Panama</p>
                </div>
              </div>
              <div className="md:w-2/3 p-12 overflow-y-auto custom-scrollbar bg-grid-white/[0.02]">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {[
                    { t: "Rastreo Sat-Link V4", d: "Telemetría en tiempo real.", i: Globe, c: "#52ffac" },
                    { t: "IA Predictiva", d: "Algoritmos de desgaste.", i: BrainCircuit, c: "#5d3cfe" },
                    { t: "Custodia Escrow", d: "Seguridad bancaria.", i: ShieldCheck, c: "#f59e0b" },
                    { t: "Mantech ID", d: "Récord policivo validado.", i: BadgeCheck, c: "#e11d48" },
                    { t: "Logística B2B", d: "Gestión de flotas.", i: Truck, c: "#c7bfff" },
                    { t: "Soporte 24/7", d: "Asistente virtual.", i: MessageSquare, c: "#ffffff" }
                  ].map((f, idx) => (
                    <div key={idx} className="p-8 bg-[#1c1d21]/50 border border-white/5 rounded-[2.5rem] hover:border-white/20 transition-all group">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-2xl transition-transform group-hover:scale-110" style={{ backgroundColor: `${f.c}10`, color: f.c }}><f.i className="w-6 h-6" /></div>
                      <h4 className="text-sm font-black text-white uppercase tracking-tight mb-2">{f.t}</h4>
                      <p className="text-[11px] text-[#c8c4d9] font-medium leading-relaxed opacity-70">{f.d}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-10 p-8 bg-[#5d3cfe] rounded-[2.5rem] flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl">
                  <div><h4 className="text-xl font-black text-white uppercase tracking-tighter leading-none">¿Listo para escalar?</h4><p className="text-[10px] text-white/80 font-bold uppercase tracking-widest mt-2">Prueba el autodiagnóstico ahora mismo.</p></div>
                  <button onClick={() => closeModal('demo')} className="px-8 py-4 bg-white text-[#5d3cfe] rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl">Empezar Tour Gratis</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {modals.fuel && activeData.asset && (
           <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
             <div className="w-full max-w-2xl bg-[#0d0e12] border border-white/10 rounded-[3rem] p-10 relative shadow-2xl text-center">
                <button onClick={() => closeModal('fuel')} className="absolute top-8 right-8 p-3 bg-white/5 rounded-2xl"><X className="w-5 h-5 text-white" /></button>
                <p className="text-white font-black uppercase">Módulo de Auditoría de Combustible - Activo: {activeData.asset.name}</p>
             </div>
           </div>
        )}
      </AnimatePresence>
    </PayPalScriptProvider>
  );
}
