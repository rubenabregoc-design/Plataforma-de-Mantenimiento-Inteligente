import { Toaster, toast } from 'react-hot-toast';
import React, { useState, useEffect, useRef } from 'react';
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
  MaterialItem
} from './types';

// Componentes MASTER V4
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
import VideoCallModal from './components/VideoCallModal';
import LandingPage from './components/LandingPage';
import Logo from './components/Logo';
import TechWalletModule from './components/TechWalletModule';

import { 
  LayoutDashboard, Store, FileCheck2, BrainCircuit, MessageSquare, CalendarDays, Users, DollarSign,
  Bell, BellRing, Send, CheckCircle, Plus, TrendingUp, Truck, Camera,
  Layers, ShieldCheck, Star, CheckCircle2,
  UserX, Clock, LogOut, User, ChevronRight, ChevronLeft,
  ShieldAlert, HelpCircle, Wrench, Search, Check, X, MapPin, BadgeCheck, Video, Monitor, Download,
  Calendar, AlertTriangle, Pencil, Trash2, FileText, Settings, Eye, EyeOff, Sparkles, Inbox, Car, Wind, Package, Globe, PieChart, Building2, Activity, CreditCard, ExternalLink, QrCode
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
  orderBy
} from "firebase/firestore";
import { auth, db } from "./firebase";

