import React, { useState } from 'react';
import { X, Navigation, Flag, MapPin, Play } from 'lucide-react';

interface RouteStartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (destination: string) => void;
  assetName: string;
}

export default function RouteStartModal({ isOpen, onClose, onConfirm, assetName }: RouteStartModalProps) {
  const [destination, setDestination] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <div className="w-full max-w-lg bg-[#121317] border border-[#2a2b2f] rounded-[3rem] p-10 space-y-8 shadow-2xl animate-fade-in-up">
        <header className="flex justify-between items-center">
           <div className="flex items-center gap-4">
              <div className="p-3 bg-[#52ffac]/10 rounded-2xl text-[#52ffac]">
                 <Navigation className="w-6 h-6 fill-current" />
              </div>
              <div>
                 <h3 className="text-xl font-black text-white uppercase tracking-tight">Despacho de Unidad</h3>
                 <p className="text-[10px] text-[#474556] font-black uppercase tracking-widest">{assetName}</p>
              </div>
           </div>
           <button onClick={onClose} className="p-2 text-[#474556] hover:text-white transition-all"><X className="w-6 h-6" /></button>
        </header>

        <div className="space-y-6">
           <div className="space-y-2">
              <label className="text-[10px] font-black text-[#474556] uppercase ml-1">Destino de la Misión</label>
              <div className="relative">
                 <Flag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5d3cfe]" />
                 <input
                   autoFocus
                   type="text"
                   placeholder="Ej: Sede Central / Puerto Colón / Chiriquí..."
                   value={destination}
                   onChange={e => setDestination(e.target.value)}
                   className="w-full bg-[#0d0e12] border border-[#2a2b2f] rounded-2xl py-4 pl-12 pr-6 text-white font-bold text-sm focus:border-[#5d3cfe] outline-none transition-all"
                 />
              </div>
           </div>

           <div className="bg-[#1c1d21] p-5 rounded-2xl border border-white/5 flex items-start gap-4">
              <MapPin className="w-5 h-5 text-[#5d3cfe] shrink-0" />
              <p className="text-[10px] text-[#c8c4d9] font-medium leading-relaxed italic">
                 Al iniciar la ruta, el GPS del dispositivo móvil comenzará a transmitir la ubicación al centro de mando MantechPro de forma encriptada.
              </p>
           </div>
        </div>

        <div className="flex gap-4">
           <button onClick={onClose} className="flex-1 py-4 bg-[#1c1d21] text-[#c8c4d9] rounded-2xl text-[10px] font-black uppercase hover:bg-[#2a2b2f] transition-all">Cancelar</button>
           <button
             onClick={() => destination && onConfirm(destination)}
             disabled={!destination}
             className="flex-1 py-4 bg-[#5d3cfe] disabled:opacity-20 text-white rounded-2xl text-[10px] font-black uppercase shadow-xl shadow-[#5d3cfe]/20 hover:brightness-110 transition-all flex items-center justify-center gap-2 group"
           >
             <Navigation className="w-4 h-4 fill-current group-hover:animate-bounce" /> Despachar Unidad
           </button>
        </div>
      </div>
    </div>
  );
}
