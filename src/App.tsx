import React, { useState, useEffect } from 'react';
import {
  initialAssets, 
  initialReminders, 
  initialTechnicians, 
  initialRequests, 
  initialAgendaEvents 
} from './mockData';
import { 
  Asset, 
  MaintenanceReminder, 
  TechProfile, 
  JobRequest, 
  AgendaEvent, 
  ChatMessage, 
  TechCategory 
} from './types';
import AssetRegisterModal from './components/AssetRegisterModal';
import DiagnosticAIView from './components/DiagnosticAIView';
import TechnicianProfileModal from './components/TechnicianProfileModal';
import TechnicianEditProfileModal from './components/TechnicianEditProfileModal';
import ServiceReportModal from './components/ServiceReportModal';
import SignaturePad from './components/SignaturePad';
import SupportChatWidget from './components/SupportChatWidget';

import { 
  LayoutDashboard, Store, FileCheck2, Bot, MessageSquare, CalendarDays, Users, DollarSign,
  Bell, BellRing, Send, CheckCircle, Plus, TrendingUp, Truck, Camera, SlidersHorizontal,
  Layers, UserCheck, ShieldCheck, Info, Star, PhoneCall, Mail, MailOpen, CheckCircle2,
  UserX, Clock, Smartphone, LogOut, Lock, User, ArrowRight, ChevronRight, History,
  ShieldAlert, HelpCircle, Video, Wrench, Search, Filter, Check, X, CreditCard, Target,
  Calendar, AlertCircle, RefreshCcw, Zap, MapPin, Briefcase, ChevronDown, Navigation,
  ExternalLink, ChevronLeft, Circle, MoreVertical, ThumbsUp, Pencil, Image, Paperclip,
  Trash2, FileText, Save, Download, Share2, Settings, Eye, EyeOff, UserPlus, LogIn,
  AlertTriangle, Globe, Award, BookOpen, PieChart, BarChart3, Activity, Maximize2,
  Menu, ChevronUp, Monitor, PlusCircle, MinusCircle, Play, Pause, SkipBack, SkipForward,
  Repeat, Shuffle, Volume2, Mic, VideoOff, Headphones, Gamepad2, Music, Heart,
  MessageCircle, MoreHorizontal, Cloud, Sun, Moon, CloudRain, Snowflake, Wind, Droplets,
  Thermometer, Hash, AtSign, Link, Tag, Flag, Map, Compass, Archive, Box, ShoppingBag,
  ShoppingCart, Cpu, Wifi, Bluetooth, Battery, HardDrive, MousePointer2, Keyboard,
  Printer, Copy, Scissors, Clipboard, StickyNote, PenTool, Eraser, Palette, Brush,
  Paintbrush, Ruler, Table, Columns, Rows, Maximize, Minimize, Command, ZoomIn, ZoomOut,
  Languages, Type, Bold, Italic, Underline, Strikethrough, Code, Terminal, Quote, List,
  ListOrdered, Indent, Outdent, AlignLeft, AlignCenter, AlignRight, AlignJustify, Link2,
  Smile, Frown, Meh, Angry, SmilePlus, Ghost, Cat, Dog, Bird, Rabbit, Turtle, Fish,
  Trees, Mountain, Waves, Binary, GitBranch, GitCommit, GitMerge, GitPullRequest,
  Github, Twitter, Facebook, Instagram, Linkedin, Youtube, CloudLightning, CloudSun,
  CloudMoon, CloudFog, CloudDrizzle, CloudHail, CloudSnow, Umbrella, Pocket, MonitorOff,
  Tablet, Tv, Cast, Speaker, Disc, Radio, Dribbble, Codepen, Figma, Frame, Trello,
  Slack, Twitch, Music2, Mic2, CameraOff, Phone, PhoneIncoming, PhoneOutgoing,
  PhoneMissed, PhoneForwarded, Inbox, Server, Database, SortAsc, SortDesc, Minus,
  Edit, Edit2, Edit3, Trash, Unlock, Key, Home, BellOff, Building, Building2,
  GraduationCap, Bookmark, Share, Upload, RefreshCw, LineChart, Laptop, Mouse,
  File, Folder, FolderPlus, FolderMinus, RotateCw, ArrowUp, ArrowDown, ArrowLeft,
  Shield, Grid, Layout, LayoutGrid, XCircle, Coffee, Pizza, Utensils, Bike, Plane,
  Train, Anchor, Sunrise, Sunset, Sparkles, ShieldHalf
} from 'lucide-react';

// Firebase Imports
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  updateProfile,
  updatePassword as firebaseUpdatePassword,
  updateEmail as firebaseUpdateEmail,
  sendPasswordResetEmail
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
import {
  ref,
  uploadString,
  getDownloadURL
} from "firebase/storage";
import { auth, db, storage } from "./firebase";

// Capacitor Push Notifications
import { PushNotifications } from '@capacitor/push-notifications';
import { Device } from '@capacitor/device';
import { Capacitor } from '@capacitor/core';

