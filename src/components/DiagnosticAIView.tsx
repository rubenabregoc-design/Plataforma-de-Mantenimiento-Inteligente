import React, { useState } from 'react';
import { Asset, TechCategory } from '../types';
import { Wrench, ShieldAlert, Sparkles, AlertCircle, ArrowRight, Droplets, Thermometer, Radio, Flame, Search } from 'lucide-react';

interface DiagnosticAIViewProps {
  assets: Asset[];
  onFindTechnicians: (category: TechCategory) => void;
}

// Base de Conocimiento Especializada de MantechPro
const DIAGNOSTIC_ENGINE: Record<string, any> = {
  ac: [
    { id: 1, label: 'Gotea agua (Fugas)', cause: 'Drenaje de condensado obstruido o congelamiento de serpentín.', urgency: 'Alta', cost: '$35 - $60', specialist: 'tecnico_ac', icon: <Droplets className="w-4 h-4" /> },
    { id: 2, label: 'No enfría / Aire caliente', cause: 'Bajo nivel de refrigerante o condensador sucio.', urgency: 'Media', cost: '$45 - $85', specialist: 'tecnico_ac', icon: <Thermometer className="w-4 h-4" /> },
    { id: 3, label: 'Ruido extraño / Vibración', cause: 'Fallo en motor del soplador o aspas desbalanceadas.', urgency: 'Media', cost: '$40 - $70', specialist: 'tecnico_ac', icon: <Radio className="w-4 h-4" /> },
    { id: 4, label: 'Huele a quemado / Humo', cause: 'Cortocircuito eléctrico o sobrecalentamiento de cables.', urgency: 'Crítica', cost: '$60 - $150', specialist: 'tecnico_ac', icon: <Flame className="w-4 h-4" /> }
  ],
  car: [
    { id: 5, label: 'Chillido al frenar', cause: 'Pastillas de freno desgastadas o discos cristalizados.', urgency: 'Alta', cost: '$65 - $110', specialist: 'mecanico', icon: <Wrench className="w-4 h-4" /> },
    { id: 6, label: 'Luz de motor (Check Engine)', cause: 'Fallo en sensores de oxígeno o sistema de combustión.', urgency: 'Media', cost: '$45 - $130', specialist: 'mecanico', icon: <AlertCircle className="w-4 h-4" /> },
    { id: 7, label: 'No arranca / Batería', cause: 'Batería agotada o alternador defectuoso.', urgency: 'Media', cost: '$15 - $95', specialist: 'mecanico', icon: <Sparkles className="w-4 h-4" /> },
    { id: 8, label: 'Humo en el motor', cause: 'Fuga de aceite o sobrecalentamiento crítico.', urgency: 'Crítica', cost: '$80 - $250', specialist: 'mecanico', icon: <Flame className="w-4 h-4" /> }
  ],
  computer: [
    { id: 9, label: 'Pantalla azul / No inicia', cause: 'Fallo en disco duro o corrupción de sistema operativo.', urgency: 'Media', cost: '$30 - $60', specialist: 'informatico', icon: <AlertCircle className="w-4 h-4" /> },
    { id: 10, label: 'Se apaga sola / Calentamiento', cause: 'Pasta térmica seca o ventiladores obstruidos.', urgency: 'Alta', cost: '$25 - $55', specialist: 'informatico', icon: <Thermometer className="w-4 h-4" /> }
  ]
};

