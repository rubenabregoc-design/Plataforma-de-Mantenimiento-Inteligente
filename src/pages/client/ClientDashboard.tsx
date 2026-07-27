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
  Store, FileCheck2, FileText, Star, MessageSquare, ArrowRight, Video, MapPin, Activity, Shield
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
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [marketSearchQuery, setMarketSearchQuery] = useState('');
  const [requiredVerificationLevel, setRequiredVerificationLevel] = useState<number>(1);

  // Función para normalizar texto (quitar acentos) para comparaciones precisas
  const normalizeText = (text: string) =>
    text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '_');

  const categories = [
    { id: 'all', label: 'Todos' },
    { id: 'mecanico', label: 'Mecánico' },
    { id: 'tecnico_ac', label: 'Técnico A/C' },
    { id: 'electricista', label: 'Electricista' },
    { id: 'informatico', label: 'Informático' },
    { id: 'plomero', label: 'Plomero' },
    { id: 'especialista_solar', label: 'Energía Solar' },
    { id: 'ascensores', label: 'Ascensores' },
    { id: 'contra_incendio', label: 'Sist. Incendio' },
    { id: 'refrigeracion', label: 'Refrigeración' },
    { id: 'plantas_electricas', label: 'Plantas Eléc.' },
    { id: 'jardineria', label: 'Jardinería' },
    { id: 'piscinas', label: 'Piscinas' },
    { id: 'domotica', label: 'Smart Home' },
    { id: 'lavado_muebles', label: 'Lavado Muebles' },
    { id: 'albanileria', label: 'Albañilería' },
    { id: 'limpieza', label: 'Limpieza' },
    { id: 'reparacion_hogar', label: 'Reparación Hogar' },
    { id: 'entrenador', label: 'Entrenador' },
    { id: 'masajista', label: 'Masajista' },
    { id: 'chef', label: 'Chef Privado' },
    { id: 'fotografo', label: 'Fotógrafo' },
    { id: 'mascotas', label: 'Mascotas' },
    { id: 'legal', label: 'Legal' },
    { id: 'contabilidad', label: 'Contabilidad' }
  ];

  const filteredTechnicians = technicians.filter(t => {
    const matchesCategory = marketFilter === 'all' || (t.category && normalizeText(t.category) === marketFilter);
    const matchesSearch = (t.name?.toLowerCase() || '').includes(marketSearchQuery.toLowerCase()) ||
                         (t.title?.toLowerCase() || '').includes(marketSearchQuery.toLowerCase()) ||
                         (t.location?.toLowerCase() || '').includes(marketSearchQuery.toLowerCase());
    const matchesLevel = (t.verificationLevel || 1) >= requiredVerificationLevel;
    return matchesCategory && matchesSearch && matchesLevel;
  });

  const handleFindExpertForAsset = (asset: Asset) => {
    const reqLevel = asset.riskLevel === 'high' ? 3 : (asset.riskLevel === 'medium' ? 2 : 1);
    setRequiredVerificationLevel(reqLevel);
    setTab('client', 'marketplace');
  };

  const requestsWithChat = requests.filter(r => ['quoted', 'accepted', 'executing', 'completed'].includes(r.status));

  React.useEffect(() => {
    if (!activeChatRequestId && requestsWithChat.length > 0) {
      setActiveChatRequestId(requestsWithChat[0].id);
    }
  }, [requestsWithChat, activeChatRequestId]);

  React.useEffect(() => {
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
              {/* Bienvenido Banner Movido Arriba */}
              <VerticalDashboard
                assets={assets}
                requests={requests}
                userName={userData?.name || 'Usuario'}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {assets.filter(a =>
                  a.name.toLowerCase().includes(assetSearchQuery.toLowerCase()) ||
                  a.licensePlate?.toLowerCase().includes(assetSearchQuery.toLowerCase())
                ).length > 0 ? (
                  assets.filter(a =>
                    a.name.toLowerCase().includes(assetSearchQuery.toLowerCase()) ||
                    a.licensePlate?.toLowerCase().includes(assetSearchQuery.toLowerCase())
                  ).slice((assetCurrentPage - 1) * assetPageSize, assetCurrentPage * assetPageSize).map(a => (
                    <AssetIntelligentCard
                      key={a.id}
                      asset={a}
                      requests={requests}
                      onOpenDetails={(asset) => openModal('fuel', { asset })}
                      onOpenPreTrip={(asset) => openModal('preTrip', { asset })}
                      onFindExpert={handleFindExpertForAsset}
                    />
                  ))
                ) : (
                  <div className="col-span-full py-24 bg-[#121317] border border-dashed border-white/5 rounded-[3rem] text-center space-y-6">
                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto opacity-20">
                       <Package className="w-10 h-10 text-white" />
                    </div>
                    <div className="space-y-2">
                       <h3 className="text-sm font-black text-white uppercase tracking-widest">Sin Equipos Registrados</h3>
                       <p className="text-[10px] text-[#474556] font-black uppercase tracking-[0.3em] max-w-xs mx-auto">Comience registrando su primer activo (Vehículo, A/C, Planta Eléctrica) para iniciar el monitoreo inteligente.</p>
                    </div>
                    <button onClick={() => openModal('asset')} className="px-8 py-3 bg-[#5d3cfe] text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-[#5d3cfe]/20">Registrar Ahora</button>
                  </div>
                )}
              </div>

              {/* Fuel Audit solo se muestra si hay activos relevantes (Car, Moto, Generator) */}
              {assets.some(a => ['car', 'moto', 'generator'].includes(a.type)) && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <FuelAuditModule
                    assets={assets.filter(a => ['car', 'moto', 'generator'].includes(a.type))}
                    onSaveLog={() => {}}
                  />
                  <HomeEmergencySOS />
                </div>
              )}
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

      {clientTab === 'warranties' && <WarrantyVaultModule assets={assets} onNavigate={(t) => setTab('client', t)} />}

      {clientTab === 'marketplace' && (
        <div className="space-y-10">
          <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div className="flex-1 w-full">
               <h1 className="text-4xl font-black text-white uppercase tracking-tighter leading-none mb-6">Marketplace <span className="text-[#5d3cfe]">Expertos</span></h1>

               {/* BARRA DE BÚSQUEDA RÁPIDA */}
               <div className="relative mb-6">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#474556]" />
                  <input
                    type="text"
                    placeholder="Busca por nombre, especialidad o zona (Paitilla, Costa del Este...)"
                    value={marketSearchQuery}
                    onChange={(e) => setMarketSearchQuery(e.target.value)}
                    className="w-full bg-[#121317] border border-[#2a2b2f] rounded-[1.5rem] py-5 pl-16 pr-6 text-sm font-bold text-white focus:border-[#5d3cfe] outline-none transition-all shadow-inner"
                  />
               </div>

               {/* FILTRO DE INGENIERÍA ACTIVO */}
               {requiredVerificationLevel > 1 && (
                 <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-between animate-fade-in">
                    <div className="flex items-center gap-3">
                       <ShieldCheck className="w-5 h-5 text-amber-500" />
                       <p className="text-[10px] font-black text-white uppercase tracking-widest">
                          Filtro de Seguridad: Mostrando solo especialistas <span className="text-amber-500">{requiredVerificationLevel === 3 ? 'MASTER' : 'SENIOR'}</span>
                       </p>
                    </div>
                    <button
                      onClick={() => setRequiredVerificationLevel(1)}
                      className="px-4 py-1.5 bg-amber-500 text-black rounded-lg text-[8px] font-black uppercase tracking-widest hover:brightness-110 transition-all"
                    >
                       Quitar Filtro
                    </button>
                 </div>
               )}

               {/* SELECTOR DE CATEGORÍAS TÁCTICO */}
               <div className="flex gap-3 overflow-x-auto pb-4 custom-scrollbar">
                 {categories.map(c => (
                   <button
                     key={c.id}
                     onClick={() => setMarketFilter(c.id as any)}
                     className={`flex-shrink-0 px-8 py-3 rounded-full border transition-all text-[10px] font-black uppercase tracking-widest ${marketFilter === c.id ? 'bg-[#5d3cfe] border-[#5d3cfe] text-white shadow-xl shadow-[#5d3cfe]/20' : 'border-[#2a2b2f] text-[#c8c4d9] hover:border-[#5d3cfe]'}`}
                   >
                     {c.label}
                   </button>
                 ))}
               </div>
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
               {filteredTechnicians.length > 0 ? filteredTechnicians.map(t => (
                 <div key={t.id} className="bg-[#121317] border border-[#2a2b2f] p-8 rounded-[3rem] flex flex-col gap-6 relative overflow-hidden group hover:border-[#5d3cfe]/50 transition-all shadow-2xl">
                    {/* ... (resto de la tarjeta se mantiene igual) ... */}
                    <div className="flex items-center gap-5">
                       <div className="w-16 h-16 rounded-2xl bg-[#1c1d21] border border-[#2a2b2f] flex items-center justify-center text-[#c7bfff] font-black text-2xl shadow-inner relative overflow-hidden">
                          {t.profileImage ? (
                             <img src={t.profileImage} className="w-full h-full object-cover" alt={t.name} />
                          ) : (
                             t.name[0]
                          )}
                          {t.verificationLevel === 3 && <div className="absolute -top-2 -right-2 bg-amber-500 p-1.5 rounded-lg shadow-lg border border-white/20 animate-bounce z-10"><Shield className="w-3 h-3 text-black" /></div>}
                       </div>
                       <div>
                          <h4 className="font-black text-white text-base uppercase tracking-tight">{t.name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                             <p className="text-[10px] font-black text-[#52ffac] uppercase tracking-[0.2em]">{t.category.replace('_',' ')}</p>
                             <span className={`px-2 py-0.5 rounded-md text-[7px] font-black uppercase ${t.verificationLevel === 3 ? 'bg-amber-500/20 text-amber-500' : t.verificationLevel === 2 ? 'bg-indigo-500/20 text-indigo-400' : 'bg-white/5 text-white/40'}`}>
                                {t.verificationLevel === 3 ? 'Master' : t.verificationLevel === 2 ? 'Senior' : 'Básico'}
                             </span>
                          </div>
                       </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 py-4 border-y border-[#2a2b2f]/50 bg-[#0d0e12]/30 px-4 rounded-2xl text-center">
                       <div>
                          <div className="text-amber-500 font-black text-sm flex items-center justify-center gap-1">
                             <Star className="w-3 h-3 fill-amber-400" /> {t.rating || 5}
                          </div>
                          <span className="text-[8px] text-[#474556] font-bold uppercase">Rating</span>
                       </div>
                       <div>
                          <div className="text-white font-black text-sm">{t.experienceYears || 0}a</div>
                          <span className="text-[8px] text-[#474556] font-bold uppercase">Exp.</span>
                       </div>
                       <div>
                          <div className="text-[#52ffac] font-black text-sm">${t.hourlyRate || 0}</div>
                          <span className="text-[8px] text-[#474556] font-bold uppercase">Hr.</span>
                       </div>
                    </div>
                    <button onClick={() => openModal('tech', { tech: t })} className="w-full py-4 bg-[#1c1d21] hover:bg-[#5d3cfe] text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-lg active:scale-[0.98]">Ver Perfil & Agendar</button>
                 </div>
               )) : (
                 <div className="col-span-full py-20 bg-[#121317] border border-dashed border-white/5 rounded-[3rem] text-center opacity-40">
                   <p className="text-xs font-black uppercase tracking-widest italic">No se encontraron especialistas con los filtros actuales.</p>
                 </div>
               )}
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
            {requests.filter(r => r.status !== 'open_bidding').length > 0 ? (
              requests.filter(r => r.status !== 'open_bidding').map(req => (
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
              ))
            ) : (
              <div className="py-32 bg-[#121317] border border-dashed border-white/5 rounded-[4rem] text-center space-y-6">
                 <FileCheck2 className="w-16 h-16 text-[#474556] mx-auto opacity-20" />
                 <div className="space-y-2">
                    <h3 className="text-lg font-black text-white uppercase tracking-widest italic">Sin Contratos</h3>
                    <p className="text-[10px] text-[#474556] font-black uppercase tracking-[0.3em] max-w-sm mx-auto">
                       Sus servicios activos aparecerán aquí. Solicite una cotización en el Marketplace para iniciar.
                    </p>
                 </div>
                 <button onClick={() => setTab('client', 'marketplace')} className="px-10 py-3.5 bg-white/5 border border-white/10 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#5d3cfe] transition-all">Ir al Marketplace ➔</button>
              </div>
            )}
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
        <div className="h-[600px] flex flex-col md:flex-row gap-6 animate-fade-in-up">
           {/* Lista de Chats Activos */}
           <div className="w-full md:w-80 bg-[#121317] border border-white/5 rounded-[2.5rem] flex flex-col overflow-hidden shrink-0 shadow-2xl">
              <div className="p-6 border-b border-white/5 bg-white/[0.02]">
                 <h3 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Canales Técnicos</h3>
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
                       <p className="text-sm font-black truncate uppercase tracking-tight">{r.techName}</p>
                    </button>
                 ))}
                 {requestsWithChat.length === 0 && (
                    <div className="py-20 text-center space-y-4 opacity-20">
                       <MessageSquare className="w-8 h-8 mx-auto" />
                       <p className="text-[8px] font-black uppercase tracking-[0.3em]">Sin chats activos</p>
                    </div>
                 )}
              </div>
           </div>

           {/* Ventana de Mensajería */}
           <div className="flex-1 min-w-0 h-[500px] md:h-full">
              <SupportChatWidget
                role="client"
                request={activeRequestForChat || null}
                messages={chatMessages}
                onSendMessage={(txt, img) => {
                  if (!activeChatRequestId) return;
                  addDoc(collection(db, "messages"), {
                    requestId: activeChatRequestId,
                    sender: 'client',
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

      {clientTab === 'audit' && (
        <div className="space-y-10 animate-fade-in">
           <header className="flex justify-between items-end">
              <div>
                 <h1 className="text-4xl font-black text-white uppercase tracking-tighter">Módulo de <span className="text-[#5d3cfe]">Auditoría</span></h1>
                 <p className="text-[10px] text-[#474556] font-black uppercase tracking-[0.3em] mt-2">Cumplimiento Técnico e Industrial</p>
              </div>
              {subscription.planId === 'plan-enterprise' && (
                <button
                  onClick={() => {
                    const data = assets.map(a => ({ 'ACTIVO': a.name, 'ULT_MTTO': a.lastMaintenanceDate, 'ESTADO': 'VERIFICADO' }));
                    const ws = XLSX.utils.json_to_sheet(data);
                    const wb = XLSX.utils.book_new();
                    XLSX.utils.book_append_sheet(wb, ws, "Auditoria_Mensual");
                    XLSX.writeFile(wb, `Auditoria_Mensual_${new Date().getMonth()+1}_2026.xlsx`);
                    toast.success("Auditoría Mensual Firmada generada (Formato Industrial).");
                  }}
                  className="px-8 py-4 bg-amber-500 text-black rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
                >
                  <FileCheck2 className="w-4 h-4" /> Generar Auditoría Mensual Firmada
                </button>
              )}
           </header>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Aquí irían las tarjetas de auditoría existentes o un resumen de cumplimiento */}
              <div className="p-8 bg-[#121317] border border-white/5 rounded-[2.5rem] space-y-4">
                 <div className="w-12 h-12 rounded-2xl bg-[#52ffac]/10 flex items-center justify-center text-[#52ffac]">
                    <ShieldCheck className="w-6 h-6" />
                 </div>
                 <h4 className="text-lg font-black text-white uppercase tracking-tight">Índice de Operatividad</h4>
                 <p className="text-4xl font-black text-[#52ffac] tracking-tighter">98.4%</p>
                 <p className="text-[9px] text-[#474556] font-bold uppercase">Meta Industrial: &gt;95%</p>
              </div>
           </div>
        </div>
      )}

      {clientTab === 'team' && (
        <div className="max-w-4xl mx-auto space-y-12 animate-fade-in pb-20">
           <header className="text-center space-y-3 italic">
              <h1 className="text-5xl font-black text-white uppercase tracking-tighter leading-none italic">Gestión de <span className="text-amber-500">Equipo</span></h1>
              <p className="text-[10px] text-[#474556] font-black uppercase tracking-[0.4em]">Multi-Administrador / Nodos de Operación PH</p>
           </header>

           <div className="bg-[#121317] border border-white/5 p-10 rounded-[3rem] space-y-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-12 opacity-5"><Users className="w-48 h-48 text-amber-500" /></div>

              <div className="flex justify-between items-center relative z-10">
                 <div className="space-y-1">
                    <h3 className="text-xl font-black text-white uppercase tracking-tight italic">Administradores de Nodo</h3>
                    <p className="text-[10px] text-[#474556] font-bold uppercase tracking-widest italic">Personal con acceso a gestión de activos</p>
                 </div>
                 <button onClick={() => toast("Funcionalidad disponible en la próxima actualización de seguridad.", { icon: '🚀' })} className="px-8 py-3 bg-white/5 border border-white/10 text-white rounded-2xl text-[9px] font-black uppercase hover:bg-white/10 transition-all">+ Añadir Miembro</button>
              </div>

              <div className="space-y-3">
                 <div className="p-6 bg-white/5 border border-white/5 rounded-3xl flex items-center justify-between group hover:border-amber-500/30 transition-all">
                    <div className="flex items-center gap-5">
                       <div className="w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center text-black font-black text-sm shadow-lg shadow-amber-500/20">
                          {loggedInName[0]}
                       </div>
                       <div>
                          <p className="text-sm font-black text-white uppercase tracking-tight">{loggedInName}</p>
                          <p className="text-[9px] text-amber-500 font-bold uppercase tracking-widest italic leading-none mt-1">Super Administrador (Propietario)</p>
                       </div>
                    </div>
                    <div className="px-4 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full text-[8px] font-black text-amber-500 uppercase tracking-widest">Activo</div>
                 </div>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-8 bg-[#1c1d21] border border-white/5 rounded-[2.5rem] space-y-4">
                 <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400">
                    <PieChart className="w-6 h-6" />
                 </div>
                 <h4 className="text-sm font-black text-white uppercase tracking-widest italic">Auditoría de Acciones</h4>
                 <p className="text-[10px] text-[#c8c4d9] font-medium leading-relaxed opacity-60">Rastree qué administrador registró un activo o aprobó un mantenimiento en tiempo real.</p>
              </div>
              <div className="p-8 bg-[#1c1d21] border border-white/5 rounded-[2.5rem] space-y-4">
                 <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400">
                    <Building2 className="w-6 h-6" />
                 </div>
                 <h4 className="text-sm font-black text-white uppercase tracking-widest italic">Nodos PH / Sede</h4>
                 <p className="text-[10px] text-[#c8c4d9] font-medium leading-relaxed opacity-60">Segmente sus activos por ubicación (Ej: Torre 1, Sótano, Depósito) y asigne encargados específicos.</p>
              </div>
           </div>
        </div>
      )}

      {clientTab === 'settings' && (
        <div className="max-w-3xl mx-auto space-y-12 pb-20 animate-fade-in text-center">
           <header className="space-y-4">
              <h2 className="text-4xl font-black text-white uppercase tracking-tighter">{t('settings_title_client', 'Ajustes de Cuenta')}</h2>
              <p className="text-[10px] font-black text-[#474556] uppercase tracking-[0.3em]">{t('settings_desc_client', 'Gestión de Seguridad e Identidad')}</p>
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
              mantechId={{ status: userData?.recordStatus || 'unverified', idNumber: '' }}
              onUpload={() => {}}
              role="client"
              cedula={userData?.cedula}
              plan={subscription.planId}
           />
           <button onClick={logout} className="px-12 py-4 border border-rose-500/30 text-rose-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all shadow-xl mt-12">Cerrar Sesión Segura</button>
        </div>
      )}
    </div>
  );
}
