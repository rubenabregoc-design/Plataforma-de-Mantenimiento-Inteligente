import React, { useState, useEffect } from 'react';
import { Asset } from '../types';
import { X, Fuel, Camera, CheckCircle2, TrendingUp, History, Info, AlertTriangle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useData } from '../context/DataContext';

interface FuelAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: Asset;
  onAddLog: (assetId: string, log: any) => void;
}

export default function FuelAuditModal({ isOpen, onClose, asset: initialAsset, onAddLog }: FuelAuditModalProps) {
  const { assets } = useData();
  const [selectedAssetId, setSelectedAssetId] = useState(initialAsset.id);
  const [gallons, setGallons] = useState('');
  const [price, setPrice] = useState('');
  const [mileage, setMileage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Encontrar el activo actual de la lista global para tener datos frescos
  const asset = assets.find(a => a.id === selectedAssetId) || initialAsset;

  useEffect(() => {
    if (isOpen) {
      setMileage(asset.mileage?.toString() || '');
      setGallons('');
      setPrice('');
    }
  }, [isOpen, selectedAssetId, asset.mileage]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gallons || !price || !mileage) {
      toast.error("Por favor complete todos los campos de auditoría.");
      return;
    }

    setIsSubmitting(true);
    const newLog = {
      date: new Date().toISOString(),
      gallons: Number(gallons),
      price: Number(price),
      mileage: Number(mileage),
      status: 'ok'
    };

    try {
      await onAddLog(asset.id, newLog);

      // ALERTA DE CONSUMO SI EL COSTO POR KM ES > $0.50
      const costPerKm = newLog.price / (newLog.mileage || 1);
      if (costPerKm > 0.5) {
        toast("⚠️ ALERTA: Consumo inusual detectado. El costo por KM es muy elevado. Verifique si el odómetro es correcto.", {
          duration: 6000,
          style: { background: '#1c1d21', color: '#fbbf24', border: '1px solid #fbbf24', fontSize: '10px', fontWeight: 'bold' }
        });
      } else {
        toast.success("Carga registrada y validada correctamente.");
      }

      setGallons('');
      setPrice('');
    } catch (err) {
      console.error(err);
      toast.error("Error en la conexión con el Nodo Central.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const logs = asset.fuelLogs || [];

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-[#0d0e12]/90 backdrop-blur-xl">
      <div className="w-full max-w-2xl bg-[#121317] border border-white/10 rounded-[3rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] flex flex-col max-h-[90vh] animate-fade-in-up">

        <header className="p-8 border-b border-white/5 flex justify-between items-center bg-[#1c1d21]">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-[#52ffac]/10 border border-[#52ffac]/20 rounded-2xl flex items-center justify-center text-[#52ffac] shadow-2xl">
              <Fuel className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-white uppercase tracking-tighter italic">Auditoría de Combustible</h3>
              <div className="flex items-center gap-3 mt-1">
                 <select
                   value={selectedAssetId}
                   onChange={(e) => setSelectedAssetId(e.target.value)}
                   className="bg-[#0d0e12] border border-white/10 rounded-lg px-2 py-1 text-[10px] font-black text-[#52ffac] uppercase outline-none focus:border-[#52ffac] cursor-pointer"
                 >
                   {assets.filter(a => a.type === 'car' || a.type === 'moto' || a.type === 'generator').map(a => (
                     <option key={a.id} value={a.id}>{a.name} ({a.licensePlate || 'SN'})</option>
                   ))}
                 </select>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-4 bg-white/5 hover:bg-rose-600/20 text-white/40 hover:text-white rounded-3xl transition-all">
            <X className="w-6 h-6" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-8">

          {/* SECCIÓN DE ENTRADA DE DATOS */}
          <div className="space-y-6">
             <div className="flex items-center gap-3 ml-2">
                <div className="w-1.5 h-4 bg-[#52ffac] rounded-full"></div>
                <h4 className="text-[10px] font-black text-white uppercase tracking-[0.4em]">Registrar Nueva Carga</h4>
             </div>

             <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#0d0e12] p-8 rounded-[2.5rem] border border-white/5 shadow-inner">
                <div className="space-y-3">
                  <label className="text-[9px] font-black text-[#474556] uppercase tracking-widest ml-1">Volumen (Galones)</label>
                  <input
                    type="number" step="any" required value={gallons}
                    onChange={e => setGallons(e.target.value)}
                    className="w-full bg-[#1c1d21] border border-white/10 rounded-2xl py-4 px-6 text-base font-black text-white focus:border-[#52ffac] outline-none transition-all shadow-lg"
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[9px] font-black text-[#474556] uppercase tracking-widest ml-1">Inversión (B/.)</label>
                  <input
                    type="number" step="any" required value={price}
                    onChange={e => setPrice(e.target.value)}
                    className="w-full bg-[#1c1d21] border border-white/10 rounded-2xl py-4 px-6 text-base font-black text-[#52ffac] focus:border-[#52ffac] outline-none transition-all shadow-lg"
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-3 md:col-span-2">
                  <label className="text-[9px] font-black text-[#474556] uppercase tracking-widest ml-1">Kilometraje Actual (Odómetro)</label>
                  <input
                    type="number" step="any" required value={mileage}
                    onChange={e => setMileage(e.target.value)}
                    className="w-full bg-[#1c1d21] border border-white/10 rounded-2xl py-4 px-6 text-base font-black text-white focus:border-[#52ffac] outline-none transition-all shadow-lg"
                    placeholder="Ingrese lectura actual"
                  />
                </div>

                <div className="md:col-span-2 flex gap-4 mt-4">
                  <button type="button" className="flex-1 py-5 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center gap-3 text-[10px] font-black text-[#c8c4d9] uppercase hover:bg-white/10 transition-all">
                    <Camera className="w-5 h-5" /> Recibo
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-[2] py-5 bg-[#52ffac] text-black rounded-2xl flex items-center justify-center gap-3 text-xs font-black uppercase shadow-[0_15px_30px_rgba(82,255,172,0.2)] hover:brightness-110 active:scale-95 transition-all"
                  >
                    {isSubmitting ? 'Procesando...' : <><CheckCircle2 className="w-5 h-5" /> Validar y Guardar</>}
                  </button>
                </div>
             </form>
          </div>

          {/* SECCIÓN DE HISTORIAL */}
          <div className="space-y-8">
            <div className="flex items-center justify-between px-2">
               <div className="flex items-center gap-3">
                  <div className="w-1.5 h-4 bg-white/20 rounded-full"></div>
                  <h4 className="text-[10px] font-black text-[#474556] uppercase tracking-[0.4em]">Historial de Carga</h4>
               </div>
               {logs.length > 0 && (
                 <span className="text-[8px] font-black text-[#52ffac] uppercase bg-[#52ffac]/10 px-3 py-1 rounded-full border border-[#52ffac]/20">Auditado v4.2</span>
               )}
            </div>

            <div className="space-y-4">
              {logs.length > 0 ? [...logs].reverse().slice(0, 10).map((log, i) => (
                <div key={i} className="bg-[#1c1d21] border border-white/5 p-6 rounded-[2rem] flex items-center justify-between group hover:border-[#52ffac]/30 transition-all shadow-xl">
                   <div className="flex items-center gap-6">
                      <div className="w-12 h-12 bg-[#0d0e12] rounded-2xl flex items-center justify-center text-[#52ffac]/40">
                         <Fuel className="w-5 h-5" />
                      </div>
                      <div>
                         <p className="text-sm font-black text-white">{log.gallons.toFixed(2)} Gal.</p>
                         <p className="text-[9px] text-[#474556] font-bold uppercase tracking-widest mt-1">{new Date(log.date).toLocaleDateString()} • {log.mileage.toLocaleString()} KM</p>
                      </div>
                   </div>
                   <div className="text-right">
                      <p className="text-lg font-black text-[#52ffac]">${log.price.toFixed(2)}</p>
                      <p className="text-[7px] text-[#474556] font-black uppercase tracking-widest">Validado</p>
                   </div>
                </div>
              )) : (
                <div className="p-20 text-center bg-white/[0.01] border border-dashed border-white/5 rounded-[3rem] space-y-6 opacity-40">
                   <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                      <Info className="w-8 h-8 text-[#474556]" />
                   </div>
                   <p className="text-[10px] font-black text-[#474556] uppercase tracking-[0.3em] leading-relaxed">Sin registros detectados.<br/>Realice un suministro para activar el historial.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <footer className="p-8 bg-[#0d0e12] border-t border-white/5 flex items-center justify-between shrink-0">
           <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-[#52ffac] animate-pulse"></div>
              <p className="text-[8px] font-black text-[#474556] uppercase tracking-widest">Conexión Segura con el Nodo Central Mantech</p>
           </div>
           <p className="text-[8px] font-bold text-white/10 uppercase tracking-widest font-mono">ID-TOKEN: {asset.id.toUpperCase()}</p>
        </footer>
      </div>
    </div>
  );
}
