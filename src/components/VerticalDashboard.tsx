import React, { useState } from 'react';
import { Asset, JobRequest } from '../types';
import { Building2, Stethoscope, HardHat, AlertTriangle, TrendingUp, Clock, ShieldCheck, LayoutGrid, Sparkles, Zap, X, Search } from 'lucide-react';

interface VerticalDashboardProps {
  assets: Asset[];
  requests: JobRequest[];
  userName: string;
  onSeeAll?: () => void;
  onOpenAssetReport?: (asset: Asset) => void;
}

export default function VerticalDashboard({ assets, requests, userName, onSeeAll, onOpenAssetReport }: VerticalDashboardProps) {
  // --- Motor de Detección de Dominancia de Activos ---
  const getDominantVertical = () => {
    if (assets.length === 0) return 'general';

    const counts = assets.reduce((acc: any, asset) => {
      const cat = asset.category || 'GENERAL';
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {});

    // Encontrar la categoría con más activos
    const dominant = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);

    switch(dominant) {
      case 'PH': return 'ph';
      case 'SALUD': return 'medical';
      case 'CONSTRUCCION': return 'construction';
      default: return 'general';
    }
  };

  const type = getDominantVertical();

  const getVerticalConfig = () => {
    switch(type) {
      case 'ph': return {
        title: 'Gestión de PH & Edificios',
        subtitle: 'Control de áreas comunes y activos críticos.',
        icon: <Building2 className="w-8 h-8 text-[#5d3cfe]" />,
        metricLabel: 'Activos en Sótano/Azotea',
        color: '#5d3cfe'
      };
      case 'medical': return {
        title: 'Mantenimiento Biomédico',
        subtitle: 'Cumplimiento normativo y seguridad hospitalaria.',
        icon: <Stethoscope className="w-8 h-8 text-rose-500" />,
        metricLabel: 'Equipos con Alta Criticidad',
        color: '#f43f5e'
      };
      case 'construction': return {
        title: 'Gestión de Construcción',
        subtitle: 'Optimización de rentas y maquinaria pesada.',
        icon: <HardHat className="w-8 h-8 text-amber-500" />,
        metricLabel: 'Flota Operativa (Construcción)',
        color: '#f59e0b'
      };
      default: return {
        title: 'Gestión de Portafolio',
        subtitle: 'Control inteligente de mantenimiento preventivo.',
        icon: <LayoutGrid className="w-8 h-8 text-[#52ffac]" />,
        metricLabel: 'Activos Registrados',
        color: '#52ffac'
      };
    }
  };

  const config = getVerticalConfig();

  // Filtrado de activos relevantes para la vertical dominante
  const filteredAssets = assets.filter(a => {
    if (type === 'ph') return a.category === 'PH';
    if (type === 'medical') return a.category === 'SALUD';
    if (type === 'construction') return a.category === 'CONSTRUCCION';
    return true;
  });

  const urgentRequests = requests.filter(r => r.status === 'pending' || r.status === 'disputed').length;

  // Cálculo Real de Cumplimiento: (Activos - Alertas) / Activos
  const complianceScore = assets.length > 0
    ? Math.max(0, Math.round(((assets.length - urgentRequests) / assets.length) * 100))
    : 100;

  // Estado para el modal de visualización de todos los equipos
  const [isAllModalOpen, setIsAllModalOpen] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [riskFilter, setRiskFilter] = useState<'all' | 'critical' | 'normal'>('all');

  // Sincronización precisa con el motor de ingeniería MDM-V4
  const getAssetRiskInfo = (asset: Asset) => {
    if (!asset.nextMaintenanceDate || !asset.lastMaintenanceDate) {
      if (asset.riskLevel === 'high') return { label: 'RIESGO CRÍTICO', bg: 'bg-rose-500/15 text-rose-400 border border-rose-500/30' };
      if (asset.riskLevel === 'medium') return { label: 'RIESGO MEDIO', bg: 'bg-amber-500/15 text-amber-400 border border-amber-500/30' };
      return { label: 'RIESGO BAJO', bg: 'bg-[#52ffac]/15 text-[#52ffac] border border-[#52ffac]/30' };
    }

    const lastMaint = new Date(asset.lastMaintenanceDate);
    const nextMaint = new Date(asset.nextMaintenanceDate);
    const now = new Date();

    const totalCycleDays = Math.max(1, Math.floor((nextMaint.getTime() - lastMaint.getTime()) / (1000 * 60 * 60 * 24)));
    const daysSinceLast = Math.floor((now.getTime() - lastMaint.getTime()) / (1000 * 60 * 60 * 24));
    const isOverdue = now > nextMaint;
    const operationalStress = Math.min(100, Math.max(0, (daysSinceLast / totalCycleDays) * 100));

    if (isOverdue) {
      const isCritical = daysSinceLast > totalCycleDays + 30;
      return isCritical
        ? { label: 'RIESGO CRÍTICO', bg: 'bg-rose-500/15 text-rose-400 border border-rose-500/30' }
        : { label: 'RIESGO ALTO', bg: 'bg-rose-500/10 text-rose-400 border border-rose-500/20' };
    }
    if (operationalStress > 85) {
      return { label: 'RIESGO MEDIO', bg: 'bg-amber-500/15 text-amber-400 border border-amber-500/30' };
    }
    return { label: 'RIESGO BAJO', bg: 'bg-[#52ffac]/15 text-[#52ffac] border border-[#52ffac]/30' };
  };

  const criticalCount = filteredAssets.filter(a => {
    const r = getAssetRiskInfo(a);
    return r.label === 'RIESGO CRÍTICO' || r.label === 'RIESGO ALTO';
  }).length;
  const normalCount = filteredAssets.length - criticalCount;

  const modalAssets = filteredAssets.filter(a => {
    const matchSearch =
      a.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      a.details?.toLowerCase().includes(searchFilter.toLowerCase()) ||
      a.licensePlate?.toLowerCase().includes(searchFilter.toLowerCase()) ||
      a.serialNumber?.toLowerCase().includes(searchFilter.toLowerCase());

    if (!matchSearch) return false;
    if (riskFilter === 'all') return true;
    const r = getAssetRiskInfo(a);
    const isCritical = r.label === 'RIESGO CRÍTICO' || r.label === 'RIESGO ALTO';
    if (riskFilter === 'critical') return isCritical;
    if (riskFilter === 'normal') return !isCritical;
    return true;
  });

  return (
    <div className="space-y-6 sm:space-y-10 animate-fade-in">
      <header className="flex flex-col sm:flex-row justify-between items-center bg-[#121317] border border-white/5 p-5 sm:p-6 rounded-[1.5rem] sm:rounded-[3rem] shadow-2xl relative overflow-hidden group gap-4 sm:gap-6">
        {/* Decoración de fondo dinámica */}
        <div className="absolute top-0 right-0 w-64 h-64 opacity-5 blur-3xl rounded-full -mr-20 -mt-20 group-hover:opacity-10 transition-opacity" style={{ backgroundColor: config.color }}></div>

        <div className="flex items-center gap-4 sm:gap-6 relative z-10 w-full sm:w-auto">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center shadow-inner shrink-0">
            {config.icon}
          </div>
          <div className="overflow-hidden min-w-0">
            <h1 className="text-lg sm:text-2xl font-black text-white uppercase tracking-tighter leading-none italic">
              ¡Bienvenido, <span style={{ color: config.color }}>{userName}</span>!
            </h1>
            <h2 className="text-sm sm:text-lg font-black text-white uppercase tracking-tight mt-1 flex items-center gap-2">
               {config.title}
            </h2>
            <p className="text-[8px] sm:text-[10px] font-black text-[#474556] uppercase tracking-[0.2em] sm:tracking-[0.3em] mt-1">
              {config.subtitle}
            </p>
          </div>
        </div>
        <div className="hidden sm:flex gap-4 text-right">
           <div>
              <p className="text-[9px] font-black text-[#474556] uppercase tracking-widest">Estado Sistema</p>
              <p className="text-sm font-black text-[#52ffac] uppercase tracking-tighter">Certificado Panamá</p>
           </div>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
        {/* Métrica Dinámica */}
        <div className="bg-[#121317] border border-white/5 p-5 sm:p-6 rounded-[1.5rem] sm:rounded-[2.5rem] shadow-xl relative overflow-hidden group">
           <span className="text-[9px] font-black text-[#474556] uppercase tracking-[0.3em]">{config.metricLabel}</span>
           <p className="text-3xl sm:text-4xl font-black text-white mt-3 sm:mt-4 italic">{type === 'general' ? assets.length : filteredAssets.length}</p>
           <div className="absolute -bottom-4 -right-4 opacity-5"><TrendingUp className="w-16 sm:w-20 h-16 sm:h-20" /></div>
        </div>

        {/* Métrica de Cumplimiento REAL */}
        <div className="bg-[#121317] border border-white/5 p-5 sm:p-6 rounded-[1.5rem] sm:rounded-[2.5rem] shadow-xl relative overflow-hidden group">
           <span className="text-[9px] font-black text-[#474556] uppercase tracking-[0.3em]">Nivel de Cumplimiento</span>
           <p className="text-3xl sm:text-4xl font-black text-[#52ffac] mt-3 sm:mt-4 italic">{complianceScore}%</p>
           <div className="absolute -bottom-4 -right-4 opacity-5"><ShieldCheck className="w-16 sm:w-20 h-16 sm:h-20" /></div>
        </div>

        {/* Métrica de Próximas Tareas */}
        <div className="bg-[#121317] border border-white/5 p-5 sm:p-6 rounded-[1.5rem] sm:rounded-[2.5rem] shadow-xl relative overflow-hidden group sm:col-span-2 md:col-span-1">
           <span className="text-[9px] font-black text-[#474556] uppercase tracking-[0.3em]">Alertas de Urgencia</span>
           <p className="text-3xl sm:text-4xl font-black text-rose-500 mt-3 sm:mt-4 italic">{urgentRequests}</p>
           <div className="absolute -bottom-4 -right-4 opacity-5"><AlertTriangle className="w-16 sm:w-20 h-16 sm:h-20" /></div>
        </div>
      </div>

      {/* Mini-Vista de Activos por Vertical */}
      <div className="bg-[#121317] border border-white/5 rounded-[1.5rem] sm:rounded-[3rem] overflow-hidden shadow-2xl">
        <div className="p-5 sm:p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
           <div>
              <h4 className="text-[10px] sm:text-xs font-black text-[#474556] uppercase tracking-[0.2em] leading-none">
                 Equipos en Monitoreo <span className="text-white">({filteredAssets.length})</span>
              </h4>
              <p className="text-[8px] sm:text-[9px] text-[#8e8d9a] font-bold mt-1">
                 Diagnóstico mecánico preventivo por unidad
              </p>
           </div>
           <button
             onClick={() => setIsAllModalOpen(true)}
             className="px-4 sm:px-6 py-2 bg-white/5 border border-white/10 text-white rounded-xl text-[8px] sm:text-[9px] font-black uppercase hover:bg-[#5d3cfe] transition-all"
           >
             Ver Todos los Equipos
           </button>
        </div>
        <div className="divide-y divide-white/5">
           {filteredAssets.length > 0 ? filteredAssets.slice(0, 5).map(a => {
             const risk = getAssetRiskInfo(a);
             return (
               <div
                 key={a.id}
                 onClick={() => onOpenAssetReport?.(a)}
                 className="p-5 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center hover:bg-white/[0.04] transition-colors gap-4 sm:gap-6 cursor-pointer group/row"
               >
                  <div className="flex items-center gap-4 sm:gap-6 flex-1">
                     <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0`} style={{ backgroundColor: `${config.color}20`, color: config.color }}>
                        {type === 'ph' ? <Building2 className="w-5 h-5 sm:w-6 sm:h-6" /> : type === 'medical' ? <Stethoscope className="w-5 h-5 sm:w-6 sm:h-6" /> : type === 'construction' ? <HardHat className="w-5 h-5 sm:w-6 sm:h-6" /> : <LayoutGrid className="w-5 h-5 sm:w-6 sm:h-6" />}
                     </div>
                     <div>
                        <h5 className="text-xs sm:text-sm font-black text-white uppercase tracking-tight leading-none">{a.name}</h5>
                        <p className="text-[8px] sm:text-[9px] text-[#474556] font-bold uppercase mt-1.5 sm:mt-2">
                           {a.details} • {a.licensePlate || a.serialNumber || 'SN: N/A'}
                        </p>
                     </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-8 w-full sm:w-auto pt-2 sm:pt-0 border-t border-white/5 sm:border-none">
                     <div className="text-left sm:text-right">
                        <p className="text-[7px] sm:text-[8px] font-black text-[#474556] uppercase tracking-widest mb-1">Último Servicio</p>
                        <p className="text-[9px] sm:text-[10px] font-black text-white/60">{a.lastMaintenanceDate || 'Sin registro'}</p>
                     </div>
                     <div className={`px-2.5 sm:px-3.5 py-1 rounded-full text-[7px] sm:text-[8px] font-black uppercase tracking-wider ${risk.bg}`}>
                        {risk.label}
                     </div>
                     <button
                       onClick={(e) => {
                         e.stopPropagation();
                         onOpenAssetReport?.(a);
                       }}
                       title="Ver auditoría técnica detallada"
                       className="p-2.5 sm:p-3 bg-white/5 border border-white/10 text-white rounded-xl hover:bg-[#5d3cfe] transition-all group shrink-0"
                     >
                        <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:rotate-12 transition-transform" />
                     </button>
                  </div>
               </div>
             );
           }) : (
              <div className="p-20 text-center">
                 <p className="text-[10px] font-black text-[#474556] uppercase tracking-widest italic">Inicie registrando un activo para activar este panel.</p>
              </div>
           )}
        </div>
      </div>

      {/* MODAL: VER TODOS LOS EQUIPOS EN MONITOREO */}
      {isAllModalOpen && (
        <div className="fixed inset-0 z-[500] overflow-y-auto bg-[#0d0e12]/95 backdrop-blur-md flex items-center justify-center p-3 sm:p-6" style={{ WebkitOverflowScrolling: 'touch' }}>
          {/* Backdrop */}
          <div className="fixed inset-0 -z-10" onClick={() => setIsAllModalOpen(false)} aria-hidden="true" />

          <div className="w-full max-w-4xl max-h-[calc(100dvh-2rem)] sm:max-h-[88dvh] bg-[#121317] rounded-[2rem] sm:rounded-[3rem] border border-[#2a2b2f] shadow-2xl flex flex-col overflow-hidden animate-fade-in-up my-auto">
            {/* Modal Header */}
            <div className="flex-none px-6 py-5 bg-[#1c1d21] border-b border-[#2a2b2f] flex justify-between items-center shrink-0">
               <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-[#5d3cfe]/15 border border-[#5d3cfe]/30 text-[#c7bfff] flex items-center justify-center shrink-0">
                     <ShieldCheck className="w-6 h-6 text-[#5d3cfe]" />
                  </div>
                  <div>
                     <h3 className="text-base sm:text-xl font-black text-white uppercase tracking-tight">
                        Equipos en Monitoreo Activo ({filteredAssets.length})
                     </h3>
                     <p className="text-[9px] sm:text-[10px] text-[#8e8d9a] font-bold uppercase tracking-wider mt-0.5">
                        Salud técnica y diagnóstico de fatiga en tiempo real (MDM-V4)
                     </p>
                  </div>
               </div>
               <button onClick={() => setIsAllModalOpen(false)} className="p-2.5 rounded-xl bg-white/5 hover:bg-rose-600/20 text-[#8e8d9a] hover:text-white transition-all">
                  <X className="w-5 h-5" />
               </button>
            </div>

            {/* Modal Search and Filters */}
            <div className="flex-none p-4 sm:p-5 bg-[#16171d] border-b border-[#2a2b2f]/60 flex flex-col sm:flex-row gap-3 items-center justify-between shrink-0">
               <div className="relative w-full sm:w-80">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#474556]" />
                  <input
                     type="text"
                     placeholder="Buscar por nombre, placa o serie..."
                     value={searchFilter}
                     onChange={(e) => setSearchFilter(e.target.value)}
                     className="w-full bg-[#0d0e12] border border-[#2a2b2f] rounded-xl py-2.5 pl-10 pr-4 text-xs font-bold text-white outline-none focus:border-[#5d3cfe] transition-all"
                  />
               </div>
               <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                  <button
                     onClick={() => setRiskFilter('all')}
                     className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all shrink-0 ${riskFilter === 'all' ? 'bg-[#5d3cfe] text-white shadow-md shadow-[#5d3cfe]/20' : 'bg-white/5 text-[#8e8d9a] hover:text-white'}`}
                  >
                     Todos ({filteredAssets.length})
                  </button>
                  <button
                     onClick={() => setRiskFilter('critical')}
                     className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all shrink-0 ${riskFilter === 'critical' ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20' : 'bg-white/5 text-[#8e8d9a] hover:text-white'}`}
                  >
                     Riesgo Crítico / Alto ({criticalCount})
                  </button>
                  <button
                     onClick={() => setRiskFilter('normal')}
                     className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all shrink-0 ${riskFilter === 'normal' ? 'bg-[#52ffac]/20 text-[#52ffac] border border-[#52ffac]/30' : 'bg-white/5 text-[#8e8d9a] hover:text-white'}`}
                  >
                     Riesgo Bajo ({normalCount})
                  </button>
               </div>
            </div>

            {/* Modal Asset List */}
            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain divide-y divide-white/5 custom-scrollbar" style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}>
               {modalAssets.length > 0 ? modalAssets.map(a => {
                  const risk = getAssetRiskInfo(a);
                  return (
                     <div key={a.id} className="p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center hover:bg-white/[0.02] transition-colors gap-3 sm:gap-6">
                        <div className="flex items-center gap-4 flex-1">
                           <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${config.color}20`, color: config.color }}>
                              {type === 'ph' ? <Building2 className="w-5 h-5" /> : type === 'medical' ? <Stethoscope className="w-5 h-5" /> : type === 'construction' ? <HardHat className="w-5 h-5" /> : <LayoutGrid className="w-5 h-5" />}
                           </div>
                           <div>
                              <h5 className="text-xs sm:text-sm font-black text-white uppercase tracking-tight leading-none">{a.name}</h5>
                              <p className="text-[8px] sm:text-[9px] text-[#474556] font-bold uppercase mt-1.5">
                                 {a.details} • {a.licensePlate || a.serialNumber || 'SN: N/A'}
                              </p>
                           </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-8 w-full sm:w-auto pt-2 sm:pt-0 border-t border-white/5 sm:border-none">
                           <div className="text-left sm:text-right">
                              <p className="text-[7px] sm:text-[8px] font-black text-[#474556] uppercase tracking-widest mb-0.5">Último Servicio</p>
                              <p className="text-[9px] sm:text-[10px] font-black text-white/60">{a.lastMaintenanceDate || 'Sin registro'}</p>
                           </div>
                           <div className={`px-2.5 sm:px-3 py-1 rounded-full text-[7px] sm:text-[8px] font-black uppercase tracking-wider ${risk.bg}`}>
                              {risk.label}
                           </div>
                           <button
                             onClick={() => {
                               setIsAllModalOpen(false);
                               onOpenAssetReport?.(a);
                             }}
                             className="px-3.5 py-2 bg-[#5d3cfe] hover:bg-[#4b2ee0] text-white rounded-xl text-[9px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-md shadow-[#5d3cfe]/20 shrink-0 active:scale-95"
                           >
                              <Clock className="w-3.5 h-3.5" />
                              <span>Auditoría</span>
                           </button>
                        </div>
                     </div>
                  );
               }) : (
                  <div className="p-16 text-center text-white/40 text-xs font-bold uppercase tracking-wider">
                     No se encontraron equipos bajo este criterio de búsqueda.
                  </div>
               )}
            </div>

            {/* Modal Footer */}
            <div className="flex-none px-6 py-3.5 bg-[#1c1d21] border-t border-[#2a2b2f] flex justify-between items-center shrink-0">
               <span className="text-[9px] text-[#8e8d9a] font-bold uppercase tracking-wider">
                  Total: {modalAssets.length} de {filteredAssets.length} equipos
               </span>
               <button
                  onClick={() => setIsAllModalOpen(false)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[9px] font-black uppercase tracking-wider transition-all"
               >
                  Cerrar
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
