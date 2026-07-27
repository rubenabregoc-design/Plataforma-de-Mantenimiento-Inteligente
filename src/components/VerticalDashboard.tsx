import React from 'react';
import { Asset, JobRequest } from '../types';
import { Building2, Stethoscope, HardHat, AlertTriangle, TrendingUp, Clock, ShieldCheck, LayoutGrid, Sparkles, Zap } from 'lucide-react';

interface VerticalDashboardProps {
  assets: Asset[];
  requests: JobRequest[];
  userName: string;
}

export default function VerticalDashboard({ assets, requests, userName }: VerticalDashboardProps) {
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

  const criticalAssets = filteredAssets.filter(a => a.criticalityLevel === 'critical' || a.criticalityLevel === 'high');

  return (
    <div className="space-y-10 animate-fade-in">
      <header className="flex justify-between items-center bg-[#121317] border border-white/5 p-8 rounded-[3rem] shadow-2xl relative overflow-hidden group">
        {/* Decoración de fondo dinámica */}
        <div className="absolute top-0 right-0 w-64 h-64 opacity-5 blur-3xl rounded-full -mr-20 -mt-20 group-hover:opacity-10 transition-opacity" style={{ backgroundColor: config.color }}></div>

        <div className="flex items-center gap-6 relative z-10">
          <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/5 flex items-center justify-center shadow-inner">
            {config.icon}
          </div>
          <div>
            <h1 className="text-3xl font-black text-white uppercase tracking-tighter leading-none italic">
              ¡Bienvenido, <span style={{ color: config.color }}>{userName}</span>!
            </h1>
            <h2 className="text-xl font-black text-white uppercase tracking-tight mt-2 flex items-center gap-2">
               {config.title}
            </h2>
            <p className="text-[10px] font-black text-[#474556] uppercase tracking-[0.3em] mt-2">
              {config.subtitle}
            </p>
          </div>
        </div>
        <div className="hidden md:flex gap-4 text-right">
           <div>
              <p className="text-[10px] font-black text-[#474556] uppercase tracking-widest">Estado Sistema</p>
              <p className="text-sm font-black text-[#52ffac] uppercase tracking-tighter">Certificado Panamá</p>
           </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Métrica Dinámica */}
        <div className="bg-[#121317] border border-white/5 p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden group">
           <span className="text-[9px] font-black text-[#474556] uppercase tracking-[0.3em]">{config.metricLabel}</span>
           <p className="text-5xl font-black text-white mt-4 italic">{type === 'general' ? assets.length : filteredAssets.length}</p>
           <div className="absolute -bottom-4 -right-4 opacity-5"><TrendingUp className="w-24 h-24" /></div>
        </div>

        {/* Métrica de Cumplimiento */}
        <div className="bg-[#121317] border border-white/5 p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden group">
           <span className="text-[9px] font-black text-[#474556] uppercase tracking-[0.3em]">Nivel de Cumplimiento</span>
           <p className="text-5xl font-black text-[#52ffac] mt-4 italic">98%</p>
           <div className="absolute -bottom-4 -right-4 opacity-5"><ShieldCheck className="w-24 h-24" /></div>
        </div>

        {/* Métrica de Próximas Tareas */}
        <div className="bg-[#121317] border border-white/5 p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden group">
           <span className="text-[9px] font-black text-[#474556] uppercase tracking-[0.3em]">Alertas de Urgencia</span>
           <p className="text-5xl font-black text-rose-500 mt-4 italic">{(requests.filter(r => r.status === 'pending' || r.status === 'disputed').length).toString().padStart(2, '0')}</p>
           <div className="absolute -bottom-4 -right-4 opacity-5"><AlertTriangle className="w-24 h-24" /></div>
        </div>
      </div>

      {/* Mini-Vista de Activos por Vertical */}
      <div className="bg-[#121317] border border-white/5 rounded-[3rem] overflow-hidden shadow-2xl">
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
           <h4 className="text-xs font-black text-[#474556] uppercase tracking-[0.2em] leading-none">Inventario Prioritario <span className="text-white">({filteredAssets.length})</span></h4>
           <button className="px-6 py-2 bg-white/5 border border-white/10 text-white rounded-xl text-[9px] font-black uppercase hover:bg-[#5d3cfe] transition-all">Ver Todo</button>
        </div>
        <div className="divide-y divide-white/5">
           {filteredAssets.length > 0 ? filteredAssets.slice(0, 5).map(a => (
             <div key={a.id} className="p-6 flex flex-col md:flex-row justify-between items-center hover:bg-white/[0.02] transition-colors gap-6">
                <div className="flex items-center gap-6 flex-1">
                   <div className={`w-12 h-12 rounded-2xl flex items-center justify-center`} style={{ backgroundColor: `${config.color}20`, color: config.color }}>
                      {type === 'ph' ? <Building2 className="w-6 h-6" /> : type === 'medical' ? <Stethoscope className="w-6 h-6" /> : type === 'construction' ? <HardHat className="w-6 h-6" /> : <LayoutGrid className="w-6 h-6" />}
                   </div>
                   <div>
                      <h5 className="text-sm font-black text-white uppercase tracking-tight leading-none">{a.name}</h5>
                      <p className="text-[9px] text-[#474556] font-bold uppercase mt-2">
                         {a.details} • {a.licensePlate || a.serialNumber || 'SN: N/A'}
                      </p>
                   </div>
                </div>

                <div className="flex items-center gap-10">
                   <div className="text-right">
                      <p className="text-[8px] font-black text-[#474556] uppercase tracking-widest mb-1">Último Servicio</p>
                      <p className="text-[10px] font-black text-white/60">{a.lastMaintenanceDate || 'Sin registro'}</p>
                   </div>
                   <div className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest ${a.riskLevel === 'high' ? 'bg-rose-500/10 text-rose-500' : 'bg-[#52ffac]/10 text-[#52ffac]'}`}>
                      RIESGO {a.riskLevel?.toUpperCase() || 'BAJO'}
                   </div>
                   <button className="p-3 bg-white/5 border border-white/10 text-white rounded-xl hover:bg-[#5d3cfe] transition-all group">
                      <Clock className="w-4 h-4 group-hover:rotate-12 transition-transform" />
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
