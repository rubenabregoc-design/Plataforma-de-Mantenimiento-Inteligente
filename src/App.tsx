import React, { useState, useEffect } from 'react';
import {
  initialAssets, 
  initialReminders, 
  initialTechnicians, 
  initialRequests, 
  initialInventory
} from './mockData';
import MantechIDModule from './components/MantechIDModule';
import TechWalletModule from './components/TechWalletModule';
import FleetDashboard from './components/FleetDashboard';

import {
  Asset, 
  MaintenanceReminder, 
  TechProfile, 
  JobRequest, 
  ChatMessage,
  TechCategory,
  InventoryItem,
  UserSubscription
} from './types';
import AssetRegisterModal from './components/AssetRegisterModal';
import DiagnosticView from './components/DiagnosticView';
import TechnicianProfileModal from './components/TechnicianProfileModal';
import TechnicianEditProfileModal from './components/TechnicianEditProfileModal';
import ServiceReportModal from './components/ServiceReportModal';
import SignaturePad from './components/SignaturePad';
import InventoryModule from './components/InventoryModule';
import AnalyticsModule from './components/AnalyticsModule';
import SubscriptionModule from './components/SubscriptionModule';
import Chatbot247 from './components/Chatbot247';
import SupportChatWidget from './components/SupportChatWidget';
import TechCredential from './components/TechCredential';
import SupportModal from './components/SupportModal';
import SupportResponseModal from './components/SupportResponseModal';
import MonthlyClosureModal from './components/MonthlyClosureModal';
import VideoCallModal from './components/VideoCallModal';
import QRScannerModal from './components/QRScannerModal';
import InspectionChecklist from './components/InspectionChecklist';

import { 
  LayoutDashboard, Store, FileCheck2, Bot, MessageSquare, CalendarDays, Users,
  Bell, LogOut, Settings, PlusCircle, Search, User, Sparkles, Zap, ChevronRight,
  Package, PieChart, Info, ShieldCheck, HelpCircle, Menu, X, Trash2, Globe, Star, Pencil, Activity, Truck, CheckCheck, AlertCircle, Building2, QrCode, Video, Phone, Camera, LifeBuoy, Clock
} from 'lucide-react';

