import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Zap, Package, MessageSquare, QrCode, Calendar, MapPin, ChevronRight, Clock, FileText, Navigation, Wrench, BellRing, Gavel, ShieldAlert,
  Video, Check, Trash2, CheckCircle2, AlertTriangle, Pencil, Star, DollarSign, Plus, Store, Inbox, Layers, PieChart, ShieldCheck, TrendingUp, Download
} from 'lucide-react';
import { doc, updateDoc, collection, addDoc, serverTimestamp, query, where, orderBy, onSnapshot, arrayUnion } from 'firebase/firestore';
import { db } from '../../firebase';
import { toast } from 'react-hot-toast';
import { TechProfile, JobRequest, AgendaEvent, MaterialItem, ChatMessage, UserSubscription } from '../../types';
import TechWalletModule from '../../components/TechWalletModule';
import TechCredential from '../../components/TechCredential';
import SupportChatWidget from '../../components/SupportChatWidget';
import MantechIDModule from '../../components/MantechIDModule';
import SubscriptionModule from '../../components/SubscriptionModule';
import InventoryModule from '../../components/InventoryModule';
import ConfirmationModal from '../../components/ConfirmationModal';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useUI } from '../../context/UIContext';

export default function TechDashboard() {
  const { t, i18n } = useTranslation();
  const { user, loggedInName, userData, subscription, logout } = useAuth();
  const { requests, agenda, technicians, inventory, assets } = useData();
  const { tabs, setTab, openModal, activeData } = useUI();

  const techTab = tabs.tech;
  const techProfile = technicians.find(t => t.userId === user?.uid) || { id: 'new', name: loggedInName, category: 'mecanico' } as TechProfile;

  // Lógica de Chat Dinámica
  const [activeChatRequestId, setActiveChatRequestId] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  const requestsWithChat = requests.filter(r => r.techId === techProfile.id && ['quoted', 'accepted', 'executing', 'completed'].includes(r.status));

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
    const currentPoints = Number(techProfile.loyaltyPoints || 0);
    setIsLoyaltyProcessing(true);
    try {
      const updates: any = { loyaltyPoints: currentPoints - cost };
      if (benefitName === 'Módulo Inventario Pro') updates.unlockedModules = arrayUnion('inventory_pro');
      await updateDoc(doc(db, "technicians", techProfile.id), updates);
      toast.success(`¡Canje Exitoso! "${benefitName}" activado.`);
    } catch (e) {
      console.error(e);
      toast.error("Error al procesar el canje.");
    } finally {
      setIsLoyaltyProcessing(false);
      setLoyaltyConfirm(null);
    }
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
    const map: any = { pending: 'SOLICITADO', quoted: 'COTIZADO', accepted: 'PAGADO', executing: 'EN PROCESO', completed: 'FINALIZADO', rated: 'CALIFICADO', rejected: 'DENEGADO', disputed: 'IMPREVISTO', cancelled: 'CANCELADO' };
    return map[s] || s.toUpperCase();
  };

  return (
    <div className="space-y-12 animate-fade-in">
      {/* Barra de Estado de Disponibilidad */}
      <div className="bg-[#1c1d21] border border-white/5 p-6 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${techProfile.isOnline ? 'bg-[#52ffac] shadow-[0_0_20px_rgba(82,255,172,0.3)] text-black' : 'bg-[#121317] border border-white/10 text-[#474556]'}`}>
            {techProfile.isOnline ? <Zap className="w-6 h-6 animate-pulse" /> : <Zap className="w-6 h-6 opacity-20" />}
          </div>
          <div>
            <h4 className="text-sm font-black text-white uppercase tracking-tight">{t('connection_status', 'Estatus de Conexión')}</h4>
            <p className={`text-[10px] font-bold uppercase tracking-widest ${techProfile.isOnline ? 'text-[#52ffac]' : 'text-[#474556]'}`}>
              {techProfile.isOnline ? t('online_radar', 'Transmitiendo ubicación en Radar') : t('invisible_mode', 'Modo Invisible (Fuera de línea)')}
            </p>
          </div>
        </div>

        <button
          onClick={async () => {
            if (!techProfile.id) return;
            await updateDoc(doc(db, "technicians", techProfile.id), { isOnline: !techProfile.isOnline });
            toast.success(techProfile.isOnline ? "Modo Invisible Activado" : "¡En línea en el Radar!");
          }}
          className={`px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-xl active:scale-95 ${techProfile.isOnline ? 'bg-rose-500/10 border border-rose-500/20 text-rose-500 hover:bg-rose-500 hover:text-white' : 'bg-[#52ffac] text-black shadow-[#52ffac]/20 hover:brightness-110'}`}
        >
          {techProfile.isOnline ? t('stop_position', 'Desactivar Posición') : t('start_position', 'Iniciar Posición de Servicio')}
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
                 <div key={req.id} className="bg-[#121317] border border-[#2a2b2f] p-8 rounded-[2.5rem] shadow-2xl space-y-6 relative overflow-hidden group hover:border-[#5d3cfe]/30 transition-all">
                    <div className="flex justify-between items-center relative z-10">
                      <h4 className="font-black text-white text-lg uppercase tracking-tight">{req.clientName}</h4>
                      <div className="flex gap-2">
                        <button
                          onClick={() => { setActiveChatRequestId(req.id); setTab('tech', 'chat'); }}
                          className="p-2 bg-[#5d3cfe]/10 border border-[#5d3cfe]/20 text-[#c7bfff] rounded-xl hover:bg-[#5d3cfe] hover:text-white transition-all"
                          title="Abrir Chat"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>
                        <span className="px-4 py-1.5 bg-[#1c1d21] border border-[#2a2b2f] rounded-full text-[9px] font-black text-[#c7bfff] uppercase tracking-widest shadow-inner">{getStatusLabel(req.status)}</span>
                      </div>
                    </div>
                    <div className="p-5 bg-[#0d0e12] rounded-2xl border border-[#2a2b2f] italic text-xs text-[#c8c4d9]">"{req.description}"</div>

                    {req.status === 'pending' && (
                      <button onClick={() => openModal('payment', { request: req })} className="w-full py-4 bg-[#5d3cfe] text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl">Enviar Cotización ➔</button>
                    )}

                    {req.status === 'executing' && (
                      <div className="flex gap-3">
                         <button onClick={() => openModal('material', { request: req })} className="flex-1 py-4 bg-[#1c1d21] border border-[#2a2b2f] text-white rounded-xl text-[10px] font-black uppercase">Cargar Material</button>
                         <button onClick={() => openModal('unforeseen', { request: req })} className="flex-1 py-4 bg-amber-500/10 border border-amber-500/30 text-amber-500 rounded-xl text-[10px] font-black uppercase">Imprevisto</button>
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
                     <p className="text-[10px] text-[#474556] font-black uppercase tracking-[0.3em] max-w-xs mx-auto">{t('empty_inbox_desc', 'No has recibido solicitudes directas aún. Activa tu radar para ser visible a los clientes.')}</p>
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
                       {t('market_calm_desc', 'Actualmente no hay subastas activas en tu zona. MantechPro te notificará vía Sat-Link cuando una nueva unidad requiera asistencia inmediata.')}
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
              <h1 className="text-4xl font-black text-white uppercase tracking-tighter italic italic">{t('my_profile', 'Mi Perfil').split(' ')[0]} <span className="text-[#c7bfff]">{t('agenda', 'Agenda')}</span></h1>
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
                    <div className="h-px bg-white/5"></div>
                    <div className="flex justify-between items-center text-xs font-bold text-white/40">
                       <span>{t('est_hours', 'Horas Estimadas')}</span>
                       <span>0h</span>
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
        <SubscriptionModule subscription={subscription} onUpgrade={(planId) => openModal('payment', { plan: planId })} role="tech" />
      )}

      {techTab === 'settings' && (
        <div className="max-w-3xl mx-auto space-y-12 pb-20 animate-fade-in text-center">
           <header className="space-y-4">
            <h2 className="text-4xl font-black text-white uppercase tracking-tighter">{t('settings_title', 'Ajustes de Perfil')}</h2>
            <p className="text-[10px] font-black text-[#474556] uppercase tracking-[0.3em]">{t('settings_desc', 'Validación de Credenciales y Sello Oficial')}</p>
         </header>

         {/* Selector de Idioma en Ajustes */}
         <div className="bg-[#121317] border border-white/5 p-8 rounded-[2.5rem] flex flex-col items-center gap-6 shadow-2xl">
            <div className="space-y-2">
               <h4 className="text-xs font-black text-white uppercase tracking-widest">{t('language_preference', 'Preferencia de Idioma')}</h4>
               <p className="text-[9px] text-[#474556] font-bold uppercase tracking-widest">{t('language_desc', 'Seleccione el idioma de la interfaz del ecosistema.')}</p>
            </div>
              <div className="flex bg-[#1c1d21] p-1.5 rounded-2xl border border-[#2a2b2f] w-full max-w-xs">
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
              onUpload={() => {}}
              role="tech"
              userName={techProfile.name}
              cedula={userData?.cedula}
              plan={techProfile.plan}
           />
           <button onClick={logout} className="px-12 py-4 border border-rose-500/30 text-rose-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all shadow-xl mt-12">Cerrar Sesión Segura</button>
        </div>
      )}

      {techTab === 'chat' && (
        <div className="h-[600px] flex flex-col md:flex-row gap-6 animate-fade-in-up">
           {/* Lista de Chats Activos */}
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
                       {activeChatRequestId !== r.id && (
                          <div className="absolute top-0 left-0 w-1 h-full bg-[#5d3cfe] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                       )}
                       <div className="flex justify-between items-center mb-1">
                          <p className={`text-[9px] font-black uppercase tracking-widest ${activeChatRequestId === r.id ? 'text-white/70' : 'text-[#5d3cfe]'}`}>{r.assetName}</p>
                          <ChevronRight className={`w-3 h-3 transition-transform ${activeChatRequestId === r.id ? 'translate-x-1' : 'opacity-20'}`} />
                       </div>
                       <p className="text-sm font-black truncate uppercase tracking-tight">{r.clientName}</p>
                    </button>
                 ))}
                 {requestsWithChat.length === 0 && (
                    <div className="py-20 text-center space-y-4 opacity-20">
                       <MessageSquare className="w-8 h-8 mx-auto" />
                       <p className="text-[8px] font-black uppercase tracking-[0.3em]">Sin hilos activos</p>
                    </div>
                 )}
              </div>
           </div>

           {/* Ventana de Mensajería */}
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
                     <div className="h-12 w-px bg-white/10"></div>
                     <div>
                        <p className="text-[10px] font-black text-[#474556] uppercase tracking-widest mb-1">Nivel del Club</p>
                        <h2 className="text-4xl font-black text-[#5d3cfe] italic">{techProfile.plan === 'enterprise' ? 'VIP PLATINUM' : 'GOLD'}</h2>
                     </div>
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               {[
                 { t: "Transferencia Express", d: "Liquida tu saldo disponible en menos de 4 horas (Válido 1 vez).", i: Zap, color: "text-amber-500", cost: 500 },
                 { t: "Perdón Administrativo", d: "Elimina una incidencia leve detectada por el motor de integridad Centinela.", i: ShieldCheck, color: "text-[#52ffac]", cost: 1500 },
                 { t: "Aura VIP en Radar", d: "Tu nodo brillará con un resplandor especial en el mapa por 72 horas.", i: Navigation, color: "text-[#5d3cfe]", cost: 1000 },
                 { t: "Certificación Master", d: "Genera un diploma oficial de excelencia técnica firmado por la Gerencia.", i: FileText, color: "text-indigo-400", cost: 1200 },
                 { t: "Módulo Inventario Pro", d: "Desbloquea herramientas avanzadas de control de herramientas y repuestos.", i: Wrench, color: "text-emerald-500", cost: 800 },
                 { t: "Push de Disponibilidad", d: "Notifica proactivamente a clientes VIP cercanos sobre tu posición.", i: BellRing, color: "text-rose-500", cost: 2000 },
                 { t: "Soporte Legal V4", d: "Consultoría básica para contratos de mantenimiento B2B.", i: Gavel, color: "text-zinc-400", cost: 3000 },
                 { t: "Kit Stickers QR", d: "Pack de 20 stickers físicos con QR para tus activos reparados.", i: Package, color: "text-blue-400", cost: 600 }
               ].map((b, i) => {
                  const canAfford = Number(techProfile.loyaltyPoints || 0) >= b.cost;
                  return (
                    <div key={i} className="bg-[#121317] border border-white/5 p-8 rounded-[2.5rem] space-y-4 hover:border-white/20 transition-all group flex flex-col justify-between h-full shadow-xl">
                       <div className="space-y-4">
                          <div className={`w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center ${b.color} group-hover:scale-110 transition-transform shadow-xl`}>
                             <b.i className="w-6 h-6" />
                          </div>
                          <div className="flex justify-between items-start">
                             <h4 className="text-sm font-black text-white uppercase tracking-tight">{b.t}</h4>
                             <span className="text-[9px] font-black text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">{b.cost} pts</span>
                          </div>
                          <p className="text-[10px] text-[#c8c4d9] font-medium leading-relaxed opacity-60">{b.d}</p>
                       </div>

                       <button
                         onClick={() => handleRedeemPoints(b.t, b.cost)}
                         disabled={!canAfford || isLoyaltyProcessing}
                         className={`w-full mt-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                            canAfford
                              ? 'bg-white/5 text-white hover:bg-[#5d3cfe] hover:shadow-lg'
                              : 'bg-[#0d0e12] text-[#474556] cursor-not-allowed opacity-50'
                         }`}
                       >
                          {isLoyaltyProcessing ? 'Procesando...' : canAfford ? 'Canjear Beneficio' : 'Puntos Insuficientes'}
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
               <InventoryModule
                  items={inventory}
                  assets={assets}
                  onUpdateQuantity={() => {}}
                  onAddItem={() => {}}
                  onDeleteItem={() => {}}
               />
            ) : (
               <div className="bg-[#121317] border border-white/5 rounded-[3rem] p-16 text-center space-y-8 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-20 opacity-5 -rotate-12"><Package className="w-64 h-64" /></div>
                  <div className="w-24 h-24 bg-white/5 rounded-3xl flex items-center justify-center mx-auto text-[#474556]">
                     <ShieldAlert className="w-12 h-12" />
                  </div>
                  <div className="space-y-4">
                     <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Módulo <span className="text-[#5d3cfe]">Bloqueado</span></h2>
                     <p className="text-xs text-[#c8c4d9] max-w-sm mx-auto font-medium leading-relaxed uppercase tracking-widest italic opacity-60">
                        El control avanzado de repuestos y herramientas es exclusivo para miembros del Club Mantech Pro.
                     </p>
                  </div>
                  <button
                     onClick={() => setTab('tech', 'loyalty')}
                     className="px-10 py-4 bg-[#5d3cfe] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-[#5d3cfe]/20 hover:scale-105 active:scale-95 transition-all"
                  >
                     Desbloquear en Club Fidelidad
                  </button>
               </div>
            )}
         </div>
      )}

      <ConfirmationModal
        isOpen={!!loyaltyConfirm}
        onClose={() => setLoyaltyConfirm(null)}
        onConfirm={() => loyaltyConfirm && executeRedeem(loyaltyConfirm.name, loyaltyConfirm.cost)}
        title="Confirmar Canje"
        message={`¿Deseas canjear ${loyaltyConfirm?.cost} puntos por "${loyaltyConfirm?.name}"? Esta acción activará el beneficio de forma inmediata.`}
        confirmText="Confirmar Canje"
        type="success"
      />
    </div>
  );
}
