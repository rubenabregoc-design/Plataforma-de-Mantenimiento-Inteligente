import * as XLSX from 'xlsx';
import { toast } from 'react-hot-toast';
import React, { useState, useEffect } from 'react';
import { Asset, MaintenanceReminder } from '../types';
import {
  LayoutGrid, List, MapPin, AlertCircle, CheckCircle2, TrendingUp, Search, Filter,
  ChevronRight, Car, Wind, Cpu, Zap, Building2, Code, Phone, ShieldCheck, Download, Star, FileText, Globe, RefreshCw, ChevronLeft, Navigation, Pause, Clock, Flag
} from 'lucide-react';

interface FleetDashboardProps {
  assets: Asset[];
  reminders: MaintenanceReminder[];
  onManageAsset?: (asset: Asset) => void;
  onBulkUpdate?: (assetIds: string[], update: Partial<Asset>) => void;
  onBulkRegister?: (assets: any[]) => void;
  onStartGps?: (assetId: string) => void;
  onTogglePause?: () => void;
  onAddCheckpoint?: (asset: Asset) => void;
  trackingAssetId?: string | null;
  tripStatus?: 'idle' | 'active' | 'paused';
  mode?: 'lite' | 'full';
}

export default function FleetDashboard({ assets, reminders, onManageAsset, onBulkUpdate, onBulkRegister, onStartGps, onTogglePause, onAddCheckpoint, trackingAssetId, tripStatus = 'idle', mode = 'lite' }: FleetDashboardProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'table' | 'history'>(mode === 'full' ? 'table' : 'grid');
  const [activeSubTab, setActiveSubTab] = useState<'fleet' | 'api' | 'support'>('fleet');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [locationFilter, setLocationFilter] = useState('Todas');
  const [historyAssetId, setHistoryAssetId] = useState<string | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Manual Speed Entry state
  const [editingKmId, setEditingKmId] = useState<string | null>(null);
  const [tempKm, setCustomKm] = useState('');

  const filteredAssets = assets.filter(a => locationFilter === 'Todas' || (a.location === locationFilter || (!a.location && locationFilter === 'Sede Principal')));
  const totalPages = Math.ceil(filteredAssets.length / pageSize);
  const paginatedAssets = filteredAssets.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const totalAssets = assets.length;
  const urgentCount = reminders.filter(r => r.status === 'urgent').length;
  const healthScore = totalAssets > 0 ? Math.round(((totalAssets - urgentCount) / totalAssets) * 100) : 100;

  const handleGpsSync = async () => {
    onStartGps?.('all');
    toast.success("🛰️ Enlace Satelital Activo: Sincronización Automática iniciada.");
  };

  const handleManualKmSave = (id: string) => {
    const val = Number(tempKm);
    if (!isNaN(val)) {
      onBulkUpdate?.([id], { mileage: val });
      setEditingKmId(null);
      toast.success("Km actualizado");
    }
  };

  const handleExportRoute = (asset: Asset) => {
    if (!asset.routeHistory || asset.routeHistory.length === 0) {
      toast.error("No hay datos de ruta para exportar.");
      return;
    }

    const data = asset.routeHistory.map((p, i) => ({
      'Punto': i + 1,
      'Latitud': p.lat,
      'Longitud': p.lng,
      'Fecha/Hora': new Date(p.timestamp).toLocaleString(),
      'Lugar': p.locationName || 'Rastreo Automático',
      'Estado': 'Verificado por GPS'
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Bitácora GPS");
    XLSX.writeFile(wb, `Ruta_${asset.name}_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success("Reporte de ruta descargado.");
  };

  const handleAddCheckpoint = (asset: Asset) => {
    if (onAddCheckpoint) {
      onAddCheckpoint(asset);
    }
  };

  return (
    <div className="space-y-6">
      {/* Fleet Navigation Tabs */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div className="flex bg-[#1a1b20] p-1.5 rounded-2xl w-fit border border-[#474556]/30 shadow-inner">
          <button
            onClick={() => setActiveSubTab('fleet')}
            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${activeSubTab === 'fleet' ? 'bg-[#5d3cfe] text-white shadow-sm' : 'text-[#c8c4d9] hover:text-white'}`}
          >
            Monitor de Flota
          </button>
          <button
            onClick={() => mode === 'full' ? setActiveSubTab('api') : toast.error("⚠️ Plan Corporativo Requerido para acceso a API.")}
            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-2 ${activeSubTab === 'api' ? 'bg-[#5d3cfe] text-white shadow-sm' : 'text-[#c8c4d9] hover:text-white'}`}
          >
            API Integración {mode !== 'full' && <Zap className="w-3 h-3 fill-amber-500 text-amber-500" />}
          </button>
          <button
            onClick={() => mode === 'full' ? setActiveSubTab('support') : toast.error("⚠️ Plan Corporativo Requerido para Gerente Dedicado.")}
            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-2 ${activeSubTab === 'support' ? 'bg-[#5d3cfe] text-white shadow-sm' : 'text-[#c8c4d9] hover:text-white'}`}
          >
            Gerente Dedicado {mode !== 'full' && <Star className="w-3 h-3 fill-amber-500 text-amber-500" />}
          </button>
        </div>

        {mode === 'full' && (
          <button
            onClick={handleGpsSync}
            className="px-6 py-2 bg-[#52ffac]/10 border border-[#52ffac]/30 text-[#52ffac] rounded-xl text-[10px] font-black uppercase flex items-center gap-2 hover:bg-[#52ffac] hover:text-black transition-all shadow-lg"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Sincronizar GPS Satelital
          </button>
        )}
      </div>

      {activeSubTab === 'fleet' && (
        <>
          {/* Fleet Summary Header */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-[#5d3cfe] rounded-[1.5rem] p-5 text-white shadow-lg shadow-[#5d3cfe]/20">
              <span className="text-[9px] font-black uppercase opacity-60">Total Activos Flota</span>
              <p className="text-3xl font-black">{totalAssets}</p>
              <div className="mt-2 flex items-center gap-1 text-[10px] font-bold">
                <Building2 className="w-3 h-3" />
                <span>Panamá / Sedes Múltiples</span>
              </div>
            </div>

            <div className="bg-[#1f1f24] rounded-[1.5rem] p-5 border border-[#474556]/30 shadow-sm">
              <span className="text-[9px] font-black uppercase text-[#c8c4d9]">Atención Crítica</span>
              <p className="text-3xl font-black text-rose-500">{urgentCount}</p>
              <div className="mt-2 flex items-center gap-1 text-rose-500 font-bold text-[10px]">
                <AlertCircle className="w-3 h-3" />
                <span>Equipos requieren visita</span>
              </div>
            </div>

            <div className="bg-[#1f1f24] rounded-[1.5rem] p-5 border border-[#474556]/30 shadow-sm">
              <span className="text-[9px] font-black uppercase text-[#c8c4d9]">Score de Salud Flota</span>
              <p className="text-3xl font-black text-emerald-500">{healthScore}%</p>
              <div className="w-full bg-[#1a1b20] h-1 rounded-full mt-3 overflow-hidden">
                <div className="bg-emerald-500 h-full transition-all duration-1000" style={{ width: `${healthScore}%` }}></div>
              </div>
            </div>

            <div className="bg-[#343439] rounded-[1.5rem] p-5 text-white shadow-xl border border-[#474556]/30">
              <span className="text-[9px] font-black uppercase opacity-60">Servicios Proyectados</span>
              <p className="text-3xl font-black text-[#c7bfff]">
                {assets.filter(a => {
                  const nextKm = (a.mileage || 0) + 5000;
                  return (a.mileage || 0) >= nextKm - 500;
                }).length}
              </p>
              <div className="mt-2 flex items-center gap-2">
                 <button
                    onClick={() => {
                      const data = assets.map(a => ({
                        'Nombre/Unidad': a.name,
                        'Placa': a.licensePlate || 'N/A',
                        'Kilometraje': a.mileage || 0,
                        'Estado': (a.mileage || 0) >= ((a.mileage || 0) + 5000 - 500) ? 'URGENTE' : 'ÓPTIMO'
                      }));
                      const ws = XLSX.utils.json_to_sheet(data);
                      const wb = XLSX.utils.book_new();
                      XLSX.utils.book_append_sheet(wb, ws, "Auditoria");
                      XLSX.writeFile(wb, "Reporte_Flota.xlsx");
                    }}
                    className="flex-1 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-[8px] font-black uppercase flex items-center justify-center gap-1 transition-all"
                 >
                    <FileText className="w-2.5 h-2.5" /> Excel
                 </button>
              </div>
            </div>
          </div>

          {/* Fleet Controls */}
          <div className="bg-[#1f1f24] rounded-[1.5rem] border border-[#474556]/30 p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
            <div className="flex-1 min-w-[250px] relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#c8c4d9]" />
              <input
                type="text"
                placeholder="Filtrar flota por placa, ID o unidad..."
                className="w-full pl-10 pr-4 py-2 bg-[#1a1b20] border border-[#474556]/30 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-[#5d3cfe] text-white"
              />
            </div>

            <div className="flex items-center gap-3">
              {selectedIds.length > 0 && (
                <button
                  onClick={() => {
                    if(window.confirm(`¿Confirmar mantenimiento masivo para ${selectedIds.length} equipos?`)) {
                      onBulkUpdate?.(selectedIds, { lastMaintenanceDate: new Date().toISOString().split('T')[0] });
                      setSelectedIds([]);
                    }
                  }}
                  className="px-4 py-2 bg-[#52ffac] text-black text-[9px] font-black rounded-xl uppercase shadow-lg shadow-[#52ffac]/20 animate-fade-in"
                >
                  Confirmar {selectedIds.length} Mttos.
                </button>
              )}

              <button
                onClick={() => {
                  if (window.confirm("¿Deseas generar 40 camiones de prueba para estresar el sistema?")) {
                    const trucks = Array.from({ length: 40 }).map((_, i) => ({
                      name: `CAMIÓN-${(i + 1).toString().padStart(2, '0')}`,
                      type: 'car',
                      details: `Freightliner M2 - Unidad ${(i + 1)}`,
                      licensePlate: `CP-${Math.floor(1000 + Math.random() * 9000)}`,
                      mileage: Math.floor(10000 + Math.random() * 80000),
                      lastMaintenanceDate: '2026-06-01',
                      nextMaintenanceDate: '2026-08-01',
                      location: i % 2 === 0 ? 'Panamá Centro' : 'Colón',
                      routeHistory: []
                    }));
                    onBulkRegister?.(trucks);
                  }
                }}
                className="px-4 py-2 bg-[#1a1b20] border border-[#474556]/30 text-white rounded-xl text-[9px] font-black uppercase flex items-center gap-2 hover:bg-[#5d3cfe] transition-all"
              >
                <Download className="w-3 h-3" /> Carga Masiva (40+)
              </button>

              <div className="bg-[#1a1b20] p-1 rounded-xl flex border border-[#474556]/30">
                <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-[#5d3cfe] text-white' : 'text-[#c8c4d9]'}`}><LayoutGrid className="w-4 h-4" /></button>
                <button onClick={() => setViewMode('table')} className={`p-2 rounded-lg ${viewMode === 'table' ? 'bg-[#5d3cfe] text-white' : 'text-[#c8c4d9]'}`}><List className="w-4 h-4" /></button>
              </div>
            </div>
          </div>

          {/* Location Bar */}
          {mode === 'full' && (
            <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
              {['Todas', 'Panamá Centro', 'Colón', 'Chiriquí', 'Chorrera'].map(loc => (
                <button
                  key={loc}
                  onClick={() => { setLocationFilter(loc); setCurrentPage(1); }}
                  className={`px-4 py-1.5 rounded-full border text-[8px] font-black uppercase transition-all flex-shrink-0 ${locationFilter === loc ? 'bg-white text-black border-white' : 'bg-[#1f1f24] text-[#c8c4d9] border-[#474556]/30 hover:border-white/40'}`}
                >
                  <Globe className="w-2.5 h-2.5 mr-2 inline" /> {loc}
                </button>
              ))}
            </div>
          )}

          {/* View Mode Logic */}
          {viewMode === 'table' && (
             <div className="bg-[#1f1f24] rounded-[1.5rem] border border-[#474556]/30 overflow-hidden shadow-xl animate-fade-in">
                <table className="w-full text-left border-collapse">
                   <thead>
                      <tr className="bg-[#1a1b20] border-b border-[#474556]/30">
                         <th className="p-4 w-10 text-center"><input type="checkbox" onChange={(e) => setSelectedIds(e.target.checked ? filteredAssets.map(a => a.id) : [])} className="rounded border-[#474556]/30 bg-[#0d0e12] text-[#5d3cfe]" /></th>
                         <th className="p-4 text-[9px] font-black text-[#c8c4d9] uppercase tracking-widest">Unidad / Marca</th>
                         <th className="p-4 text-[9px] font-black text-[#c8c4d9] uppercase tracking-widest text-center">Placa</th>
                         <th className="p-4 text-[9px] font-black text-[#c8c4d9] uppercase tracking-widest text-center">Kilometraje</th>
                         <th className="p-4 text-[9px] font-black text-[#c8c4d9] uppercase tracking-widest text-center">Próximo Mtto</th>
                         <th className="p-4 text-[9px] font-black text-[#c8c4d9] uppercase tracking-widest">Estado</th>
                         <th className="p-4"></th>
                      </tr>
                   </thead>
                   <tbody className="text-[11px] font-bold text-white">
                      {paginatedAssets.map((asset) => {
                         const nextKm = (asset.mileage || 0) + 5000;
                         const isCritical = (asset.mileage || 0) >= nextKm - 500;
                         return (
                            <tr key={asset.id} className="border-b border-[#474556]/10 hover:bg-white/[0.02] transition-colors">
                               <td className="p-4 text-center"><input type="checkbox" checked={selectedIds.includes(asset.id)} onChange={(e) => { if(e.target.checked) setSelectedIds([...selectedIds, asset.id]); else setSelectedIds(selectedIds.filter(id => id !== asset.id)); }} className="rounded border-[#474556]/30 bg-[#0d0e12] text-[#5d3cfe]" /></td>
                               <td className="p-4 flex items-center gap-3">
                                  <div className="p-2 bg-[#1a1b20] rounded-lg border border-[#474556]/30"><Car className="w-3.5 h-3.5 text-[#c7bfff]" /></div>
                                  <div><p className="font-black uppercase tracking-tight">{asset.name}</p><p className="text-[9px] text-[#c8c4d9] opacity-40 uppercase">{asset.details}</p></div>
                               </td>
                               <td className="p-4 text-center font-mono tracking-widest text-[#52ffac]">{asset.licensePlate || '---'}</td>
                               <td className="p-4 text-center font-black">{asset.mileage?.toLocaleString()} Km</td>
                               <td className="p-4 text-center font-black text-[#c7bfff]">{nextKm.toLocaleString()} Km</td>
                               <td className="p-4"><span className={`px-2 py-0.5 rounded-full text-[7px] font-black uppercase ${isCritical ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'}`}>{isCritical ? 'URGENTE' : 'ÓPTIMO'}</span></td>
                               <td className="p-4 text-right">
                                  <div className="flex gap-2 justify-end items-center">
                                     {trackingAssetId === asset.id && (
                                       <>
                                         <button onClick={() => handleAddCheckpoint(asset)} className="p-2 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-lg" title="Marcar Parada"><Flag className="w-4 h-4" /></button>
                                         <button onClick={onTogglePause} className={`p-2 rounded-lg ${tripStatus === 'paused' ? 'bg-amber-500 text-black' : 'bg-amber-500/10 text-amber-500'}`}>{tripStatus === 'paused' ? <Zap className="w-4 h-4 fill-current" /> : <Clock className="w-4 h-4" />}</button>
                                       </>
                                     )}
                                     <button onClick={() => { setHistoryAssetId(asset.id); setViewMode('history'); }} className="p-2 bg-[#1a1b20] text-[#c7bfff] hover:bg-[#5d3cfe] hover:text-white rounded-xl transition-all"><FileText className="w-4 h-4" /></button>
                                     <button onClick={() => onStartGps?.(asset.id)} className={`p-2 rounded-lg transition-all ${trackingAssetId === asset.id ? 'bg-rose-500 text-white animate-pulse' : 'bg-[#1a1b20] text-[#52ffac] hover:bg-[#52ffac] hover:text-black'}`}><MapPin className="w-4 h-4" /></button>
                                  </div>
                               </td>
                            </tr>
                         );
                      })}
                   </tbody>
                </table>
                <div className="bg-[#1a1b20] p-4 flex items-center justify-between border-t border-[#474556]/30">
                   <p className="text-[9px] font-black text-[#474556] uppercase">Mostrando {paginatedAssets.length} unidades</p>
                   <div className="flex gap-2">
                      <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-2 bg-[#121317] border border-[#474556]/30 rounded-lg text-[#c8c4d9]"><ChevronLeft className="w-4 h-4" /></button>
                      <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="p-2 bg-[#121317] border border-[#474556]/30 rounded-lg text-[#c8c4d9]"><ChevronRight className="w-4 h-4" /></button>
                   </div>
                </div>
             </div>
          )}

          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
              {paginatedAssets.map((asset) => {
                const isUrgent = reminders.some(r => r.assetId === asset.id && r.status === 'urgent');
                return (
                  <div key={asset.id} className={`bg-[#1f1f24] rounded-2xl border transition-all p-5 hover:shadow-xl group relative overflow-hidden ${isUrgent ? 'border-rose-500/50 bg-rose-500/5' : 'border-[#474556]/30'}`}>
                    <div className="flex justify-between items-start mb-4">
                      <div className={`p-2 rounded-xl ${isUrgent ? 'bg-rose-500/20 text-rose-500' : 'bg-[#5d3cfe]/20 text-[#c7bfff]'}`}>{asset.type === 'car' ? <Car className="w-5 h-5" /> : <Wind className="w-5 h-5" />}</div>
                      <div className="flex flex-col items-end gap-1">
                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full border ${isUrgent ? 'bg-rose-500/10 text-rose-500 border-rose-500/30' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30'}`}>{isUrgent ? 'URGENTE' : 'ÓPTIMO'}</span>
                        {asset.currentRoute && trackingAssetId === asset.id && (
                           <div className="px-2 py-0.5 bg-[#52ffac] text-[#0d0e12] rounded-md text-[7px] font-black uppercase flex items-center gap-1 animate-pulse shadow-lg"><Navigation className="w-2 h-2 fill-current" /> {asset.currentRoute}</div>
                        )}
                      </div>
                    </div>
                    <h4 className="font-black text-white text-sm tracking-tight uppercase">{asset.name}</h4>
                    <p className="text-[10px] text-[#c8c4d9] mb-4 opacity-60 uppercase">{asset.details}</p>
                    <div className="grid grid-cols-2 gap-4 border-t border-[#474556]/20 pt-4">
                       <div><p className="text-[8px] font-black text-[#474556] uppercase">Km Actual</p><p className="text-xs font-black text-white">{asset.mileage?.toLocaleString()} Km</p></div>
                       <div><p className="text-[8px] font-black text-[#474556] uppercase">Próximo</p><p className="text-xs font-black text-[#5d3cfe]">{( (asset.mileage || 0) + 5000 ).toLocaleString()} Km</p></div>
                    </div>
                    <div className="flex gap-2 mt-4">
                       <button onClick={() => onStartGps?.(asset.id)} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[9px] font-black uppercase transition-all border ${trackingAssetId === asset.id ? 'bg-rose-500 border-rose-500 text-white animate-pulse' : 'bg-[#1a1b20] border-[#474556]/30 text-[#52ffac] hover:bg-[#52ffac] hover:text-black'}`}><MapPin className="w-3.5 h-3.5" /> {trackingAssetId === asset.id ? 'Finalizar' : 'Iniciar'}</button>
                       <button onClick={() => { setHistoryAssetId(asset.id); setViewMode('history'); }} className="p-3 bg-[#1a1b20] border border-[#474556]/30 text-[#c7bfff] hover:bg-[#5d3cfe] hover:text-white rounded-xl transition-all"><FileText className="w-4 h-4" /></button>
                       <button onClick={() => onManageAsset?.(asset)} className="p-3 bg-[#1a1b20] border border-[#474556]/30 text-white hover:bg-white/10 rounded-xl transition-all"><ChevronRight className="w-4 h-4" /></button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {viewMode === 'history' && historyAssetId && (
            <div className="bg-[#1f1f24] rounded-[1.5rem] border border-[#474556]/30 overflow-hidden shadow-xl animate-fade-in flex flex-col lg:flex-row h-[600px]">
               <div className="flex-1 bg-[#0d0e12] relative min-h-[300px]">
                  {(() => {
                    const isNight = new Date().getHours() >= 18 || new Date().getHours() < 6;
                    const history = assets.find(a => a.id === historyAssetId)?.routeHistory;
                    const lastValidPoint = history?.filter(p => p.lat !== 0).at(-1);
                    const lat = lastValidPoint?.lat || 8.9833;
                    const lng = lastValidPoint?.lng || -79.5167;
                    const zoom = lastValidPoint ? 16 : 12;

                    return (
                      <>
                        <iframe
                          width="100%"
                          height="100%"
                          frameBorder="0"
                          style={{
                            border: 0,
                            filter: isNight ? 'invert(90%) hue-rotate(180deg) brightness(0.8) contrast(1.2)' : 'none'
                          }}
                          src={`https://www.google.com/maps?q=${lat},${lng}&t=m&z=${zoom}&output=embed`}
                          allowFullScreen
                        ></iframe>
                        {isNight && (
                          <div className="absolute top-4 right-4 bg-amber-500/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-amber-500/30 flex items-center gap-2 z-20 shadow-2xl">
                             <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                             <span className="text-[8px] font-black text-amber-500 uppercase tracking-widest">Monitoreo Nocturno Activo</span>
                          </div>
                        )}
                      </>
                    );
                  })()}
                  {/* Badge movido al top-left para no tapar el mapa ni el logo de Google */}
                  <div className="absolute top-6 left-6 bg-black/90 backdrop-blur-md p-4 rounded-2xl border border-white/10 z-10 shadow-2xl flex items-center gap-3">
                     <div className="w-2 h-2 bg-[#52ffac] rounded-full animate-ping"></div>
                     <div><p className="text-[7px] font-black text-[#474556] uppercase tracking-[0.2em]">Enlace en Vivo</p><p className="text-[9px] font-black text-white uppercase">Mantech Sat-Link v4</p></div>
                  </div>
               </div>

               <div className="w-full lg:w-[450px] bg-[#1a1b20] border-l border-[#474556]/30 flex flex-col shadow-2xl">
                  <header className="p-8 border-b border-[#474556]/30 flex justify-between items-center bg-[#1c1d24]">
                     <div className="flex items-center gap-4">
                        <button onClick={() => setViewMode('table')} className="p-3 hover:bg-white/5 rounded-xl text-[#c8c4d9] transition-all"><ChevronLeft className="w-5 h-5" /></button>
                        <div><h4 className="text-sm font-black text-white uppercase tracking-tight">Timeline Logístico</h4><p className="text-[8px] text-[#474556] font-black uppercase tracking-[0.2em]">Historial de Paradas y Tráfico</p></div>
                     </div>
                     <button onClick={() => { const asset = assets.find(a => a.id === historyAssetId); if (asset) handleExportRoute(asset); }} className="p-3 bg-[#5d3cfe]/10 text-[#c7bfff] border border-[#5d3cfe]/20 rounded-xl hover:bg-[#5d3cfe] hover:text-white transition-all shadow-lg"><FileText className="w-5 h-5" /></button>
                  </header>

                  <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-6">
                     {assets.find(a => a.id === historyAssetId)?.routeHistory?.slice().reverse().map((point, idx, arr) => {
                       const isCheckpoint = point.type === 'checkpoint';
                       let stayDuration = '';
                       if (isCheckpoint && idx < arr.length - 1) {
                         const arrivalTime = new Date(point.timestamp).getTime();
                         const prevTime = new Date(arr[idx + 1].timestamp).getTime();
                         const diff = Math.floor(Math.abs(arrivalTime - prevTime) / (1000 * 60));
                         if (diff > 0) { const h = Math.floor(diff / 60); const m = diff % 60; stayDuration = h > 0 ? `${h}h ${m}m` : `${m} min`; }
                       }
                       return (
                        <div key={idx} className="flex items-start gap-6 group relative">
                           <div className="flex flex-col items-center"><div className={`w-3 h-3 rounded-full z-10 transition-all ${idx === 0 ? 'bg-[#52ffac] shadow-[0_0_15px_#52ffac]' : isCheckpoint ? 'bg-amber-500 scale-125' : 'bg-[#474556]'}`}></div><div className="w-px h-16 bg-gradient-to-b from-[#474556]/50 to-transparent mt-1"></div></div>
                           <div className={`flex-1 p-5 rounded-2xl border transition-all ${isCheckpoint ? 'bg-amber-500/10 border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.05)]' : 'bg-[#121317] border-[#2a2b2f] group-hover:border-[#5d3cfe]/50 shadow-inner'}`}>
                              <div className="flex justify-between items-start">
                                 <div className="space-y-1">
                                    {isCheckpoint ? (<div className="flex flex-col gap-1"><p className="text-xs font-black text-amber-500 uppercase flex items-center gap-2"><Flag className="w-3 h-3" /> {point.locationName}</p>{stayDuration && (<div className="flex items-center gap-1.5 px-2 py-0.5 bg-amber-500 text-[#0d0e12] rounded text-[7px] font-black w-fit uppercase"><Clock className="w-2 h-2" /> Estancia: {stayDuration}</div>)}</div>) : (<p className="text-[10px] font-black text-white">{point.lat.toFixed(4)}, {point.lng.toFixed(4)}</p>)}
                                    <p className="text-[8px] text-[#474556] font-bold uppercase tracking-widest">{new Date(point.timestamp).toLocaleTimeString()}</p>
                                 </div>
                                 <div className="p-2 bg-white/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"><Navigation className={`w-3 h-3 ${isCheckpoint ? 'text-amber-500' : 'text-[#5d3cfe]'}`} /></div>
                              </div>
                           </div>
                        </div>
                       );
                     })}
                     {(!assets.find(a => a.id === historyAssetId)?.routeHistory || assets.find(a => a.id === historyAssetId)?.routeHistory?.length === 0) && (<div className="py-20 text-center opacity-20"><Navigation className="w-12 h-12 mx-auto mb-4" /><p className="text-[10px] font-black uppercase">Sin actividad detectada</p></div>)}
                  </div>
               </div>
            </div>
          )}
        </>
      )}

      {activeSubTab === 'api' && (
        <div className="bg-[#1f1f24] rounded-[1.5rem] border border-[#474556]/30 p-8 shadow-xl space-y-6 animate-fade-in">
           <header className="flex items-center gap-4 mb-6"><div className="p-3 bg-[#5d3cfe]/10 rounded-2xl text-[#c7bfff]"><Code className="w-6 h-6" /></div><div><h3 className="text-lg font-black text-white uppercase tracking-tight">API de Integración Empresarial</h3><p className="text-[10px] text-[#c8c4d9] font-bold uppercase tracking-widest">Conecta tus sistemas ERP con MantechPro</p></div></header>
           <div className="bg-[#121317] rounded-2xl p-6 text-[#c7bfff] font-mono text-[10px] overflow-x-auto border border-[#474556]/30 shadow-inner">
             <p className="mb-2 text-[#474556]">// Actualizar kilometraje masivo desde GPS externo</p>
             <p>POST https://api.mantechpro.com/v1/fleet/sync</p>
             <p>{'{"token": "mantech_live_...", "fleet": [{"id": "TRUCK-01", "km": 45200}]}'}</p>
           </div>
        </div>
      )}

      {activeSubTab === 'support' && (
        <div className="bg-[#1f1f24] rounded-[1.5rem] border border-[#474556]/30 p-8 shadow-xl animate-fade-in">
           <header className="flex items-center gap-4 mb-8"><div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-500"><Phone className="w-6 h-6" /></div><div><h3 className="text-lg font-black text-white uppercase tracking-tight">Tu Gerente de Cuenta VIP</h3><p className="text-[10px] text-[#c8c4d9] font-bold uppercase tracking-widest">Soporte Estratégico y Mediación Directa</p></div></header>
           <div className="flex flex-col md:flex-row items-center gap-8 bg-[#1a1b20] p-8 rounded-[2rem] border border-[#474556]/30">
             <div className="w-24 h-24 rounded-full bg-[#5d3cfe]/10 border-4 border-[#1f1f24] shadow-xl flex items-center justify-center text-2xl font-black text-[#c7bfff]">JP</div>
             <div className="flex-1 text-center md:text-left"><h4 className="text-xl font-black text-white">Juan Pablo Castillo</h4><p className="text-xs font-bold text-[#c7bfff] uppercase tracking-wide">Key Account Manager - División Corporativa</p><div className="mt-4 flex gap-3 justify-center md:justify-start"><button className="px-6 py-2 bg-white text-black rounded-xl text-[9px] font-black uppercase hover:scale-105 transition-all">WhatsApp</button><button className="px-6 py-2 bg-[#343439] text-white rounded-xl text-[9px] font-black uppercase hover:scale-105 transition-all">Reunión</button></div></div>
             <div className="p-4 bg-[#1f1f24] rounded-2xl border border-[#474556]/30 text-center min-w-[150px]"><span className="text-[8px] font-black text-[#c8c4d9]/50 uppercase">Tiempo de Respuesta</span><p className="text-sm font-black text-emerald-500 mt-1">&lt; 15 Minutos</p><div className="flex justify-center gap-0.5 mt-2">{[1,2,3,4,5].map(s => <ShieldCheck key={s} className="w-2.5 h-2.5 fill-emerald-500 text-emerald-500" />)}</div></div>
           </div>
        </div>
      )}
    </div>
  );
}
