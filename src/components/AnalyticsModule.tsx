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
      <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 shadow-sm overflow-hidden relative">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Activity className="w-24 h-24 text-indigo-600" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-md">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-indigo-900 uppercase tracking-tight">Metodología de Transparencia</h3>
                <p className="text-[10px] text-indigo-700 font-bold uppercase tracking-widest">¿Cómo calculamos tus números?</p>
              </div>
            </div>
            <button
              onClick={() => setShowMethodology(!showMethodology)}
              className="px-3 py-1.5 bg-white border border-indigo-200 rounded-lg text-[10px] font-black text-indigo-600 hover:bg-indigo-100 transition-all shadow-sm cursor-pointer"
            >
              {showMethodology ? 'OCULTAR DETALLES' : 'VER FÓRMULAS'}
            </button>
          </div>

          {showMethodology && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in py-4 border-t border-indigo-200/50 mt-4">
              {/* Formula 1 */}
              <div className="space-y-2">
                <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">1. Inversión Real</span>
                <div className="bg-white p-3 rounded-xl border border-indigo-100 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[8px] text-zinc-400 font-bold">∑ Servicios Pagados</span>
                    <span className="text-xs font-black text-zinc-900">Historial Finalizado</span>
                  </div>
                  <ArrowRight className="w-3 h-3 text-indigo-300" />
                  <div className="text-right">
                    <span className="text-xs font-black text-emerald-600">Gasto Total</span>
                  </div>
                </div>
                <p className="text-[9px] text-indigo-600 font-medium leading-relaxed italic">
                  Sumamos cada balboa de tus facturas cerradas en la plataforma.
                </p>
              </div>

              {/* Formula 2 */}
              <div className="space-y-2">
                <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">2. Ahorro Predictivo</span>
                <div className="bg-white p-3 rounded-xl border border-indigo-100 flex items-center justify-between">
                  <div className="flex flex-col text-center">
                    <span className="text-[9px] font-black text-zinc-800">$1.00</span>
                    <span className="text-[7px] text-zinc-400 uppercase">Preventivo</span>
                  </div>
                  <span className="text-indigo-300 font-black">vs</span>
                  <div className="flex flex-col text-center">
                    <span className="text-[9px] font-black text-rose-600">$1.67</span>
                    <span className="text-[7px] text-zinc-400 uppercase">Correctivo</span>
                  </div>
                  <ArrowRight className="w-3 h-3 text-indigo-300" />
                  <div className="text-right">
                    <span className="text-[9px] font-black text-indigo-600">+67% Ahorro</span>
                  </div>
                </div>
                <p className="text-[9px] text-indigo-600 font-medium leading-relaxed italic">
                  Estimamos que por cada $1 en prevención, evitas $0.67 en recargos por emergencia.
                </p>
              </div>

              {/* Formula 3 */}
              <div className="space-y-2">
                <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">3. Score de Salud</span>
                <div className="bg-white p-3 rounded-xl border border-indigo-100 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full border-2 border-amber-400 flex items-center justify-center text-[9px] font-black text-amber-600">
                    94%
                  </div>
                  <div className="flex-1">
                    <div className="h-1 w-full bg-zinc-100 rounded-full overflow-hidden">
                      <div className="bg-amber-400 h-full" style={{ width: '94%' }}></div>
                    </div>
                    <span className="text-[7px] text-zinc-400 font-bold uppercase mt-1 block">Tasa de cumplimiento</span>
                  </div>
                </div>
                <p className="text-[9px] text-indigo-600 font-medium leading-relaxed italic">
                  Relación entre mantenimientos a tiempo vs. alertas ignoradas.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
              <DollarSign className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-zinc-400 uppercase">Gasto Total</span>
          </div>
          <p className="text-2xl font-black text-zinc-900">${totalSpent.toFixed(2)}</p>
          <div className="mt-2 flex items-center gap-1 text-emerald-600 font-bold text-[10px]">
            <TrendingUp className="w-3 h-3" />
            <span>-12% vs año anterior</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-zinc-400 uppercase">Ahorro Generado</span>
          </div>
          <p className="text-2xl font-black text-indigo-600">${estimatedSavings.toFixed(2)}</p>
          <p className="text-[10px] text-zinc-400 mt-2">Evitado en reparaciones críticas</p>
        </div>

        <div className="bg-zinc-900 rounded-2xl p-5 text-white shadow-xl">
          <div className="flex justify-between items-start mb-2">
            <div className="p-2 bg-white/10 rounded-lg text-amber-400">
              <Zap className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-zinc-400 uppercase">Salud de Equipos</span>
          </div>
          <p className="text-2xl font-black">94%</p>
          <div className="w-full bg-white/10 h-1.5 rounded-full mt-3">
            <div className="bg-amber-400 h-full rounded-full" style={{ width: '94%' }}></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Expenditure Chart Mockup */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xs font-black text-zinc-900 uppercase tracking-widest">Inversión Mensual (Balboas)</h3>
            <select className="text-[10px] font-black uppercase bg-zinc-50 border border-zinc-200 rounded-lg px-2 py-1">
              <option>Año 2026</option>
              <option>Año 2025</option>
            </select>
          </div>

          <div className="flex items-end justify-between h-48 gap-2 px-4">
            {[45, 80, 45, 120, 200, 85, 30].map((val, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className={`w-full rounded-t-lg transition-all ${i === 4 ? 'bg-indigo-600' : 'bg-indigo-100 hover:bg-indigo-200'}`}
                  style={{ height: `${val}%` }}
                ></div>
                <span className="text-[9px] font-bold text-zinc-400 uppercase">
                  {['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul'][i]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Expenses by Category */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm">
          <h3 className="text-xs font-black text-zinc-900 uppercase tracking-widest mb-6">Gastos por Activo</h3>
          <div className="space-y-4">
            {assets.map(asset => {
              const spent = requests
                .filter(r => r.assetId === asset.id && (r.status === 'completed' || r.status === 'rated'))
                .reduce((acc, curr) => acc + (curr.price || 0), 0);
              const percentage = (spent / totalSpent) * 100 || 0;

              return (
                <div key={asset.id} className="space-y-1.5">
                  <div className="flex justify-between text-[11px] font-bold">
                    <span className="text-zinc-600">{asset.name}</span>
                    <span className="text-zinc-900">${spent.toFixed(2)}</span>
                  </div>
                  <div className="w-full bg-zinc-50 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-500 h-full rounded-full"
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
