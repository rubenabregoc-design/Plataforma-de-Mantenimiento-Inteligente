import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Zap, Package, MessageSquare, Calendar, MapPin, ChevronRight, Clock, FileText, Navigation, Wrench, BellRing, Gavel, ShieldAlert,
  Check, Trash2, CheckCircle2, AlertTriangle, Pencil, Star, DollarSign, Plus, Inbox, Layers, PieChart, ShieldCheck, Download, ListChecks
} from 'lucide-react';
import { doc, updateDoc, collection, addDoc, serverTimestamp, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import { toast } from 'react-hot-toast';
import { TechProfile, ChatMessage } from '../../types';
import TechWalletModule from '../../components/TechWalletModule';
import TechCredential from '../../components/TechCredential';
import SupportChatWidget from '../../components/SupportChatWidget';
import MantechIDModule from '../../components/MantechIDModule';
import SubscriptionModule from '../../components/SubscriptionModule';
import InventoryModule from '../../components/InventoryModule';
import CommunityModule from '../../components/CommunityModule';
import ConfirmationModal from '../../components/ConfirmationModal';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useUI } from '../../context/UIContext';
import { useBusinessLogic } from '../../hooks/useBusinessLogic';

export default function TechDashboard() {
  const { t, i18n } = useTranslation();
  const { user, loggedInName, userData, subscription, logout, daysUntilExpiration } = useAuth();
  const { requests, agenda, technicians, inventory, assets } = useData();
  const { tabs, setTab, openModal } = useUI();
  const business = useBusinessLogic();

  const techTab = tabs.tech;
  const techProfile = technicians.find(t => t.userId === user?.uid) || { id: 'new', name: loggedInName, category: 'mecanico' } as TechProfile;

  // Lógica de Chat Dinámica
  const [activeChatRequestId, setActiveChatRequestId] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  const requestsWithChat = requests.filter(r => r.techId === techProfile.id && ['accepted', 'executing', 'completed', 'rated', 'disputed'].includes(r.status));

  useEffect(() => {
    if (!activeChatRequestId && requestsWithChat.length > 0) {
      setActiveChatRequestId(requestsWithChat[0].id);
    }
  }, [requestsWithChat, activeChatRequestId]);

  useEffect(() => {
    if (!activeChatRequestId) {
      setChatMessages([]);
      return;
    }
    const q = query(
      collection(db, "messages"),
      where("requestId", "==", activeChatRequestId),
      orderBy("timestamp", "asc")
    );
    return onSnapshot(q, (snap) => {
      setChatMessages(snap.docs.map(d => ({ id: d.id, ...d.data(), timestamp: d.data().timestamp?.toDate?.()?.toISOString() || new Date().toISOString() })) as ChatMessage[]);
    });
  }, [activeChatRequestId]);

  const activeRequestForChat = requests.find(r => r.id === activeChatRequestId);

  // Lógica de Fidelidad
  const [isLoyaltyProcessing, setIsLoyaltyProcessing] = useState(false);
  const [loyaltyConfirm, setLoyaltyConfirm] = useState<{ name: string; cost: number } | null>(null);

  const executeRedeem = async (benefitName: string, cost: number) => {
    setIsLoyaltyProcessing(true);
    const success = await business.handleRedeemPoints(techProfile.id!, cost, benefitName);
    setIsLoyaltyProcessing(false);
    if (success) setLoyaltyConfirm(null);
  };

  const handleRedeemPoints = (benefitName: string, cost: number) => {
    const currentPoints = Number(techProfile.loyaltyPoints || 0);
    if (currentPoints < cost) {
      toast.error(`Puntos insuficientes. Requiere ${cost} pts.`);
      return;
    }
    setLoyaltyConfirm({ name: benefitName, cost });
  };

  const getStatusLabel = (s: string) => {
    const map: any = {
      pending: 'SOLICITADO',
      quoted: 'COTIZADO',
      accepted: 'PAGADO',
      executing: 'EN PROCESO',
      completed: 'FINALIZADO',
      rated: 'CALIFICADO',
      rejected: 'DENEGADO',
      disputed: 'IMPREVISTO',
      cancelled: 'CANCELADO',
      pending_verification: 'VERIFICANDO PAGO'
    };
    return map[s] || s.toUpperCase();
  };

  return (
    <div className="space-y-12 animate-fade-in">
      {/* Alerta de Facturación Próxima (Especialista) */}
      {daysUntilExpiration !== null && daysUntilExpiration <= 3 && daysUntilExpiration >= 0 && subscription.planId !== 'plan-basic' && (
        <div className="bg-rose-500/10 border border-rose-500/30 p-5 rounded-[2rem] flex items-center justify-between gap-6 shadow-2xl animate-pulse">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-rose-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-rose-600/20">
                 <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                 <h4 className="text-sm font-black text-white uppercase tracking-tight">Suscripción Técnica por Expirar</h4>
                 <p className="text-[9px] text-rose-500 font-black uppercase tracking-widest mt-1">
                    Su acceso a comisiones reducidas y beneficios PRO vence en <span className="text-white underline">{daysUntilExpiration === 0 ? 'unas horas' : `${daysUntilExpiration} días`}</span>.
                 </p>
              </div>
           </div>
           <button
             onClick={() => setTab('tech', 'subscriptions')}
             className="px-6 py-3 bg-rose-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:brightness-110 transition-all shadow-lg"
           >
              Renovar Acceso ➔
           </button>
        </div>
      )}

      {/* Barra de Estado de Disponibilidad */}
      <div className="bg-[#1c1d21] border border-white/5 p-5 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${techProfile.isOnline ? 'bg-[#52ffac] shadow-[0_0_20px_rgba(82,255,172,0.3)] text-black' : 'bg-[#121317] border border-white/10 text-[#474556]'}`}>
            {techProfile.isOnline ? <Zap className="w-6 h-6 animate-pulse" /> : <Zap className="w-6 h-6 opacity-20" />}
          </div>
          <div>
            <h4 className="text-sm font-black text-white uppercase tracking-tight">{t('connection_status', 'Estatus de Conexión')}</h4>
            <p className={`text-[10px] font-bold uppercase tracking-widest ${techProfile.isOnline ? 'text-[#52ffac]' : 'text-[#474556]'}`}>
              {techProfile.isOnline ? t('online_radar', 'En Radar') : t('invisible_mode', 'Fuera de línea')}
            </p>
          </div>
        </div>

        <button
          onClick={async () => {
            if (!techProfile.id) return;
            await updateDoc(doc(db, "technicians", techProfile.id), { isOnline: !techProfile.isOnline });
            toast.success(techProfile.isOnline ? "Modo Invisible Activado" : "¡En línea en el Radar!");
          }}
          className={`w-full md:w-auto px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-xl active:scale-95 ${techProfile.isOnline ? 'bg-rose-500/10 border border-rose-500/20 text-rose-500 hover:bg-rose-600 hover:text-white' : 'bg-[#52ffac] text-black shadow-[#52ffac]/20 hover:brightness-110'}`}
        >
          {techProfile.isOnline ? t('stop_position', 'Desactivar Posición') : t('start_position', 'Iniciar Posición')}
        </button>
      </div>

      {techTab === 'received' && (
        <div className="space-y-8">
           <header className="flex justify-between items-center">
              <h1 className="text-4xl font-black text-white uppercase tracking-tighter">{t('service_inbox', 'Bandeja de Servicios').split(' ')[0]} <span className="text-[#5d3cfe]">{t('service_inbox', 'Bandeja de Servicios').split(' ').slice(1).join(' ')}</span></h1>
              <button onClick={() => setTab('tech', 'subscriptions')} className="px-6 py-2 bg-white/5 border border-white/10 text-white rounded-xl text-[9px] font-black uppercase hover:bg-[#5d3cfe] transition-all">{t('upgrade_plan', 'Mejorar Plan')}</button>
           </header>
           <div className="grid grid-cols-1 gap-6">
             {requests.filter(r => r.status !== 'open_bidding' && r.techId === techProfile.id).length > 0 ? (
               requests.filter(r => r.status !== 'open_bidding' && r.techId === techProfile.id).map(req => (
                 <div key={req.id} className="bg-[#121317] border border-[#2a2b2f] p-5 sm:p-8 rounded-[1.5rem] sm:rounded-[2.5rem] shadow-2xl space-y-6 relative overflow-hidden group hover:border-[#5d3cfe]/30 transition-all">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
                      <div className="flex items-center gap-4">
                         <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                            {req.clientProfileImage ? (
                               <img src={req.clientProfileImage} className="w-full h-full object-cover" alt={req.clientName} />
                            ) : (
                               <span className="text-sm font-black text-white/40">{req.clientName[0]}</span>
                            )}
                         </div>
                         <div>
                            <h4 className="font-black text-white text-lg uppercase tracking-tight">{req.clientName}</h4>
                            <div className="flex items-center gap-2 mt-1">
                               <p className="text-[8px] font-bold text-[#5d3cfe] uppercase tracking-widest">{req.assetName}</p>
                               {req.assetPlate && <span className="text-[7px] text-[#474556] font-black opacity-60 uppercase">{req.assetPlate}</span>}
                               <span className="text-[7px] text-[#474556] font-mono opacity-40 uppercase">ID: {req.id.slice(-4).toUpperCase()}</span>
                            </div>
                         </div>
                      </div>
                      <div className="flex gap-2 w-full sm:w-auto">
                        {['accepted', 'executing', 'completed', 'rated', 'disputed'].includes(req.status) && (
                          <button
                            onClick={() => { setActiveChatRequestId(req.id); setTab('tech', 'chat'); }}
                            className="p-2.5 bg-[#5d3cfe]/10 border border-[#5d3cfe]/20 text-[#c7bfff] rounded-xl hover:bg-[#5d3cfe] hover:text-white transition-all flex-1 sm:flex-none flex justify-center"
                            title="Abrir Chat"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>
                        )}
                        <span className="flex-1 sm:flex-none text-center px-4 py-1.5 bg-[#1c1d21] border border-[#2a2b2f] rounded-full text-[9px] font-black text-[#c7bfff] uppercase tracking-widest shadow-inner">{getStatusLabel(req.status)}</span>
                      </div>
                    </div>

                    {req.priceAdjustment?.status === 'pending' && (
                       <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl flex items-center gap-3 animate-pulse">
                          <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                          <p className="text-[8px] font-black text-amber-500 uppercase tracking-widest">Esperando respuesta del cliente al ajuste de B/. {req.priceAdjustment.newPrice}</p>
                       </div>
                    )}

                    <div className="p-5 bg-[#0d0e12] rounded-2xl border border-[#2a2b2f] italic text-xs text-[#c8c4d9]">"{req.description}"</div>

                    {req.status === 'pending' && (
                      <div className="flex gap-4">
                        <button
                          onClick={() => {
                            openModal('reason', {
                              reasonTitle: "Denegar Servicio",
                              reasonPlaceholder: "Indique al cliente por qué no puede atender esta solicitud...",
                              onReasonConfirm: (reason) => business.handleRejectQuote(req.id, reason)
                            });
                          }}
                          className="flex-1 py-4 bg-white/5 border border-white/10 text-rose-500 rounded-2xl text-[10px] font-black uppercase tracking-[0.1em] hover:bg-rose-600/10 transition-all"
                        >
                          Denegar
                        </button>
                        <button
                          onClick={() => openModal('quote', { request: req })}
                          className="flex-[2] py-4 bg-[#5d3cfe] text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:scale-[1.01] active:scale-95 transition-all"
                        >
                          Aceptar y Cotizar ➔
                        </button>
                      </div>
                    )}

                    {req.status === 'quoted' && (
                      <div className="space-y-6 animate-fade-in">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                           <div className="bg-[#1c1d21] border border-white/5 p-4 rounded-2xl flex flex-col items-center justify-center text-center">
                              <Calendar className="w-4 h-4 text-[#5d3cfe] mb-2" />
                              <span className="text-[7px] font-black text-[#474556] uppercase">Fecha</span>
                              <p className="text-[10px] font-black text-white">{req.scheduledDate ? new Date(req.scheduledDate).toLocaleDateString() : 'N/A'}</p>
                           </div>
                           <div className="bg-[#1c1d21] border border-white/5 p-4 rounded-2xl flex flex-col items-center justify-center text-center">
                              <Clock className="w-4 h-4 text-[#5d3cfe] mb-2" />
                              <span className="text-[7px] font-black text-[#474556] uppercase">Arribo</span>
                              <p className="text-[10px] font-black text-white">
                                {req.scheduledTime ? (() => {
                                   const [h, m] = req.scheduledTime.split(':');
                                   const hh = parseInt(h);
                                   const suffix = hh >= 12 ? 'PM' : 'AM';
                                   return `${hh % 12 || 12}:${m} ${suffix}`;
                                })() : '09:00 AM'}
                              </p>
                           </div>
                           <div className="bg-[#1c1d21] border border-white/5 p-4 rounded-2xl flex flex-col items-center justify-center text-center">
                              <Navigation className="w-4 h-4 text-[#52ffac] mb-2" />
                              <span className="text-[7px] font-black text-[#474556] uppercase">ETA (Min)</span>
                              <p className="text-[10px] font-black text-[#52ffac]">{req.scheduledTravelTime || 30}</p>
                           </div>
                           <div className="bg-[#1c1d21] border border-white/5 p-4 rounded-2xl flex flex-col items-center justify-center text-center">
                              <DollarSign className="w-4 h-4 text-[#52ffac] mb-2" />
                              <span className="text-[7px] font-black text-[#474556] uppercase">Total</span>
                              <p className="text-[10px] font-black text-white">${req.price?.toFixed(2)}</p>
                           </div>
                        </div>

                        <div className="bg-[#0d0e12] p-6 rounded-3xl border border-[#2a2b2f] space-y-4">
                           <div className="flex items-center gap-3">
                              <div className="p-2 bg-[#5d3cfe]/10 rounded-lg text-[#5d3cfe]">
                                 <FileText className="w-4 h-4" />
                              </div>
                              <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Tu Propuesta Técnica</h4>
                           </div>
                           <p className="text-xs text-[#c8c4d9] italic leading-relaxed">
                              {req.techNotes || "Sin notas adicionales."}
                           </p>

                           {req.materials && req.materials.length > 0 && (
                             <div className="pt-4 border-t border-white/5">
                                <p className="text-[8px] font-black text-[#474556] uppercase tracking-[0.2em] mb-2">Materiales / Repuestos:</p>
                                <div className="flex flex-wrap gap-2">
                                   {req.materials.map((m, mIdx) => (
                                     <span key={mIdx} className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[9px] font-bold text-white/80 uppercase">
                                        {m.name} (x{m.quantity})
                                     </span>
                                   ))}
                                </div>
                             </div>
                           )}

                           {req.checklist && req.checklist.length > 0 && (
                             <div className="pt-4 border-t border-white/5">
                                <p className="text-[8px] font-black text-[#474556] uppercase tracking-[0.2em] mb-2">Plan de Trabajo:</p>
                                <div className="space-y-1.5">
                                   {req.checklist.map((t, tIdx) => (
                                     <div key={tIdx} className="flex items-center gap-2 text-[9px] text-white/60 font-bold uppercase">
                                        <CheckCircle2 className="w-3 h-3 text-[#5d3cfe]" />
                                        <span>{t.description}</span>
                                     </div>
                                   ))}
                                </div>
                             </div>
                           )}
                        </div>

                        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center gap-3">
                           <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
                           <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest">Esperando Confirmación de Pago del Cliente</p>
                        </div>
                      </div>
                    )}

                    {req.status === 'accepted' && (
                      <div className="space-y-4 animate-fade-in">
                         <div className="bg-[#52ffac]/5 border border-[#52ffac]/20 p-6 rounded-3xl flex items-center justify-between">
                            <div className="flex items-center gap-4">
                               <div className={`p-3 rounded-2xl ${req.technicianDispatchedAt ? 'bg-[#5d3cfe] text-white animate-pulse' : 'bg-[#52ffac]/10 text-[#52ffac]'}`}>
                                  {req.technicianDispatchedAt ? <Navigation className="w-6 h-6" /> : <CheckCircle2 className="w-6 h-6" />}
                               </div>
                               <div>
                                  <h4 className="text-sm font-black text-white uppercase tracking-tight">
                                    {req.technicianDispatchedAt ? 'En Ruta al Sitio' : 'Servicio Pagado'}
                                  </h4>
                                  <p className="text-[9px] text-[#52ffac] font-black uppercase tracking-widest">
                                    {req.technicianDispatchedAt ? 'Posición GPS Compartida' : 'Protocolo de Inicio Activado'}
                                  </p>
                               </div>
                            </div>
                         </div>

                         {!req.technicianDispatchedAt ? (
                           <button
                             onClick={() => business.handleDispatchTechnician(req.id)}
                             className="w-full py-5 bg-[#5d3cfe] text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-[#5d3cfe]/20 hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-3"
                           >
                              <Navigation className="w-4 h-4" /> Iniciar Viaje al Sitio
                           </button>
                         ) : (
                           <button
                             onClick={async () => {
                               await updateDoc(doc(db, "requests", req.id), { status: 'executing', visitStartedAt: new Date().toISOString() });
                               toast.success("¡Trabajo iniciado en sitio!");
                             }}
                             className="w-full py-5 bg-[#52ffac] text-black rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-[#52ffac]/20 hover:scale-[1.01] active:scale-95 transition-all"
                           >
                              Confirmar Arribo & Iniciar Labor ➔
                           </button>
                         )}
                      </div>
                    )}

                    {req.status === 'executing' && (
                      <div className="space-y-8 animate-fade-in">
                         <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                            <button
                              onClick={() => openModal('material', { request: req })}
                              className="p-4 bg-[#1c1d21] border border-[#2a2b2f] text-white rounded-2xl text-[9px] font-black uppercase flex flex-col items-center gap-2 hover:bg-[#5d3cfe] transition-all group"
                            >
                               <Package className="w-5 h-5 text-[#5d3cfe] group-hover:text-white" />
                               Cargar Material
                            </button>
                            <button
                              onClick={() => openModal('unforeseen', { request: req })}
                              className="p-4 bg-amber-500/5 border border-amber-500/20 text-amber-500 rounded-2xl text-[9px] font-black uppercase flex flex-col items-center gap-2 hover:bg-amber-500 hover:text-black transition-all"
                            >
                               <AlertTriangle className="w-5 h-5" />
                               Re-Cotización
                            </button>
                            <button
                              onClick={() => openModal('priceAdjustment', { request: req })}
                              className="p-4 bg-[#5d3cfe]/5 border border-[#5d3cfe]/20 text-[#c7bfff] rounded-2xl text-[9px] font-black uppercase flex flex-col items-center gap-2 hover:bg-[#5d3cfe] hover:text-white transition-all"
                            >
                               <DollarSign className="w-5 h-5" />
                               Ajuste Precio
                            </button>
                            <button
                              onClick={() => {
                                if (req.isPaused) {
                                   business.handleTogglePause(req.id, true);
                                } else {
                                  openModal('confirmation', {
                                    confTitle: "Pausar Jornada",
                                    confMessage: "¿Deseas registrar una pausa oficial? Este protocolo notificará al cliente que la sesión técnica ha concluido por hoy. El trabajo se reanudará cuando vuelvas a marcar 'Reanudar'.",
                                    confType: 'info',
                                    onConfConfirm: () => business.handleTogglePause(req.id, false)
                                  });
                                }
                              }}
                              className={`p-4 border rounded-2xl text-[9px] font-black uppercase flex flex-col items-center gap-2 transition-all ${req.isPaused ? 'bg-[#52ffac]/10 border-[#52ffac]/30 text-[#52ffac] animate-pulse hover:bg-[#52ffac] hover:text-black' : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'}`}
                            >
                               {req.isPaused ? <Zap className="w-5 h-5 fill-current" /> : <Clock className="w-5 h-5" />}
                               {req.isPaused ? 'Reanudar Labores' : 'Pausar (Largo)'}
                            </button>
                            <button
                              onClick={() => {
                                const allTasksDone = req.checklist?.every(t => t.isCompleted);
                                if (!allTasksDone) {
                                  toast.error("Debe completar todos los puntos de la Hoja de Ruta antes de finalizar.");
                                  return;
                                }
                                openModal('confirmation', {
                                  confTitle: "Finalizar Servicio",
                                  confMessage: "¿Ha concluido todas las labores técnicas? Esto solicitará la firma de conformidad al cliente y liberará los fondos en custodia.",
                                  confType: 'success',
                                  onConfConfirm: async () => {
                                    await updateDoc(doc(db, "requests", req.id), { status: 'completed' });
                                    await addDoc(collection(db, "messages"), {
                                      requestId: req.id, sender: 'tech',
                                      text: "🏁 SERVICIO CONCLUIDO: El especialista ha certificado la finalización de los hitos técnicos. Favor proceder con la inspección final y firma de conformidad.",
                                      timestamp: serverTimestamp()
                                    });
                                    toast.success("Hitos técnicos completados. Solicite la firma del cliente.");
                                  }
                                });
                              }}
                              className="p-4 bg-[#52ffac]/10 border border-[#52ffac]/20 text-[#52ffac] rounded-2xl text-[9px] font-black uppercase flex flex-col items-center gap-2 hover:bg-[#52ffac] hover:text-black transition-all"
                            >
                               <CheckCircle2 className="w-5 h-5" />
                               Finalizar Trabajo
                            </button>
                         </div>

                         <div className="bg-[#0d0e12] p-6 rounded-3xl border border-[#2a2b2f] space-y-4">
                            <div className="flex items-center justify-between mb-2">
                               <h4 className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                                  <ListChecks className="w-4 h-4 text-[#5d3cfe]" /> Hoja de Ruta Técnica
                               </h4>
                               <span className="text-[8px] font-black text-[#474556] uppercase">Autoguardado en Red</span>
                            </div>

                            <div className="space-y-3">
                               {req.checklist?.map((task) => (
                                 <div
                                   key={task.id}
                                   onClick={() => business.handleToggleTask(req.id, task.id)}
                                   className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${task.isCompleted ? 'bg-[#52ffac]/5 border-[#52ffac]/20' : 'bg-white/5 border-white/5 opacity-60'}`}
                                 >
                                    <span className={`text-[10px] font-black uppercase ${task.isCompleted ? 'text-[#52ffac]' : 'text-white'}`}>{task.description}</span>
                                    {task.isCompleted ? <CheckCircle2 className="w-4 h-4 text-[#52ffac]" /> : <div className="w-4 h-4 rounded-full border border-white/20" />}
                                 </div>
                               ))}
                               {(!req.checklist || req.checklist.length === 0) && (
                                 <p className="text-center text-[8px] text-[#474556] uppercase italic py-4">Sin plan de trabajo definido</p>
                               )}
                            </div>
                         </div>
                         <p className="text-[7px] text-[#474556] font-black uppercase italic text-center">Se requiere la firma del cliente tras finalizar las tareas.</p>
                      </div>
                    )}
                 </div>
               ))
             ) : (
               <div className="py-20 bg-[#121317] border border-dashed border-white/5 rounded-[3rem] text-center space-y-6">
                  <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto opacity-20">
                     <Inbox className="w-10 h-10 text-white" />
                  </div>
                  <div className="space-y-2">
                     <h3 className="text-sm font-black text-white uppercase tracking-widest">{t('empty_inbox_title', 'Bandeja Vacía')}</h3>
                     <p className="text-[10px] text-[#474556] font-black uppercase tracking-[0.3em] max-w-xs mx-auto">{t('empty_inbox_desc', 'No has recibido solicitudes directas aún.')}</p>
                  </div>
               </div>
             )}
           </div>
        </div>
      )}

      {techTab === 'bidding_market' && (
        <div className="space-y-8">
           <header>
              <h1 className="text-4xl font-black text-white uppercase tracking-tighter italic">{t('job_market_title', 'Bolsa de Trabajo').split(' ')[0]} <span className="text-[#52ffac]">{t('job_market_title', 'Bolsa de Trabajo').split(' ').slice(1).join(' ')}</span></h1>
              <p className="text-[10px] font-black text-[#474556] uppercase tracking-[0.4em] mt-2">{t('job_market_subtitle', 'Oportunidades en Subasta Abierta')}</p>
           </header>

           <div className="py-32 bg-[#121317] border border-dashed border-[#52ffac]/10 rounded-[4rem] text-center space-y-8 relative overflow-hidden">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[#52ffac]/5 rounded-full blur-[120px]"></div>
              <div className="relative z-10 space-y-6">
                 <div className="w-24 h-24 bg-[#52ffac]/10 rounded-[2.5rem] flex items-center justify-center mx-auto text-[#52ffac] shadow-[0_0_50px_rgba(82,255,172,0.1)]">
                    <Layers className="w-10 h-10" />
                 </div>
                 <div className="space-y-3">
                    <h3 className="text-xl font-black text-white uppercase tracking-widest italic">{t('market_calm_title', 'Mercado en Calma')}</h3>
                    <p className="text-[10px] text-[#c8c4d9] font-medium uppercase tracking-[0.3em] max-w-md mx-auto leading-relaxed">
                       {t('market_calm_desc', 'Actualmente no hay subastas activas en tu zona.')}
                    </p>
                 </div>
                 <div className="flex justify-center gap-4">
                    <div className="px-5 py-2 bg-black/40 border border-white/5 rounded-full flex items-center gap-2">
                       <span className="w-1.5 h-1.5 rounded-full bg-[#52ffac] animate-pulse"></span>
                       <span className="text-[8px] font-black text-[#52ffac] uppercase tracking-widest">{t('scanning_network', 'Escaneando Red...')}</span>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}

      {techTab === 'agenda' && (
        <div className="space-y-8">
           <header>
              <h1 className="text-4xl font-black text-white uppercase tracking-tighter italic italic">{t('agenda', 'Agenda')}</h1>
           </header>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-6">
                 <div className="p-20 bg-[#121317] border border-white/5 rounded-[3rem] text-center space-y-6">
                    <Calendar className="w-12 h-12 text-[#474556] mx-auto opacity-20" />
                    <p className="text-[10px] font-black text-[#474556] uppercase tracking-[0.3em]">{t('no_events', 'No hay eventos confirmados para esta semana')}</p>
                 </div>
              </div>
              <div className="bg-[#1c1d21] border border-white/5 rounded-[2.5rem] p-8 space-y-6">
                 <h4 className="text-[10px] font-black text-[#c7bfff] uppercase tracking-[0.3em]">{t('weekly_summary', 'Resumen Semanal')}</h4>
                 <div className="space-y-4">
                    <div className="flex justify-between items-center text-xs font-bold text-white/40">
                       <span>{t('pending_services', 'Servicios Pendientes')}</span>
                       <span>0</span>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}

      {techTab === 'wallet' && (
        <TechWalletModule
          wallet={techProfile.wallet || { balance: 0, pendingBalance: 0, transactions: [] }}
          techId={techProfile.id!}
          onWithdraw={() => {}}
          plan={techProfile.plan || 'basic'}
        />
      )}

      {techTab === 'mantech_id' && <TechCredential tech={techProfile} />}

      {techTab === 'profile' && (
        <div className="max-w-2xl mx-auto space-y-10">
          <header className="flex justify-between items-center">
            <h1 className="text-4xl font-black text-white uppercase tracking-tighter">Mi <span className="text-[#5d3cfe]">Perfil</span></h1>
            <button
              onClick={() => openModal('editTech', { tech: techProfile })}
              className="px-6 py-3 bg-white/5 border border-white/10 text-white rounded-2xl text-[10px] font-black uppercase hover:bg-white/10 transition-all flex items-center gap-2"
            >
              <Pencil className="w-4 h-4" /> Editar Perfil
            </button>
          </header>
          <div className="max-w-[300px] mx-auto scale-95 origin-top">
            <TechCredential tech={techProfile} />
          </div>
        </div>
      )}

      {techTab === 'subscriptions' && (
        <SubscriptionModule
          subscription={subscription}
          onUpgrade={(planId) => {
            if (planId === 'plan-basic') {
              business.handleApproveSubscription(user!.uid, planId);
            } else {
              openModal('payment', { plan: planId });
            }
          }}
          onNavigate={(t) => setTab('tech', t)}
          role="tech"
        />
      )}

      {techTab === 'community' && <CommunityModule />}

      {techTab === 'settings' && (
        <div className="max-w-3xl mx-auto space-y-12 pb-20 animate-fade-in text-center">
           <header className="space-y-4">
            <h2 className="text-4xl font-black text-white uppercase tracking-tighter">{t('settings_title', 'Ajustes de Perfil')}</h2>
            <p className="text-[10px] font-black text-[#474556] uppercase tracking-[0.3em]">{t('settings_desc', 'Validación de Credenciales y Sello Oficial')}</p>
         </header>

         <div className="bg-[#121317] border border-white/5 p-10 rounded-[3rem] flex flex-col items-center gap-10 shadow-2xl">
            {/* HERRAMIENTAS DE DIAGNÓSTICO DE SISTEMA */}
            <div className="w-full space-y-6">
               <div className="flex items-center gap-3 justify-center">
                  <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-[#5d3cfe]"><ShieldCheck className="w-4 h-4" /></div>
                  <h4 className="text-sm font-black text-white uppercase tracking-widest">Diagnóstico de Dispositivo</h4>
               </div>
               <div className="p-6 bg-black/40 rounded-3xl border border-white/5 space-y-4">
                  <p className="text-[10px] text-[#474556] font-bold uppercase tracking-widest leading-relaxed">
                     Verifique la conectividad de su dispositivo con la red satelital de MantechPro y la recepción de ráfagas push.
                  </p>
                  <button
                    onClick={() => business.handleSendTestPush()}
                    className="w-full py-4 bg-[#5d3cfe] text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-[#5d3cfe]/10 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-3"
                  >
                     <BellRing className="w-4 h-4" /> Enviar Señal de Prueba Push
                  </button>
               </div>
            </div>

            <div className="w-full h-px bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>

            <div className="space-y-6 w-full text-center">
               <div className="space-y-2">
                  <h4 className="text-xs font-black text-white uppercase tracking-widest">{t('language_preference', 'Preferencia de Idioma')}</h4>
                  <p className="text-[9px] text-[#474556] font-bold uppercase tracking-widest">{t('language_desc', 'Seleccione el idioma de la interfaz del ecosistema.')}</p>
               </div>
               <div className="flex bg-[#1c1d21] p-1.5 rounded-2xl border border-[#2a2b2f] w-full max-w-xs mx-auto">
                 <button
                   onClick={() => i18n.changeLanguage('es')}
                   className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${i18n.language.startsWith('es') ? 'bg-[#5d3cfe] text-white shadow-lg' : 'text-[#474556] hover:text-[#c8c4d9]'}`}
                 >
                   Español (PA)
                 </button>
                 <button
                   onClick={() => i18n.changeLanguage('en')}
                   className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${i18n.language.startsWith('en') ? 'bg-[#5d3cfe] text-white shadow-lg' : 'text-[#474556] hover:text-[#c8c4d9]'}`}
                 >
                   English (US)
                 </button>
              </div>
           </div>

           <MantechIDModule
              mantechId={techProfile.mantechId || { status: 'unverified', idNumber: '' }}
              onUpload={(type, file) => business.handleUploadMantechDocument('tech', type, file)}
              role="tech"
              userName={techProfile.name}
              cedula={userData?.cedula}
              plan={techProfile.plan}
           />
           <button onClick={logout} className="px-12 py-4 border border-rose-500/30 text-rose-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all shadow-xl mt-12">Cerrar Sesión Segura</button>
        </div>
        </div>
      )}

      {techTab === 'chat' && (
        <div className="h-[600px] flex flex-col md:flex-row gap-6 animate-fade-in-up">
           <div className="w-full md:w-80 bg-[#121317] border border-white/5 rounded-[2.5rem] flex flex-col overflow-hidden shrink-0 shadow-2xl">
              <div className="p-6 border-b border-white/5 bg-white/[0.02]">
                 <h3 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Bandeja de Mensajes</h3>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                 {requestsWithChat.map(r => (
                    <button
                      key={r.id}
                      onClick={() => setActiveChatRequestId(r.id)}
                      className={`w-full p-5 rounded-[1.5rem] text-left transition-all border group relative overflow-hidden ${activeChatRequestId === r.id ? 'bg-[#5d3cfe] border-[#5d3cfe] text-white shadow-xl' : 'bg-white/5 border-white/5 text-[#c8c4d9] hover:bg-white/10 hover:border-white/10'}`}
                    >
                       <div className="flex justify-between items-center mb-1">
                          <p className={`text-[9px] font-black uppercase tracking-widest ${activeChatRequestId === r.id ? 'text-white/70' : 'text-[#5d3cfe]'}`}>{r.assetName}</p>
                          <ChevronRight className={`w-3 h-3 transition-transform ${activeChatRequestId === r.id ? 'translate-x-1' : 'opacity-20'}`} />
                       </div>
                       <p className="text-sm font-black truncate uppercase tracking-tight">{r.clientName}</p>
                    </button>
                 ))}
              </div>
           </div>

           <div className="flex-1 min-w-0 h-[500px] md:h-full">
              <SupportChatWidget
                role="tech"
                request={activeRequestForChat || null}
                messages={chatMessages}
                onSendMessage={(txt, img) => {
                  if (!activeChatRequestId) return;
                  addDoc(collection(db, "messages"), {
                    requestId: activeChatRequestId,
                    sender: 'tech',
                    text: txt,
                    image: img || null,
                    timestamp: serverTimestamp()
                  });
                }}
                onStartVideoCall={(room, voice) => openModal('videoCall', { videoRoom: room, isVoiceOnly: voice })}
              />
           </div>
        </div>
      )}

      {techTab === 'loyalty' && (
         <div className="max-w-5xl mx-auto space-y-12 animate-fade-in pb-20">
            <div className="bg-gradient-to-br from-[#1c1d21] to-[#0d0e12] border border-white/5 rounded-[3rem] p-12 relative overflow-hidden shadow-2xl">
               <div className="absolute top-0 right-0 p-12 opacity-10"><Star className="w-48 h-48 text-amber-500" /></div>
               <div className="relative z-10 space-y-6">
                  <span className="px-4 py-1.5 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-full text-[9px] font-black uppercase tracking-widest">Estatus de Fidelidad</span>
                  <h1 className="text-6xl font-black text-white tracking-tighter uppercase leading-none">Club <span className="text-amber-500">Mantech</span></h1>
                  <div className="flex items-center gap-10 pt-4">
                     <div>
                        <p className="text-[10px] font-black text-[#474556] uppercase tracking-widest mb-1">Puntos Acumulados</p>
                        <h2 className="text-4xl font-black text-white italic">{Number(techProfile.loyaltyPoints || 0).toLocaleString()} <span className="text-xs text-amber-500 not-italic">pts</span></h2>
                     </div>
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               {[
                 { t: "Transferencia Express", d: "Liquida tu saldo en menos de 4 horas.", i: Zap, color: "text-amber-500", cost: 500 },
                 { t: "Módulo Inventario Pro", d: "Control avanzado de herramientas.", i: Wrench, color: "text-emerald-500", cost: 800 }
               ].map((b, i) => {
                  const canAfford = Number(techProfile.loyaltyPoints || 0) >= b.cost;
                  return (
                    <div key={i} className="bg-[#121317] border border-white/5 p-8 rounded-[2.5rem] space-y-4 hover:border-white/20 transition-all flex flex-col justify-between shadow-xl">
                       <div className="space-y-4">
                          <div className={`w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center ${b.color} shadow-xl`}>
                             <b.i className="w-6 h-6" />
                          </div>
                          <h4 className="text-sm font-black text-white uppercase tracking-tight">{b.t}</h4>
                          <p className="text-[10px] text-[#c8c4d9] font-medium leading-relaxed opacity-60">{b.d}</p>
                       </div>
                       <button
                         onClick={() => handleRedeemPoints(b.t, b.cost)}
                         disabled={!canAfford || isLoyaltyProcessing}
                         className={`w-full mt-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${canAfford ? 'bg-white/5 text-white hover:bg-[#5d3cfe]' : 'bg-[#0d0e12] text-[#474556] cursor-not-allowed opacity-50'}`}
                       >
                          {isLoyaltyProcessing ? 'Procesando...' : canAfford ? 'Canjear' : 'Puntos Insuficientes'}
                       </button>
                    </div>
                  );
               })}
            </div>
         </div>
      )}

      {techTab === 'inventory' && (
         <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-20">
            {techProfile.unlockedModules?.includes('inventory_pro') ? (
               <InventoryModule items={inventory} assets={assets} onUpdateQuantity={() => {}} onAddItem={() => {}} onDeleteItem={() => {}} />
            ) : (
               <div className="bg-[#121317] border border-white/5 rounded-[3rem] p-16 text-center space-y-8 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-20 opacity-5 -rotate-12"><Package className="w-64 h-64" /></div>
                  <ShieldAlert className="w-12 h-12 mx-auto text-[#474556]" />
                  <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Módulo <span className="text-[#5d3cfe]">Bloqueado</span></h2>
                  <button onClick={() => setTab('tech', 'loyalty')} className="px-10 py-4 bg-[#5d3cfe] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest">Desbloquear en Club Fidelidad</button>
               </div>
            )}
         </div>
      )}

      <ConfirmationModal
        isOpen={!!loyaltyConfirm}
        onClose={() => setLoyaltyConfirm(null)}
        onConfirm={() => loyaltyConfirm && executeRedeem(loyaltyConfirm.name, loyaltyConfirm.cost)}
        title="Confirmar Canje"
        message={`¿Deseas canjear ${loyaltyConfirm?.cost} puntos?`}
        confirmText="Confirmar Canje"
        type="success"
      />
    </div>
  );
}
