import React, { useState } from 'react';
import { TechProfile, Asset } from '../types';
import { X, Star, MapPin, Award, CheckCircle2, Clock, DollarSign, Send, ShieldPlus, Briefcase } from 'lucide-react';

interface TechnicianProfileModalProps {
  tech: TechProfile | null;
  isOpen: boolean;
  onClose: () => void;
  assets: Asset[];
  onRequestQuote: (techId: string, assetId: string, description: string, suggestedDate?: string, suggestedTime?: string) => void;
  prefilledDescription?: string;
}

export default function TechnicianProfileModal({ tech, isOpen, onClose, assets, onRequestQuote, prefilledDescription }: TechnicianProfileModalProps) {
  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [description, setDescription] = useState(prefilledDescription || '');
  const [suggestedDate, setSuggestedDate] = useState('');
  const [suggestedTime, setSuggestedTime] = useState('');
  const [quoteSent, setQuoteSent] = useState(false);

  // Sincronizar descripción si cambia el prefilled (cuando se abre el modal desde recordatorio)
  React.useEffect(() => {
    if (isOpen) {
      if (prefilledDescription) setDescription(prefilledDescription);

      // Default to tomorrow for suggested date
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setSuggestedDate(tomorrow.toISOString().split('T')[0]);
      setSuggestedTime('09:00');
    }
  }, [isOpen, prefilledDescription]);

  if (!isOpen || !tech) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssetId || !description.trim()) return;

    onRequestQuote(tech.id, selectedAssetId, description, suggestedDate, suggestedTime);
    setQuoteSent(true);

    setTimeout(() => {
      // Clean states on delay
      setQuoteSent(false);
      setDescription('');
      setSelectedAssetId('');
      setSuggestedDate('');
      setSuggestedTime('');
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col md:flex-row">
        
        {/* Left column: Profile Summary */}
        <div className="md:w-1/2 bg-slate-50 border-r border-gray-100 p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div className="w-14 h-14 bg-indigo-100 rounded-full flex items-center justify-center text-xl font-bold text-indigo-700 uppercase">
                {tech.name.split(' ').map(n => n[0]).join('')}
              </div>
              
              {tech.plan === 'premium' ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-[10px] font-bold text-amber-800 border border-amber-200">
                  <ShieldPlus className="w-3 h-3 text-amber-600" />
                  Premium Destacado
                </span>
              ) : (
                <span className="text-[10px] font-semibold text-gray-400">
                  Plan Básico
                </span>
              )}
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-950">{tech.name}</h3>
              <p className="text-xs font-semibold text-indigo-600">{tech.title}</p>
              {tech.companyName && (
                <div className="flex items-center gap-1.5 mt-1">
                  <Briefcase className="w-3.5 h-3.5 text-zinc-400" />
                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-tight">{tech.companyName}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center text-amber-500 font-bold gap-0.5">
                <Star className="w-4 h-4 fill-amber-500" />
                {tech.rating}
                <span className="text-gray-400 font-normal">({tech.reviewCount} reseñas)</span>
              </div>
              <div className="text-zinc-500 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                {tech.completedJobs || 0} trabajos realizados
              </div>
            </div>

            <div className="text-xs text-gray-600 flex items-start gap-1">
              <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
              <span>{tech.location}</span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-white p-3 rounded-lg border border-gray-100 italic">
              "{tech.bio}"
            </p>

            {/* Certifications */}
            <div>
              <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-indigo-500" />
                Certificaciones
              </h4>
              <div className="space-y-1">
                {tech.certifications.map((cert, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 text-xs text-gray-700 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{cert}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Pricing indicator */}
          <div className="pt-4 border-t border-gray-200/60 flex items-center justify-between text-xs">
            <span className="text-gray-400">Rango de Tarifa:</span>
            <span className="font-extrabold text-slate-900 text-sm flex items-center text-emerald-600">
              <DollarSign className="w-3.5 h-3.5 -mr-1" />
              {tech.hourlyRate}.00 / hora
            </span>
          </div>
        </div>

        {/* Right column: Action or feedback */}
        <div className="md:w-1/2 p-6 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-2">
            <h4 className="text-sm font-bold text-gray-900">Solicitud de Cotización</h4>
            <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-100">
              <X className="w-4 h-4" />
            </button>
          </div>

          {quoteSent ? (
            <div className="my-auto text-center py-8 space-y-3">
              <div className="inline-flex w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full items-center justify-center animate-bounce">
                <Star className="w-6 h-6 fill-emerald-100" />
              </div>
              <h4 className="font-bold text-gray-950 text-sm">¡Petición Enviada!</h4>
              <p className="text-xs text-gray-500 max-w-xs mx-auto">
                Tu solicitud de cotización se ha enviado con éxito al técnico. Recibirás una propuesta en breves instantes.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 flex-1 flex flex-col justify-between">
              <div className="space-y-3">
                {assets.length === 0 ? (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
                    No posees activos registrados. Debes registrar mínimo un activo en la dashboard antes de cotizar.
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        ¿Cuál de tus equipos requiere este servicio?
                      </label>
                      <select
                        required
                        value={selectedAssetId}
                        onChange={(e) => setSelectedAssetId(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs text-gray-900 bg-gray-50 focus:outline-hidden"
                      >
                        <option value="">-- Elige un activo --</option>
                        {assets.map((x) => (
                          <option key={x.id} value={x.id}>
                            {x.name} ({x.details})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        ¿Cuándo prefieres el servicio? (Sugerencia)
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="date"
                          required
                          value={suggestedDate}
                          onChange={(e) => setSuggestedDate(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs text-gray-900 bg-gray-50 focus:outline-hidden"
                        />
                        <input
                          type="time"
                          required
                          value={suggestedTime}
                          onChange={(e) => setSuggestedTime(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs text-gray-900 bg-gray-50 focus:outline-hidden"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Describe el problema o trabajo requerido
                      </label>
                      <textarea
                        required
                        rows={4}
                        placeholder="Brinda detalles del mantenimiento. Ej: Necesito recambio de filtros para mi aire y limpieza completa del condensador exterior."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs text-gray-900 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="pt-4 border-t border-gray-100 flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-1/2 py-2 border border-gray-300 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-50"
                >
                  Cerrar
                </button>
                <button
                  type="submit"
                  disabled={assets.length === 0 || !selectedAssetId || !description.trim()}
                  className="w-1/2 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1"
                >
                  <Send className="w-3.5 h-3.5" />
                  Enviar Solicitud
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