export default function App() {
  // State for simulated push notification toast
  const [testNotification, setTestNotification] = useState<{
    id: string;
    title: string;
    text: string;
    type: 'email' | 'push' | 'both';
    assetName?: string;
    dueDate?: string;
  } | null>(null);
  const [notificationSimTab, setNotificationSimTab] = useState<'push' | 'email'>('email');
  const [customEmailInput, setCustomEmailInput] = useState<string>('rubenabregoc@gmail.com');

  // Real alert dispatch status trackers
  const [emailSentStatus, setEmailSentStatus] = useState<'idle' | 'sending' | 'sent-demo' | 'sent-real' | 'error'>('idle');
  const [emailPreviewUrl, setEmailPreviewUrl] = useState<string>('');
  const [pushPermissionStatus, setPushPermissionStatus] = useState<string>('default');
  const [lastEmailError, setLastEmailError] = useState<string>('');
  const [showSmtpInstructions, setShowSmtpInstructions] = useState<boolean>(() => {
    const user = localStorage.getItem('mantechpro_smtp_user') || '';
    const pass = localStorage.getItem('mantechpro_smtp_pass') || '';
    return !user || !pass;
  });
  const [showSmtpPasswordText, setShowSmtpPasswordText] = useState<boolean>(false);

  // Real SMTP Dynamic client-side configurations saved to LocalStorage
  const [smtpUser, setSmtpUser] = useState<string>(() => localStorage.getItem('mantechpro_smtp_user') || 'rubenabregoc@gmail.com');
  const [smtpPass, setSmtpPass] = useState<string>(() => localStorage.getItem('mantechpro_smtp_pass') || '');
  const [smtpHost, setSmtpHost] = useState<string>(() => localStorage.getItem('mantechpro_smtp_host') || 'smtp.gmail.com');
  const [smtpPort, setSmtpPort] = useState<string>(() => localStorage.getItem('mantechpro_smtp_port') || '587');
  const [smtpSecure, setSmtpSecure] = useState<boolean>(() => localStorage.getItem('mantechpro_smtp_secure') === 'true');
  const [smtpFrom, setSmtpFrom] = useState<string>(() => localStorage.getItem('mantechpro_smtp_from') || '');

  const saveSmtpSettings = (user: string, pass: string, host: string, port: string, secure: boolean, fromStr: string) => {
    localStorage.setItem('mantechpro_smtp_user', user);
    localStorage.setItem('mantechpro_smtp_pass', pass);
    localStorage.setItem('mantechpro_smtp_host', host);
    localStorage.setItem('mantechpro_smtp_port', port);
    localStorage.setItem('mantechpro_smtp_secure', secure ? 'true' : 'false');
    localStorage.setItem('mantechpro_smtp_from', fromStr);
    setSmtpUser(user);
    setSmtpPass(pass);
    setSmtpHost(host);
    setSmtpPort(port);
    setSmtpSecure(secure);
    setSmtpFrom(fromStr);
  };

  // API Base URL for mobile/web compatibility
  // Smart API Selection: Use relative paths for web (handled by Vite proxy/Firebase rewrites)
  const API_BASE_URL = '';



  // Manejo de errores de red para la IA
  const safeAIDiagnose = async (data: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/diagnose`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Error en el servidor de IA');
      return await response.json();
    } catch (err: any) {
      console.warn("AI CORS/Network Error:", err.message);
      // Retornar un diagnóstico de respaldo si la API falla por CORS
      return {
        diagnosis: "El servicio de IA está temporalmente en mantenimiento técnico (CORS). Basado en el historial, se recomienda una revisión estándar preventiva.",
        estimatedRate: "B/.. 45.00 - 80.00",
        urgency: "Media"
      };
    }
  };

  const triggerSimulatedNotification = async (customText?: string, customTitle?: string, customAsset?: string) => {
    const defaultReminders = [
      { title: "Cambio de Aceite de Motor", assetName: "Toyota Yaris", due: "En 4 días" },
      { title: "Limpieza Profunda de Filtros", assetName: "Aire Acondicionado Split", due: "En 6 días" },
      { title: "Revisión de Batería de Respaldo", assetName: "Planta Eléctrica CAT", due: "Expiró hoy" }
    ];
    const item = defaultReminders[Math.floor(Math.random() * defaultReminders.length)];
    const finalAsset = customAsset || item.assetName;
    const finalTitle = customTitle || item.title;
    const finalDue = item.due;
    const finalEmail = customEmailInput || loggedInEmail || 'rubenabregoc@gmail.com';
    
    // Set notification details first
    const generatedId = Math.random().toString();
    setTestNotification({
      id: generatedId,
      title: `⚙️ MantechPro: Alerta de Activo`,
      text: customText || `Tu activo '${finalAsset}' requiere '${finalTitle}' pronto. Te hemos enviado un correo interactivo a ${finalEmail} con 1-clic y una alerta push al móvil.`,
      type: 'both',
      assetName: finalAsset,
      dueDate: finalDue
    });

    // 1. Real Desktop/Mobile Web Push Notification Handler
    if ('Notification' in window) {
      const currentPermission = Notification.permission;
      setPushPermissionStatus(currentPermission);
      
      try {
        if (currentPermission === 'default') {
          const res = await Notification.requestPermission();
          setPushPermissionStatus(res);
          if (res === 'granted') {
            new Notification(`🚨 MantechPro: Alerta para ${finalAsset}`, {
              body: `Tu equipo requiere ${finalTitle} (${finalDue}). Presiona para cotizar hoy.`,
              icon: 'https://cdn-icons-png.flaticon.com/512/564/564429.png'
            });
          }
        } else if (currentPermission === 'granted') {
          new Notification(`🚨 MantechPro: Alerta para ${finalAsset}`, {
            body: `Tu equipo requiere ${finalTitle} (${finalDue}). Presiona para cotizar hoy.`,
            icon: 'https://cdn-icons-png.flaticon.com/512/564/564429.png'
          });
        }
      } catch (err) {
        console.warn("Notification request blocked (likely in sandboxed iframe environment):", err);
        // Fallback or ignore
      }
    } else {
      setPushPermissionStatus('not-supported');
    }

    // 2. Real Backend Email dispatch handler
    setEmailSentStatus('sending');
    setEmailPreviewUrl('');
    setLastEmailError('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: finalEmail,
          subject: `⚠️ MantechPro Alerta: ${finalTitle} en su activo ${finalAsset}`,
          assetName: finalAsset,
          title: finalTitle,
          dueDate: finalDue,
          smtpConfig: smtpUser && smtpPass ? {
            user: smtpUser.trim(),
            pass: smtpPass.trim().replace(/\s+/g, ''), // Strip spaces from the yellow app pass letters paste
            host: smtpHost.trim(),
            port: smtpPort.trim(),
            secure: smtpPort.trim() === '465',
            from: smtpFrom || `MantechPro Alertas <${smtpUser.trim()}>`
          } : undefined
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        if (data.isDemo) {
          setEmailSentStatus('sent-demo');
          setEmailPreviewUrl(data.previewUrl || '');
        } else {
          setEmailSentStatus('sent-real');
        }
      } else {
        setEmailSentStatus('error');
        setLastEmailError(data.error || 'Fallo en servidor de correo');
      }
    } catch (err: any) {
      console.error("Failed to send email alert:", err);
      setEmailSentStatus('error');
      setLastEmailError(err.message || 'Error de conexión de red');
    }
  };

  // Session Authentication state
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isAuthResolving, setIsAuthResolving] = useState<boolean>(true);
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<'client' | 'tech' | 'admin'>('client');
  const [adminTab, setAdminTab] = useState<'finance' | 'users' | 'logistics' | 'settings' | 'alerts'>('finance');
  const [loggedInEmail, setLoggedInEmail] = useState<string>('');
  const [loggedInName, setLoggedInName] = useState<string>('');
  const [profileImage, setProfileImage] = useState<string>('');

  // FCM Token state
  const [fcmToken, setFcmToken] = useState<string>('');

  // 1. Firebase Auth & Role Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        setLoggedInEmail(firebaseUser.email || '');
        setLoggedInName(firebaseUser.displayName || 'Usuario');
        setProfileImage(firebaseUser.photoURL || '');

        try {
          // Si es el correo maestro de admin, forzar rol admin
          if (firebaseUser.email === 'admin@mantech.com') {
            setRole('admin');
          }

          // Intentar obtener el documento directamente por UID (más eficiente)
          const userRef = doc(db, "users", firebaseUser.uid);
          const userSnap = await getDoc(userRef);

          let userData = null;

          if (userSnap.exists()) {
            userData = userSnap.data();
          } else {
            // Fallback a query si el ID del documento no es el UID
            const q = query(collection(db, "users"), where("uid", "==", firebaseUser.uid));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
              userData = querySnapshot.docs[0].data();
            }
          }

          if (userData) {
            // Sincronizar rol si no es el admin forzado
            if (firebaseUser.email !== 'admin@mantech.com') {
              setRole(userData.role);
            }

            // PRIORIDAD: Nombre de Firestore sobre el de Auth (que a veces viene vacío)
            if (userData.name) {
              setLoggedInName(userData.name);
            } else if (firebaseUser.displayName) {
              setLoggedInName(firebaseUser.displayName);
            }

            if (userData.photoURL) {
              setProfileImage(userData.photoURL);
            }

            if (userData.role === 'tech') {
              const tId = userData.techId || `tech-${firebaseUser.uid}`;
              setSelectedTechProfileId(tId);
              localStorage.setItem('mantech_logged_tech_id', tId);

              const techRef = doc(db, "technicians", tId);
              const techSnap = await getDoc(techRef);

              if (!techSnap.exists()) {
                await setDoc(techRef, {
                  id: tId,
                  name: userData.name || 'Técnico',
                  category: 'mecanico',
                  title: 'Técnico Especialista en Mantenimiento',
                  rating: 5.0,
                  reviewCount: 0,
                  completedJobs: 0,
                  experienceYears: 5,
                  location: 'Ciudad de Panamá',
                  hourlyRate: 25,
                  bio: 'Técnico profesional especializado.',
                  certifications: ['Certificación Técnica'],
                  portfolioImages: [],
                  plan: 'premium',
                  userId: firebaseUser.uid
                });
              }
            } else {
              localStorage.removeItem('mantech_logged_tech_id');
            }

            if (Capacitor.isNativePlatform()) {
              setupPushNotifications(firebaseUser.uid);
            }
          } else if (firebaseUser.email === 'admin@mantech.com') {
            // Asegurar que el documento de admin exista
            await setDoc(doc(db, "users", firebaseUser.uid), {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              name: 'Administrador Central',
              role: 'admin',
              createdAt: serverTimestamp()
            });
            setLoggedInName('Administrador Central');
          }
          setIsLoggedIn(true);
        } catch (err) {
          console.error("Error setting up user session:", err);
        }
      } else {
        setIsLoggedIn(false);
        setUser(null);
        setLoggedInEmail('');
        setLoggedInName('');
      }
      setIsAuthResolving(false);
    });
    return () => unsubscribe();
  }, []);

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
  useEffect(() => {
    const unsubscribeTechs = onSnapshot(collection(db, "technicians"), (snapshot) => {
      const techList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as TechProfile[];
      setTechnicians(techList);
    }, (error) => {
      console.warn("Firestore Technicians Error:", error.message);
    });

    // Seed mock requests if database is fresh (Optional, for better demo)
    const seedMockData = async () => {
      if (user && role === 'client') {
        try {
          const qReq = query(collection(db, "requests"), where("clientId", "==", user.uid));
          const snapReq = await getDocs(qReq);
          // Solo intentar crear si no hay NADA, para evitar errores de permisos en duplicados
          if (snapReq.empty) {
            console.log("Generando datos de prueba para nuevo usuario...");
            for (const req of initialRequests) {
              const { id, ...reqWithoutId } = req; // Dejar que Firestore cree un ID nuevo
              await addDoc(collection(db, "requests"), { ...reqWithoutId, clientId: user.uid });
            }
          }
        } catch (e: any) {
          // Silencioso en consola para no ensuciar el inspector si no hay permisos
        }
      }
    };
    seedMockData();

    return () => unsubscribeTechs();
  }, [user]);

  // 3. Listen for Requests
  useEffect(() => {
    let unsubscribeReqs = () => {};
    // Solo iniciar si ya sabemos quién es y su rol
    if (isLoggedIn && user && role && !isAuthResolving) {
      let q;
      if (role === 'admin') {
        // El Administrador ve TODAS las solicitudes del sistema
        console.log("📡 Modo Admin: Escuchando todas las solicitudes");
        q = query(collection(db, "requests"), orderBy("createdAt", "desc"));
      } else {
        const field = role === 'client' ? 'clientId' : 'techUserId';
        const identifier = user.uid; // Usar UID real para máxima seguridad y permisos
        console.log(`📡 Escuchando solicitudes para ${role} ID: ${identifier}`);
        q = query(collection(db, "requests"), where(field, "==", identifier));
      }

      unsubscribeReqs = onSnapshot(q, (snapshot) => {
        const reqList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as JobRequest[];
        console.log(`✅ Solicitudes cargadas: ${reqList.length}`);
        setRequests(reqList);
      }, (error) => {
        if (error.message.includes("permissions")) {
          console.warn("⚠️ Sincronizando permisos de solicitudes...");
        } else {
          console.error("Firestore Requests Error:", error.message);
        }
      });
    } else if (!isAuthResolving && !isLoggedIn) {
      setRequests(initialRequests);
    }
    return () => unsubscribeReqs();
  }, [isLoggedIn, user, role, selectedTechProfileId, isAuthResolving]);

  // 4. Listen for Chat Messages
  useEffect(() => {
    let unsubscribeMessages = () => {};
    const chatRequests = requests.filter(r => r.status !== 'pending');

    // Auto-select first chat if none selected
    if (clientTab === 'chat' && !activeChatRequestId && chatRequests.length > 0) {
      setActiveChatRequestId(chatRequests[0].id);
    }
    if (techTab === 'chat' && !activeChatRequestId && chatRequests.length > 0) {
      setActiveChatRequestId(chatRequests[0].id);
    }

    if (isLoggedIn && activeChatRequestId) {
      // Quitamos el orderBy de la consulta para evitar el error de índice (CORS/Index)
      const q = query(collection(db, "messages"), where("requestId", "==", activeChatRequestId));
      unsubscribeMessages = onSnapshot(q, (snapshot) => {
        const msgList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate()?.toISOString() || new Date().toISOString()
        })) as ChatMessage[];

        // Ordenamos en memoria
        const sortedMessages = msgList.sort((a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );

        setChatMessages(sortedMessages);
      }, (error) => {
        console.warn("Firestore Messages Sync:", error.message);
      });
    }
    return () => unsubscribeMessages();
  }, [isLoggedIn, activeChatRequestId, requests, clientTab, techTab]);

  // Assets Listener
  useEffect(() => {
    let unsubscribeAssets = () => {};
    if (isLoggedIn && user && role) {
      let q;
      if (role === 'admin') {
        q = query(collection(db, "assets"), orderBy("createdAt", "desc"));
      } else if (role === 'client') {
        q = query(collection(db, "assets"), where("clientId", "==", user.uid));
      } else {
        return;
      }

      unsubscribeAssets = onSnapshot(q, (snapshot) => {
        const assetsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Asset[];
        setAssets(assetsList);
      }, (error) => {
        console.error("Firestore Assets Error:", error.message);
      });
    } else if (!isAuthResolving && !isLoggedIn) {
      setAssets(initialAssets);
    }
    return () => unsubscribeAssets();
  }, [isLoggedIn, user, role, isAuthResolving]);

  // 5. Listen for Reminders
  useEffect(() => {
    let unsubscribeReminders = () => {};
    if (isLoggedIn && user && role === 'client') {
      console.log("Escuchando recordatorios para el usuario:", user.uid);
      const q = query(collection(db, "reminders"), where("clientId", "==", user.uid));
      unsubscribeReminders = onSnapshot(q, (snapshot) => {
        const remindersList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as MaintenanceReminder[];
        console.log("Recordatorios recibidos:", remindersList.length);
        setReminders(remindersList);
      }, (error) => {
        console.error("Firestore Reminders Error:", error.message);
      });
    } else if (isLoggedIn && role !== 'client') {
      setReminders([]); // No mostrar si no es cliente
    } else if (!isAuthResolving && !isLoggedIn) {
      setReminders(initialReminders);
    }
    return () => unsubscribeReminders();
  }, [isLoggedIn, user, role, isAuthResolving]);

  // Admin Listen for All Reminders & Automatic Dispatcher
  useEffect(() => {
    let unsubscribeAllReminders = () => {};
    if (isLoggedIn && role === 'admin') {
      const q = query(collection(db, "reminders"), orderBy("dueDate", "asc"));
      unsubscribeAllReminders = onSnapshot(q, (snapshot) => {
        const remindersList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as MaintenanceReminder[];
        setAllReminders(remindersList);

        // MOTOR DE DESPACHO AUTOMÁTICO (Solo para Admin)
        // Si detectamos un recordatorio urgente que no ha sido notificado hoy, intentamos enviarlo
        const today = new Date().toISOString().split('T')[0];
        remindersList.forEach(async (rem) => {
          const daysLeft = Math.ceil((new Date(rem.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

          // REGLA: Si faltan 7 días o menos y no se ha notificado hoy
          if (daysLeft <= 7 && rem.lastNotified !== today) {
            console.log(`🤖 Auto-Despacho: Notificando sobre ${rem.title}`);
            // Aquí llamaríamos a triggerSimulatedNotification pero con datos del recordatorio
            // Para esta demo, lo dejamos como log, pero puede activarse el fetch real aquí
          }
        });
      }, (error) => {
        console.warn("Firestore All Reminders Error:", error.message);
      });
    }
    return () => unsubscribeAllReminders();
  }, [isLoggedIn, role]);

  // 6. Listen for Agenda Events
  useEffect(() => {
    let unsubscribeAgenda = () => {};
    if (isLoggedIn && role === 'tech' && user) {
      // Usar techUserId para coincidir con reglas de seguridad de Firebase
      const q = query(collection(db, "agenda"), where("techUserId", "==", user.uid));
      unsubscribeAgenda = onSnapshot(q, (snapshot) => {
        const agendaList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as AgendaEvent[];
        setAgenda(agendaList);
      }, (error) => {
        // Silencio para evitar alertas de sincronización inicial
      });
    } else if (!isAuthResolving && !isLoggedIn) {
      setAgenda(initialAgendaEvents);
    }
    return () => unsubscribeAgenda();
  }, [isLoggedIn, role, user, isAuthResolving]);
  // --- UTILIDADES DE FORMATO ---
  const formatFriendlyDate = (dateStr: string) => {
    if (!dateStr) return 'Sin fecha';
    try {
      // Forzar interpretación como fecha local (no UTC) para evitar desfases de un día
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0]);
        const month = parseInt(parts[1]) - 1;
        const day = parseInt(parts[2]);
        const date = new Date(year, month, day);
        return date.toLocaleDateString('es-PA', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        });
      }
      return dateStr;
    } catch (e) {
      return dateStr;
    }
  };

  // Client add/edit asset
  const handleAddAsset = async (newAssetData: Omit<Asset, 'id' | 'registeredAt'>) => {
    if (!user) {
      alert("Debes iniciar sesión para realizar esta acción.");
      return;
    }

    try {
      const cleanAssetData = JSON.parse(JSON.stringify(newAssetData));

      if (assetToEdit) {
        // ACTUALIZAR ACTIVO EXISTENTE
        const assetRef = doc(db, "assets", assetToEdit.id);
        await updateDoc(assetRef, {
          ...cleanAssetData,
          updatedAt: serverTimestamp()
        });

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
  const handleRequestQuote = async (techId: string, assetId: string, description: string) => {
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
        checklist: [
          { id: '1', description: 'Inspección inicial del equipo', isCompleted: false },
          { id: '2', description: 'Pruebas de funcionamiento post-reparación', isCompleted: false }
        ],
        materials: []
      };

      await addDoc(collection(db, "requests"), newRequest);

      // Intentar incrementar contador, pero no bloquear si falla
      try {
        await updateDoc(doc(db, "technicians", techId), {
          requestsUsedThisMonth: (selectedTech.requestsUsedThisMonth || 0) + 1
        });
      } catch (e) {
        console.warn("No se pudo actualizar el contador del técnico, pero la solicitud fue enviada.");
      }

      alert("¡Solicitud enviada! El técnico revisará tu caso y te enviará una propuesta pronto.");
      setClientTab('quotes');
    } catch (err) {
      console.error("Request Quote Error:", err);
    }
  };

  // Technician submit active quote bid
  const handleSubmitBid = async (requestId: string) => {
    if (draftingBidRequestId !== requestId || !bidPrice || !bidDate || !bidTime) {
      alert("Por favor ingresa el precio, la fecha y la hora propuesta para esta solicitud.");
      return;
    }
    const priceNum = Number(bidPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      alert("Por favor ingresa un precio válido.");
      return;
    }

    // --- DETECCIÓN DE CONFLICTOS DE AGENDA ---
    const newStart = new Date(`${bidDate}T${bidTime}`);
    const newEnd = new Date(newStart.getTime() + bidDuration * 60 * 60 * 1000);

    const hasConflict = agenda.some(event => {
      if (event.date !== bidDate) return false;

      const eventStart = new Date(`${event.date}T${event.time}`);
      const durationHours = parseFloat(event.duration);
      const eventEnd = new Date(eventStart.getTime() + durationHours * 60 * 60 * 1000);

      // Verificar si hay solapamiento
      return (newStart < eventEnd && newEnd > eventStart);
    });

    if (hasConflict) {
      const proceed = window.confirm("⚠️ ALERTA DE CONFLICTO: Ya tienes un compromiso agendado que se cruza con este horario. ¿Deseas enviar la propuesta de todos modos?");
      if (!proceed) return;
    }

    try {
      const comm = Number((priceNum * 0.15).toFixed(2));
      const earnings = Number((priceNum - comm).toFixed(2));

      await updateDoc(doc(db, "requests", requestId), {
        price: priceNum,
        commission: comm,
        technicianEarnings: earnings,
        scheduledDate: bidDate,
        scheduledTime: bidTime,
        scheduledDuration: bidDuration,
        scheduledTravelTime: bidTravelTime,
        status: 'quoted',
        techUserId: user.uid
      });

      alert("¡Cotización enviada con éxito!");
      setDraftingBidRequestId(null);
      setBidPrice('');
      setBidDate('');
      setBidTime('');
      setBidDuration(1);
      setBidTravelTime(30);
    } catch (err: any) {
      console.error("Submit Bid Error:", err);
      alert("Error al enviar: " + err.message);
    }
  };

  // Client Accept Tech Quote
  const handleAcceptQuote = async (requestId: string, paymentMethod: 'yappy' | 'ach' | 'card' | 'cache') => {
    const req = requests.find(r => r.id === requestId);
    if (!req || !req.scheduledDate) return;

    // VALIDACIÓN DE 24 HORAS
    const scheduledTime = new Date(req.scheduledDate).getTime();
    const now = Date.now();
    const hoursToService = (scheduledTime - now) / (1000 * 60 * 60);

    if (hoursToService < 24) {
      alert("⚠️ Plazo Vencido: Debiste confirmar este servicio al menos 24 horas antes. La disponibilidad del técnico ya no está garantizada. Por favor, solicita una nueva fecha.");
      await updateDoc(doc(db, "requests", requestId), { status: 'rejected' });
      return;
    }

    try {
      await updateDoc(doc(db, "requests", requestId), {
        status: 'accepted',
        paidAt: serverTimestamp()
      });

      // Add to agenda (Firestore)
      await addDoc(collection(db, "agenda"), {
        requestId: requestId,
        techId: req.techId,
        techUserId: req.techUserId || user.uid,
        clientName: req.clientName,
        clientId: user.uid,
        title: `CONFIRMADO: ${req.assetName}`,
        date: req.scheduledDate,
        time: req.scheduledTime || '09:00',
        duration: `${req.scheduledDuration || 1}h`,
        travelTime: `${req.scheduledTravelTime || 30} min`,
        status: 'pending',
        createdAt: serverTimestamp()
      });

      // Add initial coordinating message
      await addDoc(collection(db, "messages"), {
        requestId: requestId,
        sender: 'tech',
        text: `¡Hola! He recibido tu confirmación de servicio y pago vía ${paymentMethod.toUpperCase()}. He agendado la cita de mantenimiento oficialmente.`,
        timestamp: serverTimestamp()
      });

      alert("¡Pago Recibido! El servicio ha sido CONFIRMADO y la agenda del técnico ha sido bloqueada.");
      setActiveChatRequestId(requestId);
      setClientTab('chat');
    } catch (err) {
      console.error("Accept Quote Error:", err);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    if (!window.confirm("¿Deseas denegar esta propuesta de trabajo?")) return;
    try {
      await updateDoc(doc(db, "requests", requestId), {
        status: 'rejected',
        techUserId: user.uid // Reforzar el vínculo de propiedad para permisos
      });
      alert("Solicitud denegada correctamente.");
    } catch (err) {
      console.error("Reject Request Error:", err);
      alert("Error al denegar: No tienes permisos sobre esta solicitud.");
    }
  };

  const handleDeleteRequest = async (requestId: string) => {
    const req = requests.find(r => r.id === requestId);
    if (!req) return;

    // BLOQUEO DE SEGURIDAD: No permitir borrar registros que ya fueron pagados o están en proceso
    const lockedStatuses = ['accepted', 'executing', 'unforeseen', 'unforeseen_paid', 'completed'];
    if (lockedStatuses.includes(req.status)) {
      alert("⚠️ Acción denegada: Este servicio ya ha sido pagado o está en curso. No puedes eliminarlo para mantener la trazabilidad de la garantía y los depósitos. Si necesitas anularlo, utiliza el botón 'CANCELAR' y se aplicarán las políticas de reembolso.");

      // Notificar al técnico que el cliente intentó borrar el registro
      addDoc(collection(db, "messages"), {
        requestId: requestId,
        sender: 'tech',
        text: `⚠️ AVISO DE SEGURIDAD: El cliente intentó eliminar este contrato de su panel principal. La acción fue bloqueada por el sistema para proteger tu pago y la trazabilidad del servicio. Por favor, contacta al cliente o espera instrucciones de soporte.`,
        timestamp: serverTimestamp()
      });
      return;
    }

    if (!window.confirm("¿Estás seguro de que deseas eliminar este registro? Esta acción es permanente.")) return;
    try {
      await deleteDoc(doc(db, "requests", requestId));
      alert("Registro eliminado exitosamente.");
    } catch (err) {
      console.error("Delete Request Error:", err);
    }
  };

  const handleReportIssue = async (requestId: string, description: string) => {
    if (!description.trim()) return;
    try {
      await updateDoc(doc(db, "requests", requestId), {
        status: 'disputed',
        issueReportedByClient: true,
        issueDescription: description.trim(),
        disputedAt: serverTimestamp()
      });
      alert("Tu reporte ha sido enviado al centro de arbitraje de MantechPro. Revisaremos tu caso en un plazo menor a 24 horas.");
    } catch (err) {
      console.error("Report Issue Error:", err);
    }
  };

  const handleCancelRequest = async (requestId: string) => {
    const req = requests.find(r => r.id === requestId);
    if (!req) return;

    if (!req.scheduledDate) {
      if (!window.confirm("¿Deseas cancelar esta solicitud?")) return;
    } else {
      const scheduledTime = new Date(req.scheduledDate).getTime();
      const now = Date.now();
      const hoursToService = (scheduledTime - now) / (1000 * 60 * 60);

      // Lógica de penalización por tiempo
      if (hoursToService < 24 && req.status !== 'executing') {
        alert("⚠️ Política de Seguridad: No es posible cancelar el servicio a menos de 24 horas de la cita. El técnico ya ha reservado su jornada para ti.");
        return;
      }

      // Lógica de cancelación durante ejecución (50% avance)
      if (req.status === 'executing' || req.status === 'unforeseen' || req.status === 'unforeseen_paid') {
        if (!window.confirm("⚠️ CANCELACIÓN EN EJECUCIÓN: Se ha detectado un avance de obra. Según las políticas de MantechPro, se procederá a liquidar el avance realizado (50% aprox) bajo informe técnico por falta de presupuesto. ¿Deseas proceder?")) return;
      } else {
        if (!window.confirm("¿Deseas cancelar el servicio? Recuerda que el reembolso se procesará según las políticas de MantechPro.")) return;
      }
    }

    try {
      await updateDoc(doc(db, "requests", requestId), {
        status: 'cancelled',
        cancelledAt: serverTimestamp(),
        cancellationReason: req.status === 'executing' ? 'Falta de presupuesto / Avance 50%' : 'Cancelado por cliente'
      });

      // Notificar al técnico vía chat sobre la cancelación oficial
      await addDoc(collection(db, "messages"), {
        requestId: requestId,
        sender: 'client',
        text: `🔴 SERVICIO CANCELADO: El cliente ha solicitado la anulación del servicio. ${
          req.status === 'executing'
            ? 'Debido a que el trabajo estaba en ejecución, se aplicará la política de liquidación por avance del 50%.'
            : 'Se procederá según las políticas de reembolso vigentes.'
        }`,
        timestamp: serverTimestamp()
      });

      // Borrar de la agenda si existe
      const qAgenda = query(collection(db, "agenda"), where("requestId", "==", requestId));
      const snapAgenda = await getDocs(qAgenda);
      for (const d of snapAgenda.docs) {
        await deleteDoc(doc(db, "agenda", d.id));
      }

      alert("Solicitud cancelada. Se ha iniciado el proceso de liquidación por avance de obra.");
    } catch (err) {
      console.error("Cancel Request Error:", err);
    }
  };

  const handlePostponeService = async (requestId: string) => {
    const estimatedTime = window.prompt("¿A qué hora vendrás mañana para continuar? (Ej: 09:00 AM)", "09:00 AM");
    if (!estimatedTime) return;

    if (!window.confirm(`¿Seguro que no terminarás hoy? Se notificará al cliente que continuarás mañana a las ${estimatedTime}.`)) return;

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    try {
      await updateDoc(doc(db, "requests", requestId), {
        scheduledDate: tomorrowStr,
        scheduledTime: estimatedTime,
        isPostponed: true,
        postponedAt: serverTimestamp()
      });

      // Actualizar agenda
      const qAgenda = query(collection(db, "agenda"), where("requestId", "==", requestId));
      const snapAgenda = await getDocs(qAgenda);
      for (const d of snapAgenda.docs) {
        await updateDoc(doc(db, "agenda", d.id), {
          date: tomorrowStr,
          time: estimatedTime,
          title: `CONTINUACIÓN: ${snapAgenda.docs[0].data().title.replace('CONFIRMADO: ', '')}`
        });
      }

      // 3. Notificar al cliente automáticamente vía chat
      await addDoc(collection(db, "messages"), {
        requestId: requestId,
        sender: 'tech',
        text: `📢 AVISO DE POSTERGACIÓN: Estimado cliente, no podré concluir el trabajo hoy. He reprogramado la continuación del servicio para mañana ${formatFriendlyDate(tomorrowStr)} a las ${estimatedTime}. Mis disculpas por el inconveniente.`,
        timestamp: serverTimestamp()
      });

      alert("Servicio postergado. El cliente ha sido notificado con la hora estimada.");
    } catch (err) {
      console.error("Postpone Error:", err);
    }
  };

  const handleResumeJob = async (requestId: string) => {
    const req = requests.find(r => r.id === requestId);
    if (!req) return;

    const nextDayNumber = (req.resumeCount || 1) + 1;

    try {
      await updateDoc(doc(db, "requests", requestId), {
        isPostponed: false,
        visitStartedAt: new Date().toISOString(),
        resumedAt: serverTimestamp(),
        resumeCount: nextDayNumber
      });

      // Notificar vía chat la reanudación para el historial
      await addDoc(collection(db, "messages"), {
        requestId: requestId,
        sender: 'tech',
        text: `✅ TRABAJO REANUDADO (DÍA ${nextDayNumber}): He llegado al sitio para continuar con las labores de mantenimiento.`,
        timestamp: serverTimestamp()
      });

      alert(`¡Sesión reanudada! Se ha registrado el inicio del Día ${nextDayNumber} en el historial.`);
    } catch (err) {
      console.error("Resume Job Error:", err);
    }
  };

  const handleRescheduleService = async (requestId: string, newDate: string, newTime: string, reason: string) => {
    const req = requests.find(r => r.id === requestId);
    if (!req) return;

    try {
      const historyEntry = {
        oldDate: req.scheduledDate || '',
        oldTime: req.scheduledTime || '',
        newDate,
        newTime,
        reason,
        timestamp: new Date().toISOString()
      };

      const newHistory = [...(req.rescheduleHistory || []), historyEntry];

      // 1. Actualizar la solicitud con auditoría
      await updateDoc(doc(db, "requests", requestId), {
        scheduledDate: newDate,
        scheduledTime: newTime,
        rescheduleCount: (req.rescheduleCount || 0) + 1,
        rescheduleHistory: newHistory
      });

      // 2. Sincronizar la Agenda
      const qAgenda = query(collection(db, "agenda"), where("requestId", "==", requestId));
      const snapAgenda = await getDocs(qAgenda);
      for (const d of snapAgenda.docs) {
        await updateDoc(doc(db, "agenda", d.id), {
          date: newDate,
          time: newTime,
          title: `REPROGRAMADO: ${req.assetName}`
        });
      }

      // 3. Notificar al cliente automáticamente vía chat
      await addDoc(collection(db, "messages"), {
        requestId,
        sender: 'tech',
        text: `📢 AVISO DE REPROGRAMACIÓN: He tenido que ajustar nuestra cita para el ${newDate} a las ${newTime}. Motivo: ${reason}. Disculpe las molestias.`,
        timestamp: serverTimestamp()
      });

      alert("Cita reprogramada y cliente notificado. El cambio ha quedado registrado en el historial de auditoría.");
    } catch (err) {
      console.error("Reschedule Error:", err);
    }
  };

  // Tech complete job
  const handleCompleteJob = async (requestId: string, signature?: string) => {
    const req = requests.find(r => r.id === requestId);
    if (!req) return;

    try {
      // 1. Marcar el trabajo como completado con firma si existe
      await updateDoc(doc(db, "requests", requestId), {
        status: 'completed',
        visitFinishedAt: new Date().toISOString(),
        clientSignature: signature || null
      });

      // 2. Incrementar el contador de trabajos del técnico
      const techRef = doc(db, "technicians", req.techId);
      const selectedTech = technicians.find(t => t.id === req.techId);
      if (selectedTech) {
        await updateDoc(techRef, {
          completedJobs: (selectedTech.completedJobs || 0) + 1
        });
      }
      setIsSignatureModalOpen(false);
      alert("¡Servicio finalizado con éxito! El reporte con la firma del cliente ha sido generado.");
    } catch (err) {
      console.error("Complete Job Error:", err);
    }
  };

  // --- NUEVAS HERRAMIENTAS TÉCNICAS ---

  // Eliminar Material
  const handleRemoveMaterial = async (requestId: string, index: number) => {
    const req = requests.find(r => r.id === requestId);
    if (!req) return;
    const newMaterials = [...(req.materials || [])];
    newMaterials.splice(index, 1);
    try {
      await updateDoc(doc(db, "requests", requestId), { materials: newMaterials });
    } catch (err) { console.error("Remove Material Error:", err); }
  };

  const handleStartJob = async (requestId: string) => {
    try {
      await updateDoc(doc(db, "requests", requestId), {
        status: 'executing',
        visitStartedAt: new Date().toISOString()
      });
      alert("¡Servicio en ejecución! No olvides registrar cualquier imprevisto de inmediato.");
    } catch (err) { console.error("Start Job Error:", err); }
  };

  const handleTriggerUnforeseen = async (requestId: string, reason: string, extraCost: number) => {
    if (!reason || extraCost <= 0) {
      alert("Debes indicar el motivo y el monto del imprevisto.");
      return;
    }
    try {
      await updateDoc(doc(db, "requests", requestId), {
        status: 'unforeseen',
        unforeseenReason: reason,
        unforeseenAmount: extraCost,
        unforeseenAt: serverTimestamp()
      });
      // Notificar vía chat
      await addDoc(collection(db, "messages"), {
        requestId,
        sender: 'tech',
        text: `🚨 AVISO DE IMPREVISTO: Se ha detectado una anomalía crítica: "${reason}". Costo adicional: $${extraCost}. Esto es necesario para garantizar la integridad y garantía del trabajo.`,
        timestamp: serverTimestamp()
      });
      alert("Imprevisto reportado. El cliente debe aprobar y pagar el adicional para continuar.");
    } catch (err) { console.error("Unforeseen Error:", err); }
  };

  const handlePayUnforeseen = async (requestId: string) => {
    try {
      await updateDoc(doc(db, "requests", requestId), {
        status: 'unforeseen_paid',
        unforeseenPaidAt: serverTimestamp()
      });
      alert("Pago de imprevisto confirmado. El técnico puede continuar con la ejecución.");
    } catch (err) { console.error("Pay Unforeseen Error:", err); }
  };

  // Actualizar Checklist
  const handleUpdateChecklist = async (requestId: string, taskId: string, isCompleted: boolean) => {
    const req = requests.find(r => r.id === requestId);
    if (!req || !req.checklist) return;

    const newChecklist = req.checklist.map(task =>
      task.id === taskId ? { ...task, isCompleted } : task
    );

    try {
      await updateDoc(doc(db, "requests", requestId), {
        checklist: newChecklist
      });
    } catch (err) {
      console.error("Update Checklist Error:", err);
    }
  };

  // Agregar Tarea al Checklist
  const handleAddTaskToChecklist = async (requestId: string, description: string) => {
    if (!description.trim()) return;
    const req = requests.find(r => r.id === requestId);
    if (!req) return;

    const newTask = {
      id: Date.now().toString(),
      description: description.trim(),
      isCompleted: false
    };

    const newChecklist = [...(req.checklist || []), newTask];

    try {
      await updateDoc(doc(db, "requests", requestId), {
        checklist: newChecklist
      });
    } catch (err) {
      console.error("Add Task Error:", err);
    }
  };

  // Agregar Material
  const handleAddMaterial = async (requestId: string, materialName: string, materialPrice: number) => {
    const req = requests.find(r => r.id === requestId);
    if (!req) return;

    const newMaterial = { name: materialName, price: Number(materialPrice) };
    const newMaterials = [...(req.materials || []), newMaterial];

    // Recalcular precio total sugerido
    const basePrice = req.price || 0;
    const newTotal = basePrice + Number(materialPrice);

    try {
      await updateDoc(doc(db, "requests", requestId), {
        materials: newMaterials,
        // Opcional: Actualizar el precio de la cotización si se desea
        // price: newTotal
      });
    } catch (err) {
      console.error("Add Material Error:", err);
    }
  };

  // Iniciar Visita (Seguridad)
  const handleStartVisit = async (requestId: string) => {
    try {
      await updateDoc(doc(db, "requests", requestId), {
        visitStartedAt: new Date().toISOString()
      });
      alert("📍 Visita iniciada. La plataforma está monitoreando la duración y el inicio del servicio para tu seguridad.");
    } catch (err) {
      console.error("Start Visit Error:", err);
    }
  };

  // Client rate technicians
  const handleRateJob = async (requestId: string) => {
    const req = requests.find(r => r.id === requestId);
    if (!req) return;

    try {
      // PENALIZACIÓN AUTOMÁTICA POR REPROGRAMACIÓN: -0.2 por cada cambio
      const penalty = (req.rescheduleCount || 0) * 0.2;
      const finalRating = Math.max(1, Number((ratingVal - penalty).toFixed(1)));

      await updateDoc(doc(db, "requests", requestId), {
        status: 'rated',
        rating: finalRating,
        comment: ratingComment,
        ratingBeforePenalty: ratingVal // Guardar el original por transparencia
      });

      // Update technician review stats in Firestore
      const techRef = doc(db, "technicians", req.techId);
      const selectedTech = technicians.find(t => t.id === req.techId);

      if (selectedTech) {
        const currentRating = selectedTech.rating || 5.0;
        const currentCount = selectedTech.reviewCount || 0;

        const newCount = currentCount + 1;
        const newRating = Number(((currentRating * currentCount + finalRating) / newCount).toFixed(1));

        await updateDoc(techRef, {
          reviewCount: newCount,
          rating: newRating
        });
      }

      setRatingRequestId(null);
      setRatingComment('');
      setRatingVal(5);
      alert(`¡Gracias! Has calificado el servicio. (Calificación final: ${finalRating} después de ajustes logísticos).`);
    } catch (err) {
      console.error("Rate Job Error:", err);
    }
  };

  // --- UTILIDADES DE OPTIMIZACIÓN DE ALMACENAMIENTO ---
  const compressImage = (base64Str: string, maxWidth = 800, maxHeight = 800, quality = 0.7): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
    });
  };

  // Handle general messages with Data Masking (Security)
  const handleSendMessage = async (text: string, imageData?: string) => {
    if (!activeChatRequestId || !user) return;

    // BLOQUEO DE TRATOS FUERA DE LA PLATAFORMA (Data Masking)
    // Buscamos patrones de números telefónicos o correos electrónicos
    const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/g;
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

    let safeText = text;
    if (safeText.match(phoneRegex) || safeText.match(emailRegex)) {
      safeText = safeText.replace(phoneRegex, "[DATO PROTEGIDO]");
      safeText = safeText.replace(emailRegex, "[DATO PROTEGIDO]");
      alert("🔐 Mantech Security: Por tu seguridad y garantía, los datos de contacto directos se ocultan hasta que el trato se formalice en la plataforma.");
    }

    try {
      let imageUrl = "";
      if (imageData && imageData.startsWith('data:image/')) {
        // COMPRESIÓN ANTES DE SUBIR PARA AHORRAR COSTOS
        const compressedData = await compressImage(imageData, 1000, 1000, 0.6);

        // Firebase Storage Upload
        const storageRef = ref(storage, `chats/${activeChatRequestId}/${Date.now()}.jpg`);
        await uploadString(storageRef, compressedData, 'data_url');
        imageUrl = await getDownloadURL(storageRef);
      }

      await addDoc(collection(db, "messages"), {
        requestId: activeChatRequestId,
        sender: role === 'client' ? 'client' : 'tech',
        text: safeText,
        image: imageUrl || null,
        timestamp: serverTimestamp()
      });
    } catch (err) {
      console.error("Send Message Error:", err);
    }
  };

  // Get current active tech profile details
  const getSelectedTechProfileObj = () => {
    const found = technicians.find(t => t.id === selectedTechProfileId);

    // Calcular trabajos completados reales de la base de datos
    const realCompletedCount = requests.filter(r =>
      r.techId === selectedTechProfileId &&
      (r.status === 'completed' || r.status === 'rated')
    ).length;

    if (found) return { ...found, completedJobs: realCompletedCount };

    // Si no se encuentra pero el usuario está logueado como tech, mostrar sus datos básicos
    if (role === 'tech') {
      return {
        id: selectedTechProfileId,
        name: loggedInName,
        title: 'Técnico Especialista',
        category: 'mecanico',
        rating: 5.0,
        reviewCount: 0,
        completedJobs: realCompletedCount,
        experienceYears: 5,
        location: 'Ciudad de Panamá',
        hourlyRate: 25,
        bio: '',
        certifications: [],
        portfolioImages: [],
        plan: 'basic'
      };
    }

    return technicians[0] || {
      id: 'unknown',
      name: 'Usuario',
      title: 'Técnico Especialista',
      category: 'general',
      rating: 5.0,
      reviewCount: 0,
      completedJobs: 0,
      experienceYears: 0,
      location: 'Panamá',
      hourlyRate: 0,
      bio: '',
      certifications: [],
      portfolioImages: [],
      plan: 'basic'
    };
  };

  // Auth Submit Handlers
  const handleLogin = async (e: React.FormEvent | null, selectedRole: 'client' | 'tech' | 'admin', forceEmail?: string, forceName?: string, techId?: string) => {
    if (e) e.preventDefault();
    setAuthError('');
    
    const email = forceEmail || loginEmail;
    const password = loginPassword || "mantech123";
    const name = forceName || loginName || (selectedRole === 'admin' ? 'Administrador Central' : '');

    try {
      if (authMode === 'register' || forceName) {
        // ... (lógica de registro existente)
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const newUser = userCredential.user;
        await updateProfile(newUser, { displayName: name });
        const techId = (selectedRole === 'tech' ? `tech-${Date.now()}` : null);

        // USAR setDoc con UID para consistencia
        await setDoc(doc(db, "users", newUser.uid), {
          uid: newUser.uid,
          email: email,
          name: name,
          role: selectedRole,
          techId: techId,
          createdAt: serverTimestamp()
        });

        // SI ES TÉCNICO, CREAR PERFIL PROFESIONAL AUTOMÁTICO
        if (selectedRole === 'tech' && techId) {
          await setDoc(doc(db, "technicians", techId), {
            id: techId,
            name: name,
            category: 'mecanico', // Por defecto
            title: 'Técnico Especialista en Mantenimiento',
            rating: 5.0,
            reviewCount: 0,
            experienceYears: 0,
            location: 'Ciudad de Panamá',
            hourlyRate: 20,
            bio: 'Nuevo técnico registrado en la plataforma. Especialista en soluciones integrales.',
            certifications: [],
            portfolioImages: [],
            plan: 'basic',
            userId: newUser.uid
          });
        }
        setLoggedInName(name);
        setLoggedInEmail(email);
        setRole(selectedRole);
      } else {
        // Firebase Login - VALIDACIÓN DE ROL ESTRICTA
        let userCredential;
        try {
          userCredential = await signInWithEmailAndPassword(auth, email, password);
        } catch (loginErr: any) {
          // AUTO-SEED PARA EL ADMINISTRADOR: Si es el admin por defecto y no existe, crearlo.
          if (email === 'admin@mantech.com' && password === 'mantech123' && loginErr.code === 'auth/invalid-credential') {
            console.log("Detectado acceso admin inicial. Creando cuenta maestra...");
            const seedCredential = await createUserWithEmailAndPassword(auth, email, password);
            const seedUser = seedCredential.user;
            await updateProfile(seedUser, { displayName: 'Administrador Central' });

            // USAR setDoc con UID para que las reglas de Firebase funcionen
            await setDoc(doc(db, "users", seedUser.uid), {
              uid: seedUser.uid,
              email: email,
              name: 'Administrador Central',
              role: 'admin',
              createdAt: serverTimestamp()
            });
            userCredential = seedCredential;
          } else {
            throw loginErr;
          }
        }

        const loggedUser = userCredential.user;

        // Verificar el rol en Firestore antes de permitir el acceso
        const q = query(collection(db, "users"), where("uid", "==", loggedUser.uid));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const userData = querySnapshot.docs[0].data();

          // Validación de rol estricta (Excepto para el admin maestro que puede entrar por cualquier pestaña)
          if (email !== 'admin@mantech.com' && userData.role !== selectedRole) {
            await signOut(auth); // Expulsar si el rol no coincide
            throw { code: 'custom/wrong-role', message: `Esta cuenta está registrada como ${userData.role === 'tech' ? 'TÉCNICO' : (userData.role === 'admin' ? 'ADMINISTRADOR' : 'CLIENTE')}. Por favor, selecciona el perfil correcto arriba.` };
          }

          // Actualizar estados locales inmediatamente tras login exitoso
          if (email === 'admin@mantech.com') {
            setRole('admin');
          } else {
            setRole(userData.role);
          }
          setLoggedInName(userData.name || '');
          setLoggedInEmail(userData.email || '');
          if (userData.role === 'tech') {
            setSelectedTechProfileId(userData.techId || 'tech-1');
          }
        }
      }

      setLoginEmail('');
      setLoginPassword('');
      setLoginName('');
    } catch (err: any) {
      console.error("Auth Error:", err);
      let errorMsg = "Ocurrió un error en la autenticación";

      if (err.code === 'auth/email-already-in-use') {
        errorMsg = "Este correo electrónico ya está registrado. Por favor, inicia sesión.";
      } else if (err.code === 'auth/invalid-credential') {
        errorMsg = "Correo o contraseña incorrectos.";
      } else if (err.code === 'auth/weak-password') {
        errorMsg = "La contraseña debe tener al menos 6 caracteres.";
      } else if (err.code === 'auth/invalid-email') {
        errorMsg = "El formato del correo no es válido.";
      } else if (err.code === 'custom/wrong-role') {
        errorMsg = err.message;
      }

      setAuthError(errorMsg);
    }
  };

  const handleResetPassword = async () => {
    if (!loginEmail) {
      setAuthError("Por favor ingresa tu correo electrónico para restablecer la contraseña.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, loginEmail);
      alert("Se ha enviado un correo para restablecer tu contraseña. Revisa tu bandeja de entrada.");
    } catch (err: any) {
      console.error("Reset Password Error:", err);
      setAuthError("Error al enviar el correo: " + err.message);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Logout Error:", err);
    }
  };

  // Update Profile functionality
  const [updateName, setUpdateName] = useState('');
  const [updateEmail, setUpdateEmail] = useState('');
  const [updatePassword, setUpdatePassword] = useState('');
  const [updatePhoto, setUpdatePhoto] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const compressed = await compressImage(reader.result as string, 400, 400, 0.7);
        setUpdatePhoto(compressed);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsUpdating(true);
    setAuthError('');

    try {
      let photoUrl = profileImage;

      if (updatePhoto) {
        const storageRef = ref(storage, `profiles/${user.uid}`);
        await uploadString(storageRef, updatePhoto, 'data_url');
        photoUrl = await getDownloadURL(storageRef);
      }

      if (updateName || updatePhoto) {
        await updateProfile(user, {
          displayName: updateName || loggedInName,
          photoURL: photoUrl
        });

        // Update in Firestore too
        const q = query(collection(db, "users"), where("uid", "==", user.uid));
        const snap = await getDocs(q);
        if (!snap.empty) {
          await updateDoc(doc(db, "users", snap.docs[0].id), {
            name: updateName || loggedInName,
            photoURL: photoUrl
          });
        }
        if (updateName) setLoggedInName(updateName);
        setProfileImage(photoUrl);
      }

      if (updateEmail) {
        await firebaseUpdateEmail(user, updateEmail);
        // Update in Firestore
        const q = query(collection(db, "users"), where("uid", "==", user.uid));
        const snap = await getDocs(q);
        if (!snap.empty) {
          await updateDoc(doc(db, "users", snap.docs[0].id), { email: updateEmail });
        }
        setLoggedInEmail(updateEmail);
      }

      if (updatePassword) {
        await firebaseUpdatePassword(user, updatePassword);
      }

      setUpdateName('');
      setUpdateEmail('');
      setUpdatePassword('');
      alert("Perfil actualizado correctamente");
      role === 'client' ? setClientTab('dashboard') : setTechTab('received');
    } catch (err: any) {
      console.error("Update Error:", err);
      setAuthError("Error al actualizar: " + err.message);
    } finally {
      setIsUpdating(false);
    }
  };
  const handleToggleTechPlan = async (techId: string) => {
    const tech = technicians.find(t => t.id === techId);
    if (!tech) return;

    try {
      await updateDoc(doc(db, "technicians", techId), {
        plan: tech.plan === 'premium' ? 'basic' : 'premium'
      });
    } catch (err) {
      console.error("Toggle Plan Error:", err);
    }
  };

  const handleVerifyTechnician = async (techId: string, isVerified: boolean) => {
    try {
      await updateDoc(doc(db, "technicians", techId), {
        isVerified: isVerified
      });
      alert(isVerified ? "¡Técnico verificado con éxito!" : "Verificación removida.");
    } catch (err) {
      console.error("Verify Technician Error:", err);
      alert("Error al verificar: Solo los administradores pueden realizar esta acción.");
    }
  };

  const handleUpdateTechProfile = async (updatedData: Partial<TechProfile>) => {
    if (!selectedTechProfileId) return;
    try {
      await updateDoc(doc(db, "technicians", selectedTechProfileId), {
        ...updatedData
      });
      alert("¡Perfil actualizado con éxito!");
      setIsEditingTechProfile(false);
    } catch (err: any) {
      console.error("Update Tech Profile Error:", err);
      alert("Error al actualizar perfil: " + err.message);
    }
  };

  // Redirection pre-filtering category from AI Diagnostic
  const handleAIFindTech = (category: TechCategory) => {
    setMarketFilter(category);
    setClientTab('marketplace');
  };

  // Computing Administrative financial commissions metrics:
  // 1. Commission collected (15% from jobs in quoted status accepted or completed)
  const totalInvoicedJobs = requests
    .filter(r => r.status === 'accepted' || r.status === 'completed' || r.status === 'rated')
    .reduce((acc, current) => acc + (current.price || 0), 0);
  
  const companyCommissions = requests
    .filter(r => r.status === 'accepted' || r.status === 'completed' || r.status === 'rated')
    .reduce((acc, current) => acc + (current.commission || 0), 0);

  const totalMembershipFees = technicians
    .filter(t => t.plan === 'premium')
    .length * 15; // $15.00 level membership fee

  // --- AUTHENTICATION SPLIT / LOGIN PORTAL ---
  if (isAuthResolving) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center font-sans">
        <div className="relative">
          <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl animate-bounce">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center font-black text-indigo-600 text-xl">M</div>
          </div>
          <div className="absolute -inset-4 bg-indigo-500/20 rounded-full blur-2xl animate-pulse"></div>
        </div>
        <div className="mt-8 text-center space-y-2">
          <h2 className="text-white font-black tracking-tighter text-xl uppercase italic">Mantech<span className="text-indigo-500">Pro</span></h2>
          <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.3em] animate-pulse">Iniciando Ecosistema Técnico...</p>
        </div>
        <div className="absolute bottom-10 text-[9px] text-zinc-600 font-bold uppercase tracking-widest">
          Panamá City • Hub de Servicios
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
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
                      ? 'Como CLIENTE: Sube reportes de fallas con IA, cotiza de forma libre, monitorea tu inventario y califica proveedores.'
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

    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col font-sans text-white relative">
        <div className="absolute inset-0 bg-[radial-gradient(#312e81_1px,transparent_1px)] [background-size:16px_16px] opacity-20"></div>
        
        {/* Header inside Portal */}
        <nav className="h-16 bg-zinc-900/90 border-b border-zinc-800 text-white flex items-center justify-between px-6 z-40 shrink-0 select-none">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-indigo-500 rounded flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded-sm"></div>
            </div>
            <span className="text-md font-black tracking-tight">Mantech<span className="text-indigo-400">Pro</span></span>
          </div>
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
                            Diagnóstico Preliminar IA / Clasificación Automática
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
            </div>
        </div>

        <footer className="py-6 border-t border-zinc-900 text-center text-[10px] text-zinc-500 font-medium z-10 uppercase tracking-widest bg-zinc-950/85 font-mono">
          Mantech Pro Panamá • 2026. Todos los derechos reservados.
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col font-sans text-zinc-900 print:bg-white">
      
      {/* Top Navigation - Sleek Interface theme */}
      <nav className="h-16 bg-zinc-900 text-white flex items-center justify-between px-4 md:px-8 shrink-0 shadow-lg sticky top-0 z-40 print:hidden">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-indigo-500 rounded flex items-center justify-center">
            <div className="w-4 h-4 bg-white rounded-sm"></div>
          </div>
          <span className="text-xl font-bold tracking-tight">Mantech<span className="text-indigo-400">Pro</span></span>
          <span className="hidden sm:inline-flex text-[10px] font-bold bg-zinc-800 text-indigo-300 px-2 py-0.5 rounded border border-zinc-700/80">
            {role === 'client' ? 'Perfil Cliente' : role === 'admin' ? 'Panel Administrador' : 'Perfil Técnico'}
          </span>
        </div>

        {/* Dynamic Header Controls & Actions */}
        <div className="flex items-center space-x-3 md:space-x-4">
          
          {/* Active Logged In Account Brief */}
          <div className="hidden md:flex items-center space-x-2 bg-zinc-800 px-3 py-1.5 rounded-xl border border-zinc-800 max-w-[210px]">
            <div className="w-6 h-6 bg-indigo-600 rounded-full text-[10px] font-black text-white flex items-center justify-center overflow-hidden border border-indigo-500/30">
              {profileImage ? (
                <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                loggedInName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
              )}
            </div>
            <div className="truncate text-left">
              <span className="block text-[10px] font-extrabold text-zinc-100 truncate">{loggedInName}</span>
              <span className="block text-[8px] text-zinc-400 truncate">{loggedInEmail}</span>
            </div>
          </div>

          {/* Settings Button */}
          <button
            onClick={() => {
              if (role === 'client') setClientTab('settings');
              else if (role === 'tech') setTechTab('settings');
              else setAdminTab('settings');
            }}
            title="Configuración de Cuenta"
            className="p-2 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-xl transition-all cursor-pointer"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Secure Logout Button */}
          <button 
            onClick={handleLogout}
            title="Cerrar Sesión Segura"
            className="flex items-center gap-1.5 px-3 py-2 bg-red-950/40 border border-red-900/40 hover:bg-red-900/60 text-red-100 text-red-400 font-extrabold rounded-xl text-xs transition-all cursor-pointer shadow-sm select-none"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Salir</span>
          </button>
        </div>
      </nav>

      {/* Main Container Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-6 grid grid-cols-1 md:grid-cols-12 gap-6 transition-all duration-300 print:hidden">
        
        <div className="contents">
          
          {/* Navigation Sidebar */}
          <aside className="md:col-span-4 lg:col-span-3 space-y-4">
          
          {/* Persona Card */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-sm text-center space-y-3.5">
            <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center font-bold text-sm bg-indigo-50 border-2 border-indigo-200 text-indigo-700 shadow-inner overflow-hidden relative group">
              {profileImage ? (
                <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                loggedInName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
              )}
            </div>
            
            <div>
              <h4 className="font-extrabold text-zinc-900 text-sm tracking-tight">
                {loggedInName}
              </h4>
              <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-widest mt-0.5">
                {role === 'client' ? 'Cliente Residencial / B2B' :
                 role === 'admin' ? 'Administrador del Sistema' :
                 (getSelectedTechProfileObj()?.title || 'Técnico Especialista')}
              </p>
            </div>

            <div className="text-[10px] text-zinc-500 flex justify-center items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              ID de cuenta activo
            </div>
          </div>

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
                    Diagnóstico IA V2.0
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
                  </div>
                </div>

                <button
                  onClick={() => setTechTab('received')}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                    techTab === 'received'
                      ? 'bg-zinc-900 text-white border-zinc-800 shadow-md font-extrabold'
                      : 'border-zinc-100 text-zinc-600 bg-white hover:bg-zinc-50'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <FileCheck2 className={`w-4 h-4 ${techTab === 'received' ? 'text-indigo-400' : 'text-zinc-500'}`} />
                    Inbox Solicitudes
                  </span>
                  <span className="px-2 py-0.5 bg-indigo-100 text-[10px] font-extrabold text-indigo-800 rounded-md">
                    {requests.filter(r => r.techId === selectedTechProfileId).length}
                  </span>
                </button>

                <button
                  onClick={() => setTechTab('agenda')}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                    techTab === 'agenda'
                      ? 'bg-zinc-900 text-white border-zinc-800 shadow-md font-extrabold'
                      : 'border-zinc-100 text-zinc-600 bg-white hover:bg-zinc-50'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <CalendarDays className={`w-4 h-4 ${techTab === 'agenda' ? 'text-indigo-400' : 'text-zinc-500'}`} />
                    Mi Agenda de Trabajo
                  </span>
                  <span className="px-2 py-0.5 bg-amber-100 text-[10px] font-extrabold text-amber-800 rounded-md">
                    {agenda.filter(a => a.techId === selectedTechProfileId && a.status === 'pending').length}
                  </span>
                </button>

                <button
                  onClick={() => setTechTab('profile')}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                    techTab === 'profile'
                      ? 'bg-zinc-900 text-white border-zinc-800 shadow-md font-extrabold'
                      : 'border-zinc-100 text-zinc-600 bg-white hover:bg-zinc-50'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Users className={`w-4 h-4 ${techTab === 'profile' ? 'text-indigo-400' : 'text-zinc-500'}`} />
                    Perfil & Suscripción
                  </span>
                </button>

                <button
                  onClick={() => setTechTab('chat')}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                    techTab === 'chat'
                      ? 'bg-zinc-900 text-white border-zinc-800 shadow-md font-extrabold'
                      : 'border-zinc-100 text-zinc-600 bg-white hover:bg-zinc-50'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <MessageSquare className={`w-4 h-4 ${techTab === 'chat' ? 'text-indigo-400' : 'text-zinc-500'}`} />
                    Chat con Clientes
                  </span>
                  {requests.filter(r => r.techId === selectedTechProfileId && ['quoted', 'accepted', 'executing', 'unforeseen', 'unforeseen_paid', 'completed'].includes(r.status)).length > 0 && (
                    <span className="bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-lg text-[9px] font-black group-hover:bg-white transition-all">
                      {requests.filter(r => r.techId === selectedTechProfileId && ['quoted', 'accepted', 'executing', 'unforeseen', 'unforeseen_paid', 'completed'].includes(r.status)).length}
                    </span>
                  )}
                </button>
              </>
            )}
          </nav>

          {/* Intermediate Business Metrics / Admin Board - ONLY FOR ADMIN */}
          {role === 'admin' && (
            <div className="bg-zinc-900 text-white rounded-2xl p-5 shadow-lg border border-zinc-800 space-y-4">
              <h4 className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-400" />
                Mantenimientos S.A.
              </h4>

              <p className="text-[11px] text-zinc-400 leading-relaxed font-medium">
                Panel de control rápido para la dirección general.
              </p>

              <div className="grid grid-cols-2 gap-2.5 pt-1.5">
                <div className="bg-zinc-800 p-3 rounded-xl border border-zinc-700/60">
                  <span className="block text-[8px] text-zinc-400 uppercase font-black">Comisiones</span>
                  <span className="text-sm font-black text-emerald-400 block mt-0.5">
                    ${companyCommissions.toFixed(2)}
                  </span>
                </div>

                <div className="bg-zinc-800 p-3 rounded-xl border border-zinc-700/60">
                  <span className="block text-[8px] text-zinc-400 uppercase font-black">Membresías</span>
                  <span className="text-sm font-black text-indigo-400 block mt-0.5">
                    ${totalMembershipFees.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </aside>

        {/* Content Panel Area */}
        <main className="md:col-span-8 lg:col-span-9 space-y-6">
          
          {/* ADMIN PERSONA CONTENT WRAPPER */}
          {role === 'admin' && (
            <div className="space-y-6">
              {adminTab === 'finance' && (
                <div className="space-y-6">
                  {/* Financial Summary */}
                  <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
                    <h2 className="text-sm font-black text-zinc-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-emerald-600" />
                      Resumen Financiero & Rendimiento
                    </h2>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                        <span className="block text-[9px] text-emerald-800 font-black uppercase">Ingresos Brutos</span>
                        <span className="text-xl font-black text-emerald-900">${totalInvoicedJobs.toFixed(2)}</span>
                        <span className="text-[8px] text-emerald-600 font-bold block mt-1">Total facturado</span>
                      </div>

                      <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                        <span className="block text-[9px] text-indigo-800 font-black uppercase">Comisiones (15%)</span>
                        <span className="text-xl font-black text-indigo-900">${companyCommissions.toFixed(2)}</span>
                        <span className="text-[8px] text-indigo-600 font-bold block mt-1">Tu ganancia operativa</span>
                      </div>

                      <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                        <span className="block text-[9px] text-amber-800 font-black uppercase">Membresías</span>
                        <span className="text-xl font-black text-amber-900">${totalMembershipFees.toFixed(2)}</span>
                        <span className="text-[8px] text-amber-600 font-bold block mt-1">Ingresos recurrentes</span>
                      </div>

                      <div className="p-4 bg-zinc-900 rounded-2xl text-white">
                        <span className="block text-[9px] text-zinc-400 font-black uppercase">Utilidad Neta</span>
                        <span className="text-xl font-black text-emerald-400">
                          ${(companyCommissions + totalMembershipFees).toFixed(2)}
                        </span>
                        <span className="text-[8px] text-zinc-500 font-bold block mt-1">Utilidad real acumulada</span>
                      </div>
                    </div>
                  </div>

                  {/* Operational Metrics */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Activos Totales</span>
                        <Layers className="w-4 h-4 text-indigo-500" />
                      </div>
                      <div className="text-2xl font-black text-zinc-900">{assets.length}</div>
                      <p className="text-[9px] text-zinc-500 font-medium">Equipos bajo monitoreo global</p>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Conversión</span>
                        <TrendingUp className="w-4 h-4 text-emerald-500" />
                      </div>
                      <div className="text-2xl font-black text-zinc-900">
                        {requests.length > 0
                          ? Math.round((requests.filter(r => r.status !== 'pending' && r.status !== 'rejected').length / requests.length) * 100)
                          : 0}%
                      </div>
                      <p className="text-[9px] text-zinc-500 font-medium">Tasa de éxito en cotizaciones</p>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Satisfacción</span>
                        <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      </div>
                      <div className="text-2xl font-black text-zinc-900">
                        {(() => {
                          const rated = requests.filter(r => r.rating);
                          if (rated.length === 0) return '5.0';
                          return (rated.reduce((acc, r) => acc + (r.rating || 0), 0) / rated.length).toFixed(1);
                        })()}
                      </div>
                      <p className="text-[9px] text-zinc-500 font-medium">Promedio de estrellas global</p>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Pendientes</span>
                        <Clock className="w-4 h-4 text-rose-500" />
                      </div>
                      <div className="text-2xl font-black text-zinc-900">
                        {requests.filter(r => r.status === 'pending').length}
                      </div>
                      <p className="text-[9px] text-zinc-500 font-medium">Clientes esperando propuesta</p>
                    </div>
                  </div>

                  <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
                    <h3 className="text-xs font-black text-zinc-400 uppercase mb-4 tracking-widest">Últimas Transacciones</h3>
                    <div className="space-y-3">
                      {requests.filter(r => r.price).slice(0, 5).map(r => (
                        <div key={r.id} className="flex justify-between items-center p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                          <div>
                            <span className="block text-xs font-bold text-zinc-800">{r.assetName}</span>
                            <span className="text-[10px] text-zinc-500">{r.techName}</span>
                          </div>
                          <div className="text-right">
                            <span className="block text-xs font-black text-emerald-600">${r.price?.toFixed(2)}</span>
                            <span className="text-[9px] text-zinc-400">Comisión: ${r.commission?.toFixed(2)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm flex flex-col items-center justify-center text-center">
                    <PieChart className="w-12 h-12 text-indigo-200 mb-2" />
                    <h3 className="text-xs font-black text-zinc-900 uppercase mb-1">Distribución de Ingresos</h3>
                    <p className="text-[10px] text-zinc-400">Las comisiones representan el {((companyCommissions / (companyCommissions + totalMembershipFees + 0.1)) * 100).toFixed(0)}% de tus ingresos.</p>
                  </div>
                </div>
              )}

              {adminTab === 'users' && (
                <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
                  <h2 className="text-sm font-black text-zinc-900 uppercase tracking-widest mb-4">Monitor de Usuarios Activos</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-zinc-100">
                          <th className="py-3 font-black text-zinc-400 uppercase">Usuario</th>
                          <th className="py-3 font-black text-zinc-400 uppercase">Rol</th>
                          <th className="py-3 font-black text-zinc-400 uppercase">Documentos</th>
                          <th className="py-3 font-black text-zinc-400 uppercase">Estado</th>
                          <th className="py-3 font-black text-zinc-400 uppercase text-right">Acción</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-50">
                        <tr className="group">
                          <td className="py-4">
                            <div className="font-bold text-zinc-800">Rubén Ábrego</div>
                            <div className="text-[10px] text-zinc-400">ruben@mantech.com</div>
                          </td>
                          <td className="py-4"><span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md font-bold uppercase text-[9px]">Cliente</span></td>
                          <td className="py-4 font-bold text-zinc-300">N/A</td>
                          <td className="py-4 text-emerald-500 font-bold">● Activo</td>
                          <td className="py-4 text-right"><button className="text-zinc-400 hover:text-red-600 font-bold">Suspender</button></td>
                        </tr>
                        {technicians.map(t => (
                          <tr key={t.id} className="group">
                            <td className="py-4">
                              <div className="font-bold text-zinc-800">{t.name}</div>
                              <div className="text-[10px] text-zinc-400">{t.id}@mantech.com</div>
                            </td>
                            <td className="py-4">
                              <span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded-md font-bold uppercase text-[9px]">Técnico</span>
                            </td>
                            <td className="py-4">
                              <div className="flex gap-2">
                                {t.policeRecordUrl ? (
                                  <a
                                    href={t.policeRecordUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center gap-1 px-2 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-[9px] font-black border border-indigo-100 hover:bg-indigo-100 transition-all"
                                  >
                                    <FileCheck2 className="w-3 h-3" /> RÉCORD
                                  </a>
                                ) : (
                                  <span className="text-[9px] text-zinc-400 font-bold italic">Sin Récord</span>
                                )}
                                {t.idCardUrl ? (
                                  <a
                                    href={t.idCardUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center gap-1 px-2 py-1 bg-zinc-50 text-zinc-700 rounded-lg text-[9px] font-black border border-zinc-200 hover:bg-zinc-100 transition-all"
                                  >
                                    <Camera className="w-3 h-3" /> CÉDULA
                                  </a>
                                ) : (
                                  <span className="text-[9px] text-zinc-400 font-bold italic">Sin Cédula</span>
                                )}
                              </div>
                            </td>
                            <td className="py-4">
                              <div className="flex items-center gap-2">
                                <span className={t.isVerified ? "text-emerald-500 font-bold" : "text-amber-500 font-bold"}>
                                  {t.isVerified ? "● Verificado" : "○ Pendiente"}
                                </span>
                              </div>
                            </td>
                            <td className="py-4 text-right">
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => handleVerifyTechnician(t.id, !t.isVerified)}
                                  className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase transition-all ${
                                    t.isVerified
                                      ? 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                                      : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm'
                                  }`}
                                >
                                  {t.isVerified ? "Quitar Sello" : "Aprobar Récord"}
                                </button>
                                <button className="text-zinc-400 hover:text-red-600 font-bold">Suspender</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {adminTab === 'logistics' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Active Jobs Monitor */}
                  <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-sm font-black text-zinc-900 uppercase tracking-widest flex items-center gap-2">
                        <Activity className="w-4 h-4 text-indigo-600" />
                        Monitoreo de Servicios en Curso
                      </h2>
                      <span className="text-[10px] font-bold text-zinc-400 bg-zinc-100 px-2 py-1 rounded-lg uppercase">Base de Datos Live</span>
                    </div>

                    <div className="space-y-4">
                      {requests.filter(r => r.status === 'accepted' || r.status === 'completed' || r.status === 'rated').length === 0 ? (
                        <div className="text-center py-10 text-zinc-400 font-medium italic">
                          No hay operaciones logísticas activas en este momento.
                        </div>
                      ) : (
                        requests
                          .filter(r => r.status === 'accepted' || r.status === 'completed' || r.status === 'rated')
                          .map((req) => (
                            <div key={req.id} className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-100 group hover:border-indigo-300 transition-all">
                              <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${req.status === 'accepted' ? 'bg-indigo-100 text-indigo-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                  {req.status === 'accepted' ? <Truck className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                                </div>
                                <div>
                                  <h4 className="text-xs font-black text-zinc-900">{req.assetName}</h4>
                                  <p className="text-[10px] text-zinc-500 font-medium">Técnico: <span className="text-indigo-600 font-bold">{req.techName}</span></p>
                                </div>
                              </div>
                              <div className="text-right">
                                <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-lg border ${
                                  req.status === 'accepted' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                }`}>
                                  {req.status === 'accepted' ? 'En Cita' : 'Finalizado'}
                                </span>
                                <span className="block text-[8px] text-zinc-400 mt-1 font-mono">{req.id.includes('req-') ? 'DATO PRUEBA' : req.id.substring(0,8).toUpperCase()}</span>
                                {req.rescheduleCount && req.rescheduleCount > 0 && (
                                  <span className="block text-[8px] text-rose-500 font-black mt-1 uppercase">
                                    ⚠️ {req.rescheduleCount} Reprogramaciones
                                  </span>
                                )}
                              </div>
                            </div>
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
                                    Auto Diagnóstico IA
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

                            <button
                              onClick={() => {
                                setActiveTechForModal(tech);
                                setIsTechModalOpen(true);
                              }}
                              className="w-full mt-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold text-center transition-all cursor-pointer shadow-xs"
                            >
                              Ver Perfil & Cotizar
                            </button>
                          </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: MIS COTIZACIONES */}
              {clientTab === 'quotes' && (
                <div className="space-y-6">
                  <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm">
                    <h2 className="text-sm font-black text-zinc-900 uppercase tracking-widest mb-4">Registro de Solicitudes & Contratos</h2>
                    
                    {requests.length === 0 ? (
                      <p className="text-xs text-zinc-500 text-center py-8 font-medium">No has solicitado ningún trabajo aún.</p>
                    ) : (
                      <div className="space-y-5">
                        {requests.map((req) => (
                          <div key={req.id} className="p-5 border border-zinc-200 rounded-2xl bg-zinc-50/40 hover:bg-zinc-50/90 transition-all space-y-4 shadow-xs">
                            <div className="flex flex-wrap justify-between items-center gap-3">
                              <div>
                                <span className="text-[8px] text-zinc-400 uppercase font-black block">Activo:</span>
                                <h4 className="font-extrabold text-sm text-zinc-900 tracking-tight">{req.assetName}</h4>
                              </div>

                              <div>
                                <span className={`text-[10px] font-black px-3 py-1.5 rounded-xl uppercase border text-center ${
                                  req.status === 'pending' ? 'bg-amber-50 text-amber-900 border-amber-200' :
                                  req.status === 'quoted' ? 'bg-indigo-50 text-indigo-900 border-indigo-200 animate-pulse font-extrabold' :
                                  req.status === 'accepted' ? 'bg-blue-50 text-blue-900 border-blue-200 font-bold' :
                                  req.status === 'rejected' ? 'bg-red-50 text-red-900 border-red-200' :
                                  'bg-emerald-50 text-emerald-900 border-emerald-200'
                                }`}>
                                  {req.status === 'pending' && 'Búsqueda / Propuesta vacante'}
                                  {req.status === 'quoted' && 'Oferta recibida del Técnico'}
                                  {req.status === 'accepted' && 'En Proceso / Cita agendada'}
                                  {req.status === 'completed' && 'Servicio terminado'}
                                  {req.status === 'rated' && 'Trabajo calificado'}
                                  {req.status === 'rejected' && 'Solicitud Rechazada'}
                                  {req.status === 'cancelled' && 'Cancelado'}
                                </span>
                              </div>
                              <div className="flex gap-1 items-center">
                                {req.status === 'accepted' && (
                                  <button
                                    onClick={() => handleCancelRequest(req.id)}
                                    className="px-3 py-1 bg-white border border-rose-200 text-rose-600 rounded-lg text-[9px] font-black uppercase hover:bg-rose-50 transition-all"
                                    title="Cancelar Servicio"
                                  >
                                    Cancelar
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDeleteRequest(req.id)}
                                  className="p-2 text-zinc-400 hover:text-red-600 transition-colors"
                                  title="Eliminar Registro"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            {/* PROGRESS STEPS INDICATOR */}
                            <div className="flex items-center justify-between px-2 py-4 overflow-x-auto gap-4 custom-scrollbar">
                              {[
                                { label: 'Solicitud', status: ['pending', 'quoted', 'accepted', 'executing', 'unforeseen', 'unforeseen_paid', 'completed', 'rated'] },
                                { label: 'Cotizado', status: ['quoted', 'accepted', 'executing', 'unforeseen', 'unforeseen_paid', 'completed', 'rated'] },
                                { label: 'Pagado', status: ['accepted', 'executing', 'unforeseen', 'unforeseen_paid', 'completed', 'rated'] },
                                { label: 'Ejecución', status: ['executing', 'unforeseen', 'unforeseen_paid', 'completed', 'rated'] },
                                { label: 'IMPREVISTO', status: ['unforeseen', 'unforeseen_paid', 'completed', 'rated'] },
                                { label: 'PAGO IMPREVISTO', status: ['unforeseen_paid', 'completed', 'rated'] },
                                { label: 'Finalizado', status: ['completed', 'rated'] }
                              ].map((step, idx, arr) => {
                                const isDone = step.status.includes(req.status);
                                const isLast = idx === arr.length - 1;
                                return (
                                  <React.Fragment key={idx}>
                                    <div className="flex flex-col items-center gap-1.5 relative shrink-0">
                                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-black transition-all ${isDone ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100' : 'bg-zinc-200 text-zinc-400'}`}>
                                        {isDone ? <Check className="w-3 h-3" /> : idx + 1}
                                      </div>
                                      <span className={`text-[7px] font-black uppercase tracking-tighter ${isDone ? 'text-indigo-600' : 'text-zinc-400'}`}>{step.label}</span>
                                    </div>
                                    {!isLast && <div className={`w-4 h-0.5 mb-3 rounded-full shrink-0 ${isDone ? 'bg-indigo-600' : 'bg-zinc-100'}`}></div>}
                                  </React.Fragment>
                                );
                              })}
                            </div>

                            <p className="text-xs text-zinc-600 bg-white p-3.5 rounded-xl border border-zinc-100 leading-relaxed">
                              <strong>Instrucciones enviadas:</strong> {req.description}
                            </p>

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
                                    onClick={() => handleAcceptQuote(req.id, 'yappy')}
                                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer shadow-sm"
                                  >
                                    Pagar con Yappy
                                  </button>
                                  <button
                                    onClick={() => handleAcceptQuote(req.id, 'ach')}
                                    className="px-4 py-2.5 bg-zinc-900 hover:bg-black text-white rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer"
                                  >
                                    Pago ACH / Tarjeta
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
                            <button
                              key={r.id}
                              onClick={() => setActiveChatRequestId(r.id)}
                              className={`w-full text-left p-3 rounded-xl border text-xs transition-all cursor-pointer ${
                                activeChatRequestId === r.id
                                  ? 'border-indigo-600 border-indigo-500 bg-indigo-50/70 text-indigo-900 font-black'
                                  : 'border-transparent text-zinc-600 hover:bg-zinc-50'
                              }`}
                            >
                              <div className="truncate font-bold">{r.techName}</div>
                              <div className="text-[10px] text-zinc-400 truncate mt-0.5">{r.assetName}</div>
                            </button>
                          ))
                      )}
                    </div>

                    {/* Chat widget */}
                    <div className="md:col-span-3">
                      <SupportChatWidget
                        request={requests.find(r => r.id === activeChatRequestId) || null}
                        role="client"
                        onSendMessage={handleSendMessage}
                        messages={chatMessages.filter(m => m.requestId === activeChatRequestId)}
                      />
                    </div>
                  </div>
                </div>
              )}
              {/* TAB 6: SETTINGS */}
              {clientTab === 'settings' && (
                <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm max-w-xl mx-auto">
                  <h2 className="text-sm font-black text-zinc-900 uppercase tracking-widest mb-6 text-center">Configuración de Perfil</h2>

                  <form onSubmit={handleUpdateProfile} className="space-y-6">
                    {/* Avatar Upload */}
                    <div className="flex flex-col items-center gap-3">
                      <div className="relative group">
                        <div className="w-24 h-24 rounded-full bg-indigo-50 border-4 border-white shadow-md overflow-hidden flex items-center justify-center">
                          {updatePhoto || profileImage ? (
                            <img src={updatePhoto || profileImage} alt="Preview" className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-10 h-10 text-indigo-300" />
                          )}
                        </div>
                        <label className="absolute bottom-0 right-0 p-1.5 bg-indigo-600 text-white rounded-full cursor-pointer shadow-lg hover:bg-indigo-700 transition-all">
                          <Camera className="w-4 h-4" />
                          <input type="file" className="hidden" accept="image/*" onChange={handlePhotoSelect} />
                        </label>
                      </div>
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Foto de Perfil</span>
                    </div>

                    {/* SECCIÓN DE SEGURIDAD Y RÉCORD POLICIVO */}
                    <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5 mb-6 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-600 text-white rounded-xl">
                          <ShieldCheck className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-indigo-900 uppercase">Centro de Seguridad & Confianza</h4>
                          <p className="text-[10px] text-indigo-700 font-medium">Verifica tu identidad para servicios a domicilio en Panamá</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-white rounded-xl border border-indigo-200 space-y-2">
                          <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block">Documento 1</span>
                          <h5 className="text-[11px] font-bold text-zinc-800">Cédula de Identidad Personal</h5>
                          <button className="w-full py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-600 rounded-lg text-[10px] font-bold border border-zinc-200 transition-all flex items-center justify-center gap-2">
                            <Camera className="w-3.5 h-3.5" /> Subir Cédula
                          </button>
                        </div>

                        <div className="p-4 bg-white rounded-xl border border-indigo-200 space-y-2">
                          <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block">Documento 2</span>
                          <h5 className="text-[11px] font-bold text-zinc-800">Récord Policivo (Vigente)</h5>
                          <a
                            href="https://www.panamadigital.gob.pa/"
                            target="_blank"
                            rel="noreferrer"
                            className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-bold shadow-md transition-all flex items-center justify-center gap-2"
                          >
                            <ExternalLink className="w-3.5 h-3.5" /> Generar en Panamá Digital
                          </a>
                        </div>
                      </div>

                      {/* POLÍTICAS DE SERVICIO */}
                      <div className="bg-white p-4 rounded-xl border border-zinc-200 space-y-3">
                        <h4 className="text-[10px] font-black text-zinc-900 uppercase tracking-widest flex items-center gap-2">
                          <Info className="w-3.5 h-3.5 text-zinc-500" />
                          Políticas de MantechPro
                        </h4>
                        <ul className="space-y-2 text-[9px] text-zinc-600 font-medium leading-tight">
                          <li><strong>• Incumplimiento:</strong> Si el técnico no concluye el servicio, solo recibirá el 5% del valor de inspección.</li>
                          <li><strong>• Cancelación:</strong> Si cancelas con 50% de avance por falta de presupuesto, se liquida el trabajo realizado hasta el momento.</li>
                          <li><strong>• Imprevistos:</strong> Costos adicionales post-inspección deben ser aprobados para mantener la garantía.</li>
                        </ul>
                      </div>
                      <p className="text-[9px] text-indigo-600 font-medium text-center">
                        * Los documentos son validados por nuestro equipo legal en un plazo de 24 horas.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-black text-zinc-500 block">Nombre Completo</label>
                        <input
                          type="text"
                          value={updateName}
                          onChange={(e) => setUpdateName(e.target.value)}
                          placeholder={loggedInName}
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
                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase transition-all disabled:opacity-50"
                      >
                        {isUpdating ? 'Actualizando...' : 'Guardar Cambios'}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </>
          )}

          {/* TECHNICIAN PERSONA CONTENT WRAPPER */}
          {role === 'tech' && (
            <>
              {/* TAB 1: INBOX SOLICITUDES */}
              {techTab === 'received' && (
                <div className="space-y-6">
                  {/* BANNER DE SUSCRIPCIÓN - GRATIS 3 SOLICITUDES */}
                  {getSelectedTechProfileObj()?.plan === 'basic' && (
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 p-5 rounded-2xl shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 shrink-0">
                          <Zap className="w-6 h-6 fill-amber-500" />
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-amber-900 uppercase">Límite de Solicitudes Gratuitas</h4>
                          <p className="text-[11px] text-amber-800 font-medium">
                            Has usado <span className="font-black">{(getSelectedTechProfileObj()?.requestsUsedThisMonth || 0)}/3</span> solicitudes gratuitas este mes.
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setTechTab('profile')}
                        className="px-5 py-2.5 bg-zinc-950 hover:bg-black text-white rounded-xl text-xs font-black uppercase shadow-lg shadow-zinc-200 transition-all cursor-pointer active:scale-95"
                      >
                        ⚡ Subir a Pro por $8/mes
                      </button>
                    </div>
                  )}

                  <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm">
                    <div className="flex flex-wrap justify-between items-center gap-3 mb-5">
                      <div>
                        <h2 className="text-sm font-black text-zinc-900 uppercase tracking-widest">Bandeja de Diagnósticos & Cotizaciones</h2>
                        <p className="text-[11px] text-zinc-400 font-medium">Administra solicitudes de mantenimiento de clientes directos o detectadas por I.A.</p>
                      </div>
                      <span className="px-3 py-1.5 rounded-xl bg-zinc-900 text-white font-mono text-[10px] font-bold border border-zinc-800 shadow-xs">
                        ID PROVEEDOR: {selectedTechProfileId.toUpperCase()}
                      </span>
                    </div>

                    {requests.filter(r => r.techId === selectedTechProfileId).length === 0 ? (
                      <div className="text-center py-12 text-zinc-400 space-y-3 bg-zinc-50/50 rounded-2xl border border-dashed border-zinc-200">
                        <UserX className="w-12 h-12 mx-auto text-zinc-350" />
                        <h4 className="font-extrabold text-zinc-800 text-xs uppercase tracking-wider">Sin Solicitudes Recientes</h4>
                        <p className="text-[11px] text-zinc-400 max-w-sm mx-auto leading-relaxed">
                          Aún no has recibido solicitudes en esta cuenta. Vuelve a la vista de "Cliente" y simula una solicitud de cotización para verla reflejada aquí de inmediato.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-5">
                        {requests
                          .filter(r => r.techId === selectedTechProfileId)
                          .map((req) => (
                            <div key={req.id} className="p-5 border border-zinc-200 rounded-2xl bg-zinc-50/40 hover:bg-zinc-50/90 transition-all space-y-4 shadow-xs">
                              <div className="flex flex-wrap justify-between items-center gap-2">
                                <div>
                                  <span className="text-[9px] bg-indigo-50 text-indigo-700 font-extrabold px-2.5 py-1 rounded-lg border border-indigo-100 uppercase tracking-wide">
                                    Ciudad de Panamá
                                  </span>
                                  <h4 className="font-extrabold text-sm text-zinc-900 mt-2.5 tracking-tight">{req.clientName}</h4>
                                </div>

                                {req.status === 'pending' && (
                                  <div className="text-right">
                                    {(() => {
                                      const created = (req.createdAt as any)?.toDate ? (req.createdAt as any).toDate().getTime() : Date.now();
                                      const now = Date.now();
                                      const hoursPassed = (now - created) / (1000 * 60 * 60);
                                      const hoursLeft = Math.max(0, 24 - hoursPassed);

                                      return (
                                        <div className={`px-3 py-1 rounded-lg border flex items-center gap-1.5 ${hoursLeft < 4 ? 'bg-red-50 border-red-200 text-red-600 animate-pulse' : 'bg-amber-50 border-amber-200 text-amber-700'}`}>
                                          <Clock className="w-3 h-3" />
                                          <span className="text-[9px] font-black uppercase">Vence en: {Math.floor(hoursLeft)}h {Math.round((hoursLeft % 1) * 60)}m</span>
                                        </div>
                                      );
                                    })()}
                                  </div>
                                )}

                                <span className={`text-[10px] font-black px-3 py-1.5 rounded-xl uppercase border ${
                                  req.status === 'pending' ? 'bg-amber-50 text-amber-900 border-amber-200' :
                                  req.status === 'quoted' ? 'bg-indigo-50 text-indigo-950 border-indigo-200' :
                                  'bg-emerald-50 text-emerald-900 border-emerald-200'
                                }`}>
                                  {req.status === 'pending' && 'Esperando tu Propuesta / Tarifa'}
                                  {req.status === 'quoted' && 'Propuesta Enviada'}
                                  {req.status === 'accepted' && 'Servicio por Atender (Pagado)'}
                                  {req.status === 'completed' && 'Servicio terminado'}
                                  {req.status === 'rated' && 'Trabajo completado & Calificado'}
                                  {req.status === 'rejected' && 'Propuesta Denegada por Ti'}
                                </span>
                                {req.status === 'rejected' && (
                                  <button
                                    onClick={() => handleDeleteRequest(req.id)}
                                    className="p-1.5 text-zinc-400 hover:text-red-600 transition-colors"
                                    title="Eliminar de mi bandeja"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>

                              <div className="text-xs bg-white p-4 rounded-xl border border-zinc-200 leading-relaxed">
                                <span className="block text-[8px] text-zinc-400 font-black mb-1.5 uppercase tracking-wider">Activo a Trabajar:</span>
                                <p className="font-extrabold text-zinc-900 mb-1 text-xs">{req.assetName}</p>
                                <p className="text-zinc-600">"{req.description}"</p>
                              </div>

                              {/* HERRAMIENTAS TÉCNICAS (SOLO SI EL TRABAJO ESTÁ ACEPTADO O COTIZADO) */}
                              {(req.status === 'accepted' || req.status === 'quoted' || req.status === 'completed' || req.status === 'executing' || req.status === 'unforeseen' || req.status === 'unforeseen_paid') && (
                                <div className="space-y-4 pt-2">
                                  {/* SEGURIDAD: BOTÓN DE INICIO DE VISITA Y SOS */}
                                  {(req.status === 'accepted' || req.status === 'executing' || req.status === 'unforeseen' || req.status === 'unforeseen_paid') && (
                                    <div className="flex flex-wrap items-center gap-3 p-4 bg-zinc-900 rounded-2xl border border-zinc-800">
                                      {!req.visitStartedAt ? (
                                        <button
                                          onClick={() => handleStartVisit(req.id)}
                                          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
                                        >
                                          <MapPin className="w-3.5 h-3.5" />
                                          Iniciar Visita en Sitio
                                        </button>
                                      ) : (
                                        <>
                                          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-950/40 text-emerald-400 text-[9px] font-black uppercase rounded-lg border border-emerald-900/40">
                                            <Clock className="w-3 h-3" />
                                            Visita iniciada: {new Date(req.visitStartedAt).toLocaleTimeString()}
                                          </div>

                                          {req.status === 'accepted' && (
                                            <button
                                              onClick={() => handleStartJob(req.id)}
                                              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black uppercase rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
                                            >
                                              <Play className="w-3.5 h-3.5" />
                                              Comenzar Trabajo
                                            </button>
                                          )}

                                          {(req.status === 'executing' || req.status === 'unforeseen_paid') && (
                                            <>
                                              <button
                                                onClick={() => {
                                                  const reason = prompt("Describe el imprevisto detectado:");
                                                  const amount = prompt("Monto adicional requerido ($):");
                                                  if (reason && amount) handleTriggerUnforeseen(req.id, reason, Number(amount));
                                                }}
                                                className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-black uppercase rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
                                              >
                                                <AlertTriangle className="w-3.5 h-3.5" />
                                                Reportar Imprevisto
                                              </button>

                                              <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-100 font-bold text-[9px] animate-pulse">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                                Ejecución Activa
                                              </div>
                                            </>
                                          )}

                                          {!req.isPostponed ? (
                                            <button
                                              onClick={() => handlePostponeService(req.id)}
                                              className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-black uppercase rounded-xl transition-all shadow-md active:scale-95 cursor-pointer border border-zinc-700"
                                            >
                                              <Calendar className="w-3.5 h-3.5" />
                                              Continuar Mañana
                                            </button>
                                          ) : (
                                            <button
                                              onClick={() => handleResumeJob(req.id)}
                                              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black uppercase rounded-xl transition-all shadow-md active:scale-95 cursor-pointer border border-indigo-500 animate-pulse"
                                            >
                                              <Play className="w-3.5 h-3.5" />
                                              Reanudar (Día {(req.resumeCount || 1) + 1})
                                            </button>
                                          )}
                                        </>
                                      )}

                                      <a
                                        href="tel:104"
                                        className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-[10px] font-black uppercase rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
                                      >
                                        <AlertCircle className="w-3.5 h-3.5" />
                                        Botón SOS (Emergencia)
                                      </a>

                                      <div className="flex-grow text-right">
                                        <span className="text-[9px] text-zinc-500 font-bold uppercase block">Seguridad Activa</span>
                                        <span className="text-[8px] text-zinc-600 block leading-none">Visita monitoreada por GPS</span>
                                      </div>
                                    </div>
                                  )}

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* LISTA DE TAREAS (CHECKLIST) */}
                                    <div className="bg-zinc-50 border border-zinc-200 p-4 rounded-2xl space-y-3">
                                      <h5 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                                        <CheckCircle className="w-3.5 h-3.5 text-indigo-500" />
                                        Lista de Tareas del Servicio
                                      </h5>
                                      <div className="space-y-2">
                                        {req.checklist?.map((task) => (
                                          <label key={task.id} className="flex items-center gap-2.5 p-2 bg-white border border-zinc-150 rounded-xl cursor-pointer hover:bg-zinc-100 transition-all">
                                            <input
                                              type="checkbox"
                                              checked={task.isCompleted}
                                              onChange={(e) => handleUpdateChecklist(req.id, task.id, e.target.checked)}
                                              className="w-4 h-4 text-indigo-600 rounded border-zinc-300 focus:ring-indigo-500 cursor-pointer"
                                            />
                                            <span className={`text-[10px] font-bold ${task.isCompleted ? 'text-zinc-400 line-through' : 'text-zinc-700'}`}>
                                              {task.description}
                                            </span>
                                          </label>
                                        ))}
                                      </div>

                                      {/* Input para nueva tarea */}
                                      <div className="pt-2 flex gap-1.5">
                                        <input
                                          id={`task-desc-tech-${req.id}`}
                                          type="text"
                                          placeholder="Nueva tarea (ej: Cambio de bujías)..."
                                          className="flex-grow p-1.5 bg-white border border-zinc-300 rounded-lg text-[9px] font-bold focus:outline-indigo-500"
                                          onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                              const input = e.currentTarget;
                                              handleAddTaskToChecklist(req.id, input.value);
                                              input.value = '';
                                            }
                                          }}
                                        />
                                        <button
                                          onClick={() => {
                                            const input = document.getElementById(`task-desc-tech-${req.id}`) as HTMLInputElement;
                                            handleAddTaskToChecklist(req.id, input.value);
                                            input.value = '';
                                          }}
                                          className="p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all"
                                        >
                                          <Plus className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </div>

                                    {/* LISTA DE MATERIALES */}
                                    <div className="bg-zinc-50 border border-zinc-200 p-4 rounded-2xl space-y-3">
                                      <h5 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                                        <Layers className="w-3.5 h-3.5 text-indigo-500" />
                                        Insumos y Materiales
                                      </h5>
                                      <div className="space-y-2 max-h-[120px] overflow-y-auto pr-1">
                                        {req.materials?.length === 0 ? (
                                          <p className="text-[9px] text-zinc-400 text-center py-2">Sin materiales registrados</p>
                                        ) : (
                                          req.materials?.map((m, idx) => (
                                            <div key={idx} className="flex justify-between items-center p-2 bg-white border border-zinc-150 rounded-xl">
                                              <div className="flex flex-col">
                                                <span className="text-[10px] font-bold text-zinc-700">{m.name}</span>
                                                <span className="text-[9px] font-black text-emerald-600">${m.price.toFixed(2)}</span>
                                              </div>
                                              <button
                                                onClick={() => handleRemoveMaterial(req.id, idx)}
                                                className="p-1.5 text-zinc-400 hover:text-red-600 transition-colors cursor-pointer"
                                              >
                                                <Trash2 className="w-3.5 h-3.5" />
                                              </button>
                                            </div>
                                          ))
                                        )}
                                      </div>

                                      <div className="pt-2 flex gap-1.5">
                                        <input
                                          id={`mat-name-tech-${req.id}`}
                                          type="text"
                                          placeholder="Repuesto..."
                                          className="flex-grow p-1.5 bg-white border border-zinc-300 rounded-lg text-[9px] font-bold focus:outline-indigo-500"
                                        />
                                        <input
                                          id={`mat-price-tech-${req.id}`}
                                          type="number"
                                          placeholder="$0.00"
                                          className="w-16 p-1.5 bg-white border border-zinc-300 rounded-lg text-[9px] font-bold focus:outline-indigo-500"
                                        />
                                        <button
                                          onClick={() => {
                                            const name = (document.getElementById(`mat-name-tech-${req.id}`) as HTMLInputElement).value;
                                            const price = (document.getElementById(`mat-price-tech-${req.id}`) as HTMLInputElement).value;
                                            if(name && price) {
                                              handleAddMaterial(req.id, name, Number(price));
                                              (document.getElementById(`mat-name-tech-${req.id}`) as HTMLInputElement).value = '';
                                              (document.getElementById(`mat-price-tech-${req.id}`) as HTMLInputElement).value = '';
                                            }
                                          }}
                                          className="p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all cursor-pointer"
                                        >
                                          <Plus className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Action to formulate quote */}
                              {req.status === 'pending' && (
                                <div className="bg-zinc-100/90 p-5 rounded-2xl border border-zinc-200/80 space-y-3.5">
                                  <span className="text-xs font-black text-zinc-800 block uppercase tracking-wider">Enviar propuesta de cotización formal</span>
                                  
                                  <div className="flex items-center gap-3 flex-wrap">
                                    <div className="relative max-w-[150px] w-full">
                                      <span className="absolute left-3.5 top-2.5 text-xs text-zinc-400 font-black">$</span>
                                      <input
                                        type="number"
                                        placeholder="Precio"
                                        value={draftingBidRequestId === req.id ? bidPrice : ''}
                                        onChange={(e) => {
                                          setDraftingBidRequestId(req.id);
                                          setBidPrice(e.target.value);
                                        }}
                                        className="w-full pl-7 pr-3 py-2 border border-zinc-200 bg-white rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                                      />
                                    </div>

                                    <div className="relative max-w-[150px] w-full">
                                      <input
                                        type="date"
                                        value={draftingBidRequestId === req.id ? bidDate : ''}
                                        onChange={(e) => {
                                          setDraftingBidRequestId(req.id);
                                          setBidDate(e.target.value);
                                        }}
                                        className="w-full px-3 py-2 border border-zinc-200 bg-white rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                                      />
                                    </div>

                                    <div className="relative max-w-[120px] w-full">
                                      <input
                                        type="time"
                                        value={draftingBidRequestId === req.id ? bidTime : ''}
                                        onChange={(e) => {
                                          setDraftingBidRequestId(req.id);
                                          setBidTime(e.target.value);
                                        }}
                                        className="w-full px-3 py-2 border border-zinc-200 bg-white rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                                      />
                                    </div>

                                    <div className="relative max-w-[100px] w-full">
                                      <select
                                        value={draftingBidRequestId === req.id ? bidDuration : 1}
                                        onChange={(e) => {
                                          setDraftingBidRequestId(req.id);
                                          setBidDuration(Number(e.target.value));
                                        }}
                                        className="w-full px-3 py-2 border border-zinc-200 bg-white rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 appearance-none"
                                        title="Duración del Servicio"
                                      >
                                        <option value={0.5}>30m</option>
                                        <option value={1}>1h</option>
                                        <option value={1.5}>1.5h</option>
                                        <option value={2}>2h</option>
                                        <option value={3}>3h</option>
                                        <option value={4}>4h</option>
                                        <option value={8}>Todo el día</option>
                                      </select>
                                    </div>

                                    <div className="relative max-w-[100px] w-full">
                                      <select
                                        value={draftingBidRequestId === req.id ? bidTravelTime : 30}
                                        onChange={(e) => {
                                          setDraftingBidRequestId(req.id);
                                          setBidTravelTime(Number(e.target.value));
                                        }}
                                        className="w-full px-3 py-2 border border-zinc-200 bg-white rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-rose-500 text-gray-900 appearance-none"
                                        title="Tiempo de Viaje Estimado"
                                      >
                                        <option value={15}>15m Viaje</option>
                                        <option value={30}>30m Viaje</option>
                                        <option value={45}>45m Viaje</option>
                                        <option value={60}>1h Viaje</option>
                                        <option value={90}>1.5h Viaje</option>
                                      </select>
                                    </div>

                                    {draftingBidRequestId === req.id && bidPrice && (
                                      <div className="text-[10px] text-zinc-500 font-semibold space-x-3.5 shrink-0 bg-zinc-50 px-3 py-1 rounded-lg border border-zinc-100">
                                        <span>Comisión (15%): <strong className="text-red-600">${(Number(bidPrice) * 0.15).toFixed(2)}</strong></span>
                                        <span>Ganancia Neta: <strong className="text-emerald-700">${(Number(bidPrice) * 0.85).toFixed(2)}</strong></span>
                                      </div>
                                    )}

                                    <button
                                      onClick={() => handleSubmitBid(req.id)}
                                      className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer shadow-md shrink-0 ${
                                        (draftingBidRequestId === req.id && bidPrice)
                                          ? 'bg-indigo-600 hover:bg-indigo-700 text-white opacity-100'
                                          : 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
                                      }`}
                                    >
                                      Enviar Cotización
                                    </button>
                                    <button
                                      onClick={() => handleRejectRequest(req.id)}
                                      className="px-5 py-2.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 rounded-xl text-xs font-bold transition-all cursor-pointer"
                                    >
                                      Denegar Propuesta
                                    </button>
                                  </div>
                                </div>
                              )}

                              {req.status === 'accepted' && (
                                <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-100 flex items-center justify-between flex-wrap gap-3 animate-pulse">
                                  <div>
                                    <span className="text-xs font-extrabold text-emerald-950 block uppercase tracking-wide">¡Cliente aprobó el pago de garantía!</span>
                                    <p className="text-[11px] text-emerald-800 font-medium mt-0.5">El trabajo ya se encuentra en tu calendario. Visita la ubicación y presiona terminar para cobrar de inmediato.</p>
                                  </div>
                                  <button
                                    onClick={() => {
                                      setSelectedRequestForReport(req);
                                      setIsSignatureModalOpen(true);
                                    }}
                                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-sm cursor-pointer"
                                  >
                                    Completar Servicio Profesional
                                  </button>
                                </div>
                              )}

                              {req.price && (
                                <div className="flex justify-between text-xs pt-3 border-t border-zinc-100 flex-wrap gap-2 items-end">
                                  <div>
                                    <span className="text-zinc-400 font-semibold text-[10px] uppercase block">Precio Cotizado: </span>
                                    <span className="font-black text-zinc-900 text-sm block mt-0.5">${req.price.toFixed(2)}</span>
                                  </div>

                                  {(req.status === 'completed' || req.status === 'rated') && (
                                    <button
                                      onClick={() => {
                                        setSelectedRequestForReport(req);
                                        setIsReportModalOpen(true);
                                      }}
                                      className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-lg text-[10px] font-black uppercase transition-all"
                                    >
                                      <FileText className="w-3.5 h-3.5" />
                                      Ver Reporte
                                    </button>
                                  )}

                                  <div className="text-right">
                                    <span className="text-zinc-400 font-semibold text-[10px] uppercase block">Tus ingresos netos (85%): </span>
                                    <span className="font-black text-emerald-600 text-sm block mt-0.5">${req.technicianEarnings?.toFixed(2)}</span>
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

              {/* TAB 2: TECH AGENDA */}
              {techTab === 'agenda' && (
                <div className="space-y-6">
                  <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm">
                    <h2 className="text-sm font-black text-zinc-900 uppercase tracking-widest mb-2">Mi Agenda de Servicio - Maintly Panamá</h2>
                    <p className="text-[11px] text-zinc-400 font-medium mb-5">Mantenimientos programados organizados cronológicamente</p>

                    <div className="space-y-4">
                      {agenda.filter(a => a.techId === selectedTechProfileId).map((evt) => (
                        <div key={evt.id} className="p-4 border border-zinc-200 rounded-2xl bg-zinc-50/40 hover:bg-zinc-50/80 transition-all flex flex-wrap justify-between items-center gap-4 shadow-xs">
                          <div className="flex items-start gap-4">
                            <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-700 font-extrabold text-center min-w-[75px] shadow-xs">
                              <span className="block text-[8px] uppercase text-indigo-400 font-black tracking-wider">FECHA</span>
                              <span className="text-xs">{evt.date}</span>
                            </div>

                            <div>
                              <span className="text-[9px] text-zinc-400 font-bold block uppercase">Cliente: {evt.clientName}</span>
                              <h4 className="font-extrabold text-zinc-900 text-sm tracking-tight mt-0.5">{evt.title}</h4>
                              <div className="flex flex-wrap items-center gap-4 mt-2">
                                <div className="flex items-center gap-1.5 text-[10px] text-zinc-600 font-bold bg-white px-2 py-1 rounded-lg border border-zinc-100 shadow-xs">
                                  <Clock className="w-3.5 h-3.5 text-indigo-500" />
                                  <span>Labor: {evt.duration}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-[10px] text-zinc-600 font-bold bg-indigo-50/50 px-2 py-1 rounded-lg border border-indigo-100/50 shadow-xs">
                                  <Truck className="w-3.5 h-3.5 text-indigo-400" />
                                  <span>Viaje Estimado: {evt.travelTime || '30 min'}</span>
                                </div>
                                <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider ml-1">
                                  Inicia: {evt.time}
                                </div>
                              </div>

                              {/* Visual Timeline Bar */}
                              <div className="mt-3 h-1.5 w-48 bg-zinc-100 rounded-full overflow-hidden flex shadow-inner">
                                {(() => {
                                  const laborH = parseFloat(evt.duration) || 1;
                                  const travelH = (parseInt(evt.travelTime || '30')) / 60;
                                  const total = laborH + travelH;
                                  return (
                                    <>
                                      <div
                                        className="h-full bg-indigo-600"
                                        style={{ width: `${(laborH / total) * 100}%` }}
                                        title={`Labor: ${evt.duration}`}
                                      ></div>
                                      <div
                                        className="h-full bg-rose-400"
                                        style={{ width: `${(travelH / total) * 100}%` }}
                                        title={`Viaje: ${evt.travelTime}`}
                                      ></div>
                                    </>
                                  );
                                })()}
                              </div>
                            </div>
                          </div>

                          <div>
                            <span className={`px-3 py-1.5 text-xs font-black rounded-xl border ${
                              evt.status === 'completed'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : 'bg-amber-50 text-amber-800 border-amber-200 animate-pulse'
                            }`}>
                              {evt.status === 'completed' ? 'Realizado' : 'Pendiente / En Camino'}
                            </span>

                            {evt.status !== 'completed' && (
                              <button
                                onClick={() => {
                                  const newD = window.prompt("Nueva Fecha (YYYY-MM-DD):", evt.date);
                                  const newT = window.prompt("Nueva Hora (HH:MM):", evt.time);
                                  const reason = window.prompt("Motivo del cambio (obligatorio):");
                                  if (newD && newT && reason && evt.requestId) {
                                    handleRescheduleService(evt.requestId, newD, newT, reason);
                                  }
                                }}
                                className="block mt-2 text-[10px] font-black text-indigo-600 hover:text-indigo-800 uppercase tracking-wider text-right w-full"
                              >
                                [ Reprogramar ]
                              </button>
                            )}
                          </div>
                        </div>
                      ))}

                      {agenda.filter(a => a.techId === selectedTechProfileId).length === 0 && (
                        <p className="text-xs text-zinc-500 text-center py-8 font-medium">No tienes citas de servicio programadas en tu agenda de momento.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: PROFILE & MEMBERSHIP */}
              {techTab === 'profile' && (
                <div className="space-y-6">
                  <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm">
                    <div className="flex justify-between items-start flex-wrap gap-4 border-b border-zinc-100 pb-5 mb-5">
                      <div className="flex gap-4 items-center">
                        <div className="w-16 h-16 bg-gradient-to-tr from-indigo-500 to-indigo-800 text-white font-black flex items-center justify-center rounded-2xl text-xl shadow-md border border-indigo-400">
                          {getSelectedTechProfileObj()?.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <h3 className="text-base font-black text-zinc-900 tracking-tight">{getSelectedTechProfileObj()?.name}</h3>
                          <p className="text-xs text-indigo-600 font-bold uppercase tracking-wider mt-0.5">{getSelectedTechProfileObj()?.title}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <p className="text-[11px] text-zinc-400 font-medium flex items-center gap-1">
                              <MapPin className="w-3 h-3" /> {getSelectedTechProfileObj()?.location}
                            </p>
                            <p className="text-[11px] text-zinc-400 font-medium flex items-center gap-1">
                              <Briefcase className="w-3 h-3" /> {getSelectedTechProfileObj()?.experienceYears} años exp.
                            </p>
                            <p className="text-[11px] text-emerald-600 font-extrabold flex items-center gap-1">
                              <DollarSign className="w-3 h-3" /> ${getSelectedTechProfileObj()?.hourlyRate}/hr
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setIsEditingTechProfile(true)}
                          className="px-4 py-2 bg-zinc-900 hover:bg-black text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-md cursor-pointer active:scale-95"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          Editar Mi Perfil
                        </button>

                        <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 text-center min-w-[140px] shadow-xs">
                          <span className="text-[10px] uppercase font-black text-zinc-400 tracking-wider">Reputación</span>
                          <div className="flex items-center justify-center gap-1 font-black text-zinc-900 text-base mt-1">
                            <Star className="w-4.5 h-4.5 text-amber-500 fill-amber-500" />
                            {getSelectedTechProfileObj()?.rating}
                          </div>
                          <span className="text-[9px] text-zinc-400 font-semibold block mt-1">{getSelectedTechProfileObj()?.reviewCount} opiniones</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Qualifications & Certifications */}
                      <div className="space-y-4">
                        <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest">Información Profesional</h4>
                        <div>
                          <span className="text-[10px] text-zinc-400 uppercase tracking-wider block font-bold">Reseña Biográfica:</span>
                          <p className="text-xs text-zinc-600 italic mt-1.5 bg-zinc-50 p-4 rounded-xl border border-zinc-100 leading-relaxed">"{getSelectedTechProfileObj()?.bio}"</p>
                        </div>
                        <div>
                          <span className="text-[10px] text-zinc-400 uppercase tracking-wider block font-bold mb-2">Diplomas & Certificaciones:</span>
                          <div className="space-y-1.5">
                            {getSelectedTechProfileObj()?.certifications.map((c, i) => (
                              <div key={i} className="flex items-center gap-2 text-xs text-zinc-800 font-bold">
                                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                                {c}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Business Membership Section */}
                      <div className="p-6 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black text-white rounded-2xl shadow-lg border border-zinc-800 space-y-4">
                        <div className="flex justify-between items-center flex-wrap gap-2">
                          <span className="text-[9px] bg-indigo-500/15 text-indigo-300 font-black px-2.5 py-1 rounded-full uppercase border border-indigo-500/30">
                            Modelo de Negocio
                          </span>
                          
                          <span className="text-xs text-indigo-200">Emprendedores PRO</span>
                        </div>

                        <div>
                          <p className="text-xs text-zinc-350 leading-relaxed font-semibold">
                            Mantech ofrece un programa de membresía anual/mensual para técnicos que garantiza más solicitudes y visibilidad destacada en la plataforma:
                          </p>
                        </div>

                        <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex justify-between items-center gap-3">
                          <div>
                            <span className="block text-[8px] text-zinc-400 uppercase font-black">Tu programa actual:</span>
                            <span className="text-xs font-black text-white block mt-0.5">
                              {getSelectedTechProfileObj()?.plan === 'premium' ? 'Plan Premium ($8/mes - Ilimitado)' : 'Plan Básico (Gratuito - 3 solicitudes max)'}
                            </span>
                          </div>

                          <button
                            onClick={() => handleToggleTechPlan(selectedTechProfileId)}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                          >
                            {getSelectedTechProfileObj()?.plan === 'premium' ? 'Bajar a Básico' : 'Subir a Premium'}
                          </button>
                        </div>

                        <div className="text-[10px] text-zinc-400/90 leading-relaxed">
                          * El Plan Premium tiene un costo de **$8.00 mensuales** (o un pago anual equivalente). Incluye solicitudes ilimitadas y prioridad en el Marketplace.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: TECH CHAT */}
              {techTab === 'chat' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Active Chat Channels List */}
                    <div className="bg-white rounded-2xl border border-zinc-200 p-5 space-y-2 h-[500px] overflow-y-auto shadow-sm">
                      <h3 className="text-xs font-black text-zinc-400 uppercase mb-4 tracking-widest">Mensajes de Clientes</h3>
                      
                      {requests.filter(r => r.techId === selectedTechProfileId && ['quoted', 'accepted', 'executing', 'unforeseen', 'unforeseen_paid', 'completed'].includes(r.status)).length === 0 ? (
                        <p className="text-[11px] text-zinc-400 font-medium">Sin hilos de conversación activos con clientes.</p>
                      ) : (
                        requests
                          .filter(r => r.techId === selectedTechProfileId && ['quoted', 'accepted', 'executing', 'unforeseen', 'unforeseen_paid', 'completed'].includes(r.status))
                          .map((r) => (
                            <button
                              key={r.id}
                              onClick={() => setActiveChatRequestId(r.id)}
                              className={`w-full text-left p-3 rounded-xl border text-xs transition-all cursor-pointer ${
                                activeChatRequestId === r.id
                                  ? 'border-indigo-600 border-indigo-500 bg-indigo-50/70 text-indigo-900 font-black'
                                  : 'border-transparent text-zinc-600 hover:bg-zinc-50'
                              }`}
                            >
                              <div className="truncate font-bold">{r.clientName}</div>
                              <div className="text-[10px] text-zinc-400 truncate mt-0.5">{r.assetName}</div>
                            </button>
                          ))
                      )}
                    </div>

                    <div className="md:col-span-3">
                      <SupportChatWidget
                        request={requests.find(r => r.id === activeChatRequestId) || null}
                        role="tech"
                        techName={getSelectedTechProfileObj()?.name || 'Técnico'}
                        onSendMessage={handleSendMessage}
                        messages={chatMessages.filter(m => m.requestId === activeChatRequestId)}
                      />
                    </div>
                  </div>
                </div>
              )}
              {/* TAB 5: TECH SETTINGS */}
              {techTab === 'settings' && (
                <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm max-w-xl mx-auto">
                  <h2 className="text-sm font-black text-zinc-900 uppercase tracking-widest mb-6 text-center">Configuración de Técnico</h2>

                  <form onSubmit={handleUpdateProfile} className="space-y-6">
                    {/* Avatar Upload */}
                    <div className="flex flex-col items-center gap-3">
                      <div className="relative group">
                        <div className="w-24 h-24 rounded-full bg-indigo-50 border-4 border-white shadow-md overflow-hidden flex items-center justify-center">
                          {updatePhoto || profileImage ? (
                            <img src={updatePhoto || profileImage} alt="Preview" className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-10 h-10 text-indigo-300" />
                          )}
                        </div>
                        <label className="absolute bottom-0 right-0 p-1.5 bg-indigo-600 text-white rounded-full cursor-pointer shadow-lg hover:bg-indigo-700 transition-all">
                          <Camera className="w-4 h-4" />
                          <input type="file" className="hidden" accept="image/*" onChange={handlePhotoSelect} />
                        </label>
                      </div>
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Foto Profesional</span>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-black text-zinc-500 block">Nombre Profesional</label>
                        <input
                          type="text"
                          value={updateName}
                          onChange={(e) => setUpdateName(e.target.value)}
                          placeholder={loggedInName}
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

                      {/* RÉCORD POLICIVO Y POLÍTICAS */}
                      <div className="bg-indigo-50 border border-indigo-100 p-5 rounded-2xl space-y-4 mb-4">
                        <h4 className="text-[10px] font-black text-indigo-900 uppercase tracking-widest flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4" />
                          Documentación y Políticas Técnicas
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <a
                            href="https://www.panamadigital.gob.pa/"
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white text-[10px] font-black uppercase rounded-xl hover:bg-indigo-700 transition-all shadow-md"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            Generar Record Policivo
                          </a>
                          <div className="bg-white/50 p-2 rounded-lg border border-indigo-200 text-[8px] text-indigo-800 font-bold italic text-center flex items-center justify-center">
                            Tiempo de solicitud: 24 a 48 horas.
                          </div>
                        </div>

                        <div className="bg-white/70 p-4 rounded-xl border border-indigo-200 space-y-2">
                          <h5 className="text-[9px] font-black text-indigo-900 uppercase tracking-wider">Políticas de Cumplimiento</h5>
                          <ul className="space-y-1.5 text-[8.5px] text-indigo-950 font-medium">
                            <li>• Si no concluyes el trabajo, solo recibirás el <strong>5%</strong> del valor inicial.</li>
                            <li>• Si el cliente cancela al 50% de avance por presupuesto, se liquida lo realizado.</li>
                            <li>• Los imprevistos deben reportarse y aprobarse para que la garantía sea válida.</li>
                            <li>• Solo puedes editar/eliminar insumos y materiales.</li>
                          </ul>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isUpdating}
                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase transition-all disabled:opacity-50"
                      >
                        {isUpdating ? 'Actualizando...' : 'Guardar Cambios'}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </>
          )}

        </main>
        </div>

        {/* High fidelity Native Bottom Navigation Bar - Visible only on Mobile */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-200 py-1.5 px-3 flex justify-between items-center gap-1 z-40 shadow-lg">
          {role === 'client' ? (
            <>
              <button onClick={() => setClientTab('dashboard')} className={`flex-1 flex flex-col items-center justify-center p-0.5 font-bold ${clientTab === 'dashboard' ? 'text-indigo-600 font-extrabold' : 'text-zinc-400'}`}>
                <LayoutDashboard className="w-4 h-4" />
                <span className="text-[7.5px] uppercase mt-0.5">Equipos</span>
              </button>
              <button onClick={() => setClientTab('ai')} className={`flex-1 flex flex-col items-center justify-center p-0.5 font-bold ${clientTab === 'ai' ? 'text-indigo-600 font-extrabold' : 'text-zinc-400'}`}>
                <Bot className="w-4 h-4 animate-pulse text-indigo-500" />
                <span className="text-[7.5px] uppercase mt-0.5">IA</span>
              </button>
              <button onClick={() => setClientTab('marketplace')} className={`flex-1 flex flex-col items-center justify-center p-0.5 font-bold ${clientTab === 'marketplace' ? 'text-indigo-600 font-extrabold' : 'text-zinc-400'}`}>
                <Store className="w-4 h-4" />
                <span className="text-[7.5px] uppercase mt-0.5">Técnicos</span>
              </button>
              <button onClick={() => setClientTab('quotes')} className={`flex-1 flex flex-col items-center justify-center p-0.5 font-bold ${clientTab === 'quotes' ? 'text-indigo-600 font-extrabold' : 'text-zinc-400'}`}>
                <FileCheck2 className="w-4 h-4" />
                <span className="text-[7.5px] uppercase mt-0.5">Ofertas</span>
              </button>
              <button onClick={() => setClientTab('chat')} className={`flex-1 flex flex-col items-center justify-center p-0.5 font-bold ${clientTab === 'chat' ? 'text-indigo-600 font-extrabold' : 'text-zinc-400'}`}>
                <MessageSquare className="w-4 h-4" />
                <span className="text-[7.5px] uppercase mt-0.5">Chat</span>
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setTechTab('received')} className={`flex-1 flex flex-col items-center justify-center p-0.5 font-bold ${techTab === 'received' ? 'text-indigo-600 font-extrabold' : 'text-zinc-400'}`}>
                <FileCheck2 className="w-4 h-4" />
                <span className="text-[7.5px] uppercase mt-0.5">Inbox</span>
              </button>
              <button onClick={() => setTechTab('agenda')} className={`flex-1 flex flex-col items-center justify-center p-0.5 font-bold ${techTab === 'agenda' ? 'text-indigo-600 font-extrabold' : 'text-zinc-400'}`}>
                <CalendarDays className="w-4 h-4" />
                <span className="text-[7.5px] uppercase mt-0.5">Citas</span>
              </button>
              <button onClick={() => setTechTab('profile')} className={`flex-1 flex flex-col items-center justify-center p-0.5 font-bold ${techTab === 'profile' ? 'text-indigo-600 font-extrabold' : 'text-zinc-400'}`}>
                <Users className="w-4 h-4" />
                <span className="text-[7.5px] uppercase mt-0.5">Perfil</span>
              </button>
              <button onClick={() => setTechTab('chat')} className={`flex-1 flex flex-col items-center justify-center p-0.5 font-bold ${techTab === 'chat' ? 'text-indigo-600 font-extrabold' : 'text-zinc-400'}`}>
                <MessageSquare className="w-4 h-4" />
                <span className="text-[7.5px] uppercase mt-0.5">Chat</span>
              </button>
            </>
          )}
        </div>

      </div>

      {/* FOOTER */}
      <footer className="bg-white border-t border-zinc-200 py-8 mt-12 text-center text-xs text-zinc-400 space-y-1.5 px-4 shadow-inner">
        <p className="font-bold text-zinc-700 text-zinc-800">Maintly - Intermediario Inteligente de Mantenimiento Residencial, Comercial e Infraestructura TI</p>
        <p className="font-medium text-zinc-500">Copyright © 2026 Maintly LLC. Todos los derechos reservados.</p>
      </footer>

      {/* ASSET REGISTRATION MODAL */}
      <AssetRegisterModal
        isOpen={isAssetModalOpen}
        onClose={() => {
          setIsAssetModalOpen(false);
          setAssetToEdit(null);
        }}
        onAdd={handleAddAsset}
        editingAsset={assetToEdit}
      />

      {/* TECH PROFILE VIEW MODAL */}
      <TechnicianProfileModal
        tech={activeTechForModal}
        isOpen={isTechModalOpen}
        onClose={() => {
          setIsTechModalOpen(false);
          setPrefilledDescription(''); // Limpiar al cerrar
        }}
        assets={assets}
        onRequestQuote={handleRequestQuote}
        prefilledDescription={prefilledDescription}
      />

      {isEditingTechProfile && (
        <TechnicianEditProfileModal
          isOpen={isEditingTechProfile}
          onClose={() => setIsEditingTechProfile(false)}
          profile={getSelectedTechProfileObj()}
          onSave={handleUpdateTechProfile}
        />
      )}

      {selectedRequestForReport && (
        <ServiceReportModal
          isOpen={isReportModalOpen}
          onClose={() => {
            setIsReportModalOpen(false);
            setSelectedRequestForReport(null);
          }}
          request={selectedRequestForReport}
        />
      )}

      {/* SIGNATURE & RATING CAPTURE MODAL */}
      {isSignatureModalOpen && selectedRequestForReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-zinc-100 flex flex-col">
            <div className="p-6 border-b border-zinc-100 text-center bg-zinc-50">
              <h3 className="text-lg font-black text-zinc-900 uppercase tracking-tight">Cierre de Garantía en Sitio</h3>
              <p className="text-[11px] text-zinc-500 font-medium">El cliente debe firmar y calificar para liberar el pago.</p>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto">
              {/* Rating Section */}
              <div className="space-y-3 text-center">
                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">¿Cómo califica el servicio hoy?</span>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRatingVal(star)}
                      className="transition-transform active:scale-125"
                    >
                      <Star className={`w-8 h-8 ${ratingVal >= star ? 'fill-amber-500 text-amber-500' : 'text-zinc-200'}`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Signature Section */}
              <div className="space-y-2">
                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block text-center">Firma de Conformidad del Cliente</span>
                <SignaturePad
                  onSave={(signatureData) => handleCompleteJob(selectedRequestForReport.id, signatureData)}
                  onCancel={() => setIsSignatureModalOpen(false)}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LIVE MULTICHANNEL ALERTS SIMULATOR MODAL */}
      {testNotification && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 select-none animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-zinc-200 overflow-hidden flex flex-col shadow-2xl relative max-h-[90vh] md:max-h-[95vh]">
            
            {/* Header */}
            <div className="bg-gradient-to-r from-zinc-900 to-indigo-950 text-white p-5 pr-12 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-indigo-500/20 rounded-xl border border-indigo-400/30 text-indigo-400 animate-pulse">
                  <BellRing className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm uppercase tracking-wide">Centro de Despacho de Correo & Celular</h3>
                  <p className="text-[10px] text-zinc-300 font-medium">Notificaciones en tiempo real para mantenimiento de tus activos</p>
                </div>
              </div>
              
              <button 
                onClick={() => setTestNotification(null)}
                className="absolute top-4 right-4 text-zinc-400 hover:text-white hover:bg-white/10 rounded-xl p-2 transition-all text-sm font-semibold cursor-pointer"
                title="Cerrar Centro de Alertas"
              >
                ✕
              </button>
            </div>

            {/* Explanation & Tabs */}
            <div className="p-4 bg-zinc-50 border-b border-zinc-200 flex flex-col md:flex-row justify-between items-center gap-3">
              <div className="text-[10px] text-zinc-500 leading-normal max-w-md">
                💡 <span className="font-bold text-zinc-800">¿Cómo opera?</span> Este módulo transmite un correo electrónico HTML real configurado con tu remitente de marcas o SMTP de Gmail, además de emitir notificaciones push web directas al celular.
              </div>
              
              <div className="flex bg-zinc-200/80 p-0.5 rounded-xl border border-zinc-300/40 shrink-0">
                <button
                  type="button"
                  onClick={() => setNotificationSimTab('push')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                    notificationSimTab === 'push' ? 'bg-white text-zinc-950 shadow-sm' : 'text-zinc-600 hover:text-zinc-950'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5 text-indigo-600" />
                  Alerta Móvil (Push)
                </button>
                <button
                  type="button"
                  onClick={() => setNotificationSimTab('email')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                    notificationSimTab === 'email' ? 'bg-white text-zinc-950 shadow-sm' : 'text-zinc-600 hover:text-zinc-950'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5 text-indigo-600" />
                  Correo Recibido
                </button>
              </div>
            </div>

            {/* Live Delivery Status Grid */}
            <div className="bg-indigo-950 text-white px-5 py-3 border-b border-indigo-900 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs select-none">
              <div className="flex items-center space-x-2.5">
                <span className="flex h-2.5 w-2.5 relative shrink-0">
                  {pushPermissionStatus === 'granted' ? (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  ) : null}
                  <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${pushPermissionStatus === 'granted' ? 'bg-emerald-500' : (pushPermissionStatus === 'denied' ? 'bg-rose-500' : 'bg-amber-500')}`}></span>
                </span>
                <div>
                  <p className="font-extrabold uppercase tracking-wide text-[9px] text-indigo-300">📱 Estado de Alerta Push Móvil</p>
                  <p className="text-[10px] text-zinc-200 font-bold leading-tight">
                    {pushPermissionStatus === 'granted' && "¡Activo! Alerta push real enviada al sistema operativo"}
                    {pushPermissionStatus === 'denied' && "Bloqueado. Otorga permisos de notificaciones al navegador"}
                    {pushPermissionStatus === 'default' && "Permiso pendiente. Otorga acceso para notificaciones push"}
                    {pushPermissionStatus && pushPermissionStatus !== 'granted' && pushPermissionStatus !== 'denied' && pushPermissionStatus !== 'default' && "No soportado en este visor iframe"}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2.5 border-t md:border-t-0 md:border-l border-indigo-900 pt-2.5 md:pt-0 md:pl-4">
                <span className="flex h-2.5 w-2.5 relative shrink-0">
                  {emailSentStatus === 'sending' ? (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  ) : null}
                  <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                    emailSentStatus.startsWith('sent') ? 'bg-emerald-400' : (emailSentStatus === 'error' ? 'bg-rose-500' : 'bg-amber-400')
                  }`}></span>
                </span>
                <div>
                  <p className="font-extrabold uppercase tracking-wide text-[9px] text-indigo-300">📧 Bandeja de Entrada ({loggedInEmail || 'rubenabregoc@gmail.com'})</p>
                  <p className="text-[10px] text-zinc-200 font-bold leading-tight">
                    {emailSentStatus === 'idle' && "En espera..."}
                    {emailSentStatus === 'sending' && "Comunicando con SMTP y enviando correo HTML..."}
                    {emailSentStatus === 'sent-demo' && "¡Entregado! Revisa el visor interactivo de abajo"}
                    {emailSentStatus === 'sent-real' && "¡Correo real enviado con éxito!"}
                    {emailSentStatus === 'error' && `Error: ${lastEmailError}`}
                  </p>
                </div>
              </div>
            </div>

            {/* Simulated Workspace Area */}
            <div className="p-6 overflow-y-auto bg-zinc-100/50 flex flex-col justify-center items-center min-h-[380px]">
              
              {notificationSimTab === 'push' ? (
                /* SMARTPHONE LOCK SCREEN MOCKUP */
                <div className="w-full max-w-[320px] bg-black rounded-[40px] p-2.5 border-[8px] border-zinc-800 shadow-xl relative overflow-hidden select-none">
                  {/* Notch */}
                  <div className="absolute top-1 left-1/2 -translate-x-1/2 w-20 h-4 bg-black rounded-b-xl z-50 flex items-center justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-900 block shrink-0"></span>
                  </div>
                  
                  {/* Lock Screen Wallpaper */}
                  <div className="bg-gradient-to-b from-indigo-950 via-zinc-900 to-black rounded-[30px] p-4 pt-10 min-h-[320px] flex flex-col justify-between relative text-white">
                    {/* Time */}
                    <div className="text-center space-y-1">
                      <span className="block text-3xl font-black tracking-tight text-white/90">08:00</span>
                      <span className="block text-[8px] text-zinc-400 font-bold uppercase tracking-wider">Sábado, 21 de Junio</span>
                    </div>

                    {/* Smartphone Push Notification Card */}
                    <div className="my-auto bg-black/75 backdrop-blur-md rounded-2xl border border-white/10 p-3 shadow-2xl relative select-none animate-[bounce_0.6s_ease-out_1]">
                      <div className="flex items-start space-x-2.5">
                        <div className="w-6 h-6 shrink-0 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white border border-indigo-400/40 shadow-md">
                          <span className="text-[10px] font-black">M</span>
                        </div>
                        <div className="flex-1 space-y-1 text-left">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-extrabold text-white">MantechPro</span>
                            <span className="text-[8px] text-zinc-500 font-bold">ahora</span>
                          </div>
                          <h4 className="text-[11px] font-black text-indigo-300 leading-tight">🚨 Alerta Preventiva: {testNotification.assetName}</h4>
                          <p className="text-[10px] text-zinc-300 leading-tight font-medium">Su equipo requiere {testNotification.dueDate || 'atención'}. Presione para cotizar automáticamente.</p>
                        </div>
                      </div>
                      
                      {/* Interactive Trigger Button inside Phone */}
                      <button 
                        onClick={() => {
                          setClientTab('marketplace');
                          setTestNotification(null);
                        }}
                        className="w-full mt-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[9px] font-black uppercase tracking-wider text-center transition-all cursor-pointer shadow-sm active:scale-95"
                      >
                        ⚡ Cotizar con 1-Clic
                      </button>
                    </div>

                    {/* Bottom unlock swipe indicator */}
                    <div className="text-center pb-1">
                      <span className="text-[8px] text-zinc-500 font-semibold animate-pulse block">Swipe up to unlock 🔒</span>
                      <div className="w-20 h-0.5 bg-zinc-700 mx-auto mt-1 rounded-full"></div>
                    </div>
                  </div>
                </div>
              ) : (
                /* INBOX EMAIL CLIENT PREVIEW */
                <div className="w-full bg-white rounded-2xl border border-zinc-200 shadow-lg flex flex-col overflow-hidden text-zinc-800 max-h-[85vh]">
                  {/* Email Browser Header */}
                  <div className="bg-zinc-100 p-3.5 border-b border-zinc-200 shrink-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="w-3 h-3 rounded-full bg-red-400 block shrink-0"></span>
                        <span className="w-3 h-3 rounded-full bg-yellow-400 block shrink-0"></span>
                        <span className="w-3 h-3 rounded-full bg-green-400 block shrink-0"></span>
                      </div>
                      <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest font-mono">Panel de Envío & Destinatarios</span>
                      <button 
                        onClick={() => setShowSmtpInstructions(!showSmtpInstructions)}
                        className="text-[10px] bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 font-extrabold px-2 py-1 rounded-lg transition-all"
                      >
                        {showSmtpInstructions ? "✕ Cerrar Guía SMTP" : "⚙️ Configurar Gmail/SMTP Real"}
                      </button>
                    </div>
                  </div>

                  {/* Scrollable Content Body */}
                  <div className="overflow-y-auto flex-1 custom-scrollbar">
                    <div className="p-4 space-y-4">
                      <div className="space-y-2 text-xs text-left">
                        <p>
                          <span className="font-bold text-zinc-500">De:</span>{' '}
                          <span className="font-bold text-indigo-700 font-mono">
                            {smtpUser && smtpPass ? smtpUser : 'alerts-simulated@mantechpro.com'}
                          </span>{' '}
                          {smtpUser && smtpPass ? (
                            <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 font-extrabold text-[10px] px-2 py-0.5 rounded-full ml-1.5 align-middle">
                              ✓ Gmail Real Conectado
                            </span>
                          ) : (
                            <span className="text-amber-700 bg-amber-50 border border-amber-200 font-extrabold text-[10px] px-2 py-0.5 rounded-full ml-1.5 align-middle animate-pulse">
                              ⚠️ Simulador Activo
                            </span>
                          )}
                        </p>

                        <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 py-0.5">
                          <span className="font-bold text-zinc-400 shrink-0">Para (Cualquier Correo Cliente):</span>
                          <div className="flex gap-1.5 w-full">
                            <input
                              type="email"
                              value={customEmailInput}
                              onChange={(e) => setCustomEmailInput(e.target.value)}
                              placeholder="Introduce tu Gmail personal u otro..."
                              className="bg-white border border-zinc-300 rounded-lg px-2.5 py-1 text-xs text-zinc-800 font-extrabold focus:outline-indigo-600 w-full"
                            />
                            <button
                              type="button"
                              onClick={() => triggerSimulatedNotification()}
                              disabled={emailSentStatus === 'sending'}
                              className="bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white px-3.5 py-1 rounded-lg text-xs leading-none font-extrabold transition-all shrink-0 cursor-pointer disabled:opacity-40"
                            >
                              {emailSentStatus === 'sending' ? 'Enviando...' : 'Re-enviar Correo'}
                            </button>
                          </div>
                        </div>

                        {(!smtpUser || !smtpPass) && (
                          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-[11px] text-amber-900 mt-2 space-y-1">
                            <p className="font-extrabold text-amber-900 flex items-center gap-1">⚠️ ATENCIÓN: Correo Real de Gmail Desconectado</p>
                            <p className="font-medium text-amber-900">
                              Como todavía no has ingresado la contraseña de aplicaciones de 16 caracteres, el sistema está usando un simulador virtual.
                              <strong> Genera tu clave en Google, ingrésala en la sección de abajo y te llegará el correo real al instante.</strong>
                            </p>
                          </div>
                        )}

                        <p className="border-t border-zinc-200/60 pt-1.5"><span className="font-bold text-zinc-500">Asunto:</span> <span className="font-black text-zinc-900">⚠️ Atención Requerida: Alerta Crítica para tu Activo {testNotification.assetName}</span></p>
                      </div>

                      {/* Collapsible Step-by-Step SMTP Guide & Dynamic Admin Form */}
                      {showSmtpInstructions && (
                        <div className="bg-zinc-900 text-white p-5 rounded-2xl border border-zinc-800 text-xs text-left leading-relaxed space-y-4">
                          <h4 className="font-black text-indigo-400 text-sm flex items-center gap-1.5">🚀 Configuración de Servidor de Correo Propio (SMTP)</h4>
                          <p className="text-zinc-300">
                            Configura tu cuenta de <strong>Gmail</strong> u otro proveedor de correo aquí mismo de manera real. Las credenciales se auto-guardan de forma segura en tu navegador local y se usarán para enviar correos directamente a tus clientes reales:
                          </p>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-zinc-950 p-4 rounded-xl border border-zinc-800">
                            <div className="space-y-1">
                              <label className="block text-[10px] font-bold text-zinc-400 uppercase">Correo Remitente (SMTP User)</label>
                              <input
                                type="email"
                                value={smtpUser}
                                onChange={(e) => {
                                  const u = e.target.value;
                                  setSmtpUser(u);
                                  localStorage.setItem('mantechpro_smtp_user', u);
                                }}
                                placeholder="ejemplo@gmail.com"
                                className="w-full bg-zinc-900 border border-zinc-700/80 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-indigo-500 font-mono"
                              />
                            </div>
                            <div className="space-y-1">
                              <div className="flex justify-between items-center">
                                <label className="block text-[10px] font-bold text-zinc-400 uppercase">Contraseña de Aplicación (SMTP Pass)</label>
                                <button
                                  type="button"
                                  onClick={() => setShowSmtpPasswordText(!showSmtpPasswordText)}
                                  className="text-[9px] text-indigo-400 hover:underline font-extrabold cursor-pointer"
                                >
                                  {showSmtpPasswordText ? "Ocultar" : "Mostrar"}
                                </button>
                              </div>
                              <input
                                type={showSmtpPasswordText ? "text" : "password"}
                                value={smtpPass}
                                onChange={(e) => {
                                  const p = e.target.value;
                                  setSmtpPass(p);
                                  localStorage.setItem('mantechpro_smtp_pass', p);
                                }}
                                placeholder="16 letras..."
                                className="w-full bg-zinc-900 border border-zinc-700/80 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-indigo-500 font-mono"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="block text-[10px] font-bold text-zinc-400 uppercase">Host SMTP</label>
                              <input
                                type="text"
                                value={smtpHost}
                                onChange={(e) => {
                                  const h = e.target.value;
                                  setSmtpHost(h);
                                  localStorage.setItem('mantechpro_smtp_host', h);
                                }}
                                placeholder="smtp.gmail.com"
                                className="w-full bg-zinc-900 border border-zinc-700/80 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-indigo-500 font-mono"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="block text-[10px] font-bold text-zinc-400 uppercase">Puerto SMTP</label>
                              <input
                                type="text"
                                value={smtpPort}
                                onChange={(e) => {
                                  const pr = e.target.value;
                                  setSmtpPort(pr);
                                  localStorage.setItem('mantechpro_smtp_port', pr);
                                }}
                                placeholder="587"
                                className="w-full bg-zinc-900 border border-zinc-700/80 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-indigo-500 font-mono"
                              />
                            </div>
                            <div className="space-y-1 sm:col-span-2 font-sans">
                              <label className="block text-[10px] font-bold text-zinc-400 uppercase">Nombre Del Remitente (SMTP From)</label>
                              <input
                                type="text"
                                value={smtpFrom}
                                onChange={(e) => {
                                  const f = e.target.value;
                                  setSmtpFrom(f);
                                  localStorage.setItem('mantechpro_smtp_from', f);
                                }}
                                placeholder="MantechPro Alertas <alertas@mantechpro.com>"
                                className="w-full bg-zinc-900 border border-zinc-700/80 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-indigo-500"
                              />
                            </div>
                          </div>

                          <div className="bg-zinc-800 p-4 rounded-xl border border-zinc-800 text-[11px] text-zinc-300">
                            💡 <strong>¿Cómo obtener tu clave de 16 letras?</strong>
                            <ol className="list-decimal pl-4 mt-2 space-y-1.5">
                              <li>Entra a tu <a href="https://myaccount.google.com/" target="_blank" rel="noreferrer" className="text-indigo-400 underline font-extrabold hover:text-indigo-350">Cuenta de Google</a>.</li>
                              <li>Activa la <strong>Verificación en 2 pasos</strong> en la pestaña Seguridad.</li>
                              <li>Busca <strong>Contraseñas de aplicaciones</strong> y genera una nueva clave.</li>
                              <li>Copia las <strong>16 letras amarillas</strong> y pégalas arriba en <strong>SMTP Pass</strong>.</li>
                            </ol>
                          </div>

                          <div className="flex justify-between items-center pt-2">
                            <span className="text-[10px] text-emerald-400 font-bold">✓ Guardado automático</span>
                            <button
                              onClick={() => {
                                saveSmtpSettings(smtpUser, smtpPass, smtpHost, smtpPort, smtpSecure, smtpFrom);
                                setShowSmtpInstructions(false);
                              }}
                              className="bg-indigo-600 text-white font-extrabold px-3.5 py-1.5 rounded-lg text-xs hover:bg-indigo-500 transition-all cursor-pointer"
                            >
                              Guardar & Cerrar
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Sending Notification Loop Tracker */}
                      {emailSentStatus === 'sending' && (
                        <div className="bg-indigo-50 border-y border-indigo-200 px-6 py-4.5 text-center text-xs text-indigo-950 flex flex-col items-center justify-center gap-2 animate-pulse rounded-xl">
                          <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                          <p className="font-extrabold text-indigo-900 text-sm">Enviando Correo Real por SMTP...</p>
                        </div>
                      )}

                      {/* Live Email Dispatch Alert Banner */}
                      {emailSentStatus === 'sent-demo' && emailPreviewUrl ? (
                        <div className="bg-emerald-50 border-y border-emerald-300 px-6 py-4.5 text-center text-xs text-emerald-950 rounded-xl">
                          <p className="font-black text-sm mb-1 text-emerald-900">📬 ¡Correo de Demostración Enviado!</p>
                          <div className="flex flex-col sm:flex-row justify-center items-center gap-2 mt-3">
                            <a
                              href={emailPreviewUrl}
                              target="_blank"
                              referrerPolicy="no-referrer"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-5 py-2.5 rounded-xl transition-all shadow-sm active:scale-95 text-xs text-center border border-emerald-500"
                            >
                              <MailOpen className="w-4 h-4" />
                              Abrir Correo de Pruebas
                            </a>
                            <button
                              onClick={() => setShowSmtpInstructions(true)}
                              className="text-[11px] underline text-indigo-700 font-bold hover:text-indigo-950 cursor-pointer"
                            >
                              Configurar Gmail Real
                            </button>
                          </div>
                        </div>
                      ) : emailSentStatus === 'sent-real' ? (
                        <div className="bg-emerald-50 border-y border-emerald-300 px-6 py-4.5 text-center text-xs text-emerald-950 rounded-xl">
                          <p className="font-black text-sm mb-1 text-emerald-900">🚀 ¡Correo Real Recibido!</p>
                          <p className="font-bold text-emerald-800 leading-normal">Hemos enviado el correo a <strong className="text-emerald-950 underline">{customEmailInput}</strong>. ¡Revisa tu bandeja!</p>
                        </div>
                      ) : emailSentStatus === 'error' ? (
                        <div className="bg-rose-50 border-y border-rose-300 px-6 py-4.5 text-center text-xs text-rose-900 rounded-xl">
                          <p className="font-black text-sm mb-1 text-rose-900">❌ Error al Entregar Correo</p>
                          <p className="font-mono bg-zinc-900 text-rose-400 p-2 rounded-lg text-[10px] break-all border border-zinc-800 font-bold my-3">
                            Error: {lastEmailError}
                          </p>
                          <button
                            onClick={() => setShowSmtpInstructions(true)}
                            className="bg-rose-600 hover:bg-rose-700 text-white font-extrabold px-4 py-2 rounded-xl transition-all cursor-pointer text-xs shadow-sm active:scale-95 border border-rose-500"
                          >
                            🔧 Corregir Configuración
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  {/* Pure HTML Styled Email Mockup */}
                  <div className="p-6 bg-zinc-50 text-left space-y-5">
                    <div className="max-w-md mx-auto bg-white border border-zinc-100 p-6 rounded-2xl shadow-xs space-y-4">
                      {/* Brand Header */}
                      <div className="text-center border-b border-zinc-100 pb-4">
                        <span className="text-lg font-black tracking-tight text-zinc-950">Mantech<span className="text-indigo-600">Pro</span></span>
                        <span className="block text-[8px] text-zinc-400 uppercase font-black tracking-widest mt-0.5">Asistente de Activos</span>
                      </div>

                      {/* Body */}
                      <div className="space-y-3 text-xs leading-relaxed text-zinc-700 font-medium">
                        <p>Estimado/a <span className="font-extrabold text-zinc-900">Rubén Ábrego</span>,</p>
                        
                        <p>Nuestros registros automáticos de mantenimiento predictivo indican que tu activo <span className="font-extrabold text-indigo-600 text-indigo-700">{testNotification.assetName}</span> ha sobrepasado los parámetros seguros de uso recomendados.</p>
                        
                        <div className="bg-amber-50 rounded-xl p-3 border border-amber-200 text-[11px] text-amber-950 space-y-1">
                          <p className="font-extrabold">⚠️ ACCIÓN RECOMENDADA:</p>
                          <p className="font-medium">Es necesario programar un servicio técnico para prevenir deterioros mecánicos mayores u obstrucciones del sistema.</p>
                        </div>

                        <p>Hemos pre-filtrado los especialistas mejor evaluados disponibles en tu área residencial para coordinar esta atención inmediatamente a costes preferenciales de tarifa corporativa.</p>
                      </div>

                      {/* Call To Action Buttons */}
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setClientTab('marketplace');
                            setTestNotification(null);
                          }}
                          className="w-full block text-center bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold py-3 px-4 rounded-xl text-xs transition-all shadow-md shadow-indigo-100 active:scale-98 cursor-pointer"
                        >
                          ⚡ Agendar con 1-Clic
                        </button>
                        <span className="block text-center text-[9px] text-zinc-400 mt-2 font-bold select-none">
                          Se te redirigirá a MantechPro con las ofertas técnicas ya filtradas.
                        </span>
                      </div>
                      
                      <div className="border-t border-zinc-100 pt-4 text-[9px] text-zinc-400 space-y-1 text-center font-medium">
                        <p>MantechPro Inteligencia Preventiva • rubenabregoc@gmail.com</p>
                        <p>Para dejar de recibir alertas, haz clic en desasociar activo en la consola.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Footer buttons */}
            <div className="bg-zinc-50 px-6 py-4 border-t border-zinc-200 flex flex-col sm:flex-row justify-between items-center gap-3">
              <span className="text-[10px] text-zinc-400 font-bold">ID Transacción: {testNotification.id.slice(0, 8)}</span>
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => {
                    setClientTab('marketplace');
                    setTestNotification(null);
                  }}
                  className="flex-1 sm:flex-initial px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl text-xs transition-all cursor-pointer shadow-sm active:scale-95 text-center"
                >
                  Probar Enrutamiento (Ver Marketplace)
                </button>
                <button
                  type="button"
                  onClick={() => setTestNotification(null)}
                  className="flex-1 sm:flex-initial px-4 py-2 bg-zinc-200 hover:bg-zinc-300 text-zinc-700 font-black rounded-xl text-xs transition-all cursor-pointer text-center"
                >
                  Cerrar
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

