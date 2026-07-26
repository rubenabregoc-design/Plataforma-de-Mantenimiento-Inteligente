import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Zap, Tool, Package, MessageSquare, QrCode, Calendar, MapPin,
  Video, ExternalLink, X, Check, Trash2, CheckCircle2, AlertTriangle,
  PieChart, ShieldCheck, Plus, Store, Pencil
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
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';

interface TechDashboardProps {
  techTab: string;
  setTechTab: (tab: any) => void;
  requests: JobRequest[];
  agenda: AgendaEvent[];
  chatMessages: ChatMessage[];
  activeChatRequestId: string | null;
  setActiveChatRequestId: (id: string | null) => void;
  subscription: UserSubscription;
  loggedInName: string;
  selectedTechProfileId: string | null;
  getSelectedTechProfileObj: () => TechProfile;
  getStatusLabel: (s: string) => string;
  setIsCredentialModalOpen: (val: boolean) => void;
  setIsEditingTechProfile: (val: boolean) => void;
  handleLogout: () => void;

  // Bidding State
  bidPrice: string;
  setBidPrice: (v: string) => void;
  bidDate: string;
  setBidDate: (v: string) => void;
  bidTime: string;
  setBidTime: (v: string) => void;
  bidDuration: number;
  setBidDuration: (v: number) => void;
  bidServiceType: 'onsite' | 'remote';
  setBidServiceType: (v: 'onsite' | 'remote') => void;
  bidRemotePlatform: any;
  setBidRemotePlatform: (v: any) => void;
  bidRemoteLink: string;
  setBidRemoteLink: (v: string) => void;
  bidMaterials: MaterialItem[];
  setBidMaterials: (v: MaterialItem[]) => void;
  newBidMaterial: any;
  setNewBidMaterial: (v: any) => void;
  handleSubmitBid: (id: string) => void;

  // Handlers
  handleReschedule: any;
  handleRequestWithdrawal: any;
  handleOpenSubscriptionPayment: any;
  handleUploadDoc: any;
  handleContinueTomorrow: any;
  handleToggleTask: any;
  handleDeleteMaterial: any;
  setActiveRequestForMaterial: (r: any) => void;
  setIsMaterialModalOpen: (v: boolean) => void;
  setActiveRequestForUnforeseen: (r: any) => void;
  setIsUnforeseenModalOpen: (v: boolean) => void;
  setActiveRequestForSignature: (id: string) => void;
  setIsSignatureModalOpen: (v: boolean) => void;
}

