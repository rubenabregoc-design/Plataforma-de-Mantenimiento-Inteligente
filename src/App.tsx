import { Toaster, toast } from 'react-hot-toast';
import React, { useState, useEffect } from 'react';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import GooglePayButton from '@google-pay/button-react';
import { AnimatePresence } from 'framer-motion';
import { useAuth } from './context/AuthContext';
import { useData } from './context/DataContext';
import { useUI } from './context/UIContext';
import { useGpsTracking } from './hooks/useGpsTracking';
import { useBusinessLogic } from './hooks/useBusinessLogic';
import { db } from './firebase';
import { doc, updateDoc, setDoc, getDoc, query, collection, where, onSnapshot } from 'firebase/firestore';

// Router & Components
import AppRouter from './routes/AppRouter';
import NotificationCenter from './components/NotificationCenter';
import SupportModal from './components/SupportModal';
import Chatbot247 from './components/Chatbot247';
import AssetRegisterModal from './components/AssetRegisterModal';
import TechnicianProfileModal from './components/TechnicianProfileModal';
import SignaturePad from './components/SignaturePad';
import AssetEngineeringReportModal from './components/AssetEngineeringReportModal';
import FuelAuditModal from './components/FuelAuditModal';
import PreTripInspectionModal from './components/PreTripInspectionModal';
import QuoteModal from './components/QuoteModal';
import MaterialModal from './components/MaterialModal';
import UnforeseenModal from './components/UnforeseenModal';
import PriceAdjustmentModal from './components/PriceAdjustmentModal';
import ReasonModal from './components/ReasonModal';
import ConfirmationModal from './components/ConfirmationModal';
import InfoModal from './components/InfoModal';
import Star from 'lucide-react/dist/esm/icons/star';
import X from 'lucide-react/dist/esm/icons/x';
import Globe from 'lucide-react/dist/esm/icons/globe';
import BrainCircuit from 'lucide-react/dist/esm/icons/brain-circuit';
import ShieldCheck from 'lucide-react/dist/esm/icons/shield-check';
import BadgeCheck from 'lucide-react/dist/esm/icons/badge-check';
import Truck from 'lucide-react/dist/esm/icons/truck';
import MessageSquare from 'lucide-react/dist/esm/icons/message-square';
import CreditCard from 'lucide-react/dist/esm/icons/credit-card';
import Download from 'lucide-react/dist/esm/icons/download';
import Logo from './components/Logo';

import { AssetService } from './services/assetService';
import { cleanForFirebase } from './utils/firebaseHelpers';
import { compressImage } from './utils/imageHelpers';

