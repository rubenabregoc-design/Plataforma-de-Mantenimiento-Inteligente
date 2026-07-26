import React, { useState } from 'react';
import { Asset, MaintenanceReminder, JobRequest, InventoryItem, UserSubscription, TechCategory, ChatMessage, TechProfile } from '../../types';
import AssetIntelligentCard from '../../components/AssetIntelligentCard';
import FuelAuditModule from '../../components/FuelAuditModule';
import HomeEmergencySOS from '../../components/HomeEmergencySOS';
import VerticalDashboard from '../../components/VerticalDashboard';
import Skeleton from '../../components/Skeleton';
import {
  Search, ChevronLeft, ChevronRight, LayoutDashboard, Trash2, Check, Download,
  Truck, CheckCircle2, AlertTriangle, Globe, BrainCircuit, ShieldCheck, Layers, Package,
  Store, FileCheck2, FileText, Star, MessageSquare, ArrowRight, Video, MapPin, Activity
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
import { doc, deleteDoc, updateDoc, collection, addDoc, serverTimestamp, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useUI } from '../../context/UIContext';
import { useBusinessLogic } from '../../hooks/useBusinessLogic';

export default function ClientDashboard() {
  const { t, i18n } = useTranslation();
  const { userData, subscription, user, loggedInName, logout } = useAuth();
  const { assets, requests, reminders, inventory, technicians, isDataLoading } = useData();
  const { tabs, setTab, openModal } = useUI();
  const business = useBusinessLogic();

  const clientTab = tabs.client;
  const assetPageSize = 6;

  const [assetSearchQuery, setAssetSearchQuery] = useState('');
  const [assetCurrentPage, setAssetCurrentPage] = useState(1);
  const [selectedDashboardIds, setSelectedDashboardIds] = useState<string[]>([]);
  const [marketFilter, setMarketFilter] = useState<TechCategory | 'all'>('all');
  const [marketViewMode, setMarketViewMode] = useState<'list' | 'radar' | 'bidding'>('list');
  const [activeChatRequestId, setActiveChatRequestId] = useState<string | null>(null);

  const getStatusLabel = (s: string) => {
    const map: any = { pending: 'SOLICITADO', quoted: 'COTIZADO', accepted: 'PAGADO', executing: 'EN PROCESO', completed: 'FINALIZADO', rated: 'CALIFICADO', rejected: 'DENEGADO', disputed: 'IMPREVISTO', cancelled: 'CANCELADO' };
    return map[s] || s.toUpperCase();
  };

  const planLimits = {
    maxAssets: subscription.planId === 'plan-enterprise' ? 9999 : (subscription.planId === 'plan-pro' ? 25 : (subscription.planId === 'plan-basic' ? 5 : 2)),
    fleet: subscription.planId === 'plan-enterprise' ? 'full' : (subscription.planId === 'plan-pro' ? 'lite' : 'none'),
    diag: subscription.planId === 'plan-enterprise' ? 'auto' : (subscription.planId === 'plan-pro' ? 'assisted' : 'manual'),
  };

  return (
    <div className="space-y-10 animate-fade-in">
      {clientTab === 'dashboard' && (
        <div className="space-y-10">
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
                <button onClick={() => openModal('asset')} className="px-8 py-3.5 bg-[#5d3cfe] text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-[#5d3cfe]/20 transition-all hover:scale-105 active:scale-95 shrink-0">+ Registrar</button>
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
                    onOpenDetails={(asset) => openModal('fuel', { asset })}
                    onOpenPreTrip={(asset) => openModal('preTrip', { asset })}
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
          onManageAsset={(a) => openModal('asset', { asset: a })}
          mode={planLimits.fleet as any}
          onBulkUpdate={() => {}}
          onBulkDelete={() => {}}
          onBulkRegister={() => {}}
          onStartGps={(id: string) => openModal('routeStart', { asset: assets.find(a => a.id === id) })}
          onTogglePause={() => {}}
          onAddCheckpoint={(a) => openModal('checkpoint', { asset: a })}
          onContactSupport={() => openModal('corpSupport')}
          trackingAssetId={null}
          tripStatus="idle"
        />
      )}

      {clientTab === 'ai' && <DiagnosticAIView assets={assets} onFindTechnicians={(c) => { setMarketFilter(c); setTab('client', 'marketplace'); }} mode={planLimits.diag as any} />}

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
                    <button onClick={() => openModal('tech', { tech: t })} className="w-full py-4 bg-[#1c1d21] hover:bg-[#5d3cfe] text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-lg active:scale-[0.98]">Ver Perfil & Agendar</button>
                 </div>
               ))}
            </div>
          ) : marketViewMode === 'bidding' ? (
            <div className="space-y-8 animate-fade-in">
              <div className="p-8 bg-[#5d3cfe]/10 border border-[#5d3cfe]/20 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-[#5d3cfe] flex items-center justify-center text-white shadow-xl">
                      <Layers className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-white uppercase tracking-tight leading-none">Subasta de Servicios</h3>
                      <p className="text-[10px] text-[#c8c4d9] uppercase tracking-widest mt-1">Especialistas Partner compiten por tu ticket.</p>
                    </div>
                </div>
                <button onClick={() => {
                   const assetId = prompt("ID de activo:");
                   const desc = prompt("Descripción:");
                   if(assetId && desc) business.handlePostOpenMarket(assetId, desc);
                }} className="px-8 py-4 bg-[#52ffac] text-black rounded-2xl text-[10px] font-black uppercase shadow-xl">Nueva Subasta +</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {requests.filter(r => r.status === 'open_bidding').map(req => (
                    <div key={req.id} className="bg-[#121317] border border-white/5 p-8 rounded-[2.5rem] space-y-6 relative overflow-hidden group">
                       <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                             <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-[#5d3cfe]"><Package className="w-5 h-5" /></div>
                             <h4 className="font-black text-white uppercase tracking-tight">{req.assetName}</h4>
                          </div>
                          <span className="px-4 py-1.5 bg-indigo-500/10 text-indigo-400 rounded-full text-[8px] font-black uppercase tracking-widest">En Subasta</span>
                       </div>
                       <p className="text-xs text-[#c8c4d9] italic opacity-60">"{req.description}"</p>
                       <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                          <span className="text-[9px] font-black text-[#474556] uppercase tracking-widest">{req.bids?.length || 0} Propuestas</span>
                          <button className="text-[10px] font-black text-[#52ffac] uppercase tracking-[0.2em]">Ver Ofertas ➔</button>
                       </div>
                    </div>
                 ))}
              </div>
            </div>
          ) : (
             <div className="py-20 text-center opacity-20 uppercase tracking-widest text-[10px] font-black">Escaneando técnicos en el Radar...</div>
          )}
        </div>
      )}

      {clientTab === 'quotes' && (
        <div className="space-y-10 animate-fade-in">
          <header><h1 className="text-4xl font-black text-white tracking-tighter uppercase">Contratos <span className="text-[#52ffac]">Activos</span></h1></header>
          <div className="space-y-6">
            {requests.filter(r => r.status !== 'open_bidding').map(req => (
              <div key={req.id} className="bg-[#121317] border border-white/10 p-10 rounded-[2.5rem] space-y-10 shadow-2xl relative overflow-hidden">
                <div className="flex justify-between items-center relative z-10">
                  <h4 className="font-black text-white text-2xl uppercase tracking-tighter">{req.assetName}</h4>
                  <span className="px-6 py-2 bg-[#1c1d21] border border-white/10 rounded-full text-[10px] font-black text-[#52ffac] uppercase tracking-widest shadow-inner">
                    {getStatusLabel(req.status)}
                  </span>
                </div>
                {req.status === 'quoted' && (
                  <div className="bg-[#5d3cfe]/10 p-8 rounded-[2.5rem] border border-[#5d3cfe]/30 flex justify-between items-center animate-fade-in">
                    <p className="text-white font-black text-xl uppercase tracking-tight">Propuesta: ${req.price?.toFixed(2)} USD</p>
                    <button onClick={() => openModal('payment', { request: req })} className="px-8 py-4 bg-[#52ffac] text-black rounded-2xl text-[10px] font-black uppercase shadow-xl shadow-[#52ffac]/20 hover:scale-105 transition-all">Gestionar Pago</button>
                  </div>
                )}
                {req.status === 'executing' && (
                  <div className="bg-[#1c1d21] p-8 rounded-[2.5rem] border border-white/5 space-y-6 shadow-2xl">
                     <div className="flex items-center gap-3 text-[#52ffac]">
                        <Activity className="w-6 h-6 animate-pulse" />
                        <h4 className="text-xl font-black uppercase tracking-tighter">Servicio en Ejecución</h4>
                     </div>
                     <button onClick={() => openModal('signature', { requestId: req.id })} className="w-full py-5 bg-[#52ffac] text-black rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all">Cerrar Servicio & Liberar Pago</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {clientTab === 'inventory' && (
        <InventoryModule
          items={inventory}
          assets={assets}
          onUpdateQuantity={business.handleUpdateInventoryQuantity}
          onAddItem={business.handleAddInventoryItem}
          onDeleteItem={business.handleDeleteInventoryItem}
          onUpdateItem={business.handleUpdateInventoryItem}
        />
      )}

      {clientTab === 'subscriptions' && (
        <SubscriptionModule subscription={subscription} onUpgrade={(planId) => openModal('payment', { plan: planId })} role="client" />
      )}

      {clientTab === 'chat' && (
        <div className="h-[calc(100vh-200px)] animate-fade-in">
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
           <header className="space-y-4">
              <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Ajustes del <span className="text-[#5d3cfe]">Nodo</span></h2>
              <p className="text-[10px] font-black text-[#474556] uppercase tracking-[0.3em]">Gestión de Seguridad e Identidad</p>
           </header>
           <MantechIDModule
              mantechId={{ status: userData?.recordStatus || 'unverified', idNumber: '' }}
              onUpload={() => {}}
              role="client"
              plan={subscription.planId}
           />
           <button onClick={logout} className="px-12 py-4 border border-rose-500/30 text-rose-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all shadow-xl mt-12">Cerrar Sesión Segura</button>
        </div>
      )}
    </div>
  );
}
