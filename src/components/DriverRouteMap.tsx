import React, { useState, useEffect, useRef } from 'react';
import {
  Navigation, MapPin, Flag, Compass, ExternalLink, CheckCircle2,
  Clock, ShieldAlert, ArrowRight, Layers, Sparkles, AlertTriangle,
  RotateCcw, Send, CheckSquare, Truck, LocateFixed, Eye
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Asset } from '../types';
import { db } from '../firebase';
import { doc, updateDoc, arrayUnion, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { triggerHaptic } from '../hooks/useAndroidNative';
import { toast } from 'react-hot-toast';

interface DriverRouteMapProps {
  asset: Asset;
  driverName: string;
  userId?: string;
  onBackToCockpit?: () => void;
}

// Componente para recentrar el mapa dinámicamente
function MapRecenter({ coords, zoom }: { coords: [number, number]; zoom?: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(coords, zoom || map.getZoom());
  }, [coords, zoom, map]);
  return null;
}

// Coordenadas conocidas en Panamá para destinos habituales
const PANAMA_LOCATIONS: Record<string, [number, number]> = {
  'Base Central': [8.9833, -79.5167],
  'Panamá Centro': [8.9833, -79.5167],
  'Zona Libre Colón': [9.3556, -79.8894],
  'Colón': [9.3556, -79.8894],
  'Aeropuerto Tocumen': [9.0714, -79.3835],
  'Panamá Pacífico': [8.9185, -79.5989],
  'Chorrera': [8.8803, -79.7833],
  'Penonomé': [8.5194, -80.3558],
  'David, Chiriquí': [8.4333, -82.4333],
  'Santiago': [8.1000, -80.9833],
};

// Iconos personalizados con Tailwind para evitar problemas de assets en Leaflet
const createTruckMarkerIcon = (name: string, plate: string) => L.divIcon({
  className: 'custom-driver-truck-icon',
  html: `
    <div class="flex flex-col items-center select-none" style="transform: translate(-50%, -100%);">
      <div class="bg-black/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-amber-400 shadow-2xl mb-1 flex items-center gap-1.5 whitespace-nowrap">
        <span class="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
        <span class="text-[9px] font-black text-white uppercase tracking-tight">${plate || name}</span>
      </div>
      <div class="w-11 h-11 bg-gradient-to-tr from-amber-500 to-amber-600 rounded-2xl border-2 border-white shadow-2xl flex items-center justify-center text-black font-black transform shadow-amber-500/50">
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M10 17h4V5H2v12h3m10 0h2l3-3v-4h-5v7Z"></path>
          <circle cx="7.5" cy="17.5" r="2.5"></circle>
          <circle cx="17.5" cy="17.5" r="2.5"></circle>
        </svg>
      </div>
    </div>
  `,
  iconSize: [0, 0],
  iconAnchor: [0, 0]
});

const createDestinationMarkerIcon = (title: string) => L.divIcon({
  className: 'custom-destination-icon',
  html: `
    <div class="flex flex-col items-center select-none" style="transform: translate(-50%, -100%);">
      <div class="bg-[#e11d48] text-white px-2.5 py-1 rounded-lg border border-white shadow-2xl mb-1 flex items-center gap-1 whitespace-nowrap">
        <span class="text-[9px] font-black uppercase tracking-wider">🎯 ${title}</span>
      </div>
      <div class="w-10 h-10 bg-[#e11d48] rounded-full border-3 border-white shadow-2xl flex items-center justify-center text-white font-black shadow-rose-600/50">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
          <line x1="4" y1="22" x2="4" y2="15"></line>
        </svg>
      </div>
    </div>
  `,
  iconSize: [0, 0],
  iconAnchor: [0, 0]
});

const createCheckpointMarkerIcon = (name: string, index: number) => L.divIcon({
  className: 'custom-checkpoint-icon',
  html: `
    <div class="flex flex-col items-center select-none" style="transform: translate(-50%, -50%);">
      <div class="w-7 h-7 bg-[#52ffac] rounded-full border-2 border-[#0d0e12] shadow-xl flex items-center justify-center text-[#0d0e12] text-[10px] font-black">
        ${index}
      </div>
    </div>
  `,
  iconSize: [0, 0],
  iconAnchor: [0, 0]
});

