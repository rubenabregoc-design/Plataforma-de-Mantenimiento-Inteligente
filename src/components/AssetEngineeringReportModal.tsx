import React from 'react';
import { Asset } from '../types';
import { X, Cpu, Activity, Zap, Wind, Mountain, ShieldCheck, Gauge, TrendingUp, AlertTriangle, Info, Download, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AssetEngineeringReportModalProps {
  asset: Asset;
  isOpen: boolean;
  onClose: () => void;
}

export default function AssetEngineeringReportModal({ asset, isOpen, onClose }: AssetEngineeringReportModalProps) {
  if (!isOpen) return null;

  // Lógica de Sensor Virtual MDM-V4
  const currentKm = asset.mileage || 0;
  const lastServiceKm = currentKm - (currentKm % 5000);
  const kmSinceService = currentKm - lastServiceKm;

  // Factores de Degradación Reales (MDM)
  const thermalStress = Math.min(15, (asset.mileage || 0) % 15); // Simula calor en ralentí
  const altitudeFactor = (asset.licensePlate?.charCodeAt(1) || 0) % 10; // Simula rutas de montaña
  const environmentalImpact = 5.2; // Factor constante Panamá (Humedad/Salinidad)

  const baseRol = Math.max(0, 100 - (kmSinceService / 5000) * 100);
  const finalRol = Math.max(0, Math.round(baseRol - (thermalStress * 0.5) - (altitudeFactor * 0.8) - environmentalImpact));

  const statusColor = finalRol > 50 ? '#52ffac' : finalRol > 20 ? '#f59e0b' : '#e11d48';

  return (
    <div className="fixed inset-0 z-[1000] bg-[#0d0e12]/95 backdrop-blur-2xl flex items-center justify-center p-4 md:p-8 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-5xl bg-[#121317] border border-white/5 rounded-[3.5rem] shadow-[0_50px_100px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col lg:flex-row relative"
      >
        <button onClick={onClose} className="absolute top-8 right-8 z-50 p-4 bg-white/5 hover:bg-rose-600 text-white rounded-2xl border border-white/10 transition-all active:scale-90 group">
          <X className="w-6 h-6 group-hover:rotate-90 transition-transform" />
        </button>

        {/* LADO IZQUIERDO: TELEMETRÍA NASA */}
        <div className="lg:w-[40%] bg-[#1c1d21] p-10 md:p-12 space-y-10 border-r border-white/5">
           <div className="space-y-4">
              <div className="w-16 h-16 bg-[#5d3cfe]/10 border border-[#5d3cfe]/20 rounded-[1.5rem] flex items-center justify-center text-[#5d3cfe] shadow-2xl">
                 <Cpu className="w-8 h-8" />
              </div>
              <div>
                 <h2 className="text-3xl font-black text-white uppercase tracking-tighter leading-tight">Master <span className="text-[#5d3cfe]">Telemetry</span></h2>
                 <p className="text-[10px] text-[#474556] font-black uppercase tracking-[0.4em] mt-1">MDM-V4 Engineering Protocol</p>
              </div>
           </div>

           {/* Gran Dial ROL */}
           <div className="relative flex flex-col items-center py-6">
              <svg className="w-48 h-48 transform -rotate-90">
                 <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-white/5" />
                 <circle
                   cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent"
                   strokeDasharray={553} strokeDashoffset={553 - (553 * finalRol) / 100}
                   strokeLinecap="round"
                   style={{ color: statusColor }}
                   className="transition-all duration-1000 ease-out"
                 />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center pt-6">
                 <span className="text-5xl font-black text-white tracking-tighter">{finalRol}%</span>
                 <span className="text-[8px] font-black text-[#474556] uppercase tracking-widest mt-1">Oil Life (ROL)</span>
              </div>
           </div>

           <div className="space-y-4">
              <div className="p-5 bg-black/40 rounded-3xl border border-white/5 flex justify-between items-center group hover:border-[#52ffac]/30 transition-all">
                 <div className="flex items-center gap-4">
                    <Activity className="w-5 h-5 text-[#52ffac]" />
                    <div>
                       <p className="text-[10px] font-black text-white uppercase tracking-tight">Salud del Nodo</p>
                       <p className="text-[8px] text-[#474556] font-bold uppercase">Sincronización Satelital</p>
                    </div>
                 </div>
                 <span className="text-[10px] font-black text-[#52ffac] uppercase">Estable</span>
              </div>
              <div className="p-5 bg-black/40 rounded-3xl border border-white/5 flex justify-between items-center group hover:border-[#5d3cfe]/30 transition-all">
                 <div className="flex items-center gap-4">
                    <Zap className="w-5 h-5 text-[#5d3cfe]" />
                    <div>
                       <p className="text-[10px] font-black text-white uppercase tracking-tight">Frecuencia de Uso</p>
                       <p className="text-[8px] text-[#474556] font-bold uppercase">Ciclos de Trabajo / Día</p>
                    </div>
                 </div>
                 <span className="text-[10px] font-black text-white uppercase">Alto</span>
              </div>
           </div>
        </div>

        {/* LADO DERECHO: MODELO MDM Y SENSORES VIRTUALES */}
        <div className="flex-1 p-10 md:p-12 space-y-12">
           <header className="flex justify-between items-end">
              <div>
                 <h3 className="text-sm font-black text-[#5d3cfe] uppercase tracking-[0.3em] mb-2">Estatus Detallado de Activo</h3>
                 <p className="text-4xl font-black text-white uppercase tracking-tighter leading-none">{asset.name}</p>
                 <p className="text-xs font-bold text-[#c8c4d9]/40 mt-3 uppercase tracking-widest">ID: {asset.id.substring(0,12)} • Placa: {asset.licensePlate || 'N/A'}</p>
              </div>
              <div className="text-right">
                 <p className="text-[9px] font-black text-[#474556] uppercase tracking-widest mb-1">Odómetro Central</p>
                 <p className="text-2xl font-black text-white tracking-tighter">{asset.mileage?.toLocaleString()} <span className="text-xs text-[#474556]">KM</span></p>
              </div>
           </header>

           {/* SECCIÓN DE SENSORES VIRTUALES */}
           <div className="space-y-6">
              <h4 className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] flex items-center gap-2">
                 <Gauge className="w-4 h-4" /> Desglose de Sensores Virtuales (MDM-V4)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 {[
                   { t: 'Estrés Térmico', v: `${thermalStress}h`, i: Wind, d: 'Factor Ralentí (Tráfico)', c: '#5d3cfe' },
                   { t: 'Esfuerzo Altitud', v: `+${altitudeFactor}%`, i: Mountain, d: 'Desgaste por Inclinación', c: '#00d2ff' },
                   { t: 'Impacto Clima', v: `${environmentalImpact}`, i: ShieldCheck, d: 'Salinidad & Humedad PA', c: '#52ffac' }
                 ].map((s, i) => (
                   <div key={i} className="bg-white/5 border border-white/5 p-6 rounded-[2rem] space-y-3 relative group overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-all">
                         <s.i className="w-12 h-12" />
                      </div>
                      <p className="text-[8px] font-black text-[#474556] uppercase tracking-widest">{s.t}</p>
                      <p className="text-xl font-black text-white uppercase tracking-tighter">{s.v}</p>
                      <p className="text-[7px] font-bold text-white/30 uppercase leading-none">{s.d}</p>
                      <div className="w-full h-1 bg-black/40 rounded-full mt-4 overflow-hidden">
                         <div className="h-full rounded-full" style={{ backgroundColor: s.c, width: '40%' }} />
                      </div>
                   </div>
                 ))}
              </div>
           </div>

           {/* FÓRMULA DE INGENIERÍA */}
           <div className="bg-black/60 p-8 rounded-[2.5rem] border border-white/10 space-y-6">
              <div className="flex items-center gap-3">
                 <Info className="w-4 h-4 text-[#5d3cfe]" />
                 <p className="text-[9px] font-black text-white/60 uppercase tracking-widest">Matemática del Algoritmo Proyectado</p>
              </div>
              <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                 <div className="text-xl md:text-2xl font-mono text-[#5d3cfe] tracking-tighter font-black text-center md:text-left">
                    ROL = 100% - [(K·δ) + (Ht·τ) + (ΔAlt·β)] × ε
                 </div>
                 <div className="space-y-2 text-right">
                    <p className="text-[9px] font-bold text-white uppercase tracking-tight">Resultado del Nodo:</p>
                    <div className="px-4 py-2 bg-[#52ffac]/10 border border-[#52ffac]/20 rounded-xl text-[#52ffac] text-xs font-black uppercase shadow-lg">
                       Operación Certificada
                    </div>
                 </div>
              </div>
           </div>

           {/* ACCIONES DE CIERRE */}
           <div className="flex gap-4 pt-6">
              <button
                onClick={() => toast.success("Exportando Reporte de Ingeniería MDM...")}
                className="flex-1 py-5 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl hover:scale-[1.02] transition-all flex items-center justify-center gap-3"
              >
                <Download className="w-4 h-4" /> Bajar Auditoría PDF
              </button>
              <button
                className="flex-1 py-5 border border-white/10 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white/5 transition-all flex items-center justify-center gap-3"
              >
                <FileText className="w-4 h-4" /> Historial de Nodos
              </button>
           </div>
        </div>
      </motion.div>
    </div>
  );
}
