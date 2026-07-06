import React, { useState } from 'react';
import { Asset, TechCategory } from '../types';
import { Wrench, ShieldAlert, Sparkles, AlertCircle, ArrowRight, Droplets, Thermometer, Radio, Flame, Search, Activity, ChevronRight, Zap } from 'lucide-react';

interface DiagnosticViewProps {
  assets: Asset[];
  onFindTechnicians: (category: TechCategory) => void;
}

const DIAGNOSTIC_ENGINE: Record<string, any> = {
  ac: [
    { id: 1, label: 'Gotea agua (Fugas)', cause: 'Drenaje de condensado obstruido o congelamiento de serpentín.', urgency: 'Alta', cost: '$35 - $60', specialist: 'tecnico_ac', icon: <Droplets className="w-4 h-4" /> },
    { id: 2, label: 'No enfría / Aire caliente', cause: 'Bajo nivel de refrigerante o condensador sucio.', urgency: 'Media', cost: '$45 - $85', specialist: 'tecnico_ac', icon: <Thermometer className="w-4 h-4" /> },
    { id: 3, label: 'Ruidos Extraños', cause: 'Falla en el motor del ventilador o rodamientos desgastados.', urgency: 'Media', cost: '$25 - $50', specialist: 'tecnico_ac', icon: <Radio className="w-4 h-4" /> },
    { id: 4, label: 'Olor a Humedad/Moho', cause: 'Acumulación de bacterias en el evaporador.', urgency: 'Baja', cost: '$20 - $40', specialist: 'tecnico_ac', icon: <Droplets className="w-4 h-4" /> }
  ],
  car: [
    { id: 5, label: 'Chillido al frenar', cause: 'Pastillas de freno desgastadas o discos cristalizados.', urgency: 'Alta', cost: '$65 - $110', specialist: 'mecanico', icon: <Wrench className="w-4 h-4" /> },
    { id: 6, label: 'Luz de motor (Check Engine)', cause: 'Fallo en sensores de oxígeno o sistema de combustión.', urgency: 'Media', cost: '$45 - $130', specialist: 'mecanico', icon: <AlertCircle className="w-4 h-4" /> },
    { id: 7, label: 'Vibración al Conducir', cause: 'Desbalanceo de neumáticos o problemas en la suspensión.', urgency: 'Alta', cost: '$30 - $90', specialist: 'mecanico', icon: <Activity className="w-4 h-4" /> },
    { id: 8, label: 'Humo en el Escape', cause: 'Fuga de aceite o problemas internos en el motor.', urgency: 'Crítica', cost: '$120 - $500', specialist: 'mecanico', icon: <Flame className="w-4 h-4" /> }
  ],
  computer: [
    { id: 9, label: 'Pantalla azul / No inicia', cause: 'Fallo en disco duro o corrupción de sistema operativo.', urgency: 'Media', cost: '$30 - $60', specialist: 'informatico', icon: <AlertCircle className="w-4 h-4" /> },
    { id: 10, label: 'Sobrecalentamiento', cause: 'Acumulación de polvo o pasta térmica seca.', urgency: 'Baja', cost: '$25 - $45', specialist: 'informatico', icon: <Thermometer className="w-4 h-4" /> }
  ]
};

