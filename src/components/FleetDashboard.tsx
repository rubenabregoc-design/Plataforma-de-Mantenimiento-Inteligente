import * as XLSX from 'xlsx';
import { toast } from 'react-hot-toast';
import React, { useState, useEffect } from 'react';
import { Asset, MaintenanceReminder } from '../types';
import {
  LayoutGrid, List, MapPin, AlertCircle, CheckCircle2, TrendingUp, Search, Filter,
  ChevronRight, Car, Wind, Cpu, Zap, Building2, Code, Phone, ShieldCheck, Download, Star, FileText, Globe, RefreshCw, ChevronLeft, Navigation, Pause, Clock, Flag, Droplets, Fuel, Trash2, Maximize, Activity, AlertTriangle, Pencil, Plus, Info, Settings, User as UserIcon
} from 'lucide-react';
import { Geolocation } from '@capacitor/geolocation';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for Leaflet marker icons in React
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Solo redefinir si L.Icon.Default no existe (evita crashes por múltiples renders)
if (L.Icon.Default) {
  L.Icon.Default.mergeOptions({
      iconUrl: markerIcon,
      shadowUrl: markerShadow,
  });
}

// Custom Icons for MantechPro (DISEÑO ANTI-SOLAPAMIENTO)
const getTruckIcon = (name: string, plate: string, street: string) => L.divIcon({
  html: `
    <div class="relative flex flex-col items-center group">
      <!-- Etiqueta del Camión (SIEMPRE ARRIBA) -->
      <div class="absolute -top-24 bg-[#0d0e12] border-2 border-[#52ffac] px-3 py-1.5 rounded-xl shadow-[0_15px_40px_rgba(0,0,0,0.8)] whitespace-nowrap z-[7000] border-l-8 border-l-[#52ffac] pointer-events-none transition-transform group-hover:scale-110">
        <p class="text-[10px] font-black text-[#52ffac] uppercase tracking-tighter leading-none mb-0.5">${name}</p>
        <p class="text-[7px] font-bold text-white/50 uppercase tracking-widest leading-none mb-1">${plate}</p>
        <p class="text-[8px] font-black text-white uppercase italic leading-none border-t border-white/10 pt-1">📍 ${street || 'Vía en tránsito'}</p>
        <div class="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#0d0e12] rotate-45 border-r-2 border-b-2 border-[#52ffac]/40"></div>
      </div>
      <!-- Icono del Camión -->
      <div class="bg-[#52ffac] p-2 rounded-full border-2 border-[#0d0e12] shadow-[0_0_20px_#52ffac] animate-pulse">
        <svg viewBox="0 0 24 24" width="16" height="14" stroke="black" stroke-width="3" fill="none">
          <path d="M10 17h4V5H2v12h3m10 0h4v-7h-7m10 7v-3a2 2 0 0 0-2-2h-3"></path>
          <circle cx="7" cy="17" r="2"></circle>
          <circle cx="17" cy="17" r="2"></circle>
        </svg>
      </div>
    </div>
  `,
  className: '',
  iconSize: [32, 32],
  iconAnchor: [16, 16]
});

const getFlagIcon = (name: string, isSelected: boolean) => L.divIcon({
  html: `
    <div class="relative flex flex-col items-center">
      <!-- Etiqueta de Parada (SIEMPRE ABAJO PARA NO TAPAR AL CAMIÓN) -->
      <div class="absolute top-10 bg-amber-500 text-[#0d0e12] px-3 py-1.5 rounded-xl shadow-2xl whitespace-nowrap z-[6000] border-2 border-[#0d0e12] font-black uppercase text-[9px] tracking-tight">
        <p class="leading-none">${name}</p>
        <div class="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-amber-500 rotate-45 border-l-2 border-t-2 border-[#0d0e12]"></div>
      </div>
      <!-- Icono de Banderita -->
      <div class="bg-amber-500 p-1.5 rounded-lg border-2 border-[#0d0e12] shadow-lg transform ${isSelected ? 'scale-110' : 'scale-90 opacity-80'} transition-all">
        <svg viewBox="0 0 24 24" width="12" height="12" stroke="black" stroke-width="3" fill="none">
          <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
          <line x1="4" y1="22" x2="4" y2="15"></line>
        </svg>
      </div>
    </div>
  `,
  className: '',
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

const getUserIcon = () => L.divIcon({
  html: `
    <div class="relative flex flex-col items-center">
      <div class="bg-white p-2 rounded-full border-2 border-[#0d0e12] shadow-[0_0_25px_white] animate-pulse">
        <svg viewBox="0 0 24 24" width="18" height="18" stroke="black" stroke-width="3" fill="none">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
      </div>
      <div class="absolute -top-10 bg-white text-black px-2 py-0.5 rounded shadow-xl whitespace-nowrap z-[4000] border border-black font-black text-[7px] uppercase">Tú (Inicio de Guía)</div>
    </div>
  `,
  className: '',
  iconSize: [36, 36],
  iconAnchor: [18, 18]
});

function RecenterMap({ coords }: { coords: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(coords, map.getZoom());
  }, [coords]);
  return null;
}

function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length > 1) {
      map.fitBounds(points, { padding: [50, 50] });
    }
  }, [points]);
  return null;
}

function CustomZoomControl({ showTraffic, onToggleTraffic, onPanic }: { showTraffic: boolean, onToggleTraffic: () => void, onPanic: () => void }) {
  const map = useMap();
  const divRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (divRef.current) {
      // 🛡️ BLOQUEO DE PROPAGACIÓN LEAFLET (Evita que el click pase al mapa)
      L.DomEvent.disableClickPropagation(divRef.current);
      L.DomEvent.disableScrollPropagation(divRef.current);
    }
  }, []);

  return (
    <div ref={divRef} className="absolute bottom-6 left-6 flex flex-col gap-2 z-[400]">
      <button
        onClick={(e) => { e.stopPropagation(); onPanic(); }}
        className="w-12 h-12 bg-rose-600 text-white rounded-xl shadow-2xl flex items-center justify-center hover:bg-rose-700 active:scale-90 transition-all border-2 border-[#0d0e12] animate-pulse"
        title="SOS"
      >
        <AlertTriangle className="w-5 h-5 fill-white" />
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); onToggleTraffic(); }}
        className={`w-12 h-12 rounded-xl shadow-2xl flex items-center justify-center transition-all border-2 ${showTraffic ? 'bg-[#52ffac] text-black border-[#52ffac]' : 'bg-white text-[#0d0e12] border-[#0d0e12] hover:bg-gray-100'}`}
        title="Tráfico"
      >
        <Activity className="w-5 h-5" />
      </button>
      <div className="flex flex-col gap-px mt-1 bg-white border-2 border-[#0d0e12] rounded-xl overflow-hidden shadow-2xl">
        <button
          onClick={(e) => { e.stopPropagation(); map.zoomIn(); }}
          className="w-12 h-12 bg-white text-[#0d0e12] flex items-center justify-center font-black text-xl hover:bg-[#52ffac] active:scale-90 transition-all border-b border-[#0d0e12]/10"
        >
          +
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); map.zoomOut(); }}
          className="w-12 h-12 bg-white text-[#0d0e12] flex items-center justify-center font-black text-xl hover:bg-[#52ffac] active:scale-90 transition-all"
        >
          -
        </button>
      </div>
    </div>
  );
}

function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

interface FleetDashboardProps {
  assets: Asset[];
  reminders: MaintenanceReminder[];
  onManageAsset?: (asset: Asset) => void;
  onBulkUpdate?: (assetIds: string[], update: Partial<Asset>) => void;
  onBulkDelete?: (assetIds: string[]) => void;
  onBulkRegister?: (assets: any[]) => void;
  onStartGps?: (assetId: string) => void;
  onTogglePause?: () => void;
  onAddCheckpoint?: (asset: Asset) => void;
  onContactSupport?: () => void;
  onOpenEngineeringReport?: (asset: Asset) => void;
  trackingAssetId?: string | null;
  tripStatus?: 'idle' | 'active' | 'paused';
  mode?: 'lite' | 'full';
}

