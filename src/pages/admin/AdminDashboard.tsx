import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  DollarSign, TrendingUp, Star, Users, Truck, Package,
  BellRing, Settings, FileText, Check, Trash2, ShieldCheck,
  Plus, Store
} from 'lucide-react';
import AuditLogsModule from '../../components/AuditLogsModule';

interface AdminDashboardProps {
  adminTab: string;
  auditLogs: any[];
  allUsers: any[];
  requests: any[];
  handleApproveSubscription: any;
  handleConfirmPayment: any;
  handleVerifyTechnician: any;
  handleDeleteAsset: any;
  handleLogout: any;
}

export default function AdminDashboard(props: AdminDashboardProps) {
  const {
    adminTab, auditLogs, allUsers, requests,
    handleApproveSubscription, handleConfirmPayment,
    handleVerifyTechnician, handleDeleteAsset, handleLogout
  } = props;

  return (
    <div className="space-y-12 animate-fade-in-up">
      {adminTab === 'audit' && (
        <AuditLogsModule logs={auditLogs} />
      )}

      {adminTab === 'finance' && (
        <div className="space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#121317] border border-[#2a2b2f] p-10 rounded-[3rem] shadow-2xl relative overflow-hidden group">
              <span className="text-[10px] font-black text-[#474556] uppercase tracking-[0.3em] block mb-4">Ingresos Brutos</span>
              <h2 className="text-6xl font-black text-white italic tracking-tighter leading-none">$2,450</h2>
              <div className="absolute -bottom-4 -right-4 opacity-5 group-hover:opacity-10 transition-opacity"><DollarSign className="w-32 h-32" /></div>
            </div>
            {/* ... other finance cards */}
          </div>

          <div className="bg-[#121317] border border-[#2a2b2f] p-10 rounded-[3rem] shadow-2xl space-y-8">
            <header><h1 className="text-2xl font-black text-white uppercase tracking-tighter">Suscripciones <span className="text-amber-500">Pendientes</span></h1></header>
            <div className="grid grid-cols-1 gap-4">
              {allUsers.filter(u => u.subscription?.status === 'pending_payment_verification').map(u => (
                <div key={u.uid} className="p-6 bg-[#1c1d21] border border-amber-500/20 rounded-3xl flex justify-between items-center group animate-pulse hover:animate-none">
                   {/* ... User subscription item */}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ... other admin tabs */}
    </div>
  );
}
