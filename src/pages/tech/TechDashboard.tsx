import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Zap, Package, MessageSquare, QrCode, Calendar, MapPin,
  Video, Check, Trash2, CheckCircle2, AlertTriangle, Pencil, Star, DollarSign, Plus, Store, Inbox, Layers, PieChart, ShieldCheck
} from 'lucide-react';
import { doc, updateDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { toast } from 'react-hot-toast';
import { TechProfile, JobRequest, AgendaEvent, MaterialItem, ChatMessage, UserSubscription } from '../../types';
import TechWalletModule from '../../components/TechWalletModule';
import TechCredential from '../../components/TechCredential';
import SupportChatWidget from '../../components/SupportChatWidget';
import MantechIDModule from '../../components/MantechIDModule';
import SubscriptionModule from '../../components/SubscriptionModule';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useUI } from '../../context/UIContext';

export default function TechDashboard() {
  const { t, i18n } = useTranslation();
  const { user, loggedInName, userData, subscription, logout } = useAuth();
  const { requests, agenda, technicians } = useData();
  const { tabs, setTab, openModal } = useUI();

  const techTab = tabs.tech;
  const techProfile = technicians.find(t => t.userId === user?.uid) || { id: 'new', name: loggedInName, category: 'mecanico' } as TechProfile;

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
                      <span className="px-4 py-1.5 bg-[#1c1d21] border border-[#2a2b2f] rounded-full text-[9px] font-black text-[#c7bfff] uppercase tracking-widest shadow-inner">{getStatusLabel(req.status)}</span>
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
            <button onClick={() => openModal('editTech')} className="px-6 py-3 bg-white/5 border border-white/10 text-white rounded-2xl text-[10px] font-black uppercase hover:bg-white/10 transition-all flex items-center gap-2">
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
              cedula={userData?.cedula}
              plan={techProfile.plan}
           />
           <button onClick={logout} className="px-12 py-4 border border-rose-500/30 text-rose-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all shadow-xl mt-12">Cerrar Sesión Segura</button>
        </div>
      )}
    </div>
  );
}
