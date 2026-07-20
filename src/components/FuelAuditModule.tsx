import React, { useState } from 'react';
import { Asset } from '../types';
import { Fuel, AlertTriangle, CheckCircle2, Camera, TrendingUp, DollarSign } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface FuelAuditModuleProps {
  asset: Asset;
  onSaveLog: (assetId: string, log: any) => void;
}

export default function FuelAuditModule({ asset, onSaveLog }: FuelAuditModuleProps) {
  const [gallons, setGallons] = useState('');
  const [price, setPrice] = useState('');
  const [mileage, setMileage] = useState(asset.mileage || '');

  const handleCalculate = () => {
    const g = Number(gallons);
    const p = Number(price);
    const m = Number(mileage);

    if (!g || !p || !m) {
      return toast.error("Por favor complete todos los datos de la carga.");
    }

    // LÓGICA MATEMÁTICA ANTIRROBO
    // 1. Calculamos distancia desde el último log
    const lastLog = asset.fuelLogs?.[asset.fuelLogs.length - 1];
    const distanceTraveled = lastLog ? (m - lastLog.mileage) : 0;

    // 2. Calculamos consumo esperado (Si no hay eficiencia definida, usamos 15km/gal como estándar)
    const efficiency = asset.fuelEfficiency || 15;
    const expectedConsumption = distanceTraveled / efficiency;

    // 3. Detectamos Anomalía (Si cargó más del 20% de lo que debió consumir)
    const threshold = expectedConsumption * 1.20;
    const isAnomaly = distanceTraveled > 0 && g > threshold;

    const newLog = {
      date: new Date().toISOString(),
      gallons: g,
      price: p,
      mileage: m,
      status: isAnomaly ? 'anomaly' : 'ok'
    };

    onSaveLog(asset.id, newLog);

    if (isAnomaly) {
      toast.error("⚠️ ALERTA: Consumo inusual detectado para la distancia recorrida.");
    } else {
      toast.success("Carga registrada y validada correctamente.");
    }

    setGallons('');
    setPrice('');
  };

  return (
    <div className="bg-[#121317] border border-white/5 rounded-[2.5rem] p-8 space-y-8 shadow-2xl">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-500 flex items-center justify-center">
          <Fuel className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-xl font-black text-white uppercase tracking-tight">Auditoría de Combustible</h3>
          <p className="text-[10px] text-[#474556] font-black uppercase tracking-widest">Control de Gasto y Rendimiento</p>
        </div>
      </div>

      {/* Formulario de Entrada */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-[#474556] uppercase ml-1">Galones Cargados</label>
          <input
            type="number"
            value={gallons}
            onChange={e => setGallons(e.target.value)}
            className="w-full bg-[#0d0e12] border border-white/5 rounded-2xl py-4 px-5 text-white font-black"
            placeholder="0.00"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-[#474556] uppercase ml-1">Total Pagado ($)</label>
          <input
            type="number"
            value={price}
            onChange={e => setPrice(e.target.value)}
            className="w-full bg-[#0d0e12] border border-white/5 rounded-2xl py-4 px-5 text-white font-black"
            placeholder="0.00"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-[#474556] uppercase ml-1">Odómetro Actual (KM)</label>
          <input
            type="number"
            value={mileage}
            onChange={e => setMileage(e.target.value)}
            className="w-full bg-[#0d0e12] border border-white/5 rounded-2xl py-4 px-5 text-white font-black"
          />
        </div>
      </div>

      <button
        onClick={handleCalculate}
        className="w-full py-5 bg-[#52ffac] text-[#0d0e12] rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-[#52ffac]/20 hover:scale-[1.02] active:scale-95 transition-all"
      >
        Validar Carga y Guardar Registro
      </button>

      {/* Historial Reciente */}
      <div className="space-y-4 pt-4 border-t border-white/5">
        <h4 className="text-[10px] font-black text-[#474556] uppercase tracking-widest">Últimos Registros</h4>
        <div className="grid grid-cols-1 gap-3">
          {asset.fuelLogs?.slice(-3).reverse().map((log, idx) => (
            <div key={idx} className={`p-4 rounded-2xl border flex items-center justify-between ${log.status === 'anomaly' ? 'bg-rose-500/5 border-rose-500/20' : 'bg-white/5 border-white/5'}`}>
              <div className="flex items-center gap-4">
                {log.status === 'anomaly' ? <AlertTriangle className="w-4 h-4 text-rose-500" /> : <CheckCircle2 className="w-4 h-4 text-[#52ffac]" />}
                <div>
                  <p className="text-xs font-bold text-white uppercase">{log.gallons} Galones</p>
                  <p className="text-[9px] text-[#474556] uppercase font-black">{new Date(log.date).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-black text-white">${log.price}</p>
                <p className="text-[8px] font-black text-[#5d3cfe] uppercase">{log.status === 'anomaly' ? '⚠️ ANOMALÍA' : 'VALIDADO'}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
