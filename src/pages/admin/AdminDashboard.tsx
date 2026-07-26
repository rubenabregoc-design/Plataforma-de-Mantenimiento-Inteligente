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

interface AdminDashboardProps {
  adminTab: string;
  handleApproveSubscription: (userId: string, planId: string) => void;
  handleConfirmPayment: (requestId: string) => void;
  handleVerifyTechnician: (techId: string, val: boolean) => void;
  handleDeleteAsset: (id: string) => void;
  handleLogout: () => void;
}

export default function AdminDashboard(props: AdminDashboardProps) {
  const { assets, requests, technicians, inventory, isDataLoading, reminders } = useData();
  const {
    adminTab, handleApproveSubscription, handleConfirmPayment,
    handleVerifyTechnician, handleDeleteAsset, handleLogout
  } = props;

  return (
    <div className="space-y-12 animate-fade-in-up">
      {adminTab === 'audit' && (
        <AuditLogsModule logs={[]} />
      )}

      {adminTab === 'finance' && (
        <div className="space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#121317] border border-[#2a2b2f] p-10 rounded-[3rem] shadow-2xl relative overflow-hidden group">
              <span className="text-[10px] font-black text-[#474556] uppercase tracking-[0.3em] block mb-4">Ingresos Brutos</span>
              <h2 className="text-6xl font-black text-white italic tracking-tighter leading-none">$2,450</h2>
              <div className="absolute -bottom-4 -right-4 opacity-5 group-hover:opacity-10 transition-opacity"><DollarSign className="w-32 h-32" /></div>
            </div>
            <div className="bg-[#121317] border border-[#2a2b2f] p-10 rounded-[3rem] shadow-2xl relative overflow-hidden group">
              <span className="text-[10px] font-black text-[#474556] uppercase tracking-[0.3em] block mb-4">Comisiones (15%)</span>
              <h2 className="text-6xl font-black text-[#5d3cfe] italic tracking-tighter leading-none">$367</h2>
              <div className="absolute -bottom-4 -right-4 opacity-5 group-hover:opacity-10 transition-opacity"><TrendingUp className="w-32 h-32" /></div>
            </div>
            <div className="bg-[#121317] border border-[#2a2b2f] p-10 rounded-[3rem] shadow-2xl relative overflow-hidden group">
              <span className="text-[10px] font-black text-[#474556] uppercase tracking-[0.3em] block mb-4">Membresías</span>
              <h2 className="text-6xl font-black text-amber-500 italic tracking-tighter leading-none">$120</h2>
              <div className="absolute -bottom-4 -right-4 opacity-5 group-hover:opacity-10 transition-opacity"><Star className="w-32 h-32" /></div>
            </div>
          </div>
        </div>
      )}

      {adminTab === 'users' && (
        <div className="bg-[#121317] border border-[#2a2b2f] p-10 rounded-[3rem] shadow-2xl space-y-8">
          <header><h1 className="text-4xl font-black text-white uppercase tracking-tighter">Maestro de <span className="text-[#5d3cfe]">Usuarios</span></h1></header>
          <table className="w-full text-left text-xs">
            <thead><tr className="border-b border-[#2a2b2f] text-[#474556] uppercase font-black"><th className="py-4">Nombre</th><th className="py-4 text-right">Aprobación</th></tr></thead>
            <tbody className="divide-y divide-[#1c1d21]">
              {technicians.map(t => (
                <tr key={t.id} className="group">
                  <td className="py-6 font-black text-white uppercase">{t.name}</td>
                  <td className="py-6 text-right">
                     <button onClick={() => handleVerifyTechnician(t.id, !t.isVerified)} className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase transition-all ${t.isVerified ? 'bg-rose-500 text-white' : 'bg-[#52ffac] text-black shadow-lg'}`}>{t.isVerified ? 'Suspender' : 'Aprobar'}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {adminTab === 'inventory' && <InventoryModule items={inventory} assets={assets} onUpdateQuantity={() => {}} onAddItem={() => {}} onDeleteItem={() => {}} onUpdateItem={() => {}} />}

      {adminTab === 'settings' && (
        <div className="bg-[#121317] border border-[#2a2b2f] p-10 rounded-[3rem] shadow-2xl">
          <header><h1 className="text-4xl font-black text-white tracking-tighter">Ajustes <span className="text-[#5d3cfe]">Sistema</span></h1></header>
          <div className="mt-10"><button onClick={handleLogout} className="px-10 py-5 bg-rose-600/10 border border-rose-600/20 text-rose-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all">Cerrar Sesión Root</button></div>
        </div>
      )}
    </div>
  );
}
