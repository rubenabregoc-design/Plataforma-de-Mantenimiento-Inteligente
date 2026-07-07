import React, { useState, useEffect, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
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

import { 
  LayoutDashboard, Store, FileCheck2, Bot, MessageSquare, CalendarDays, Users, DollarSign,
  Bell, BellRing, Send, CheckCircle, Plus, TrendingUp, Truck, Camera,
  Layers, ShieldCheck, Star, CheckCircle2,
  UserX, Clock, LogOut, User, ChevronRight,
  ShieldAlert, HelpCircle, Wrench, Search, Check, X,
  Calendar, AlertTriangle, Pencil, Trash2, FileText, Settings, Eye, EyeOff, Sparkles, Inbox, Car, Wind, Package, Globe, PieChart, Building2, Activity, CreditCard, ExternalLink
} from 'lucide-react';

// Firebase
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
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
  const [subscription, setSubscription] = useState<UserSubscription>({
    planId: 'plan-basic',
    status: 'active',
    startDate: new Date().toISOString(),
    nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  });

  // UI State
  const [adminTab, setAdminTab] = useState<'finance' | 'users' | 'logistics' | 'alerts' | 'inventory' | 'settings'>('finance');
  const [clientTab, setClientTab] = useState<'dashboard' | 'fleet' | 'ai' | 'marketplace' | 'quotes' | 'inventory' | 'subscriptions' | 'chat' | 'settings'>('dashboard');
  const [techTab, setTechTab] = useState<'received' | 'agenda' | 'wallet' | 'mantech_id' | 'chat' | 'profile' | 'settings'>('received');

  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [assetToEdit, setAssetToEdit] = useState<Asset | null>(null);
  const [isTechModalOpen, setIsTechModalOpen] = useState(false);
  const [activeTechForModal, setActiveTechForModal] = useState<TechProfile | null>(null);
  const [activeChatRequestId, setActiveChatRequestId] = useState<string | null>(null);
  const [isEditingTechProfile, setIsEditingTechProfile] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [selectedRequestForReport, setSelectedRequestForReport] = useState<JobRequest | null>(null);
  const [showAuthForm, setShowAuthForm] = useState(false);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

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

  // Bidding
  const [bidPrice, setBidPrice] = useState<string>('');
  const [bidDate, setBidDate] = useState<string>('');
  const [bidTime, setBidTime] = useState<string>('');
  const [bidDuration, setBidDuration] = useState<number>(1);
  const [bidTravelTime, setBidTravelTime] = useState<number>(30);
  const [draftingBidRequestId, setDraftingBidRequestId] = useState<string | null>(null);

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
        const userRef = doc(db, "users", firebaseUser.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          if (firebaseUser.email === 'admin@mantech.com') setRole('admin');
          else setRole(data.role || 'client');
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
      } else {
        setIsLoggedIn(false);
        setUser(null);
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
  }, [isLoggedIn, user, role]);

  useEffect(() => {
    if (!isLoggedIn || !activeChatRequestId) return;
    const q = query(collection(db, "messages"), where("requestId", "==", activeChatRequestId));
    return onSnapshot(q, (snap) => {
      const msgs = snap.docs.map(d => ({ id: d.id, ...d.data(), timestamp: d.data().timestamp?.toDate ? d.data().timestamp.toDate().toISOString() : new Date().toISOString() })) as ChatMessage[];
      setChatMessages(msgs.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()));
    });
  }, [isLoggedIn, activeChatRequestId]);

  // Handlers V4 MASTER
  const handleLogin = async (e: any) => {
    if (e) e.preventDefault();
    try {
      if (authMode === 'register') {
        const res = await createUserWithEmailAndPassword(auth, loginEmail, loginPassword);
        const u = res.user;
        const tId = authRole === 'tech' ? `tech-${Date.now()}` : null;
        await setDoc(doc(db, "users", u.uid), { uid: u.uid, email: loginEmail, name: loginName, role: authRole, techId: tId, createdAt: serverTimestamp() });
        if (authRole === 'tech' && tId) await setDoc(doc(db, "technicians", tId), { id: tId, name: loginName, category: 'mecanico', rating: 5.0, reviewCount: 0, completedJobs: 0, experienceYears: 5, location: 'Panamá', hourlyRate: 25, bio: 'Técnico certificado.', plan: 'basic', userId: u.uid });
      } else await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
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
      alert("¡Solicitud enviada!");
      setClientTab('quotes');
    } catch (err) { console.error(err); }
  };

  const handleSubmitBid = async (requestId: string) => {
    if (!bidPrice || !bidDate || !bidTime) return alert("Complete precio, fecha y hora");
    const conflict = agenda.some(e => e.date === bidDate && e.time === bidTime);
    if (conflict && !window.confirm("⚠️ Conflicto detectado en agenda. ¿Deseas enviar de todos modos?")) return;
    try {
      await updateDoc(doc(db, "requests", requestId), {
        price: Number(bidPrice), commission: Number(bidPrice) * 0.15,
        technicianEarnings: Number(bidPrice) * 0.85,
        scheduledDate: bidDate, scheduledTime: bidTime, scheduledDuration: bidDuration, scheduledTravelTime: bidTravelTime,
        status: 'quoted', techUserId: user.uid
      });
      alert("Cotización enviada.");
      setDraftingBidRequestId(null);
    } catch (err) { console.error(err); }
  };

  const handleAcceptQuote = async (requestId: string, method: string) => {
    const req = requests.find(r => r.id === requestId);
    if (!req?.scheduledDate) return;
    const diff = (new Date(req.scheduledDate).getTime() - Date.now()) / (1000 * 60 * 60);
    if (diff < 24) return alert("⚠️ Plazo Vencido (24h). El servicio no está garantizado.");
    try {
      await updateDoc(doc(db, "requests", requestId), { status: 'accepted', paidAt: serverTimestamp(), paymentMethod: method });
      await addDoc(collection(db, "agenda"), {
        requestId, techId: req.techId, techUserId: req.techUserId,
        clientName: req.clientName, clientId: user.uid,
        title: `CONFIRMADO: ${req.assetName}`, date: req.scheduledDate, time: req.scheduledTime,
        duration: `${req.scheduledDuration}h`, travelTime: `${req.scheduledTravelTime} min`,
        status: 'pending', createdAt: serverTimestamp()
      });
      await addDoc(collection(db, "messages"), { requestId, sender: 'tech', text: `¡Hola! He recibido tu confirmación y pago vía ${method.toUpperCase()}. Cita confirmada oficialmente.`, timestamp: serverTimestamp() });
      alert("¡Cita confirmada!");
      setClientTab('chat');
    } catch (err) { console.error(err); }
  };

  const handleTriggerUnforeseen = async (requestId: string, reason: string, extraCost: number, category: string) => {
    try {
      await updateDoc(doc(db, "requests", requestId), { status: 'disputed', unforeseenReason: reason, unforeseenAmount: extraCost, unforeseenCategory: category, unforeseenAt: serverTimestamp() });
      await addDoc(collection(db, "messages"), { requestId, sender: 'tech', text: `⚠️ REPORTE DE IMPREVISTO [${category.toUpperCase()}]: ${reason}. Costo: $${extraCost}. Favor aprobar en panel para no comprometer la garantía.`, timestamp: serverTimestamp() });
      setIsUnforeseenModalOpen(false);
      alert("Imprevisto reportado.");
    } catch (err) { console.error(err); }
  };

  const handleApproveUnforeseen = async (requestId: string) => {
    const req = requests.find(r => r.id === requestId);
    if (!req || !req.unforeseenAmount) return;
    try {
      const newPrice = (req.price || 0) + req.unforeseenAmount;
      await updateDoc(doc(db, "requests", requestId), { status: 'executing', price: newPrice, commission: newPrice * 0.15, technicianEarnings: newPrice * 0.85, unforeseenAmount: 0, unforeseenPaidAt: serverTimestamp() });
      await addDoc(collection(db, "messages"), { requestId, sender: 'client', text: `✅ IMPREVISTO PAGADO: $${req.unforeseenAmount}. Puede continuar.`, timestamp: serverTimestamp() });
      alert("Aprobado.");
    } catch (err) { console.error(err); }
  };

  const handleRejectUnforeseen = async (requestId: string) => {
    if (!window.confirm("⚠️ ATENCIÓN: Al continuar sin pagar el imprevisto, la GARANTÍA TOTAL del servicio quedará ANULADA. ¿Deseas proceder bajo tu responsabilidad?")) return;
    try {
      await updateDoc(doc(db, "requests", requestId), {
        status: 'executing',
        guaranteeStatus: 'voided',
        unforeseenAmount: 0
      });
      await addDoc(collection(db, "messages"), {
        requestId,
        sender: 'client',
        text: "❌ IMPREVISTO RECHAZADO: El cliente decide continuar sin realizar la reparación sugerida. LA GARANTÍA QUEDA ANULADA.",
        timestamp: serverTimestamp()
      });
    } catch (e) { console.error(e); }
  };

  const handleCompleteJob = async (requestId: string, signature: string) => {
    try {
      await updateDoc(doc(db, "requests", requestId), { status: 'completed', visitFinishedAt: new Date().toISOString(), clientSignature: signature, rating: ratingVal, comment: ratingComment });
      const req = requests.find(r => r.id === requestId);
      if (req) {
         const tech = technicians.find(t => t.id === req.techId);
         if (tech) {
            const finalR = Math.max(1, ratingVal - ((req.rescheduleCount || 0) * 0.2));
            const nRating = ((tech.rating * tech.reviewCount) + finalR) / (tech.reviewCount + 1);
            await updateDoc(doc(db, "technicians", tech.id), { completedJobs: (tech.completedJobs || 0) + 1, reviewCount: tech.reviewCount + 1, rating: Number(nRating.toFixed(1)) });
         }
      }
      setIsSignatureModalOpen(false);
      alert("Completado.");
    } catch (err) { console.error(err); }
  };

  const handleReschedule = async (requestId: string, date: string, time: string, reason: string) => {
    const req = requests.find(r => r.id === requestId);
    if (!req) return;
    try {
      const history = [...(req.rescheduleHistory || []), { oldDate: req.scheduledDate, oldTime: req.scheduledTime, newDate: date, newTime: time, reason, timestamp: new Date().toISOString() }];
      await updateDoc(doc(db, "requests", requestId), { scheduledDate: date, scheduledTime: time, rescheduleCount: (req.rescheduleCount || 0) + 1, rescheduleHistory: history });
      const q = query(collection(db, "agenda"), where("requestId", "==", requestId));
      const snap = await getDocs(q);
      snap.forEach(d => updateDoc(doc(db, "agenda", d.id), { date, time, title: 'REPROGRAMADO' }));
      await addDoc(collection(db, "messages"), { requestId, sender: 'tech', text: `📢 REPROGRAMADA: ${date} @ ${time}. Motivo: ${reason}`, timestamp: serverTimestamp() });
      alert("Movida.");
    } catch (err) { console.error(err); }
  };

  const handleReportTechnicianFailure = async (requestId: string) => {
    if (!window.confirm("⚠️ ¿El técnico no concluyó? Solo recibirá el 5% de la inspección inicial. ¿Deseas reportar?")) return;
    await updateDoc(doc(db, "requests", requestId), { status: 'cancelled', cancellationReason: 'Incumplimiento del técnico / Penalidad 5%', penaltyApplied: true });
    alert("Reportado a auditoría.");
  };

  const handleCancelRequest = async (requestId: string) => {
     const req = requests.find(r => r.id === requestId);
     if(!req) return;
     if (req.status === 'executing') {
        if (!window.confirm("⚠️ EN EJECUCIÓN: Se liquidará el 50% por avance de obra. ¿Deseas proceder?")) return;
     } else {
        if (!window.confirm("¿Deseas cancelar?")) return;
     }
     await updateDoc(doc(db, "requests", requestId), { status: 'cancelled', cancelledAt: serverTimestamp() });
     alert("Cancelado.");
  };

  const handleSaveMaterial = async (requestId: string, name: string, price: number, quantity: number, category: string) => {
    const req = requests.find(r => r.id === requestId);
    if (!req) return;
    const newMaterials = [...(req.materials || []), { name, price, quantity, category, addedAt: new Date().toISOString() }];
    await updateDoc(doc(db, "requests", requestId), { materials: newMaterials });
    alert("Material registrado.");
  };

  const handleDeleteMaterial = async (requestId: string, index: number) => {
    const req = requests.find(r => r.id === requestId);
    if (!req || !req.materials) return;
    const newM = req.materials.filter((_, i) => i !== index);
    await updateDoc(doc(db, "requests", requestId), { materials: newM });
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
    const newQty = Math.max(0, item.quantity + delta);
    try {
      await updateDoc(doc(db, "inventory", id), { quantity: newQty });
    } catch (e) { console.error(e); }
  };

  const handleAddInventoryItem = async (item: any) => {
    try {
      await addDoc(collection(db, "inventory"), { ...item, createdAt: serverTimestamp() });
    } catch (e) { console.error(e); }
  };

  const handleDeleteInventoryItem = async (id: string) => {
    if (!window.confirm("¿Deseas eliminar este item del inventario?")) return;
    try {
      await deleteDoc(doc(db, "inventory", id));
    } catch (e) { console.error(e); }
  };

  const handleUpdateInventoryItem = async (item: InventoryItem) => {
    try {
      const { id, ...data } = item;
      await updateDoc(doc(db, "inventory", id), data);
    } catch (e) { console.error(e); }
  };

  const handleAddAsset = async (data: any) => {
    if (!user) return;
    if (assetToEdit) await updateDoc(doc(db, "assets", assetToEdit.id), data);
    else await addDoc(collection(db, "assets"), { ...data, clientId: user.uid, registeredAt: new Date().toISOString().split('T')[0] });
    setIsAssetModalOpen(false);
    setAssetToEdit(null);
  };

  const roleTranslation: Record<string, string> = { client: 'Cliente (Propietario)', tech: 'Técnico Especialista', admin: 'Administrador Maestro' };
  const getStatusLabel = (s: string) => {
    const map: any = { pending: 'SOLICITADO', quoted: 'COTIZADO', accepted: 'PAGADO', executing: 'EN PROCESO', completed: 'FINALIZADO', rated: 'CALIFICADO', rejected: 'DENEGADO', disputed: 'IMPREVISTO / DISPUTA', cancelled: 'CANCELADO' };
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
            <button
              onClick={() => setShowAuthForm(false)}
              className="absolute top-6 right-6 p-2 text-[#474556] hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="text-center space-y-2">
              <h1 className="text-4xl font-black text-white tracking-tighter italic">Mantech<span className="text-[#5d3cfe]">Pro</span></h1>
              <p className="text-[#c8c4d9] text-[10px] font-black uppercase tracking-[0.3em]">Inteligencia Operativa Panamá</p>
            </div>

            <div className="flex bg-[#1c1d21] p-1.5 rounded-2xl border border-[#2a2b2f]">
               <button onClick={() => setAuthMode('login')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${authMode === 'login' ? 'bg-[#5d3cfe] text-white shadow-lg shadow-[#5d3cfe]/20' : 'text-[#474556]'}`}>Ingresar</button>
               <button onClick={() => setAuthMode('register')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${authMode === 'register' ? 'bg-[#5d3cfe] text-white shadow-lg shadow-[#5d3cfe]/20' : 'text-[#474556]'}`}>Registrarse</button>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              {authMode === 'register' && <div className="space-y-2"><label className="text-[10px] font-black text-[#474556] uppercase tracking-widest ml-1">Nombre Completo</label><input type="text" value={loginName} onChange={e => setLoginName(e.target.value)} className="w-full bg-[#0d0e12] border border-[#2a2b2f] rounded-2xl py-4 px-5 text-white text-sm" required /></div>}
              <div className="space-y-2"><label className="text-[10px] font-black text-[#474556] uppercase tracking-widest ml-1">Correo Electrónico</label><input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} className="w-full bg-[#0d0e12] border border-[#2a2b2f] rounded-2xl py-4 px-5 text-white text-sm" required /></div>
              <div className="space-y-2"><label className="text-[10px] font-black text-[#474556] uppercase tracking-widest ml-1">Contraseña</label><input type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} className="w-full bg-[#0d0e12] border border-[#2a2b2f] rounded-2xl py-4 px-5 text-white text-sm" required /></div>
              {authMode === 'register' && <div className="space-y-2"><label className="text-[10px] font-black text-[#474556] uppercase tracking-widest ml-1">Tipo de Cuenta</label><select value={authRole} onChange={e => setAuthRole(e.target.value as any)} className="w-full bg-[#0d0e12] border border-[#2a2b2f] rounded-2xl py-4 px-5 text-white text-sm"><option value="client">Cliente</option><option value="tech">Técnico</option></select></div>}
              {authError && <p className="text-rose-500 text-[10px] font-black uppercase text-center">{authError}</p>}
              <button type="submit" className="w-full py-5 bg-[#5d3cfe] text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl active:scale-95 transition-all">{authMode === 'login' ? 'Identificación Segura ➔' : 'Crear Cuenta ➔'}</button>
            </form>
          </div>
        </div>
      )}

      {isDemoModalOpen && (
        <div className="fixed inset-0 z-[300] bg-[#0d0e12]/95 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="w-full max-w-5xl bg-[#121317] border border-white/5 rounded-[3rem] overflow-hidden shadow-2xl animate-fade-in-up">
            <header className="px-10 py-6 border-b border-white/5 flex justify-between items-center bg-[#1c1d21]/50">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-[#5d3cfe]/10 rounded-2xl text-[#c7bfff]">
                  <PlayCircle className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white uppercase tracking-tight italic">MantechPro <span className="text-[#5d3cfe]">Experience</span></h2>
                  <p className="text-[10px] font-bold text-[#52ffac] uppercase tracking-[0.3em]">Recorrido por el Sistema Operativo</p>
                </div>
              </div>
              <button onClick={() => setIsDemoModalOpen(false)} className="p-3 text-[#474556] hover:text-white transition-colors bg-white/5 rounded-2xl">
                <X className="w-7 h-7" />
              </button>
            </header>

            <div className="aspect-video bg-black relative group">
              {/* VIDEO PLACEHOLDER / EMBED */}
              <iframe
                className="w-full h-full"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=1"
                title="MantechPro Demo"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>

              <div className="absolute inset-0 bg-[#5d3cfe]/10 pointer-events-none group-hover:opacity-0 transition-opacity duration-700"></div>
            </div>

            <div className="p-10 grid grid-cols-1 md:grid-cols-3 gap-8 bg-[#0d0e12]">
               {[
                 { t: "Ecosistema B2B", d: "Gestión masiva de flotas e inmuebles con un solo mando central.", i: Globe },
                 { t: "Asistente Predictivo", d: "Diagnóstico por multimedia para reducir tiempos de espera.", i: Zap },
                 { t: "Blindaje de Pago", d: "Fondos protegidos en Escrow hasta la firma de conformidad.", i: ShieldCheck }
               ].map((feat, i) => (
                 <div key={i} className="space-y-3">
                    <div className="flex items-center gap-3">
                       <feat.i className="w-5 h-5 text-[#5d3cfe]" />
                       <h4 className="text-xs font-black text-white uppercase tracking-widest">{feat.t}</h4>
                    </div>
                    <p className="text-[11px] text-[#c8c4d9] font-medium leading-relaxed opacity-60">{feat.d}</p>
                 </div>
               ))}
            </div>

            <footer className="px-10 py-6 bg-[#1c1d21]/50 border-t border-white/5 flex justify-center">
               <button
                 onClick={() => { setIsDemoModalOpen(false); setShowAuthForm(true); }}
                 className="px-12 py-4 bg-[#5d3cfe] text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl hover:scale-105 transition-all"
               >
                 Comenzar Experiencia Real ➔
               </button>
            </footer>
          </div>
        </div>
      )}
    </>
  );

  return (
    <div className="min-h-screen bg-[#0d0e12] flex flex-col font-sans text-[#e3e2e8] overflow-hidden grid-bg">
      <div className="hidden lg:flex flex-col h-screen no-print">
        <nav className="h-20 bg-[#0d0e12]/80 backdrop-blur-md border-b border-[#2a2b2f] flex items-center justify-between px-10 shrink-0 z-50">
          <div className="flex items-center gap-10">
            <span className="text-2xl font-black tracking-tighter text-white italic">Mantech<span className="text-[#5d3cfe]">Pro</span></span>
            <div className="relative"><Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#474556]" /><input type="text" placeholder="Buscar..." className="bg-[#121317] border border-[#2a2b2f] rounded-full py-2.5 pl-12 pr-6 text-xs text-white w-[450px]" value={globalSearch} onChange={(e) => setGlobalSearch(e.target.value)} /></div>
          </div>
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2 px-4 py-2 bg-[#1c1d21] border border-[#2a2b2f] rounded-full"><div className="w-2 h-2 rounded-full bg-[#52ffac] shadow-[0_0_8px_#52ffac]"></div><span className="text-[9px] font-black text-white uppercase tracking-widest">SISTEMA V4 MASTER</span></div>
            <button onClick={() => setIsSupportModalOpen(true)} className="p-2.5 bg-[#1c1d21] border border-[#2a2b2f] rounded-xl text-[#c8c4d9] hover:text-white transition-all cursor-pointer"><HelpCircle className="w-5 h-5" /></button>
            <button onClick={handleLogout} className="flex items-center gap-3 text-[#c8c4d9] hover:text-white font-black text-[10px] uppercase tracking-widest cursor-pointer transition-all"><LogOut className="w-5 h-5" /> Salir</button>
          </div>
        </nav>

        <div className="flex flex-1 overflow-hidden">
          <aside className="w-72 bg-[#0d0e12] border-r border-[#2a2b2f] p-8 flex flex-col shrink-0 overflow-y-auto custom-scrollbar">
            {/* PERFIL V4: FOTO A LA IZQUIERDA Y ROL CLIENTE */}
            <div className="flex items-center gap-4 mb-10 group cursor-pointer" onClick={() => document.getElementById('avatar-input')?.click()}>
               <div className="w-14 h-14 rounded-2xl bg-[#1c1d21] border border-white/10 flex items-center justify-center text-xl font-black text-white shadow-2xl overflow-hidden shrink-0 relative">
                 {profileImage ? <img src={profileImage} className="w-full h-full object-cover" /> : loggedInName[0]}
                 <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"><Camera className="w-4 h-4 text-white" /></div>
                 <input type="file" id="avatar-input" className="hidden" accept="image/*" onChange={e => e.target.files?.[0] && handleUploadAvatar(e.target.files[0])} />
               </div>
               <div className="overflow-hidden">
                 <h4 className="font-black text-white text-xs tracking-tight truncate uppercase leading-tight">{loggedInName}</h4>
                 <p className="text-[10px] font-black text-[#5d3cfe] uppercase tracking-widest mt-1">{role === 'client' ? 'CLIENTE' : 'TÉCNICO'}</p>
               </div>
            </div>

            <nav className="space-y-1.5 flex-1 text-[11px] font-black uppercase tracking-wider">
              {role === 'client' ? (
                <>
                  <button onClick={() => setClientTab('dashboard')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${clientTab === 'dashboard' ? 'bg-[#5d3cfe] text-white shadow-xl shadow-[#5d3cfe]/20' : 'text-[#c8c4d9] hover:bg-[#121317]'}`}><LayoutDashboard className="w-4 h-4" /> Mis Equipos</button>
                  <button onClick={() => setClientTab('fleet')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${clientTab === 'fleet' ? 'bg-[#5d3cfe] text-white shadow-xl shadow-[#5d3cfe]/20' : 'text-[#c8c4d9] hover:bg-[#121317]'}`}><Globe className="w-4 h-4" /> Flota B2B</button>
                  <button onClick={() => setClientTab('ai')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${clientTab === 'ai' ? 'bg-[#5d3cfe] text-white shadow-xl shadow-[#5d3cfe]/20' : 'text-[#c8c4d9] hover:bg-[#121317]'}`}><Sparkles className="w-4 h-4 text-amber-400" /> Diagnóstico</button>
                  <button onClick={() => setClientTab('marketplace')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${clientTab === 'marketplace' ? 'bg-[#5d3cfe] text-white shadow-xl shadow-[#5d3cfe]/20' : 'text-[#c8c4d9] hover:bg-[#121317]'}`}><Store className="w-4 h-4" /> Marketplace</button>
                  <button onClick={() => setClientTab('quotes')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${clientTab === 'quotes' ? 'bg-[#5d3cfe] text-white shadow-xl shadow-[#5d3cfe]/20' : 'text-[#c8c4d9] hover:bg-[#121317]'}`}><FileCheck2 className="w-4 h-4" /> Contratos</button>
                  <button onClick={() => setClientTab('inventory')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${clientTab === 'inventory' ? 'bg-[#5d3cfe] text-white shadow-xl shadow-[#5d3cfe]/20' : 'text-[#c8c4d9] hover:bg-[#121317]'}`}><Package className="w-4 h-4" /> Repuestos</button>
                  <button onClick={() => setClientTab('subscriptions')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${clientTab === 'subscriptions' ? 'bg-[#5d3cfe] text-white shadow-xl shadow-[#5d3cfe]/20' : 'text-[#c8c4d9] hover:bg-[#121317]'}`}><Star className="w-4 h-4" /> Membresía</button>
                  <button onClick={() => setClientTab('chat')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${clientTab === 'chat' ? 'bg-[#5d3cfe] text-white shadow-xl shadow-[#5d3cfe]/20' : 'text-[#c8c4d9] hover:bg-[#121317]'}`}><MessageSquare className="w-4 h-4" /> Chat</button>
                  <button onClick={() => setClientTab('settings')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${clientTab === 'settings' ? 'bg-[#5d3cfe] text-white shadow-xl shadow-[#5d3cfe]/20' : 'text-[#c8c4d9] hover:bg-[#121317]'}`}><Settings className="w-4 h-4" /> Configuración</button>
                </>
              ) : role === 'tech' ? (
                <>
                  <button onClick={() => setTechTab('received')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${techTab === 'received' ? 'bg-[#5d3cfe] text-white shadow-xl' : 'text-[#c8c4d9] hover:bg-[#121317]'}`}><Inbox className="w-4 h-4" /> Bandeja</button>
                  <button onClick={() => setTechTab('agenda')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${techTab === 'agenda' ? 'bg-[#5d3cfe] text-white shadow-xl' : 'text-[#c8c4d9] hover:bg-[#121317]'}`}><CalendarDays className="w-4 h-4" /> Agenda</button>
                  <button onClick={() => setTechTab('wallet')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${techTab === 'wallet' ? 'bg-[#5d3cfe] text-white shadow-xl' : 'text-[#c8c4d9] hover:bg-[#121317]'}`}><PieChart className="w-4 h-4" /> Billetera</button>
                  <button onClick={() => setTechTab('mantech_id')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${techTab === 'mantech_id' ? 'bg-[#5d3cfe] text-white shadow-xl' : 'text-[#c8c4d9] hover:bg-[#121317]'}`}><ShieldCheck className="w-4 h-4" /> Seguridad</button>
                  <button onClick={() => setTechTab('chat')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${techTab === 'chat' ? 'bg-[#5d3cfe] text-white shadow-xl' : 'text-[#c8c4d9] hover:bg-[#121317]'}`}><MessageSquare className="w-4 h-4" /> Chat</button>
                  <button onClick={() => setTechTab('profile')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${techTab === 'profile' ? 'bg-[#5d3cfe] text-white shadow-xl' : 'text-[#c8c4d9] hover:bg-[#121317]'}`}><User className="w-4 h-4" /> Mi Perfil</button>
                  <button onClick={() => setTechTab('settings')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${techTab === 'settings' ? 'bg-[#5d3cfe] text-white shadow-xl' : 'text-[#c8c4d9] hover:bg-[#121317]'}`}><Settings className="w-4 h-4" /> Centro Seguridad</button>
                </>
              ) : (
                <>
                  <button onClick={() => setAdminTab('finance')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${adminTab === 'finance' ? 'bg-rose-600 text-white shadow-xl' : 'text-[#c8c4d9] hover:bg-[#121317]'}`}><DollarSign className="w-4 h-4" /> Finanzas</button>
                  <button onClick={() => setAdminTab('logistics')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${adminTab === 'logistics' ? 'bg-rose-600 text-white shadow-xl' : 'text-[#c8c4d9] hover:bg-[#121317]'}`}><Truck className="w-4 h-4" /> Logística</button>
                  <button onClick={() => setAdminTab('users')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${adminTab === 'users' ? 'bg-rose-600 text-white shadow-xl' : 'text-[#c8c4d9] hover:bg-[#121317]'}`}><Users className="w-4 h-4" /> Usuarios</button>
                  <button onClick={() => setAdminTab('inventory')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${adminTab === 'inventory' ? 'bg-rose-600 text-white shadow-xl' : 'text-[#c8c4d9] hover:bg-[#121317]'}`}><Package className="w-4 h-4" /> Inventario</button>
                  <button onClick={() => setAdminTab('alerts')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${adminTab === 'alerts' ? 'bg-rose-600 text-white shadow-xl' : 'text-[#c8c4d9] hover:bg-[#121317]'}`}><BellRing className="w-4 h-4" /> Alertas</button>
                  <button onClick={() => setAdminTab('settings')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${adminTab === 'settings' ? 'bg-rose-600 text-white shadow-xl' : 'text-[#c8c4d9] hover:bg-[#121317]'}`}><Settings className="w-4 h-4" /> Configuración</button>
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
                        <header className="flex justify-between items-end">
                           <div><h1 className="text-4xl font-black text-white tracking-tighter">Bienvenido, {loggedInName}</h1><p className="text-[#c8c4d9] font-medium mt-2 italic opacity-60">Monitoreo activo de tus equipos en Panamá.</p></div>
                           <button onClick={() => setIsAssetModalOpen(true)} className="px-8 py-4 bg-[#5d3cfe] text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-[#5d3cfe]/20 transition-all">+ Registrar Activo</button>
                        </header>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                           {assets.map(a => (
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
                                            <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/5 border border-white/10 rounded-lg">
                                               <span className="text-[8px] font-black text-[#474556] uppercase">Placa:</span>
                                               <span className="text-[10px] font-black text-white tracking-widest">{a.licensePlate}</span>
                                            </div>
                                         )}
                                      </div>
                                   </div>
                                   <button onClick={() => { setAssetToEdit(a); setIsAssetModalOpen(true); }} className="absolute top-0 right-0 p-3 text-[#474556] hover:text-white transition-all bg-white/5 border border-white/5 rounded-2xl shadow-xl"><Pencil className="w-4 h-4" /></button>
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
                      </div>
                    )}
                    {clientTab === 'fleet' && <FleetDashboard assets={assets} reminders={reminders} onManageAsset={(a) => { setAssetToEdit(a); setIsAssetModalOpen(true); }} />}
                    {clientTab === 'ai' && <DiagnosticAIView assets={assets} onFindTechnicians={(c) => { setMarketFilter(c); setClientTab('marketplace'); }} />}
                    {clientTab === 'marketplace' && (
                      <div className="space-y-10">
                        <header><h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">Marketplace <span className="text-[#5d3cfe]">Expertos</span></h1><div className="flex gap-3 overflow-x-auto pb-4 mt-6 custom-scrollbar">{['Todos', 'Mecánico', 'Técnico A/C', 'Electricista', 'Informático'].map(c => (<button key={c} onClick={() => setMarketFilter(c === 'Todos' ? 'all' : c.toLowerCase().replace(' ', '_') as any)} className={`flex-shrink-0 px-8 py-3 rounded-full border transition-all text-[10px] font-black uppercase tracking-widest ${marketFilter === (c === 'Todos' ? 'all' : c.toLowerCase().replace(' ', '_')) ? 'bg-[#5d3cfe] border-[#5d3cfe] text-white shadow-xl shadow-[#5d3cfe]/20' : 'border-[#2a2b2f] text-[#c8c4d9] hover:border-[#5d3cfe]'}`}>{c}</button>))}</div></header>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                           {technicians.filter(t => marketFilter === 'all' || t.category === marketFilter).map(t => (
                             <div key={t.id} className="bg-[#121317] border border-[#2a2b2f] p-8 rounded-[3rem] flex flex-col gap-6 relative overflow-hidden group hover:border-[#5d3cfe]/50 transition-all shadow-2xl">
                                <div className="flex items-center gap-5"><div className="w-16 h-16 rounded-2xl bg-[#1c1d21] border border-[#2a2b2f] flex items-center justify-center text-[#c7bfff] font-black text-2xl shadow-inner">{t.name[0]}</div><div><h4 className="font-black text-white text-base uppercase tracking-tight">{t.name}</h4><p className="text-[10px] font-black text-[#52ffac] uppercase tracking-[0.2em] mt-1">{t.category.replace('_',' ')}</p>{t.companyName && <p className="text-[8px] text-[#c7bfff] font-black uppercase mt-1">Empresa: {t.companyName}</p>}</div></div>
                                <div className="grid grid-cols-3 gap-4 py-4 border-y border-[#2a2b2f]/50 bg-[#0d0e12]/30 px-4 rounded-2xl text-center"><div><div className="text-amber-500 font-black text-sm flex items-center justify-center gap-1"><Star className="w-3 h-3 fill-amber-500" /> {t.rating}</div><span className="text-[8px] text-[#474556] font-bold uppercase">Rating</span></div><div><div className="text-white font-black text-sm">{t.experienceYears}y</div><span className="text-[8px] text-[#474556] font-bold uppercase">Exp.</span></div><div><div className="text-[#52ffac] font-black text-sm">${t.hourlyRate}</div><span className="text-[8px] text-[#474556] font-bold uppercase">Hr.</span></div></div>
                                <p className="text-[11px] text-[#c8c4d9] leading-relaxed italic opacity-70 line-clamp-2">"{t.bio}"</p>
                                <button onClick={() => { setActiveTechForModal(t); setIsTechModalOpen(true); }} className="w-full py-4 bg-[#1c1d21] hover:bg-[#5d3cfe] text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-lg active:scale-95">Ver Perfil & Agendar</button>
                             </div>
                           ))}
                        </div>
                      </div>
                    )}
                    {clientTab === 'quotes' && (
                       <div className="space-y-10">
                          <header><h1 className="text-4xl font-black text-white tracking-tighter uppercase">Contratos <span className="text-emerald-500">Activos</span></h1></header>
                          <div className="space-y-6">
                             {requests.map(req => (
                               <div key={req.id} className="bg-[#121317] border border-[#2a2b2f] p-8 rounded-[2.5rem] space-y-6 shadow-2xl relative overflow-hidden">
                                  <div className="flex justify-between items-center"><h4 className="font-black text-white text-xl uppercase tracking-tighter">{req.assetName}</h4><span className="px-5 py-2 bg-[#1c1d21] border border-[#2a2b2f] rounded-full text-[10px] font-black text-[#52ffac] uppercase tracking-widest shadow-inner">{getStatusLabel(req.status)}</span></div>
                                  <div className="flex items-center justify-between px-4 py-8 relative">
                                     {[
                                       { label: 'Solicitud', status: ['pending', 'quoted', 'accepted', 'executing', 'completed', 'rated'] },
                                       { label: 'Cotizado', status: ['quoted', 'accepted', 'executing', 'completed', 'rated'] },
                                       { label: 'Pagado', status: ['accepted', 'executing', 'completed', 'rated'] },
                                       { label: 'En Sitio', status: ['executing', 'completed', 'rated'] },
                                       { label: 'Finalizado', status: ['completed', 'rated'] },
                                       { label: 'Facturado', status: ['rated'] }
                                     ].map((step, i, arr) => {
                                       const isActive = step.status.includes(req.status);
                                       const isLast = i === arr.length - 1;
                                       return (
                                         <React.Fragment key={i}>
                                           <div className="flex flex-col items-center gap-2.5 relative z-10"><div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-500 ${isActive ? 'bg-[#5d3cfe] shadow-[0_0_15px_#5d3cfe80]' : 'bg-[#1c1d21] border border-[#2a2b2f]'}`}>{isActive ? <Check className="w-3.5 h-3.5 text-white" /> : <div className="w-1.5 h-1.5 rounded-full bg-[#2a2b2f]"></div>}</div><span className={`text-[8px] font-black uppercase tracking-[0.1em] ${isActive ? 'text-[#c7bfff]' : 'text-[#474556]'}`}>{step.label}</span></div>
                                           {!isLast && <div className={`flex-1 h-0.5 mx-2 mb-6 rounded-full transition-all duration-700 ${isActive && arr[i+1].status.includes(req.status) ? 'bg-[#5d3cfe]' : 'bg-[#1c1d21]'}`}></div>}
                                         </React.Fragment>
                                       );
                                     })}
                                  </div>
                                  {req.status === 'quoted' && (
                                     <div className="bg-[#5d3cfe]/10 p-6 rounded-[2rem] border border-[#5d3cfe]/30 flex flex-col md:flex-row gap-4 items-center justify-between"><div className="text-center md:text-left"><p className="text-white font-black text-sm uppercase">Propuesta de ${req.price?.toFixed(2)} USD</p><p className="text-[10px] text-[#c8c4d9] font-medium mt-1">Cita sugerida: {req.scheduledDate} a las {req.scheduledTime}</p></div><div className="flex gap-3 w-full md:w-auto"><button onClick={() => handleAcceptQuote(req.id, 'yappy')} className="flex-1 px-8 py-3 bg-[#52ffac] text-black rounded-xl text-[10px] font-black uppercase shadow-lg shadow-[#52ffac]/20 hover:brightness-110 transition-all">Pagar Yappy</button><button onClick={() => handleAcceptQuote(req.id, 'paypal')} className="flex-1 px-8 py-3 bg-[#ffc439] text-[#003087] rounded-xl text-[10px] font-black uppercase shadow-lg shadow-[#ffc439]/20 hover:brightness-110 transition-all flex items-center justify-center gap-2"><CreditCard className="w-4 h-4" />PayPal</button></div></div>
                                  )}
                                  {req.status === 'disputed' && req.unforeseenAmount && (
                                     <div className="bg-amber-500/10 p-8 rounded-[3rem] border border-amber-500/30 space-y-6 animate-fade-in">
                                        <div className="text-center md:text-left space-y-2">
                                           <p className="text-amber-400 font-black text-sm uppercase tracking-widest flex items-center gap-2">
                                              <AlertTriangle className="w-5 h-5" /> IMPREVISTO TÉCNICO DETECTADO
                                           </p>
                                           <p className="text-white font-bold text-base leading-tight">Motivo: {req.unforeseenReason}</p>
                                           <p className="text-[11px] text-[#c8c4d9] italic">"Este imprevisto compromete la integridad del activo si no es atendido."</p>
                                        </div>
                                        <div className="flex flex-col md:flex-row gap-4 items-center justify-between pt-4 border-t border-white/5">
                                           <div className="text-2xl font-black text-[#52ffac]">$+{req.unforeseenAmount.toFixed(2)} <span className="text-[10px] text-[#474556] uppercase">USD</span></div>
                                           <div className="flex gap-3 w-full md:w-auto">
                                              <button onClick={() => handleRejectUnforeseen(req.id)} className="flex-1 px-6 py-3 border border-rose-500/30 text-rose-500 rounded-xl text-[10px] font-black uppercase hover:bg-rose-500 hover:text-white transition-all">Continuar sin Garantía</button>
                                              <button onClick={() => handleApproveUnforeseen(req.id)} className="flex-1 px-8 py-3 bg-amber-500 text-black rounded-xl text-[10px] font-black uppercase shadow-lg shadow-amber-500/20 hover:brightness-110 transition-all">Aprobar y Pagar Extra</button>
                                           </div>
                                        </div>
                                     </div>
                                  )}
                                  {req.status === 'accepted' && <div className="bg-rose-500/10 p-6 rounded-[2rem] border border-rose-500/20 flex justify-between items-center"><div className="flex items-center gap-4 text-rose-500"><ShieldAlert className="w-6 h-6" /><p className="text-[11px] font-black uppercase">Seguridad: Fondos bloqueados en garantía.</p></div><button onClick={() => handleReportTechnicianFailure(req.id)} className="px-6 py-3 bg-rose-600 text-white rounded-xl text-[9px] font-black uppercase hover:bg-rose-500 transition-all">Reportar Fallo</button></div>}
                               </div>
                             ))}
                          </div>
                       </div>
                    )}
                    {clientTab === 'inventory' && (
                       <InventoryModule
                          items={inventory}
                          assets={assets}
                          onUpdateQuantity={handleUpdateInventoryQuantity}
                          onAddItem={handleAddInventoryItem}
                          onDeleteItem={handleDeleteInventoryItem}
                          onUpdateItem={handleUpdateInventoryItem}
                       />
                    )}
                    {clientTab === 'subscriptions' && <SubscriptionModule subscription={subscription} onUpgrade={(p) => alert(`Cambiando a ${p}...`)} />}
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
                          <header className="text-center space-y-2"><h2 className="text-3xl font-black text-white uppercase tracking-tight">Configuración de Cuenta</h2><p className="text-[10px] font-black text-[#c8c4d9] uppercase tracking-[0.3em]">Seguridad y Validación Mantech ID</p></header>
                          <div className="space-y-8">
                             <MantechIDModule
                                mantechId={{
                                   status: userData?.mantechIdStatus || 'unverified',
                                   idNumber: '',
                                   documentUrl: userData?.idCardUrl,
                                   policeRecordUrl: userData?.policeRecordUrl
                                }}
                                onUpload={handleUploadDoc}
                                role="client"
                             />
                             <div className="bg-[#121317] border border-[#2a2b2f] p-8 rounded-[3rem] shadow-2xl">
                                <button onClick={handleLogout} className="w-full py-5 border border-rose-500/20 text-rose-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all">Cerrar Sesión Segura</button>
                             </div>
                          </div>
                       </div>
                    )}
                  </>
                )}

                {role === 'tech' && (
                   <div className="space-y-12">
                      {techTab === 'received' && (
                         <div className="space-y-8">
                            <header><h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">Bandeja de <span className="text-[#5d3cfe]">Servicios</span></h1></header>
                            <div className="grid grid-cols-1 gap-6">{requests.map(req => (<div key={req.id} className="bg-[#121317] border border-[#2a2b2f] p-8 rounded-[2.5rem] space-y-6 shadow-2xl relative overflow-hidden group hover:border-[#5d3cfe]/30 transition-all"><div className="flex justify-between items-center"><div><span className="text-[9px] font-black text-[#474556] uppercase tracking-widest">Cliente</span><h4 className="text-lg font-black text-white uppercase tracking-tight">{req.clientName}</h4></div><span className="px-4 py-1.5 bg-[#1c1d21] border border-[#2a2b2f] rounded-full text-[9px] font-black text-[#c7bfff] uppercase tracking-widest shadow-inner">{getStatusLabel(req.status)}</span></div><div className="flex justify-end gap-2"><button onClick={() => setIsCredentialModalOpen(true)} className="px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl text-[8px] font-black uppercase tracking-widest hover:bg-indigo-500 hover:text-white transition-all"><QrCode className="w-3 h-3 inline mr-1" />Mostrar Credencial</button></div><div className="p-5 bg-[#0d0e12] rounded-2xl border border-[#2a2b2f] italic text-xs text-[#c8c4d9]">"{req.description}"</div>{req.status === 'pending' && (<div className="grid grid-cols-1 lg:grid-cols-5 gap-3 items-end pt-4 border-t border-[#2a2b2f]"><div className="space-y-2"><label className="text-[8px] font-black text-[#474556] uppercase ml-1">Tarifa (USD)</label><input type="number" value={bidPrice} onChange={e => setBidPrice(e.target.value)} className="w-full bg-[#0d0e12] border border-[#2a2b2f] rounded-xl p-3 text-white font-black text-sm" /></div><div className="space-y-2"><label className="text-[8px] font-black text-[#474556] uppercase ml-1">Fecha</label><input type="date" value={bidDate} onChange={e => setBidDate(e.target.value)} className="w-full bg-[#0d0e12] border border-[#2a2b2f] rounded-xl p-3 text-white font-bold text-xs" /></div><div className="space-y-2"><label className="text-[8px] font-black text-[#474556] uppercase ml-1">Hora</label><input type="time" value={bidTime} onChange={e => setBidTime(e.target.value)} className="w-full bg-[#0d0e12] border border-[#2a2b2f] rounded-xl p-3 text-white font-bold text-xs" /></div><div className="space-y-2"><label className="text-[8px] font-black text-[#474556] uppercase ml-1">Labor</label><select value={bidDuration} onChange={e => setBidDuration(Number(e.target.value))} className="w-full bg-[#0d0e12] border border-[#2a2b2f] rounded-xl p-3 text-white font-black text-xs appearance-none"><option value={1}>1h</option><option value={2}>2h</option><option value={4}>4h</option></select></div><button onClick={() => { setDraftingBidRequestId(req.id); handleSubmitBid(req.id); }} className="py-4 bg-[#5d3cfe] text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all">Enviar Precio</button></div>)}{req.status === 'accepted' && (<button onClick={() => updateDoc(doc(db,"requests",req.id), {status:'executing', visitStartedAt: new Date().toISOString()})} className="w-full py-5 bg-[#5d3cfe] text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] shadow-xl transition-all">📍 Iniciar Visita Física</button>)}{req.status === 'executing' && (<div className="space-y-6">{req.materials && req.materials.length > 0 && (<div className="grid grid-cols-1 md:grid-cols-2 gap-3">{req.materials.map((m: any, idx: number) => (<div key={idx} className="flex justify-between items-center bg-[#0d0e12] p-4 rounded-2xl border border-white/5"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-lg bg-[#5d3cfe]/10 flex items-center justify-center text-[#c7bfff] font-black text-[10px]">x{m.quantity}</div><div><p className="text-xs font-bold text-white uppercase">{m.name}</p><p className="text-[8px] text-[#474556] font-black uppercase">${m.price} c/u</p></div></div><button onClick={() => handleDeleteMaterial(req.id, idx)} className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"><Trash2 className="w-4 h-4" /></button></div>))}</div>)}<div className="flex flex-wrap gap-4"><button onClick={() => { setActiveRequestForMaterial(req); setIsMaterialModalOpen(true); }} className="flex-1 py-5 bg-[#1c1d21] border border-[#2a2b2f] text-[#c7bfff] rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-[#5d3cfe] transition-all"><Package className="w-4 h-4 mx-auto mb-1" />Cargar Material</button><button onClick={() => { setActiveRequestForUnforeseen(req); setIsUnforeseenModalOpen(true); }} className="flex-1 py-5 bg-amber-500/10 border border-amber-500/30 text-amber-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-500 hover:text-black transition-all"><AlertTriangle className="w-4 h-4 mx-auto mb-1" />Imprevisto</button><button onClick={() => { setSelectedRequestForReport(req); setIsSignatureModalOpen(true); }} className="flex-1 py-5 bg-emerald-500 text-black rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] shadow-xl shadow-emerald-500/20 active:scale-95 transition-all"><CheckCircle2 className="w-4 h-4 mx-auto mb-1" />Finalizar</button></div></div>)}</div>))}</div>
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
                      {techTab === 'profile' && <div className="p-10 text-center">Panel de Perfil Profesional</div>}
                      </div>
                      )}
                      {techTab === 'agenda' && (<div className="bg-[#121317] border border-[#2a2b2f] p-10 rounded-[3rem] shadow-2xl space-y-8"><header><h1 className="text-4xl font-black text-white tracking-tighter uppercase">Agenda <span className="text-[#5d3cfe]">Logística</span></h1></header><div className="grid grid-cols-1 gap-4">{agenda.map(e => (<div key={e.id} className="p-6 bg-[#1c1d21] border border-[#2a2b2f] rounded-3xl flex justify-between items-center group hover:border-[#5d3cfe]/30 transition-all"><div className="flex gap-6 items-center"><div className="p-4 bg-[#0d0e12] rounded-2xl text-center min-w-[100px] border border-[#2a2b2f]"><span className="block text-[8px] font-black text-[#474556] uppercase mb-1">Cita</span><span className="text-xs font-black text-[#5d3cfe]">{e.date}</span><p className="text-[10px] font-bold text-white mt-1">{e.time}</p></div><div><span className="text-[9px] font-black text-[#474556] uppercase tracking-widest">Cliente: {e.clientName}</span><h4 className="text-lg font-black text-white uppercase tracking-tight mt-1">{e.title}</h4><p className="text-[10px] font-bold text-[#c8c4d9] mt-1 italic opacity-60">Duración: {e.duration} (+ {e.travelTime} viaje)</p></div></div><button onClick={() => { const nd = prompt("Nueva Fecha:", e.date); const nt = prompt("Nueva Hora:", e.time); const r = prompt("Motivo:"); if(nd && nt && r) handleReschedule(e.requestId || '', nd, nt, r); }} className="px-6 py-2.5 bg-[#0d0e12] border border-[#2a2b2f] text-white rounded-xl text-[9px] font-black uppercase hover:bg-[#5d3cfe]">Mover</button></div>))}</div></div>)}
                      {techTab === 'wallet' && <TechWalletModule wallet={getSelectedTechProfileObj().wallet || { balance: 0, pendingBalance: 0, transactions: [] }} techId={selectedTechProfileId!} />}
                      {techTab === 'mantech_id' && <MantechIDModule mantechId={getSelectedTechProfileObj().mantechId || { status: 'unverified', idNumber: '' }} onUpload={handleUploadDoc} role="tech" />}
                      {techTab === 'settings' && (
                         <div className="max-w-2xl mx-auto space-y-10 pb-20">
                            <header className="text-center space-y-2"><h2 className="text-3xl font-black text-white uppercase tracking-tight">Centro de Seguridad Técnico</h2><p className="text-[10px] font-black text-[#c8c4d9] uppercase tracking-[0.3em]">Validación de Perfil MantechPro</p></header>
                            <div className="space-y-8">
                               <MantechIDModule
                                  mantechId={getSelectedTechProfileObj().mantechId || { status: 'unverified', idNumber: '' }}
                                  onUpload={handleUploadDoc}
                                  role="tech"
                               />
                               <div className="bg-[#121317] border border-[#2a2b2f] p-8 rounded-[2.5rem] shadow-2xl">
                                  <button onClick={handleLogout} className="w-full py-5 bg-rose-600/10 border border-rose-600/20 text-rose-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all">Cerrar Sesión Profesional</button>
                               </div>
                            </div>
                         </div>
                      )}
                   </div>
                )}
                {role === 'admin' && (
                  <div className="space-y-12 animate-fade-in-up">
                     {adminTab === 'finance' && (<div className="grid grid-cols-1 md:grid-cols-3 gap-8"><div className="bg-[#121317] border border-[#2a2b2f] p-10 rounded-[3rem] shadow-2xl relative overflow-hidden group"><span className="text-[10px] font-black text-[#474556] uppercase tracking-[0.3em]">Ingresos Brutos</span><h2 className="text-5xl font-black text-white italic tracking-tighter">$2,450.00</h2></div><div className="bg-[#121317] border border-[#2a2b2f] p-10 rounded-[3rem] shadow-2xl space-y-2"><span className="text-[10px] font-black text-[#474556] uppercase tracking-[0.3em]">Comisiones (15%)</span><h2 className="text-5xl font-black text-[#5d3cfe] italic tracking-tighter">$367.50</h2></div><div className="bg-[#121317] border border-[#2a2b2f] p-10 rounded-[3rem] shadow-2xl space-y-2"><span className="text-[10px] font-black text-[#474556] uppercase tracking-[0.3em]">Membresías</span><h2 className="text-5xl font-black text-amber-500 italic tracking-tighter">$120.00</h2></div></div>)}
                     {adminTab === 'logistics' && (<div className="bg-[#121317] border border-[#2a2b2f] p-10 rounded-[3rem] shadow-2xl space-y-8"><header><h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">Monitor de <span className="text-[#5d3cfe]">Operaciones</span></h1></header><div className="grid grid-cols-1 md:grid-cols-2 gap-6">{requests.filter(r => r.status === 'accepted' || r.status === 'executing').map(r => (<div key={r.id} className="p-6 bg-[#1c1d21] border border-[#2a2b2f] rounded-3xl flex justify-between items-center"><div className="flex gap-4 items-center"><div className={`p-3 rounded-2xl ${r.status === 'executing' ? 'bg-[#52ffac]/10 text-[#52ffac]' : 'bg-[#5d3cfe]/10 text-[#c7bfff]'}`}><Truck className="w-6 h-6" /></div><div><h4 className="text-sm font-black text-white uppercase tracking-tight">{r.assetName}</h4><p className="text-[10px] font-bold text-[#474556] uppercase mt-0.5">Técnico: {r.techName}</p></div></div>{r.rescheduleCount && <span className="px-3 py-1 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-full text-[8px] font-black uppercase animate-pulse">⚠️ {r.rescheduleCount} MOVIDAS</span>}</div>))}</div></div>)}
                     {adminTab === 'inventory' && (
                        <InventoryModule
                           items={inventory}
                           assets={assets}
                           onUpdateQuantity={handleUpdateInventoryQuantity}
                           onAddItem={handleAddInventoryItem}
                           onDeleteItem={handleDeleteInventoryItem}
                           onUpdateItem={handleUpdateInventoryItem}
                        />
                     )}
                  </div>
                )}
             </div>
          </main>
        </div>
      </div>

      {isUnforeseenModalOpen && (<div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"><div className="w-full max-w-lg bg-[#121317] border border-[#2a2b2f] rounded-[3rem] p-10 space-y-8 shadow-2xl animate-fade-in-up"><div className="text-center space-y-2"><h3 className="text-2xl font-black text-amber-500 uppercase italic">Reportar <span className="text-white">Gasto Extra</span></h3><p className="text-[10px] text-[#c8c4d9] font-bold uppercase tracking-widest opacity-60">Solicitar aprobación de imprevisto.</p></div><div className="space-y-4"><div className="space-y-2"><label className="text-[10px] font-black text-[#474556] uppercase ml-1">Motivo Técnico</label><input type="text" value={unforeseenInputs.reason} onChange={e => setUnforeseenInputs({...unforeseenInputs, reason: e.target.value})} className="w-full bg-[#0d0e12] border border-[#2a2b2f] rounded-2xl py-4 px-5 text-white text-sm" /></div><div className="space-y-2"><label className="text-[10px] font-black text-[#474556] uppercase ml-1">Costo Adicional</label><input type="number" value={unforeseenInputs.amount} onChange={e => setUnforeseenInputs({...unforeseenInputs, amount: e.target.value})} className="w-full bg-[#0d0e12] border border-[#2a2b2f] rounded-2xl py-4 px-5 text-white font-black text-xl" /></div></div><div className="flex gap-4"><button onClick={() => setIsUnforeseenModalOpen(false)} className="flex-1 py-4 bg-[#1c1d21] text-[#c8c4d9] rounded-xl text-[10px] font-black uppercase">Cancelar</button><button onClick={() => handleTriggerUnforeseen(activeRequestForUnforeseen.id, unforeseenInputs.reason, Number(unforeseenInputs.amount), unforeseenInputs.category)} className="flex-1 py-4 bg-amber-500 text-black rounded-xl text-[10px] font-black uppercase shadow-lg shadow-amber-500/20">Enviar</button></div></div></div>)}

      {isMaterialModalOpen && activeRequestForMaterial && (
         <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <div className="w-full max-w-lg bg-[#121317] border border-[#2a2b2f] rounded-[3rem] p-10 space-y-8 shadow-2xl">
               <div className="text-center space-y-2"><h3 className="text-2xl font-black text-white uppercase italic">Cargar <span className="text-[#5d3cfe]">Material</span></h3><p className="text-[10px] text-[#c8c4d9] font-bold uppercase tracking-widest opacity-60">Gestión de insumos y repuestos.</p></div>
               <div className="space-y-4">
                  <div className="space-y-2"><label className="text-[10px] font-black text-[#474556] uppercase ml-1">Nombre Insumo</label><input type="text" value={materialInputs.name} onChange={e => setMaterialInputs({...materialInputs, name: e.target.value})} className="w-full bg-[#0d0e12] border border-[#2a2b2f] rounded-2xl py-4 px-5 text-white text-sm" /></div>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2"><label className="text-[10px] font-black text-[#474556] uppercase ml-1">Precio Unit.</label><input type="number" value={materialInputs.price} onChange={e => setMaterialInputs({...materialInputs, price: e.target.value})} className="w-full bg-[#0d0e12] border border-[#2a2b2f] rounded-2xl py-4 px-5 text-white font-black text-lg" /></div>
                     <div className="space-y-2"><label className="text-[10px] font-black text-[#474556] uppercase ml-1">Cant.</label><input type="number" value={materialInputs.quantity} onChange={e => setMaterialInputs({...materialInputs, quantity: e.target.value})} className="w-full bg-[#0d0e12] border border-[#2a2b2f] rounded-2xl py-4 px-5 text-white font-black text-lg text-center" /></div>
                  </div>
               </div>
               <div className="flex gap-4"><button onClick={() => setIsMaterialModalOpen(false)} className="flex-1 py-4 bg-[#1c1d21] text-[#c8c4d9] rounded-xl text-[10px] font-black uppercase">Cancelar</button><button onClick={() => { handleSaveMaterial(activeRequestForMaterial.id, materialInputs.name, Number(materialInputs.price), Number(materialInputs.quantity), materialInputs.category); setIsMaterialModalOpen(false); setMaterialInputs({ name: '', price: '', quantity: '1', category: 'general' }); }} className="flex-1 py-4 bg-[#5d3cfe] text-white rounded-xl text-[10px] font-black uppercase shadow-lg">Cargar</button></div>
            </div>
         </div>
      )}

      {isAssetModalOpen && <AssetRegisterModal isOpen={isAssetModalOpen} onClose={() => setIsAssetModalOpen(false)} onAdd={handleAddAsset} assetToEdit={assetToEdit} />}
      {isTechModalOpen && activeTechForModal && <TechnicianProfileModal tech={activeTechForModal} isOpen={isTechModalOpen} onClose={() => setIsTechModalOpen(false)} assets={assets} onRequestQuote={handleRequestQuote} />}
      {isEditingTechProfile && <TechnicianEditProfileModal isOpen={isEditingTechProfile} onClose={() => setIsEditingTechProfile(false)} profile={getSelectedTechProfileObj()} onSave={handleUpdateTechProfile} />}
      {selectedRequestForReport && <ServiceReportModal isOpen={isReportModalOpen} onClose={() => { setIsReportModalOpen(false); setSelectedRequestForReport(null); }} request={selectedRequestForReport} />}

      {isSignatureModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
          <div className="w-full max-w-md bg-[#121317] border border-[#2a2b2f] rounded-[3rem] p-10 space-y-10 shadow-2xl animate-fade-in-up">
             <div className="text-center space-y-2"><h3 className="text-2xl font-black text-white uppercase italic">Cierre de <span className="text-[#5d3cfe]">Garantía</span></h3><p className="text-[10px] text-[#c8c4d9] font-bold uppercase tracking-widest opacity-60">Firme y califique para liberar el pago.</p></div>
             <div className="flex justify-center gap-3 py-4 border-y border-[#2a2b2f]/50">{[1,2,3,4,5].map(s => <button key={s} onClick={() => setRatingVal(s)} className="cursor-pointer transition-transform active:scale-150 transform hover:scale-110"><Star className={`w-10 h-10 ${ratingVal >= s ? 'fill-amber-500 text-amber-500 shadow-[0_0_20px_#f59e0b40]' : 'text-[#2a2b2f]'}`} /></button>)}</div>
             <SignaturePad onSave={sig => handleCompleteJob(requests.find(r => r.status === 'executing')?.id || '', sig)} onCancel={() => setIsSignatureModalOpen(false)} />
          </div>
        </div>
      )}

      {isSupportModalOpen && <SupportModal isOpen={isSupportModalOpen} onClose={() => setIsSupportModalOpen(false)} userEmail={loggedInEmail} userName={loggedInName} userId={user?.uid} userRole={role} />}

      {/* MODALS DE COMUNICACIÓN V4 */}
      <VideoCallModal
         isOpen={isVideoCallOpen}
         onClose={() => setIsVideoCallOpen(false)}
         roomName={videoCallRoom}
         userName={loggedInName}
         isVoiceOnly={isVideoVoiceOnly}
      />

      <QRScannerModal
         isOpen={isScannerOpen}
         onClose={() => setIsScannerOpen(false)}
         onScanSuccess={(id) => {
            const tech = technicians.find(t => t.id === id);
            if (tech) alert(`✅ Especialista Validado: ${tech.name}. Nodo de confianza confirmado.`);
         }}
         technicians={technicians}
      />

      {isCredentialModalOpen && (
         <div className="fixed inset-0 z-[600] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4">
            <div className="w-full max-w-sm">
               <div className="flex justify-end mb-4">
                  <button onClick={() => setIsCredentialModalOpen(false)} className="p-3 bg-white/5 border border-white/10 text-white rounded-2xl hover:bg-white/10 transition-all">
                     <X className="w-6 h-6" />
                  </button>
               </div>
               <TechCredential tech={getSelectedTechProfileObj()} />
            </div>
         </div>
      )}

      <Chatbot247 />
    </div>
  );
}

function formatFriendlyDate(d: string) { if (!d) return '---'; return new Date(d).toLocaleDateString('es-PA', { day: '2-digit', month: 'short' }).toUpperCase(); }
