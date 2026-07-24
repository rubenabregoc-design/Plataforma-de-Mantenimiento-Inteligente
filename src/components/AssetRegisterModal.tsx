import React, { useState, useEffect } from 'react';
import { Asset, AssetType, AssetCategory, RiskLevel } from '../types';
import { Plus, X, Car, ShieldCheck, Cpu, Sliders, BatteryCharging, Zap, Boxes, Home, Edit2, Search, CheckCircle2, Droplets, PlugZap, Building2, Stethoscope, HardHat, LayoutGrid, Bike, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface AssetRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (asset: Omit<Asset, 'id' | 'registeredAt'>) => void;
  assetToEdit?: Asset | null;
  maxAssets?: number;
  currentAssetsCount?: number;
}

export default function AssetRegisterModal({ isOpen, onClose, onAdd, assetToEdit, maxAssets = 3, currentAssetsCount = 0 }: AssetRegisterModalProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<AssetType>('car');
  const [category, setCategory] = useState<AssetCategory>('GENERAL');
  const [riskLevel, setRiskLevel] = useState<RiskLevel>('low');
  const [details, setDetails] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [mileage, setMileage] = useState<number>(0);
  const [lastMaintenance, setLastMaintenance] = useState('');
  const [nextMaintenance, setNextMaintenance] = useState('');
  const [observations, setObservations] = useState('');
  const [location, setLocation] = useState('Sede Principal');
  const [driverName, setDriverName] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [fuelType, setFuelType] = useState<Asset['fuelType']>('diesel');

  useEffect(() => {
    if (assetToEdit) {
      setName(assetToEdit.name);
      setType(assetToEdit.type);
      setCategory(assetToEdit.category || 'GENERAL');
      setRiskLevel(assetToEdit.riskLevel || 'low');
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
      setRiskLevel('low');
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
      toast.error(`⚠️ Límite alcanzado. Tu plan permite hasta ${maxAssets} activos.`);
      return;
    }

    // VALIDACIÓN ESTRICTA
    const missing = [];
    if (!name.trim()) missing.push("Nombre");
    if (!lastMaintenance) missing.push("Última Fecha");
    if (!nextMaintenance) missing.push("Siguiente Fecha");
    if (!details.trim()) missing.push("Modelo");

    if (missing.length > 0) {
      toast.error(`Faltan campos obligatorios: ${missing.join(', ')}`, {
        icon: <AlertCircle className="text-rose-500 w-5 h-5" />,
        style: { background: '#16171d', color: '#fff', border: '1px solid #e11d48' }
      });
      return;
    }

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
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-[#0d0e12]/90 backdrop-blur-xl">
      <div className="w-full max-w-xl bg-[#121317] rounded-[2.5rem] border border-white/5 shadow-2xl overflow-hidden animate-fade-in-up">
        <header className="px-8 py-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-[#5d3cfe]/10 flex items-center justify-center text-[#5d3cfe]">
               {assetToEdit ? <Edit2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
             </div>
             <h2 className="text-xl font-black text-white uppercase tracking-tight">
               {assetToEdit ? 'Configurar Nodo' : 'Vincular Nuevo Activo'}
             </h2>
          </div>
          <button onClick={onClose} className="p-2 text-white/20 hover:text-white transition-colors"><X className="w-6 h-6" /></button>
        </header>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
          {/* Categoría */}
          <div className="space-y-4">
            <label className="text-[10px] font-black text-[#474556] uppercase tracking-widest">Capa Operativa</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {(['GENERAL', 'PH', 'SALUD', 'CONSTRUCCION'] as AssetCategory[]).map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all ${category === cat ? 'bg-[#5d3cfe] border-[#5d3cfe] text-white shadow-lg' : 'bg-white/5 border-white/5 text-white/40 hover:border-white/10'}`}
                >
                  {cat === 'GENERAL' && <LayoutGrid className="w-4 h-4" />}
                  {cat === 'PH' && <Building2 className="w-4 h-4" />}
                  {cat === 'SALUD' && <Stethoscope className="w-4 h-4" />}
                  {cat === 'CONSTRUCCION' && <HardHat className="w-4 h-4" />}
                  <span className="text-[8px] font-black">{cat}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Información Básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-[#474556] uppercase tracking-widest ml-1">Marca / Identificador *</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Ej: Toyota / Carrier" className="w-full bg-[#0d0e12] border border-white/5 rounded-xl py-3 px-4 text-sm font-bold text-white focus:border-[#5d3cfe] outline-none" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-[#474556] uppercase tracking-widest ml-1">Modelo / Referencia *</label>
              <input type="text" value={details} onChange={e => setDetails(e.target.value)} placeholder="Ej: Hilux 2024 / VRF-X" className="w-full bg-[#0d0e12] border border-white/5 rounded-xl py-3 px-4 text-sm font-bold text-white focus:border-[#5d3cfe] outline-none" />
            </div>
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="space-y-1.5">
               <label className="text-[10px] font-black text-[#474556] uppercase tracking-widest ml-1">Última Revisión *</label>
               <input type="date" value={lastMaintenance} onChange={e => setLastMaintenance(e.target.value)} className="w-full bg-[#0d0e12] border border-white/5 rounded-xl py-3 px-4 text-sm font-black text-[#52ffac] focus:border-[#52ffac] outline-none [color-scheme:dark]" />
             </div>
             <div className="space-y-1.5">
               <label className="text-[10px] font-black text-[#474556] uppercase tracking-widest ml-1">Próxima Alerta *</label>
               <input type="date" value={nextMaintenance} onChange={e => setNextMaintenance(e.target.value)} className="w-full bg-[#0d0e12] border border-white/5 rounded-xl py-3 px-4 text-sm font-black text-[#5d3cfe] focus:border-[#5d3cfe] outline-none [color-scheme:dark]" />
             </div>
          </div>

          <button type="submit" className="w-full py-5 bg-[#5d3cfe] text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-[#5d3cfe]/20 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-3">
             <Zap className="w-4 h-4 fill-white" />
             {assetToEdit ? 'Actualizar Registro de Nodo' : 'Protocolizar Activo en Sistema'}
          </button>
        </form>
      </div>
    </div>
  );
}
