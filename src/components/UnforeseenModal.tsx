import React, { useState } from 'react';
import { X, AlertTriangle, DollarSign, Send, Info } from 'lucide-react';
import { JobRequest } from '../types';
import { toast } from 'react-hot-toast';

interface UnforeseenModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: JobRequest;
  onTrigger: (requestId: string, reason: string, extraCost: number, category: string) => void;
}

export default function UnforeseenModal({ isOpen, onClose, request, onTrigger }: UnforeseenModalProps) {
  const [reason, setReason] = useState('');
  const [extraCost, setExtraCost] = useState('');
  const [category, setCategory] = useState('Repuesto No Previsto');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason || !extraCost) return toast.error("Por favor detalle el imprevisto.");

    onTrigger(request.id, reason, Number(extraCost), category);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[800] bg-[#0d0e12]/95 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-[#121317] border border-rose-500/20 rounded-[3rem] p-8 md:p-10 space-y-8 shadow-[0_0_100px_rgba(225,29,72,0.15)] animate-fade-in-up">

        <header className="flex justify-between items-start">
          <div className="space-y-2">
            <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-rose-500 animate-pulse" /> RE-COTIZACIÓN <span className="text-rose-500">IMPREVISTO</span>
            </h3>
            <p className="text-[10px] text-[#474556] font-bold uppercase tracking-widest leading-none">Ajuste de Presupuesto en Sitio - {request.assetName}</p>
          </div>
          <button onClick={onClose} className="p-2 bg-white/5 rounded-xl hover:bg-rose-600 transition-all">
            <X className="w-5 h-5 text-white" />
          </button>
        </header>

        <div className="bg-rose-500/5 p-6 rounded-2xl border border-rose-500/10 flex gap-4 items-start">
           <Info className="w-5 h-5 text-rose-500 shrink-0" />
           <p className="text-[10px] text-rose-200/60 leading-relaxed uppercase font-bold italic">
              Este módulo se utiliza para reportar hallazgos críticos que no fueron contemplados en la cotización inicial. El cliente deberá aprobar el nuevo monto para proceder.
           </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
           <div className="space-y-4">
              <div className="space-y-2">
                 <label className="text-[9px] font-black text-[#474556] uppercase ml-1">Naturaleza del Imprevisto</label>
                 <select value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-black border border-white/10 rounded-xl py-4 px-4 text-[10px] font-black text-white uppercase outline-none focus:border-rose-500">
                    <option>Repuesto No Previsto</option>
                    <option>Falla Oculta (Diagnóstico)</option>
                    <option>Complicación Técnica</option>
                    <option>Mano de Obra Extra</option>
                 </select>
              </div>

              <div className="space-y-2">
                 <label className="text-[9px] font-black text-[#474556] uppercase ml-1">Descripción del Hallazgo</label>
                 <textarea required value={reason} onChange={e => setReason(e.target.value)} placeholder="Ej: Se detectó fuga en sello de cigüeñal tras desarmar..." className="w-full bg-black border border-white/10 rounded-xl p-6 text-sm text-white focus:border-rose-500 outline-none transition-all resize-none h-32" />
              </div>

              <div className="space-y-2">
                 <label className="text-[9px] font-black text-[#474556] uppercase ml-1">Costo Adicional (B/.)</label>
                 <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-rose-500" />
                    <input required type="number" step="any" value={extraCost} onChange={e => setExtraCost(e.target.value)} placeholder="0.00" className="w-full bg-black border border-white/10 rounded-xl py-5 pl-12 pr-4 text-xl font-black text-white outline-none focus:border-rose-500" />
                 </div>
              </div>
           </div>

           <button type="submit" className="w-full py-5 bg-rose-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-rose-600/20 active:scale-95 transition-all flex items-center justify-center gap-3">
              <Send className="w-4 h-4" /> TRANSMITIR RE-COTIZACIÓN
           </button>
        </form>
      </div>
    </div>
  );
}
