import React, { useState } from 'react';
import { Asset, MaintenanceReminder, JobRequest, InventoryItem, UserSubscription, TechCategory, ChatMessage } from '../../types';
import AssetIntelligentCard from '../../components/AssetIntelligentCard';
import FuelAuditModule from '../../components/FuelAuditModule';
import HomeEmergencySOS from '../../components/HomeEmergencySOS';
import VerticalDashboard from '../../components/VerticalDashboard';
import Skeleton from '../../components/Skeleton';
import {
  Search, ChevronLeft, ChevronRight, LayoutDashboard, Trash2, Check, Download,
  Truck, CheckCircle2, AlertTriangle, Globe, BrainCircuit, ShieldCheck,
  Store, FileCheck2, FileText, Package, Star, MessageSquare, ArrowRight, Video, MapPin, Activity
} from 'lucide-react';
import FleetDashboard from '../../components/FleetDashboard';
import DiagnosticAIView from '../../components/DiagnosticAIView';
import WarrantyVaultModule from '../../components/WarrantyVaultModule';
import InventoryModule from '../../components/InventoryModule';
import SubscriptionModule from '../../components/SubscriptionModule';
import SupportChatWidget from '../../components/SupportChatWidget';
import MantechIDModule from '../../components/MantechIDModule';
import * as XLSX from 'xlsx';
import { useTranslation } from 'react-i18next';
import { PayPalButtons } from "@paypal/react-paypal-js";
import { doc, deleteDoc, updateDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

interface ClientDashboardProps {
  clientTab: string;
  setClientTab: (t: any) => void;
  // State from App.tsx
  assetSearchQuery: string;
  setAssetSearchQuery: (q: string) => void;
  assetCurrentPage: number;
  setAssetCurrentPage: (p: number | ((prev: number) => number)) => void;
  selectedDashboardIds: string[];
  setSelectedDashboardIds: (ids: string[]) => void;
  // Modals
  onOpenAssetModal: () => void;
  onOpenFuelModal: (asset: Asset) => void;
  onOpenPreTripModal: (asset: Asset) => void;
  setIsCheckpointModalOpen: (v: boolean) => void;
  setIsCorporateSupportModalOpen: (v: boolean) => void;
  // Bidding
  handlePostOpenMarket: (assetId: string, description: string) => void;
  handleAcceptQuote: (requestId: string, method: string) => void;
  // Tracking
  trackingAssetId: string | null;
  tripStatus: string;
  startGpsTracking: any;
  toggleGpsPause: any;
  setAssetForRoute: (a: Asset | null) => void;
}

export default function ClientDashboard(props: ClientDashboardProps) {
  const { t } = useTranslation();
  const { userData, subscription, user, loggedInName } = useAuth();
  const { assets, requests, reminders, inventory, technicians, isDataLoading, agenda } = useData();

  const {
    clientTab, setClientTab, assetSearchQuery, setAssetSearchQuery,
    assetCurrentPage, setAssetCurrentPage, selectedDashboardIds,
    setSelectedDashboardIds, onOpenAssetModal, onOpenFuelModal,
    onOpenPreTripModal, setIsCheckpointModalOpen, setIsCorporateSupportModalOpen,
    handlePostOpenMarket, handleAcceptQuote, trackingAssetId, tripStatus,
    startGpsTracking, toggleGpsPause, setAssetForRoute
  } = props;

  const assetPageSize = 6;

  const [marketFilter, setMarketFilter] = useState<TechCategory | 'all'>('all');
  const [marketViewMode, setMarketViewMode] = useState<'list' | 'radar' | 'bidding'>('list');
  const [activeChatRequestId, setActiveChatRequestId] = useState<string | null>(null);

  const getStatusLabel = (s: string) => {
    const map: any = { pending: 'SOLICITADO', quoted: 'COTIZADO', accepted: 'PAGADO', executing: 'EN PROCESO', completed: 'FINALIZADO', rated: 'CALIFICADO', rejected: 'DENEGADO', disputed: 'IMPREVISTO', cancelled: 'CANCELADO' };
    return map[s] || s.toUpperCase();
  };

  const getPlanLimits = (planId: string) => {
    switch(planId) {
      case 'plan-pro': return { maxAssets: 25, fleet: 'lite', diag: 'assisted' };
      case 'plan-enterprise': return { maxAssets: 9999, fleet: 'full', diag: 'auto' };
      case 'plan-basic': return { maxAssets: 5, fleet: 'none', diag: 'manual' };
      default: return { maxAssets: 2, fleet: 'none', diag: 'manual' };
    }
  };

  const planLimits = getPlanLimits(subscription.planId);

  return (
    <div className="space-y-8">
      {clientTab === 'dashboard' && (
        <div className="space-y-10 animate-fade-in">
          <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
             <div>
                <h1 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">Mi <span className="text-[#5d3cfe]">Portafolio</span></h1>
                <p className="text-[#c8c4d9] font-medium mt-3 italic opacity-60">Gestión activa de activos en Panamá.</p>
             </div>
             <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#474556]" />
                   <input
                     type="text"
                     placeholder="Buscar equipo..."
                     value={assetSearchQuery}
                     onChange={(e) => { setAssetSearchQuery(e.target.value); setAssetCurrentPage(1); }}
                     className="w-full bg-[#121317] border border-[#2a2b2f] rounded-2xl py-3 pl-12 pr-6 text-xs text-white focus:border-[#5d3cfe] outline-none transition-all"
                   />
                </div>
                <button onClick={onOpenAssetModal} className="px-8 py-3.5 bg-[#5d3cfe] text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-[#5d3cfe]/20 transition-all hover:scale-105 active:scale-95 shrink-0">+ Registrar</button>
             </div>
          </header>

          {isDataLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {[1,2,3].map(i => <Skeleton key={i} className="h-64" />)}
            </div>
          ) : (
            <div className="space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {assets.filter(a =>
                  a.name.toLowerCase().includes(assetSearchQuery.toLowerCase()) ||
                  a.licensePlate?.toLowerCase().includes(assetSearchQuery.toLowerCase())
                ).slice((assetCurrentPage - 1) * assetPageSize, assetCurrentPage * assetPageSize).map(a => (
                  <AssetIntelligentCard
                    key={a.id}
                    asset={a}
                    requests={requests}
                    onOpenDetails={onOpenFuelModal}
                    onOpenPreTrip={onOpenPreTripModal}
                  />
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <FuelAuditModule
                  assets={assets}
                  onSaveLog={() => {}}
                />
                <HomeEmergencySOS />
              </div>

              <VerticalDashboard
                type="ph"
                assets={assets}
                requests={requests}
                userName={userData?.name || 'Usuario'}
              />
            </div>
          )}
        </div>
      )}

      {clientTab === 'fleet' && (
        <FleetDashboard
          assets={assets}
          reminders={reminders}
          onManageAsset={onOpenAssetModal as any}
          mode={planLimits.fleet as any}
          onBulkUpdate={() => {}}
          onBulkDelete={() => {}}
          onBulkRegister={() => {}}
          onStartGps={startGpsTracking}
          onTogglePause={toggleGpsPause}
          onAddCheckpoint={(a) => { setAssetForRoute(a); setIsCheckpointModalOpen(true); }}
          onContactSupport={() => setIsCorporateSupportModalOpen(true)}
          trackingAssetId={trackingAssetId}
          tripStatus={tripStatus}
        />
      )}

      {clientTab === 'ai' && <DiagnosticAIView assets={assets} onFindTechnicians={(c) => { setMarketFilter(c); setClientTab('marketplace'); }} mode={planLimits.diag as any} />}

      {clientTab === 'warranties' && <WarrantyVaultModule assets={assets} />}

      {clientTab === 'marketplace' && (
        <div className="space-y-10">
          <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
               <h1 className="text-4xl font-black text-white uppercase tracking-tighter leading-none">Marketplace <span className="text-[#5d3cfe]">Expertos</span></h1>
               <div className="flex gap-3 overflow-x-auto pb-4 mt-6 custom-scrollbar">{['Todos', 'Mecánico', 'Técnico A/C', 'Electricista', 'Informático'].map(c => (<button key={c} onClick={() => setMarketFilter(c === 'Todos' ? 'all' : c.toLowerCase().replace(' ', '_') as any)} className={`flex-shrink-0 px-8 py-3 rounded-full border transition-all text-[10px] font-black uppercase tracking-widest ${marketFilter === (c === 'Todos' ? 'all' : c.toLowerCase().replace(' ', '_')) ? 'bg-[#5d3cfe] border-[#5d3cfe] text-white shadow-xl shadow-[#5d3cfe]/20' : 'border-[#2a2b2f] text-[#c8c4d9] hover:border-[#5d3cfe]'}`}>{c}</button>))}</div>
            </div>
            <div className="bg-[#1c1d21] p-1.5 rounded-2xl border border-[#2a2b2f] flex">
               <button onClick={() => setMarketViewMode('list')} className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all ${marketViewMode === 'list' ? 'bg-[#5d3cfe] text-white shadow-lg' : 'text-[#474556] hover:text-[#c8c4d9]'}`}>Listado</button>
               <button onClick={() => setMarketViewMode('radar')} className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all ${marketViewMode === 'radar' ? 'bg-[#5d3cfe] text-white shadow-lg' : 'text-[#474556] hover:text-[#c8c4d9]'}`}>Radar Satelital</button>
               <button onClick={() => setMarketViewMode('bidding')} className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all ${marketViewMode === 'bidding' ? 'bg-[#5d3cfe] text-white shadow-lg' : 'text-[#474556] hover:text-[#c8c4d9]'}`}>Subasta Pública</button>
            </div>
          </header>

          {isDataLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               {[1,2,3].map(i => <Skeleton key={i} className="h-96" />)}
            </div>
          ) : marketViewMode === 'list' ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               {technicians.filter(t => marketFilter === 'all' || t.category === marketFilter).map(t => (
                 <div key={t.id} className="bg-[#121317] border border-[#2a2b2f] p-8 rounded-[3rem] flex flex-col gap-6 relative overflow-hidden group hover:border-[#5d3cfe]/50 transition-all shadow-2xl">
                    <div className="flex items-center gap-5"><div className="w-16 h-16 rounded-2xl bg-[#1c1d21] border border-[#2a2b2f] flex items-center justify-center text-[#c7bfff] font-black text-2xl shadow-inner">{t.name[0]}</div><div><h4 className="font-black text-white text-base uppercase tracking-tight">{t.name}</h4><p className="text-[10px] font-black text-[#52ffac] uppercase tracking-[0.2em] mt-1">{t.category.replace('_',' ')}</p></div></div>
                    <div className="grid grid-cols-3 gap-4 py-4 border-y border-[#2a2b2f]/50 bg-[#0d0e12]/30 px-4 rounded-2xl text-center"><div><div className="text-amber-500 font-black text-sm flex items-center justify-center gap-1"><Star className="w-3 h-3 fill-amber-500" /> {t.rating}</div><span className="text-[8px] text-[#474556] font-bold uppercase">Rating</span></div><div><div className="text-white font-black text-sm">{t.experienceYears}a</div><span className="text-[8px] text-[#474556] font-bold uppercase">Exp.</span></div><div><div className="text-[#52ffac] font-black text-sm">${t.hourlyRate}</div><span className="text-[8px] text-[#474556] font-bold uppercase">Hr.</span></div></div>
                    <button onClick={() => {}} className="w-full py-4 bg-[#1c1d21] hover:bg-[#5d3cfe] text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-lg active:scale-[0.98]">Ver Perfil & Agendar</button>
                 </div>
               ))}
            </div>
          ) : (
             <div className="py-20 text-center opacity-20">Vista Avanzada en desarrollo</div>
          )}
        </div>
      )}

      {clientTab === 'quotes' && (
        <div className="space-y-10 animate-fade-in">
          <header><h1 className="text-4xl font-black text-white tracking-tighter uppercase">Contratos <span className="text-[#52ffac]">Activos</span></h1></header>
          <div className="space-y-6">
            {requests.map(req => (
              <div key={req.id} className="bg-[#121317] border border-white/10 p-10 rounded-[2.5rem] space-y-10 shadow-2xl relative overflow-hidden">
                <div className="flex justify-between items-center relative z-10">
                  <h4 className="font-black text-white text-2xl uppercase tracking-tighter">{req.assetName}</h4>
                  <span className="px-6 py-2 bg-[#1c1d21] border border-white/10 rounded-full text-[10px] font-black text-[#52ffac] uppercase tracking-widest shadow-inner">
                    {getStatusLabel(req.status)}
                  </span>
                </div>
                {req.status === 'quoted' && (
                  <div className="bg-[#5d3cfe]/10 p-8 rounded-[2.5rem] border border-[#5d3cfe]/30 flex justify-between items-center">
                    <p className="text-white font-black text-xl uppercase tracking-tight">Propuesta: ${req.price?.toFixed(2)} USD</p>
                    <button onClick={() => handleAcceptQuote(req.id, 'yappy')} className="px-8 py-4 bg-[#52ffac] text-black rounded-2xl text-[10px] font-black uppercase shadow-xl">Pagar con Yappy</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {clientTab === 'inventory' && (
        <InventoryModule items={inventory} assets={assets} onUpdateQuantity={() => {}} onAddItem={() => {}} onDeleteItem={() => {}} onUpdateItem={() => {}} />
      )}

      {clientTab === 'subscriptions' && (
        <SubscriptionModule subscription={subscription} onUpgrade={() => {}} role="client" />
      )}

      {clientTab === 'chat' && (
        <div className="h-[calc(100vh-200px)]">
          <SupportChatWidget
            request={requests.find(r => r.id === activeChatRequestId) || null}
            role="client"
            messages={[]}
            onSendMessage={() => {}}
          />
        </div>
      )}

      {clientTab === 'settings' && (
        <div className="max-w-3xl mx-auto space-y-12 pb-20 animate-fade-in text-center">
           <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Configuración</h2>
           <button onClick={() => {}} className="px-12 py-4 border border-rose-500/30 text-rose-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all shadow-xl">Cerrar Sesión Segura</button>
        </div>
      )}
    </div>
  );
}
