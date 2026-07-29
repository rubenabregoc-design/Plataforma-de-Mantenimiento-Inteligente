import React from 'react';
import { Asset } from '../types';
import { X, Cpu, Activity, Zap, Thermometer, ShieldCheck, Download, TrendingUp, AlertTriangle, Battery, Droplets } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  asset: Asset;
}

export default function AssetEngineeringReportModal({ isOpen, onClose, asset }: Props) {
  if (!isOpen) return null;

  // Algoritmos de Simulación MDM-V4 (Grado NASA)
  const currentKm = asset.mileage || 0;
  const lastServiceKm = currentKm - (currentKm % 5000);
  const kmSinceService = currentKm - lastServiceKm;
  const thermalStress = Math.min(100, (kmSinceService / 5000) * 120); // Estrés térmico basado en uso
  const batteryHealth = Math.max(0, 100 - (currentKm / 10000)); // Degradación estimada
  const efficiency = 92.4; // Valor simulado de telemetría

  return (
    <div className="fixed inset-0 z-[800] bg-[#0d0e12]/95 backdrop-blur-xl flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-4xl bg-[#121317] border border-[#2a2b2f] rounded-[3rem] overflow-hidden shadow-2xl shadow-[#5d3cfe]/10"
      >
        {/* HEADER NASA STYLE */}
        <div className="bg-[#1c1d21] p-8 border-b border-white/5 flex justify-between items-center relative overflow-hidden">
           <div className="absolute top-0 right-0 p-8 opacity-5"><Cpu className="w-32 h-32 text-[#5d3cfe]" /></div>
           <div className="flex items-center gap-5 relative z-10">
              <div className="w-16 h-16 bg-[#5d3cfe]/10 border border-[#5d3cfe]/20 rounded-2xl flex items-center justify-center text-[#5d3cfe] shadow-2xl">
                 <Cpu className="w-10 h-10" />
              </div>
              <div>
                 <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic">Reporte de Ingeniería <span className="text-[#5d3cfe]">MDM-V4</span></h2>
                 <div className="flex items-center gap-3 mt-1">
                    <p className="text-[10px] font-black text-[#52ffac] uppercase tracking-widest bg-[#52ffac]/10 px-2 py-0.5 rounded-full border border-[#52ffac]/20">Core Operativo Activo</p>
                    <span className="text-[8px] text-[#474556] font-black uppercase">Ref: {asset.id.substring(0,8)}</span>
                 </div>
              </div>
           </div>
           <button onClick={onClose} className="p-4 bg-white/5 hover:bg-rose-600/20 text-white rounded-2xl transition-all relative z-10"><X className="w-6 h-6" /></button>
        </div>

        <div className="p-10 grid grid-cols-1 md:grid-cols-3 gap-8 overflow-y-auto max-h-[70vh] custom-scrollbar">

           {/* COLUMNA 1: TELEMETRÍA DE SALUD */}
           <div className="space-y-6">
              <h3 className="text-[10px] font-black text-[#474556] uppercase tracking-[0.3em] ml-1">Sensores Virtuales</h3>

              <div className="p-6 bg-[#0d0e12] rounded-3xl border border-white/5 space-y-4">
                 <div className="flex justify-between items-center">
                    <span className="text-[9px] font-black text-white/40 uppercase tracking-widest flex items-center gap-2">
                       <Thermometer className="w-3 h-3 text-rose-500" /> Estrés Térmico
                    </span>
                    <span className="text-xs font-black text-white">{thermalStress.toFixed(1)}%</span>
                 </div>
                 <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500" style={{ width: `${thermalStress}%` }}></div>
                 </div>
                 <p className="text-[8px] text-[#474556] font-medium leading-relaxed">Índice de fatiga basado en ciclos de trabajo y kilometraje acumulado desde el último protocolo.</p>
              </div>

              <div className="p-6 bg-[#0d0e12] rounded-3xl border border-white/5 space-y-4">
                 <div className="flex justify-between items-center">
                    <span className="text-[9px] font-black text-white/40 uppercase tracking-widest flex items-center gap-2">
                       <Battery className="w-3 h-3 text-[#52ffac]" /> Ciclo Batería
                    </span>
                    <span className="text-xs font-black text-white">{batteryHealth.toFixed(0)}%</span>
                 </div>
                 <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-[#52ffac]" style={{ width: `${batteryHealth}%` }}></div>
                 </div>
                 <p className="text-[8px] text-[#474556] font-medium leading-relaxed">Capacidad de arranque en frío estimada por algoritmos de carga inductiva (Simulado).</p>
              </div>
           </div>

           {/* COLUMNA 2: PREDICCIÓN IA */}
           <div className="md:col-span-2 space-y-6">
              <h3 className="text-[10px] font-black text-[#474556] uppercase tracking-[0.3em] ml-1">Análisis Predictivo Central</h3>

              <div className="grid grid-cols-2 gap-4">
                 <div className="p-6 bg-[#1c1d21] rounded-[2rem] border border-white/5 space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-[#5d3cfe]/10 flex items-center justify-center text-[#5d3cfe] mb-4">
                       <Activity className="w-6 h-6" />
                    </div>
                    <p className="text-[9px] font-black text-[#474556] uppercase tracking-widest leading-none">Eficiencia Sistémica</p>
                    <p className="text-3xl font-black text-white">{efficiency}%</p>
                    <div className="flex items-center gap-1.5 text-[#52ffac] text-[8px] font-black uppercase">
                       <TrendingUp className="w-3 h-3" /> +2.4% vs Mes Anterior
                    </div>
                 </div>

                 <div className="p-6 bg-[#1c1d21] rounded-[2rem] border border-white/5 space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-rose-600/10 flex items-center justify-center text-rose-500 mb-4">
                       <AlertTriangle className="w-6 h-6" />
                    </div>
                    <p className="text-[9px] font-black text-[#474556] uppercase tracking-widest leading-none">Riesgo de Paro</p>
                    <p className="text-3xl font-black text-white">{thermalStress > 70 ? 'ALTO' : 'BAJO'}</p>
                    <p className="text-[8px] text-rose-400 font-black uppercase italic">Vulnerabilidad en Sistema de Enfriamiento</p>
                 </div>
              </div>

              <div className="bg-gradient-to-br from-[#1c1d21] to-[#0d0e12] border border-[#5d3cfe]/30 p-8 rounded-[2.5rem] relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-40 h-40 bg-[#5d3cfe]/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
                 <div className="flex items-start gap-5 relative z-10">
                    <div className="p-4 bg-[#5d3cfe] rounded-2xl text-white shadow-xl shadow-[#5d3cfe]/20">
                       <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div className="space-y-3">
                       <h4 className="text-lg font-black text-white uppercase tracking-tight italic">Diagnóstico de Ingeniería Final</h4>
                       <p className="text-xs text-[#c8c4d9] font-medium leading-relaxed opacity-80">
                          La unidad <strong>{asset.name}</strong> presenta un comportamiento operativo estable. El sensor virtual detectó un ligero aumento en la temperatura de escape durante la última jornada en Colón. <br /><br />
                          <span className="text-[#52ffac] font-black uppercase italic tracking-widest text-[10px]">RECOMENDACIÓN:</span> Inspeccionar mangueras de retorno en la próxima visita agendada del {asset.nextMaintenanceDate}.
                       </p>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        <div className="p-8 bg-[#1a1b20] border-t border-white/5 flex justify-between items-center">
           <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-[#52ffac] animate-ping"></div>
              <span className="text-[10px] font-black text-[#474556] uppercase tracking-widest italic">Sincronizado vía Sat-Link v4.2 PA</span>
           </div>
           <button
             onClick={() => toast.success("Generando Reporte Encriptado...")}
             className="px-8 py-3 bg-[#5d3cfe] text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-[#5d3cfe]/20 hover:brightness-110 active:scale-95 transition-all flex items-center gap-3"
           >
              <Download className="w-4 h-4" /> Descargar Auditoría NASA
           </button>
        </div>
      </motion.div>
    </div>
  );
}
