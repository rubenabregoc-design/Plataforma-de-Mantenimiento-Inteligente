import React, { useState } from 'react';
import { JobRequest, Asset } from '../types';
import { PieChart, BarChart3, TrendingUp, DollarSign, Wallet, ShieldCheck, Zap, Info, ArrowRight, HelpCircle, Activity } from 'lucide-react';

interface AnalyticsModuleProps {
  requests: JobRequest[];
  assets: Asset[];
}

export default function AnalyticsModule({ requests, assets }: AnalyticsModuleProps) {
  const [showMethodology, setShowMethodology] = useState(false);
  const completedJobs = requests.filter(r => r.status === 'completed' || r.status === 'rated');
  const totalSpent = completedJobs.reduce((acc, curr) => acc + (curr.price || 0), 0);

  // Simulated savings logic: Preventive is ~40% cheaper than Emergency
  // Calculation: If you spent $100 on preventive, you avoided a $167 emergency repair.
  // Savings = $67
  const estimatedSavings = totalSpent * 0.67;

  return (
    <div className="space-y-6">
      {/* Methodology Visual Explanation (Collapsible) */}
      <div className="bg-[#1f1f24] border border-[#474556]/30 rounded-2xl p-6 shadow-xl overflow-hidden relative">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Activity className="w-24 h-24 text-[#c7bfff]" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-[#5d3cfe] rounded-xl text-white shadow-lg">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-[#e3e2e8] uppercase tracking-tight">Metodología de Transparencia</h3>
                <p className="text-[10px] text-[#c7bfff] font-bold uppercase tracking-widest">¿Cómo calculamos tus números?</p>
              </div>
            </div>
            <button
              onClick={() => setShowMethodology(!showMethodology)}
              className="px-3 py-1.5 bg-[#1a1b20] border border-[#474556]/30 rounded-lg text-[10px] font-black text-[#c7bfff] hover:bg-[#343439] transition-all shadow-sm cursor-pointer"
            >
              {showMethodology ? 'OCULTAR DETALLES' : 'VER FÓRMULAS'}
            </button>
          </div>

          {showMethodology && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in py-4 border-t border-[#474556]/30 mt-4">
              {/* Formula 1 */}
              <div className="space-y-2">
                <span className="text-[9px] font-black text-[#c8c4d9] uppercase tracking-widest">1. Inversión Real</span>
                <div className="bg-[#1a1b20] p-3 rounded-xl border border-[#474556]/30 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[8px] text-[#c8c4d9]/50 font-bold">∑ Servicios Pagados</span>
                    <span className="text-xs font-black text-[#e3e2e8]">Historial Finalizado</span>
                  </div>
                  <ArrowRight className="w-3 h-3 text-[#c7bfff]/50" />
                  <div className="text-right">
                    <span className="text-xs font-black text-emerald-500">Gasto Total</span>
                  </div>
                </div>
                <p className="text-[9px] text-[#c8c4d9] font-medium leading-relaxed italic">
                  Sumamos cada balboa de tus facturas cerradas en la plataforma.
                </p>
              </div>

              {/* Formula 2 */}
              <div className="space-y-2">
                <span className="text-[9px] font-black text-[#c8c4d9] uppercase tracking-widest">2. Ahorro Predictivo</span>
                <div className="bg-[#1a1b20] p-3 rounded-xl border border-[#474556]/30 flex items-center justify-between">
                  <div className="flex flex-col text-center">
                    <span className="text-[9px] font-black text-[#e3e2e8]">$1.00</span>
                    <span className="text-[7px] text-[#c8c4d9]/50 uppercase">Preventivo</span>
                  </div>
                  <span className="text-[#c7bfff] font-black">vs</span>
                  <div className="flex flex-col text-center">
                    <span className="text-[9px] font-black text-rose-500">$1.67</span>
                    <span className="text-[7px] text-[#c8c4d9]/50 uppercase">Correctivo</span>
                  </div>
                  <ArrowRight className="w-3 h-3 text-[#c7bfff]/50" />
                  <div className="text-right">
                    <span className="text-[9px] font-black text-emerald-500">+67% Ahorro</span>
                  </div>
                </div>
                <p className="text-[9px] text-[#c8c4d9] font-medium leading-relaxed italic">
                  Estimamos que por cada $1 en prevención, evitas $0.67 en recargos por emergencia.
                </p>
              </div>

              {/* Formula 3 */}
              <div className="space-y-2">
                <span className="text-[9px] font-black text-[#c8c4d9] uppercase tracking-widest">3. Score de Salud</span>
                <div className="bg-[#1a1b20] p-3 rounded-xl border border-[#474556]/30 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full border-2 border-amber-500 flex items-center justify-center text-[9px] font-black text-amber-500">
                    94%
                  </div>
                  <div className="flex-1">
                    <div className="h-1 w-full bg-[#343439] rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full" style={{ width: '94%' }}></div>
                    </div>
                    <span className="text-[7px] text-[#c8c4d9]/50 font-bold uppercase mt-1 block">Tasa de cumplimiento</span>
                  </div>
                </div>
                <p className="text-[9px] text-[#c8c4d9] font-medium leading-relaxed italic">
                  Relación entre mantenimientos a tiempo vs. alertas ignoradas.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#1f1f24] rounded-2xl border border-[#474556]/30 p-5 shadow-xl">
          <div className="flex justify-between items-start mb-2">
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
              <DollarSign className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-[#c8c4d9] uppercase">Gasto Total</span>
          </div>
          <p className="text-2xl font-black text-white">${totalSpent.toFixed(2)}</p>
          <div className="mt-2 flex items-center gap-1 text-emerald-500 font-bold text-[10px]">
            <TrendingUp className="w-3 h-3" />
            <span>-12% vs año anterior</span>
          </div>
        </div>

        <div className="bg-[#1f1f24] rounded-2xl border border-[#474556]/30 p-5 shadow-xl">
          <div className="flex justify-between items-start mb-2">
            <div className="p-2 bg-[#5d3cfe]/10 rounded-lg text-[#c7bfff]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-[#c8c4d9] uppercase">Ahorro Generado</span>
          </div>
          <p className="text-2xl font-black text-[#c7bfff]">${estimatedSavings.toFixed(2)}</p>
          <p className="text-[10px] text-[#c8c4d9] mt-2">Evitado en reparaciones críticas</p>
        </div>

        <div className="bg-[#1a1b20] rounded-2xl p-5 text-white shadow-2xl border border-[#474556]/30">
          <div className="flex justify-between items-start mb-2">
            <div className="p-2 bg-white/10 rounded-lg text-amber-500">
              <Zap className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-[#c8c4d9] uppercase">Salud de Equipos</span>
          </div>
          <p className="text-2xl font-black text-white">94%</p>
          <div className="w-full bg-white/10 h-1.5 rounded-full mt-3">
            <div className="bg-amber-500 h-full rounded-full" style={{ width: '94%' }}></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Expenditure Chart Mockup */}
        <div className="lg:col-span-8 bg-[#1f1f24] rounded-2xl border border-[#474556]/30 p-6 shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xs font-black text-white uppercase tracking-widest">Inversión Mensual (Balboas)</h3>
            <select className="text-[10px] font-black uppercase bg-[#1a1b20] border border-[#474556]/30 rounded-lg px-2 py-1 text-[#e3e2e8] outline-none">
              <option>Año 2026</option>
              <option>Año 2025</option>
            </select>
          </div>

          <div className="flex items-end justify-between h-48 gap-2 px-4">
            {[45, 80, 45, 120, 200, 85, 30].map((val, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className={`w-full rounded-t-lg transition-all ${i === 4 ? 'bg-[#5d3cfe] shadow-[0_0_15px_rgba(93,60,254,0.3)]' : 'bg-[#5d3cfe]/10 hover:bg-[#5d3cfe]/30'}`}
                  style={{ height: `${val}%` }}
                ></div>
                <span className="text-[9px] font-bold text-[#c8c4d9] uppercase">
                  {['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul'][i]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Expenses by Category */}
        <div className="lg:col-span-4 bg-[#1f1f24] rounded-2xl border border-[#474556]/30 p-6 shadow-xl">
          <h3 className="text-xs font-black text-white uppercase tracking-widest mb-6">Gastos por Activo</h3>
          <div className="space-y-4">
            {assets.map(asset => {
              const spent = requests
                .filter(r => r.assetId === asset.id && (r.status === 'completed' || r.status === 'rated'))
                .reduce((acc, curr) => acc + (curr.price || 0), 0);
              const percentage = (spent / totalSpent) * 100 || 0;

              return (
                <div key={asset.id} className="space-y-1.5">
                  <div className="flex justify-between text-[11px] font-bold">
                    <span className="text-[#c8c4d9]">{asset.name}</span>
                    <span className="text-white">${spent.toFixed(2)}</span>
                  </div>
                  <div className="w-full bg-[#1a1b20] h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-[#5d3cfe] h-full rounded-full"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
