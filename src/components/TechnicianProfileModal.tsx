import React, { useState } from 'react';
import { TechProfile, Asset } from '../types';
import { X, Star, MapPin, Award, CheckCircle2, Clock, DollarSign, Send, ShieldPlus, ShieldCheck, Briefcase, Calendar } from 'lucide-react';

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

  React.useEffect(() => {
    if (isOpen) {
      if (prefilledDescription) setDescription(prefilledDescription);
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
      setQuoteSent(false);
      setDescription('');
      setSelectedAssetId('');
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0d0e12]/95 backdrop-blur-xl overflow-y-auto">
      <div className="w-full max-w-4xl bg-[#121317] rounded-[3rem] shadow-2xl border border-white/5 flex flex-col md:flex-row animate-fade-in-up my-auto max-h-[95vh] overflow-hidden">
        
        {/* SIDEBAR TÉCNICO - IZQUIERDA */}
        <div className="md:w-[38%] bg-[#1c1d21] p-8 md:p-10 flex flex-col justify-between border-b md:border-b-0 md:border-r border-white/5 overflow-y-auto custom-scrollbar shrink-0">
          <div className="space-y-8">
              <div className="flex justify-between items-start">
                <div className="w-20 h-20 bg-[#5d3cfe] rounded-[2rem] flex items-center justify-center text-3xl font-black text-white shadow-2xl shadow-[#5d3cfe]/20 border border-white/10 uppercase">
                  {tech.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-1.5 text-[#52ffac] bg-[#52ffac]/10 px-3 py-1 rounded-full border border-[#52ffac]/20">
                    <ShieldCheck className="w-3 h-3" />
                    <span className="text-[8px] font-black uppercase tracking-widest">Técnico Verificado</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-3xl font-black text-white tracking-tighter uppercase italic leading-none">{tech.name}</h3>
                <p className="text-xs font-black text-[#5d3cfe] uppercase tracking-[0.3em] mt-3">Especialista Certificado</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#121317] p-5 rounded-3xl border border-white/5 shadow-inner">
                   <div className="flex items-center gap-2 text-amber-400 mb-1">
                      <Star className="w-4 h-4 fill-amber-400" />
                      <span className="text-sm font-black">{tech.rating}</span>
                   </div>
                   <p className="text-[8px] font-black text-[#474556] uppercase tracking-widest">Rating Global</p>
                </div>
                <div className="bg-[#121317] p-5 rounded-3xl border border-white/5 shadow-inner">
                   <div className="flex items-center gap-2 text-[#52ffac] mb-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="text-sm font-black">{tech.completedJobs || 0}</span>
                   </div>
                   <p className="text-[8px] font-black text-[#474556] uppercase tracking-widest">Servicios</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 text-xs font-bold text-[#c8c4d9]">
                  <MapPin className="w-4 h-4 text-[#5d3cfe]" />
                  <span className="uppercase tracking-widest">{tech.location}</span>
                </div>
                <div className="bg-[#0d0e12] p-6 rounded-[2rem] border border-white/5 italic text-[#c8c4d9] text-xs leading-relaxed opacity-80">
                  "{tech.bio}"
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-[9px] font-black text-[#474556] uppercase tracking-[0.4em] flex items-center gap-2">
                   CERTIFICACIONES
                </h4>
                <div className="flex flex-wrap gap-2">
                  {tech.certifications.map((cert, i) => (
                    <span key={i} className="px-4 py-2 bg-[#121317] border border-white/5 rounded-xl text-[9px] font-black text-white uppercase tracking-widest">{cert}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-10 mt-10 border-t border-white/5 flex items-end justify-between">
              <div>
                <p className="text-[9px] font-black text-[#474556] uppercase tracking-[0.3em] mb-1">Tarifa Base</p>
                <div className="flex items-baseline gap-1">
                   <span className="text-sm font-black text-[#5d3cfe]">B/.</span>
                   <span className="text-4xl font-black text-white tracking-tighter italic">{tech.hourlyRate}.00</span>
                </div>
              </div>
            </div>
          </div>

          {/* FORMULARIO DE SOLICITUD - DERECHA */}
          <div className="flex-1 p-8 md:p-12 flex flex-col bg-[#121317] overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center mb-12 shrink-0">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-[#5d3cfe]/10 rounded-2xl text-[#5d3cfe] border border-[#5d3cfe]/20">
                  <Briefcase className="w-6 h-6" />
                </div>
                <h4 className="text-2xl font-black text-white uppercase tracking-tighter italic">Solicitud de <span className="text-[#5d3cfe]">Ingeniería</span></h4>
              </div>
              <button onClick={onClose} className="p-3 bg-white/5 border border-white/5 text-[#474556] hover:text-white rounded-2xl transition-all">
                <X className="w-7 h-7" />
              </button>
            </div>

            {quoteSent ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8 animate-fade-in-up">
                <div className="w-24 h-24 bg-[#52ffac]/10 border border-[#52ffac]/20 rounded-full flex items-center justify-center text-[#52ffac] shadow-[0_0_50px_rgba(82,255,172,0.2)]">
                  <CheckCircle2 className="w-12 h-12" />
                </div>
                <div>
                  <h4 className="text-2xl font-black text-white uppercase tracking-widest italic">Transmisión Exitosa</h4>
                  <p className="text-sm text-[#c8c4d9] font-medium mt-4 max-w-xs mx-auto leading-relaxed">
                    Tu ticket ha sido inyectado en el nodo del técnico. Recibirás una notificación encriptada en breve.
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-between">
                <div className="space-y-10">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-[#474556] uppercase tracking-[0.3em] ml-2">Seleccionar Infraestructura</label>
                    <select
                      required
                      value={selectedAssetId}
                      onChange={(e) => setSelectedAssetId(e.target.value)}
                      className="w-full bg-[#0d0e12] border border-white/10 rounded-[1.5rem] py-5 px-6 text-sm font-bold text-white focus:border-[#5d3cfe] outline-none transition-all appearance-none"
                    >
                      <option value="">-- Seleccione una unidad --</option>
                      {assets.map((x) => (
                        <option key={x.id} value={x.id}>{x.name.toUpperCase()} • {x.details.toUpperCase()}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-[#474556] uppercase tracking-[0.3em] ml-2">¿Cuándo prefiere el servicio? (Sugerencia)</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="relative">
                        <input
                          type="date"
                          required
                          value={suggestedDate}
                          onChange={(e) => setSuggestedDate(e.target.value)}
                          className="w-full bg-[#0d0e12] border border-white/10 rounded-[1.5rem] py-5 px-6 text-sm font-bold text-white focus:border-[#5d3cfe] outline-none transition-all"
                        />
                        <Calendar className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-[#474556] pointer-events-none" />
                      </div>
                      <div className="relative">
                        <input
                          type="time"
                          required
                          value={suggestedTime}
                          onChange={(e) => setSuggestedTime(e.target.value)}
                          className="w-full bg-[#0d0e12] border border-white/10 rounded-[1.5rem] py-5 px-6 text-sm font-bold text-white focus:border-[#5d3cfe] outline-none transition-all"
                        />
                        <Clock className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-[#474556] pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-[#474556] uppercase tracking-[0.3em] ml-2">Descripción del Fallo / Requerimiento</label>
                    <textarea
                      required
                      rows={5}
                      placeholder="Brinde detalles técnicos del problema..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full bg-[#0d0e12] border border-white/10 rounded-[1.5rem] py-6 px-6 text-sm font-medium text-white focus:border-[#5d3cfe] outline-none transition-all placeholder:text-[#474556] leading-relaxed resize-none"
                    />
                  </div>
                </div>

                <div className="pt-12 flex gap-5">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-5 border border-white/10 text-[#474556] hover:text-white hover:bg-white/5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all"
                  >
                    Abortar
                  </button>
                  <button
                    type="submit"
                    disabled={assets.length === 0 || !selectedAssetId || !description.trim()}
                    className="flex-[1.5] py-5 bg-[#5d3cfe] text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-[#5d3cfe]/20 active:scale-[0.98] transition-all flex items-center justify-center gap-4 group"
                  >
                    <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    Enviar Ticket
                  </button>
                </div>
              </form>
            )}
          </div>
      </div>
    </div>
  );
}
