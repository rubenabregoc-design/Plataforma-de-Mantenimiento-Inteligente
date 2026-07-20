import React, { useState } from 'react';
import { X, Check, AlertTriangle, ShieldCheck, ClipboardCheck } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface PreTripInspectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  assetName: string;
  onSave: (inspection: any) => void;
}

export default function PreTripInspectionModal({ isOpen, onClose, assetName, onSave }: PreTripInspectionModalProps) {
  const [items, setItems] = useState([
    { id: '1', label: 'Nivel de Aceite', status: 'pending' as 'pending' | 'ok' | 'fail' },
    { id: '2', label: 'Nivel de Refrigerante', status: 'pending' },
    { id: '3', label: 'Presión de Neumáticos', status: 'pending' },
    { id: '4', label: 'Luces y Frenos', status: 'pending' },
    { id: '5', label: 'Documentación Vigente', status: 'pending' }
  ]);

  const [observations, setObservations] = useState('');

  if (!isOpen) return null;

  const toggleStatus = (id: string, newStatus: 'ok' | 'fail') => {
    setItems(items.map(item => item.id === id ? { ...item, status: newStatus } : item));
  };

  const handleFinish = () => {
    if (items.some(i => i.status === 'pending')) {
      return toast.error("Por favor complete todos los puntos de inspección.");
    }

    const hasFail = items.some(i => i.status === 'fail');

    onSave({
      date: new Date().toISOString(),
      items: items.map(i => ({ label: i.label, status: i.status })),
      observations,
      result: hasFail ? 'warning' : 'safe'
    });

    if (hasFail) {
      toast.error("⚠️ Alerta: Se detectaron fallos. Se recomienda no iniciar ruta.");
    } else {
      toast.success("🛡️ Inspección Completada. ¡Buen viaje!");
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[700] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-[#121317] border border-white/10 rounded-[3rem] p-8 md:p-10 space-y-8 shadow-2xl animate-fade-in-up">
        <header className="flex justify-between items-start">
          <div className="space-y-2">
            <h3 className="text-2xl font-black text-white uppercase italic">Inspección <span className="text-[#5d3cfe]">Pre-Viaje</span></h3>
            <p className="text-[10px] text-[#474556] font-bold uppercase tracking-widest leading-none">Seguridad Preventiva: {assetName}</p>
          </div>
          <button onClick={onClose} className="p-2 bg-white/5 rounded-xl hover:bg-rose-600 transition-all">
            <X className="w-5 h-5 text-white" />
          </button>
        </header>

        <div className="space-y-3">
          {items.map(item => (
            <div key={item.id} className="bg-[#0d0e12] border border-white/5 p-4 rounded-2xl flex items-center justify-between group transition-all hover:border-white/10">
              <span className="text-[11px] font-black text-white uppercase tracking-tight">{item.label}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => toggleStatus(item.id, 'fail')}
                  className={`p-2 rounded-lg transition-all ${item.status === 'fail' ? 'bg-rose-600 text-white' : 'bg-white/5 text-[#474556]'}`}
                >
                  <AlertTriangle className="w-4 h-4" />
                </button>
                <button
                  onClick={() => toggleStatus(item.id, 'ok')}
                  className={`p-2 rounded-lg transition-all ${item.status === 'ok' ? 'bg-[#52ffac] text-black' : 'bg-white/5 text-[#474556]'}`}
                >
                  <Check className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <label className="text-[9px] font-black text-[#474556] uppercase ml-1">Observaciones (Opcional)</label>
          <textarea
            value={observations}
            onChange={e => setObservations(e.target.value)}
            className="w-full bg-[#0d0e12] border border-white/5 rounded-2xl p-4 text-white text-xs outline-none focus:border-[#5d3cfe] min-h-[80px]"
            placeholder="Escriba aquí si detectó algo inusual..."
          />
        </div>

        <button
          onClick={handleFinish}
          className="w-full py-5 bg-[#5d3cfe] text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] shadow-xl shadow-[#5d3cfe]/20 active:scale-95 transition-all flex items-center justify-center gap-3"
        >
          <ShieldCheck className="w-5 h-5" /> VALIDAR SEGURIDAD Y SALIR
        </button>
      </div>
    </div>
  );
}
