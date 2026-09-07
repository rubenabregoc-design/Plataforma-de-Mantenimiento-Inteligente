import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  X, LayoutDashboard, Search, Bell, HelpCircle, LogOut, Camera,
  Globe, BrainCircuit, ShieldCheck, Store, FileCheck2, FileText,
  Package, Star, MessageSquare, Settings, Inbox, Layers, CalendarDays,
  PieChart, User, DollarSign, Truck, Users, BellRing, Zap, ChevronRight, Headset, Pencil,
  ClipboardCheck, Fuel, Radio, Navigation
} from 'lucide-react';
import Logo from '../components/Logo';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import MobileBottomNav from '../components/MobileBottomNav';
import MobileQuickActionsFAB from '../components/MobileQuickActionsFAB';

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
  const { t } = useTranslation();
  const { role, loggedInName, profileImage, logout, subscription } = useAuth();
  const { tabs, setTab, openModal } = useUI();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');

  const currentClientTab = tabs.client;
  const currentTechTab = tabs.tech;
  const currentAdminTab = tabs.admin;
  const currentDriverTab = tabs.driver || 'cockpit';

  const navigateClient = (tab: string) => { setTab('client', tab); setIsMobileMenuOpen(false); };
  const navigateTech = (tab: string) => { setTab('tech', tab); setIsMobileMenuOpen(false); };
  const navigateAdmin = (tab: string) => { setTab('admin', tab); setIsMobileMenuOpen(false); };
  const navigateDriver = (tab: string) => { setTab('driver', tab); setIsMobileMenuOpen(false); };

  const currentActiveTab = role === 'client' ? currentClientTab : role === 'tech' ? currentTechTab : role === 'driver' ? currentDriverTab : currentAdminTab;
  const handleBottomTabSelect = (tab: string) => {
    if (role === 'client') navigateClient(tab);
    else if (role === 'tech') navigateTech(tab);
    else if (role === 'driver') navigateDriver(tab);
    else if (role === 'admin') navigateAdmin(tab);
  };

  // --- Plan ---
  const activePlan = subscription.planId || (role === 'tech' ? 'plan-basic' : 'plan-free');
  const isFree = activePlan === 'plan-free';
  const isEmprendedor = activePlan === 'plan-basic';
  const isPro = activePlan === 'plan-pro';
  const isEnterprise = activePlan === 'plan-enterprise';
  const canAccessFleet = !isFree;
  const canAccessAudit = isPro || isEnterprise;
  const canAccessInventory = true;

  const getPlanInfo = () => {
    if (role === 'admin') {
      return { label: 'Acceso Total', color: '#e11d48' };
    }
    if (role === 'driver') {
      return { label: 'Conductor Flota', color: '#f59e0b' };
    }
    if (role === 'tech') {
      if (activePlan === 'plan-enterprise') return { label: 'Partner Élite', color: '#f59e0b' };
      if (activePlan === 'plan-pro') return { label: 'Técnico Pro', color: '#c7bfff' };
      return { label: 'Estándar', color: '#52ffac' };
    }
    // client
    if (activePlan === 'plan-enterprise') return { label: 'Enterprise', color: '#f59e0b' };
    if (activePlan === 'plan-pro') return { label: 'Profesional', color: '#c7bfff' };
    if (activePlan === 'plan-basic') return { label: 'Emprendedor', color: '#52ffac' };
    return { label: 'Plan Gratis', color: '#8e8d9a' };
  };

  const { label: planLabel, color: planColor } = getPlanInfo();

  const roleConfig = {
    admin: {
      label: 'Admin',
      badgeClass: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
    },
    driver: {
      label: 'Conductor',
      badgeClass: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
    },
    tech: {
      label: 'Técnico',
      badgeClass: 'bg-[#52ffac]/10 border-[#52ffac]/30 text-[#52ffac]',
    },
    client: {
      label: 'Cliente',
      badgeClass: 'bg-[#5d3cfe]/10 border-[#5d3cfe]/30 text-[#c7bfff]',
    }
  }[role || 'client'] || {
    label: 'Cliente',
    badgeClass: 'bg-white/10 border-white/20 text-white',
  };

  // Reusable sidebar button
  const SBtn = ({ tab, icon: Icon, label, nav, cur, red = false }: any) => {
    const active = cur === tab;
    return (
      <button onClick={() => nav(tab)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-[10px] font-black uppercase tracking-wider ${ active ? (red ? 'bg-[#e11d48] text-white shadow-md shadow-[#e11d48]/20' : 'bg-[#5d3cfe] text-white shadow-md shadow-[#5d3cfe]/20') : 'text-[#8a879d] hover:text-white hover:bg-white/5' }`}>
        <Icon className="w-4 h-4 shrink-0" />
        <span className="truncate">{label}</span>
      </button>
    );
  };

  // Reusable bottom sheet tile
  const STile = ({ tab, icon: Icon, label, nav, cur, color = '#5d3cfe' }: any) => {
    const active = cur === tab;
    return (
      <button onClick={() => nav(tab)} className={`flex flex-col items-center justify-center gap-1.5 py-3 px-1 rounded-2xl transition-all active:scale-90 ${ active ? 'bg-white/8' : 'hover:bg-white/5' }`}>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${ active ? '' : 'bg-white/5' }`} style={active ? { backgroundColor: `${color}20`, color } : { color: '#8a879d' }}>
          <Icon className="w-5 h-5" />
        </div>
        <span className={`text-[8px] font-black uppercase tracking-wider leading-tight text-center w-full`} style={{ color: active ? color : '#474556' }}>
          {label}
        </span>
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-[#0d0e12] flex flex-col font-sans text-[#e3e2e8] overflow-hidden grid-bg">

      {/* TOP BAR */}
      <nav className="h-[calc(4.5rem+env(safe-area-inset-top))] pt-[env(safe-area-inset-top)] bg-[#0d0e12]/90 backdrop-blur-md border-b border-[#2a2b2f]/60 flex items-center justify-between px-4 md:px-8 shrink-0 z-[100]">
        <div className="flex items-center gap-3 md:gap-8">
          <Logo size="sm" />
          <div className="relative hidden md:block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#474556]" />
            <input type="text" placeholder={t('search_placeholder', 'Buscar...')} className="bg-[#121317] border border-[#2a2b2f] rounded-full py-2.5 pl-12 pr-6 text-xs text-white w-[260px] lg:w-[400px] focus:outline-none focus:border-[#5d3cfe]/50 transition-colors" value={globalSearch} onChange={e => setGlobalSearch(e.target.value)} />
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-5">
          {role === 'client' ? (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-wider" style={{ borderColor: `${planColor}30`, color: planColor, background: `${planColor}10` }}>
              <Zap className="w-3 h-3 fill-current" />{planLabel}
            </div>
          ) : (
            <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-wider ${roleConfig.badgeClass}`}>
              <ShieldCheck className="w-3 h-3" />{roleConfig.label}
            </div>
          )}
          {role !== 'admin' && (
            <button
              onClick={() => openModal('chatbot')}
              aria-label="Asesor IA 24/7"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-[#5d3cfe]/20 to-[#52ffac]/15 border border-[#5d3cfe]/40 text-white hover:border-[#5d3cfe]/70 transition-all active:scale-95 shadow-sm"
              title="Asesor MantechPro IA 24/7"
            >
              <div className="relative">
                <Headset className="w-4 h-4 text-[#52ffac]" />
                <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-[#52ffac] rounded-full animate-ping" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-[#c7bfff] hidden xs:inline">
                Asesor IA
              </span>
            </button>
          )}
          <button onClick={onShowNotifications} className="relative p-2.5 rounded-xl bg-white/5 border border-white/8 hover:bg-[#5d3cfe]/10 hover:border-[#5d3cfe]/30 transition-all">
            <Bell className="w-5 h-5 text-[#c8c4d9]" />
            {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#5d3cfe] text-white text-[9px] font-black flex items-center justify-center rounded-full border-2 border-[#0d0e12] animate-pulse">{unreadCount}</span>}
          </button>
          <button onClick={onShowSupport} className="p-2.5 bg-white/5 border border-white/8 rounded-xl text-[#c8c4d9] hover:text-white transition-all"><HelpCircle className="w-5 h-5" /></button>
          <button onClick={logout} className="flex items-center gap-2 text-[#8a879d] hover:text-white font-black text-[10px] uppercase tracking-widest transition-all p-2.5 rounded-xl hover:bg-white/5">
            <LogOut className="w-5 h-5" /><span className="hidden sm:inline">{t('exit', 'Salir')}</span>
          </button>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden relative">
        {/* DESKTOP SIDEBAR */}
        <aside className="hidden md:flex w-52 bg-[#0d0e12] border-r border-[#2a2b2f]/60 py-4 px-3 flex-col shrink-0 overflow-y-auto custom-scrollbar">
          {/* Avatar card */}
          <div className="flex items-center gap-3 mb-5 p-3 rounded-2xl bg-[#121317] border border-white/5 group hover:border-white/10 transition-all">
            <div className="w-10 h-10 rounded-xl bg-[#1c1d21] border border-white/10 flex items-center justify-center text-sm font-black text-white overflow-hidden relative shrink-0 cursor-pointer" onClick={() => document.getElementById('avatar-input')?.click()} title="Cambiar foto de perfil">
              {profileImage ? <img src={profileImage} className="w-full h-full object-cover" /> : (loggedInName?.[0] || 'U')}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"><Camera className="w-3 h-3 text-white" /></div>
              <input type="file" id="avatar-input" className="hidden" accept="image/*" onChange={e => e.target.files?.[0] && handleUploadAvatar(e.target.files[0])} />
            </div>
            <div className="overflow-hidden flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <h4
                  onClick={() => role === 'tech' ? openModal('editTech') : openModal('editProfile')}
                  className="font-black text-white text-[11px] tracking-tight truncate uppercase leading-tight cursor-pointer hover:text-[#5d3cfe] transition-colors"
                  title="Editar Perfil"
                >
                  {loggedInName || 'Usuario'}
                </h4>
                <button
                  onClick={() => role === 'tech' ? openModal('editTech') : openModal('editProfile')}
                  className="text-[#6b697e] hover:text-[#5d3cfe] p-0.5 transition-colors shrink-0"
                  title="Editar Perfil"
                >
                  <Pencil className="w-3 h-3" />
                </button>
              </div>
              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                <span className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border leading-none ${roleConfig.badgeClass}`}>
                  {roleConfig.label}
                </span>
                <span className="text-[8px] font-bold uppercase tracking-wider truncate" style={{ color: planColor }}>
                  {planLabel}
                </span>
              </div>
            </div>
          </div>

          <nav className="space-y-0.5 flex-1">
            {role === 'client' && (<>
              <SBtn tab="dashboard" icon={LayoutDashboard} label={t('my_assets','Mis Equipos')} nav={navigateClient} cur={currentClientTab} />
              {canAccessFleet && <SBtn tab="fleet" icon={Globe} label={t('fleet_b2b','Flota B2B')} nav={navigateClient} cur={currentClientTab} />}
              <SBtn tab="ai" icon={BrainCircuit} label={t('self_diagnostic','Autodiagnóstico')} nav={navigateClient} cur={currentClientTab} />
              <SBtn tab="warranties" icon={ShieldCheck} label={t('warranty_vault','Bóveda')} nav={navigateClient} cur={currentClientTab} />
              <SBtn tab="marketplace" icon={Store} label={t('find_experts','Expertos')} nav={navigateClient} cur={currentClientTab} />
              <SBtn tab="quotes" icon={FileCheck2} label={t('contracts','Contratos')} nav={navigateClient} cur={currentClientTab} />
              {canAccessAudit && <SBtn tab="audit" icon={FileText} label={t('audit','Auditoría')} nav={navigateClient} cur={currentClientTab} />}
              {canAccessInventory && <SBtn tab="inventory" icon={Package} label={t('spare_parts','Repuestos')} nav={navigateClient} cur={currentClientTab} />}
              <SBtn tab="subscriptions" icon={Star} label={t('membership','Membresía')} nav={navigateClient} cur={currentClientTab} />
              <SBtn tab="chat" icon={MessageSquare} label={t('chat','Chat')} nav={navigateClient} cur={currentClientTab} />
              {isEnterprise && <SBtn tab="team" icon={Users} label="Equipo" nav={navigateClient} cur={currentClientTab} />}
              <SBtn tab="settings" icon={Settings} label={t('settings','Config.')} nav={navigateClient} cur={currentClientTab} />
            </>)}
            {role === 'tech' && (<>
              <SBtn tab="received" icon={Inbox} label={t('inbox','Bandeja')} nav={navigateTech} cur={currentTechTab} />
              <SBtn tab="bidding_market" icon={Layers} label={t('job_market','Bolsa')} nav={navigateTech} cur={currentTechTab} />
              <SBtn tab="agenda" icon={CalendarDays} label={t('agenda','Agenda')} nav={navigateTech} cur={currentTechTab} />
              <SBtn tab="wallet" icon={PieChart} label={t('wallet','Billetera')} nav={navigateTech} cur={currentTechTab} />
              <SBtn tab="loyalty" icon={Star} label={t('loyalty_club','Fidelidad')} nav={navigateTech} cur={currentTechTab} />
              <SBtn tab="inventory" icon={Package} label={t('my_inventory','Inventario')} nav={navigateTech} cur={currentTechTab} />
              <SBtn tab="mantech_id" icon={ShieldCheck} label={t('mantech_id','Mantech ID')} nav={navigateTech} cur={currentTechTab} />
              <SBtn tab="community" icon={Users} label="Comunidad" nav={navigateTech} cur={currentTechTab} />
              <SBtn tab="chat" icon={MessageSquare} label={t('chat','Chat')} nav={navigateTech} cur={currentTechTab} />
              <SBtn tab="profile" icon={User} label={t('my_profile','Perfil')} nav={navigateTech} cur={currentTechTab} />
              <SBtn tab="settings" icon={Settings} label={t('settings','Config.')} nav={navigateTech} cur={currentTechTab} />
            </>)}
            {role === 'driver' && (<>
              <SBtn tab="cockpit" icon={Truck} label="Cabina" nav={navigateDriver} cur={currentDriverTab} />
              <SBtn tab="routes" icon={Navigation} label="Ruta & GPS" nav={navigateDriver} cur={currentDriverTab} />
              <SBtn tab="inspection" icon={ClipboardCheck} label="Pre-Viaje" nav={navigateDriver} cur={currentDriverTab} />
              <SBtn tab="fuel" icon={Fuel} label="Combustible" nav={navigateDriver} cur={currentDriverTab} />
              <SBtn tab="chat" icon={MessageSquare} label="Chat Flota" nav={navigateDriver} cur={currentDriverTab} />
            </>)}
            {role === 'admin' && (<>
              <SBtn tab="finance" icon={DollarSign} label="Finanzas" nav={navigateAdmin} cur={currentAdminTab} red />
              <SBtn tab="validator" icon={ShieldCheck} label="Validador" nav={navigateAdmin} cur={currentAdminTab} red />
              <SBtn tab="audit" icon={FileText} label="Logs" nav={navigateAdmin} cur={currentAdminTab} red />
              <SBtn tab="tickets" icon={MessageSquare} label="Tickets" nav={navigateAdmin} cur={currentAdminTab} red />
              <SBtn tab="ads" icon={Zap} label="Marketing" nav={navigateAdmin} cur={currentAdminTab} red />
              <SBtn tab="logistics" icon={Truck} label="Logística" nav={navigateAdmin} cur={currentAdminTab} red />
              <SBtn tab="users" icon={Users} label="Usuarios" nav={navigateAdmin} cur={currentAdminTab} red />
              <SBtn tab="inventory" icon={Package} label="Inventario" nav={navigateAdmin} cur={currentAdminTab} red />
              <SBtn tab="alerts" icon={BellRing} label="Alertas" nav={navigateAdmin} cur={currentAdminTab} red />
              <SBtn tab="settings" icon={Settings} label="Config." nav={navigateAdmin} cur={currentAdminTab} red />
            </>)}
          </nav>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 bg-[#0d0e12] p-4 sm:p-5 md:p-8 pb-[calc(8.5rem+env(safe-area-inset-bottom))] md:pb-8 overflow-y-auto custom-scrollbar relative">
          <div className="max-w-[1600px] mx-auto space-y-5 md:space-y-10">
            {children}
          </div>
        </main>
      </div>

      {/* MOBILE BOTTOM NAV */}
      <MobileBottomNav role={role} currentTab={currentActiveTab} onSelectTab={handleBottomTabSelect} onOpenMoreMenu={() => setIsMobileMenuOpen(true)} unreadCount={unreadCount} />
      <MobileQuickActionsFAB role={role} />

      {/* ── MOBILE BOTTOM SHEET ── */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-[200] flex flex-col justify-end">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />

          {/* Panel */}
          <div className="relative bg-[#121317] rounded-t-[1.75rem] border-t border-[#2a2b2f]/80 shadow-[0_-20px_60px_rgba(0,0,0,0.8)] overflow-y-auto" style={{ maxHeight: '80vh', animation: 'slideUp 0.25s cubic-bezier(0.32,0.72,0,1) forwards' }}>
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1"><div className="w-10 h-1 bg-white/15 rounded-full" /></div>

            {/* User header */}
            <div className="flex items-center gap-3 px-5 py-3.5 border-b border-white/5">
              <div className="w-10 h-10 rounded-xl bg-[#1c1d21] border border-white/10 flex items-center justify-center text-sm font-black text-white overflow-hidden shrink-0 cursor-pointer" onClick={() => document.getElementById('avatar-mob')?.click()} title="Cambiar foto de perfil">
                {profileImage ? <img src={profileImage} className="w-full h-full object-cover" /> : (loggedInName?.[0] || 'U')}
                <input type="file" id="avatar-mob" className="hidden" accept="image/*" onChange={e => e.target.files?.[0] && handleUploadAvatar(e.target.files[0])} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4
                    onClick={() => { setIsMobileMenuOpen(false); role === 'tech' ? openModal('editTech') : openModal('editProfile'); }}
                    className="font-black text-white text-sm uppercase tracking-tight truncate leading-tight cursor-pointer hover:text-[#5d3cfe] transition-colors"
                  >
                    {loggedInName || 'Usuario'}
                  </h4>
                  <button
                    onClick={() => { setIsMobileMenuOpen(false); role === 'tech' ? openModal('editTech') : openModal('editProfile'); }}
                    className="text-[#6b697e] hover:text-[#5d3cfe] p-1 transition-colors shrink-0"
                    title="Editar Perfil"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border leading-none ${roleConfig.badgeClass}`}>
                    {roleConfig.label}
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: planColor }}>
                    {planLabel}
                  </span>
                </div>
              </div>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 rounded-xl bg-white/5 text-[#474556] hover:text-white transition-colors"><X className="w-4 h-4" /></button>
            </div>

            {/* Featured AI Assistant Banner */}
            {role !== 'admin' && (
              <div className="px-4 pt-3 pb-1">
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    openModal('chatbot');
                  }}
                  className="w-full flex items-center justify-between p-3.5 bg-gradient-to-r from-[#5d3cfe]/20 via-[#5d3cfe]/10 to-[#52ffac]/15 border border-[#5d3cfe]/40 hover:border-[#5d3cfe] rounded-2xl active:scale-98 transition-all shadow-lg text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#5d3cfe] to-[#52ffac] flex items-center justify-center text-white shadow-md shadow-[#5d3cfe]/30 shrink-0">
                      <BrainCircuit className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs font-black uppercase text-white tracking-wider">
                          Asesor MantechPro 24/7
                        </h4>
                        <span className="px-1.5 py-0.5 rounded-full text-[8px] font-black uppercase bg-[#52ffac]/20 text-[#52ffac]">
                          IA Activa
                        </span>
                      </div>
                      <p className="text-[10px] text-[#8e8d9a] font-bold mt-0.5">
                        Consultas técnicas, contratos y cotizaciones
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#8e8d9a] group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0" />
                </button>
              </div>
            )}

            {/* Grid of tiles */}
            <div className="px-3 pt-2 pb-1">
              {role === 'client' && (
                <>
                  <div className="grid grid-cols-4 gap-1.5 mb-1.5">
                    <STile tab="dashboard" icon={LayoutDashboard} label="Equipos" nav={navigateClient} cur={currentClientTab} />
                    <STile tab="ai" icon={BrainCircuit} label="IA Diag" nav={navigateClient} cur={currentClientTab} color="#52ffac" />
                    <STile tab="warranties" icon={ShieldCheck} label="Bóveda" nav={navigateClient} cur={currentClientTab} />
                    <STile tab="marketplace" icon={Store} label="Expertos" nav={navigateClient} cur={currentClientTab} />
                  </div>
                  <div className="grid grid-cols-4 gap-1.5 mb-1.5">
                    <STile tab="quotes" icon={FileCheck2} label="Contratos" nav={navigateClient} cur={currentClientTab} />
                    {canAccessInventory && <STile tab="inventory" icon={Package} label="Repuestos" nav={navigateClient} cur={currentClientTab} />}
                    <STile tab="subscriptions" icon={Star} label="Membresía" nav={navigateClient} cur={currentClientTab} color="#f59e0b" />
                    <STile tab="chat" icon={MessageSquare} label="Chat" nav={navigateClient} cur={currentClientTab} />
                  </div>
                  <div className="grid grid-cols-4 gap-1.5 mb-1.5">
                    {canAccessFleet && <STile tab="fleet" icon={Globe} label="Flota B2B" nav={navigateClient} cur={currentClientTab} />}
                    {canAccessAudit && <STile tab="audit" icon={FileText} label="Auditoría" nav={navigateClient} cur={currentClientTab} />}
                    {isEnterprise && <STile tab="team" icon={Users} label="Equipo" nav={navigateClient} cur={currentClientTab} />}
                    <STile tab="settings" icon={Settings} label="Config." nav={navigateClient} cur={currentClientTab} />
                  </div>
                </>
              )}
              {role === 'tech' && (
                <>
                  <div className="grid grid-cols-4 gap-1.5 mb-1.5">
                    <STile tab="received" icon={Inbox} label="Bandeja" nav={navigateTech} cur={currentTechTab} />
                    <STile tab="bidding_market" icon={Layers} label="Bolsa" nav={navigateTech} cur={currentTechTab} />
                    <STile tab="agenda" icon={CalendarDays} label="Agenda" nav={navigateTech} cur={currentTechTab} />
                    <STile tab="wallet" icon={PieChart} label="Billetera" nav={navigateTech} cur={currentTechTab} color="#52ffac" />
                  </div>
                  <div className="grid grid-cols-4 gap-1.5 mb-1.5">
                    <STile tab="loyalty" icon={Star} label="Fidelidad" nav={navigateTech} cur={currentTechTab} color="#f59e0b" />
                    <STile tab="inventory" icon={Package} label="Inventario" nav={navigateTech} cur={currentTechTab} />
                    <STile tab="mantech_id" icon={ShieldCheck} label="ID" nav={navigateTech} cur={currentTechTab} />
                    <STile tab="community" icon={Users} label="Comunidad" nav={navigateTech} cur={currentTechTab} />
                  </div>
                  <div className="grid grid-cols-4 gap-1.5 mb-1.5">
                    <STile tab="chat" icon={MessageSquare} label="Chat" nav={navigateTech} cur={currentTechTab} />
                    <STile tab="profile" icon={User} label="Perfil" nav={navigateTech} cur={currentTechTab} />
                    <STile tab="settings" icon={Settings} label="Config." nav={navigateTech} cur={currentTechTab} />
                  </div>
                </>
              )}
              {role === 'driver' && (
                <>
                  <div className="grid grid-cols-5 gap-1.5 mb-1.5">
                    <STile tab="cockpit" icon={Truck} label="Cabina" nav={navigateDriver} cur={currentDriverTab} color="#f59e0b" />
                    <STile tab="routes" icon={Navigation} label="Ruta GPS" nav={navigateDriver} cur={currentDriverTab} color="#00d2ff" />
                    <STile tab="inspection" icon={ClipboardCheck} label="Pre-Viaje" nav={navigateDriver} cur={currentDriverTab} color="#818cf8" />
                    <STile tab="fuel" icon={Fuel} label="Combustible" nav={navigateDriver} cur={currentDriverTab} color="#52ffac" />
                    <STile tab="chat" icon={MessageSquare} label="Chat" nav={navigateDriver} cur={currentDriverTab} />
                  </div>
                </>
              )}
              {role === 'admin' && (
                <>
                  <div className="grid grid-cols-4 gap-1.5 mb-1.5">
                    <STile tab="finance" icon={DollarSign} label="Finanzas" nav={navigateAdmin} cur={currentAdminTab} color="#e11d48" />
                    <STile tab="validator" icon={ShieldCheck} label="Validador" nav={navigateAdmin} cur={currentAdminTab} color="#e11d48" />
                    <STile tab="audit" icon={FileText} label="Logs" nav={navigateAdmin} cur={currentAdminTab} color="#e11d48" />
                    <STile tab="tickets" icon={MessageSquare} label="Tickets" nav={navigateAdmin} cur={currentAdminTab} color="#e11d48" />
                  </div>
                  <div className="grid grid-cols-4 gap-1.5 mb-1.5">
                    <STile tab="ads" icon={Zap} label="Marketing" nav={navigateAdmin} cur={currentAdminTab} color="#f59e0b" />
                    <STile tab="logistics" icon={Truck} label="Logística" nav={navigateAdmin} cur={currentAdminTab} color="#e11d48" />
                    <STile tab="users" icon={Users} label="Usuarios" nav={navigateAdmin} cur={currentAdminTab} color="#e11d48" />
                    <STile tab="inventory" icon={Package} label="Inventario" nav={navigateAdmin} cur={currentAdminTab} color="#e11d48" />
                  </div>
                  <div className="grid grid-cols-4 gap-1.5 mb-1.5">
                    <STile tab="alerts" icon={BellRing} label="Alertas" nav={navigateAdmin} cur={currentAdminTab} color="#e11d48" />
                    <STile tab="settings" icon={Settings} label="Config." nav={navigateAdmin} cur={currentAdminTab} color="#e11d48" />
                  </div>
                </>
              )}
            </div>

            {/* Logout */}
            <div className="mx-3 mb-2 mt-1 border-t border-white/5 pt-2" style={{ paddingBottom: 'max(env(safe-area-inset-bottom),1rem)' }}>
              <button onClick={() => { logout(); setIsMobileMenuOpen(false); }} className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-[#474556] hover:text-rose-400 hover:bg-rose-500/5 transition-all">
                <div className="flex items-center gap-3"><LogOut className="w-4 h-4" /><span className="text-[11px] font-black uppercase tracking-widest">{t('exit', 'Cerrar Sesión')}</span></div>
                <ChevronRight className="w-4 h-4 opacity-30" />
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .bg-white\/8 { background-color: rgba(255,255,255,0.08); }
      `}</style>
    </div>
  );
}

