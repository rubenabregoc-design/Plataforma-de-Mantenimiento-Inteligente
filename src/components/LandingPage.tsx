import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { ShieldCheck, Zap, Globe, MessageSquare, CheckCircle2, Star, ArrowRight, PlayCircle, Users, Activity, Package, Building2, Smartphone, DollarSign, Truck, Fuel, QrCode, CreditCard, FileText, AlertTriangle, BrainCircuit, X, Droplets, Cpu, Wind, ChevronLeft, ChevronRight, Home, Check, LayoutDashboard, Wrench, MapPin, Briefcase, Search, PieChart, Lock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Logo from './Logo';
import Chatbot247 from './Chatbot247';
import ModuleShowcase from './ModuleShowcase';
import AppScreensShowcase from './AppScreensShowcase';
import Footer from './Footer';
import LegalModal from './LegalModal';
import MarketingBanner from './MarketingBanner';

interface LandingPageProps {
  onStart: () => void;
  onWatchDemo: () => void;
  assets?: any[];
  requests?: any[];
}

export default function LandingPage({ onStart, onWatchDemo, assets = [], requests = [] }: LandingPageProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = React.useState('logistica');
  const [currentPromo, setCurrentPromo] = React.useState(0);
  const [isChatbotOpen, setIsChatbotOpen] = React.useState(false);
  const [chatbotMode, setChatbotMode] = React.useState<'general' | 'sales'>('general');
  const [footerDetail, setFooterDetail] = React.useState<any>(null);
  const [legalModal, setLegalModal] = React.useState<{isOpen: boolean, type: 'privacy' | 'terms'}>({ isOpen: false, type: 'privacy' });

  // --- LÓGICA DE TÚNELES (V6.3.0) ---
  const [diagCategory, setDiagCategory] = React.useState('tecnico_ac');
  const [diagSymptom, setDiagSymptom] = React.useState('');
  const [numAssets, setNumAssets] = React.useState(10);
  const [useIntensity, setUseIntensity] = React.useState(1);

  const diagData: any = {
    tecnico_ac: {
      label: 'Aire Acondicionado',
      symptoms: [
        { s: 'No enfría lo suficiente', r: 'Nivel de refrigerante bajo o condensador obstruido. Requiere Limpieza Química.', code: 'ac_low_cool' },
        { s: 'Gotea agua en el interior', r: 'Drenaje obstruido por sedimentos. Requiere protocolo de desobstrucción.', code: 'ac_leak' },
        { s: 'Ruido excesivo / Vibración', r: 'Fallo en rodamientos de motor o aspas desbalanceadas. Riesgo de fallo total.', code: 'ac_noise' }
      ]
    },
    plomero: {
      label: 'Plomería',
      symptoms: [
        { s: 'Baja presión de agua', r: 'Fallo en sistema de bombeo o filtración en tubería madre.', code: 'plumb_low' },
        { s: 'Olor a humedad persistente', r: 'Filtración oculta detectada. Requiere auditoría de cámara térmica.', code: 'plumb_smell' }
      ]
    }
  };

  const calculateROI = () => {
    const costEmergency = numAssets * 250;
    const costMantech = (numAssets * 45) + (29 * 12);
    return Math.max(0, costEmergency - costMantech);
  };

  const handleIntention = (type: string, data: any) => {
    localStorage.setItem('mantech_intent', JSON.stringify({ type, ...data }));
    onStart();
  };

  const tabData: Record<string, any> = {
    logistica: {
      title: t('landing_logistica_title'),
      subtitle: t('landing_logistica_subtitle'),
      description: t('landing_logistica_desc'),
      features: [
        { t: t('live_tracking', 'Visibilidad Real'), d: t('live_tracking_desc', "Sepa dónde está cada unidad y reciba alertas de mantenimiento preventivo automáticas.") },
        { t: t('obd_diag', 'Salud del Vehículo'), d: t('obd_diag_desc', "Detectamos fallos de motor antes de que se conviertan en reparaciones costosas.") },
        { t: t('prevent_alerts', 'Rutas Seguras'), d: t('prevent_alerts_desc', "Optimice sus tiempos de entrega con conductores calificados y vehículos certificados.") }
      ],
      image: "https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&q=80&w=1200",
      stats: [
        { v: "100%", l: t('reliability', "Confiabilidad") },
        { v: "24/7", l: t('support', "Soporte") },
        { v: "PA", l: t('coverage', "Cobertura") }
      ],
      color: "#52ffac",
      productiveMsg: t('monitoring_active', "Logística Bajo Control")
    },
    auditoria: {
      title: t('landing_auditoria_title'),
      subtitle: t('landing_auditoria_subtitle'),
      description: t('landing_auditoria_desc'),
      features: [
        { t: t('industrial_mgmt', 'Mantenimiento Experto'), d: t('industrial_mgmt_desc', "Técnicos certificados para plantas eléctricas, ascensores y maquinaria industrial.") },
        { t: t('plumbing_pro', 'Ahorro Energético'), d: t('plumbing_pro_desc', "Reduzca costos operativos mediante auditorías de consumo y eficiencia de activos.") },
        { t: t('energy_eff', 'Cero Interrupciones'), d: t('energy_eff_desc', "Evite paros técnicos inesperados que afecten su producción o la comodidad de su PH.") }
      ],
      image: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=1200",
      stats: [
        { v: "-25%", l: t('savings', "Ahorro") },
        { v: "IA", l: t('predictive', "IA") },
        { v: "99.9%", l: "Uptime" }
      ],
      color: "#5d3cfe",
      productiveMsg: t('no_leaks', "Activos Certificados")
    },
    b2b: {
      title: t('landing_b2b_title'),
      subtitle: t('landing_b2b_subtitle'),
      description: t('landing_b2b_desc'),
      features: [
        { t: t('granular_perms', 'Administración Ágil'), d: t('granular_perms_desc', "Toda la información de sus activos en un solo lugar, accesible desde cualquier dispositivo.") },
        { t: t('bulk_excel', 'Informes Ejecutivos'), d: t('bulk_excel_desc', "Reportes financieros y de cumplimiento listos para juntas directivas o auditorías.") },
        { t: t('audit_reports', 'Transparencia Total'), d: t('audit_reports_desc', "Historial inalterable de cada trabajo realizado con fotos y marcas de tiempo GPS.") }
      ],
      image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1200",
      stats: [
        { v: "Multi", l: t('locations', "Sedes") },
        { v: "Admin+", l: t('control', "Control") },
        { v: "Pro", l: t('tools', "Herramientas") }
      ],
      color: "#e11d48",
      productiveMsg: t('fleet_online', "Gestión Profesional")
    },
    seguridad: {
      title: t('landing_security_title'),
      subtitle: t('landing_security_subtitle'),
      description: t('landing_security_desc'),
      features: [
        { t: t('escrow_system', 'Pagos Protegidos'), d: t('escrow_system_desc', "Su dinero está seguro. El técnico solo cobra cuando usted firma la conformidad del trabajo.") },
        { t: t('tech_security', 'Personal Verificado'), d: t('tech_security_desc', "Validamos antecedentes penales e identidad de cada profesional en nuestra red.") },
        { t: t('mantech_id_val', 'Garantía MantechPro'), d: t('mantech_id_val_desc', "Respaldo total en cada servicio contratado a través de nuestra plataforma.") }
      ],
      image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1200",
      stats: [
        { v: "100%", l: t('secure', "Seguro") },
        { v: "Bio", l: t('verified', "Verificado") },
        { v: "Garantía", l: t('backed', "Respaldado") }
      ],
      color: "#f59e0b",
      productiveMsg: t('escrow_active', "Protección de Grado Bancario")
    }
  };

  const footerContentData: Record<string, any> = {
    "Quiénes Somos": {
      title: "Identidad MantechPro",
      desc: "MantechPro nace en Panamá como la primera infraestructura digital de ingeniería operativa. No somos solo una plataforma, somos el ecosistema que conecta la demanda técnica con especialistas certificados, asegurando que cada activo en el país opere al 100% de su capacidad.",
      points: ["Ingeniería de Grado Industrial", "Talento Panameño Certificado", "Tecnología Satelital"],
      icon: Users
    },
    "Mantenimiento HVAC": {
      title: "Soluciones de Climatización",
      desc: "Protocolos avanzados de mantenimiento preventivo y correctivo para sistemas de aire acondicionado central, split e industriales. Optimizamos el consumo energético y extendemos la vida útil de sus equipos.",
      points: ["Limpieza Química Profunda", "Recarga de Refrigerante Ecológico", "Auditoría de Consumo Amp"],
      icon: Wind
    },
    "Gestión de Flota": {
      title: "Logística Inteligente",
      desc: "Control total sobre sus activos móviles. Integramos rastreo satelital con telemetría de motor para prevenir fallos mecánicos antes de que detengan su operación comercial.",
      points: ["Rastreo en Tiempo Real", "Alertas de Mantenimiento por KM", "Control de Conductores"],
      icon: Truck
    },
    "Mantech ID": {
      title: "Identidad Legal Verificada",
      desc: "El corazón de nuestra seguridad. Cada técnico en MantechPro posee un ID digital vinculado a su cédula y récord policivo actualizado en tiempo real, garantizando confianza total al cliente.",
      points: ["Validación Biométrica", "Filtro Legal Estricto", "Sello de Confianza Gold"],
      icon: ShieldCheck
    },
    "Protocolo de Seguridad": {
      title: "Blindaje de Servicios",
      desc: "Nuestros protocolos aseguran que cada transacción y visita técnica esté protegida. Desde pagos en Escrow hasta seguimiento GPS de la ruta del técnico hacia su ubicación.",
      points: ["Pagos Protegidos", "Seguro de Incidencias", "Auditoría Inalterable"],
      icon: Zap
    },
    "Auditoría Eléctrica": {
      title: "Ingeniería de Potencia",
      desc: "Inspecciones técnicas de paneles, plantas eléctricas y sistemas de respaldo. Identificamos puntos calientes mediante termografía para evitar incendios y paros técnicos.",
      points: ["Termografía Infrarroja", "Balance de Cargas", "Certificación Técnica"],
      icon: Zap
    },
    "MantechPro Business": {
      title: "Soluciones Corporativas",
      desc: "Diseñado para administraciones de PH, centros comerciales y grandes industrias. Un solo panel para gestionar miles de activos con reportes ejecutivos listos para juntas directivas.",
      points: ["Multi-Sede PH Root", "API Personalizada", "Soporte VIP 24/7"],
      icon: Building2
    },
    "Cobertura en Panamá": {
      title: "Red de Soporte Nacional",
      desc: "Contamos con una red desplegada en las principales provincias: Panamá, Colón, Chiriquí y Provincias Centrales. Tiempo de respuesta promedio menor a 60 minutos en áreas metropolitanas.",
      points: ["Disponibilidad 24/7", "Respuesta Inmediata", "Logística Local"],
      icon: MapPin
    },
    "Logística": {
      title: "Comando Logístico Master",
      desc: "Gestión avanzada de activos móviles y flotas. Integramos telemetría satelital con nuestro modelo MDM-V4 para asegurar que su logística en Panamá sea la más eficiente y segura del mercado.",
      points: ["Rastreo Satelital Milimétrico", "Auditoría de Combustible", "Control de Conductores"],
      icon: Truck
    },
    "Auditoría": {
      title: "Auditoría Técnica de Activos",
      desc: "Protocolos de inspección industrial para asegurar la continuidad de su negocio. Desde plantas eléctricas hasta sistemas HVAC complejos, auditamos cada nodo para prevenir paros técnicos.",
      points: ["Termografía Preventiva", "Certificados de Salud", "Cumplimiento Normativo"],
      icon: Zap
    },
    "B2B": {
      title: "Ecosistema Corporativo B2B",
      desc: "Soluciones diseñadas para la alta gerencia y administraciones masivas. Un solo panel de control para gestionar múltiples sedes con flujos de aprobación financiera integrados.",
      points: ["Multi-Sede PH Root", "Aprobación Corporativa", "Reportes Ejecutivos"],
      icon: Building2
    },
    "Seguridad": {
      title: "Blindaje Operativo Master",
      desc: "Seguridad de grado militar para su infraestructura. Desde la validación biométrica de técnicos hasta el cifrado de cada transacción financiera vía Escrow digital.",
      points: ["Mantech ID Verificado", "Pagos Protegidos (Escrow)", "Auditoría GPS Inalterable"],
      icon: ShieldCheck
    },
    "Inversionistas": {
      title: "MantechPro Capital",
      desc: "Somos la infraestructura tecnológica de mayor crecimiento en el sector de servicios industriales en Panamá. Nuestra plataforma digitaliza un mercado de más de $500M anuales en mantenimiento operativo, ofreciendo escalabilidad sin precedentes y retornos sólidos basados en eficiencia real.",
      points: ["Modelo SaaS Escalable", "Transparencia Financiera", "Expansión Regional"],
      icon: DollarSign
    },
    "Blog Industrial": {
      title: "Knowledge Center",
      desc: "Su fuente oficial de tendencias en ingeniería operativa, optimización de flotas y normativas de seguridad industrial en Panamá. Aprenda cómo la Inteligencia Artificial está transformando el mantenimiento preventivo en centros logísticos y PHs.",
      points: ["Casos de Éxito", "Guías Técnicas", "Reportes de Industria"],
      icon: FileText
    },
    "Carreras": {
      title: "Únete al Equipo Master",
      desc: "¿Eres un apasionado de la tecnología o un ingeniero de élite? En MantechPro estamos construyendo el futuro del soporte operativo. Buscamos mentes brillantes para nuestras áreas de desarrollo de software, auditoría de campo y gestión logística.",
      points: ["Cultura de Innovación", "Crecimiento Exponencial", "Impacto Nacional"],
      icon: Briefcase
    },
    "Monitor de Activos": {
      title: "Control Central de Ingeniería",
      desc: "Gestione la salud y el rendimiento de toda su infraestructura técnica desde un solo panel. El Monitor de Activos integra telemetría en tiempo real y expedientes digitales para una supervisión total.",
      points: ["Visibilidad 360º", "Alertas Preventivas", "Historial Digital"],
      icon: LayoutDashboard
    },
    "Marketplace de Subasta": {
      title: "Subasta Prioritaria de Servicios",
      desc: "Acceda a la red más grande de técnicos certificados en Panamá. Publique sus requerimientos y permita que el algoritmo de subasta encuentre la mejor relación costo-calidad para su empresa.",
      points: ["Ahorro Transaccional", "Técnicos Verificados", "Selección por Reputación"],
      icon: Search
    },
    "Centro de Seguridad ID": {
      title: "Protocolo de Identidad Mantech",
      desc: "La seguridad es nuestro pilar fundamental. Cada interacción está protegida por un sistema de validación de identidad biométrica y legal, asegurando que solo personal de élite ingrese a su propiedad.",
      points: ["Validación de Récord Policivo", "Cédula Digital Verificada", "Control de Acceso Auditado"],
      icon: ShieldCheck
    },
    "Billetera & Escrow": {
      title: "Pagos Blindados MantechPro",
      desc: "Infraestructura financiera segura para sus transacciones técnicas. Los fondos se mantienen en custodia digital y solo se liberan tras su firma de conformidad, eliminando riesgos de fraude.",
      points: ["Custodia de Fondos (Escrow)", "Pagos vía Yappy/PayPal", "Transparencia de Facturación"],
      icon: CreditCard
    }
  };

  const current = tabData[activeTab];

  const handleFooterLinkClick = (link: string) => {
    if (footerContentData[link]) {
      setFooterDetail(footerContentData[link]);
      return;
    }

    if (link === "Solicitar Técnico" || link === "Inscribir mi Empresa" || link === "Registrarme como Técnico") {
      onStart();
      return;
    }

    const sectionJumps: Record<string, string> = {
      "Mantenimiento HVAC": "auditoria",
      "Auditoría Eléctrica": "auditoria",
      "Gestión de Flota": "logistica",
      "Soporte IT": "logistica",
      "MantechPro Business": "b2b",
      "Protocolo de Seguridad": "seguridad",
      "Sello de Ingeniería": "seguridad",
    };

    if (sectionJumps[link]) {
      setActiveTab(sectionJumps[link]);
      const el = document.getElementById('soluciones');
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      toast.success(`Sección: ${link}`, { icon: '🔍' });
    } else if (link === "Privacidad") {
      setLegalModal({ isOpen: true, type: 'privacy' });
    } else if (link === "Términos Legales") {
      setLegalModal({ isOpen: true, type: 'terms' });
    } else {
      toast("Acceso administrativo restringido.", { icon: '🔐' });
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0e12] text-[#e3e2e8] font-sans selection:bg-[#5d3cfe] selection:text-white overflow-x-hidden">

      {/* 1. NAVEGACIÓN FLOTANTE */}
      <nav className="fixed top-0 left-0 right-0 z-[100] px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between bg-[#121317]/80 backdrop-blur-xl border border-white/5 px-4 sm:px-8 py-2.5 sm:py-3 rounded-full shadow-2xl">
          <Logo size="sm" />
          <div className="hidden lg:flex items-center gap-10">
            <button onClick={() => handleFooterLinkClick('Logística')} className="text-[10px] font-black uppercase tracking-widest text-[#c8c4d9] hover:text-[#5d3cfe] transition-all">Logística</button>
            <button onClick={() => handleFooterLinkClick('Auditoría')} className="text-[10px] font-black uppercase tracking-widest text-[#c8c4d9] hover:text-[#5d3cfe] transition-all">Auditoría</button>
            <button onClick={() => handleFooterLinkClick('B2B')} className="text-[10px] font-black uppercase tracking-widest text-[#c8c4d9] hover:text-[#5d3cfe] transition-all">B2B</button>
            <button onClick={() => handleFooterLinkClick('Seguridad')} className="text-[10px] font-black uppercase tracking-widest text-[#c8c4d9] hover:text-[#5d3cfe] transition-all">Seguridad</button>
          </div>
          <button
            onClick={onStart}
            className="px-5 sm:px-6 py-2 sm:py-2.5 bg-[#5d3cfe] text-white rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest shadow-xl shadow-[#5d3cfe]/20 hover:brightness-110 active:scale-95 transition-all"
          >
            Ingresar ➔
          </button>
        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <section className="relative pt-20 sm:pt-28 pb-16 sm:pb-24 px-6 sm:px-8 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none">
           <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-[#5d3cfe]/10 rounded-full blur-[120px] animate-pulse"></div>
        </div>

        <div className="max-w-6xl mx-auto relative z-10 text-center space-y-4 sm:space-y-6">
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-full backdrop-blur-md">
             <div className="w-2 h-2 rounded-full bg-[#52ffac] animate-pulse"></div>
             <span className="text-[8px] sm:text-[9px] font-black text-white uppercase tracking-widest">Red de Mantenimiento #1 de Panamá</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-8xl font-black text-white tracking-tighter leading-[1] sm:leading-[0.9] uppercase">
            Todo Bajo Control <br />
            <span className="text-[#5d3cfe] block mt-2">Casa, PH y Empresa.</span>
          </h1>

          <p className="max-w-3xl mx-auto text-[#c8c4d9] text-sm sm:text-base md:text-2xl font-medium leading-relaxed opacity-95">
            La infraestructura de servicios #1 de Panamá para el hogar, la gran empresa y centros logísticos. Gestión inteligente de activos con respaldo certificado.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5">
             <button onClick={onStart} className="w-full sm:w-auto px-8 sm:px-10 py-4 sm:py-5 bg-[#5d3cfe] text-white rounded-[1.5rem] sm:rounded-[2rem] text-xs font-black uppercase tracking-[0.2em] shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-4">
               Solicitar Soporte Ahora <ArrowRight className="w-4 h-4" />
             </button>
             <button onClick={onWatchDemo} className="w-full sm:w-auto px-8 sm:px-10 py-4 sm:py-5 bg-[#121317] border border-white/10 text-white rounded-[1.5rem] sm:rounded-[2rem] text-xs font-black uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-all flex items-center justify-center gap-4">
               <PlayCircle className="w-4 h-4" /> Ver Demo
             </button>
          </div>
        </div>
      </section>

      {/* 2.5 BANNER PUBLICITARIO / PROMO */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 mb-16 sm:mb-24">
         <MarketingBanner placement="landing" />
      </div>

      {/* --- TÚNELES DE CONVERSIÓN INDUSTRIAL (V6.3.0) --- */}
      <section className="py-32 px-8 bg-black/40">
        <div className="max-w-7xl mx-auto mb-20 text-center space-y-6">
           <p className="text-[10px] font-black text-[#5d3cfe] uppercase tracking-[0.4em]">Optimización Activa</p>
           <h2 className="text-4xl md:text-7xl font-black text-white uppercase tracking-tighter leading-tight">Herramientas de <span className="text-[#52ffac]">Ingeniería Viva</span></h2>
           <p className="max-w-3xl mx-auto text-[#c8c4d9] text-base md:text-xl font-medium leading-relaxed opacity-60">Utilice nuestros motores de lógica industrial para diagnosticar fallas, calcular su retorno de inversión y digitalizar la protección de sus activos en tiempo real.</p>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">

           {/* TÚNEL 1: DIAGNÓSTICO LÓGICO */}
           <div className="bg-[#121317] border border-white/5 rounded-[3rem] p-10 flex flex-col justify-between shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#5d3cfe]/5 blur-2xl rounded-full -mr-10 -mt-10"></div>
              <div className="space-y-6 relative z-10">
                 <div className="flex items-center gap-3">
                    <div className="p-3 bg-[#5d3cfe]/10 rounded-2xl"><Search className="w-5 h-5 text-[#5d3cfe]" /></div>
                    <h4 className="text-sm font-black text-white uppercase tracking-widest">Protocolo de Diagnóstico</h4>
                 </div>
                 <div className="space-y-4">
                    <select value={diagCategory} onChange={(e) => setDiagCategory(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-xs font-bold text-white outline-none focus:border-[#5d3cfe]">
                       <option value="tecnico_ac">Sistemas HVAC</option>
                       <option value="plomero">Sistemas Hidráulicos</option>
                    </select>
                    <div className="space-y-2">
                       {diagData[diagCategory].symptoms.map((s: any, i: number) => (
                         <button key={i} onClick={() => setDiagSymptom(s.r)} className={`w-full text-left p-4 rounded-2xl border transition-all text-[10px] font-bold uppercase tracking-tight ${diagSymptom === s.r ? 'bg-[#5d3cfe] border-[#5d3cfe] text-white shadow-lg' : 'bg-white/5 border-white/5 text-[#474556] hover:border-white/20'}`}>
                           {s.s}
                         </button>
                       ))}
                    </div>
                 </div>
              </div>
              <div className="mt-8 pt-8 border-t border-white/5 space-y-6">
                 <p className="text-[10px] text-[#c8c4d9] font-medium leading-relaxed italic">{diagSymptom || 'Seleccione un síntoma para ver la recomendación técnica de ingeniería.'}</p>
                 <button onClick={() => handleIntention('diag_request', { cat: diagCategory })} className="w-full py-4 bg-[#5d3cfe] text-white rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-xl hover:scale-105 transition-all">Solicitar Especialista Certificado</button>
              </div>
           </div>

           {/* TÚNEL 2: CALCULADORA ROI */}
           <div className="bg-[#121317] border border-white/5 rounded-[3rem] p-10 flex flex-col justify-between shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#52ffac]/5 blur-2xl rounded-full -mr-10 -mt-10"></div>
              <div className="space-y-8 relative z-10">
                 <div className="flex items-center gap-3">
                    <div className="p-3 bg-[#52ffac]/10 rounded-2xl"><PieChart className="w-5 h-5 text-[#52ffac]" /></div>
                    <h4 className="text-sm font-black text-white uppercase tracking-widest">Calculadora ROI 2026</h4>
                 </div>
                 <div className="space-y-6">
                    <div className="space-y-3">
                       <div className="flex justify-between text-[9px] font-black uppercase text-[#474556] tracking-widest">
                          <span>Unidades / Activos</span>
                          <span className="text-[#52ffac]">{numAssets}</span>
                       </div>
                       <input type="range" min="1" max="100" value={numAssets} onChange={(e) => setNumAssets(Number(e.target.value))} className="w-full h-1.5 bg-white/5 rounded-lg appearance-none cursor-pointer accent-[#52ffac]" />
                    </div>
                    <div className="p-6 bg-black/40 rounded-3xl border border-white/5 text-center">
                       <p className="text-[8px] font-black text-[#474556] uppercase tracking-[0.4em] mb-2">Ahorro Anual Estimado</p>
                       <p className="text-5xl font-black text-white tracking-tighter italic leading-none">${calculateROI().toLocaleString()}</p>
                    </div>
                 </div>
              </div>
              <div className="mt-8 space-y-4">
                 <p className="text-[9px] text-[#8a879d] leading-relaxed text-center">Basado en la reducción de paros técnicos y costos de emergencia en Panamá.</p>
                 <button onClick={() => handleIntention('plan_upgrade', {})} className="w-full py-4 bg-[#52ffac] text-black rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-xl hover:scale-105 transition-all">Activar Plan Enterprise</button>
              </div>
           </div>

           {/* TÚNEL 3: BÓVEDA DE GARANTÍAS */}
           <div className="bg-[#121317] border border-white/5 rounded-[3rem] p-10 flex flex-col justify-between shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-2xl rounded-full -mr-10 -mt-10"></div>
              <div className="space-y-6 relative z-10">
                 <div className="flex items-center gap-3">
                    <div className="p-3 bg-amber-500/10 rounded-2xl"><ShieldCheck className="w-5 h-5 text-amber-500" /></div>
                    <h4 className="text-sm font-black text-white uppercase tracking-widest">Bóveda de Garantías</h4>
                 </div>
                 <div className="bg-black/60 aspect-video rounded-3xl border border-white/5 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10 flex flex-wrap gap-2 p-4">
                       {[...Array(20)].map((_, i) => <FileText key={i} className="w-4 h-4" />)}
                    </div>
                    <Lock className="w-12 h-12 text-amber-500 relative z-10 animate-pulse" />
                 </div>
                 <h3 className="text-xl font-black text-white uppercase tracking-tighter italic">¿Facturas perdidas? <br /><span className="text-amber-500">Nunca más.</span></h3>
                 <p className="text-[10px] text-[#8a879d] leading-relaxed">Suba sus facturas de Do It Center, Cochez o Panafoto y reciba alertas antes de que expiren. Es gratis.</p>
              </div>
              <button onClick={() => handleIntention('warranty_vault', {})} className="w-full py-4 bg-white text-black rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-xl hover:scale-105 transition-all mt-8">Activar mi Bóveda Gratis</button>
           </div>

        </div>
      </section>

      {/* 3. PUBLICIDAD DINÁMICA (SOCIAL PROOF) */}
      <section className="py-16 bg-black/40 border-y border-white/5 overflow-hidden">
        <div className="animate-marquee flex items-center gap-12 whitespace-nowrap">
          {[
            { t: "Freightliner Panama", i: Truck, c: "text-blue-500" },
            { t: "Dell PowerEdge", i: Cpu, c: "text-[#5d3cfe]" },
            { t: "Caterpillar PA", i: Zap, c: "text-amber-500" },
            { t: "Solar Pro Hub", i: Fuel, c: "text-rose-500" },
            { t: "PH Costa Este", i: Building2, c: "text-indigo-400" },
            { t: "Inverter Master", i: Wind, c: "text-[#52ffac]" }
          ].concat([
            { t: "Freightliner Panama", i: Truck, c: "text-blue-500" },
            { t: "Dell PowerEdge", i: Cpu, c: "text-[#5d3cfe]" },
            { t: "Caterpillar PA", i: Zap, c: "text-amber-500" },
            { t: "Solar Pro Hub", i: Fuel, c: "text-rose-500" },
            { t: "PH Costa Este", i: Building2, c: "text-indigo-400" },
            { t: "Inverter Master", i: Wind, c: "text-[#52ffac]" }
          ]).map((ad, i) => (
            <div key={i} className="flex items-center gap-4 px-10">
               <ad.i className={`w-5 h-5 ${ad.c}`} />
               <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">{ad.t}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 4. CONSOLA DE SOLUCIONES (THE HOW) */}
      <section id="soluciones" className="py-32 px-8 bg-gradient-to-b from-[#0d0e12] to-[#121317] scroll-mt-32">
        <div className="max-w-7xl mx-auto space-y-20">
          <div className="text-center space-y-6">
             <p className="text-[10px] font-black text-[#5d3cfe] uppercase tracking-[0.4em]">Ecosistema Maestro V4</p>
             <h2 className="text-4xl md:text-7xl font-black text-white uppercase tracking-tighter leading-tight">Ingeniería <span className="text-white/20">Aplicada</span></h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-end">
            <div className="lg:col-span-5 space-y-10 animate-fade-in" key={activeTab}>
              <div className="space-y-4">
                <div className="px-4 py-1.5 rounded-full border border-white/10 w-fit text-[9px] font-black uppercase tracking-widest" style={{ color: current.color, backgroundColor: `${current.color}10` }}>
                  {current.subtitle}
                </div>
                <h3 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter leading-none">{current.title}</h3>
                <h4 className="text-sm font-black text-white uppercase tracking-[0.3em] opacity-40">{current.productiveMsg}</h4>
                <p className="text-[#c8c4d9] text-xl font-medium leading-relaxed opacity-80">{current.description}</p>
              </div>
              <div className="space-y-6">
                 {current.features.map((f: any, i: number) => (
                   <div key={i} className="flex gap-6 items-start group">
                      <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                         <CheckCircle2 className="w-6 h-6" style={{ color: current.color }} />
                      </div>
                      <div>
                         <h4 className="text-sm font-black text-white uppercase tracking-tight mb-1">{f.t}</h4>
                         <p className="text-xs text-[#474556] font-bold leading-relaxed">{f.d}</p>
                      </div>
                   </div>
                 ))}
              </div>
            </div>

            <div className="lg:col-span-7 relative animate-fade-in" key={`${activeTab}-img`}>
               <div className="bg-[#121317] border border-white/5 rounded-[4rem] shadow-3xl overflow-hidden relative min-h-[500px] group/container">
                  <img
                    src={current.image}
                    className="w-full h-full min-h-[500px] object-cover transition-all duration-1000 group-hover/container:scale-105"
                    alt="Solution"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"></div>

                  <div className="absolute bottom-8 left-8 bg-[#121317]/90 backdrop-blur-2xl p-6 rounded-[2.5rem] border border-white/10 space-y-3 max-w-[220px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all hover:scale-105 group/card z-20">
                     <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#52ffac]/10 flex items-center justify-center border border-[#52ffac]/20 group-hover/card:animate-pulse">
                           <ShieldCheck className="w-4 h-4 text-[#52ffac]" />
                        </div>
                        <span className="text-[9px] font-black text-white uppercase tracking-[0.2em]">Activo Protegido</span>
                     </div>
                     <div className="space-y-1">
                        <p className="text-[10px] font-black text-white/40 uppercase tracking-tight">Estatus en Red</p>
                        <p className="text-[11px] font-black text-[#52ffac] uppercase tracking-widest flex items-center gap-2">
                           <span className="w-1.5 h-1.5 bg-[#52ffac] rounded-full"></span>
                           Operativo • Blindado
                        </p>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. MÓDULOS DEL ECOSISTEMA */}
      <ModuleShowcase />

      {/* 4.1 MOSTRAR APP Y PANTALLAS */}
      <AppScreensShowcase onExplore={handleFooterLinkClick} />

      {/* SECCIÓN DETALLADA DE BENEFICIOS (ESTILO CORPORATIVO) */}
      <section className="py-32 px-8 bg-black/20 border-y border-white/5">
        <div className="max-w-7xl mx-auto space-y-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
            {/* PARA CLIENTES */}
            <div className="space-y-12">
               <div className="space-y-4">
                  <div className="flex items-center gap-4">
                     <div className="p-3 bg-white/5 border border-white/10 rounded-2xl text-[#52ffac]">
                        <Building2 className="w-6 h-6" />
                     </div>
                     <h3 className="text-3xl font-black text-white uppercase tracking-tighter">MantechPro <br /><span className="text-[#52ffac]">para Empresas</span></h3>
                  </div>
                  <p className="text-[#c8c4d9] text-lg font-medium opacity-60">La plataforma líder en Panamá para la gestión de activos críticos y flotas industriales.</p>
               </div>
               <div className="space-y-8">
                  {[
                    { t: "Control Centralizado", d: "Gestione múltiples sedes, PHs o flotas desde un solo panel de control maestro.", i: LayoutDashboard },
                    { t: "Auditoría de Combustible", d: "Algoritmos de IA que detectan anomalías y optimizan el ROI operativo en tiempo real.", i: Fuel },
                    { t: "Blindaje de Garantías", d: "Certificados PDF automáticos con firma digital y ubicación GPS inalterable.", i: ShieldCheck }
                  ].map((b, i) => (
                    <div key={i} className="flex gap-6 group">
                       <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-[#52ffac]/10 transition-colors">
                          <b.i className="w-6 h-6 text-[#52ffac]" />
                       </div>
                       <div>
                          <h4 className="text-sm font-black text-white uppercase tracking-tight mb-1">{b.t}</h4>
                          <p className="text-xs text-[#474556] font-bold leading-relaxed">{b.d}</p>
                       </div>
                    </div>
                  ))}
               </div>
               <button onClick={onStart} className="px-10 py-5 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:scale-105 transition-all shadow-xl">Inscribir mi Empresa</button>
            </div>

            {/* PARA TÉCNICOS */}
            <div className="space-y-12">
               <div className="space-y-4">
                  <div className="flex items-center gap-4">
                     <div className="p-3 bg-[#5d3cfe]/10 border border-[#5d3cfe]/20 rounded-2xl text-[#5d3cfe]">
                        <Wrench className="w-6 h-6" />
                     </div>
                     <h3 className="text-3xl font-black text-white uppercase tracking-tighter">MantechPro <br /><span className="text-[#5d3cfe]">para Especialistas</span></h3>
                  </div>
                  <p className="text-[#c8c4d9] text-lg font-medium opacity-60">Potencie su carrera técnica con acceso a los contratos más importantes de Panamá.</p>
               </div>
               <div className="space-y-8">
                  {[
                    { t: "Radar de Demanda Satelital", d: "Reciba solicitudes de servicio en tiempo real basadas en su ubicación exacta (Uber-Style).", i: Smartphone },
                    { t: "Billetera Digital Tech", d: "Cobros instantáneos y gestión de ingresos con comisiones transparentes y bajas.", i: CreditCard },
                    { t: "Sello de Ingeniería Gold", d: "Aumente su prestigio con certificaciones validadas por auditores de MantechPro.", i: Star }
                  ].map((b, i) => (
                    <div key={i} className="flex gap-6 group">
                       <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-[#5d3cfe]/10 transition-colors">
                          <b.i className="w-6 h-6 text-[#5d3cfe]" />
                       </div>
                       <div>
                          <h4 className="text-sm font-black text-white uppercase tracking-tight mb-1">{b.t}</h4>
                          <p className="text-xs text-[#474556] font-bold leading-relaxed">{b.d}</p>
                       </div>
                    </div>
                  ))}
               </div>
               <button onClick={onStart} className="px-10 py-5 bg-[#5d3cfe] text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:scale-105 transition-all shadow-xl">Registrarme como Técnico</button>
            </div>
          </div>
        </div>
      </section>

      {/* SECCIÓN UBER-STYLE RADAR PREVIEW */}
      <section className="py-32 px-8">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-20">
           <div className="lg:w-1/2 space-y-8 text-center lg:text-left">
              <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter leading-none">Despliegue de <br /><span className="text-[#5d3cfe]">Ingeniería en Vivo</span></h2>
              <p className="text-[#c8c4d9] text-xl font-medium opacity-60 leading-relaxed">Nuestra red de técnicos se desplaza por todo el territorio nacional, listos para intervenir en minutos. Visualización satelital protegida.</p>
              <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                 <div className="px-5 py-3 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#52ffac] animate-pulse"></div>
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">128 Técnicos en Línea</span>
                 </div>
                 <div className="px-5 py-3 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-3">
                    <Smartphone className="w-4 h-4 text-[#5d3cfe]" />
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">App Nativa iOS/Android</span>
                 </div>
              </div>
           </div>
           <div className="lg:w-1/2 relative">
              <div className="bg-[#1c1d21] border border-white/5 rounded-[4rem] p-4 shadow-3xl overflow-hidden relative aspect-video">
                 <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=1200" className="w-full h-full object-cover rounded-[3rem] opacity-40 grayscale" alt="Map" />
                 <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative">
                       <div className="w-20 h-20 bg-[#5d3cfe]/20 rounded-full animate-ping absolute -inset-0"></div>
                       <div className="w-20 h-20 bg-[#5d3cfe]/40 rounded-full animate-pulse flex items-center justify-center relative z-10">
                          <Truck className="w-10 h-10 text-white" />
                       </div>
                    </div>
                 </div>
                 {/* Flotante Tech Card */}
                 <div className="absolute top-10 right-10 bg-black/80 backdrop-blur-xl p-4 rounded-3xl border border-white/10 space-y-3 shadow-2xl animate-fade-in-up">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 bg-[#5d3cfe] rounded-xl flex items-center justify-center text-xs font-black text-white">RM</div>
                       <div>
                          <p className="text-[10px] font-black text-white uppercase">Ricardo Mendoza</p>
                          <p className="text-[8px] font-bold text-[#52ffac] uppercase tracking-widest">En Camino • 8 min</p>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* 5. SECTORES (THE WHO) */}
      <section className="py-32 px-8">
        <div className="max-w-7xl mx-auto space-y-20">
          <div className="text-center space-y-4">
             <h2 className="text-4xl md:text-7xl font-black text-white uppercase tracking-tighter">Control <span className="text-white/20">Total</span></h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { t: "Residencial / PH", i: Home, img: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800" },
              { t: "Logística", i: Truck, img: "https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&q=80&w=800" },
              { t: "Planta Industrial", i: Zap, img: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800" },
              { t: "Infraestructura IT", i: Cpu, img: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800" }
            ].map((s, i) => (
              <div key={i} className="group relative overflow-hidden rounded-[3rem] aspect-[4/5] border border-white/5 bg-[#1c1d21]">
                 <img src={s.img} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-70 group-hover:opacity-100" alt="" />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent z-10"></div>
                 <div className="absolute bottom-8 left-8 right-8 flex items-center gap-4 z-20">
                    <div className="p-3 bg-[#5d3cfe] rounded-2xl border border-white/10 text-white shadow-2xl">
                       <s.i className="w-5 h-5" />
                    </div>
                    <h4 className="text-lg font-black text-white uppercase tracking-tight shadow-black drop-shadow-2xl">{s.t}</h4>
                 </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. ADVANTAGES & ROI */}
      <section className="py-32 px-8 bg-[#121317]/50 border-y border-white/5">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-12">
             <div className="space-y-4">
                <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter">Blindaje <br /><span className="text-[#52ffac]">Operativo</span></h2>
                <p className="text-[#c8c4d9] text-xl font-medium opacity-60">Reduzca hasta un 35% sus costos operativos anuales mediante la automatización de auditorías.</p>
             </div>
             <div className="grid grid-cols-2 gap-6">
                {[
                  { t: "Ahorro Combustible", i: Fuel },
                  { t: "Mantech ID", i: ShieldCheck },
                  { t: "Predictive IA", i: BrainCircuit },
                  { t: "SOS Central", i: AlertTriangle }
                ].map((v, i) => (
                  <div key={i} className="bg-black/40 border border-white/5 p-8 rounded-[2.5rem] space-y-4">
                     <v.i className="w-8 h-8 text-[#52ffac]" />
                     <h4 className="text-xs font-black text-white uppercase tracking-widest">{v.t}</h4>
                  </div>
                ))}
             </div>
          </div>
          <div className="bg-gradient-to-br from-[#1c1d21] to-[#0d0e12] border border-white/10 rounded-[4rem] p-12 space-y-8">
             <h3 className="text-2xl font-black text-white uppercase tracking-tight text-center">Retorno de Inversión</h3>
             <div className="space-y-4">
                <div className="flex justify-between items-center p-6 bg-rose-500/5 border border-rose-500/10 rounded-3xl">
                   <span className="text-xs font-bold text-rose-500 uppercase">Sin MantechPro</span>
                   <X className="w-5 h-5 text-rose-500" />
                </div>
                <div className="flex justify-between items-center p-6 bg-[#52ffac]/5 border border-[#52ffac]/10 rounded-3xl">
                   <span className="text-xs font-bold text-[#52ffac] uppercase">Con MantechPro</span>
                   <CheckCircle2 className="w-5 h-5 text-[#52ffac]" />
                </div>
             </div>
             <div className="pt-8 border-t border-white/5 text-center">
                <p className="text-6xl font-black text-white tracking-tighter">35%</p>
                <p className="text-[10px] text-[#474556] font-black uppercase tracking-[0.4em]">Ahorro Promedio Estimado</p>
             </div>
          </div>
        </div>
      </section>

      {/* 7. PRICING */}
      <section className="py-32 px-8">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4">
             <h2 className="text-4xl md:text-7xl font-black text-white uppercase tracking-tighter text-center">Inversión <span className="text-white/20">Master</span></h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
             {[
               { n: "Gratis", p: "0", f: ["Hasta 2 Unidades", "Alertas Básicas", "Diagnóstico Manual", "Soporte Chat Estándar", "Uso Personal"] },
               { n: "Emprendedor", p: "29", f: ["Hasta 5 Unidades", "Rastreo Tiempo Real", "Chatbot de Soporte 24/7", "Alertas de Mantenimiento", "Panel Gestión de Activos"] },
               { n: "Profesional", p: "89", f: ["Hasta 25 Unidades", "Auditoría de Combustible", "Diagnóstico IA Predictivo", "SOS Emergencia Ilimitado", "Reportes Full PDF"], pop: true },
               { n: "Enterprise", p: "199", f: ["Unidades Ilimitadas", "Admin Multi-Edificio", "API para Software", "Seguro de Incidencias", "Prioridad Máxima"] }
             ].map((plan, i) => (
               <div key={i} className={`p-10 rounded-[3rem] border space-y-8 flex flex-col transition-all duration-500 hover:shadow-[0_40px_80px_rgba(0,0,0,0.4)] ${plan.pop ? 'bg-[#5d3cfe] border-[#5d3cfe] lg:scale-105 shadow-3xl' : 'bg-[#1c1d21] border-white/5 hover:border-[#5d3cfe]/30'}`}>
                  <div className="space-y-3">
                     <h4 className={`text-[10px] font-black uppercase tracking-widest ${plan.pop ? 'text-white/60' : 'text-[#474556]'}`}>{plan.n}</h4>
                     <p className="text-4xl font-black text-white tracking-tighter">{plan.p === 'Custom' ? plan.p : `$${plan.p}`}<span className="text-lg opacity-40">/mes</span></p>
                  </div>
                  <ul className="space-y-3 flex-1">
                     {plan.f.map((f, idx) => (
                       <li key={idx} className="flex items-start gap-2 text-[10px] font-bold text-white/90">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#52ffac] shrink-0 mt-0.5" />
                          <span>{f}</span>
                       </li>
                     ))}
                  </ul>
                  <button onClick={onStart} className={`w-full py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${plan.pop ? 'bg-white text-[#5d3cfe] hover:scale-105 shadow-2xl' : 'bg-white/5 text-white hover:bg-white hover:text-black'}`}>Empezar Ahora</button>
               </div>
             ))}
          </div>
        </div>
      </section>

      {/* 8. PROMOCIONES */}
      <section className="pb-32 px-8">
        <div className="max-w-6xl mx-auto bg-black/60 border border-white/5 rounded-[4rem] overflow-hidden flex flex-col lg:flex-row items-center min-h-[450px] relative group">
           {(() => {
              const promos = [
                {
                  tag: "Promoción Especial",
                  title: "RESERVA TU CUPO MANTENIMIENTO HVAC",
                  price: "$75.00",
                  img: "https://images.unsplash.com/photo-1621905251918-48416bd8575a?auto=format&fit=crop&q=80&w=800",
                  slug: 'hvac_promo'
                },
                {
                  tag: "Oferta Logística",
                  title: "DIAGNÓSTICO COMPUTARIZADO DE FLOTA",
                  price: "$49.99",
                  img: "https://images.unsplash.com/photo-1599256621730-535171e28e50?auto=format&fit=crop&q=80&w=800",
                  slug: 'fleet_diag'
                }
              ];
              const p = promos[currentPromo];

              const handlePromoClick = () => {
                // GUARDAR INTENCIÓN PERSISTENTE
                localStorage.setItem('mantech_intent', JSON.stringify({
                  type: 'promo_reservation',
                  id: p.slug,
                  title: p.title,
                  price: p.price
                }));
                onStart(); // Ir al login/registro
              };

              return (
                <>
                  <div className="flex-1 p-12 md:p-20 space-y-8 animate-fade-in" key={currentPromo}>
                    <p className="text-[10px] font-black tracking-[0.4em] text-[#52ffac] uppercase">{p.tag}</p>
                    <h3 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter leading-none">{p.title}</h3>
                    <p className="text-4xl font-black text-white tracking-tighter">SOLO {p.price} <span className="text-sm opacity-40 uppercase tracking-widest">+ ITBMS</span></p>
                    <button onClick={handlePromoClick} className="px-10 py-5 bg-[#52ffac] text-black rounded-2xl text-xs font-black uppercase tracking-[0.2em] hover:scale-105 shadow-[0_10px_30px_rgba(82,255,172,0.3)] transition-all">Reservar Ahora</button>
                  </div>

                  <div className="w-full lg:w-1/2 h-[500px] relative overflow-hidden">
                     <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent z-10 hidden lg:block"></div>
                     <img src={p.img} className="w-full h-full object-cover transition-all duration-700" alt="Promo" />
                  </div>

                  <div className="absolute bottom-10 right-12 flex items-center gap-4 z-20">
                    <button onClick={() => setCurrentPromo(0)} className={`p-4 rounded-full transition-all border ${currentPromo === 0 ? 'bg-[#5d3cfe] border-[#5d3cfe] text-white shadow-lg' : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'}`}><ChevronLeft className="w-5 h-5" /></button>
                    <button onClick={() => setCurrentPromo(1)} className={`p-4 rounded-full transition-all border ${currentPromo === 1 ? 'bg-[#5d3cfe] border-[#5d3cfe] text-white shadow-lg' : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'}`}><ChevronRight className="w-5 h-5" /></button>
                  </div>
                </>
              );
           })()}
        </div>
      </section>

      {/* WHATSAPP & CHATBOT Master */}
      <div className="fixed bottom-6 right-4 sm:bottom-10 sm:right-10 z-[1000] flex flex-col gap-3 sm:gap-4 items-end pointer-events-none">
         {/* Botón Chatbot AI */}
         <button
           onClick={() => { setChatbotMode('general'); setIsChatbotOpen(true); }}
           className="w-12 h-12 sm:w-16 sm:h-16 bg-[#5d3cfe] text-white rounded-full flex items-center justify-center shadow-[0_15px_40px_rgba(93,60,254,0.4)] hover:scale-110 active:scale-95 transition-all group relative pointer-events-auto border-2 border-white/10"
         >
            <MessageSquare className="w-5 h-5 sm:w-7 sm:h-7 fill-current" />
            <div className="absolute -left-32 top-1/2 -translate-y-1/2 bg-white text-black px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-2xl pointer-events-none hidden sm:block">Asistente IA 24/7</div>
         </button>

         {/* Botón Ventas / Cotización Automática */}
         <button
           onClick={() => { setChatbotMode('sales'); setIsChatbotOpen(true); }}
           className="w-12 h-12 sm:w-16 sm:h-16 bg-[#25d366] text-white rounded-full flex items-center justify-center shadow-[0_15px_40px_rgba(37,211,102,0.4)] hover:scale-110 active:scale-95 transition-all group relative pointer-events-auto border-2 border-white/10"
         >
            <DollarSign className="w-5 h-5 sm:w-7 sm:h-7" />
            <div className="absolute -left-40 top-1/2 -translate-y-1/2 bg-white text-black px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-2xl pointer-events-none hidden sm:block">Cotización Inmediata</div>
         </button>
      </div>

      {/* MODAL CHATBOT AI */}
      {isChatbotOpen && (
        <div className="fixed inset-0 z-[2000] bg-[#0d0e12]/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-2xl h-[80vh] relative">
             <button
               onClick={() => setIsChatbotOpen(false)}
               className="absolute top-6 right-6 z-[2100] p-3 bg-white/10 hover:bg-rose-600 text-white rounded-2xl border border-white/10 backdrop-blur-xl transition-all active:scale-90 group"
             >
               <X className="w-6 h-6 group-hover:rotate-90 transition-transform" />
             </button>
             <div className="w-full h-full bg-[#121317] border border-white/10 rounded-[4rem] overflow-hidden shadow-3xl">
                <Chatbot247
                  isInline={true}
                  assets={assets}
                  requests={requests}
                  onScheduleService={(tech) => { onStart(); setIsChatbotOpen(false); }}
                  initialMode={chatbotMode}
                />
             </div>
          </div>
        </div>
      )}

      {/* MODAL DE DETALLES DEL FOOTER (KNOWLEDGE BASE) */}
      <AnimatePresence>
        {footerDetail && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[3000] bg-[#0d0e12]/90 backdrop-blur-2xl flex items-center justify-center p-6"
            onClick={() => setFooterDetail(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              className="max-w-xl w-full max-h-[90vh] bg-[#121317] border border-white/10 rounded-[3.5rem] overflow-hidden shadow-[0_0_100px_rgba(93,60,254,0.15)] relative flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              {/* Header del Modal (Fijo) */}
              <div className="bg-gradient-to-br from-[#1c1d21] to-[#121317] p-10 relative shrink-0">
                 <button
                   onClick={() => setFooterDetail(null)}
                   className="absolute top-8 right-8 p-3 bg-white/5 hover:bg-rose-600 text-white rounded-2xl border border-white/10 transition-all active:scale-90"
                 >
                   <X className="w-5 h-5" />
                 </button>

                 <div className="space-y-6">
                    <div className="w-16 h-16 bg-[#5d3cfe]/10 border border-[#5d3cfe]/20 rounded-[1.5rem] flex items-center justify-center text-[#5d3cfe] shadow-2xl">
                       <footerDetail.icon className="w-8 h-8" />
                    </div>
                    <h3 className="text-3xl font-black text-white uppercase tracking-tighter leading-none">
                       {footerDetail.title}
                    </h3>
                 </div>
              </div>

              {/* Contenido Scrolleable */}
              <div className="p-10 pt-0 space-y-10 overflow-y-auto custom-scrollbar flex-1">
                 <p className="text-[#c8c4d9] text-lg font-medium leading-relaxed opacity-80">
                    {footerDetail.desc}
                 </p>

                 <div className="space-y-4">
                    <p className="text-[10px] font-black text-[#5d3cfe] uppercase tracking-[0.4em]">Especificaciones Técnicas</p>
                    <div className="grid grid-cols-1 gap-3">
                       {footerDetail.points.map((p: string, i: number) => (
                         <div key={i} className="flex items-center gap-4 p-4 bg-white/5 border border-white/5 rounded-2xl">
                            <CheckCircle2 className="w-4 h-4 text-[#52ffac]" />
                            <span className="text-[11px] font-black text-white uppercase tracking-widest">{p}</span>
                         </div>
                       ))}
                    </div>
                 </div>

                 <button
                   onClick={() => { setFooterDetail(null); onStart(); }}
                   className="w-full py-5 bg-[#5d3cfe] text-white rounded-[2rem] text-xs font-black uppercase tracking-[0.2em] shadow-2xl hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-4"
                 >
                   Acceder al Centro Control <ArrowRight className="w-4 h-4" />
                 </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 9. MEGA FOOTER (UBER STYLE) */}
      <Footer />

      <LegalModal
        isOpen={legalModal.isOpen}
        onClose={() => setLegalModal({ ...legalModal, isOpen: false })}
        type={legalModal.type}
      />
    </div>
  );
}
