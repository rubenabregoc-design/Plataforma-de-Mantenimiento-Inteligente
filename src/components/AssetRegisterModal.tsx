import React, { useState, useEffect } from 'react';
import { Asset, AssetType, AssetCategory, RiskLevel } from '../types';
import {
  Plus, X, Car, ShieldCheck, Cpu, Sliders, BatteryCharging, Zap, Boxes,
  Home, Edit2, Search, CheckCircle2, Droplets, PlugZap, Building2,
  Stethoscope, HardHat, LayoutGrid, Bike, AlertCircle, MapPin, User, FileText, Fuel, Fingerprint, Activity, ShieldAlert, Shield
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { SECURITY_PROTOCOLS } from '../utils/businessRules';

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
  const [criticality, setCriticality] = useState<Asset['criticalityLevel']>('medium');
  const [details, setDetails] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [mileage, setMileage] = useState<number>(0);
  const [usageHours, setUsageHours] = useState<number>(0);
  const [lastMaintenance, setLastMaintenance] = useState('');
  const [nextMaintenance, setNextMaintenance] = useState('');
  const [observations, setObservations] = useState('');
  const [location, setLocation] = useState('Sede Principal');
  const [driverName, setDriverName] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [fuelType, setFuelType] = useState<Asset['fuelType']>('diesel');

  // --- Mapeo de Tipos por Capa Operativa ---
  const categoryMapping: Record<AssetCategory, AssetType[]> = {
    'GENERAL': ['car', 'moto', 'house', 'ac', 'plumbing', 'electrical', 'computer'],
    'PH': ['ac', 'generator', 'solar_panels', 'plumbing', 'electrical', 'house'],
    'SALUD': ['ac', 'generator', 'electrical', 'plumbing', 'computer'],
    'CONSTRUCCION': ['industrial_equip', 'generator', 'car', 'electrical']
  };

  const allAssetTypes: { id: AssetType, label: string, icon: any }[] = [
    { id: 'car', label: 'Vehículo', icon: Car },
    { id: 'ac', label: 'Aire Acond.', icon: Sliders },
    { id: 'generator', label: 'Planta Eléc.', icon: Zap },
    { id: 'computer', label: 'Cómputo/IT', icon: Cpu },
    { id: 'industrial_equip', label: 'Maquinaria', icon: Boxes },
    { id: 'solar_panels', label: 'Sist. Solar', icon: BatteryCharging },
    { id: 'house', label: 'Inmueble', icon: Home },
    { id: 'plumbing', label: 'Fontanería', icon: Droplets },
    { id: 'electrical', label: 'Electricidad', icon: PlugZap },
    { id: 'moto', label: 'Moto', icon: Bike }
  ];

  const filteredTypes = allAssetTypes.filter(at => categoryMapping[category].includes(at.id));

  useEffect(() => {
    if (assetToEdit) {
      setName(assetToEdit.name);
      setType(assetToEdit.type);
      setCategory(assetToEdit.category || 'GENERAL');
      setRiskLevel(assetToEdit.riskLevel || 'low');
      setCriticality(assetToEdit.criticalityLevel || 'medium');
      setDetails(assetToEdit.details);
      setLicensePlate(assetToEdit.licensePlate || '');
      setMileage(assetToEdit.mileage || 0);
      setUsageHours(assetToEdit.usageHours || 0);
      setLastMaintenance(assetToEdit.lastMaintenanceDate);
      setNextMaintenance(assetToEdit.nextMaintenanceDate);
      setObservations(assetToEdit.observations || '');
      setLocation(assetToEdit.location || 'Sede Principal');
      setDriverName(assetToEdit.driverName || '');
      setSerialNumber(assetToEdit.serialNumber || '');
      setFuelType(assetToEdit.fuelType || 'diesel');
    } else {
      setName('');
      // Seleccionar el primer tipo válido de la categoría al cambiarla
      const firstValidType = categoryMapping[category][0];
      setType(firstValidType);
      setDetails('');
      setLicensePlate('');
      setMileage(0);
      setUsageHours(0);
      setLastMaintenance('');
      setNextMaintenance('');
      setObservations('');
      setSerialNumber('');
    }
  }, [assetToEdit, isOpen, category]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetToEdit && currentAssetsCount >= maxAssets) {
      toast.error(`Plan agotado (${maxAssets}). Mejore su membresía.`);
      return;
    }
    if (!name.trim() || !lastMaintenance || !nextMaintenance || !details.trim()) {
      toast.error("Faltan campos críticos (*)");
      return;
    }

    onAdd({
      name, type, category, riskLevel, criticalityLevel: criticality, details,
      licensePlate: (type === 'car' || type === 'moto') ? licensePlate : undefined,
      mileage: (type === 'car' || type === 'moto') ? Number(mileage) : undefined,
      usageHours: (type === 'generator' || type === 'industrial_equip') ? Number(usageHours) : undefined,
      lastMaintenanceDate: lastMaintenance,
      nextMaintenanceDate: nextMaintenance,
      observations, location, serialNumber,
      driverName: (type === 'car' || type === 'moto') ? driverName : undefined,
      fuelType: (type === 'car' || type === 'moto') ? fuelType : undefined
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#0d0e12]/95 backdrop-blur-2xl overflow-y-auto">
      <div className="w-full max-w-3xl bg-[#121317] rounded-[3.5rem] border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.8)] animate-fade-in-up my-auto">
        <header className="px-12 py-10 border-b border-white/5 flex justify-between items-center bg-gradient-to-br from-white/[0.04] to-transparent">
          <div className="flex items-center gap-5">
             <div className="w-14 h-14 rounded-[1.5rem] bg-[#5d3cfe] text-white flex items-center justify-center shadow-[0_0_30px_rgba(93,60,254,0.4)]">
               {assetToEdit ? <Edit2 className="w-7 h-7" /> : <Plus className="w-7 h-7" />}
             </div>
             <div>
                <h2 className="text-3xl font-black text-white uppercase tracking-tighter leading-none">
                  {assetToEdit ? 'Protocolo de Edición' : 'Vincular Activo'}
                </h2>
                <p className="text-[10px] font-black text-[#5d3cfe] uppercase tracking-[0.4em] mt-2">Ingeniería Preventiva V4.0</p>
             </div>
          </div>
          <button onClick={onClose} className="p-4 bg-white/5 hover:bg-rose-600/20 hover:text-rose-500 text-white/20 rounded-3xl transition-all active:scale-90"><X className="w-8 h-8" /></button>
        </header>

        <form onSubmit={handleSubmit} className="p-12 space-y-12 max-h-[65vh] overflow-y-auto custom-scrollbar">

          {/* NIVEL 1: CAPA OPERATIVA */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
               <div className="w-1.5 h-6 bg-[#5d3cfe] rounded-full"></div>
               <label className="text-[11px] font-black text-white uppercase tracking-[0.3em]">1. Capa Operativa</label>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {(['GENERAL', 'PH', 'SALUD', 'CONSTRUCCION'] as AssetCategory[]).map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`flex flex-col items-center gap-3 p-5 rounded-[2rem] border-2 transition-all ${category === cat ? 'bg-[#5d3cfe] border-[#5d3cfe] text-white shadow-2xl' : 'bg-[#0d0e12] border-white/5 text-white/40 hover:border-white/20'}`}
                >
                  {cat === 'GENERAL' && <LayoutGrid className="w-6 h-6" />}
                  {cat === 'PH' && <Building2 className="w-6 h-6" />}
                  {cat === 'SALUD' && <Stethoscope className="w-6 h-6" />}
                  {cat === 'CONSTRUCCION' && <HardHat className="w-6 h-6" />}
                  <span className="text-[10px] font-black uppercase">{cat}</span>
                </button>
              ))}
            </div>
          </div>

          {/* NIVEL 2: NATURALEZA (FILTRADA) */}
          <div className="space-y-6 animate-fade-in">
             <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 bg-[#52ffac] rounded-full"></div>
                <label className="text-[11px] font-black text-white uppercase tracking-[0.3em]">2. Naturaleza del Equipo</label>
             </div>
             <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
               {filteredTypes.map(at => (
                 <button
                   key={at.id}
                   type="button"
                   onClick={() => setType(at.id)}
                   className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${type === at.id ? 'bg-[#52ffac] border-[#52ffac] text-black shadow-xl scale-105' : 'bg-white/5 border-white/5 text-[#c8c4d9] hover:bg-white/10'}`}
                 >
                   <at.icon className="w-5 h-5" />
                   <span className="text-[8px] font-black uppercase text-center leading-tight">{at.label}</span>
                 </button>
               ))}
             </div>
          </div>

          {/* NIVEL 3: CRITICIDAD Y RIESGO */}
          <div className="space-y-6">
             <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 bg-amber-500 rounded-full"></div>
                <label className="text-[11px] font-black text-white uppercase tracking-[0.3em]">3. Niveles de Seguridad</label>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                   <label className="text-[9px] font-black text-[#474556] uppercase ml-1 flex items-center gap-2"><ShieldAlert className="w-3 h-3" /> Nivel de Riesgo</label>
                   <div className="flex bg-[#0d0e12] p-1.5 rounded-2xl border border-white/5">
                      {(['low', 'medium', 'high'] as RiskLevel[]).map(r => (
                        <button key={r} type="button" onClick={() => setRiskLevel(r)} className={`flex-1 py-3 text-[9px] font-black uppercase rounded-xl transition-all ${riskLevel === r ? 'bg-amber-500 text-black shadow-lg' : 'text-[#474556]'}`}>{r === 'low' ? 'Bajo' : r === 'medium' ? 'Medio' : 'Crítico'}</button>
                      ))}
                   </div>
                   {/* Info de Protocolo de Seguridad */}
                   <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-2 mt-2 animate-fade-in">
                      <div className="flex items-center gap-2">
                         <Shield className="w-3 h-3 text-amber-500" />
                         <span className="text-[8px] font-black text-white uppercase tracking-widest">Protocolo: {SECURITY_PROTOCOLS[riskLevel].levelName}</span>
                      </div>
                      <p className="text-[7px] text-[#c8c4d9] font-medium leading-relaxed">
                         {SECURITY_PROTOCOLS[riskLevel].description}
                         {SECURITY_PROTOCOLS[riskLevel].insuranceRequired && " REQUIERE SEGURO DE RESPONSABILIDAD CIVIL."}
                      </p>
                   </div>
                </div>
                <div className="space-y-3">
                   <label className="text-[9px] font-black text-[#474556] uppercase ml-1 flex items-center gap-2"><Activity className="w-3 h-3" /> Importancia Operativa</label>
                   <div className="flex bg-[#0d0e12] p-1.5 rounded-2xl border border-white/5">
                      {(['low', 'medium', 'high', 'critical'] as const).map(c => (
                        <button key={c} type="button" onClick={() => setCriticality(c)} className={`flex-1 py-3 text-[8px] font-black uppercase rounded-xl transition-all ${criticality === c ? 'bg-[#5d3cfe] text-white shadow-lg' : 'text-[#474556]'}`}>{c === 'low' ? 'Standard' : c === 'medium' ? 'Vital' : c === 'high' ? 'Crítico' : 'SOS'}</button>
                      ))}
                   </div>
                </div>
             </div>
          </div>

          {/* NIVEL 4: IDENTIFICACIÓN TÉCNICA */}
          <div className="space-y-6 pt-6 border-t border-white/5">
            <div className="flex items-center gap-3">
               <div className="w-1.5 h-6 bg-[#c7bfff] rounded-full"></div>
               <label className="text-[11px] font-black text-white uppercase tracking-[0.3em]">4. Identificación Industrial</label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-[#474556] uppercase ml-2">Marca / Fabricante *</label>
                <div className="relative">
                  <Fingerprint className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#474556]" />
                  <input required type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Ej: Toyota / Carrier" className="w-full bg-[#0d0e12] border border-white/5 rounded-2xl py-4 pl-14 pr-4 text-sm font-bold text-white focus:border-[#5d3cfe] outline-none" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-[#474556] uppercase ml-2">Modelo / Serie *</label>
                <div className="relative">
                  <Sliders className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#474556]" />
                  <input required type="text" value={details} onChange={e => setDetails(e.target.value)} placeholder="Ej: Hilux 2024 / VRF-X" className="w-full bg-[#0d0e12] border border-white/5 rounded-2xl py-4 pl-14 pr-4 text-sm font-bold text-white focus:border-[#5d3cfe] outline-none" />
                </div>
              </div>
            </div>
          </div>

          {/* DATOS DINÁMICOS POR TIPO */}
          {(type === 'car' || type === 'moto') && (
            <div className="p-8 bg-[#52ffac]/5 border border-[#52ffac]/10 rounded-[2.5rem] space-y-6 animate-fade-in-up">
               <label className="text-[10px] font-black text-[#52ffac] uppercase tracking-[0.3em] ml-1">Telemetría Automotriz</label>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5"><label className="text-[9px] font-black text-[#474556] uppercase ml-1">Placa Oficial</label><input type="text" value={licensePlate} onChange={e => setLicensePlate(e.target.value)} className="w-full bg-[#0d0e12] border border-[#52ffac]/20 rounded-2xl py-4 px-6 text-sm font-black text-white focus:border-[#52ffac] outline-none" /></div>
                  <div className="space-y-1.5"><label className="text-[9px] font-black text-[#474556] uppercase ml-1">Odómetro (KM)</label><input type="number" value={mileage} onChange={e => setMileage(Number(e.target.value))} className="w-full bg-[#0d0e12] border border-[#52ffac]/20 rounded-2xl py-4 px-6 text-sm font-black text-white focus:border-[#52ffac] outline-none" /></div>
               </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
             <div className="space-y-2">
               <label className="text-[9px] font-black text-[#474556] uppercase ml-2">Última Revisión *</label>
               <input required type="date" value={lastMaintenance} onChange={e => setLastMaintenance(e.target.value)} className="w-full bg-[#0d0e12] border border-white/5 rounded-2xl py-4 px-6 text-sm font-black text-[#52ffac] outline-none [color-scheme:dark]" />
             </div>
             <div className="space-y-2">
               <label className="text-[9px] font-black text-[#474556] uppercase ml-2">Próxima Alerta *</label>
               <input required type="date" value={nextMaintenance} onChange={e => setNextMaintenance(e.target.value)} className="w-full bg-[#0d0e12] border border-white/5 rounded-2xl py-4 px-6 text-sm font-black text-[#5d3cfe] outline-none [color-scheme:dark]" />
             </div>
          </div>

          <button type="submit" className="w-full py-6 bg-[#5d3cfe] text-white rounded-[1.5rem] text-[11px] font-black uppercase tracking-[0.4em] shadow-[0_20px_40px_rgba(93,60,254,0.3)] hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-4">
             <Zap className="w-5 h-5 fill-white" />
             {assetToEdit ? 'Guardar Cambios' : 'Vincular Activo al Ecosistema'}
          </button>
        </form>
      </div>
    </div>
  );
}
