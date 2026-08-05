import React, { useState } from 'react';
import { X, Package, Plus, DollarSign } from 'lucide-react';
import { JobRequest } from '../types';
import { toast } from 'react-hot-toast';

interface MaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: JobRequest;
  onSave: (requestId: string, name: string, price: number, quantity: number, category: string) => void;
}

export default function MaterialModal({ isOpen, onClose, request, onSave }: MaterialModalProps) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [qty, setQty] = useState('1');
  const [category, setCategory] = useState('Repuestos');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price) return toast.error("Complete los datos del material.");

    onSave(request.id, name, Number(price), Number(qty), category);
    setName('');
    setPrice('');
    setQty('1');
    toast.success("Material inyectado al ticket.");
  };

  return (
    <div className="fixed inset-0 z-[800] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-[#121317] border border-white/10 rounded-[2.5rem] shadow-2xl animate-fade-in-up flex flex-col max-h-[90vh] overflow-hidden">

        {/* HEADER */}
        <header className="p-8 border-b border-white/5 flex justify-between items-start shrink-0">
          <div className="space-y-2">
            <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Cargar <span className="text-[#5d3cfe]">Insumos</span></h3>
            <p className="text-[10px] text-[#474556] font-bold uppercase tracking-widest leading-none">Vincular Material al Ticket: {request.id.substring(0,8)}</p>
          </div>
          <button onClick={onClose} className="p-2 bg-white/5 rounded-xl hover:bg-rose-600 transition-all">
            <X className="w-5 h-5 text-white" />
          </button>
        </header>

        {/* CONTENT - SCROLLABLE */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-8 pt-6">
          <form id="material-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-[#474556] uppercase ml-1">Nombre del Material / Repuesto</label>
                  <div className="relative">
                      <Package className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5d3cfe]" />
                      <input required type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Ej: Filtro de Aceite, Cable 10 AWG..." className="w-full bg-black border border-white/10 rounded-xl py-4 pl-12 pr-4 text-xs font-bold text-white outline-none focus:border-[#5d3cfe]" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                      <label className="text-[9px] font-black text-[#474556] uppercase ml-1">Precio Unitario (B/.)</label>
                      <div className="relative">
                        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#52ffac]" />
                        <input required type="number" step="any" value={price} onChange={e => setPrice(e.target.value)} placeholder="0.00" className="w-full bg-black border border-white/10 rounded-xl py-4 pl-12 pr-4 text-xs font-bold text-white outline-none focus:border-[#52ffac]" />
                      </div>
                  </div>
                  <div className="space-y-2">
                      <label className="text-[9px] font-black text-[#474556] uppercase ml-1">Cantidad</label>
                      <input required type="number" value={qty} onChange={e => setQty(e.target.value)} className="w-full bg-black border border-white/10 rounded-xl py-4 px-4 text-xs font-bold text-white outline-none focus:border-[#5d3cfe]" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-black text-[#474556] uppercase ml-1">Categoría</label>
                  <select value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-black border border-white/10 rounded-xl py-4 px-4 text-[10px] font-black text-white uppercase outline-none">
                      <option>Repuestos</option>
                      <option>Consumibles</option>
                      <option>Herramientas</option>
                      <option>Logística</option>
                  </select>
                </div>
            </div>

            <button type="submit" className="w-full py-5 bg-[#5d3cfe] text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-[#5d3cfe]/20 active:scale-95 transition-all flex items-center justify-center gap-3">
                <Plus className="w-4 h-4" /> REGISTRAR MATERIAL
            </button>
          </form>

          <div className="pt-4 border-t border-white/5">
            <h4 className="text-[9px] font-black text-[#474556] uppercase tracking-widest mb-4">Materiales en este Ticket</h4>
            <div className="space-y-2">
                {(request.materials || []).map((m, i) => (
                  <div key={i} className="bg-white/5 border border-white/5 p-3 rounded-xl flex justify-between items-center animate-fade-in">
                    <div>
                        <p className="text-[10px] font-black text-white uppercase">{m.name}</p>
                        <p className="text-[8px] text-[#474556] font-bold uppercase">Cant: {m.quantity} • {m.category}</p>
                    </div>
                    <p className="text-xs font-black text-[#52ffac]">B/. {(m.price * m.quantity).toFixed(2)}</p>
                  </div>
                ))}
                {(request.materials || []).length === 0 && <p className="text-center text-[8px] text-[#474556] uppercase italic py-4">Sin insumos cargados aún</p>}
            </div>
          </div>
        </div>

        {/* FOOTER - PROTECTOR */}
        <footer className="p-4 bg-black/20 border-t border-white/5 text-center shrink-0">
           <p className="text-[7px] text-[#474556] font-black uppercase tracking-widest">Sincronización en Tiempo Real con Nodo Central</p>
        </footer>
      </div>
    </div>
  );
}
