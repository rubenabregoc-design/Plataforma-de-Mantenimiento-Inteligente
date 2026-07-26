import React, { useState, useEffect } from 'react';
import { Asset, AssetType, AssetCategory, RiskLevel } from '../types';
import {
  Plus, X, Car, ShieldCheck, Cpu, Sliders, BatteryCharging, Zap, Boxes,
  Home, Edit2, Search, CheckCircle2, Droplets, PlugZap, Building2,
  Stethoscope, HardHat, LayoutGrid, Bike, AlertCircle, MapPin, User, FileText, Fuel, Fingerprint, Activity, ShieldAlert, Shield, Thermometer, Database, Ruler, Waves, ZapOff
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

  // Specific Specs States
  const [btu, setBtu] = useState('');
  const [refrigerant, setRefrigerant] = useState('R410A');
  const [acType, setAcType] = useState<'split' | 'central' | 'vrf'>('split');
  const [processor, setProcessor] = useState('');
  const [ram, setRam] = useState('');
  const [os, setOs] = useState('Windows 11');
  const [sqMeters, setSqMeters] = useState('');
  const [floors, setFloors] = useState('1');
  const [pipeMaterial, setPipeMaterial] = useState('PVC');
  const [voltage, setVoltage] = useState('110V');
  const [amps, setAmps] = useState('');
  const [phases, setPhases] = useState('Monofásico');
  const [panelCount, setPanelCount] = useState('');
  const [inverterCapacity, setInverterCapacity] = useState('');

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

      if (assetToEdit.specs) {
        setBtu(assetToEdit.specs.btu || '');
        setRefrigerant(assetToEdit.specs.refrigerant || 'R410A');
        setAcType(assetToEdit.specs.acType || 'split');
        setProcessor(assetToEdit.specs.processor || '');
        setRam(assetToEdit.specs.ram || '');
        setOs(assetToEdit.specs.os || 'Windows 11');
        setSqMeters(assetToEdit.specs.sqMeters || '');
        setFloors(assetToEdit.specs.floors || '1');
        setPipeMaterial(assetToEdit.specs.pipeMaterial || 'PVC');
        setVoltage(assetToEdit.specs.voltage || '110V');
        setAmps(assetToEdit.specs.amps || '');
        setPhases(assetToEdit.specs.phases || 'Monofásico');
        setPanelCount(assetToEdit.specs.panelCount || '');
        setInverterCapacity(assetToEdit.specs.inverterCapacity || '');
      }
    } else {
      setName('');
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
      fuelType: (type === 'car' || type === 'moto') ? fuelType : undefined,
      specs: {
        btu, refrigerant, acType, processor, ram, os, sqMeters, floors, pipeMaterial, voltage, amps, phases, panelCount, inverterCapacity
      }
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
                  {assetToEdit ? 'Editar Activo' : 'Vincular Activo'}
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

          {/* NIVEL 4: FORMULARIO DINÁMICO POR NATURALEZA */}
          <div className="space-y-8 pt-8 border-t border-white/5">
            <div className="flex items-center gap-3">
               <div className="w-1.5 h-6 bg-[#c7bfff] rounded-full"></div>
               <label className="text-[11px] font-black text-white uppercase tracking-[0.3em]">4. Ficha Técnica Especializada</label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

            {/* CAMPOS DINÁMICOS */}
            <div className="animate-fade-in-up">
               {/* VEHICULO / MOTO */}
               {(type === 'car' || type === 'moto') && (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-6 bg-white/[0.02] rounded-3xl border border-white/5">
                    <div className="space-y-1.5"><label className="text-[9px] font-black text-[#52ffac] uppercase ml-1">Placa Oficial</label><input type="text" value={licensePlate} onChange={e => setLicensePlate(e.target.value)} className="w-full bg-[#0d0e12] border border-white/5 rounded-xl py-3 px-4 text-sm font-black text-white uppercase focus:border-[#52ffac] outline-none" /></div>
                    <div className="space-y-1.5"><label className="text-[9px] font-black text-[#52ffac] uppercase ml-1">Odómetro (KM)</label><input type="number" value={mileage} onChange={e => setMileage(Number(e.target.value))} className="w-full bg-[#0d0e12] border border-white/5 rounded-xl py-3 px-4 text-sm font-black text-white focus:border-[#52ffac] outline-none" /></div>
                    <div className="space-y-1.5"><label className="text-[9px] font-black text-[#474556] uppercase ml-1">Combustible</label><select value={fuelType} onChange={e => setFuelType(e.target.value as any)} className="w-full bg-[#0d0e12] border border-white/5 rounded-xl py-3 px-4 text-xs font-bold text-white outline-none focus:border-[#52ffac]"><option value="diesel">DIESEL</option><option value="gas91">GAS 91</option><option value="gas95">GAS 95</option></select></div>
                 </div>
               )}

               {/* AIRE ACONDICIONADO */}
               {type === 'ac' && (
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-5 p-6 bg-white/[0.02] rounded-3xl border border-white/5">
                    <div className="space-y-1.5"><label className="text-[9px] font-black text-[#c7bfff] uppercase ml-1 flex items-center gap-2"><Thermometer className="w-3 h-3" /> Capacidad (BTU)</label><input type="text" value={btu} onChange={e => setBtu(e.target.value)} placeholder="Ej: 18,000" className="w-full bg-[#0d0e12] border border-white/5 rounded-xl py-3 px-4 text-sm font-bold text-white focus:border-[#5d3cfe] outline-none" /></div>
                    <div className="space-y-1.5"><label className="text-[9px] font-black text-[#474556] uppercase ml-1">Tipo de Gas</label><select value={refrigerant} onChange={e => setRefrigerant(e.target.value)} className="w-full bg-[#0d0e12] border border-white/5 rounded-xl py-3 px-4 text-xs font-bold text-white outline-none"><option>R410A</option><option>R22</option><option>R32</option></select></div>
                    <div className="space-y-1.5"><label className="text-[9px] font-black text-[#474556] uppercase ml-1">Tecnología</label><select value={acType} onChange={e => setAcType(e.target.value as any)} className="w-full bg-[#0d0e12] border border-white/5 rounded-xl py-3 px-4 text-xs font-bold text-white outline-none"><option value="split">SPLIT / INVERTER</option><option value="central">CENTRAL / DUCTO</option><option value="vrf">VRF / MULTI</option></select></div>
                 </div>
               )}

               {/* COMPUTO / IT */}
               {type === 'computer' && (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-6 bg-white/[0.02] rounded-3xl border border-white/5">
                    <div className="space-y-1.5"><label className="text-[9px] font-black text-[#c7bfff] uppercase ml-1 flex items-center gap-2"><Cpu className="w-3 h-3" /> Procesador</label><input type="text" value={processor} onChange={e => setProcessor(e.target.value)} placeholder="Ej: Intel i7 12va Gen" className="w-full bg-[#0d0e12] border border-white/5 rounded-xl py-3 px-4 text-sm font-bold text-white focus:border-[#5d3cfe] outline-none" /></div>
                    <div className="space-y-1.5"><label className="text-[9px] font-black text-[#474556] uppercase ml-1 flex items-center gap-2"><Database className="w-3 h-3" /> Memoria RAM</label><input type="text" value={ram} onChange={e => setRam(e.target.value)} placeholder="Ej: 16GB DDR4" className="w-full bg-[#0d0e12] border border-white/5 rounded-xl py-3 px-4 text-sm font-bold text-white focus:border-[#5d3cfe] outline-none" /></div>
                 </div>
               )}

               {/* INMUEBLE / PH */}
               {type === 'house' && (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-6 bg-white/[0.02] rounded-3xl border border-white/5">
                    <div className="space-y-1.5"><label className="text-[9px] font-black text-[#c7bfff] uppercase ml-1 flex items-center gap-2"><Ruler className="w-3 h-3" /> Metraje (m²)</label><input type="text" value={sqMeters} onChange={e => setSqMeters(e.target.value)} placeholder="Ej: 120" className="w-full bg-[#0d0e12] border border-white/5 rounded-xl py-3 px-4 text-sm font-bold text-white focus:border-[#5d3cfe] outline-none" /></div>
                    <div className="space-y-1.5"><label className="text-[9px] font-black text-[#474556] uppercase ml-1">Niveles / Pisos</label><input type="number" value={floors} onChange={e => setFloors(e.target.value)} className="w-full bg-[#0d0e12] border border-white/5 rounded-xl py-3 px-4 text-sm font-bold text-white outline-none" /></div>
                 </div>
               )}

               {/* FONTANERIA */}
               {type === 'plumbing' && (
                 <div className="p-6 bg-white/[0.02] rounded-3xl border border-white/5 space-y-4">
                    <div className="space-y-1.5"><label className="text-[9px] font-black text-[#c7bfff] uppercase ml-1 flex items-center gap-2"><Waves className="w-3 h-3" /> Material de Tubería</label><select value={pipeMaterial} onChange={e => setPipeMaterial(e.target.value)} className="w-full bg-[#0d0e12] border border-white/5 rounded-xl py-3 px-4 text-xs font-bold text-white outline-none"><option>PVC / CPVC</option><option>COBRE</option><option>GALVANIZADO</option><option>PPR (Termofusión)</option></select></div>
                 </div>
               )}

               {/* ELECTRICIDAD / GENERADOR */}
               {(type === 'electrical' || type === 'generator') && (
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-5 p-6 bg-white/[0.02] rounded-3xl border border-white/5">
                    <div className="space-y-1.5"><label className="text-[9px] font-black text-[#5d3cfe] uppercase ml-1 flex items-center gap-2"><ZapOff className="w-3 h-3" /> Voltaje</label><select value={voltage} onChange={e => setVoltage(e.target.value)} className="w-full bg-[#0d0e12] border border-white/5 rounded-xl py-3 px-4 text-xs font-bold text-white outline-none"><option>110V - 120V</option><option>220V - 240V</option><option>440V - 480V</option></select></div>
                    <div className="space-y-1.5"><label className="text-[9px] font-black text-[#474556] uppercase ml-1">Amperaje Breaker</label><input type="text" value={amps} onChange={e => setAmps(e.target.value)} placeholder="Ej: 100A" className="w-full bg-[#0d0e12] border border-white/5 rounded-xl py-3 px-4 text-sm font-bold text-white outline-none" /></div>
                    <div className="space-y-1.5"><label className="text-[9px] font-black text-[#474556] uppercase ml-1">Fases</label><select value={phases} onChange={e => setPhases(e.target.value)} className="w-full bg-[#0d0e12] border border-white/5 rounded-xl py-3 px-4 text-xs font-bold text-white outline-none"><option>Monofásico</option><option>Bifásico</option><option>Trifásico</option></select></div>
                 </div>
               )}

               {/* SISTEMA SOLAR */}
               {type === 'solar_panels' && (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-6 bg-white/[0.02] rounded-3xl border border-white/5">
                    <div className="space-y-1.5"><label className="text-[9px] font-black text-[#c7bfff] uppercase ml-1">Cant. Paneles</label><input type="number" value={panelCount} onChange={e => setPanelCount(e.target.value)} className="w-full bg-[#0d0e12] border border-white/5 rounded-xl py-3 px-4 text-sm font-bold text-white outline-none" /></div>
                    <div className="space-y-1.5"><label className="text-[9px] font-black text-[#474556] uppercase ml-1">Capacidad Inversor</label><input type="text" value={inverterCapacity} onChange={e => setInverterCapacity(e.target.value)} placeholder="Ej: 5kW" className="w-full bg-[#0d0e12] border border-white/5 rounded-xl py-3 px-4 text-sm font-bold text-white outline-none" /></div>
                 </div>
               )}
            </div>
          </div>

          {/* CRONOGRAMA FINAL */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-white/5">
             <div className="space-y-2">
               <label className="text-[10px] font-black text-[#474556] uppercase ml-2 flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-[#52ffac]" /> Último Mantenimiento *</label>
               <input required type="date" value={lastMaintenance} onChange={e => setLastMaintenance(e.target.value)} className="w-full bg-[#0d0e12] border border-white/5 rounded-2xl py-4 px-6 text-sm font-black text-[#52ffac] outline-none [color-scheme:dark]" />
             </div>
             <div className="space-y-2">
               <label className="text-[10px] font-black text-[#474556] uppercase ml-2 flex items-center gap-2"><ShieldAlert className="w-3.5 h-3.5 text-[#5d3cfe]" /> Próxima Alerta *</label>
               <input required type="date" value={nextMaintenance} onChange={e => setNextMaintenance(e.target.value)} className="w-full bg-[#0d0e12] border border-white/5 rounded-2xl py-4 px-6 text-sm font-black text-[#5d3cfe] outline-none [color-scheme:dark]" />
             </div>
          </div>

          <div className="space-y-2">
             <label className="text-[10px] font-black text-[#474556] uppercase ml-2">Notas Operativas</label>
             <textarea value={observations} onChange={e => setObservations(e.target.value)} placeholder="Detalle fallas actuales o historial relevante..." className="w-full bg-[#0d0e12] border border-white/5 rounded-[1.5rem] py-4 px-6 text-sm font-medium text-[#c8c4d9] h-24 focus:border-[#5d3cfe] outline-none resize-none" />
          </div>

          <button type="submit" className="w-full py-6 bg-[#5d3cfe] text-white rounded-[1.5rem] text-[11px] font-black uppercase tracking-[0.4em] shadow-[0_20px_40px_rgba(93,60,254,0.3)] hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-4">
             <Zap className="w-5 h-5 fill-white" />
             {assetToEdit ? 'Guardar Cambios de Protocolo' : 'Protocolizar Activo en Sistema'}
          </button>
        </form>
      </div>
    </div>
  );
}
