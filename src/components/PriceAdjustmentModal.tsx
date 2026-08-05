import React, { useState, useMemo } from 'react';
import { X, DollarSign, Send, Info, FileText, Activity, TrendingUp } from 'lucide-react';
import { JobRequest } from '../types';
import { toast } from 'react-hot-toast';

interface PriceAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: JobRequest;
  onAdjust: (requestId: string, newPrice: number, reason: string) => void;
}

export default function PriceAdjustmentModal({ isOpen, onClose, request, onAdjust }: PriceAdjustmentModalProps) {
  const [newPrice, setNewPrice] = useState(request.price?.toString() || '');
  const [reason, setReason] = useState('');

  const variation = useMemo(() => {
    const oldP = request.price || 0;
    const newP = Number(newPrice) || 0;
    if (oldP === 0) return 0;
    return ((newP - oldP) / oldP) * 100;
  }, [newPrice, request.price]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPrice || !reason.trim()) return toast.error("Por favor indique el nuevo monto y la justificación.");
    onAdjust(request.id, Number(newPrice), reason);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[800] bg-[#0d0e12]/98 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-[#121317] border border-white/10 rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,1)] animate-fade-in-up flex flex-col max-h-[95vh] overflow-hidden">

        {/* HEADER - FIJO */}
        <header className="px-8 py-6 bg-[#1c1d21] border-b border-white/5 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-[#5d3cfe] text-white rounded-xl shadow-lg shadow-[#5d3cfe]/20">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white uppercase italic tracking-tighter leading-none">Ajuste de <span className="text-[#5d3cfe]">Tarifa</span></h3>
              <p className="text-[8px] text-[#474556] font-black uppercase tracking-[0.3em] mt-1">Re-negociación: {request.assetName}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2.5 bg-white/5 rounded-xl text-white/20 hover:text-rose-500 transition-all"><X className="w-5 h-5" /></button>
        </header>

        {/* CUERPO - SCROLLABLE */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-10 space-y-8">
          <div className="grid grid-cols-2 gap-6">
             <div className="p-6 bg-black/40 rounded-3xl border border-white/5 space-y-2 shadow-inner">
                <span className="text-[8px] font-black text-[#474556] uppercase tracking-[0.2em]">Presupuesto Actual</span>
                <p className="text-2xl font-black text-white italic leading-none">B/. {request.price?.toFixed(2)}</p>
             </div>
             <div className="p-6 bg-black/40 rounded-3xl border border-white/5 space-y-2 shadow-inner">
                <span className="text-[8px] font-black text-[#474556] uppercase tracking-[0.2em]">Descripción Base</span>
                <p className="text-[10px] font-bold text-[#c8c4d9] uppercase truncate">"{request.description}"</p>
             </div>
          </div>

          <form id="adjustment-form" onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-6">
              <div className="space-y-3">
                 <div className="flex justify-between items-center ml-2">
                    <label className="text-[10px] font-black text-[#c7bfff] uppercase tracking-[0.3em]">Nueva Inversión Sugerida</label>
                    {variation !== 0 && (
                      <span className={`text-[8px] font-black px-3 py-1 rounded-full flex items-center gap-1.5 ${variation > 0 ? 'bg-rose-500/10 text-rose-500' : 'bg-[#52ffac]/10 text-[#52ffac]'} border border-current opacity-80`}>
                         {variation > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingUp className="w-3 h-3 rotate-180" />}
                         {variation > 0 ? '+' : ''}{variation.toFixed(1)}% VARIACIÓN
                      </span>
                    )}
                 </div>
                 <div className="relative group">
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-[#52ffac] group-focus-within:scale-110 transition-transform">
                       <DollarSign className="w-8 h-8" />
                    </div>
                    <input
                      required
                      type="number"
                      step="any"
                      value={newPrice}
                      onChange={e => setNewPrice(e.target.value)}
                      className="w-full bg-black border border-white/10 rounded-[2.5rem] py-8 pl-20 pr-8 text-4xl font-black text-white outline-none focus:border-[#5d3cfe] transition-all shadow-inner tracking-tighter"
                    />
                 </div>
              </div>

              <div className="space-y-3">
                 <label className="text-[10px] font-black text-[#474556] uppercase tracking-[0.3em] ml-2">Justificación Técnica del Cambio</label>
                 <div className="relative group">
                    <div className="absolute left-6 top-6 p-3 bg-white/5 rounded-2xl border border-white/5 group-focus-within:border-[#5d3cfe]/30 transition-all">
                       <FileText className="w-6 h-6 text-[#5d3cfe]" />
                    </div>
                    <textarea
                      required
                      value={reason}
                      onChange={e => setReason(e.target.value)}
                      placeholder="Describa el motivo técnico por el cual se requiere este ajuste de tarifa..."
                      className="w-full bg-black border border-white/10 rounded-[2.5rem] p-10 pl-24 text-sm font-medium text-white focus:border-[#5d3cfe] outline-none transition-all resize-none h-48 shadow-inner leading-relaxed"
                    />
                 </div>
              </div>
            </div>
          </form>

          <div className="flex items-center gap-4 px-8 py-3 bg-[#5d3cfe]/5 border border-[#5d3cfe]/10 rounded-full mx-auto w-fit">
            <Info className="w-4 h-4 text-[#5d3cfe]" />
            <p className="text-[9px] font-black text-[#c8c4d9] uppercase tracking-widest text-center">Este cambio requiere la autorización digital del cliente para hacerse efectivo.</p>
          </div>
        </div>

        {/* FOOTER - FIJO */}
        <footer className="p-8 pt-2 shrink-0 bg-gradient-to-t from-[#121317] to-transparent">
          <button form="adjustment-form" type="submit" className="w-full py-4 bg-[#5d3cfe] text-white rounded-xl text-[10px] font-black uppercase tracking-[0.3em] shadow-xl shadow-[#5d3cfe]/20 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-3">
              <Send className="w-4 h-4" /> TRANSMITIR AJUSTE
          </button>
        </footer>
      </div>
    </div>
  );
}
