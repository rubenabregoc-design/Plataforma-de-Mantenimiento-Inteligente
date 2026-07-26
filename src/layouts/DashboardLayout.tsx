import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  X, LayoutDashboard, Search, Bell, HelpCircle, LogOut, Camera,
  Globe, BrainCircuit, ShieldCheck, Store, FileCheck2, FileText,
  Package, Star, MessageSquare, Settings, Inbox, Layers, CalendarDays,
  PieChart, User, DollarSign, Truck, Users, BellRing
} from 'lucide-react';
import Logo from '../components/Logo';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';

interface DashboardLayoutProps {
  children: React.ReactNode;
  unreadCount: number;
  onShowNotifications: () => void;
  onShowSupport: () => void;
  planLimits: any;
  handleUploadAvatar: (file: File) => void;
}

export default function DashboardLayout({
  children,
  unreadCount,
  onShowNotifications,
  onShowSupport,
  planLimits,
  handleUploadAvatar
}: DashboardLayoutProps) {
  const { t, i18n } = useTranslation();
  const { role, loggedInName, profileImage, logout } = useAuth();
  const { tabs, setTab } = useUI();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');

  const clientTab = tabs.client;
  const techTab = tabs.tech;
  const adminTab = tabs.admin;

  const setClientTab = (tabName: string) => setTab('client', tabName);
  const setTechTab = (tabName: string) => setTab('tech', tabName);
  const setAdminTab = (tabName: string) => setTab('admin', tabName);

  return (
    <div className="min-h-screen bg-[#0d0e12] flex flex-col font-sans text-[#e3e2e8] overflow-hidden grid-bg">
      {/* MOBILE HEADER */}
      <nav className="h-20 bg-[#0d0e12]/80 backdrop-blur-md border-b border-[#2a2b2f] flex items-center justify-between px-6 md:px-10 shrink-0 z-[100]">
        <div className="flex items-center gap-4 md:gap-10">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2.5 bg-[#1c1d21] border border-[#2a2b2f] rounded-xl text-[#c8c4d9] hover:text-white md:hidden transition-all active:scale-95"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <LayoutDashboard className="w-5 h-5" />}
          </button>
          <Logo size="sm" />
          <div className="relative hidden md:block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#474556]" />
            <input type="text" placeholder="Buscar en el ecosistema..." className="bg-[#121317] border border-[#2a2b2f] rounded-full py-2.5 pl-12 pr-6 text-xs text-white w-[300px] lg:w-[450px]" value={globalSearch} onChange={(e) => setGlobalSearch(e.target.value)} />
          </div>
        </div>
        <div className="flex items-center gap-3 md:gap-8">
          <div className="flex bg-[#1c1d21] p-1 rounded-xl border border-[#2a2b2f]">
             <button
               onClick={() => i18n.changeLanguage('es')}
               className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${i18n.language.startsWith('es') ? 'bg-[#5d3cfe] text-white shadow-lg' : 'text-[#474556] hover:text-[#c8c4d9]'}`}
             >
               ES
             </button>
             <button
               onClick={() => i18n.changeLanguage('en')}
               className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${i18n.language.startsWith('en') ? 'bg-[#5d3cfe] text-white shadow-lg' : 'text-[#474556] hover:text-[#c8c4d9]'}`}
             >
               EN
             </button>
          </div>

          <button
            onClick={onShowNotifications}
            className="relative p-2.5 rounded-2xl bg-white/5 border border-white/10 hover:bg-[#5d3cfe]/10 hover:border-[#5d3cfe]/30 transition-all group"
          >
            <Bell className="w-5 h-5 text-[#c8c4d9] group-hover:text-[#5d3cfe] transition-colors" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#5d3cfe] text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-[#0d0e12] animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          <button onClick={onShowSupport} className="p-2.5 bg-[#1c1d21] border border-[#2a2b2f] rounded-xl text-[#c8c4d9] hover:text-white transition-all"><HelpCircle className="w-5 h-5" /></button>
          <button onClick={logout} className="flex items-center gap-3 text-[#c8c4d9] hover:text-white font-black text-[10px] uppercase tracking-widest transition-all">
            <LogOut className="w-5 h-5" />
            <span className="hidden sm:inline">Salir</span>
          </button>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden relative">
        {/* SIDEBAR */}
        <aside className={`
          fixed md:relative inset-y-0 left-0 z-[90] w-72 bg-[#0d0e12] border-r border-[#2a2b2f] p-8 flex flex-col shrink-0 overflow-y-auto custom-scrollbar transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
          {isMobileMenuOpen && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[-1] md:hidden" onClick={() => setIsMobileMenuOpen(false)}></div>
          )}

          <div className="flex items-center gap-4 mb-10 group cursor-pointer" onClick={() => document.getElementById('avatar-input')?.click()}>
             <div className="w-14 h-14 rounded-2xl bg-[#1c1d21] border border-white/10 flex items-center justify-center text-xl font-black text-white shadow-2xl overflow-hidden relative">
               {profileImage ? <img src={profileImage} className="w-full h-full object-cover" /> : loggedInName?.[0] || 'U'}
               <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"><Camera className="w-4 h-4 text-white" /></div>
               <input type="file" id="avatar-input" className="hidden" accept="image/*" onChange={e => e.target.files?.[0] && handleUploadAvatar(e.target.files[0])} />
             </div>
             <div className="overflow-hidden">
               <h4 className="font-black text-white text-xs tracking-tight truncate uppercase leading-tight">{loggedInName}</h4>
               <p className="text-[10px] font-black text-[#5d3cfe] uppercase tracking-widest mt-1">
                 {role === 'client' ? 'CLIENTE' : role === 'tech' ? 'TÉCNICO' : 'ADMINISTRADOR'}
               </p>
             </div>
          </div>

          <nav className="space-y-1.5 flex-1 text-[11px] font-black uppercase tracking-wider">
            {role === 'client' ? (
              <>
                <button onClick={() => setClientTab('dashboard')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${clientTab === 'dashboard' ? 'bg-[#5d3cfe] text-white shadow-xl shadow-[#5d3cfe]/20' : 'text-[#c8c4d9] hover:bg-[#121317]'}`}><LayoutDashboard className="w-4 h-4" /> {t('my_assets', 'Mis Equipos')}</button>
                {planLimits?.fleet !== 'none' && (
                  <button onClick={() => setClientTab('fleet')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${clientTab === 'fleet' ? 'bg-[#5d3cfe] text-white shadow-xl shadow-[#5d3cfe]/20' : 'text-[#c8c4d9] hover:bg-[#121317]'}`}><Globe className="w-5 h-5" /> {t('fleet_b2b', 'Flota B2B')}</button>
                )}
                <button onClick={() => setClientTab('ai')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${clientTab === 'ai' ? 'bg-[#5d3cfe] text-white shadow-xl shadow-[#5d3cfe]/20' : 'text-[#c8c4d9] hover:bg-[#121317]'}`}><BrainCircuit className="w-5 h-5 text-[#52ffac]" /> {t('self_diagnostic', 'Autodiagnóstico')}</button>
                <button onClick={() => setClientTab('warranties')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${clientTab === 'warranties' ? 'bg-[#5d3cfe] text-white shadow-xl shadow-[#5d3cfe]/20' : 'text-[#c8c4d9] hover:bg-[#121317]'}`}><ShieldCheck className="w-5 h-5" /> {t('warranty_vault', 'Bóveda Garantías')}</button>
                <button onClick={() => setClientTab('marketplace')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${clientTab === 'marketplace' ? 'bg-[#5d3cfe] text-white shadow-xl shadow-[#5d3cfe]/20' : 'text-[#c8c4d9] hover:bg-[#121317]'}`}><Store className="w-5 h-5" /> {t('find_experts', 'Buscar Expertos')}</button>
                <button onClick={() => setClientTab('quotes')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${clientTab === 'quotes' ? 'bg-[#5d3cfe] text-white shadow-xl shadow-[#5d3cfe]/20' : 'text-[#c8c4d9] hover:bg-[#121317]'}`}><FileCheck2 className="w-4 h-4" /> {t('contracts', 'Contratos')}</button>
                {planLimits?.maxAssets > 3 && (
                  <button onClick={() => setClientTab('audit')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${clientTab === 'audit' ? 'bg-[#5d3cfe] text-white shadow-xl shadow-[#5d3cfe]/20' : 'text-[#c8c4d9] hover:bg-[#121317]'}`}><FileText className="w-4 h-4" /> {t('audit', 'Auditoría')}</button>
                )}
                <button onClick={() => setClientTab('inventory')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${clientTab === 'inventory' ? 'bg-[#5d3cfe] text-white shadow-xl shadow-[#5d3cfe]/20' : 'text-[#c8c4d9] hover:bg-[#121317]'}`}><Package className="w-4 h-4" /> {t('spare_parts', 'Repuestos')}</button>
                <button onClick={() => setClientTab('subscriptions')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${clientTab === 'subscriptions' ? 'bg-[#5d3cfe] text-white shadow-xl shadow-[#5d3cfe]/20' : 'text-[#c8c4d9] hover:bg-[#121317]'}`}><Star className="w-4 h-4" /> {t('membership', 'Membresía')}</button>
                <button onClick={() => setClientTab('chat')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${clientTab === 'chat' ? 'bg-[#5d3cfe] text-white shadow-xl shadow-[#5d3cfe]/20' : 'text-[#c8c4d9] hover:bg-[#121317]'}`}><MessageSquare className="w-4 h-4" /> {t('chat', 'Chat')}</button>
                <button onClick={() => setClientTab('settings')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${clientTab === 'settings' ? 'bg-[#5d3cfe] text-white shadow-xl shadow-[#5d3cfe]/20' : 'text-[#c8c4d9] hover:bg-[#121317]'}`}><Settings className="w-4 h-4" /> {t('settings', 'Configuración')}</button>
              </>
            ) : role === 'tech' ? (
              <>
                <button onClick={() => setTechTab('received')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${techTab === 'received' ? 'bg-[#5d3cfe] text-white shadow-xl' : 'text-[#c8c4d9] hover:bg-[#121317]'}`}><Inbox className="w-4 h-4" /> Bandeja</button>
                <button onClick={() => setTechTab('bidding_market')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${techTab === 'bidding_market' ? 'bg-[#5d3cfe] text-white shadow-xl' : 'text-[#c8c4d9] hover:bg-[#121317]'}`}><Layers className="w-4 h-4" /> Bolsa de Trabajo</button>
                <button onClick={() => setTechTab('agenda')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${techTab === 'agenda' ? 'bg-[#5d3cfe] text-white shadow-xl' : 'text-[#c8c4d9] hover:bg-[#121317]'}`}><CalendarDays className="w-4 h-4" /> Agenda</button>
                <button onClick={() => setTechTab('wallet')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${techTab === 'wallet' ? 'bg-[#5d3cfe] text-white shadow-xl' : 'text-[#c8c4d9] hover:bg-[#121317]'}`}><PieChart className="w-4 h-4" /> Billetera</button>
                <button onClick={() => setTechTab('mantech_id')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${techTab === 'mantech_id' ? 'bg-[#5d3cfe] text-white shadow-xl' : 'text-[#c8c4d9] hover:bg-[#121317]'}`}><ShieldCheck className="w-4 h-4" /> Mantech ID</button>
                <button onClick={() => setTechTab('chat')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${techTab === 'chat' ? 'bg-[#5d3cfe] text-white shadow-xl' : 'text-[#c8c4d9] hover:bg-[#121317]'}`}><MessageSquare className="w-4 h-4" /> Chat</button>
                <button onClick={() => setTechTab('profile')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${techTab === 'profile' ? 'bg-[#5d3cfe] text-white shadow-xl' : 'text-[#c8c4d9] hover:bg-[#121317]'}`}><User className="w-4 h-4" /> Mi Perfil</button>
                <button onClick={() => setTechTab('settings')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${techTab === 'settings' ? 'bg-[#5d3cfe] text-white shadow-xl' : 'text-[#c8c4d9] hover:bg-[#121317]'}`}><Settings className="w-4 h-4" /> Configuración</button>
              </>
            ) : (
              <>
                <button onClick={() => setAdminTab('finance')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${adminTab === 'finance' ? 'bg-[#e11d48] text-white shadow-xl shadow-[#e11d48]/20' : 'text-[#c8c4d9] hover:bg-[#121317]'}`}><DollarSign className="w-4 h-4" /> Finanzas</button>
                <button onClick={() => setAdminTab('audit')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${adminTab === 'audit' ? 'bg-[#e11d48] text-white shadow-xl shadow-[#e11d48]/20' : 'text-[#c8c4d9] hover:bg-[#121317]'}`}><FileText className="w-4 h-4" /> Logs Actividad</button>
                <button onClick={() => setAdminTab('logistics')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${adminTab === 'logistics' ? 'bg-[#e11d48] text-white shadow-xl shadow-[#e11d48]/20' : 'text-[#c8c4d9] hover:bg-[#121317]'}`}><Truck className="w-4 h-4" /> Logística</button>
                <button onClick={() => setAdminTab('users')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${adminTab === 'users' ? 'bg-[#e11d48] text-white shadow-xl shadow-[#e11d48]/20' : 'text-[#c8c4d9] hover:bg-[#121317]'}`}><Users className="w-4 h-4" /> Usuarios</button>
                <button onClick={() => setAdminTab('inventory')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${adminTab === 'inventory' ? 'bg-[#e11d48] text-white shadow-xl shadow-[#e11d48]/20' : 'text-[#c8c4d9] hover:bg-[#121317]'}`}><Package className="w-4 h-4" /> Inventario</button>
                <button onClick={() => setAdminTab('alerts')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${adminTab === 'alerts' ? 'bg-[#e11d48] text-white shadow-xl shadow-[#e11d48]/20' : 'text-[#c8c4d9] hover:bg-[#121317]'}`}><BellRing className="w-4 h-4" /> Alertas</button>
                <button onClick={() => setAdminTab('settings')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${adminTab === 'settings' ? 'bg-[#e11d48] text-white shadow-xl shadow-[#e11d48]/20' : 'text-[#c8c4d9] hover:bg-[#121317]'}`}><Settings className="w-4 h-4" /> Configuración</button>
              </>
            )}
          </nav>
        </aside>

        <main className="flex-1 bg-[#0d0e12] p-6 md:p-10 overflow-y-auto custom-scrollbar relative">
           <div className="max-w-6xl mx-auto space-y-8 md:space-y-12">
              {children}
           </div>
        </main>
      </div>
    </div>
  );
}
