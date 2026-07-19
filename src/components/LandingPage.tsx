import React from 'react';
import { ShieldCheck, Zap, Globe, MessageSquare, CheckCircle2, Star, ArrowRight, PlayCircle, Users, Activity, Package, Building2, Smartphone, DollarSign, Truck, Fuel, QrCode, CreditCard, FileText, AlertTriangle, BrainCircuit, X, Droplets, Cpu, Wind, ChevronLeft, ChevronRight, Home, Check } from 'lucide-react';
import Logo from './Logo';
import Chatbot247 from './Chatbot247';

interface LandingPageProps {
  onStart: () => void;
  onWatchDemo: () => void;
  assets?: any[];
  requests?: any[];
}

export default function LandingPage({ onStart, onWatchDemo, assets = [], requests = [] }: LandingPageProps) {
  const [activeTab, setActiveTab] = React.useState('logistica');
  const [currentPromo, setCurrentPromo] = React.useState(0);
  const [isChatbotOpen, setIsChatbotOpen] = React.useState(false);
  const [chatbotMode, setChatbotMode] = React.useState<'general' | 'sales'>('general');

  const tabData: Record<string, any> = {
    logistica: {
      title: "Rastreo Satelital Fluido V4",
      subtitle: "COMANDO AUTOMOTRIZ",
      description: "Nuestra infraestructura Sat-Link v4 captura la telemetría en tiempo real. No solo ves dónde está el vehículo, sino su comportamiento dinámico por las rutas de Panamá.",
      features: [
        { t: "Live Tracking 1:1", d: "Seguimiento milimétrico sin los saltos de posición de las apps de GPS estándar." },
        { t: "Diagnóstico OBD-II", d: "Conexión directa con la computadora del auto para detectar fallos de motor en vivo." },
        { t: "Alertas Preventivas", d: "Notificaciones automáticas para cambios de aceite, frenos y neumáticos según el kilometraje." }
      ],
      image: "https://images.unsplash.com/photo-1580674285054-bed31e145f59?auto=format&fit=crop&q=80&w=1200",
      stats: [
        { v: "0.5s", l: "Latencia" },
        { v: "100%", l: "Cobertura PA" },
        { v: "V4", l: "Sat-Link" }
      ],
      color: "#52ffac",
      productiveMsg: "Monitoreo 1s Activo"
    },
    auditoria: {
      title: "Gestión Industrial Master",
      subtitle: "CONTROL DE ACTIVOS CRÍTICOS",
      description: "Optimice el rendimiento de sus plantas industriales. MantechPro gestiona el ciclo de vida de motores, compresores y líneas de producción complejas.",
      features: [
        { t: "Fábrica e Industria", d: "Control preventivo de maquinaria pesada, líneas de ensamblaje y plantas eléctricas de respaldo." },
        { t: "Módulo Plomería Pro", d: "Monitor de presión en bombas de agua y detección temprana de fugas en PHs." },
        { t: "Eficiencia Energética", d: "Auditoría de consumo para chillers y aires acondicionados industriales." }
      ],
      image: "https://images.unsplash.com/photo-1513828583688-c52646db42da?auto=format&fit=crop&q=80&w=1200",
      stats: [
        { v: "-25%", l: "Costo Op." },
        { v: "IA", l: "Predictiva" },
        { v: "24/7", l: "Vigilancia" }
      ],
      color: "#5d3cfe",
      productiveMsg: "Cero Fugas Detectadas"
    },
    b2b: {
      title: "Consola de Gestión Corporativa",
      subtitle: "GESTIÓN MULTI-SEDE",
      description: "La solución definitiva para Administradores de PH y Gerentes de Flota. Controle múltiples ubicaciones geográficas desde un solo nodo administrativo.",
      features: [
        { t: "Permisos Granulares", d: "Cree subcuentas para su personal con accesos limitados según su rol operativo." },
        { t: "Carga Masiva Excel", d: "Suba flotas de 100+ unidades o inventarios completos en menos de 2 segundos." },
        { t: "Reportes de Auditoría", d: "Estados de cuenta y hojas de ruta en PDF listos para presentación ejecutiva." }
      ],
      image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1200",
      stats: [
        { v: "Ilimitado", l: "Activos" },
        { v: "Admin+", l: "Control" },
        { v: "B2B", l: "Soporte" }
      ],
      color: "#e11d48",
      productiveMsg: "Flota 100% En Línea"
    },
    seguridad: {
      title: "Protocolos de Blindaje Total",
      subtitle: "CONFIANZA DE INGENIERÍA",
      description: "Protegemos cada transacción y cada servicio. MantechPro implementa una capa de seguridad bancaria para la tranquilidad de clientes y técnicos.",
      features: [
        { t: "Custodia de Fondos (Escrow)", d: "El pago se retiene en el sistema y solo se libera cuando el cliente firma la conformidad." },
        { t: "Seguridad para el Técnico", d: "Garantía de cobro inmediata. El sistema valida los fondos del cliente antes de iniciar la ruta." },
        { t: "Validación Mantech ID", d: "Verificación de récord policivo, identidad y certificaciones técnicas de cada experto." }
      ],
      image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=1200",
      stats: [
        { v: "100%", l: "Pagos Seguros" },
        { v: "Bio", l: "Firma" },
        { v: "Legal", l: "Respaldo" }
      ],
      color: "#f59e0b",
      productiveMsg: "Escrow Blindado Activo"
    }
  };

  const current = tabData[activeTab];

  return (
    <div className="min-h-screen bg-[#0d0e12] text-[#e3e2e8] font-sans selection:bg-[#5d3cfe] selection:text-white overflow-x-hidden">

      {/* 1. NAVEGACIÓN FLOTANTE */}
      <nav className="fixed top-0 left-0 right-0 z-[100] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between bg-[#121317]/80 backdrop-blur-xl border border-white/5 px-8 py-3 rounded-full shadow-2xl">
          <Logo size="sm" />
          <div className="hidden md:flex items-center gap-10">
            <a href="#soluciones" onClick={() => setActiveTab('logistica')} className="text-[10px] font-black uppercase tracking-widest text-[#c8c4d9] hover:text-[#5d3cfe] transition-all">Logística</a>
            <a href="#soluciones" onClick={() => setActiveTab('auditoria')} className="text-[10px] font-black uppercase tracking-widest text-[#c8c4d9] hover:text-[#5d3cfe] transition-all">Auditoría</a>
            <a href="#soluciones" onClick={() => setActiveTab('b2b')} className="text-[10px] font-black uppercase tracking-widest text-[#c8c4d9] hover:text-[#5d3cfe] transition-all">B2B</a>
            <a href="#soluciones" onClick={() => setActiveTab('seguridad')} className="text-[10px] font-black uppercase tracking-widest text-[#c8c4d9] hover:text-[#5d3cfe] transition-all">Seguridad</a>
          </div>
          <button
            onClick={onStart}
            className="px-6 py-2.5 bg-[#5d3cfe] text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl shadow-[#5d3cfe]/20 hover:brightness-110 active:scale-95 transition-all"
          >
            Ingresar ➔
          </button>
        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <section className="relative pt-48 pb-24 px-8 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none">
           <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-[#5d3cfe]/10 rounded-full blur-[120px] animate-pulse"></div>
        </div>

        <div className="max-w-6xl mx-auto relative z-10 text-center space-y-10">
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-full backdrop-blur-md">
             <div className="w-2 h-2 rounded-full bg-[#52ffac] animate-pulse"></div>
             <span className="text-[9px] font-black text-white uppercase tracking-widest">Red de Mantenimiento #1 de Panamá</span>
          </div>

          <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter leading-[0.9] uppercase">
            Inteligencia <br />
            <span className="text-[#5d3cfe] block mt-2">Operativa.</span>
          </h1>

          <p className="max-w-2xl mx-auto text-[#c8c4d9] text-base md:text-xl font-medium leading-relaxed opacity-80">
            La plataforma definitiva para el control de flotas, mantenimiento industrial y soporte técnico certificado en Panamá.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
             <button onClick={onStart} className="w-full sm:w-auto px-10 py-5 bg-[#5d3cfe] text-white rounded-[2rem] text-xs font-black uppercase tracking-[0.2em] shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-4">
               Solicitar Soporte Ahora <ArrowRight className="w-4 h-4" />
             </button>
             <button onClick={onWatchDemo} className="w-full sm:w-auto px-10 py-5 bg-[#121317] border border-white/10 text-white rounded-[2rem] text-xs font-black uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-all flex items-center justify-center gap-4">
               <PlayCircle className="w-4 h-4" /> Ver Demo
             </button>
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
      <section id="soluciones" className="py-32 px-8 bg-gradient-to-b from-[#0d0e12] to-[#121317]">
        <div className="max-w-7xl mx-auto space-y-20">
          <div className="text-center space-y-4">
             <p className="text-[10px] font-black text-[#5d3cfe] uppercase tracking-[0.4em]">Módulos Master V4</p>
             <h2 className="text-4xl md:text-7xl font-black text-white uppercase tracking-tighter">Ingeniería <span className="text-white/20">Aplicada</span></h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
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
               <div className="bg-[#121317] border border-white/5 rounded-[4rem] p-6 shadow-3xl overflow-hidden relative min-h-[500px]">
                  <img src={current.image} className="w-full h-full min-h-[500px] object-cover rounded-[3rem] transition-all duration-1000" alt="Solution" />
                  <div className="absolute bottom-12 right-12 bg-black/80 backdrop-blur-xl p-8 rounded-[2rem] border border-white/10 space-y-3">
                     <Activity className="w-6 h-6 text-[#52ffac]" />
                     <p className="text-[10px] font-black text-white uppercase tracking-widest text-center">Estado Módulo</p>
                     <p className="text-xs font-bold text-[#52ffac] uppercase italic text-center">Operativo • Blindado</p>
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
               { n: "Emprendedor", p: "29", f: ["Hasta 5 Unidades", "Rastreo Tiempo Real", "Chatbot de Soporte 24/7", "Alertas de Mantenimiento", "Gestión de Activos IT"] },
               { n: "Flota Master", p: "89", f: ["Hasta 25 Unidades", "Auditoría de Combustible", "Diagnóstico IA Predictivo", "Carga Masiva por Excel", "Sello de Ingeniería", "Reportes Full PDF"], pop: true },
               { n: "Enterprise", p: "Custom", f: ["Unidades Ilimitadas", "Control Multi-Sede PH", "Firma Biométrica Digital", "API para Software Externo", "Soporte VIP Prioritario", "Seguro de Incidencias"] }
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
                  img: "https://images.unsplash.com/photo-1621905251918-48416bd8575a?auto=format&fit=crop&q=80&w=800"
                },
                {
                  tag: "Oferta Logística",
                  title: "DIAGNÓSTICO COMPUTARIZADO DE FLOTA",
                  price: "$49.99",
                  img: "https://images.unsplash.com/photo-1599256621730-535171e28e50?auto=format&fit=crop&q=80&w=800"
                }
              ];
              const p = promos[currentPromo];

              return (
                <>
                  <div className="flex-1 p-12 md:p-20 space-y-8 animate-fade-in" key={currentPromo}>
                    <p className="text-[10px] font-black tracking-[0.4em] text-[#52ffac] uppercase">{p.tag}</p>
                    <h3 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter leading-none">{p.title}</h3>
                    <p className="text-4xl font-black text-white tracking-tighter">SOLO {p.price} <span className="text-sm opacity-40 uppercase tracking-widest">+ ITBMS</span></p>
                    <button onClick={onStart} className="px-10 py-5 bg-[#52ffac] text-black rounded-2xl text-xs font-black uppercase tracking-[0.2em] hover:scale-105 shadow-[0_10px_30px_rgba(82,255,172,0.3)] transition-all">Reservar Ahora</button>
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
      <div className="fixed bottom-10 right-10 z-[1000] flex flex-col gap-4 items-end">
         {/* Botón Chatbot AI */}
         <button
           onClick={() => { setChatbotMode('general'); setIsChatbotOpen(true); }}
           className="w-16 h-16 bg-[#5d3cfe] text-white rounded-full flex items-center justify-center shadow-[0_15px_40px_rgba(93,60,254,0.4)] hover:scale-110 active:scale-95 transition-all group relative"
         >
            <MessageSquare className="w-7 h-7 fill-current" />
            <div className="absolute -left-32 top-1/2 -translate-y-1/2 bg-white text-black px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-2xl pointer-events-none">Asistente IA 24/7</div>
         </button>

         {/* Botón Ventas / Cotización Automática */}
         <button
           onClick={() => { setChatbotMode('sales'); setIsChatbotOpen(true); }}
           className="w-16 h-16 bg-[#25d366] text-white rounded-full flex items-center justify-center shadow-[0_15px_40px_rgba(37,211,102,0.4)] hover:scale-110 active:scale-95 transition-all group relative"
         >
            <DollarSign className="w-7 h-7" />
            <div className="absolute -left-40 top-1/2 -translate-y-1/2 bg-white text-black px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-2xl pointer-events-none">Cotización Inmediata</div>
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

      <footer className="py-20 px-8 border-t border-white/5 text-center space-y-6 bg-[#0d0e12]">
         <Logo size="md" className="mx-auto" />
         <p className="text-[9px] font-black text-[#474556] uppercase tracking-[0.4em]">© 2026 MantechPro Industries Panamá • Sistema Operativo Registrado</p>
      </footer>
    </div>
  );
}
