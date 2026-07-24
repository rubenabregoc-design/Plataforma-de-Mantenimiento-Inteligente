import { motion, AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import * as XLSX from 'xlsx';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Geolocation } from '@capacitor/geolocation';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import {
  initialAssets, 
  initialReminders, 
  initialTechnicians, 
  initialRequests,
  initialInventory
} from './mockData';

import {
  Asset, 
  MaintenanceReminder, 
  TechProfile, 
  JobRequest, 
  ChatMessage,
  TechCategory,
  AgendaEvent,
  InventoryItem,
  UserSubscription,
  MaterialItem,
  AssetCategory,
  StaffingProject
} from './types';

// Componentes MASTER V7
import AssetRegisterModal from './components/AssetRegisterModal';
import DiagnosticAIView from './components/DiagnosticAIView';
import TechnicianProfileModal from './components/TechnicianProfileModal';
import TechnicianEditProfileModal from './components/TechnicianEditProfileModal';
import ServiceReportModal from './components/ServiceReportModal';
import SignaturePad from './components/SignaturePad';
import SupportChatWidget from './components/SupportChatWidget';
import SupportModal from './components/SupportModal';
import InventoryModule from './components/InventoryModule';
import SubscriptionModule from './components/SubscriptionModule';
import MantechIDModule from './components/MantechIDModule';
import FleetDashboard from './components/FleetDashboard';
import Chatbot247 from './components/Chatbot247';
import QRScannerModal from './components/QRScannerModal';
import TechCredential from './components/TechCredential';
import MantechProLogo from './components/Logo';
import VideoCallModal from './components/VideoCallModal';
import AssetIntelligentCard from './components/AssetIntelligentCard';
import FuelAuditModule from './components/FuelAuditModule';
import HomeEmergencySOS from './components/HomeEmergencySOS';
import VerticalDashboard from './components/VerticalDashboard';
import AppScreensShowcase from './components/AppScreensShowcase';
import LandingCMS from './components/LandingCMS';
import NotificationCenter from './components/NotificationCenter';
import { ChecklistService } from './services/checklistService';
import { ROIService } from './services/roiService';
import LandingPage from './components/LandingPage';
import TechWalletModule from './components/TechWalletModule';
import TechnicianRadar from './components/TechnicianRadar';
import ProofOfWorkModule from './components/ProofOfWorkModule';
import WarrantyVaultModule from './components/WarrantyVaultModule';
import AssetEngineeringReportModal from './components/AssetEngineeringReportModal';

import { 
  LayoutDashboard, Store, FileCheck2, BrainCircuit, MessageSquare, CalendarDays, Users, DollarSign,
  Bell, BellRing, Send, CheckCircle, Plus, TrendingUp, Truck, Camera,
  Layers, ShieldCheck, Star, CheckCircle2, Bike,
  UserX, Clock, LogOut, User, ChevronRight, ChevronLeft,
  ShieldAlert, HelpCircle, Wrench, Search, Check, X, MapPin, BadgeCheck, Video, Monitor, Download,
  Calendar, AlertTriangle, Pencil, Trash2, FileText, Settings, Eye, EyeOff, Sparkles, Inbox, Car, Wind, Package, Globe, PieChart, Building2, Activity, CreditCard, ExternalLink, QrCode, Cpu, Zap, Navigation, Wifi, Wallet, ArrowRight, Fingerprint, LifeBuoy
} from 'lucide-react';

