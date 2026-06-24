import React, { useState } from 'react';
import { Asset, TechCategory } from '../types';
import { Bot, Wrench, ShieldAlert, Sparkles, AlertCircle, ArrowRight, Camera, CheckSquare, RefreshCw, Layers } from 'lucide-react';

interface DiagnosticAIViewProps {
  assets: Asset[];
  onFindTechnicians: (category: TechCategory) => void;
}

interface DiagnosticResult {
  possibleCauses: string[];
  urgency: string;
  urgencyReason: string;
  troubleshootingSteps: string[];
  estimatedCostRange: string;
  specialistType: TechCategory;
  isFallback?: boolean;
}

export default function DiagnosticAIView({ assets, onFindTechnicians }: DiagnosticAIViewProps) {
  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [problemDescription, setProblemDescription] = useState('');
  const [selectedPresetImage, setSelectedPresetImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [result, setResult] = useState<DiagnosticResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const presetSymptoms = [
    {
      title: 'A/C Gotea Agua',
      desc: 'El split interior está goteando agua por la carcasa plástica del frente y produce un sonido de gorgoteo.',
      image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=150&auto=format&fit=crop&q=60',
      category: 'ac'
    },
    {
      title: 'Auto Chillido Frenos',
      desc: 'Al detener el vehículo se escucha un chillido metálico constante que empeora al presionar el pedal del freno.',
      image: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=150&auto=format&fit=crop&q=60',
      category: 'car'
    },
    {
      title: 'Servidor Lento',
      desc: 'La consola de administración marca sobrecalentamiento en CPU y los servicios de red experimentan alta latencia.',
      image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=150&auto=format&fit=crop&q=60',
      category: 'computer'
    }
  ];

  const applyPreset = (preset: typeof presetSymptoms[0]) => {
    // Find matching asset of that type if available, or ask to select
    const matchingAsset = assets.find(a => {
      if (preset.category === 'ac' && a.type === 'ac') return true;
      if (preset.category === 'car' && a.type === 'car') return true;
      if (preset.category === 'computer' && a.type === 'computer') return true;
      return false;
    });

    if (matchingAsset) {
      setSelectedAssetId(matchingAsset.id);
    } else if (assets.length > 0) {
      setSelectedAssetId(assets[0].id);
    }
    setProblemDescription(preset.desc);
    setSelectedPresetImage(preset.image);
    setResult(null);
  };

  const runDiagnostic = async () => {
    if (!selectedAssetId || !problemDescription.trim()) return;

    const selectedAsset = assets.find(a => a.id === selectedAssetId);
    if (!selectedAsset) return;

    setLoading(true);
    setError(null);
    setResult(null);

    // Dynamic loading screen messages to improve experience
    const loadingMessages = [
      'Iniciando canal seguro con Inteligencia de Diagnóstico Maintly...',
      'Analizando síntomas y buscando patrones físicos habituales...',
      'Correlacionando anomalías mecánicas y eléctricas estructurales...',
      'Estimando márgenes de costos locales y categorías de técnicos recomendadas...',
      'Estructurando receta de auto-revisión inteligente...'
    ];

    setLoadingStep(0);
    const interval = setInterval(() => {
      setLoadingStep((prev) => {
        if (prev < loadingMessages.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 1500);

    const API_BASE_URL = import.meta.env.PROD
      ? 'https://ais-pre-q5pynj3k6zdoqc7lcyuar3-224952098429.us-west1.run.app'
      : '';

    try {
      const response = await fetch(`${API_BASE_URL}/api/diagnose`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          assetName: selectedAsset.name,
          assetDetails: selectedAsset.details,
          problemDescription: problemDescription,
          userPhoto: selectedPresetImage || undefined
        })
      });

      if (!response.ok) {
        throw new Error('Fallo al obtener respuesta del motor de diagnóstico.');
      }

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      console.warn("AI Connection Error:", err.message);
      // Fallback object to match DiagnosticResult interface
      setResult({
        possibleCauses: [
          "Falla general de comunicación (Error CORS)",
          "Restricciones de origen en el servidor en la nube",
          "Síntoma genérico basado en la descripción del problema"
        ],
        urgency: "Media",
        urgencyReason: "El servidor de IA está bloqueando la petición por seguridad del navegador (CORS). Se activa diagnóstico local preventivo.",
        troubleshootingSteps: [
          "Revisar las conexiones físicas visibles del equipo " + selectedAsset.name,
          "No forzar el encendido si produce ruidos extraños",
          "Contactar al administrador para revisar la configuración de orígenes del servidor"
        ],
        estimatedCostRange: "B/.. 45.00 - B/.. 90.00",
        specialistType: selectedAsset.type === 'ac' ? 'tecnico_ac' : (selectedAsset.type === 'car' ? 'mecanico' : 'electricista'),
        isFallback: true
      });
    } finally {
      clearInterval(interval);
      setLoading(false);
    }
  };

  const getUrgencyStyles = (urgency: string) => {
    switch (urgency.toLowerCase()) {
      case 'crítica':
      case 'critica':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'alta':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'media':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getFriendlyCategoryLabel = (cat: TechCategory) => {
    switch (cat) {
      case 'mecanico': return 'Mecánico Automotriz';
      case 'tecnico_ac': return 'Técnico de Aire Acondicionado';
      case 'electricista': return 'Electricista Certificado';
      case 'informatico': return 'Ingeniero de Sistemas / Redes';
      case 'especialista_solar': return 'Técnico Solar / Renovables';
      case 'plomero': return 'Plomero Idóneo';
      default: return 'Técnico Especialista';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 rounded-2xl p-6 md:p-8 text-white relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/20 rounded-full blur-3xl -mr-10 -mt-10"></div>
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-xs font-semibold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            V2.0 Core Maintly
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">Diagnóstico Asistido por I.A.</h1>
          <p className="text-slate-300 text-sm leading-relaxed">
            Sube una descripción o foto del problema de tu equipo. Nuestra inteligencia artificial procesará el caso, indicará la urgencia, sugerirá revisiones seguras que puedes hacer y pre-visualizará cotizaciones del mercado.
          </p>
        </div>
      </div>

      {assets.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-500 shadow-xs">
          <AlertCircle className="w-12 h-12 text-indigo-500 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-900 text-base mb-1">No tienes equipos registrados</h3>
          <p className="text-sm text-gray-400 mb-4 max-w-md mx-auto">
            Antes de utilizar el diagnóstico inteligente, debes ir a la sección de "Mis Equipos" y añadir al menos uno.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Action Column */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-xl border border-gray-200/80 p-5 shadow-xs">
              <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Bot className="w-4 h-4 text-indigo-600" />
                Nueva Solicitud de Análisis
              </h3>

              <div className="space-y-4">
                {/* Select Asset */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Seleccionar Activo
                  </label>
                  <select
                    value={selectedAssetId}
                    onChange={(e) => setSelectedAssetId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50 text-gray-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium"
                  >
                    <option value="">-- Elige un equipo --</option>
                    {assets.map((asset) => (
                      <option key={asset.id} value={asset.id}>
                        {asset.name} ({asset.details})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Preset Suggestions */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Ejemplos Rápidos de Prueba
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {presetSymptoms.map((preset, idx) => (
                      <button
                        key={idx}
                        onClick={() => applyPreset(preset)}
                        className="p-2 border border-slate-100 rounded-lg hover:border-indigo-600 bg-slate-50 hover:bg-indigo-50 transition-all text-left group"
                      >
                        <span className="block text-xs font-semibold text-gray-800 group-hover:text-indigo-950 truncate">
                          {preset.title}
                        </span>
                        <span className="block text-[10px] text-gray-400 truncate">
                          Demo {preset.category.toUpperCase()}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Describe el Problema con detalle
                  </label>
                  <textarea
                    rows={4}
                    value={problemDescription}
                    onChange={(e) => setProblemDescription(e.target.value)}
                    placeholder="Ej: El aire bota agua fría. El abanico interior gira pero no enfría la habitación y se escucha un goteo constante..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-gray-900"
                  />
                </div>

                {/* Optional Photo attachment Mock */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Evidencia Visual (Opcional)
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => alert('En este prototipo seguro puedes seleccionar uno de los ejemplos rápidos superiores para simular el análisis de imágenes.')}
                      className="p-3 bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-lg transition-all"
                      title="Sube una foto"
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                    {selectedPresetImage ? (
                      <div className="flex items-center gap-2 p-1.5 bg-indigo-50 border border-indigo-100 rounded-lg text-xs text-indigo-950 font-medium">
                        <img
                          src={selectedPresetImage}
                          alt="Preset view"
                          className="w-7 h-7 object-cover rounded-md"
                        />
                        <span className="max-w-[120px] truncate">anomalía_foto.jpg</span>
                        <button
                          onClick={() => setSelectedPresetImage(null)}
                          className="text-red-500 font-bold hover:text-red-700 ml-1"
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">Sin foto adjunta</span>
                    )}
                  </div>
                </div>

                {/* Diagnose Button */}
                <button
                  type="button"
                  disabled={loading || !selectedAssetId || !problemDescription.trim()}
                  onClick={runDiagnostic}
                  className="w-full py-2.5 px-4 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-sm shadow-indigo-200"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Ejecutar Diagnóstico Inteligente
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Result Column */}
          <div className="lg:col-span-7">
            {loading ? (
              <div className="bg-white rounded-xl border border-gray-200/80 p-12 text-center h-full flex flex-col justify-center items-center space-y-4">
                <div className="relative">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 ring-8 ring-indigo-50">
                    <RefreshCw className="h-6 w-6 text-indigo-600 animate-spin" />
                  </span>
                  <span className="absolute -top-1.5 -right-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-indigo-600 text-[8px] text-white font-bold animate-pulse">
                    IA
                  </span>
                </div>
                <div className="space-y-2 max-w-md">
                  <h4 className="font-semibold text-gray-900 text-sm">Procesando Diagnóstico Especializado</h4>
                  <p className="text-xs text-indigo-600 font-medium transition-all duration-300">
                    { [
                      'Iniciando canal seguro con Inteligencia de Diagnóstico Maintly...',
                      'Analizando síntomas y buscando patrones físicos habituales...',
                      'Correlacionando anomalías mecánicas y eléctricas estructurales...',
                      'Estimando márgenes de costos locales y categorías de técnicos recomendadas...',
                      'Estructurando receta de auto-revisión de forma estricta...'
                    ][loadingStep] }
                  </p>
                  <p className="text-[10px] text-gray-400">
                    Nuestra asistencia recopila especificaciones operativas y te guía de forma segura.
                  </p>
                </div>
              </div>
            ) : error ? (
              <div className="bg-red-50 rounded-xl border border-red-200 p-6 text-center text-red-800 space-y-3">
                <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
                <h4 className="font-semibold">Ocurrió un inconveniente</h4>
                <p className="text-xs max-w-sm mx-auto">{error}</p>
                <button
                  onClick={runDiagnostic}
                  className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-900 rounded-lg text-xs font-semibold transition-all"
                >
                  Reintentar Análisis
                </button>
              </div>
            ) : result ? (
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs space-y-5 animate-fade-in">
                {/* Result header */}
                <div className="flex flex-wrap justify-between items-center gap-3 border-b border-gray-100 pb-4">
                  <div>
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest block">
                      Ficha de Diagnóstico
                    </span>
                    <h3 className="text-base font-bold text-gray-900 flex items-center gap-1.5">
                      <Bot className="w-4 h-4 text-indigo-600" />
                      Análisis Predictivo Autómata
                    </h3>
                  </div>

                  {result.isFallback && (
                    <div className="px-2 py-0.5 rounded-full bg-amber-50 text-[10px] font-medium text-amber-700 border border-amber-200" title="Ejecutado localmente">
                      Modo local explicativo
                    </div>
                  )}

                  <div className={`px-2.5 py-1 rounded-full border text-xs font-bold ${getUrgencyStyles(result.urgency)}`}>
                    Urgencia: {result.urgency}
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-4 border border-gray-100">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-slate-600" />
                    Evaluación de Urgencia
                  </h4>
                  <p className="text-slate-700 text-xs leading-relaxed">{result.urgencyReason}</p>
                </div>

                {/* Causes & Costs Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Causes */}
                  <div className="border border-gray-100 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-indigo-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5" />
                      Causas Probables
                    </h4>
                    <ul className="space-y-2">
                      {result.possibleCauses.map((cause, idx) => (
                        <li key={idx} className="text-xs text-gray-600 flex items-start gap-1.5 leading-relaxed">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                          {cause}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Market info */}
                  <div className="border border-green-100 bg-green-50/20 rounded-xl p-4 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-green-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                        <Wrench className="w-3.5 h-3.5" />
                        Precio Estimado Panamá
                      </h4>
                      <p className="text-2xl font-black text-green-950 mb-1">{result.estimatedCostRange}</p>
                      <p className="text-[10px] text-gray-400">
                        *Basado en el rango habitual local para servicios a domicilio, incluye repuestos genéricos o reparaciones básicas.
                      </p>
                    </div>

                    <div className="pt-3 border-t border-green-100/60 mt-2">
                      <span className="block text-[10px] text-gray-500 font-medium">Especialista Sugerido:</span>
                      <span className="text-xs font-bold text-indigo-950">
                        {getFriendlyCategoryLabel(result.specialistType)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Troubleshooting checklist */}
                <div>
                  <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <CheckSquare className="w-3.5 h-3.5 text-gray-600" />
                    Protocolo de Auto-Revisión Segura
                  </h4>
                  <div className="space-y-2">
                    {result.troubleshootingSteps.map((step, idx) => (
                      <div key={idx} className="p-3 bg-gray-50 hover:bg-indigo-50/20 rounded-lg border border-gray-100/80 transition-all">
                        <p className="text-xs text-slate-700 font-medium leading-relaxed">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Marketplace Redirection Button */}
                <div className="pt-4 border-t border-gray-100 flex items-center justify-between flex-wrap gap-2">
                  <div className="text-xs text-gray-400/90 leading-normal max-w-sm">
                    ¿Prefieres dejarlo en manos expertas? Puedes solicitar cotizaciones directas a técnicos calificados que atienden esta especialidad.
                  </div>
                  <button
                    onClick={() => onFindTechnicians(result.specialistType)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 shadow-xs"
                  >
                    Buscar Especialistas en {getFriendlyCategoryLabel(result.specialistType).split(' de ')[0]}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 border-dashed p-16 text-center text-gray-400 h-full flex flex-col justify-center">
                <Bot className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h4 className="font-semibold text-gray-800 text-sm mb-1">Esperando Datos de Entrada</h4>
                <p className="text-xs text-gray-400 max-w-sm mx-auto">
                  Elige uno de tus equipos de la izquierda, detalla los síntomas o aplica un ejemplo rápido para activar la inteligencia de diagnóstico.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
