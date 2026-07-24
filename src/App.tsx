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
import { ChecklistService } from './services/checklistService';
import { ROIService } from './services/roiService';
import LandingPage from './components/LandingPage';
import TechWalletModule from './components/TechWalletModule';
import TechnicianRadar from './components/TechnicianRadar';
import RouteStartModal from './components/RouteStartModal';
import CheckpointModal from './components/CheckpointModal';
import CorporateSupportModal from './components/CorporateSupportModal';
import ProofOfWorkModule from './components/ProofOfWorkModule';
import WarrantyVaultModule from './components/WarrantyVaultModule';
import AssetEngineeringReportModal from './components/AssetEngineeringReportModal';
import { generateCUFE } from './utils/fiscal';

// Servicios PROFESIONALES (Clean Architecture)
import { AssetService } from './services/assetService';
import { logActivity } from './services/auditService';
import AuditLogsModule from './components/AuditLogsModule';
import Skeleton from './components/Skeleton';

import { 
  LayoutDashboard, Store, FileCheck2, BrainCircuit, MessageSquare, CalendarDays, Users, DollarSign,
  Bell, BellRing, Send, CheckCircle, Plus, TrendingUp, Truck, Camera,
  Layers, ShieldCheck, Star, CheckCircle2, Bike,
  UserX, Clock, LogOut, User, ChevronRight, ChevronLeft,
  ShieldAlert, HelpCircle, Wrench, Search, Check, X, MapPin, BadgeCheck, Video, Monitor, Download,
  Calendar, AlertTriangle, Pencil, Trash2, FileText, Settings, Eye, EyeOff, Sparkles, Inbox, Car, Wind, Package, Globe, PieChart, Building2, Activity, CreditCard, ExternalLink, QrCode, Cpu, Zap, Navigation, Wifi, Wallet, ArrowRight
} from 'lucide-react';

// Firebase
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
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  orderBy,
  arrayUnion,
  runTransaction,
  increment
} from "firebase/firestore";
import { auth, db } from "./firebase";