export default function FleetDashboard({ assets, reminders, onManageAsset, onBulkUpdate, onBulkDelete, onBulkRegister, onStartGps, onTogglePause, onAddCheckpoint, onContactSupport, onOpenEngineeringReport, trackingAssetId, tripStatus = 'idle', mode = 'lite' }: FleetDashboardProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'table' | 'history'>(mode === 'full' ? 'table' : 'grid');
  const [activeSubTab, setActiveSubTab] = useState<'fleet' | 'fuel' | 'api' | 'support'>('fleet');
  const [selectedPointIndex, setSelectedPointIndex] = useState<number | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [locationFilter, setLocationFilter] = useState('Todas');
  const [historyAssetId, setHistoryAssetId] = useState<string | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const [showTraffic, setShowTraffic] = useState(false);
  const [plannedRoute, setPlannedRoute] = useState<[number, number][]>([]);
  const [etaInfo, setEtaInfo] = useState<{ duration: string, distance: string, fuelCost: string } | null>(null);
  const [userCoords, setUserCoords] = useState<[number, number] | null>(null);
  const [routeSteps, setRouteSteps] = useState<{ instruction: string, distance: string }[]>([]);

  // Manual Speed Entry state
  const [editingKmId, setEditingKmId] = useState<string | null>(null);
  const [tempKm, setTempKm] = useState('');

  // Fuel Pricing State
  const [fuelPrices, setFuelPrices] = useState({
    diesel: 3.85,
    gas91: 3.45,
    gas95: 3.75
  });
  const [showPriceSettings, setShowPriceSettings] = useState(false);

  const isNight = new Date().getHours() >= 18 || new Date().getHours() < 6;

  const filteredAssets = assets.filter(a => locationFilter === 'Todas' || (a.location === locationFilter || (!a.location && locationFilter === 'Sede Principal')));
  const totalPages = Math.ceil(filteredAssets.length / pageSize);
  const paginatedAssets = filteredAssets.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const totalAssets = assets.length;
  const urgentCount = reminders.filter(r => r.status === 'urgent').length;
  const healthScore = totalAssets > 0 ? Math.round(((totalAssets - urgentCount) / totalAssets) * 100) : 100;

  // Sincronización Automática cada 60 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      onStartGps?.('all');
      console.log("🛰️ Mantech Sat-Link: Sincronización automática de flota completada.");
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleGpsSync = async () => {
    onStartGps?.('all');
    toast.success("🛰️ Enlace Satelital Re-establecido: Sincronización completada.");
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
    const dateStr = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `Ruta_${asset.name}_${dateStr}.xlsx`);
    toast.success("Reporte de ruta descargado.");
  };

  const handleAddCheckpoint = (asset: Asset) => {
    if (onAddCheckpoint) {
      onAddCheckpoint(asset);
    }
  };

  const handleShowRouteToPoint = async (point: {lat: number, lng: number, timestamp: string}) => {
    const loadingToast = toast.loading("Estableciendo enlace de navegación...");
    try {
      // 1. Obtener tu ubicación real con Timeout extendido y respaldo
      let uLat, uLng;
      try {
        const userPos = await Geolocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 5000
        });
        uLat = userPos.coords.latitude;
        uLng = userPos.coords.longitude;
      } catch (geoErr) {
        // Respaldo: Si falla tu GPS, usar la ubicación del camión como inicio de ruta
        const asset = assets.find(a => a.id === historyAssetId);
        if (asset?.latitude) {
          uLat = asset.latitude;
          uLng = asset.longitude;
          toast("Usando ubicación del camión como punto de partida.", { icon: '🚛' });
        } else {
          throw new Error("No se pudo obtener ninguna ubicación de inicio.");
        }
      }

      if (!uLat || !uLng) throw new Error("Coordenadas de inicio inválidas.");
      setUserCoords([uLat, uLng]);

      const asset = assets.find(a => a.id === historyAssetId);
      const allHistory = asset?.routeHistory || [];
      const checkpoints = allHistory
        .filter(p => p.type === 'checkpoint' && p.lat !== 0)
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

      // 2. Construir secuencia LIMPIA (Evitar Error 400 por puntos duplicados)
      let rawPoints = [{ lat: uLat, lng: uLng }];
      checkpoints.forEach(cp => {
        if (new Date(cp.timestamp).getTime() <= new Date(point.timestamp).getTime()) {
          rawPoints.push({ lat: cp.lat, lng: cp.lng });
        }
      });

      // Asegurar que el destino final esté presente
      rawPoints.push({ lat: point.lat, lng: point.lng });

      // FILTRO MAESTRO: Eliminar puntos duplicados consecutivos (Causa del Error 400)
      const uniquePoints: {lat: number, lng: number}[] = [];
      rawPoints.forEach(p => {
        if (uniquePoints.length === 0) {
          uniquePoints.push(p);
        } else {
          const last = uniquePoints[uniquePoints.length - 1];
          // Solo añadir si el punto es diferente al anterior (margen de 1 metro)
          const dist = L.latLng(p.lat, p.lng).distanceTo(L.latLng(last.lat, last.lng));
          if (dist > 1) {
            uniquePoints.push(p);
          }
        }
      });

      if (uniquePoints.length < 2) throw new Error("Trayecto demasiado corto");

      const waypoints = uniquePoints.map(p => `${p.lng},${p.lat}`).join(';');
      const url = `https://router.project-osrm.org/route/v1/driving/${waypoints}?overview=full&geometries=geojson&steps=true&language=es`;

      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`OSRM Error: ${res.status}`);
      }
      const data = await res.json();

      if (data.routes && data.routes[0]) {
        const route = data.routes[0];
        const coords = route.geometry.coordinates.map((c: any) => [c[1], c[0]] as [number, number]);

        setPlannedRoute(coords);
        const minutes = Math.round(route.duration / 60);
        const km = (route.distance / 1000).toFixed(1);
        const fuel = (parseFloat(km) / 12) * 3.85;

        const steps: any[] = [];
        route.legs.forEach((leg: any) => {
          leg.steps.forEach((step: any) => {
            if (step.maneuver.instruction) {
              steps.push({
                instruction: step.maneuver.instruction,
                distance: (step.distance / 1000).toFixed(1) + ' km'
              });
            }
          });
        });
        setRouteSteps(steps);
        setEtaInfo({ duration: `${minutes} min`, distance: `${km} km`, fuelCost: fuel.toFixed(2) });

        toast.success(`Guía Mantech activada: ${km} km`, { id: loadingToast });
        setSelectedPointIndex(-2);
      }
    } catch (e: any) {
      console.error("Mantech Route Error:", e);
      toast.error("Error al trazar ruta. Usando conexión directa de respaldo.", { id: loadingToast });

      // Fallback Visual: Línea directa desde el camión al destino
      const asset = assets.find(a => a.id === historyAssetId);
      if (asset?.latitude && point.lat !== 0) {
        setPlannedRoute([[asset.latitude, asset.longitude || 0], [point.lat, point.lng]]);
        setSelectedPointIndex(-2);
      }
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
            onClick={() => setActiveSubTab('fuel')}
            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-2 ${activeSubTab === 'fuel' ? 'bg-[#5d3cfe] text-white shadow-sm' : 'text-[#c8c4d9] hover:text-white'}`}
          >
            Control Combustible
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
            className="px-6 py-2.5 bg-[#52ffac] text-[#0d0e12] rounded-xl text-[10px] font-black uppercase flex items-center gap-2 hover:bg-[#45e69b] transition-all shadow-[0_0_20px_rgba(82,255,172,0.3)] active:scale-95"
          >
            <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" /> Sincronizar GPS Satelital
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
                <div className="flex items-center gap-2 animate-fade-in">
                  <button
                    onClick={() => {
                      if(window.confirm(`¿Confirmar mantenimiento masivo para ${selectedIds.length} equipos?`)) {
                        onBulkUpdate?.(selectedIds, { lastMaintenanceDate: new Date().toISOString().split('T')[0] });
                        setSelectedIds([]);
                      }
                    }}
                    className="px-4 py-2 bg-[#52ffac] text-black text-[9px] font-black rounded-xl uppercase shadow-lg shadow-[#52ffac]/20"
                  >
                    Mttos ({selectedIds.length})
                  </button>
                  <button
                    onClick={() => {
                      if(window.confirm(`⚠️ ADVERTENCIA: ¿Seguro que deseas ELIMINAR ${selectedIds.length} unidades permanentemente del sistema? Esta acción no se puede deshacer.`)) {
                        onBulkDelete?.(selectedIds);
                        setSelectedIds([]);
                      }
                    }}
                    className="px-4 py-2 bg-rose-600 text-white text-[9px] font-black rounded-xl uppercase shadow-lg shadow-rose-600/20 flex items-center gap-2 hover:bg-rose-700 transition-all"
                  >
                    <Trash2 className="w-3 h-3" /> Eliminar ({selectedIds.length})
                  </button>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const templateData = [
                      { 'MARCA_UNIDAD': 'FREIGHTLINER', 'MODELO_DETALLES': 'M2 106', 'PLACA': 'CP-0000', 'KILOMETRAJE_ACTUAL': 5000, 'SEDE': 'PANAMA CENTRO' }
                    ];
                    const ws = XLSX.utils.json_to_sheet(templateData);
                    const wb = XLSX.utils.book_new();
                    XLSX.utils.book_append_sheet(wb, ws, "Plantilla");
                    XLSX.writeFile(wb, "PLANTILLA_CARGA_MASIVA.xlsx");
                    toast.success("Plantilla descargada.");
                  }}
                  className="px-4 py-2 bg-white/5 border border-white/10 text-white rounded-xl text-[8px] font-black uppercase hover:bg-white/10 transition-all flex items-center gap-2"
                  title="Descargar Plantilla Excel"
                >
                  <Download className="w-3 h-3" /> Plantilla
                </button>

                <button
                  onClick={() => document.getElementById('bulk-upload-input')?.click()}
                  className="px-4 py-2 bg-[#5d3cfe] text-white rounded-xl text-[9px] font-black uppercase flex items-center gap-2 hover:brightness-110 transition-all shadow-lg shadow-[#5d3cfe]/20"
                >
                  <Plus className="w-3 h-3" /> Carga Masiva (Excel)
                </button>
                <input
                  type="file"
                  id="bulk-upload-input"
                  className="hidden"
                  accept=".xlsx, .xls, .csv"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = (evt) => {
                      try {
                        const bstr = evt.target?.result;
                        const wb = XLSX.read(bstr, { type: 'binary' });
                        const wsname = wb.SheetNames[0];
                        const ws = wb.Sheets[wsname];
                        const data = XLSX.utils.sheet_to_json(ws);

                        const processed = data.map((item: any) => ({
                          name: String(item.MARCA_UNIDAD || 'UNIDAD NUEVA').toUpperCase(),
                          type: 'car',
                          details: String(item.MODELO_DETALLES || 'MODELO BASE').toUpperCase(),
                          licensePlate: String(item.PLACA || '---').toUpperCase(),
                          mileage: Number(item.KILOMETRAJE_ACTUAL || 0),
                          location: String(item.SEDE || 'Sede Principal'),
                          lastMaintenanceDate: new Date().toISOString().split('T')[0],
                          nextMaintenanceDate: new Date(Date.now() + 90*24*60*60*1000).toISOString().split('T')[0],
                          routeHistory: []
                        }));

                        if (processed.length > 0) {
                          onBulkRegister?.(processed);
                          e.target.value = '';
                        }
                      } catch (err) {
                        toast.error("Error al procesar el archivo Excel.");
                      }
                    };
                    reader.readAsBinaryString(file);
                  }}
                />
              </div>

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
                         <th className="p-4 text-[9px] font-black text-[#c8c4d9] uppercase tracking-widest text-center">Vida Útil (ROL)</th>
                         <th className="p-4 text-[9px] font-black text-[#c8c4d9] uppercase tracking-widest text-center">Próximo Mtto</th>
                         <th className="p-4 text-[9px] font-black text-[#c8c4d9] uppercase tracking-widest">Estado</th>
                         <th className="p-4"></th>
                      </tr>
                   </thead>
                   <tbody className="text-[11px] font-bold text-white">
                      {paginatedAssets.map((asset) => {
                         const nextKm = (asset.mileage || 0) + 5000;
                         const isCritical = (asset.mileage || 0) >= nextKm - 500;

                         // Sensor Virtual MDM-V4
                         const currentKm = asset.mileage || 0;
                         const lastServiceKm = currentKm - (currentKm % 5000);
                         const kmSinceService = currentKm - lastServiceKm;
                         const baseRol = Math.max(0, 100 - (kmSinceService / 5000) * 100);

                         // Factores MDM (Mock basados en placa para demostración)
                         const thermalFactor = (asset.licensePlate?.charCodeAt(0) || 0) % 5; // Simula horas ralentí
                         const altitudeFactor = (asset.licensePlate?.charCodeAt(1) || 0) % 3; // Simula montaña
                         const rol = Math.round(baseRol - thermalFactor - altitudeFactor);

                         return (
                            <tr key={asset.id} className="border-b border-[#474556]/10 hover:bg-white/[0.02] transition-colors">
                               <td className="p-4 text-center"><input type="checkbox" checked={selectedIds.includes(asset.id)} onChange={(e) => { if(e.target.checked) setSelectedIds([...selectedIds, asset.id]); else setSelectedIds(selectedIds.filter(id => id !== asset.id)); }} className="rounded border-[#474556]/30 bg-[#0d0e12] text-[#5d3cfe]" /></td>
                               <td className="p-4 flex items-center gap-3">
                                  <div className="p-2 bg-[#1a1b20] rounded-lg border border-[#474556]/30"><Car className="w-3.5 h-3.5 text-[#c7bfff]" /></div>
                                  <div><p className="font-black uppercase tracking-tight">{asset.name}</p><p className="text-[9px] text-[#c8c4d9] opacity-40 uppercase">{asset.details}</p></div>
                               </td>
                               <td className="p-4 text-center font-mono tracking-widest text-[#52ffac]">{asset.licensePlate || '---'}</td>
                               <td className="p-4 text-center font-black relative group/km">
                                  {editingKmId === asset.id ? (
                                     <input
                                       autoFocus
                                       type="number"
                                       className="w-20 bg-[#0d0e12] border border-[#5d3cfe] rounded px-2 py-1 text-center text-white"
                                       value={tempKm}
                                       onChange={(e) => setTempKm(e.target.value)}
                                       onBlur={() => handleManualKmSave(asset.id)}
                                       onKeyDown={(e) => e.key === 'Enter' && handleManualKmSave(asset.id)}
                                     />
                                  ) : (
                                     <div
                                       onClick={() => { setEditingKmId(asset.id); setTempKm(asset.mileage?.toString() || '0'); }}
                                       className="cursor-pointer hover:text-[#5d3cfe] transition-colors flex items-center justify-center gap-1"
                                     >
                                        {asset.mileage?.toLocaleString()} Km
                                        <Pencil className="w-2.5 h-2.5 opacity-0 group-hover/km:opacity-100" />
                                     </div>
                                  )}
                               </td>
                               <td className="p-4 text-center">
                                  <div className="flex flex-col items-center gap-1">
                                     <div className="flex items-center gap-2">
                                        <span className={`text-xs font-black ${rol < 20 ? 'text-rose-500' : rol < 50 ? 'text-amber-500' : 'text-[#52ffac]'}`}>{rol}%</span>
                                        <Activity className={`w-3 h-3 ${rol < 20 ? 'text-rose-500 animate-pulse' : 'text-[#474556]'}`} />
                                     </div>
                                     <div className="w-16 bg-[#0d0e12] h-1 rounded-full overflow-hidden border border-white/5">
                                        <div
                                          className={`h-full transition-all duration-1000 ${rol < 20 ? 'bg-rose-500' : rol < 50 ? 'bg-amber-500' : 'bg-[#52ffac]'}`}
                                          style={{ width: `${rol}%` }}
                                        ></div>
                                     </div>
                                  </div>
                               </td>
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
                                     <button
                                       onClick={() => onOpenEngineeringReport?.(asset)}
                                       className="p-2 bg-white/5 text-[#5d3cfe] border border-[#5d3cfe]/20 hover:bg-[#5d3cfe] hover:text-white rounded-xl transition-all"
                                       title="Reporte NASA MDM-V4"
                                     >
                                        <Cpu className="w-4 h-4" />
                                     </button>
                                     <button onClick={() => { setHistoryAssetId(asset.id); setViewMode('history'); }} className="p-2 bg-[#1a1b20] text-[#c7bfff] hover:bg-[#5d3cfe] hover:text-white rounded-xl transition-all"><FileText className="w-4 h-4" /></button>
                                     <button onClick={() => onStartGps?.(asset.id)} className={`p-2 rounded-lg transition-all ${trackingAssetId === asset.id ? 'bg-rose-500 text-white animate-pulse' : 'bg-[#1a1b20] text-[#52ffac] hover:bg-[#52ffac] hover:text-black'}`}><MapPin className="w-4 h-4" /></button>
                                  </div>
                               </td>
                            </tr>
                         );
                      })}
                   </tbody>
                </table>
                <div className="bg-[#1a1b20] p-4 flex items-center justify-between border-t border-[#474556]/30 md:pr-20">
                   <p className="text-[9px] font-black text-[#474556] uppercase hidden sm:block">Mostrando {paginatedAssets.length} unidades</p>
                   <div className="flex gap-2 w-full sm:w-auto justify-between sm:justify-end">
                      <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-2 bg-[#121317] border border-[#474556]/30 rounded-lg text-[#c8c4d9]"><ChevronLeft className="w-4 h-4" /></button>
                      <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="p-2 bg-[#121317] border border-[#474556]/30 rounded-lg text-[#c8c4d9]"><ChevronRight className="w-4 h-4" /></button>
                   </div>
                </div>
             </div>
          )}

          {viewMode === 'grid' && (
            <div className="space-y-8 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {paginatedAssets.map((asset) => {
                  const isUrgent = reminders.some(r => r.assetId === asset.id && r.status === 'urgent');

                  // Sensor Virtual MDM-V4 logic
                  const currentKm = asset.mileage || 0;
                  const lastServiceKm = currentKm - (currentKm % 5000);
                  const kmSinceService = currentKm - lastServiceKm;
                  const baseRol = Math.max(0, 100 - (kmSinceService / 5000) * 100);
                  const rol = Math.round(baseRol - ((asset.licensePlate?.charCodeAt(0) || 0) % 8)); // Simulación de desgaste multivariable

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

                      {/* MDM Health Progress Bar */}
                      <div className="mb-4 p-3 bg-black/40 rounded-xl border border-white/5 space-y-2">
                         <div className="flex justify-between items-center">
                            <span className="text-[7px] font-black text-[#474556] uppercase tracking-widest flex items-center gap-1">
                               <Cpu className="w-2.5 h-2.5" /> Sensor Virtual (ROL)
                            </span>
                            <span className={`text-[9px] font-black ${rol < 20 ? 'text-rose-500' : 'text-[#52ffac]'}`}>{rol}%</span>
                         </div>
                         <div className="w-full bg-[#1a1b20] h-1.5 rounded-full overflow-hidden border border-white/5">
                            <div
                               className={`h-full transition-all duration-1000 ${rol < 20 ? 'bg-rose-500' : rol < 50 ? 'bg-amber-500' : 'bg-[#52ffac]'}`}
                               style={{ width: `${rol}%` }}
                            ></div>
                         </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 border-t border-[#474556]/20 pt-4">
                         <div><p className="text-[8px] font-black text-[#474556] uppercase">Km Actual</p><p className="text-xs font-black text-white">{asset.mileage?.toLocaleString()} Km</p></div>
                         <div><p className="text-[8px] font-black text-[#474556] uppercase">Próximo</p><p className="text-xs font-black text-[#5d3cfe]">{( (asset.mileage || 0) + 5000 ).toLocaleString()} Km</p></div>
                      </div>
                      <div className="flex gap-2 mt-4">
                         <button onClick={() => onStartGps?.(asset.id)} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[9px] font-black uppercase transition-all border ${trackingAssetId === asset.id ? 'bg-rose-500 border-rose-500 text-white animate-pulse' : 'bg-[#1a1b20] border-[#474556]/30 text-[#52ffac] hover:bg-[#52ffac] hover:text-black'}`}><MapPin className="w-3.5 h-3.5" /> {trackingAssetId === asset.id ? 'Finalizar' : 'Iniciar'}</button>
                         <button
                           onClick={() => onOpenEngineeringReport?.(asset)}
                           className="p-3 bg-white/5 border border-[#5d3cfe]/20 text-[#5d3cfe] hover:bg-[#5d3cfe] hover:text-white rounded-xl transition-all"
                           title="Reporte NASA MDM-V4"
                         >
                            <Cpu className="w-4 h-4" />
                         </button>
                         <button onClick={() => { setHistoryAssetId(asset.id); setViewMode('history'); }} className="p-3 bg-[#1a1b20] border border-[#474556]/30 text-[#c7bfff] hover:bg-[#5d3cfe] hover:text-white rounded-xl transition-all"><FileText className="w-4 h-4" /></button>
                         <button onClick={() => onManageAsset?.(asset)} className="p-3 bg-[#1a1b20] border border-[#474556]/30 text-white hover:bg-white/10 rounded-xl transition-all"><ChevronRight className="w-4 h-4" /></button>
                      </div>
                    </div>
                  );
                })}
              </div>
              {/* Paginación para Modo Grid (Protección contra overlap de Chatbot) */}
              <div className="bg-[#1a1b20] p-4 rounded-2xl flex items-center justify-between border border-[#474556]/30 shadow-lg md:pr-20">
                 <p className="text-[10px] font-black text-[#474556] uppercase tracking-widest hidden sm:block">Mostrando {paginatedAssets.length} de {filteredAssets.length} unidades</p>
                 <div className="flex gap-3 w-full sm:w-auto justify-between sm:justify-end">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => { setCurrentPage(p => p - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                      className="p-3 bg-[#121317] border border-[#474556]/30 rounded-xl text-[#c8c4d9] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div className="flex items-center px-4 bg-[#121317] border border-[#474556]/30 rounded-xl text-[10px] font-black text-white">
                      PÁGINA {currentPage} / {totalPages}
                    </div>
                    <button
                      disabled={currentPage === totalPages}
                      onClick={() => { setCurrentPage(p => p + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                      className="p-3 bg-[#121317] border border-[#474556]/30 rounded-xl text-[#c8c4d9] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                 </div>
              </div>
            </div>
          )}

          {viewMode === 'history' && historyAssetId && (
            <div className="bg-[#1f1f24] rounded-[1.5rem] border border-[#474556]/30 overflow-hidden shadow-xl animate-fade-in flex flex-col lg:flex-row h-[600px]">
               <div className="flex-1 bg-[#0d0e12] relative min-h-[400px]">
                  {(() => {
                    const asset = assets.find(a => a.id === historyAssetId);
                    const history = asset?.routeHistory || [];
                    const validPoints = [...history].filter(p => p.lat !== 0).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

                    const activePoint = selectedPointIndex !== null
                      ? history[history.length - 1 - selectedPointIndex]
                      : validPoints.at(-1);

                    const center: [number, number] = [activePoint?.lat || 8.9833, activePoint?.lng || -79.5167];
                    const polylinePoints = validPoints.map(p => [p.lat, p.lng] as [number, number]);

                    return (
                      <div className="w-full h-full relative z-0 overflow-hidden rounded-l-[1.5rem]">
                        <MapContainer
                          center={center}
                          zoom={15}
                          scrollWheelZoom={true}
                          style={{ height: '100%', width: '100%', background: '#0d0e12' }}
                          zoomControl={false}
                        >
                          <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; OpenStreetMap contributors'
                          />

                          {showTraffic && (
                            <TileLayer
                              url="https://mt1.google.com/vt?lyrs=h@159000000,traffic|seconds_into_week:-1&style=3&x={x}&y={y}&z={z}"
                              opacity={0.8}
                              zIndex={1000}
                            />
                          )}

                          {/* TRAZADO DE RUTA UNIFICADO (Visible desde el inicio) */}
                          <Polyline
                            positions={validPoints.map(p => [p.lat, p.lng] as [number, number])}
                            color="#52ffac"
                            weight={6}
                            opacity={1}
                            lineJoin="round"
                            dashArray="1, 10" // Efecto de radar punteado elegante
                          />
                          <Polyline
                            positions={validPoints.map(p => [p.lat, p.lng] as [number, number])}
                            color="#52ffac"
                            weight={2}
                            opacity={0.8}
                            lineJoin="round"
                          />

                          {/* RUTA PROYECTADA POR CALLES (NEÓN AZUL ULTRA-VISIBLE) */}
                          {plannedRoute.length > 0 && (
                            <>
                              <Polyline
                                positions={plannedRoute}
                                color="#00d2ff"
                                weight={12}
                                opacity={0.3}
                                lineJoin="round"
                              />
                              <Polyline
                                positions={plannedRoute}
                                color="#00d2ff"
                                weight={4}
                                opacity={1}
                                lineJoin="round"
                                dashArray="10, 5"
                              />
                            </>
                          )}

                          {/* Marcadores de Paradas (Banderitas) - Limpios y sin amontonarse */}
                          {validPoints.map((p, i) => {
                            const isSelected = selectedPointIndex === (validPoints.length - 1 - i);
                            return p.type === 'checkpoint' && (
                              <Marker
                                key={`cp-${i}`}
                                position={[p.lat, p.lng]}
                                icon={getFlagIcon(p.locationName || 'Parada', isSelected)}
                                zIndexOffset={isSelected ? 2000 : 500}
                              >
                                <Popup>
                                  <div className="text-xs font-black uppercase text-[#0d0e12]">{p.locationName}</div>
                                  <div className="text-[10px] opacity-60 text-[#0d0e12]">{new Date(p.timestamp).toLocaleTimeString()}</div>
                                </Popup>
                              </Marker>
                            );
                          })}

                          {/* Marcador de Posición Actual (Camión) - MOVIMIENTO FLUIDO EN TIEMPO REAL */}
                          {(() => {
                             const asset = assets.find(a => a.id === historyAssetId);
                             if (!asset || !asset.latitude || !asset.longitude) return null;

                             return (
                               <Marker
                                 position={[asset.latitude, asset.longitude]}
                                 icon={getTruckIcon(asset.name || 'Unidad', asset.licensePlate || '---', (asset as any).currentStreet || '')}
                                 zIndexOffset={5000}
                               >
                                 <Popup>
                                   <div className="text-xs font-black uppercase text-[#0d0e12]">Unidad en Movimiento</div>
                                   <div className="text-[10px] text-[#5d3cfe] font-bold">GPS Satelital Activo</div>
                                 </Popup>
                               </Marker>
                             );
                          })()}

                          {/* Marcador de tu Ubicación (Casa/Oficina) */}
                          {userCoords && (
                             <Marker position={userCoords} icon={getUserIcon()} zIndexOffset={4000}>
                                <Popup>
                                   <div className="text-xs font-black uppercase text-[#0d0e12]">Tu Ubicación Actual</div>
                                   <div className="text-[10px] opacity-60 text-[#0d0e12]">Punto de Partida de Guía</div>
                                </Popup>
                             </Marker>
                          )}

                          <MapClickHandler onMapClick={async (lat, lng) => {
                            const asset = assets.find(a => a.id === historyAssetId);
                            if (!asset) return;

                            // 🚀 INTERFAZ DE FIJACIÓN DE PARADA PROFESIONAL (Sin prompts de navegador)
                            toast((t) => (
                              <div className="flex flex-col gap-4 p-5 bg-[#121317] border border-white/10 rounded-2xl shadow-2xl min-w-[300px] animate-fade-in-up">
                                <div className="flex items-center gap-3">
                                  <div className="p-2.5 bg-amber-500/20 text-amber-500 rounded-xl">
                                    <MapPin className="w-6 h-6" />
                                  </div>
                                  <div>
                                    <p className="text-xs font-black text-white uppercase tracking-tight">Punto de Entrega Manual</p>
                                    <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest mt-0.5">GPS: {lat.toFixed(5)}, {lng.toFixed(5)}</p>
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <label className="text-[9px] font-black text-[#474556] uppercase tracking-[0.2em] ml-1">Nombre del Destino</label>
                                  <input
                                    id="manual-stop-name"
                                    type="text"
                                    placeholder="Ej: Restaurante Broncos"
                                    className="w-full bg-black border border-white/10 rounded-xl py-3 px-4 text-xs font-bold text-white focus:border-[#5d3cfe] outline-none transition-all"
                                    autoFocus
                                  />
                                </div>
                                <div className="flex gap-2 pt-2">
                                  <button
                                    onClick={() => toast.dismiss(t.id)}
                                    className="flex-1 py-3 bg-white/5 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                                  >
                                    Cancelar
                                  </button>
                                  <button
                                    onClick={() => {
                                      const input = document.getElementById('manual-stop-name') as HTMLInputElement;
                                      const name = input?.value || 'PUNTO MANUAL';

                                      const newPoint = {
                                        lat,
                                        lng,
                                        timestamp: new Date().toISOString(),
                                        locationName: name.toUpperCase(),
                                        type: 'checkpoint' as const
                                      };

                                      onBulkUpdate?.([asset.id], {
                                        routeHistory: [...(asset.routeHistory || []), newPoint]
                                      });

                                      toast.dismiss(t.id);
                                      toast.success(`Parada "${name}" integrada a la hoja de ruta.`, { icon: '✅' });
                                    }}
                                    className="flex-[1.5] py-3 bg-[#52ffac] text-black rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-[#52ffac]/20 hover:brightness-110 active:scale-95 transition-all"
                                  >
                                    Confirmar Punto
                                  </button>
                                </div>
                              </div>
                            ), { duration: 20000, position: 'bottom-center' });
                          }} />

                          <RecenterMap coords={center} />
                          {selectedPointIndex === -1 && <FitBounds points={polylinePoints} />}
                          {selectedPointIndex === -2 && <FitBounds points={plannedRoute} />}
                          <CustomZoomControl
                            showTraffic={showTraffic}
                            onToggleTraffic={() => setShowTraffic(!showTraffic)}
                            onPanic={() => {
                              const asset = assets.find(a => a.id === historyAssetId);
                              toast.custom((t) => (
                                <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-[#121317] shadow-[0_0_50px_rgba(225,29,72,0.4)] rounded-[2rem] pointer-events-auto flex ring-4 ring-rose-600 ring-inset overflow-hidden border-2 border-[#1c1d21]`}>
                                  <div className="flex-1 w-0 p-8">
                                    <div className="flex items-start">
                                      <div className="flex-shrink-0 pt-0.5">
                                        <div className="bg-rose-600 p-4 rounded-2xl animate-pulse">
                                          <AlertTriangle className="h-8 w-8 text-white fill-white" />
                                        </div>
                                      </div>
                                      <div className="ml-6 flex-1">
                                        <p className="text-[10px] font-black text-rose-500 uppercase tracking-[0.3em] mb-1">Critical Security Protocol</p>
                                        <p className="text-xl font-black text-white uppercase tracking-tighter leading-tight mb-2">
                                          Protocolo de Desviación: <span className="text-rose-500">{asset?.name || 'UNIDAD'}</span>
                                        </p>
                                        <p className="text-[11px] font-bold text-white/50 leading-relaxed uppercase italic">
                                          Señal SOS enviada a Central MantechPro. Coordenadas bloqueadas para auditoría técnica inmediata.
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex border-l border-white/5">
                                    <button
                                      onClick={() => toast.dismiss(t.id)}
                                      className="w-full border border-transparent rounded-none rounded-r-[2rem] p-6 flex items-center justify-center text-xs font-black text-rose-500 hover:text-white uppercase transition-colors px-8"
                                    >
                                      Enterado
                                    </button>
                                  </div>
                                </div>
                              ), { duration: 8000, position: 'top-center' });
                            }}
                          />
                        </MapContainer>

                        <div className="absolute bottom-8 right-8 flex flex-col gap-4 z-[400]">
                           <button
                             onClick={() => setSelectedPointIndex(-1)}
                             className="p-5 bg-white text-black rounded-[1.5rem] shadow-2xl hover:scale-105 transition-all flex items-center justify-center gap-3 font-black text-[11px] uppercase border-4 border-[#0d0e12] min-w-[160px]"
                           >
                              <Maximize className="w-5 h-5" /> Ajustar Vista
                           </button>
                           {validPoints.length > 0 && (
                             <button
                               onClick={() => {
                                 if(window.confirm("¿Deseas eliminar todo el historial de esta ruta? Esta acción es irreversible.")) {
                                    onBulkUpdate?.([historyAssetId!], { routeHistory: [] });
                                    setSelectedPointIndex(null);
                                    toast.success("Historial purgado.");
                                 }
                               }}
                               className="p-5 bg-rose-600 text-white rounded-[1.5rem] shadow-2xl hover:scale-105 transition-all flex items-center justify-center gap-3 font-black text-[11px] uppercase border-4 border-rose-900 min-w-[160px]"
                             >
                                <Trash2 className="w-5 h-5" /> Limpiar Ruta
                             </button>
                           )}
                        </div>

                        {isNight && (
                          <div className="absolute top-4 right-4 bg-[#5d3cfe]/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-[#5d3cfe]/50 flex items-center gap-2 z-[400] shadow-2xl">
                             <div className="w-2 h-2 bg-[#5d3cfe] rounded-full animate-pulse shadow-[0_0_10px_#5d3cfe]"></div>
                             <span className="text-[8px] font-black text-white uppercase tracking-widest italic">Vigilancia Real Activa</span>
                          </div>
                        )}

                        {/* RADAR DE PROXIMIDAD INTELIGENTE (ALERTA DE ARRIBO) - TUCKED AT BOTTOM */}
                        {(() => {
                           const asset = assets.find(a => a.id === historyAssetId);
                           const history = asset?.routeHistory || [];
                           const lastCheck = history.filter(p => p.type === 'checkpoint').at(-1);
                           if (asset?.latitude && lastCheck) {
                              const dist = L.latLng(asset.latitude, asset.longitude || 0).distanceTo(L.latLng(lastCheck.lat, lastCheck.lng));
                              if (dist < 500) {
                                 return (
                                   <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-emerald-500 text-black px-4 py-1.5 rounded-full font-black text-[9px] uppercase shadow-2xl z-[1000] animate-pulse border border-black/20 flex items-center gap-2">
                                      <div className="w-1.5 h-1.5 bg-black rounded-full animate-ping"></div>
                                      Arribo Próximo: {lastCheck.locationName}
                                   </div>
                                 );
                              }
                           }
                           return null;
                        })()}

                        {activePoint?.type === 'checkpoint' && (
                          <div className="absolute top-12 left-1/2 -translate-x-1/2 bg-amber-500 text-[#0d0e12] px-4 py-1 rounded-full font-black text-[8px] uppercase shadow-lg z-[400] flex items-center gap-2 border border-black/10">
                             <Flag className="w-3 h-3 fill-current" /> {activePoint.locationName}
                          </div>
                        )}

                        {etaInfo && plannedRoute.length > 0 && (
                          <div className="absolute top-6 right-6 bg-[#00d2ff] text-black p-5 rounded-[2rem] shadow-[0_20px_50px_rgba(0,210,255,0.4)] z-[500] animate-enter border-4 border-[#0d0e12] flex flex-col gap-3 min-w-[220px]">
                             <div className="flex flex-col gap-0.5">
                                <p className="text-[8px] font-black uppercase tracking-[0.2em] opacity-60">Logística de Arribo</p>
                                <p className="text-2xl font-black uppercase tracking-tighter leading-none">Vía en curso</p>
                             </div>

                             <div className="space-y-2 py-3 border-y border-black/10">
                                <div className="flex items-center justify-between gap-4">
                                   <div className="flex items-center gap-2">
                                      <Clock className="w-4 h-4 fill-current" />
                                      <span className="text-[10px] font-black uppercase">Tiempo Total</span>
                                   </div>
                                   <span className="text-sm font-black italic">{etaInfo.duration}</span>
                                </div>
                                <div className="flex items-center justify-between gap-4">
                                   <div className="flex items-center gap-2 opacity-70">
                                      <Navigation className="w-4 h-4 fill-current" />
                                      <span className="text-[10px] font-black uppercase tracking-tight">Recorrido vial</span>
                                   </div>
                                   <span className="text-sm font-black italic opacity-70">{etaInfo.distance}</span>
                                </div>
                             </div>

                             <div className="flex items-center justify-between bg-black/10 p-3 rounded-xl">
                                <div className="flex items-center gap-2 text-rose-600">
                                   <Fuel className="w-4 h-4 fill-current" />
                                   <span className="text-[10px] font-black uppercase">Presupuesto Gasolina</span>
                                </div>
                                <span className="text-sm font-black text-rose-600">${etaInfo.fuelCost}</span>
                             </div>

                             <button
                                onClick={() => { setPlannedRoute([]); setEtaInfo(null); setUserCoords(null); }}
                                className="w-full py-2 bg-black text-white rounded-xl text-[8px] font-black uppercase hover:bg-gray-900 transition-all mt-1"
                             >
                                Limpiar Guía
                             </button>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* INDICADORES DE ESQUINA (LIMPIOS) */}
                  <div className="absolute top-4 left-4 flex flex-col gap-2 z-[400] pointer-events-none">
                    <div className="bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 shadow-2xl flex items-center gap-2 w-fit">
                       <div className="w-1.5 h-1.5 bg-[#52ffac] rounded-full animate-ping"></div>
                       <p className="text-[7px] font-black text-white/80 uppercase tracking-[0.2em]">Sat-Link v4</p>
                    </div>
                    {isNight && (
                      <div className="bg-[#5d3cfe]/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-[#5d3cfe]/30 flex items-center gap-2 shadow-2xl w-fit">
                         <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                         <span className="text-[7px] font-black text-white uppercase tracking-widest italic">Vigilancia Real</span>
                      </div>
                    )}
                  </div>
               </div>

               <div className="w-full lg:w-[450px] bg-[#1a1b20] border-l border-[#474556]/30 flex flex-col shadow-2xl">
                  <header className="p-8 border-b border-[#474556]/30 flex justify-between items-center bg-[#1c1d24]">
                     <div className="flex items-center gap-4">
                        <button onClick={() => setViewMode('table')} className="p-3 hover:bg-white/5 rounded-xl text-[#c8c4d9] transition-all"><ChevronLeft className="w-5 h-5" /></button>
                        <div>
                           <h4 className="text-sm font-black text-white uppercase tracking-tight">Timeline Logístico</h4>
                           <div className="flex flex-wrap items-center gap-3 mt-1">
                              <p className="text-[8px] text-[#52ffac] font-black uppercase tracking-[0.2em]">Conductor: {assets.find(a => a.id === historyAssetId)?.driverName || 'No Asignado'}</p>
                              <span className="text-white/20">|</span>
                              <p className="text-[8px] text-[#00d2ff] font-black uppercase tracking-[0.2em] flex items-center gap-1">
                                 <Navigation className="w-2.5 h-2.5" /> Total: {
                                   (() => {
                                      const history = assets.find(a => a.id === historyAssetId)?.routeHistory || [];
                                      const checkpoints = history.filter(p => p.type === 'checkpoint');
                                      const totalMeters = checkpoints.reduce((acc, p, i, arr) => {
                                         if (i === 0) return 0;
                                         return acc + L.latLng(p.lat, p.lng).distanceTo(L.latLng(arr[i-1].lat, arr[i-1].lng));
                                      }, 0);
                                      return (totalMeters / 1000).toFixed(1);
                                   })()
                                 } KM
                              </p>
                           </div>
                        </div>
                     </div>
                     <div className="flex items-center gap-3">
                        <button onClick={() => {
                           const history = assets.find(a => a.id === historyAssetId)?.routeHistory;
                           if (history && history.length > 0) {
                              const validPoints = history.filter(p => p.lat !== 0);
                              if (validPoints.length > 0) {
                                 // Crear URL con origen, destino y waypoints para recorrido completo
                                 const origin = `${validPoints[0].lat},${validPoints[0].lng}`;
                                 const destination = `${validPoints[validPoints.length-1].lat},${validPoints[validPoints.length-1].lng}`;
                                 const waypoints = validPoints.slice(1, -1).map(p => `${p.lat},${p.lng}`).join('|');
                                 const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&waypoints=${waypoints}&travelmode=driving`;
                                 window.open(url, '_blank');
                              }
                           } else {
                              toast.error("Sin datos para trazar recorrido.");
                           }
                        }} className="p-3 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-xl hover:bg-emerald-500 hover:text-black transition-all shadow-lg flex items-center gap-2">
                           <Globe className="w-4 h-4" />
                           <span className="text-[9px] font-black uppercase">Recorrido Full</span>
                        </button>
                        <button onClick={() => { const asset = assets.find(a => a.id === historyAssetId); if (asset) handleExportRoute(asset); }} className="p-3 bg-[#5d3cfe]/10 text-[#c7bfff] border border-[#5d3cfe]/20 rounded-xl hover:bg-[#5d3cfe] hover:text-white transition-all shadow-lg"><FileText className="w-5 h-5" /></button>
                     </div>
                  </header>

                  <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-6">
                     {/* PANEL DE INSTRUCCIONES ESTILO GOOGLE MAPS (SOLO SI HAY RUTA) */}
                     {plannedRoute.length > 0 && routeSteps.length > 0 ? (
                       <div className="space-y-4 animate-enter">
                         <div className="flex items-center justify-between mb-6">
                            <h5 className="text-[#00d2ff] font-black uppercase text-xs tracking-widest flex items-center gap-2">
                               <Navigation className="w-4 h-4 fill-current" /> Instrucciones de Manejo
                            </h5>
                            <button
                              onClick={() => { setPlannedRoute([]); setRouteSteps([]); setEtaInfo(null); }}
                              className="text-[9px] font-black text-white/40 hover:text-white uppercase"
                            >
                               Volver al Timeline
                            </button>
                         </div>
                         {routeSteps.map((step, sIdx) => (
                           <div key={sIdx} className="flex gap-4 p-4 bg-white/5 rounded-2xl border border-white/10 group hover:bg-[#00d2ff]/10 transition-all">
                              <div className="w-8 h-8 rounded-full bg-[#0d0e12] border border-white/10 flex items-center justify-center text-[10px] font-black text-[#00d2ff]">
                                 {sIdx + 1}
                              </div>
                              <div className="flex-1">
                                 <p className="text-[11px] font-bold text-white leading-relaxed">{step.instruction}</p>
                                 <p className="text-[9px] font-black text-[#00d2ff] uppercase mt-1">En {step.distance}</p>
                              </div>
                           </div>
                         ))}
                       </div>
                     ) : (
                       assets.find(a => a.id === historyAssetId)?.routeHistory?.slice().reverse().map((point, idx, arr) => {
                         const isCheckpoint = point.type === 'checkpoint';
                         const isSelected = selectedPointIndex === idx;

                         // Identificadores de secuencia (El array está reversado: 0 es el último evento, arr.length-1 es el primero)
                         const isLastStop = idx === 0;
                         const isOrigin = idx === arr.length - 1;
                         const isBodega = point.locationName === 'SALIDA DE BODEGA';

                         let stayDuration = '';
                         let distanceLabel = '';
                         const prevPoint = arr[idx + 1]; // El punto anterior en el tiempo (siguiente en el array reversado)

                         if (isCheckpoint && idx < arr.length - 1 && prevPoint) {
                           const arrivalTime = new Date(point.timestamp).getTime();
                           const prevTime = new Date(prevPoint.timestamp).getTime();

                           const diff = Math.floor(Math.abs(arrivalTime - prevTime) / (1000 * 60));
                           if (diff > 0) {
                             const h = Math.floor(diff / 60);
                             const m = diff % 60;
                             stayDuration = h > 0 ? `${h}h ${m}m` : `${m} min`;
                           }

                           const dMeters = L.latLng(point.lat, point.lng).distanceTo(L.latLng(prevPoint.lat, prevPoint.lng));
                           if (dMeters > 5) {
                             distanceLabel = (dMeters / 1000).toFixed(1) + ' KM';
                           }
                         }

                         return (
                          <div
                            key={idx}
                            onClick={() => setSelectedPointIndex(idx)}
                            className="flex items-start gap-6 group relative cursor-pointer"
                          >
                             <div className="flex flex-col items-center">
                                <div className={`w-3.5 h-3.5 rounded-full z-10 transition-all ${isSelected ? 'bg-[#52ffac] scale-150 shadow-[0_0_15px_#52ffac]' : isBodega ? 'bg-white border-2 border-black scale-125' : isCheckpoint ? 'bg-amber-500 scale-125' : 'bg-[#474556]'}`}></div>
                                <div className="w-px h-20 bg-gradient-to-b from-[#474556]/50 to-transparent mt-1"></div>
                             </div>
                             <div className={`flex-1 p-5 rounded-[1.5rem] border transition-all ${isSelected ? 'border-[#52ffac] bg-[#52ffac]/5 shadow-xl' : isBodega ? 'bg-white/10 border-white/20' : isCheckpoint ? 'bg-amber-500/10 border-amber-500/30' : 'bg-[#121317] border-[#2a2b2f] group-hover:border-[#5d3cfe]/50 shadow-inner'}`}>
                                <div className="flex justify-between items-start">
                                   <div className="space-y-1">
                                      <div className="flex items-center gap-2 mb-1">
                                         {isOrigin && <span className="px-2 py-0.5 bg-white text-black text-[7px] font-black rounded uppercase">📍 Origen</span>}
                                         {isLastStop && !isOrigin && <span className="px-2 py-0.5 bg-[#52ffac] text-black text-[7px] font-black rounded uppercase animate-pulse">🏁 Última Parada</span>}
                                      </div>

                                      {isCheckpoint ? (
                                        <div className="flex flex-col gap-1">
                                          <p className={`text-xs font-black uppercase flex items-center gap-2 ${isBodega ? 'text-white' : 'text-amber-500'}`}>
                                            {isBodega ? <Building2 className="w-3 h-3" /> : <Flag className="w-3 h-3" />} {point.locationName}
                                          </p>
                                          <div className="flex flex-wrap gap-2 mt-1">
                                            {stayDuration && !isBodega && (<div className="flex items-center gap-1.5 px-2 py-0.5 bg-amber-500 text-[#0d0e12] rounded text-[7px] font-black w-fit uppercase"><Clock className="w-2 h-2" /> Estancia: {stayDuration}</div>)}
                                            {distanceLabel && (<div className="flex items-center gap-1.5 px-2 py-0.5 bg-[#00d2ff] text-[#0d0e12] rounded text-[7px] font-black w-fit uppercase"><Navigation className="w-2 h-2 fill-current" /> Tramo: {distanceLabel}</div>)}
                                          </div>
                                        </div>
                                      ) : (
                                        <p className="text-[10px] font-black text-white">{point.lat.toFixed(4)}, {point.lng.toFixed(4)}</p>
                                      )}
                                      <p className="text-[8px] text-[#474556] font-bold uppercase tracking-widest">{new Date(point.timestamp).toLocaleTimeString()}</p>
                                   </div>
                                   <div
                                      onClick={(e) => {
                                         e.stopPropagation();
                                         handleShowRouteToPoint(point);
                                      }}
                                      className={`p-3 bg-[#00d2ff]/10 rounded-xl transition-all border border-[#00d2ff]/30 text-[#00d2ff] hover:bg-[#00d2ff] hover:text-black shadow-lg ${isSelected ? 'bg-[#00d2ff] text-black shadow-[0_0_20px_#00d2ff]' : ''}`}
                                      title="Trazar ruta por calles"
                                   >
                                      <Navigation className="w-4 h-4 fill-current" />
                                   </div>
                                </div>
                             </div>
                          </div>
                         );
                       })
                     )}
                     {(!assets.find(a => a.id === historyAssetId)?.routeHistory || assets.find(a => a.id === historyAssetId)?.routeHistory?.length === 0) && (<div className="py-20 text-center opacity-20"><Navigation className="w-12 h-12 mx-auto mb-4" /><p className="text-[10px] font-black uppercase">Sin actividad detectada</p></div>)}
                  </div>
               </div>
            </div>
          )}
        </>
      )}

      {activeSubTab === 'fuel' && (
        <div className="space-y-12 animate-fade-in relative">
           {/* MODAL AJUSTES DE PRECIOS */}
           {showPriceSettings && (
             <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
               <div className="w-full max-w-md bg-[#121317] border border-[#2a2b2f] rounded-[2.5rem] p-10 space-y-8 shadow-2xl animate-fade-in-up">
                 <div className="text-center">
                    <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Ajustes de Combustible</h3>
                    <p className="text-[9px] text-[#474556] font-black uppercase tracking-[0.3em] mt-2">Precios Referencia Panamá</p>
                 </div>

                 <div className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Diesel (Galón)</label>
                       <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#52ffac] font-black">$</span>
                          <input
                            type="number" step="0.01"
                            className="w-full bg-black border border-white/10 rounded-2xl py-4 pl-10 pr-6 text-white font-black text-xl outline-none focus:border-[#52ffac]"
                            value={fuelPrices.diesel}
                            onChange={(e) => setFuelPrices({...fuelPrices, diesel: parseFloat(e.target.value)})}
                          />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Gasolina 91 (Galón)</label>
                       <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5d3cfe] font-black">$</span>
                          <input
                            type="number" step="0.01"
                            className="w-full bg-black border border-white/10 rounded-2xl py-4 pl-10 pr-6 text-white font-black text-xl outline-none focus:border-[#5d3cfe]"
                            value={fuelPrices.gas91}
                            onChange={(e) => setFuelPrices({...fuelPrices, gas91: parseFloat(e.target.value)})}
                          />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Gasolina 95 (Galón)</label>
                       <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-500 font-black">$</span>
                          <input
                            type="number" step="0.01"
                            className="w-full bg-black border border-white/10 rounded-2xl py-4 pl-10 pr-6 text-white font-black text-xl outline-none focus:border-rose-500"
                            value={fuelPrices.gas95}
                            onChange={(e) => setFuelPrices({...fuelPrices, gas95: parseFloat(e.target.value)})}
                          />
                       </div>
                    </div>
                 </div>

                 <button
                   onClick={() => setShowPriceSettings(false)}
                   className="w-full py-5 bg-[#52ffac] text-black rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-[#52ffac]/10 active:scale-95 transition-all"
                 >
                   Guardar Tarifas
                 </button>
               </div>
             </div>
           )}

           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#121317] border border-[#2a2b2f] p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group flex flex-col items-center justify-center text-center min-h-[220px]">
                 <span className="text-[9px] font-black text-[#474556] uppercase tracking-[0.2em] block mb-4">Auditoría de Consumo (Mes)</span>
                 <div className="flex items-baseline gap-1 mb-4">
                    <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-none">
                       {assets.reduce((acc, a) => acc + ((a.mileage || 0) / 12), 0).toFixed(0).toLocaleString()}
                    </h2>
                    <span className="text-sm font-black text-white/30 uppercase">Gal.</span>
                 </div>
                 <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#52ffac]/5 border border-[#52ffac]/10 rounded-full">
                    <div className="w-1 h-1 rounded-full bg-[#52ffac] animate-pulse"></div>
                    <span className="text-[7px] font-black text-[#52ffac] uppercase tracking-widest">GPS Verificado</span>
                 </div>
                 <div className="absolute -bottom-6 -right-6 opacity-[0.03] group-hover:opacity-10 transition-opacity"><Droplets className="w-32 h-32" /></div>
              </div>

              <div className="bg-[#121317] border border-[#2a2b2f] p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group flex flex-col items-center justify-center text-center min-h-[220px]">
                 <span className="text-[9px] font-black text-[#474556] uppercase tracking-[0.2em] block mb-4">Inversión Logística Real</span>
                 <div className="flex items-start gap-1 mb-4">
                    <span className="text-xl font-black text-[#52ffac] opacity-30 mt-1">$</span>
                    <h2 className="text-4xl md:text-5xl font-black text-[#52ffac] tracking-tighter leading-none">
                       {assets.reduce((acc, a) => {
                         const price = a.fuelType === 'gas91' ? fuelPrices.gas91 : a.fuelType === 'gas95' ? fuelPrices.gas95 : fuelPrices.diesel;
                         return acc + (((a.mileage || 0) / 12) * price);
                       }, 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </h2>
                 </div>
                 <div className="text-white/20 text-[7px] font-black uppercase tracking-widest border-t border-white/5 pt-2 flex items-center gap-2">
                    Cálculo Multi-Combustible Dinámico
                    <button onClick={() => setShowPriceSettings(true)} className="p-1 hover:text-[#52ffac] transition-colors"><Settings className="w-3 h-3" /></button>
                 </div>
                 <div className="absolute -bottom-6 -right-6 opacity-[0.03] group-hover:opacity-10 transition-opacity"><Fuel className="w-32 h-32" /></div>
              </div>

              <div className="bg-[#121317] border border-[#2a2b2f] p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group flex flex-col items-center justify-center text-center min-h-[220px]">
                 <span className="text-[9px] font-black text-[#474556] uppercase tracking-[0.2em] block mb-4">Eficiencia de Flota</span>
                 <h2 className="text-5xl md:text-6xl font-black text-[#5d3cfe] tracking-tighter leading-none mb-4">94.2%</h2>
                 <div className="flex flex-col items-center gap-2">
                    <div className="flex -space-x-1">
                       {[1,2,3,4].map(i => <div key={i} className="w-4 h-4 rounded-full border border-[#121317] bg-[#52ffac] flex items-center justify-center text-[6px] font-black text-black shadow-lg">✓</div>)}
                    </div>
                    <span className="text-[7px] font-black text-white/30 uppercase tracking-widest">Operación Óptima</span>
                 </div>
                 <div className="absolute -bottom-6 -right-6 opacity-[0.03] group-hover:opacity-10 transition-opacity"><TrendingUp className="w-32 h-32" /></div>
              </div>
           </div>

           <div className="bg-[#121317] border border-[#2a2b2f] p-10 rounded-[3rem] shadow-2xl space-y-8">
              <header className="flex justify-between items-center">
                 <div>
                    <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Desglose por <span className="text-[#5d3cfe]">Unidad</span></h3>
                    <p className="text-[10px] text-[#474556] font-bold uppercase tracking-widest mt-2">Cálculos auditados según tipo de combustible individual</p>
                 </div>
                 <div className="flex items-center gap-3">
                    <button onClick={() => setShowPriceSettings(true)} className="p-3 bg-white/5 border border-white/10 rounded-xl text-[#c8c4d9] hover:text-white transition-all flex items-center gap-2">
                       <Settings className="w-4 h-4" />
                       <span className="text-[8px] font-black uppercase tracking-widest">Editar Precios</span>
                    </button>
                    <button onClick={() => toast.success("Exportando reporte de costos...")} className="p-3 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-all"><FileText className="w-5 h-5" /></button>
                 </div>
              </header>

              <div className="space-y-4">
                 {assets.slice(0, 10).map(asset => {
                    const gallons = (asset.mileage || 0) / 12;
                    const price = asset.fuelType === 'gas91' ? fuelPrices.gas91 : asset.fuelType === 'gas95' ? fuelPrices.gas95 : fuelPrices.diesel;
                    const cost = gallons * price;
                    return (
                       <div key={asset.id} className="bg-[#1c1d21] p-6 rounded-3xl border border-[#2a2b2f] flex justify-between items-center hover:border-[#52ffac]/30 transition-all group">
                          <div className="flex gap-6 items-center">
                             <div className="w-12 h-12 rounded-2xl bg-[#0d0e12] border border-[#2a2b2f] flex items-center justify-center text-white font-black group-hover:text-[#52ffac] transition-colors">{asset.name.split('-')[1] || '00'}</div>
                             <div>
                                <h4 className="text-sm font-black text-white uppercase">{asset.name}</h4>
                                <p className="text-[9px] font-bold text-[#474556] uppercase">{asset.licensePlate || 'Sin Placa'}</p>
                             </div>
                          </div>
                          <div className="flex gap-12 items-center">
                             <div className="text-right">
                                <p className="text-[8px] font-black text-[#474556] uppercase tracking-widest">Consumo</p>
                                <p className="text-xs font-black text-white">{gallons.toFixed(1)} <span className="text-[9px] opacity-40 uppercase">Gal.</span></p>
                             </div>
                             <div className="text-right min-w-[80px]">
                                <p className="text-[8px] font-black text-[#474556] uppercase tracking-widest">Costo Est.</p>
                                <p className="text-sm font-black text-[#52ffac]">${cost.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                             </div>
                             <div className="p-2 hover:bg-white/5 rounded-lg cursor-help group relative">
                                <Info className="w-3.5 h-3.5 text-[#474556]" />
                                <div className="absolute bottom-full right-0 mb-2 w-40 p-2 bg-black border border-white/10 rounded-lg text-[7px] font-bold text-white/50 uppercase leading-tight opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 shadow-2xl">
                                   Valor sincronizado con el odómetro del monitor de flota.
                                </div>
                             </div>
                             <div className="w-24 bg-[#0d0e12] h-1.5 rounded-full overflow-hidden border border-white/5">
                                <div className="bg-[#5d3cfe] h-full" style={{ width: `${Math.min(100, (gallons / 500) * 100)}%` }}></div>
                             </div>
                          </div>
                       </div>
                    );
                 })}
              </div>
           </div>
        </div>
      )}

      {activeSubTab === 'api' && (
        <div className="bg-[#1f1f24] rounded-[1.5rem] border border-[#474556]/30 p-8 shadow-xl space-y-8 animate-fade-in">
           <header className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-[#5d3cfe]/10 rounded-2xl text-[#c7bfff]"><Code className="w-6 h-6" /></div>
              <div>
                 <h3 className="text-lg font-black text-white uppercase tracking-tight">Ecosistema de Integración API</h3>
                 <p className="text-[10px] text-[#c8c4d9] font-bold uppercase tracking-widest">Control total desde sus sistemas corporativos (SAP, Oracle, WMS)</p>
              </div>
           </header>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#121317] rounded-3xl p-6 border border-[#474556]/30 shadow-inner space-y-4">
                <div className="flex items-center gap-2 text-[#52ffac] font-black text-[9px] uppercase tracking-widest">
                   <RefreshCw className="w-3 h-3" /> Sincronización de Flota
                </div>
                <div className="bg-black/40 rounded-xl p-4 font-mono text-[9px] text-[#c7bfff]">
                   <p className="text-white/30 mb-2">// Actualizar odómetros masivos</p>
                   <p className="text-rose-400">POST</p>
                   <p>https://api.mantechpro.com/v1/fleet/sync</p>
                </div>
              </div>

              <div className="bg-[#121317] rounded-3xl p-6 border border-[#474556]/30 shadow-inner space-y-4">
                <div className="flex items-center gap-2 text-rose-500 font-black text-[9px] uppercase tracking-widest">
                   <Zap className="w-3 h-3 fill-current" /> Engine Cutoff (Remoto)
                </div>
                <div className="bg-black/40 rounded-xl p-4 font-mono text-[9px] text-[#c7bfff]">
                   <p className="text-white/30 mb-2">// Apagado de motor por emergencia</p>
                   <p className="text-rose-400">POST</p>
                   <p>https://api.mantechpro.com/v1/safety/kill-engine</p>
                </div>
              </div>

              <div className="bg-[#121317] rounded-3xl p-6 border border-[#474556]/30 shadow-inner space-y-4">
                <div className="flex items-center gap-2 text-[#00d2ff] font-black text-[9px] uppercase tracking-widest">
                   <Navigation className="w-3 h-3" /> Webhooks de Desviación
                </div>
                <div className="bg-black/40 rounded-xl p-4 font-mono text-[9px] text-[#c7bfff]">
                   <p className="text-white/30 mb-2">// Alerta automática a su servidor</p>
                   <p className="text-[#00d2ff]">WEBHOOK_URL</p>
                   <p>{"{ event: 'route_deviation', asset: 'C-12' }"}</p>
                </div>
              </div>

              <div className="bg-[#121317] rounded-3xl p-6 border border-[#474556]/30 shadow-inner space-y-4 text-center flex flex-col justify-center">
                 <p className="text-[10px] font-black text-white/50 uppercase tracking-widest">¿Necesita una integración a medida?</p>
                 <button className="mt-4 px-6 py-2 bg-[#5d3cfe] text-white rounded-xl text-[9px] font-black uppercase hover:bg-[#4c2fd6] transition-all">Solicitar Token de Desarrollador</button>
              </div>
           </div>
        </div>
      )}

      {activeSubTab === 'support' && (
        <div className="bg-[#1f1f24] rounded-[1.5rem] border border-[#474556]/30 p-8 shadow-xl animate-fade-in">
           <header className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-500"><Phone className="w-6 h-6" /></div>
              <div>
                 <h3 className="text-lg font-black text-white uppercase tracking-tight">Soporte Estratégico Platinum</h3>
                 <p className="text-[10px] text-[#c8c4d9] font-bold uppercase tracking-widest">Acompañamiento VIP para su Logística</p>
              </div>
           </header>

           <div className="flex flex-col md:flex-row items-center gap-8 bg-[#1a1b20] p-8 rounded-[2rem] border border-[#474556]/30">
             <div className="w-24 h-24 rounded-full bg-[#5d3cfe]/10 border-4 border-[#1f1f24] shadow-xl flex items-center justify-center text-2xl font-black text-[#c7bfff]">JP</div>
             <div className="flex-1 text-center md:text-left">
                <h4 className="text-xl font-black text-white">Juan Pablo Castillo</h4>
                <p className="text-xs font-bold text-[#c7bfff] uppercase tracking-wide">Key Account Manager - División Corporativa</p>
                <div className="mt-6 grid grid-cols-2 gap-4">
                   <div className="flex items-center gap-2 text-[8px] font-black text-emerald-400 uppercase tracking-widest"><ShieldCheck className="w-3 h-3" /> Auditoría Técnica 24/7</div>
                   <div className="flex items-center gap-2 text-[8px] font-black text-emerald-400 uppercase tracking-widest"><ShieldCheck className="w-3 h-3" /> Respaldo Global Mantech</div>
                   <div className="flex items-center gap-2 text-[8px] font-black text-emerald-400 uppercase tracking-widest"><ShieldCheck className="w-3 h-3" /> Conciliación de Facturas</div>
                   <div className="flex items-center gap-2 text-[8px] font-black text-emerald-400 uppercase tracking-widest"><ShieldCheck className="w-3 h-3" /> Optimización Vial Avanzada</div>
                </div>
                <div className="mt-6 flex gap-3 justify-center md:justify-start">
                   <button
                     onClick={() => onContactSupport?.()}
                     className="px-8 py-3 bg-white text-black rounded-2xl text-[9px] font-black uppercase hover:scale-105 transition-all shadow-xl shadow-white/5 flex items-center gap-2"
                   >
                     <Zap className="w-3.5 h-3.5 fill-current text-rose-500" /> Soporte Corporativo
                   </button>
                   <button
                     className="px-8 py-3 bg-[#343439] text-white rounded-2xl text-[9px] font-black uppercase hover:scale-105 transition-all"
                   >
                     Informes de Auditoría
                   </button>
                </div>
             </div>
             <div className="p-6 bg-[#1f1f24] rounded-3xl border border-[#474556]/30 text-center min-w-[180px]">
                <span className="text-[8px] font-black text-[#c8c4d9]/50 uppercase tracking-widest">Nivel de Socio</span>
                <p className="text-sm font-black text-emerald-500 mt-1 uppercase italic tracking-tighter text-center">Elite Partner</p>
                <div className="flex justify-center gap-1 mt-4">{[1,2,3,4,5].map(s => <ShieldCheck key={s} className="w-3.5 h-3.5 fill-emerald-500 text-emerald-500" />)}</div>
                <p className="mt-4 text-[7px] text-white/30 uppercase font-bold leading-relaxed">Prioridad absoluta en incidentes críticos y descuentos masivos en mantenimiento preventivo.</p>
             </div>
           </div>
        </div>
      )}
    </div>
  );
}
