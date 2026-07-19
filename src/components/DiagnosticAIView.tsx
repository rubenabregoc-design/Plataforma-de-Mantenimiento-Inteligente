import React, { useState } from 'react';
import { Asset, TechCategory } from '../types';
import { Wrench, ShieldAlert, Sparkles, AlertCircle, ArrowRight, Droplets, Thermometer, Radio, Flame, Search, BrainCircuit, ShieldCheck, AlertTriangle } from 'lucide-react';

interface DiagnosticAIViewProps {
  assets: Asset[];
  onFindTechnicians: (category: TechCategory) => void;
  mode?: 'manual' | 'assisted' | 'auto';
}

// Base de Conocimiento Especializada de MantechPro (Grado Industrial)
const DIAGNOSTIC_ENGINE: Record<string, any> = {
  ac: [
    {
      id: 1,
      label: 'Gotea agua (Fugas)',
      cause: 'Drenaje de condensado obstruido o congelamiento de serpentín.',
      prevention: 'Limpieza trimestral de filtros y mantenimiento preventivo de la bandeja de condensado.',
      damage: 'Corrosión interna, daños en la tarjeta electrónica y manchas de humedad en infraestructura.',
      urgency: 'Alta', cost: '$35 - $60', specialist: 'tecnico_ac', icon: <Droplets className="w-4 h-4" />
    },
    {
      id: 2,
      label: 'No enfría / Aire caliente',
      cause: 'Bajo nivel de refrigerante (fuga) o condensador obstruido por suciedad.',
      prevention: 'Revisión de presión de gas anual y limpieza profunda del serpentín exterior.',
      damage: 'Sobrecalentamiento y quemadura del compresor (pérdida total de la unidad).',
      urgency: 'Media', cost: '$45 - $85', specialist: 'tecnico_ac', icon: <Thermometer className="w-4 h-4" />
    },
    {
      id: 3,
      label: 'Ruido extraño / Vibración',
      cause: 'Fallo en rodamientos del motor del soplador o aspas desbalanceadas por suciedad.',
      prevention: 'Ajuste de tornillería y lubricación de partes móviles cada 6 meses.',
      damage: 'Rotura del eje del motor y daños estructurales en el chasis de la unidad.',
      urgency: 'Media', cost: '$40 - $70', specialist: 'tecnico_ac', icon: <Radio className="w-4 h-4" />
    },
    {
      id: 4,
      label: 'Huele a quemado / Humo',
      cause: 'Cortocircuito eléctrico, terminales flojas o sobrecalentamiento del capacitor.',
      prevention: 'Uso de protectores de voltaje y reapriete de terminales eléctricas en mantenimiento.',
      damage: 'Incendio eléctrico y destrucción total del cableado y componentes de control.',
      urgency: 'Crítica', cost: '$60 - $150', specialist: 'tecnico_ac', icon: <Flame className="w-4 h-4" />
    }
  ],
  car: [
    {
      id: 5,
      label: 'Chillido al frenar',
      cause: 'Pastillas de freno desgastadas al límite o discos cristalizados por calor excesivo.',
      prevention: 'Revisión de frenos cada 5,000km y uso de líquido de frenos de alta calidad.',
      damage: 'Rayado profundo de discos, reducción de la seguridad y posible fallo total de frenado.',
      urgency: 'Alta', cost: '$65 - $110', specialist: 'mecanico', icon: <Wrench className="w-4 h-4" />
    },
    {
      id: 6,
      label: 'Luz de motor (Check Engine)',
      cause: 'Fallo en sensores de oxígeno, sensor MAF o mal funcionamiento de la bobina de ignición.',
      prevention: 'Cambio de filtros de aire/combustible y uso de combustible de octanaje adecuado.',
      damage: 'Consumo excesivo de combustible, daño al catalizador y pérdida de potencia del motor.',
      urgency: 'Media', cost: '$45 - $130', specialist: 'mecanico', icon: <AlertCircle className="w-4 h-4" />
    },
    {
      id: 7,
      label: 'No arranca / Batería',
      cause: 'Batería con celdas agotadas, alternador sin carga o terminales sulfatadas.',
      prevention: 'Limpieza de terminales y revisión del sistema de carga cada 6 meses.',
      damage: 'Daños en el módulo electrónico del vehículo (ECU) por picos de voltaje.',
      urgency: 'Media', cost: '$15 - $95', specialist: 'mecanico', icon: <Sparkles className="w-4 h-4" />
    },
    {
      id: 8,
      label: 'Humo en el motor',
      cause: 'Fuga de aceite sobre el escape, sobrecalentamiento crítico o rotura de manguera de radiador.',
      prevention: 'Verificación de niveles de fluidos semanal y cambio de mangueras resecas.',
      damage: 'Fundición del bloque del motor, deformación de culata e incendio del compartimiento.',
      urgency: 'Crítica', cost: '$80 - $250', specialist: 'mecanico', icon: <Flame className="w-4 h-4" />
    }
  ],
  computer: [
    {
      id: 9,
      label: 'Pantalla azul / No inicia',
      cause: 'Fallo de sectores en disco duro, memoria RAM defectuosa o corrupción de drivers.',
      prevention: 'Limpieza lógica de sistema y evitar apagados forzados de la unidad.',
      damage: 'Pérdida total de datos e imposibilidad de recuperación de archivos críticos.',
      urgency: 'Media', cost: '$30 - $60', specialist: 'informatico', icon: <AlertCircle className="w-4 h-4" />
    },
    {
      id: 10,
      label: 'Se apaga sola / Calentamiento',
      cause: 'Pasta térmica cristalizada, ventiladores obstruidos por polvo o fallo en fuente.',
      prevention: 'Mantenimiento preventivo físico (sopleteo) y cambio de pasta térmica anual.',
      damage: 'Degradación térmica del procesador y posible cortocircuito en la placa base.',
      urgency: 'Alta', cost: '$25 - $55', specialist: 'informatico', icon: <Thermometer className="w-4 h-4" />
    }
  ]
};

