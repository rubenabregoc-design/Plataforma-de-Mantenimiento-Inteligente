import React, { useState, useEffect } from 'react';
import { Terminal, X, Copy, Trash2, CheckCircle2, Layers } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useUI } from '../context/UIContext';
import { toast } from 'react-hot-toast';

interface LogEntry {
  id: number;
  time: string;
  level: 'log' | 'warn' | 'error';
  message: string;
}

const globalLogs: LogEntry[] = [];
let logListeners: Array<() => void> = [];
let isHooked = false;

function initConsoleHook() {
  if (isHooked || typeof window === 'undefined') return;
  isHooked = true;

  const origLog = console.log;
  const origWarn = console.warn;
  const origError = console.error;

  const pushLog = (level: 'log' | 'warn' | 'error', args: any[]) => {
    try {
      const msg = args
        .map((a) => {
          if (typeof a === 'string') return a;
          if (a instanceof Error) return `${a.name}: ${a.message}`;
          try {
            return JSON.stringify(a);
          } catch {
            return String(a);
          }
        })
        .join(' ');

      const now = new Date().toLocaleTimeString('es-PA', { hour12: false });
      globalLogs.unshift({
        id: Date.now() + Math.random(),
        time: now,
        level,
        message: msg.slice(0, 600),
      });
      if (globalLogs.length > 150) globalLogs.pop();
      logListeners.forEach((fn) => fn());
    } catch {
      // ignore
    }
  };

  console.log = (...args) => {
    origLog(...args);
    pushLog('log', args);
  };
  console.warn = (...args) => {
    origWarn(...args);
    pushLog('warn', args);
  };
  console.error = (...args) => {
    origError(...args);
    pushLog('error', args);
  };

  window.addEventListener('error', (e) => {
    pushLog('error', [`[Runtime Error] ${e.message} (${e.filename}:${e.lineno})`]);
  });
  window.addEventListener('unhandledrejection', (e: any) => {
    pushLog('error', [`[Promise Rejection] ${e.reason?.message || String(e.reason)}`]);
  });

  console.log('✅ Consola de Diagnóstico MantechPro V4 inicializada.');
}

initConsoleHook();