// Firebase Imports
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import {
  collection,
  addDoc,
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

// Components
const AppLogo = ({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg', className?: string }) => {
  const dimensions = size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-16 h-16' : 'w-10 h-10';

  return (
    <div id="mantech-logo-container" className={`relative flex items-center justify-center ${dimensions} ${className} group`}>
      {/* Halo de luz de fondo */}
      <div className="absolute inset-0 bg-[#5d3cfe] opacity-5 blur-lg rounded-full group-hover:opacity-10 transition-opacity"></div>

      {/* Cuerpo del Logo */}
      <div className="relative w-full h-full bg-[#121317] border border-white/10 rounded-xl flex items-center justify-center shadow-lg overflow-hidden transition-all duration-300 group-hover:border-[#5d3cfe]/30">

        {/* MantechPro Symbol (SVG) */}
        <svg id="mantech-pro-svg" viewBox="0 0 100 100" className="w-[75%] h-[75%] relative z-10" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* La 'M' Estructural */}
          <path
            d="M20 75V35L50 60L80 35V75"
            stroke="url(#logoGrad)"
            strokeWidth="12"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* El Punto de Inteligencia */}
          <circle cx="50" cy="20" r="6" fill="#52ffac" className="animate-pulse" />

          <defs>
            <linearGradient id="logoGrad" x1="20" y1="75" x2="80" y2="35" gradientUnits="userSpaceOnUse">
              <stop stopColor="#5d3cfe" />
              <stop offset="1" stopColor="#52ffac" />
            </linearGradient>
          </defs>
        </svg>

        {/* Brillo de cristal */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
      </div>
    </div>
  );
};

export default function App() {
  // Session state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAuthResolving, setIsAuthResolving] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [role, setRole] = useState<'client' | 'tech' | 'admin'>('client');
  const [adminTab, setAdminTab] = useState<'finance' | 'users' | 'tickets' | 'logistics' | 'inventory' | 'marketplace' | 'alerts' | 'settings'>('finance');
  const [loggedInEmail, setLoggedInEmail] = useState('');
  const [loggedInName, setLoggedInName] = useState('');
  const [loggedInPhone, setLoggedInPhone] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [selectedTechProfileId, setSelectedTechProfileId] = useState('');

  const handleUploadAvatar = async (file: File) => {
    if (!user) return;
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        await updateDoc(doc(db, "users", user.uid), {
          profileImage: base64String
        });
        setProfileImage(base64String);
        alert("¡Foto de perfil actualizada!");
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      console.error("Avatar Upload Error:", err);
    }
  };

  const submitProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      await setDoc(doc(db, "users", user.uid), {
        name: loggedInName,
        phone: loggedInPhone
      }, { merge: true });
      alert("Perfil actualizado correctamente");
    } catch (err: any) {
      console.error("Update Profile Error:", err);
      alert("Error al actualizar: " + err.message);
    }
  };

  // App state
  const [assets, setAssets] = useState<Asset[]>([]);
  const [reminders, setReminders] = useState<MaintenanceReminder[]>([]);
  const [technicians, setTechnicians] = useState<TechProfile[]>([]);
  const [requests, setRequests] = useState<JobRequest[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [subscription, setSubscription] = useState<UserSubscription>({
    planId: 'plan-basic',
    status: 'active',
    startDate: new Date().toISOString(),
    nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  });

  const [clientTab, setClientTab] = useState<'dashboard' | 'diagnostic' | 'marketplace' | 'quotes' | 'chat' | 'inventory' | 'analytics' | 'subscriptions' | 'fleet' | 'settings'>('dashboard');
  const [techTab, setTechTab] = useState<'received' | 'agenda' | 'profile' | 'chat' | 'wallet' | 'mantech_id' | 'settings'>('received');
  const [marketFilter, setMarketFilter] = useState<TechCategory | 'all'>('all');
  const [globalSearch, setGlobalSearch] = useState('');

  // UI state
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [assetToEdit, setAssetToEdit] = useState<Asset | null>(null);
  const [isTechModalOpen, setIsTechModalOpen] = useState(false);
  const [activeTechForModal, setActiveTechForModal] = useState<TechProfile | null>(null);
  const [activeChatRequestId, setActiveChatRequestId] = useState<string | null>(null);
  const [isChatSidebarOpen, setIsChatSidebarOpen] = useState(true);
  const [isChatMaximized, setIsChatMaximized] = useState(false);
  const [isEditingTechProfile, setIsEditingTechProfile] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [isMonthlyClosureOpen, setIsMonthlyClosureOpen] = useState(false);
  const [activeTicketForResponse, setActiveTicketForResponse] = useState<any>(null);
  const [isVideoCallOpen, setIsVideoCallOpen] = useState(false);
  const [isUnforeseenModalOpen, setIsUnforeseenModalOpen] = useState(false);
  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
  const [activeRequestForUnforeseen, setActiveRequestForUnforeseen] = useState<any>(null);
  const [activeRequestForMaterial, setActiveRequestForMaterial] = useState<any>(null);
  const [unforeseenInputs, setUnforeseenInputs] = useState({ reason: '', amount: '', category: 'spare_part', compromises: true });
  const [materialInputs, setMaterialInputs] = useState({ name: '', price: '', quantity: '1', category: 'general' });
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [isVoiceOnlyMode, setIsVoiceOnlyMode] = useState(false);
  const [timers, setTimers] = useState<{[key: string]: { startTime: number, elapsed: number, isRunning: boolean }}>({});
  const [activeCallRoom, setActiveCallRoom] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setTimers(prev => {
        const next = { ...prev };
        let updated = false;
        Object.keys(next).forEach(id => {
          if (next[id].isRunning) {
            next[id] = { ...next[id], elapsed: Math.floor((Date.now() - next[id].startTime) / 1000) };
            updated = true;
          }
        });
        return updated ? next : prev;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTimer = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
  };
  const [quoteInputs, setQuoteInputs] = useState<{[key: string]: {
    price?: string,
    date?: string,
    time?: string,
    duration?: string,
    travelTime?: string,
    materials?: MaterialItem[]
  }}>({});
  const [selectedRequestForReport, setSelectedRequestForReport] = useState<JobRequest | null>(null);

  const format12h = (timeStr?: string) => {
    if (!timeStr) return 'No definida';
    try {
      const [hours, minutes] = timeStr.split(':');
      let h = parseInt(hours);
      const ampm = h >= 12 ? 'PM' : 'AM';
      h = h % 12;
      h = h ? h : 12;
      return `${h}:${minutes} ${ampm}`;
    } catch (e) { return timeStr; }
  };

  // Auth inputs
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginName, setLoginName] = useState('');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authRole, setAuthRole] = useState<'client' | 'tech'>('client');
  const [authError, setAuthError] = useState('');

  // Logic: Firebase Listeners
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        setLoggedInEmail(firebaseUser.email || '');
        setLoggedInName(firebaseUser.displayName || 'Usuario');

        if (firebaseUser.email === 'admin@mantech.com') {
          setRole('admin');
          setIsLoggedIn(true);
          setIsAuthResolving(false);
          return;
        }

        if (firebaseUser.email?.toLowerCase().includes('admin')) {
          setRole('admin');
        }

        try {
          const userRef = doc(db, "users", firebaseUser.uid);
          const userSnap = await getDoc(userRef);
          if (!userSnap.exists()) {
             await setDoc(userRef, { uid: firebaseUser.uid, email: firebaseUser.email, name: firebaseUser.displayName || 'Usuario', role: 'client', createdAt: serverTimestamp() });
          }
          setIsLoggedIn(true);
        } catch (err) {
          console.error("Session Error:", err);
          setIsLoggedIn(true);
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

<<<<<<< HEAD
  const setupPushNotifications = async (userDocId: string) => {
    // Request permission
    let perm = await PushNotifications.checkPermissions();
    if (perm.receive === 'prompt') {
      perm = await PushNotifications.requestPermissions();
    }

    if (perm.receive !== 'granted') {
      console.warn("User denied push permissions");
      return;
    }

    // Register with FCM
    await PushNotifications.register();

    // Listen for Token
    PushNotifications.addListener('registration', async (token) => {
      const deviceToken = token.value;
      setFcmToken(deviceToken);

      // Save token in user document for targeted notifications
      await updateDoc(doc(db, "users", userDocId), {
        fcmToken: deviceToken,
        lastActive: serverTimestamp(),
        platform: Capacitor.getPlatform()
      });
      console.log("FCM Token saved:", deviceToken);
    });

    PushNotifications.addListener('registrationError', (err) => {
      console.error("Push registration error:", err);
    });

    // Handle receiving notification while app is open
    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      alert(`🔔 ${notification.title}: ${notification.body}`);
    });
  };

  // Login form temporary inputs
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginName, setLoginName] = useState('');
  const [authTab, setAuthTab] = useState<'client' | 'tech' | 'admin'>('client');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authError, setAuthError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Pre-login interactive landing page simulator state
  const [demoSelectedId, setDemoSelectedId] = useState<number>(1);

  const demoProblems = [
    {
      id: 1,
      problem: "Split de 18,000 BTU bota agua y no enfría",
      asset: "Aire Acondicionado",
      category: "aires_acondicionados",
      specialty: "❄️ HVAC / Aires Acondicionados",
      estimatedRate: "B/.. 35.00 - B/.. 65.00",
      time: "Urgente (1 - 3 horas)",
      techsAvailable: 8,
      urgency: "Urgente",
      aiRecommendation: "Ajuste de drenaje bloqueado o filtros tapados. MantechPro auto-clasifica este caso bajo HVAC y notifica a 8 especialistas."
    },
    {
      id: 2,
      problem: "Mi auto Toyota Hilux tiembla fuertemente al frenar a alta velocidad",
      asset: "Auto Pick-Up",
      category: "autos",
      specialty: "🚗 Mecánica Automotriz",
      estimatedRate: "B/.. 80.05 - B/.. 140.00",
      time: "Programado (24 horas)",
      techsAvailable: 5,
      urgency: "Normal",
      aiRecommendation: "Desgaste asimétrico de pastillas o discos de freno delanteros cristalizados. Clasificado bajo Mecánica Automotriz."
    },
    {
      id: 3,
      problem: "Planta eléctrica de respaldo CAT de 50 KVA no arranca en transferencia",
      asset: "Planta Eléctrica",
      category: "plantas_electricas",
      specialty: "⚡ Plantas Eléctricas",
      estimatedRate: "B/.. 150.00 - B/.. 300.00",
      time: "Inmediata (Menos de 1 hora)",
      techsAvailable: 3,
      urgency: "Crítico",
      aiRecommendation: "Falla de carga en batería 12V o solenoide atascado. El sistema categoriza la urgencia como crítica para aviso prioritario."
    },
    {
      id: 4,
      problem: "Servidor redundante Dell EMC no inicia y marca error de volumen RAID",
      asset: "Servidor Rack",
      category: "servidores",
      specialty: "🖥️ Servidores y Redes de TI",
      estimatedRate: "B/.. 120.00 - B/.. 250.00",
      time: "Crítico (Inmediato)",
      techsAvailable: 6,
      urgency: "Crítico",
      aiRecommendation: "Falla de disco en arreglo RAID-5. Se despacha alerta SOS a ingenieros de servidores certificados con repuestos."
    }
  ];

  // Navigation for Client & Tech
  const [clientTab, setClientTab] = useState<'dashboard' | 'marketplace' | 'quotes' | 'ai' | 'chat' | 'settings'>('dashboard');
  const [techTab, setTechTab] = useState<'received' | 'agenda' | 'profile' | 'chat' | 'settings'>('received');

  // State
  const [assets, setAssets] = useState<Asset[]>([]);
  const [reminders, setReminders] = useState<MaintenanceReminder[]>([]);
  const [allReminders, setAllReminders] = useState<MaintenanceReminder[]>([]);
  const [technicians, setTechnicians] = useState<TechProfile[]>([]);
  const [requests, setRequests] = useState<JobRequest[]>([]);
  const [agenda, setAgenda] = useState<AgendaEvent[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [selectedTechId, setSelectedTechId] = useState<string | null>(null);

  // Filter for Marketplace
  const [marketFilter, setMarketFilter] = useState<TechCategory | 'all'>('all');

  // Modals UI
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [assetToEdit, setAssetToEdit] = useState<Asset | null>(null);
  const [prefilledDescription, setPrefilledDescription] = useState<string>('');

  // Estados para Pago Embebido
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [activePaymentRequest, setActivePaymentRequest] = useState<JobRequest | null>(null);

  const handleOpenPayment = (req: JobRequest) => {
    setActivePaymentRequest(req);
    setIsPaymentModalOpen(true);
  };
  const [isTechModalOpen, setIsTechModalOpen] = useState(false);
  const [activeTechForModal, setActiveTechForModal] = useState<TechProfile | null>(null);

  // Active chat session selector
  const [activeChatRequestId, setActiveChatRequestId] = useState<string | null>(null);
  const [isEditingTechProfile, setIsEditingTechProfile] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [selectedRequestForReport, setSelectedRequestForReport] = useState<JobRequest | null>(null);

  // Bidding states (Technician drafts quote)
  const [bidPrice, setBidPrice] = useState<string>('');
  const [bidDate, setBidDate] = useState<string>('');
  const [bidTime, setBidTime] = useState<string>('');
  const [bidDuration, setBidDuration] = useState<number>(1); // Default 1 hour
  const [bidTravelTime, setBidTravelTime] = useState<number>(30); // Default 30 min
  const [draftingBidRequestId, setDraftingBidRequestId] = useState<string | null>(null);

  // Review states (Client rates technician)
  const [ratingVal, setRatingVal] = useState<number>(5);
  const [ratingComment, setRatingComment] = useState<string>('');
  const [ratingRequestId, setRatingRequestId] = useState<string | null>(null);

  // Tech profile edit mock
  const [selectedTechProfileId, setSelectedTechProfileId] = useState<string>(() => {
    return localStorage.getItem('mantech_logged_tech_id') || 'tech-1';
  });

  // 2. Listen for Technicians
=======
  // Listener para datos de perfil de usuario extendidos
>>>>>>> 704b6d958a85e1739c0273d956d23c9955ad9baf
  useEffect(() => {
    if (!isLoggedIn || !user) return;

    const unsubUser = onSnapshot(doc(db, "users", user.uid), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setUserData(data);
        if (data.role) setRole(data.role);
        if (data.name) setLoggedInName(data.name);
        if (data.phone) setLoggedInPhone(data.phone);
        if (data.profileImage) setProfileImage(data.profileImage);
        if (data.role === 'tech') {
          const techId = data.techId || `tech-${user.uid}`;
          setSelectedTechProfileId(techId);
        }
      }
    }, (err) => console.error("Firestore User Data Error:", err));

    return () => unsubUser();
  }, [isLoggedIn, user]);

  useEffect(() => {
    const unsubTechs = onSnapshot(collection(db, "technicians"), (snap) => {
      setTechnicians(snap.docs.map(d => ({ id: d.id, ...d.data() })) as TechProfile[]);
    }, (err) => console.error("Firestore Techs Error:", err));
    return () => unsubTechs();
  }, []);

  useEffect(() => {
    if (role !== 'admin') return;
    const unsubAllUsers = onSnapshot(collection(db, "users"), (snap) => {
      setAllUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsubAllUsers();
  }, [role]);

  useEffect(() => {
    if (role !== 'admin') return;
    const unsubTickets = onSnapshot(collection(db, "support_tickets"), (snap) => {
      setSupportTickets(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsubTickets();
  }, [role]);

  useEffect(() => {
    if (!isLoggedIn || !user?.uid) return;
    const q = role === 'admin' ? query(collection(db, "requests"), orderBy("createdAt", "desc")) :
              query(collection(db, "requests"), where(role === 'client' ? 'clientId' : 'techUserId', "==", user.uid));
    const unsubReqs = onSnapshot(q, (snap) => {
      const reqList = snap.docs.map(d => ({ id: d.id, ...d.data() })) as JobRequest[];
      setRequests(reqList);
      if (reqList.length > 0 && !activeChatRequestId) {
        setActiveChatRequestId(reqList[0].id);
      }
    }, (err) => console.error("Firestore Requests Error:", err));
    return () => unsubReqs();
  }, [isLoggedIn, user?.uid, role]);

  useEffect(() => {
    if (!isLoggedIn || !user?.uid || role !== 'client') return;
    const unsubAssets = onSnapshot(query(collection(db, "assets"), where("clientId", "==", user.uid)), (snap) => {
      setAssets(snap.docs.map(d => ({ id: d.id, ...d.data() })) as Asset[]);
    }, (err) => console.error("Firestore Assets Error:", err));
    return () => unsubAssets();
  }, [isLoggedIn, user?.uid, role]);

  useEffect(() => {
    if (!isLoggedIn || !activeChatRequestId) return;
    const q = query(collection(db, "messages"), where("requestId", "==", activeChatRequestId));
    const unsubMsgs = onSnapshot(q, (snap) => {
      const msgs = snap.docs.map(d => {
        const data = d.data();
        let ts = data.timestamp;
        if (ts && typeof ts.toDate === 'function') {
          ts = ts.toDate().toISOString();
        }
        return { id: d.id, ...data, timestamp: ts };
      }) as ChatMessage[];
      setChatMessages(msgs.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()));
    }, (err) => console.error("Firestore Messages Error:", err));
    return () => unsubMsgs();
  }, [isLoggedIn, activeChatRequestId]);

  useEffect(() => {
    // Escuchar inventario de forma global
    const unsubInv = onSnapshot(collection(db, "inventory"), (snap) => {
      setInventory(snap.docs.map(d => ({ id: d.id, ...d.data() })) as InventoryItem[]);
    }, (err) => {
      console.error("Firestore Inventory Error:", err);
      setInventory([]); // No cargar datos de demostración en caso de error
    });
    return () => unsubInv();
  }, []);

  // Handlers
  const handleLogout = async () => { try { await signOut(auth); } catch (e) { console.error(e); } };

  const handleAddItem = async (item: Omit<InventoryItem, 'id'>) => {
    if (!user) {
      alert("Debes estar autenticado para guardar repuestos.");
      return;
    }
    try {
      await addDoc(collection(db, "inventory"), item);
      alert("Item guardado con éxito.");
    } catch (err: any) {
      console.error("Add Item Error:", err);
      alert("Error de permisos: Asegúrate de haber desplegado las nuevas reglas de Firestore.");
    }
  };

  const handleUpdateInventoryQuantity = async (id: string, delta: number) => {
    const item = inventory.find(i => i.id === id);
    if (!item) return;
    try {
      await updateDoc(doc(db, "inventory", id), {
        quantity: Math.max(0, item.quantity + delta)
      });
    } catch (err) { console.error(err); }
  };

  const handleUpdateInventoryItem = async (item: InventoryItem) => {
    try {
      const { id, ...data } = item;
      await updateDoc(doc(db, "inventory", id), data as any);
      alert("Item actualizado con éxito.");
    } catch (err) {
      console.error(err);
      alert("Error al actualizar el item.");
    }
  };

  const handleDeleteInventoryItem = async (id: string) => {
    if (window.confirm("¿Eliminar item?")) await deleteDoc(doc(db, "inventory", id));
  };

  const handleUploadDoc = async (type: 'id' | 'record', file: File) => {
    if (!user) return;

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;

        await updateDoc(doc(db, "users", user.uid), {
          [type === 'id' ? 'idCardUrl' : 'policeRecordUrl']: base64String,
          [type === 'id' ? 'idStatus' : 'recordStatus']: 'pending'
        });

<<<<<<< HEAD
        // SINCRONIZAR O CREAR RECORDATORIO ASOCIADO
        const qRem = query(collection(db, "reminders"), where("assetId", "==", assetToEdit.id));
        const snapRem = await getDocs(qRem);

        const daysUntilNext = Math.ceil((new Date(newAssetData.nextMaintenanceDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        let status: 'pending' | 'urgent' = 'pending';
        if (daysUntilNext <= 7) status = 'urgent';

        const reminderData = {
          clientId: user.uid,
          assetId: assetToEdit.id,
          title: `Mantenimiento de Rutina - ${newAssetData.name}`,
          dueDate: newAssetData.nextMaintenanceDate,
          description: `Fecha de atención programada para el ${newAssetData.nextMaintenanceDate} (${newAssetData.details || 'Sin detalles'}).`,
          status: status,
          updatedAt: serverTimestamp()
        };

        if (!snapRem.empty) {
          // Actualizar todos los recordatorios vinculados a este activo
          for (const docRem of snapRem.docs) {
            await updateDoc(doc(db, "reminders", docRem.id), reminderData);
          }
        } else {
          // Crear uno nuevo si no existía
          await addDoc(collection(db, "reminders"), {
            ...reminderData,
            type: 'general',
            createdAt: serverTimestamp()
          });
        }

        alert("¡Activo y recordatorios actualizados correctamente!");
        setAssetToEdit(null);
      } else {
        // CREAR NUEVO ACTIVO
        const newAsset = {
          ...cleanAssetData,
          clientId: user.uid,
          registeredAt: new Date().toISOString().split('T')[0],
          createdAt: serverTimestamp()
        };

        const assetRef = await addDoc(collection(db, "assets"), newAsset);

        const daysUntilNext = Math.ceil((new Date(newAssetData.nextMaintenanceDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        let status: 'pending' | 'urgent' = 'pending';
        if (daysUntilNext <= 7) status = 'urgent';

        const newReminder = {
          clientId: user.uid,
          assetId: assetRef.id,
          title: `Mantenimiento de Rutina - ${newAssetData.name}`,
          description: `Fecha de atención programada para el ${newAssetData.nextMaintenanceDate} (${newAssetData.details || 'Sin detalles'}).`,
          dueDate: newAssetData.nextMaintenanceDate,
          status: status,
          type: 'general',
          createdAt: serverTimestamp()
        };

        await addDoc(collection(db, "reminders"), newReminder);
        alert("¡Activo registrado con éxito!");
      }
    } catch (err: any) {
      console.error("Asset Action Error:", err);
      alert("Error al procesar el activo: " + err.message);
    }
  };

  const handleDeleteAsset = async (assetId: string) => {
    if (!user) return;
    if (!window.confirm("¿Estás seguro de que deseas eliminar este activo? Se borrarán también sus recordatorios.")) return;

    try {
      // 1. Borrar Recordatorios asociados primero (usando filtro de seguridad clientId)
      const qRem = query(
        collection(db, "reminders"),
        where("assetId", "==", assetId),
        where("clientId", "==", user.uid)
      );
      const snapRem = await getDocs(qRem);

      const deletePromises = snapRem.docs.map(d => deleteDoc(doc(db, "reminders", d.id)));
      await Promise.all(deletePromises);

      // 2. Borrar Activo después
      await deleteDoc(doc(db, "assets", assetId));

      alert("Activo y recordatorios eliminados correctamente.");
    } catch (err: any) {
      console.error("Delete Asset Error:", err);
      alert("Error al eliminar: " + err.message);
    }
  };

  // Client trigger "Solicitar Técnico" from reminder
  const handleRequestTechFromReminder = (reminder: MaintenanceReminder) => {
    const asset = assets.find(a => a.id === reminder.assetId);
    if (!asset) return;

    // Extraer detalle limpio de la descripción del recordatorio
    const detail = reminder.description.includes('(')
      ? reminder.description.split('(')[1].replace(').', '')
      : reminder.description;

    setPrefilledDescription(`Solicitud de mantenimiento para ${asset.name}. Detalle: ${detail}`);

    // Direct pre-filtering of technician categories based on reminder/asset type
    let targetCategory: TechCategory = 'mecanico';
    if (asset.type === 'ac') targetCategory = 'tecnico_ac';
    else if (asset.type === 'computer') targetCategory = 'informatico';
    else if (asset.type === 'generator') targetCategory = 'electricista';
    else if (asset.type === 'solar_panels') targetCategory = 'especialista_solar';

    setMarketFilter(targetCategory);
    setClientTab('marketplace');
  };

  // Client submit quote request
  const handleRequestQuote = async (techId: string, assetId: string, description: string, suggestedDate?: string, suggestedTime?: string) => {
    if (!user) return;
    const selectedTech = technicians.find(t => t.id === techId);
    const selectedAsset = assets.find(a => a.id === assetId);
    if (!selectedTech || !selectedAsset) return;

    // VERIFICACIÓN DE PLAN - Límite de 3 solicitudes para plan básico
    if (selectedTech.plan === 'basic' && (selectedTech.requestsUsedThisMonth || 0) >= 3) {
      alert(`⚠️ El técnico ${selectedTech.name} ha alcanzado su límite de 3 solicitudes mensuales gratuitas. Invítalo a subir a Mantech Pro Premium ($8/mes) para recibir tu trabajo.`);
      return;
    }

    try {
      const newRequest = {
        clientId: user.uid,
        clientName: loggedInName,
        assetId: assetId,
        assetName: selectedAsset.name,
        techId: techId,
        techUserId: selectedTech.userId || null,
        techName: selectedTech.name,
        description: description,
        status: 'pending',
        createdAt: serverTimestamp(),
        scheduledDate: suggestedDate || '',
        scheduledTime: suggestedTime || '',
        checklist: [
          { id: '1', description: 'Inspección inicial del equipo', isCompleted: false },
          { id: '2', description: 'Pruebas de funcionamiento post-reparación', isCompleted: false }
        ],
        materials: []
=======
        alert(`¡${type === 'id' ? 'Cédula' : 'Récord'} subido con éxito! Pendiente de validación.`);
>>>>>>> 704b6d958a85e1739c0273d956d23c9955ad9baf
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      console.error("Upload Error:", err);
      alert("Error al procesar el archivo: " + err.message);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    try {
      if (authMode === 'register') {
        const res = await createUserWithEmailAndPassword(auth, loginEmail, loginPassword);
        const u = res.user;
        const tId = authRole === 'tech' ? `tech-${Date.now()}` : null;
        await setDoc(doc(db, "users", u.uid), { uid: u.uid, email: loginEmail, name: loginName, role: authRole, techId: tId, createdAt: serverTimestamp() });
        if (authRole === 'tech' && tId) {
          await setDoc(doc(db, "technicians", tId), { id: tId, name: loginName, category: 'mecanico', title: 'Técnico Especialista', rating: 5.0, reviewCount: 0, experienceYears: 5, location: 'Panamá', hourlyRate: 25, bio: 'Técnico certificado.', certifications: [], portfolioImages: [], plan: 'basic', userId: u.uid });
        }
      } else {
        await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
      }
    } catch (err: any) {
      let message = "Error de autenticación";
      if (err.code === 'auth/invalid-credential') message = "Credenciales incorrectas";
      if (err.code === 'auth/user-not-found') message = "Usuario no registrado";
      if (err.code === 'auth/wrong-password') message = "Contraseña incorrecta";
      if (err.code === 'auth/invalid-email') message = "Email inválido";
      if (err.code === 'auth/email-already-in-use') message = "El email ya está en uso";
      if (err.code === 'auth/weak-password') message = "Contraseña muy débil";

      setAuthError(message);
    }
  };

  const handleAddAsset = async (data: any) => {
    if (!user) return;
    if (assetToEdit) {
      try {
        await updateDoc(doc(db, "assets", assetToEdit.id), { ...data });
        alert("¡Activo actualizado!");
      } catch (err) { console.error(err); }
    } else {
      await addDoc(collection(db, "assets"), { ...data, clientId: user.uid, registeredAt: new Date().toISOString().split('T')[0] });
    }
    setIsAssetModalOpen(false);
    setAssetToEdit(null);
  };

  const handleDeleteAsset = async (id: string) => {
    if (window.confirm("¿Eliminar equipo?")) await deleteDoc(doc(db, "assets", id));
  };

  const handleReportTechnicianFailure = async (requestId: string) => {
    if (!window.confirm("⚠️ ¿El técnico no concluyó el trabajo contratado? Se procederá a cancelar el servicio y el técnico recibirá únicamente el 5% del valor por inspección inicial. ¿Deseas reportar el incumplimiento?")) return;
    try {
      await updateDoc(doc(db, "requests", requestId), {
        status: 'cancelled',
        cancelledAt: serverTimestamp(),
        cancellationReason: 'Incumplimiento del técnico / Penalidad 5% aplicada',
        penaltyApplied: true,
        penaltyPercentage: 5
      });

      await addDoc(collection(db, "messages"), {
        requestId,
        sender: 'client',
        text: "🚨 EL CLIENTE HA REPORTADO INCUMPLIMIENTO. Se ha aplicado una penalidad del 95%. Solo recibirás el 5% del valor base por inspección.",
        timestamp: serverTimestamp(),
        isSystem: true
      });
      alert("Reporte enviado. El soporte técnico revisará el caso y se ha aplicado la penalidad automática.");
    } catch (err) { console.error(err); }
  };

  const handleCancelRequest = async (requestId: string) => {
    const req = requests.find(r => r.id === requestId);
    if (!req) return;

    let penaltyMessage = "Cancelado por cliente";
    let refundInfo = "Se aplicarán las políticas de reembolso vigentes.";

    if (req.status === 'executing' || req.status === 'unforeseen' || req.status === 'unforeseen_paid') {
      if (!window.confirm("⚠️ CANCELACIÓN EN EJECUCIÓN: Se ha detectado un avance de obra. Según las políticas de MantechPro, se procederá a liquidar el avance realizado (50% aprox) bajo informe técnico por falta de presupuesto. ¿Deseas proceder?")) return;
      penaltyMessage = "Falta de presupuesto / Avance 50%";
    } else {
      if (!window.confirm("¿Deseas cancelar el servicio? " + refundInfo)) return;
    }

    try {
      await updateDoc(doc(db, "requests", requestId), {
        status: 'cancelled',
        cancelledAt: serverTimestamp(),
        cancellationReason: penaltyMessage
      });

      // Enviar mensaje al chat
      await addDoc(collection(db, "messages"), {
        requestId: requestId,
        sender: 'client',
        text: `🚫 EL CLIENTE HA CANCELADO EL SERVICIO. Motivo: ${penaltyMessage}`,
        timestamp: serverTimestamp(),
        isSystem: true
      });

      alert("Solicitud cancelada. El técnico ha sido notificado vía chat.");
    } catch (err) { console.error(err); }
  };

  const handleRejectRequest = async (requestId: string) => {
    if(!window.confirm("¿Deseas rechazar esta solicitud de servicio?")) return;
    try {
      await updateDoc(doc(db, "requests", requestId), {
        status: 'rejected',
        rejectedAt: serverTimestamp()
      });
      alert("Solicitud rechazada.");
    } catch (err) { console.error(err); }
  };

  const handleSendQuote = async (requestId: string) => {
    const inputs = quoteInputs[requestId];
    if (!inputs?.price || isNaN(Number(inputs.price))) {
      alert("Por favor ingrese un monto válido en el panel de control.");
      return;
    }

    if (!inputs.date || !inputs.time) {
      alert("Por favor asigne una fecha y hora para el servicio.");
      return;
    }

    const amount = Number(inputs.price);
    const commission = amount * 0.15;
    const technicianEarnings = amount - commission;

    try {
      await updateDoc(doc(db, "requests", requestId), {
        status: 'quoted',
        price: amount,
        commission: commission,
        technicianEarnings: technicianEarnings,
        scheduledDate: inputs.date,
        scheduledTime: inputs.time,
        scheduledDuration: Number(inputs.duration) || 1,
        scheduledTravelTime: Number(inputs.travelTime) || 30,
        materials: inputs.materials || []
      });
      alert("✅ Cotización y Agenda enviadas con éxito.");
      // Limpiar input
      setQuoteInputs(prev => {
        const next = { ...prev };
        delete next[requestId];
        return next;
      });
    } catch (err) {
      console.error(err);
      alert("Error al enviar cotización.");
    }
  };

  const handleTriggerUnforeseen = async (requestId: string, reason: string, extraCost: number, category: string, compromises: boolean) => {
    try {
      await updateDoc(doc(db, "requests", requestId), {
        status: 'unforeseen',
        unforeseenReason: reason,
        unforeseenAmount: extraCost,
        unforeseenCategory: category,
        compromisesWarranty: compromises,
        unforeseenAt: serverTimestamp()
      });

      // Mensaje al chat
      await addDoc(collection(db, "messages"), {
        requestId: requestId,
        sender: 'tech',
        text: `⚠️ REPORTE DE IMPREVISTO [${category.toUpperCase()}]: ${reason}. Costo: $${extraCost}. ${compromises ? '❗ NOTA: Esto compromete la garantía del servicio.' : ''}`,
        timestamp: serverTimestamp(),
        isSystem: true
      });

      alert("Imprevisto reportado y enviado al chat del cliente.");
    } catch (err) { console.error(err); }
  };

  const handlePayRequest = async (requestId: string) => {
    const req = requests.find(r => r.id === requestId);
    if (!req) return;

    // Verificar regla de 24 horas
    if (req.scheduledDate && req.scheduledTime) {
      const scheduledDT = new Date(`${req.scheduledDate}T${req.scheduledTime}`);
      const now = new Date();
      const diffMs = scheduledDT.getTime() - now.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);

      if (diffHours < 24) {
        if (!window.confirm("⚠️ POLÍTICA DE TIEMPO: MantechPro requiere pagos con 24h de antelación. Faltan menos de 24 horas para la cita. ¿Deseas proceder con el pago de emergencia? (Sujeto a disponibilidad del técnico)")) return;
      }
    }

    try {
      await updateDoc(doc(db, "requests", requestId), {
        status: 'payment_verifying',
        paymentSubmittedAt: serverTimestamp()
      });
      alert("✅ Solicitud de pago enviada. El Administrador verificará la transacción en breve.");

      await addDoc(collection(db, "messages"), {
        requestId,
        sender: 'client',
        text: "💳 HE REALIZADO EL PAGO. Pendiente de verificación por el Administrador.",
        timestamp: serverTimestamp(),
        isSystem: true
      });
    } catch (err) {
      console.error(err);
      alert("Error al procesar el pago.");
    }
  };

  const handleApprovePayment = async (requestId: string) => {
    if(!window.confirm("¿Confirmar que el pago ha sido recibido en la cuenta bancaria de MantechPro?")) return;
    try {
      await updateDoc(doc(db, "requests", requestId), {
        status: 'accepted',
        paidAt: serverTimestamp()
      });
      alert("✅ Pago confirmado. El servicio ha sido activado.");

      await addDoc(collection(db, "messages"), {
        requestId,
        sender: 'client',
        text: "✅ PAGO VERIFICADO Y ACEPTADO. El servicio está ahora en agenda oficial.",
        timestamp: serverTimestamp(),
        isSystem: true
      });
    } catch (err) { console.error(err); }
  };

  const handlePayUnforeseen = async (requestId: string) => {
    try {
      await updateDoc(doc(db, "requests", requestId), {
        status: 'unforeseen_verifying',
        unforeseenPaymentSubmittedAt: serverTimestamp()
      });
      alert("✅ Solicitud de pago de imprevisto enviada. El Administrador verificará la transacción.");

      await addDoc(collection(db, "messages"), {
        requestId,
        sender: 'client',
        text: "💳 HE PAGADO EL IMPREVISTO. Pendiente de verificación por el Administrador.",
        timestamp: serverTimestamp(),
        isSystem: true
      });
    } catch (err) { console.error(err); }
  };

  const handleApproveUnforeseenPayment = async (requestId: string) => {
    if(!window.confirm("¿Confirmar que el pago del IMPREVISTO ha sido recibido?")) return;
    try {
      await updateDoc(doc(db, "requests", requestId), {
        status: 'unforeseen_paid',
        unforeseenPaidAt: serverTimestamp()
      });
      alert("✅ Pago de imprevisto confirmado.");

      await addDoc(collection(db, "messages"), {
        requestId,
        sender: 'client',
        text: "✅ PAGO DE IMPREVISTO VERIFICADO. El técnico puede continuar con el trabajo.",
        timestamp: serverTimestamp(),
        isSystem: true
      });
    } catch (err) { console.error(err); }
  };

  const handleStartWork = async (requestId: string) => {
    try {
      await updateDoc(doc(db, "requests", requestId), {
        status: 'executing',
        visitStartedAt: serverTimestamp()
      });
      setTimers(prev => ({
        ...prev,
        [requestId]: { startTime: Date.now(), elapsed: 0, isRunning: true }
      }));

      await addDoc(collection(db, "messages"), {
        requestId,
        sender: 'tech',
        text: "🏁 TRABAJO INICIADO. El cronómetro de servicio está corriendo.",
        timestamp: serverTimestamp(),
        isSystem: true
      });
    } catch (err) { console.error(err); }
  };

  const handleNextDayReschedule = async (requestId: string) => {
    const reason = prompt("Indique el motivo por el cual el servicio requiere continuar el siguiente día:");
    if (!reason) return;
    try {
      await updateDoc(doc(db, "requests", requestId), {
        status: 'accepted', // Vuelve a agendado pero con bandera de re-programación
        isRescheduled: true,
        rescheduleReason: reason,
        visitStartedAt: null // Limpiar para el siguiente inicio
      });
      // Detener timer
      setTimers(prev => {
        const next = { ...prev };
        if (next[requestId]) next[requestId].isRunning = false;
        return next;
      });

      await addDoc(collection(db, "messages"), {
        requestId,
        sender: 'tech',
        text: `⏳ CONTINUACIÓN PENDIENTE: El técnico ha pausado el trabajo para continuar el siguiente día. Motivo: ${reason}`,
        timestamp: serverTimestamp(),
        isSystem: true
      });
      alert("Servicio pausado. El estado ha vuelto a 'Agendado' para continuar mañana.");
    } catch (err) { console.error(err); }
  };

  const handleSaveMaterial = async (requestId: string, name: string, price: number, quantity: number, category: string) => {
     if(!name || price < 0 || quantity <= 0) return;
     const req = requests.find(r => r.id === requestId);
     if(!req) return;
     const newMaterials = [...(req.materials || []), { name, price, quantity, category, addedAt: new Date().toISOString() }];
     try {
       await updateDoc(doc(db, "requests", requestId), { materials: newMaterials });

       // Mensaje al chat opcional para transparencia
       await addDoc(collection(db, "messages"), {
         requestId,
         sender: 'tech',
         text: `📦 MATERIAL AÑADIDO: ${name} (x${quantity}) - $${(price * quantity).toFixed(2)}`,
         timestamp: serverTimestamp(),
         isSystem: true
       });
     } catch (e) { console.error(e); }
  };

  const handleAddTask = async (requestId: string, taskLabel: string) => {
     const req = requests.find(r => r.id === requestId);
     if(!req) return;
     const newChecklist = [...(req.checklist || []), { id: Date.now().toString(), label: taskLabel, status: 'pending' }];
     await updateDoc(doc(db, "requests", requestId), { checklist: newChecklist });
  };

  const handleFinishService = async (requestId: string) => {
    const req = requests.find(r => r.id === requestId);
    if (!req) return;

    if (!req.clientSignature) {
       alert("⚠️ REQUISITO DE SEGURIDAD: Es obligatoria la firma digital del cliente en sitio para finalizar el servicio y liberar los fondos en garantía.");
       setIsSignatureModalOpen(true);
       setActiveChatRequestId(requestId); // Para que el modal sepa a qué request pertenece
       return;
    }

    try {
      await updateDoc(doc(db, "requests", requestId), {
        status: 'completed',
        visitFinishedAt: serverTimestamp()
      });
      // Detener timer si sigue corriendo
      setTimers(prev => {
        const next = { ...prev };
        if (next[requestId]) next[requestId].isRunning = false;
        return next;
      });
      alert("✅ Servicio finalizado con éxito. El reporte ha sido generado.");
    } catch (err) { console.error(err); }
  };

  const handleSaveSignature = async (signatureBase64: string) => {
    const reqId = activeChatRequestId;
    if (!reqId) return;
    try {
      await updateDoc(doc(db, "requests", reqId), {
        clientSignature: signatureBase64
      });
      alert("✍️ Firma registrada correctamente.");
      setIsSignatureModalOpen(false);
      // Intentar finalizar automáticamente después de firmar si el técnico lo solicitó
      handleFinishService(reqId);
    } catch (err) { console.error(err); }
  };

  const handleDeleteMaterial = async (requestId: string, index: number) => {
     if(!window.confirm("¿Eliminar este material?")) return;
     const req = requests.find(r => r.id === requestId);
     if(!req || !req.materials) return;
     const newMaterials = req.materials.filter((_, i) => i !== index);
     await updateDoc(doc(db, "requests", requestId), { materials: newMaterials });
  };

  const handleRequestQuote = async (techId: string, assetId: string, description: string) => {
    if (!user) return;
    const tech = technicians.find(t => t.id === techId);
    const asset = assets.find(a => a.id === assetId);
    if (!tech || !asset) return;

    try {
      await addDoc(collection(db, "requests"), {
        clientId: user.uid,
        clientName: loggedInName,
        clientPhone: loggedInPhone,
        techId,
        techName: tech.name,
        techUserId: tech.userId || null,
        assetId,
        assetName: asset.name,
        assetDetails: asset.details,
        description,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      alert("¡Solicitud enviada! El técnico revisará tu caso pronto.");
      setIsTechModalOpen(false);
      setClientTab('quotes');
    } catch (err) { console.error(err); }
  };

  const handleUpdateTechProfile = async (updatedData: Partial<TechProfile>) => {
    if (!selectedTechProfileId) return;
    try {
      await updateDoc(doc(db, "technicians", selectedTechProfileId), { ...updatedData });
      alert("¡Perfil actualizado!");
      setIsEditingTechProfile(false);
    } catch (err: any) { alert("Error: " + err.message); }
  };

  const getSelectedTechProfileObj = () => {
    return technicians.find(t => t.id === selectedTechProfileId) || {
      id: selectedTechProfileId,
      name: loggedInName,
      category: 'mecanico',
      title: 'Técnico Especialista',
      rating: 5.0,
      reviewCount: 0,
      experienceYears: 5,
      location: 'Panamá',
      hourlyRate: 25,
      bio: '',
      certifications: [],
      portfolioImages: [],
      plan: 'basic',
      wallet: { balance: 0, pendingBalance: 0, transactions: [] }
    } as TechProfile;
  };

  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [supportTickets, setSupportTickets] = useState<any[]>([]);
  const [selectedDocUrl, setSelectedDocUrl] = useState<string | null>(null);

  const handleDownloadLogo = () => {
    const svgElement = document.getElementById('mantech-pro-svg');
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);
    const downloadLink = document.createElement('a');
    downloadLink.href = svgUrl;
    downloadLink.download = 'MantechPro_Logo_Master.svg';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  const handleDeleteTicket = async (id: string) => {
    if (window.confirm("¿Estás seguro de eliminar este ticket de soporte?")) {
      try {
        await deleteDoc(doc(db, "support_tickets", id));
        alert("Ticket eliminado del sistema.");
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleEditTicket = async (ticket: any) => {
    const newSubject = prompt("Editar Asunto:", ticket.subject);
    const newMessage = prompt("Editar Mensaje:", ticket.message);
    if (newSubject !== null && newMessage !== null) {
      try {
        await updateDoc(doc(db, "support_tickets", ticket.id), {
          subject: newSubject,
          message: newMessage
        });
        alert("Ticket actualizado.");
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleDeleteUser = async (u: any) => {
    if (u.id === user?.uid) {
      alert("No puedes borrar tu propia cuenta administrativa desde aquí.");
      return;
    }
    if (window.confirm(`⚠️ ADVERTENCIA MASTER: ¿Deseas ELIMINAR permanentemente a "${u.name || u.email}"? Esta acción borrará su acceso y perfil del sistema.`)) {
      try {
        await deleteDoc(doc(db, "users", u.id));
        // Si es técnico, también intentar borrar su perfil comercial
        if (u.role === 'tech') {
          await deleteDoc(doc(db, "technicians", u.techId || `tech-${u.id}`));
        }
        alert("Usuario eliminado correctamente.");
      } catch (err) {
        console.error(err);
        alert("Error de permisos al intentar borrar.");
      }
    }
  };

  const handleEditUser = async (u: any) => {
    if (u.role === 'tech') {
      const tech = technicians.find(t => t.id === (u.techId || `tech-${u.id}`));
      const action = window.confirm(`Editar técnico "${u.name}":\n\nOK -> Cambiar Certificación Oficial\nCancelar -> Cambiar Notas Administrativas Internas`);

      if (action) {
        const newTitle = prompt(`Actualizar certificación de "${u.name}":`, tech?.title || 'Técnico Certificado');
        if (newTitle !== null) {
          try {
            await updateDoc(doc(db, "technicians", u.techId || `tech-${u.id}`), { title: newTitle });
            alert("Certificación oficial actualizada.");
          } catch (err) { console.error(err); }
        }
      } else {
        const newNotes = prompt(`Notas administrativas internas para "${u.name}":`, tech?.adminNotes || '');
        if (newNotes !== null) {
          try {
            await updateDoc(doc(db, "technicians", u.techId || `tech-${u.id}`), { adminNotes: newNotes });
            alert("Notas administrativas actualizadas.");
          } catch (err) { console.error(err); }
        }
      }
      return;
    }

    const newName = prompt(`Cambiar nombre oficial de "${u.name}":`, u.name);
    if (newName !== null && newName.trim() !== "") {
      try {
        await updateDoc(doc(db, "users", u.id), { name: newName });
        if (u.role === 'tech') {
          await updateDoc(doc(db, "technicians", u.techId || `tech-${u.id}`), { name: newName });
        }
        alert("Nombre actualizado por el Administrador.");
      } catch (err) {
        console.error(err);
      }
    }
  };

  if (isAuthResolving) return (
    <div className="min-h-screen bg-[#0d0e12] flex flex-col items-center justify-center">
      <AppLogo size="lg" className="animate-pulse" />
      <p className="text-[#c8c4d9] font-black uppercase tracking-[0.4em] mt-8">Inicializando...</p>
    </div>
  );

  if (!isLoggedIn) {
<<<<<<< HEAD
    const renderLoginContent = () => (
      <div className="flex-grow flex flex-col justify-center items-center py-6 px-4 text-zinc-900 select-none">
        <div className="w-full max-w-md bg-white rounded-3xl border border-zinc-200/90 p-6 md:p-8 shadow-2xl space-y-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500"></div>
          
          {/* Logo area */}
          <div className="text-center space-y-1">
            <div className="w-14 h-14 bg-indigo-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-indigo-200 relative group">
              <div className="absolute inset-0 bg-indigo-500 rounded-2xl blur-md opacity-40 group-hover:opacity-100 transition-opacity"></div>
              <div className="w-6 h-6 bg-white rounded-lg relative z-10 flex items-center justify-center font-black text-indigo-600 text-sm">M</div>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-zinc-950 mt-3 flex items-center justify-center gap-1">
              Mantech<span className="text-indigo-600">Pro</span>
              <span className="text-[10px] bg-indigo-100 text-indigo-700 font-extrabold px-1.5 py-0.5 rounded-full uppercase scale-90">v2.6</span>
            </h1>
            <p className="text-[9px] text-zinc-400 uppercase font-black tracking-widest">El Ecosistema Técnico Número #1 en Panamá</p>
          </div>

          {/* Login/Register Toggle */}
          <div className="flex justify-center gap-4 border-b border-zinc-100 pb-2">
            <button
              onClick={() => { setAuthMode('login'); setAuthError(''); }}
              className={`text-xs font-black uppercase tracking-widest pb-1 transition-all ${authMode === 'login' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-zinc-400 hover:text-zinc-600'}`}
            >
              Iniciar Sesión
            </button>
            <button
              onClick={() => { setAuthMode('register'); setAuthError(''); }}
              className={`text-xs font-black uppercase tracking-widest pb-1 transition-all ${authMode === 'register' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-zinc-400 hover:text-zinc-600'}`}
            >
              Registrarse
            </button>
          </div>

          {/* Role Tab Selector */}
          <div className="space-y-1">
            <span className="block text-[9px] font-black uppercase text-zinc-400 tracking-wider text-center">Selecciona tu Perfil de Acceso</span>
            <div className="grid grid-cols-2 gap-1 bg-zinc-100 p-1 rounded-2xl border border-zinc-200/60 font-sans">
              <button
                type="button"
                onClick={() => { setAuthTab('client'); setAuthError(''); }}
                className={`py-2 px-3 rounded-xl text-[11px] font-black uppercase tracking-wide transition-all cursor-pointer ${
                  authTab === 'client' 
                    ? 'bg-zinc-950 text-white shadow-md font-extrabold scale-[1.02]'
                    : 'text-zinc-500 hover:text-zinc-800 hover:bg-zinc-200/50'
                }`}
              >
                💼 Soy Cliente
              </button>
              <button
                type="button"
                onClick={() => { setAuthTab('tech'); setAuthError(''); }}
                className={`py-2 px-3 rounded-xl text-[11px] font-black uppercase tracking-wide transition-all cursor-pointer ${
                  authTab === 'tech'
                    ? 'bg-indigo-600 text-white shadow-md font-extrabold scale-[1.02]'
                    : 'text-zinc-500 hover:text-indigo-800 hover:bg-indigo-50'
                }`}
              >
                🛠️ Soy Técnico
              </button>
              <button
                type="button"
                onClick={() => { setAuthTab('admin'); setAuthError(''); }}
                className={`py-2 px-3 rounded-xl text-[11px] font-black uppercase tracking-wide transition-all cursor-pointer col-span-2 mt-1 ${
                  authTab === 'admin'
                    ? 'bg-red-600 text-white shadow-md font-extrabold scale-[1.02]'
                    : 'text-zinc-500 hover:text-red-800 hover:bg-red-50'
                }`}
              >
                🔐 Administrador
              </button>
            </div>
          </div>

          <div className="space-y-4 font-sans">
            {authMode === 'login' && (
              <>
                <div className="text-center bg-zinc-50 p-3 rounded-2xl border border-zinc-100">
                  <p className="text-xs text-zinc-600 leading-relaxed font-semibold">
                    {authTab === 'client'
                      ? 'Como CLIENTE: Sube reportes de fallas, cotiza de forma libre, monitorea tu inventario y califica proveedores.'
                      : authTab === 'tech'
                        ? 'Como TÉCNICO: Recibe alertas de clientes en Panamá, envía cotizaciones detalladas y administra tu agenda premium.'
                        : 'CONTROL CENTRAL: Monitoreo de finanzas, gestión de usuarios y logística operativa de Mantenimientos S.A.'
                    }
                  </p>
                </div>

                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-zinc-200"></div>
                  <span className="flex-shrink mx-3 text-[9px] text-zinc-400 font-black uppercase tracking-widest">Identificación de Usuario</span>
                  <div className="flex-grow border-t border-zinc-200"></div>
                </div>
              </>
            )}

            {/* Login/Register Form */}
            <form onSubmit={(e) => {
              e.preventDefault();
              if (authMode === 'register') {
                if (!loginEmail || !loginPassword || !loginName) {
                  setAuthError('Por favor completa todos los campos');
                  return;
                }
                handleLogin(null, authTab, loginEmail, loginName);
              } else {
                handleLogin(e, authTab);
              }
            }} className="space-y-4">

              {authMode === 'register' && (
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black text-zinc-500 block">Nombre Completo</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={loginName}
                      onChange={(e) => setLoginName(e.target.value)}
                      placeholder="Ej: Rubén Ábrego"
                      className="w-full pl-4 pr-10 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl text-xs font-bold text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-inner"
                    />
                    <Users className="absolute right-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-black text-zinc-500 block">Correo electrónico de Panamá</label>
                <div className="relative">
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder={authTab === 'client' ? 'ejemplo@correo.com' : 'tecnico@mantech.com'}
                    className="w-full pl-4 pr-10 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl text-xs font-bold text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-inner"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 text-xs font-bold">@</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-black text-zinc-500 block">Contraseña de Enlace</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-4 pr-12 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl text-xs font-bold text-zinc-800 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-inner"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-zinc-400 hover:text-indigo-600 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {authMode === 'login' && (
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={handleResetPassword}
                      className="text-[10px] text-indigo-600 hover:underline font-bold cursor-pointer"
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  </div>
                )}
              </div>

              {authError && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <p className="text-red-700 text-[10px] uppercase font-black tracking-wide leading-none">{authError}</p>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3.5 bg-zinc-950 hover:bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-md hover:shadow-indigo-100 flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <span>{authMode === 'login' ? 'INGRESAR DE FORMA SEGURA' : 'CREAR CUENTA AHORA'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </form>

            {/* Security Trust badge */}
            <div className="text-center pt-2 border-t border-zinc-100/80">
              <span className="text-[9px] text-zinc-400 font-extrabold font-mono uppercase tracking-widest flex items-center justify-center gap-1 leading-none">
                🔒 Panamá Hub Security • Autenticación Encriptada
              </span>
              <span className="block text-[8px] text-zinc-400 font-sans mt-1">Conexión certificada SSL respaldada contra accesos no autorizados.</span>
            </div>

          </div>
        </div>
      </div>
    );

=======
>>>>>>> 704b6d958a85e1739c0273d956d23c9955ad9baf
    return (
      <div className="min-h-screen bg-[#0d0e12] text-[#e3e2e8] flex flex-col grid-bg overflow-x-hidden">
        <header className="h-20 px-8 md:px-16 flex items-center justify-between relative z-20">
          <div className="flex items-center gap-3">
            <AppLogo size="md" />
            <div className="flex flex-col leading-none">
              <span className="text-xl font-black tracking-tight">MantechPro</span>
              <span className="text-[10px] font-bold text-[#c8c4d9] uppercase tracking-widest">Industries Inc.</span>
            </div>
          </div>
<<<<<<< HEAD
        </nav>

        {/* Dynamic Frame Selector */}
        <div className="flex-grow flex items-center justify-center p-4">
          <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch bg-zinc-900/60 p-4 md:p-8 lg:p-10 rounded-3xl border border-zinc-800/80 shadow-2xl relative">
              <div className="absolute -top-12 -left-12 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>
              <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-emerald-600/5 rounded-full blur-3xl pointer-events-none"></div>

              {/* Left Column: Premium Pitch & Live System Demo */}
              <div className="lg:col-span-6 flex flex-col justify-between space-y-6 select-none">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 text-[9px] font-black tracking-widest text-emerald-400 bg-emerald-950/70 rounded-full border border-emerald-800/60 uppercase">
                    <Sparkles className="w-3 h-3 text-emerald-400 animate-spin" />
                    Plataforma Líder en Panamá
                  </div>
                  <h2 className="text-4xl font-black text-white tracking-tight leading-tight">
                    Mantech<span className="text-indigo-400">Pro</span>: Gestión Inteligente de Reparaciones
                  </h2>
                  <p className="text-xs text-zinc-300 font-medium leading-relaxed font-sans max-w-lg">
                    Conectamos el inventario privado de tus equipos (autos, aires, servidores, plantas eléctricas) con técnicos certificados en Panamá de forma segura, cotizaciones transparentes de libre competencia y control total.
                  </p>
                </div>

                {/* Real interactive Feature Showcase & Trial */}
                <div className="bg-zinc-950/80 rounded-2xl border border-zinc-800/80 p-5 space-y-4 font-sans relative">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-black text-zinc-400 tracking-wider flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      Demostración Activa del Motor de Clasificación
                    </span>
                    <span className="text-[8px] bg-indigo-950 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-900/50 font-mono">
                      PRE-LOGIN TRIAL
                    </span>
                  </div>

                  <p className="text-[11px] text-zinc-400 font-medium">
                    Haz clic en uno de los problemas simulados más comunes en Panamá para ver cómo nuestro sistema inteligente lo procesa automáticamente antes de registrarlo:
                  </p>

                  {/* Dynamic Buttons of selector */}
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    {demoProblems.map((p) => {
                      const isActive = demoSelectedId === p.id;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setDemoSelectedId(p.id)}
                          className={`p-2 rounded-xl text-left border transition-all duration-200 flex flex-col justify-between cursor-pointer ${
                            isActive 
                              ? 'bg-indigo-950/90 border-indigo-500/85 text-indigo-100 shadow-lg shadow-indigo-950/20 scale-[1.02]' 
                              : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-800/60'
                          }`}
                        >
                          <span className="font-extrabold line-clamp-1 block text-zinc-200">{p.asset}</span>
                          <span className="text-[9.5px] truncate mt-0.5 font-medium leading-tight block">{p.problem}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Processing output animation preview */}
                  {(() => {
                    const currentDemo = demoProblems.find(dp => dp.id === demoSelectedId) || demoProblems[0];
                    return (
                      <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-4 space-y-3 relative overflow-hidden">
                        <div className="absolute right-3 top-3 opacity-15">
                          {currentDemo.id === 1 && <Wind className="w-16 h-16 text-indigo-400" />}
                          {currentDemo.id === 2 && <Car className="w-16 h-16 text-indigo-400" />}
                          {currentDemo.id === 3 && <Zap className="w-16 h-16 text-indigo-400" />}
                          {currentDemo.id === 4 && <Monitor className="w-16 h-16 text-indigo-400" />}
                        </div>

                        <div className="flex flex-wrap justify-between items-center gap-2">
                          <span className="text-[10px] uppercase font-black text-indigo-400 bg-indigo-950 px-2 py-0.5 rounded-md border border-indigo-900/50">
                            {currentDemo.specialty}
                          </span>
                          <span className={`text-[9px] uppercase font-black px-2 py-0.5 rounded-full ${
                            currentDemo.urgency === 'Crítico' 
                              ? 'bg-red-950 text-red-300 border border-red-900/50 animate-pulse'
                              : currentDemo.urgency === 'Urgente'
                                ? 'bg-amber-950 text-amber-300 border border-amber-900/50'
                                : 'bg-emerald-950 text-emerald-300 border border-emerald-900/50'
                          }`}>
                            Urgencia: {currentDemo.urgency}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 border-t border-zinc-800/80 pt-2.5">
                          <div>
                            <span className="block text-[8px] uppercase tracking-wider text-zinc-500 font-bold">Rango de Tarifa Estimado</span>
                            <span className="block text-xs font-black text-rose-400 mt-0.5">{currentDemo.estimatedRate}</span>
                          </div>
                          <div>
                            <span className="block text-[8px] uppercase tracking-wider text-zinc-500 font-bold">Respuesta Técnica</span>
                            <span className="block text-xs font-black text-emerald-400 mt-0.5">{currentDemo.time}</span>
                          </div>
                        </div>

                        <div className="bg-zinc-950 rounded-lg p-2 border border-zinc-800">
                          <div className="text-[9px] uppercase tracking-wider text-zinc-400 font-extrabold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-bounce"></span>
                            Diagnóstico Experto / Clasificación Automática
                          </div>
                          <p className="text-[10.5px] text-zinc-300 font-medium leading-snug mt-1 font-sans">
                            {currentDemo.aiRecommendation}
                          </p>
                        </div>

                        <div className="flex items-center justify-between text-[9px] font-black text-zinc-500 mt-2">
                          <span>📍 Cobertura de red: Ciudad de Panamá y Provincias</span>
                          <span className="text-indigo-400">+{currentDemo.techsAvailable} Especialistas Notificados</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                <div className="grid grid-cols-3 gap-3 text-center pt-2 font-mono leading-none">
                  <div className="bg-zinc-800/40 p-3 rounded-xl border border-zinc-800">
                    <span className="block text-lg font-black text-zinc-200">100%</span>
                    <span className="block text-[8px] uppercase text-zinc-400 tracking-wider font-sans font-bold mt-1.5">Técnicos Certificados</span>
                  </div>
                  <div className="bg-zinc-800/40 p-3 rounded-xl border border-zinc-800">
                    <span className="block text-lg font-black text-indigo-400">+500</span>
                    <span className="block text-[8px] uppercase text-zinc-400 tracking-wider font-sans font-bold mt-1.5">Servicios Cotizados</span>
                  </div>
                  <div className="bg-zinc-800/40 p-3 rounded-xl border border-zinc-800">
                    <span className="block text-lg font-black text-zinc-200">0%</span>
                    <span className="block text-[8px] uppercase text-zinc-400 tracking-wider font-sans font-bold mt-1.5">Comisión de Intermediación</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Dynamic Form Selector */}
              <div className="lg:col-span-6 flex justify-center items-center w-full">
                {renderLoginContent()}
              </div>
=======
          <div className="flex items-center gap-4 md:gap-8">
            <div className="hidden sm:block text-right leading-tight">
              <p className="text-[9px] font-black text-[#c8c4d9] uppercase tracking-widest">System Version</p>
              <p className="text-xs font-black text-[#c7bfff]">V.4.2 PREMIUM</p>
>>>>>>> 704b6d958a85e1739c0273d956d23c9955ad9baf
            </div>
            <button
              onClick={() => setIsSupportModalOpen(true)}
              className="bg-[#1c1d21] border border-[#2a2b2f] px-4 md:px-6 py-2 md:py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest hover:border-[#5d3cfe] transition-all flex items-center gap-2 group shadow-lg shadow-black/20"
            >
              <HelpCircle className="w-4 h-4 text-[#5d3cfe] group-hover:scale-110 transition-transform" />
              <span className="inline">SOPORTE</span>
            </button>
          </div>
        </header>

        <main className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-20 px-8 md:px-16 pb-10 relative z-10 max-w-[1400px] mx-auto w-full">
          <div className="flex-1 space-y-6 py-4">
            <div className="inline-flex items-center gap-2 bg-[#5d3cfe]/10 border border-[#5d3cfe]/20 px-4 py-1.5 rounded-full mb-0">
              <div className="w-1.5 h-1.5 rounded-full bg-[#c7bfff]"></div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#c7bfff]">Plataforma de Nueva Generación</span>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-[5.2rem] font-black tracking-tighter leading-[1.05] text-white">
              Mantenimiento para <br/> Hogar, Empresa <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#c7bfff] via-[#52ffac] to-[#5d3cfe] italic pr-4 inline-block">e Industria.</span>
            </h1>
            <p className="text-lg text-[#c8c4d9] font-medium leading-relaxed max-w-lg mt-4">
              Optimice la vida útil de sus activos con diagnósticos <br className="hidden md:block"/> predictivos y soporte técnico certificado en tiempo real.
            </p>
          </div>

          <div className="w-full max-w-[400px] shrink-0">
            <div className="bg-[#121317] border border-[#2a2b2f] rounded-[2.5rem] p-6 md:p-8 shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#5d3cfe]/30 to-transparent"></div>
               <h2 className="text-2xl font-black text-center text-white mb-2">Acceso al Portal</h2>
               <div className="flex p-1 bg-[#1c1d21] rounded-2xl border border-[#2a2b2f] mb-6">
                 <button onClick={() => setAuthRole('client')} className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${authRole === 'client' ? 'bg-[#c7bfff] text-[#0d0e12]' : 'text-[#c8c4d9]'}`}>Cliente</button>
                 <button onClick={() => setAuthRole('tech')} className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${authRole === 'tech' ? 'bg-[#c7bfff] text-[#0d0e12]' : 'text-[#c8c4d9]'}`}>Técnico</button>
               </div>
               <form onSubmit={handleLogin} className="space-y-6">
                 {authError && (
                   <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl text-rose-500 text-[10px] font-black uppercase tracking-widest text-center animate-pulse">
                     {authError}
                   </div>
                 )}
                 {authMode === 'register' && (
                   <input type="text" required value={loginName} onChange={e => setLoginName(e.target.value)} placeholder="Nombre" className="w-full bg-[#1c1d21] border border-[#2a2b2f] rounded-xl py-4 px-5 text-white" />
                 )}
                 <input type="email" required value={loginEmail} onChange={e => setLoginEmail(e.target.value)} placeholder="Email" className="w-full bg-[#1c1d21] border border-[#2a2b2f] rounded-xl py-4 px-5 text-white" />
                 <input type="password" required value={loginPassword} onChange={e => setLoginPassword(e.target.value)} placeholder="Password" className="w-full bg-[#1c1d21] border border-[#2a2b2f] rounded-xl py-4 px-5 text-white" />
                 <button type="submit" className="w-full py-5 bg-[#c7bfff] text-[#0d0e12] rounded-xl font-black uppercase tracking-widest">Entrar</button>
                 <button type="button" onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')} className="w-full text-center text-xs text-[#c8c4d9] mt-4">{authMode === 'login' ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}</button>
               </form>
            </div>
          </div>
        </main>
        <SupportModal
          isOpen={isSupportModalOpen}
          onClose={() => setIsSupportModalOpen(false)}
          userEmail={loggedInEmail}
          userName={loggedInName}
        />
        <Chatbot247 />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0e12] flex flex-col font-sans text-[#e3e2e8] overflow-hidden grid-bg">
      <div className="hidden lg:flex flex-col h-screen no-print">
        <nav className="h-16 bg-[#0d0e12]/80 backdrop-blur-md border-b border-[#2a2b2f] flex items-center justify-between px-8 shrink-0 z-50">
          <div className="flex items-center gap-10">
            <span className="text-xl font-black tracking-tighter text-white">Mantech<span className="text-[#c7bfff]">Pro</span></span>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#474556]" />
              <input type="text" placeholder="Buscar..." className="bg-[#121317] border border-[#2a2b2f] rounded-full py-2 pl-12 pr-6 text-xs text-white w-[400px]" value={globalSearch} onChange={(e) => setGlobalSearch(e.target.value)} />
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#1c1d21] border border-[#2a2b2f] rounded-full">
              <div className={`w-1.5 h-1.5 rounded-full ${subscription.planId === 'plan-basic' ? 'bg-[#c8c4d9]' : subscription.planId === 'plan-pro' ? 'bg-amber-500' : 'bg-[#5d3cfe]'}`}></div>
              <span className="text-[9px] font-black text-white uppercase tracking-widest">
                PLAN {subscription.planId === 'plan-basic' ? 'BÁSICO' : subscription.planId === 'plan-pro' ? 'PROFESIONAL' : 'CORPORATIVO'}
              </span>
            </div>
            <button
              onClick={() => alert("Centro de Notificaciones: No hay mensajes pendientes.")}
              className="p-2 text-[#c8c4d9] hover:bg-[#121317] rounded-lg relative"
            >
              <Bell className="w-5 h-5" />
              {requests.some(r => r.status === 'unforeseen') && <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-rose-500 rounded-full border-2 border-[#0d0e12]"></div>}
            </button>
            <button onClick={handleLogout} className="flex items-center gap-2 text-[#c8c4d9] hover:text-white"><LogOut className="w-5 h-5" /><span className="text-[10px] font-black uppercase tracking-widest">Salir</span></button>
          </div>
        </nav>

<<<<<<< HEAD
          {/* Persona specific navigation links */}
          <nav className="bg-white rounded-2xl border border-zinc-200 p-3.5 shadow-sm space-y-2">
            {role === 'admin' ? (
              <>
                <button
                  onClick={() => setAdminTab('finance')}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                    adminTab === 'finance'
                      ? 'bg-red-600 text-white border-red-500 shadow-md font-extrabold'
                      : 'border-zinc-100 text-zinc-600 bg-white hover:bg-zinc-50'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <DollarSign className={`w-4 h-4 ${adminTab === 'finance' ? 'text-white' : 'text-zinc-500'}`} />
                    Finanzas & Comisiones
                  </span>
                </button>
                <button
                  onClick={() => setAdminTab('users')}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                    adminTab === 'users'
                      ? 'bg-red-600 text-white border-red-500 shadow-md font-extrabold'
                      : 'border-zinc-100 text-zinc-600 bg-white hover:bg-zinc-50'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Users className={`w-4 h-4 ${adminTab === 'users' ? 'text-white' : 'text-zinc-500'}`} />
                    Gestión de Usuarios
                  </span>
                </button>
                <button
                  onClick={() => setAdminTab('logistics')}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                    adminTab === 'logistics'
                      ? 'bg-red-600 text-white border-red-500 shadow-md font-extrabold'
                      : 'border-zinc-100 text-zinc-600 bg-white hover:bg-zinc-50'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Truck className={`w-4 h-4 ${adminTab === 'logistics' ? 'text-white' : 'text-zinc-500'}`} />
                    Logística Operativa
                  </span>
                </button>
                <button
                  onClick={() => setAdminTab('alerts')}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                    adminTab === 'alerts'
                      ? 'bg-red-600 text-white border-red-500 shadow-md font-extrabold'
                      : 'border-zinc-100 text-zinc-600 bg-white hover:bg-zinc-50'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <BellRing className={`w-4 h-4 ${adminTab === 'alerts' ? 'text-white' : 'text-zinc-500'}`} />
                    Centro de Alertas
                  </span>
                </button>
              </>
            ) : role === 'client' ? (
              <>
                <button
                  onClick={() => setClientTab('dashboard')}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                    clientTab === 'dashboard'
                      ? 'bg-zinc-900 text-white border-zinc-800 shadow-md font-extrabold'
                      : 'border-zinc-100 text-zinc-600 bg-white hover:bg-zinc-50'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <LayoutDashboard className={`w-4 h-4 ${clientTab === 'dashboard' ? 'text-indigo-400' : 'text-zinc-500'}`} />
                    Mis Equipos & Alertas
                  </span>
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${clientTab === 'dashboard' ? 'bg-zinc-800 text-zinc-200' : 'bg-zinc-100 text-zinc-700'}`}>
                    {assets.length}
                  </span>
                </button>

                <button
                  onClick={() => setClientTab('ai')}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                    clientTab === 'ai'
                      ? 'bg-zinc-900 text-white border-zinc-800 shadow-md font-extrabold'
                      : 'border-zinc-100 text-zinc-600 bg-white hover:bg-zinc-50'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Bot className={`w-4 h-4 ${clientTab === 'ai' ? 'text-indigo-400' : 'text-zinc-500'}`} />
                    Asistente Experto V2.0
                  </span>
                  <span className="px-1.5 py-0.5 bg-emerald-500 text-[9px] uppercase font-black text-white rounded-md">
                    Activo
                  </span>
                </button>

                <button
                  onClick={() => setClientTab('marketplace')}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                    clientTab === 'marketplace'
                      ? 'bg-zinc-900 text-white border-zinc-800 shadow-md font-extrabold'
                      : 'border-zinc-100 text-zinc-600 bg-white hover:bg-zinc-50'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Store className={`w-4 h-4 ${clientTab === 'marketplace' ? 'text-indigo-400' : 'text-zinc-500'}`} />
                    Marketplace Técnicos
                  </span>
                </button>

                <button
                  onClick={() => setClientTab('quotes')}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                    clientTab === 'quotes'
                      ? 'bg-zinc-900 text-white border-zinc-800 shadow-md font-extrabold'
                      : 'border-zinc-100 text-zinc-600 bg-white hover:bg-zinc-50'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <FileCheck2 className={`w-4 h-4 ${clientTab === 'quotes' ? 'text-indigo-400' : 'text-zinc-500'}`} />
                    Cotizaciones & Contratos
                  </span>
                  {requests.filter(r => r.status === 'quoted' || r.status === 'pending').length > 0 && (
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
                  )}
                </button>

                <button
                  onClick={() => setClientTab('chat')}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                    clientTab === 'chat'
                      ? 'bg-zinc-900 text-white border-zinc-800 shadow-md font-extrabold'
                      : 'border-zinc-100 text-zinc-600 bg-white hover:bg-zinc-50'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <MessageSquare className={`w-4 h-4 ${clientTab === 'chat' ? 'text-indigo-400' : 'text-zinc-500'}`} />
                    Panel Chat Directo
                  </span>
                  {requests.filter(r => ['quoted', 'accepted', 'executing', 'unforeseen', 'unforeseen_paid', 'completed'].includes(r.status)).length > 0 && (
                    <span className="bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-lg text-[9px] font-black group-hover:bg-white transition-all">
                      {requests.filter(r => ['quoted', 'accepted', 'executing', 'unforeseen', 'unforeseen_paid', 'completed'].includes(r.status)).length}
                    </span>
                  )}
                </button>
              </>
            ) : (
              <>
                {/* Tech Persona Links - Locked secure specialty status and rating */}
                <div className="mb-3.5 p-3.5 bg-zinc-50 border border-zinc-200 rounded-2xl text-left">
                  <div className="flex justify-between items-center text-[9px] font-black text-zinc-400 uppercase tracking-widest">
                    <span>Especialidad Activa</span>
                    <span className="text-emerald-600 font-extrabold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      Conectado
                    </span>
                  </div>
                  <div className="text-xs font-black text-indigo-600 mt-1 uppercase tracking-tight">
                    {getSelectedTechProfileObj()?.category.replace('_', ' ')}
                  </div>
                  <div className="flex items-center gap-1 mt-1.5 text-[11px] text-zinc-500 font-bold">
                    <span>⭐ {getSelectedTechProfileObj()?.rating} de reputación • ({getSelectedTechProfileObj()?.completedJobs || 0} completados)</span>
=======
        <div className="flex flex-1 overflow-hidden">
          <aside className="w-64 bg-[#0d0e12] border-r border-[#2a2b2f] p-6 flex flex-col shrink-0 overflow-y-auto custom-scrollbar">
            <div className="bg-[#121317] rounded-2xl p-5 mb-6 border border-[#2a2b2f] text-center">
              <div className="relative inline-block mx-auto mb-3 group cursor-pointer" onClick={() => document.getElementById('avatar-upload')?.click()}>
                <div className="w-14 h-14 rounded-full bg-[#5d3cfe] text-white flex items-center justify-center font-black text-xl shadow-lg shadow-[#5d3cfe]/20 border-2 border-white/10 overflow-hidden relative">
                  {profileImage && profileImage.length > 10 ? <img src={profileImage} className="w-full h-full object-cover" /> : loggedInName[0]}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-4 h-4 text-white" />
>>>>>>> 704b6d958a85e1739c0273d956d23c9955ad9baf
                  </div>
                </div>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleUploadAvatar(e.target.files[0])}
                />
                {role === 'admin' && (
                  <div className="absolute -bottom-1 -right-1 p-1 bg-rose-600 rounded-lg text-white shadow-lg border-2 border-[#121317]" title="Administrador Master">
                    <ShieldCheck className="w-3 h-3" />
                  </div>
                )}
              </div>
              <h4 className="font-black text-white truncate text-xs">{loggedInName}</h4>
              <div className="flex flex-col items-center gap-1 mt-1">
                <p className="text-[7px] font-black text-[#52ffac] uppercase tracking-widest bg-[#52ffac]/10 px-2 py-0.5 rounded-full border border-[#52ffac]/20">Sesión Segura</p>
                <p className="text-[6px] font-black text-[#474556] uppercase tracking-widest opacity-50">
                  {role === 'admin' ? 'CONTROL CENTRAL MASTER' : role === 'tech' ? 'TÉCNICO ESPECIALISTA' : 'CLIENTE'}
                </p>
              </div>
            </div>

            <nav className="space-y-1 flex-1">
              {role === 'client' ? [
                { tab: 'dashboard', icon: LayoutDashboard, label: 'Equipos' },
                { tab: 'fleet', icon: Globe, label: 'Flota B2B' },
                { tab: 'diagnostic', icon: Activity, label: 'Diagnóstico' },
                { tab: 'inventory', icon: Package, label: 'Repuestos' },
                { tab: 'marketplace', icon: Store, label: 'Técnicos' },
                { tab: 'quotes', icon: FileCheck2, label: 'Contratos' },
                { tab: 'subscriptions', icon: Star, label: 'Membresía' },
                { tab: 'chat', icon: MessageSquare, label: 'Chat' },
                { tab: 'settings', icon: Settings, label: 'Configuración' }
              ].map(item => (
                <button key={item.tab} onClick={() => setClientTab(item.tab as any)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${clientTab === item.tab ? 'bg-[#5d3cfe] text-white' : 'text-[#c8c4d9]'}`}>
                  <item.icon className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-black uppercase">{item.label}</span>
                </button>
              )) : role === 'admin' ? [
                { tab: 'finance', icon: PieChart, label: 'Finanzas' },
                { tab: 'users', icon: Users, label: 'Usuarios' },
                { tab: 'tickets', icon: LifeBuoy, label: 'Tickets Soporte' },
                { tab: 'logistics', icon: Truck, label: 'Logística' },
                { tab: 'inventory', icon: Package, label: 'Inventario Global' },
                { tab: 'marketplace', icon: Store, label: 'Técnicos' },
                { tab: 'alerts', icon: Bell, label: 'Alertas' },
                { tab: 'settings', icon: Settings, label: 'Configuración' }
              ].map(item => (
                <button key={item.tab} onClick={() => setAdminTab(item.tab as any)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${adminTab === item.tab ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/20' : 'text-[#c8c4d9] hover:bg-[#1c1d21]'}`}>
                  <item.icon className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-black uppercase">{item.label}</span>
                </button>
              )) : [
                { tab: 'received', icon: FileCheck2, label: 'Solicitudes' },
                { tab: 'chat', icon: MessageSquare, label: 'Chat' },
                { tab: 'wallet', icon: PieChart, label: 'Billetera' },
                { tab: 'mantech_id', icon: ShieldCheck, label: 'Seguridad' },
                { tab: 'profile', icon: User, label: 'Mi Perfil' },
                { tab: 'settings', icon: Settings, label: 'Configuración' }
              ].map(item => (
                <button key={item.tab} onClick={() => setTechTab(item.tab as any)} className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-xl transition-all group ${techTab === item.tab ? 'bg-[#5d3cfe] text-white shadow-xl shadow-[#5d3cfe]/20' : 'text-[#c8c4d9] hover:bg-[#121317] hover:text-white'}`}>
                  <item.icon className={`w-4 h-4 ${techTab === item.tab ? 'text-white' : 'text-[#474556] group-hover:text-[#c7bfff]'}`} />
                  <span className="text-[11px] font-black uppercase tracking-wider">{item.label}</span>
                </button>
              ))}
            </nav>
          </aside>

          <main className="flex-1 bg-[#0d0e12] p-6 md:p-10 overflow-y-auto custom-scrollbar">
             <div className="max-w-[1600px] mx-auto space-y-10">
                {role === 'client' ? (
                  <>
                    {clientTab === 'dashboard' && (
                      <div className="space-y-8">
                        <header className="flex justify-between items-end">
                          <div>
                            <div className="flex items-center gap-3">
                              <h1 className="text-4xl font-black text-white tracking-tighter">Bienvenido, {loggedInName}</h1>
                              {subscription.planId === 'plan-pro' && <div className="p-1.5 bg-amber-500 rounded-lg text-black shadow-lg shadow-amber-500/20" title="Plan Profesional"><Zap className="w-4 h-4 fill-current" /></div>}
                              {subscription.planId === 'plan-enterprise' && <div className="p-1.5 bg-[#5d3cfe] rounded-lg text-white shadow-lg shadow-[#5d3cfe]/20" title="Plan Corporativo"><Building2 className="w-4 h-4" /></div>}
                            </div>
                            <p className="text-[#c8c4d9] font-medium mt-2">Gestión de activos industriales en tiempo real.</p>
                          </div>
                          <div className="flex gap-4">
                            <div className="bg-[#121317] border border-[#2a2b2f] rounded-full px-6 py-2.5 flex items-center gap-3 shadow-sm">
                              <div className="w-2 h-2 rounded-full bg-[#52ffac] shadow-[0_0_8px_#52ffac]"></div>
                              <span className="text-[10px] font-black text-white uppercase tracking-widest">{assets.length} Operativos</span>
                            </div>
<<<<<<< HEAD
                          ))
                      )}
                    </div>
                  </div>

                  {/* Operational Distribution - NOW REAL DATA */}
                  <div className="bg-zinc-900 text-white p-6 rounded-2xl shadow-xl border border-zinc-800 flex flex-col justify-between">
                    <div>
                      <h2 className="text-sm font-black uppercase tracking-widest mb-6 text-indigo-400 flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Densidad Operativa (Real)
                      </h2>
                      <div className="space-y-5">
                        {(() => {
                          const total = technicians.length || 1;
                          const bvSf = technicians.filter(t => t.location.includes('Bella Vista') || t.location.includes('San Francisco')).length;
                          const ceCl = technicians.filter(t => t.location.includes('Costa del Este') || t.location.includes('Clayton')).length;
                          const others = Math.max(0, total - bvSf - ceCl);

                          return [
                            { label: 'Bella Vista / San Francisco', val: Math.round((bvSf / total) * 100), color: 'bg-indigo-500' },
                            { label: 'Costa del Este / Clayton', val: Math.round((ceCl / total) * 100), color: 'bg-emerald-500' },
                            { label: 'Otras Áreas (Panamá)', val: Math.round((others / total) * 100), color: 'bg-zinc-600' }
                          ];
                        })().map((loc, i) => (
                          <div key={i} className="space-y-1.5">
                            <div className="flex justify-between text-[10px] font-black uppercase tracking-wider">
                              <span className="text-zinc-400">{loc.label}</span>
                              <span className="text-white">{loc.val}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                              <div className={`h-full ${loc.color}`} style={{ width: `${loc.val}%` }}></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-white/5 space-y-3">
                      <div className="flex justify-between items-center text-[10px] font-bold">
                        <span className="text-zinc-400 uppercase">Técnicos Registrados:</span>
                        <span className="text-emerald-400">{technicians.length} Profesionales</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] font-bold">
                        <span className="text-zinc-400 uppercase">Estado del Sistema:</span>
                        <span className="text-indigo-400">Operativo</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {adminTab === 'alerts' && (
                <div className="space-y-6">
                  <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <h2 className="text-sm font-black text-zinc-900 uppercase tracking-widest">Panel de Control de Notificaciones</h2>
                        <p className="text-[11px] text-zinc-400 font-medium">Gestiona y despacha alertas preventivas a los clientes registrados.</p>
                      </div>
                      <button
                        onClick={() => triggerSimulatedNotification("Mensaje global del administrador para todos los clientes.", "⚠️ Aviso de Sistema")}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-bold transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        Despachar Alerta Global
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-zinc-100">
                            <th className="pb-3 font-black text-zinc-400 uppercase text-[9px]">Cliente / Activo</th>
                            <th className="pb-3 font-black text-zinc-400 uppercase text-[9px]">Tarea Pendiente</th>
                            <th className="pb-3 font-black text-zinc-400 uppercase text-[9px]">Vencimiento</th>
                            <th className="pb-3 font-black text-zinc-400 uppercase text-[9px]">Estado</th>
                            <th className="pb-3 font-black text-zinc-400 uppercase text-[9px] text-right">Acción</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-50">
                          {allReminders.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="py-8 text-center text-zinc-400 font-medium">
                                No hay alertas programadas en el sistema.
                              </td>
                            </tr>
                          ) : (
                            allReminders.map((rem) => {
                              const daysLeft = Math.ceil((new Date(rem.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                              return (
                                <tr key={rem.id} className="group hover:bg-zinc-50/50 transition-colors">
                                  <td className="py-4">
                                    <div className="font-bold text-zinc-900">{rem.title.split(' - ')[1] || 'Activo'}</div>
                                    <div className="text-[10px] text-zinc-400">ID: {rem.clientId.substring(0,8)}...</div>
                                  </td>
                                  <td className="py-4 font-medium text-zinc-600">{rem.title.split(' - ')[0]}</td>
                                  <td className="py-4">
                                    <span className={`font-mono text-[10px] font-bold ${daysLeft <= 0 ? 'text-red-600' : 'text-zinc-600'}`}>
                                      {rem.dueDate}
                                    </span>
                                  </td>
                                  <td className="py-4">
                                    <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider border ${
                                      daysLeft <= 0
                                        ? 'bg-red-50 text-red-700 border-red-100'
                                        : daysLeft <= 7
                                        ? 'bg-amber-50 text-amber-700 border-amber-100'
                                        : 'bg-indigo-50 text-indigo-700 border-indigo-100'
                                    }`}>
                                      {daysLeft <= 0 ? 'Vencido' : daysLeft <= 7 ? 'Próximo' : 'Al día'}
                                    </span>
                                  </td>
                                  <td className="py-4 text-right">
                                    <button
                                      onClick={() => triggerSimulatedNotification(
                                        `Tu activo requiere '${rem.title}' programado para el ${rem.dueDate}.`,
                                        `🚨 Recordatorio de Mantenimiento`,
                                        rem.title.split(' - ')[1]
                                      )}
                                      className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                      title="Enviar notificación específica"
                                    >
                                      <BellRing className="w-4 h-4" />
                                    </button>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {adminTab === 'settings' && (
                <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm max-w-xl mx-auto">
                  <h2 className="text-sm font-black text-zinc-900 uppercase tracking-widest mb-6 text-center">Configuración de Administrador</h2>

                  <form onSubmit={handleUpdateProfile} className="space-y-6">
                    {/* Avatar Upload */}
                    <div className="flex flex-col items-center gap-3">
                      <div className="relative group">
                        <div className="w-24 h-24 rounded-full bg-red-50 border-4 border-white shadow-md overflow-hidden flex items-center justify-center">
                          {updatePhoto || profileImage ? (
                            <img src={updatePhoto || profileImage} alt="Preview" className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-10 h-10 text-red-300" />
                          )}
                        </div>
                        <label className="absolute bottom-0 right-0 p-1.5 bg-red-600 text-white rounded-full cursor-pointer shadow-lg hover:bg-red-700 transition-all">
                          <Camera className="w-4 h-4" />
                          <input type="file" className="hidden" accept="image/*" onChange={handlePhotoSelect} />
                        </label>
                      </div>
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Foto Administrativa</span>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-black text-zinc-500 block">Nombre del Administrador</label>
                        <input
                          type="text"
                          value={updateName}
                          onChange={(e) => setUpdateName(e.target.value)}
                          placeholder={loggedInName || "Escribe tu nombre..."}
                          className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-black text-zinc-500 block">Correo electrónico</label>
                        <input
                          type="email"
                          value={updateEmail}
                          onChange={(e) => setUpdateEmail(e.target.value)}
                          placeholder={loggedInEmail}
                          className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-black text-zinc-500 block">Nueva Contraseña</label>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            value={updatePassword}
                            onChange={(e) => setUpdatePassword(e.target.value)}
                            placeholder="Mínimo 6 caracteres"
                            className="w-full pl-3 pr-12 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-800 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-inner"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-zinc-400 hover:text-indigo-600 transition-colors cursor-pointer"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isUpdating}
                        className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black uppercase transition-all disabled:opacity-50"
                      >
                        {isUpdating ? 'Actualizando...' : 'Guardar Cambios Maestros'}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* CLIENT PERSONA CONTENT WRAPPER */}
          {role === 'client' && (
            <>
              {/* TAB 1: DASHBOARD / MIS EQUIPOS */}
              {clientTab === 'dashboard' && (
                <div className="space-y-6">
                  {/* Summary of Reminders */}
                  <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm">
                    <div className="flex flex-wrap justify-between items-center gap-3 mb-5">
                      <div>
                        <h2 className="text-sm font-black text-zinc-900 uppercase tracking-widest">Cuadro de Recordatorios & Alertas Activas</h2>
                        <p className="text-[11px] text-zinc-400 font-medium">Próximos plazos de atención recomendados de tus activos</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setAssetToEdit(null);
                            setIsAssetModalOpen(true);
                          }}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-indigo-100 cursor-pointer"
                        >
                          <Plus className="w-4 h-4" />
                          Registrar Activo
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {reminders.filter(r => assets.some(a => a.id === r.assetId)).map((rem) => {
                        const daysLeft = Math.ceil((new Date(rem.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                        const matchingAsset = assets.find(a => a.id === rem.assetId);

                        return (
                          <div 
                            key={rem.id} 
                            className={`border rounded-2xl p-5 space-y-4 relative flex flex-col justify-between transition-all ${
                              daysLeft <= 0 
                                ? 'border-red-300 bg-red-50/20 shadow-xs' 
                                : daysLeft <= 7 
                                ? 'border-amber-300 bg-amber-50/20 shadow-xs animate-pulse' 
                                : 'border-zinc-200 hover:shadow-xs hover:border-zinc-350'
                            }`}
                          >
                            <div className="space-y-4">
                              <div className="flex items-center justify-between gap-1">
                                <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md border ${
                                  daysLeft <= 0 
                                    ? 'bg-red-100 text-red-900 border-red-200' 
                                    : daysLeft <= 7 
                                    ? 'bg-amber-100 text-amber-900 border-amber-200' 
                                    : 'bg-indigo-50 text-indigo-950 border-indigo-100'
                                }`}>
                                  {daysLeft <= 0 ? 'Expirado' : `Faltan ${daysLeft} días`}
                                </span>
                                <span className="text-[9px] text-zinc-400 font-black uppercase tracking-wider block truncate">
                                  {matchingAsset?.type.toUpperCase()}
                                </span>
                              </div>

                              {/* Icon + Title Section */}
                              <div className="flex items-start gap-3">
                                <div className="p-2 bg-indigo-50 rounded-xl">
                                  <Bell className="w-5 h-5 text-indigo-600" />
                                </div>
                                <div>
                                  <h4 className="font-black text-zinc-900 text-sm tracking-tight leading-tight">Recordatorio de Mantenimiento</h4>
                                  <p className="text-[10px] text-zinc-400 font-bold uppercase mt-0.5">Mantenimiento de rutina</p>
                                </div>
                              </div>

                              <div className="h-px bg-zinc-100"></div>

                              {/* Next Appointment Section */}
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-50 rounded-xl">
                                  <Calendar className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                  <p className="text-[10px] text-zinc-400 font-bold uppercase">Próxima cita</p>
                                  <p className="text-xs font-black text-indigo-700">{formatFriendlyDate(rem.dueDate)}</p>
                                </div>
                              </div>

                              {/* Warning Section / Detailed Description */}
                              <div className="flex flex-col gap-2 p-3 bg-amber-50/50 rounded-xl border border-amber-100/50">
                                <div className="flex items-center gap-2 text-amber-600">
                                  <AlertTriangle className="w-3.5 h-3.5" />
                                  <span className="text-[9px] font-black uppercase">Detalle de Atención:</span>
                                </div>
                                <p className="text-[10px] text-amber-900 font-bold leading-relaxed italic">
                                  {rem.description.includes('(')
                                    ? `"${rem.description.split('(')[1].replace(').', '')}"`
                                    : rem.description || "Revisión general de rutina."}
                                </p>
                              </div>
                            </div>

                            <div className="pt-3.5 border-t border-zinc-100 flex items-center justify-between gap-2 mt-2">
                              <div>
                                <span className="block text-[8px] text-zinc-400 uppercase font-bold">Equipo:</span>
                                <span className="text-[10px] font-extrabold text-zinc-800 block leading-tight truncate max-w-[85px]">{matchingAsset?.name || 'Varios'}</span>
                              </div>
                              <button
                                onClick={() => handleRequestTechFromReminder(rem)}
                                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-bold transition-all shadow-xs cursor-pointer"
                              >
                                Solicitar Técnico
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Registered Assets List */}
                  <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm">
                    <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-4.5">
                      Lista General de Activos Registrados
                    </h3>

                    {assets.length === 0 ? (
                      <div className="text-center py-12 text-zinc-400 font-medium text-xs">
                        No hay activos de momento. Presiona "Registrar Activo" para iniciar.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {assets.map((asset) => {
                          const matchingCount = reminders.filter(r => r.assetId === asset.id).length;
                          return (
                            <div key={asset.id} className="p-5 rounded-2xl border border-zinc-200 bg-white hover:border-indigo-400 hover:shadow-md transition-all flex flex-col justify-between shadow-xs">
                              <div className="space-y-3">
                                <div className="flex justify-between items-start gap-2">
                                  <div>
                                    <h4 className="font-extrabold text-sm text-zinc-900 tracking-tight">{asset.name}</h4>
                                    <p className="text-[11px] text-zinc-500 leading-tight">{asset.details}</p>
                                  </div>
                                  <span className="text-[9px] px-2 py-0.5 rounded-lg bg-zinc-100 text-zinc-700 border border-zinc-200 font-black uppercase tracking-wider whitespace-nowrap">
                                    {asset.type.replace('_', ' ')}
                                  </span>
                                </div>

                                <div className="grid grid-cols-2 gap-3 text-xs py-1.5 text-zinc-600 border-t border-b border-zinc-100">
                                  <div>
                                    <span className="block text-[8px] text-zinc-400 uppercase font-black">Registrado:</span>
                                    <span className="font-semibold text-zinc-700">{formatFriendlyDate(asset.registeredAt)}</span>
                                  </div>
                                  <div>
                                    <span className="block text-[8px] text-zinc-400 uppercase font-black">Sig. Mantenimiento:</span>
                                    <span className="font-extrabold text-indigo-600">{formatFriendlyDate(asset.nextMaintenanceDate)}</span>
                                  </div>
                                </div>

                                {/* Dynamic asset specific indicators */}
                                {(asset.mileage || asset.usageHours) && (
                                  <div className="text-xs bg-indigo-50/60 p-2.5 rounded-xl border border-indigo-100 flex justify-between gap-2">
                                    {asset.mileage && (
                                      <div>
                                        <span className="text-[8px] text-indigo-700 font-bold uppercase tracking-wider block">Kilometraje:</span>
                                        <span className="font-black text-zinc-900">{asset.mileage.toLocaleString()} km</span>
                                      </div>
                                    )}
                                    {asset.usageHours && (
                                      <div>
                                        <span className="text-[8px] text-indigo-700 font-bold uppercase tracking-wider block">Horas de Uso:</span>
                                        <span className="font-black text-zinc-900">{asset.usageHours} horas</span>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>

                              <div className="pt-4 mt-4 border-t border-zinc-100 flex justify-between items-center gap-2">
                                <span className="text-[10px] text-zinc-500 font-medium">
                                  {matchingCount === 1 ? '1 Recordatorio activo' : `${matchingCount} Recordatorios activos`}
                                </span>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => {
                                      setAssetToEdit(asset);
                                      setIsAssetModalOpen(true);
                                    }}
                                    className="p-1.5 text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                    title="Editar activo"
                                  >
                                    <Pencil className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteAsset(asset.id)}
                                    className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                    title="Eliminar activo"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      setClientTab('ai');
                                    }}
                                    className="px-3 py-1.5 bg-zinc-100 text-zinc-700 rounded-xl text-[10px] font-extrabold hover:bg-zinc-200 border border-zinc-200 transition-all cursor-pointer"
                                  >
                                    Asistente Técnico
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: AI DIAGNOSTICS */}
              {clientTab === 'ai' && (
                <DiagnosticAIView 
                  assets={assets} 
                  onFindTechnicians={handleAIFindTech}
                />
              )}

              {/* TAB 3: MARKETPLACE */}
              {clientTab === 'marketplace' && (
                <div className="space-y-6">
                  {/* Category filters */}
                  <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-sm">
                    <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-4">
                      Buscar Técnico Profesional Por Categoría
                    </h3>
                    
                    <div className="flex flex-wrap gap-2">
                      {[
                        { id: 'all', name: 'Todos los especialistas' },
                        { id: 'mecanico', name: 'Mecánicos Automotriz' },
                        { id: 'tecnico_ac', name: 'Aire Acondicionado' },
                        { id: 'electricista', name: 'Electricistas' },
                        { id: 'informatico', name: 'Servidores & Tecnología B2B' },
                        { id: 'especialista_solar', name: 'Especialista Solar' }
                      ].map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => setMarketFilter(cat.id as any)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                            marketFilter === cat.id
                              ? 'bg-zinc-900 border-zinc-800 text-white shadow-md font-extrabold'
                              : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50 bg-white'
                          }`}
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Marketplace tech grid */}
                  <div className="space-y-4">
                    <h2 className="text-xs font-black text-zinc-400 uppercase tracking-widest">Técnicos calificados disponibles en Panamá</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {technicians
                        .filter(t => marketFilter === 'all' || t.category === marketFilter)
                        .map((tech) => (
                          <div 
                            key={tech.id} 
                            className={`bg-white rounded-2xl border p-5 shadow-xs flex flex-col justify-between relative transition-all ${
                              tech.plan === 'premium' ? 'border-2 border-indigo-400 bg-indigo-50/20' : 'border-zinc-200'
                            }`}
                          >
                            {tech.plan === 'premium' && (
                              <div className="absolute top-4 right-4 flex flex-col items-end gap-1.5">
                                <div className="flex items-center gap-1 bg-amber-100 text-amber-900 font-extrabold text-[9px] px-2.5 py-1 rounded-full border border-amber-300 shadow-xs">
                                  👑 RECOMENDADO
                                </div>
                                {tech.isVerified && (
                                  <div className="flex items-center gap-1 bg-emerald-100 text-emerald-900 font-extrabold text-[8px] px-2 py-0.5 rounded-full border border-emerald-300 shadow-xs">
                                    <ShieldCheck className="w-2.5 h-2.5" /> VERIFICADO
                                  </div>
                                )}
                              </div>
                            )}

                            {tech.plan !== 'premium' && tech.isVerified && (
                              <div className="absolute top-4 right-4 flex items-center gap-1 bg-emerald-100 text-emerald-900 font-extrabold text-[8px] px-2 py-0.5 rounded-full border border-emerald-300 shadow-xs">
                                <ShieldCheck className="w-2.5 h-2.5" /> VERIFICADO
                              </div>
                            )}

                            <div className="space-y-3.5">
                              <div className="flex gap-3 items-center">
                                <div className="w-12 h-12 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center font-extrabold text-indigo-700 text-sm">
                                  {tech.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div>
                                  <h4 className="font-extrabold text-zinc-900 text-sm tracking-tight flex items-center gap-1">
                                    {tech.name}
                                    {tech.isVerified && (
                                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" title="Identidad y Récord Policivo Verificado" />
                                    )}
                                  </h4>
                                  <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider">
                                    {tech.title}
                                  </p>
                                  {tech.companyName && (
                                    <div className="flex items-center gap-1 mt-0.5">
                                      <Briefcase className="w-2.5 h-2.5 text-zinc-400" />
                                      <span className="text-[9px] font-black text-zinc-500 uppercase tracking-tighter">{tech.companyName}</span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="flex gap-4 text-xs font-semibold text-zinc-600 justify-between py-2 border-y border-zinc-100/60 bg-zinc-50 px-3 rounded-xl">
                                <div className="flex items-center text-amber-500 font-bold gap-1">
                                  <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                                  {tech.rating}
                                  <span className="text-zinc-400 font-normal">({tech.reviewCount})</span>
                                </div>
                                <div className="text-[11px] text-zinc-600">Exp: <strong className="text-zinc-900">{tech.experienceYears} años</strong></div>
                                <div className="text-[11px] text-emerald-600 font-black">${tech.hourlyRate}/hr</div>
                              </div>

                              <p className="text-xs text-zinc-600 leading-relaxed truncate-2-lines italic">
                                "{tech.bio}"
                              </p>
                            </div>

=======
>>>>>>> 704b6d958a85e1739c0273d956d23c9955ad9baf
                            <button
                              onClick={() => setIsQRScannerOpen(true)}
                              className="bg-[#5d3cfe] text-white px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-[#5d3cfe]/20 flex items-center gap-2 hover:brightness-110 active:scale-95 transition-all"
                            >
                              <Camera className="w-4 h-4" /> VALIDAR TÉCNICO
                            </button>
                          </div>
                        </header>

                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                           {assets.filter(a => a.name.toLowerCase().includes(globalSearch.toLowerCase())).map(a => (
                             <div key={a.id} className="modern-card p-6 flex flex-col gap-6">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h3 className="text-xl font-black text-[#c7bfff]">{a.name}</h3>
                                    <p className="text-[10px] font-black text-[#474556] uppercase tracking-widest mt-1">Ref: {a.id.substring(0,4)}</p>
                                  </div>
                                  <div className="bg-[#1c1d21] px-3 py-1 rounded-full text-[9px] font-black text-[#52ffac] border border-[#2a2b2f] uppercase tracking-tighter">
                                    {a.type}
                                  </div>
                                </div>

                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-3 bg-[#0d0e12] p-4 rounded-2xl border border-[#2a2b2f]/50">
                                     <div>
                                       <p className="text-[8px] font-black text-[#474556] uppercase mb-1">Próximo Servicio</p>
                                       <p className="text-sm font-black text-[#c7bfff]">{a.nextMaintenanceDate}</p>
                                     </div>
                                     <div>
                                       <p className="text-[8px] font-black text-[#474556] uppercase mb-1">Registrado</p>
                                       <p className="text-sm font-black text-white">{a.registeredAt}</p>
                                     </div>
                                  </div>
                                  <div className="p-4 bg-[#121317] rounded-xl border border-[#2a2b2f]/30">
                                    <p className="text-[9px] font-black text-[#474556] uppercase tracking-widest mb-2">Detalles Técnicos</p>
                                    <p className="text-xs text-[#c8c4d9] leading-relaxed">{a.details || "Sin detalles adicionales."}</p>
                                  </div>
                                  {a.observations && (
                                    <div className="p-4 bg-amber-500/5 rounded-xl border border-amber-500/20">
                                      <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest mb-2">Observaciones</p>
                                      <p className="text-xs text-[#c8c4d9] leading-relaxed italic">"{a.observations}"</p>
                                    </div>
                                  )}
                                </div>

                                <div className="flex justify-between items-center pt-2 border-t border-[#2a2b2f]/30">
                                  <div className="flex gap-2">
                                    <button onClick={() => { setAssetToEdit(a); setIsAssetModalOpen(true); }} className="p-2 text-[#474556] hover:text-[#c7bfff] transition-colors" title="Editar Equipo"><Pencil className="w-4 h-4" /></button>
                                    <button onClick={() => handleDeleteAsset(a.id)} className="p-2 text-[#474556] hover:text-rose-500 transition-colors" title="Eliminar Equipo"><Trash2 className="w-4 h-4" /></button>
                                  </div>
                                  <span className="text-[9px] font-black text-[#474556] uppercase tracking-widest">ID: {a.id.substring(0,6)}</span>
                                </div>
                             </div>
                           ))}
                           <div onClick={() => setIsAssetModalOpen(true)} className="group border-2 border-dashed border-[#2a2b2f] rounded-[1.5rem] flex flex-col items-center justify-center p-12 gap-4 hover:border-[#5d3cfe]/40 transition-all cursor-pointer bg-[#121317]/20">
                              <div className="w-14 h-14 rounded-full bg-[#121317] flex items-center justify-center text-[#474556] group-hover:text-[#c7bfff] group-hover:scale-110 transition-all border border-[#2a2b2f] shadow-xl"><PlusCircle className="w-8 h-8" /></div>
                              <p className="font-black text-[#474556] group-hover:text-white uppercase text-sm tracking-widest transition-colors">Agregar Equipo</p>
                           </div>
                        </div>
                      </div>
                    )}
                    {clientTab === 'diagnostic' && <DiagnosticView assets={assets} onFindTechnicians={(c) => { setMarketFilter(c); setClientTab('marketplace'); }} />}
                    {clientTab === 'inventory' && <InventoryModule items={inventory} assets={assets} onUpdateQuantity={handleUpdateInventoryQuantity} onAddItem={handleAddItem} onDeleteItem={handleDeleteInventoryItem} onUpdateItem={handleUpdateInventoryItem} />}
                    {clientTab === 'fleet' && (
                      subscription.planId === 'plan-enterprise' ? (
                        <FleetDashboard assets={assets} reminders={reminders} onManageAsset={(a) => { setAssetToEdit(a); setIsAssetModalOpen(true); }} />
                      ) : (
                        <div className="bg-[#121317] border border-[#2a2b2f] rounded-[2.5rem] p-20 text-center space-y-8 shadow-2xl relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-96 h-96 bg-[#5d3cfe]/10 rounded-full blur-[100px]"></div>
                          <div className="w-24 h-24 bg-[#1c1d21] border border-[#2a2b2f] rounded-[2rem] flex items-center justify-center mx-auto text-[#c7bfff] shadow-xl relative z-10">
                            <ShieldCheck className="w-12 h-12" />
                          </div>
                          <div className="max-w-md mx-auto space-y-4 relative z-10">
                            <h2 className="text-3xl font-black text-white uppercase tracking-tight">Módulo Corporativo Bloqueado</h2>
                            <p className="text-[#c8c4d9] font-medium leading-relaxed">
                              El Monitor de Flota B2B y las herramientas de integración ERP solo están disponibles para clientes con el <span className="text-[#52ffac] font-black italic">Plan Corporativo</span>.
                            </p>
<<<<<<< HEAD

                            {/* CLIENT VISIBILITY OF CHECKLIST AND MATERIALS */}
                            {(req.status === 'accepted' || req.status === 'executing' || req.status === 'unforeseen' || req.status === 'unforeseen_paid' || req.status === 'completed' || req.status === 'rated') && (
                              <div className="space-y-4">
                                {/* Manejo de Imprevistos por el Cliente */}
                                {req.status === 'unforeseen' && (
                                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-3 shadow-sm">
                                    <div className="flex items-center gap-2 text-amber-800">
                                      <AlertTriangle className="w-5 h-5 animate-pulse" />
                                      <span className="text-xs font-black uppercase tracking-wider">Imprevisto Crítico Detectado</span>
                                    </div>
                                    <div className="space-y-2">
                                      <p className="text-[11px] text-amber-900 font-medium leading-relaxed">
                                        El técnico reporta: <strong className="font-black italic">"{req.unforeseenReason}"</strong>.
                                      </p>
                                      <div className="p-3 bg-white/60 border border-amber-100 rounded-lg text-[10px] text-amber-950 font-bold leading-tight">
                                        ⚠️ <span className="uppercase font-black text-red-700">Aviso de Garantía:</span> Si decides NO aprobar este imprevisto, el trabajo podría continuar pero la <span className="underline decoration-red-500">garantía técnica del servicio quedará anulada</span> debido a que el fallo detectado compromete la integridad de la reparación contratada.
                                      </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-2 pt-1">
                                      <button
                                        onClick={() => handlePayUnforeseen(req.id)}
                                        className="flex-1 py-2.5 bg-indigo-600 text-white text-[10px] font-black uppercase rounded-lg hover:bg-indigo-700 transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                                      >
                                        <CheckCircle2 className="w-3.5 h-3.5" /> Aprobar & Pagar Adicional (${req.unforeseenAmount?.toFixed(2)})
                                      </button>
                                      <button
                                        onClick={() => {
                                          if(window.confirm("¿Seguro que deseas continuar sin el adicional? Entiendo que la garantía será anulada.")) {
                                            updateDoc(doc(db, "requests", req.id), {
                                              status: 'executing',
                                              guaranteeVoided: true,
                                              unforeseenRejectedAt: serverTimestamp()
                                            });
                                          }
                                        }}
                                        className="flex-1 py-2.5 bg-white border border-amber-300 text-amber-700 text-[10px] font-black uppercase rounded-lg hover:bg-amber-100 transition-all cursor-pointer"
                                      >
                                        Continuar sin Garantía
                                      </button>
                                    </div>
                                  </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="bg-white border border-zinc-200 p-4 rounded-xl space-y-3 shadow-xs">
                                    <h5 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                      Avance de Tareas
                                    </h5>
                                    <div className="space-y-1.5">
                                      {req.checklist?.map((task) => (
                                        <div key={task.id} className="flex items-center gap-2 text-xs">
                                          <div className={`w-3.5 h-3.5 rounded flex items-center justify-center border ${task.isCompleted ? 'bg-emerald-500 border-emerald-500' : 'border-zinc-300'}`}>
                                            {task.isCompleted && <Check className="w-2.5 h-2.5 text-white" />}
                                          </div>
                                          <span className={`font-medium ${task.isCompleted ? 'text-zinc-400 line-through' : 'text-zinc-700'}`}>
                                            {task.description}
                                          </span>
                                        </div>
                                      ))}
                                      {(!req.checklist || req.checklist.length === 0) && (
                                        <p className="text-[10px] text-zinc-400 italic">Esperando que el técnico inicie el checklist...</p>
                                      )}
                                    </div>
                                  </div>

                                  <div className="bg-white border border-zinc-200 p-4 rounded-xl space-y-3 shadow-xs">
                                    <h5 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                                      <Layers className="w-3.5 h-3.5 text-indigo-500" />
                                      Insumos & Repuestos
                                    </h5>
                                    <div className="space-y-1.5">
                                      {req.materials?.map((m, idx) => (
                                        <div key={idx} className="flex justify-between items-center text-xs">
                                          <span className="font-medium text-zinc-700">{m.name}</span>
                                          <span className="font-black text-zinc-900">${m.price.toFixed(2)}</span>
                                        </div>
                                      ))}
                                      {(!req.materials || req.materials.length === 0) && (
                                        <p className="text-[10px] text-zinc-400 italic">No se han cargado materiales adicionales.</p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}

                            <div className="flex justify-between items-center flex-wrap gap-2 pt-3 border-t border-zinc-100 text-xs">
                              <div>
                                <span className="block text-[8px] text-zinc-400 uppercase font-bold">Técnico solicitado:</span>
                                <span className="font-extrabold text-zinc-800">{req.techName}</span>
                              </div>

                              {req.price && (
                                <div className="text-right flex items-center gap-3">
                                  <div>
                                    <span className="block text-[8px] text-zinc-400 uppercase font-bold">Cotizado:</span>
                                    <span className="font-black text-emerald-600 text-sm block">${req.price.toFixed(2)}</span>
                                  </div>
                                  <button
                                    onClick={() => {
                                      setActiveChatRequestId(req.id);
                                      setClientTab('chat');
                                    }}
                                    className="p-2.5 bg-zinc-900 text-white rounded-xl hover:bg-black transition-all cursor-pointer shadow-sm"
                                    title="Abrir Chat Directo"
                                  >
                                    <MessageSquare className="w-4 h-4" />
                                  </button>
                                </div>
                              )}
                            </div>

                            {/* Actions by states */}
                            {req.status === 'quoted' && (
                              <div className="bg-indigo-50 p-5 rounded-2xl border border-indigo-100 flex flex-wrap justify-between items-center gap-4">
                                <div className="flex-1 min-w-[250px]">
                                  <span className="text-[10px] font-black text-indigo-900 uppercase block tracking-wider">¡El técnico envió una propuesta de precio!</span>
                                  <p className="text-[11px] text-indigo-900 mt-1 leading-relaxed">
                                    Para coordinar la cita y poner el servicio en agenda, debes confirmar el pago. Retenemos los fondos de forma segura en depósitos de garantía Panamá Mantech.
                                  </p>
                                </div>

                                  <div className="flex gap-2 shrink-0">
                                    <button
                                      onClick={() => handleOpenPayment(req)}
                                      className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer shadow-sm"
                                    >
                                      <CreditCard className="w-4 h-4" />
                                      Pagar con Tarjeta
                                    </button>
                                    <button
                                      onClick={() => handleAcceptQuote(req.id, 'yappy')}
                                      className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer shadow-sm"
                                    >
                                      Pagar con Yappy
                                    </button>
                                  </div>
                              </div>
                            )}

                            {req.status === 'completed' && (
                              <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-100 flex justify-between items-center flex-wrap gap-3">
                                <div>
                                  <span className="text-xs font-black text-zinc-900 block uppercase tracking-wide">¿Servicio completado con éxito?</span>
                                  <p className="text-[11px] text-zinc-500 font-medium mt-0.5">Por favor califica el trabajo realizado para desembolsar el pago del técnico de forma instantánea.</p>
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => {
                                      setSelectedRequestForReport(req);
                                      setIsReportModalOpen(true);
                                    }}
                                    className="px-4 py-2.5 bg-zinc-900 text-white rounded-xl text-xs font-bold shrink-0 cursor-pointer shadow-sm hover:bg-black transition-all"
                                  >
                                    Ver Reporte
                                  </button>
                                  <button
                                    onClick={() => setRatingRequestId(req.id)}
                                    className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shrink-0 cursor-pointer shadow-xs"
                                  >
                                    Calificar Técnico Ahora
                                  </button>
                                </div>
                              </div>
                            )}

                            {req.status === 'accepted' && (
                              <div className="bg-rose-50 p-4 rounded-2xl border border-rose-100 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <ShieldAlert className="w-5 h-5 text-rose-600" />
                                  <p className="text-[10px] text-rose-900 font-bold leading-tight">
                                    ¿El técnico no se presentó o el trabajo quedó incompleto? <br/>
                                    <span className="font-normal text-rose-700">Puedes reportarlo para bloquear el pago de garantía.</span>
                                  </p>
                                </div>
                                <button
                                  onClick={() => {
                                    const desc = window.prompt("Por favor describe brevemente el problema (Ej: El técnico no asistió a la cita):");
                                    if (desc) handleReportIssue(req.id, desc);
                                  }}
                                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[9px] font-black uppercase transition-all"
                                >
                                  Reportar Problema
                                </button>
                              </div>
                            )}

                            {req.status === 'disputed' && (
                              <div className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800 text-white animate-pulse">
                                <div className="flex items-center gap-3 mb-2">
                                  <ShieldAlert className="w-5 h-5 text-red-500" />
                                  <span className="text-xs font-black uppercase tracking-widest text-red-500">Contrato en Disputa</span>
                                </div>
                                <p className="text-[11px] text-zinc-400 leading-relaxed">
                                  Este servicio ha sido reportado. El pago al técnico está **CONGELADO** mientras nuestro equipo de auditoría revisa tu caso: <br/>
                                  <span className="italic">"{req.issueDescription}"</span>
                                </p>
                              </div>
                            )}

                            {req.status === 'rated' && (
                              <div className="bg-zinc-50 p-5 rounded-2xl border border-zinc-200 flex justify-between items-center flex-wrap gap-3">
                                <div>
                                  <span className="text-xs font-black text-zinc-900 block uppercase tracking-wide">Servicio Calificado</span>
                                  <p className="text-[11px] text-zinc-500 font-medium mt-0.5">Gracias por tu valoración. El reporte final está disponible para tu archivo.</p>
                                  <div className="mt-2.5 flex items-center gap-2 p-2 bg-emerald-50 rounded-lg text-[10px] text-emerald-900 font-bold border border-emerald-100">
                                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                    Calificación de {req.rating} estrellas enviada con éxito.
                                  </div>
                                </div>
                                <button
                                  onClick={() => {
                                    setSelectedRequestForReport(req);
                                    setIsReportModalOpen(true);
                                  }}
                                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shrink-0 cursor-pointer shadow-sm"
                                >
                                  Descargar Reporte Final
                                </button>
                              </div>
                            )}

                            {/* Rating evaluation UI */}
                            {ratingRequestId === req.id && (
                              <div className="bg-white border border-zinc-200 rounded-2xl p-5 space-y-4">
                                <h4 className="text-xs font-black text-zinc-900 uppercase">Escribir Reseña para {req.techName}</h4>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-zinc-500 font-semibold">Estrellas de Desempeño:</span>
                                  <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <button 
                                        key={star} 
                                        type="button" 
                                        onClick={() => setRatingVal(star)}
                                        className="text-amber-500 hover:scale-110 transition-transform cursor-pointer"
                                      >
                                        <Star className={`w-5 h-5 ${ratingVal >= star ? 'fill-amber-500 text-amber-500' : 'text-zinc-200'}`} />
                                      </button>
                                    ))}
                                  </div>
                                </div>

                                <textarea
                                  placeholder="¿Cómo consideras el trabajo del contratista? Ej: Excelente, muy higiénico, puntual y educado..."
                                  value={ratingComment}
                                  onChange={(e) => setRatingComment(e.target.value)}
                                  rows={2.5}
                                  className="w-full text-xs p-3 border border-zinc-200 bg-zinc-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-zinc-900"
                                />

                                <div className="flex justify-end gap-2 text-xs">
                                  <button onClick={() => setRatingRequestId(null)} className="px-3.5 py-1.5 text-zinc-500 font-semibold cursor-pointer">
                                    Cancelar
                                  </button>
                                  <button onClick={() => handleRateJob(req.id)} className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold cursor-pointer">
                                    Enviar Calificación
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 5: CLIENT CHAT */}
              {clientTab === 'chat' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Active Chat Channels List */}
                    <div className="bg-white rounded-2xl border border-zinc-200 p-5 space-y-2 h-[500px] overflow-y-auto shadow-sm">
                      <h3 className="text-xs font-black text-zinc-400 uppercase mb-4 tracking-widest">Chats de Mantenimiento</h3>
                      
                      {requests.filter(r => ['quoted', 'accepted', 'executing', 'unforeseen', 'unforeseen_paid', 'completed'].includes(r.status)).length === 0 ? (
                        <p className="text-[11px] text-zinc-400 font-medium">Sin contrataciones con chats de momento.</p>
                      ) : (
                        requests
                          .filter(r => ['quoted', 'accepted', 'executing', 'unforeseen', 'unforeseen_paid', 'completed'].includes(r.status))
                          .map((r) => (
=======
>>>>>>> 704b6d958a85e1739c0273d956d23c9955ad9baf
                            <button
                              onClick={() => setClientTab('subscriptions')}
                              className="mt-6 px-10 py-4 bg-[#5d3cfe] text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-[#5d3cfe]/20 hover:brightness-110 transition-all active:scale-95"
                            >
                              Ver Planes & Activar
                            </button>
                          </div>
                        </div>
                      )
                    )}
                    {clientTab === 'subscriptions' && (
                      <SubscriptionModule
                        subscription={subscription}
                        onUpgrade={(planId) => {
                          setSubscription(prev => ({ ...prev, planId }));
                          alert(`¡Plan actualizado con éxito! Ahora tienes acceso a las funciones de ${planId === 'plan-enterprise' ? 'Corporativo' : 'Profesional'}.`);
                        }}
                      />
                    )}
                    {clientTab === 'quotes' && (
                      <div className="space-y-8 pb-20">
                        <header>
                          <h1 className="text-4xl font-black text-white tracking-tighter uppercase">Contratos</h1>
                          <p className="text-[#c8c4d9] font-medium mt-2">Historial y estado de tus servicios técnicos.</p>
                        </header>
                        {requests.length === 0 ? (
                          <div className="p-20 border-2 border-dashed border-[#2a2b2f] rounded-[2rem] text-center">
                            <FileCheck2 className="w-16 h-16 text-[#474556] mx-auto mb-4" />
                            <p className="text-[#c8c4d9] font-bold uppercase tracking-widest">Sin contratos activos</p>
                          </div>
                        ) : (
                          <div className="space-y-6">
                            {requests.map(req => (
                              <div key={req.id} className="bg-[#121317] border border-[#2a2b2f] p-8 rounded-[2.5rem] space-y-6 shadow-2xl relative overflow-hidden">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h4 className="text-xl font-black text-white uppercase tracking-tight">{req.assetName}</h4>
                                    <p className="text-[9px] font-black text-[#52ffac] uppercase tracking-widest">{req.assetDetails || (assets.find(a => a.id === req.assetId)?.details) || 'Detalles no disponibles'}</p>
                                    <p className="text-[10px] font-bold text-[#c7bfff] uppercase tracking-widest mt-1">Técnico: {req.techName}</p>
                                  </div>
                                  <div className="flex gap-2">
                                    {req.status === 'accepted' && (
                                      <button onClick={() => handleCancelRequest(req.id)} className="px-3 py-1 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-full text-[9px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all">Cancelar</button>
                                    )}
                                    {['executing', 'unforeseen', 'unforeseen_paid'].includes(req.status) && (
                                      <button onClick={() => handleReportTechnicianFailure(req.id)} className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-full text-[9px] font-black uppercase tracking-widest hover:bg-amber-500 hover:text-white transition-all">No concluyó</button>
                                    )}
                                    <span className="px-4 py-1.5 bg-[#1c1d21] border border-[#2a2b2f] rounded-full text-[10px] font-black text-[#52ffac] uppercase tracking-widest shadow-inner">
                                      {req.status.toLowerCase() === 'completed' ? 'FINALIZADO' :
                                       req.status.toLowerCase() === 'executing' ? 'EN EJECUCIÓN' :
                                       req.status.toLowerCase() === 'unforeseen' ? 'IMPREVISTO' :
                                       req.status.toLowerCase() === 'unforeseen_paid' ? 'PAGO RECIBIDO' :
                                       req.status.toLowerCase() === 'unforeseen_verifying' ? 'VERIFICANDO PAGO' :
                                       req.status.toLowerCase() === 'payment_verifying' ? 'VERIFICANDO PAGO' :
                                       req.status.toLowerCase() === 'accepted' ? 'PAGADO' :
                                       req.status.toLowerCase() === 'quoted' ? 'COTIZADO' : 'PENDIENTE'}
                                    </span>
                                  </div>
                                </div>

                                <div className="flex items-center justify-between px-4 py-6 bg-[#0d0e12] rounded-3xl border border-[#2a2b2f]/50 overflow-x-auto gap-4 custom-scrollbar">
                                  {[
                                    { label: 'Solicitud', status: ['pending', 'quoted', 'payment_verifying', 'accepted', 'executing', 'unforeseen', 'unforeseen_verifying', 'unforeseen_paid', 'completed'] },
                                    { label: 'Cotizado', status: ['quoted', 'payment_verifying', 'accepted', 'executing', 'unforeseen', 'unforeseen_verifying', 'unforeseen_paid', 'completed'] },
                                    { label: 'Pagado', status: ['payment_verifying', 'accepted', 'executing', 'unforeseen', 'unforeseen_verifying', 'unforeseen_paid', 'completed'] },
                                    { label: 'Ejecución', status: ['executing', 'unforeseen', 'unforeseen_verifying', 'unforeseen_paid', 'completed'] },
                                    { label: 'IMPREVISTO', status: ['unforeseen', 'unforeseen_verifying', 'unforeseen_paid', 'completed'] },
                                    { label: 'PAGO IMPREVISTO', status: ['unforeseen_verifying', 'unforeseen_paid', 'completed'] },
                                    { label: 'Finalizado', status: ['completed'] }
                                  ].map((step, idx, arr) => {
                                    const isDone = step.status.includes(req.status);
                                    return (
                                      <React.Fragment key={idx}>
                                        <div className="flex flex-col items-center gap-2 shrink-0">
                                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-black transition-all border ${isDone ? 'bg-[#5d3cfe] border-[#c7bfff] text-white shadow-[0_0_15px_rgba(93,60,254,0.3)]' : 'bg-[#1c1d21] border-[#2a2b2f] text-[#474556]'}`}>
                                            {isDone ? <CheckCheck className="w-4 h-4" /> : idx + 1}
                                          </div>
                                          <span className={`text-[8px] font-black uppercase tracking-widest ${isDone ? 'text-white' : 'text-[#474556]'}`}>{step.label}</span>
                                        </div>
                                        {idx < arr.length - 1 && <div className={`w-8 h-px shrink-0 ${isDone ? 'bg-[#5d3cfe]' : 'bg-[#2a2b2f]'}`}></div>}
                                      </React.Fragment>
                                    );
                                  })}
                                </div>

                                <p className="text-xs text-[#c8c4d9] leading-relaxed bg-[#0d0e12] p-5 rounded-2xl border border-[#2a2b2f]/50 italic">"{req.description}"</p>

                                {/* SEGUIMIENTO EN VIVO PARA EL CLIENTE */}
                                {['executing', 'unforeseen', 'unforeseen_verifying', 'unforeseen_paid', 'completed'].includes(req.status) && (
                                  <div className="space-y-4 animate-fade-in">
                                    <div className="bg-[#0d0e12] p-6 rounded-3xl border border-white/5 space-y-4">
                                      <header className="flex justify-between items-center">
                                        <div className="flex flex-col gap-1">
                                          <p className="text-[10px] font-black text-[#5d3cfe] uppercase tracking-[0.2em] flex items-center gap-2">
                                            <Activity className="w-4 h-4" /> Seguimiento en Vivo
                                          </p>
                                          {timers[req.id] && (
                                            <p className="text-[18px] font-mono font-black text-white ml-6">
                                              {formatTimer(timers[req.id].elapsed)}
                                            </p>
                                          )}
                                        </div>
                                        <span className="flex items-center gap-1.5 px-2 py-0.5 bg-[#52ffac]/10 rounded-full h-fit">
                                          <div className="w-1.5 h-1.5 bg-[#52ffac] rounded-full animate-ping"></div>
                                          <span className="text-[8px] font-black text-[#52ffac] uppercase">Sincronizado</span>
                                        </span>
                                      </header>

                                      {/* Checklist Real-time */}
                                      <div className="space-y-3">
                                        <p className="text-[8px] font-black text-[#474556] uppercase tracking-widest ml-1">Tareas del Técnico</p>
                                        <InspectionChecklist
                                          steps={req.checklist || []}
                                          onUpdateStep={() => {}}
                                          readOnly={true}
                                        />
                                      </div>

                                      {/* Materiales Real-time */}
                                      <div className="space-y-3 pt-2">
                                        <p className="text-[8px] font-black text-[#474556] uppercase tracking-widest ml-1">Materiales e Insumos</p>
                                        <div className="grid grid-cols-1 gap-2">
                                          {(req.materials || []).length === 0 ? (
                                            <p className="text-[9px] text-[#474556] italic ml-1">Esperando registro de materiales...</p>
                                          ) : (
                                            req.materials?.map((m: any, idx: number) => (
                                              <div key={idx} className="flex justify-between items-center p-3 bg-[#1c1d21] rounded-xl border border-white/5">
                                                <div className="flex items-center gap-2">
                                                  <div className="w-1.5 h-1.5 bg-[#52ffac] rounded-full"></div>
                                                  <span className="text-[10px] font-bold text-white uppercase">{m.name}</span>
                                                </div>
                                                <span className="text-[10px] font-black text-[#52ffac]">${m.price.toFixed(2)}</span>
                                              </div>
                                            ))
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {req.scheduledDate && (
                                  <div className="grid grid-cols-2 gap-4 bg-[#1c1d21]/30 p-4 rounded-2xl border border-white/5">
                                     <div className="flex items-center gap-3">
                                        <div className="p-2 bg-[#5d3cfe]/10 rounded-lg text-[#5d3cfe]">
                                           <CalendarDays className="w-4 h-4" />
                                        </div>
                                        <div>
                                           <p className="text-[8px] font-black text-[#474556] uppercase tracking-widest">Fecha Programada</p>
                                           <p className="text-[10px] font-bold text-white uppercase">{req.scheduledDate}</p>
                                        </div>
                                     </div>
                                     <div className="flex items-center gap-3">
                                        <div className="p-2 bg-[#52ffac]/10 rounded-lg text-[#52ffac]">
                                           <Clock className="w-4 h-4" />
                                        </div>
                                        <div>
                                           <p className="text-[8px] font-black text-[#474556] uppercase tracking-widest">Hora de Cita</p>
                                           <p className="text-[10px] font-bold text-white uppercase">{format12h(req.scheduledTime)}</p>
                                        </div>
                                     </div>
                                  </div>
                                )}

                                {req.status === 'unforeseen' && (
                                  <div className="p-6 bg-amber-500/10 border border-amber-500/30 rounded-[1.5rem] space-y-4 animate-pulse">
                                    <div className="flex items-center gap-3 text-amber-500">
                                      <AlertCircle className="w-6 h-6" />
                                      <span className="text-xs font-black uppercase tracking-[0.2em]">¡Imprevisto Crítico Detectado!</span>
                                    </div>
                                    <p className="text-[11px] text-[#c8c4d9] font-medium leading-relaxed">
                                      El técnico reporta: <strong className="text-white italic">"{req.unforeseenReason}"</strong>. Costo Adicional: <strong className="text-amber-500">${req.unforeseenAmount}</strong>.
                                    </p>
                                    {req.compromisesWarranty && (
                                       <div className="p-3 bg-rose-500/20 border border-rose-500/30 rounded-xl">
                                          <p className="text-[9px] text-rose-400 font-black uppercase leading-tight">
                                            ❗ ATENCIÓN: El técnico indica que este imprevisto compromete la garantía del trabajo original si no se resuelve.
                                          </p>
                                       </div>
                                    )}
                                    <div className="flex gap-3">
                                      <button onClick={() => handlePayUnforeseen(req.id)} className="flex-1 py-3 bg-amber-500 text-black text-[10px] font-black uppercase rounded-xl hover:brightness-110 transition-all shadow-lg shadow-amber-500/20">Aprobar & Pagar</button>
                                      <button onClick={() => { if(window.confirm("¿Seguro? Sin garantía el técnico no se hace responsable.")) updateDoc(doc(db,"requests",req.id), {status:'executing', guaranteeVoided:true}); }} className="flex-1 py-3 bg-[#1c1d21] border border-[#2a2b2f] text-[#c8c4d9] text-[10px] font-black uppercase rounded-xl hover:text-white transition-all">Continuar sin Garantía</button>
                                    </div>
                                  </div>
                                )}

                                {req.status === 'quoted' && req.materials && req.materials.length > 0 && (
                                  <div className="space-y-3 bg-[#1c1d21]/20 p-5 rounded-2xl border border-white/5">
                                    <p className="text-[9px] font-black text-[#c7bfff] uppercase tracking-widest">Insumos Incluidos en Propuesta</p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                      {req.materials.map((m, idx) => (
                                        <div key={idx} className="flex justify-between items-center bg-[#0d0e12] p-3 rounded-xl border border-white/5">
                                          <div className="flex items-center gap-2">
                                            <span className="text-[#52ffac] font-black text-[10px]">x{m.quantity || 1}</span>
                                            <span className="text-[10px] text-white uppercase font-bold">{m.name}</span>
                                          </div>
                                          <span className="text-[10px] font-mono font-black text-[#c8c4d9]">${((m.price || 0) * (m.quantity || 1)).toFixed(2)}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                <div className="flex gap-3 pt-2">
                                  <button onClick={() => { setActiveChatRequestId(req.id); setClientTab('chat'); }} className="flex-1 py-4 bg-[#1c1d21] hover:bg-[#2a2b2f] border border-[#2a2b2f] rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3">
                                    <MessageSquare className="w-5 h-5 text-[#5d3cfe]" /> Chat Directo
                                  </button>
                                  {req.status === 'quoted' && (
                                    <button
                                      onClick={() => handlePayRequest(req.id)}
                                      className="flex-1 py-4 bg-[#5d3cfe] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-[#5d3cfe]/20 hover:brightness-110 active:scale-95 flex items-center justify-center gap-2"
                                    >
                                      <ShieldCheck className="w-4 h-4" /> Pagar y Agendar
                                    </button>
                                  )}
                                  {req.status.toLowerCase() === 'completed' && (
                                    <button
                                      onClick={() => { setSelectedRequestForReport(req); setIsReportModalOpen(true); }}
                                      className="flex-1 py-4 bg-[#52ffac] text-[#0d0e12] rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-[#52ffac]/20 hover:brightness-110 active:scale-95"
                                    >
                                      Descargar Reporte
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    {clientTab === 'chat' && (
                      <div className="h-[calc(100vh-120px)] flex flex-col">
                        <header className="mb-6 flex justify-between items-center">
                          <div>
                            <h1 className="text-4xl font-black text-white tracking-tighter uppercase">Centro de Mensajería</h1>
                            <p className="text-[#c8c4d9] font-medium mt-1">Comunicación cifrada y segura con tus proveedores certificados.</p>
                          </div>
                          <button
                            onClick={() => setIsChatSidebarOpen(!isChatSidebarOpen)}
                            className="px-4 py-2 bg-[#121317] border border-[#2a2b2f] rounded-xl text-[10px] font-black uppercase tracking-widest text-[#c8c4d9] hover:text-white transition-all flex items-center gap-2"
                          >
                            {isChatSidebarOpen ? <Menu className="w-4 h-4" /> : <ChevronRight className="w-4 h-4 rotate-180" />}
                            {isChatSidebarOpen ? 'Ocultar Contactos' : 'Ver Contactos'}
                          </button>
                        </header>

                        <div className={`flex-1 flex gap-6 min-h-0 relative ${isChatMaximized ? 'absolute inset-0 z-[100] bg-[#0d0e12] p-0' : ''}`}>
                          {/* Sidebar de Chats */}
                          {isChatSidebarOpen && !isChatMaximized && (
                            <aside className="w-72 bg-[#121317] border border-[#2a2b2f] rounded-[2rem] p-5 flex flex-col shrink-0 overflow-hidden shadow-xl">
                              <h3 className="text-[10px] font-black text-[#474556] uppercase tracking-[0.2em] mb-5 px-2">Conversaciones</h3>
                              <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                                {requests.length === 0 ? (
                                  <p className="text-[10px] text-[#474556] font-bold text-center mt-10 uppercase tracking-widest">Sin chats</p>
                                ) : (
                                  requests.map(req => (
                                    <button
                                      key={req.id}
                                      onClick={() => setActiveChatRequestId(req.id)}
                                      className={`w-full text-left p-4 rounded-2xl border transition-all group ${
                                        activeChatRequestId === req.id
                                          ? 'bg-[#5d3cfe] border-[#5d3cfe] shadow-lg shadow-[#5d3cfe]/20'
                                          : 'bg-[#0d0e12] border-[#2a2b2f] hover:border-[#5d3cfe]/30'
                                      }`}
                                    >
                                      <div className="flex justify-between items-start mb-1">
                                        <h4 className={`text-xs font-black truncate uppercase ${activeChatRequestId === req.id ? 'text-white' : 'text-white'}`}>{req.techName}</h4>
                                        <div className={`w-1.5 h-1.5 rounded-full ${req.status === 'accepted' ? 'bg-[#52ffac]' : 'bg-[#474556]'}`}></div>
                                      </div>
                                      <p className={`text-[10px] font-medium truncate ${activeChatRequestId === req.id ? 'text-white/70' : 'text-[#c8c4d9]'}`}>{req.assetName}</p>
                                    </button>
                                  ))
                                )}
                              </div>
                            </aside>
                          )}

                          <div className={`flex-1 bg-[#121317] border border-[#2a2b2f] rounded-[2.5rem] overflow-hidden shadow-2xl relative ${isChatMaximized ? 'rounded-none border-none' : ''}`}>
                            {requests.length === 0 ? (
                              <div className="flex flex-col items-center justify-center h-full text-[#474556] gap-6 bg-[#0d0e12]">
                                <div className="w-20 h-20 rounded-full bg-[#1c1d21] flex items-center justify-center border border-[#2a2b2f]">
                                  <MessageSquare className="w-10 h-10 opacity-20" />
                                </div>
                                <div className="text-center space-y-2">
                                  <p className="text-sm font-black uppercase tracking-[0.3em] text-white">Canal de Chat Vacío</p>
                                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#474556]">Solicita un servicio técnico para iniciar la coordinación</p>
                                </div>
                              </div>
                            ) : (
                              <SupportChatWidget
                                request={requests.find(r => r.id === activeChatRequestId) || requests[0]}
                                role="client"
                                onSendMessage={(txt, img) => {
                                  if (!user) return;
                                  const reqId = activeChatRequestId || requests[0].id;
                                  addDoc(collection(db, "messages"), {
                                    requestId: reqId,
                                    sender: 'client',
                                    text: txt,
                                    image: img || null,
                                    timestamp: serverTimestamp()
                                  });
                                }}
                                messages={chatMessages.filter(m => m.requestId === (activeChatRequestId || requests[0]?.id))}
                                isMaximized={isChatMaximized}
                                onToggleMaximize={() => setIsChatMaximized(!isChatMaximized)}
                                onStartVideoCall={(room, voiceOnly) => {
                                  setActiveCallRoom(room);
                                  setIsVoiceOnlyMode(!!voiceOnly);
                                  setIsVideoCallOpen(true);
                                }}
                                onOpenScanner={() => setIsQRScannerOpen(true)}
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                    {clientTab === 'settings' && (
                      <div className="max-w-2xl mx-auto space-y-10">
                        <header className="text-center space-y-2">
                            <h2 className="text-3xl font-black text-white uppercase tracking-tight">Configuración de Usuario</h2>
                            <p className="text-[10px] font-black text-[#c8c4d9] uppercase tracking-[0.3em]">Gestión de Identidad y Seguridad</p>
                        </header>

                        <div className="modern-card p-10 space-y-10">
                            <form onSubmit={submitProfileUpdate} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-[#474556] uppercase tracking-widest">Nombre Público</label>
                                        <input
                                          type="text"
                                          value={loggedInName}
                                          readOnly={role !== 'admin'}
                                          onChange={e => setLoggedInName(e.target.value)}
                                          className={`w-full border border-[#2a2b2f] rounded-xl py-4 px-5 text-white ${role !== 'admin' ? 'bg-[#0d0e12] text-[#474556] cursor-not-allowed' : 'bg-[#1c1d21]'}`}
                                          title={role !== 'admin' ? "Solo el Administrador Master puede cambiar nombres oficiales" : ""}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-[#474556] uppercase tracking-widest">Teléfono de Contacto</label>
                                        <input type="tel" value={loggedInPhone} onChange={e => setLoggedInPhone(e.target.value)} placeholder="+507 0000-0000" className="w-full bg-[#0d0e12] border border-[#2a2b2f] rounded-xl py-4 px-5 text-white" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-[#474556] uppercase tracking-widest">Correo Electrónico</label>
                                        <input type="email" value={loggedInEmail} readOnly className="w-full bg-[#0d0e12] border border-[#2a2b2f] rounded-xl py-4 px-5 text-[#474556]" />
                                    </div>
                                </div>
                                <button type="submit" className="w-full py-4 bg-[#5d3cfe] text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-[#5d3cfe]/20">Guardar Cambios</button>
                            </form>

                            <div className="h-px bg-[#2a2b2f]"></div>

                            <div className="space-y-6">
                                <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Verificación Mantech ID</h4>
                                <MantechIDModule
                                  role="client"
                                  mantechId={{
                                    status: userData?.idStatus || 'unverified',
                                    idNumber: userData?.idNumber || '',
                                    documentUrl: userData?.idCardUrl,
                                    policeRecordUrl: userData?.policeRecordUrl
                                  }}
                                  onUpload={handleUploadDoc}
                                />
                            </div>

                            <div className="h-px bg-[#2a2b2f]"></div>

                            <div className="space-y-6">
                                <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Garantía y Confianza</h4>
                                <div className="p-6 bg-[#0d0e12] border border-[#2a2b2f] rounded-2xl flex items-center justify-between gap-6">
                                    <div className="flex items-center gap-4 text-[#52ffac]">
                                        <QrCode className="w-6 h-6" />
                                        <p className="text-xs font-medium text-[#c8c4d9]">Valide la identidad de su técnico escaneando su credencial digital al llegar al sitio.</p>
                                    </div>
                                    <div className="px-4 py-2 bg-[#1c1d21] border border-[#52ffac]/20 text-[#52ffac] rounded-lg text-[8px] font-black uppercase tracking-widest">Sistema Activo</div>
                                </div>
                            </div>

                            <button onClick={handleLogout} className="w-full py-5 bg-rose-600/10 border border-rose-600/20 text-rose-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all">Cerrar Sesión</button>
                        </div>
                      </div>
                    )}
                    {clientTab === 'marketplace' && (
                      <div className="space-y-8">
                        <header><h1 className="text-4xl font-black text-white tracking-tighter">Red de Técnicos</h1><p className="text-[#c8c4d9] font-medium mt-2">Agenda asistencia especializada con respaldo avanzado.</p></header>
                        <div className="flex gap-3 overflow-x-auto pb-4 custom-scrollbar">
                           {['Todos', 'Mecánico', 'Técnico A/C', 'Electricista', 'Informático'].map(c => (
                             <button key={c} onClick={() => setMarketFilter(c === 'Todos' ? 'all' : c.toLowerCase().replace(' ', '_') as any)} className={`flex-shrink-0 px-6 py-2.5 rounded-full border transition-all text-[10px] font-black uppercase tracking-widest ${marketFilter === (c === 'Todos' ? 'all' : c.toLowerCase().replace(' ', '_')) ? 'bg-[#5d3cfe] border-[#5d3cfe] text-white shadow-lg shadow-[#5d3cfe]/20' : 'border-[#2a2b2f] text-[#c8c4d9] hover:border-[#5d3cfe]'}`}>{c}</button>
                           ))}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                           {technicians
                             .filter(t => !t.name.toLowerCase().includes('administrador') && t.id !== 'tech-admin')
                             .filter(t => marketFilter === 'all' || t.category === marketFilter)
                             .filter(t => t.name.toLowerCase().includes(globalSearch.toLowerCase()))
                             .map(t => (
                             <div key={t.id} className="bg-[#121317] border border-[#2a2b2f] p-6 rounded-[2.5rem] flex flex-col gap-6 relative overflow-hidden group hover:border-[#5d3cfe]/50 transition-all shadow-2xl">
                                {t.isVerified && (
                                  <div className="absolute top-4 right-4 flex items-center gap-1 bg-[#52ffac]/10 text-[#52ffac] font-black text-[8px] px-2 py-0.5 rounded-full border border-[#52ffac]/20 uppercase tracking-widest shadow-sm">
                                    <ShieldCheck className="w-3 h-3" /> Verificado
                                  </div>
                                )}
                                <div className="flex items-center gap-4">
                                  <div className="w-14 h-14 rounded-2xl bg-[#1c1d21] border border-[#2a2b2f] flex items-center justify-center text-[#c7bfff] font-black text-xl">{t.name[0]}</div>
                                  <div>
                                    <h4 className="font-black text-white flex flex-col">
                                      <span className="text-base uppercase tracking-tight">{t.name}</span>
                                      {t.companyName && <span className="text-[8px] text-[#c7bfff] font-black uppercase tracking-[0.2em]">{t.companyName}</span>}
                                    </h4>
                                    <p className="text-[9px] font-black text-[#52ffac] uppercase tracking-widest mt-1">{t.category}</p>
                                  </div>
                                </div>
                                <div className="grid grid-cols-3 gap-2 py-3 border-y border-[#2a2b2f]/50 bg-[#0d0e12]/30 px-3 rounded-xl">
                                  <div className="text-center">
                                    <div className="flex items-center justify-center gap-1 text-amber-500 font-black text-xs">
                                      <Star className="w-3 h-3 fill-amber-500" /> {t.rating}
                                    </div>
                                    <span className="text-[7px] text-[#474556] font-bold uppercase">({t.reviewCount})</span>
                                  </div>
                                  <div className="text-center border-x border-[#2a2b2f]/50">
                                    <div className="text-white font-black text-xs">{t.experienceYears}y</div>
                                    <span className="text-[7px] text-[#474556] font-bold uppercase">Exp.</span>
                                  </div>
                                  <div className="text-center">
                                    <div className="text-[#52ffac] font-black text-xs">${t.hourlyRate}</div>
                                    <span className="text-[7px] text-[#474556] font-bold uppercase">Hr.</span>
                                  </div>
                                </div>
                                <p className="text-xs text-[#c8c4d9] leading-relaxed italic line-clamp-2 opacity-70">"{t.bio}"</p>
                                <button onClick={() => { setActiveTechForModal(t); setIsTechModalOpen(true); }} className="w-full py-4 bg-[#1c1d21] hover:bg-[#5d3cfe] text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Ver Perfil & Agendar</button>
                             </div>
                           ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : role === 'admin' ? (
                  <div className="space-y-8 animate-fade-in-up">
                    {adminTab === 'finance' && (
                       <AdminFinanceView
                         requests={requests}
                         technicians={technicians}
                         setIsMonthlyClosureOpen={setIsMonthlyClosureOpen}
                         onApprovePayment={handleApprovePayment}
                         onApproveUnforeseenPayment={handleApproveUnforeseenPayment}
                       />
                    )}
                    {adminTab === 'inventory' && <InventoryModule items={inventory} assets={assets} onUpdateQuantity={handleUpdateInventoryQuantity} onAddItem={handleAddItem} onDeleteItem={handleDeleteInventoryItem} onUpdateItem={handleUpdateInventoryItem} />}
                    {adminTab === 'marketplace' && (
                      <div className="space-y-8">
                         <header>
                            <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Gestión de Técnicos</h1>
                            <p className="text-[10px] text-[#c8c4d9] font-bold uppercase tracking-widest mt-1 opacity-70">Auditoría y control de proveedores de servicio.</p>
                         </header>
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {technicians.map(t => (
                              <div key={t.id} className="modern-card p-6 space-y-4 bg-[#121317] border-[#2a2b2f]">
                                 <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                       <div className="w-10 h-10 rounded-full bg-[#5d3cfe]/10 border border-[#5d3cfe]/30 flex items-center justify-center text-[#c7bfff] font-black text-sm">{t.name[0]}</div>
                                       <h4 className="font-black text-white uppercase text-sm">{t.name}</h4>
                                    </div>
                                    <span className={`px-2 py-0.5 rounded text-[8px] font-black ${t.isVerified ? 'bg-[#52ffac]/10 text-[#52ffac]' : 'bg-[#474556] text-white'}`}>{t.isVerified ? 'VERIFICADO' : 'PENDIENTE'}</span>
                                 </div>
                                 <p className="text-[9px] text-[#c8c4d9] uppercase tracking-[0.2em]">{t.category.replace('_', ' ')}</p>
                                 <div className="h-px bg-[#2a2b2f]"></div>
                                 <div className="flex justify-between items-center pt-2">
                                    <button onClick={() => alert(`Cargando reportes de ${t.name}...`)} className="text-[9px] font-black text-[#c7bfff] uppercase hover:underline cursor-pointer">Ver Historial</button>
                                    <button onClick={() => {if(window.confirm(`¿Desea suspender a ${t.name}?`)) alert("Técnico suspendido en nodo central.");}} className="text-[9px] font-black text-rose-500 uppercase hover:text-rose-400 cursor-pointer">Suspender Nodo</button>
                                 </div>
                              </div>
                            ))}
                         </div>
                      </div>
                    )}
                    {adminTab === 'users' && (
                       <div className="space-y-8">
                          <header>
                            <h1 className="text-3xl font-black text-white tracking-tighter uppercase">Directorio de Usuarios</h1>
                            <p className="text-[10px] text-[#c8c4d9] font-bold uppercase tracking-widest mt-1 opacity-70">Control de accesos y roles de la plataforma.</p>
                          </header>
                          <div className="modern-card overflow-hidden bg-[#121317] border-[#2a2b2f]">
                             <table className="w-full text-left">
                                <thead className="bg-[#1c1d21] border-b border-[#2a2b2f]">
                                   <tr>
                                      <th className="p-5 text-[9px] font-black text-[#474556] uppercase tracking-widest">Identidad / Rol</th>
                                      <th className="p-5 text-[9px] font-black text-[#474556] uppercase tracking-widest">Documentación Mantech ID</th>
                                      <th className="p-5 text-[9px] font-black text-[#474556] uppercase tracking-widest">Estado Validación</th>
                                      <th className="p-5 text-[9px] font-black text-[#474556] uppercase tracking-widest text-right">Comandos Master</th>
                                   </tr>
                                </thead>
                                <tbody className="divide-y divide-[#2a2b2f]/30">
                                   {allUsers.length === 0 ? (
                                      <tr><td colSpan={4} className="p-10 text-center text-[#474556] font-black uppercase text-[10px]">Sin usuarios registrados...</td></tr>
                                   ) : (
                                      allUsers.map(u => (
                                        <tr key={u.id} className="hover:bg-white/5 transition-all">
                                           <td className="p-5">
                                              <div className="flex flex-col">
                                                 <span className="font-bold text-white text-sm uppercase">{u.name || 'Sin nombre'}</span>
                                                 <span className="text-[8px] text-[#474556] font-medium tracking-widest uppercase">
                                                   {u.role === 'admin' ? 'CONTROL CENTRAL MASTER' : u.role === 'tech' ? 'TÉCNICO ESPECIALISTA' : 'CLIENTE'} - {u.id.substring(0,8)}
                                                 </span>
                                              </div>
                                           </td>
                                           <td className="p-5">
                                              {u.idCardUrl ? (
                                                <button
                                                  onClick={() => setSelectedDocUrl(u.idCardUrl)}
                                                  className="flex items-center gap-2 px-3 py-1.5 bg-[#5d3cfe]/10 border border-[#5d3cfe]/30 text-[#c7bfff] rounded-lg text-[9px] font-black uppercase hover:bg-[#5d3cfe] hover:text-white transition-all"
                                                >
                                                  <QrCode className="w-3 h-3" /> VER CÉDULA
                                                </button>
                                              ) : (
                                                <span className="text-[9px] text-[#474556] font-bold italic uppercase tracking-widest">No cargada</span>
                                              )}
                                           </td>
                                           <td className="p-5">
                                              <div className="flex items-center gap-3">
                                                 <span className={`px-2 py-0.5 rounded text-[8px] font-black ${
                                                   u.idStatus === 'verified' ? 'bg-[#52ffac]/10 text-[#52ffac]' :
                                                   u.idStatus === 'pending' ? 'bg-amber-500/10 text-amber-500' : 'bg-[#474556]/10 text-[#474556]'
                                                 }`}>
                                                   {(u.idStatus || 'unverified').toUpperCase()}
                                                 </span>
                                                 {u.idStatus === 'pending' && (
                                                   <div className="flex gap-1">
                                                     <button onClick={async () => { await updateDoc(doc(db, "users", u.id), { idStatus: 'verified' }); alert("Cédula aprobada."); }} className="p-1 text-[#52ffac] hover:bg-[#52ffac]/10 rounded">✅</button>
                                                     <button onClick={async () => { if(confirm("¿Rechazar cédula?")) await updateDoc(doc(db, "users", u.id), { idStatus: 'unverified', idCardUrl: null }); }} className="p-1 text-rose-500 hover:bg-rose-500/10 rounded">❌</button>
                                                   </div>
                                                 )}
                                              </div>
                                           </td>
                                           <td className="p-5 text-right">
                                              <div className="flex items-center justify-end gap-3">
                                                <button onClick={() => handleEditUser(u)} className="p-2 text-[#474556] hover:text-[#5d3cfe] transition-colors" title="Editar Nombre del Usuario">
                                                   <Pencil className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => alert(`Enviando alerta a ${u.name}...`)} className="text-[#c8c4d9] font-black text-[10px] uppercase hover:text-white">Notificar</button>
                                                <button
                                                  onClick={() => handleDeleteUser(u)}
                                                  className="p-2 text-[#474556] hover:text-rose-500 transition-colors"
                                                  title="Borrar Usuario"
                                                >
                                                  <Trash2 className="w-4 h-4" />
                                                </button>
                                              </div>
                                           </td>
                                        </tr>
                                      ))
                                   )}
                                </tbody>
                             </table>
                          </div>
                       </div>
                    )}
                    {adminTab === 'tickets' && (
                       <div className="space-y-8">
                          <header>
                            <h1 className="text-3xl font-black text-white tracking-tighter uppercase">Tickets de Soporte Inteligente</h1>
                            <p className="text-[10px] text-[#c8c4d9] font-bold uppercase tracking-widest mt-1 opacity-70">Atención a clientes y técnicos de la plataforma.</p>
                          </header>
                          <div className="grid grid-cols-1 gap-6">
                            <div className="modern-card overflow-hidden bg-[#121317] border-[#2a2b2f]">
                               <table className="w-full text-left">
                                  <thead className="bg-[#1c1d21] border-b border-[#2a2b2f]">
                                     <tr>
                                        <th className="p-5 text-[9px] font-black text-[#474556] uppercase tracking-widest">Usuario / Prioridad</th>
                                        <th className="p-5 text-[9px] font-black text-[#474556] uppercase tracking-widest">Asunto / Mensaje</th>
                                        <th className="p-5 text-[9px] font-black text-[#474556] uppercase tracking-widest">Contacto Directo</th>
                                        <th className="p-5 text-[9px] font-black text-[#474556] uppercase tracking-widest text-right">Comandos</th>
                                     </tr>
                                  </thead>
                                  <tbody className="divide-y divide-[#2a2b2f]/30">
                                     {supportTickets.length === 0 ? (
                                       <tr>
                                         <td colSpan={4} className="p-10 text-center text-[#474556] font-black uppercase text-[10px]">No hay tickets pendientes</td>
                                       </tr>
                                     ) : (
                                       supportTickets.map(ticket => (
                                         <tr key={ticket.id} className="hover:bg-white/5 transition-all">
                                            <td className="p-5">
                                               <div className="flex flex-col gap-1">
                                                  <span className="font-bold text-white text-sm uppercase">{ticket.userName}</span>
                                                  <span className={`px-2 py-0.5 rounded text-[7px] font-black uppercase w-fit ${
                                                    ticket.priority === 'high' ? 'bg-rose-500/10 text-rose-500' : 'bg-[#5d3cfe]/10 text-[#c7bfff]'
                                                  }`}>
                                                    {ticket.userRole === 'tech' ? 'TÉCNICO' : 'CLIENTE'} - {ticket.priority === 'high' ? 'PRIORIDAD CRÍTICA' : 'NORMAL'}
                                                  </span>
                                               </div>
                                            </td>
                                            <td className="p-5">
                                               <div className="flex flex-col">
                                                  <span className="font-bold text-white text-xs uppercase">{ticket.subject}</span>
                                                  <span className="text-[10px] text-[#c8c4d9] line-clamp-1 mt-1">"{ticket.message}"</span>
                                               </div>
                                            </td>
                                            <td className="p-5">
                                               <div className="flex flex-col gap-1">
                                                  <span className="text-[10px] text-white font-bold">{ticket.userPhone || 'N/A'}</span>
                                                  <span className="text-[8px] text-[#474556] font-medium tracking-widest uppercase">{ticket.userEmail}</span>
                                               </div>
                                            </td>
                                            <td className="p-5 text-right flex items-center justify-end gap-2 mt-2">
                                               <button
                                                  onClick={() => handleEditTicket(ticket)}
                                                  className="p-2 text-[#474556] hover:text-[#c7bfff] transition-colors"
                                                  title="Editar Ticket"
                                               >
                                                  <Pencil className="w-4 h-4" />
                                               </button>
                                               <button
                                                  onClick={() => handleDeleteTicket(ticket.id)}
                                                  className="p-2 text-[#474556] hover:text-rose-500 transition-colors"
                                                  title="Eliminar Ticket"
                                               >
                                                  <Trash2 className="w-4 h-4" />
                                               </button>
                                               <button
                                                  onClick={() => setActiveTicketForResponse(ticket)}
                                                  className="bg-[#5d3cfe] text-white font-black text-[9px] px-4 py-2 rounded-lg uppercase shadow-lg shadow-[#5d3cfe]/20 hover:brightness-110 active:scale-95 transition-all"
                                               >
                                                  Responder
                                               </button>
                                            </td>
                                         </tr>
                                       ))
                                     )}
                                  </tbody>
                               </table>
                            </div>
                          </div>
                       </div>
                    )}
                    {adminTab === 'logistics' && (
                       <div className="space-y-8">
                          <header>
                            <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Logística Operativa</h1>
                            <p className="text-[10px] text-[#c8c4d9] font-bold uppercase tracking-widest mt-1 opacity-70">Monitoreo de misiones técnicas activas.</p>
                          </header>
                          {requests.filter(r => ['accepted', 'executing', 'unforeseen', 'unforeseen_paid'].includes(r.status)).length === 0 ? (
                            <div className="p-10 border border-dashed border-[#2a2b2f] rounded-[3rem] text-center bg-[#121317]/30">
                              <Truck className="w-12 h-12 text-[#474556] mx-auto mb-4 opacity-20" />
                              <p className="text-[#c8c4d9] font-black uppercase tracking-[0.3em] text-xs">Sin Actividad en Campo</p>
                              <p className="text-[9px] text-[#474556] uppercase tracking-widest mt-2">No hay servicios en curso actualmente.</p>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                               {requests.filter(r => ['accepted', 'executing', 'unforeseen', 'unforeseen_paid'].includes(r.status)).map(req => (
                                  <div key={req.id} className="modern-card p-5 flex items-center justify-between bg-[#121317] border-[#2a2b2f]">
                                     <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-[#52ffac]/10 text-[#52ffac] flex items-center justify-center border border-[#52ffac]/20 shadow-[0_0_15px_rgba(82,255,172,0.1)]"><Truck className="w-5 h-5" /></div>
                                        <div>
                                           <p className="text-sm font-black text-white uppercase">{req.assetName}</p>
                                           <p className="text-[8px] font-black text-[#52ffac] uppercase">{req.assetDetails || (assets.find(a => a.id === req.assetId)?.details) || 'N/A'}</p>
                                           <p className="text-[9px] text-[#c8c4d9] font-bold uppercase">Tec: {req.techName}</p>
                                        </div>
                                     </div>
                                     <div className="text-right flex flex-col items-end gap-1">
                                        <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${
                                          req.status === 'executing' ? 'bg-[#52ffac]/10 text-[#52ffac] border-[#52ffac]/20' :
                                          req.status === 'unforeseen' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                                          'bg-indigo-500/10 text-[#c7bfff] border-indigo-500/20'
                                        }`}>
                                          {req.status.replace('_', ' ')}
                                        </span>
                                        <span className="text-[8px] text-[#474556] font-black uppercase">GPS: Activo</span>
                                     </div>
                                  </div>
                               ))}
                            </div>
                          )}
                       </div>
                    )}
                    {adminTab === 'alerts' && (
                       <div className="space-y-8">
                          <header>
                            <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Tickets de Soporte Maestro</h1>
                            <p className="text-[10px] text-[#c8c4d9] font-bold uppercase tracking-widest mt-1 opacity-70">Atención directa a usuarios de la plataforma.</p>
                          </header>

                          <div className="grid grid-cols-1 gap-4">
                             <div className="p-10 border border-dashed border-[#2a2b2f] rounded-[3rem] text-center bg-rose-500/5">
                                <LifeBuoy className="w-16 h-16 text-rose-500/20 mx-auto mb-4 animate-pulse" />
                                <p className="text-rose-500/40 font-black uppercase tracking-[0.4em] text-xs">Monitoreo de Tickets Activo</p>
                                <p className="text-[9px] text-[#474556] uppercase tracking-widest mt-2">Los nuevos tickets aparecerán aquí en tiempo real para su resolución.</p>
                             </div>
                          </div>
                       </div>
                    )}
                    {adminTab === 'settings' && (
                       <div className="max-w-2xl mx-auto space-y-10">
                          <header className="text-center space-y-2">
                             <h2 className="text-3xl font-black text-white uppercase tracking-tight">Configuración Master</h2>
                             <p className="text-[10px] font-black text-[#c8c4d9] uppercase tracking-[0.3em]">Parámetros Globales de MantechPro Industries</p>
                          </header>

                          <div className="modern-card p-10 space-y-10 bg-[#121317] border-[#2a2b2f]">
                             {/* Perfil Personal del Admin */}
                             <div className="space-y-6">
                                <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Perfil del Administrador</h4>
                                <form onSubmit={submitProfileUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                   <div className="space-y-2">
                                      <label className="text-[8px] font-black text-[#474556] uppercase ml-1">Nombre Maestro</label>
                                      <input
                                         type="text"
                                         value={loggedInName}
                                         onChange={e => setLoggedInName(e.target.value)}
                                         className="w-full bg-[#0d0e12] border border-[#2a2b2f] rounded-xl py-3 px-4 text-white text-xs font-bold focus:border-[#5d3cfe] outline-none"
                                      />
                                   </div>
                                   <div className="space-y-2">
                                      <label className="text-[8px] font-black text-[#474556] uppercase ml-1">Teléfono Directo</label>
                                      <input
                                         type="tel"
                                         value={loggedInPhone}
                                         onChange={e => setLoggedInPhone(e.target.value)}
                                         className="w-full bg-[#0d0e12] border border-[#2a2b2f] rounded-xl py-3 px-4 text-white text-xs font-bold focus:border-[#5d3cfe] outline-none"
                                      />
                                   </div>
                                   <button type="submit" className="md:col-span-2 py-3 bg-[#1c1d21] border border-[#5d3cfe] text-[#c7bfff] rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#5d3cfe] hover:text-white transition-all">
                                      Guardar Perfil Master
                                   </button>
                                </form>
                             </div>

                             <div className="h-px bg-[#2a2b2f]"></div>

                             <div className="space-y-6">
                                <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Activos de Marca Master</h4>
                                <div className="p-6 bg-[#0d0e12] border border-[#2a2b2f] rounded-2xl flex items-center justify-between">
                                   <div className="flex items-center gap-4">
                                      <div className="w-12 h-12 bg-[#1c1d21] rounded-xl border border-white/5 flex items-center justify-center overflow-hidden">
                                         <AppLogo size="sm" />
                                      </div>
                                      <div>
                                         <p className="text-xs font-bold text-white uppercase">Logo Oficial Vectorial (SVG)</p>
                                         <p className="text-[9px] text-[#474556] font-black uppercase tracking-widest mt-1">Uso para Marketing y Papelería</p>
                                      </div>
                                   </div>
                                   <button
                                      onClick={handleDownloadLogo}
                                      className="px-6 py-2.5 bg-[#5d3cfe] text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-[#5d3cfe]/20 hover:brightness-110 active:scale-95 transition-all"
                                   >
                                      Descargar SVG
                                   </button>
                                </div>
                             </div>

                             <div className="h-px bg-[#2a2b2f]"></div>

                             <div className="space-y-6">
                                <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Comisiones del Sistema</h4>
                                <div className="grid grid-cols-2 gap-4">
                                   <div className="p-5 bg-[#0d0e12] border border-[#2a2b2f] rounded-2xl">
                                      <p className="text-[8px] font-black text-[#474556] uppercase mb-2">Comisión B2C (Hogar)</p>
                                      <p className="text-xl font-black text-[#c7bfff]">15%</p>
                                   </div>
                                   <div className="p-5 bg-[#0d0e12] border border-[#2a2b2f] rounded-2xl">
                                      <p className="text-[8px] font-black text-[#474556] uppercase mb-2">Comisión B2B (Empresa)</p>
                                      <p className="text-xl font-black text-[#52ffac]">20%</p>
                                   </div>
                                </div>
                             </div>

                             <div className="h-px bg-[#2a2b2f]"></div>

                             <div className="space-y-6">
                                <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Estado del Servidor Central</h4>
                                <div className="p-6 bg-[#0d0e12] border border-[#2a2b2f] rounded-2xl flex items-center justify-between">
                                   <div className="flex items-center gap-4">
                                      <div className="w-3 h-3 rounded-full bg-[#52ffac] shadow-[0_0_10px_#52ffac]"></div>
                                      <p className="text-xs font-bold text-white uppercase">Núcleo MantechPro v4.2.1 Online</p>
                                   </div>
                                   <span className="text-[10px] text-[#474556] font-black">LATENCIA: 12ms</span>
                                </div>
                             </div>

                             <button onClick={handleLogout} className="w-full py-5 bg-rose-600/10 border border-rose-600/20 text-rose-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all">Cerrar Sesión Master</button>
                          </div>
                       </div>
                    )}
                  </div>
                ) : (
                   <div className="space-y-10 pb-20">
                     {techTab === 'received' && (
                        <div className="space-y-8">
                          <header>
                            <h1 className="text-4xl font-black text-white tracking-tighter uppercase">Solicitudes</h1>
                            <p className="text-[#c8c4d9] font-medium mt-2">Nuevas oportunidades de servicio en tu zona.</p>
                          </header>
                          {requests.filter(r => r.techUserId === user.uid || r.techId === selectedTechProfileId).length === 0 ? (
                            <div className="p-20 border border-dashed border-[#2a2b2f] rounded-[3rem] text-center bg-[#121317]/30">
                              <div className="w-20 h-20 bg-[#1c1d21] border border-[#2a2b2f] rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-[#474556] shadow-xl">
                                <FileCheck2 className="w-10 h-10 opacity-30" />
                              </div>
                              <p className="text-[#c8c4d9] font-black uppercase tracking-[0.4em] text-xs">Sin Solicitudes Activas</p>
                              <p className="text-[10px] text-[#474556] font-medium uppercase tracking-widest mt-2">El sistema está monitoreando nuevas oportunidades...</p>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {requests.filter(r => r.techUserId === user.uid || r.techId === selectedTechProfileId).map(req => (
                                <div key={req.id} className="bg-[#121317] border border-[#2a2b2f] p-8 rounded-[2.5rem] space-y-6 shadow-2xl relative overflow-hidden">
                                   <div className="flex justify-between items-start">
                                      <div>
                                        <h4 className="text-xl font-black text-white uppercase tracking-tight">{req.clientName}</h4>
                                        <p className="text-[10px] font-bold text-[#c7bfff] uppercase tracking-widest mt-1">Equipo: {req.assetName}</p>
                                        <p className="text-[9px] font-black text-[#52ffac] uppercase tracking-widest">{req.assetDetails || (assets.find(a => a.id === req.assetId)?.details) || 'Detalles no disponibles'}</p>
                                      </div>
                                      <span className="px-4 py-1.5 bg-[#5d3cfe]/20 border border-[#5d3cfe]/30 rounded-full text-[10px] font-black text-[#c7bfff] uppercase tracking-widest">
                                        {req.status === 'completed' ? 'FINALIZADO' :
                                         req.status === 'executing' ? 'EN EJECUCIÓN' :
                                         req.status === 'unforeseen' ? 'IMPREVISTO' :
                                         req.status === 'unforeseen_paid' ? 'PAGO RECIBIDO' :
                                         req.status === 'unforeseen_verifying' ? 'VERIFICANDO PAGO' :
                                         req.status === 'payment_verifying' ? 'VERIFICANDO PAGO' :
                                         req.status === 'accepted' ? 'AGENDADO' :
                                         req.status === 'quoted' ? 'COTIZADO' : 'PENDIENTE'}
                                      </span>
                                   </div>
                                   <div className="flex gap-2 justify-end">
                                      {req.status === 'pending' && (
                                        <button onClick={() => handleRejectRequest(req.id)} className="px-3 py-1 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-full text-[9px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all">Ignorar Solicitud</button>
                                      )}
                                   </div>

                                   <p className="text-xs text-[#c8c4d9] leading-relaxed bg-[#0d0e12] p-5 rounded-2xl border border-[#2a2b2f]/50 italic text-center">"{req.description}"</p>

                                   {req.scheduledDate && (
                                     <div className="grid grid-cols-2 gap-4 bg-[#1c1d21]/30 p-4 rounded-2xl border border-white/5">
                                        <div className="flex items-center gap-3">
                                           <div className="p-2 bg-[#5d3cfe]/10 rounded-lg text-[#5d3cfe]">
                                              <CalendarDays className="w-4 h-4" />
                                           </div>
                                           <div>
                                              <p className="text-[8px] font-black text-[#474556] uppercase tracking-widest">Fecha Programada</p>
                                              <p className="text-[10px] font-bold text-white uppercase">{req.scheduledDate}</p>
                                           </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                           <div className="p-2 bg-[#52ffac]/10 rounded-lg text-[#52ffac]">
                                              <Clock className="w-4 h-4" />
                                           </div>
                                           <div>
                                              <p className="text-[8px] font-black text-[#474556] uppercase tracking-widest">Hora de Cita</p>
                                              <p className="text-[10px] font-bold text-white uppercase">{format12h(req.scheduledTime)}</p>
                                           </div>
                                        </div>
                                     </div>
                                   )}

                                   <div className="bg-[#1c1d21]/50 border border-[#2a2b2f] p-5 rounded-2xl space-y-4">
                                      <h5 className="text-[10px] font-black text-[#474556] uppercase tracking-widest flex justify-between items-center">
                                        Panel de Control Operativo
                                        {timers[req.id] && (
                                          <span className="text-white font-mono font-black text-lg bg-[#0d0e12] px-3 py-1 rounded-xl border border-white/5 shadow-inner">
                                            {formatTimer(timers[req.id].elapsed)}
                                          </span>
                                        )}
                                      </h5>

                                      {req.status === 'quoted' && (
                                        <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-center">
                                           <p className="text-[9px] text-[#c7bfff] font-black uppercase">Esperando pago del cliente...</p>
                                           <p className="text-xl font-black text-white mt-1">${req.price?.toFixed(2)}</p>
                                        </div>
                                      )}

                                      {req.status === 'pending' && (
                                        <div className="w-full space-y-4 bg-[#0d0e12] p-6 rounded-2xl border border-white/5 shadow-2xl">
                                           <div className="flex flex-col gap-2">
                                              <label className="text-[10px] font-black text-[#5d3cfe] uppercase tracking-widest ml-1">1. Materiales de la Cotización</label>
                                              <div className="bg-[#1c1d21] border border-[#2a2b2f] rounded-xl p-4 space-y-3">
                                                 <div className="flex justify-between items-center mb-2">
                                                    <span className="text-[8px] font-bold text-[#474556] uppercase">Lista de Insumos</span>
                                                    <button
                                                      onClick={() => {
                                                        setActiveRequestForMaterial(req);
                                                        setMaterialInputs({ name: '', price: '', quantity: '1', category: 'general' });
                                                        setIsMaterialModalOpen(true);
                                                      }}
                                                      className="px-3 py-1 bg-[#5d3cfe]/10 text-[#c7bfff] rounded-lg border border-[#5d3cfe]/30 text-[8px] font-black uppercase hover:bg-[#5d3cfe] hover:text-white transition-all"
                                                    >
                                                      + Añadir Item
                                                    </button>
                                                 </div>
                                                 <div className="space-y-2">
                                                    {(!quoteInputs[req.id]?.materials || quoteInputs[req.id]?.materials?.length === 0) ? (
                                                      <p className="text-[9px] text-[#474556] italic text-center py-2">Sin materiales en la oferta inicial.</p>
                                                    ) : (
                                                      quoteInputs[req.id]?.materials?.map((m, idx) => (
                                                        <div key={idx} className="flex justify-between items-center bg-[#0d0e12] p-2.5 rounded-xl border border-white/5 group">
                                                           <div className="flex items-center gap-2">
                                                              <button
                                                                onClick={() => {
                                                                  const current = quoteInputs[req.id]?.materials || [];
                                                                  const next = current.filter((_, i) => i !== idx);
                                                                  setQuoteInputs({ ...quoteInputs, [req.id]: { ...quoteInputs[req.id], materials: next, price: next.reduce((acc, x) => acc + (x.price * x.quantity), 0).toString() } });
                                                                }}
                                                                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-rose-500"
                                                              >
                                                                <Trash2 className="w-3 h-3" />
                                                              </button>
                                                              <span className="text-[#52ffac] font-black text-[9px]">x{m.quantity}</span>
                                                              <span className="text-[10px] text-white uppercase font-bold">{m.name}</span>
                                                           </div>
                                                           <span className="text-[10px] font-mono font-black text-[#c7bfff]">${(m.price * m.quantity).toFixed(2)}</span>
                                                        </div>
                                                      ))
                                                    )}
                                                 </div>
                                              </div>
                                           </div>

                                           <div className="flex flex-col gap-2">
                                              <label className="text-[10px] font-black text-[#5d3cfe] uppercase tracking-widest ml-1">2. Presupuesto Final (Mano de Obra + Materiales)</label>
                                              <div className="relative">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#c7bfff] font-bold text-lg">B/.</span>
                                                <input
                                                  type="number"
                                                  placeholder="0.00"
                                                  value={quoteInputs[req.id]?.price || ''}
                                                  onChange={(e) => setQuoteInputs({...quoteInputs, [req.id]: { ...quoteInputs[req.id], price: e.target.value }})}
                                                  className="w-full bg-[#1c1d21] border border-[#2a2b2f] rounded-xl py-4 pl-12 pr-4 text-white font-mono text-2xl focus:border-[#5d3cfe] outline-none transition-all shadow-inner"
                                                />
                                              </div>
                                              <p className="text-[8px] text-[#474556] uppercase ml-1 italic">* La plataforma retendrá un 15% de comisión sobre este total.</p>
                                           </div>

                                           <div className="h-px bg-white/5 my-2"></div>

                                           <label className="text-[10px] font-black text-[#52ffac] uppercase tracking-widest ml-1">3. Programar Cita en Agenda</label>
                                           <div className="grid grid-cols-2 gap-4">
                                              <div className="flex flex-col gap-1.5">
                                                 <span className="text-[8px] font-bold text-[#474556] uppercase ml-1">Día</span>
                                                 <input
                                                   type="date"
                                                   value={quoteInputs[req.id]?.date || ''}
                                                   onChange={(e) => setQuoteInputs({...quoteInputs, [req.id]: { ...quoteInputs[req.id], date: e.target.value }})}
                                                   className="w-full bg-[#1c1d21] border border-[#2a2b2f] rounded-lg py-2.5 px-3 text-white text-xs focus:border-[#5d3cfe] outline-none"
                                                 />
                                              </div>
                                              <div className="flex flex-col gap-1.5">
                                                 <span className="text-[8px] font-bold text-[#474556] uppercase ml-1">Hora</span>
                                                 <input
                                                   type="time"
                                                   value={quoteInputs[req.id]?.time || ''}
                                                   onChange={(e) => setQuoteInputs({...quoteInputs, [req.id]: { ...quoteInputs[req.id], time: e.target.value }})}
                                                   className="w-full bg-[#1c1d21] border border-[#2a2b2f] rounded-lg py-2.5 px-3 text-white text-xs focus:border-[#5d3cfe] outline-none"
                                                 />
                                              </div>
                                           </div>

                                           <button
                                             onClick={() => handleSendQuote(req.id)}
                                             className="w-full py-4 bg-[#5d3cfe] text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-[#5d3cfe]/20 hover:brightness-110 active:scale-95 transition-all"
                                           >
                                             Enviar Propuesta Oficial
                                           </button>
                                        </div>
                                      )}

                                      {(req.status === 'executing' || req.status === 'unforeseen_paid') && (
                                        <div className="space-y-4 animate-fade-in">
                                           {/* Checklist de Tareas */}
                                           <div className="bg-[#0d0e12] p-5 rounded-2xl border border-white/5 space-y-3">
                                              <p className="text-[8px] font-black text-[#c7bfff] uppercase tracking-widest flex items-center gap-2"><FileCheck2 className="w-3 h-3" /> Cronograma de Tareas</p>
                                              <InspectionChecklist
                                                steps={req.checklist || []}
                                                onUpdateStep={(taskId, status) => handleUpdateTask(req.id, taskId, status)}
                                                onAddStep={(label) => handleAddTask(req.id, label)}
                                              />
                                           </div>

                                           {/* Materiales */}
                                           <div className="bg-[#0d0e12] p-5 rounded-2xl border border-white/5 space-y-3">
                                              <div className="flex justify-between items-center">
                                                <p className="text-[8px] font-black text-[#52ffac] uppercase tracking-widest flex items-center gap-2"><Package className="w-3 h-3" /> Materiales Utilizados</p>
                                                <button
                                                  onClick={() => {
                                                    setActiveRequestForMaterial(req);
                                                    setMaterialInputs({ name: '', price: '', category: 'general' });
                                                    setIsMaterialModalOpen(true);
                                                  }}
                                                  className="p-1 bg-[#52ffac]/10 text-[#52ffac] rounded hover:bg-[#52ffac]/20 transition-all"
                                                >
                                                  <PlusCircle className="w-4 h-4" />
                                                </button>
                                              </div>
                                              <div className="space-y-2">
                                                 {(req.materials || []).length === 0 ? (
                                                   <p className="text-[9px] text-[#474556] italic">Sin materiales registrados.</p>
                                                 ) : (
                                                   req.materials?.map((m: any, idx: number) => (
                                                     <div key={idx} className="flex justify-between items-center text-[10px] text-[#c8c4d9] bg-[#1c1d21] p-2 rounded-lg border border-white/5 group">
                                                        <div className="flex items-center gap-2">
                                                           <button onClick={() => handleDeleteMaterial(req.id, idx)} className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-rose-500 hover:bg-rose-500/10 rounded"><Trash2 className="w-3 h-3" /></button>
                                                           <span className="bg-[#0d0e12] px-1.5 py-0.5 rounded text-[#52ffac] font-black mr-1">x{m.quantity || 1}</span>
                                                           <span>{m.name}</span>
                                                        </div>
                                                        <span className="font-bold text-white">${((m.price || 0) * (m.quantity || 1)).toFixed(2)}</span>
                                                     </div>
                                                   ))
                                                 )}
                                              </div>
                                           </div>

                                           <div className="flex gap-3">
                                              <button
                                                onClick={() => {
                                                  setActiveRequestForUnforeseen(req);
                                                  setIsUnforeseenModalOpen(true);
                                                }}
                                                className="flex-1 py-3 bg-amber-500/10 border border-amber-500/30 text-amber-500 text-[10px] font-black uppercase rounded-xl hover:bg-amber-500 hover:text-black transition-all"
                                              >
                                                ⚠️ Reportar Imprevisto
                                              </button>
                                              <button
                                                onClick={() => handleNextDayReschedule(req.id)}
                                                className="flex-1 py-3 bg-[#1c1d21] border border-[#2a2b2f] text-[#c8c4d9] text-[10px] font-black uppercase rounded-xl hover:text-white transition-all flex items-center justify-center gap-2"
                                              >
                                                <Clock className="w-3.5 h-3.5" /> Siguiente Día
                                              </button>
                                              <button onClick={() => handleFinishService(req.id)} className="flex-1 py-3 bg-[#5d3cfe] text-white text-[10px] font-black uppercase rounded-xl shadow-lg shadow-[#5d3cfe]/20 transition-all">✅ Finalizar</button>
                                           </div>
                                        </div>
                                      )}

                                      {req.status === 'accepted' && (
                                         <button onClick={() => handleStartWork(req.id)} className="w-full py-4 bg-[#52ffac] text-black text-[10px] font-black uppercase rounded-xl hover:brightness-110 transition-all shadow-lg shadow-[#52ffac]/20">▶️ Iniciar Trabajo en Sitio</button>
                                      )}
                                   </div>

                                   <div className="flex gap-3 pt-2">
                                      <button onClick={() => { setActiveChatRequestId(req.id); setTechTab('chat'); }} className="flex-1 py-4 bg-[#1c1d21] hover:bg-[#2a2b2f] border border-[#2a2b2f] rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3">
                                        <MessageSquare className="w-5 h-5 text-[#c7bfff]" /> Chat Directo
                                      </button>
                                   </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                     )}
                     {techTab === 'chat' && (
                        <div className="h-[calc(100vh-120px)] flex flex-col">
                          <header className="mb-6 flex justify-between items-center">
                            <div>
                              <h1 className="text-4xl font-black text-white tracking-tighter uppercase">Mensajería Directa</h1>
                              <p className="text-[#c8c4d9] font-medium mt-1">Coordinación directa con tus clientes en Panamá.</p>
                            </div>
                            <button
                              onClick={() => setIsChatSidebarOpen(!isChatSidebarOpen)}
                              className="px-4 py-2 bg-[#121317] border border-[#2a2b2f] rounded-xl text-[10px] font-black uppercase tracking-widest text-[#c8c4d9] hover:text-white transition-all flex items-center gap-2"
                            >
                              {isChatSidebarOpen ? <Menu className="w-4 h-4" /> : <ChevronRight className="w-4 h-4 rotate-180" />}
                              {isChatSidebarOpen ? 'Ocultar Clientes' : 'Ver Clientes'}
                            </button>
                          </header>

                          <div className={`flex-1 flex gap-6 min-h-0 relative ${isChatMaximized ? 'absolute inset-0 z-[100] bg-[#0d0e12] p-0' : ''}`}>
                            {/* Sidebar de Chats Técnico */}
                            {isChatSidebarOpen && !isChatMaximized && (
                              <aside className="w-72 bg-[#121317] border border-[#2a2b2f] rounded-[2rem] p-5 flex flex-col shrink-0 overflow-hidden shadow-xl">
                                <h3 className="text-[10px] font-black text-[#474556] uppercase tracking-[0.2em] mb-5 px-2">Clientes Activos</h3>
                                <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                                  {requests.filter(r => r.techUserId === user.uid || r.techId === selectedTechProfileId).length === 0 ? (
                                    <p className="text-[10px] text-[#474556] font-bold text-center mt-10 uppercase tracking-widest">Sin mensajes</p>
                                  ) : (
                                    requests
                                      .filter(r => r.techUserId === user.uid || r.techId === selectedTechProfileId)
                                      .map(req => (
                                      <button
                                        key={req.id}
                                        onClick={() => setActiveChatRequestId(req.id)}
                                        className={`w-full text-left p-4 rounded-2xl border transition-all group ${
                                          activeChatRequestId === req.id
                                            ? 'bg-[#5d3cfe] border-[#5d3cfe] shadow-lg shadow-[#5d3cfe]/20'
                                            : 'bg-[#0d0e12] border-[#2a2b2f] hover:border-[#5d3cfe]/30'
                                        }`}
                                      >
                                        <div className="flex justify-between items-start mb-1">
                                          <h4 className={`text-xs font-black truncate uppercase ${activeChatRequestId === req.id ? 'text-white' : 'text-white'}`}>{req.clientName}</h4>
                                          <div className={`w-1.5 h-1.5 rounded-full ${req.status === 'accepted' ? 'bg-[#52ffac]' : 'bg-[#474556]'}`}></div>
                                        </div>
                                        <p className={`text-[10px] font-medium truncate ${activeChatRequestId === req.id ? 'text-white/70' : 'text-[#c8c4d9]'}`}>{req.assetName}</p>
                                      </button>
                                    ))
                                  )}
                                </div>
                              </aside>
                            )}

                            <div className={`flex-1 bg-[#121317] border border-[#2a2b2f] rounded-[2.5rem] overflow-hidden shadow-2xl relative ${isChatMaximized ? 'rounded-none border-none' : ''}`}>
                              <SupportChatWidget
                                request={requests.find(r => r.id === activeChatRequestId) || null}
                                role="tech"
                                onSendMessage={(txt, img) => {
                                  if (!user) return;
                                  const reqId = activeChatRequestId || (requests.find(r => r.techUserId === user.uid || r.techId === selectedTechProfileId)?.id);
                                  if(!reqId) return;
                                  addDoc(collection(db, "messages"), {
                                    requestId: reqId,
                                    sender: 'tech',
                                    text: txt,
                                    image: img || null,
                                    timestamp: serverTimestamp()
                                  });
                                }}
                                messages={chatMessages.filter(m => m.requestId === activeChatRequestId)}
                                isMaximized={isChatMaximized}
                                onToggleMaximize={() => setIsChatMaximized(!isChatMaximized)}
                                clientPhone={requests.find(r => r.id === activeChatRequestId)?.clientPhone}
                                onStartVideoCall={(room, voiceOnly) => {
                                  setActiveCallRoom(room);
                                  setIsVoiceOnlyMode(!!voiceOnly);
                                  setIsVideoCallOpen(true);
                                }}
                              />
                            </div>
                          </div>
                        </div>
                     )}
                     {techTab === 'wallet' && (
                       <TechWalletModule
                         wallet={getSelectedTechProfileObj().wallet || { balance: 0, pendingBalance: 0, transactions: [] }}
                         techId={selectedTechProfileId}
                       />
                     )}
                     {techTab === 'mantech_id' && <MantechIDModule mantechId={getSelectedTechProfileObj().mantechId} onUpload={handleUploadDoc} />}
                     {techTab === 'profile' && (
                        <div className="max-w-md mx-auto space-y-8">
                           <header className="text-center space-y-2">
                               <h2 className="text-3xl font-black text-white uppercase tracking-tight">Mi Credencial Digital</h2>
                               <p className="text-[10px] font-black text-[#c8c4d9] uppercase tracking-[0.3em]">Identificación Profesional MantechPro</p>
                           </header>

                           {/* ADMIN ONLY NOTES */}
                           {getSelectedTechProfileObj().adminNotes && (
                              <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl text-center">
                                 <p className="text-[9px] text-amber-500 font-black uppercase tracking-widest italic">"{getSelectedTechProfileObj().adminNotes}"</p>
                              </div>
                           )}

                           <TechCredential tech={getSelectedTechProfileObj()} />

                           <div className="bg-[#1c1d21] border border-[#2a2b2f] p-6 rounded-[2rem] space-y-6">
                              <button
                                 onClick={() => setIsEditingTechProfile(true)}
                                 className="w-full py-4 bg-[#0d0e12] border border-[#5d3cfe] text-[#c7bfff] rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#5d3cfe] hover:text-white transition-all shadow-lg flex items-center justify-center gap-3"
                              >
                                 <Pencil className="w-4 h-4" /> Editar Perfil Comercial
                              </button>

                              <div className="h-px bg-[#2a2b2f]"></div>

                              <div className="p-4 bg-[#0d0e12] rounded-2xl border border-[#2a2b2f] flex items-center gap-4">
                                 <QrCode className="w-8 h-8 text-[#52ffac]" />
                                 <p className="text-[10px] text-[#c8c4d9] font-medium leading-tight uppercase">
                                   Muestre este código al cliente al llegar al sitio para validar su identidad y seguro técnico.
                                 </p>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                 <button onClick={() => window.print()} className="py-3 bg-[#0d0e12] border border-[#2a2b2f] text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:border-[#5d3cfe] transition-all">Imprimir Card</button>
                                 <button onClick={() => alert("Link de validación copiado al portapapeles.")} className="py-3 bg-[#5d3cfe] text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-[#5d3cfe]/20">Copiar Link</button>
                              </div>
                           </div>
                        </div>
                     )}
                     {techTab === 'settings' && (
                        <div className="max-w-2xl mx-auto space-y-10 pb-20">
                            <header className="text-center space-y-2">
                                <h2 className="text-3xl font-black text-white uppercase tracking-tight">Centro de Seguridad Técnico</h2>
                                <p className="text-[10px] font-black text-[#c8c4d9] uppercase tracking-[0.3em]">Validación de Perfil y Trámites de Panamá</p>
                            </header>

                            <div className="modern-card p-10 space-y-10">
                                <div className="space-y-6">
                                    <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Centro de Validación MantechPro</h4>
                                    <div className="p-8 bg-[#0d0e12] border border-[#2a2b2f] rounded-[2rem] space-y-6">
                                        <div className="flex items-center gap-5 text-[#52ffac]">
                                            <div className="p-3 bg-[#52ffac]/10 rounded-2xl"><ShieldCheck className="w-8 h-8" /></div>
                                            <div>
                                                <p className="text-sm font-black text-white uppercase tracking-tight">Sello de Confianza Interno</p>
                                                <p className="text-xs text-[#c8c4d9] font-medium mt-1">Su perfil será validado por nuestro equipo de auditoría para activar su credencial QR.</p>
                                            </div>
                                        </div>
                                        <button onClick={() => setTechTab('profile')} className="block w-full py-4 bg-[#5d3cfe] text-white text-center rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-[#5d3cfe]/20 hover:brightness-110 transition-all">Ver Mi Credencial Digital</button>
                                    </div>
                                </div>

                                <div className="h-px bg-[#2a2b2f]"></div>

                                <div className="space-y-6">
                                    <h4 className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Políticas de Cumplimiento Panamá</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="p-5 bg-rose-500/5 border border-rose-500/20 rounded-2xl">
                                            <p className="text-[10px] font-black text-white uppercase mb-2 italic">Regla del 5%</p>
                                            <p className="text-[9px] text-[#c8c4d9] font-medium leading-relaxed">Si abandona un trabajo, solo tiene derecho al 5% del valor de inspección.</p>
                                        </div>
                                        <div className="p-5 bg-amber-500/5 border border-amber-500/20 rounded-2xl">
                                            <p className="text-[10px] font-black text-white uppercase mb-2 italic">Cancelación al 50%</p>
                                            <p className="text-[9px] text-[#c8c4d9] font-medium leading-relaxed">Liquidación por avance de obra si el cliente cancela durante la ejecución.</p>
                                        </div>
                                    </div>
                                </div>

                                <button onClick={handleLogout} className="w-full py-5 bg-rose-600/10 border border-rose-600/20 text-rose-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all">Cerrar Sesión Profesional</button>
                            </div>
                        </div>
                     )}
                   </div>
                )}
             </div>
          </main>
        </div>
      </div>

      {/* MOBILE */}
      <div className="lg:hidden flex flex-col h-screen overflow-hidden grid-bg no-print">
        <header className="h-16 bg-[#0d0e12]/80 backdrop-blur-md border-b border-[#2a2b2f] flex items-center justify-between px-6 shrink-0 z-50">
          <span className="font-black text-white text-lg tracking-tight">MantechPro</span>
          <div className="flex items-center gap-4">
             <button
               onClick={() => setIsSupportModalOpen(true)}
               className="flex items-center gap-1 px-3 py-1.5 bg-rose-600/10 border border-rose-600/30 text-rose-500 rounded-full text-[8px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-sm shadow-rose-600/10"
             >
               <HelpCircle className="w-3 h-3" /> SOPORTE
             </button>
             <button className="text-[#c8c4d9]"><Bell className="w-5 h-5" /></button>
             <div className="w-8 h-8 rounded-full bg-[#1c1d21] border border-[#2a2b2f] flex items-center justify-center text-[10px] font-black text-white">{loggedInName[0]}</div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-4 py-8 custom-scrollbar">
           <div className="space-y-6">
              {role === 'client' ? (
                <>
                  {clientTab === 'dashboard' && (
                    <div className="space-y-4">
                       <h2 className="text-2xl font-black text-white uppercase tracking-tight">Mis Equipos</h2>
                       {assets.map(a => (
                         <div key={a.id} className="bg-[#121317] border border-[#2a2b2f] p-5 rounded-3xl flex flex-col gap-4">
                            <div className="flex justify-between items-center">
                               <div>
                                  <h4 className="font-black text-white text-sm uppercase tracking-tight">{a.name}</h4>
                                  <p className="text-[10px] text-[#52ffac] font-bold mt-1 uppercase">Siguiente: {a.nextMaintenanceDate}</p>
                               </div>
                               <button onClick={() => { setAssetToEdit(a); setIsAssetModalOpen(true); }} className="p-2 text-[#474556] bg-[#0d0e12] rounded-lg border border-[#2a2b2f]"><Pencil className="w-4 h-4" /></button>
                            </div>
                            {a.observations && (
                              <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl">
                                <p className="text-[8px] font-black text-amber-500 uppercase tracking-widest mb-1 italic">Observaciones</p>
                                <p className="text-[10px] text-[#c8c4d9] leading-tight font-medium">"{a.observations}"</p>
                              </div>
                            )}
                         </div>
                       ))}
                       <button onClick={() => setIsAssetModalOpen(true)} className="w-full py-5 border-2 border-dashed border-[#2a2b2f] rounded-3xl text-[#474556] font-black uppercase text-[10px] tracking-widest active:bg-white/5 transition-all">+ Vincular Equipo</button>
                    </div>
                  )}
                  {clientTab === 'quotes' && (
                    <div className="space-y-4 pb-20">
                       <h2 className="text-2xl font-black text-white uppercase tracking-tight">Contratos</h2>
                       {requests.length === 0 ? (
                         <div className="p-10 border border-dashed border-[#2a2b2f] rounded-3xl text-center text-[#474556] font-bold uppercase text-[10px]">Sin contratos activos</div>
                       ) : requests.map(req => (
                         <div key={req.id} className="bg-[#121317] border border-[#2a2b2f] p-6 rounded-[2rem] space-y-4 shadow-xl">
                            <div className="flex justify-between items-start">
                               <h4 className="font-black text-white text-sm uppercase">{req.assetName}</h4>
                               <span className="px-2 py-0.5 bg-[#1c1d21] border border-[#2a2b2f] rounded text-[8px] font-black text-[#52ffac] uppercase tracking-widest">
                                  {req.status.toLowerCase() === 'completed' ? 'FINALIZADO' :
                                   req.status.toLowerCase() === 'executing' ? 'EN EJECUCIÓN' :
                                   req.status.toLowerCase() === 'accepted' ? 'PAGADO' : 'ACTIVO'}
                               </span>
                            </div>
                            <p className="text-[11px] text-[#c8c4d9] italic">"{req.description}"</p>
                            <div className="flex gap-2">
                               <button onClick={() => { setActiveChatRequestId(req.id); setClientTab('chat'); }} className="flex-1 py-3 bg-[#1c1d21] rounded-xl text-white text-[10px] font-black uppercase">Chat</button>
                               {req.status.toLowerCase() === 'completed' && (
                                 <button onClick={() => { setSelectedRequestForReport(req); setIsReportModalOpen(true); }} className="flex-1 py-3 bg-[#52ffac] text-black rounded-xl text-[10px] font-black uppercase">Reporte</button>
                               )}
                            </div>
                         </div>
                       ))}
                    </div>
                  )}
                  {clientTab === 'diagnostic' && (
                    <div className="pb-20">
                      <DiagnosticView assets={assets} onFindTechnicians={(c) => { setMarketFilter(c); setClientTab('marketplace'); }} />
                    </div>
                  )}
                  {clientTab === 'inventory' && (
                    <div className="pb-20">
                      <InventoryModule items={inventory} assets={assets} onUpdateQuantity={handleUpdateInventoryQuantity} onAddItem={handleAddItem} onDeleteItem={handleDeleteInventoryItem} onUpdateItem={handleUpdateInventoryItem} />
                    </div>
                  )}
                  {clientTab === 'marketplace' && (
                    <div className="space-y-6 pb-20">
                       <h2 className="text-2xl font-black text-white uppercase tracking-tight">Técnicos</h2>
                       <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                         {['Todos', 'Mecánico', 'Técnico A/C', 'Electricista', 'Informático'].map(c => (
                           <button key={c} onClick={() => setMarketFilter(c === 'Todos' ? 'all' : c.toLowerCase().replace(' ', '_') as any)} className={`flex-shrink-0 px-4 py-2 rounded-full border text-[9px] font-black uppercase ${marketFilter === (c === 'Todos' ? 'all' : c.toLowerCase().replace(' ', '_')) ? 'bg-[#5d3cfe] text-white' : 'border-[#2a2b2f] text-[#c8c4d9]'}`}>{c}</button>
                         ))}
                       </div>
                       <div className="grid grid-cols-1 gap-4">
                         {technicians.filter(t => marketFilter === 'all' || t.category === marketFilter).map(t => (
                            <div key={t.id} className="bg-[#121317] border border-[#2a2b2f] p-5 rounded-3xl space-y-4">
                               <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-xl bg-[#5d3cfe] flex items-center justify-center text-white font-black">{t.name[0]}</div>
                                  <div>
                                     <h4 className="font-black text-white text-xs uppercase">{t.name}</h4>
                                     <p className="text-[8px] text-[#52ffac] font-bold uppercase">{t.category}</p>
                                  </div>
                               </div>
                               <button onClick={() => { setActiveTechForModal(t); setIsTechModalOpen(true); }} className="w-full py-3 bg-[#1c1d21] rounded-xl text-white text-[10px] font-black uppercase">Ver Perfil</button>
                            </div>
                         ))}
                       </div>
                    </div>
                  )}
                  {clientTab === 'subscriptions' && (
                    <div className="pb-20">
                      <SubscriptionModule
                        subscription={subscription}
                        onUpgrade={(planId) => {
                          setSubscription(prev => ({ ...prev, planId }));
                          alert(`¡Plan actualizado!`);
                        }}
                      />
                    </div>
                  )}
                  {clientTab === 'fleet' && (
                    <div className="pb-20">
                      {subscription.planId === 'plan-enterprise' ? (
                        <FleetDashboard assets={assets} reminders={reminders} onManageAsset={(a) => { setAssetToEdit(a); setIsAssetModalOpen(true); }} />
                      ) : (
                        <div className="p-10 text-center space-y-4 bg-[#121317] rounded-3xl border border-[#2a2b2f]">
                          <ShieldCheck className="w-10 h-10 text-[#5d3cfe] mx-auto" />
                          <h3 className="font-black text-white uppercase text-sm">Flota Corporativa</h3>
                          <p className="text-[10px] text-[#c8c4d9]">Disponible para el Plan Corporativo.</p>
                          <button onClick={() => setClientTab('subscriptions')} className="text-[#5d3cfe] text-[10px] font-black uppercase">Mejorar Plan</button>
                        </div>
                      )}
                    </div>
                  )}
                  {clientTab === 'chat' && (
                    <div className="h-[calc(100vh-180px)]">
                       <SupportChatWidget
                        request={requests.find(r => r.id === activeChatRequestId) || requests[0]}
                        role="client"
                        onSendMessage={(txt, img) => {
                          if (!user || !activeChatRequestId) return;
                          addDoc(collection(db, "messages"), { requestId: activeChatRequestId, sender: 'client', text: txt, image: img || null, timestamp: serverTimestamp() });
                        }}
                        messages={chatMessages.filter(m => m.requestId === (activeChatRequestId || requests[0]?.id))}
                        isMaximized={isChatMaximized}
                        onToggleMaximize={() => setIsChatMaximized(!isChatMaximized)}
                       />
                    </div>
                  )}
                  {clientTab === 'settings' && (
                    <div className="space-y-6 pb-20">
                      <h2 className="text-2xl font-black text-white uppercase tracking-tight">Mi Perfil</h2>
                      <div className="bg-[#121317] border border-[#2a2b2f] p-6 rounded-[2rem] space-y-8">
                         <form onSubmit={submitProfileUpdate} className="space-y-4">
                            <div className="space-y-2">
                               <label className="text-[10px] font-black text-[#474556] uppercase tracking-widest">Nombre</label>
                               <input
                                 type="text"
                                 value={loggedInName}
                                 readOnly={role !== 'admin'}
                                 onChange={e => setLoggedInName(e.target.value)}
                                 className={`w-full border border-[#2a2b2f] rounded-xl py-3 px-4 text-sm ${role !== 'admin' ? 'bg-[#0d0e12] text-[#474556] cursor-not-allowed' : 'bg-[#1c1d21] text-white'}`}
                               />
                            </div>
                            <div className="space-y-2">
                               <label className="text-[10px] font-black text-[#474556] uppercase tracking-widest">Teléfono</label>
                               <input type="tel" value={loggedInPhone} onChange={e => setLoggedInPhone(e.target.value)} className="w-full bg-[#0d0e12] border border-[#2a2b2f] rounded-xl py-3 px-4 text-white text-sm" />
                            </div>
                            <button type="submit" className="w-full py-3 bg-[#5d3cfe] text-white rounded-xl text-[10px] font-black uppercase shadow-lg shadow-[#5d3cfe]/20">Guardar Cambios</button>
                         </form>

                         <div className="h-px bg-[#2a2b2f]"></div>

                         <div className="space-y-6">
                            <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Identidad Mantech ID</h4>
                            <MantechIDModule
                              mantechId={{
                                status: userData?.idStatus || 'unverified',
                                idNumber: userData?.idNumber || '',
                                documentUrl: userData?.idCardUrl,
                                policeRecordUrl: userData?.policeRecordUrl
                              }}
                              onUpload={handleUploadDoc}
                            />
                         </div>

                         <div className="h-px bg-[#2a2b2f]"></div>

                         <div className="space-y-4">
                            <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Validación de Identidad</h4>
                            <p className="text-[10px] text-[#c8c4d9] leading-tight">MantechPro valida su identidad internamente para generar su sello de confianza visual.</p>
                         </div>

                         <button onClick={handleLogout} className="w-full py-4 border border-rose-500/20 text-rose-500 rounded-xl text-[10px] font-black uppercase">Cerrar Sesión</button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {techTab === 'received' && (
                    <div className="space-y-4">
                       <h2 className="text-2xl font-black text-white uppercase tracking-tight">Solicitudes</h2>
                       {requests.filter(r => r.techUserId === user.uid).map(req => (
                         <div key={req.id} className="bg-[#121317] border border-[#2a2b2f] p-6 rounded-[2rem] space-y-4 shadow-xl">
                            <div className="flex justify-between items-start">
                               <h4 className="font-black text-white text-sm uppercase">{req.clientName}</h4>
                               <span className="px-2 py-0.5 bg-[#1c1d21] border border-[#2a2b2f] rounded text-[8px] font-black text-[#c7bfff] uppercase tracking-widest">{req.status}</span>
                            </div>
                            <p className="text-[11px] text-[#c8c4d9] italic">"{req.description}"</p>
                            <div className="flex gap-2">
                               <button onClick={() => { setActiveChatRequestId(req.id); setTechTab('chat'); }} className="flex-1 py-3 bg-[#1c1d21] rounded-xl text-white text-[10px] font-black uppercase">Chat</button>
                               {req.status === 'executing' && <button onClick={() => updateDoc(doc(db,"requests",req.id), {status:'completed'})} className="flex-1 py-3 bg-[#5d3cfe] rounded-xl text-white text-[10px] font-black uppercase">Finalizar</button>}
                            </div>
                         </div>
                       ))}
                    </div>
                  )}
                  {techTab === 'chat' && (
                    <div className="h-[calc(100vh-180px)]">
                       <SupportChatWidget
                        request={requests.find(r => r.id === activeChatRequestId) || null}
                        role="tech"
                        onSendMessage={(txt, img) => {
                          if (!user || !activeChatRequestId) return;
                          addDoc(collection(db, "messages"), { requestId: activeChatRequestId, sender: 'tech', text: txt, image: img || null, timestamp: serverTimestamp() });
                        }}
                        messages={chatMessages.filter(m => m.requestId === activeChatRequestId)}
                        isMaximized={isChatMaximized}
                        onToggleMaximize={() => setIsChatMaximized(!isChatMaximized)}
                       />
                    </div>
                  )}
                  {techTab === 'settings' && (
                    <div className="space-y-6 pb-20">
                      <h2 className="text-2xl font-black text-white uppercase tracking-tight">Configuración Técnica</h2>
                      <div className="bg-[#121317] border border-[#2a2b2f] p-6 rounded-[2rem] space-y-8">
                         <div className="space-y-4">
                            <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Documentación</h4>
                            <a href="https://www.panamadigital.gob.pa/" target="_blank" rel="noreferrer" className="block w-full py-4 bg-[#1c1d21] border border-[#2a2b2f] text-white text-center rounded-xl text-[10px] font-black uppercase">🔗 Trámites Récord Policivo</a>
                         </div>

                         <div className="h-px bg-[#2a2b2f]"></div>

                         <button onClick={handleLogout} className="w-full py-4 border border-rose-500/20 text-rose-500 rounded-xl text-[10px] font-black uppercase">Cerrar Sesión Profesional</button>
                      </div>
                    </div>
                  )}
                </>
              )}
           </div>
        </main>

        <nav className="h-20 bg-[#121317]/95 backdrop-blur-xl border-t border-[#2a2b2f] flex items-center justify-around px-2 shrink-0 z-50">
          {role === 'admin' ? (
            <>
              <button onClick={() => setAdminTab('finance')} className={`flex flex-col items-center gap-1.5 transition-all ${adminTab === 'finance' ? 'text-rose-500' : 'text-[#474556]'}`}>
                <PieChart className="w-6 h-6" />
                <span className="text-[8px] font-black uppercase">Finanzas</span>
              </button>
<<<<<<< HEAD
              <button onClick={() => setClientTab('ai')} className={`flex-1 flex flex-col items-center justify-center p-0.5 font-bold ${clientTab === 'ai' ? 'text-indigo-600 font-extrabold' : 'text-zinc-400'}`}>
                <Bot className="w-4 h-4 animate-pulse text-indigo-500" />
                <span className="text-[7.5px] uppercase mt-0.5">Asistente</span>
=======
              <button onClick={() => setAdminTab('tickets')} className={`flex flex-col items-center gap-1.5 transition-all ${adminTab === 'tickets' ? 'text-rose-500' : 'text-[#474556]'}`}>
                <LifeBuoy className="w-6 h-6" />
                <span className="text-[8px] font-black uppercase">Tickets</span>
>>>>>>> 704b6d958a85e1739c0273d956d23c9955ad9baf
              </button>
              <button onClick={() => setAdminTab('logistics')} className={`flex flex-col items-center gap-1.5 transition-all ${adminTab === 'logistics' ? 'text-rose-500' : 'text-[#474556]'}`}>
                <Truck className="w-6 h-6" />
                <span className="text-[8px] font-black uppercase">Logística</span>
              </button>
              <button onClick={() => setAdminTab('settings')} className={`flex flex-col items-center gap-1.5 transition-all ${adminTab === 'settings' ? 'text-rose-500' : 'text-[#474556]'}`}>
                <Settings className="w-6 h-6" />
                <span className="text-[8px] font-black uppercase">Ajustes</span>
              </button>
            </>
          ) : (
            <>
              <button onClick={() => role === 'client' ? setClientTab('dashboard') : setTechTab('received')} className={`flex flex-col items-center gap-1.5 transition-all ${((role === 'client' && clientTab === 'dashboard') || (role === 'tech' && techTab === 'received')) ? 'text-[#c7bfff]' : 'text-[#474556]'}`}>
                <LayoutDashboard className="w-5 h-5" />
                <span className="text-[7px] font-black uppercase">{role === 'client' ? 'Inicio' : 'Tareas'}</span>
              </button>
              {role === 'client' && (
                <>
                  <button onClick={() => setClientTab('marketplace')} className={`flex flex-col items-center gap-1.5 transition-all ${clientTab === 'marketplace' ? 'text-[#c7bfff]' : 'text-[#474556]'}`}>
                    <Store className="w-5 h-5" />
                    <span className="text-[7px] font-black uppercase">Técnicos</span>
                  </button>
                  <button onClick={() => setClientTab('diagnostic')} className={`flex flex-col items-center gap-1.5 transition-all ${clientTab === 'diagnostic' ? 'text-[#c7bfff]' : 'text-[#474556]'}`}>
                    <Activity className="w-5 h-5" />
                    <span className="text-[7px] font-black uppercase">Diagnóstico</span>
                  </button>
                  <button onClick={() => setClientTab('quotes')} className={`flex flex-col items-center gap-1.5 transition-all ${clientTab === 'quotes' ? 'text-[#c7bfff]' : 'text-[#474556]'}`}>
                    <FileCheck2 className="w-5 h-5" />
                    <span className="text-[7px] font-black uppercase">Contratos</span>
                  </button>
                  <button onClick={() => setClientTab('subscriptions')} className={`flex flex-col items-center gap-1.5 transition-all ${clientTab === 'subscriptions' ? 'text-[#c7bfff]' : 'text-[#474556]'}`}>
                    <Star className="w-6 h-6" />
                    <span className="text-[8px] font-black uppercase">Planes</span>
                  </button>
                </>
              )}
              <button onClick={() => role === 'client' ? setClientTab('chat') : setTechTab('chat')} className={`flex flex-col items-center gap-1.5 transition-all ${((role === 'client' && clientTab === 'chat') || (role === 'tech' && techTab === 'chat')) ? 'text-[#c7bfff]' : 'text-[#474556]'}`}>
                <MessageSquare className="w-6 h-6" />
                <span className="text-[8px] font-black uppercase">Chat</span>
              </button>
              {role === 'tech' && (
                <>
                  <button onClick={() => setTechTab('profile')} className={`flex flex-col items-center gap-1.5 transition-all ${techTab === 'profile' ? 'text-[#c7bfff]' : 'text-[#474556]'}`}>
                    <User className="w-6 h-6" />
                    <span className="text-[8px] font-black uppercase">Perfil</span>
                  </button>
                  <button onClick={() => setTechTab('wallet')} className={`flex flex-col items-center gap-1 transition-all ${techTab === 'wallet' ? 'text-[#c7bfff]' : 'text-[#474556]'}`}>
                    <PieChart className="w-6 h-6" />
                    <span className="text-[8px] font-black uppercase">Cartera</span>
                  </button>
                  <button onClick={() => setTechTab('settings')} className={`flex flex-col items-center gap-1.5 transition-all ${techTab === 'settings' ? 'text-[#c7bfff]' : 'text-[#474556]'}`}>
                    <Settings className="w-6 h-6" />
                    <span className="text-[8px] font-black uppercase">Ajustes</span>
                  </button>
                </>
              )}
            </>
          )}
        </nav>
      </div>

      <VideoCallModal
        isOpen={isVideoCallOpen}
        onClose={() => setIsVideoCallOpen(false)}
        roomName={activeCallRoom}
        userName={loggedInName}
        isVoiceOnly={isVoiceOnlyMode}
      />
      <QRScannerModal
        isOpen={isQRScannerOpen}
        onClose={() => setIsQRScannerOpen(false)}
        onScanSuccess={(id) => {
          console.log("Scanned Tech ID:", id);
          setIsQRScannerOpen(false);
        }}
        technicians={technicians}
      />
      {/* Modal de Visor de Documentos (Solo Admin) */}
      {selectedDocUrl && (
        <div className="fixed inset-0 z-[400] bg-black/95 flex flex-col items-center justify-center p-10 animate-fade-in">
           <button onClick={() => setSelectedDocUrl(null)} className="absolute top-10 right-10 p-4 bg-white/10 text-white rounded-full hover:bg-rose-600 transition-all"><X className="w-8 h-8" /></button>
           <div className="max-w-4xl w-full h-full flex flex-col gap-6">
              <header className="text-center">
                 <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Visor de Identidad Mantech ID</h2>
                 <p className="text-[#c8c4d9] font-bold uppercase tracking-widest text-[10px] mt-2">Documento verificado bajo protocolo de seguridad</p>
              </header>
              <div className="flex-1 bg-[#121317] border border-white/10 rounded-[3rem] overflow-hidden shadow-2xl relative">
                 <img src={selectedDocUrl} className="w-full h-full object-contain" alt="Cédula de Identidad" />
                 <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-4">
                    <button onClick={() => { window.open(selectedDocUrl); }} className="px-8 py-3 bg-[#5d3cfe] text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-[#5d3cfe]/20">Abrir Original</button>
                    <button onClick={() => setSelectedDocUrl(null)} className="px-8 py-3 bg-[#1c1d21] border border-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">Cerrar Visor</button>
                 </div>
              </div>
           </div>
        </div>
      )}

      <SupportResponseModal
        isOpen={activeTicketForResponse !== null}
        onClose={() => setActiveTicketForResponse(null)}
        ticket={activeTicketForResponse}
      />
      <MonthlyClosureModal
        isOpen={isMonthlyClosureOpen}
        onClose={() => setIsMonthlyClosureOpen(false)}
        adminEmail={loggedInEmail}
        data={{
          totalCommissions: requests.filter(r => r.status === 'completed').reduce((sum, r) => sum + (r.commission || 0), 0),
          totalSubscriptions: technicians.filter(t => t.plan === 'premium').length * 45,
          pendingPayments: requests.filter(r => ['accepted', 'executing', 'unforeseen', 'unforeseen_paid'].includes(r.status)).reduce((sum, r) => sum + (r.technicianEarnings || 0), 0),
          netUtility: requests.filter(r => r.status === 'completed').reduce((sum, r) => sum + (r.commission || 0), 0) + (technicians.filter(t => t.plan === 'premium').length * 45),
          month: new Intl.DateTimeFormat('es-ES', { month: 'long' }).format(new Date()),
          year: new Date().getFullYear()
        }}
      />
      <AssetRegisterModal isOpen={isAssetModalOpen} onClose={() => { setIsAssetModalOpen(false); setAssetToEdit(null); }} onAdd={handleAddAsset} assetToEdit={assetToEdit} />
      <Chatbot247 />
      <SupportModal
        isOpen={isSupportModalOpen}
        onClose={() => setIsSupportModalOpen(false)}
        userEmail={loggedInEmail}
        userName={loggedInName}
        userId={user?.uid}
        userRole={role}
      />
      <TechnicianProfileModal tech={activeTechForModal} isOpen={isTechModalOpen} onClose={() => setIsTechModalOpen(false)} assets={assets} onRequestQuote={handleRequestQuote} />
      {isEditingTechProfile && <TechnicianEditProfileModal isOpen={isEditingTechProfile} onClose={() => setIsEditingTechProfile(false)} profile={technicians.find(t => t.id === selectedTechProfileId) || {} as any} onSave={handleUpdateTechProfile} />}
      {selectedRequestForReport && (
        <ServiceReportModal
          isOpen={isReportModalOpen}
          onClose={() => { setIsReportModalOpen(false); setSelectedRequestForReport(null); }}
          request={selectedRequestForReport}
        />
      )}

<<<<<<< HEAD
      {/* EMBEDDED PAYMENT MODAL */}
      {isPaymentModalOpen && activePaymentRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-zinc-100 flex flex-col relative">
            <button
              onClick={() => setIsPaymentModalOpen(false)}
              className="absolute top-6 right-6 p-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-500 rounded-full transition-all z-10"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="p-8 text-center space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-100">
                    <div className="w-4 h-4 bg-white rounded-xs"></div>
                  </div>
                  <span className="text-xl font-black tracking-tighter text-zinc-900">Mantech<span className="text-indigo-600">Pro</span></span>
                </div>
                <h3 className="text-xl font-black text-zinc-900 uppercase tracking-tight">Checkout Seguro</h3>
                <p className="text-xs text-zinc-500">Estás pagando el servicio de <strong>{activePaymentRequest.assetName}</strong></p>
              </div>

              <div className="bg-zinc-50 rounded-2xl p-5 border border-zinc-100 flex justify-between items-center">
                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Total a Pagar:</span>
                <span className="text-2xl font-black text-indigo-600">${activePaymentRequest.price?.toFixed(2)}</span>
              </div>

              {/* Botón de PayPal Embebido (Simulación en local, Producción usa SDK) */}
              <div className="space-y-3 pt-2">
                <button
                  onClick={() => {
                    alert("Simulando proceso de tarjeta... ¡Pago aprobado!");
                    handleAcceptQuote(activePaymentRequest.id, 'card');
                    setIsPaymentModalOpen(false);
                  }}
                  className="w-full py-4 bg-[#0070ba] hover:bg-[#005ea6] text-white rounded-2xl font-black text-sm transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-4 brightness-0 invert" />
                  Pagar con PayPal / Tarjeta
                </button>

                <p className="text-[9px] text-zinc-400 font-medium px-6">
                  Pago procesado de forma encriptada. MantechPro no almacena los datos de tu tarjeta.
                </p>
              </div>
            </div>

            <div className="p-4 bg-zinc-50 border-t border-zinc-100 flex justify-center items-center gap-4">
              <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" className="h-3 opacity-30" alt="Visa" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" className="h-4 opacity-30" alt="Mastercard" />
              <div className="w-px h-3 bg-zinc-300"></div>
              <span className="text-[9px] font-black text-zinc-400 uppercase tracking-tighter">PCI Compliance Certified</span>
            </div>
          </div>
        </div>
      )}

      {/* SIGNATURE & RATING CAPTURE MODAL */}
      {isSignatureModalOpen && selectedRequestForReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-zinc-100 flex flex-col">
            <div className="p-6 border-b border-zinc-100 text-center bg-zinc-50">
              <h3 className="text-lg font-black text-zinc-900 uppercase tracking-tight">Cierre de Garantía en Sitio</h3>
              <p className="text-[11px] text-zinc-500 font-medium">El cliente debe firmar y calificar para liberar el pago.</p>
            </div>
=======
      {/* MODAL DE IMPREVISTO PROFESIONAL */}
      {isUnforeseenModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-[#0d0e12]/90 backdrop-blur-sm overflow-y-auto">
           <div className="w-full max-w-lg bg-[#121317] border border-[#2a2b2f] rounded-[2.5rem] shadow-2xl p-8 space-y-6 animate-fade-in-up">
              <header className="flex justify-between items-center">
                 <div className="flex items-center gap-3 text-amber-500">
                    <AlertCircle className="w-6 h-6" />
                    <h2 className="text-xl font-black uppercase tracking-tight">Reportar Imprevisto</h2>
                 </div>
                 <button onClick={() => setIsUnforeseenModalOpen(false)} className="text-[#474556] hover:text-white transition-all"><X className="w-6 h-6" /></button>
              </header>
>>>>>>> 704b6d958a85e1739c0273d956d23c9955ad9baf

              <div className="space-y-4">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-[#474556] uppercase tracking-widest ml-1">Categoría del Imprevisto</label>
                    <div className="grid grid-cols-2 gap-2">
                       {[
                         { id: 'spare_part', label: 'Repuesto Extra', icon: <Package className="w-3 h-3" /> },
                         { id: 'hidden_damage', label: 'Daño Oculto', icon: <Activity className="w-3 h-3" /> },
                         { id: 'extra_labor', label: 'Mano de Obra', icon: <Clock className="w-3 h-3" /> },
                         { id: 'consumables', label: 'Insumos', icon: <Zap className="w-3 h-3" /> }
                       ].map(cat => (
                         <button
                           key={cat.id}
                           onClick={() => setUnforeseenInputs({ ...unforeseenInputs, category: cat.id })}
                           className={`p-3 rounded-xl border flex items-center gap-2 text-[10px] font-bold uppercase transition-all ${
                             unforeseenInputs.category === cat.id ? 'bg-[#5d3cfe] border-[#5d3cfe] text-white' : 'bg-[#1c1d21] border-[#2a2b2f] text-[#c8c4d9] hover:border-[#5d3cfe]/30'
                           }`}
                         >
                           {cat.icon} {cat.label}
                         </button>
                       ))}
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-[#474556] uppercase tracking-widest ml-1">Descripción Técnica</label>
                    <textarea
                      placeholder="Explique el imprevisto detectado..."
                      value={unforeseenInputs.reason}
                      onChange={(e) => setUnforeseenInputs({ ...unforeseenInputs, reason: e.target.value })}
                      className="w-full bg-[#0d0e12] border border-[#2a2b2f] rounded-2xl p-4 text-white text-xs font-medium focus:border-amber-500 outline-none h-24"
                    />
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-[#474556] uppercase tracking-widest ml-1">Costo Adicional ($)</label>
                    <div className="relative">
                       <span className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500 font-bold">$</span>
                       <input
                         type="number"
                         placeholder="0.00"
                         value={unforeseenInputs.amount}
                         onChange={(e) => setUnforeseenInputs({ ...unforeseenInputs, amount: e.target.value })}
                         className="w-full bg-[#0d0e12] border border-[#2a2b2f] rounded-2xl py-4 pl-10 pr-4 text-white font-mono text-xl focus:border-amber-500 outline-none"
                       />
                    </div>
                 </div>

                 <div className="flex items-center gap-3 p-4 bg-rose-500/5 border border-rose-500/10 rounded-2xl">
                    <input
                      type="checkbox"
                      id="compromises"
                      checked={unforeseenInputs.compromises}
                      onChange={(e) => setUnforeseenInputs({ ...unforeseenInputs, compromises: e.target.checked })}
                      className="w-4 h-4 rounded border-[#2a2b2f] bg-[#0d0e12] text-[#5d3cfe]"
                    />
                    <label htmlFor="compromises" className="text-[9px] text-rose-400 font-black uppercase leading-tight cursor-pointer">
                       Este imprevisto compromete la garantía del trabajo original
                    </label>
                 </div>
              </div>

              <button
                onClick={() => {
                   if(!unforeseenInputs.reason || !unforeseenInputs.amount) return alert("Complete los datos");
                   handleTriggerUnforeseen(
                     activeRequestForUnforeseen.id,
                     unforeseenInputs.reason,
                     Number(unforeseenInputs.amount),
                     unforeseenInputs.category,
                     unforeseenInputs.compromises
                   );
                   setIsUnforeseenModalOpen(false);
                }}
                className="w-full py-4 bg-amber-500 text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-amber-500/20"
              >
                 Enviar Reporte al Cliente
              </button>
           </div>
        </div>
      )}

      {/* MODAL DE MATERIALES PROFESIONAL */}
      {isMaterialModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-[#0d0e12]/90 backdrop-blur-sm overflow-y-auto">
           <div className="w-full max-w-lg bg-[#121317] border border-[#2a2b2f] rounded-[2.5rem] shadow-2xl p-8 space-y-6 animate-fade-in-up">
              <header className="flex justify-between items-center">
                 <div className="flex items-center gap-3 text-[#52ffac]">
                    <Package className="w-6 h-6" />
                    <h2 className="text-xl font-black uppercase tracking-tight">Añadir Material / Insumo</h2>
                 </div>
                 <button onClick={() => setIsMaterialModalOpen(false)} className="text-[#474556] hover:text-white transition-all"><X className="w-6 h-6" /></button>
              </header>

              <div className="space-y-4">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-[#474556] uppercase tracking-widest ml-1">Categoría</label>
                    <div className="grid grid-cols-2 gap-2">
                       {[
                         { id: 'general', label: 'General', icon: <Package className="w-3 h-3" /> },
                         { id: 'electrical', label: 'Eléctrico', icon: <Zap className="w-3 h-3" /> },
                         { id: 'mechanical', label: 'Mecánico', icon: <Settings className="w-3 h-3" /> },
                         { id: 'chemical', label: 'Líquidos/Químicos', icon: <Activity className="w-3 h-3" /> }
                       ].map(cat => (
                         <button
                           key={cat.id}
                           onClick={() => setMaterialInputs({ ...materialInputs, category: cat.id })}
                           className={`p-3 rounded-xl border flex items-center gap-2 text-[10px] font-bold uppercase transition-all ${
                             materialInputs.category === cat.id ? 'bg-[#5d3cfe] border-[#5d3cfe] text-white' : 'bg-[#1c1d21] border-[#2a2b2f] text-[#c8c4d9] hover:border-[#5d3cfe]/30'
                           }`}
                         >
                           {cat.icon} {cat.label}
                         </button>
                       ))}
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-[#474556] uppercase tracking-widest ml-1">Nombre del Material</label>
                    <input
                      type="text"
                      placeholder="Ej: Filtro de Aceite, Cable 12AWG..."
                      value={materialInputs.name}
                      onChange={(e) => setMaterialInputs({ ...materialInputs, name: e.target.value })}
                      className="w-full bg-[#0d0e12] border border-[#2a2b2f] rounded-2xl py-4 px-4 text-white text-xs font-bold focus:border-[#52ffac] outline-none"
                    />
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-[#474556] uppercase tracking-widest ml-1">Costo Unitario ($)</label>
                       <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#52ffac] font-bold">$</span>
                          <input
                            type="number"
                            placeholder="0.00"
                            value={materialInputs.price}
                            onChange={(e) => setMaterialInputs({ ...materialInputs, price: e.target.value })}
                            className="w-full bg-[#0d0e12] border border-[#2a2b2f] rounded-2xl py-4 pl-10 pr-4 text-white font-mono text-xl focus:border-[#52ffac] outline-none"
                          />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-[#474556] uppercase tracking-widest ml-1">Cantidad</label>
                       <input
                         type="number"
                         min="1"
                         value={materialInputs.quantity}
                         onChange={(e) => setMaterialInputs({ ...materialInputs, quantity: e.target.value })}
                         className="w-full bg-[#0d0e12] border border-[#2a2b2f] rounded-2xl py-4 px-4 text-white font-mono text-xl focus:border-[#52ffac] outline-none text-center"
                       />
                    </div>
                 </div>
              </div>

              <button
                onClick={() => {
                   if(!materialInputs.name || !materialInputs.price || !materialInputs.quantity) return alert("Complete los datos");

                   // Si es una cotización inicial (pending)
                   if (activeRequestForMaterial.status === 'pending') {
                      const currentQuote = quoteInputs[activeRequestForMaterial.id] || {};
                      const newMaterial = {
                        name: materialInputs.name,
                        price: Number(materialInputs.price),
                        quantity: Number(materialInputs.quantity),
                        category: materialInputs.category,
                        addedAt: new Date().toISOString()
                      };

                      setQuoteInputs({
                        ...quoteInputs,
                        [activeRequestForMaterial.id]: {
                          ...currentQuote,
                          materials: [...(currentQuote.materials || []), newMaterial],
                          // Auto-actualizar precio total si el técnico no ha puesto uno
                          price: currentQuote.price || [...(currentQuote.materials || []), newMaterial].reduce((acc, m) => acc + (m.price * m.quantity), 0).toString()
                        }
                      });
                   } else {
                      // Si es durante ejecución
                      handleSaveMaterial(
                        activeRequestForMaterial.id,
                        materialInputs.name,
                        Number(materialInputs.price),
                        Number(materialInputs.quantity),
                        materialInputs.category
                      );
                   }
                   setIsMaterialModalOpen(false);
                }}
                className="w-full py-4 bg-[#52ffac] text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-[#52ffac]/20"
              >
                 Registrar Material
              </button>
           </div>
        </div>
      )}
    </div>
  );
}

function AdminFinanceView({ requests, technicians, setIsMonthlyClosureOpen, onApprovePayment, onApproveUnforeseenPayment }: any) {
  // MÉTRICAS TOTALES
  const totalCommissions = requests.filter((r: any) => r.status === 'completed').reduce((sum: number, r: any) => sum + (r.commission || 0), 0);
  const totalSubscriptions = technicians.filter((t: any) => t.plan === 'premium').length * 45;
  const pendingPayments = requests.filter((r: any) => ['payment_verifying', 'accepted', 'executing', 'unforeseen', 'unforeseen_paid'].includes(r.status)).reduce((sum: number, r: any) => sum + (r.technicianEarnings || 0), 0);
  const netUtility = totalCommissions + totalSubscriptions;
  const techsToPay = technicians.filter((t: any) => (t.wallet?.balance || 0) > 0);
  const paymentsToVerify = requests.filter((r: any) => ['payment_verifying', 'unforeseen_verifying'].includes(r.status));

  // LÓGICA DE GRÁFICA: SOLO EVENTOS REALES POR DÍA
  const chartData = [...Array(7)].map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dateStr = date.toISOString().split('T')[0];

    // Solo sumar si la fecha de creación coincide exactamente con el día de la barra
    const dayComms = requests
      .filter((r: any) => {
        const rDate = r.createdAt?.toDate ? r.createdAt.toDate().toISOString() : (typeof r.createdAt === 'string' ? r.createdAt : '');
        return r.status === 'completed' && rDate.startsWith(dateStr);
      })
      .reduce((sum: number, r: any) => sum + (r.commission || 0), 0);

    // Membresías: Solo mostrar el monto completo el día que se unieron (Simulado con createdAt del tech si existe)
    const daySubs = technicians
      .filter((t: any) => {
        const tDate = t.createdAt?.toDate ? t.createdAt.toDate().toISOString() : (typeof t.createdAt === 'string' ? t.createdAt : '');
        return t.plan === 'premium' && tDate.startsWith(dateStr);
      })
      .length * 45;

    return {
      label: `${new Intl.DateTimeFormat('es-ES', { month: 'short' }).format(date).toUpperCase()} ${date.getDate()}`,
      commissions: dayComms,
      memberships: daySubs
    };
  });

  // Escalar la gráfica al valor más alto real, mínimo $10 para que no se vea vacía
  const maxValue = Math.max(...chartData.map(d => Math.max(d.commissions, d.memberships)), 10);

  return (
    <div className="space-y-10 animate-fade-in">
      <header>
        <h1 className="text-3xl font-black text-white tracking-tighter uppercase">Consola Financiera Master</h1>
        <p className="text-[10px] text-[#c8c4d9] font-bold uppercase tracking-widest mt-1 opacity-70">Auditoría real de transacciones y flujo de caja.</p>
      </header>

      {/* Gráfica de Rendimiento REAL */}
      <div className="modern-card p-8 bg-[#121317] border-[#2a2b2f] space-y-8">
         <div className="flex justify-between items-center">
            <div>
               <h3 className="text-sm font-black text-white uppercase tracking-tight">Actividad de los Últimos 7 Días</h3>
               <p className="text-[9px] text-[#474556] font-bold uppercase tracking-widest">Ingresos detectados por fecha de transacción</p>
            </div>
            <div className="flex gap-4">
               <div className="flex items-center gap-2"><div className="w-2 h-2 bg-[#5d3cfe] rounded-full shadow-[0_0_8px_#5d3cfe]"></div><span className="text-[8px] font-black text-[#c8c4d9] uppercase">Comisiones</span></div>
               <div className="flex items-center gap-2"><div className="w-2 h-2 bg-[#52ffac] rounded-full shadow-[0_0_8px_#52ffac]"></div><span className="text-[8px] font-black text-[#c8c4d9] uppercase">Membresías</span></div>
            </div>
         </div>

         <div className="h-48 w-full relative pt-10">
            {/* Eje Y con Escala Dinámica */}
            <div className="absolute left-0 h-full w-px bg-white/5 flex flex-col justify-between text-[7px] text-[#474556] font-black pr-2 items-end">
               <span>${maxValue.toFixed(0)}</span><span>${(maxValue*0.5).toFixed(0)}</span><span>$0</span>
            </div>

            {/* Barras con Datos Reales (Spikes) */}
            <div className="ml-12 h-full flex items-end justify-around gap-4 pb-2 border-b border-white/5">
               {chartData.map((day, i) => (
                 <div key={i} className="flex-1 flex flex-col items-center gap-3 max-w-[45px] group relative">
                    {/* Tooltip con Monto Real */}
                    <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-[#1c1d21] border border-white/10 px-4 py-2.5 rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-30 w-max min-w-[100px]">
                       <div className="space-y-1">
                          <p className="text-[7px] font-black text-[#474556] uppercase mb-1">{day.label}</p>
                          <div className="flex items-center justify-between gap-4">
                             <span className="text-[8px] text-[#c8c4d9]">COMISIONES:</span>
                             <span className="text-[9px] font-black text-white">${day.commissions.toFixed(2)}</span>
                          </div>
                          <div className="flex items-center justify-between gap-4">
                             <span className="text-[8px] text-[#c8c4d9]">MEMBRESÍAS:</span>
                             <span className="text-[9px] font-black text-[#52ffac]">${day.memberships.toFixed(2)}</span>
                          </div>
                       </div>
                       <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#1c1d21] border-r border-b border-white/10 rotate-45"></div>
                    </div>

                    <div className="w-full flex gap-1 items-end h-32">
                       {/* Si el valor es 0, la barra no se muestra, indicando falta de actividad */}
                       <div
                         className="flex-1 bg-gradient-to-t from-[#5d3cfe]/10 to-[#5d3cfe] border-t border-[#c7bfff]/30 rounded-t-md transition-all group-hover:brightness-125"
                         style={{ height: day.commissions > 0 ? `${(day.commissions/maxValue)*100}%` : '2px' }}
                       ></div>
                       <div
                         className="flex-1 bg-gradient-to-t from-[#52ffac]/10 to-[#52ffac] border-t border-[#52ffac]/30 rounded-t-md transition-all group-hover:brightness-125"
                         style={{ height: day.memberships > 0 ? `${(day.memberships/maxValue)*100}%` : '2px' }}
                       ></div>
                    </div>
                    <span className="text-[7px] text-[#474556] font-black uppercase tracking-widest">{day.label}</span>
                 </div>
               ))}
            </div>
         </div>
      </div>


      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="modern-card p-6 bg-emerald-500/5 border-emerald-500/20 group hover:bg-emerald-500/10 transition-all flex flex-col justify-center">
          <p className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-3">Comisiones (15%)</p>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-black text-emerald-500 italic">$</span>
            <p className="text-4xl font-black text-white group-hover:scale-105 transition-transform">{totalCommissions.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
          </div>
        </div>
        <div className="modern-card p-6 bg-indigo-500/5 border-indigo-500/20 group hover:bg-indigo-500/10 transition-all flex flex-col justify-center">
          <p className="text-[9px] font-black text-[#c7bfff] uppercase tracking-[0.2em] mb-3">Membresías</p>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-black text-[#c7bfff] italic">$</span>
            <p className="text-4xl font-black text-white group-hover:scale-105 transition-transform">{totalSubscriptions.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
          </div>
        </div>
        <div className="modern-card p-6 bg-rose-500/5 border-rose-500/20 group hover:bg-rose-500/10 transition-all flex flex-col justify-center">
          <p className="text-[9px] font-black text-rose-500 uppercase tracking-[0.2em] mb-3">Pagos a Técnicos</p>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-black text-rose-500 italic">$</span>
            <p className="text-4xl font-black text-white group-hover:scale-105 transition-transform">{pendingPayments.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
          </div>
        </div>
        <div className="modern-card p-6 bg-white/5 border-white/10 group hover:bg-white/10 transition-all flex flex-col justify-center">
          <p className="text-[9px] font-black text-[#c8c4d9] uppercase tracking-[0.2em] mb-3">Utilidad Neta</p>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-black text-[#52ffac] italic">$</span>
            <p className="text-4xl font-black text-[#52ffac] group-hover:scale-105 transition-transform">{netUtility.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
          </div>
        </div>
      </div>

      {/* VERIFICACIÓN DE PAGOS (CLIENTE -> PLATAFORMA) */}
      <div className="space-y-6">
         <header className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.1)]">
               <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
               <h3 className="text-sm font-black text-white uppercase tracking-tight">Verificación de Pagos Entrantes</h3>
               <p className="text-[9px] text-[#474556] font-bold uppercase tracking-widest">Confirma los fondos recibidos para activar servicios.</p>
            </div>
         </header>

         {paymentsToVerify.length === 0 ? (
            <div className="p-10 border border-dashed border-[#2a2b2f] rounded-[2rem] text-center bg-[#121317]/30">
               <p className="text-[9px] text-[#474556] font-black uppercase tracking-widest">No hay pagos pendientes de validación</p>
            </div>
         ) : (
            <div className="grid grid-cols-1 gap-4">
               {paymentsToVerify.map((req: any) => (
                  <div key={req.id} className="modern-card p-5 bg-[#1c1d21] border-[#2a2b2f] flex items-center justify-between group hover:border-[#52ffac]/30 transition-all">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-[#52ffac]/10 text-[#52ffac] flex items-center justify-center border border-[#52ffac]/20 font-black text-xs">
                           ${req.price?.toFixed(0)}
                        </div>
                        <div>
                           <p className="text-xs font-black text-white uppercase">{req.clientName}</p>
                           <p className="text-[9px] text-[#c8c4d9] font-bold uppercase">Servicio: {req.assetName} - {req.assetDetails || (assets.find(a => a.id === req.assetId)?.details) || 'N/A'}</p>
                           <p className="text-[8px] text-[#474556] font-bold uppercase">Técnico: {req.techName}</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-3">
                        <div className="text-right mr-2">
                           <p className="text-[8px] text-[#474556] font-black uppercase">Reportado el:</p>
                           <p className="text-[9px] text-white font-bold">{req.paymentSubmittedAt?.toDate ? req.paymentSubmittedAt.toDate().toLocaleString() : 'Recientemente'}</p>
                        </div>
                        <button
                           onClick={() => req.status === 'unforeseen_verifying' ? onApproveUnforeseenPayment(req.id) : onApprovePayment(req.id)}
                           className="px-6 py-2.5 bg-[#52ffac] text-black rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-[#52ffac]/20 hover:brightness-110 active:scale-95 transition-all"
                        >
                           Confirmar Recibo
                        </button>
                     </div>
                  </div>
               ))}
            </div>
         )}
      </div>

      {/* Listado de Pagos Pendientes */}
      <div className="space-y-6">
         <div className="flex justify-between items-end px-2">
            <div>
               <h2 className="text-xl font-black text-white uppercase tracking-tight">Liquidaciones Pendientes</h2>
               <p className="text-[10px] text-[#c8c4d9] font-bold uppercase tracking-widest mt-1 opacity-70">Técnicos con saldo disponible para retiro.</p>
            </div>
            <div className="flex gap-3">
               <button
                 onClick={() => setIsMonthlyClosureOpen(true)}
                 className="px-6 py-2.5 bg-rose-600 text-white rounded-xl text-[9px] font-black uppercase hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-rose-600/20"
               >
                 Cerrar Mes
               </button>
               <button
                 onClick={() => setIsMonthlyClosureOpen(true)}
                 className="px-6 py-2.5 bg-[#1c1d21] border border-[#2a2b2f] text-white rounded-xl text-[9px] font-black uppercase hover:bg-white hover:text-black transition-all"
               >
                 Exportar Reporte
               </button>
            </div>
         </div>

         <div className="modern-card overflow-hidden bg-[#121317] border-[#2a2b2f]">
            <table className="w-full text-left">
               <thead className="bg-[#1c1d21] border-b border-[#2a2b2f]">
                  <tr>
                     <th className="p-5 text-[9px] font-black text-[#474556] uppercase tracking-widest">Especialista</th>
                     <th className="p-5 text-[9px] font-black text-[#474556] uppercase tracking-widest text-center">Método Preferido</th>
                     <th className="p-5 text-[9px] font-black text-[#474556] uppercase tracking-widest">Monto a Liquidar</th>
                     <th className="p-5 text-[9px] font-black text-[#474556] uppercase tracking-widest text-right">Comandos de Pago</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-[#2a2b2f]/30">
                  {techsToPay.length === 0 ? (
                     <tr><td colSpan={4} className="p-10 text-center text-[#474556] font-black uppercase text-[10px]">No hay liquidaciones pendientes hoy</td></tr>
                  ) : (
                     techsToPay.map((t: any) => (
                       <tr key={t.id} className="hover:bg-white/5 transition-all">
                          <td className="p-5">
                             <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-[#5d3cfe]/10 border border-[#5d3cfe]/30 flex items-center justify-center text-[#c7bfff] font-black text-sm">{t.name[0]}</div>
                                <div className="flex flex-col">
                                   <span className="font-bold text-white text-sm uppercase">{t.name}</span>
                                   <span className="text-[8px] text-[#474556] font-medium tracking-widest uppercase">{t.category}</span>
                                </div>
                             </div>
                          </td>
                          <td className="p-5 text-center">
                             {t.wallet?.yappyNumber ? (
                               <span className="px-3 py-1 bg-[#52ffac]/10 text-[#52ffac] border border-[#52ffac]/20 rounded-full text-[8px] font-black uppercase tracking-widest">YAPPY DIRECTO</span>
                             ) : (
                               <span className="px-3 py-1 bg-[#c7bfff]/10 text-[#c7bfff] border border-[#c7bfff]/20 rounded-full text-[8px] font-black uppercase tracking-widest">ACH BANCARIO</span>
                             )}
                          </td>
                          <td className="p-5">
                             <span className="text-lg font-black text-white italic">${(t.wallet?.balance || 0).toFixed(2)}</span>
                          </td>
                          <td className="p-5 text-right">
                             <button
                               onClick={() => {
                                 const info = t.wallet?.yappyNumber
                                   ? `PAGAR POR YAPPY: ${t.wallet.yappyNumber}`
                                   : `DATOS ACH:\nBanco: ${t.wallet?.bankName}\nCuenta: ${t.wallet?.accountNumber}\nTitular: ${t.wallet?.ownerName}`;
                                 alert(info);
                               }}
                               className="px-6 py-2.5 bg-[#52ffac] text-[#0d0e12] rounded-xl text-[9px] font-black uppercase shadow-lg shadow-[#52ffac]/20 hover:brightness-110 active:scale-95 transition-all"
                             >
                               Ejecutar Pago
                             </button>
                          </td>
                       </tr>
                     ))
                  )}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
}
