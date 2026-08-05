import React from 'react';
import { Asset, JobRequest } from '../types';
import { Building2, Stethoscope, HardHat, AlertTriangle, TrendingUp, Clock, ShieldCheck, LayoutGrid, Sparkles, Zap } from 'lucide-react';

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
    : 100; // Si no hay nada creado, el cumplimiento es del 100% (cero fallos)

  return (
    <div className="space-y-6 sm:space-y-10 animate-fade-in">
      <header className="flex flex-col sm:flex-row justify-between items-center bg-[#121317] border border-white/5 p-5 sm:p-6 rounded-[1.5rem] sm:rounded-[3rem] shadow-2xl relative overflow-hidden group gap-4 sm:gap-6">
        {/* Decoración de fondo dinámica */}
        <div className="absolute top-0 right-0 w-64 h-64 opacity-5 blur-3xl rounded-full -mr-20 -mt-20 group-hover:opacity-10 transition-opacity" style={{ backgroundColor: config.color }}></div>

        <div className="flex items-center gap-4 sm:gap-6 relative z-10 w-full sm:w-auto">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center shadow-inner shrink-0">
            {config.icon}
          </div>
          <div className="overflow-hidden">
            <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tighter leading-none italic truncate">
              ¡Bienvenido, <span style={{ color: config.color }}>{userName}</span>!
            </h1>
            <h2 className="text-sm sm:text-lg font-black text-white uppercase tracking-tight mt-1 flex items-center gap-2 truncate">
               {config.title}
            </h2>
            <p className="text-[8px] sm:text-[10px] font-black text-[#474556] uppercase tracking-[0.2em] sm:tracking-[0.3em] mt-1 truncate">
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
           <h4 className="text-[10px] sm:text-xs font-black text-[#474556] uppercase tracking-[0.2em] leading-none">Inventario Prioritario <span className="text-white">({filteredAssets.length})</span></h4>
           <button
             onClick={onSeeAll}
             className="px-4 sm:px-6 py-2 bg-white/5 border border-white/10 text-white rounded-xl text-[8px] sm:text-[9px] font-black uppercase hover:bg-[#5d3cfe] transition-all"
           >
             Ver Todo
           </button>
        </div>
        <div className="divide-y divide-white/5">
           {filteredAssets.length > 0 ? filteredAssets.slice(0, 5).map(a => (
             <div key={a.id} className="p-5 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center hover:bg-white/[0.02] transition-colors gap-4 sm:gap-6">
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

                <div className="flex items-center justify-between sm:justify-end gap-6 sm:gap-10 w-full sm:w-auto pt-2 sm:pt-0 border-t border-white/5 sm:border-none">
                   <div className="text-left sm:text-right">
                      <p className="text-[7px] sm:text-[8px] font-black text-[#474556] uppercase tracking-widest mb-1">Último Servicio</p>
                      <p className="text-[9px] sm:text-[10px] font-black text-white/60">{a.lastMaintenanceDate || 'Sin registro'}</p>
                   </div>
                   <div className={`px-3 sm:px-4 py-1.5 rounded-full text-[7px] sm:text-[8px] font-black uppercase tracking-widest ${
                     a.riskLevel === 'high' ? 'bg-rose-500/10 text-rose-500' :
                     a.riskLevel === 'medium' ? 'bg-amber-500/10 text-amber-500' :
                     'bg-[#52ffac]/10 text-[#52ffac]'
                   }`}>
                      {a.riskLevel === 'high' ? 'ALTO' : a.riskLevel === 'medium' ? 'MEDIO' : 'BAJO'}
                   </div>
                   <button
                     onClick={() => onOpenAssetReport?.(a)}
                     className="p-2.5 sm:p-3 bg-white/5 border border-white/10 text-white rounded-xl hover:bg-[#5d3cfe] transition-all group"
                   >
                      <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:rotate-12 transition-transform" />
                   </button>
                </div>
             </div>
           )) : (
             <div className="p-20 text-center">
                <p className="text-[10px] font-black text-[#474556] uppercase tracking-widest italic">Inicie registrando un activo para activar este panel.</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