export default function DiagnosticView({ assets, onFindTechnicians }: DiagnosticViewProps) {
  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [selectedIssueId, setSelectedIssueId] = useState<number | string | null>(null);
  const [customIssue, setCustomIssue] = useState('');

  const selectedAsset = assets.find(a => a.id === selectedAssetId);
  const availableIssues = selectedAsset ? (DIAGNOSTIC_ENGINE[selectedAsset.type] || []) : [];

  const activeIssue = selectedIssueId === 'custom'
    ? { id: 'custom', label: 'Problema Personalizado', cause: 'Revisión técnica general requerida.', urgency: 'Variable', cost: 'Por cotizar', specialist: 'mecanico' }
    : availableIssues.find((i: any) => i.id === selectedIssueId);

  return (
    <div className="modern-card p-6 md:p-10 space-y-10 relative overflow-hidden bg-[#121317]">
      <div className="scanline"></div>

      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#5d3cfe]/10 border border-[#5d3cfe]/30 flex items-center justify-center text-[#c7bfff]">
            <Activity className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white uppercase tracking-tight leading-none">Motor de Diagnóstico</h3>
            <p className="text-[10px] font-black text-[#c8c4d9] uppercase tracking-widest mt-2">Sincronización de Sensores Activa v2.6</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 py-1.5 bg-[#52ffac]/10 rounded-full border border-[#52ffac]/20">
          <div className="w-2 h-2 rounded-full bg-[#52ffac] animate-pulse shadow-[0_0_10px_#52ffac]"></div>
          <span className="text-[10px] font-black text-[#52ffac] uppercase tracking-widest">Sistema: Online</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
        <div className="space-y-6">
          <div className="space-y-4">
            <label className="text-[10px] font-black text-[#474556] uppercase tracking-[0.2em] ml-1">Seleccionar Activo</label>
            <select
              value={selectedAssetId}
              onChange={(e) => { setSelectedAssetId(e.target.value); setSelectedIssueId(null); }}
              className="w-full bg-[#0d0e12] border border-[#2a2b2f] rounded-2xl py-4 px-5 text-sm font-bold text-white focus:border-[#c7bfff] outline-none transition-all shadow-inner"
            >
              <option value="">Seleccionar Equipo...</option>
              {assets.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>

          {selectedAssetId && (
            <div className="space-y-4 animate-fade-in-up">
              <label className="text-[10px] font-black text-[#474556] uppercase tracking-[0.2em] ml-1">Síntoma Detectado</label>
              <div className="grid grid-cols-1 gap-3">
                {availableIssues.map((issue: any) => (
                  <button
                    key={issue.id}
                    onClick={() => setSelectedIssueId(issue.id)}
                    className={`flex items-center justify-between p-5 rounded-2xl border transition-all duration-300 group ${
                      selectedIssueId === issue.id
                      ? 'bg-[#5d3cfe] border-[#5d3cfe] text-white shadow-xl'
                      : 'bg-[#0d0e12] border-[#2a2b2f] text-[#c8c4d9] hover:border-[#c7bfff]/30'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2.5 rounded-xl transition-colors ${selectedIssueId === issue.id ? 'bg-white/20' : 'bg-[#1c1d21] border border-[#2a2b2f]'}`}>
                        {issue.icon}
                      </div>
                      <span className="text-sm font-bold tracking-tight uppercase">{issue.label}</span>
                    </div>
                    <ChevronRight className={`w-4 h-4 transition-transform ${selectedIssueId === issue.id ? 'translate-x-1' : 'opacity-20 group-hover:opacity-100'}`} />
                  </button>
                ))}

                <button
                  onClick={() => setSelectedIssueId('custom')}
                  className={`flex items-center justify-between p-5 rounded-2xl border transition-all duration-300 group ${
                    selectedIssueId === 'custom'
                    ? 'bg-[#c7bfff] border-[#c7bfff] text-[#0d0e12] shadow-xl'
                    : 'bg-[#0d0e12] border-[#2a2b2f] text-[#474556] hover:border-[#c7bfff]/30'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2.5 rounded-xl transition-colors ${selectedIssueId === 'custom' ? 'bg-[#0d0e12]/10' : 'bg-[#1c1d21] border border-[#2a2b2f]'}`}>
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-black tracking-tight uppercase italic">Otro Problema (Personalizado)</span>
                  </div>
                  <ChevronRight className={`w-4 h-4 transition-transform ${selectedIssueId === 'custom' ? 'translate-x-1' : 'opacity-20'}`} />
                </button>

                {selectedIssueId === 'custom' && (
                  <div className="pt-2 animate-fade-in-up">
                    <textarea
                      placeholder="Describa el síntoma que presenta su equipo..."
                      value={customIssue}
                      onChange={(e) => setCustomIssue(e.target.value)}
                      className="w-full bg-[#1c1d21] border border-[#2a2b2f] rounded-2xl p-4 text-xs font-bold text-white focus:border-[#c7bfff] outline-none transition-all h-24"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col">
          {activeIssue ? (
            <div className="flex-1 bg-[#0d0e12] border border-[#2a2b2f] rounded-[2rem] p-8 space-y-8 animate-fade-in-up relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-[#52ffac]/5 blur-3xl rounded-full"></div>
               <div className="flex justify-between items-center pb-4 border-b border-[#2a2b2f]/50">
                 <div className="flex items-center gap-3">
                   <div className="p-3 bg-[#52ffac]/10 rounded-xl text-[#52ffac] border border-[#52ffac]/20 shadow-[0_0_15px_rgba(82,255,172,0.1)]">
                     <ShieldAlert className="w-5 h-5" />
                   </div>
                   <h4 className="text-xs font-black text-white uppercase tracking-widest">Resultado del Análisis</h4>
                 </div>
                 <span className="bg-rose-500/10 text-rose-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-rose-500/20">URGENTE</span>
               </div>

               <div className="space-y-2">
                  <p className="text-[10px] font-black text-[#474556] uppercase tracking-widest">Causa Probable</p>
                  <p className="text-lg font-black text-white leading-tight">{activeIssue.cause}</p>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#121317] border border-[#2a2b2f] p-5 rounded-2xl">
                     <p className="text-[8px] font-black text-[#474556] uppercase tracking-widest mb-1">Costo Estimado</p>
                     <p className="text-2xl font-black text-[#52ffac] leading-none">{activeIssue.cost}</p>
                  </div>
                  <div className="bg-[#121317] border border-[#2a2b2f] p-5 rounded-2xl flex flex-col justify-center">
                     <p className="text-[8px] font-black text-[#474556] uppercase tracking-widest mb-1">Especialista</p>
                     <p className="text-[10px] font-black text-[#c7bfff] uppercase truncate">{(activeIssue.specialist).replace('_', ' ')}</p>
                  </div>
               </div>

               <button
                  onClick={() => onFindTechnicians(activeIssue.specialist)}
                  className="w-full py-5 bg-[#5d3cfe] text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-[#5d3cfe]/30 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-4"
               >
                 Confirmar Soporte Técnico
                 <ArrowRight className="w-5 h-5" />
               </button>
            </div>
          ) : (
            <div className="flex-1 bg-[#121317] border border-dashed border-[#2a2b2f] rounded-[2rem] p-12 flex flex-col items-center justify-center text-center opacity-40">
               <Activity className="w-20 h-20 text-[#474556] mb-6" />
               <p className="text-[11px] font-black text-[#c8c4d9] uppercase tracking-[0.3em]">Esperando Selección de Activo</p>
               <p className="text-[9px] text-[#474556] uppercase tracking-widest mt-2">MantechPro Secure Node Online</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
