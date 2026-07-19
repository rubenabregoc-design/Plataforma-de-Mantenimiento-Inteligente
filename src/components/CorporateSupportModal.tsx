import { toast } from 'react-hot-toast';
import React, { useState } from 'react';
import { X, Send, ShieldCheck, Zap, AlertTriangle, Briefcase, FileText, Settings } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

interface CorporateSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string;
  userName?: string;
  userId?: string;
}

export default function CorporateSupportModal({ isOpen, onClose, userEmail, userName, userId }: CorporateSupportModalProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    category: '',
    urgency: '',
    impact: '',
    description: ''
  });
  const [isSending, setIsSending] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    setIsSending(true);
    try {
      const ticketData = {
        userName,
        userEmail,
        userId,
        ...formData,
        status: 'new',
        type: 'corporate_vip',
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, "support_tickets"), ticketData);
      toast.success("Solicitud VIP enviada. Su Gerente Dedicado procesará el requerimiento de inmediato.");
      onClose();
    } catch (err) {
      toast.error("Error en la conexión. Reintente en unos momentos.");
    } finally {
      setIsSending(false);
    }
  };

  const categories = [
    { id: 'tech', label: 'FALLO TÉCNICO', icon: Settings },
    { id: 'logistics', label: 'RECORRIDO/LOGÍSTICA', icon: Briefcase },
    { id: 'billing', label: 'FACTURACIÓN/COBROS', icon: FileText },
    { id: 'hardware', label: 'HARDWARE GPS', icon: Zap }
  ];

  const urgencies = [
    { id: 'low', label: 'BAJA (CONSULTA)', color: 'text-emerald-500' },
    { id: 'medium', label: 'MEDIA (PLANIFICACIÓN)', color: 'text-amber-500' },
    { id: 'high', label: 'ALTA (INCIDENTE)', color: 'text-rose-500' },
    { id: 'critical', label: 'CRÍTICA (BLOQUEO)', color: 'bg-rose-600 text-white animate-pulse px-2 py-1 rounded' }
  ];

  return (
    <div className="fixed inset-0 z-[700] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
      <div className="w-full max-w-xl bg-[#121317] rounded-[3rem] border border-[#2a2b2f] shadow-2xl overflow-hidden animate-fade-in-up">
        <header className="px-8 py-8 bg-[#1c1d21] border-b border-[#2a2b2f] flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#5d3cfe]/10 rounded-2xl text-[#5d3cfe] border border-[#5d3cfe]/20 shadow-lg">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Soporte <span className="text-[#5d3cfe]">VIP Corporativo</span></h2>
              <p className="text-[10px] font-black text-[#c8c4d9] uppercase tracking-[0.3em] mt-1 italic">Protocolo de Atención Elite</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 bg-white/5 text-[#474556] hover:text-white rounded-2xl transition-all"><X className="w-7 h-7" /></button>
        </header>

        <div className="p-10 space-y-10">
          {step === 1 && (
            <div className="space-y-8 animate-fade-in">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-[#474556] uppercase tracking-[0.4em] ml-1">1. Naturaleza del Requerimiento</label>
                <div className="grid grid-cols-2 gap-4">
                  {categories.map(c => (
                    <button
                      key={c.id}
                      onClick={() => setFormData({...formData, category: c.id})}
                      className={`flex flex-col items-center gap-4 p-6 rounded-[2rem] border transition-all ${formData.category === c.id ? 'bg-[#5d3cfe] border-[#5d3cfe] text-white shadow-2xl' : 'bg-[#1c1d21] border-[#2a2b2f] text-[#c8c4d9] hover:border-white/20'}`}
                    >
                      <c.icon className={`w-6 h-6 ${formData.category === c.id ? 'text-white' : 'text-[#5d3cfe]'}`} />
                      <span className="text-[9px] font-black text-center uppercase tracking-widest">{c.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <button
                disabled={!formData.category}
                onClick={() => setStep(2)}
                className="w-full py-5 bg-white text-black rounded-2xl text-xs font-black uppercase tracking-[0.3em] shadow-xl disabled:opacity-20 transition-all hover:scale-[1.02] active:scale-95"
              >
                Continuar Protocolo
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-10 animate-fade-in">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-[#474556] uppercase tracking-[0.4em] ml-1">2. Nivel de Urgencia Operativa</label>
                <div className="grid grid-cols-1 gap-3">
                  {urgencies.map(u => (
                    <button
                      key={u.id}
                      onClick={() => setFormData({...formData, urgency: u.id})}
                      className={`flex justify-between items-center p-6 rounded-2xl border transition-all ${formData.urgency === u.id ? 'bg-[#1c1d21] border-[#5d3cfe] ring-2 ring-[#5d3cfe]/20' : 'bg-black/20 border-white/5'}`}
                    >
                      <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${u.color}`}>{u.label}</span>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.urgency === u.id ? 'border-[#5d3cfe] bg-[#5d3cfe]' : 'border-[#474556]'}`}>
                         {formData.urgency === u.id && <div className="w-2 h-2 bg-white rounded-full"></div>}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-4">
                 <button onClick={() => setStep(1)} className="flex-1 py-5 bg-[#1c1d21] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest">Atrás</button>
                 <button disabled={!formData.urgency} onClick={() => setStep(3)} className="flex-[2] py-5 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] shadow-xl">Siguiente Paso</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8 animate-fade-in">
              <div className="space-y-4">
                 <label className="text-[10px] font-black text-[#474556] uppercase tracking-[0.4em] ml-1">3. Detalles Finales</label>
                 <textarea
                   required
                   rows={6}
                   value={formData.description}
                   onChange={e => setFormData({...formData, description: e.target.value})}
                   placeholder="Describa brevemente el incidente o requerimiento para su Gerente de Cuenta..."
                   className="w-full bg-black border border-white/10 rounded-[2rem] p-8 text-sm font-bold text-white focus:border-[#5d3cfe] outline-none transition-all placeholder:text-[#474556] resize-none shadow-inner"
                 />
              </div>
              <div className="bg-amber-500/5 border border-amber-500/20 p-5 rounded-2xl flex items-start gap-4">
                 <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0" />
                 <p className="text-[10px] text-amber-500/80 font-bold uppercase leading-relaxed">
                   Al enviar, se activará un canal de comunicación prioritaria con su Key Account Manager.
                 </p>
              </div>
              <div className="flex gap-4 pt-4">
                 <button onClick={() => setStep(2)} className="flex-1 py-5 bg-[#1c1d21] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest">Atrás</button>
                 <button
                   disabled={!formData.description || isSending}
                   onClick={handleSubmit}
                   className="flex-[2] py-5 bg-[#5d3cfe] text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] shadow-2xl shadow-[#5d3cfe]/20 transition-all flex items-center justify-center gap-3"
                 >
                   <Send className="w-4 h-4" /> {isSending ? 'ENVIANDO...' : 'ENVIAR AL GERENTE'}
                 </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
