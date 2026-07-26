import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Zap, Package, MessageSquare, QrCode, Calendar, MapPin,
  Video, Check, Trash2, CheckCircle2, AlertTriangle, Pencil
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
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

interface TechDashboardProps {
  techTab: string;
  setTechTab: (tab: any) => void;
  getStatusLabel: (s: string) => string;
  setIsCredentialModalOpen: (val: boolean) => void;
  setIsEditingTechProfile: (val: boolean) => void;
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
}

export default function TechDashboard(props: TechDashboardProps) {
  const { role, user, loggedInName, subscription, logout } = useAuth();
  const { requests, agenda, technicians, isDataLoading } = useData();

  const {
    techTab, setTechTab, getStatusLabel, setIsCredentialModalOpen,
    setIsEditingTechProfile, bidPrice, setBidPrice, bidDate, setBidDate,
    bidTime, setBidTime, bidDuration, setBidDuration,
    bidServiceType, setBidServiceType, bidRemotePlatform, setBidRemotePlatform,
    bidRemoteLink, setBidRemoteLink, bidMaterials, setBidMaterials,
    newBidMaterial, setNewBidMaterial, handleSubmitBid
  } = props;

  const techProfile = technicians.find(t => t.userId === user?.uid) || { id: 'new', name: loggedInName, category: 'mecanico' } as TechProfile;

  return (
    <div className="space-y-12">
      {/* Availability Bar */}
      <div className="bg-[#1c1d21] border border-white/5 p-6 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${techProfile.isOnline ? 'bg-[#52ffac] shadow-[0_0_20px_rgba(82,255,172,0.3)] text-black' : 'bg-[#121317] border border-white/10 text-[#474556]'}`}>
            {techProfile.isOnline ? <Zap className="w-6 h-6 animate-pulse" /> : <Zap className="w-6 h-6 opacity-20" />}
          </div>
          <div>
            <h4 className="text-sm font-black text-white uppercase tracking-tight">Estatus de Conexión</h4>
            <p className={`text-[10px] font-bold uppercase tracking-widest ${techProfile.isOnline ? 'text-[#52ffac]' : 'text-[#474556]'}`}>
              {techProfile.isOnline ? 'Transmitiendo ubicación en Radar' : 'Modo Invisible'}
            </p>
          </div>
        </div>

        <button
          onClick={async () => {
            if (!techProfile.id) return;
            await updateDoc(doc(db, "technicians", techProfile.id), { isOnline: !techProfile.isOnline });
            toast.success(techProfile.isOnline ? "Modo Invisible" : "¡En línea!");
          }}
          className={`px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-xl ${techProfile.isOnline ? 'bg-rose-500/10 text-rose-500' : 'bg-[#52ffac] text-black'}`}
        >
          {techProfile.isOnline ? 'Desactivar Posición' : 'Iniciar Posición'}
        </button>
      </div>

      {techTab === 'received' && (
        <div className="space-y-8">
           <h1 className="text-4xl font-black text-white uppercase tracking-tighter">Bandeja de Servicios</h1>
           <div className="grid grid-cols-1 gap-6">
             {requests.map(req => (
               <div key={req.id} className="bg-[#121317] border border-[#2a2b2f] p-8 rounded-[2.5rem] shadow-2xl">
                  <div className="flex justify-between items-center">
                    <h4 className="font-black text-white text-lg uppercase tracking-tight">{req.clientName}</h4>
                    <span className="px-4 py-1.5 bg-[#1c1d21] rounded-full text-[9px] font-black text-[#52ffac] uppercase">{getStatusLabel(req.status)}</span>
                  </div>
                  <p className="mt-4 text-sm text-[#c8c4d9]">"{req.description}"</p>
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
            <button onClick={() => setIsEditingTechProfile(true)} className="px-6 py-3 bg-white/5 border border-white/10 text-white rounded-2xl text-[10px] font-black uppercase hover:bg-white/10 transition-all flex items-center gap-2">
              <Pencil className="w-4 h-4" /> Editar Perfil
            </button>
          </header>
          <TechCredential tech={techProfile} />
        </div>
      )}

      {techTab === 'subscriptions' && (
        <SubscriptionModule subscription={subscription} onUpgrade={() => {}} role="tech" />
      )}
    </div>
  );
}
