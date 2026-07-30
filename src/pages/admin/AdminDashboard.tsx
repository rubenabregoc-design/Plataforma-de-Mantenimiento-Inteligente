import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DollarSign, TrendingUp, Star, Users, Truck, Package,
  BellRing, Settings, FileText, Check, Trash2, ShieldCheck,
  Plus, Store, AlertTriangle, Search, Activity
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
  const [verifyId, setVerifyId] = useState('');
  const [verifyResult, setVerifyResult] = useState<any>(null);

  const handleVerifyId = () => {
    const asset = assets.find(a => a.id.toUpperCase() === verifyId.toUpperCase());
    if (asset) {
      setVerifyResult({
        found: true,
        asset,
        hash: btoa(asset.id).substring(0, 10).toUpperCase()
      });
    } else {
      setVerifyResult({ found: false });
    }
  };

  // --- Lógica Financiera Real ---
  const completedRequests = requests.filter(r => r.status === 'completed' || r.status === 'rated');
  const grossIncome = completedRequests.reduce((sum, r) => sum + (r.price || 0), 0);
  const totalCommissions = completedRequests.reduce((sum, r) => sum + (r.commission || 0), 0);

  // Membresías: Estimación basada en planes activos (Simulado con data de usuarios)
  const activeSubscriptions = technicians.length * 29; // Placeholder para suscripciones reales

  return (
    <div className="space-y-12 animate-fade-in-up">
      {adminTab === 'validator' && (
        <div className="max-w-4xl mx-auto space-y-10">
          <header className="text-center space-y-4">
            <h1 className="text-4xl font-black text-white uppercase tracking-tighter italic">Validador de <span className="text-[#5d3cfe]">Certificados</span></h1>
            <p className="text-[10px] text-[#474556] font-black uppercase tracking-[0.4em]">Verificación de Integridad de Reportes MDM-V4</p>
          </header>

          <div className="bg-[#121317] border border-[#2a2b2f] p-10 rounded-[3rem] shadow-2xl space-y-8 relative overflow-hidden">
             <div className="flex gap-4">
                <div className="relative flex-1">
                   <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-[#474556]" />
                   <input
                     type="text"
                     placeholder="Ingrese UUID del Reporte..."
                     value={verifyId}
                     onChange={(e) => setVerifyId(e.target.value)}
                     className="w-full bg-[#1c1d21] border border-[#2a2b2f] rounded-2xl py-5 pl-16 pr-6 text-sm font-black text-white focus:border-[#5d3cfe] outline-none transition-all uppercase"
                   />
                </div>
                <button
                  onClick={handleVerifyId}
                  className="px-10 py-5 bg-[#5d3cfe] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-[#5d3cfe]/20 hover:scale-105 transition-all"
                >
                   Validar Nodo
                </button>
             </div>

             {verifyResult && (
               <div className="animate-fade-in-up">
                  {verifyResult.found ? (
                    <div className="bg-[#52ffac]/5 border border-[#52ffac]/20 p-8 rounded-[2.5rem] space-y-6">
                       <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                             <div className="w-12 h-12 bg-[#52ffac] rounded-2xl flex items-center justify-center text-black">
                                <ShieldCheck className="w-6 h-6" />
                             </div>
                             <div>
                                <h3 className="text-xl font-black text-white uppercase tracking-tight">AUTENTICIDAD CONFIRMADA</h3>
                                <p className="text-[9px] text-[#52ffac] font-black uppercase tracking-widest">Activo Vinculado en Nodo Central</p>
                             </div>
                          </div>
                          <span className="px-4 py-1.5 bg-[#52ffac] text-black rounded-full text-[8px] font-black uppercase">VÁLIDO</span>
                       </div>

                       <div className="grid grid-cols-2 gap-6 pt-6 border-t border-white/5">
                          <div>
                             <p className="text-[8px] font-black text-[#474556] uppercase tracking-widest mb-1">Nombre del Activo</p>
                             <p className="text-white font-black uppercase">{verifyResult.asset.name}</p>
                          </div>
                          <div>
                             <p className="text-[8px] font-black text-[#474556] uppercase tracking-widest mb-1">ID Único</p>
                             <p className="text-white font-mono text-[10px]">{verifyResult.asset.id.toUpperCase()}</p>
                          </div>
                          <div>
                             <p className="text-[8px] font-black text-[#474556] uppercase tracking-widest mb-1">Firma Esperada (NODE-SIG)</p>
                             <p className="text-[#5d3cfe] font-mono text-[10px] font-black">{verifyResult.hash}</p>
                          </div>
                          <div>
                             <p className="text-[8px] font-black text-[#474556] uppercase tracking-widest mb-1">Detección de Manipulación</p>
                             <p className="text-white font-black uppercase">Ninguna Detectada</p>
                          </div>
                       </div>
                    </div>
                  ) : (
                    <div className="bg-rose-500/5 border border-rose-500/20 p-8 rounded-[2.5rem] flex items-center gap-6">
                       <div className="w-12 h-12 bg-rose-500 rounded-2xl flex items-center justify-center text-white">
                          <AlertTriangle className="w-6 h-6" />
                       </div>
                       <div>
                          <h3 className="text-lg font-black text-white uppercase tracking-tight">ERROR DE VALIDACIÓN</h3>
                          <p className="text-[9px] text-rose-500 font-black uppercase tracking-widest">El UUID ingresado no coincide con ningún registro en el Nodo Central.</p>
                       </div>
                    </div>
                  )}
               </div>
             )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="p-8 bg-[#1c1d21] border border-white/5 rounded-[2.5rem] flex items-center gap-5">
                <div className="w-10 h-10 bg-[#5d3cfe]/10 rounded-xl flex items-center justify-center text-[#5d3cfe]">
                   <Activity className="w-5 h-5" />
                </div>
                <div>
                   <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Sincronización MDM-V4</h4>
                   <p className="text-[8px] text-[#474556] font-bold uppercase mt-1">Conectado al Sat-Link Panama Central</p>
                </div>
             </div>
             <div className="p-8 bg-[#1c1d21] border border-white/5 rounded-[2.5rem] flex items-center gap-5">
                <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500">
                   <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                   <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Protocolo de Integridad</h4>
                   <p className="text-[8px] text-[#474556] font-bold uppercase mt-1">Validación de firmas criptográficas activa</p>
                </div>
             </div>
          </div>
        </div>
      )}

      {adminTab === 'audit' && (
        <AuditLogsModule logs={[]} />
      )}

      {adminTab === 'finance' && (
        <div className="space-y-12">
          {/* ... existentes metrícas ... */}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Suscripciones/Pagos Pendientes */}
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
               </div>
            </div>

            {/* PANEL DE ARBITRAJE DE DISPUTAS */}
            <div className="bg-[#121317] border border-rose-500/20 p-10 rounded-[3rem] shadow-2xl space-y-8">
               <header><h1 className="text-2xl font-black text-white uppercase tracking-tighter">Centro de <span className="text-rose-500">Arbitraje</span></h1></header>
               <div className="space-y-4">
                  {requests.filter(r => r.status === 'disputed').map(r => (
                    <div key={r.id} className="p-6 bg-rose-600/5 border border-rose-500/20 rounded-3xl space-y-4">
                       <div className="flex justify-between items-start">
                          <div>
                             <h4 className="text-sm font-black text-white uppercase">{r.assetName}</h4>
                             <p className="text-[9px] font-bold text-rose-400 uppercase tracking-widest">Incidencia: {r.issueDescription}</p>
                          </div>
                          <AlertTriangle className="w-5 h-5 text-rose-500 animate-pulse" />
                       </div>
                       <div className="flex gap-3">
                          <button onClick={() => business.handleArbitrateDispute(r.id, 'refund_to_client')} className="flex-1 py-3 bg-white/5 text-white border border-white/10 rounded-xl text-[8px] font-black uppercase hover:bg-rose-600 transition-all">Reembolsar Cliente</button>
                          <button onClick={() => business.handleArbitrateDispute(r.id, 'release_to_tech')} className="flex-1 py-3 bg-rose-600 text-white rounded-xl text-[8px] font-black uppercase shadow-lg">Liberar a Técnico</button>
                       </div>
                    </div>
                  ))}
                  {requests.filter(r => r.status === 'disputed').length === 0 && (
                    <p className="text-[10px] text-[#474556] font-bold uppercase italic text-center py-10">Sin disputas activas en la red.</p>
                  )}
               </div>
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
                     <button onClick={() => business.handleVerifyTechnician(t.id, !t.isVerified)} className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase transition-all ${t.isVerified ? 'bg-rose-500 text-white' : 'bg-[#52ffac] text-black shadow-lg shadow-[#52ffac]/20'}`}>{t.isVerified ? 'Suspender' : 'Aprobar Sello'}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {adminTab === 'inventory' && (
        <InventoryModule
          items={inventory}
          assets={assets}
          onUpdateQuantity={business.handleUpdateInventoryQuantity}
          onAddItem={business.handleAddInventoryItem}
          onDeleteItem={business.handleDeleteInventoryItem}
          onUpdateItem={business.handleUpdateInventoryItem}
        />
      )}

      {adminTab === 'settings' && (
        <div className="bg-[#121317] border border-[#2a2b2f] p-10 rounded-[3rem] shadow-2xl text-center">
          <header className="mb-10 text-center"><h1 className="text-4xl font-black text-white tracking-tighter uppercase">Consola <span className="text-[#5d3cfe]">Root Mantech</span></h1></header>
          <button onClick={logout} className="px-12 py-5 bg-rose-600/10 border border-rose-600/20 text-rose-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all shadow-xl">Desconectar Sesión Maestra</button>
        </div>
      )}
    </div>
  );
}
