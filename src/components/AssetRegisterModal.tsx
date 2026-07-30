import React, { useState, useEffect, useMemo } from 'react';
import { Asset, AssetType, AssetCategory, RiskLevel } from '../types';
import {
  Plus, X, Car, ShieldCheck, Cpu, Sliders, BatteryCharging, Zap, Boxes,
  Home, Edit2, Search, CheckCircle2, Droplets, PlugZap, Building2,
  Stethoscope, HardHat, LayoutGrid, Bike, AlertCircle, MapPin, User, FileText, Fuel, Fingerprint, Activity, ShieldAlert, Shield, Thermometer, Database, Ruler, Waves, ZapOff, Calendar,
  Weight, Users, Flame, Eye, HardDrive, Waves as PoolIcon
} from 'lucide-react';
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
  const [criticality, setCriticality] = useState<Asset['criticalityLevel']>('medium');
  const [details, setDetails] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [mileage, setMileage] = useState<number>(0);
  const [usageHours, setUsageHours] = useState<number>(0);
  const [lastMaintenance, setLastMaintenance] = useState('');
  const [nextMaintenance, setNextMaintenance] = useState('');
  const [observations, setObservations] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [fuelType, setFuelType] = useState<Asset['fuelType']>('diesel');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [warrantyMonths, setWarrantyMonths] = useState<number>(0);
  const [latitude, setLatitude] = useState<string>('');
  const [longitude, setLongitude] = useState<string>('');
  const [locationDetails, setLocationDetails] = useState('');

  const [formErrors, setFormErrors] = useState<string[]>([]);

  // --- ESPECIFICACIONES TÉCNICAS DINÁMICAS ---
  const [specs, setSpecs] = useState<any>({});

  const updateSpec = (key: string, val: any) => {
    setSpecs(prev => ({ ...prev, [key]: val }));
  };

  // --- Mapeo de Tipos por Capa Operativa ---
  const categoryMapping: Record<AssetCategory, AssetType[]> = {
    'GENERAL': ['car', 'moto', 'house', 'ac', 'plumbing', 'electrical', 'computer', 'garden', 'pool', 'security_system'],
    'PH': ['ac', 'generator', 'solar_panels', 'plumbing', 'electrical', 'house', 'elevator', 'fire_system', 'pool', 'garden', 'security_system'],
    'SALUD': ['ac', 'generator', 'electrical', 'plumbing', 'computer', 'security_system'],
    'CONSTRUCCION': ['industrial_equip', 'generator', 'car', 'electrical', 'security_system']
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
    { id: 'moto', label: 'Moto', icon: Bike },
    { id: 'elevator', label: 'Ascensor', icon: Building2 },
    { id: 'fire_system', label: 'Sist. Incendio', icon: ShieldAlert },
    { id: 'pool', label: 'Piscina', icon: Waves },
    { id: 'garden', label: 'Jardín/Hierba', icon: LayoutGrid },
    { id: 'security_system', label: 'Cámaras/Seg.', icon: ShieldCheck }
  ];

  const filteredTypes = allAssetTypes.filter(at => categoryMapping[category].includes(at.id));

  // --- MOTOR DE RECOMENDACIÓN DINÁMICO ---
  const recommendation = useMemo(() => {
    let months = 12;
    let reason = "Mantenimiento Preventivo General";

    if (type === 'ac') { months = 4; reason = "Protocolo HVAC (Aires)"; }
    else if (['car', 'moto', 'generator', 'fire_system'].includes(type)) { months = 6; reason = "Mecánica y Sistemas Críticos"; }
    else if (type === 'garden') { months = 1; reason = "Poda y Control de Maleza"; }
    else if (['elevator', 'pool'].includes(type)) { months = 1; reason = "Mantenimiento de Alta Frecuencia"; }
    else if (type === 'house') { months = 12; reason = "Inspección de Ingeniería Civil Anual"; }

    return { months, reason };
  }, [type]);

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
      setSerialNumber(assetToEdit.serialNumber || '');
      setFuelType(assetToEdit.fuelType || 'diesel');
      setPurchaseDate(assetToEdit.purchaseDate || '');
      setWarrantyMonths(assetToEdit.warrantyMonths || 0);
      setLatitude(assetToEdit.latitude?.toString() || '');
      setLongitude(assetToEdit.longitude?.toString() || '');
      setLocationDetails(assetToEdit.locationDetails || '');
      setSpecs(assetToEdit.specs || {});
    } else {
      setName('');
      setLatitude('');
      setLongitude('');
      setLocationDetails('');
      setLastMaintenance('');
      setNextMaintenance('');
      setFormErrors([]);
      setSpecs({});
    }
  }, [assetToEdit, isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => document.body.classList.remove('modal-open');
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: string[] = [];
    if (!name.trim()) errors.push('name');
    if (!lastMaintenance) errors.push('lastMaintenance');
    if (!nextMaintenance) errors.push('nextMaintenance');
    if (type !== 'house' && !serialNumber.trim()) errors.push('serialNumber');

    if (errors.length > 0) {
      setFormErrors(errors);
      toast.error("Complete los campos marcados en rojo.");
      return;
    }

    if (!assetToEdit && currentAssetsCount >= maxAssets) {
      toast.error(`Plan agotado (${maxAssets}). Mejore su membresía.`);
      return;
    }

    onAdd({
      name, type, category, riskLevel, criticalityLevel: criticality, details,
      licensePlate: (type === 'car' || type === 'moto') ? (licensePlate || null) : undefined,
      mileage: (type === 'car' || type === 'moto') ? Number(mileage) : undefined,
      usageHours: (type === 'generator' || type === 'industrial_equip') ? Number(usageHours) : undefined,
      lastMaintenanceDate: lastMaintenance,
      nextMaintenanceDate: nextMaintenance,
      observations: observations || null,
      serialNumber: serialNumber || null,
      fuelType: (type === 'car' || type === 'moto') ? (fuelType || null) : undefined,
      purchaseDate: purchaseDate || null,
      warrantyMonths: warrantyMonths > 0 ? Number(warrantyMonths) : undefined,
      latitude: latitude ? Number(latitude) : undefined,
      longitude: longitude ? Number(longitude) : undefined,
      locationDetails: locationDetails || undefined,
      specs: Object.keys(specs).length > 0 ? specs : undefined
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#0d0e12]/95 backdrop-blur-2xl overflow-hidden">
      <div className="w-full max-w-3xl bg-[#121317] rounded-[3.5rem] border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.8)] animate-fade-in-up">
        <header className="px-12 py-8 border-b border-white/5 flex justify-between items-center bg-gradient-to-br from-white/[0.04] to-transparent shrink-0">
          <div className="flex items-center gap-5">
             <div className="w-12 h-12 rounded-[1.2rem] bg-[#5d3cfe] text-white flex items-center justify-center shadow-[0_0_30px_rgba(93,60,254,0.4)]">
               {assetToEdit ? <Edit2 className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
             </div>
             <div>
                <h2 className="text-2xl font-black text-white uppercase tracking-tighter leading-none">
                  {assetToEdit ? 'Editar Activo' : 'Vincular Activo'}
                </h2>
                <p className="text-[9px] font-black text-[#5d3cfe] uppercase tracking-[0.4em] mt-1.5">Ingeniería Preventiva V4.0</p>
             </div>
          </div>
          <button onClick={onClose} className="p-3 bg-white/5 hover:bg-rose-600/20 hover:text-rose-500 text-white/20 rounded-2xl transition-all active:scale-90"><X className="w-6 h-6" /></button>
        </header>

        <form onSubmit={handleSubmit} className="p-10 space-y-10 max-h-[75vh] overflow-y-auto custom-scrollbar">

          {/* 1. CAPA OPERATIVA */}
          <div className="space-y-4">
            <label className="text-[10px] font-black text-[#474556] uppercase tracking-[0.3em] ml-1">1. Capa Operativa</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {(['GENERAL', 'PH', 'SALUD', 'CONSTRUCCION'] as AssetCategory[]).map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${category === cat ? 'bg-[#5d3cfe] border-[#5d3cfe] text-white shadow-lg' : 'bg-[#0d0e12] border-white/5 text-white/40 hover:border-white/20'}`}
                >
                  {cat === 'GENERAL' && <LayoutGrid className="w-5 h-5" />}
                  {cat === 'PH' && <Building2 className="w-5 h-5" />}
                  {cat === 'SALUD' && <Stethoscope className="w-5 h-5" />}
                  {cat === 'CONSTRUCCION' && <HardHat className="w-5 h-5" />}
                  <span className="text-[9px] font-black uppercase">{cat}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 2. NATURALEZA */}
          <div className="space-y-4">
             <label className="text-[10px] font-black text-[#474556] uppercase tracking-[0.3em] ml-1">2. Naturaleza del Equipo</label>
             <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
               {filteredTypes.map(at => (
                 <button
                   key={at.id}
                   type="button"
                   onClick={() => setType(at.id)}
                   className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${type === at.id ? 'bg-[#52ffac] border-[#52ffac] text-black shadow-md' : 'bg-white/5 border-white/5 text-[#c8c4d9] hover:bg-white/10'}`}
                 >
                   <at.icon className="w-4 h-4" />
                   <span className="text-[8px] font-black uppercase text-center leading-tight">{at.label}</span>
                 </button>
               ))}
             </div>
          </div>

          {/* 3. DATOS DEL ACTIVO */}
          <div className="space-y-6 pt-6 border-t border-white/5">
            <label className="text-[10px] font-black text-[#474556] uppercase tracking-[0.3em] ml-1">3. Datos de Identificación</label>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <label className={`text-[9px] font-black uppercase ml-2 ${formErrors.includes('name') ? 'text-rose-500' : 'text-[#474556]'}`}>Alias Personalizado *</label>
                <div className="relative">
                  <Fingerprint className={`absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 ${formErrors.includes('name') ? 'text-rose-500' : 'text-[#52ffac]'}`} />
                  <input required type="text" value={name} onChange={e => { setName(e.target.value); setFormErrors(prev => prev.filter(err => err !== 'name')); }} placeholder="Ej: Camión 01, A/C Sala, Generador PH" className={`w-full bg-[#0d0e12] border rounded-2xl py-4 pl-14 pr-4 text-sm font-bold text-white outline-none transition-all ${formErrors.includes('name') ? 'border-rose-500 shadow-[0_0_15px_rgba(225,29,72,0.1)]' : 'border-white/5 focus:border-[#5d3cfe]'}`} />
                </div>
              </div>
            </div>

            {type !== 'house' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                <div className="space-y-2">
                  <label className={`text-[9px] font-black uppercase ml-2 ${formErrors.includes('serialNumber') ? 'text-rose-500' : 'text-[#474556]'}`}>Marca / Fabricante *</label>
                  <input required type="text" value={serialNumber} onChange={e => { setSerialNumber(e.target.value); setFormErrors(prev => prev.filter(err => err !== 'serialNumber')); }} placeholder="Ej: Toyota, Samsung, Otis" className={`w-full bg-[#0d0e12] border rounded-2xl py-4 px-6 text-sm font-bold text-white outline-none transition-all ${formErrors.includes('serialNumber') ? 'border-rose-500' : 'border-white/5 focus:border-[#5d3cfe]'}`} />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-[#474556] uppercase ml-2">Modelo o Serie</label>
                  <input type="text" value={details} onChange={e => setDetails(e.target.value)} placeholder="Ej: Hilux 2024, VRF-V4" className="w-full bg-[#0d0e12] border border-white/5 rounded-2xl py-4 px-6 text-sm font-bold text-white outline-none focus:border-[#5d3cfe]" />
                </div>
              </div>
            )}

            {/* UBICACIÓN GEOGRÁFICA */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 bg-[#5d3cfe]/5 rounded-3xl border border-[#5d3cfe]/10 animate-fade-in">
               <div className="md:col-span-2 flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-[#5d3cfe]" />
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">Sede y Georreferenciación</span>
               </div>
               <div className="space-y-1.5">
                  <label className="text-[8px] font-black text-[#474556] uppercase ml-1">Latitud GPS</label>
                  <input type="number" step="any" value={latitude} onChange={e => setLatitude(e.target.value)} placeholder="9.0123" className="w-full bg-[#0d0e12] border border-white/5 rounded-xl py-3 px-4 text-xs font-bold text-white outline-none focus:border-[#5d3cfe]" />
               </div>
               <div className="space-y-1.5">
                  <label className="text-[8px] font-black text-[#474556] uppercase ml-1">Longitud GPS</label>
                  <input type="number" step="any" value={longitude} onChange={e => setLongitude(e.target.value)} placeholder="-79.4567" className="w-full bg-[#0d0e12] border border-white/5 rounded-xl py-3 px-4 text-xs font-bold text-white outline-none focus:border-[#5d3cfe]" />
               </div>
               <div className="md:col-span-2 space-y-1.5">
                  <label className="text-[8px] font-black text-[#474556] uppercase ml-1">Referencia Interna (Sede/Piso)</label>
                  <input type="text" value={locationDetails} onChange={e => setLocationDetails(e.target.value)} placeholder="Ej: Sede Clayton, Piso 4, Lote A" className="w-full bg-[#0d0e12] border border-white/5 rounded-xl py-3 px-4 text-xs font-bold text-white outline-none focus:border-[#5d3cfe]" />
               </div>
               <button
                type="button"
                onClick={() => {
                  navigator.geolocation.getCurrentPosition((pos) => {
                    setLatitude(pos.coords.latitude.toString());
                    setLongitude(pos.coords.longitude.toString());
                    toast.success("Ubicación capturada con éxito.");
                  }, () => toast.error("Error al obtener ubicación. Verifique permisos."));
                }}
                className="md:col-span-2 py-2 bg-white/5 border border-white/10 rounded-xl text-[8px] font-black text-[#5d3cfe] uppercase hover:bg-white/10 transition-all"
               >
                 Usar mi ubicación actual
               </button>
            </div>
          </div>

          {/* 4. ESPECIFICACIONES DINÁMICAS (ADAPTADAS AL ACTIVO) */}
          <div className="space-y-6 pt-6 border-t border-white/5">
             <label className="text-[10px] font-black text-[#474556] uppercase tracking-[0.3em] ml-1">4. Especificaciones de Ingeniería</label>

             {/* VEHÍCULO / MOTO */}
             {(type === 'car' || type === 'moto') && (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 bg-white/[0.02] rounded-3xl border border-white/5 animate-fade-in">
                  <div className="space-y-1.5"><label className="text-[8px] font-black text-[#52ffac] uppercase ml-1">Placa Oficial</label><input type="text" value={licensePlate} onChange={e => setLicensePlate(e.target.value)} className="w-full bg-[#0d0e12] border border-white/5 rounded-xl py-3 px-4 text-xs font-black text-white uppercase outline-none focus:border-[#52ffac]" /></div>
                  <div className="space-y-1.5"><label className="text-[8px] font-black text-[#52ffac] uppercase ml-1">Odómetro (KM)</label><input type="number" step="any" value={mileage || ''} onChange={e => setMileage(Number(e.target.value))} className="w-full bg-[#0d0e12] border border-white/5 rounded-xl py-3 px-4 text-xs font-black text-white outline-none focus:border-[#52ffac]" placeholder="0" /></div>
                  <div className="space-y-1.5 md:col-span-2"><label className="text-[8px] font-black text-[#474556] uppercase ml-1">Combustible</label><select value={fuelType} onChange={e => setFuelType(e.target.value as any)} className="w-full bg-[#0d0e12] border border-white/5 rounded-xl py-3 px-4 text-[10px] font-bold text-white outline-none focus:border-[#52ffac]"><option value="diesel">DIESEL</option><option value="gas91">GASOLINERA 91</option><option value="gas95">GASOLINERA 95</option></select></div>
               </div>
             )}

             {/* AIRE ACONDICIONADO */}
             {type === 'ac' && (
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5 bg-white/[0.02] rounded-3xl border border-white/5 animate-fade-in">
                  <div className="space-y-1.5"><label className="text-[8px] font-black text-[#c7bfff] uppercase ml-1 flex items-center gap-1"><Thermometer className="w-3 h-3" /> Capacidad (BTU)</label><input type="text" value={specs.btu || ''} onChange={e => updateSpec('btu', e.target.value)} placeholder="18k, 24k..." className="w-full bg-[#0d0e12] border border-white/5 rounded-xl py-3 px-4 text-xs font-bold text-white outline-none focus:border-[#5d3cfe]" /></div>
                  <div className="space-y-1.5"><label className="text-[8px] font-black text-[#474556] uppercase ml-1">Tipo Gas</label><select value={specs.refrigerant || 'R410A'} onChange={e => updateSpec('refrigerant', e.target.value)} className="w-full bg-[#0d0e12] border border-white/5 rounded-xl py-3 px-4 text-[10px] font-bold text-white outline-none"><option>R410A</option><option>R22</option><option>R32</option></select></div>
                  <div className="space-y-1.5"><label className="text-[8px] font-black text-[#474556] uppercase ml-1">Tecnología</label><select value={specs.acType || 'split'} onChange={e => updateSpec('acType', e.target.value)} className="w-full bg-[#0d0e12] border border-white/5 rounded-xl py-3 px-4 text-[10px] font-bold text-white outline-none"><option value="split">Split / Inverter</option><option value="central">Central / Ducto</option></select></div>
               </div>
             )}

             {/* ASCENSOR */}
             {type === 'elevator' && (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 bg-white/[0.02] rounded-3xl border border-white/5 animate-fade-in">
                  <div className="space-y-1.5"><label className="text-[8px] font-black text-[#5d3cfe] uppercase ml-1 flex items-center gap-1"><Users className="w-3 h-3" /> Capacidad (Pers.)</label><input type="number" value={specs.capacity || ''} onChange={e => updateSpec('capacity', e.target.value)} placeholder="Ej: 8" className="w-full bg-[#0d0e12] border border-white/5 rounded-xl py-3 px-4 text-xs font-bold text-white outline-none focus:border-[#5d3cfe]" /></div>
                  <div className="space-y-1.5"><label className="text-[8px] font-black text-[#474556] uppercase ml-1 flex items-center gap-1"><Layers className="w-3 h-3" /> Pisos Servidos</label><input type="number" value={specs.floorsServiced || ''} onChange={e => updateSpec('floorsServiced', e.target.value)} placeholder="Ej: 20" className="w-full bg-[#0d0e12] border border-white/5 rounded-xl py-3 px-4 text-xs font-bold text-white outline-none focus:border-[#5d3cfe]" /></div>
               </div>
             )}

             {/* SISTEMA CONTRA INCENDIO */}
             {type === 'fire_system' && (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 bg-white/[0.02] rounded-3xl border border-white/5 animate-fade-in">
                  <div className="space-y-1.5"><label className="text-[8px] font-black text-rose-500 uppercase ml-1 flex items-center gap-1"><Flame className="w-3 h-3" /> Extintores</label><input type="number" value={specs.extinguishers || ''} onChange={e => updateSpec('extinguishers', e.target.value)} placeholder="Cant. total" className="w-full bg-[#0d0e12] border border-white/5 rounded-xl py-3 px-4 text-xs font-bold text-white outline-none focus:border-[#5d3cfe]" /></div>
                  <div className="space-y-1.5"><label className="text-[8px] font-black text-[#474556] uppercase ml-1 flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Panel Central</label><input type="text" value={specs.panelBrand || ''} onChange={e => updateSpec('panelBrand', e.target.value)} placeholder="Marca del panel" className="w-full bg-[#0d0e12] border border-white/5 rounded-xl py-3 px-4 text-xs font-bold text-white outline-none focus:border-[#5d3cfe]" /></div>
               </div>
             )}

             {/* SEGURIDAD / CÁMARAS */}
             {type === 'security_system' && (
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5 bg-white/[0.02] rounded-3xl border border-white/5 animate-fade-in">
                  <div className="space-y-1.5"><label className="text-[8px] font-black text-[#52ffac] uppercase ml-1 flex items-center gap-1"><Eye className="w-3 h-3" /> Cámaras</label><input type="number" value={specs.cameraCount || ''} onChange={e => updateSpec('cameraCount', e.target.value)} className="w-full bg-[#0d0e12] border border-white/5 rounded-xl py-3 px-4 text-xs font-bold text-white outline-none" /></div>
                  <div className="space-y-1.5"><label className="text-[8px] font-black text-[#474556] uppercase ml-1 flex items-center gap-1"><HardDrive className="w-3 h-3" /> Almacenamiento</label><select value={specs.storage || '15 días'} onChange={e => updateSpec('storage', e.target.value)} className="w-full bg-[#0d0e12] border border-white/5 rounded-xl py-3 px-4 text-[10px] font-bold text-white outline-none"><option>7 días</option><option>15 días</option><option>30 días</option></select></div>
                  <div className="space-y-1.5"><label className="text-[8px] font-black text-[#474556] uppercase ml-1">Monitoreo</label><select value={specs.monitoring || 'no'} onChange={e => updateSpec('monitoring', e.target.value)} className="w-full bg-[#0d0e12] border border-white/5 rounded-xl py-3 px-4 text-[10px] font-bold text-white outline-none"><option value="yes">Activo 24/7</option><option value="no">Solo Local</option></select></div>
               </div>
             )}

             {/* PISCINA */}
             {type === 'pool' && (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 bg-white/[0.02] rounded-3xl border border-white/5 animate-fade-in">
                  <div className="space-y-1.5"><label className="text-[8px] font-black text-blue-400 uppercase ml-1 flex items-center gap-1"><PoolIcon className="w-3 h-3" /> Volumen (Gal)</label><input type="text" value={specs.volume || ''} onChange={e => updateSpec('volume', e.target.value)} placeholder="Ej: 15,000" className="w-full bg-[#0d0e12] border border-white/5 rounded-xl py-3 px-4 text-xs font-bold text-white outline-none" /></div>
                  <div className="space-y-1.5"><label className="text-[8px] font-black text-[#474556] uppercase ml-1">Motor Bomba (HP)</label><input type="text" value={specs.pumpHp || ''} onChange={e => updateSpec('pumpHp', e.target.value)} placeholder="Ej: 1.5 HP" className="w-full bg-[#0d0e12] border border-white/5 rounded-xl py-3 px-4 text-xs font-bold text-white outline-none" /></div>
               </div>
             )}

             {/* JARDINERÍA */}
             {type === 'garden' && (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 bg-white/[0.02] rounded-3xl border border-white/5 animate-fade-in">
                  <div className="space-y-1.5"><label className="text-[8px] font-black text-[#52ffac] uppercase ml-1 flex items-center gap-1"><Ruler className="w-3 h-3" /> Área (m²)</label><input type="text" value={specs.sqMeters || ''} onChange={e => updateSpec('sqMeters', e.target.value)} placeholder="Ej: 50" className="w-full bg-[#0d0e12] border border-white/5 rounded-xl py-3 px-4 text-xs font-bold text-white outline-none" /></div>
                  <div className="flex items-center p-3 bg-white/5 rounded-2xl border border-white/5">
                     <p className="text-[7px] text-[#c8c4d9] font-black uppercase leading-tight italic">Recomendación de poda mensual activa.</p>
                  </div>
               </div>
             )}

             {/* MAQUINARIA INDUSTRIAL */}
             {type === 'industrial_equip' && (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 bg-white/[0.02] rounded-3xl border border-white/5 animate-fade-in">
                  <div className="space-y-1.5"><label className="text-[8px] font-black text-amber-500 uppercase ml-1 flex items-center gap-1"><Zap className="w-3 h-3" /> Potencia (HP/kW)</label><input type="text" value={specs.power || ''} onChange={e => updateSpec('power', e.target.value)} placeholder="Ej: 10 HP" className="w-full bg-[#0d0e12] border border-white/5 rounded-xl py-3 px-4 text-xs font-bold text-white outline-none" /></div>
                  <div className="space-y-1.5"><label className="text-[8px] font-black text-[#474556] uppercase ml-1 flex items-center gap-1"><Weight className="w-3 h-3" /> Peso (Ton)</label><input type="text" value={specs.weight || ''} onChange={e => updateSpec('weight', e.target.value)} placeholder="Ej: 2.5" className="w-full bg-[#0d0e12] border border-white/5 rounded-xl py-3 px-4 text-xs font-bold text-white outline-none" /></div>
               </div>
             )}

             {/* ELECTRICIDAD / GENERADOR */}
             {(type === 'electrical' || type === 'generator') && (
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5 bg-white/[0.02] rounded-3xl border border-white/5 animate-fade-in">
                  <div className="space-y-1.5"><label className="text-[8px] font-black text-[#5d3cfe] uppercase ml-1 flex items-center gap-1"><ZapOff className="w-3 h-3" /> Voltaje</label><select value={specs.voltage || '110V'} onChange={e => updateSpec('voltage', e.target.value)} className="w-full bg-[#0d0e12] border border-white/5 rounded-xl py-3 px-4 text-[10px] font-bold text-white outline-none"><option>110V-120V</option><option>220V-240V</option><option>440V-480V</option></select></div>
                  <div className="space-y-1.5"><label className="text-[8px] font-black text-[#474556] uppercase ml-1">Amperaje</label><input type="text" value={specs.amps || ''} onChange={e => updateSpec('amps', e.target.value)} placeholder="Ej: 100A" className="w-full bg-[#0d0e12] border border-white/5 rounded-xl py-3 px-4 text-xs font-bold text-white outline-none" /></div>
                  <div className="space-y-1.5"><label className="text-[8px] font-black text-[#474556] uppercase ml-1">Fases</label><select value={specs.phases || 'Monofásico'} onChange={e => updateSpec('phases', e.target.value)} className="w-full bg-[#0d0e12] border border-white/5 rounded-xl py-3 px-4 text-[10px] font-bold text-white outline-none"><option>Monofásico</option><option>Bifásico</option><option>Trifásico</option></select></div>
               </div>
             )}
          </div>

          {/* 5. CRONOGRAMA */}
          <div className="space-y-6 pt-6 border-t border-white/5">
             <label className="text-[10px] font-black text-[#474556] uppercase tracking-[0.3em] ml-1">5. Cronograma de Salud</label>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                   <label className={`text-[9px] font-black uppercase ml-2 flex items-center gap-2 ${formErrors.includes('lastMaintenance') ? 'text-rose-500' : 'text-[#474556]'}`}><CheckCircle2 className="w-3.5 h-3.5" /> Último Mantenimiento *</label>
                   <input
                     required
                     type="date"
                     value={lastMaintenance}
                     onChange={e => {
                        const val = e.target.value;
                        setLastMaintenance(val);
                        setFormErrors(prev => prev.filter(err => err !== 'lastMaintenance'));
                        if (val) {
                          const date = new Date(val);
                          date.setMonth(date.getMonth() + recommendation.months);
                          setNextMaintenance(date.toISOString().split('T')[0]);
                        }
                     }}
                     className={`w-full bg-[#0d0e12] border rounded-2xl py-4 px-6 text-sm font-black text-[#52ffac] outline-none [color-scheme:dark] ${formErrors.includes('lastMaintenance') ? 'border-rose-500' : 'border-white/5 focus:border-[#5d3cfe]'}`}
                   />
                </div>
                <div className="space-y-2">
                   <label className={`text-[9px] font-black uppercase ml-2 flex items-center gap-2 ${formErrors.includes('nextMaintenance') ? 'text-rose-500' : 'text-[#474556]'}`}><ShieldAlert className="w-3.5 h-3.5" /> Próxima Alerta *</label>
                   <input required type="date" value={nextMaintenance} onChange={e => { setNextMaintenance(e.target.value); setFormErrors(prev => prev.filter(err => err !== 'nextMaintenance')); }} className={`w-full bg-[#0d0e12] border rounded-2xl py-4 px-6 text-sm font-black text-[#5d3cfe] outline-none [color-scheme:dark] ${formErrors.includes('nextMaintenance') ? 'border-rose-500' : 'border-white/5 focus:border-[#5d3cfe]'}`} />
                </div>
             </div>

             {lastMaintenance && (
               <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center gap-4 animate-fade-in">
                  <Calendar className="w-5 h-5 text-amber-500" />
                  <div>
                     <p className="text-[8px] font-black text-amber-500 uppercase tracking-widest">Recomendación Sugerida</p>
                     <p className="text-[10px] font-bold text-white/80">+{recommendation.months} meses para {recommendation.reason}.</p>
                  </div>
               </div>
             )}
          </div>

          <button type="submit" className="w-full py-5 bg-[#5d3cfe] text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.4em] shadow-xl hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-3">
             <Zap className="w-4 h-4 fill-white" />
             {assetToEdit ? 'Guardar Cambios' : 'Registrar en Sistema'}
          </button>
        </form>
      </div>
    </div>
  );
}