export default function DriverRouteMap({ asset, driverName, userId, onBackToCockpit }: DriverRouteMapProps) {
  // Coordenadas actuales del conductor (vía GPS en vivo o última del activo)
  const defaultLat = asset.latitude || 8.9833;
  const defaultLng = asset.longitude || -79.5167;
  const [driverPos, setDriverPos] = useState<[number, number]>([defaultLat, defaultLng]);
  const [hasLiveGps, setHasLiveGps] = useState(false);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [currentSpeed, setCurrentSpeed] = useState<number | null>(null);

  // Destino de la ruta asignada
  const assignedDestination = asset.currentRoute && asset.currentRoute !== 'En Ruta / Operación Activa' && asset.currentRoute !== 'En Base / Turno Cerrado'
    ? asset.currentRoute
    : 'Zona Libre de Colón (Almacén B-12)';

  // Resolver coordenadas de destino
  const getDestinationCoords = (): [number, number] => {
    for (const key of Object.keys(PANAMA_LOCATIONS)) {
      if (assignedDestination.toLowerCase().includes(key.toLowerCase())) {
        return PANAMA_LOCATIONS[key];
      }
    }
    // Default Colón si no coincide
    return [9.3556, -79.8894];
  };

  const destinationCoords = getDestinationCoords();

  // Origen
  const originName = asset.location || 'Base Central Panamá';

  // Capas del mapa
  const [showTraffic, setShowTraffic] = useState(true);
  const [mapCenter, setMapCenter] = useState<[number, number]>([defaultLat, defaultLng]);
  const [mapZoom, setMapZoom] = useState(13);

  // Modal de marcar checkpoint
  const [isCheckpointModalOpen, setIsCheckpointModalOpen] = useState(false);
  const [checkpointTitle, setCheckpointTitle] = useState('');
  const [isSubmittingCheckpoint, setIsSubmittingCheckpoint] = useState(false);

  // Watch GPS del conductor en tiempo real
  useEffect(() => {
    if (!navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, accuracy, speed } = pos.coords;
        const newCoords: [number, number] = [latitude, longitude];
        setDriverPos(newCoords);
        setHasLiveGps(true);
        setGpsAccuracy(Math.round(accuracy));
        if (speed !== null && speed !== undefined) {
          setCurrentSpeed(Math.round(speed * 3.6)); // m/s a km/h
        }
      },
      (err) => {
        console.warn('GPS watch error:', err);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  // Centrar mapa en mi camión
  const handleRecenterTruck = () => {
    triggerHaptic('light');
    setMapCenter([...driverPos]);
    setMapZoom(15);
    toast.success('Mapa centrado en su ubicación satelital');
  };

  // Ver ruta completa (camión + destino)
  const handleViewFullRoute = () => {
    triggerHaptic('light');
    const midLat = (driverPos[0] + destinationCoords[0]) / 2;
    const midLng = (driverPos[1] + destinationCoords[1]) / 2;
    setMapCenter([midLat, midLng]);
    setMapZoom(10);
  };

  // Abrir navegación 1-clic a Google Maps
  const handleOpenGoogleMaps = () => {
    triggerHaptic('medium');
    const [destLat, destLng] = destinationCoords;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${destLat},${destLng}&travelmode=driving`;
    window.open(url, '_blank');
    toast.success('Iniciando Google Maps Navigation...');
  };

  // Abrir navegación 1-clic a Waze
  const handleOpenWaze = () => {
    triggerHaptic('medium');
    const [destLat, destLng] = destinationCoords;
    const url = `https://waze.com/ul?ll=${destLat},${destLng}&navigate=yes`;
    window.open(url, '_blank');
    toast.success('Iniciando Waze Navigation...');
  };

  // Registrar Checkpoint / Llegada
  const handleConfirmCheckpoint = async (titleToSave?: string) => {
    const finalTitle = (titleToSave || checkpointTitle).trim();
    if (!finalTitle) {
      toast.error('Ingrese el nombre o motivo de la parada.');
      return;
    }

    try {
      setIsSubmittingCheckpoint(true);
      triggerHaptic('heavy');

      const now = new Date();
      const timeStr = now.toLocaleTimeString('es-PA', { hour: 'numeric', minute: '2-digit', hour12: true });

      const newCheckpoint = {
        lat: driverPos[0],
        lng: driverPos[1],
        timestamp: now.toISOString(),
        locationName: finalTitle,
        type: 'checkpoint' as const,
        speed: currentSpeed || 0
      };

      // 1. Guardar en el activo
      await updateDoc(doc(db, 'assets', asset.id), {
        routeHistory: arrayUnion(newCheckpoint),
        latitude: driverPos[0],
        longitude: driverPos[1]
      });

      // 2. Transmitir automáticamente a la Torre de Despacho
      await addDoc(collection(db, 'messages'), {
        channel: 'fleet_dispatch',
        senderId: userId || 'driver',
        senderName: driverName || 'Conductor',
        senderRole: 'driver',
        text: `🏁 CHECKPOINT EN RUTA (${timeStr}): "${finalTitle}" registrado por el conductor ${driverName} en la unidad ${asset.name} (${asset.licensePlate || 'S/P'}).`,
        assignedAssetName: `${asset.name} (${asset.licensePlate || asset.details})`,
        type: 'text',
        createdAt: serverTimestamp()
      });

      toast.success(`Checkpoint "${finalTitle}" registrado y transmitido a Despacho.`);
      setIsCheckpointModalOpen(false);
      setCheckpointTitle('');
    } catch (err) {
      console.error('Error registrando checkpoint:', err);
      toast.error('Error al guardar checkpoint.');
    } finally {
      setIsSubmittingCheckpoint(false);
    }
  };

  // Historial de puntos y paradas ya registradas
  const historyPoints = asset.routeHistory || [];
  const validCheckpoints = historyPoints.filter(p => p.type === 'checkpoint' || p.locationName);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. HOJA DE RUTA DEL COORDINADOR (CABECERA INTELIGENTE) */}
      <div className="bg-[#121317] border border-[#2a2b2f] rounded-3xl p-5 sm:p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10 border-b border-white/5 pb-5">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-black font-black shadow-lg shadow-amber-500/20 shrink-0">
              <Navigation className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-amber-500/20 border border-amber-500/40 text-amber-400">
                  Hoja de Ruta Activa
                </span>
                <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-[#52ffac]/15 border border-[#52ffac]/30 text-[#52ffac] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#52ffac] animate-pulse" />
                  En Tránsito
                </span>
                {hasLiveGps && (
                  <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-sky-500/15 border border-sky-500/30 text-sky-400">
                    GPS Precisión ±{gpsAccuracy || 5}m
                  </span>
                )}
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight mt-1">
                {asset.name} <span className="text-[#8a879d] font-bold text-base">({asset.licensePlate || asset.details})</span>
              </h1>
            </div>
          </div>

          {/* ACCIONES SUPERIORES */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {onBackToCockpit && (
              <button
                onClick={onBackToCockpit}
                className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[#c8c4d9] text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 active:scale-95"
              >
                Volver a Cabina
              </button>
            )}

            <button
              onClick={() => setIsCheckpointModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#52ffac] to-emerald-400 text-black font-black text-xs uppercase tracking-wider shadow-lg shadow-[#52ffac]/25 hover:brightness-110 active:scale-95 transition-all flex items-center gap-2"
            >
              <Flag className="w-4 h-4" />
              Marcar Checkpoint / Llegada
            </button>
          </div>
        </div>

        {/* TRAYECTO: ORIGEN -> DESTINO & INSTRUCCIONES */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-5">
          {/* Origen */}
          <div className="bg-[#1c1d21] border border-white/5 rounded-2xl p-4 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-amber-400 shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[9px] font-black uppercase tracking-widest text-[#8a879d] block">
                Punto de Origen
              </span>
              <span className="text-sm font-black text-white uppercase block mt-0.5">
                {originName}
              </span>
              <span className="text-[10px] text-[#8a879d]">Sede de Despacho</span>
            </div>
          </div>

          {/* Destino */}
          <div className="bg-[#1c1d21] border border-white/5 rounded-2xl p-4 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
              <Flag className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[9px] font-black uppercase tracking-widest text-rose-400 block">
                Destino Asignado
              </span>
              <span className="text-sm font-black text-white uppercase block mt-0.5 truncate">
                {assignedDestination}
              </span>
              <span className="text-[10px] text-[#8a879d]">Punto de Entrega Final</span>
            </div>
          </div>

          {/* Velocidad / Telemetría */}
          <div className="bg-[#1c1d21] border border-white/5 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <span className="text-[9px] font-black uppercase tracking-widest text-[#8a879d] block">
                Telemetría en Ruta
              </span>
              <div className="text-xl font-black text-white mt-0.5 flex items-baseline gap-1">
                {currentSpeed !== null ? currentSpeed : '0'}{' '}
                <span className="text-xs text-[#8a879d] font-bold">KM/H</span>
              </div>
              <span className="text-[10px] text-[#52ffac] font-bold">Transmisión Satelital Activa</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#52ffac]">
              <Compass className="w-5 h-5 animate-spin-slow" />
            </div>
          </div>
        </div>

        {/* INSTRUCCIONES ESPECIALES DEL COORDINADOR */}
        <div className="mt-4 p-3.5 bg-amber-500/10 border border-amber-500/25 rounded-2xl flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-black text-amber-400 uppercase tracking-wide mr-1.5">
              Instrucción Oficial de Torre de Control:
            </span>
            <span className="text-amber-100/90 font-medium">
              {asset.emergencyInstructions ||
                'Mantener velocidad controlada bajo 80 km/h en autopista, confirmar paso por caseta de peaje y notificar inmediatamente cualquier incidente o retraso a través del chat de flota.'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. BARRA DE NAVEGACIÓN 1-CLIC (WAZE & GOOGLE MAPS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* BOTÓN GOOGLE MAPS */}
        <button
          onClick={handleOpenGoogleMaps}
          className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-black uppercase text-xs sm:text-sm tracking-wider shadow-xl shadow-blue-600/25 active:scale-98 transition-all flex items-center justify-between group border border-blue-400/30"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-white shadow-inner">
              <Compass className="w-6 h-6" />
            </div>
            <div className="text-left">
              <span className="block text-white font-black text-sm">Abrir Google Maps</span>
              <span className="text-[10px] font-bold text-blue-100 lowercase block">
                navegación paso a paso con voz y desvíos
              </span>
            </div>
          </div>
          <ExternalLink className="w-5 h-5 text-blue-200 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
        </button>

        {/* BOTÓN WAZE */}
        <button
          onClick={handleOpenWaze}
          className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-sky-500 to-cyan-600 hover:from-sky-400 hover:to-cyan-500 text-white font-black uppercase text-xs sm:text-sm tracking-wider shadow-xl shadow-cyan-600/25 active:scale-98 transition-all flex items-center justify-between group border border-cyan-400/30"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-white shadow-inner">
              <Navigation className="w-6 h-6" />
            </div>
            <div className="text-left">
              <span className="block text-white font-black text-sm">Abrir en Waze</span>
              <span className="text-[10px] font-bold text-sky-100 lowercase block">
                alertas de policía, tráfico y cámaras en vivo
              </span>
            </div>
          </div>
          <ExternalLink className="w-5 h-5 text-sky-200 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
        </button>
      </div>

      {/* 3. MAPA EN VIVO GPS (REACT-LEAFLET) */}
      <div className="bg-[#121317] border border-[#2a2b2f] rounded-3xl overflow-hidden shadow-2xl relative">
        {/* BARRA DE HERRAMIENTAS DEL MAPA */}
        <div className="p-4 bg-[#17181d] border-b border-white/5 flex flex-wrap items-center justify-between gap-3 z-10 relative">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#52ffac] animate-ping" />
            <h3 className="text-xs font-black text-white uppercase tracking-wider">
              Monitor GPS Satelital de Cabina
            </h3>
            <span className="text-[10px] text-[#8a879d] hidden sm:inline">
              • Coord: {driverPos[0].toFixed(4)}, {driverPos[1].toFixed(4)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowTraffic(!showTraffic)}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 active:scale-95 ${
                showTraffic
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'bg-white/5 text-[#8a879d] hover:text-white border border-white/10'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              {showTraffic ? 'Tráfico ON' : 'Tráfico OFF'}
            </button>

            <button
              onClick={handleRecenterTruck}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 active:scale-95"
              title="Centrar en mi camión"
            >
              <LocateFixed className="w-3.5 h-3.5 text-amber-400" />
              Mi Camión
            </button>

            <button
              onClick={handleViewFullRoute}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 active:scale-95"
              title="Ver ruta completa"
            >
              <Eye className="w-3.5 h-3.5 text-sky-400" />
              Ruta Completa
            </button>
          </div>
        </div>

        {/* CONTENEDOR LEAFLET */}
        <div className="h-[460px] sm:h-[540px] w-full relative z-0">
          <MapContainer
            center={mapCenter}
            zoom={mapZoom}
            scrollWheelZoom={true}
            style={{ height: '100%', width: '100%', background: '#0d0e12' }}
            zoomControl={false}
          >
            <MapRecenter coords={mapCenter} zoom={mapZoom} />

            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap'
            />

            {showTraffic && (
              <TileLayer
                url="https://mt1.google.com/vt?lyrs=h@159000000,traffic|seconds_into_week:-1&style=3&x={x}&y={y}&z={z}"
                opacity={0.75}
                zIndex={1000}
              />
            )}

            {/* MARCADOR DEL CAMIÓN DEL CONDUCTOR */}
            <Marker
              position={driverPos}
              icon={createTruckMarkerIcon(asset.name, asset.licensePlate || 'MI UNIDAD')}
            >
              <Popup>
                <div className="p-2 min-w-[170px] text-[#0d0e12]">
                  <h4 className="text-xs font-black uppercase">{asset.name}</h4>
                  <p className="text-[10px] font-bold text-amber-600 uppercase mb-1">
                    {asset.licensePlate || 'Placa asignada'}
                  </p>
                  <p className="text-[9px] text-gray-600">
                    Conductor: <strong>{driverName}</strong>
                  </p>
                  <p className="text-[9px] text-gray-600">
                    Velocidad: <strong>{currentSpeed !== null ? `${currentSpeed} km/h` : 'En espera'}</strong>
                  </p>
                </div>
              </Popup>
            </Marker>

            {/* MARCADOR DE DESTINO */}
            <Marker
              position={destinationCoords}
              icon={createDestinationMarkerIcon(assignedDestination)}
            >
              <Popup>
                <div className="p-2 min-w-[170px] text-[#0d0e12]">
                  <h4 className="text-xs font-black uppercase text-rose-600">Punto de Entrega</h4>
                  <p className="text-[10px] font-bold text-gray-900 mb-1">{assignedDestination}</p>
                  <p className="text-[9px] text-gray-600">Confirme llegada al arribar al predio.</p>
                </div>
              </Popup>
            </Marker>

            {/* MARCADORES DE CHECKPOINTS PREVIOS */}
            {validCheckpoints.map((cp, idx) => (
              <Marker
                key={idx}
                position={[cp.lat, cp.lng]}
                icon={createCheckpointMarkerIcon(cp.locationName || `CP-${idx + 1}`, idx + 1)}
              >
                <Popup>
                  <div className="p-2 min-w-[150px] text-[#0d0e12]">
                    <span className="text-[8px] font-black uppercase text-emerald-600 block">
                      Checkpoint #{idx + 1}
                    </span>
                    <h5 className="text-xs font-bold">{cp.locationName}</h5>
                    <p className="text-[9px] text-gray-500 mt-1">
                      {new Date(cp.timestamp).toLocaleTimeString('es-PA', { hour: 'numeric', minute: '2-digit', hour12: true })}
                    </p>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* TRAZADO DE RUTA (LÍNEA DESDE MI UBICACIÓN HASTA EL DESTINO) */}
            <Polyline
              positions={[driverPos, destinationCoords]}
              color="#00d2ff"
              weight={5}
              opacity={0.7}
              dashArray="6, 10"
            />

            {/* SI HAY HISTORIAL DE PUNTOS DE ESTE ACTIVO, DIBUJAR CAMINO RECORRIDO */}
            {historyPoints.length > 1 && (
              <Polyline
                positions={historyPoints.map(p => [p.lat, p.lng] as [number, number])}
                color="#52ffac"
                weight={4}
                opacity={0.9}
              />
            )}
          </MapContainer>
        </div>
      </div>

      {/* 4. HISTORIAL DE CHECKPOINTS Y PARADAS REGISTRADAS */}
      <div className="bg-[#121317] border border-[#2a2b2f] rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div className="flex items-center gap-2 text-white text-xs font-black uppercase tracking-wider">
            <CheckSquare className="w-4 h-4 text-[#52ffac]" />
            Registro de Checkpoints & Paradas de Ruta
          </div>
          <span className="text-[10px] font-bold text-[#8a879d]">
            {validCheckpoints.length} {validCheckpoints.length === 1 ? 'hito registrado' : 'hitos registrados'}
          </span>
        </div>

        {validCheckpoints.length === 0 ? (
          <div className="p-6 text-center text-xs text-[#8a879d] bg-white/5 rounded-2xl">
            No se han marcado paradas en este viaje aún. Presione <strong>"Marcar Checkpoint / Llegada"</strong> al alcanzar peajes, aduanas o destino final.
          </div>
        ) : (
          <div className="space-y-2.5">
            {validCheckpoints.slice().reverse().map((cp, idx) => (
              <div
                key={idx}
                className="bg-[#1c1d21] border border-white/5 rounded-xl p-3.5 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#52ffac]/15 border border-[#52ffac]/30 text-[#52ffac] flex items-center justify-center text-xs font-black">
                    ✓
                  </div>
                  <div>
                    <h5 className="text-xs font-black text-white uppercase">
                      {cp.locationName}
                    </h5>
                    <p className="text-[10px] text-[#8a879d]">
                      {new Date(cp.timestamp).toLocaleDateString('es-PA')} a las{' '}
                      {new Date(cp.timestamp).toLocaleTimeString('es-PA', { hour: 'numeric', minute: '2-digit', hour12: true })}
                    </p>
                  </div>
                </div>
                <span className="text-[9px] font-black uppercase text-[#52ffac] bg-[#52ffac]/10 px-2.5 py-1 rounded-lg border border-[#52ffac]/20">
                  Transmitido a Despacho
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL PARA MARCAR CHECKPOINT / LLEGADA */}
      {isCheckpointModalOpen && (
        <div className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121317] border border-[#2a2b2f] rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl relative animate-fade-in">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#52ffac]/20 text-[#52ffac] flex items-center justify-center">
                  <Flag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase">
                    Confirmar Checkpoint / Llegada
                  </h3>
                  <p className="text-[10px] text-[#8a879d]">
                    Se registrará con coordenadas GPS y hora satelital
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCheckpointModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-[#8a879d] hover:text-white flex items-center justify-center text-xs font-bold"
              >
                ✕
              </button>
            </div>

            {/* OPCIONES PRE-DISEÑADAS RÁPIDAS PARA CABINA */}
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase text-[#8a879d]">
                Selección Rápida de Hito:
              </label>
              <div className="grid grid-cols-1 gap-2">
                {[
                  '🏁 Llegada a Destino Final / Almacén',
                  '🛑 Paso por Caseta de Peaje Autopista',
                  '🛂 Garita de Seguridad / Control de Acceso',
                  '📦 Inicio de Maniobra de Descarga',
                  '⛽ Parada de Combustible / Inspección'
                ].map((preset, i) => (
                  <button
                    key={i}
                    onClick={() => handleConfirmCheckpoint(preset)}
                    disabled={isSubmittingCheckpoint}
                    className="w-full text-left p-3 rounded-xl bg-[#1c1d21] hover:bg-white/10 border border-white/5 hover:border-amber-500/40 text-xs font-bold text-white transition-all flex items-center justify-between active:scale-98 disabled:opacity-50"
                  >
                    <span>{preset}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                  </button>
                ))}
              </div>
            </div>

            {/* O MOTIVO PERSONALIZADO */}
            <div className="space-y-2 pt-2 border-t border-white/5">
              <label className="text-[9px] font-black uppercase text-[#8a879d]">
                O escribir nombre personalizado del punto:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ej: Entrada a Corredor Sur km 14"
                  value={checkpointTitle}
                  onChange={(e) => setCheckpointTitle(e.target.value)}
                  className="flex-1 bg-[#0d0e12] border border-[#2a2b2f] rounded-xl px-3.5 py-2.5 text-xs text-white font-bold focus:outline-none focus:border-amber-500"
                />
                <button
                  onClick={() => handleConfirmCheckpoint()}
                  disabled={isSubmittingCheckpoint || !checkpointTitle.trim()}
                  className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-black text-xs font-black uppercase rounded-xl transition-all disabled:opacity-50 active:scale-95 shrink-0"
                >
                  {isSubmittingCheckpoint ? 'Guardando...' : 'Confirmar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