export default function TechDashboard(props: TechDashboardProps) {
  const { t, i18n } = useTranslation();
  const {
    techTab, setTechTab, requests, agenda, chatMessages,
    activeChatRequestId, setActiveChatRequestId, subscription,
    loggedInName, selectedTechProfileId, getSelectedTechProfileObj,
    getStatusLabel, setIsCredentialModalOpen, setIsEditingTechProfile,
    handleLogout, bidPrice, setBidPrice, bidDate, setBidDate,
    bidTime, setBidTime, bidDuration, setBidDuration,
    bidServiceType, setBidServiceType, bidRemotePlatform, setBidRemotePlatform,
    bidRemoteLink, setBidRemoteLink, bidMaterials, setBidMaterials,
    newBidMaterial, setNewBidMaterial, handleSubmitBid,
    handleReschedule, handleRequestWithdrawal, handleOpenSubscriptionPayment,
    handleUploadDoc, handleContinueTomorrow, handleToggleTask,
    handleDeleteMaterial, setActiveRequestForMaterial, setIsMaterialModalOpen,
    setActiveRequestForUnforeseen, setIsUnforeseenModalOpen,
    setActiveRequestForSignature, setIsSignatureModalOpen
  } = props;

  const techProfile = getSelectedTechProfileObj();

  return (
    <div className="space-y-12">
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
            const isOnline = techProfile.isOnline;
            const techId = selectedTechProfileId;
            if (!techId) return;

            if (!isOnline) {
              try {
                const isNative = Capacitor.isNativePlatform();
                if (isNative) {
                  const permission = await Geolocation.requestPermissions();
                  if (permission.location !== 'granted') return toast.error("Se requiere GPS para activar posición.");
                }

                const pos = await Geolocation.getCurrentPosition({ enableHighAccuracy: true });
                await updateDoc(doc(db, "technicians", techId), {
                  isOnline: true,
                  latitude: pos.coords.latitude,
                  longitude: pos.coords.longitude,
                  lastLocationUpdate: new Date().toISOString()
                });
                toast.success("¡En línea! Ahora eres visible en el radar.");
              } catch (err) {
                toast.error("Error al obtener ubicación.");
              }
            } else {
              await updateDoc(doc(db, "technicians", techId), { isOnline: false });
              toast("Modo Invisible Activado.", { icon: '🛡️' });
            }
          }}
          className={`px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-xl active:scale-95 ${techProfile.isOnline ? 'bg-rose-500/10 border border-rose-500/20 text-rose-500 hover:bg-rose-500 hover:text-white' : 'bg-[#52ffac] text-black shadow-[#52ffac]/20 hover:brightness-110'}`}
        >
          {techProfile.isOnline ? 'Desactivar Posición' : 'Iniciar Posición de Servicio'}
        </button>
      </div>

      {techTab === 'bidding_market' && (
        <div className="space-y-8 animate-fade-in">
          <header>
            <h1 className="text-4xl font-black text-white uppercase tracking-tighter">Bolsa de <span className="text-[#5d3cfe]">Trabajo</span></h1>
            <p className="text-[10px] text-[#474556] font-black uppercase tracking-widest mt-2">Oportunidades de servicio abiertas.</p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {requests.filter(r => r.status === 'open_bidding').map(req => (
              <div key={req.id} className="bg-[#121317] border border-white/5 p-8 rounded-[2.5rem] space-y-6 relative overflow-hidden group hover:border-[#5d3cfe]/30 transition-all">
                <div className="flex justify-between items-center relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#5d3cfe]/10 flex items-center justify-center text-[#5d3cfe]"><Zap className="w-5 h-5" /></div>
                    <h4 className="font-black text-white uppercase tracking-tight">{req.assetName}</h4>
                  </div>
                  <span className="px-4 py-1.5 bg-[#52ffac]/10 text-[#52ffac] rounded-full text-[8px] font-black uppercase tracking-widest">Contrato Abierto</span>
                </div>
                <div className="p-5 bg-[#0d0e12] rounded-2xl border border-white/5 italic text-xs text-[#c8c4d9]">
                  "{req.description}"
                </div>
                <button
                  onClick={() => {
                    const price = prompt("Ingrese su oferta económica (USD):");
                    if (price) {
                      updateDoc(doc(db, "requests", req.id), {
                        status: 'quoted',
                        techId: selectedTechProfileId,
                        techName: loggedInName,
                        price: Number(price),
                        quotedAt: new Date().toISOString()
                      });
                      toast.success("¡Oferta enviada!");
                    }
                  }}
                  className="w-full py-4 bg-[#5d3cfe] text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-[#5d3cfe]/20 active:scale-95 transition-all"
                >
                  Enviar Cotización Directa ➔
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {techTab === 'received' && (
        <div className="space-y-8">
          <header className="flex justify-between items-center"><h1 className="text-4xl font-black text-white uppercase tracking-tighter">Bandeja de <span className="text-[#5d3cfe]">Servicios</span></h1><button onClick={() => setTechTab('subscriptions')} className="px-6 py-2 bg-white/5 border border-white/10 text-white rounded-xl text-[9px] font-black uppercase hover:bg-[#5d3cfe]">Mejorar Plan Técnico</button></header>
          <div className="grid grid-cols-1 gap-6">
            {requests.map(req => (
              <div key={req.id} className="bg-[#121317] border border-[#2a2b2f] p-8 rounded-[2.5rem] space-y-6 shadow-2xl relative overflow-hidden group hover:border-[#5d3cfe]/30 transition-all">
                <div className="flex justify-between items-center"><h4 className="font-black text-white text-lg uppercase tracking-tight">{req.clientName}</h4><div className="flex gap-2"><button onClick={() => { setActiveChatRequestId(req.id); setTechTab('chat'); }} className="p-2 bg-[#5d3cfe]/10 border border-[#5d3cfe]/20 text-[#c7bfff] rounded-xl transition-all" title="Ir al Chat"><MessageSquare className="w-4 h-4" /></button><button onClick={() => setIsCredentialModalOpen(true)} className="p-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl transition-all" title="Mostrar Credencial"><QrCode className="w-4 h-4" /></button><span className="px-4 py-1.5 bg-[#1c1d21] border border-[#2a2b2f] rounded-full text-[9px] font-black text-[#c7bfff] uppercase tracking-widest shadow-inner">{getStatusLabel(req.status)}</span></div></div>
                {/* ... (Request Details Logic) */}
                {req.status === 'executing' && (
                  <div className="space-y-6">
                    <button onClick={() => { setActiveRequestForSignature(req.id); setIsSignatureModalOpen(true); }} className="w-full py-5 bg-[#52ffac] text-black rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl">Finalizar Servicio</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {techTab === 'agenda' && (
        <div className="bg-[#121317] border border-[#2a2b2f] p-10 rounded-[3rem] shadow-2xl space-y-8">
          <header><h1 className="text-4xl font-black text-white uppercase tracking-tighter">Agenda <span className="text-[#5d3cfe]">Logística</span></h1></header>
          <div className="grid grid-cols-1 gap-4">
            {agenda.map(e => (
              <div key={e.id} className="p-6 bg-[#1c1d21] border border-[#2a2b2f] rounded-3xl flex justify-between items-center group hover:border-[#5d3cfe]/30 transition-all">
                <div className="flex gap-6 items-center">
                  <div className="p-4 bg-[#0d0e12] rounded-2xl text-center min-w-[100px] border border-[#2a2b2f]">
                    <span className="text-xs font-black text-[#5d3cfe]">{e.date}</span>
                    <p className="text-[10px] font-bold text-white mt-1">{e.time}</p>
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-white uppercase tracking-tight">{e.title}</h4>
                    <p className="text-[10px] font-bold text-[#c8c4d9] mt-1 italic opacity-60">Cliente: {e.clientName}</p>
                  </div>
                </div>
                <button onClick={() => { const nd = prompt("Nueva Fecha:", e.date); if(nd) handleReschedule(e.requestId || '', nd, e.time, "Motivo logístico"); }} className="px-6 py-2 bg-[#0d0e12] border border-[#2a2b2f] text-white rounded-xl text-[9px] font-black uppercase hover:bg-[#5d3cfe]">Mover</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {techTab === 'wallet' && (
        <TechWalletModule
          wallet={techProfile.wallet || { balance: 0, pendingBalance: 0, transactions: [] }}
          techId={selectedTechProfileId!}
          onWithdraw={handleRequestWithdrawal}
          plan={techProfile.plan || 'basic'}
        />
      )}

      {techTab === 'mantech_id' && <TechCredential tech={techProfile} />}

      {techTab === 'chat' && (
        <div className="h-[calc(100vh-200px)]">
          <SupportChatWidget
            request={requests.find(r => r.id === activeChatRequestId) || null}
            role="tech"
            messages={chatMessages}
            onSendMessage={(txt, img) => addDoc(collection(db,"messages"), { requestId: activeChatRequestId, sender: 'tech', text: txt, image: img || null, timestamp: serverTimestamp() })}
            onStartVideoCall={(room, voice) => { /* Video call logic */ }}
          />
        </div>
      )}

      {techTab === 'profile' && (
        <div className="max-w-2xl mx-auto space-y-10">
          <header className="flex justify-between items-center">
            <h1 className="text-4xl font-black text-white uppercase tracking-tighter">Mi <span className="text-[#5d3cfe]">Perfil</span></h1>
            <button onClick={() => setIsEditingTechProfile(true)} className="px-6 py-3 bg-white/5 border border-white/10 text-white rounded-2xl text-[10px] font-black uppercase hover:bg-white/10 transition-all flex items-center gap-2">
              <Pencil className="w-4 h-4" /> Editar Perfil Market
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
          onUpgrade={handleOpenSubscriptionPayment}
          role="tech"
        />
      )}

      {techTab === 'settings' && (
        <div className="max-w-3xl mx-auto space-y-12 pb-20 animate-fade-in">
          <header className="text-center space-y-3">
             <h2 className="text-4xl font-black text-white uppercase tracking-tighter leading-none">Centro de <span className="text-[#5d3cfe]">Configuración</span></h2>
             <p className="text-[10px] font-black text-[#c8c4d9] uppercase tracking-[0.3em]">Validación Profesional y Ajustes de Perfil</p>
          </header>

          <MantechIDModule
             mantechId={techProfile.mantechId || { status: 'unverified', idNumber: '' }}
             onUpload={handleUploadDoc}
             role="tech"
             plan={techProfile.plan}
          />

          <div className="bg-rose-500/5 border border-rose-500/10 p-8 rounded-[3rem] shadow-2xl flex flex-col items-center gap-6 text-center">
             <button onClick={handleLogout} className="px-12 py-4 border border-rose-500/30 text-rose-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all shadow-xl">Desconectar Perfil Seguro</button>
          </div>
        </div>
      )}
    </div>
  );
}
