import React, { useState, useEffect } from 'react';
import { Asset, AssetType, AssetCategory } from '../types';
import { Plus, X, Car, ShieldCheck, Cpu, Sliders, BatteryCharging, Zap, Boxes, Home, Edit2, Search, CheckCircle2, Droplets, PlugZap, Building2, Stethoscope, HardHat, LayoutGrid, Bike } from 'lucide-react';

interface AssetRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (asset: Omit<Asset, 'id' | 'registeredAt'>) => void;
  assetToEdit?: Asset | null;
  maxAssets?: number;
  currentAssetsCount?: number;
}

export default function AssetRegisterModal({ isOpen, onClose, onAdd, assetToEdit, maxAssets = 3, currentAssetsCount = 0 }: AssetRegisterModalProps) {
  const [name, setName] = useState(assetToEdit?.name || '');
  const [type, setType] = useState<AssetType>(assetToEdit?.type || 'car');
  const [category, setCategory] = useState<AssetCategory>(assetToEdit?.category || 'GENERAL');
  const [riskLevel, setRiskLevel] = useState<RiskLevel>(assetToEdit?.riskLevel || 'low');
  const [details, setDetails] = useState(assetToEdit?.details || '');
  const [licensePlate, setLicensePlate] = useState(assetToEdit?.licensePlate || '');
  const [mileage, setMileage] = useState<number>(assetToEdit?.mileage || 0);
  const [lastMaintenance, setLastMaintenance] = useState(assetToEdit?.lastMaintenanceDate || '');
  const [nextMaintenance, setNextMaintenance] = useState(assetToEdit?.nextMaintenanceDate || '');
  const [observations, setObservations] = useState(assetToEdit?.observations || '');
  const [location, setLocation] = useState(assetToEdit?.location || 'Sede Principal');
  const [driverName, setDriverName] = useState(assetToEdit?.driverName || '');
  const [serialNumber, setSerialNumber] = useState(assetToEdit?.serialNumber || '');
  const [fuelType, setFuelType] = useState<Asset['fuelType']>(assetToEdit?.fuelType || 'diesel');

  useEffect(() => {
    if (assetToEdit) {
      setName(assetToEdit.name);
      setType(assetToEdit.type);
      setCategory(assetToEdit.category || 'GENERAL');
      setDetails(assetToEdit.details);
      setLicensePlate(assetToEdit.licensePlate || '');
      setMileage(assetToEdit.mileage || 0);
      setLastMaintenance(assetToEdit.lastMaintenanceDate);
      setNextMaintenance(assetToEdit.nextMaintenanceDate);
      setObservations(assetToEdit.observations || '');
      setLocation(assetToEdit.location || 'Sede Principal');
      setDriverName(assetToEdit.driverName || '');
      setSerialNumber(assetToEdit.serialNumber || '');
      setFuelType(assetToEdit.fuelType || 'diesel');
    } else {
      setName('');
      setType('car');
      setCategory('GENERAL');
      setDetails('');
      setLicensePlate('');
      setMileage(0);
      setLastMaintenance('');
      setNextMaintenance('');
      setObservations('');
      setLocation('Sede Principal');
      setDriverName('');
      setSerialNumber('');
      setFuelType('diesel');
    }
  }, [assetToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetToEdit && currentAssetsCount >= maxAssets) {
      alert(`⚠️ Límite alcanzado. Tu plan permite hasta ${maxAssets} activos. Mejora tu plan para registrar más.`);
      return;
    }
    if (!name || !lastMaintenance || !nextMaintenance) return;
    onAdd({
      name, type, category, riskLevel, details,
      licensePlate: (type === 'car' || type === 'moto') ? licensePlate : undefined,
      mileage: (type === 'car' || type === 'moto') ? Number(mileage) : undefined,
      lastMaintenanceDate: lastMaintenance,
      nextMaintenanceDate: nextMaintenance,
      observations,
      location,
      serialNumber,
      driverName: (type === 'car' || type === 'moto') ? driverName : undefined,
      fuelType: (type === 'car' || type === 'moto') ? fuelType : undefined
    });
    onClose();
  };

  const getAssetIcon = (t: AssetType) => {
    const cls = "w-4 h-4";
    switch(t) {
      case 'car': return <Car className={cls} />;
      case 'ac': return <Sliders className={cls} />;
      case 'computer': return <Cpu className={cls} />;
      case 'generator': return <Zap className={cls} />;
      case 'solar_panels': return <BatteryCharging className={cls} />;
      case 'industrial_equip': return <Boxes className={cls} />;
      case 'house': return <Home className={cls} />;
      case 'plumbing': return <Droplets className={cls} />;
      case 'electrical': return <PlugZap className={cls} />;
      case 'moto': return <Bike className={cls} />;
      default: return <ShieldCheck className={cls} />;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0d0e12]/80 backdrop-blur-md">
      <div className="w-full max-w-xl bg-[#121317] rounded-[2rem] border border-[#2a2b2f] shadow-2xl overflow-hidden animate-fade-in-up">
        <header className="px-8 py-6 bg-[#1c1d21] border-b border-[#2a2b2f] flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-[#5d3cfe]/10 flex items-center justify-center text-[#c7bfff]">
               {assetToEdit ? <Edit2 className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
             </div>
             <h2 className="text-xl font-black text-white uppercase tracking-tight">
               {assetToEdit ? 'Gestionar Activo' : 'Vincular Nuevo Equipo'}
             </h2>
          </div>
          <button onClick={onClose} className="p-2 text-[#474556] hover:text-white transition-colors"><X className="w-6 h-6" /></button>
        </header>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
          <div className="space-y-4">
            <label className="text-[10px] font-black text-[#474556] uppercase tracking-[0.2em] ml-1">Capa de Negocio (Categoría)</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {(['GENERAL', 'PH', 'SALUD', 'CONSTRUCCION'] as AssetCategory[]).map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-3xl border transition-all ${category === cat ? 'bg-[#5d3cfe] border-[#5d3cfe] text-white shadow-xl scale-105' : 'bg-[#1c1d21] border-[#2a2b2f] text-[#474556] hover:border-[#5d3cfe]/30'}`}
                >
                  {cat === 'GENERAL' && <LayoutGrid className="w-5 h-5" />}
                  {cat === 'PH' && <Building2 className="w-5 h-5" />}
                  {cat === 'SALUD' && <Stethoscope className="w-5 h-5" />}
                  {cat === 'CONSTRUCCION' && <HardHat className="w-5 h-5" />}
                  <span className="text-[9px] font-black">{cat}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black text-[#474556] uppercase tracking-[0.2em] ml-1">Nivel de Riesgo Operativo (Punto #22)</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'low', label: 'Bajo', desc: 'Limpieza/Pintura', color: 'bg-indigo-500' },
                { id: 'medium', label: 'Medio', desc: 'AC/Plomería', color: 'bg-amber-500' },
                { id: 'high', label: 'Alto', desc: 'Electricidad/Industrial', color: 'bg-rose-500' }
              ].map(r => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRiskLevel(r.id as RiskLevel)}
                  className={`p-4 rounded-[1.5rem] border text-left transition-all ${riskLevel === r.id ? 'bg-white/5 border-white/20 shadow-xl' : 'border-white/5 opacity-40'}`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-black uppercase text-white">{r.label}</span>
                    {riskLevel === r.id && <div className={`w-1.5 h-1.5 rounded-full ${r.color} animate-pulse`} />}
                  </div>
                  <p className="text-[8px] font-bold text-[#474556] uppercase">{r.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-[#474556] uppercase tracking-[0.2em] ml-1">Tipo de Activo Específico</label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
               {(['car', 'moto', 'ac', 'computer', 'generator', 'solar_panels', 'industrial_equip', 'house', 'plumbing', 'electrical'] as AssetType[]).map(t => {
                 const labels: Record<AssetType, string> = {
                   car: 'Auto / Camión',
                   moto: 'Moto',
                   ac: 'Aire Acond.',
                   computer: 'Computación',
                   generator: 'Planta Eléc.',
                   solar_panels: 'Panel Solar',
                   industrial_equip: 'Equipo Ind.',
                   house: 'Propiedad',
                   plumbing: 'Plomería',
                   electrical: 'Electricidad'
                 };
                 return (
                   <button key={t} type="button" onClick={() => setType(t)} className={`flex items-center gap-2 p-3 rounded-xl border text-[9px] font-black uppercase transition-all ${type === t ? 'bg-[#5d3cfe] border-[#5d3cfe] text-white shadow-lg' : 'bg-[#1c1d21] border-[#2a2b2f] text-[#c8c4d9] hover:border-[#c7bfff]/30'}`}>
                      {getAssetIcon(t)}
                      {labels[t]}
                   </button>
                 );
               })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-[#474556] uppercase tracking-widest ml-1">Nombre Descriptivo</label>
              <input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="Ej: Unidad Central HVAC" className="w-full bg-[#1c1d21] border border-[#2a2b2f] rounded-xl py-3.5 px-4 text-sm font-bold text-white focus:border-[#c7bfff] outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-[#474556] uppercase tracking-widest ml-1">Detalles de Marca/Modelo</label>
              <input type="text" value={details} onChange={e => setDetails(e.target.value)} placeholder="Ej: Servidor Dell R750" className="w-full bg-[#1c1d21] border border-[#2a2b2f] rounded-xl py-3.5 px-4 text-sm font-bold text-white focus:border-[#c7bfff] outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-[#474556] uppercase tracking-widest ml-1">Número de Serie / IMEI</label>
              <input type="text" value={serialNumber} onChange={e => setSerialNumber(e.target.value.toUpperCase())} placeholder="SN-123456789" className="w-full bg-[#1c1d21] border border-[#2a2b2f] rounded-xl py-3.5 px-4 text-sm font-bold text-white focus:border-[#c7bfff] outline-none" />
            </div>
          </div>

          {(type === 'car' || type === 'moto') && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#474556] uppercase tracking-widest ml-1">Número de Placa</label>
                  <input type="text" value={licensePlate} onChange={e => setLicensePlate(e.target.value.toUpperCase())} placeholder="AB1234" className="w-full bg-[#1c1d21] border border-[#2a2b2f] rounded-xl py-3.5 px-4 text-sm font-bold text-white focus:border-[#c7bfff] outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#474556] uppercase tracking-widest ml-1">{type === 'car' ? 'Kilometraje' : 'Horas de Uso'}</label>
                  <input type="number" value={mileage} onChange={e => setMileage(Number(e.target.value))} placeholder="0" className="w-full bg-[#1c1d21] border border-[#2a2b2f] rounded-xl py-3.5 px-4 text-sm font-bold text-white focus:border-[#c7bfff] outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#474556] uppercase tracking-widest ml-1">Conductor Asignado</label>
                  <input type="text" value={driverName} onChange={e => setDriverName(e.target.value)} placeholder="Nombre del Chofer" className="w-full bg-[#1c1d21] border border-[#2a2b2f] rounded-xl py-3.5 px-4 text-sm font-bold text-white focus:border-[#c7bfff] outline-none" />
                </div>
                <div className="space-y-4">
            <label className="text-[10px] font-black text-[#474556] uppercase tracking-[0.2em] ml-1">Nivel de Riesgo Operativo (Punto #22)</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'low', label: 'Bajo', desc: 'Limpieza/Pintura', color: 'bg-indigo-500' },
                { id: 'medium', label: 'Medio', desc: 'AC/Plomería', color: 'bg-amber-500' },
                { id: 'high', label: 'Alto', desc: 'Electricidad/Industrial', color: 'bg-rose-500' }
              ].map(r => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRiskLevel(r.id as RiskLevel)}
                  className={`p-4 rounded-[1.5rem] border text-left transition-all ${riskLevel === r.id ? 'bg-white/5 border-white/20 shadow-xl' : 'border-white/5 opacity-40'}`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-black uppercase text-white">{r.label}</span>
                    {riskLevel === r.id && <div className={`w-1.5 h-1.5 rounded-full ${r.color} animate-pulse`} />}
                  </div>
                  <p className="text-[8px] font-bold text-[#474556] uppercase">{r.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
                  <label className="text-[10px] font-black text-[#474556] uppercase tracking-widest ml-1">Tipo de Combustible</label>
                  <div className="flex gap-2">
                    {(['diesel', 'gas91', 'gas95'] as const).map(f => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => setFuelType(f)}
                        className={`flex-1 py-3 rounded-xl border text-[9px] font-black uppercase transition-all ${fuelType === f ? 'bg-[#52ffac] border-[#52ffac] text-black shadow-lg' : 'bg-[#1c1d21] border-[#2a2b2f] text-[#c8c4d9] hover:border-[#52ffac]/30'}`}
                      >
                        {f === 'diesel' ? 'Diesel' : f === 'gas91' ? '91 Oct.' : '95 Oct.'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="space-y-2">
                <label className="text-[10px] font-black text-[#474556] uppercase tracking-widest ml-1">Sede / Ubicación</label>
                {maxAssets > 3 ? (
                  <select
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    className="w-full bg-[#1c1d21] border border-[#2a2b2f] rounded-xl py-3.5 px-4 text-sm font-bold text-white focus:border-[#c7bfff] outline-none"
                  >
                    <option value="Sede Principal">Sede Principal</option>
                    <option value="Sede Secundaria">Sede Secundaria</option>
                    {maxAssets > 15 && <option value="Sede Regional">Sede Regional</option>}
                    {maxAssets > 15 && <option value="Puerto / Logística">Puerto / Logística</option>}
                  </select>
                ) : (
                  <input type="text" readOnly value="Sede Única (Plan Básico)" className="w-full bg-[#0d0e12] border border-[#2a2b2f] rounded-xl py-3.5 px-4 text-sm font-bold text-[#474556] outline-none" />
                )}
             </div>
             <div className="space-y-2">
               <label className="text-[10px] font-black text-[#474556] uppercase tracking-widest ml-1">Último Mtto.</label>
               <input type="date" required value={lastMaintenance} onChange={e => setLastMaintenance(e.target.value)} className="w-full bg-[#1c1d21] border border-[#2a2b2f] rounded-xl py-3.5 px-4 text-sm font-bold text-[#c7bfff] focus:border-[#c7bfff] outline-none" />
             </div>
             <div className="space-y-2">
               <label className="text-[10px] font-black text-[#474556] uppercase tracking-widest ml-1">Siguiente Programado</label>
               <input type="date" required value={nextMaintenance} onChange={e => setNextMaintenance(e.target.value)} className="w-full bg-[#1c1d21] border border-[#2a2b2f] rounded-xl py-3.5 px-4 text-sm font-bold text-[#c7bfff] focus:border-[#c7bfff] outline-none" />
             </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-[#474556] uppercase tracking-widest ml-1">Observaciones Críticas</label>
            <textarea
              value={observations}
              onChange={e => setObservations(e.target.value)}
              placeholder="Ej: El motor emite un sonido extraño al encender, requiere revisión de bujías."
              className="w-full bg-[#1c1d21] border border-[#2a2b2f] rounded-xl py-3.5 px-4 text-xs font-bold text-white focus:border-[#c7bfff] outline-none h-24 resize-none"
            />
          </div>

          <button type="submit" className="w-full py-5 bg-[#5d3cfe] text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-[#5d3cfe]/20 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-3">
             <Zap className="w-4 h-4 fill-white" />
             {assetToEdit ? 'Guardar Cambios en Nodo' : 'Registrar Activo en el Nodo'}
          </button>
        </form>
      </div>
    </div>
  );
}