export default function App() {
  const { t, i18n } = useTranslation();
  // Session state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAuthResolving, setIsAuthResolving] = useState(true);
  const [isDataLoading, setIsDataLoading] = useState(true);

  const handleLogout = () => {
    signOut(auth);
  };

  const [user, setUser] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [role, setRole] = useState<'client' | 'tech' | 'admin'>('client');
  const [verticalMode, setVerticalMode] = useState<AssetCategory>('GENERAL');

  const [loggedInName, setLoggedInName] = useState('');
  const [loggedInEmail, setLoggedInEmail] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [selectedTechProfileId, setSelectedTechProfileId] = useState<string | null>(localStorage.getItem('mantech_logged_tech_id'));

  // App Data State
  const [assets, setAssets] = useState<Asset[]>([]);
  const [reminders, setReminders] = useState<MaintenanceReminder[]>([]);
  const [technicians, setTechnicians] = useState<TechProfile[]>([]);
  const [requests, setRequests] = useState<JobRequest[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [allReminders, setAllReminders] = useState<MaintenanceReminder[]>([]);
  const [agenda, setAgenda] = useState<AgendaEvent[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [subscription, setSubscription] = useState<UserSubscription>({
    planId: 'plan-basic',
    status: 'active',
    startDate: new Date().toISOString(),
    nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  });

  // Derived categories from asset portfolio (V5)
  const ownedCategories = useMemo(() =>
    Array.from(new Set(assets.map(a => a.category))),
    [assets]
  );

  // UI State
  const [adminTab, setAdminTab] = useState<'finance' | 'users' | 'logistics' | 'alerts' | 'inventory' | 'audit' | 'roi' | 'settings'>('finance');
  const [clientTab, setClientTab] = useState<'dashboard' | 'fleet' | 'ai' | 'marketplace' | 'quotes' | 'inventory' | 'audit' | 'subscriptions' | 'chat' | 'settings' | 'warranty' | 'tour' | 'wallet' | 'mantech_id' | 'staffing'>('dashboard');
  const [techTab, setTechTab] = useState<'received' | 'bidding_market' | 'agenda' | 'wallet' | 'mantech_id' | 'chat' | 'profile' | 'settings' | 'community' | 'loyalty'>('received');

  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [assetToEdit, setAssetToEdit] = useState<Asset | null>(null);
  const [isTechModalOpen, setIsTechModalOpen] = useState(false);
  const [activeTechForModal, setActiveTechForModal] = useState<TechProfile | null>(null);
  const [activeChatRequestId, setActiveChatRequestId] = useState<string | null>(null);
  const [isEditingTechProfile, setIsEditingTechProfile] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [activeRequestForSignature, setActiveRequestForSignature] = useState<string | null>(null);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [selectedRequestForReport, setSelectedRequestForReport] = useState<JobRequest | null>(null);
  const [isProofOfWorkOpen, setIsProofOfWorkOpen] = useState(false);
  const [activeRequestForProof, setActiveRequestForProof] = useState<string | null>(null);
  const [showAuthForm, setShowAuthForm] = useState(false);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCorporateSupportModalOpen, setIsCorporateSupportModalOpen] = useState(false);
  const [isFuelModalOpen, setIsFuelModalOpen] = useState(false);
  const [isPreTripModalOpen, setIsPreTripModalOpen] = useState(false);
  const [isHomeSOSOpen, setIsHomeSOSOpen] = useState(false);
  const [isRequoteModalOpen, setIsRequoteModalOpen] = useState(false);
  const [activeRequestForRequote, setActiveRequestForRequote] = useState<JobRequest | null>(null);
  const [activeAssetForFuel, setActiveAssetForFuel] = useState<Asset | null>(null);
  const [activeAssetForEngineering, setActiveAssetForEngineering] = useState<Asset | null>(null);
  const [isEngineeringModalOpen, setIsEngineeringModalOpen] = useState(false);

  // Smart Availability Flow State
  const [busyTechInfo, setBusyTechInfo] = useState<{ tech: TechProfile, date: string, time: string, assetId: string, description: string } | null>(null);
  const [isAlternativesModalOpen, setIsAlternativesModalOpen] = useState(false);
  const [alternatives, setAlternatives] = useState<TechProfile[]>([]);

  // Marketplace UI State
  const [marketViewMode, setMarketViewMode] = useState<'list' | 'radar' | 'bidding'>('list');
  const [isRouteStartModalOpen, setIsRouteStartModalOpen] = useState(false);
  const [isCheckpointModalOpen, setIsCheckpointModalOpen] = useState(false);
  const [assetForRoute, setAssetForRoute] = useState<Asset | null>(null);

  // Asset View State
  const [assetSearchQuery, setAssetSearchQuery] = useState('');
  const [assetCurrentPage, setAssetCurrentPage] = useState(1);
  const assetPageSize = 6;

  // PLAN CONFIGURATION
  const getPlanLimits = (planId: string) => {
    switch(planId) {
      case 'plan-pro': return { maxAssets: 25, commission: 0.15, fleet: 'lite', diag: 'assisted', sites: 5, history: 50, support: 'alta' };
      case 'plan-enterprise': return { maxAssets: 9999, commission: 0.10, fleet: 'full', diag: 'auto', sites: 'unlimited', history: 'unlimited', support: 'critica', subaccounts: 99 };
      case 'plan-basic': return { maxAssets: 5, commission: 0.20, fleet: 'none', diag: 'manual', sites: 1, history: 10, support: 'estandar' };
      default: return { maxAssets: 2, commission: 0.20, fleet: 'none', diag: 'manual', sites: 1, history: 5, support: 'estandar' };
    }
  };

  const planLimits = getPlanLimits(subscription.planId);

  // Video Call & Scanner V4
  const [isVideoCallOpen, setIsVideoCallOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [videoCallRoom, setVideoCallRoom] = useState('');
  const [isVideoVoiceOnly, setIsVideoVoiceOnly] = useState(false);
  const [isCredentialModalOpen, setIsCredentialModalOpen] = useState(false);
  const [acceptedContracts, setAcceptedContracts] = useState<{[key: string]: boolean}>({});

  // Imprevistos
  const [isUnforeseenModalOpen, setIsUnforeseenModalOpen] = useState(false);
  const [isIncidentModalOpen, setIsIncidentModalOpen] = useState(false);
  const [activeRequestForIncident, setActiveRequestForIncident] = useState<JobRequest | null>(null);
  const [incidentInputs, setIncidentInputs] = useState({ description: '', photos: [] as string[] });
  const [activeRequestForUnforeseen, setActiveRequestForUnforeseen] = useState<any>(null);
  const [unforeseenInputs, setUnforeseenInputs] = useState({ reason: '', amount: '', category: 'spare_part' });

  // GPS TRACKING STATE
  const [trackingAssetId, setTrackingAssetId] = useState<string | null>(localStorage.getItem('mantech_tracking_id'));
  const [tripStatus, setTripStatus] = useState<'idle' | 'active' | 'paused'>((localStorage.getItem('mantech_trip_status') as any) || 'idle');
  const watchIdRef = useRef<string | null>(null);
  const lastPosRef = useRef<any>(null);

  // PUSH NOTIFICATIONS SETUP
  useEffect(() => {
    if (Capacitor.isNativePlatform()) setupPushNotifications();
  }, []);

  const setupPushNotifications = async () => {
    try {
      let permStatus = await PushNotifications.checkPermissions();
      if (permStatus.receive !== 'granted') permStatus = await PushNotifications.requestPermissions();
      if (permStatus.receive !== 'granted') return;
      await PushNotifications.register();
      await PushNotifications.addListener('registration', token => {
        if (user) updateDoc(doc(db, "users", user.uid), { fcmToken: token.value });
      });
      await PushNotifications.addListener('pushNotificationReceived', notification => {
        toast(notification.body || 'Nueva notificación', { icon: '🔔' });
      });
    } catch (e) { console.error("Error setting up push notifications", e); }
  };

  useEffect(() => {
    if (trackingAssetId) localStorage.setItem('mantech_tracking_id', trackingAssetId);
    else localStorage.removeItem('mantech_tracking_id');
  }, [trackingAssetId]);

  useEffect(() => { localStorage.setItem('mantech_trip_status', tripStatus); }, [tripStatus]);

  useEffect(() => { if (isLoggedIn && trackingAssetId && tripStatus !== 'idle') startGpsTracking(trackingAssetId, true); }, [isLoggedIn]);

  const toggleGpsPause = () => {
    if (tripStatus === 'active') { setTripStatus('paused'); toast("Ruta Pausada: Kilometraje detenido.", { icon: '⏸️' }); }
    else if (tripStatus === 'paused') { setTripStatus('active'); lastPosRef.current = null; toast.success("Ruta Reanudada: Contando Km..."); }
  };

  const startGpsTracking = async (assetId: string, isResuming = false) => {
    if (trackingAssetId === assetId && !isResuming) {
      if (watchIdRef.current) Geolocation.clearWatch({ id: watchIdRef.current });
      setTrackingAssetId(null); setTripStatus('idle'); lastPosRef.current = null;
      toast.success("Viaje Finalizado. Kilometraje total guardado.");
      return;
    }
    try {
      if (!trackingAssetId && !isResuming) {
        const asset = assets.find(a => a.id === assetId);
        if (asset) { setAssetForRoute(asset); setIsRouteStartModalOpen(true); }
        return;
      }
      setTrackingAssetId(assetId);
      if (!isResuming) setTripStatus('active');
      watchIdRef.current = await Geolocation.watchPosition({ enableHighAccuracy: true, timeout: 10000, maximumAge: 3000 }, (position) => {
        if (!position || tripStatus === 'paused') return;
        if (lastPosRef.current) {
          const dist = calculateDistance(lastPosRef.current.coords.latitude, lastPosRef.current.coords.longitude, position.coords.latitude, position.coords.longitude);
          if (dist > 0.02) {
             const asset = assets.find(a => a.id === assetId);
             if (asset) {
                const newKm = (asset.mileage || 0) + dist;
                updateDoc(doc(db, "assets", assetId), {
                    mileage: Math.round(newKm),
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    routeHistory: arrayUnion({ lat: position.coords.latitude, lng: position.coords.longitude, timestamp: new Date().toISOString(), type: 'track' })
                });
             }
          }
        }
        lastPosRef.current = position;
      });
    } catch (e) { console.error(e); }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
  };

  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
  const [activeRequestForMaterial, setActiveRequestForMaterial] = useState<any>(null);
  const [materialInputs, setMaterialInputs] = useState({ name: '', price: '', quantity: '1', category: 'general' });

  // Auth Form State
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authRole, setAuthRole] = useState<'client' | 'tech'>('client');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginName, setLoginName] = useState('');
  const [authError, setAuthError] = useState('');

  const sendPushNotification = async (title: string, body: string, userToken?: string) => {
    const currentHour = new Date().getHours();
    if (currentHour >= 22 || currentHour < 7) return;
    const token = userToken || userData?.fcmToken;
    if (!token) return;
    try { fetch('/api/notifications/send', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title, body, token }) }); } catch (err) { console.error("Push failed", err); }
  };

  const notifyAdmin = async (title: string, body: string) => { sendPushNotification(title, body, 'ADMIN_TOKEN_MASTER'); };

  // Bidding
  const [bidPrice, setBidPrice] = useState<string>('');
  const [bidDate, setBidDate] = useState<string>('');
  const [bidTime, setBidTime] = useState<string>('');
  const [bidDuration, setBidDuration] = useState<number>(1);
  const [bidTravelTime, setBidTravelTime] = useState<number>(30);
  const [bidWarrantyDays, setBidWarrantyDays] = useState<number>(90);
  const [bidWarrantyCoverage, setBidWarrantyCoverage] = useState<string>('Mano de obra y mano de obra de corrección.');
  const [bidServiceType, setBidServiceType] = useState<'onsite' | 'remote'>('onsite');
  const [bidRemotePlatform, setBidRemotePlatform] = useState<'anydesk' | 'zoom' | 'meet' | 'teams' | 'whatsapp' | 'other'>('anydesk');
  const [bidRemoteLink, setBidRemoteLink] = useState<string>('');
  const [draftingBidRequestId, setDraftingBidRequestId] = useState<string | null>(null);

  // Drafts for Bidding
  const [bidMaterials, setBidMaterials] = useState<MaterialItem[]>([]);
  const [newBidMaterial, setNewBidMaterial] = useState({ name: '', price: '', quantity: '1' });
  const [bidChecklist, setBidChecklist] = useState<{id: string, description: string, isCompleted: boolean}[]>([
    { id: '1', description: 'Inspección técnica inicial', isCompleted: false },
    { id: '2', description: 'Desarmado y limpieza', isCompleted: false },
    { id: '3', description: 'Pruebas de funcionamiento', isCompleted: false }
  ]);

  const [ratingVal, setRatingVal] = useState<number>(5);
  const [ratingComment, setRatingComment] = useState<string>('');
  const [marketFilter, setMarketFilter] = useState<TechCategory | 'all'>('all');
  const [globalSearch, setGlobalSearch] = useState('');

  // Logic: Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        setLoggedInEmail(firebaseUser.email || '');
        try {
          const userRef = doc(db, "users", firebaseUser.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const data = userSnap.data();
            setUserData(data);
            setRole(data.role || (firebaseUser.email === 'admin@mantech.com' ? 'admin' : 'client'));
            setLoggedInName(data.name || firebaseUser.displayName || 'Mantech User');
            setProfileImage(data.profileImage || '');
            if (data.role === 'tech') {
              const tId = data.techId || `tech-${firebaseUser.uid}`;
              setSelectedTechProfileId(tId);
              localStorage.setItem('mantech_logged_tech_id', tId);
            }
            if (data.subscription) setSubscription(data.subscription);
          } else if (firebaseUser.email === 'admin@mantech.com') {
            await setDoc(userRef, { uid: firebaseUser.uid, email: firebaseUser.email, name: 'Administrador Central', role: 'admin', createdAt: serverTimestamp() });
            setRole('admin'); setLoggedInName('Administrador Central');
          }
          setIsLoggedIn(true);
        } catch (err) { console.error("Auth setup error:", err); }
      } else { setIsLoggedIn(false); setUser(null); setUserData(null); }
      setIsAuthResolving(false);
    });
    return () => unsubscribe();
  }, []);

  // Listeners
  useEffect(() => {
    if (!isLoggedIn || !user) return;
    const unsubUser = onSnapshot(doc(db, "users", user.uid), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setUserData(data);
        if (data.role && data.role !== role) setRole(data.role as any);
        if (data.subscription) setSubscription(data.subscription);
      }
    });
    const unsubTechs = onSnapshot(collection(db, "technicians"), (snap) => setTechnicians(snap.docs.map(d => ({ id: d.id, ...d.data() })) as TechProfile[]));
    const qReq = role === 'admin' ? query(collection(db, "requests"), orderBy("createdAt", "desc")) : query(collection(db, "requests"), where(role === 'client' ? 'clientId' : 'techUserId', "==", user.uid));
    const unsubReqs = onSnapshot(qReq, (snap) => setRequests(snap.docs.map(d => ({ id: d.id, ...d.data() })) as JobRequest[]));
    const unsubAssets = onSnapshot(query(collection(db, "assets"), where("clientId", "==", user.uid)), (snap) => { setAssets(snap.docs.map(d => ({ id: d.id, ...d.data() })) as Asset[]); setIsDataLoading(false); });
    const unsubRem = onSnapshot(query(collection(db, "reminders")), (snap) => setAllReminders(snap.docs.map(d => ({ id: d.id, ...d.data() })) as MaintenanceReminder[]));
    const unsubInv = onSnapshot(collection(db, "inventory"), (snap) => setInventory(snap.docs.map(d => ({ id: d.id, ...d.data() })) as InventoryItem[]));
    const unsubUsers = onSnapshot(collection(db, "users"), (snap) => setAllUsers(snap.docs.map(d => ({ uid: d.id, ...d.data() }))));
    return () => { unsubUser(); unsubTechs(); unsubReqs(); unsubAssets(); unsubRem(); unsubInv(); unsubUsers(); };
  }, [isLoggedIn, user]);

  const handleLogin = async (e: any) => {
    if (e) e.preventDefault();
    setAuthError('');
    try {
      if (authMode === 'register') {
        const res = await createUserWithEmailAndPassword(auth, loginEmail, loginPassword);
        const tId = authRole === 'tech' ? `tech-${Date.now()}` : null;
        const initialSub = { planId: authRole === 'tech' ? 'plan-basic' : 'plan-free', status: 'active', startDate: new Date().toISOString(), nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() };
        await setDoc(doc(db, "users", res.user.uid), { uid: res.user.uid, email: loginEmail, name: loginName, role: authRole, techId: tId, subscription: initialSub, createdAt: serverTimestamp(), plan: initialSub.planId.split('-')[1] });
        if (authRole === 'tech' && tId) {
          await setDoc(doc(db, "technicians", tId), { id: tId, name: loginName, category: 'mecanico', rating: 5.0, reviewCount: 0, completedJobs: 0, location: 'Panamá', hourlyRate: 25, bio: 'Técnico certificado.', plan: 'basic', userId: res.user.uid, wallet: { balance: 0, pendingBalance: 0, transactions: [] } });
        }
      } else {
        await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
      }
    } catch (err: any) { setAuthError(err.message); }
  };

  const handleRequestQuote = async (techId: string, assetId: string, description: string, suggestedDate?: string, suggestedTime?: string) => {
    if (!user) return;
    const tech = technicians.find(t => t.id === techId);
    const asset = assets.find(a => a.id === assetId);
    if (!tech || !asset) return;
    try {
      await addDoc(collection(db, "requests"), {
        clientId: user.uid, clientName: loggedInName, assetId, assetName: asset.name, category: asset.category, techId, techName: tech.name, techUserId: tech.userId || null,
        description, status: 'pending', createdAt: serverTimestamp(), scheduledDate: suggestedDate || '', scheduledTime: suggestedTime || '', checklist: ChecklistService.getTemplateByAssetType(asset.type), materials: [], clientPlan: subscription.planId
      });
      toast.success("¡Solicitud enviada!");
      setClientTab('quotes');
    } catch (err) { console.error(err); }
  };

  const handleSubmitBid = async (requestId: string) => {
    if (!requestId || !bidPrice || !bidDate || !bidTime) return toast.error("Complete todos los campos.");
    try {
      const tech = getSelectedTechProfileObj();
      const baseBidPrice = Number(bidPrice);
      const commissionRate = getPlanLimits(tech.plan || 'basic').commission;
      const techItbms = tech.isTaxObligated ? baseBidPrice * 0.07 : 0;
      const platformComm = baseBidPrice * commissionRate;
      const commItbms = platformComm * 0.07;
      const subtotal = baseBidPrice + techItbms;
      const paypalFee = (subtotal * 0.04) + 0.30;
      const totalPrice = subtotal + paypalFee;
      const techEarnings = (baseBidPrice + techItbms) - (platformComm + commItbms);

      await updateDoc(doc(db, "requests", requestId), {
        price: totalPrice, basePrice: baseBidPrice, itbmsAmount: techItbms, paypalFee, commission: platformComm, commissionItbms: commItbms, technicianEarnings: techEarnings,
        warrantyDays: bidWarrantyDays, warrantyCoverage: bidWarrantyCoverage, scheduledDate: bidDate, scheduledTime: bidTime, scheduledDuration: bidDuration, scheduledTravelTime: bidTravelTime,
        status: 'quoted', techUserId: user.uid
      });
      toast.success("¡Cotización Enviada!");
      setDraftingBidRequestId(null);
    } catch (err) { console.error(err); }
  };

  const handleAcceptQuote = async (requestId: string, method: string) => {
    const req = requests.find(r => r.id === requestId);
    if (!req) return;
    try {
      await updateDoc(doc(db, "requests", requestId), { status: method === 'yappy' ? 'pending_verification' : 'accepted', paidAt: serverTimestamp(), paymentMethod: method });
      if (method !== 'yappy') {
        await addDoc(collection(db, "agenda"), { requestId, techId: req.techId, techUserId: req.techUserId, clientName: req.clientName, clientId: user.uid, title: `CONFIRMADO: ${req.assetName}`, date: req.scheduledDate, time: req.scheduledTime, status: 'confirmed', createdAt: serverTimestamp() });
      }
      setClientTab('chat');
    } catch (err) { console.error(err); }
  };

  const handleCompleteJob = async (requestId: string, signature: string) => {
    if (!requestId) {
      toast.error("Error: No se pudo identificar el servicio a finalizar.");
      return;
    }
    try {
      const req = requests.find(r => r.id === requestId);
      if (!req) return;

      if (req.clientId === user.uid) {
         toast.error("ERROR DE SEGURIDAD: No puedes auto-contratarte con tu cuenta de cliente.");
         return;
      }

      const newStatus = req.status === 'executing' ? 'completed' : 'rated';
      const cufe = generateCUFE(req);

      await updateDoc(doc(db, "requests", requestId), {
        status: newStatus,
        visitFinishedAt: new Date().toISOString(),
        clientSignature: signature,
        rating: ratingVal,
        comment: ratingComment,
        cufe: cufe
      });

      if (newStatus === 'completed' || newStatus === 'rated') {
        fetch('/api/email/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: req.clientEmail || user.email,
            type: 'report',
            data: { assetName: req.assetName, id: requestId }
          })
        }).catch(e => console.error("Email report fail", e));
      }

      setIsSignatureModalOpen(false);
      setActiveRequestForSignature(null);
      toast.success(newStatus === 'completed' ? "¡Servicio Finalizado y Liquidado!" : "¡Gracias por tu calificación!");

      if (newStatus === 'completed') {
         const tech = technicians.find(t => t.id === req.techId);
         if (tech) {
            const finalR = Math.max(1, ratingVal - ((req.rescheduleCount || 0) * 0.2));
            const nRating = ((tech.rating * tech.reviewCount) + finalR) / (tech.reviewCount + 1);

            const earnings = Number(req.technicianEarnings || 0);
            const currentPending = Number(tech.wallet?.pendingBalance || 0);
            const newPending = currentPending + earnings;

            const releaseDate = new Date();
            releaseDate.setHours(releaseDate.getHours() + 48); // Ventana de disputa de 48h

            const newTransaction = {
               id: `TX-${Date.now().toString().substring(7)}`,
               amount: earnings,
               type: 'credit',
               description: `Servicio ${req.serviceType === 'remote' ? 'Remoto' : 'Presencial'}: ${req.assetName}`,
               timestamp: new Date().toISOString(),
               availableAt: releaseDate.toISOString(),
               status: 'pending'
            };

            const multiplier = tech.plan === 'enterprise' ? 2.0 : tech.plan === 'pro' ? 1.5 : 1.0;
            const pointsEarned = Math.floor(earnings * multiplier);
            const currentPoints = Number(tech.loyaltyPoints || 0);

            const updatedTransactions = [newTransaction, ...(tech.wallet?.transactions || [])];

            await updateDoc(doc(db, "technicians", tech.id), {
               completedJobs: (tech.completedJobs || 0) + 1,
               reviewCount: tech.reviewCount + 1,
               rating: Number(nRating.toFixed(1)),
               loyaltyPoints: currentPoints + pointsEarned,
               'wallet.pendingBalance': newPending,
               'wallet.transactions': updatedTransactions
            });
         }
      }
    } catch (err) { console.error(err); }
  };

  const handleConfirmSubscriptionUpgrade = async (planId: string, isInstant: boolean = false) => {
    if (!user) return toast.error("Sesión no válida.");
    try {
      const planCode = planId.split('-')[1];
      if (planId === 'plan-basic' || planId === 'plan-free' || isInstant) {
        const nextBilling = new Date(); nextBilling.setDate(nextBilling.getDate() + 30);
        const newSub = { planId, status: 'active', startDate: new Date().toISOString(), nextBillingDate: nextBilling.toISOString() };
        await updateDoc(doc(db, "users", user.uid), { subscription: newSub, plan: planCode });
        if (role === 'tech' && userData?.techId) await updateDoc(doc(db, "technicians", userData.techId), { plan: planCode });
        setSubscription(newSub as UserSubscription);
        setIsSubPaymentModalOpen(false);
        toast.success("Plan actualizado.");
        return;
      }
      await updateDoc(doc(db, "users", user.uid), { 'subscription.requestedPlanId': planId, 'subscription.status': 'pending_payment_verification' });
      setIsSubPaymentModalOpen(false); toast.success("Solicitud enviada.");
    } catch (err) { console.error(err); }
  };

  const handleApproveSubscription = async (uid: string, planId: string) => {
    try {
      const planCode = planId.split('-')[1];
      const nextBilling = new Date(); nextBilling.setDate(nextBilling.getDate() + 30);
      const newSub = { planId, status: 'active', startDate: new Date().toISOString(), nextBillingDate: nextBilling.toISOString() };
      await updateDoc(doc(db, "users", uid), { subscription: newSub, plan: planCode });
      const uSnap = await getDoc(doc(db, "users", uid));
      if (uSnap.exists() && uSnap.data().role === 'tech') {
        const tId = uSnap.data().techId || `tech-${uid}`;
        await updateDoc(doc(db, "technicians", tId), { plan: planCode });
      }
      toast.success("Suscripción activada.");
    } catch (err) { console.error(err); }
  };

  const [isSubPaymentModalOpen, setIsSubPaymentModalOpen] = useState(false);
  const [selectedPlanForPayment, setSelectedPlanForPayment] = useState<any>(null);

  const handleOpenSubscriptionPayment = (planId: string) => {
    const plans = role === 'tech' ? [{ id: 'plan-basic', price: 0, name: 'Técnico Standard' }, { id: 'plan-pro', price: 45, name: 'Técnico Pro' }, { id: 'plan-enterprise', price: 99, name: 'Partner Élite' }] : [{ id: 'plan-free', price: 0, name: 'Gratis' }, { id: 'plan-basic', price: 29, name: 'Emprendedor' }, { id: 'plan-pro', price: 89, name: 'Profesional' }, { id: 'plan-enterprise', price: 199, name: 'Enterprise' }];
    const p = plans.find(x => x.id === planId);
    if (p && p.price === 0) { handleConfirmSubscriptionUpgrade(planId, true); return; }
    setSelectedPlanForPayment(p); setIsSubPaymentModalOpen(true);
  };

  const handleUploadDoc = async (type: 'id' | 'record', file: File) => {
    if (!user) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      const url = reader.result as string;
      const updates: any = { [type === 'id' ? 'idCardUrl' : 'policeRecordUrl']: url, [type === 'id' ? 'idStatus' : 'recordStatus']: 'pending' };
      await updateDoc(doc(db, "users", user.uid), updates);
      if (role === 'tech' && selectedTechProfileId) {
        await updateDoc(doc(db, "technicians", selectedTechProfileId), { [type === 'id' ? 'idCardUrl' : 'policeRecordUrl']: url, isVerified: false });
      }
      toast.success("Documento enviado a revisión.");
    };
    reader.readAsDataURL(file);
  };

  const getStatusLabel = (s: string) => {
    const map: any = { pending: 'SOLICITADO', quoted: 'COTIZADO', accepted: 'PAGADO', executing: 'EN PROCESO', completed: 'FINALIZADO', rated: 'CALIFICADO', rejected: 'DENEGADO', disputed: 'IMPREVISTO', cancelled: 'CANCELADO' };
    return map[s] || s.toUpperCase();
  };

  const getSelectedTechProfileObj = () => technicians.find(t => t.id === selectedTechProfileId) || { id: selectedTechProfileId || 'new', name: loggedInName, category: 'mecanico', rating: 5.0, reviewCount: 0, plan: 'basic', isOnline: false } as TechProfile;

  if (isAuthResolving) return <div className="h-screen w-full bg-[#0d0e12] flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#5d3cfe]"></div></div>;

  if (!isLoggedIn) return <><LandingPage onStart={() => setShowAuthForm(true)} onWatchDemo={() => setIsDemoModalOpen(true)} assets={assets} requests={requests} />{showAuthForm && <div className="fixed inset-0 z-[200] bg-[#0d0e12]/90 backdrop-blur-md flex flex-col items-center justify-center p-4"><div className="max-w-md w-full bg-[#121317] border border-[#2a2b2f] p-10 rounded-[2.5rem] shadow-2xl relative"><button onClick={() => setShowAuthForm(false)} className="absolute -top-4 -right-4 p-4 text-white bg-[#1c1d21] border border-white/10 rounded-2xl">X</button><div className="text-center space-y-6 mb-8"><MantechProLogo size="md" /><div className="flex bg-[#1c1d21] p-1.5 rounded-2xl"><button onClick={() => setAuthMode('login')} className={`flex-1 py-3 rounded-xl ${authMode === 'login' ? 'bg-[#5d3cfe] text-white' : 'text-[#474556]'}`}>Ingresar</button><button onClick={() => setAuthMode('register')} className={`flex-1 py-3 rounded-xl ${authMode === 'register' ? 'bg-[#5d3cfe] text-white' : 'text-[#474556]'}`}>Registrarse</button></div></div><form onSubmit={handleLogin} className="space-y-4">{authMode === 'register' && <><input type="text" value={loginName} onChange={e => setLoginName(e.target.value)} placeholder="Nombre Completo" className="w-full bg-[#0d0e12] border border-[#2a2b2f] rounded-xl p-4 text-white" /></>}<input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} placeholder="Email" className="w-full bg-[#0d0e12] border border-[#2a2b2f] rounded-xl p-4 text-white" /><input type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} placeholder="Password" className="w-full bg-[#0d0e12] border border-[#2a2b2f] rounded-xl p-4 text-white" />{authMode === 'register' && <select value={authRole} onChange={e => setAuthRole(e.target.value as any)} className="w-full bg-[#0d0e12] border border-[#2a2b2f] rounded-xl p-4 text-white"><option value="client">Cliente</option><option value="tech">Técnico</option></select>}<button type="submit" className="w-full py-5 bg-[#5d3cfe] text-white rounded-xl font-black uppercase">{authMode === 'login' ? 'Ingresar' : 'Crear Cuenta'}</button></form></div></div>}</>;

  return (
    <PayPalScriptProvider options={{ clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID || "sb", currency: "USD" }}>
      <div className="min-h-screen bg-[#0d0e12] flex flex-col font-sans text-[#e3e2e8] overflow-hidden">
        <Toaster position="top-center" />
        <nav className="h-20 bg-[#0d0e12]/80 backdrop-blur-md border-b border-[#2a2b2f] flex items-center justify-between px-10 shrink-0 z-[100]">
          <div className="flex items-center gap-10"><MantechProLogo size="sm" /></div>
          <div className="flex items-center gap-8"><button onClick={handleLogout} className="text-[#c8c4d9] hover:text-white font-black text-[10px] uppercase tracking-widest">Salir</button></div>
        </nav>
        <div className="flex flex-1 overflow-hidden relative">
          <aside className="w-72 bg-[#0d0e12] border-r border-[#2a2b2f] p-8 flex flex-col shrink-0 overflow-y-auto custom-scrollbar">
            <nav className="space-y-1.5 flex-1 text-[11px] font-black uppercase tracking-wider">
              {role === 'client' ? (
                <><button onClick={() => setClientTab('dashboard')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl ${clientTab === 'dashboard' ? 'bg-[#5d3cfe] text-white' : 'text-[#c8c4d9] hover:bg-[#121317]'}`}><LayoutDashboard className="w-4 h-4" /> Mi Portafolio</button><button onClick={() => setClientTab('marketplace')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl ${clientTab === 'marketplace' ? 'bg-[#5d3cfe] text-white' : 'text-[#c8c4d9] hover:bg-[#121317]'}`}><Store className="w-4 h-4" /> Marketplace</button><button onClick={() => setClientTab('subscriptions')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl ${clientTab === 'subscriptions' ? 'bg-[#5d3cfe] text-white' : 'text-[#c8c4d9] hover:bg-[#121317]'}`}><Star className="w-4 h-4" /> Membresía</button></>
              ) : role === 'tech' ? (
                <><button onClick={() => setTechTab('received')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl ${techTab === 'received' ? 'bg-[#5d3cfe] text-white' : 'text-[#c8c4d9] hover:bg-[#121317]'}`}><Inbox className="w-4 h-4" /> Bandeja</button><button onClick={() => setTechTab('subscriptions')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl ${techTab === 'subscriptions' ? 'bg-[#5d3cfe] text-white' : 'text-[#c8c4d9] hover:bg-[#121317]'}`}><Star className="w-4 h-4" /> Membresía</button></>
              ) : (
                <><button onClick={() => setAdminTab('finance')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl ${adminTab === 'finance' ? 'bg-[#e11d48] text-white' : 'text-[#c8c4d9] hover:bg-[#121317]'}`}><DollarSign className="w-4 h-4" /> Finanzas</button><button onClick={() => setAdminTab('users')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl ${adminTab === 'users' ? 'bg-[#e11d48] text-white' : 'text-[#c8c4d9] hover:bg-[#121317]'}`}><Users className="w-4 h-4" /> Usuarios</button></>
              )}
            </nav>
          </aside>
          <main className="flex-1 bg-[#0d0e12] p-10 overflow-y-auto custom-scrollbar relative">
            <div className="max-w-6xl mx-auto space-y-12">
              {role === 'client' && (
                <>{clientTab === 'dashboard' && <div className="space-y-10"><header><h1 className="text-4xl font-black text-white uppercase">Mi <span className="text-[#5d3cfe]">Portafolio</span></h1></header><div className="grid grid-cols-1 md:grid-cols-3 gap-8">{assets.map(a => <AssetIntelligentCard key={a.id} asset={a} requests={requests} onOpenDetails={() => {}} onOpenPreTrip={() => {}} />)}</div></div>}{clientTab === 'subscriptions' && <SubscriptionModule subscription={subscription} onUpgrade={handleOpenSubscriptionPayment} role="client" />}</>
              )}
              {role === 'tech' && (
                <>{techTab === 'received' && <div className="space-y-10"><header><h1 className="text-4xl font-black text-white uppercase tracking-tighter">Bandeja de <span className="text-[#5d3cfe]">Servicios</span></h1></header><div className="grid grid-cols-1 gap-6">{requests.map(req => (<div key={req.id} className="bg-[#121317] border border-[#2a2b2f] p-8 rounded-[2.5rem] flex justify-between items-center"><h4 className="font-black text-white uppercase">{req.assetName}</h4><span className="px-4 py-1.5 bg-[#1c1d21] rounded-full text-[10px] font-black">{getStatusLabel(req.status)}</span></div>))}</div></div>}{techTab === 'subscriptions' && <SubscriptionModule subscription={subscription.planId === 'plan-free' ? { ...subscription, planId: 'plan-basic' } : subscription} onUpgrade={handleOpenSubscriptionPayment} role="tech" />}</>
              )}
              {role === 'admin' && (
                <>{adminTab === 'finance' && <div className="space-y-12"><header><h1 className="text-4xl font-black text-white uppercase">Panel <span className="text-[#e11d48]">Master</span></h1></header><div className="bg-[#121317] p-10 rounded-[3rem] border border-[#2a2b2f] shadow-2xl"><h2 className="text-2xl font-black text-white uppercase mb-8">Suscripciones <span className="text-amber-500">Pendientes</span></h2><div className="grid gap-4">{allUsers.filter(u => u.subscription?.status === 'pending_payment_verification').map(u => (<div key={u.uid} className="p-6 bg-[#1c1d21] rounded-3xl flex justify-between items-center"><div><p className="font-black text-white">{u.name}</p><p className="text-xs text-[#c8c4d9]">Plan: {u.subscription?.requestedPlanId}</p></div><button onClick={() => handleApproveSubscription(u.uid, u.subscription.requestedPlanId)} className="px-6 py-2 bg-amber-500 text-black rounded-xl font-black">Aprobar</button></div>))}</div></div></div>}{adminTab === 'users' && <div className="bg-[#121317] p-10 rounded-[3rem] border border-[#2a2b2f]"><h1 className="text-4xl font-black text-white uppercase mb-10">Usuarios</h1><table className="w-full text-left"><thead><tr className="text-[#474556] uppercase"><th>Nombre</th><th>Rol</th><th>Estatus</th></tr></thead><tbody>{technicians.map(t => (<tr key={t.id} className="border-t border-white/5"><td className="py-4">{t.name}</td><td>{t.category}</td><td>{t.isVerified ? 'VERIFICADO' : 'PENDIENTE'}</td></tr>))}</tbody></table></div>}{adminTab === 'settings' && (<div className="space-y-12"><LandingCMS /><div className="bg-[#121317] border border-[#2a2b2f] p-10 rounded-[3rem] shadow-2xl"><header><h1 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">Ajustes <span className="text-[#5d3cfe]">Sistema</span></h1></header><div className="mt-10"><p className="text-[10px] text-[#474556] font-bold uppercase">Configuración de marca y parámetros globales.</p></div></div></div>)}</>
              )}
            </div>
          </main>
        </div>

        {isSubPaymentModalOpen && selectedPlanForPayment && (
          <div className="fixed inset-0 z-[700] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <div className="w-full max-w-lg bg-[#121317] border border-[#2a2b2f] rounded-[3rem] p-10 space-y-8 shadow-2xl animate-fade-in-up">
              <h3 className="text-2xl font-black text-white uppercase italic text-center">Mejorar a <span className="text-[#5d3cfe]">{selectedPlanForPayment.name}</span></h3>
              <p className="text-[10px] text-center uppercase tracking-widest text-[#c8c4d9]">Monto: ${selectedPlanForPayment.price}.00 USD</p>
              <div className="space-y-4">
                <PayPalButtons style={{ layout: "vertical", shape: "pill" }} createOrder={async()=>'fake-id'} onApprove={async()=>handleConfirmSubscriptionUpgrade(selectedPlanForPayment.id, true)} />
                <button onClick={() => handleConfirmSubscriptionUpgrade(selectedPlanForPayment.id, true)} className="w-full py-4 bg-rose-600/10 border border-rose-600/20 text-rose-500 rounded-xl font-black uppercase text-[9px]">⚠️ Simular Pago Exitoso (Bypass Dev)</button>
                <button onClick={() => handleConfirmSubscriptionUpgrade(selectedPlanForPayment.id, false)} className="w-full py-4 border border-[#2a2b2f] text-[#c8c4d9] rounded-xl font-black uppercase text-[9px]">Transferencia Manual / ACH</button>
              </div>
              <button onClick={() => setIsSubPaymentModalOpen(false)} className="w-full text-[#474556] uppercase font-black text-[10px]">Cancelar</button>
            </div>
          </div>
        )}
      </div>
    </PayPalScriptProvider>
  );
}

function formatFriendlyDate(d: any) { if (!d) return '---'; return new Date(d).toLocaleDateString(); }
function formatTime12h(d: any) { return d || '---'; }
