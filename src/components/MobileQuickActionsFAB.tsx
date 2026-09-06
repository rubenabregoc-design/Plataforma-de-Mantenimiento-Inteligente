import React from 'react';
import { Plus, X, QrCode, AlertTriangle, ShieldCheck, Wrench, Headset, ChevronRight } from 'lucide-react';
import { triggerHaptic } from '../hooks/useAndroidNative';
import { useUI } from '../context/UIContext';

interface MobileQuickActionsFABProps {
  role: 'client' | 'tech' | 'admin' | null;
}

export default function MobileQuickActionsFAB({ role }: MobileQuickActionsFABProps) {
  const { modals, openModal, closeModal, setTab } = useUI();

  if (!role || role === 'admin') return null;

  const isOpen = modals.quickActions;

  const handleAction = (action: () => void) => {
    triggerHaptic('medium');
    action();
    closeModal('quickActions');
  };

  const handleClose = () => {
    triggerHaptic('light');
    closeModal('quickActions');
  };

  if (!isOpen) return null;

  return (
    <div className="md:hidden fixed inset-0 z-[220] flex flex-col justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />

      {/* Action Sheet Panel */}
      <div
        className="relative bg-[#121317] border-t border-[#2a2b2f]/80 rounded-t-[2rem] shadow-[0_-20px_60px_rgba(0,0,0,0.85)] p-5 pb-[max(env(safe-area-inset-bottom),1.5rem)] animate-in slide-in-from-bottom duration-250 flex flex-col"
        style={{ animation: 'slideUp 0.25s cubic-bezier(0.32, 0.72, 0, 1) forwards' }}
      >
        {/* Drag Handle */}
        <div className="flex justify-center -mt-1 mb-3">
          <div className="w-10 h-1 bg-white/20 rounded-full" />
        </div>

        {/* Sheet Header */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#5d3cfe] to-[#8a6eff] flex items-center justify-center text-white shadow-md shadow-[#5d3cfe]/30">
              <Plus className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider leading-none">
                Acciones Rápidas
              </h3>
              <p className="text-[10px] font-bold text-[#8e8d9a] mt-0.5">
                Operaciones inmediatas para su cuenta
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-xl bg-white/5 text-[#8e8d9a] hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Items List */}
        <div className="space-y-2.5">
          {role === 'client' && (
            <>
              <button
                onClick={() => handleAction(() => openModal('asset'))}
                className="w-full flex items-center justify-between p-3.5 bg-[#1c1d21] border border-[#5d3cfe]/30 hover:border-[#5d3cfe] rounded-2xl active:scale-98 transition-all group shadow-lg"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#5d3cfe] to-[#7f62ff] flex items-center justify-center text-white shadow-md shadow-[#5d3cfe]/30">
                    <Plus className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <div className="text-left">
                    <h4 className="text-xs font-black text-white uppercase tracking-wider">Nuevo Equipo</h4>
                    <p className="text-[10px] text-[#8e8d9a] font-bold">Registrar activo, maquinaria o vehículo</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#8e8d9a] group-hover:text-white group-hover:translate-x-0.5 transition-all" />
              </button>

              <button
                onClick={() => handleAction(() => openModal('scanner'))}
                className="w-full flex items-center justify-between p-3.5 bg-[#1c1d21] border border-white/10 hover:border-[#52ffac]/50 rounded-2xl active:scale-98 transition-all group shadow-lg"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#52ffac]/15 border border-[#52ffac]/30 flex items-center justify-center text-[#52ffac] shadow-md">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <h4 className="text-xs font-black text-white uppercase tracking-wider">Escanear QR</h4>
                    <p className="text-[10px] text-[#8e8d9a] font-bold">Consultar ficha técnica al instante</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#8e8d9a] group-hover:text-white group-hover:translate-x-0.5 transition-all" />
              </button>

              <button
                onClick={() => handleAction(() => openModal('chatbot'))}
                className="w-full flex items-center justify-between p-3.5 bg-[#1c1d21] border border-[#5d3cfe]/20 hover:border-[#5d3cfe]/50 rounded-2xl active:scale-98 transition-all group shadow-lg"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#5d3cfe]/20 to-[#52ffac]/20 border border-[#5d3cfe]/40 flex items-center justify-center text-[#52ffac] shadow-md">
                    <Headset className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-black text-white uppercase tracking-wider">Asesor IA 24/7</h4>
                      <span className="px-1.5 py-0.5 rounded-full text-[8px] font-black uppercase bg-[#52ffac]/20 text-[#52ffac]">En línea</span>
                    </div>
                    <p className="text-[10px] text-[#8e8d9a] font-bold">Diagnósticos, cotizaciones y dudas</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#8e8d9a] group-hover:text-white group-hover:translate-x-0.5 transition-all" />
              </button>

              <button
                onClick={() => handleAction(() => openModal('support'))}
                className="w-full flex items-center justify-between p-3.5 bg-[#1c1d21] border border-rose-500/30 hover:border-rose-500 rounded-2xl active:scale-98 transition-all group shadow-lg"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shadow-md">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <h4 className="text-xs font-black text-rose-400 uppercase tracking-wider">SOS Soporte</h4>
                    <p className="text-[10px] text-[#8e8d9a] font-bold">Asistencia prioritaria o avería crítica</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#8e8d9a] group-hover:text-white group-hover:translate-x-0.5 transition-all" />
              </button>
            </>
          )}

          {role === 'tech' && (
            <>
              <button
                onClick={() => handleAction(() => openModal('scanner'))}
                className="w-full flex items-center justify-between p-3.5 bg-[#1c1d21] border border-[#5d3cfe]/40 rounded-2xl active:scale-98 transition-all group shadow-lg"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#5d3cfe] flex items-center justify-center text-white shadow-md">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <h4 className="text-xs font-black text-white uppercase tracking-wider">Escanear QR Activo</h4>
                    <p className="text-[10px] text-[#8e8d9a] font-bold">Identificar equipo del cliente en sitio</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#8e8d9a]" />
              </button>

              <button
                onClick={() => handleAction(() => setTab('tech', 'bidding_market'))}
                className="w-full flex items-center justify-between p-3.5 bg-[#1c1d21] border border-white/10 rounded-2xl active:scale-98 transition-all group shadow-lg"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#52ffac]/20 flex items-center justify-center text-[#52ffac] shadow-md">
                    <Wrench className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <h4 className="text-xs font-black text-white uppercase tracking-wider">Bolsa de Licitaciones</h4>
                    <p className="text-[10px] text-[#8e8d9a] font-bold">Cotizar trabajos disponibles</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#8e8d9a]" />
              </button>

              <button
                onClick={() => handleAction(() => setTab('tech', 'mantech_id'))}
                className="w-full flex items-center justify-between p-3.5 bg-[#1c1d21] border border-white/10 rounded-2xl active:scale-98 transition-all group shadow-lg"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white shadow-md">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <h4 className="text-xs font-black text-white uppercase tracking-wider">Mi Carnet ID</h4>
                    <p className="text-[10px] text-[#8e8d9a] font-bold">Credencial digital verificada</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#8e8d9a]" />
              </button>

              <button
                onClick={() => handleAction(() => openModal('chatbot'))}
                className="w-full flex items-center justify-between p-3.5 bg-[#1c1d21] border border-[#5d3cfe]/30 rounded-2xl active:scale-98 transition-all group shadow-lg"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#5d3cfe]/20 to-[#52ffac]/20 border border-[#5d3cfe]/40 flex items-center justify-center text-[#52ffac] shadow-md">
                    <Headset className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <h4 className="text-xs font-black text-white uppercase tracking-wider">Asesor Técnico IA</h4>
                    <p className="text-[10px] text-[#8e8d9a] font-bold">Soporte de ingeniería y resolución</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#8e8d9a]" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
