import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  DollarSign, TrendingUp, Star, Users, Truck, Package,
  BellRing, Settings, FileText, Check, Trash2, ShieldCheck,
  Plus, Store, AlertTriangle
} from 'lucide-react';
import AuditLogsModule from '../../components/AuditLogsModule';
import InventoryModule from '../../components/InventoryModule';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import { useBusinessLogic } from '../../hooks/useBusinessLogic';
import Skeleton from '../../components/Skeleton';

export default function AdminDashboard() {
  const { assets, requests, technicians, inventory, isDataLoading, reminders } = useData();
  const { logout } = useAuth();
  const { tabs, openModal } = useUI();
  const business = useBusinessLogic();

  const adminTab = tabs.admin;

  // --- Lógica Financiera Real ---
  const completedRequests = requests.filter(r => r.status === 'completed' || r.status === 'rated');
  const grossIncome = completedRequests.reduce((sum, r) => sum + (r.price || 0), 0);
  const totalCommissions = completedRequests.reduce((sum, r) => sum + (r.commission || 0), 0);

  // Membresías: Estimación basada en planes activos (Simulado con data de usuarios)
  const activeSubscriptions = technicians.length * 29; // Placeholder para suscripciones reales

  return (
    <div className="space-y-12 animate-fade-in-up">
      {adminTab === 'audit' && (
        <AuditLogsModule logs={[]} />
      )}

      {adminTab === 'finance' && (
        <div className="space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#121317] border border-[#2a2b2f] p-10 rounded-[3rem] shadow-2xl relative overflow-hidden group">
              <span className="text-[10px] font-black text-[#474556] uppercase tracking-[0.3em] block mb-4">Ingresos Brutos Reales</span>
              <h2 className="text-6xl font-black text-white italic tracking-tighter leading-none">${grossIncome.toLocaleString()}</h2>
              <div className="absolute -bottom-4 -right-4 opacity-5 group-hover:opacity-10 transition-opacity"><DollarSign className="w-32 h-32" /></div>
            </div>
            <div className="bg-[#121317] border border-[#2a2b2f] p-10 rounded-[3rem] shadow-2xl relative overflow-hidden group">
              <span className="text-[10px] font-black text-[#474556] uppercase tracking-[0.3em] block mb-4">Comisiones de Red</span>
              <h2 className="text-6xl font-black text-[#5d3cfe] italic tracking-tighter leading-none">${totalCommissions.toLocaleString()}</h2>
              <div className="absolute -bottom-4 -right-4 opacity-5 group-hover:opacity-10 transition-opacity"><TrendingUp className="w-32 h-32" /></div>
            </div>
            <div className="bg-[#121317] border border-[#2a2b2f] p-10 rounded-[3rem] shadow-2xl relative overflow-hidden group">
              <span className="text-[10px] font-black text-[#474556] uppercase tracking-[0.3em] block mb-4">Membresías Est.</span>
              <h2 className="text-6xl font-black text-amber-500 italic tracking-tighter leading-none">${activeSubscriptions.toLocaleString()}</h2>
              <div className="absolute -bottom-4 -right-4 opacity-5 group-hover:opacity-10 transition-opacity"><Star className="w-32 h-32" /></div>
            </div>
          </div>

          {/* Suscripciones Pendientes (Inyectando Lógica Real) */}
          <div className="bg-[#121317] border border-[#2a2b2f] p-10 rounded-[3rem] shadow-2xl space-y-8">
             <header><h1 className="text-2xl font-black text-white uppercase tracking-tighter">Gestión de <span className="text-amber-500">Pagos Yappy</span></h1></header>
             <div className="grid grid-cols-1 gap-4">
                {requests.filter(r => r.status === 'pending_verification').map(r => (
                  <div key={r.id} className="p-6 bg-[#1c1d21] border border-amber-500/20 rounded-3xl flex justify-between items-center group animate-pulse hover:animate-none">
                     <div className="flex gap-6 items-center">
                        <div className="p-4 bg-amber-500/10 rounded-2xl text-amber-500">
                           <DollarSign className="w-6 h-6" />
                        </div>
                        <div>
                           <h4 className="text-sm font-black text-white uppercase tracking-tight">{r.clientName}</h4>
                           <p className="text-[10px] font-bold text-[#c8c4d9] mt-1 uppercase">Monto: ${r.price} - Activo: {r.assetName}</p>
                        </div>
                     </div>
                     <button onClick={() => business.handleConfirmPayment(r.id)} className="px-8 py-3 bg-amber-500 text-black rounded-xl text-[9px] font-black uppercase tracking-widest shadow-xl">Verificar Pago ➔</button>
                  </div>
                ))}
                {requests.filter(r => r.status === 'pending_verification').length === 0 && (
                   <p className="text-[10px] text-[#474556] font-bold uppercase italic ml-4">No hay pagos pendientes de revisión.</p>
                )}
             </div>
          </div>
        </div>
      )}

      {adminTab === 'users' && (
        <div className="bg-[#121317] border border-[#2a2b2f] p-10 rounded-[3rem] shadow-2xl space-y-8">
          <header><h1 className="text-4xl font-black text-white uppercase tracking-tighter">Maestro de <span className="text-[#5d3cfe]">Usuarios</span></h1></header>
          <table className="w-full text-left text-xs">
            <thead><tr className="border-b border-[#2a2b2f] text-[#474556] uppercase font-black"><th className="py-4 px-6">Nombre del Especialista</th><th className="py-4 px-6 text-right">Estatus Oficial</th></tr></thead>
            <tbody className="divide-y divide-[#1c1d21]">
              {technicians.map(t => (
                <tr key={t.id} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="py-6 px-6 font-black text-white uppercase">{t.name}</td>
                  <td className="py-6 px-6 text-right">
                     <button onClick={() => business.handleVerifyTechnician?.(t.id, !t.isVerified)} className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase transition-all ${t.isVerified ? 'bg-rose-500 text-white' : 'bg-[#52ffac] text-black shadow-lg shadow-[#52ffac]/20'}`}>{t.isVerified ? 'Suspender' : 'Aprobar Sello'}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {adminTab === 'inventory' && <InventoryModule items={inventory} assets={assets} onUpdateQuantity={() => {}} onAddItem={() => {}} onDeleteItem={() => {}} onUpdateItem={() => {}} />}

      {adminTab === 'settings' && (
        <div className="bg-[#121317] border border-[#2a2b2f] p-10 rounded-[3rem] shadow-2xl text-center">
          <header className="mb-10 text-center"><h1 className="text-4xl font-black text-white tracking-tighter uppercase">Consola <span className="text-[#5d3cfe]">Root Mantech</span></h1></header>
          <button onClick={logout} className="px-12 py-5 bg-rose-600/10 border border-rose-600/20 text-rose-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all shadow-xl">Desconectar Nodo Maestro</button>
        </div>
      )}
    </div>
  );
}