export default function App() {
  // Session state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAuthResolving, setIsAuthResolving] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [role, setRole] = useState<'client' | 'tech' | 'admin'>('client');
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
  const [subscription, setSubscription] = useState<UserSubscription>({
    planId: 'plan-basic',
    status: 'active',
    startDate: new Date().toISOString(),
    nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  });

  // UI State
  const [adminTab, setAdminTab] = useState<'finance' | 'users' | 'logistics' | 'alerts' | 'inventory' | 'settings'>('finance');
  const [clientTab, setClientTab] = useState<'dashboard' | 'fleet' | 'ai' | 'marketplace' | 'quotes' | 'inventory' | 'audit' | 'subscriptions' | 'chat' | 'settings'>('dashboard');
  const [techTab, setTechTab] = useState<'received' | 'agenda' | 'wallet' | 'mantech_id' | 'chat' | 'profile' | 'settings'>('received');

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
  const [showAuthForm, setShowAuthForm] = useState(false);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

  // Asset View State
  const [assetSearchQuery, setAssetSearchQuery] = useState('');
  const [assetCurrentPage, setAssetCurrentPage] = useState(1);
  const assetPageSize = 6;

  // PLAN CONFIGURATION
  const getPlanLimits = (planId: string) => {
    switch(planId) {
      case 'plan-pro': return { maxAssets: 15, commission: 0.10, fleet: 'lite', diag: 'assisted' };
      case 'plan-enterprise': return { maxAssets: 9999, commission: 0.08, fleet: 'full', diag: 'auto' };
      default: return { maxAssets: 3, commission: 0.15, fleet: 'none', diag: 'manual' };
    }
  };

  const planLimits = getPlanLimits(subscription.planId);

  // Video Call & Scanner V4
  const [isVideoCallOpen, setIsVideoCallOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [videoCallRoom, setVideoCallRoom] = useState('');
  const [isVideoVoiceOnly, setIsVideoVoiceOnly] = useState(false);
  const [isCredentialModalOpen, setIsCredentialModalOpen] = useState(false);

  // Imprevistos
  const [isUnforeseenModalOpen, setIsUnforeseenModalOpen] = useState(false);
  const [activeRequestForUnforeseen, setActiveRequestForUnforeseen] = useState<any>(null);
  const [unforeseenInputs, setUnforeseenInputs] = useState({ reason: '', amount: '', category: 'spare_part' });

  // GPS TRACKING STATE (CELLPHONE)
  const [trackingAssetId, setTrackingAssetId] = useState<string | null>(null);
  const watchIdRef = useRef<string | null>(null);
  const lastPosRef = useRef<any>(null);
  const wakeLockRef = useRef<any>(null);

  const startGpsTracking = async (assetId: string) => {
    if (trackingAssetId === assetId) {
      if (watchIdRef.current) Geolocation.clearWatch({ id: watchIdRef.current });
      if (wakeLockRef.current) wakeLockRef.current.release();
      if (Capacitor.isNativePlatform()) {
        LocalNotifications.cancel({ notifications: [{ id: 1001 }] });
      }
      setTrackingAssetId(null);
      lastPosRef.current = null;
      toast.success("Rastreo detenido. Km guardados.");
      return;
    }

    try {
      const isNative = Capacitor.isNativePlatform();
      if (isNative) {
        const permission = await Geolocation.requestPermissions();
        if (permission.location !== 'granted') return toast.error("Se requieren permisos de GPS.");
      }

      // Activar Notificación Persistente (Solo móvil)
      if (Capacitor.isNativePlatform()) {
        const hasPermission = await LocalNotifications.requestPermissions();
        if (hasPermission.display === 'granted') {
          LocalNotifications.schedule({
            notifications: [
              {
                title: "MantechPro: Rastreo Activo",
                body: "El sistema está calculando el kilometraje en segundo plano.",
                id: 1001,
                ongoing: true, // Esto la hace persistente en Android
                smallIcon: "ic_stat_name", // Referencia al icono de sistema
                actionTypeId: "OPEN_APP"
              }
            ]
          });
        }
      }

      if ('wakeLock' in navigator) {
        try {
          wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
        } catch (err) { console.error("WakeLock no soportado."); }
      }

      setTrackingAssetId(assetId);
      toast.success("Rastreo en Segundo Plano Activo. Puedes minimizar la app.");

      watchIdRef.current = await Geolocation.watchPosition({
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 3000
      }, (position) => {
        if (!position) return;
        if (lastPosRef.current) {
          const dist = calculateDistance(
            lastPosRef.current.coords.latitude,
            lastPosRef.current.coords.longitude,
            position.coords.latitude,
            position.coords.longitude
          );
          if (dist > 0.03) { // 30 metros de precisión
             const asset = assets.find(a => a.id === assetId);
             if (asset) {
                const newKm = (asset.mileage || 0) + dist;
                updateDoc(doc(db, "assets", assetId), { mileage: Math.round(newKm) });
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
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
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

  // Notification Helper
  const notifyAdmin = async (title: string, body: string) => {
    try {
      await axios.post('http://localhost:3000/api/push-notification', {
        title,
        body,
        token: 'ADMIN_TOKEN_MASTER' // En producción esto vendría del Firestore del Admin
      });
    } catch (err) { console.error("Notification failed", err); }
  };

  // Bidding
  const [bidPrice, setBidPrice] = useState<string>('');
  const [bidDate, setBidDate] = useState<string>('');
  const [bidTime, setBidTime] = useState<string>('');
  const [bidDuration, setBidDuration] = useState<number>(1);
  const [bidTravelTime, setBidTravelTime] = useState<number>(30);
  const [bidServiceType, setBidServiceType] = useState<'onsite' | 'remote'>('onsite');
  const [bidRemotePlatform, setBidRemotePlatform] = useState<'anydesk' | 'zoom' | 'meet' | 'teams' | 'whatsapp' | 'other'>('anydesk');
  const [bidRemoteLink, setBidRemoteLink] = useState<string>('');
  const [draftingBidRequestId, setDraftingBidRequestId] = useState<string | null>(null);

  // Drafts for Bidding (Materials & Checklist)
  const [bidMaterials, setBidMaterials] = useState<MaterialItem[]>([]);
  const [newBidMaterial, setNewBidMaterial] = useState({ name: '', price: '', quantity: '1' });
  const [bidChecklist, setBidChecklist] = useState<{id: string, description: string, isCompleted: boolean}[]>([
    { id: '1', description: 'Inspección técnica inicial', isCompleted: false },
    { id: '2', description: 'Desarmado y limpieza', isCompleted: false },
    { id: '3', description: 'Pruebas de funcionamiento', isCompleted: false }
  ]);

  // Rating
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
          if (firebaseUser.email === 'admin@mantech.com') {
            setRole('admin');
          }

          const userRef = doc(db, "users", firebaseUser.uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            const data = userSnap.data();
            setUserData(data);

            if (firebaseUser.email === 'admin@mantech.com' && data.role !== 'admin') {
              await updateDoc(userRef, { role: 'admin' });
              setRole('admin');
            } else if (firebaseUser.email !== 'admin@mantech.com') {
              setRole(data.role || 'client');
            }

            setLoggedInName(data.name || firebaseUser.displayName || 'Usuario');
            setProfileImage(data.profileImage || '');
            if (data.role === 'tech') {
              const tId = data.techId || `tech-${firebaseUser.uid}`;
              setSelectedTechProfileId(tId);
              localStorage.setItem('mantech_logged_tech_id', tId);
            }
            if (data.subscription) setSubscription(data.subscription);
          } else if (firebaseUser.email === 'admin@mantech.com') {
            await setDoc(userRef, { uid: firebaseUser.uid, email: firebaseUser.email, name: 'Administrador Central', role: 'admin', createdAt: serverTimestamp() });
            setRole('admin');
            setLoggedInName('Administrador Central');
          }
          setIsLoggedIn(true);
        } catch (err) {
          console.error("Auth setup error:", err);
        }
      } else {
        setIsLoggedIn(false);
        setUser(null);
        setUserData(null);
      }
      setIsAuthResolving(false);
    });
    return () => unsubscribe();
  }, []);

  // Listeners
  useEffect(() => {
    if (!isLoggedIn || !user) return;
    onSnapshot(collection(db, "technicians"), (snap) => setTechnicians(snap.docs.map(d => ({ id: d.id, ...d.data() })) as TechProfile[]));
    let qReq = role === 'admin' ? query(collection(db, "requests"), orderBy("createdAt", "desc")) : query(collection(db, "requests"), where(role === 'client' ? 'clientId' : 'techUserId', "==", user.uid));
    onSnapshot(qReq, (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() })) as JobRequest[];
      setRequests(list);
      if (list.length > 0 && !activeChatRequestId) setActiveChatRequestId(list[0].id);
    });
    const qAssets = role === 'admin' ? query(collection(db, "assets")) : query(collection(db, "assets"), where("clientId", "==", user.uid));
    onSnapshot(qAssets, (snap) => setAssets(snap.docs.map(d => ({ id: d.id, ...d.data() })) as Asset[]));
    const qRem = role === 'admin' ? query(collection(db, "reminders"), orderBy("dueDate", "asc")) : query(collection(db, "reminders"), where("clientId", "==", user.uid));
    onSnapshot(qRem, (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() })) as MaintenanceReminder[];
      if (role === 'admin') setAllReminders(list); else setReminders(list);
    });
    if (role === 'tech') onSnapshot(query(collection(db, "agenda"), where("techUserId", "==", user.uid)), (snap) => setAgenda(snap.docs.map(d => ({ id: d.id, ...d.data() })) as AgendaEvent[]));
    onSnapshot(collection(db, "inventory"), (snap) => setInventory(snap.docs.map(d => ({ id: d.id, ...d.data() })) as InventoryItem[]));

    if (role === 'admin') {
      onSnapshot(collection(db, "users"), (snap) => {
        setAllUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      });
    }
  }, [isLoggedIn, user, role]);

  useEffect(() => {
    if (!isLoggedIn || !activeChatRequestId) return;
    const q = query(collection(db, "messages"), where("requestId", "==", activeChatRequestId));
    return onSnapshot(q, (snap) => {
      const msgs = snap.docs.map(d => ({ id: d.id, ...d.data(), timestamp: d.data().timestamp?.toDate ? d.data().timestamp.toDate().toISOString() : new Date().toISOString() })) as ChatMessage[];
      setChatMessages(msgs.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()));
    });
  }, [isLoggedIn, activeChatRequestId]);

  // Guardia de Suscripción: Verifica expiración cada vez que carga la app
  useEffect(() => {
    if (!isLoggedIn || !userData || role !== 'client') return;

    const checkExpiration = async () => {
      const now = new Date();
      const expiry = new Date(subscription.nextBillingDate);

      if (now > expiry && subscription.planId !== 'plan-basic' && subscription.status === 'active') {
        console.log("⚠️ Suscripción expirada. Retornando a Plan Básico.");
        const expiredSub = {
          ...subscription,
          status: 'expired',
          planId: 'plan-basic' // Opcional: degradar automáticamente
        };
        await updateDoc(doc(db, "users", user.uid), { subscription: expiredSub });
        setSubscription(expiredSub as UserSubscription);
        toast.error("Tu plan MantechPro ha expirado. Has sido retornado al Plan Básico. Renueva tu membresía.", { duration: 6000 });
      }
    };

    checkExpiration();
  }, [userData, isLoggedIn]);

  // Handlers
  const handleLogin = async (e: any) => {
    if (e) e.preventDefault();
    setAuthError('');
    try {
      if (authMode === 'register') {
        const res = await createUserWithEmailAndPassword(auth, loginEmail, loginPassword);
        const u = res.user;
        const tId = authRole === 'tech' ? `tech-${Date.now()}` : null;
        await setDoc(doc(db, "users", u.uid), { uid: u.uid, email: loginEmail, name: loginName, role: authRole, techId: tId, createdAt: serverTimestamp() });
        if (authRole === 'tech' && tId) await setDoc(doc(db, "technicians", tId), { id: tId, name: loginName, category: 'mecanico', rating: 5.0, reviewCount: 0, completedJobs: 0, experienceYears: 5, location: 'Panamá', hourlyRate: 25, bio: 'Técnico certificado.', plan: 'basic', userId: u.uid });
      } else {
        try {
          await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
        } catch (loginErr: any) {
          if (loginEmail === 'admin@mantech.com' && loginPassword === 'mantech123' && loginErr.code === 'auth/invalid-credential') {
             const res = await createUserWithEmailAndPassword(auth, loginEmail, loginPassword);
             await setDoc(doc(db, "users", res.user.uid), { uid: res.user.uid, email: loginEmail, name: 'Administrador Central', role: 'admin', createdAt: serverTimestamp() });
          } else throw loginErr;
        }
      }
    } catch (err: any) { setAuthError(err.message); }
  };

  const handleLogout = () => signOut(auth);

  const handleRequestQuote = async (techId: string, assetId: string, description: string, suggestedDate?: string, suggestedTime?: string) => {
    if (!user) return;
    const tech = technicians.find(t => t.id === techId);
    const asset = assets.find(a => a.id === assetId);
    if (!tech || !asset) return;
    try {
      await addDoc(collection(db, "requests"), {
        clientId: user.uid, clientName: loggedInName, assetId, assetName: asset.name,
        techId, techName: tech.name, techUserId: tech.userId || null,
        description, status: 'pending', createdAt: serverTimestamp(),
        scheduledDate: suggestedDate || '', scheduledTime: suggestedTime || '',
        checklist: [{ id: '1', description: 'Inspección inicial', isCompleted: false }], materials: []
      });
      toast.success("¡Solicitud enviada al técnico exitosamente!");
      setClientTab('quotes');
    } catch (err) { console.error(err); }
  };

  const handleSubmitBid = async (requestId: string) => {
    if (!requestId || !bidPrice || !bidDate || !bidTime) return toast.error("Complete el precio, la fecha y la hora antes de continuar.");
    try {
      const techPlan = getSelectedTechProfileObj().plan || 'basic';
      const commissionRate = techPlan === 'enterprise' ? 0.08 : (techPlan === 'pro' ? 0.10 : 0.15);

      const totalPrice = Number(bidPrice);
      const platformFee = totalPrice * commissionRate;
      const techEarnings = totalPrice - platformFee;

      await updateDoc(doc(db, "requests", requestId), {
        price: totalPrice,
        commission: platformFee,
        technicianEarnings: techEarnings,
        scheduledDate: bidDate,
        scheduledTime: bidTime,
        scheduledDuration: bidDuration,
        scheduledTravelTime: bidTravelTime,
        materials: bidMaterials,
        checklist: bidChecklist,
        serviceType: bidServiceType,
        remotePlatform: bidServiceType === 'remote' ? bidRemotePlatform : null,
        remoteLink: bidServiceType === 'remote' ? bidRemoteLink : null,
        status: 'quoted',
        techUserId: user.uid
      });
      toast.success(`Cotización enviada. Ganancia neta: $${techEarnings.toFixed(2)} (Comisión ${commissionRate*100}%)`);
      setDraftingBidRequestId(null);
      setBidMaterials([]);
    } catch (err) { console.error(err); }
  };

  const handleAcceptQuote = async (requestId: string, method: string) => {
    if (!requestId) return;
    const req = requests.find(r => r.id === requestId);
    if (!req?.scheduledDate) return;
    try {
      if (method === 'yappy') {
        await updateDoc(doc(db, "requests", requestId), { status: 'pending_verification', paidAt: serverTimestamp(), paymentMethod: method });
        await addDoc(collection(db, "messages"), { requestId, sender: 'client', text: `He realizado el pago vía YAPPY por $${req.price}. Quedo a la espera de la verificación oficial.`, timestamp: serverTimestamp() });

        // Notificar al Admin
        notifyAdmin("💳 PAGO PENDIENTE", `El cliente ${req.clientName} envió un pago de $${req.price} vía YAPPY.`);

        toast.success("Pago enviado. El Administrador lo verificará en breve.");
      } else {
        await updateDoc(doc(db, "requests", requestId), { status: 'accepted', paidAt: serverTimestamp(), paymentMethod: method });
        await addDoc(collection(db, "agenda"), {
          requestId, techId: req.techId, techUserId: req.techUserId,
          clientName: req.clientName, clientId: user.uid,
          title: `CONFIRMADO: ${req.assetName}`, date: req.scheduledDate, time: req.scheduledTime,
          duration: `${req.scheduledDuration}h`, travelTime: `${req.scheduledTravelTime} min`,
          status: 'pending', createdAt: serverTimestamp()
        });
        await addDoc(collection(db, "messages"), { requestId, sender: 'tech', text: `¡Hola! He recibido tu confirmación y pago vía ${method.toUpperCase()}. Cita confirmada oficialmente.`, timestamp: serverTimestamp() });
        toast.success("¡Cita confirmada y agendada exitosamente!");
      }
      setClientTab('chat');
    } catch (err) { console.error(err); }
  };

  const handleConfirmPayment = async (requestId: string) => {
    if (!requestId) return;
    const req = requests.find(r => r.id === requestId);
    if (!req) return;
    try {
      await updateDoc(doc(db, "requests", requestId), { status: 'accepted', paymentVerifiedAt: serverTimestamp() });
      await addDoc(collection(db, "agenda"), {
        requestId, techId: req.techId, techUserId: req.techUserId,
        clientName: req.clientName, clientId: req.clientId,
        title: `CONFIRMADO: ${req.assetName}`, date: req.scheduledDate, time: req.scheduledTime,
        duration: `${req.scheduledDuration}h`, travelTime: `${req.scheduledTravelTime} min`,
        status: 'pending', createdAt: serverTimestamp()
      });
      await addDoc(collection(db, "messages"), { requestId, sender: 'tech', text: `¡Hola! El Administrador ha confirmado tu pago vía ${req.paymentMethod?.toUpperCase()}. Cita confirmada oficialmente.`, timestamp: serverTimestamp() });
      toast.success("Pago verificado. La cita ha sido agendada.");
    } catch (err) { console.error(err); }
  };

  const handleTriggerUnforeseen = async (requestId: string, reason: string, extraCost: number, category: string) => {
    if (!requestId) return;
    try {
      await updateDoc(doc(db, "requests", requestId), { status: 'disputed', unforeseenReason: reason, unforeseenAmount: extraCost, unforeseenCategory: category, unforeseenAt: serverTimestamp() });
      await addDoc(collection(db, "messages"), { requestId, sender: 'tech', text: `⚠️ REPORTE DE IMPREVISTO [${category.toUpperCase()}]: ${reason}. Costo: $${extraCost}. Favor aprobar en panel para no comprometer la garantía.`, timestamp: serverTimestamp() });

      // Notificar al Admin
      const req = requests.find(r => r.id === requestId);
      notifyAdmin("⚠️ IMPREVISTO DETECTADO", `${req?.techName} reportó un extra de $${extraCost} para ${req?.assetName}.`);

      setIsUnforeseenModalOpen(false);
      toast.success("Imprevisto reportado al sistema correctamente.");
    } catch (err) { console.error(err); }
  };

  const handleApproveUnforeseen = async (requestId: string) => {
    if (!requestId) return;
    const req = requests.find(r => r.id === requestId);
    if (!req || !req.unforeseenAmount) return;
    try {
      const newPrice = (req.price || 0) + req.unforeseenAmount;
      await updateDoc(doc(db, "requests", requestId), { status: 'executing', price: newPrice, commission: newPrice * 0.15, technicianEarnings: newPrice * 0.85, unforeseenAmount: 0, unforeseenPaidAt: serverTimestamp() });
      await addDoc(collection(db, "messages"), { requestId, sender: 'client', text: `✅ IMPREVISTO PAGADO: $${req.unforeseenAmount}. Puede continuar.`, timestamp: serverTimestamp() });
      toast.success("Costo adicional aprobado. El técnico puede continuar.");
    } catch (err) { console.error(err); }
  };

  const handleRejectUnforeseen = async (requestId: string) => {
    if (!requestId) return;
    if (!window.confirm("⚠️ ATENCIÓN: Al continuar sin pagar el imprevisto, la GARANTÍA TOTAL del servicio quedará ANULADA. ¿Deseas proceder bajo tu responsabilidad?")) return;
    try {
      await updateDoc(doc(db, "requests", requestId), { status: 'executing', guaranteeStatus: 'voided', unforeseenAmount: 0 });
      await addDoc(collection(db, "messages"), { requestId, sender: 'client', text: "❌ IMPREVISTO RECHAZADO: El cliente decide continuar sin realizar la reparación sugerida. LA GARANTÍA QUEDA ANULADA.", timestamp: serverTimestamp() });
    } catch (e) { console.error(e); }
  };

  const handleContinueTomorrow = async (requestId: string) => {
    if (!requestId) return;
    const req = requests.find(r => r.id === requestId);
    if (!req) return;

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextDate = tomorrow.toISOString().split('T')[0];

    try {
      const reason = "Continuación de servicio - Día 2";
      const history = [...(req.rescheduleHistory || []), {
        oldDate: req.scheduledDate || '',
        oldTime: req.scheduledTime || '',
        newDate: nextDate,
        newTime: req.scheduledTime || '08:00',
        reason,
        timestamp: new Date().toISOString()
      }];

      await updateDoc(doc(db, "requests", requestId), {
        status: 'accepted', // Vuelve a aceptado para iniciar mañana
        scheduledDate: nextDate,
        rescheduleCount: (req.rescheduleCount || 0) + 1,
        rescheduleHistory: history
      });

      // Actualizar agenda
      const q = query(collection(db, "agenda"), where("requestId", "==", requestId));
      const snap = await getDocs(q);
      snap.forEach(d => updateDoc(doc(db, "agenda", d.id), { date: nextDate, title: 'CONTINUACIÓN MAÑANA' }));

      await addDoc(collection(db, "messages"), {
        requestId,
        sender: 'tech',
        text: `📢 PAUSA LOGÍSTICA: El servicio no pudo concluir hoy. Se ha reprogramado automáticamente para mañana ${nextDate} a la misma hora para finalizar la labor.`,
        timestamp: serverTimestamp()
      });

      toast.success("Servicio pausado. Reprogramado automáticamente para mañana.");
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

      const newStatus = req.status === 'executing' ? 'completed' : 'rated';

      await updateDoc(doc(db, "requests", requestId), {
        status: newStatus,
        visitFinishedAt: new Date().toISOString(),
        clientSignature: signature,
        rating: ratingVal,
        comment: ratingComment
      });

      setIsSignatureModalOpen(false);
      setActiveRequestForSignature(null);
      toast.success(newStatus === 'completed' ? "¡Servicio Finalizado y Liquidado!" : "¡Gracias por tu calificación!");

      if (newStatus === 'completed') {
         const tech = technicians.find(t => t.id === req.techId);
         if (tech) {
            const finalR = Math.max(1, ratingVal - ((req.rescheduleCount || 0) * 0.2));
            const nRating = ((tech.rating * tech.reviewCount) + finalR) / (tech.reviewCount + 1);

            // ACTUALIZACIÓN DE BILLETERA: Liquidación automática de fondos
            const earnings = Number(req.technicianEarnings || 0);
            const currentBalance = Number(tech.wallet?.balance || 0);
            const newBalance = currentBalance + earnings;

            // Historial de transacciones
            const newTransaction = {
               id: `TX-${Date.now().toString().substring(7)}`,
               amount: earnings,
               type: 'credit',
               description: `Servicio ${req.serviceType === 'remote' ? 'Remoto' : 'Presencial'}: ${req.assetName}`,
               timestamp: new Date().toISOString(),
               status: 'completed'
            };

            const updatedTransactions = [newTransaction, ...(tech.wallet?.transactions || [])];

            await updateDoc(doc(db, "technicians", tech.id), {
               completedJobs: (tech.completedJobs || 0) + 1,
               reviewCount: tech.reviewCount + 1,
               rating: Number(nRating.toFixed(1)),
               'wallet.balance': newBalance,
               'wallet.transactions': updatedTransactions
            });
         }
      }
      setIsSignatureModalOpen(false);
      toast.success("¡Servicio completado y calificado exitosamente!");
    } catch (err) { console.error(err); }
  };

  const handleReschedule = async (requestId: string, date: string, time: string, reason: string) => {
    if (!requestId) return;
    const req = requests.find(r => r.id === requestId);
    if (!req) return;
    try {
      const history = [...(req.rescheduleHistory || []), { oldDate: req.scheduledDate, oldTime: req.scheduledTime, newDate: date, newTime: time, reason, timestamp: new Date().toISOString() }];
      await updateDoc(doc(db, "requests", requestId), { scheduledDate: date, scheduledTime: time, rescheduleCount: (req.rescheduleCount || 0) + 1, rescheduleHistory: history });
      const q = query(collection(db, "agenda"), where("requestId", "==", requestId));
      const snap = await getDocs(q);
      snap.forEach(d => updateDoc(doc(db, "agenda", d.id), { date, time, title: 'REPROGRAMADO' }));
      await addDoc(collection(db, "messages"), { requestId, sender: 'tech', text: `📢 REPROGRAMADA: ${date} @ ${time}. Motivo: ${reason}`, timestamp: serverTimestamp() });
      toast.success("Cita reprogramada exitosamente.");
    } catch (err) { console.error(err); }
  };

  const handleReportTechnicianFailure = async (requestId: string) => {
    if (!requestId) return;
    if (!window.confirm("⚠️ ¿El técnico no concluyó? Solo recibirá el 5% de la inspección inicial. ¿Deseas reportar?")) return;
    await updateDoc(doc(db, "requests", requestId), { status: 'cancelled', cancellationReason: 'Incumplimiento del técnico / Penalidad 5%', penaltyApplied: true });
    toast.success("Caso reportado a Auditoría. El equipo tomará acción.");
  };

  const handleCancelRequest = async (requestId: string) => {
     if (!requestId) return;
     const req = requests.find(r => r.id === requestId);
     if(!req) return;
     if (req.status === 'executing') {
        if (!window.confirm("⚠️ EN EJECUCIÓN: Se liquidará el 50% por avance de obra. ¿Deseas proceder?")) return;
     } else {
        if (!window.confirm("¿Deseas cancelar?")) return;
     }
     await updateDoc(doc(db, "requests", requestId), { status: 'cancelled', cancelledAt: serverTimestamp() });
     toast.success("Solicitud cancelada.");
  };

  const handleRequestWithdrawal = async (techId: string, amount: number) => {
    if (amount <= 0) return toast.error("El monto ingresado no es válido.");
    try {
      const tech = technicians.find(t => t.id === techId);
      if (!tech || (tech.wallet?.balance || 0) < amount) return toast.error("Saldo insuficiente para procesar este retiro.");

      // 1. Crear transacción de débito (Pendiente)
      const newTransaction = {
        id: `WD-${Date.now().toString().substring(7)}`,
        amount: amount,
        type: 'debit',
        description: `Solicitud de Retiro ACH/Yappy`,
        timestamp: new Date().toISOString(),
        status: 'pending'
      };

      const updatedTransactions = [newTransaction, ...(tech.wallet?.transactions || [])];

      // 2. Restar del balance y mover a auditoría
      await updateDoc(doc(db, "technicians", techId), {
        'wallet.balance': (tech.wallet?.balance || 0) - amount,
        'wallet.transactions': updatedTransactions
      });

      // 3. Notificar al Admin para que haga la transferencia real
      notifyAdmin("🏦 SOLICITUD DE RETIRO", `El técnico ${tech.name} solicita un retiro de B/. ${amount.toFixed(2)}. Verificar datos bancarios.`);

      toast.success("Solicitud de retiro enviada a Tesorería. El depósito se reflejará en un máximo de 24h.");
    } catch (err) { console.error(err); }
  };

  const handleSaveMaterial = async (requestId: string, name: string, price: number, quantity: number, category: string) => {
    if (!requestId) return;
    const req = requests.find(r => r.id === requestId);
    if (!req) return;
    const newMaterials = [...(req.materials || []), { name, price, quantity, category, addedAt: new Date().toISOString() }];
    await updateDoc(doc(db, "requests", requestId), { materials: newMaterials });
    toast.success("Material registrado en el servicio.");
  };

  const [isSubPaymentModalOpen, setIsSubPaymentModalOpen] = useState(false);
  const [selectedPlanForPayment, setSelectedPlanForPlanPayment] = useState<any>(null);

  const handleOpenSubscriptionPayment = (planId: string) => {
    const plan = [
      { id: 'plan-basic', name: 'Básico', price: 0 },
      { id: 'plan-pro', name: 'Profesional', price: 15 },
      { id: 'plan-enterprise', name: 'Corporativo', price: 45 }
    ].find(p => p.id === planId);

    if (planId === 'plan-basic') {
      handleConfirmSubscriptionUpgrade('plan-basic');
      return;
    }

    setSelectedPlanForPlanPayment(plan);
    setIsSubPaymentModalOpen(true);
  };

  const handleConfirmSubscriptionUpgrade = async (planId: string, isInstant: boolean = false) => {
    try {
      const nextBilling = new Date();
      nextBilling.setDate(nextBilling.getDate() + 30);

      if (planId === 'plan-basic' || isInstant) {
        // ACTIVACIÓN INSTANTÁNEA (Básico o PayPal)
        const newSub = {
          planId,
          status: 'active',
          startDate: new Date().toISOString(),
          nextBillingDate: nextBilling.toISOString()
        };
        await updateDoc(doc(db, "users", user.uid), { subscription: newSub });
        setSubscription(newSub as UserSubscription);
        setIsSubPaymentModalOpen(false);
        if (isInstant) toast.success(`¡Felicidades! Tu cuenta ha sido mejorada al plan ${planId.split('-')[1].toUpperCase()}.`, { duration: 5000 });
        return;
      }

      // FLUJO MANUAL (Yappy): Queda en espera de verificación Admin
      await updateDoc(doc(db, "users", user.uid), {
        'subscription.requestedPlanId': planId,
        'subscription.status': 'pending_payment_verification',
        'subscription.paymentAt': new Date().toISOString()
      });

      notifyAdmin("💎 NUEVA SUSCRIPCIÓN (YAPPY)", `El usuario ${loggedInName} solicita subir al plan ${planId.split('-')[1].toUpperCase()}. Verificar transferencia manual.`);

      setIsSubPaymentModalOpen(false);
      toast("Solicitud recibida. El Administrador activará tu plan tras confirmar la transferencia por Yappy.", { icon: "📡", duration: 6000 });
    } catch (err) { console.error(err); }
  };

  const handleApproveSubscription = async (userId: string, planId: string) => {
    try {
      const nextBilling = new Date();
      nextBilling.setDate(nextBilling.getDate() + 30);

      const newSub = {
        planId,
        status: 'active',
        startDate: new Date().toISOString(),
        nextBillingDate: nextBilling.toISOString()
      };

      await updateDoc(doc(db, "users", userId), {
        subscription: newSub
      });

      // Si es técnico, actualizar también su perfil de técnico
      const userSnap = await getDoc(doc(db, "users", userId));
      if (userSnap.exists() && userSnap.data().role === 'tech') {
        const techId = userSnap.data().techId || `tech-${userId}`;
        await updateDoc(doc(db, "technicians", techId), {
          plan: planId.split('-')[1] // 'pro' o 'enterprise'
        });
      }

      toast.success("Suscripción aprobada y activada correctamente.");
    } catch (err) { console.error(err); }
  };

  const handleDeleteMaterial = async (requestId: string, index: number) => {
    if (!requestId) return;
    const req = requests.find(r => r.id === requestId);
    if (!req || !req.materials) return;
    const newM = req.materials.filter((_, i) => i !== index);
    await updateDoc(doc(db, "requests", requestId), { materials: newM });
  };

  const handleToggleTask = async (requestId: string, taskId: string) => {
    const req = requests.find(r => r.id === requestId);
    if (!req || !req.checklist) return;
    const newChecklist = req.checklist.map(t => t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t);
    try {
      await updateDoc(doc(db, "requests", requestId), { checklist: newChecklist });
    } catch (err) { console.error(err); }
  };

  const handleUploadDoc = async (type: 'id' | 'record', file: File) => {
    if (!user) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      await updateDoc(doc(db, "users", user.uid), {
        [type === 'id' ? 'idCardUrl' : 'policeRecordUrl']: reader.result as string,
        [type === 'id' ? 'idStatus' : 'recordStatus']: 'pending'
      });
      toast.success("Documento subido correctamente.");
    };
    reader.readAsDataURL(file);
  };

  const handleUploadAvatar = async (file: File) => {
    if (!user) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      await updateDoc(doc(db, "users", user.uid), { profileImage: reader.result as string });
      setProfileImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateInventoryQuantity = async (id: string, delta: number) => {
    const item = inventory.find(i => i.id === id);
    if (!item) return;
    try { await updateDoc(doc(db, "inventory", id), { quantity: Math.max(0, item.quantity + delta) }); } catch (e) { console.error(e); }
  };

  const handleAddInventoryItem = async (item: any) => { try { await addDoc(collection(db, "inventory"), { ...item, createdAt: serverTimestamp() }); } catch (e) { console.error(e); } };

  const handleDeleteInventoryItem = async (id: string) => { if (window.confirm("¿Eliminar?")) try { await deleteDoc(doc(db, "inventory", id)); } catch (e) { console.error(e); } };

  const handleUpdateInventoryItem = async (item: InventoryItem) => { try { const { id, ...data } = item; await updateDoc(doc(db, "inventory", id), data); } catch (e) { console.error(e); } };

  const handleBulkUpdateAssets = async (assetIds: string[], update: Partial<Asset>) => {
    try {
      const batch = assetIds.map(id => updateDoc(doc(db, "assets", id), update));
      await Promise.all(batch);
      toast.success(`${assetIds.length} equipos actualizados en lote.`);
    } catch (err) { console.error(err); }
  };

  const handleBulkRegisterAssets = async (assetsList: any[]) => {
    if (!user) return;
    try {
      toast.loading(`Registrando ${assetsList.length} unidades...`, { id: 'bulk-reg' });
      const batch = assetsList.map(a => addDoc(collection(db, "assets"), {
        ...a,
        clientId: user.uid,
        registeredAt: new Date().toISOString().split('T')[0]
      }));
      await Promise.all(batch);
      toast.success(`¡Misión cumplida! ${assetsList.length} unidades integradas al ecosistema.`, { id: 'bulk-reg' });
    } catch (err) {
      console.error(err);
      toast.error("Error en el registro masivo.", { id: 'bulk-reg' });
    }
  };

  const handleAddAsset = async (data: any) => {
    if (!user) return;
    if (assetToEdit) await updateDoc(doc(db, "assets", assetToEdit.id), data);
    else await addDoc(collection(db, "assets"), { ...data, clientId: user.uid, registeredAt: new Date().toISOString().split('T')[0] });
    setIsAssetModalOpen(false);
    setAssetToEdit(null);
  };

  const handleUpdateTechProfile = async (data: Partial<TechProfile>) => {
    if (!selectedTechProfileId) return;
    try { await updateDoc(doc(db, "technicians", selectedTechProfileId), data); setIsEditingTechProfile(false); } catch (e) { console.error(e); }
  };

  const handleVerifyTechnician = async (id: string, val: boolean) => {
    try { await updateDoc(doc(db, "technicians", id), { isVerified: val }); } catch (e) { console.error(e); }
  };

  const getStatusLabel = (s: string) => {
    const map: any = { pending: 'SOLICITADO', quoted: 'COTIZADO', accepted: 'PAGADO', executing: 'EN PROCESO', completed: 'FINALIZADO', rated: 'CALIFICADO', rejected: 'DENEGADO', disputed: 'IMPREVISTO', cancelled: 'CANCELADO' };
    return map[s] || s.toUpperCase();
  };

  const getSelectedTechProfileObj = () => technicians.find(t => t.id === selectedTechProfileId) || { id: selectedTechProfileId || 'new', name: loggedInName, category: 'mecanico', title: 'Técnico Especialista', rating: 5.0, reviewCount: 0, completedJobs: 0, plan: 'basic' } as TechProfile;

  if (isAuthResolving) return <div className="h-screen w-full bg-[#0d0e12] flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#5d3cfe]"></div></div>;

  if (!isLoggedIn) return (
    <>
      <LandingPage onStart={() => setShowAuthForm(true)} onWatchDemo={() => setIsDemoModalOpen(true)} />
      {showAuthForm && (
        <div className="fixed inset-0 z-[200] bg-[#0d0e12]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#121317] border border-[#2a2b2f] p-10 rounded-[2.5rem] space-y-8 shadow-2xl relative animate-fade-in-up">
            <button onClick={() => setShowAuthForm(false)} className="absolute top-6 right-6 p-2 text-[#474556] hover:text-white"><X className="w-6 h-6" /></button>
            <div className="text-center space-y-4 flex flex-col items-center"><Logo size="lg" className="mb-2" /><p className="text-[#c8c4d9] text-[10px] font-black uppercase tracking-[0.3em]">Inteligencia Operativa Panamá</p></div>
            <div className="flex bg-[#1c1d21] p-1.5 rounded-2xl border border-[#2a2b2f]">
               <button onClick={() => setAuthMode('login')} className={`flex-1 py-3 text-[10px] font-black uppercase rounded-xl ${authMode === 'login' ? 'bg-[#5d3cfe] text-white shadow-lg shadow-[#5d3cfe]/20' : 'text-[#474556]'}`}>Ingresar</button>
               <button onClick={() => setAuthMode('register')} className={`flex-1 py-3 text-[10px] font-black uppercase rounded-xl ${authMode === 'register' ? 'bg-[#5d3cfe] text-white shadow-lg shadow-[#5d3cfe]/20' : 'text-[#474556]'}`}>Registrarse</button>
            </div>
            <form onSubmit={handleLogin} className="space-y-6">
              {authMode === 'register' && <div className="space-y-2 text-left"><label className="text-[10px] font-black text-[#474556] uppercase ml-1">Nombre</label><input type="text" value={loginName} onChange={e => setLoginName(e.target.value)} className="w-full bg-[#0d0e12] border border-[#2a2b2f] rounded-2xl py-4 px-5 text-white" required /></div>}
              <div className="space-y-2 text-left"><label className="text-[10px] font-black text-[#474556] uppercase ml-1">Correo</label><input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} className="w-full bg-[#0d0e12] border border-[#2a2b2f] rounded-2xl py-4 px-5 text-white" required /></div>
              <div className="space-y-2 text-left"><label className="text-[10px] font-black text-[#474556] uppercase ml-1">Clave</label><input type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} className="w-full bg-[#0d0e12] border border-[#2a2b2f] rounded-2xl py-4 px-5 text-white" required /></div>
              {authMode === 'register' && <div className="space-y-2 text-left"><label className="text-[10px] font-black text-[#474556] uppercase ml-1">Tipo</label><select value={authRole} onChange={e => setAuthRole(e.target.value as any)} className="w-full bg-[#0d0e12] border border-[#2a2b2f] rounded-2xl py-4 px-5 text-white"><option value="client">Cliente</option><option value="tech">Técnico</option></select></div>}
              {authError && <p className="text-rose-500 text-[10px] font-black uppercase text-center">{authError}</p>}
              <button type="submit" className="w-full py-5 bg-[#5d3cfe] text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em]">Entrar âž”</button>
            </form>
          </div>
        </div>
      )}
      {isDemoModalOpen && (
        <div className="fixed inset-0 z-[300] bg-[#0d0e12]/95 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="w-full max-w-5xl bg-[#121317] border border-white/5 rounded-[3rem] overflow-hidden shadow-2xl animate-fade-in-up">
            <header className="px-10 py-6 border-b border-white/5 flex justify-between items-center bg-[#1c1d21]/50"><Logo size="md" /><button onClick={() => setIsDemoModalOpen(false)} className="p-3 text-[#474556] hover:text-white bg-white/5 rounded-2xl"><X className="w-7 h-7" /></button></header>
            <div className="aspect-video bg-black"><iframe className="w-full h-full" src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=1" frameBorder="0" allowFullScreen></iframe></div>
          </div>
        </div>
      )}
    </>
  );

  return (
    <PayPalScriptProvider options={{ clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID || "sb", currency: "USD", intent: "capture" }}>
    <div className="min-h-screen bg-[#0d0e12] flex flex-col font-sans text-[#e3e2e8] overflow-hidden grid-bg">
      <Toaster position="top-center" toastOptions={{ style: { background: '#1c1d24', color: '#fff', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' } }} />
      <nav className="h-20 bg-[#0d0e12]/80 backdrop-blur-md border-b border-[#2a2b2f] flex items-center justify-between px-10 shrink-0 z-50">
        <div className="flex items-center gap-10">
          <Logo size="sm" />
          <div className="relative"><Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#474556]" /><input type="text" placeholder="Buscar en el ecosistema..." className="bg-[#121317] border border-[#2a2b2f] rounded-full py-2.5 pl-12 pr-6 text-xs text-white w-[450px]" value={globalSearch} onChange={(e) => setGlobalSearch(e.target.value)} /></div>
        </div>
        <div className="flex items-center gap-8">
          <button onClick={() => setIsSupportModalOpen(true)} className="p-2.5 bg-[#1c1d21] border border-[#2a2b2f] rounded-xl text-[#c8c4d9] hover:text-white transition-all"><HelpCircle className="w-5 h-5" /></button>
          <button onClick={handleLogout} className="flex items-center gap-3 text-[#c8c4d9] hover:text-white font-black text-[10px] uppercase tracking-widest transition-all"><LogOut className="w-5 h-5" /> Salir</button>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-72 bg-[#0d0e12] border-r border-[#2a2b2f] p-8 flex flex-col shrink-0 overflow-y-auto custom-scrollbar">
          <div className="flex items-center gap-4 mb-10 group cursor-pointer" onClick={() => document.getElementById('avatar-input')?.click()}>
             <div className="w-14 h-14 rounded-2xl bg-[#1c1d21] border border-white/10 flex items-center justify-center text-xl font-black text-white shadow-2xl overflow-hidden relative">
               {profileImage ? <img src={profileImage} className="w-full h-full object-cover" /> : loggedInName[0]}
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
                <button onClick={() => setClientTab('dashboard')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${clientTab === 'dashboard' ? 'bg-[#5d3cfe] text-white shadow-xl shadow-[#5d3cfe]/20' : 'text-[#c8c4d9] hover:bg-[#121317]'}`}><LayoutDashboard className="w-4 h-4" /> Mis Equipos</button>
                {planLimits.fleet !== 'none' && (
                  <button onClick={() => setClientTab('fleet')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${clientTab === 'fleet' ? 'bg-[#5d3cfe] text-white shadow-xl shadow-[#5d3cfe]/20' : 'text-[#c8c4d9] hover:bg-[#121317]'}`}><Globe className="w-5 h-5" /> Flota B2B</button>
                )}
                <button onClick={() => setClientTab('ai')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${clientTab === 'ai' ? 'bg-[#5d3cfe] text-white shadow-xl shadow-[#5d3cfe]/20' : 'text-[#c8c4d9] hover:bg-[#121317]'}`}><BrainCircuit className="w-5 h-5 text-[#52ffac]" /> Autodiagnóstico</button>
                <button onClick={() => setClientTab('marketplace')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${clientTab === 'marketplace' ? 'bg-[#5d3cfe] text-white shadow-xl shadow-[#5d3cfe]/20' : 'text-[#c8c4d9] hover:bg-[#121317]'}`}><Store className="w-5 h-5" /> Buscar Expertos</button>
                <button onClick={() => setClientTab('quotes')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${clientTab === 'quotes' ? 'bg-[#5d3cfe] text-white shadow-xl shadow-[#5d3cfe]/20' : 'text-[#c8c4d9] hover:bg-[#121317]'}`}><FileCheck2 className="w-4 h-4" /> Contratos</button>
                {planLimits.maxAssets > 3 && (
                  <button onClick={() => setClientTab('audit')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${clientTab === 'audit' ? 'bg-[#5d3cfe] text-white shadow-xl shadow-[#5d3cfe]/20' : 'text-[#c8c4d9] hover:bg-[#121317]'}`}><FileText className="w-4 h-4" /> Auditoría</button>
                )}
                <button onClick={() => setClientTab('inventory')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${clientTab === 'inventory' ? 'bg-[#5d3cfe] text-white shadow-xl shadow-[#5d3cfe]/20' : 'text-[#c8c4d9] hover:bg-[#121317]'}`}><Package className="w-4 h-4" /> Repuestos</button>
                <button onClick={() => setClientTab('subscriptions')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${clientTab === 'subscriptions' ? 'bg-[#5d3cfe] text-white shadow-xl shadow-[#5d3cfe]/20' : 'text-[#c8c4d9] hover:bg-[#121317]'}`}><Star className="w-4 h-4" /> Membresía</button>
                <button onClick={() => setClientTab('chat')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${clientTab === 'chat' ? 'bg-[#5d3cfe] text-white shadow-xl shadow-[#5d3cfe]/20' : 'text-[#c8c4d9] hover:bg-[#121317]'}`}><MessageSquare className="w-4 h-4" /> Chat</button>
                <button onClick={() => setClientTab('settings')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${clientTab === 'settings' ? 'bg-[#5d3cfe] text-white shadow-xl shadow-[#5d3cfe]/20' : 'text-[#c8c4d9] hover:bg-[#121317]'}`}><Settings className="w-4 h-4" /> Seguridad</button>
              </>
            ) : role === 'tech' ? (
              <>
                <button onClick={() => setTechTab('received')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${techTab === 'received' ? 'bg-[#5d3cfe] text-white shadow-xl' : 'text-[#c8c4d9] hover:bg-[#121317]'}`}><Inbox className="w-4 h-4" /> Bandeja</button>
                <button onClick={() => setTechTab('agenda')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${techTab === 'agenda' ? 'bg-[#5d3cfe] text-white shadow-xl' : 'text-[#c8c4d9] hover:bg-[#121317]'}`}><CalendarDays className="w-4 h-4" /> Agenda</button>
                <button onClick={() => setTechTab('wallet')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${techTab === 'wallet' ? 'bg-[#5d3cfe] text-white shadow-xl' : 'text-[#c8c4d9] hover:bg-[#121317]'}`}><PieChart className="w-4 h-4" /> Billetera</button>
                <button onClick={() => setTechTab('mantech_id')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${techTab === 'mantech_id' ? 'bg-[#5d3cfe] text-white shadow-xl' : 'text-[#c8c4d9] hover:bg-[#121317]'}`}><ShieldCheck className="w-4 h-4" /> Mantech ID</button>
                <button onClick={() => setTechTab('chat')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${techTab === 'chat' ? 'bg-[#5d3cfe] text-white shadow-xl' : 'text-[#c8c4d9] hover:bg-[#121317]'}`}><MessageSquare className="w-4 h-4" /> Chat</button>
                <button onClick={() => setTechTab('profile')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${techTab === 'profile' ? 'bg-[#5d3cfe] text-white shadow-xl' : 'text-[#c8c4d9] hover:bg-[#121317]'}`}><User className="w-4 h-4" /> Mi Perfil</button>
                <button onClick={() => setTechTab('settings')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${techTab === 'settings' ? 'bg-[#5d3cfe] text-white shadow-xl' : 'text-[#c8c4d9] hover:bg-[#121317]'}`}><Settings className="w-4 h-4" /> Seguridad</button>
              </>
            ) : (
              <>
                <button onClick={() => setAdminTab('finance')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${adminTab === 'finance' ? 'bg-[#e11d48] text-white shadow-xl shadow-[#e11d48]/20' : 'text-[#c8c4d9] hover:bg-[#121317]'}`}><DollarSign className="w-4 h-4" /> Finanzas</button>
                <button onClick={() => setAdminTab('logistics')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${adminTab === 'logistics' ? 'bg-[#e11d48] text-white shadow-xl shadow-[#e11d48]/20' : 'text-[#c8c4d9] hover:bg-[#121317]'}`}><Truck className="w-4 h-4" /> Logística</button>
                <button onClick={() => setAdminTab('users')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${adminTab === 'users' ? 'bg-[#e11d48] text-white shadow-xl shadow-[#e11d48]/20' : 'text-[#c8c4d9] hover:bg-[#121317]'}`}><Users className="w-4 h-4" /> Usuarios</button>
                <button onClick={() => setAdminTab('inventory')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${adminTab === 'inventory' ? 'bg-[#e11d48] text-white shadow-xl shadow-[#e11d48]/20' : 'text-[#c8c4d9] hover:bg-[#121317]'}`}><Package className="w-4 h-4" /> Inventario</button>
                <button onClick={() => setAdminTab('alerts')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${adminTab === 'alerts' ? 'bg-[#e11d48] text-white shadow-xl shadow-[#e11d48]/20' : 'text-[#c8c4d9] hover:bg-[#121317]'}`}><BellRing className="w-4 h-4" /> Alertas</button>
                <button onClick={() => setAdminTab('settings')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${adminTab === 'settings' ? 'bg-[#e11d48] text-white shadow-xl shadow-[#e11d48]/20' : 'text-[#c8c4d9] hover:bg-[#121317]'}`}><Settings className="w-4 h-4" /> Configuración</button>
              </>
            )}
          </nav>
        </aside>

        <main className="flex-1 bg-[#0d0e12] p-10 overflow-y-auto custom-scrollbar">
           <div className="max-w-6xl mx-auto space-y-12">
              {role === 'client' && (
                <>
                  {clientTab === 'dashboard' && (
                    <div className="space-y-10 animate-fade-in">
                      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                         <div>
                            <h1 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">Mis Equipos</h1>
                            <p className="text-[#c8c4d9] font-medium mt-3 italic opacity-60">Monitoreo activo de tus activos en Panamá.</p>
                         </div>
                         <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
                            <div className="relative flex-1 md:w-64">
                               <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#474556]" />
                               <input
                                 type="text"
                                 placeholder="Buscar por placa o marca..."
                                 value={assetSearchQuery}
                                 onChange={(e) => { setAssetSearchQuery(e.target.value); setAssetCurrentPage(1); }}
                                 className="w-full bg-[#121317] border border-[#2a2b2f] rounded-2xl py-3 pl-12 pr-6 text-xs text-white focus:border-[#5d3cfe] outline-none transition-all"
                               />
                            </div>
                            <button onClick={() => setIsAssetModalOpen(true)} className="px-8 py-3.5 bg-[#5d3cfe] text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-[#5d3cfe]/20 transition-all hover:scale-105 active:scale-95 shrink-0">+ Registrar</button>
                         </div>
                      </header>

                      {(() => {
                        const filtered = assets.filter(a =>
                          a.name.toLowerCase().includes(assetSearchQuery.toLowerCase()) ||
                          a.licensePlate?.toLowerCase().includes(assetSearchQuery.toLowerCase()) ||
                          a.details.toLowerCase().includes(assetSearchQuery.toLowerCase())
                        );
                        const total = filtered.length;
                        const pages = Math.ceil(total / assetPageSize);
                        const start = (assetCurrentPage - 1) * assetPageSize;
                        const paginated = filtered.slice(start, start + assetPageSize);

                        return (
                          <div className="space-y-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                               {paginated.map(a => (
                                 <div key={a.id} className="bg-[#121317] border border-[#2a2b2f] p-8 rounded-[2.5rem] space-y-6 shadow-2xl hover:border-[#5d3cfe]/40 transition-all relative overflow-hidden group">
                                      <div className="absolute -bottom-6 -right-6 opacity-5 group-hover:opacity-10 transition-opacity">{a.type === 'car' ? <Car className="w-32 h-32" /> : <Wind className="w-32 h-32" />}</div>
                                     <div className="flex justify-between items-start relative z-10">
                                         <div className="flex items-center gap-5">
                                            <div className="w-16 h-16 rounded-2xl bg-[#1c1d21] border border-white/5 flex items-center justify-center text-white shadow-inner">{a.type === 'car' ? <Car className="w-8 h-8" /> : <Wind className="w-8 h-8" />}</div>
                                            <div>
                                               <p className="text-[9px] font-black text-[#474556] uppercase tracking-[0.3em] mb-1">Equipo / Marca</p>
                                               <h4 className="font-black text-white text-2xl uppercase tracking-tighter leading-none">{a.name}</h4>
                                               <p className="text-sm font-bold text-[#52ffac] uppercase tracking-widest mt-1.5">{a.details}</p>
                                               {a.licensePlate && (
                                                  <div className="mt-3 inline-flex items-center px-3 py-1 bg-black/50 border border-white/10 rounded-xl shadow-xl">
                                                     <span className="text-[9px] font-black text-[#474556] uppercase mr-2">Placa:</span>
                                                     <span className="text-[11px] font-black text-white tracking-widest">{a.licensePlate}</span>
                                                  </div>
                                               )}
                                            </div>
                                         </div>
                                         <button onClick={() => { setAssetToEdit(a); setIsAssetModalOpen(true); }} className="p-3 text-[#474556] hover:text-white transition-all bg-white/5 border border-white/5 rounded-2xl"><Pencil className="w-4 h-4" /></button>
                                      </div>

                                      <div className="py-6 px-6 bg-black/30 rounded-[2rem] border border-white/5 relative z-10 space-y-4">
                                         <div className="grid grid-cols-2 gap-4">
                                            <div>
                                               <p className="text-[8px] font-black text-[#474556] uppercase tracking-[0.2em]">Último Mtto.</p>
                                               <p className="text-xs font-bold text-white/40 mt-1 uppercase">{a.lastMaintenanceDate || 'Sin Registro'}</p>
                                            </div>
                                            <div>
                                               <p className="text-[8px] font-black text-[#474556] uppercase tracking-[0.2em]">Próximo Mtto.</p>
                                               <p className="text-sm font-black text-[#5d3cfe] mt-1 tracking-tight">{a.nextMaintenanceDate}</p>
                                            </div>
                                         </div>
                                         <div className="h-px bg-white/5"></div>
                                         <div className="grid grid-cols-2 gap-4">
                                            <div>
                                               <p className="text-[8px] font-black text-[#474556] uppercase tracking-[0.2em]">Estatus Salud</p>
                                               <p className="text-sm font-black text-emerald-500 uppercase mt-1">Óptimo</p>
                                            </div>
                                            <div>
                                               <p className="text-[8px] font-black text-[#474556] uppercase tracking-[0.2em]">Modelo Registrado</p>
                                               <p className="text-xs font-bold text-[#52ffac] mt-1 uppercase">{a.details.split(' ')[0]}</p>
                                            </div>
                                         </div>
                                         {a.observations && (
                                            <div className="pt-2">
                                               <p className="text-[8px] font-black text-[#474556] uppercase tracking-[0.2em]">Detalles del Servicio</p>
                                               <p className="text-[11px] text-white italic font-bold mt-1 leading-relaxed tracking-wide">"{a.observations.toUpperCase()}"</p>
                                            </div>
                                         )}
                                      </div>
                                      <button onClick={() => setClientTab('marketplace')} className="w-full py-4 bg-[#1c1d21] hover:bg-white text-white hover:text-black rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all relative z-10">SOLICITAR TÉCNICO</button>
                                   </div>
                               ))}
                            </div>

                            {pages > 1 && (
                               <div className="flex justify-center items-center gap-4 pt-10">
                                  <button
                                    disabled={assetCurrentPage === 1}
                                    onClick={() => setAssetCurrentPage(p => p - 1)}
                                    className="p-3 bg-[#121317] border border-[#2a2b2f] rounded-xl text-[#c8c4d9] disabled:opacity-20 hover:text-white transition-all shadow-xl"
                                  >
                                     <ChevronLeft className="w-5 h-5" />
                                  </button>
                                  <div className="flex gap-2">
                                     {Array.from({ length: pages }).map((_, i) => (
                                       <button
                                         key={i}
                                         onClick={() => setAssetCurrentPage(i + 1)}
                                         className={`w-10 h-10 rounded-xl text-[10px] font-black transition-all ${assetCurrentPage === i + 1 ? 'bg-[#5d3cfe] text-white shadow-lg shadow-[#5d3cfe]/30' : 'bg-[#121317] text-[#474556] border border-[#2a2b2f]'}`}
                                       >
                                         {i + 1}
                                       </button>
                                     ))}
                                  </div>
                                  <button
                                    disabled={assetCurrentPage === pages}
                                    onClick={() => setAssetCurrentPage(p => p + 1)}
                                    className="p-3 bg-[#121317] border border-[#2a2b2f] rounded-xl text-[#c8c4d9] disabled:opacity-20 hover:text-white transition-all shadow-xl"
                                  >
                                     <ChevronRight className="w-5 h-5" />
                                  </button>
                               </div>
                            )}

                            {total === 0 && (
                               <div className="py-20 text-center space-y-4">
                                  <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-white/5 opacity-20">
                                     <LayoutDashboard className="w-8 h-8" />
                                  </div>
                                  <p className="text-[10px] font-black text-[#474556] uppercase tracking-[0.3em]">No se encontraron equipos con esa placa o nombre.</p>
                               </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  )}
                  {clientTab === 'fleet' && (
                    <FleetDashboard
                      assets={assets}
                      reminders={reminders}
                      onManageAsset={(a) => { setAssetToEdit(a); setIsAssetModalOpen(true); }}
                      mode={planLimits.fleet as any}
                      onBulkUpdate={handleBulkUpdateAssets}
                      onBulkRegister={handleBulkRegisterAssets}
                      onStartGps={startGpsTracking}
                      trackingAssetId={trackingAssetId}
                    />
                  )}
                  {clientTab === 'ai' && <DiagnosticAIView assets={assets} onFindTechnicians={(c) => { setMarketFilter(c); setClientTab('marketplace'); }} mode={planLimits.diag as any} />}
                  {clientTab === 'marketplace' && (
                    <div className="space-y-10">
                      <header><h1 className="text-4xl font-black text-white uppercase tracking-tighter">Marketplace <span className="text-[#5d3cfe]">Expertos</span></h1><div className="flex gap-3 overflow-x-auto pb-4 mt-6 custom-scrollbar">{['Todos', 'Mecánico', 'Técnico A/C', 'Electricista', 'Informático'].map(c => (<button key={c} onClick={() => setMarketFilter(c === 'Todos' ? 'all' : c.toLowerCase().replace(' ', '_') as any)} className={`flex-shrink-0 px-8 py-3 rounded-full border transition-all text-[10px] font-black uppercase tracking-widest ${marketFilter === (c === 'Todos' ? 'all' : c.toLowerCase().replace(' ', '_')) ? 'bg-[#5d3cfe] border-[#5d3cfe] text-white shadow-xl shadow-[#5d3cfe]/20' : 'border-[#2a2b2f] text-[#c8c4d9] hover:border-[#5d3cfe]'}`}>{c}</button>))}</div></header>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                         {technicians.filter(t => marketFilter === 'all' || t.category === marketFilter).map(t => (
                           <div key={t.id} className="bg-[#121317] border border-[#2a2b2f] p-8 rounded-[3rem] flex flex-col gap-6 relative overflow-hidden group hover:border-[#5d3cfe]/50 transition-all shadow-2xl">
                              <div className="flex items-center gap-5"><div className="w-16 h-16 rounded-2xl bg-[#1c1d21] border border-[#2a2b2f] flex items-center justify-center text-[#c7bfff] font-black text-2xl shadow-inner">{t.name[0]}</div><div><h4 className="font-black text-white text-base uppercase tracking-tight">{t.name}</h4><p className="text-[10px] font-black text-[#52ffac] uppercase tracking-[0.2em] mt-1">{t.category.replace('_',' ')}</p></div></div>
                              <div className="grid grid-cols-3 gap-4 py-4 border-y border-[#2a2b2f]/50 bg-[#0d0e12]/30 px-4 rounded-2xl text-center"><div><div className="text-amber-500 font-black text-sm flex items-center justify-center gap-1"><Star className="w-3 h-3 fill-amber-500" /> {t.rating}</div><span className="text-[8px] text-[#474556] font-bold uppercase">Rating</span></div><div><div className="text-white font-black text-sm">{t.experienceYears}a</div><span className="text-[8px] text-[#474556] font-bold uppercase">Exp.</span></div><div><div className="text-[#52ffac] font-black text-sm">${t.hourlyRate}</div><span className="text-[8px] text-[#474556] font-bold uppercase">Hr.</span></div></div>
                              <button onClick={() => { setActiveTechForModal(t); setIsTechModalOpen(true); }} className="w-full py-4 bg-[#1c1d21] hover:bg-[#5d3cfe] text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-lg active:scale-95">Ver Perfil & Agendar</button>
                           </div>
                         ))}
                      </div>
                    </div>
                  )}
                  {clientTab === 'quotes' && (
                     <div className="space-y-10 animate-fade-in">
                        <header><h1 className="text-4xl font-black text-white tracking-tighter uppercase">Contratos <span className="text-[#52ffac]">Activos</span></h1></header>
                        <div className="space-y-6">
                           {requests.map(req => (
                             <div key={req.id} className="bg-[#121317] border border-[#2a2b2f] p-10 rounded-[2.5rem] space-y-10 shadow-2xl relative overflow-hidden">
                                <div className="flex justify-between items-center relative z-10">
                                   <h4 className="font-black text-white text-2xl uppercase tracking-tighter">{req.assetName}</h4>
                                   <span className="px-6 py-2 bg-[#1c1d21] border border-[#2a2b2f] rounded-full text-[10px] font-black text-[#52ffac] uppercase tracking-widest shadow-inner">
                                      {getStatusLabel(req.status)}
                                   </span>
                                </div>

                                <div className="flex items-center justify-between px-4 py-8 relative z-10">
                                   {[
                                     { label: 'SOLICITUD', status: ['pending', 'quoted', 'accepted', 'executing', 'completed', 'rated'], icon: <Layers className="w-5 h-5" /> },
                                     { label: 'COTIZADO', status: ['quoted', 'accepted', 'executing', 'completed', 'rated'], icon: <DollarSign className="w-5 h-5" /> },
                                     { label: 'PAGADO', status: ['accepted', 'executing', 'completed', 'rated'], icon: <ShieldCheck className="w-5 h-5" /> },
                                     { label: req.serviceType === 'remote' ? 'REMOTO' : 'EN SITIO', status: ['executing', 'completed', 'rated'], icon: req.serviceType === 'remote' ? <Video className="w-5 h-5" /> : <MapPin className="w-5 h-5" /> },
                                     { label: 'FINALIZADO', status: ['completed', 'rated'], icon: <CheckCircle2 className="w-5 h-5" /> }
                                   ].map((step, i, arr) => {
                                     const isActive = step.status.includes(req.status);
                                     const isLast = i === arr.length - 1;
                                     return (
                                       <React.Fragment key={i}>
                                         <div className="flex flex-col items-center gap-4 relative z-20">
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${isActive ? 'bg-[#5d3cfe] shadow-[0_0_30px_#5d3cfe] text-white' : 'bg-[#1c1d21] border border-[#2a2b2f] text-[#474556]'}`}>
                                               {step.icon}
                                            </div>
                                            <span className={`text-[8px] font-black tracking-[0.2em] ${isActive ? 'text-[#c8c4d9]' : 'text-[#474556]'}`}>{step.label}</span>
                                         </div>
                                         {!isLast && (
                                            <div className="flex-1 px-2 mb-12">
                                               <div className={`h-[2px] rounded-full transition-all duration-700 ${isActive && arr[i+1].status.includes(req.status) ? 'bg-[#5d3cfe] shadow-[0_0_10px_#5d3cfe]' : 'bg-[#1c1d21]'}`}></div>
                                            </div>
                                         )}
                                       </React.Fragment>
                                     );
                                   })}
                                </div>

                                {req.status === 'quoted' && (
                                   <div className="bg-[#5d3cfe]/10 p-8 rounded-[2.5rem] border border-[#5d3cfe]/30 space-y-6">
                                      <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
                                         <div className="text-center md:text-left">
                                            <p className="text-white font-black text-xl uppercase tracking-tight">Propuesta: ${req.price?.toFixed(2)} USD</p>
                                            <p className="text-[11px] text-[#c8c4d9] font-medium mt-1 uppercase tracking-widest">Cita: {req.scheduledDate} @ {req.scheduledTime}</p>
                                         </div>
                                         <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                                            <button
                                              onClick={() => handleAcceptQuote(req.id, 'yappy')}
                                              className="flex-1 px-8 py-4 bg-[#52ffac] text-black rounded-2xl text-[10px] font-black uppercase shadow-xl shadow-[#52ffac]/20 hover:brightness-110 transition-all flex items-center justify-center gap-2 h-[56px]"
                                            >
                                              <Download className="w-4 h-4" /> Yappy
                                            </button>
                                            <div className="flex-1 min-w-[200px]">
                                              <PayPalButtons
                                                style={{ layout: "horizontal", shape: "pill", color: "blue", height: 55 }}
                                                createOrder={async () => {
                                                  try {
                                                    const response = await fetch("/api/orders", {
                                                      method: "POST",
                                                      headers: { "Content-Type": "application/json" },
                                                      body: JSON.stringify({ price: req.price, itemName: `Servicio: ${req.assetName}` })
                                                    });
                                                    if (!response.ok) {
                                                      const errorData = await response.json().catch(() => ({}));
                                                      throw new Error(errorData.error || "Error al crear la orden de pago");
                                                    }
                                                    const order = await response.json();
                                                    return order.id;
                                                  } catch (err: any) {
                                                    console.error("❌ Error en createOrder:", err);
                                                    toast.error(`Error al procesar el pago: ${err.message}`);
                                                    throw err;
                                                  }
                                                }}
                                                onApprove={async (data) => {
                                                  try {
                                                    const response = await fetch(`/api/orders/${data.orderID}/capture`, { method: "POST" });
                                                    const result = await response.json();

                                                    if (!response.ok) {
                                                      const errorDetail = result.details?.[0];
                                                      if (errorDetail?.issue === "INSTRUMENT_DECLINED") {
                                                        throw new Error("La tarjeta fue rechazada. Por favor intenta con otro método en tu cuenta PayPal.");
                                                      }
                                                      throw new Error(result.message || "Error al procesar la captura del pago.");
                                                    }

                                                    if (result.status === "COMPLETED") {
                                                      handleAcceptQuote(req.id, 'paypal');
                                                    } else {
                                                      toast.error("El pago no se pudo completar. Por favor verifica tu cuenta.");
                                                    }
                                                  } catch (err: any) {
                                                    console.error("❌ Error en onApprove:", err);
                                                    toast.error(`Pago fallido: ${err.message}`);
                                                  }
                                                }}
                                              />
                                            </div>
                                         </div>
                                      </div>
                                      <p className="text-[9px] text-[#474556] font-bold uppercase text-center tracking-widest">Pagos procesados de forma segura con cifrado AES-256</p>
                                   </div>
                                )}
                                {req.status === 'disputed' && req.unforeseenAmount && (
                                   <div className="bg-amber-500/10 p-8 rounded-[3rem] border border-amber-500/30 space-y-6 animate-fade-in">
                                      <div className="text-center md:text-left space-y-2"><p className="text-amber-400 font-black text-sm uppercase tracking-widest flex items-center gap-2"><AlertTriangle className="w-5 h-5" /> IMPREVISTO DETECTADO</p><p className="text-white font-bold text-base leading-tight">Motivo: {req.unforeseenReason}</p></div>
                                      <div className="flex flex-col md:flex-row gap-4 items-center justify-between pt-4 border-t border-white/5"><div className="text-2xl font-black text-[#52ffac]">$+{req.unforeseenAmount.toFixed(2)} <span className="text-[10px] text-[#474556] uppercase">USD</span></div><div className="flex gap-3 w-full md:w-auto"><button onClick={() => handleRejectUnforeseen(req.id)} className="flex-1 px-6 py-3 border border-rose-500/30 text-rose-500 rounded-xl text-[10px] font-black uppercase hover:bg-rose-500 hover:text-white transition-all">Rechazar</button><button onClick={() => handleApproveUnforeseen(req.id)} className="flex-1 px-8 py-3 bg-amber-500 text-black rounded-xl text-[10px] font-black uppercase shadow-lg shadow-amber-500/20 hover:brightness-110 transition-all">Aprobar y Pagar</button></div></div>
                                   </div>
                                )}
                                {(req.status === 'executing' || req.status === 'completed' || req.status === 'rated') && (
                                   <div className="bg-[#1c1d21] p-8 rounded-[3rem] border border-white/5 space-y-8 animate-fade-in shadow-2xl">
                                      <div className="flex flex-col md:flex-row gap-6 items-start justify-between border-b border-white/5 pb-8">
                                         <div className="space-y-4">
                                            <div className="flex items-center gap-3 text-[#52ffac]">
                                               {req.status === 'executing' ? <Activity className="w-6 h-6 animate-pulse" /> : <CheckCircle2 className="w-6 h-6" />}
                                               <h4 className="text-xl font-black uppercase tracking-tighter leading-none">
                                                  {req.status === 'executing' ? 'Servicio en Ejecución' : 'Resumen de Servicio'}
                                               </h4>
                                            </div>
                                            <p className="text-sm text-[#c8c4d9] font-medium leading-relaxed max-w-xl">
                                               {req.status === 'executing'
                                                 ? 'Monitoreo en tiempo real del progreso técnico. El especialista está trabajando en su activo.'
                                                 : 'El servicio ha finalizado satisfactoriamente. Aquí puede ver el desglose técnico final.'}
                                            </p>
                                         </div>
                                         <div className="flex gap-3">
                                            <div className="px-5 py-3 bg-black/30 rounded-2xl border border-white/5 text-center">
                                               <p className="text-[8px] font-black text-[#474556] uppercase">Iniciado</p>
                                               <p className="text-sm font-black text-white">{formatTime12h(req.visitStartedAt)}</p>
                                            </div>
                                            {req.status === 'executing' && req.serviceType === 'remote' && req.remoteLink && (
                                               <a
                                                 href={req.remoteLink.startsWith('http') ? req.remoteLink : `https://${req.remoteLink}`}
                                                 target="_blank"
                                                 rel="noreferrer"
                                                 className="px-6 py-3 bg-[#5d3cfe] text-white rounded-2xl text-[10px] font-black uppercase shadow-lg shadow-[#5d3cfe]/30 flex items-center gap-2 animate-bounce"
                                               >
                                                  <Monitor className="w-4 h-4" /> Unirse a {req.remotePlatform?.toUpperCase() || 'Sesión'}
                                               </a>
                                            )}
                                            {(req.status === 'completed' || req.status === 'rated') && (
                                               <div className="flex gap-2">
                                                  <button onClick={() => { setSelectedRequestForReport(req); setIsReportModalOpen(true); }} className="px-6 py-3 bg-white/5 border border-white/10 text-white rounded-2xl text-[10px] font-black uppercase hover:bg-[#5d3cfe] transition-all flex items-center gap-2">
                                                     <FileText className="w-4 h-4" /> Reporte
                                                  </button>
                                                  {req.status === 'completed' && (
                                                    <button onClick={() => { setActiveRequestForSignature(req.id); setIsSignatureModalOpen(true); }} className="px-8 py-3 bg-[#5d3cfe] text-white rounded-2xl text-[10px] font-black uppercase shadow-lg">
                                                       Calificar
                                                    </button>
                                                  )}
                                                  <button
                                                    onClick={async () => {
                                                      if(window.confirm("¿Deseas eliminar este registro de tu vista?")) {
                                                        await deleteDoc(doc(db, "requests", req.id));
                                                        toast.success("Eliminado");
                                                      }
                                                    }}
                                                    className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-2xl hover:bg-rose-500 hover:text-white transition-all"
                                                  >
                                                    <Trash2 className="w-4 h-4" />
                                                  </button>
                                               </div>
                                            )}
                                         </div>
                                      </div>

                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                         <div className="space-y-6">
                                            <h5 className="text-[10px] font-black text-[#474556] uppercase tracking-[0.3em] flex items-center gap-2">
                                               <CheckCircle2 className="w-4 h-4" /> Bitácora de Tareas
                                            </h5>
                                            <div className="bg-[#0d0e12] p-6 rounded-3xl border border-white/5 space-y-4">
                                               {req.checklist && req.checklist.length > 0 ? req.checklist.map((task: any) => (
                                                  <div key={task.id} className="flex items-center gap-4">
                                                     <div className={`w-5 h-5 rounded-full flex items-center justify-center ${task.isCompleted ? 'bg-[#52ffac]' : 'border border-[#474556]'}`}>
                                                        {task.isCompleted && <Check className="w-3 h-3 text-[#0d0e12]" />}
                                                     </div>
                                                     <span className={`text-[12px] font-bold ${task.isCompleted ? 'text-white' : 'text-[#474556] opacity-50'}`}>
                                                        {task.description}
                                                     </span>
                                                  </div>
                                               )) : <p className="text-[10px] text-[#474556] italic">Sincronizando tareas...</p>}
                                            </div>
                                         </div>

                                         <div className="space-y-6">
                                            <h5 className="text-[10px] font-black text-[#474556] uppercase tracking-[0.3em] flex items-center gap-2">
                                               <Package className="w-4 h-4" /> Materiales & Repuestos
                                            </h5>
                                            <div className="grid grid-cols-1 gap-3">
                                               {req.materials && req.materials.length > 0 ? req.materials.map((m: any, idx: number) => (
                                                  <div key={idx} className="flex justify-between items-center bg-[#0d0e12] p-5 rounded-2xl border border-white/5">
                                                     <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-xl bg-[#5d3cfe]/10 flex items-center justify-center text-[#c7bfff] font-black text-xs">x{Number(m.quantity) || 1}</div>
                                                        <span className="text-xs font-bold text-white uppercase">{m.name}</span>
                                                     </div>
                                                     <span className="text-sm font-black text-[#52ffac]">${((Number(m.price) || 0) * (Number(m.quantity) || 1)).toFixed(2)}</span>
                                                  </div>
                                               )) : <p className="text-[10px] text-[#474556] italic">No hay materiales registrados.</p>}
                                            </div>
                                         </div>
                                      </div>
                                   </div>
                                )}
                             </div>
                           ))}
                        </div>
                     </div>
                  )}
                  {clientTab === 'audit' && (
                    <div className="space-y-10 animate-fade-in">
                       <header className="flex justify-between items-end">
                          <div><h1 className="text-4xl font-black text-white tracking-tighter uppercase">Auditoría <span className="text-[#5d3cfe]">Lite</span></h1><p className="text-[#c8c4d9] font-medium mt-2 italic opacity-60">Resumen de cumplimiento técnico (Plan Profesional).</p></div>
                          {subscription.planId === 'plan-enterprise' && (
                            <button onClick={() => toast.success("Generando reporte Excel completo...")} className="px-6 py-3 bg-[#52ffac] text-black rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all hover:scale-105"><Download className="w-4 h-4" /> Exportar Full</button>
                          )}
                       </header>
                       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="bg-[#121317] border border-[#2a2b2f] p-8 rounded-[2rem] shadow-2xl">
                             <span className="text-[9px] font-black text-[#474556] uppercase tracking-[0.3em]">Total Equipos</span>
                             <p className="text-4xl font-black text-white mt-2">{assets.length}</p>
                          </div>
                          <div className="bg-[#121317] border border-[#2a2b2f] p-8 rounded-[2rem] shadow-2xl">
                             <span className="text-[9px] font-black text-[#474556] uppercase tracking-[0.3em]">Mttos. Al Día</span>
                             <p className="text-4xl font-black text-emerald-500 mt-2">{assets.length - reminders.filter(r => r.status === 'urgent').length}</p>
                          </div>
                          <div className="bg-[#121317] border border-[#2a2b2f] p-8 rounded-[2rem] shadow-2xl">
                             <span className="text-[9px] font-black text-[#474556] uppercase tracking-[0.3em]">Acciones Pendientes</span>
                             <p className="text-4xl font-black text-rose-500 mt-2">{reminders.filter(r => r.status === 'urgent').length}</p>
                          </div>
                       </div>
                       <div className="bg-[#121317] border border-[#2a2b2f] p-8 rounded-[3rem] shadow-2xl">
                          <h4 className="text-xs font-black text-white uppercase mb-6 tracking-widest">Logs de Cumplimiento</h4>
                          <div className="space-y-4">
                             {assets.map(a => (
                               <div key={a.id} className="flex justify-between items-center py-4 border-b border-white/5">
                                  <div><p className="text-sm font-bold text-white uppercase">{a.name}</p><p className="text-[9px] text-[#474556] uppercase tracking-widest">{a.details} • Sede: {a.location || 'Principal'}</p></div>
                                  <div className="text-right"><p className="text-[10px] font-black text-[#5d3cfe] uppercase">Próximo Mtto.</p><p className="text-xs font-bold text-white/60">{a.nextMaintenanceDate}</p></div>
                               </div>
                             ))}
                          </div>
                       </div>
                    </div>
                  )}
                  {clientTab === 'inventory' && <InventoryModule items={inventory} assets={assets} onUpdateQuantity={handleUpdateInventoryQuantity} onAddItem={handleAddInventoryItem} onDeleteItem={handleDeleteInventoryItem} onUpdateItem={handleUpdateInventoryItem} />}
                  {clientTab === 'subscriptions' && <SubscriptionModule subscription={subscription} onUpgrade={handleOpenSubscriptionPayment} role="client" />}
                  {clientTab === 'chat' && (
                    <div className="h-[calc(100vh-200px)]">
                      <SupportChatWidget
                        request={requests.find(r => r.id === activeChatRequestId) || null}
                        role="client"
                        messages={chatMessages}
                        onSendMessage={(txt, img) => addDoc(collection(db,"messages"), { requestId: activeChatRequestId, sender: 'client', text: txt, image: img || null, timestamp: serverTimestamp() })}
                        onStartVideoCall={(room, voice) => { setVideoCallRoom(room); setIsVideoVoiceOnly(voice); setIsVideoCallOpen(true); }}
                        onOpenScanner={() => setIsScannerOpen(true)}
                      />
                    </div>
                  )}
                  {clientTab === 'settings' && (
                    <div className="max-w-2xl mx-auto space-y-10 pb-20">
                       <header className="text-center space-y-2"><h2 className="text-3xl font-black text-white uppercase tracking-tight">Seguridad de Cuenta</h2><p className="text-[10px] font-black text-[#c8c4d9] uppercase tracking-[0.3em]">Validación Mantech ID Panamá</p></header>
                       <MantechIDModule mantechId={{ status: userData?.recordStatus || 'unverified', idNumber: '', documentUrl: userData?.idCardUrl, policeRecordUrl: userData?.policeRecordUrl }} onUpload={handleUploadDoc} role="client" plan={subscription.planId} />
                       <div className="bg-[#121317] border border-[#2a2b2f] p-8 rounded-[3rem] shadow-2xl"><button onClick={handleLogout} className="w-full py-5 border border-rose-500/20 text-rose-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all">Cerrar Sesión Segura</button></div>
                    </div>
                  )}
                </>
              )}

              {role === 'tech' && (
                 <div className="space-y-12">
                    {techTab === 'received' && (
                       <div className="space-y-8">
                          <header className="flex justify-between items-center"><h1 className="text-4xl font-black text-white uppercase tracking-tighter">Bandeja de <span className="text-[#5d3cfe]">Servicios</span></h1><button onClick={() => setTechTab('subscriptions')} className="px-6 py-2 bg-white/5 border border-white/10 text-white rounded-xl text-[9px] font-black uppercase hover:bg-[#5d3cfe]">Mejorar Plan Técnico</button></header>
                          <div className="grid grid-cols-1 gap-6">
                            {requests.map(req => (
                              <div key={req.id} className="bg-[#121317] border border-[#2a2b2f] p-8 rounded-[2.5rem] space-y-6 shadow-2xl relative overflow-hidden group hover:border-[#5d3cfe]/30 transition-all">
                                <div className="flex justify-between items-center"><h4 className="font-black text-white text-lg uppercase tracking-tight">{req.clientName}</h4><div className="flex gap-2"><button onClick={() => { setActiveChatRequestId(req.id); setTechTab('chat'); }} className="p-2 bg-[#5d3cfe]/10 border border-[#5d3cfe]/20 text-[#c7bfff] rounded-xl transition-all" title="Ir al Chat"><MessageSquare className="w-4 h-4" /></button><button onClick={() => setIsCredentialModalOpen(true)} className="p-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl transition-all" title="Mostrar Credencial"><QrCode className="w-4 h-4" /></button><span className="px-4 py-1.5 bg-[#1c1d21] border border-[#2a2b2f] rounded-full text-[9px] font-black text-[#c7bfff] uppercase tracking-widest shadow-inner">{getStatusLabel(req.status)}</span></div></div>
                                <div className="p-5 bg-[#0d0e12] rounded-2xl border border-[#2a2b2f] italic text-xs text-[#c8c4d9]">"{req.description}"</div>
                                {req.status === 'pending' && (
                                   <div className="pt-8 border-t border-[#2a2b2f] space-y-8 animate-fade-in">
                                      {/* SECCIÓN 1: DATOS LOGÍSTICOS */}
                                      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                                         <div className="space-y-2">
                                            <label className="text-[10px] font-black text-[#474556] uppercase tracking-widest ml-1">Tarifa Sugerida</label>
                                            <div className="relative">
                                               <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5d3cfe] font-black text-xs">$</span>
                                               <input type="number" value={bidPrice} onChange={e => setBidPrice(e.target.value)} className="w-full bg-[#0d0e12] border border-[#2a2b2f] rounded-2xl py-4 pl-8 pr-4 text-white font-black text-sm outline-none focus:border-[#5d3cfe] transition-all" placeholder="0.00" />
                                            </div>
                                         </div>
                                         <div className="space-y-2">
                                            <label className="text-[10px] font-black text-[#474556] uppercase tracking-widest ml-1">Fecha de Visita</label>
                                            <div className="relative">
                                               <input type="date" value={bidDate} onChange={e => setBidDate(e.target.value)} className="w-full bg-[#0d0e12] border border-[#2a2b2f] rounded-2xl py-4 px-5 text-white font-bold text-xs outline-none focus:border-[#5d3cfe] transition-all" />
                                               <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#474556] pointer-events-none" />
                                            </div>
                                         </div>
                                         <div className="space-y-2">
                                            <label className="text-[10px] font-black text-[#474556] uppercase tracking-widest ml-1">Hora de llegada</label>
                                            <select value={bidTime} onChange={e => setBidTime(e.target.value)} className="w-full bg-[#0d0e12] border border-[#2a2b2f] rounded-2xl py-4 px-5 text-white font-black text-xs appearance-none outline-none focus:border-[#5d3cfe] transition-all">
                                               <option value="">Seleccione...</option>
                                               {["7:00 AM", "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM", "6:00 PM", "7:00 PM", "8:00 PM"].map(t => (
                                                  <option key={t} value={t}>{t}</option>
                                               ))}
                                            </select>
                                         </div>
                                         <div className="space-y-2">
                                            <label className="text-[10px] font-black text-[#474556] uppercase tracking-widest ml-1">Duración Labor</label>
                                            <select value={bidDuration} onChange={e => setBidDuration(Number(e.target.value))} className="w-full bg-[#0d0e12] border border-[#2a2b2f] rounded-2xl py-4 px-5 text-white font-black text-xs appearance-none outline-none focus:border-[#5d3cfe] transition-all">
                                               <option value={1}>1 Hora</option>
                                               <option value={2}>2 Horas</option>
                                               <option value={4}>4 Horas</option>
                                               <option value={6}>6 Horas</option>
                                               <option value={8}>Día Completo</option>
                                            </select>
                                         </div>
                                         <div className="space-y-2">
                                            <label className="text-[10px] font-black text-[#474556] uppercase tracking-widest ml-1">Modalidad</label>
                                            <select value={bidServiceType} onChange={e => setBidServiceType(e.target.value as 'onsite' | 'remote')} className="w-full bg-[#0d0e12] border border-[#2a2b2f] rounded-2xl py-4 px-5 text-white font-black text-xs appearance-none outline-none focus:border-[#5d3cfe] transition-all">
                                               <option value="onsite">Presencial (En Sitio)</option>
                                               <option value="remote">Remoto (Soporte Digital)</option>
                                            </select>
                                         </div>
                                         {bidServiceType === 'remote' && (
                                            <div className="space-y-2 animate-fade-in">
                                               <label className="text-[10px] font-black text-[#474556] uppercase tracking-widest ml-1">Plataforma Remota</label>
                                               <select value={bidRemotePlatform} onChange={e => setBidRemotePlatform(e.target.value as any)} className="w-full bg-[#0d0e12] border border-[#2a2b2f] rounded-2xl py-4 px-5 text-white font-black text-xs appearance-none outline-none focus:border-[#5d3cfe] transition-all">
                                                  <option value="anydesk">AnyDesk (Control Remoto)</option>
                                                  <option value="zoom">Zoom</option>
                                                  <option value="meet">Google Meet</option>
                                                  <option value="teams">Microsoft Teams</option>
                                                  <option value="whatsapp">WhatsApp</option>
                                                  <option value="other">Otra Plataforma</option>
                                               </select>
                                            </div>
                                         )}
                                         {bidServiceType === 'remote' && (
                                            <div className="space-y-2 animate-fade-in">
                                               <label className="text-[10px] font-black text-[#474556] uppercase tracking-widest ml-1">Enlace / ID de Conexión</label>
                                               <div className="relative">
                                                  <input type="text" value={bidRemoteLink} onChange={e => setBidRemoteLink(e.target.value)} className="w-full bg-[#0d0e12] border border-[#2a2b2f] rounded-2xl py-4 px-5 text-white font-black text-xs outline-none focus:border-[#5d3cfe] transition-all" placeholder="URL o ID de sesión" />
                                                  <ExternalLink className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#474556] pointer-events-none" />
                                               </div>
                                            </div>
                                         )}
                                         <div className="space-y-2">
                                            <label className="text-[10px] font-black text-[#474556] uppercase tracking-widest ml-1">T. Llegada / Conexión (Min)</label>
                                            <div className="relative">
                                               <input type="number" value={bidTravelTime} onChange={e => setBidTravelTime(Number(e.target.value))} className="w-full bg-[#0d0e12] border border-[#2a2b2f] rounded-2xl py-4 px-5 text-white font-black text-sm outline-none focus:border-[#5d3cfe] transition-all" placeholder="30" />
                                               <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#474556] pointer-events-none" />
                                            </div>
                                         </div>
                                      </div>

                                      {/* SECCIÓN 2: CRONOGRAMA Y MATERIALES (NUEVO) */}
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                         <div className="space-y-4">
                                            <div className="flex justify-between items-center px-1">
                                               <h5 className="text-[10px] font-black text-[#474556] uppercase tracking-[0.2em] flex items-center gap-2">
                                                  <Package className="w-4 h-4 text-[#5d3cfe]" /> Insumos Requeridos
                                               </h5>
                                            </div>

                                            {/* Formulario Profesional de Insumos */}
                                            <div className="bg-[#1c1d21] p-5 rounded-3xl border border-[#2a2b2f] space-y-4">
                                               <div className="grid grid-cols-12 gap-3">
                                                  <input
                                                     type="text"
                                                     placeholder="Nombre Insumo"
                                                     value={newBidMaterial.name}
                                                     onChange={e => setNewBidMaterial({...newBidMaterial, name: e.target.value})}
                                                     className="col-span-6 bg-[#0d0e12] border border-[#2a2b2f] rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-[#5d3cfe]"
                                                  />
                                                  <input
                                                     type="number"
                                                     placeholder="Precio"
                                                     value={newBidMaterial.price}
                                                     onChange={e => setNewBidMaterial({...newBidMaterial, price: e.target.value})}
                                                     className="col-span-3 bg-[#0d0e12] border border-[#2a2b2f] rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-[#5d3cfe]"
                                                  />
                                                  <button
                                                     onClick={() => {
                                                        if(newBidMaterial.name && newBidMaterial.price) {
                                                           setBidMaterials([...bidMaterials, { name: newBidMaterial.name, price: Number(newBidMaterial.price), quantity: Number(newBidMaterial.quantity) }]);
                                                           setNewBidMaterial({ name: '', price: '', quantity: '1' });
                                                        }
                                                     }}
                                                     className="col-span-3 bg-[#5d3cfe] text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg active:scale-95"
                                                  >
                                                     Añadir
                                                  </button>
                                               </div>

                                               <div className="h-px bg-[#2a2b2f]"></div>

                                               <div className="space-y-3">
                                                  {bidMaterials.length > 0 ? bidMaterials.map((m, idx) => (
                                                     <div key={idx} className="flex justify-between items-center bg-[#0d0e12] p-3 rounded-2xl border border-white/5 group hover:border-[#5d3cfe]/30 transition-all">
                                                        <div className="flex items-center gap-4">
                                                           <div className="flex items-center bg-[#1c1d21] rounded-xl border border-[#2a2b2f] overflow-hidden">
                                                              <button
                                                                 onClick={() => {
                                                                    const nm = [...bidMaterials];
                                                                    nm[idx].quantity = Math.max(1, nm[idx].quantity - 1);
                                                                    setBidMaterials(nm);
                                                                 }}
                                                                 className="px-2 py-1 text-[#474556] hover:text-white transition-colors"
                                                              >-</button>
                                                              <span className="px-2 text-[10px] font-black text-[#5d3cfe] min-w-[20px] text-center">{m.quantity}</span>
                                                              <button
                                                                 onClick={() => {
                                                                    const nm = [...bidMaterials];
                                                                    nm[idx].quantity += 1;
                                                                    setBidMaterials(nm);
                                                                 }}
                                                                 className="px-2 py-1 text-[#474556] hover:text-white transition-colors"
                                                              >+</button>
                                                           </div>
                                                           <span className="text-xs font-bold text-white uppercase">{m.name}</span>
                                                        </div>
                                                        <div className="flex items-center gap-4">
                                                           <span className="text-xs font-black text-[#52ffac]">${(m.price * m.quantity).toFixed(2)}</span>
                                                           <button onClick={() => setBidMaterials(bidMaterials.filter((_, i) => i !== idx))} className="text-[#474556] hover:text-rose-500 transition-colors"><X className="w-4 h-4" /></button>
                                                        </div>
                                                     </div>
                                                  )) : (
                                                     <div className="py-6 text-center opacity-30">
                                                        <p className="text-[9px] font-black uppercase tracking-widest">Sin insumos en el ticket</p>
                                                     </div>
                                                  )}
                                               </div>
                                            </div>
                                         </div>
                                      </div>

                                      <button onClick={() => { setDraftingBidRequestId(req.id); handleSubmitBid(req.id); }} className="w-full py-5 bg-[#5d3cfe] text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.3em] shadow-2xl shadow-[#5d3cfe]/20 active:scale-95 transition-all flex items-center justify-center gap-4 group">
                                         ENVIAR PROPUESTA TÉCNICA ➔
                                      </button>
                                   </div>
                                )}
                                {req.status === 'accepted' && (
                                   <button onClick={() => updateDoc(doc(db,"requests",req.id), {status:'executing', visitStartedAt: new Date().toISOString()})} className="w-full py-5 bg-[#5d3cfe] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl">
                                      {req.serviceType === 'remote' ? <><Video className="w-4 h-4 inline mr-2 mb-1" /> Iniciar Sesión Remota</> : <><MapPin className="w-4 h-4 inline mr-2 mb-1" /> Iniciar Visita Física</>}
                                   </button>
                                )}
                                {req.status === 'executing' && (
                                   <div className="space-y-6">
                                      {/* Lista de Materiales Cargados para el Técnico */}
                                      {req.materials && req.materials.length > 0 && (
                                         <div className="bg-[#0d0e12] p-5 rounded-3xl border border-white/5 space-y-4">
                                            <p className="text-[10px] font-black text-[#474556] uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                                               <Package className="w-4 h-4 text-[#5d3cfe]" /> Materiales Cargados
                                            </p>
                                            <div className="grid grid-cols-1 gap-2">
                                               {req.materials.map((m: any, idx: number) => (
                                                  <div key={idx} className="flex justify-between items-center bg-[#1c1d21] p-4 rounded-2xl border border-white/5 group">
                                                     <div className="flex items-center gap-4">
                                                        <div className="w-8 h-8 rounded-lg bg-[#5d3cfe]/10 flex items-center justify-center text-[#c7bfff] font-black text-[10px]">x{m.quantity}</div>
                                                        <div>
                                                           <p className="text-xs font-bold text-white uppercase">{m.name}</p>
                                                           <p className="text-[8px] text-[#474556] font-black uppercase">${m.price} c/u</p>
                                                        </div>
                                                     </div>
                                                     <button onClick={() => handleDeleteMaterial(req.id, idx)} className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all">
                                                        <Trash2 className="w-4 h-4" />
                                                     </button>
                                                  </div>
                                               ))}
                                            </div>
                                         </div>
                                      )}

                                      {/* Checklist de Progreso para el Técnico */}
                                      <div className="bg-[#0d0e12] p-5 rounded-3xl border border-white/5 space-y-4">
                                         <div className="flex justify-between items-center">
                                            <p className="text-[10px] font-black text-[#474556] uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                                               <CheckCircle2 className="w-4 h-4 text-[#5d3cfe]" /> Bitácora de ejecución
                                            </p>
                                            <button
                                               onClick={() => handleContinueTomorrow(req.id)}
                                               className="px-4 py-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-lg text-[8px] font-black uppercase hover:bg-amber-500 hover:text-black transition-all"
                                            >
                                               Pausar y Continuar Mañana
                                            </button>
                                         </div>
                                         <div className="grid grid-cols-1 gap-2">
                                            {req.checklist?.map(task => (
                                               <button
                                                  key={task.id}
                                                  onClick={() => handleToggleTask(req.id, task.id)}
                                                  className={`flex items-center gap-4 p-4 rounded-2xl border transition-all text-left ${task.isCompleted ? 'bg-[#52ffac]/5 border-[#52ffac]/20' : 'bg-[#1c1d21] border-white/5 hover:border-[#5d3cfe]/30'}`}
                                               >
                                                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all ${task.isCompleted ? 'bg-[#52ffac] shadow-[0_0_15px_#52ffac]' : 'border-2 border-[#474556]'}`}>
                                                     {task.isCompleted && <Check className="w-4 h-4 text-[#0d0e12] stroke-[3]" />}
                                                  </div>
                                                  <span className={`text-xs font-bold ${task.isCompleted ? 'text-[#52ffac]' : 'text-[#c8c4d9]'}`}>{task.description}</span>
                                               </button>
                                            ))}
                                         </div>
                                      </div>

                                      <div className="flex gap-3">
                                         <button onClick={() => { setActiveRequestForMaterial(req); setIsMaterialModalOpen(true); }} className="flex-1 py-4 bg-[#1c1d21] border border-[#2a2b2f] text-white rounded-xl text-[10px] font-black uppercase transition-all hover:border-[#5d3cfe]"><Package className="w-4 h-4 mx-auto mb-1" /> Cargar Material</button>
                                         <button onClick={() => { setActiveRequestForUnforeseen(req); setIsUnforeseenModalOpen(true); }} className="flex-1 py-4 bg-amber-500/10 border border-amber-500/30 text-amber-500 rounded-xl text-[10px] font-black uppercase transition-all hover:bg-amber-500 hover:text-black"><AlertTriangle className="w-4 h-4 mx-auto mb-1" /> Imprevisto</button>
                                      </div>
                                      <button onClick={() => { setActiveRequestForSignature(req.id); setIsSignatureModalOpen(true); }} className="w-full py-5 bg-[#52ffac] text-black rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20 active:scale-95 transition-all">Finalizar Servicio</button>
                                   </div>
                                )}
                              </div>
                            ))}
                          </div>
                       </div>
                    )}
                    {techTab === 'agenda' && <div className="bg-[#121317] border border-[#2a2b2f] p-10 rounded-[3rem] shadow-2xl space-y-8"><header><h1 className="text-4xl font-black text-white uppercase tracking-tighter">Agenda <span className="text-[#5d3cfe]">Logística</span></h1></header><div className="grid grid-cols-1 gap-4">{agenda.map(e => (<div key={e.id} className="p-6 bg-[#1c1d21] border border-[#2a2b2f] rounded-3xl flex justify-between items-center group hover:border-[#5d3cfe]/30 transition-all"><div className="flex gap-6 items-center"><div className="p-4 bg-[#0d0e12] rounded-2xl text-center min-w-[100px] border border-[#2a2b2f]"><span className="text-xs font-black text-[#5d3cfe]">{e.date}</span><p className="text-[10px] font-bold text-white mt-1">{e.time}</p></div><div><h4 className="text-lg font-black text-white uppercase tracking-tight">{e.title}</h4><p className="text-[10px] font-bold text-[#c8c4d9] mt-1 italic opacity-60">Cliente: {e.clientName}</p></div></div><button onClick={() => { const nd = prompt("Nueva Fecha:", e.date); if(nd) handleReschedule(e.requestId || '', nd, e.time, "Motivo logístico"); }} className="px-6 py-2 bg-[#0d0e12] border border-[#2a2b2f] text-white rounded-xl text-[9px] font-black uppercase hover:bg-[#5d3cfe]">Mover</button></div>))}</div></div>}
                    {techTab === 'wallet' && (
                      <TechWalletModule
                        wallet={getSelectedTechProfileObj().wallet || { balance: 0, pendingBalance: 0, transactions: [] }}
                        techId={selectedTechProfileId!}
                        onWithdraw={handleRequestWithdrawal}
                        plan={getSelectedTechProfileObj().plan || 'basic'}
                      />
                    )}
                    {techTab === 'mantech_id' && <TechCredential tech={getSelectedTechProfileObj()} />}
                    {techTab === 'chat' && (
                       <div className="h-[calc(100vh-200px)]">
                          <SupportChatWidget
                             request={requests.find(r => r.id === activeChatRequestId) || null}
                             role="tech"
                             messages={chatMessages}
                             onSendMessage={(txt, img) => addDoc(collection(db,"messages"), { requestId: activeChatRequestId, sender: 'tech', text: txt, image: img || null, timestamp: serverTimestamp() })}
                             onStartVideoCall={(room, voice) => { setVideoCallRoom(room); setIsVideoVoiceOnly(voice); setIsVideoCallOpen(true); }}
                          />
                       </div>
                    )}
                    {techTab === 'profile' && (
                       <div className="max-w-2xl mx-auto space-y-10">
                          <header className="flex justify-between items-center">
                             <h1 className="text-4xl font-black text-white uppercase tracking-tighter">Mi <span className="text-[#5d3cfe]">Perfil</span></h1>
                             <button onClick={() => setIsEditingTechProfile(true)} className="px-6 py-3 bg-white/5 border border-white/10 text-white rounded-2xl text-[10px] font-black uppercase hover:bg-white/10 transition-all flex items-center gap-2">
                                <Pencil className="w-4 h-4" /> Editar Perfil Market
                             </button>
                          </header>
                          <div className="max-w-[300px] mx-auto scale-95 origin-top">
                             <TechCredential tech={getSelectedTechProfileObj()} />
                          </div>
                       </div>
                    )}
                    {techTab === 'subscriptions' && (
                      <SubscriptionModule
                        subscription={subscription}
                        onUpgrade={handleOpenSubscriptionPayment}
                        role="tech"
                      />
                    )}
                    {techTab === 'settings' && (
                       <div className="max-w-2xl mx-auto space-y-10 pb-20">
                          <header className="text-center space-y-2"><h2 className="text-3xl font-black text-white uppercase tracking-tight">Centro de Seguridad Técnico</h2><p className="text-[10px] font-black text-[#c8c4d9] uppercase tracking-[0.3em]">Validación Profesional MantechPro</p></header>
                          <MantechIDModule mantechId={getSelectedTechProfileObj().mantechId || { status: 'unverified', idNumber: '' }} onUpload={handleUploadDoc} role="tech" plan={getSelectedTechProfileObj().plan} />
                          <div className="bg-[#121317] border border-[#2a2b2f] p-8 rounded-[3rem] shadow-2xl"><button onClick={handleLogout} className="w-full py-5 border border-rose-500/20 text-rose-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all">Cerrar Sesión Segura</button></div>
                       </div>
                    )}
                 </div>
              )}

              {role === 'admin' && (
                <div className="space-y-12 animate-fade-in-up">
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

                        <div className="bg-[#121317] border border-[#2a2b2f] p-10 rounded-[3rem] shadow-2xl space-y-8">
                           <header><h1 className="text-2xl font-black text-white uppercase tracking-tighter">Suscripciones <span className="text-amber-500">Pendientes</span></h1></header>
                           <div className="grid grid-cols-1 gap-4">
                              {allUsers.filter(u => u.subscription?.status === 'pending_payment_verification').map(u => (
                                <div key={u.uid} className="p-6 bg-[#1c1d21] border border-amber-500/20 rounded-3xl flex justify-between items-center group animate-pulse hover:animate-none">
                                   <div className="flex gap-6 items-center">
                                      <div className="p-4 bg-amber-500/10 rounded-2xl text-amber-500 border border-amber-500/20 shadow-lg">
                                         <Star className="w-6 h-6" />
                                      </div>
                                      <div>
                                         <h4 className="text-sm font-black text-white uppercase tracking-tight">{u.name}</h4>
                                         <p className="text-[10px] font-bold text-[#c8c4d9] mt-1 uppercase opacity-60">Plan Solicitado: {u.subscription.requestedPlanId?.split('-')[1].toUpperCase()}</p>
                                      </div>
                                   </div>
                                   <button
                                     onClick={() => handleApproveSubscription(u.uid, u.subscription.requestedPlanId)}
                                     className="px-8 py-3 bg-amber-500 text-black rounded-xl text-[9px] font-black uppercase tracking-widest shadow-xl shadow-amber-500/20 hover:scale-105 transition-all"
                                   >
                                     Aprobar Membresía
                                   </button>
                                </div>
                              ))}
                              {allUsers.filter(u => u.subscription?.status === 'pending_payment_verification').length === 0 && (
                                <p className="text-[10px] text-[#474556] font-bold uppercase italic ml-4">No hay membresías por verificar.</p>
                              )}
                           </div>
                        </div>
                     </div>
                   )}
                   {adminTab === 'logistics' && (
                     <div className="bg-[#121317] border border-[#2a2b2f] p-10 rounded-[3rem] shadow-2xl space-y-12">
                       <header><h1 className="text-4xl font-black text-white uppercase tracking-tighter">Logística <span className="text-[#5d3cfe]">Central</span></h1></header>

                       <section className="space-y-6">
                          <h3 className="text-sm font-black text-[#5d3cfe] uppercase tracking-widest">Pagos por Verificar (YAPPY)</h3>
                          <div className="grid grid-cols-1 gap-4">
                             {requests.filter(r => r.status === 'pending_verification').map(r => (
                               <div key={r.id} className="p-6 bg-[#1c1d21] border border-amber-500/20 rounded-3xl flex justify-between items-center group animate-pulse hover:animate-none transition-all">
                                  <div className="flex gap-6 items-center">
                                     <div className="p-4 bg-amber-500/10 rounded-2xl text-amber-500 border border-amber-500/20 shadow-lg shadow-amber-500/10">
                                        <DollarSign className="w-6 h-6" />
                                     </div>
                                     <div>
                                        <h4 className="text-sm font-black text-white uppercase tracking-tight">{r.clientName}</h4>
                                        <p className="text-[10px] font-bold text-[#c8c4d9] mt-1 italic opacity-60">Monto: ${r.price} • Servicio: {r.assetName}</p>
                                     </div>
                                  </div>
                                  <button onClick={() => handleConfirmPayment(r.id)} className="px-8 py-3 bg-amber-500 text-black rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-amber-500/20 hover:scale-105 transition-all">Verificar Pago</button>
                               </div>
                             ))}
                             {requests.filter(r => r.status === 'pending_verification').length === 0 && <p className="text-[10px] text-[#474556] font-bold uppercase italic ml-4">No hay pagos pendientes de revisión.</p>}
                          </div>
                       </section>

                       <section className="space-y-6">
                          <h3 className="text-sm font-black text-[#474556] uppercase tracking-widest">Servicios en Ejecución</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             {requests.filter(r => r.status === 'accepted' || r.status === 'executing').map(r => (
                               <div key={r.id} className="p-6 bg-[#1c1d21] border border-[#2a2b2f] rounded-3xl flex justify-between items-center hover:border-[#5d3cfe]/30 transition-all">
                                  <div className="flex gap-4 items-center">
                                     <div className="p-3 rounded-2xl bg-[#5d3cfe]/10 text-[#c7bfff]"><Truck className="w-6 h-6" /></div>
                                     <div><h4 className="text-sm font-black text-white uppercase tracking-tight">{r.assetName}</h4><p className="text-[10px] font-bold text-[#474556] uppercase mt-1">Técnico: {r.techName}</p></div>
                                  </div>
                                  {r.rescheduleCount && <span className="px-3 py-1 bg-rose-500/10 text-rose-500 rounded-full text-[8px] font-black animate-pulse">âš ï¸ {r.rescheduleCount} MOVIDAS</span>}
                               </div>
                             ))}
                          </div>
                       </section>
                     </div>
                   )}
                   {adminTab === 'users' && (
                      <div className="bg-[#121317] border border-[#2a2b2f] p-10 rounded-[3rem] shadow-2xl space-y-8">
                        <header><h1 className="text-4xl font-black text-white uppercase tracking-tighter">Maestro de <span className="text-[#5d3cfe]">Usuarios</span></h1></header>
                        <table className="w-full text-left text-xs">
                          <thead><tr className="border-b border-[#2a2b2f] text-[#474556] uppercase font-black"><th className="py-4">Nombre</th><th className="py-4">Documentación</th><th className="py-4 text-right">Aprobación</th></tr></thead>
                          <tbody className="divide-y divide-[#1c1d21]">
                            {technicians.map(t => (
                              <tr key={t.id} className="group">
                                <td className="py-6 font-black text-white uppercase">{t.name}</td>
                                <td className="py-6">
                                   <div className="flex gap-3">
                                      {t.policeRecordUrl && <a href={t.policeRecordUrl} target="_blank" rel="noreferrer" className="px-3 py-1 bg-[#1c1d21] text-indigo-400 rounded-lg text-[9px] font-black uppercase border border-indigo-400/20">Récord</a>}
                                      {t.idCardUrl && <a href={t.idCardUrl} target="_blank" rel="noreferrer" className="px-3 py-1 bg-[#1c1d21] text-[#52ffac] rounded-lg text-[9px] font-black uppercase border border-[#52ffac]/20">ID</a>}
                                   </div>
                                </td>
                                <td className="py-6 text-right">
                                   <button onClick={() => handleVerifyTechnician(t.id, !t.isVerified)} className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase transition-all ${t.isVerified ? 'bg-rose-500 text-white' : 'bg-[#52ffac] text-black shadow-lg shadow-[#52ffac]/20'}`}>{t.isVerified ? 'Suspender' : 'Aprobar'}</button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                   )}
                   {adminTab === 'inventory' && <InventoryModule items={inventory} assets={assets} onUpdateQuantity={handleUpdateInventoryQuantity} onAddItem={handleAddInventoryItem} onDeleteItem={handleDeleteInventoryItem} onUpdateItem={handleUpdateInventoryItem} />}
                   {adminTab === 'alerts' && <div className="bg-[#121317] border border-[#2a2b2f] p-10 rounded-[3rem] shadow-2xl space-y-8"><header><h1 className="text-4xl font-black text-white uppercase tracking-tighter">Alertas de <span className="text-rose-500">Mantenimiento</span></h1></header><div className="space-y-4">{allReminders.map(r => (<div key={r.id} className="p-6 bg-rose-500/5 border border-rose-500/20 rounded-3xl flex justify-between items-center"><div><h4 className="text-sm font-black text-white uppercase">{r.title}</h4><p className="text-[10px] font-bold text-rose-500 uppercase">{r.assetName} - Vence: {r.dueDate}</p></div><BellRing className="w-5 h-5 text-rose-500 animate-bounce" /></div>))}</div></div>}
                   {adminTab === 'settings' && <div className="bg-[#121317] border border-[#2a2b2f] p-10 rounded-[3rem] shadow-2xl"><header><h1 className="text-4xl font-black text-white tracking-tighter">Ajustes <span className="text-[#5d3cfe]">Sistema</span></h1></header><div className="mt-10"><button onClick={handleLogout} className="px-10 py-5 bg-rose-600/10 border border-rose-600/20 text-rose-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all">Cerrar Sesión Root</button></div></div>}
                </div>
              )}
           </div>
        </main>
      </div>

      {isUnforeseenModalOpen && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="w-full max-w-lg bg-[#121317] border border-[#2a2b2f] rounded-[3rem] p-10 space-y-8 shadow-2xl animate-fade-in-up">
            <div className="text-center space-y-2"><h3 className="text-2xl font-black text-amber-500 uppercase italic">Reportar <span className="text-white">Gasto Extra</span></h3><p className="text-[10px] text-[#c8c4d9] font-bold uppercase tracking-widest opacity-60">Solicitar aprobación de imprevisto.</p></div>
            <div className="space-y-4">
              <div className="space-y-2"><label className="text-[10px] font-black text-[#474556] uppercase ml-1">Motivo Técnico</label><input type="text" value={unforeseenInputs.reason} onChange={e => setUnforeseenInputs({...unforeseenInputs, reason: e.target.value})} className="w-full bg-[#0d0e12] border border-[#2a2b2f] rounded-2xl py-4 px-5 text-white text-sm" /></div>
              <div className="space-y-2"><label className="text-[10px] font-black text-[#474556] uppercase ml-1">Costo Adicional</label><input type="number" value={unforeseenInputs.amount} onChange={e => setUnforeseenInputs({...unforeseenInputs, amount: e.target.value})} className="w-full bg-[#0d0e12] border border-[#2a2b2f] rounded-2xl py-4 px-5 text-white font-black text-xl" /></div>
            </div>
            <div className="flex gap-4"><button onClick={() => setIsUnforeseenModalOpen(false)} className="flex-1 py-4 bg-[#1c1d21] text-[#c8c4d9] rounded-xl text-[10px] font-black uppercase">Cancelar</button><button onClick={() => handleTriggerUnforeseen(activeRequestForUnforeseen.id, unforeseenInputs.reason, Number(unforeseenInputs.amount), unforeseenInputs.category)} className="flex-1 py-4 bg-amber-500 text-black rounded-xl text-[10px] font-black uppercase shadow-lg shadow-amber-500/20">Enviar</button></div>
          </div>
        </div>
      )}

      {isMaterialModalOpen && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="w-full max-w-lg bg-[#121317] border border-[#2a2b2f] rounded-[3rem] p-10 space-y-8 shadow-2xl">
            <div className="text-center space-y-2"><h3 className="text-2xl font-black text-white uppercase">Cargar <span className="text-[#5d3cfe]">Material</span></h3><p className="text-[10px] text-[#c8c4d9] font-bold uppercase tracking-widest opacity-60">Gestión de insumos y repuestos.</p></div>
            <div className="space-y-4">
              <div className="space-y-2"><label className="text-[10px] font-black text-[#474556] uppercase ml-1">Nombre</label><input type="text" value={materialInputs.name} onChange={e => setMaterialInputs({...materialInputs, name: e.target.value})} className="w-full bg-[#0d0e12] border border-[#2a2b2f] rounded-2xl py-4 px-5 text-white text-sm" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><label className="text-[10px] font-black text-[#474556] uppercase ml-1">Precio</label><input type="number" value={materialInputs.price} onChange={e => setMaterialInputs({...materialInputs, price: e.target.value})} className="w-full bg-[#0d0e12] border border-[#2a2b2f] rounded-2xl py-4 px-5 text-white font-black" /></div>
                <div className="space-y-2"><label className="text-[10px] font-black text-[#474556] uppercase ml-1">Cant.</label><input type="number" value={materialInputs.quantity} onChange={e => setMaterialInputs({...materialInputs, quantity: e.target.value})} className="w-full bg-[#0d0e12] border border-[#2a2b2f] rounded-2xl py-4 px-5 text-white font-black" /></div>
              </div>
            </div>
            <div className="flex gap-4"><button onClick={() => setIsMaterialModalOpen(false)} className="flex-1 py-4 bg-[#1c1d21] text-[#c8c4d9] rounded-xl text-[10px] font-black uppercase">Cancelar</button><button onClick={() => { handleSaveMaterial(activeRequestForMaterial.id, materialInputs.name, Number(materialInputs.price), Number(materialInputs.quantity), materialInputs.category); setIsMaterialModalOpen(false); }} className="flex-1 py-4 bg-[#5d3cfe] text-white rounded-xl text-[10px] font-black uppercase shadow-lg">Cargar</button></div>
          </div>
        </div>
      )}

      {isSignatureModalOpen && (
        <div className="fixed inset-0 z-[500] bg-black/80 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#121317] border border-[#2a2b2f] p-10 rounded-[3rem] space-y-10 shadow-2xl">
             <div className="text-center space-y-2"><h3 className="text-2xl font-black text-white uppercase tracking-tight">Cierre de <span className="text-[#5d3cfe]">Garantía</span></h3><p className="text-[10px] text-[#c8c4d9] font-bold uppercase tracking-widest opacity-60">Firme y califique para liberar el pago.</p></div>
             <div className="flex justify-center gap-3 py-4 border-y border-[#2a2b2f]/50">{[1,2,3,4,5].map(s => <button key={s} onClick={() => setRatingVal(s)} className="transform hover:scale-110"><Star className={`w-10 h-10 ${ratingVal >= s ? 'fill-amber-500 text-amber-500 shadow-[0_0_20px_#f59e0b40]' : 'text-[#2a2b2f]'}`} /></button>)}</div>
             <SignaturePad onSave={sig => handleCompleteJob(activeRequestForSignature || '', sig)} onCancel={() => { setIsSignatureModalOpen(false); setActiveRequestForSignature(null); }} />
          </div>
        </div>
      )}

      {isAssetModalOpen && <AssetRegisterModal isOpen={isAssetModalOpen} onClose={() => setIsAssetModalOpen(false)} onAdd={handleAddAsset} assetToEdit={assetToEdit} maxAssets={planLimits.maxAssets} currentAssetsCount={assets.length} />}
      {isTechModalOpen && activeTechForModal && <TechnicianProfileModal tech={activeTechForModal} isOpen={isTechModalOpen} onClose={() => setIsTechModalOpen(false)} assets={assets} onRequestQuote={handleRequestQuote} />}
      {isEditingTechProfile && <TechnicianEditProfileModal isOpen={isEditingTechProfile} onClose={() => setIsEditingTechProfile(false)} profile={getSelectedTechProfileObj()} onSave={handleUpdateTechProfile} />}
      {selectedRequestForReport && <ServiceReportModal isOpen={isReportModalOpen} onClose={() => { setIsReportModalOpen(false); setSelectedRequestForReport(null); }} request={selectedRequestForReport} />}
      {isCredentialModalOpen && (
        <div className="fixed inset-0 z-[600] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="w-full max-w-[300px] animate-scale-in">
            <div className="flex justify-end mb-4">
              <button onClick={() => setIsCredentialModalOpen(false)} className="p-3 bg-white/5 border border-white/10 text-white rounded-2xl hover:bg-white/10 transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>
            <TechCredential tech={getSelectedTechProfileObj()} />
          </div>
        </div>
      )}
      <VideoCallModal isOpen={isVideoCallOpen} onClose={() => setIsVideoCallOpen(false)} roomName={videoCallRoom} userName={loggedInName} isVoiceOnly={isVideoVoiceOnly} />
      <QRScannerModal isOpen={isScannerOpen} onClose={() => setIsScannerOpen(false)} onScanSuccess={(id) => { const tech = technicians.find(t => t.id === id); if (tech) toast(`✅ Especialista Validado: ${tech.name}`); }} technicians={technicians} />
      <SupportModal isOpen={isSupportModalOpen} onClose={() => setIsSupportModalOpen(false)} userEmail={loggedInEmail} userName={loggedInName} userId={user?.uid} userRole={role} plan={subscription.planId} />

      {isSubPaymentModalOpen && selectedPlanForPayment && (
        <div className="fixed inset-0 z-[700] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="w-full max-w-lg bg-[#121317] border border-[#2a2b2f] rounded-[3rem] p-10 space-y-8 shadow-2xl animate-fade-in-up max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="text-center space-y-2">
               <h3 className="text-2xl font-black text-white uppercase italic">Mejorar a <span className="text-[#5d3cfe]">{selectedPlanForPayment.name}</span></h3>
               <p className="text-[10px] text-[#c8c4d9] font-black uppercase tracking-widest opacity-60">Inversión mensual: ${selectedPlanForPayment.price}.00 USD</p>
            </div>

            <div className="space-y-4">
               <PayPalButtons
                 style={{ layout: "vertical", shape: "pill", color: "blue", height: 50 }}
                 createOrder={async () => {
                   try {
                     const response = await fetch("/api/orders", {
                       method: "POST",
                       headers: { "Content-Type": "application/json" },
                       body: JSON.stringify({ price: selectedPlanForPayment.price, itemName: `Plan ${selectedPlanForPayment.name}` })
                     });
                     if (!response.ok) {
                       const errorData = await response.json().catch(() => ({}));
                       throw new Error(errorData.error || "Error al crear la orden de pago");
                     }
                     const order = await response.json();
                     return order.id;
                   } catch (err: any) {
                     console.error("âŒ Error en createOrder:", err);
                     toast.error(`Error al procesar el pago: ${err.message}`);
                     throw err;
                   }
                 }}
                 onApprove={async (data) => {
                   try {
                     const response = await fetch(`/api/orders/${data.orderID}/capture`, { method: "POST" });
                     const result = await response.json();

                     if (!response.ok) {
                       const errorDetail = result.details?.[0];
                       if (errorDetail?.issue === "INSTRUMENT_DECLINED") {
                         throw new Error("La tarjeta fue rechazada. Por favor intenta con otro método en tu cuenta PayPal.");
                       }
                       throw new Error(result.message || "Error al procesar la captura del pago.");
                     }

                     if (result.status === "COMPLETED") {
                       handleConfirmSubscriptionUpgrade(selectedPlanForPayment.id, true);
                     } else {
                       toast.error("El pago no se pudo completar. Por favor verifica tu cuenta.");
                     }
                   } catch (err: any) {
                     console.error("❌ Error en onApprove:", err);
                     toast.error(`Pago fallido: ${err.message}`);
                   }
                 }}
               />
               <div className="flex items-center gap-4">
                  <div className="h-px bg-[#2a2b2f] flex-1"></div>
                  <span className="text-[8px] font-black text-[#474556] uppercase tracking-widest">Otras opciones</span>
                  <div className="h-px bg-[#2a2b2f] flex-1"></div>
               </div>

               {/* BYPASS DE INGENIERÍA PARA PRUEBAS RÁPIDAS */}
               <button
                 onClick={() => handleConfirmSubscriptionUpgrade(selectedPlanForPayment.id, true)}
                 className="w-full py-3 bg-rose-600/10 border border-rose-600/20 text-rose-500 rounded-xl text-[8px] font-black uppercase tracking-[0.2em] hover:bg-rose-600 hover:text-white transition-all mb-2"
               >
                 ⚠️ Simular Pago Exitoso (Bypass Dev)
               </button>

               <button
                 onClick={() => handleConfirmSubscriptionUpgrade(selectedPlanForPayment.id, false)}
                 className="w-full py-5 border border-[#2a2b2f] text-[#c8c4d9] rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white/5 transition-all flex items-center justify-center gap-3"
               >
                 <Download className="w-4 h-4" /> Pago vía Yappy (Manual)
               </button>
            </div>

            <button
              onClick={() => setIsSubPaymentModalOpen(false)}
              className="w-full py-4 text-[#474556] hover:text-white text-[10px] font-black uppercase tracking-widest transition-all"
            >
              Cancelar Proceso
            </button>
          </div>
        </div>
      )}

      <Chatbot247 />
    </div>
    </PayPalScriptProvider>
  );
}

function formatFriendlyDate(d: string) { if (!d) return '---'; return new Date(d).toLocaleDateString('es-PA', { day: '2-digit', month: 'short' }).toUpperCase(); }

function formatTime12h(dateStr?: string) {
  if (!dateStr) return '---';
  try {
    // Si recibimos un string tipo "HH:MM", lo convertimos a 12h
    if (dateStr.includes(':') && !dateStr.includes('T')) {
      const [h, m] = dateStr.split(':');
      const hh = parseInt(h);
      const suffix = hh >= 12 ? 'PM' : 'AM';
      const h12 = hh % 12 || 12;
      return `${h12}:${m} ${suffix}`;
    }
    // Si es un ISO date string
    return new Date(dateStr).toLocaleTimeString('es-PA', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch (e) { return '---'; }
}