export default function DiagnosticAIView({ assets, onFindTechnicians }: DiagnosticAIViewProps) {
  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [selectedIssueId, setSelectedIssueId] = useState<number | null>(null);
  const [customNotes, setCustomIssue] = useState('');

  const selectedAsset = assets.find(a => a.id === selectedAssetId);
  const availableIssues = selectedAsset ? (DIAGNOSTIC_ENGINE[selectedAsset.type] || []) : [];
  const activeIssue = availableIssues.find((i: any) => i.id === selectedIssueId);

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'Crítica': return 'bg-red-50 text-red-700 border-red-100';
      case 'Alta': return 'bg-orange-50 text-orange-700 border-orange-100';
      default: return 'bg-amber-50 text-amber-700 border-amber-100';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-indigo-600 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="relative z-10">
          <h1 className="text-2xl font-black uppercase tracking-tight mb-2">Asistente Técnico Predictivo</h1>
          <p className="text-indigo-100 text-sm max-w-xl">Identifica fallas comunes y obtén cotizaciones estimadas basadas en el mercado de Panamá.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-3xl border border-zinc-200 p-6 shadow-sm space-y-6">
            <div className="space-y-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-black text-white">1</span>
              <label className="block text-xs font-black text-zinc-900 uppercase">¿Qué equipo deseas revisar?</label>
              <select
                value={selectedAssetId}
                onChange={(e) => { setSelectedAssetId(e.target.value); setSelectedIssueId(null); }}
                className="w-full p-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              >
                <option value="">Selecciona un equipo...</option>
                {assets.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>

            {selectedAssetId && (
              <div className="space-y-3 animate-[slideUp_0.3s_ease-out]">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-black text-white">2</span>
                <label className="block text-xs font-black text-zinc-900 uppercase">Selecciona el síntoma principal</label>
                <div className="grid grid-cols-1 gap-2">
                  {availableIssues.map((issue: any) => (
                    <button
                      key={issue.id}
                      onClick={() => setSelectedIssueId(issue.id)}
                      className={`flex items-center justify-between p-4 rounded-2xl border text-left transition-all ${
                        selectedIssueId === issue.id
                        ? 'border-indigo-600 bg-indigo-50 shadow-md scale-[1.02]'
                        : 'border-zinc-100 hover:border-indigo-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${selectedIssueId === issue.id ? 'bg-indigo-600 text-white' : 'bg-zinc-100 text-zinc-500'}`}>
                          {issue.icon}
                        </div>
                        <span className={`text-xs font-black ${selectedIssueId === issue.id ? 'text-indigo-900' : 'text-zinc-600'}`}>{issue.label}</span>
                      </div>
                      <div className={`w-2 h-2 rounded-full ${selectedIssueId === issue.id ? 'bg-indigo-600' : 'bg-zinc-200'}`}></div>
                    </button>
                  ))}
                  <button
                    onClick={() => setSelectedIssueId(0)}
                    className={`p-4 rounded-2xl border text-xs font-bold text-center transition-all ${selectedIssueId === 0 ? 'border-indigo-600 bg-indigo-50 shadow-sm' : 'border-zinc-100 text-zinc-400'}`}
                  >
                    Otro problema (Descripción libre)
                  </button>
                </div>
              </div>
            )}

            {/* Paso 3: Notas o Descripción Libre */}
            {selectedIssueId !== null && (
              <div className="space-y-3 animate-[slideUp_0.3s_ease-out]">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-black text-white">3</span>
                <label className="block text-xs font-black text-zinc-900 uppercase">
                  {selectedIssueId === 0 ? 'Describe tu problema aquí' : 'Notas Adicionales'}
                </label>
                <textarea
                  rows={4}
                  value={customNotes}
                  onChange={(e) => setCustomIssue(e.target.value)}
                  placeholder={selectedIssueId === 0 ? "Ej: Mi equipo hace un ruido extraño al encender y se apaga a los 5 minutos..." : "Detalles adicionales para el técnico..."}
                  className="w-full p-4 bg-zinc-50 border border-indigo-100 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner"
                />
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-7">
          {activeIssue ? (
            <div className="bg-white rounded-3xl border border-zinc-200 overflow-hidden shadow-sm animate-[fadeIn_0.3s_ease-out]">
              <div className="p-6 bg-zinc-50 border-b border-zinc-100 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-600 rounded-xl text-white">
                    {activeIssue.icon}
                  </div>
                  <h3 className="font-black text-zinc-900 uppercase text-xs">Evaluación de MantechPro</h3>
                </div>
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${getUrgencyColor(activeIssue.urgency)}`}>
                  Urgencia {activeIssue.urgency}
                </span>
              </div>

              <div className="p-8 space-y-6">
                <div className="space-y-2">
                  <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Causa probable identificada:</span>
                  <p className="text-base font-extrabold text-zinc-900 leading-tight">{activeIssue.cause}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-5 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                    <span className="text-[10px] font-black text-indigo-400 uppercase block mb-1">Precio Mercado:</span>
                    <p className="text-2xl font-black text-indigo-900">{activeIssue.cost}</p>
                    <p className="text-[8px] text-indigo-400 font-bold mt-1">Sugerido Ciudad de Panamá</p>
                  </div>
                  <div className="p-5 bg-emerald-50/50 rounded-2xl border border-emerald-100 flex flex-col justify-center">
                    <span className="text-[10px] font-black text-emerald-400 uppercase block mb-1">Especialista:</span>
                    <p className="text-xs font-black text-emerald-900 uppercase leading-none">
                      {(activeIssue.specialist || 'mecanico').replace('_', ' ')}
                    </p>
                  </div>
                </div>

                <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100 flex gap-3 items-start">
                  <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
                  <p className="text-[11px] text-amber-900 font-bold leading-relaxed">
                    Este diagnóstico es una referencia técnica preliminar. No sustituye la inspección física del profesional.
                  </p>
                </div>

                <button
                  onClick={() => onFindTechnicians(activeIssue.specialist)}
                  className="w-full py-4 bg-zinc-900 hover:bg-black text-white rounded-2xl text-sm font-black uppercase transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95"
                >
                  Contactar Especialista {activeIssue.specialist.split('_')[0].toUpperCase()}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : selectedIssueId === 0 ? (
            <div className="bg-white rounded-3xl border border-zinc-200 p-8 shadow-sm space-y-6 animate-[fadeIn_0.3s_ease-out] flex flex-col justify-center items-center text-center">
              <div className="space-y-3">
                <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto text-indigo-600 border border-indigo-100">
                   <Search className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-black text-zinc-900 uppercase">Solicitud de Inspección Libre</h3>
                <p className="text-xs text-zinc-500 max-w-xs mx-auto">Usa el cuadro de la izquierda (Paso 3) para detallar lo que sucede con tu equipo.</p>
              </div>

              <div className="w-full pt-4 border-t border-zinc-50">
                <button
                  onClick={() => onFindTechnicians('mecanico')}
                  disabled={!customNotes.trim()}
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-zinc-200 disabled:text-zinc-400 text-white rounded-2xl text-sm font-black uppercase transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                >
                  {customNotes.trim() ? 'Confirmar y Buscar Técnico' : 'Escribe tu descripción para continuar'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-zinc-50 rounded-3xl border-2 border-dashed border-zinc-200 p-20 text-center text-zinc-400 h-full flex flex-col justify-center items-center">
               <div className="relative">
                 <Wrench className="w-16 h-16 mx-auto mb-4 opacity-10" />
                 <Sparkles className="w-6 h-6 absolute -top-2 -right-2 text-indigo-200 animate-pulse" />
               </div>
               <p className="text-[10px] font-black uppercase tracking-widest">Inicia el diagnóstico a la izquierda</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
