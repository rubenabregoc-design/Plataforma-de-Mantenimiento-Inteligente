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
  const { t } = useTranslation();
  const { user, loggedInName, subscription, logout } = useAuth();
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
            <h4 className="text-sm font-black text-white uppercase tracking-tight">Estatus de Conexión</h4>
            <p className={`text-[10px] font-bold uppercase tracking-widest ${techProfile.isOnline ? 'text-[#52ffac]' : 'text-[#474556]'}`}>
              {techProfile.isOnline ? 'Transmitiendo ubicación en Radar' : 'Modo Invisible (Fuera de línea)'}
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
          {techProfile.isOnline ? 'Desactivar Posición' : 'Iniciar Posición de Servicio'}
        </button>
      </div>

      {techTab === 'received' && (
        <div className="space-y-8">
           <header className="flex justify-between items-center">
              <h1 className="text-4xl font-black text-white uppercase tracking-tighter">Bandeja de <span className="text-[#5d3cfe]">Servicios</span></h1>
              <button onClick={() => setTab('tech', 'subscriptions')} className="px-6 py-2 bg-white/5 border border-white/10 text-white rounded-xl text-[9px] font-black uppercase hover:bg-[#5d3cfe] transition-all">Mejorar Plan</button>
           </header>
           <div className="grid grid-cols-1 gap-6">
             {requests.filter(r => r.status !== 'open_bidding').map(req => (
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
             ))}
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
    </div>
  );
}