export default function DiagnosticAIView({ assets, onFindTechnicians, mode = 'manual' }: DiagnosticAIViewProps) {
  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [selectedIssueId, setSelectedIssueId] = useState<number | null>(null);
  const [customNotes, setCustomIssue] = useState('');
  const [aiResult, setAiResult] = useState<any>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const selectedAsset = assets.find(a => a.id === selectedAssetId);
  const availableIssues = selectedAsset ? (DIAGNOSTIC_ENGINE[selectedAsset.type] || []) : [];
  const activeIssue = aiResult || availableIssues.find((i: any) => i.id === selectedIssueId);

  const handleAutoDiagnose = async () => {
    if (!selectedAsset || !customNotes) return;
    setIsAiLoading(true);
    try {
      const res = await fetch('http://localhost:3000/api/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assetName: selectedAsset.name,
          assetDetails: selectedAsset.details,
          problemDescription: customNotes
        })
      });
      const data = await res.json();
      setAiResult(data);
    } catch (e) { console.error(e); } finally { setIsAiLoading(false); }
  };

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
        <div className="relative z-10 flex items-center gap-4">
          <div className="p-3 bg-white/10 rounded-2xl border border-white/20">
            <BrainCircuit className="w-8 h-8 text-[#52ffac]" />
          </div>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tight mb-1">Motor de Diagnóstico Master</h1>
            <p className="text-indigo-100 text-sm max-w-xl">Inteligencia técnica asistida para identificar fallas en equipos de flota, industriales y residenciales en Panamá.</p>
          </div>
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
                className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl text-xs font-black text-zinc-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all cursor-pointer shadow-sm"
              >
                <option value="" className="text-zinc-400">-- SELECCIONA UN EQUIPO --</option>
                {assets.map(a => <option key={a.id} value={a.id} className="text-zinc-900 font-bold">{a.name.toUpperCase()}</option>)}
              </select>
            </div>

            {selectedAssetId && mode !== 'manual' && (
              <div className="space-y-3 animate-[slideUp_0.3s_ease-out]">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-black text-white">2</span>
                <label className="block text-xs font-black text-zinc-900 uppercase">Selecciona el síntoma principal (Asistido)</label>
                <div className="grid grid-cols-1 gap-2">
                  {availableIssues.map((issue: any) => (
                    <button
                      key={issue.id}
                      onClick={() => { setSelectedIssueId(issue.id); setAiResult(null); }}
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
                        <span className={`text-xs font-black ${selectedIssueId === issue.id ? 'text-indigo-900' : 'text-zinc-900'}`}>{issue.label}</span>
                      </div>
                      <div className={`w-2 h-2 rounded-full ${selectedIssueId === issue.id ? 'bg-indigo-600' : 'bg-zinc-200'}`}></div>
                    </button>
                  ))}
                  <button
                    onClick={() => { setSelectedIssueId(0); setAiResult(null); }}
                    className={`p-4 rounded-2xl border text-xs font-bold text-center transition-all ${selectedIssueId === 0 ? 'border-indigo-600 bg-indigo-50 shadow-sm' : 'border-zinc-100 text-zinc-400'}`}
                  >
                    Otro problema (Descripción libre)
                  </button>
                </div>
              </div>
            )}

            {/* Paso 3: Notas o Descripción Libre */}
            {(selectedIssueId !== null || mode === 'manual') && (
              <div className="space-y-3 animate-[slideUp_0.3s_ease-out]">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-black text-white">
                  {mode === 'manual' ? '2' : '3'}
                </span>
                <label className="block text-xs font-black text-zinc-900 uppercase">
                  {mode === 'manual' ? 'Describe tu problema para el técnico' : (selectedIssueId === 0 ? 'Describe tu problema aquí' : 'Notas Adicionales')}
                </label>
                <textarea
                  rows={4}
                  value={customNotes}
                  onChange={(e) => setCustomIssue(e.target.value)}
                  placeholder={mode === 'manual' ? "Describe el fallo detalladamente..." : (selectedIssueId === 0 ? "Ej: Mi equipo hace un ruido extraño al encender..." : "Detalles adicionales para el técnico...")}
                  className="w-full p-4 bg-zinc-50 border border-indigo-100 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner"
                />

                {mode === 'auto' && customNotes && (
                   <button
                     onClick={handleAutoDiagnose}
                     disabled={isAiLoading}
                     className="w-full py-4 bg-[#5d3cfe] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl animate-pulse"
                   >
                     {isAiLoading ? 'Analizando con IA...' : '⚙️ Generar Autodiagnóstico Predictivo'}
                   </button>
                )}
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
                    {activeIssue.icon || <Sparkles className="w-4 h-4" />}
                  </div>
                  <h3 className="font-black text-zinc-900 uppercase text-xs">Evaluación {aiResult ? 'IA Predictiva' : 'Técnica'}</h3>
                </div>
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${getUrgencyColor(activeIssue.urgency || 'Media')}`}>
                  Urgencia {activeIssue.urgency || 'Media'}
                </span>
              </div>

              <div className="p-8 space-y-6">
                <div className="space-y-2">
                  <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Causa probable identificada:</span>
                  <p className="text-base font-extrabold text-zinc-900 leading-tight">{activeIssue.cause || activeIssue.possibleCauses?.[0]}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                    <div className="flex items-center gap-2 mb-2">
                      <ShieldCheck className="w-3 h-3 text-blue-600" />
                      <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Prevención</span>
                    </div>
                    <p className="text-[11px] font-bold text-blue-900 leading-relaxed">
                      {activeIssue.prevention || 'Realizar mantenimiento preventivo programado.'}
                    </p>
                  </div>
                  <div className="p-4 bg-rose-50/50 rounded-2xl border border-rose-100">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-3 h-3 text-rose-600" />
                      <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest">Daño Potencial</span>
                    </div>
                    <p className="text-[11px] font-bold text-rose-900 leading-relaxed">
                      {activeIssue.damage || 'Aumento exponencial de costos de reparación.'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-5 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                    <span className="text-[10px] font-black text-indigo-400 uppercase block mb-1">Precio Mercado:</span>
                    <p className="text-2xl font-black text-indigo-900">{activeIssue.cost || activeIssue.estimatedCostRange}</p>
                    <p className="text-[8px] text-indigo-400 font-bold mt-1">Sugerido Ciudad de Panamá</p>
                  </div>
                  <div className="p-5 bg-emerald-50/50 rounded-2xl border border-emerald-100 flex flex-col justify-center">
                    <span className="text-[10px] font-black text-emerald-400 uppercase block mb-1">Especialista:</span>
                    <p className="text-xs font-black text-emerald-900 uppercase leading-none">
                      {(activeIssue?.specialist || activeIssue?.specialistType || 'mecanico').replace('_', ' ')}
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
                  onClick={() => onFindTechnicians(activeIssue?.specialist || activeIssue?.specialistType || 'mecanico')}
                  className="w-full py-4 bg-zinc-900 hover:bg-black text-white rounded-2xl text-sm font-black uppercase transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95"
                >
                  Contactar Especialista {(activeIssue?.specialist || activeIssue?.specialistType || 'mecanico').split('_')[0].toUpperCase()}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : selectedIssueId === 0 || mode === 'manual' ? (
            <div className="bg-white rounded-3xl border border-zinc-200 p-8 shadow-sm space-y-6 animate-[fadeIn_0.3s_ease-out] flex flex-col justify-center items-center text-center h-full">
              <div className="space-y-3">
                <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto text-indigo-600 border border-indigo-100">
                   {mode === 'manual' ? <Wrench className="w-8 h-8" /> : <Search className="w-8 h-8" />}
                </div>
                <h3 className="text-lg font-black text-zinc-900 uppercase">{mode === 'manual' ? 'Solicitud de Inspección Directa' : 'Solicitud de Inspección Libre'}</h3>
                <p className="text-xs text-zinc-500 max-w-xs mx-auto">
                   {mode === 'manual'
                    ? 'Tu plan Básico permite contactar técnicos directamente para una inspección física.'
                    : 'Usa el cuadro de la izquierda para detallar lo que sucede con tu equipo.'}
                </p>
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
                 <BrainCircuit className="w-6 h-6 absolute -top-2 -right-2 text-indigo-200 animate-pulse" />
               </div>
               <p className="text-[10px] font-black uppercase tracking-widest">Inicia el diagnóstico a la izquierda</p>
               <div className="mt-4 px-3 py-1 bg-white border border-zinc-200 rounded-lg text-[8px] font-black uppercase tracking-widest">MODO: {mode.toUpperCase()}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
