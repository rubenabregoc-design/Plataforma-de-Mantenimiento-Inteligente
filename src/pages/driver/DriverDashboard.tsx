import React, { useState, useEffect } from 'react';
import {
  Truck, Radio, Fuel, ClipboardCheck, AlertTriangle, MapPin,
  Clock, Gauge, ShieldCheck, CheckCircle2, ChevronRight, Navigation,
  RotateCcw, Sparkles, PhoneCall, AlertCircle, RefreshCw, Layers
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useUI } from '../../context/UIContext';
import { useGpsTracking } from '../../hooks/useGpsTracking';
import { triggerHaptic } from '../../hooks/useAndroidNative';
import PTTRadioModule from '../../components/PTTRadioModule';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { toast } from 'react-hot-toast';
import { Asset } from '../../types';

export default function DriverDashboard() {
  const { user, loggedInName } = useAuth();
  const { assets } = useData();
  const { tabs, setTab, openModal } = useUI();
  const { tripStatus, toggleGpsPause, stopTracking, setTripStatus } = useGpsTracking();

  const [selectedAssetId, setSelectedAssetId] = useState<string>('');
  const [odometerInput, setOdometerInput] = useState<string>('');
  const [isUpdatingOdo, setIsUpdatingOdo] = useState(false);
  const [isShiftActive, setIsShiftActive] = useState<boolean>(() => {
    return localStorage.getItem('mantech_driver_shift') === 'active';
  });
  const [shiftStartTime, setShiftStartTime] = useState<string>(() => {
    return localStorage.getItem('mantech_driver_shift_start') || '';
  });

  // Buscar camión / vehículo asignado al conductor actual
  const driverAssets = assets.filter(a => {
    if (!loggedInName) return true;
    const nameMatch = a.driverName && (
      a.driverName.toLowerCase().includes(loggedInName.toLowerCase()) ||
      loggedInName.toLowerCase().includes(a.driverName.toLowerCase())
    );
    return nameMatch || a.type === 'VEHICULO';
  });

  const assignedAsset: Asset | undefined = 
    assets.find(a => a.id === selectedAssetId) ||
    assets.find(a => a.driverName && loggedInName && (
      a.driverName.toLowerCase().includes(loggedInName.toLowerCase()) ||
      loggedInName.toLowerCase().includes(a.driverName.toLowerCase())
    )) ||
    driverAssets[0] ||
    assets[0];

  useEffect(() => {
    if (assignedAsset && !selectedAssetId) {
      setSelectedAssetId(assignedAsset.id);
    }
  }, [assignedAsset, selectedAssetId]);

  // Manejar Inicio / Fin de Turno
  const handleToggleShift = async () => {
    triggerHaptic('medium');
    if (!isShiftActive) {
      const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setIsShiftActive(true);
      setShiftStartTime(nowStr);
      localStorage.setItem('mantech_driver_shift', 'active');
      localStorage.setItem('mantech_driver_shift_start', nowStr);
      setTripStatus('active');

      if (assignedAsset) {
        try {
          await updateDoc(doc(db, 'assets', assignedAsset.id), {
            routeStartedAt: new Date().toISOString(),
            currentRoute: 'En Ruta / Operación Activa'
          });
        } catch (e) {
          console.warn('Error actualizando estado de ruta:', e);
        }
      }
      toast.success('Turno iniciado. Rastreo satelital y canal de radio activados.');
    } else {
      setIsShiftActive(false);
      setShiftStartTime('');
      localStorage.removeItem('mantech_driver_shift');
      localStorage.removeItem('mantech_driver_shift_start');
      stopTracking();

      if (assignedAsset) {
        try {
          await updateDoc(doc(db, 'assets', assignedAsset.id), {
            currentRoute: 'En Base / Turno Cerrado'
          });
        } catch (e) {
          console.warn('Error actualizando estado de ruta:', e);
        }
      }
      toast('Turno finalizado y bitácora sincronizada.', { icon: '🏁' });
    }
  };

  // Actualizar Odómetro rápido
  const handleUpdateOdometer = async () => {
    if (!assignedAsset || !odometerInput) return;
    const newKm = parseInt(odometerInput, 10);
    if (isNaN(newKm) || newKm <= 0) {
      toast.error('Ingrese un kilometraje válido.');
      return;
    }

    try {
      setIsUpdatingOdo(true);
      await updateDoc(doc(db, 'assets', assignedAsset.id), {
        mileage: newKm,
        lastOdometerUpdate: new Date().toISOString()
      });
      toast.success(`Odómetro actualizado a ${newKm.toLocaleString()} km`);
      setOdometerInput('');
    } catch (e) {
      console.error(e);
      toast.error('Error al actualizar odómetro.');
    } finally {
      setIsUpdatingOdo(false);
    }
  };

  // Alerta SOS Inmediata
  const handleEmergencySOS = async () => {
    triggerHaptic('heavy');
    const confirmSOS = window.confirm('¿Desea emitir una ALERTA SOS INMEDIATA a la Central de Despacho y Monitoreo?');
    if (!confirmSOS) return;

    try {
      if (assignedAsset) {
        await updateDoc(doc(db, 'assets', assignedAsset.id), {
          emergencyAlert: {
            active: true,
            reportedBy: loggedInName || 'Conductor',
            timestamp: new Date().toISOString(),
            status: 'URGENTE'
          }
        });
      }
      toast.error('🚨 ALERTA SOS TRANSMITIDA. Central de flota notificada con coordenadas GPS.', { duration: 6000 });
    } catch (err) {
      toast.error('Error transmitiendo alerta SOS.');
    }
  };

  // Última inspección de hoy
  const todayStr = new Date().toISOString().split('T')[0];
  const lastPreTrip = assignedAsset?.preTripInspections?.slice().reverse()[0];
  const isInspectedToday = lastPreTrip && lastPreTrip.date.startsWith(todayStr);

  const currentTab = tabs.driver || 'cockpit';

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* CAB TOP BAR / STATUS */}
      <header className="bg-[#121317] border border-[#2a2b2f] rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-3.5 z-10">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-black font-black shadow-lg shadow-amber-500/20 shrink-0">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider bg-amber-500/20 border border-amber-500/40 text-amber-400">
                Cabina Conductor
              </span>
              {isShiftActive ? (
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider bg-[#52ffac]/15 border border-[#52ffac]/40 text-[#52ffac] animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#52ffac]" />
                  En Turno ({shiftStartTime || 'Activo'})
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider bg-white/10 border border-white/20 text-[#8a879d]">
                  En Pausa / Base
                </span>
              )}
            </div>
            <h1 className="text-lg sm:text-xl font-black text-white tracking-tight uppercase mt-1">
              {loggedInName || 'Operador de Flota'}
            </h1>
          </div>
        </div>

        {/* CONTROLES DE TURNO Y SOS */}
        <div className="flex items-center gap-2 z-10 flex-wrap">
          {isShiftActive && (
            <button
              onClick={toggleGpsPause}
              className="px-3 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all flex items-center gap-1.5 active:scale-95"
            >
              <Navigation className="w-4 h-4 text-amber-400" />
              {tripStatus === 'paused' ? 'Reanudar GPS' : 'Pausar GPS'}
            </button>
          )}

          <button
            onClick={handleToggleShift}
            className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg active:scale-95 ${
              isShiftActive
                ? 'bg-rose-500/20 border border-rose-500/40 text-rose-400 hover:bg-rose-500/30'
                : 'bg-gradient-to-r from-amber-500 to-amber-600 text-black font-extrabold hover:brightness-110 shadow-amber-500/20'
            }`}
          >
            {isShiftActive ? (
              <>
                <RotateCcw className="w-4 h-4" />
                Cerrar Turno
              </>
            ) : (
              <>
                <Clock className="w-4 h-4" />
                Iniciar Turno
              </>
            )}
          </button>

          <button
            onClick={handleEmergencySOS}
            className="px-3 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-rose-600 text-white hover:bg-rose-500 transition-all flex items-center gap-1.5 shadow-lg shadow-rose-600/30 active:scale-95 animate-pulse"
            title="Botón de Pánico / Alerta SOS Central"
          >
            <AlertTriangle className="w-4 h-4 fill-current" />
            SOS Central
          </button>
        </div>
      </header>

      {/* SELECTOR DE CAMIÓN / VEHÍCULO EN OPERACIÓN */}
      <div className="bg-[#121317] border border-[#2a2b2f] rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-amber-400">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[9px] font-black uppercase tracking-wider text-[#8a879d]">
              Vehículo en Servicio:
            </span>
            <div className="text-sm font-black text-white uppercase">
              {assignedAsset ? `${assignedAsset.name} — ${assignedAsset.details}` : 'Sin camión seleccionado'}
            </div>
          </div>
        </div>

        {assets.length > 1 && (
          <div className="w-full sm:w-auto">
            <select
              value={selectedAssetId}
              onChange={(e) => setSelectedAssetId(e.target.value)}
              className="w-full sm:w-auto bg-[#0d0e12] border border-[#2a2b2f] text-white text-xs font-bold rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500"
            >
              {assets.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.licensePlate || a.details || 'S/P'}) {a.driverName ? `— ${a.driverName}` : ''}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* HERO COCKPIT CARDS */}
      {assignedAsset ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* FICHA TÉCNICA DE LA UNIDAD */}
          <div className="lg:col-span-2 bg-[#121317] border border-[#2a2b2f] rounded-2xl p-5 sm:p-6 space-y-6 shadow-xl relative overflow-hidden">
            <div className="flex items-start justify-between gap-4 border-b border-white/5 pb-4">
              <div>
                <span className="text-[9px] font-black uppercase tracking-widest text-[#8a879d]">
                  Unidad Asignada
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight mt-0.5">
                  {assignedAsset.name}
                </h2>
                <p className="text-xs font-bold text-[#8a879d] mt-0.5">
                  {assignedAsset.details} {assignedAsset.location ? `• Sede: ${assignedAsset.location}` : ''}
                </p>
              </div>

              {assignedAsset.licensePlate && (
                <div className="bg-white border-2 border-black rounded-lg px-3 py-1 shadow-md text-center shrink-0">
                  <span className="text-[7px] font-black uppercase tracking-widest text-blue-900 block leading-none">
                    PANAMÁ
                  </span>
                  <span className="text-sm sm:text-base font-black text-black tracking-wider leading-tight">
                    {assignedAsset.licensePlate}
                  </span>
                </div>
              )}
            </div>

            {/* METRICS GRID */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-[#1c1d21] border border-white/5 rounded-xl p-3.5 flex flex-col justify-between">
                <div className="flex items-center justify-between text-[#8a879d] mb-1">
                  <span className="text-[9px] font-black uppercase tracking-wider">Odómetro</span>
                  <Gauge className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <div className="text-base sm:text-lg font-black text-white">
                  {(assignedAsset.mileage || 0).toLocaleString()} <span className="text-[10px] text-[#8a879d]">KM</span>
                </div>
              </div>

              <div className="bg-[#1c1d21] border border-white/5 rounded-xl p-3.5 flex flex-col justify-between">
                <div className="flex items-center justify-between text-[#8a879d] mb-1">
                  <span className="text-[9px] font-black uppercase tracking-wider">Combustible</span>
                  <Fuel className="w-3.5 h-3.5 text-[#52ffac]" />
                </div>
                <div className="text-base sm:text-lg font-black text-white uppercase truncate">
                  {assignedAsset.fuelType || 'Diesel'}
                </div>
              </div>

              <div className="bg-[#1c1d21] border border-white/5 rounded-xl p-3.5 flex flex-col justify-between">
                <div className="flex items-center justify-between text-[#8a879d] mb-1">
                  <span className="text-[9px] font-black uppercase tracking-wider">Pre-Viaje</span>
                  <ClipboardCheck className="w-3.5 h-3.5 text-indigo-400" />
                </div>
                <div className="text-xs font-black uppercase flex items-center gap-1 mt-1">
                  {isInspectedToday ? (
                    <span className="text-[#52ffac] flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Al Día
                    </span>
                  ) : (
                    <span className="text-amber-400 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> Pendiente
                    </span>
                  )}
                </div>
              </div>

              <div className="bg-[#1c1d21] border border-white/5 rounded-xl p-3.5 flex flex-col justify-between">
                <div className="flex items-center justify-between text-[#8a879d] mb-1">
                  <span className="text-[9px] font-black uppercase tracking-wider">Próx. Taller</span>
                  <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
                </div>
                <div className="text-xs font-black text-white truncate mt-1">
                  {assignedAsset.nextMaintenanceDate || 'Programado'}
                </div>
              </div>
            </div>

            {/* QUICK ACTIONS FOR TRUCK (BOTONES GRANDES PARA CABINA) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => {
                  triggerHaptic('medium');
                  openModal('preTrip', { asset: assignedAsset });
                }}
                className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-indigo-500/15 to-indigo-600/10 border border-indigo-500/30 hover:border-indigo-500/60 text-white font-black uppercase text-xs tracking-wider transition-all active:scale-98 group shadow-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                    <ClipboardCheck className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <span className="block text-white">Inspección Pre-Viaje</span>
                    <span className="text-[9px] font-bold text-[#8a879d] lowercase block">
                      checklist de luces, frenos y fluidos
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#8a879d] group-hover:text-white group-hover:translate-x-0.5 transition-all" />
              </button>

              <button
                onClick={() => {
                  triggerHaptic('medium');
                  openModal('fuel', { asset: assignedAsset });
                }}
                className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-[#52ffac]/15 to-[#52ffac]/5 border border-[#52ffac]/30 hover:border-[#52ffac]/60 text-white font-black uppercase text-xs tracking-wider transition-all active:scale-98 group shadow-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#52ffac]/20 text-[#52ffac] flex items-center justify-center">
                    <Fuel className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <span className="block text-white">Carga de Combustible</span>
                    <span className="text-[9px] font-bold text-[#8a879d] lowercase block">
                      registrar galones y foto de factura
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#8a879d] group-hover:text-white group-hover:translate-x-0.5 transition-all" />
              </button>
            </div>

            {/* ACTUALIZACIÓN RÁPIDA DE KILOMETRAJE */}
            <div className="bg-[#1c1d21]/60 border border-white/5 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <Gauge className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-xs font-bold text-[#8a879d]">
                  Actualizar Odómetro al Llegar a Destino:
                </span>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <input
                  type="number"
                  placeholder={`Ej: ${(assignedAsset.mileage || 0) + 50}`}
                  value={odometerInput}
                  onChange={(e) => setOdometerInput(e.target.value)}
                  className="bg-[#0d0e12] border border-[#2a2b2f] rounded-xl px-3 py-2 text-xs text-white font-bold w-full sm:w-36 focus:outline-none focus:border-amber-500"
                />
                <button
                  onClick={handleUpdateOdometer}
                  disabled={isUpdatingOdo || !odometerInput}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black text-xs font-black uppercase rounded-xl transition-all disabled:opacity-50 shrink-0 active:scale-95"
                >
                  {isUpdatingOdo ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </div>
          </div>

          {/* WALKIE TALKIE PTT DEDICADO DE CABINA */}
          <div className="space-y-4">
            <PTTRadioModule
              userId={user?.uid || 'driver-1'}
              userName={loggedInName || 'Conductor'}
              role="driver"
              assetId={assignedAsset.id}
              channelId={assignedAsset.ownerId || assignedAsset.id}
              channelName={assignedAsset.name ? `Flota • ${assignedAsset.name}` : 'Canal Central'}
              unitName={assignedAsset.licensePlate || assignedAsset.name}
            />

            {/* TARJETA DE ESTADO DE RUTA */}
            <div className="bg-[#121317] border border-[#2a2b2f] rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-400 text-xs font-black uppercase tracking-wider">
                  <MapPin className="w-4 h-4" />
                  Estado de Telemetría GPS
                </div>
                <span className="w-2 h-2 rounded-full bg-[#52ffac] animate-ping" />
              </div>
              <p className="text-[11px] text-[#8a879d] font-medium leading-relaxed">
                El canal de radio y el sensor GPS están enlazados a la torre de control de la empresa.
                Cualquier mensaje de voz se transmite en tiempo real al jefe de taller y base operativa.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center bg-[#121317] border border-[#2a2b2f] rounded-2xl space-y-3">
          <Truck className="w-12 h-12 text-[#474556] mx-auto" />
          <h3 className="text-base font-black text-white uppercase">No hay camión o vehículo asignado</h3>
          <p className="text-xs text-[#8a879d]">
            Contacte con el administrador de la flota para vincular su cuenta a un activo.
          </p>
        </div>
      )}

      {/* HISTORIAL RECIENTE DE LA UNIDAD (PRE-TRIP & COMBUSTIBLE) */}
      {assignedAsset && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* INSPECCIONES PRE-VIAJE */}
          <div className="bg-[#121317] border border-[#2a2b2f] rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2 text-white text-xs font-black uppercase tracking-wider">
                <ClipboardCheck className="w-4 h-4 text-indigo-400" />
                Inspecciones Pre-Viaje Recientes
              </div>
              <button
                onClick={() => openModal('preTrip', { asset: assignedAsset })}
                className="text-[10px] font-black uppercase text-indigo-400 hover:underline"
              >
                + Nueva
              </button>
            </div>

            {assignedAsset.preTripInspections && assignedAsset.preTripInspections.length > 0 ? (
              <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                {assignedAsset.preTripInspections.slice().reverse().slice(0, 4).map((insp, idx) => (
                  <div key={idx} className="bg-[#1c1d21] border border-white/5 rounded-xl p-3 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-black text-white">
                        {insp.date.split('T')[0]}
                      </div>
                      <div className="text-[10px] text-[#8a879d]">
                        Por: {insp.inspectorName || 'Conductor'}
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                      insp.result === 'warning' || insp.items?.some(i => i.status === 'fail')
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-[#52ffac]/20 text-[#52ffac] border border-[#52ffac]/30'
                    }`}>
                      {insp.result === 'warning' || insp.items?.some(i => i.status === 'fail') ? 'Observaciones' : 'Aprobado'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#8a879d] py-4 text-center">
                No hay inspecciones registradas para este vehículo.
              </p>
            )}
          </div>

          {/* HISTORIAL DE COMBUSTIBLE */}
          <div className="bg-[#121317] border border-[#2a2b2f] rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2 text-white text-xs font-black uppercase tracking-wider">
                <Fuel className="w-4 h-4 text-[#52ffac]" />
                Cargas de Combustible Recientes
              </div>
              <button
                onClick={() => openModal('fuel', { asset: assignedAsset })}
                className="text-[10px] font-black uppercase text-[#52ffac] hover:underline"
              >
                + Cargar
              </button>
            </div>

            {assignedAsset.fuelLogs && assignedAsset.fuelLogs.length > 0 ? (
              <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                {assignedAsset.fuelLogs.slice().reverse().slice(0, 4).map((log, idx) => (
                  <div key={idx} className="bg-[#1c1d21] border border-white/5 rounded-xl p-3 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-black text-white">
                        {log.gallons} Galones • ${log.price.toFixed(2)}
                      </div>
                      <div className="text-[10px] text-[#8a879d]">
                        {log.date.split('T')[0]} • Odómetro: {log.mileage.toLocaleString()} km
                      </div>
                    </div>
                    {log.status === 'anomaly' ? (
                      <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase bg-rose-500/20 text-rose-400 border border-rose-500/30">
                        Anomalía
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase bg-[#52ffac]/20 text-[#52ffac] border border-[#52ffac]/30">
                        OK
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#8a879d] py-4 text-center">
                No hay registros de combustible para este vehículo.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
