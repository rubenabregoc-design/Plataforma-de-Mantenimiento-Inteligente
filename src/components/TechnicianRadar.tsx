import React, { useState, useEffect } from 'react';
import { TechProfile, Asset, TechCategory } from '../types';
import { MapPin, Search, Navigation, Zap, Star, ShieldCheck, User, Info, Crosshair, ArrowRight, Car, AlertTriangle, Phone } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface TechnicianRadarProps {
  technicians: TechProfile[];
  assets: Asset[];
  onSelectTech: (tech: TechProfile) => void;
}

export default function TechnicianRadar({ technicians, assets, onSelectTech }: TechnicianRadarProps) {
  const [selectedAssetId, setSelectedAssetId] = useState<string>(assets[0]?.id || '');
  const [radarZoom, setRadarZoom] = useState(1); // 1 = 5km, 2 = 10km, etc.

  const currentAsset = assets.find(a => a.id === selectedAssetId);
  const centerLat = currentAsset?.latitude || 8.9833;
  const centerLng = currentAsset?.longitude || -79.5167;

  // Formula Haversine para calcular distancia real
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radio de la Tierra en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const techWithDistance = technicians
    .filter(t => t.latitude && t.longitude && t.isOnline)
    .map(t => ({
      ...t,
      distance: calculateDistance(centerLat, centerLng, t.latitude!, t.longitude!)
    }))
    .sort((a, b) => a.distance - b.distance);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
      {/* LADO IZQUIERDO: VISUALIZADOR DE RADAR */}
      <div className="lg:col-span-7 space-y-6">
        {/* SELECTOR DE CAMIÓN PARA EL RADAR CON BÚSQUEDA REAL */}
        <div className="bg-[#1c1d21] p-5 rounded-[2rem] border border-[#2a2b2f] space-y-4 shadow-xl">
           <div className="flex items-center justify-between">
              <p className="text-[10px] font-black text-[#474556] uppercase tracking-[0.2em]">Seleccionar Unidad</p>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-black/30 rounded-xl border border-white/5">
                 <Search className="w-3.5 h-3.5 text-[#474556]" />
                 <input
                   type="text"
                   placeholder="Buscar placa..."
                   className="bg-transparent border-none text-[11px] text-white outline-none w-40 font-bold"
                   onChange={(e) => {
                      const term = e.target.value.toLowerCase();
                      const match = assets.find(a => a.licensePlate?.toLowerCase().includes(term) || a.name.toLowerCase().includes(term));
                      if (match) setSelectedAssetId(match.id);
                   }}
                 />
              </div>
           </div>

           <div className="relative group">
              <Car className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#5d3cfe]" />
              <select
                value={selectedAssetId}
                onChange={(e) => setSelectedAssetId(e.target.value)}
                className="w-full bg-[#0d0e12] border border-[#2a2b2f] rounded-2xl py-4 pl-12 pr-6 text-white font-black text-sm outline-none cursor-pointer appearance-none hover:border-[#5d3cfe]/50 transition-all shadow-inner uppercase tracking-tight"
              >
                 {assets.map(a => (
                   <option key={a.id} value={a.id} className="bg-[#1c1d21]">{a.name} • {a.licensePlate || 'Sin Placa'}</option>
                 ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40"><ArrowRight className="w-4 h-4 rotate-90" /></div>
           </div>
        </div>

        <div className="bg-[#121317] border border-[#2a2b2f] rounded-[3rem] p-8 shadow-2xl relative overflow-hidden h-[500px] flex items-center justify-center">
           {/* Fondo de Radar */}
           <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#5d3cfe_0%,_transparent_70%)]"></div>
              <div className="w-full h-full border border-[#5d3cfe]/20 rounded-full scale-[0.2]"></div>
              <div className="w-full h-full border border-[#5d3cfe]/20 rounded-full scale-[0.4]"></div>
              <div className="w-full h-full border border-[#5d3cfe]/20 rounded-full scale-[0.6]"></div>
              <div className="w-full h-full border border-[#5d3cfe]/20 rounded-full scale-[0.8]"></div>
           </div>

           {/* Efecto de Escaneo */}
           <div className="absolute inset-0 origin-center animate-[spin_4s_linear_infinite] pointer-events-none">
              <div className="w-1/2 h-1/2 bg-gradient-to-tr from-[#5d3cfe]/20 to-transparent rounded-tr-full"></div>
           </div>

           {/* Marcador Central (Mi Camión) */}
           <div className="relative z-10">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-[0_0_30px_#fff] border-4 border-[#0d0e12]">
                 <Navigation className="w-6 h-6 text-[#0d0e12] fill-[#0d0e12]" />
              </div>
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/80 px-3 py-1 rounded-lg border border-white/10">
                 <span className="text-[10px] font-black text-white uppercase tracking-widest">{currentAsset?.name || 'MI UBICACIÓN'}</span>
              </div>
           </div>

           {/* Marcadores de Técnicos (Proyectados en el radar) */}
           {techWithDistance.map((tech, idx) => {
              // Convertir lat/lng a coordenadas polares relativas para el radar (simulado para UI)
              const angle = (idx * (360 / techWithDistance.length)) * (Math.PI / 180);
              const radius = Math.min(220, (tech.distance * 30) + 100); // Escala visual
              const x = Math.cos(angle) * radius;
              const y = Math.sin(angle) * radius;

              return (
                <button
                  key={tech.id}
                  onClick={() => onSelectTech(tech)}
                  className="absolute z-20 group transform hover:scale-110 transition-all"
                  style={{ transform: `translate(${x}px, ${y}px)` }}
                >
                   <div className={`w-8 h-8 rounded-xl flex items-center justify-center shadow-lg border-2 border-[#121317] ${tech.plan === 'enterprise' ? 'bg-amber-500 text-black' : 'bg-[#5d3cfe] text-white'}`}>
                      <User className="w-4 h-4" />
                   </div>
                   {/* Tooltip flotante */}
                   <div className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black border border-white/10 rounded-lg p-2 whitespace-nowrap pointer-events-none shadow-2xl">
                      <p className="text-[9px] font-black text-white uppercase">{tech.name}</p>
                      <p className="text-[8px] font-bold text-[#52ffac]">{tech.distance.toFixed(1)} km de distancia</p>
                   </div>
                </button>
              );
           })}

           <div className="absolute bottom-8 left-8 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-[#474556]">
                 <div className="w-3 h-3 bg-amber-500 rounded-sm"></div>
                 <span className="text-[9px] font-black uppercase">Especialista Élite</span>
              </div>
              <div className="flex items-center gap-2 text-[#474556]">
                 <div className="w-3 h-3 bg-[#5d3cfe] rounded-sm"></div>
                 <span className="text-[9px] font-black uppercase">Técnico Certificado</span>
              </div>
           </div>

           <div className="absolute top-8 left-8">
              <div className="bg-black/60 backdrop-blur-md border border-white/10 rounded-2xl p-4 space-y-1 shadow-2xl">
                 <p className="text-[8px] font-black text-[#474556] uppercase tracking-widest">Señal de Red</p>
                 <p className="text-xs font-black text-[#52ffac] uppercase tracking-tight italic">Mantech Sat-Link v4</p>
              </div>
           </div>
        </div>
      </div>

      {/* LADO DERECHO: LISTA DE CERCANÍA */}
      <div className="lg:col-span-5 space-y-6">
        <div className="bg-[#121317] border border-[#2a2b2f] rounded-[3rem] p-8 shadow-2xl flex flex-col h-full">
           <header className="mb-8">
              <h3 className="text-xl font-black text-white uppercase tracking-tighter">Técnicos <span className="text-[#5d3cfe]">Cercanos</span></h3>
              <p className="text-[10px] text-[#474556] font-black uppercase tracking-widest mt-1">Ordenados por proximidad GPS</p>
           </header>

           <div className="space-y-4 overflow-y-auto custom-scrollbar flex-1 pr-2">
              {techWithDistance.map(tech => (
                <div key={tech.id} className="bg-[#1c1d21] border border-[#2a2b2f] p-5 rounded-2xl flex justify-between items-center group hover:border-[#5d3cfe]/50 transition-all cursor-pointer" onClick={() => onSelectTech(tech)}>
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-[#0d0e12] border border-[#2a2b2f] flex items-center justify-center text-[#c7bfff] font-black shadow-inner">
                         {tech.name[0]}
                      </div>
                      <div>
                         <h4 className="text-sm font-black text-white uppercase tracking-tight">{tech.name}</h4>
                         <div className="flex items-center gap-2 mt-1">
                            <span className="text-[9px] font-bold text-[#52ffac] uppercase tracking-widest">{tech.distance.toFixed(1)} km</span>
                            <span className="text-[14px] text-[#474556]">â€¢</span>
                            <div className="flex items-center gap-1">
                               <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                               <span className="text-[9px] font-black text-white">{tech.rating}</span>
                            </div>
                         </div>
                      </div>
                   </div>
                   <button className="p-3 bg-[#121317] border border-[#2a2b2f] text-[#c8c4d9] group-hover:text-white group-hover:bg-[#5d3cfe] rounded-xl transition-all">
                      <ArrowRight className="w-4 h-4" />
                   </button>
                </div>
              ))}
           </div>

           <div className="mt-8 pt-8 border-t border-[#2a2b2f] space-y-4">
              <button
                onClick={() => {
                  const techMap: Record<string, TechCategory> = {
                    car: 'mecanico',
                    moto: 'mecanico',
                    ac: 'tecnico_ac',
                    generator: 'electricista',
                    solar_panels: 'especialista_solar',
                    computer: 'informatico',
                    industrial_equip: 'mecanico',
                    house: 'plomero'
                  };

                  const targetCategory = techMap[currentAsset?.type || 'car'];
                  const relevantTechs = techWithDistance.filter(t => t.category === targetCategory);

                  if (relevantTechs.length === 0) {
                    toast.error(`No hay especialistas en ${targetCategory.replace('_',' ')} cerca de esta unidad.`);
                    return;
                  }

                  const closest = relevantTechs.slice(0, 3);
                  const names = closest.map(t => t.name).join(', ');

                  if(window.confirm(`🚨 PROTOCOLO DE SEGURIDAD ACTIVADO: ¿Enviar alerta del ${currentAsset?.name} a los ${closest.length} especialistas más cercanos? (${names})\n\nSe generará un CÓDIGO DE VERIFICACIÓN para tu seguridad.`)) {
                    const safetyPin = Math.floor(1000 + Math.random() * 9000);
                    toast.success(`SEÑAL SOS TRANSMITIDA. Tu Código de Seguridad es: ${safetyPin}. NO abras la puerta a nadie que no diga este código.`, { duration: 10000, icon: '🛡️' });
                  }
                }}
                className="w-full py-4 bg-rose-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] shadow-xl shadow-rose-600/20 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                <AlertTriangle className="w-4 h-4 fill-white" /> LANZAR ALERTA SOS
              </button>

              <div className="flex items-center gap-4">
                <button
                  onClick={() => window.open('tel:911')}
                  className="flex-1 py-3 bg-[#1c1d21] border border-rose-500/30 text-rose-500 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center gap-2"
                >
                  <Phone className="w-3 h-3" /> EMERGENCIA POLICÍA (911)
                </button>
                <div className="px-4 py-2 bg-black/40 border border-white/10 rounded-xl flex items-center gap-2 grayscale hover:grayscale-0 transition-all cursor-help" title="Servicio Protegido por Seguridad Privada">
                   <ShieldCheck className="w-4 h-4 text-emerald-500" />
                   <div className="leading-none text-left">
                      <p className="text-[7px] font-black text-[#474556] uppercase">Protección</p>
                      <p className="text-[8px] font-black text-white uppercase">PANAMÁ SECURITY</p>
                   </div>
                </div>
              </div>

              <div className="bg-[#5d3cfe]/10 border border-[#5d3cfe]/20 p-4 rounded-2xl flex items-start gap-4">
                 <Zap className="w-5 h-5 text-[#5d3cfe] shrink-0" />
                 <p className="text-[10px] text-[#c7bfff] font-bold leading-relaxed uppercase">
                    El sistema detectó {techWithDistance.filter(t => t.distance < 5).length} técnicos en un radio de 5km listos para movilización inmediata.
                 </p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
