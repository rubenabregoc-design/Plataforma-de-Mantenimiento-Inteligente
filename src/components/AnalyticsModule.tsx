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

  const estimatedSavings = totalSpent * 0.67;

  return (
    <div className="space-y-6">
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
              </div>
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
                </div>
              </div>
              <div className="space-y-2">
                <span className="text-[9px] font-black text-[#c8c4d9] uppercase tracking-widest">3. Score de Salud</span>
                <div className="bg-[#1a1b20] p-3 rounded-xl border border-[#474556]/30 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full border-2 border-amber-500 flex items-center justify-center text-[9px] font-black text-amber-500">
                    94%
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#1f1f24] rounded-2xl border border-[#474556]/30 p-5 shadow-xl">
          <div className="flex justify-between items-start mb-2">
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
              <DollarSign className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-[#c8c4d9] uppercase">Gasto Total</span>
          </div>
          <p className="text-2xl font-black text-white">${totalSpent.toFixed(2)}</p>
        </div>

        <div className="bg-[#1f1f24] rounded-2xl border border-[#474556]/30 p-5 shadow-xl">
          <div className="flex justify-between items-start mb-2">
            <div className="p-2 bg-[#5d3cfe]/10 rounded-lg text-[#c7bfff]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-[#c8c4d9] uppercase">Ahorro Generado</span>
          </div>
          <p className="text-2xl font-black text-[#c7bfff]">${estimatedSavings.toFixed(2)}</p>
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
    </div>
  );
}
