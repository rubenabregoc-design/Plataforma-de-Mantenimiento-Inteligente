import React from 'react';
import { ShieldCheck, Zap, Globe, MessageSquare, CheckCircle2, Star, ArrowRight, PlayCircle, Users, Activity, Package, Building2, Smartphone, DollarSign } from 'lucide-react';
import Logo from './Logo';

interface LandingPageProps {
  onStart: () => void;
  onWatchDemo: () => void;
}

export default function LandingPage({ onStart, onWatchDemo }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-[#0d0e12] text-[#e3e2e8] font-sans selection:bg-[#5d3cfe] selection:text-white">

      {/* NAVEGACIÓN FLOTANTE */}
      <nav className="fixed top-0 left-0 right-0 z-[100] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between bg-[#121317]/80 backdrop-blur-xl border border-white/5 px-8 py-3 rounded-full shadow-2xl">
          <Logo size="sm" />
          <div className="hidden md:flex items-center gap-10">
            <a href="#soluciones" className="text-[10px] font-black uppercase tracking-widest text-[#c8c4d9] hover:text-[#5d3cfe] transition-all">Soluciones</a>
            <a href="#seguridad" className="text-[10px] font-black uppercase tracking-widest text-[#c8c4d9] hover:text-[#5d3cfe] transition-all">Seguridad</a>
            <a href="#flota" className="text-[10px] font-black uppercase tracking-widest text-[#c8c4d9] hover:text-[#5d3cfe] transition-all">Flota B2B</a>
          </div>
          <button
            onClick={onStart}
            className="px-6 py-2.5 bg-[#5d3cfe] text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl shadow-[#5d3cfe]/20 hover:brightness-110 active:scale-95 transition-all"
          >
            Ingresar ➔
          </button>
        </div>
      </nav>

      {/* HERO SECTION - THE HOOK */}
      <section className="relative pt-40 pb-20 px-8 overflow-hidden">
        {/* Decoración de fondo */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none">
           <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-[#5d3cfe]/10 rounded-full blur-[120px] animate-pulse"></div>
           <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-[#52ffac]/5 rounded-full blur-[100px]"></div>
        </div>

        <div className="max-w-6xl mx-auto relative z-10 text-center space-y-10">
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-full backdrop-blur-md animate-fade-in">
             <div className="w-2 h-2 rounded-full bg-[#52ffac] animate-pulse shadow-[0_0_8px_#52ffac]"></div>
             <span className="text-[9px] font-black text-white uppercase tracking-widest">Red de Mantenimiento #1 de Panamá</span>
          </div>

          <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter leading-[0.9] uppercase">
            Inteligencia en <br />
            <span className="text-[#5d3cfe] block mt-2">Mantenimiento.</span>
          </h1>

          <p className="max-w-2xl mx-auto text-[#c8c4d9] text-base md:text-xl font-medium leading-relaxed opacity-80">
            Conectamos propietarios con técnicos especialistas bajo un protocolo de seguridad Master. Diagnóstico predictivo, pagos blindados y reportes certificados.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-5 pt-4">
             <button
               onClick={onStart}
               className="w-full sm:w-auto px-10 py-5 bg-[#5d3cfe] text-white rounded-[2rem] text-xs font-black uppercase tracking-[0.2em] shadow-2xl shadow-[#5d3cfe]/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-4"
             >
               Solicitar Soporte Ahora
               <ArrowRight className="w-4 h-4" />
             </button>
             <button
               onClick={onWatchDemo}
               className="w-full sm:w-auto px-10 py-5 bg-[#121317] border border-white/10 text-white rounded-[2rem] text-xs font-black uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-all flex items-center justify-center gap-4"
             >
               <PlayCircle className="w-4 h-4" />
               Ver Demo
             </button>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-20 border-t border-white/5">
             <div className="space-y-1">
                <p className="text-3xl font-black text-white">+1,200</p>
                <p className="text-[9px] font-black text-[#474556] uppercase tracking-widest">Servicios Realizados</p>
             </div>
             <div className="space-y-1">
                <p className="text-3xl font-black text-[#5d3cfe]">99.8%</p>
                <p className="text-[9px] font-black text-[#474556] uppercase tracking-widest">Tasa de Éxito</p>
             </div>
             <div className="space-y-1">
                <p className="text-3xl font-black text-[#52ffac]">&lt; 15min</p>
                <p className="text-[9px] font-black text-[#474556] uppercase tracking-widest">Respuesta Técnica</p>
             </div>
             <div className="space-y-1">
                <p className="text-3xl font-black text-white">24/7</p>
                <p className="text-[9px] font-black text-[#474556] uppercase tracking-widest">Monitoreo Activo</p>
             </div>
          </div>
        </div>
      </section>

      {/* SOLUCIONES - KEY FEATURES */}
      <section id="soluciones" className="py-32 px-8 bg-[#121317]/50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-20 items-center">
          <div className="lg:col-span-5 space-y-8">
            <div className="p-3 bg-[#5d3cfe]/10 border border-[#5d3cfe]/20 rounded-2xl w-fit text-[#c7bfff]">
               <Activity className="w-6 h-6" />
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-none uppercase">
              Operación <br /><span className="text-[#5d3cfe]">Sin Límites</span>
            </h2>
            <p className="text-[#c8c4d9] text-lg font-medium leading-relaxed opacity-70">
              MantechPro no es solo una app, es el sistema operativo para tu hogar o empresa. Desde aires acondicionados hasta flotas corporativas.
            </p>

            <div className="space-y-4 pt-4">
               {[
                 { t: "Diagnóstico Predictivo", d: "Identificamos fallas antes de que ocurran.", i: Zap },
                 { t: "Soporte Multimedia", d: "Envía videos y notas de voz para mayor precisión.", i: Smartphone },
                 { t: "Seguimiento en Vivo", d: "Mira la ubicación del técnico en tiempo real.", i: Globe }
               ].map((item, idx) => (
                 <div key={idx} className="flex gap-5 items-start">
                    <div className="p-2 bg-white/5 rounded-lg border border-white/10 text-[#52ffac]">
                       <item.i className="w-4 h-4" />
                    </div>
                    <div>
                       <h4 className="text-sm font-black text-white uppercase tracking-tight">{item.t}</h4>
                       <p className="text-xs text-[#474556] font-medium mt-1">{item.d}</p>
                    </div>
                 </div>
               ))}
            </div>
          </div>

          <div className="lg:col-span-7 relative">
            <div className="absolute inset-0 bg-[#5d3cfe]/20 rounded-[4rem] blur-[80px] -z-10"></div>
            <div className="bg-[#1c1d21] border border-white/5 rounded-[4rem] p-4 shadow-2xl">
               <img
                 src="https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=1200&auto=format&fit=crop&q=80"
                 className="w-full h-auto rounded-[3.5rem] opacity-50 grayscale hover:grayscale-0 transition-all duration-700"
                 alt="Dashboard Preview"
               />
            </div>
          </div>
        </div>
      </section>

      {/* SEGURIDAD - THE TRUST FACTOR */}
      <section id="seguridad" className="py-32 px-8">
        <div className="max-w-6xl mx-auto text-center space-y-20">
          <header className="space-y-6">
            <p className="text-[10px] font-black text-[#5d3cfe] uppercase tracking-[0.4em]">Protocolo Mantech ID</p>
            <h2 className="text-4xl md:text-7xl font-black text-white tracking-tighter uppercase">Seguridad <span className="text-white/20">como estándar</span></h2>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { t: "Validación de Antecedentes", d: "Todo técnico pasa por una revisión de récord policivo y legal antes de entrar a nuestra red.", i: ShieldCheck },
              { t: "Fondos en Garantía", d: "Tu pago se libera solo cuando firmas de conformidad y calificas el servicio.", i: DollarSign },
              { t: "Firma Digital", d: "Cada trabajo se cierra con una firma encriptada que genera un reporte con validez legal.", i: CheckCircle2 }
            ].map((box, i) => (
              <div key={i} className="bg-[#121317] border border-white/5 p-10 rounded-[3rem] space-y-6 hover:border-[#5d3cfe]/50 transition-all group">
                <div className="w-16 h-16 bg-[#1c1d21] border border-white/10 rounded-3xl mx-auto flex items-center justify-center text-[#c7bfff] group-hover:scale-110 transition-transform">
                   <box.i className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-black text-white uppercase tracking-tight">{box.t}</h3>
                <p className="text-sm text-[#c8c4d9] font-medium opacity-60 leading-relaxed">{box.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* B2B / FLOTA - THE CORPORATE SIDE */}
      <section id="flota" className="py-32 px-8 bg-gradient-to-b from-transparent to-[#121317]">
        <div className="max-w-7xl mx-auto bg-[#5d3cfe] rounded-[4rem] p-10 md:p-20 overflow-hidden relative shadow-[0_50px_100px_rgba(93,60,254,0.3)]">
          {/* Fondo fantasma industrial */}
          <Building2 className="absolute -bottom-20 -right-20 w-96 h-96 text-white opacity-5" />

          <div className="max-w-3xl space-y-10 relative z-10">
            <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-none uppercase">División <br />Corporativa B2B</h2>
            <p className="text-white/80 text-xl font-medium leading-relaxed">
              Gestión masiva de flotas para PHs, Arrendadoras de autos y complejos industriales. Controla 50 activos desde un solo mapa centralizado.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               {[
                 "Monitor Masivo en Tiempo Real",
                 "Facturación Fiscal Automática",
                 "Alertas de Vencimiento de Garantías",
                 "Gerente de Cuenta Dedicado"
               ].map((t, idx) => (
                 <div key={idx} className="flex items-center gap-3 text-white">
                    <CheckCircle2 className="w-5 h-5 text-[#52ffac]" />
                    <span className="text-xs font-black uppercase tracking-widest">{t}</span>
                 </div>
               ))}
            </div>
            <button
              onClick={onStart}
              className="px-10 py-5 bg-[#0d0e12] text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-2xl hover:brightness-125 transition-all"
            >
              Consultar Plan Corporativo
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-20 px-8 border-t border-white/5 text-center space-y-10 bg-[#0d0e12]">
         <div className="flex items-center justify-center gap-2">
            <Logo size="md" />
         </div>
         <p className="text-[9px] font-black text-[#474556] uppercase tracking-[0.4em]">
            © 2026 MantechPro Industries Panamá • Sistema Operativo Registrado
         </p>
         <div className="flex justify-center gap-8">
            <a href="#" className="text-[#474556] hover:text-white transition-colors text-[8px] font-black uppercase tracking-[0.2em]">Términos</a>
            <a href="#" className="text-[#474556] hover:text-white transition-colors text-[8px] font-black uppercase tracking-[0.2em]">Privacidad</a>
            <a href="#" className="text-[#474556] hover:text-white transition-colors text-[8px] font-black uppercase tracking-[0.2em]">Contacto</a>
         </div>
      </footer>
    </div>
  );
}
