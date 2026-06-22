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
import SupportChatWidget from './components/SupportChatWidget';

import { 
  LayoutDashboard, 
  Store, 
  FileCheck2, 
  Bot, 
  MessageSquare, 
  CalendarDays, 
  Users, 
  DollarSign, 
  Bell, 
  CheckCircle, 
  Plus, 
  TrendingUp, 
  SlidersHorizontal, 
  Layers, 
  UserCheck, 
  ShieldCheck, 
  Info, 
  Star, 
  PhoneCall, 
  Mail, 
  MailOpen, 
  CheckCircle2, 
  UserX,
  Clock,
  Smartphone,
  Monitor,
  LogOut,
  Lock,
  AlertCircle,
  Sparkles,
  ChevronRight,
  Car,
  Wind,
  Zap,
  Award,
  ArrowRight,
  ShieldAlert,
  BellRing,
  Send
} from 'lucide-react';

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
      const response = await fetch('/api/send-email', {
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
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('mantech_is_logged') === 'true';
  });
  const [role, setRole] = useState<'client' | 'tech'>(() => {
    return (localStorage.getItem('mantech_logged_role') as 'client' | 'tech') || 'client';
  });
  const [loggedInEmail, setLoggedInEmail] = useState<string>(() => {
    return localStorage.getItem('mantech_logged_email') || '';
  });
  const [loggedInName, setLoggedInName] = useState<string>(() => {
    return localStorage.getItem('mantech_logged_name') || '';
  });

  // Login form temporary inputs
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [authTab, setAuthTab] = useState<'client' | 'tech'>('client');
  const [authError, setAuthError] = useState('');

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

  // Viewport mode selector: 'web' or 'android' simulation - AUTOMATICALLY DETECTED ONCE ON FIRST LOAD
  const [viewportMode, setViewportMode] = useState<'web' | 'android'>('web');
  const [isLargeScreen, setIsLargeScreen] = useState<boolean>(window.innerWidth >= 1150);
  
  useEffect(() => {
    // Initial detection on load
    const isMobileSize = window.innerWidth < 1024;
    const isMobileDevice = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
    if (isMobileSize || isMobileDevice) {
      setViewportMode('android');
    } else {
      setViewportMode('web');
    }

    setIsLargeScreen(window.innerWidth >= 1150);

    const handleResize = () => {
      setIsLargeScreen(window.innerWidth >= 1150);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const showMobileDeviceSimulator = viewportMode === 'android' && isLargeScreen;

  // Navigation for Client & Tech
  const [clientTab, setClientTab] = useState<'dashboard' | 'marketplace' | 'quotes' | 'ai' | 'chat'>('dashboard');
  const [techTab, setTechTab] = useState<'received' | 'agenda' | 'profile' | 'chat'>('received');

  // State
  const [assets, setAssets] = useState<Asset[]>([]);
  const [reminders, setReminders] = useState<MaintenanceReminder[]>([]);
  const [technicians, setTechnicians] = useState<TechProfile[]>([]);
  const [requests, setRequests] = useState<JobRequest[]>([]);
  const [agenda, setAgenda] = useState<AgendaEvent[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [selectedTechId, setSelectedTechId] = useState<string | null>(null);

  // Filter for Marketplace
  const [marketFilter, setMarketFilter] = useState<TechCategory | 'all'>('all');

  // Modals UI
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [isTechModalOpen, setIsTechModalOpen] = useState(false);
  const [activeTechForModal, setActiveTechForModal] = useState<TechProfile | null>(null);

  // Active chat session selector
  const [activeChatRequestId, setActiveChatRequestId] = useState<string | null>(null);

  // Bidding states (Technician drafts quote)
  const [bidPrice, setBidPrice] = useState<string>('');
  const [draftingBidRequestId, setDraftingBidRequestId] = useState<string | null>(null);

  // Review states (Client rates technician)
  const [ratingVal, setRatingVal] = useState<number>(5);
  const [ratingComment, setRatingComment] = useState<string>('');
  const [ratingRequestId, setRatingRequestId] = useState<string | null>(null);

  // Tech profile edit mock
  const [selectedTechProfileId, setSelectedTechProfileId] = useState<string>(() => {
    return localStorage.getItem('mantech_logged_tech_id') || 'tech-1';
  });

  // Initialize from LocalStorage or mock data
  useEffect(() => {
    const cachedAssets = localStorage.getItem('maintly_assets');
    const cachedReminders = localStorage.getItem('maintly_reminders');
    const cachedTechnicians = localStorage.getItem('maintly_technicians');
    const cachedRequests = localStorage.getItem('maintly_requests');
    const cachedAgenda = localStorage.getItem('maintly_agenda');
    const cachedChats = localStorage.getItem('maintly_chats');

    if (cachedAssets) setAssets(JSON.parse(cachedAssets));
    else setAssets(initialAssets);

    if (cachedReminders) setReminders(JSON.parse(cachedReminders));
    else setReminders(initialReminders);

    if (cachedTechnicians) setTechnicians(JSON.parse(cachedTechnicians));
    else setTechnicians(initialTechnicians);

    if (cachedRequests) setRequests(JSON.parse(cachedRequests));
    else setRequests(initialRequests);

    if (cachedAgenda) setAgenda(JSON.parse(cachedAgenda));
    else setAgenda(initialAgendaEvents);

    if (cachedChats) {
      setChatMessages(JSON.parse(cachedChats));
    } else {
      setChatMessages([
        {
          id: 'chat-init-1',
          requestId: 'req-101',
          sender: 'tech',
          text: 'Hola Rubén, ya revisé las especificaciones de tu Toyota Yaris. Con mucho gusto puedo hacer el cambio de aceite sintético utilizando filtros originales. ¿Qué día te queda cómodo hacer el servicio?',
          timestamp: '2026-06-19T11:00:00Z'
        },
        {
          id: 'chat-init-2',
          requestId: 'req-101',
          sender: 'client',
          text: 'Hola Carlos. Me parece excelente la cotización. Me convendría el lunes en la mañana si tienes disponibilidad.',
          timestamp: '2026-06-19T11:15:00Z'
        }
      ]);
    }
  }, []);

  // Sync to localStorage
  useEffect(() => {
    if (assets.length) localStorage.setItem('maintly_assets', JSON.stringify(assets));
  }, [assets]);
  useEffect(() => {
    if (reminders.length) localStorage.setItem('maintly_reminders', JSON.stringify(reminders));
  }, [reminders]);
  useEffect(() => {
    if (technicians.length) localStorage.setItem('maintly_technicians', JSON.stringify(technicians));
  }, [technicians]);
  useEffect(() => {
    if (requests.length) localStorage.setItem('maintly_requests', JSON.stringify(requests));
  }, [requests]);
  useEffect(() => {
    if (agenda.length) localStorage.setItem('maintly_agenda', JSON.stringify(agenda));
  }, [agenda]);
  useEffect(() => {
    if (chatMessages.length) localStorage.setItem('maintly_chats', JSON.stringify(chatMessages));
  }, [chatMessages]);

  // Client add asset
  const handleAddAsset = (newAssetData: Omit<Asset, 'id' | 'registeredAt'>) => {
    const newId = `asset-${Date.now()}`;
    const newAsset: Asset = {
      ...newAssetData,
      id: newId,
      registeredAt: new Date().toISOString().split('T')[0]
    };

    setAssets(prev => [newAsset, ...prev]);

    // Automatically create a maintenance reminder for custom assets 
    const daysUntilNext = Math.ceil((new Date(newAssetData.nextMaintenanceDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    let status: 'pending' | 'urgent' = 'pending';
    if (daysUntilNext <= 7) status = 'urgent';

    const newReminder: MaintenanceReminder = {
      id: `rem-${Date.now()}`,
      assetId: newId,
      title: `Mantenimiento de Rutina - ${newAsset.name}`,
      description: `Fecha de atención programada programada para el ${newAssetData.nextMaintenanceDate} (${newAsset.details}).`,
      dueDate: newAssetData.nextMaintenanceDate,
      status: status,
      type: 'general'
    };

    setReminders(prev => [newReminder, ...prev]);
  };

  // Client trigger "Solicitar Técnico" from reminder
  const handleRequestTechFromReminder = (reminder: MaintenanceReminder) => {
    const asset = assets.find(a => a.id === reminder.assetId);
    if (!asset) return;

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
  const handleRequestQuote = (techId: string, assetId: string, description: string) => {
    const selectedTech = technicians.find(t => t.id === techId);
    const selectedAsset = assets.find(a => a.id === assetId);
    if (!selectedTech || !selectedAsset) return;

    const newRequest: JobRequest = {
      id: `req-${Date.now()}`,
      clientId: 'user-client-1',
      clientName: 'Rubén Ábrego',
      assetId: assetId,
      assetName: selectedAsset.name,
      techId: techId,
      techName: selectedTech.name,
      description: description,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    setRequests(prev => [newRequest, ...prev]);
    
    // Automatically switch to Quotes tab
    setClientTab('quotes');
  };

  // Technician submit active quote bid
  const handleSubmitBid = (requestId: string) => {
    const priceNum = Number(bidPrice);
    if (isNaN(priceNum) || priceNum <= 0) return;

    setRequests(prev => prev.map(req => {
      if (req.id === requestId) {
        const comm = Number((priceNum * 0.15).toFixed(2)); // 15% Commision
        const earnings = Number((priceNum - comm).toFixed(2));
        return {
          ...req,
          price: priceNum,
          commission: comm,
          technicianEarnings: earnings,
          status: 'quoted' as const
        };
      }
      return req;
    }));

    setDraftingBidRequestId(null);
    setBidPrice('');
  };

  // Client Accept Tech Quote & simulate payment options
  const handleAcceptQuote = (requestId: string, paymentMethod: 'yappy' | 'ach' | 'card' | 'cache') => {
    setRequests(prev => prev.map(req => {
      if (req.id === requestId) {
        return {
          ...req,
          status: 'accepted' as const
        };
      }
      return req;
    }));

    const req = requests.find(r => r.id === requestId);
    if (!req) return;

    // Create an Agenda event for the technician automatically
    const newEvent: AgendaEvent = {
      id: `evt-${Date.now()}`,
      techId: req.techId,
      clientName: req.clientName,
      title: `Servicio: ${req.assetName} - ${req.description.substring(0, 30)}...`,
      date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0], // scheduled in 2 days
      time: '09:00',
      duration: '2h',
      status: 'pending'
    };

    setAgenda(prev => [newEvent, ...prev]);

    // Create initial chat message for coordination
    const autoMsg: ChatMessage = {
      id: `chat-${Date.now()}`,
      requestId: requestId,
      sender: 'tech',
      text: `¡Hola Rubén! He recibido tu confirmación de servicio y pago vía ${paymentMethod.toUpperCase()}. He agendado la cita de mantenimiento en mi calendario. Estaré llegando a tu ubicación según lo acordado.`,
      timestamp: new Date().toISOString()
    };
    setChatMessages(prev => [...prev, autoMsg]);
    setActiveChatRequestId(requestId);
    setClientTab('chat');
  };

  // Tech complete job
  const handleCompleteJob = (requestId: string) => {
    setRequests(prev => prev.map(req => {
      if (req.id === requestId) {
        return {
          ...req,
          status: 'completed' as const
        };
      }
      return req;
    }));

    // Update corresponding agenda status
    const req = requests.find(r => r.id === requestId);
    if (req) {
      setAgenda(prev => prev.map(evt => {
        if (evt.techId === req.techId && evt.clientName === req.clientName) {
          return { ...evt, status: 'completed' as const };
        }
        return evt;
      }));
    }
  };

  // Client rate technicians
  const handleRateJob = (requestId: string) => {
    setRequests(prev => prev.map(req => {
      if (req.id === requestId) {
        return {
          ...req,
          status: 'rated' as const,
          rating: ratingVal,
          comment: ratingComment
        };
      }
      return req;
    }));

    // Update technician review stats average
    const req = requests.find(r => r.id === requestId);
    if (req) {
      setTechnicians(prev => prev.map(t => {
        if (t.id === req.techId) {
          const totalRatingPoints = (t.rating * t.reviewCount) + ratingVal;
          const newCount = t.reviewCount + 1;
          return {
            ...t,
            reviewCount: newCount,
            rating: Number((totalRatingPoints / newCount).toFixed(1))
          };
        }
        return t;
      }));
    }

    setRatingRequestId(null);
    setRatingComment('');
    setRatingVal(5);
  };

  // Handle general messages
  const handleSendMessage = (text: string, image?: string) => {
    if (!activeChatRequestId) return;
    const isClient = role === 'client';

    const newMsg: ChatMessage = {
      id: `chat-msg-${Date.now()}`,
      requestId: activeChatRequestId,
      sender: isClient ? 'client' : 'tech',
      text,
      image,
      timestamp: new Date().toISOString()
    };

    setChatMessages(prev => [...prev, newMsg]);

    // Fast simulated automatic reply to make it highly active if client is talking
    if (isClient) {
      setTimeout(() => {
        const matchingReq = requests.find(r => r.id === activeChatRequestId);
        const replyMsg: ChatMessage = {
          id: `chat-msg-reply-${Date.now()}`,
          requestId: activeChatRequestId,
          sender: 'tech',
          text: `Entendido completamente Rubén. Estaré monitoreando los detalles de tu ${matchingReq?.assetName || 'equipo'} para ofrecerte la mejor solución estructural. Te aviso una vez esté por llegar con mis herramientas de diagnóstico de Panamá.`,
          timestamp: new Date().toISOString()
        };
        setChatMessages(prev => [...prev, replyMsg]);
      }, 1500);
    }
  };

  // Get current active tech profile details
  const getSelectedTechProfileObj = () => {
    return technicians.find(t => t.id === selectedTechProfileId) || technicians[0];
  };

  // Auth Submit Handlers
  const handleLogin = (e: React.FormEvent | null, selectedRole: 'client' | 'tech', forceEmail?: string, forceName?: string, techId?: string) => {
    if (e) e.preventDefault();
    
    const finalEmail = forceEmail || loginEmail || (selectedRole === 'client' ? 'rubenabregoc@gmail.com' : 'carlos@mantech.com');
    let finalName = forceName || (selectedRole === 'client' ? 'Rubén Ábrego' : 'Carlos Mendoza');
    
    if (selectedRole === 'tech' && techId) {
      const selectedTechObj = technicians.find(t => t.id === techId);
      if (selectedTechObj) {
        finalName = selectedTechObj.name;
      }
    }

    setIsLoggedIn(true);
    setRole(selectedRole);
    setLoggedInEmail(finalEmail);
    setLoggedInName(finalName);
    
    if (selectedRole === 'tech' && techId) {
      setSelectedTechProfileId(techId);
      localStorage.setItem('mantech_logged_tech_id', techId);
    } else if (selectedRole === 'client') {
      // Refresh to client first tab
      setClientTab('dashboard');
    } else {
      setTechTab('received');
    }

    localStorage.setItem('mantech_is_logged', 'true');
    localStorage.setItem('mantech_logged_role', selectedRole);
    localStorage.setItem('mantech_logged_email', finalEmail);
    localStorage.setItem('mantech_logged_name', finalName);

    setAuthError('');
    setLoginEmail('');
    setLoginPassword('');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setLoggedInEmail('');
    setLoggedInName('');
    localStorage.removeItem('mantech_is_logged');
    localStorage.removeItem('mantech_logged_role');
    localStorage.removeItem('mantech_logged_email');
    localStorage.removeItem('mantech_logged_name');
    localStorage.removeItem('mantech_logged_tech_id');
  };

  // Update Technician membership premium
  const handleToggleTechPlan = (techId: string) => {
    setTechnicians(prev => prev.map(t => {
      if (t.id === techId) {
        return {
          ...t,
          plan: t.plan === 'premium' ? 'basic' : 'premium' as const
        };
      }
      return t;
    }));
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
            </div>
          </div>

          <div className="space-y-4 font-sans">
            <div className="text-center bg-zinc-50 p-3 rounded-2xl border border-zinc-150">
              <p className="text-xs text-zinc-600 leading-relaxed font-semibold">
                {authTab === 'client' 
                  ? 'Como CLIENTE: Sube reportes de fallas con IA, cotiza de forma libre, monitorea tu inventario y califica proveedores.'
                  : 'Como TÉCNICO: Recibe alertas de clientes en Panamá, envía cotizaciones detalladas y administra tu agenda premium.'
                }
              </p>
            </div>

            {/* Quick access test accounts */}
            <div className="space-y-2">
              <p className="text-[9px] text-zinc-400 font-black uppercase tracking-wider text-center flex items-center justify-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                Acceso de Demostración con Datos Reales
              </p>
              
              {authTab === 'client' ? (
                <button
                  type="button"
                  onClick={() => handleLogin(null, 'client', 'rubenabregoc@gmail.com', 'Rubén Ábrego')}
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-indigo-50 hover:bg-indigo-100/90 border border-indigo-200 transition-all text-xs font-black text-indigo-950 shadow-xs cursor-pointer group text-left"
                >
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                    <div>
                      <span className="block font-black text-indigo-900">Rubén Ábrego (Cliente)</span>
                      <span className="block text-[9px] text-indigo-600/80 font-medium font-sans">Propietario de Auto, Split y Servidor</span>
                    </div>
                  </span>
                  <span className="text-[10px] text-indigo-700 font-mono font-bold bg-white/70 px-2.5 py-1 rounded-lg border border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white transition-all shrink-0">ENTRAR ➔</span>
                </button>
              ) : (
                <div className="space-y-2 max-h-[190px] overflow-y-auto pr-1">
                  {technicians.slice(0, 3).map((tech) => (
                    <button
                      key={tech.id}
                      type="button"
                      onClick={() => handleLogin(null, 'tech', `${tech.id}@mantech.com`, tech.name, tech.id)}
                      className="w-full flex items-center justify-between p-3 rounded-2xl bg-indigo-50/40 hover:bg-indigo-100/60 border border-indigo-100 transition-all text-xs font-bold text-indigo-950 cursor-pointer text-left group"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                        <div className="truncate">
                          <span className="block font-black text-zinc-800 truncate">{tech.name}</span>
                          <span className="block text-[8.5px] text-zinc-500 tracking-tight font-sans">
                            {tech.category === 'aires_acondicionados' ? '❄️ 8 Aires Activos' : tech.category === 'autos' ? '🚗 4 Mecánicas' : '⚡ 3 Plantas'} • ⭐{tech.rating}
                          </span>
                        </div>
                      </div>
                      <span className="text-[9px] text-indigo-700 font-mono font-bold bg-white px-2 py-1 rounded-lg border border-indigo-100 shrink-0 uppercase ml-2 group-hover:bg-indigo-600 group-hover:text-white transition-all">Activar ➔</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-zinc-200"></div>
              <span className="flex-shrink mx-3 text-[9px] text-zinc-450 font-black uppercase tracking-widest">O accede de forma privada</span>
              <div className="flex-grow border-t border-zinc-200"></div>
            </div>

            {/* Login Form */}
            <form onSubmit={(e) => handleLogin(e, authTab)} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-black text-zinc-550 block">Correo electrónico de Panamá</label>
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
                <label className="text-[10px] uppercase font-black text-zinc-550 block">Contraseña de Enlace</label>
                <div className="relative">
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-4 pr-10 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl text-xs font-bold text-zinc-800 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-inner"
                  />
                  <Lock className="absolute right-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
                </div>
              </div>

              {authError && (
                <div className="p-3 bg-red-50 border border-red-150 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <p className="text-red-700 text-[10px] uppercase font-black tracking-wide leading-none">{authError}</p>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3.5 bg-zinc-950 hover:bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-md hover:shadow-indigo-100 flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <span>INGRESAR DE FORMA SEGURA</span>
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
        <nav className="h-16 bg-zinc-900/90 border-b border-zinc-850 text-white flex items-center justify-between px-6 z-40 shrink-0 select-none">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-indigo-500 rounded flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded-sm"></div>
            </div>
            <span className="text-md font-black tracking-tight">Mantech<span className="text-indigo-400">Pro</span></span>
          </div>
          
          <button
            onClick={() => {
              setViewportMode(prev => prev === 'android' ? 'web' : 'android');
            }}
            type="button"
            className="flex items-center space-x-2 bg-indigo-950/70 hover:bg-indigo-900/90 active:scale-[0.98] text-indigo-300 px-3 py-1.5 rounded-full border border-indigo-850/40 select-none cursor-pointer transition-all"
            title="Haz clic para alternar entre Vista Móvil y Vista de Escritorio"
          >
            <Smartphone className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
            <span className="text-[9.5px] font-black uppercase tracking-wider">
              {viewportMode === 'android' ? 'Vista Móvil (Click para Web)' : 'Vista Web (Click para Móvil)'}
            </span>
          </button>
        </nav>

        {/* Dynamic Frame Selector */}
        <div className="flex-grow flex items-center justify-center p-4">
          {viewportMode === 'android' && isLargeScreen ? (
            <div className="w-full max-w-[400px] h-[785px] bg-black rounded-[52px] p-3 border-[12px] border-zinc-800 shadow-2xl relative flex flex-col overflow-hidden my-3 select-none">
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-32 h-5.5 bg-zinc-950 rounded-full z-50 flex items-center justify-center shadow-inner">
                <span className="w-2.5 h-2.5 rounded-full bg-zinc-900 border border-zinc-800 block shrink-0"></span>
                <span className="w-10 h-1 bg-zinc-800 rounded-lg ml-4 block shrink-0"></span>
              </div>
              
              <div className="h-8 pt-1.5 bg-black text-zinc-500 text-[10px] px-6 flex justify-between items-center z-40 select-none shrink-0 font-bold">
                <span>7:59 PM</span>
                <span className="text-[8.5px] font-mono">LTE 📶 🔋 98%</span>
              </div>

              <div className="flex-1 bg-zinc-50 rounded-[28px] overflow-y-auto scrollbar-none flex flex-col justify-between">
                {renderLoginContent()}
                
                <div className="h-10 bg-zinc-900 flex justify-around items-center px-8 z-40 shrink-0">
                  <button onClick={() => alert('Simulado: Botón Atrás en Android (Volviendo a Dashboard)')} className="text-zinc-500 text-xs">◀</button>
                  <button onClick={() => {}} className="text-zinc-500 text-xs font-bold font-mono">●</button>
                  <button onClick={() => alert('Simulado: Lista de Tareas en segundo plano (Mantech Active)')} className="text-zinc-500 text-xs">■</button>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch bg-zinc-900/60 p-4 md:p-8 lg:p-10 rounded-3xl border border-zinc-850/80 shadow-2xl relative">
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
                          className={`p-2 rounded-xl text-left border transition-all duration-250 flex flex-col justify-between cursor-pointer ${
                            isActive 
                              ? 'bg-indigo-950/90 border-indigo-500/85 text-indigo-100 shadow-lg shadow-indigo-950/20 scale-[1.02]' 
                              : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:border-zinc-750 hover:bg-zinc-850/60'
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

                        <div className="bg-zinc-950 rounded-lg p-2 border border-zinc-850">
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
                  <div className="bg-zinc-850/40 p-3 rounded-xl border border-zinc-800">
                    <span className="block text-lg font-black text-zinc-200">100%</span>
                    <span className="block text-[8px] uppercase text-zinc-450 tracking-wider font-sans font-bold mt-1.5">Técnicos Certificados</span>
                  </div>
                  <div className="bg-zinc-850/40 p-3 rounded-xl border border-zinc-800">
                    <span className="block text-lg font-black text-indigo-400">+500</span>
                    <span className="block text-[8px] uppercase text-zinc-450 tracking-wider font-sans font-bold mt-1.5">Servicios Cotizados</span>
                  </div>
                  <div className="bg-zinc-850/40 p-3 rounded-xl border border-zinc-800">
                    <span className="block text-lg font-black text-zinc-200">0%</span>
                    <span className="block text-[8px] uppercase text-zinc-450 tracking-wider font-sans font-bold mt-1.5">Comisión de Intermediación</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Dynamic Form Selector */}
              <div className="lg:col-span-6 flex justify-center items-center w-full">
                {renderLoginContent()}
              </div>
            </div>
          )}
        </div>

        <footer className="py-6 border-t border-zinc-900 text-center text-[10px] text-zinc-500 font-medium z-10 uppercase tracking-widest bg-zinc-950/85 font-mono">
          Mantech Pro Panamá • 2026. Todos los derechos reservados.
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col font-sans text-zinc-900">
      
      {/* Top Navigation - Sleek Interface theme */}
      <nav className="h-16 bg-zinc-900 text-white flex items-center justify-between px-4 md:px-8 shrink-0 shadow-lg sticky top-0 z-40">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-indigo-500 rounded flex items-center justify-center">
            <div className="w-4 h-4 bg-white rounded-sm"></div>
          </div>
          <span className="text-xl font-bold tracking-tight">Mantech<span className="text-indigo-400">Pro</span></span>
          <span className="hidden sm:inline-flex text-[10px] font-bold bg-zinc-800 text-indigo-300 px-2 py-0.5 rounded border border-zinc-700/80">
            {role === 'client' ? 'Perfil Cliente' : 'Perfil Técnico'}
          </span>
        </div>

        {/* Dynamic Header Controls & Actions */}
        <div className="flex items-center space-x-3 md:space-x-4">
          
          {/* Smart Automatic Viewport Badge */}
          <button
            onClick={() => {
              setViewportMode(prev => prev === 'android' ? 'web' : 'android');
            }}
            type="button"
            className="flex items-center space-x-2 bg-zinc-800 hover:bg-zinc-750 active:scale-[0.98] transition-all px-3 py-1.5 rounded-full border border-zinc-700/60 select-none cursor-pointer"
            title="Haz clic para alternar entre Vista Móvil y Vista de Escritorio"
          >
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-wide flex items-center gap-1.5">
              {viewportMode === 'android' ? (
                <>
                  <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Móvil (Click para Web)</span>
                </>
              ) : (
                <>
                  <Monitor className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Escritorio (Click para Móvil)</span>
                </>
              )}
            </span>
          </button>

          {/* Active Logged In Account Brief */}
          <div className="hidden md:flex items-center space-x-2 bg-zinc-850 px-3 py-1.5 rounded-xl border border-zinc-800 max-w-[210px]">
            <div className="w-6 h-6 bg-indigo-600 rounded-full text-[10px] font-black text-white flex items-center justify-center">
              {role === 'client' ? 'RA' : getSelectedTechProfileObj().name.substring(0, 2).toUpperCase()}
            </div>
            <div className="truncate text-left">
              <span className="block text-[10px] font-extrabold text-zinc-100 truncate">{loggedInName}</span>
              <span className="block text-[8px] text-zinc-400 truncate">{loggedInEmail}</span>
            </div>
          </div>

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

      {/* Sub-header instruction */}
      <div className="bg-indigo-50 border-b border-indigo-100 py-2.5 px-4 md:px-8 text-center text-xs text-indigo-950 font-bold flex flex-wrap justify-center items-center gap-2 select-none shadow-xs shrink-0">
        <Smartphone className="w-4 h-4 text-indigo-600 animate-bounce" />
        <span>Mantech Pro está adaptado de forma responsiva 100% automatizada según el tamaño de tu navegador.</span>
      </div>

      {/* Main Container Layout */}
      <div className={showMobileDeviceSimulator 
        ? "flex-1 w-full max-w-[420px] mx-auto bg-zinc-900 rounded-[56px] p-4 border-[14px] border-zinc-800 shadow-2xl relative flex flex-col overflow-hidden my-6 select-none transition-all duration-300"
        : (viewportMode === 'android' 
          ? "flex-1 w-full max-w-3xl mx-auto bg-zinc-50 rounded-2xl border border-zinc-200 shadow-lg flex flex-col overflow-hidden my-4 p-4 min-h-[600px] transition-all duration-300"
          : "flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-6 grid grid-cols-1 md:grid-cols-12 gap-6 transition-all duration-300")
      } style={showMobileDeviceSimulator ? { height: '815px' } : undefined}>
        
        {viewportMode === 'android' && (
          <>
            {/* Top camera punch-hole notch */}
            {showMobileDeviceSimulator && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-full z-50 flex items-center justify-center select-none shadow-inner">
                <span className="w-3 h-3 rounded-full bg-zinc-950 border border-zinc-850 block shrink-0"></span>
                <span className="w-12 h-1 bg-zinc-800 rounded-lg ml-4 block shrink-0"></span>
              </div>
            )}

            {/* Android Status Bar */}
            <div className={`h-8 pt-1.5 bg-zinc-900 text-white text-[10px] uppercase font-black px-6 flex justify-between items-center z-40 select-none shrink-0 ${showMobileDeviceSimulator ? 'rounded-t-[34px]' : 'rounded-t-2xl'}`}>
              <span className="font-sans font-bold text-zinc-400">7:59 PM</span>
              <span className="text-[8.5px] bg-zinc-800 px-1 py-0.2 rounded text-zinc-400 font-extrabold font-mono">LTE 📶 🔋 98%</span>
            </div>

            {/* Dynamic Native Mobile App Header inside phone */}
            <div className="px-4 py-3 bg-zinc-900 text-white flex items-center justify-between shadow-sm z-35 select-none shrink-0 border-b border-zinc-850">
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 bg-indigo-500 rounded flex items-center justify-center text-[10px] font-black">M</div>
                <span className="text-[10px] font-black tracking-wider uppercase text-zinc-100">Mantech Mobile</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-[7.5px] font-black text-zinc-400 uppercase tracking-widest">GPS Panamá</span>
              </div>
            </div>
          </>
        )}

        <div className={viewportMode === 'android'
          ? `flex-1 bg-zinc-50 overflow-y-auto overflow-x-hidden flex flex-col relative select-none scrollbar-none p-3.5 space-y-4 ${showMobileDeviceSimulator ? 'rounded-b-[24px]' : 'rounded-b-2xl'}`
          : "contents"
        } id="android-screen-scroll">
          
          {/* Navigation Sidebar */}
          <aside className={viewportMode === 'android' ? "hidden" : "md:col-span-4 lg:col-span-3 space-y-4"}>
          
          {/* Persona Card */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-sm text-center space-y-3.5">
            <div className="w-14 h-14 rounded-full mx-auto flex items-center justify-center font-bold text-sm bg-indigo-50 border-2 border-indigo-200 text-indigo-700 shadow-inner">
              {role === 'client' ? 'RA' : 'TE'}
            </div>
            
            <div>
              <h4 className="font-extrabold text-zinc-900 text-sm tracking-tight">
                {role === 'client' ? 'Rubén Ábrego' : getSelectedTechProfileObj().name}
              </h4>
              <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-widest mt-0.5">
                {role === 'client' ? 'Cliente Residencial / B2B' : getSelectedTechProfileObj().title}
              </p>
            </div>

            <div className="text-[10px] text-zinc-500 flex justify-center items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              ID de cuenta activo
            </div>
          </div>

          {/* Persona specific navigation links */}
          <nav className="bg-white rounded-2xl border border-zinc-200 p-3.5 shadow-sm space-y-2">
            {role === 'client' ? (
              <>
                <button
                  onClick={() => setClientTab('dashboard')}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                    clientTab === 'dashboard'
                      ? 'bg-zinc-900 text-white border-zinc-800 shadow-md font-extrabold'
                      : 'border-zinc-100 text-zinc-650 bg-white hover:bg-zinc-50'
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
                      : 'border-zinc-100 text-zinc-650 bg-white hover:bg-zinc-50'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Bot className={`w-4 h-4 ${clientTab === 'ai' ? 'text-indigo-400' : 'text-zinc-500'}`} />
                    Diagnóstico IA V2.0
                  </span>
                  <span className="px-1.5 py-0.5 bg-emerald-55 bg-emerald-500 text-[9px] uppercase font-black text-white rounded-md">
                    Activo
                  </span>
                </button>

                <button
                  onClick={() => setClientTab('marketplace')}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                    clientTab === 'marketplace'
                      ? 'bg-zinc-900 text-white border-zinc-800 shadow-md font-extrabold'
                      : 'border-zinc-100 text-zinc-650 bg-white hover:bg-zinc-50'
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
                      : 'border-zinc-100 text-zinc-650 bg-white hover:bg-zinc-50'
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
                      : 'border-zinc-100 text-zinc-650 bg-white hover:bg-zinc-50'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <MessageSquare className={`w-4 h-4 ${clientTab === 'chat' ? 'text-indigo-400' : 'text-zinc-500'}`} />
                    Panel Chat Directo
                  </span>
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
                  <div className="text-xs font-black text-indigo-650 mt-1 uppercase tracking-tight">
                    {getSelectedTechProfileObj().category.replace('_', ' ')}
                  </div>
                  <div className="flex items-center gap-1 mt-1.5 text-[11px] text-zinc-500 font-bold">
                    <span>⭐ {getSelectedTechProfileObj().rating} de reputación • ({getSelectedTechProfileObj().completedJobs} completados)</span>
                  </div>
                </div>

                <button
                  onClick={() => setTechTab('received')}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                    techTab === 'received'
                      ? 'bg-zinc-900 text-white border-zinc-800 shadow-md font-extrabold'
                      : 'border-zinc-100 text-zinc-650 bg-white hover:bg-zinc-50'
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
                      : 'border-zinc-100 text-zinc-650 bg-white hover:bg-zinc-50'
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
                      : 'border-zinc-100 text-zinc-650 bg-white hover:bg-zinc-50'
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
                      : 'border-zinc-100 text-zinc-650 bg-white hover:bg-zinc-50'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <MessageSquare className={`w-4 h-4 ${techTab === 'chat' ? 'text-indigo-400' : 'text-zinc-500'}`} />
                    Chat con Clientes
                  </span>
                </button>
              </>
            )}
          </nav>

          {/* Intermediate Business Metrics / Admin Board */}
          <div className="bg-zinc-900 text-white rounded-2xl p-5 shadow-lg border border-zinc-800 space-y-4">
            <h4 className="text-[10px] font-extrabold text-indigo-450 uppercase tracking-widest flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              Mantenimientos S.A.
            </h4>
            
            <p className="text-[11px] text-zinc-400 leading-relaxed font-medium">
              Usted actúa como el canal intermediario. Su empresa retiene una tarifa de comisión del 15% por cada servicio canalizado.
            </p>

            <div className="grid grid-cols-2 gap-2.5 pt-1.5">
              <div className="bg-zinc-800 p-3 rounded-xl border border-zinc-700/60">
                <span className="block text-[8px] text-zinc-400 uppercase font-black">Comisiones (15%)</span>
                <span className="text-sm font-black text-emerald-400 block mt-0.5">
                  ${companyCommissions.toFixed(2)}
                </span>
                <span className="block text-[8px] text-zinc-500 mt-0.5">Retenido de ${totalInvoicedJobs}</span>
              </div>

              <div className="bg-zinc-800 p-3 rounded-xl border border-zinc-700/60">
                <span className="block text-[8px] text-zinc-400 uppercase font-black">Membresías</span>
                <span className="text-sm font-black text-indigo-400 block mt-0.5">
                  ${totalMembershipFees.toFixed(2)}
                </span>
                <span className="block text-[8px] text-slate-500 mt-0.5">Membresía Premium</span>
              </div>
            </div>

            <div className="text-[9px] bg-zinc-800/80 p-2.5 rounded-xl text-zinc-400 border border-zinc-700/40">
              * El plan Premium ($15/mes) brinda solicitudes ilimitadas sin restringir el cupo mensual a 5 solicitudes básicas.
            </div>
          </div>
        </aside>

        {/* Content Panel Area */}
        <main className={viewportMode === 'android' ? "w-full space-y-4" : "md:col-span-8 lg:col-span-9 space-y-6"}>
          
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
                          onClick={() => triggerSimulatedNotification()}
                          type="button"
                          className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border border-indigo-200 cursor-pointer shadow-xs active:scale-95"
                          title="Despacha la alerta en tiempo real a tu correo electrónico y campana del celular"
                        >
                          <BellRing className="w-3.5 h-3.5 text-indigo-600 animate-bounce" />
                          Despachar Alerta Real (Email & Celular)
                        </button>
                        <button
                          onClick={() => setIsAssetModalOpen(true)}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-indigo-100 cursor-pointer"
                        >
                          <Plus className="w-4 h-4" />
                          Registrar Activo
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {reminders.map((rem) => {
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
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between gap-1">
                                <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md border ${
                                  daysLeft <= 0 
                                    ? 'bg-red-100 text-red-900 border-red-200' 
                                    : daysLeft <= 7 
                                    ? 'bg-amber-100 text-amber-900 border-amber-200' 
                                    : 'bg-indigo-50 text-indigo-950 border-indigo-100'
                                }`}>
                                  {daysLeft <= 0 ? 'Expirado' : daysLeft <= 7 ? `Alerta: ${daysLeft} días` : `Faltan ${daysLeft} días`}
                                </span>
                                <span className="text-[9px] text-zinc-400 font-black uppercase tracking-wider block truncate">
                                  {matchingAsset?.type.replace('_', ' ')}
                                </span>
                              </div>

                              <h4 className="font-extrabold text-zinc-900 text-xs tracking-tight">{rem.title}</h4>
                              <p className="text-[10px] text-zinc-500 leading-relaxed truncate-2-lines">{rem.description}</p>
                            </div>

                            <div className="pt-3.5 border-t border-zinc-100 flex items-center justify-between gap-2 mt-2">
                              <div>
                                <span className="block text-[8px] text-zinc-400 uppercase font-bold">Equipo:</span>
                                <span className="text-[10px] font-extrabold text-zinc-800 block leading-tight truncate max-w-[85px]">{matchingAsset?.name || 'Varios'}</span>
                              </div>
                              <button
                                onClick={() => handleRequestTechFromReminder(rem)}
                                className="px-3 py-1.5 bg-indigo-650 hover:bg-indigo-750 text-white rounded-xl text-[10px] font-bold transition-all shadow-xs cursor-pointer"
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
                            <div key={asset.id} className="p-5 rounded-2xl border border-zinc-250 bg-white hover:border-indigo-400 hover:shadow-md transition-all flex flex-col justify-between shadow-xs">
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

                                <div className="grid grid-cols-2 gap-3 text-xs py-1.5 text-zinc-650 border-t border-b border-zinc-100">
                                  <div>
                                    <span className="block text-[8px] text-zinc-400 uppercase font-black">Registrado:</span>
                                    <span className="font-semibold text-zinc-700">{asset.registeredAt}</span>
                                  </div>
                                  <div>
                                    <span className="block text-[8px] text-zinc-400 uppercase font-black">Sig. Mantenimiento:</span>
                                    <span className="font-extrabold text-indigo-650">{asset.nextMaintenanceDate}</span>
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
                              : 'border-zinc-200 text-zinc-650 hover:bg-zinc-50 bg-white'
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
                              <div className="absolute top-4 right-4 flex items-center gap-1 bg-amber-100 text-amber-900 font-extrabold text-[9px] px-2.5 py-1 rounded-full border border-amber-300 shadow-xs">
                                👑 RECOMENDADO
                              </div>
                            )}

                            <div className="space-y-3.5">
                              <div className="flex gap-3 items-center">
                                <div className="w-12 h-12 rounded-full bg-indigo-50 border border-indigo-150 flex items-center justify-center font-extrabold text-indigo-700 text-sm">
                                  {tech.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div>
                                  <h4 className="font-extrabold text-zinc-900 text-sm tracking-tight flex items-center gap-1">
                                    {tech.name}
                                  </h4>
                                  <p className="text-[10px] text-indigo-650 font-bold uppercase tracking-wider">
                                    {tech.title}
                                  </p>
                                </div>
                              </div>

                              <div className="flex gap-4 text-xs font-semibold text-zinc-650 justify-between py-2 border-y border-zinc-150/60 bg-zinc-50 px-3 rounded-xl">
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
                                  req.status === 'pending' ? 'bg-amber-55 bg-amber-50 text-amber-900 border-amber-200' :
                                  req.status === 'quoted' ? 'bg-indigo-50 text-indigo-955 border-indigo-200 animate-pulse font-extrabold' :
                                  req.status === 'accepted' ? 'bg-blue-50 text-blue-900 border-blue-200 font-bold' :
                                  'bg-emerald-50 text-emerald-900 border-emerald-200'
                                }`}>
                                  {req.status === 'pending' && 'Búsqueda / Propuesta vacante'}
                                  {req.status === 'quoted' && 'Oferta recibida del Técnico'}
                                  {req.status === 'accepted' && 'En Proceso / Cita agendada'}
                                  {req.status === 'completed' && 'Servicio terminado'}
                                  {req.status === 'rated' && 'Trabajo calificado'}
                                </span>
                              </div>
                            </div>

                            <p className="text-xs text-zinc-600 bg-white p-3.5 rounded-xl border border-zinc-150 leading-relaxed">
                              <strong>Instrucciones enviadas:</strong> {req.description}
                            </p>

                            <div className="flex justify-between items-center flex-wrap gap-2 pt-3 border-t border-zinc-100 text-xs">
                              <div>
                                <span className="block text-[8px] text-zinc-400 uppercase font-bold">Técnico solicitado:</span>
                                <span className="font-extrabold text-zinc-800">{req.techName}</span>
                              </div>

                              {req.price && (
                                <div className="text-right">
                                  <span className="block text-[8px] text-zinc-400 uppercase font-bold">Cotizado:</span>
                                  <span className="font-black text-emerald-600 text-sm block">${req.price.toFixed(2)}</span>
                                </div>
                              )}
                            </div>

                            {/* Actions by states */}
                            {req.status === 'quoted' && (
                              <div className="bg-indigo-55 bg-indigo-50 p-5 rounded-2xl border border-indigo-100 flex flex-wrap justify-between items-center gap-4">
                                <div className="flex-1 min-w-[250px]">
                                  <span className="text-[10px] font-black text-indigo-900 uppercase block tracking-wider">¡El técnico envió una propuesta de precio!</span>
                                  <p className="text-[11px] text-indigo-955 text-indigo-900 mt-1 leading-relaxed">
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
                                <button
                                  onClick={() => setRatingRequestId(req.id)}
                                  className="px-4 py-2.5 bg-indigo-650 hover:bg-indigo-750 text-white rounded-xl text-xs font-bold shrink-0 cursor-pointer shadow-xs"
                                >
                                  Calificar Técnico Ahora
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

                            {req.status === 'rated' && (
                              <div className="flex items-center gap-2.5 p-3 px-4 bg-emerald-50 rounded-xl text-xs text-emerald-900 font-bold border border-emerald-100">
                                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                                Calificación de {req.rating} estrellas enviada con éxito. ¡Depósito de confianza liberado instantáneamente al contratista!
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
                      
                      {requests.filter(r => r.status === 'quoted' || r.status === 'accepted' || r.status === 'completed' || r.status === 'rated').length === 0 ? (
                        <p className="text-[11px] text-zinc-400 font-medium">Sin contrataciones con chats de momento.</p>
                      ) : (
                        requests
                          .filter(r => r.status === 'quoted' || r.status === 'accepted' || r.status === 'completed' || r.status === 'rated')
                          .map((r) => (
                            <button
                              key={r.id}
                              onClick={() => setActiveChatRequestId(r.id)}
                              className={`w-full text-left p-3 rounded-xl border text-xs transition-all cursor-pointer ${
                                activeChatRequestId === r.id
                                  ? 'border-indigo-605 border-indigo-500 bg-indigo-50/70 text-indigo-900 font-black'
                                  : 'border-transparent text-zinc-650 hover:bg-zinc-50'
                              }`}
                            >
                              <div className="truncate font-bold">{r.techName}</div>
                              <div className="text-[10px] text-zinc-450 truncate mt-0.5">{r.assetName}</div>
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
            </>
          )}

          {/* TECHNICIAN PERSONA CONTENT WRAPPER */}
          {role === 'tech' && (
            <>
              {/* TAB 1: INBOX SOLICITUDES */}
              {techTab === 'received' && (
                <div className="space-y-6">
                  <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm">
                    <div className="flex flex-wrap justify-between items-center gap-3 mb-5">
                      <div>
                        <h2 className="text-sm font-black text-zinc-900 uppercase tracking-widest">Bandeja de Diagnósticos & Cotizaciones</h2>
                        <p className="text-[11px] text-zinc-450 font-medium">Administra solicitudes de mantenimiento de clientes directos o detectadas por I.A.</p>
                      </div>
                      <span className="px-3 py-1.5 rounded-xl bg-zinc-900 text-white font-mono text-[10px] font-bold border border-zinc-800 shadow-xs">
                        ID PROVEEDOR: {selectedTechProfileId.toUpperCase()}
                      </span>
                    </div>

                    {requests.filter(r => r.techId === selectedTechProfileId).length === 0 ? (
                      <div className="text-center py-12 text-zinc-400 space-y-3 bg-zinc-50/50 rounded-2xl border border-dashed border-zinc-200">
                        <UserX className="w-12 h-12 mx-auto text-zinc-350" />
                        <h4 className="font-extrabold text-zinc-800 text-xs uppercase tracking-wider">Sin Solicitudes Recientes</h4>
                        <p className="text-[11px] text-zinc-450 max-w-sm mx-auto leading-relaxed">
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
                                </span>
                              </div>

                              <div className="text-xs bg-white p-4 rounded-xl border border-zinc-200 leading-relaxed">
                                <span className="block text-[8px] text-zinc-400 font-black mb-1.5 uppercase tracking-wider">Activo a Trabajar:</span>
                                <p className="font-extrabold text-zinc-900 mb-1 text-xs">{req.assetName}</p>
                                <p className="text-zinc-650">"{req.description}"</p>
                              </div>

                              {/* Action to formulate quote */}
                              {req.status === 'pending' && (
                                <div className="bg-zinc-100/90 p-5 rounded-2xl border border-zinc-200/80 space-y-3.5">
                                  <span className="text-xs font-black text-zinc-800 block uppercase tracking-wider">Enviar propuesta de cotización formal</span>
                                  
                                  <div className="flex items-center gap-3 flex-wrap">
                                    <div className="relative max-w-[200px] w-full">
                                      <span className="absolute left-3.5 top-2.5 text-xs text-zinc-455 font-black">$</span>
                                      <input
                                        type="number"
                                        placeholder="Precio total (USD)"
                                        value={draftingBidRequestId === req.id ? bidPrice : ''}
                                        onChange={(e) => {
                                          setDraftingBidRequestId(req.id);
                                          setBidPrice(e.target.value);
                                        }}
                                        className="w-full pl-7 pr-3 py-2 border border-zinc-250 bg-white rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                                      />
                                    </div>

                                    {draftingBidRequestId === req.id && bidPrice && (
                                      <div className="text-[10px] text-zinc-550 font-semibold space-x-3.5 shrink-0">
                                        <span>Comisión Retenida (15%): <strong className="text-rose-650 text-red-600 font-extrabold">${(Number(bidPrice) * 0.15).toFixed(2)}</strong></span>
                                        <span>Ganancia Neta: <strong className="text-emerald-700 font-bold">${(Number(bidPrice) * 0.85).toFixed(2)}</strong></span>
                                      </div>
                                    )}

                                    <button
                                      disabled={!bidPrice}
                                      onClick={() => handleSubmitBid(req.id)}
                                      className="px-5 py-2.5 bg-indigo-650 hover:bg-indigo-750 disabled:opacity-45 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs shrink-0"
                                    >
                                      Enviar Cotización
                                    </button>
                                  </div>
                                </div>
                              )}

                              {req.status === 'accepted' && (
                                <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-150 flex items-center justify-between flex-wrap gap-3 animate-pulse">
                                  <div>
                                    <span className="text-xs font-extrabold text-emerald-950 block uppercase tracking-wide">¡Cliente aprobó el pago de garantía!</span>
                                    <p className="text-[11px] text-emerald-800 font-medium mt-0.5">El trabajo ya se encuentra en tu calendario. Visita la ubicación y presiona terminar para cobrar de inmediato.</p>
                                  </div>
                                  <button
                                    onClick={() => handleCompleteJob(req.id)}
                                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-sm cursor-pointer"
                                  >
                                    Completar Servicio Profesional
                                  </button>
                                </div>
                              )}

                              {req.price && (
                                <div className="flex justify-between text-xs pt-3 border-t border-zinc-100 flex-wrap gap-2">
                                  <div>
                                    <span className="text-zinc-450 font-semibold text-[10px] uppercase block">Precio Cotizado: </span>
                                    <span className="font-black text-zinc-900 text-sm block mt-0.5">${req.price.toFixed(2)}</span>
                                  </div>
                                  <div className="text-right">
                                    <span className="text-zinc-450 font-semibold text-[10px] uppercase block">Tus ingresos netos (85%): </span>
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
                    <p className="text-[11px] text-zinc-450 font-medium mb-5">Mantenimientos programados organizados cronológicamente</p>

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
                              <div className="flex items-center gap-2 mt-1.5 text-[11px] text-zinc-500 font-medium">
                                <Clock className="w-3.5 h-3.5 text-zinc-400" />
                                <span>Hora: {evt.time} ({evt.duration})</span>
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
                          {getSelectedTechProfileObj().name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <h3 className="text-base font-black text-zinc-900 tracking-tight">{getSelectedTechProfileObj().name}</h3>
                          <p className="text-xs text-indigo-650 font-bold uppercase tracking-wider mt-0.5">{getSelectedTechProfileObj().title}</p>
                          <p className="text-[11px] text-zinc-400 font-medium">{getSelectedTechProfileObj().location}</p>
                        </div>
                      </div>

                      <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 text-center min-w-[140px] shadow-xs">
                        <span className="text-[10px] uppercase font-black text-zinc-400 tracking-wider">Reputación</span>
                        <div className="flex items-center justify-center gap-1 font-black text-zinc-900 text-base mt-1">
                          <Star className="w-4.5 h-4.5 text-amber-500 fill-amber-500" />
                          {getSelectedTechProfileObj().rating}
                        </div>
                        <span className="text-[9px] text-zinc-450 font-semibold block mt-1">{getSelectedTechProfileObj().reviewCount} opiniones</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Qualifications & Certifications */}
                      <div className="space-y-4">
                        <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest">Información Profesional</h4>
                        <div>
                          <span className="text-[10px] text-zinc-400 uppercase tracking-wider block font-bold">Reseña Biográfica:</span>
                          <p className="text-xs text-zinc-650 italic mt-1.5 bg-zinc-50 p-4 rounded-xl border border-zinc-150 leading-relaxed">"{getSelectedTechProfileObj().bio}"</p>
                        </div>
                        <div>
                          <span className="text-[10px] text-zinc-400 uppercase tracking-wider block font-bold mb-2">Diplomas & Certificaciones:</span>
                          <div className="space-y-1.5">
                            {getSelectedTechProfileObj().certifications.map((c, i) => (
                              <div key={i} className="flex items-center gap-2 text-xs text-zinc-800 font-bold">
                                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                                {c}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Business Membership Section */}
                      <div className="p-6 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black text-white rounded-2xl shadow-lg border border-zinc-805 space-y-4">
                        <div className="flex justify-between items-center flex-wrap gap-2">
                          <span className="text-[9px] bg-indigo-505 bg-indigo-500/15 text-indigo-300 font-black px-2.5 py-1 rounded-full uppercase border border-indigo-500/30">
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
                              {getSelectedTechProfileObj().plan === 'premium' ? 'Plan Premium ($15/mes)' : 'Plan Básico (Gratuito - 5 solicitudes max)'}
                            </span>
                          </div>

                          <button
                            onClick={() => handleToggleTechPlan(selectedTechProfileId)}
                            className="px-4 py-2 bg-indigo-650 hover:bg-indigo-750 text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                          >
                            Alternar Plan
                          </button>
                        </div>

                        <div className="text-[10px] text-zinc-400/90 leading-relaxed">
                          * Los técnicos en el <strong>Plan Premium</strong> se destacan de forma prioritaria en los resultados del Marketplace, atrayendo 4 veces más solicitudes de clientes.
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
                      
                      {requests.filter(r => r.techId === selectedTechProfileId && (r.status === 'quoted' || r.status === 'accepted' || r.status === 'completed' || r.status === 'rated')).length === 0 ? (
                        <p className="text-[11px] text-zinc-400 font-medium">Sin hilos de conversación activos con clientes.</p>
                      ) : (
                        requests
                          .filter(r => r.techId === selectedTechProfileId && (r.status === 'quoted' || r.status === 'accepted' || r.status === 'completed' || r.status === 'rated'))
                          .map((r) => (
                            <button
                              key={r.id}
                              onClick={() => setActiveChatRequestId(r.id)}
                              className={`w-full text-left p-3 rounded-xl border text-xs transition-all cursor-pointer ${
                                activeChatRequestId === r.id
                                  ? 'border-indigo-605 border-indigo-500 bg-indigo-50/70 text-indigo-900 font-black'
                                  : 'border-transparent text-zinc-650 hover:bg-zinc-50'
                              }`}
                            >
                              <div className="truncate font-bold">{r.clientName}</div>
                              <div className="text-[10px] text-zinc-450 truncate mt-0.5">{r.assetName}</div>
                            </button>
                          ))
                      )}
                    </div>

                    <div className="md:col-span-3">
                      <SupportChatWidget
                        request={requests.find(r => r.id === activeChatRequestId) || null}
                        role="tech"
                        techName={getSelectedTechProfileObj().name}
                        onSendMessage={handleSendMessage}
                        messages={chatMessages.filter(m => m.requestId === activeChatRequestId)}
                      />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

        </main>
        </div>

        {viewportMode === 'android' && (
          <div className={`shrink-0 flex flex-col z-30 select-none overflow-hidden ${showMobileDeviceSimulator ? 'rounded-b-[38px]' : 'rounded-b-2xl shadow-inner'}`}>
            {/* Android Soft Virtual Keys */}
            {showMobileDeviceSimulator && (
              <div className="h-8 bg-zinc-900 flex justify-around items-center px-8 z-40 select-none">
                <button onClick={() => alert('Simulado: Botón Atrás en Android (Volviendo a Dashboard)')} className="text-zinc-500 text-xs hover:text-white transition-all font-mono">◀</button>
                <button onClick={() => { setClientTab('dashboard'); setTechTab('received'); }} className="text-zinc-500 text-xs hover:text-white transition-all font-mono">●</button>
                <button onClick={() => alert('Simulado: Lista de Tareas en segundo plano (Mantech Active)')} className="text-zinc-500 text-xs hover:text-white transition-all font-mono">■</button>
              </div>
            )}
            
            {/* High fidelity Native Android Bottom Navigation Bar */}
            <div className={`bg-white border-t border-zinc-200 py-1.5 px-3 flex justify-between items-center gap-1 ${showMobileDeviceSimulator ? '' : 'rounded-b-2xl'}`}>
              {role === 'client' ? (
                <>
                  <button onClick={() => setClientTab('dashboard')} className={`flex-1 flex flex-col items-center justify-center p-0.5 font-bold ${clientTab === 'dashboard' ? 'text-indigo-600 font-extrabold' : 'text-zinc-400'}`}>
                    <LayoutDashboard className="w-4 h-4" />
                    <span className="text-[7.5px] uppercase mt-0.5">Equipos</span>
                  </button>
                  <button onClick={() => setClientTab('ai')} className={`flex-1 flex flex-col items-center justify-center p-0.5 font-bold ${clientTab === 'ai' ? 'text-indigo-600 font-extrabold' : 'text-zinc-400'}`}>
                    <Bot className="w-4 h-4 animate-pulse text-indigo-505 text-indigo-500" />
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
        )}

      </div>

      {/* FOOTER */}
      <footer className="bg-white border-t border-zinc-200 py-8 mt-12 text-center text-xs text-zinc-400 space-y-1.5 px-4 shadow-inner">
        <p className="font-bold text-zinc-750 text-zinc-800">Maintly - Intermediario Inteligente de Mantenimiento Residencial, Comercial e Infraestructura TI</p>
        <p className="font-medium text-zinc-500">Copyright © 2026 Maintly LLC. Todos los derechos reservados.</p>
      </footer>

      {/* ASSET REGISTRATION MODAL */}
      <AssetRegisterModal
        isOpen={isAssetModalOpen}
        onClose={() => setIsAssetModalOpen(false)}
        onAdd={handleAddAsset}
      />

      {/* TECH PROFILE VIEW MODAL */}
      <TechnicianProfileModal
        tech={activeTechForModal}
        isOpen={isTechModalOpen}
        onClose={() => setIsTechModalOpen(false)}
        assets={assets}
        onRequestQuote={handleRequestQuote}
      />

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
                <div className="w-full max-w-[320px] bg-black rounded-[40px] p-2.5 border-[8px] border-zinc-850 shadow-xl relative overflow-hidden select-none">
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
                        <div className="w-6 h-6 shrink-0 rounded-lg bg-gradient-to-br from-indigo-550 to-indigo-700 flex items-center justify-center text-white border border-indigo-400/40 shadow-md">
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
                <div className="w-full bg-white rounded-2xl border border-zinc-200 shadow-lg flex flex-col overflow-hidden text-zinc-800">
                  {/* Email Browser Header */}
                  <div className="bg-zinc-100 p-3.5 border-b border-zinc-200">
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
                    
                    <div className="mt-4 space-y-2 text-xs text-left pb-1">
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
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-[11px] text-amber-955 mt-2 space-y-1">
                          <p className="font-extrabold text-amber-900 flex items-center gap-1">⚠️ ATENCIÓN: Correo Real de Gmail Desconectado</p>
                          <p className="font-medium text-amber-850">
                            Como todavía no has ingresado la contraseña de aplicaciones de 16 caracteres, el sistema está usando un simulador virtual. 
                            <strong> Genera tu clave en Google, ingrésala en la sección de abajo y te llegará el correo real al instante.</strong>
                          </p>
                        </div>
                      )}

                      <p className="border-t border-zinc-200/60 pt-1.5"><span className="font-bold text-zinc-500">Asunto:</span> <span className="font-black text-zinc-900">⚠️ Atención Requerida: Alerta Crítica para tu Activo {testNotification.assetName}</span></p>
                    </div>
                  </div>

                  {/* Collapsible Step-by-Step SMTP Guide & Dynamic Admin Form */}
                  {showSmtpInstructions && (
                    <div className="bg-zinc-900 text-white p-5 border-y border-zinc-800 text-xs text-left leading-relaxed space-y-4">
                      <h4 className="font-black text-indigo-400 text-sm flex items-center gap-1.5">🚀 Configuración de Servidor de Correo Propio (SMTP)</h4>
                      <p className="text-zinc-300">
                        Configura tu cuenta de <strong>Gmail</strong> u otro proveedor de correo aquí mismo de manera real. Las credenciales se auto-guardan de forma segura en tu navegador local y se usarán para enviar correos directamente a tus clientes reales:
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-zinc-950 p-4 rounded-xl border border-zinc-850">
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
                            <label className="block text-[10px] font-bold text-zinc-400 uppercase">Contraseña de Aplicación de Gmail (SMTP Pass)</label>
                            <button
                              type="button"
                              onClick={() => setShowSmtpPasswordText(!showSmtpPasswordText)}
                              className="text-[9px] text-indigo-400 hover:underline font-extrabold cursor-pointer"
                            >
                              {showSmtpPasswordText ? "Ocultar clave" : "Mostrar clave"}
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
                            placeholder="Introduce la contraseña de 16 letras..." 
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

                      <div className="bg-zinc-850 p-3 rounded-lg border border-zinc-800 text-[11px] text-zinc-300">
                        💡 <strong>¿Cómo obtener tu contraseña de Gmail de 16 letras? (Como en tu captura de pantalla de Google)</strong>
                        <ol className="list-decimal pl-4 mt-1 space-y-1">
                          <li>Entra a tu <a href="https://myaccount.google.com/" target="_blank" rel="noreferrer" className="text-indigo-400 underline font-extrabold hover:text-indigo-350">Cuenta de Google (rubenabregoc@gmail.com)</a>.</li>
                          <li>Ve a la pestaña <strong>Seguridad</strong> y asegúrate de tener activada la <strong>Verificación en 2 pasos</strong>.</li>
                          <li>En la barra de búsqueda de tu cuenta de Google arriba, escribe <strong>Contraseñas de aplicaciones</strong> (App Passwords) y selecciónalo.</li>
                          <li>Genera una clave colocando un nombre como "MantechPro" y Cópiala. Verás un recuadro con <strong>16 letras amarillas</strong>.</li>
                          <li>Pega esas 16 letras en el campo <strong>SMTP Pass</strong> de arriba (sin espacios).</li>
                        </ol>
                      </div>

                      <div className="flex justify-between items-center pt-2">
                        <span className="text-[10px] text-emerald-400 font-bold">✓ Cambios auto-guardados en tu navegador actual</span>
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
                    <div className="bg-indigo-50 border-y border-indigo-200 px-6 py-4.5 text-center text-xs text-indigo-950 flex flex-col items-center justify-center gap-2 animate-pulse">
                      <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                      <p className="font-extrabold text-indigo-900 text-sm">Enviando Correo Real por SMTP...</p>
                      <p className="text-indigo-700 font-semibold text-[11px]">Estableciendo handshake seguro con {smtpHost}...</p>
                    </div>
                  )}

                  {/* Live Email Dispatch Alert Banner */}
                  {emailSentStatus === 'sent-demo' && emailPreviewUrl ? (
                    <div className="bg-emerald-50 border-y border-emerald-300 px-6 py-4.5 text-center text-xs text-emerald-950">
                      <p className="font-black text-sm mb-1 text-emerald-900">📬 ¡Correo de Demostración Enviado con Éxito!</p>
                      <p className="mb-3 font-semibold text-emerald-800 leading-normal">Como no has definido una clave SMTP válida, hemos despachado un buzón interactivo de simulación temporal para que puedas ver la alerta:</p>
                      <div className="flex flex-col sm:flex-row justify-center items-center gap-2">
                        <a 
                          href={emailPreviewUrl} 
                          target="_blank" 
                          referrerPolicy="no-referrer"
                          rel="noopener noreferrer" 
                          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-5 py-2.5 rounded-xl transition-all shadow-sm active:scale-95 text-xs text-center border border-emerald-500"
                        >
                          <MailOpen className="w-4 h-4" />
                          Abrir Correo de Pruebas (Ethereal)
                        </a>
                        <button 
                          onClick={() => setShowSmtpInstructions(true)}
                          className="text-[11px] underline text-indigo-700 font-bold hover:text-indigo-950 cursor-pointer"
                        >
                          Configurar para enviar a mi Gmail real
                        </button>
                      </div>
                    </div>
                  ) : emailSentStatus === 'sent-real' ? (
                    <div className="bg-emerald-50 border-y border-emerald-300 px-6 py-4.5 text-center text-xs text-emerald-950">
                      <p className="font-black text-sm mb-1 text-emerald-900">🚀 ¡Correo Real Recibido!</p>
                      <p className="font-bold text-emerald-800 leading-normal">Hemos enviado el correo electrónico HTML interactivo usando tu remitente de Gmail directamente a <strong className="text-emerald-950 underline">{customEmailInput}</strong>. ¡Revisa tu bandeja de entrada!</p>
                    </div>
                  ) : emailSentStatus === 'error' ? (
                    <div className="bg-rose-50 border-y border-rose-300 px-6 py-4.5 text-center text-xs text-rose-955">
                      <p className="font-black text-sm mb-1 text-rose-900">❌ Error al Entregar Correo de Gmail</p>
                      <p className="mb-3 font-semibold text-rose-800 leading-normal">
                        Tu proveedor de correo (Gmail/SMTP) rechazó la conexión. Posibles causas:
                      </p>
                      <div className="text-left max-w-md mx-auto bg-white border border-rose-200/60 p-3 rounded-xl text-[11px] text-rose-900 font-medium space-y-1 mb-3">
                        <p>1. Ingresaste la <strong>clave normal</strong> de Gmail en vez de la <strong>Contraseña de Aplicación de 16 letras</strong>.</p>
                        <p>2. Hubo un error al escribir o copiar el correo remitente o la contraseña.</p>
                        <p>3. Cambiaste de contraseña de Google, lo que invalida tus claves de aplicaciones anteriores.</p>
                        <p className="font-mono bg-zinc-900 text-rose-400 p-2 rounded-lg text-[10px] break-all border border-zinc-850 font-bold">
                          Error devuelto: {lastEmailError}
                        </p>
                      </div>
                      <button 
                        onClick={() => setShowSmtpInstructions(true)}
                        className="bg-rose-600 hover:bg-rose-700 text-white font-extrabold px-4 py-2 rounded-xl transition-all cursor-pointer text-xs shadow-sm active:scale-95 border border-rose-500"
                      >
                        🔧 Corregir Configuración SMTP
                      </button>
                    </div>
                  ) : null}

                  {/* Pure HTML Styled Email Mockup */}
                  <div className="p-6 bg-zinc-50 text-left space-y-5">
                    <div className="max-w-md mx-auto bg-white border border-zinc-150 p-6 rounded-2xl shadow-xs space-y-4">
                      {/* Brand Header */}
                      <div className="text-center border-b border-zinc-100 pb-4">
                        <span className="text-lg font-black tracking-tight text-zinc-950">Mantech<span className="text-indigo-600">Pro</span></span>
                        <span className="block text-[8px] text-zinc-405 text-zinc-400 uppercase font-black tracking-widest mt-0.5">Asistente de Activos</span>
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
                          className="w-full block text-center bg-indigo-600 hover:bg-indigo-750 text-white font-extrabold py-3 px-4 rounded-xl text-xs transition-all shadow-md shadow-indigo-100 active:scale-98 cursor-pointer"
                        >
                          ⚡ Agendar con 1-Clic
                        </button>
                        <span className="block text-center text-[9px] text-zinc-400 mt-2 font-bold select-none">
                          Se te redirigirá a MantechPro con las ofertas técnicas ya filtradas.
                        </span>
                      </div>
                      
                      <div className="border-t border-zinc-150 pt-4 text-[9px] text-zinc-400 space-y-1 text-center font-medium">
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

