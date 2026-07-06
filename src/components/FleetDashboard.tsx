import React, { useState } from 'react';
import { Asset, MaintenanceReminder } from '../types';
import {
  LayoutGrid, List, MapPin, AlertCircle, CheckCircle2, TrendingUp, Search, Filter,
  ChevronRight, Car, Wind, Cpu, Zap, Building2, Code, Phone, ShieldCheck
} from 'lucide-react';

interface FleetDashboardProps {
  assets: Asset[];
  reminders: MaintenanceReminder[];
  onManageAsset?: (asset: Asset) => void;
}

export default function FleetDashboard({ assets, reminders, onManageAsset }: FleetDashboardProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [activeSubTab, setActiveSubTab] = useState<'fleet' | 'api' | 'support'>('fleet');

  const totalAssets = assets.length;
  const urgentCount = reminders.filter(r => r.status === 'urgent').length;
  const healthScore = totalAssets > 0 ? Math.round(((totalAssets - urgentCount) / totalAssets) * 100) : 100;

  return (
    <div className="space-y-6">
      {/* Fleet Navigation Tabs */}
      <div className="flex bg-[#1a1b20] p-1.5 rounded-2xl w-fit border border-[#474556]/30">
        <button
          onClick={() => setActiveSubTab('fleet')}
          className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${activeSubTab === 'fleet' ? 'bg-[#5d3cfe] text-white shadow-sm' : 'text-[#c8c4d9] hover:text-white'}`}
        >
          Monitor de Flota
        </button>
        <button
          onClick={() => setActiveSubTab('api')}
          className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${activeSubTab === 'api' ? 'bg-[#5d3cfe] text-white shadow-sm' : 'text-[#c8c4d9] hover:text-white'}`}
        >
          API Integración
        </button>
        <button
          onClick={() => setActiveSubTab('support')}
          className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${activeSubTab === 'support' ? 'bg-[#5d3cfe] text-white shadow-sm' : 'text-[#c8c4d9] hover:text-white'}`}
        >
          Gerente Dedicado
        </button>
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
              <p className="text-3xl font-black text-[#c7bfff]">12</p>
              <p className="text-[10px] text-[#c8c4d9] mt-2 italic">Próximos 30 días</p>
            </div>
          </div>

          {/* Fleet Controls */}
          <div className="bg-[#1f1f24] rounded-[1.5rem] border border-[#474556]/30 p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
            <div className="flex-1 min-w-[250px] relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#c8c4d9]" />
              <input
                type="text"
                placeholder="Filtrar por placa, ID de equipo, ubicación..."
                className="w-full pl-10 pr-4 py-2 bg-[#1a1b20] border border-[#474556]/30 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-[#5d3cfe] text-white"
              />
            </div>

            <div className="flex gap-2">
              <div className="bg-[#1a1b20] p-1 rounded-xl flex border border-[#474556]/30">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-[#5d3cfe] shadow-sm text-white' : 'text-[#c8c4d9]'}`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'table' ? 'bg-[#5d3cfe] shadow-sm text-white' : 'text-[#c8c4d9]'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
              <button className="px-4 py-2 bg-[#5d3cfe] text-white rounded-xl text-xs font-black uppercase flex items-center gap-2 hover:bg-[#5d3cfe]/80 shadow-lg shadow-[#5d3cfe]/20">
                <Filter className="w-3 h-3" />
                Filtros Avanzados
              </button>
            </div>
          </div>

          {/* Assets Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {assets.map((asset) => {
              const isUrgent = reminders.some(r => r.assetId === asset.id && r.status === 'urgent');
              return (
                <div key={asset.id} className={`bg-[#1f1f24] rounded-2xl border transition-all p-4 hover:shadow-xl cursor-pointer group ${isUrgent ? 'border-rose-500/50 bg-rose-500/5' : 'border-[#474556]/30'}`}>
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-2 rounded-xl ${isUrgent ? 'bg-rose-500/20 text-rose-500' : 'bg-[#5d3cfe]/20 text-[#c7bfff]'}`}>
                      {asset.type === 'car' && <Car className="w-5 h-5" />}
                      {asset.type === 'ac' && <Wind className="w-5 h-5" />}
                      {asset.type === 'computer' && <Cpu className="w-5 h-5" />}
                      {asset.type === 'generator' && <Zap className="w-5 h-5" />}
                    </div>
                    <div className="flex flex-col items-end">
                      <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full border ${isUrgent ? 'bg-rose-500/10 text-rose-500 border-rose-500/30' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'}`}>
                        {isUrgent ? 'CRÍTICO' : 'OPERATIVO'}
                      </span>
                      <span className="text-[8px] text-[#c8c4d9] font-bold mt-1 uppercase">{asset.type}</span>
                    </div>
                  </div>

                  <h4 className="font-black text-white text-xs tracking-tight">{asset.name}</h4>
                  <p className="text-[10px] text-[#c8c4d9] truncate mb-2">{asset.details}</p>

                  {asset.observations && (
                    <div className="mb-4 p-2 bg-[#0d0e12] rounded-lg border border-[#2a2b2f] border-l-2 border-l-amber-500">
                      <p className="text-[8px] font-black text-amber-500 uppercase mb-1">Observaciones</p>
                      <p className="text-[9px] text-[#c8c4d9] line-clamp-2 italic leading-tight">"{asset.observations}"</p>
                    </div>
                  )}

                  <div className="space-y-2 border-t border-[#474556]/30 pt-3">
                    <div className="flex justify-between text-[9px] font-bold">
                      <span className="text-[#c8c4d9]/50 uppercase tracking-widest">Ubicación</span>
                      <span className="text-white">{asset.location || 'Sede Central'}</span>
                    </div>
                    <div className="flex justify-between text-[9px] font-bold">
                      <span className="text-[#c8c4d9]/50 uppercase tracking-widest">Siguiente Mtto.</span>
                      <span className={isUrgent ? 'text-rose-500' : 'text-[#c7bfff]'}>{asset.nextMaintenanceDate}</span>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if(onManageAsset) onManageAsset(asset);
                    }}
                    className="w-full mt-4 flex items-center justify-center gap-2 py-2 rounded-xl bg-[#1a1b20] text-[#c8c4d9] text-[9px] font-black uppercase group-hover:bg-[#5d3cfe] group-hover:text-white transition-all shadow-xs border border-[#474556]/30 active:scale-95"
                  >
                    Gestionar Activo
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}

      {activeSubTab === 'api' && (
        <div className="bg-[#1f1f24] rounded-[1.5rem] border border-[#474556]/30 p-8 shadow-xl space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-[#5d3cfe]/10 rounded-2xl text-[#c7bfff]">
              <Code className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white uppercase tracking-tight">API de Integración Empresarial</h3>
              <p className="text-[10px] text-[#c8c4d9] font-bold uppercase tracking-widest">Conecta tus sistemas ERP/CRM con MantechPro</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-[#121317] rounded-2xl p-6 text-[#c7bfff] font-mono text-xs overflow-x-auto border border-[#474556]/30 shadow-inner custom-scrollbar">
              <p className="mb-2 text-[#474556]">// Ejemplo: Enviar alerta de mantenimiento desde tu sistema</p>
              <p>POST https://api.mantechpro.com/v1/fleet/alerts</p>
              <p>Authorization: Bearer YOUR_API_TOKEN</p>
              <br/>
              <p>{"{"}</p>
              <p className="pl-4">"assetId": "EQUIPO-452",</p>
              <p className="pl-4">"type": "oil_change",</p>
              <p className="pl-4">"priority": "high",</p>
              <p className="pl-4">"currentMetrics": {"{ \"mileage\": 50024 }"}</p>
              <p>{"}"}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
              <div className="p-4 bg-[#1a1b20] rounded-2xl border border-[#474556]/30">
                <span className="text-[9px] font-black text-[#c7bfff] uppercase">Token de Acceso</span>
                <p className="text-xs font-mono font-bold text-white mt-1">mantech_live_4k82...9x2m</p>
              </div>
              <button className="flex items-center justify-center gap-2 bg-[#5d3cfe] text-white rounded-2xl font-black text-[10px] uppercase transition-all hover:bg-[#5d3cfe]/80 shadow-lg shadow-[#5d3cfe]/20">
                Generar Nuevo Token
              </button>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'support' && (
        <div className="bg-[#1f1f24] rounded-[1.5rem] border border-[#474556]/30 p-8 shadow-xl space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-500">
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white uppercase tracking-tight">Tu Gerente de Cuenta VIP</h3>
              <p className="text-[10px] text-[#c8c4d9] font-bold uppercase tracking-widest">Soporte Estratégico y Mediación Directa</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-8 bg-[#1a1b20] p-6 rounded-[2rem] border border-[#474556]/30">
            <div className="w-24 h-24 rounded-full bg-[#5d3cfe]/10 border-4 border-[#1f1f24] shadow-xl flex items-center justify-center text-2xl font-black text-[#c7bfff]">
              JP
            </div>
            <div className="text-center md:text-left space-y-1 flex-1">
              <h4 className="text-xl font-black text-white">Juan Pablo Castillo</h4>
              <p className="text-xs font-bold text-[#c7bfff] uppercase tracking-wide">Key Account Manager - División Corporativa</p>
              <div className="pt-4 flex flex-wrap justify-center md:justify-start gap-3">
                <button className="px-4 py-2 bg-white text-[#121317] rounded-xl text-[9px] font-black uppercase hover:bg-white/90 transition-all">WhatsApp Directo</button>
                <button className="px-4 py-2 bg-[#343439] border border-[#474556]/30 text-white rounded-xl text-[9px] font-black uppercase hover:bg-[#474556] transition-all">Solicitar Reunión</button>
              </div>
            </div>
            <div className="p-4 bg-[#1f1f24] rounded-2xl border border-[#474556]/30 shadow-sm text-center min-w-[150px]">
              <span className="text-[8px] font-black text-[#c8c4d9]/50 uppercase">Tiempo de Respuesta</span>
              <p className="text-sm font-black text-emerald-500 mt-0.5">&lt; 15 Minutos</p>
              <div className="flex justify-center gap-0.5 mt-2">
                {[1,2,3,4,5].map(s => <ShieldCheck key={s} className="w-2.5 h-2.5 fill-emerald-500 text-emerald-500" />)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
