import React from 'react';
import { Asset, JobRequest } from '../types';
import { X, Cpu, Activity, Zap, Wind, Mountain, ShieldCheck, Gauge, TrendingUp, AlertTriangle, Info, Printer, Download, Share2, Shield, Settings, CheckCircle2, Sliders } from 'lucide-react';

interface AssetEngineeringReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: Asset;
  requests: JobRequest[];
}

export default function AssetEngineeringReportModal({ isOpen, onClose, asset, requests }: AssetEngineeringReportModalProps) {
  if (!isOpen) return null;

  const completedJobs = requests.filter(r => r.assetId === asset.id && r.status === 'completed');
  const totalSpent = completedJobs.reduce((sum, r) => sum + (r.price || 0), 0);

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-black/90 backdrop-blur-2xl overflow-y-auto">
      <div className="w-full max-w-5xl bg-[#121317] rounded-[3.5rem] border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.5)] animate-fade-in-up my-auto relative">
        <button onClick={onClose} className="absolute top-8 right-8 z-50 p-3 bg-white/5 hover:bg-rose-600 text-white rounded-2xl border border-white/10 transition-all"><X className="w-6 h-6" /></button>

        <div className="flex flex-col lg:flex-row h-full max-h-[85vh]">
          {/* LADO IZQUIERDO: CABECERA Y METRICAS */}
          <div className="lg:w-1/3 bg-[#1c1d21] p-10 flex flex-col justify-between border-r border-white/5">
             <div className="space-y-10">
                <div className="space-y-4">
                   <span className="px-4 py-1.5 bg-[#5d3cfe]/10 border border-[#5d3cfe]/20 text-[#c7bfff] rounded-full text-[9px] font-black uppercase tracking-widest">Protocolo de Ingeniería</span>
                   <h2 className="text-4xl font-black text-white uppercase tracking-tighter leading-none">{asset.name}</h2>
                   <p className="text-xs font-bold text-[#474556] uppercase tracking-widest">{asset.details} • ID: {asset.id.substring(0,8)}</p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                   <div className="p-6 bg-black/40 rounded-3xl border border-white/5 space-y-2">
                      <p className="text-[9px] font-black text-[#474556] uppercase tracking-[0.2em]">Inversión Acumulada</p>
                      <p className="text-3xl font-black text-white italic leading-none">${totalSpent.toLocaleString()}</p>
                   </div>
                   <div className="p-6 bg-black/40 rounded-3xl border border-white/5 space-y-2">
                      <p className="text-[9px] font-black text-[#474556] uppercase tracking-[0.2em]">Estado de Salud</p>
                      <div className="flex items-end gap-3">
                         <p className="text-3xl font-black text-[#52ffac] italic leading-none">94%</p>
                         <TrendingUp className="w-5 h-5 text-[#52ffac] mb-1" />
                      </div>
                   </div>
                </div>
             </div>

             <div className="space-y-4 pt-10">
                <button className="w-full py-4 bg-[#5d3cfe] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-3">
                   <Printer className="w-4 h-4" /> Imprimir Reporte
                </button>
                <button className="w-full py-4 bg-white/5 border border-white/10 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3">
                   <Download className="w-4 h-4" /> Descargar Excel
                </button>
             </div>
          </div>

          {/* LADO DERECHO: DETALLES TECNICOS */}
          <div className="lg:w-2/3 p-10 overflow-y-auto custom-scrollbar space-y-12 bg-grid-white/[0.02]">
             <section className="space-y-6">
                <h3 className="text-xs font-black text-white uppercase tracking-[0.3em] flex items-center gap-3">
                   <Zap className="w-5 h-5 text-[#5d3cfe]" /> Telemetría Predictiva
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   <div className="p-6 bg-[#1c1d21]/50 border border-white/5 rounded-3xl space-y-4">
                      <div className="flex items-center gap-3"><Gauge className="w-5 h-5 text-amber-500" /><span className="text-[10px] font-black text-white uppercase">Estrés Térmico</span></div>
                      <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden"><div className="bg-amber-500 h-full" style={{ width: '42%' }}></div></div>
                      <p className="text-[9px] text-[#474556] font-bold uppercase tracking-widest text-right">42% • Operación Normal</p>
                   </div>
                   <div className="p-6 bg-[#1c1d21]/50 border border-white/5 rounded-3xl space-y-4">
                      <div className="flex items-center gap-3"><Activity className="w-5 h-5 text-[#52ffac]" /><span className="text-[10px] font-black text-white uppercase">Ciclo de Vida Útil</span></div>
                      <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden"><div className="bg-[#52ffac] h-full" style={{ width: '85%' }}></div></div>
                      <p className="text-[9px] text-[#474556] font-bold uppercase tracking-widest text-right">85% • Excelente</p>
                   </div>
                </div>
             </section>

             <section className="space-y-6">
                <h3 className="text-xs font-black text-white uppercase tracking-[0.3em] flex items-center gap-3">
                   <Settings className="w-5 h-5 text-[#c7bfff]" /> Historial de Protocolos
                </h3>
                <div className="space-y-3">
                   {completedJobs.map(j => (
                     <div key={j.id} className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl flex justify-between items-center group hover:bg-white/[0.05] transition-all">
                        <div className="flex gap-4 items-center">
                           <div className="p-3 bg-black/40 rounded-2xl border border-white/5"><CheckCircle2 className="w-5 h-5 text-[#52ffac]" /></div>
                           <div>
                              <p className="text-sm font-black text-white uppercase">{j.description.substring(0, 40)}...</p>
                              <p className="text-[9px] font-bold text-[#474556] uppercase mt-1">{j.visitFinishedAt?.split('T')[0]} • Ing. {j.techName}</p>
                           </div>
                        </div>
                        <span className="text-[10px] font-black text-[#5d3cfe] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Ver Protocolo ➔</span>
                     </div>
                   ))}
                </div>
             </section>
          </div>
        </div>
      </div>
    </div>
  );
}
