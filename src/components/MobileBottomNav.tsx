import React from 'react';
import {
  LayoutDashboard, BrainCircuit, Store, ShieldCheck,
  Inbox, Layers, CalendarDays, PieChart, Menu,
  DollarSign, FileText, MessageSquare, Plus, Truck
} from 'lucide-react';
import { triggerHaptic } from '../hooks/useAndroidNative';
import { useUI } from '../context/UIContext';

interface MobileBottomNavProps {
  role: 'client' | 'tech' | 'admin' | 'driver' | null;
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenMoreMenu: () => void;
  unreadCount?: number;
}

interface BottomNavTab {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  highlight?: boolean;
}

export default function MobileBottomNav({
  role,
  currentTab,
  onSelectTab,
  onOpenMoreMenu,
  unreadCount = 0
}: MobileBottomNavProps) {
  const { openModal } = useUI();

  if (!role) return null;

  const handleTabClick = (tab: string) => {
    triggerHaptic('selection');
    onSelectTab(tab);
  };

  const handleMoreClick = () => {
    triggerHaptic('medium');
    onOpenMoreMenu();
  };

  const handleQuickActionsClick = () => {
    triggerHaptic('medium');
    openModal('quickActions');
  };

  // Define left and right primary bottom tabs per role
  const clientLeftTabs: BottomNavTab[] = [
    { id: 'dashboard', label: 'Equipos', icon: LayoutDashboard },
    { id: 'ai', label: 'IA Diag', icon: BrainCircuit, highlight: true },
  ];
  const clientRightTabs: BottomNavTab[] = [
    { id: 'marketplace', label: 'Expertos', icon: Store },
  ];

  const techLeftTabs: BottomNavTab[] = [
    { id: 'received', label: 'Bandeja', icon: Inbox },
    { id: 'bidding_market', label: 'Bolsa', icon: Layers },
  ];
  const techRightTabs: BottomNavTab[] = [
    { id: 'agenda', label: 'Agenda', icon: CalendarDays },
  ];

  const driverLeftTabs: BottomNavTab[] = [
    { id: 'cockpit', label: 'Cabina', icon: Truck, highlight: true },
  ];
  const driverRightTabs: BottomNavTab[] = [
    { id: 'chat', label: 'Flota', icon: MessageSquare },
  ];

  const adminLeftTabs: BottomNavTab[] = [
    { id: 'finance', label: 'Finanzas', icon: DollarSign },
    { id: 'validator', label: 'Validador', icon: ShieldCheck },
  ];
  const adminRightTabs: BottomNavTab[] = [
    { id: 'tickets', label: 'Tickets', icon: MessageSquare },
  ];

  const leftTabs = role === 'client' ? clientLeftTabs : role === 'tech' ? techLeftTabs : role === 'driver' ? driverLeftTabs : adminLeftTabs;
  const rightTabs = role === 'client' ? clientRightTabs : role === 'tech' ? techRightTabs : role === 'driver' ? driverRightTabs : adminRightTabs;

  const allVisibleTabs = [...leftTabs, ...rightTabs];
  const isMoreTabActive = !allVisibleTabs.some(t => t.id === currentTab);

  const renderTabButton = (tab: BottomNavTab) => {
    const isActive = currentTab === tab.id;
    const Icon = tab.icon;

    return (
      <button
        key={tab.id}
        onClick={() => handleTabClick(tab.id)}
        className={`flex-1 flex flex-col items-center justify-center py-1.5 px-0.5 rounded-2xl transition-all relative group ${
          isActive ? 'text-white' : 'text-[#8e8d9a] hover:text-[#c8c4d9]'
        }`}
      >
        {/* Active Indicator Pip */}
        {isActive && (
          <span className="absolute -top-1 w-6 h-1 bg-[#5d3cfe] rounded-full shadow-[0_0_10px_#5d3cfe] animate-fade-in" />
        )}

        <div
          className={`p-2 rounded-xl transition-all duration-200 ${
            isActive
              ? 'bg-[#5d3cfe]/20 text-[#5d3cfe] scale-110 shadow-lg shadow-[#5d3cfe]/10'
              : tab.highlight
              ? 'text-[#52ffac]'
              : 'text-current group-active:scale-95'
          }`}
        >
          <Icon className="w-5 h-5" />
        </div>

        <span
          className={`text-[9px] font-black uppercase tracking-wider mt-0.5 transition-colors ${
            isActive ? 'text-white font-extrabold' : 'text-[#8e8d9a]'
          }`}
        >
          {tab.label}
        </span>
      </button>
    );
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-[40] pointer-events-none">
      <div className="pointer-events-auto bg-[#0d0e12]/95 backdrop-blur-2xl border-t border-[#2a2b2f]/80 shadow-[0_-10px_30px_rgba(0,0,0,0.7)] px-2 pt-1.5 pb-[max(env(safe-area-inset-bottom),0.75rem)]">
        <div className="flex items-center justify-around max-w-lg mx-auto">
          {/* Left Primary Tabs */}
          {leftTabs.map(renderTabButton)}

          {/* Central Elevated Action (+) Button */}
          {role !== 'admin' ? (
            <div className="flex-1 flex flex-col items-center justify-center -mt-4">
              <button
                onClick={handleQuickActionsClick}
                aria-label="Acciones Rápidas"
                className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#5d3cfe] via-[#6e4ef4] to-[#8d71ff] text-white flex items-center justify-center shadow-[0_4px_22px_rgba(93,60,254,0.55)] border-2 border-white/20 active:scale-90 transition-transform group"
              >
                <Plus className="w-6 h-6 stroke-[3] group-hover:rotate-90 transition-transform duration-200" />
              </button>
              <span className="text-[8px] font-black uppercase tracking-wider text-[#a8a4b8] mt-0.5">
                Acción
              </span>
            </div>
          ) : (
            renderTabButton({ id: 'audit', label: 'Logs', icon: FileText })
          )}

          {/* Right Primary Tabs */}
          {rightTabs.map(renderTabButton)}

          {/* Extended Menu Trigger ("Más") */}
          <button
            onClick={handleMoreClick}
            className={`flex-1 flex flex-col items-center justify-center py-1.5 px-0.5 rounded-2xl transition-all relative group ${
              isMoreTabActive ? 'text-white' : 'text-[#8e8d9a] hover:text-[#c8c4d9]'
            }`}
          >
            {isMoreTabActive && (
              <span className="absolute -top-1 w-6 h-1 bg-[#5d3cfe] rounded-full shadow-[0_0_10px_#5d3cfe]" />
            )}

            <div
              className={`p-2 rounded-xl relative transition-all duration-200 ${
                isMoreTabActive
                  ? 'bg-[#5d3cfe]/20 text-[#5d3cfe] scale-110'
                  : 'text-current group-active:scale-95'
              }`}
            >
              <Menu className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#5d3cfe] rounded-full border border-[#0d0e12] animate-pulse" />
              )}
            </div>

            <span
              className={`text-[9px] font-black uppercase tracking-wider mt-0.5 ${
                isMoreTabActive ? 'text-white font-extrabold' : 'text-[#8e8d9a]'
              }`}
            >
              Más
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
