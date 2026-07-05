import React, { useState } from 'react';
import { TechProfile, Asset } from '../types';
import { X, Star, MapPin, Award, CheckCircle2, DollarSign, Send, ShieldCheck, Briefcase } from 'lucide-react';

interface TechnicianProfileModalProps {
  tech: TechProfile | null;
  isOpen: boolean;
  onClose: () => void;
  assets: Asset[];
  onRequestQuote: (techId: string, assetId: string, description: string) => void;
  prefilledDescription?: string;
}

export default function TechnicianProfileModal({ tech, isOpen, onClose, assets, onRequestQuote, prefilledDescription }: TechnicianProfileModalProps) {
  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [description, setDescription] = useState(prefilledDescription || '');
  const [quoteSent, setQuoteSent] = useState(false);

  React.useEffect(() => {
    if (isOpen && prefilledDescription) {
      setDescription(prefilledDescription);
    }
  }, [isOpen, prefilledDescription]);

  if (!isOpen || !tech) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssetId || !description.trim()) return;
    onRequestQuote(tech.id, selectedAssetId, description);
    setQuoteSent(true);
    setTimeout(() => {
      setQuoteSent(false);
      setDescription('');
      setSelectedAssetId('');
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0d0e12]/90 backdrop-blur-md">
      <div className="w-full max-w-3xl bg-[#121317] rounded-[2.5rem] shadow-2xl overflow-hidden border border-[#2a2b2f] flex flex-col md:flex-row animate-fade-in-up">
        
        {/* Profile Details Sidebar */}
        <div className="md:w-[40%] bg-[#1c1d21] border-r border-[#2a2b2f] p-8 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div className="w-16 h-16 bg-[#5d3cfe] rounded-2xl flex items-center justify-center text-2xl font-black text-white shadow-lg shadow-[#5d3cfe]/30 border border-white/10 uppercase">
                {tech.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${tech.plan === 'premium' ? 'bg-[#c7bfff]/10 text-[#c7bfff] border-[#c7bfff]/20' : 'bg-[#474556]/10 text-[#474556] border-[#474556]/20'}`}>
                  {tech.plan === 'premium' ? 'Premium Node' : 'Basic Node'}
                </span>
                <div className="flex items-center gap-1 text-[#52ffac]">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#52ffac] animate-pulse"></div>
                  <span className="text-[8px] font-black uppercase">Verified</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-black text-white leading-tight">{tech.name}</h3>
              <p className="text-xs font-black text-[#c7bfff] uppercase tracking-widest mt-1">{tech.title}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#121317] p-3 rounded-xl border border-[#2a2b2f]">
                 <div className="flex items-center gap-1 text-amber-500 mb-1">
                    <Star className="w-3.5 h-3.5 fill-amber-500" />
                    <span className="text-xs font-black">{tech.rating}</span>
                 </div>
                 <p className="text-[8px] font-black text-[#474556] uppercase">Rating Global</p>
              </div>
              <div className="bg-[#121317] p-3 rounded-xl border border-[#2a2b2f]">
                 <div className="flex items-center gap-1 text-[#52ffac] mb-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span className="text-xs font-black">{tech.completedJobs || 0}</span>
                 </div>
                 <p className="text-[8px] font-black text-[#474556] uppercase">Servicios</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3 text-xs">
                <MapPin className="w-4 h-4 text-[#5d3cfe] mt-0.5" />
                <span className="text-[#c8c4d9] font-medium leading-relaxed">{tech.location}</span>
              </div>
              <div className="bg-[#121317]/50 p-4 rounded-2xl border border-[#2a2b2f]/50 italic text-[#c8c4d9] text-xs leading-relaxed shadow-inner">
                "{tech.bio}"
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <h4 className="text-[9px] font-black text-[#474556] uppercase tracking-[0.2em] flex items-center gap-2">
                <Award className="w-4 h-4 text-[#c7bfff]" /> Certificaciones
              </h4>
              <div className="flex flex-wrap gap-2">
                {tech.certifications.map((cert, i) => (
                  <span key={i} className="px-3 py-1.5 bg-[#121317] border border-[#2a2b2f] rounded-lg text-[10px] font-bold text-[#e3e2e8]">{cert}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-[#2a2b2f] flex items-center justify-between">
            <span className="text-[9px] font-black text-[#474556] uppercase tracking-widest">Tarifa Base</span>
            <div className="text-right">
              <p className="text-xl font-black text-[#52ffac]">B/. {tech.hourlyRate}.00</p>
              <p className="text-[8px] font-black text-[#474556] uppercase mt-0.5">Por hora / sesión</p>
            </div>
          </div>
        </div>

        {/* Action / Form Section */}
        <div className="flex-1 p-10 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-8 pb-4 border-b border-[#2a2b2f]/30">
            <div className="flex items-center gap-3">
              <Briefcase className="w-5 h-5 text-[#5d3cfe]" />
              <h4 className="text-lg font-black text-white uppercase tracking-tight">Solicitud de Ingeniería</h4>
            </div>
            <button onClick={onClose} className="p-2 text-[#474556] hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          {quoteSent ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 animate-fade-in-up">
              <div className="w-20 h-20 bg-[#52ffac]/10 border border-[#52ffac]/20 rounded-full flex items-center justify-center text-[#52ffac] shadow-[0_0_30px_rgba(82,255,172,0.1)]">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <h4 className="text-xl font-black text-white uppercase tracking-widest">Transmisión Exitosa</h4>
                <p className="text-xs text-[#c8c4d9] font-medium mt-2 max-w-xs mx-auto leading-relaxed">
                  Tu solicitud ha sido enviada al nodo del técnico. Recibirás una respuesta encriptada en tu panel de contratos.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-between space-y-8">
              <div className="space-y-6">
                {assets.length === 0 ? (
                  <div className="p-6 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex gap-4">
                    <ShieldCheck className="w-6 h-6 text-rose-500 shrink-0" />
                    <p className="text-xs text-rose-500 font-bold leading-relaxed">
                      Advertencia: No se detectan activos vinculados. Registre al menos una unidad de infraestructura antes de proceder con el soporte técnico.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-[#474556] uppercase tracking-widest ml-1">Seleccionar Infraestructura</label>
                      <select
                        required
                        value={selectedAssetId}
                        onChange={(e) => setSelectedAssetId(e.target.value)}
                        className="w-full bg-[#1c1d21] border border-[#2a2b2f] rounded-xl py-4 px-5 text-sm font-bold text-white focus:border-[#c7bfff] outline-none transition-all shadow-inner"
                      >
                        <option value="">-- Seleccione una unidad --</option>
                        {assets.map((x) => (
                          <option key={x.id} value={x.id}>{x.name} ({x.type})</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-[#474556] uppercase tracking-widest ml-1">Descripción del Fallo / Requerimiento</label>
                      <textarea
                        required
                        rows={6}
                        placeholder="Brinde detalles técnicos del problema..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full bg-[#1c1d21] border border-[#2a2b2f] rounded-xl py-4 px-5 text-sm font-medium text-white focus:border-[#c7bfff] outline-none transition-all placeholder:text-[#474556] leading-relaxed"
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="pt-8 border-t border-[#2a2b2f]/30 flex gap-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-4 border border-[#2a2b2f] text-[#c8c4d9] rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#1c1d21] transition-all"
                >
                  Abortar
                </button>
                <button
                  type="submit"
                  disabled={assets.length === 0 || !selectedAssetId || !description.trim()}
                  className="flex-1 py-4 bg-[#5d3cfe] text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-[#5d3cfe]/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                >
                  <Send className="w-4 h-4" />
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