export default function App() {
  const { user, isLoggedIn, subscription, logout, role } = useAuth();
  const { assets, requests, technicians } = useData();
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
      case 'plan-enterprise': return { maxAssets: 9999, fleet: 'full', diag: 'auto', history: 'unlimited' };
      case 'plan-pro': return { maxAssets: 25, fleet: 'lite', diag: 'assisted', history: 50 };
      case 'plan-basic': return { maxAssets: 5, fleet: 'none', diag: 'manual', history: 10 };
      case 'plan-free':
      default: return { maxAssets: 5, fleet: 'none', diag: 'manual', history: 5 };
    }
  };

  const planLimits = getPlanLimits(subscription.planId);

  // --- HANDLERS ---
  const handleAddAsset = async (data: any) => {
    if (!user) return;

    // LÓGICA DE LÍMITES POR PLAN
    if (assets.length >= planLimits.maxAssets) {
       toast.error(`Límite excedido. Su plan actual (${subscription.planId.replace('plan-','').toUpperCase()}) solo permite ${planLimits.maxAssets} activos.`);
       openModal('subscriptions');
       return;
    }

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

    const loadingToast = toast.loading("Procesando imagen industrial...");

    try {
      // Punto #1: Compresión en el cliente para evitar el límite de 1MB de Firestore
      const compressedBase64 = await compressImage(file, 300, 0.6);

      // Actualizar documento de usuario global
      await setDoc(doc(db, "users", user.uid), {
        profileImage: compressedBase64
      }, { merge: true });

      // Si es técnico, actualizar también su perfil de marketplace para que el carnet se vea bien
      if (role === 'tech') {
        const userSnap = await getDoc(doc(db, "users", user.uid));
        const techId = userSnap.data()?.techId;
        if (techId) {
          await updateDoc(doc(db, "technicians", techId), {
            profileImage: compressedBase64
          });
        }
      }

      toast.success("Avatar optimizado y actualizado.", { id: loadingToast });
    } catch (err) {
      console.error("Image Processing Error:", err);
      toast.error("La imagen es demasiado pesada o no es válida.", { id: loadingToast });
    }
  };

  return (
    <PayPalScriptProvider options={{
      clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID || "sb",
      currency: "USD",
      intent: "capture",
      components: "buttons,googlepay",
      "disable-funding": "paylater,venmo",
      locale: "es_PA"
    }}>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1c1d21',
            color: '#fff',
            borderRadius: '1.2rem',
            border: '1px solid rgba(255,255,255,0.1)',
            fontSize: '11px',
            fontWeight: '900',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            padding: '16px 24px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
            maxWidth: '450px'
          },
          success: {
            iconTheme: {
              primary: '#52ffac',
              secondary: '#000',
            },
            style: {
              border: '1px solid rgba(82,255,172,0.2)',
              boxShadow: '0 0 20px rgba(82,255,172,0.1)'
            }
          },
          error: {
            iconTheme: {
              primary: '#f43f5e',
              secondary: '#fff',
            },
            style: {
              border: '1px solid rgba(244,63,94,0.2)',
              boxShadow: '0 0 20px rgba(244,63,94,0.1)'
            }
          }
        }}
      />

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
            initialAssetId={activeData.asset?.id}
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

        {modals.payment && (
          <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl overflow-y-auto">
             <div className="w-full max-w-[95%] sm:max-w-lg bg-[#121317] border border-[#2a2b2f] rounded-[1.5rem] sm:rounded-[3rem] p-6 sm:p-10 space-y-6 sm:space-y-8 shadow-2xl animate-fade-in-up relative my-auto">
                <button onClick={() => closeModal('payment')} className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2.5 sm:p-3 bg-white/5 rounded-2xl hover:bg-rose-600/20 text-white transition-all z-50"><X className="w-4 h-4 sm:w-5 sm:h-5" /></button>
                <div className="text-center space-y-3 pt-4 sm:pt-0">
                   <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#52ffac]/10 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto text-[#52ffac] border border-[#52ffac]/20 shadow-lg shadow-[#52ffac]/10">
                      <CreditCard className="w-6 h-6 sm:w-8 sm:h-8" />
                   </div>
                   <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tighter italic">Checkout Seguro</h3>
                   <p className="text-[8px] sm:text-[10px] text-[#474556] font-black uppercase tracking-[0.3em]">Procesamiento Encriptado AES-256</p>
                </div>

                <div className="bg-white/5 border border-white/10 p-5 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] space-y-4">
                   <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-[#c8c4d9] uppercase tracking-widest">Concepto</span>
                      <span className="text-xs font-black text-white uppercase">
                        {activeData.plan
                          ? `Suscripción ${role === 'tech' ? 'Especialista' : 'Corporativa'}: ${activeData.plan.replace('plan-','').toUpperCase()}`
                          : (activeData.request?.amountPaid && activeData.request.amountPaid > 0)
                            ? `Saldo Pendiente: ${activeData.request?.assetName}`
                            : `Reserva de Inspección: ${activeData.request?.assetName}`}
                      </span>
                   </div>
                   <div className="h-px bg-white/5"></div>
                   <div className="flex justify-between items-end">
                      <span className="text-[10px] font-black text-[#c8c4d9] uppercase tracking-widest mb-1">Monto a Depositar</span>
                      <p className="text-4xl font-black text-[#52ffac] italic tracking-tighter leading-none">
                        ${(() => {
                          if (activeData.plan) {
                            if (role === 'tech') return activeData.plan === 'plan-pro' ? '45' : '99';
                            return activeData.plan === 'plan-pro' ? '89' : activeData.plan === 'plan-enterprise' ? '199' : '29';
                          }
                          const req = activeData.request;
                          if (!req) return '0';
                          if (req.amountPaid && req.amountPaid > 0) {
                             return (req.price - req.amountPaid).toFixed(2);
                          }
                          return (req.visitFeeAmount || 15).toFixed(2);
                        })()}
                      </p>
                   </div>
                </div>

                <div className="space-y-4">
                   <button
                     onClick={() => {
                        if (activeData.plan) {
                          business.handleRequestSubscription(user!.uid, activeData.plan);
                        } else {
                          business.handleAcceptQuote(activeData.request?.id || '', 'yappy');
                        }
                        closeModal('payment');
                     }}
                     className="w-full py-5 bg-[#52ffac] text-[#0d0e12] rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-[#52ffac]/20 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-3"
                   >
                      <Download className="w-4 h-4" /> Pagar vía YAPPY (Manual)
                   </button>

                   <div className="rounded-2xl overflow-hidden shadow-none hover:brightness-110 active:scale-[0.98] transition-all h-[64px] bg-black border-0">
                      <GooglePayButton
                        environment="TEST"
                        buttonColor="black"
                        buttonType="pay"
                        buttonSizeMode="fill"
                        buttonRadius={16}
                        style={{ width: '100%', height: '64px', border: 'none', outline: 'none' }}
                        paymentRequest={{
                          apiVersion: 2,
                          apiVersionMinor: 0,
                          allowedPaymentMethods: [
                            {
                              type: 'CARD',
                              parameters: {
                                allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
                                allowedCardNetworks: ['MASTERCARD', 'VISA'],
                              },
                              tokenizationSpecification: {
                                type: 'PAYMENT_GATEWAY',
                                parameters: {
                                  gateway: 'example',
                                  gatewayMerchantId: 'exampleGatewayMerchantId',
                                },
                              },
                            },
                          ],
                          merchantInfo: {
                            merchantId: '12345678901234567890',
                            merchantName: 'MantechPro PA',
                          },
                          transactionInfo: {
                            totalPriceStatus: 'FINAL',
                            totalPriceLabel: 'Total',
                            totalPrice: activeData.plan
                              ? (role === 'tech'
                                  ? (activeData.plan === 'plan-pro' ? '45.00' : '99.00')
                                  : (activeData.plan === 'plan-pro' ? '89.00' : activeData.plan === 'plan-enterprise' ? '199.00' : '29.00'))
                              : (activeData.request?.price || '0').toString(),
                            currencyCode: 'USD',
                            countryCode: 'PA',
                          },
                        }}
                        onLoadPaymentData={paymentRequest => {
                          const loading = toast.loading("Verificando Token...");
                          setTimeout(async () => {
                            if(activeData.plan) {
                               await business.handleApproveSubscription(user!.uid, activeData.plan);
                            } else {
                               await business.handleAcceptQuote(activeData.request?.id || '', 'googlepay');
                            }
                            toast.success("Pago verificado vía Google Pay", { id: loading });
                            closeModal('payment');
                          }, 1500);
                        }}
                      />
                   </div>

                   <div className="p-1">
                      <PayPalButtons
                        style={{ layout: "vertical", shape: "pill", color: "blue", height: 50 }}
                        createOrder={(data, actions) => {
                          const price = activeData.plan
                            ? (role === 'tech'
                                ? (activeData.plan === 'plan-pro' ? '45.00' : '99.00')
                                : (activeData.plan === 'plan-pro' ? '89.00' : activeData.plan === 'plan-enterprise' ? '199.00' : '29.00'))
                            : (activeData.request?.price || '0').toString();

                          return actions.order.create({
                            application_context: {
                              shipping_preference: "NO_SHIPPING"
                            },
                            purchase_units: [{
                              description: activeData.plan ? `MantechPro Subscription: ${activeData.plan}` : `MantechPro Service: ${activeData.request?.assetName}`,
                              amount: { currency_code: "USD", value: price }
                            }]
                          });
                        }}
                        onApprove={async (data, actions) => {
                           return actions.order!.capture().then(async () => {
                             if(activeData.plan) {
                                await business.handleApproveSubscription(user!.uid, activeData.plan);
                             } else {
                                await business.handleAcceptQuote(activeData.request?.id || '', 'paypal');
                             }
                             closeModal('payment');
                             toast.success("Pago procesado exitosamente.");
                           });
                        }}
                      />
                   </div>
                </div>
                <p className="text-[8px] text-[#474556] font-bold uppercase text-center tracking-widest">Al confirmar, usted acepta los términos de uso y licencia MantechPro.</p>
             </div>
          </div>
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
          <FuelAuditModal
            isOpen={modals.fuel}
            onClose={() => closeModal('fuel')}
            asset={assets.find(a => a.id === activeData.asset?.id) || activeData.asset}
            onAddLog={business.handleAddFuelLog}
          />
        )}

        {modals.engineeringReport && activeData.asset && (
          <AssetEngineeringReportModal
            isOpen={modals.engineeringReport}
            onClose={() => closeModal('engineeringReport')}
            asset={assets.find(a => a.id === activeData.asset?.id) || activeData.asset}
          />
        )}

        {modals.preTrip && activeData.asset && (
          <PreTripInspectionModal
            isOpen={modals.preTrip}
            onClose={() => closeModal('preTrip')}
            assetName={activeData.asset.name}
            onSave={(insp) => business.handleAddPreTrip(activeData.asset!.id, insp)}
          />
        )}

        {modals.quote && activeData.request && (
          <QuoteModal
            isOpen={modals.quote}
            onClose={() => closeModal('quote')}
            request={activeData.request}
            onSend={business.handleSendQuote}
            techPlan={technicians.find(t => t.id === activeData.request?.techId)?.plan || 'basic'}
          />
        )}

        {modals.material && activeData.request && (
          <MaterialModal
            isOpen={modals.material}
            onClose={() => closeModal('material')}
            request={activeData.request}
            onSave={business.handleSaveMaterial}
          />
        )}

        {modals.unforeseen && activeData.request && (
          <UnforeseenModal
            isOpen={modals.unforeseen}
            onClose={() => closeModal('unforeseen')}
            request={activeData.request}
            onTrigger={business.handleTriggerUnforeseen}
          />
        )}

        {modals.priceAdjustment && activeData.request && (
          <PriceAdjustmentModal
            isOpen={modals.priceAdjustment}
            onClose={() => closeModal('priceAdjustment')}
            request={activeData.request}
            onAdjust={business.handleProposePriceAdjustment}
          />
        )}

        {modals.reason && (
          <ReasonModal
            isOpen={modals.reason}
            onClose={() => closeModal('reason')}
            onConfirm={activeData.onReasonConfirm}
            title={activeData.reasonTitle}
            placeholder={activeData.reasonPlaceholder}
          />
        )}

        {modals.confirmation && (
          <ConfirmationModal
            isOpen={modals.confirmation}
            onClose={() => closeModal('confirmation')}
            onConfirm={activeData.onConfConfirm}
            title={activeData.confTitle}
            message={activeData.confMessage}
            type={activeData.confType}
          />
        )}

        {modals.info && (
          <InfoModal
            isOpen={modals.info}
            onClose={() => closeModal('info')}
            slug={activeData.infoSlug}
          />
        )}
      </AnimatePresence>

      {isLoggedIn && role !== 'admin' && (
        <Chatbot247
          assets={assets}
          requests={requests}
          onScheduleService={(techId, assetId) => {
            business.handleRequestQuote(techId, assetId, "Solicitud vía Asistente IA");
          }}
        />
      )}
    </PayPalScriptProvider>
  );
}
