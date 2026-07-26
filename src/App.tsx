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
import { doc, updateDoc, arrayUnion, collection, addDoc, serverTimestamp } from 'firebase/firestore';

// Router & Components
import AppRouter from './routes/AppRouter';
import NotificationCenter from './components/NotificationCenter';
import SupportModal from './components/SupportModal';
import AssetRegisterModal from './components/AssetRegisterModal';
import ServiceReportModal from './components/ServiceReportModal';
import SignaturePad from './components/SignaturePad';
import Star from 'lucide-react/dist/esm/icons/star';
import X from 'lucide-react/dist/esm/icons/x';
import { AssetService } from './services/assetService';

export default function App() {
  const { user, isLoggedIn, subscription, loggedInName, userData } = useAuth();
  const { isDataLoading, assets } = useData();
  const { modals, activeData, closeModal, openModal } = useUI();
  const business = useBusinessLogic();
  const gps = useGpsTracking();

  const [ratingVal, setRatingVal] = useState(5);

  // --- MODAL HANDLERS ---
  const handleAddAsset = async (data: any) => {
    if (!user) return;
    const cleanData = Object.fromEntries(Object.entries(data).filter(([_, v]) => v !== undefined));
    try {
      if (activeData.asset) {
        await AssetService.updateAsset(activeData.asset.id, cleanData);
        toast.success("Equipo actualizado.");
      } else {
        await AssetService.createAsset({ ...cleanData, clientId: user.uid, registeredAt: new Date().toISOString() });
        toast.success("Equipo registrado.");
      }
    } catch (err) { console.error(err); }
    closeModal('asset');
  };

  return (
    <PayPalScriptProvider options={{ clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID || "sb", currency: "USD", intent: "capture" }}>
      <Toaster position="top-center" />

      <AppRouter
        {...business}
        {...gps}
      />

      <AnimatePresence>
        {modals.auth && !isLoggedIn && (
           /* Handled inside AppRouter/AuthPage usually, but can be global too */
           null
        )}

        {modals.asset && (
          <AssetRegisterModal
            isOpen={modals.asset}
            onClose={() => closeModal('asset')}
            onAdd={handleAddAsset}
            assetToEdit={activeData.asset}
            maxAssets={99}
            currentAssetsCount={assets.length}
          />
        )}

        {modals.signature && activeData.requestId && (
          <div className="fixed inset-0 z-[500] bg-black/80 backdrop-blur-xl flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-[#121317] border border-[#2a2b2f] p-10 rounded-[3rem] space-y-10 shadow-2xl">
               <div className="text-center space-y-2"><h3 className="text-2xl font-black text-white uppercase tracking-tight">Cierre de <span className="text-[#5d3cfe]">Garantía</span></h3></div>
               <div className="flex justify-center gap-3 py-4 border-y border-[#2a2b2f]/50">
                  {[1,2,3,4,5].map(s => <button key={s} onClick={() => setRatingVal(s)}><Star className={`w-10 h-10 ${ratingVal >= s ? 'fill-amber-500 text-amber-500' : 'text-[#2a2b2f]'}`} /></button>)}
               </div>
               <SignaturePad onSave={sig => { business.handleCompleteJob(activeData.requestId!, sig, ratingVal, ""); closeModal('signature'); }} onCancel={() => closeModal('signature')} />
            </div>
          </div>
        )}

        {modals.support && (
          <SupportModal isOpen={modals.support} onClose={() => closeModal('support')} />
        )}

        {modals.fuel && activeData.asset && (
           <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
             <div className="w-full max-w-2xl bg-[#0d0e12] border border-white/10 rounded-[3rem] p-10 relative shadow-2xl">
                <button onClick={() => closeModal('fuel')} className="absolute top-8 right-8 p-3 bg-white/5 rounded-2xl"><X className="w-5 h-5 text-white" /></button>
                <p className="text-white font-black uppercase text-center">Módulo de Auditoría de Combustible - Activo: {activeData.asset.name}</p>
             </div>
           </div>
        )}

        {modals.notification && user && (
          <NotificationCenter userId={user.uid} onClose={() => closeModal('notification')} />
        )}
      </AnimatePresence>
    </PayPalScriptProvider>
  );
}