// Firebase
import { auth, db } from './firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  updateProfile
} from "firebase/auth";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  onSnapshot,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
  orderBy,
  limit
} from "firebase/firestore";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAuthResolving, setIsAuthResolving] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [role, setRole] = useState<'client' | 'tech' | 'admin'>('client');
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // App Data State
  const [assets, setAssets] = useState<Asset[]>([]);
  const [requests, setRequests] = useState<JobRequest[]>([]);
  const [technicians, setTechnicians] = useState<TechProfile[]>([]);
  const [allReminders, setAllReminders] = useState<MaintenanceReminder[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [subscription, setSubscription] = useState<UserSubscription>({ planId: 'plan-free', status: 'active', startDate: '', nextBillingDate: '' });

  // UI State
  const [clientTab, setClientTab] = useState<'dashboard' | 'fleet' | 'ai' | 'marketplace' | 'inventory' | 'warranty' | 'mantech_id' | 'subscriptions' | 'settings'>('dashboard');
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [assetToEdit, setAssetToEdit] = useState<Asset | null>(null);

  // --- SINCRONIZACIÓN FIREBASE ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        setIsLoggedIn(true);
        const userRef = doc(db, "users", firebaseUser.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          setUserData(data);
          setRole(data.role || 'client');
          if (data.subscription) setSubscription(data.subscription);
        }
      } else {
        setIsLoggedIn(false);
        setUser(null);
      }
      setIsAuthResolving(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!isLoggedIn || !user) return;

    const unsubAssets = onSnapshot(query(collection(db, "assets"), where("clientId", "==", user.uid)), (snap) => {
        const docs = snap.docs.map(d => ({ id: d.id, ...d.data() } as Asset));
        setAssets(docs.length > 0 ? docs : initialAssets);
    });

    const unsubRem = onSnapshot(collection(db, "reminders"), (snap) => {
        const docs = snap.docs.map(d => ({ id: d.id, ...d.data() } as MaintenanceReminder));
        setAllReminders(docs.length > 0 ? docs : initialReminders);
    });

    const unsubNotif = onSnapshot(query(collection(db, "notifications"), where("userId", "==", user.uid), where("read", "==", false)), (snap) => {
        setUnreadCount(snap.size);
    });

    return () => { unsubAssets(); unsubRem(); unsubNotif(); };
  }, [isLoggedIn, user]);

  const handleLogout = () => signOut(auth);

  const handleAddAsset = async (assetData: Omit<Asset, 'id' | 'registeredAt'>) => {
    if (!user) return;
    try {
      await addDoc(collection(db, "assets"), {
        ...assetData,
        clientId: user.uid,
        registeredAt: new Date().toISOString()
      });
      toast.success("Nodo sincronizado exitosamente.");
      setIsAssetModalOpen(false);
    } catch (err) { toast.error("Fallo en la sincronización."); }
  };

  if (isAuthResolving) return <div className="h-screen w-full bg-[#0d0e12] flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#5d3cfe]"></div></div>;

  if (!isLoggedIn) return <LandingPage onStart={() => setIsLoggedIn(true)} onWatchDemo={() => {}} assets={initialAssets} requests={[]} />;

  return (
    <PayPalScriptProvider options={{ clientId: "sb", currency: "USD" }}>
      <div className="min-h-screen bg-[#0d0e12] flex flex-col font-sans text-[#e3e2e8] overflow-hidden">
        <Toaster position="top-center" />

        <nav className="h-20 bg-[#0d0e12]/80 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-10 shrink-0 z-[100]">
          <MantechProLogo size="sm" />
          <div className="flex items-center gap-6">
            <button onClick={() => setShowNotificationCenter(true)} className="relative p-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-[#5d3cfe]/50 transition-all">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#5d3cfe] rounded-full text-[10px] font-black flex items-center justify-center border-2 border-[#0d0e12] animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>
            <button onClick={handleLogout} className="px-6 py-2.5 bg-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-500/10 hover:text-rose-500 transition-all">Salir</button>
          </div>
        </nav>

        <div className="flex flex-1 overflow-hidden relative">
          <aside className="w-72 bg-[#0d0e12] border-r border-white/5 p-8 flex flex-col shrink-0">
            <nav className="space-y-2 flex-1 scrollbar-hide overflow-y-auto">
              {[
                { id: 'dashboard', label: 'Mi Portafolio', icon: LayoutDashboard },
                { id: 'marketplace', label: 'Radar Especialistas', icon: Search },
                { id: 'mantech_id', label: 'Mantech ID', icon: Fingerprint },
                { id: 'fleet', label: 'Control de Flota', icon: Truck },
                { id: 'warranty', label: 'Bóveda de Garantías', icon: ShieldCheck },
                { id: 'inventory', label: 'Inventario Repuestos', icon: Package },
                { id: 'subscriptions', label: 'Plan Membresía', icon: Star },
                { id: 'settings', label: 'Ajustes del Nodo', icon: Settings },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setClientTab(item.id as any)}
                  className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-wider transition-all ${clientTab === item.id ? 'bg-[#5d3cfe] text-white shadow-lg shadow-[#5d3cfe]/20' : 'text-white/40 hover:bg-white/5'}`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </button>
              ))}
            </nav>
            <div className="mt-8 pt-8 border-t border-white/5">
               <HomeEmergencySOS />
            </div>
          </aside>

          <main className="flex-1 p-10 overflow-y-auto custom-scrollbar bg-[radial-gradient(circle_at_top_right,#1e1b4b,transparent_40%)]">
            <div className="max-w-6xl mx-auto space-y-12">
              {clientTab === 'dashboard' && (
                <div className="space-y-12">
                  <header className="flex justify-between items-end">
                    <div>
                      <h1 className="text-4xl font-black text-white uppercase tracking-tighter">Mi <span className="text-[#5d3cfe]">Portafolio</span></h1>
                      <p className="text-white/20 text-[10px] font-bold mt-2 tracking-widest uppercase">Gestión de Activos en Tiempo Real</p>
                    </div>
                    <button onClick={() => setIsAssetModalOpen(true)} className="px-8 py-4 bg-[#5d3cfe] text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-[#5d3cfe]/20 hover:scale-105 active:scale-95 transition-all">+ Registrar Activo</button>
                  </header>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {assets.map(a => <AssetIntelligentCard key={a.id} asset={a} requests={[]} onOpenDetails={() => {}} onOpenPreTrip={() => {}} />)}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <FuelAuditModule assets={assets} />
                    <VerticalDashboard assets={assets} />
                  </div>
                </div>
              )}

              {clientTab === 'marketplace' && <TechnicianRadar technicians={initialTechnicians} onSelectTech={() => {}} />}
              {clientTab === 'mantech_id' && <MantechIDModule user={userData} />}
              {clientTab === 'fleet' && <FleetDashboard assets={assets} reminders={allReminders} />}
              {clientTab === 'warranty' && <WarrantyVaultModule assets={assets} />}
              {clientTab === 'inventory' && <InventoryModule inventory={initialInventory} onUpdateStock={() => {}} />}
              {clientTab === 'subscriptions' && <SubscriptionModule subscription={subscription} onUpgrade={() => {}} role="client" />}
              {clientTab === 'settings' && <LandingCMS />}
            </div>
          </main>
        </div>

        <AnimatePresence>
          {showNotificationCenter && user && <NotificationCenter userId={user.uid} onClose={() => setShowNotificationCenter(false)} />}
        </AnimatePresence>

        <AssetRegisterModal
          isOpen={isAssetModalOpen}
          onClose={() => setIsAssetModalOpen(false)}
          onAdd={handleAddAsset}
          maxAssets={10}
          currentAssetsCount={assets.length}
        />
      </div>
    </PayPalScriptProvider>
  );
}
