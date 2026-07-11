import React, { useState } from 'react';
import { X, Flag, MapPin, CheckCircle2 } from 'lucide-react';

interface CheckpointModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (checkpointName: string) => void;
  assetName: string;
}

export default function CheckpointModal({ isOpen, onClose, onConfirm, assetName }: CheckpointModalProps) {
  const [name, setName] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <div className="w-full max-w-md bg-[#121317] border border-[#2a2b2f] rounded-[3rem] p-10 space-y-8 shadow-2xl animate-fade-in-up">
        <header className="flex justify-between items-center">
           <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-500">
                 <Flag className="w-6 h-6 fill-current" />
              </div>
              <div>
                 <h3 className="text-xl font-black text-white uppercase tracking-tight">Registrar Parada</h3>
                 <p className="text-[10px] text-[#474556] font-black uppercase tracking-widest">{assetName}</p>
              </div>
           </div>
           <button onClick={onClose} className="p-2 text-[#474556] hover:text-white transition-all"><X className="w-6 h-6" /></button>
        </header>

        <div className="space-y-6">
           <div className="space-y-2">
              <label className="text-[10px] font-black text-[#474556] uppercase ml-1">Nombre del Punto de Control</label>
              <div className="relative">
                 <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500" />
                 <input
                   autoFocus
                   type="text"
                   placeholder="Ej: Almacén Chiriquí / Entrega Super X / Pausa Almuerzo..."
                   value={name}
                   onChange={e => setName(e.target.value)}
                   onKeyDown={e => e.key === 'Enter' && name && onConfirm(name)}
                   className="w-full bg-[#0d0e12] border border-[#2a2b2f] rounded-2xl py-4 pl-12 pr-6 text-white font-bold text-sm focus:border-amber-500 outline-none transition-all placeholder:opacity-20"
                 />
              </div>
           </div>

           <div className="bg-amber-500/5 p-5 rounded-2xl border border-amber-500/10 flex items-start gap-4">
              <CheckCircle2 className="w-5 h-5 text-amber-500 shrink-0" />
              <p className="text-[10px] text-[#c8c4d9] font-medium leading-relaxed italic">
                 Este registro guardará la ubicación GPS actual y la estampa de tiempo para el historial de auditoría de la unidad.
              </p>
           </div>
        </div>

        <div className="flex gap-4">
           <button onClick={onClose} className="flex-1 py-4 bg-[#1c1d21] text-[#c8c4d9] rounded-xl text-[10px] font-black uppercase hover:bg-[#2a2b2f] transition-all">Cancelar</button>
           <button
             onClick={() => name && onConfirm(name)}
             disabled={!name}
             className="flex-1 py-4 bg-amber-500 disabled:opacity-20 text-[#0d0e12] rounded-xl text-[10px] font-black uppercase shadow-lg shadow-amber-500/20 hover:brightness-110 transition-all flex items-center justify-center gap-2"
           >
             Registrar Punto ➔
           </button>
        </div>
      </div>
    </div>
  );
}