export default function InAppLogConsole() {
  const { role, userData, loggedInName, loggedInEmail, subscription, isLoggedIn } = useAuth();
  const { assets, requests, technicians, inventory } = useData();
  const { tabs, setTab } = useUI();

  const [isOpen, setIsOpen] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([...globalLogs]);
  const [filter, setFilter] = useState<'all' | 'log' | 'warn' | 'error'>('all');
  const [activeSection, setActiveSection] = useState<'modules' | 'logs'>('modules');

  useEffect(() => {
    const update = () => setLogs([...globalLogs]);
    logListeners.push(update);
    const handleOpenEvent = () => setIsOpen(true);
    window.addEventListener('mantech-open-logs', handleOpenEvent);
    return () => {
      logListeners = logListeners.filter((l) => l !== update);
      window.removeEventListener('mantech-open-logs', handleOpenEvent);
    };
  }, []);

  if (!isLoggedIn) return null;

  const subRole = userData?.subRole;

  const getFriendlyRoleName = () => {
    if (role === 'client' && subRole === 'fleet_coordinator') return 'Coordinador de Flota';
    if (role === 'client' && subRole === 'building_coordinator') return 'Coordinador de Edificio';
    if (role === 'client') return 'Cliente';
    if (role === 'tech') return 'Técnico Especialista';
    if (role === 'driver') return 'Conductor';
    if (role === 'admin') return 'Administrador';
    return 'Usuario';
  };

  const getFriendlyPlanName = () => {
    if (role === 'admin') return 'Acceso Total';
    if (role === 'driver') return 'Flota Activa';
    if (subRole === 'fleet_coordinator' || subRole === 'building_coordinator') return 'Corporativo';
    const planId = subscription?.planId || (assets.length > 25 ? 'plan-enterprise' : 'plan-free');
    if (planId === 'plan-enterprise' || assets.length > 25) return 'Corporativo';
    if (planId === 'plan-pro' || assets.length > 10) return 'Profesional';
    if (planId === 'plan-basic') return role === 'tech' ? 'Estándar' : 'Emprendedor';
    return 'Básico';
  };

  const friendlyRole = getFriendlyRoleName();
  const friendlyPlan = getFriendlyPlanName();

  const roleModules: Record<string, { id: string; label: string; desc: string }[]> = {
    client: [
      { id: 'dashboard', label: 'Mis Equipos', desc: 'Gestión de equipos y código QR' },
      { id: 'fleet', label: 'Control de Flota', desc: 'Monitoreo de vehículos y GPS en vivo' },
      { id: 'team', label: 'Mi Personal', desc: 'Coordinadores, conductores y técnicos' },
      { id: 'ai', label: 'Diagnóstico Inteligente', desc: 'Asistente automático de fallas' },
      { id: 'warranties', label: 'Garantías y Pólizas', desc: 'Respaldo de garantías y facturas' },
      { id: 'marketplace', label: 'Directorio de Técnicos', desc: 'Especialistas verificados y mapa' },
      { id: 'quotes', label: 'Contratos y Pagos', desc: 'Cotizaciones, pagos y reportes PDF' },
      { id: 'audit', label: 'Control de Combustible', desc: 'Consumo de galones y rendimiento' },
      { id: 'inventory', label: 'Inventario de Repuestos', desc: 'Stock de piezas e insumos' },
      { id: 'subscriptions', label: 'Planes y Membresía', desc: 'Administración de tu plan activo' },
      { id: 'chat', label: 'Mensajes y Chat', desc: 'Comunicación directa con técnicos' },
      { id: 'settings', label: 'Ajustes de Cuenta', desc: 'Perfil, seguridad y preferencias' },
    ],
    tech: [
      { id: 'received', label: 'Bandeja de Servicios', desc: 'Órdenes directas asignadas' },
      { id: 'bidding_market', label: 'Bolsa de Trabajos', desc: 'Solicitudes abiertas de clientes' },
      { id: 'agenda', label: 'Agenda de Visitas', desc: 'Calendario de servicios confirmados' },
      { id: 'wallet', label: 'Billetera e Ingresos', desc: 'Balance disponible y retiros' },
      { id: 'loyalty', label: 'Club de Beneficios', desc: 'Puntos y recompensas por nivel' },
      { id: 'inventory', label: 'Mi Inventario', desc: 'Control de repuestos y herramientas' },
      { id: 'mantech_id', label: 'Carnet Digital QR', desc: 'Identificación oficial verificada' },
      { id: 'community', label: 'Comunidad Técnica', desc: 'Foro y apoyo entre especialistas' },
      { id: 'subscriptions', label: 'Mi Plan de Técnico', desc: 'Nivel Estándar, Pro y Corporativo' },
      { id: 'chat', label: 'Chat con Clientes', desc: 'Mensajería en órdenes activas' },
      { id: 'profile', label: 'Mi Perfil Público', desc: 'Especialidades, tarifas y experiencia' },
      { id: 'settings', label: 'Ajustes de Cuenta', desc: 'Notificaciones y preferencias' },
    ],
    driver: [
      { id: 'cockpit', label: 'Cabina de Mando', desc: 'Turno activo, odómetro, SOS y radio' },
      { id: 'routes', label: 'Ruta y Mapa GPS', desc: 'Recorrido asignado y navegación' },
      { id: 'inspection', label: 'Inspección Pre-Viaje', desc: 'Revisión de frenos, luces y fluidos' },
      { id: 'fuel', label: 'Registro de Combustible', desc: 'Carga de galones y kilometraje' },
      { id: 'chat', label: 'Chat con Despacho', desc: 'Comunicación con coordinación de flota' },
    ],
    admin: [
      { id: 'finance', label: 'Finanzas y Cierre', desc: 'Ingresos, comisiones y retiros' },
      { id: 'validator', label: 'Validación de Técnicos', desc: 'Aprobación de perfiles y pagos' },
      { id: 'audit', label: 'Historial del Sistema', desc: 'Registro de actividad global' },
      { id: 'tickets', label: 'Soporte al Cliente', desc: 'Atención de consultas y casos' },
      { id: 'ads', label: 'Anuncios y Banners', desc: 'Campañas informativas en la app' },
      { id: 'logistics', label: 'Monitoreo de Flotas', desc: 'Supervisión general de vehículos' },
      { id: 'users', label: 'Directorio de Usuarios', desc: 'Control de cuentas y perfiles' },
      { id: 'inventory', label: 'Inventario General', desc: 'Catálogo maestro de repuestos' },
      { id: 'alerts', label: 'Alertas Preventivas', desc: 'Avisos y mantenimientos vencidos' },
      { id: 'settings', label: 'Ajustes del Sistema', desc: 'Configuración general de la plataforma' },
    ],
  };

  const currentRoleModules = roleModules[role || 'client'] || [];
  const currentTab = role ? (tabs as any)[role] : '';
  const filteredLogs = logs.filter((l) => (filter === 'all' ? true : l.level === filter));
  const errorCount = logs.filter((l) => l.level === 'error').length;

  const handleCopyLogs = () => {
    const text = [
      `=== REPORTE DE DIAGNÓSTICO MANTECHPRO ===`,
      `Usuario: ${loggedInName} (${loggedInEmail})`,
      `Rol: ${friendlyRole} | Plan: ${friendlyPlan}`,
      `Equipos: ${assets.length} | Órdenes: ${requests.length} | Técnicos: ${technicians.length}`,
      `-----------------------------------------`,
      ...logs.map((l) => `[${l.time}] [${l.level.toUpperCase()}] ${l.message}`),
    ].join('\n');
    navigator.clipboard?.writeText(text);
    toast.success('Reporte copiado al portapapeles');
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-[500] bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-[#121317] border-t sm:border border-[#5d3cfe]/40 rounded-t-3xl sm:rounded-3xl w-full max-w-2xl max-h-[86vh] flex flex-col shadow-[0_0_50px_rgba(93,60,254,0.25)] overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3.5 sm:p-5 border-b border-white/10 flex items-center justify-between gap-3 bg-[#16171d] shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#5d3cfe]/20 border border-[#5d3cfe]/40 flex items-center justify-center text-[#52ffac] shrink-0">
                  <Terminal className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs sm:text-sm font-black text-white uppercase tracking-wide truncate">
                    Accesos y Diagnóstico
                  </h3>
                  <p className="text-[10px] font-bold text-[#8a879d] truncate mt-0.5">
                    Perfil: <span className="text-[#52ffac]">{friendlyRole}</span> • Plan:{' '}
                    <span className="text-[#c7bfff]">{friendlyPlan}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-all shrink-0"
                aria-label="Cerrar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Section Switcher */}
            <div className="grid grid-cols-2 gap-2 p-2.5 sm:p-3 bg-[#0d0e12] border-b border-white/5 shrink-0">
              <button
                onClick={() => setActiveSection('modules')}
                className={`px-3 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
                  activeSection === 'modules'
                    ? 'bg-[#5d3cfe] text-white shadow-lg shadow-[#5d3cfe]/30'
                    : 'bg-white/5 text-[#8a879d] hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Secciones ({currentRoleModules.length})</span>
              </button>
              <button
                onClick={() => setActiveSection('logs')}
                className={`px-3 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
                  activeSection === 'logs'
                    ? 'bg-[#5d3cfe] text-white shadow-lg shadow-[#5d3cfe]/30'
                    : 'bg-white/5 text-[#8a879d] hover:text-white'
                }`}
              >
                <Terminal className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Actividad ({logs.length})</span>
                {errorCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[8px] shrink-0">
                    {errorCount}
                  </span>
                )}
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-3.5 sm:p-4 pb-8 space-y-3 custom-scrollbar">
              {activeSection === 'modules' ? (
                <div className="space-y-3">
                  {/* Summary Cards */}
                  <div className="bg-[#1c1d21] border border-white/10 rounded-2xl p-2.5 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                    <div className="p-2 rounded-xl bg-black/30">
                      <div className="text-[9px] text-[#8a879d] font-bold uppercase">Tu Perfil</div>
                      <div className="text-[11px] font-black text-[#52ffac] truncate mt-0.5">{friendlyRole}</div>
                    </div>
                    <div className="p-2 rounded-xl bg-black/30">
                      <div className="text-[9px] text-[#8a879d] font-bold uppercase">Equipos</div>
                      <div className="text-xs font-black text-white mt-0.5">{assets.length}</div>
                    </div>
                    <div className="p-2 rounded-xl bg-black/30">
                      <div className="text-[9px] text-[#8a879d] font-bold uppercase">Órdenes</div>
                      <div className="text-xs font-black text-white mt-0.5">{requests.length}</div>
                    </div>
                    <div className="p-2 rounded-xl bg-black/30">
                      <div className="text-[9px] text-[#8a879d] font-bold uppercase">Repuestos</div>
                      <div className="text-xs font-black text-white mt-0.5">{inventory.length}</div>
                    </div>
                  </div>

                  <p className="text-[10px] font-bold text-[#8a879d] px-1">
                    Selecciona cualquier sección para ir directamente:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pb-4">
                    {currentRoleModules.map((mod) => {
                      const isCurrent = currentTab === mod.id;
                      return (
                        <button
                          key={mod.id}
                          onClick={() => {
                            if (role) setTab(role, mod.id);
                            setIsOpen(false);
                          }}
                          className={`p-3 rounded-2xl border text-left transition-all flex items-center justify-between gap-2.5 ${
                            isCurrent
                              ? 'bg-[#5d3cfe]/20 border-[#5d3cfe] text-white'
                              : 'bg-[#1c1d21] border-white/5 hover:border-white/20 text-white active:scale-[0.99]'
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#52ffac] shrink-0" />
                              <span className="text-xs font-black uppercase truncate">{mod.label}</span>
                            </div>
                            <p className="text-[10px] text-[#8a879d] font-medium truncate mt-0.5 pl-5">{mod.desc}</p>
                          </div>
                          <span
                            className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-lg shrink-0 ${
                              isCurrent
                                ? 'bg-[#5d3cfe] text-white'
                                : 'bg-white/5 text-[#c7bfff]'
                            }`}
                          >
                            {isCurrent ? 'Actual' : 'Abrir'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="space-y-3 pb-4">
                  {/* Log filters and actions */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex gap-1.5">
                      {(
                        [
                          { id: 'all', label: 'Todos' },
                          { id: 'log', label: 'Info' },
                          { id: 'warn', label: 'Avisos' },
                          { id: 'error', label: 'Errores' },
                        ] as const
                      ).map((f) => (
                        <button
                          key={f.id}
                          onClick={() => setFilter(f.id)}
                          className={`px-2.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider ${
                            filter === f.id ? 'bg-[#5d3cfe] text-white' : 'bg-white/5 text-[#8a879d]'
                          }`}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-1.5">
                      <button
                        onClick={handleCopyLogs}
                        className="px-2.5 py-1.5 rounded-lg bg-[#52ffac]/15 text-[#52ffac] border border-[#52ffac]/30 text-[9px] font-black uppercase flex items-center gap-1"
                      >
                        <Copy className="w-3 h-3" /> Copiar
                      </button>
                      <button
                        onClick={() => {
                          globalLogs.length = 0;
                          setLogs([]);
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-rose-500/15 text-rose-400 border border-rose-500/30 text-[9px] font-black uppercase flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" /> Limpiar
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5 font-mono text-[11px]">
                    {filteredLogs.length === 0 ? (
                      <div className="p-8 text-center text-[#8a879d] text-xs font-sans">
                        No hay registros en esta categoría.
                      </div>
                    ) : (
                      filteredLogs.map((item) => (
                        <div
                          key={item.id}
                          className={`p-2.5 rounded-xl border break-words ${
                            item.level === 'error'
                              ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                              : item.level === 'warn'
                              ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                              : 'bg-[#1c1d21] border-white/5 text-[#e3e2e8]'
                          }`}
                        >
                          <span className="text-[9px] opacity-60 mr-2">[{item.time}]</span>
                          <span>{item.message}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
