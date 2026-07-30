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
  Store, FileCheck2, FileText, Star, MessageSquare, ArrowRight, Video, MapPin, Activity, Shield,
  Users, PieChart, Building2, ShieldAlert, Fuel, History, Calendar, Clock, Timer
} from 'lucide-react';
import FleetDashboard from '../../components/FleetDashboard';
import DiagnosticAIView from '../../components/DiagnosticAIView';
import WarrantyVaultModule from '../../components/WarrantyVaultModule';
import InventoryModule from '../../components/InventoryModule';
import SubscriptionModule from '../../components/SubscriptionModule';
import SupportChatWidget from '../../components/SupportChatWidget';
import MantechIDModule from '../../components/MantechIDModule';
import TechnicianRadar from '../../components/TechnicianRadar';
import * as XLSX from 'xlsx';
import { useTranslation } from 'react-i18next';
import { PayPalButtons } from "@paypal/react-paypal-js";
import { doc, deleteDoc, updateDoc, collection, addDoc, serverTimestamp, query, where, onSnapshot, orderBy } from 'firebase/firestore';
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
  const [isHomeSOSOpen, setIsHomeSOSOpen] = useState(false);
  const [minRatingFilter, setMinRatingFilter] = useState<number>(0);

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

    // Búsqueda Inteligente: Incluye nombre, título, ubicación y CATEGORÍA
    const searchTerm = marketSearchQuery.toLowerCase();
    const matchesSearch =
      (t.name?.toLowerCase() || '').includes(searchTerm) ||
      (t.title?.toLowerCase() || '').includes(searchTerm) ||
      (t.location?.toLowerCase() || '').includes(searchTerm) ||
      (t.category?.toLowerCase() || '').includes(searchTerm.replace('é','e').replace('á','a'));

    const matchesLevel = (t.verificationLevel || 1) >= requiredVerificationLevel;
    const matchesRating = (t.rating || 0) >= minRatingFilter;
    return matchesCategory && matchesSearch && matchesLevel && matchesRating;
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
                onSeeAll={() => setTab('client', 'inventory')}
                onOpenAssetReport={(asset) => openModal('engineeringReport', { asset })}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                      onEdit={(asset) => openModal('asset', { asset })}
                      onDelete={business.handleDeleteAsset}
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
                    onSaveLog={business.handleAddFuelLog}
                  />
                  <HomeEmergencySOS
                    isOpen={isHomeSOSOpen}
                    onClose={() => setIsHomeSOSOpen(false)}
                    assets={assets}
                    technicians={technicians}
                    onCallTech={(tech) => {
                      business.handleRequestQuote(tech.id, assets[0]?.id || 'unknown', "EMERGENCIA SOS 24/7");
                      setIsHomeSOSOpen(false);
                    }}
                  />

                  {/* Tarjeta de Disparo SOS */}
                  <div
                    onClick={() => setIsHomeSOSOpen(true)}
                    className="bg-rose-600/10 border border-rose-600/30 rounded-[3rem] p-10 flex flex-col items-center justify-center gap-6 cursor-pointer hover:bg-rose-600/20 transition-all group relative overflow-hidden"
                  >
                     <div className="absolute top-0 right-0 w-32 h-32 bg-rose-600 opacity-5 blur-3xl rounded-full translate-x-10 -translate-y-10 group-hover:scale-150 transition-transform"></div>
                     <div className="w-20 h-20 bg-rose-600 rounded-full flex items-center justify-center text-white shadow-2xl shadow-rose-600/40 group-hover:scale-110 transition-all animate-pulse">
                        <ShieldAlert className="w-10 h-10" />
                     </div>
                     <div className="text-center space-y-2 relative z-10">
                        <h4 className="text-2xl font-black text-white uppercase tracking-tighter italic">Botón de Pánico SOS</h4>
                        <p className="text-[10px] font-bold text-rose-400 uppercase tracking-[0.3em]">Asistencia Técnica Crítica 24/7</p>
                     </div>
                     <div className="px-6 py-2 bg-rose-600 text-white rounded-full text-[9px] font-black uppercase tracking-widest group-hover:bg-white group-hover:text-rose-600 transition-colors">
                        Activar Protocolo
                     </div>
                  </div>
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
          <header className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6">
            <div className="flex-1 w-full min-w-0">
               <h1 className="text-4xl font-black text-white uppercase tracking-tighter leading-none mb-6">Marketplace <span className="text-[#5d3cfe]">Expertos</span></h1>

               {/* BARRA DE BÚSQUEDA Y FILTRO RATING */}
               <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#474556]" />
                    <input
                      type="text"
                      placeholder="Busca por nombre, especialidad o zona..."
                      value={marketSearchQuery}
                      onChange={(e) => setMarketSearchQuery(e.target.value)}
                      className="w-full bg-[#121317] border border-[#2a2b2f] rounded-[1.5rem] py-5 pl-16 pr-6 text-sm font-bold text-white focus:border-[#5d3cfe] outline-none transition-all shadow-inner"
                    />
                  </div>

                  <div className="bg-[#121317] border border-[#2a2b2f] rounded-[1.5rem] p-2 flex items-center gap-3 px-6 shadow-inner">
                     <div className="flex flex-col">
                        <span className="text-[7px] font-black text-[#5d3cfe] uppercase tracking-widest">Filtrar por</span>
                        <span className="text-[9px] font-black text-[#474556] uppercase tracking-widest">{minRatingFilter === 0 ? 'Cualquier Calificación' : `Mínimo ${minRatingFilter}.0 Estrellas`}</span>
                     </div>
                     <div className="flex gap-1 ml-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                           <button
                             key={star}
                             onClick={() => setMinRatingFilter(minRatingFilter === star ? 0 : star)}
                             className="transition-transform active:scale-90"
                           >
                             <Star
                               className={`w-5 h-5 ${minRatingFilter >= star ? 'text-amber-500 fill-amber-500' : 'text-[#2a2b2f]'} hover:text-amber-400`}
                             />
                           </button>
                        ))}
                     </div>
                  </div>
               </div>

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

               <div className="flex gap-4 overflow-x-auto pb-6 px-4 -mx-4 custom-scrollbar">
                 {categories.map(c => (
                   <button
                     key={c.id}
                     onClick={() => setMarketFilter(c.id as any)}
                     className={`flex-shrink-0 px-8 py-3 rounded-full border transition-all text-[10px] font-black uppercase tracking-widest ${marketFilter === c.id ? 'bg-[#5d3cfe] border-[#5d3cfe] text-white shadow-xl shadow-[#5d3cfe]/20' : 'border-[#2a2b2f] text-[#c8c4d9] hover:border-[#5d3cfe]'}`}
                   >
                     {c.label}
                   </button>
                 ))}
                 <div className="w-10 shrink-0 h-1"></div>
               </div>
            </div>

            {/* SELECTOR DE VISTA CORREGIDO */}
            <div className="bg-[#1c1d21] p-2 rounded-[1.5rem] border border-[#2a2b2f] flex gap-1 shrink-0 w-full xl:w-auto overflow-x-auto mb-6 xl:mb-0 custom-scrollbar-hidden">
               {[
                 { id: 'list', label: 'Listado', icon: LayoutDashboard },
                 { id: 'radar', label: 'Radar Satelital', icon: Globe },
                 { id: 'bidding', label: 'Subasta Pública', icon: Layers }
               ].map(mode => (
                 <button
                   key={mode.id}
                   onClick={() => setMarketViewMode(mode.id as any)}
                   className={`flex-1 xl:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all whitespace-nowrap ${marketViewMode === mode.id ? 'bg-[#5d3cfe] text-white shadow-lg' : 'text-[#474556] hover:text-[#c8c4d9]'}`}
                 >
                   <mode.icon className="w-3.5 h-3.5" />
                   {mode.label}
                 </button>
               ))}
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

                       {/* DETALLES DE PUJAS REALES */}
                       <div className="bg-[#0d0e12] p-5 rounded-2xl border border-white/5 space-y-4">
                          <div className="flex justify-between items-center mb-2">
                             <h5 className="text-[10px] font-black text-[#474556] uppercase tracking-widest">Propuestas Recibidas</h5>
                             <span className="px-2 py-0.5 bg-[#52ffac]/10 text-[#52ffac] rounded text-[8px] font-black">{req.bids?.length || 0}</span>
                          </div>

                          {(req.bids || []).length > 0 ? (
                            <div className="space-y-3">
                               {req.bids?.map((bid, bIdx) => (
                                 <div key={bIdx} className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5 group/bid">
                                    <div>
                                       <p className="text-[11px] font-black text-white uppercase">{bid.techName}</p>
                                       <p className="text-[8px] text-[#474556] font-bold uppercase mt-0.5">Arribo en {bid.time}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                       <span className="text-sm font-black text-[#52ffac]">${bid.price}</span>
                                       <button
                                         onClick={() => {
                                           if(window.confirm(`¿Aceptas la oferta de ${bid.techName} por $${bid.price}?`)) {
                                             business.handleAcceptBid(req.id, bid);
                                           }
                                         }}
                                         className="p-2 bg-[#5d3cfe] text-white rounded-lg opacity-0 group-hover/bid:opacity-100 transition-all"
                                       >
                                          <Check className="w-3 h-3" />
                                       </button>
                                    </div>
                                 </div>
                               ))}
                            </div>
                          ) : (
                            <div className="py-4 text-center">
                               <div className="w-6 h-6 border-2 border-[#5d3cfe]/20 border-t-[#5d3cfe] rounded-full animate-spin mx-auto mb-2"></div>
                               <p className="text-[8px] text-[#474556] font-bold uppercase tracking-widest">Esperando respuesta de especialistas...</p>
                            </div>
                          )}
                       </div>

                       <div className="pt-2 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                             <div className="w-1.5 h-1.5 bg-[#52ffac] rounded-full animate-ping"></div>
                             <span className="text-[9px] font-black text-[#474556] uppercase tracking-widest">Sincronización Satelital Activa</span>
                          </div>
                          <button
                            onClick={() => { if(window.confirm("¿Cancelar subasta?")) business.handleCancelRequest(req.id); }}
                            className="text-[9px] font-black text-rose-500 uppercase hover:text-rose-400"
                          >
                            Anular Ticket
                          </button>
                       </div>
                    </div>
                 ))}
                 {requests.filter(r => r.status === 'open_bidding').length === 0 && (
                   <div className="col-span-full py-20 bg-[#121317] border border-dashed border-white/5 rounded-[3rem] text-center opacity-30">
                      <Layers className="w-10 h-10 mx-auto mb-4" />
                      <p className="text-[10px] font-black uppercase tracking-[0.3em]">No tienes subastas activas en este momento</p>
                   </div>
                 )}
              </div>
            </div>
          ) : marketViewMode === 'radar' ? (
            <TechnicianRadar
              technicians={technicians}
              assets={assets}
              onSelectTech={(t) => openModal('tech', { tech: t })}
            />
          ) : (
             <div className="py-20 text-center opacity-20 uppercase tracking-widest text-[10px] font-black italic animate-pulse">Iniciando sistema de radar satelital...</div>
          )}
        </div>
      )}

      {clientTab === 'quotes' && (
        <div className="space-y-12 animate-fade-in-up">
          <div className="flex flex-col md:flex-row justify-between items-end gap-6">
            <header><h1 className="text-4xl font-black text-white tracking-tighter uppercase">Gestión de <span className="text-[#52ffac]">Contratos</span></h1></header>

            {/* RESUMEN DE GASTOS UNIFICADO */}
            <div className="flex gap-4">
               <div className="bg-[#1c1d21] border border-white/5 p-4 rounded-2xl flex flex-col items-end shadow-xl">
                  <span className="text-[7px] font-black text-[#474556] uppercase tracking-[0.2em]">Inversión Gasolina</span>
                  <span className="text-lg font-black text-[#52ffac] leading-none mt-1">
                    ${assets.reduce((sum, a) => sum + (a.fuelLogs || []).reduce((s, l) => s + (l.price || 0), 0), 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
               </div>
               <div className="bg-[#1c1d21] border border-white/5 p-4 rounded-2xl flex flex-col items-end shadow-xl">
                  <span className="text-[7px] font-black text-[#474556] uppercase tracking-[0.2em]">Servicios Técnicos</span>
                  <span className="text-lg font-black text-[#5d3cfe] leading-none mt-1">
                    ${requests.filter(r => r.status === 'completed' || r.status === 'rated').reduce((sum, r) => sum + (r.price || 0), 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
               </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* COLUMNA IZQUIERDA: CONTRATOS Y SERVICIOS */}
            <div className="lg:col-span-2 space-y-6">
              <h3 className="text-[10px] font-black text-[#474556] uppercase tracking-[0.3em] ml-2 flex items-center gap-2">
                 <FileText className="w-3.5 h-3.5" /> Tickets de Servicio
              </h3>
              {requests.filter(r => r.status !== 'open_bidding').length > 0 ? (
                requests.filter(r => r.status !== 'open_bidding').map(req => (
                  <div key={req.id} className="bg-[#121317] border border-white/5 p-8 rounded-[2.5rem] space-y-8 shadow-2xl relative overflow-hidden group hover:border-white/10 transition-all">
                    <div className="flex justify-between items-center relative z-10">
                      <div>
                        <div className="flex items-center gap-3">
                           <h4 className="font-black text-white text-xl uppercase tracking-tighter leading-none">{req.assetName}</h4>
                           {req.assetPlate && (
                             <span className="px-2 py-0.5 bg-[#5d3cfe]/10 border border-[#5d3cfe]/20 rounded text-[7px] font-black text-[#c7bfff] uppercase tracking-widest">{req.assetPlate}</span>
                           )}
                           <span className="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-[7px] font-mono text-[#474556] uppercase">ID: {req.id.slice(-4).toUpperCase()}</span>
                        </div>
                        <p className="text-[8px] font-bold text-[#474556] uppercase tracking-widest mt-2">
                           {req.techName} • SOLICITUD: {(() => {
                              const d = (req.createdAt as any)?.toDate?.() || new Date(req.createdAt);
                              return isNaN(d.getTime()) ? '---' : `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}`;
                           })()}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        {(req.status === 'pending' || req.status === 'quoted') && (
                          <button
                            onClick={() => {
                              if(window.confirm("¿Deseas cancelar esta solicitud de servicio definitivamente?")) {
                                business.handleCancelRequest(req.id);
                              }
                            }}
                            className="p-2 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-xl transition-all group/cancel"
                            title="Cancelar Solicitud"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <span className="px-4 py-1.5 bg-[#1c1d21] border border-white/5 rounded-full text-[9px] font-black text-[#52ffac] uppercase tracking-widest shadow-inner">
                          {getStatusLabel(req.status)}
                        </span>
                      </div>
                    </div>
                    {req.status === 'quoted' && (
                      <div className="space-y-6 animate-fade-in">
                        {/* HEADER DE CITA SUGERIDA */}
                        <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                           <div className={`bg-[#1c1d21] border p-4 rounded-2xl shrink-0 flex items-center gap-3 ${req.scheduledDate !== req.clientRequestedDate ? 'border-amber-500/30' : 'border-white/5'}`}>
                              <Calendar className={`w-4 h-4 ${req.scheduledDate !== req.clientRequestedDate ? 'text-amber-500' : 'text-[#5d3cfe]'}`} />
                              <div>
                                 <p className="text-[7px] font-black text-[#474556] uppercase">Cita Propuesta</p>
                                 <p className={`text-[10px] font-black uppercase ${req.scheduledDate !== req.clientRequestedDate ? 'text-amber-500' : 'text-white'}`}>
                                    {req.scheduledDate ? new Date(req.scheduledDate).toLocaleDateString() : 'Por definir'}
                                 </p>
                                 {req.scheduledDate !== req.clientRequestedDate && req.clientRequestedDate && (
                                   <p className="text-[6px] font-bold text-[#474556] line-through uppercase">Original: {new Date(req.clientRequestedDate).toLocaleDateString()}</p>
                                 )}
                              </div>
                           </div>
                           <div className="bg-[#1c1d21] border border-white/5 p-4 rounded-2xl shrink-0 flex items-center gap-3">
                              <Clock className="w-4 h-4 text-[#5d3cfe]" />
                              <div>
                                 <p className="text-[7px] font-black text-[#474556] uppercase">Hora de Arribo</p>
                                 <p className="text-[10px] font-black text-white uppercase">{req.scheduledTime || '09:00'} {Number(req.scheduledTime?.split(':')[0] || 0) >= 12 ? 'PM' : 'AM'}</p>
                              </div>
                           </div>
                           <div className="bg-[#1c1d21] border border-white/5 p-4 rounded-2xl shrink-0 flex items-center gap-3">
                              <Timer className="w-4 h-4 text-[#5d3cfe]" />
                              <div>
                                 <p className="text-[7px] font-black text-[#474556] uppercase">Duración Est.</p>
                                 <p className="text-[10px] font-black text-white uppercase">{req.scheduledDuration || 2} Horas</p>
                              </div>
                           </div>
                           {req.paymentDeadlineAt && (
                             <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl shrink-0 flex items-center gap-3 animate-pulse">
                                <AlertTriangle className="w-4 h-4 text-rose-500" />
                                <div>
                                   <p className="text-[7px] font-black text-rose-500 uppercase">Límite de Pago</p>
                                   <p className="text-[10px] font-black text-white uppercase">
                                      {new Date(req.paymentDeadlineAt).toLocaleString('es-PA', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', hour12: true })}
                                   </p>
                                </div>
                             </div>
                           )}
                        </div>

                        <div className="bg-[#1c1d21] p-6 rounded-3xl border border-white/5 space-y-4 shadow-inner">
                           <div className="flex items-center gap-3">
                              <div className="p-2 bg-[#5d3cfe]/10 rounded-lg text-[#5d3cfe]">
                                 <BrainCircuit className="w-4 h-4" />
                              </div>
                              <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Diagnóstico y Ventajas (Pros)</h4>
                           </div>
                           <p className="text-xs text-[#c8c4d9] italic leading-relaxed">
                              {req.techNotes || "El especialista no ha brindado detalles adicionales. Puede solicitar más información vía chat."}
                           </p>

                           {/* LISTA DE TAREAS (CHECKLIST) */}
                           {req.checklist && req.checklist.length > 0 && (
                             <div className="pt-4 border-t border-white/5 space-y-3">
                                <p className="text-[8px] font-black text-[#474556] uppercase tracking-[0.2em]">Plan de Trabajo:</p>
                                <div className="grid grid-cols-1 gap-2">
                                   {req.checklist.map((t, tIdx) => (
                                     <div key={tIdx} className="flex items-center gap-2 text-[10px] text-white/80 font-bold uppercase">
                                        <CheckCircle2 className="w-3 h-3 text-[#52ffac]" />
                                        <span>{t.description}</span>
                                     </div>
                                   ))}
                                </div>
                             </div>
                           )}

                           {req.materials && req.materials.length > 0 && (
                             <div className="pt-4 border-t border-white/5 space-y-3">
                                <p className="text-[8px] font-black text-[#474556] uppercase tracking-[0.2em]">Materiales Incluidos:</p>
                                <div className="grid grid-cols-1 gap-2">
                                   {req.materials.map((m, mIdx) => (
                                     <div key={mIdx} className="flex justify-between items-center text-[10px] text-white/80 font-bold uppercase">
                                        <span>• {m.name} (x{m.quantity})</span>
                                        <span className="text-[#52ffac]">${(m.price * m.quantity).toFixed(2)}</span>
                                     </div>
                                   ))}
                                </div>
                             </div>
                           )}
                        </div>

                        <div className="bg-[#5d3cfe]/10 p-6 rounded-[2rem] border border-[#5d3cfe]/20 flex flex-col sm:flex-row justify-between items-center gap-6">
                           <div className="text-center sm:text-left">
                              <p className="text-[8px] font-black text-[#c7bfff] uppercase tracking-[0.3em] mb-1">Inversión Final Solicitada</p>
                              <h3 className="text-3xl font-black text-white italic tracking-tighter leading-none">${req.price?.toFixed(2)}</h3>
                           </div>
                           <div className="flex gap-3 w-full sm:w-auto">
                              <button
                                onClick={() => {
                                  const reason = prompt("Indique el motivo del rechazo (opcional):");
                                  if (reason !== null) business.handleRejectQuote(req.id, reason || "No aceptado por el cliente");
                                }}
                                className="flex-1 px-6 py-4 bg-white/5 border border-white/10 text-white rounded-2xl text-[9px] font-black uppercase hover:bg-rose-600 transition-all"
                              >
                                Rechazar
                              </button>
                              <button
                                onClick={() => openModal('payment', { request: req })}
                                className="flex-[1.5] px-8 py-4 bg-[#52ffac] text-black rounded-2xl text-[10px] font-black uppercase shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2"
                              >
                                <Check className="w-4 h-4" /> Aceptar y Pagar
                              </button>
                           </div>
                        </div>
                      </div>
                    )}
                    {req.status === 'rejected' && (
                      <div className="bg-rose-500/10 border border-rose-500/30 p-6 rounded-3xl space-y-4">
                         <div className="flex items-center gap-3 text-rose-500">
                            <X className="w-5 h-5" />
                            <h4 className="text-sm font-black uppercase tracking-tighter">Solicitud Denegada</h4>
                         </div>
                         <p className="text-xs text-[#c8c4d9] font-medium leading-relaxed italic">
                            Motivo: "{req.rejectionReason || "El técnico no tiene disponibilidad para esta fecha."}"
                         </p>

                         {/* MOTOR DE CASCADA AUTOMÁTICO */}
                         <div className="pt-4 border-t border-white/5 space-y-4">
                            <p className="text-[9px] font-black text-[#52ffac] uppercase tracking-widest flex items-center gap-2">
                               <Zap className="w-3 h-3 fill-current" /> Alternativas Recomendadas (Alta Calificación)
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                               {business.getRecommendedTechs(assets.find(a => a.id === req.assetId)?.type || 'mecanico', req.techId).map(t => (
                                 <div key={t.id} className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between group">
                                    <div>
                                       <p className="text-[10px] font-black text-white uppercase">{t.name}</p>
                                       <div className="flex items-center gap-1 mt-0.5 text-amber-500">
                                          <Star className="w-2.5 h-2.5 fill-current" />
                                          <span className="text-[8px] font-bold">{t.rating}</span>
                                       </div>
                                    </div>
                                    <button
                                      onClick={() => business.handleRequestQuote(t.id, req.assetId, req.description)}
                                      className="p-2 bg-[#5d3cfe] text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                       <Plus className="w-3 h-3" />
                                    </button>
                                 </div>
                               ))}
                            </div>
                         </div>
                      </div>
                    )}

                    {req.status === 'accepted' && (
                      <div className="bg-[#1c1d21] p-6 rounded-2xl border border-white/5 space-y-4 shadow-2xl">
                         <div className="flex items-center gap-3 text-[#52ffac]">
                            <CheckCircle2 className="w-5 h-5" />
                            <h4 className="text-sm font-black uppercase tracking-tighter">Servicio Confirmado & Pagado</h4>
                         </div>
                         <p className="text-[10px] text-[#c8c4d9] font-medium leading-relaxed">
                            El especialista debe presentarse en la fecha y hora acordadas. Si surge algún inconveniente, puede reportarlo directamente.
                         </p>
                         <button
                           onClick={() => {
                             if(window.confirm("¿Seguro que desea reportar que el técnico NO SE PRESENTÓ a la cita? Esta acción iniciará un protocolo de auditoría.")) {
                               business.handleReportNoShow(req.id);
                             }
                           }}
                           className="w-full py-4 bg-rose-600/10 border border-rose-600/20 text-rose-500 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all"
                         >
                            Reportar Incumplimiento (No llegó)
                         </button>
                      </div>
                    )}

                    {req.status === 'executing' && (
                      <div className="bg-[#1c1d21] p-6 rounded-2xl border border-white/5 space-y-4 shadow-2xl">
                         <div className="flex items-center gap-3 text-[#52ffac]">
                            <Activity className="w-5 h-5 animate-pulse" />
                            <h4 className="text-sm font-black uppercase tracking-tighter">En ejecución técnica</h4>
                         </div>
                         <button onClick={() => openModal('signature', { requestId: req.id })} className="w-full py-4 bg-[#52ffac] text-black rounded-xl text-[9px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all">Finalizar & Liberar Pago</button>
                      </div>
                    )}

                    {req.status === 'disputed' && (
                      <div className="bg-rose-600/10 border border-rose-600/30 p-8 rounded-[2rem] space-y-4 text-center">
                         <div className="w-16 h-16 bg-rose-600 rounded-2xl flex items-center justify-center text-white mx-auto shadow-2xl shadow-rose-600/20">
                            <ShieldAlert className="w-8 h-8" />
                         </div>
                         <h4 className="text-lg font-black text-white uppercase tracking-tighter italic">Bajo Auditoría de Arbitraje</h4>
                         <p className="text-[10px] text-rose-200/60 font-bold uppercase leading-relaxed">
                            Se ha detectado una anomalía o incumplimiento. El Nodo Central está mediando la disputa para proteger sus fondos.
                         </p>
                         <div className="px-6 py-2 bg-rose-600 text-white rounded-full text-[8px] font-black uppercase tracking-widest animate-pulse">Estatus: Bloqueado por Seguridad</div>
                      </div>
                    )}

                    {req.priceAdjustment?.status === 'pending' && (
                      <div className="bg-amber-500/10 border border-amber-500/30 p-6 rounded-3xl space-y-6 animate-pulse hover:animate-none">
                         <div className="flex items-center gap-3">
                            <AlertTriangle className="w-6 h-6 text-amber-500" />
                            <div>
                               <h4 className="text-sm font-black text-white uppercase tracking-tight">Propuesta de Ajuste Presupuestario</h4>
                               <p className="text-[8px] text-amber-500 font-black uppercase tracking-widest">El técnico requiere un cambio de precio</p>
                            </div>
                         </div>

                         <div className="bg-black/40 p-4 rounded-xl space-y-2">
                            <p className="text-[10px] text-[#c8c4d9] font-bold uppercase tracking-widest">Nuevo Total: <span className="text-white">B/. {req.priceAdjustment.newPrice}</span></p>
                            <p className="text-xs text-white/60 italic leading-relaxed">"{req.priceAdjustment.reason}"</p>
                         </div>

                         <div className="flex gap-3">
                            <button
                              onClick={() => business.handleRespondToAdjustment(req.id, false)}
                              className="flex-1 py-4 bg-white/5 border border-white/10 text-white rounded-xl text-[9px] font-black uppercase hover:bg-rose-600"
                            >
                              Rechazar
                            </button>
                            <button
                              onClick={() => business.handleRespondToAdjustment(req.id, true)}
                              className="flex-[1.5] py-4 bg-amber-500 text-black rounded-xl text-[9px] font-black uppercase shadow-xl hover:brightness-110"
                            >
                              Aceptar Nuevo Precio
                            </button>
                         </div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="py-20 bg-[#121317] border border-dashed border-white/5 rounded-[3rem] text-center opacity-40">
                   <p className="text-[10px] font-black uppercase tracking-widest italic">No hay servicios registrados en el nodo.</p>
                </div>
              )}

              {/* NUEVA SECCIÓN: ALERTAS DE SEGURIDAD PRE-VIAJE */}
              <h3 className="text-[10px] font-black text-[#474556] uppercase tracking-[0.3em] ml-2 pt-6 flex items-center gap-2">
                 <ShieldAlert className="w-3.5 h-3.5 text-rose-500" /> Alertas de Seguridad Pre-Viaje
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {assets.some(a => (a.preTripInspections || []).some(i => i.result === 'warning')) ? (
                   assets.flatMap(a => (a.preTripInspections || []).filter(i => i.result === 'warning').map(i => ({ ...i, assetName: a.name }))).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((insp, idx) => (
                    <div key={idx} className="bg-rose-500/5 border border-rose-500/20 p-6 rounded-[2rem] space-y-4 relative overflow-hidden group">
                       <div className="flex justify-between items-start">
                          <div>
                             <h4 className="text-sm font-black text-white uppercase tracking-tight">{insp.assetName}</h4>
                             <p className="text-[8px] text-rose-500 font-black uppercase mt-1">
                                {new Date(insp.date).toLocaleDateString()} • {new Date(insp.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase()} • FALLO DETECTADO
                             </p>
                          </div>
                          <AlertTriangle className="w-5 h-5 text-rose-500 animate-pulse" />
                       </div>

                       <div className="space-y-2">
                          <p className="text-[7px] font-black text-[#474556] uppercase tracking-widest">Puntos Críticos con Fallo:</p>
                          <div className="flex flex-wrap gap-2">
                             {insp.items.filter((i: any) => i.status === 'fail').map((item: any, iIdx: number) => (
                                <span key={iIdx} className="px-2 py-1 bg-rose-500 text-white text-[7px] font-black rounded-md uppercase">
                                   {item.label}
                                </span>
                             ))}
                          </div>
                       </div>

                       <div className="pt-2 border-t border-white/5">
                          <p className="text-[9px] text-white/40 font-black uppercase tracking-widest mb-1">Comentarios:</p>
                          <p className="text-[10px] text-white/60 italic">"{insp.observations || 'Sin comentarios técnicos adicionales'}"</p>
                       </div>
                    </div>
                   ))
                 ) : (
                    <div className="col-span-full py-12 bg-[#121317] border border-dashed border-white/5 rounded-[2.5rem] text-center opacity-30">
                       <ShieldCheck className="w-8 h-8 mx-auto mb-3 text-[#52ffac]" />
                       <p className="text-[9px] font-black uppercase tracking-widest">No hay alertas de seguridad pendientes.</p>
                    </div>
                 )}
              </div>
            </div>

            {/* COLUMNA DERECHA: HISTORIAL UNIFICADO DE COMBUSTIBLE */}
            <div className="space-y-6">
               <h3 className="text-[10px] font-black text-[#474556] uppercase tracking-[0.3em] ml-2 flex items-center gap-2">
                  <Fuel className="w-3.5 h-3.5" /> Auditoría de Combustible
               </h3>
               <div className="bg-[#121317] border border-white/5 rounded-[2.5rem] p-6 space-y-4 shadow-2xl min-h-[450px]">
                  {assets.some(a => (a.fuelLogs || []).length > 0) ? (
                    assets.flatMap(a => (a.fuelLogs || []).map(l => ({ ...l, assetName: a.name }))).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10).map((log, idx) => (
                      <div key={idx} className="bg-[#0d0e12] p-4 rounded-2xl border border-white/5 flex items-center justify-between group hover:border-[#52ffac]/30 transition-all shadow-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-white/5 rounded-xl flex items-center justify-center text-[#52ffac]/40 shadow-inner"><Fuel className="w-4 h-4" /></div>
                          <div>
                            <p className="text-[10px] font-black text-white uppercase leading-none">{log.assetName}</p>
                            <p className="text-[7px] text-[#474556] font-bold uppercase mt-1">{new Date(log.date).toLocaleDateString()} • {log.gallons.toFixed(2)} Gal.</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-black text-[#52ffac]">${log.price.toFixed(2)}</p>
                          <p className="text-[6px] text-[#474556] font-black uppercase tracking-widest">Validado</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-10 space-y-4 opacity-20">
                       <History className="w-8 h-8 text-[#474556]" />
                       <p className="text-[9px] font-black text-[#474556] uppercase tracking-widest leading-relaxed">Sin movimientos de carga detectados.</p>
                    </div>
                  )}
               </div>
            </div>
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
              onUpload={(type, file) => business.handleUploadMantechDocument('client', type, file)}
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
