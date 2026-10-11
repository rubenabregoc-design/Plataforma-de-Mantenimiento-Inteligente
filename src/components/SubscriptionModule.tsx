import React from 'react';
import { UserSubscription } from '../types';
import { ShieldCheck, Zap, Star, Check, Calendar, CreditCard, Building2, Package, DollarSign, Clock, LayoutDashboard, BrainCircuit, FileText, Users, Globe, ShieldAlert, ListOrdered, Share2, Printer, Sliders, Inbox, Fuel, Pencil, MessageSquare, LifeBuoy, BadgeCheck, Gem } from 'lucide-react';

interface SubscriptionModuleProps {
  subscription: UserSubscription;
  onUpgrade: (planId: string) => void;
  onNavigate?: (tab: string) => void;
  role?: 'client' | 'tech';
}

export default function SubscriptionModule({ subscription, onUpgrade, onNavigate, role = 'client' }: SubscriptionModuleProps) {
  const activePlanId = subscription.planId;

  const clientPlans = [
    {
      id: 'plan-free',
      name: 'Gratis',
      price: '0',
      features: [
        'Hasta 5 activos registrados (Equipos o Vehículos)',
        'Diagnóstico manual básico',
        'Alertas de mantenimiento preventivo',
        'Acceso a Técnicos Verificados Mantech ID'
      ],
      icon: Inbox
    },
    {
      id: 'plan-basic',
      name: 'Emprendedor',
      price: '29',
      features: [
        'Incluye todo de Gratis +',
        'Hasta 10 activos registrados (Flota o Equipos)',
        'Módulo Control de Flota y GPS en Tiempo Real',
        'Bitácora Pre-Viaje y Hoja de Ruta Digital',
        'Panel de Gestión Global de Activos',
        'Prioridad estándar de despacho'
      ],
      icon: Package
    },
    {
      id: 'plan-pro',
      name: 'Profesional',
      price: '89',
      features: [
        'Incluye todo de Emprendedor +',
        'Hasta 25 activos registrados (Flota y Edificios)',
        'Flota Avanzada + Auditoría de Combustible IA',
        'Diagnóstico IA Predictivo (MDM-V4)',
        'Carga masiva de Flota y Equipos por Excel',
        'Sello de Ingeniería Verificada',
        'Reportes Oficiales PDF y Excel Full'
      ],
      icon: Zap,
      highlight: true
    },
    {
      id: 'plan-enterprise',
      name: 'Enterprise',
      price: '199',
      features: [
        'Incluye todo de Profesional +',
        'Activos, Flotas y Conductores ILIMITADOS',
        'Coordinadores de Flota y Edificio (Creación en Lote)',
        'Multi-Administrador (Bodegas / PH / Sedes)',
        'SLA Prioritario < 1 Hora',
        'Garantía Mantech Protection (Escrow + Respaldo)',
        'Auditoría Mensual Firmada & API ERP'
      ],
      icon: Building2
    }
  ];

  const techPlans = [
    {
      id: 'plan-basic',
      name: 'Técnico Standard',
      price: '0',
      features: [
        'Comisión de servicio 20%',
        'Retiros en 5 días hábiles',
        'Reportes de servicio básicos',
        'Acceso a Soporte Comunidad'
      ],
      icon: Package
    },
    {
      id: 'plan-pro',
      name: 'Técnico Pro',
      price: '45',
      features: [
        'Incluye todo de Standard +',
        'Comisión reducida 15%',
        'Retiros en 48 Horas',
        'Sello Gold & Radar Satelital',
        'Bono de Fidelidad (1.5x Points)',
        'Acceso a contratos PH'
      ],
      icon: Zap,
      highlight: true
    },
    {
      id: 'plan-enterprise',
      name: 'Partner Élite',
      price: '99',
      features: [
        'Incluye todo de Pro +',
        'Comisión mínima 10%',
        'Retiros en 24 Horas',
        'Visibilidad TOP en Panamá',
        'Sello Gold Master + Auditoría',
        'Club de Fidelidad VIP (2.0x Points)'
      ],
      icon: Building2
    }
  ];

  const plans = role === 'tech' ? techPlans : clientPlans;

  const clientTable = [
    { f: "Capacidad de Activos / Flota", g: "Hasta 5", b: "Hasta 10", p: "Hasta 25", e: "ILIMITADOS", cat: "Operación", icon: LayoutDashboard },
    { f: "Control de Flota & Conductores", g: "REGISTRO BASE", b: "✅ GPS + RUTAS", p: "✅ + COMBUSTIBLE IA", e: "ILIMITADO + LOTE", cat: "Flota", icon: Globe },
    { f: "Coordinadores (Flota / Edificio)", g: "❌", b: "❌", p: "1 SUPERVISOR", e: "✅ CREACIÓN EN LOTE", cat: "Personal", icon: Users },
    { f: "Prioridad de Despacho", g: "BÁSICA", b: "ESTÁNDAR", p: "ALTA", e: "MÁXIMA (< 1H)", cat: "Soporte", icon: ShieldAlert },
    { f: "Auditoría de Combustible", g: "❌", b: "❌", p: "✅ IA ACTIVA", e: "✅ + TELEMETRÍA", cat: "Finanzas", icon: Fuel },
    { f: "Diagnóstico Predictivo", g: "MANUAL", b: "MANUAL", p: "IA MDM-V4", e: "IA AUTOMÁTICA", cat: "Ingeniería", icon: BrainCircuit },
    { f: "Reportes PDF / Excel", g: "BÁSICO", b: "ESTÁNDAR", p: "FULL (Excel/PDF)", e: "AUDITORÍA FIRMADA", cat: "Herramientas", icon: FileText },
    { f: "Mantech Protection (Garantía)", g: "ESCROW BASE", b: "ESCROW + ID", p: "GARANTÍA EXTENDIDA", e: "✅ COBERTURA TOTAL", cat: "Seguridad", icon: ShieldCheck }
  ];

  const techTable = [
    { f: "Comisión sobre Trabajo", b: "20%", p: "15%", e: "10% (MÍNIMA)", cat: "Finanzas", icon: DollarSign },
    { f: "Velocidad de Retiro", b: "5 DÍAS", p: "48 HORAS", e: "24 HORAS", cat: "Finanzas", icon: Clock },
    { f: "Fidelidad & Puntos", b: "❌", p: "ACUMULA 1.5x", e: "NIVEL VIP + CASHBACK", cat: "Beneficios", icon: Star },
    { f: "Visibilidad Marketplace", b: "ESTÁNDAR", p: "DESTACADO", e: "TOP 1 / RADAR", cat: "Mercado", icon: Zap },
    { f: "Sello de Ingeniería", b: "❌", p: "CERTIFICADO", e: "GOLD MASTER", cat: "Seguridad", icon: ShieldCheck },
    { f: "Acceso a Contratos PH", b: "❌", p: "MODO LECTURA", e: "✅ ACCESO FULL", cat: "Mercado", icon: Building2 }
  ];

  const tableRows = role === 'tech' ? techTable : clientTable;

  return (
    <div className="space-y-10 animate-fade-in-up">
      {subscription.status === 'pending_payment_verification' && (
        <div className="bg-amber-500/10 border border-amber-500/30 p-6 rounded-[2rem] flex items-center justify-between gap-6 shadow-2xl animate-pulse">
           <div className="flex items-center gap-4">
              <div className={`w-12 h-12 ${subscription.pendingPlanId === 'plan-enterprise' ? 'bg-[#5d3cfe] text-white shadow-[#5d3cfe]/20' : 'bg-amber-500 text-black shadow-amber-500/20'} rounded-2xl flex items-center justify-center shadow-lg`}>
                 {subscription.pendingPlanId === 'plan-enterprise' ? <Gem className="w-6 h-6 animate-bounce" /> : <Clock className="w-6 h-6" />}
              </div>
              <div>
                 <h4 className="text-sm font-black text-white uppercase tracking-tight">
                   {subscription.pendingPlanId === 'plan-enterprise' ? 'Upgrade Élite en Proceso' : 'Verificación de Pago en Curso'}
                 </h4>
                 <p className="text-[9px] text-amber-500 font-black uppercase tracking-widest mt-1">
                   {subscription.pendingPlanId === 'plan-enterprise' ? 'Nuestro equipo está priorizando su solicitud de socio Élite' : 'El administrador está validando su depósito vía Yappy'}
                 </p>
              </div>
           </div>
           <div className="px-4 py-2 bg-black/40 border border-amber-500/20 rounded-xl text-[8px] font-black text-white uppercase tracking-widest">
              Plan Solicitado: {plans.find(p => p.id === subscription.pendingPlanId)?.name || '---'}
           </div>
        </div>
      )}

      <div className="bg-gradient-to-br from-[#1c1d21] to-[#121317] border border-[#2a2b2f] rounded-[2rem] p-8 md:p-12 flex flex-col md:flex-row items-center gap-10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#5d3cfe]/5 rounded-full blur-[100px]"></div>
        <div className="w-24 h-24 rounded-[2rem] bg-[#5d3cfe] text-white flex items-center justify-center shadow-xl shadow-[#5d3cfe]/20 border-2 border-white/10 shrink-0">
          <ShieldCheck className="w-12 h-12" />
        </div>
        <div className="flex-1 space-y-4 text-center md:text-left">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#52ffac]/10 border border-[#52ffac]/20 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-[#52ffac] animate-pulse"></div>
              <span className="text-[9px] font-black uppercase tracking-widest text-[#52ffac]">Cuenta Activa</span>
            </div>
          </div>
          <h2 className="text-3xl font-black text-white uppercase tracking-tight leading-none">Membresía {role === 'tech' ? 'Especialista' : 'Corporativa'}</h2>
          <p className="text-[#c8c4d9] max-w-lg font-medium italic">
            {role === 'tech'
              ? 'Potencia tu rentabilidad técnica recibiendo más contratos con comisiones mínimas.'
              : 'Blindaje tecnológico y control operativo total sobre sus activos críticos en Panamá.'}
          </p>
        </div>
      </div>

      {role === 'tech' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="md:col-span-2 bg-[#121317] border border-white/5 rounded-[2.5rem] p-8 space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5"><Users className="w-32 h-32" /></div>
              <h3 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                 <MessageSquare className="w-5 h-5 text-[#5d3cfe]" /> Soporte Comunidad
              </h3>
              <p className="text-xs text-[#c8c4d9] leading-relaxed max-w-xl">
                 El <b>Acceso a Soporte Comunidad</b> es nuestro Nodo de Inteligencia Colectiva. Como técnico Standard, puedes acceder al foro de consulta donde cientos de especialistas en Panamá comparten soluciones a fallas raras, experiencias reales y consejos de ingeniería operativa. <b>Es tu manual de campo digital 24/7.</b>
              </p>
              <div className="flex gap-4">
                 <button
                   onClick={() => onNavigate?.('community')}
                   className="px-10 py-3 bg-[#5d3cfe] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:brightness-110 shadow-lg shadow-[#5d3cfe]/20 transition-all active:scale-95"
                 >
                    Entrar al Foro Técnico ➔
                 </button>
              </div>
           </div>

           <div className="bg-gradient-to-br from-[#1c1d21] to-[#0d0e12] border border-[#52ffac]/20 rounded-[2.5rem] p-8 space-y-6 relative overflow-hidden group shadow-2xl shadow-[#52ffac]/5">
              <div className="absolute -bottom-6 -right-6 p-4 opacity-10 group-hover:scale-110 transition-transform"><Package className="w-32 h-32 text-[#52ffac]" /></div>
              <span className="px-3 py-1 bg-[#52ffac]/10 text-[#52ffac] rounded-full text-[8px] font-black uppercase tracking-widest">Novedad V4</span>
              <h3 className="text-xl font-black text-white uppercase tracking-tighter">Kit Físico Master</h3>
              <p className="text-[10px] text-[#c8c4d9] font-medium leading-relaxed uppercase">
                 ¡Sube a Partner Élite y reclama tu equipamiento oficial! Carnet PVC, Stickers QR para activos y parches bordados para tu uniforme.
              </p>
              <button onClick={() => onUpgrade('plan-enterprise')} className="w-full py-3 bg-[#52ffac] text-black rounded-xl text-[9px] font-black uppercase tracking-widest hover:brightness-110 transition-all">Solicitar mi Kit</button>
           </div>
        </div>
      )}

      {role === 'client' && (
        <div className="bg-[#121317] border border-[#2a2b2f] rounded-3xl p-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 shadow-xl">
           <div className="flex items-center gap-2 text-[10px] font-black text-[#474556] uppercase tracking-widest border-r border-white/5 pr-8">
              <ShieldCheck className="w-4 h-4 text-[#5d3cfe]" /> Incluido en todo nivel
           </div>
           {[
             { t: "Chat Técnico", i: MessageSquare },
             { t: "Soporte Humano 24/7", i: LifeBuoy },
             { t: "Firma Biométrica", i: Pencil },
             { t: "Mantech ID Base", i: BadgeCheck },
             { t: "Bóveda de Garantías", i: ShieldCheck }
           ].map((item, idx) => (
             <div key={idx} className="flex items-center gap-2 text-[9px] font-bold text-[#c8c4d9] uppercase tracking-wider">
                <item.i className="w-3.5 h-3.5 text-[#52ffac]" />
                {item.t}
             </div>
           ))}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-6">
        {plans.map((plan) => (
          <div key={plan.id} className={`p-6 sm:p-8 flex flex-col transition-all relative group bg-[#121317] rounded-[1.5rem] sm:rounded-[2rem] border ${
            activePlanId === plan.id ? 'border-[#5d3cfe] shadow-2xl ring-1 ring-[#5d3cfe]/30' : 'border-[#2a2b2f] hover:border-[#5d3cfe]/30 shadow-lg'
          }`}>
            {activePlanId === plan.id && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1.5 bg-[#5d3cfe] text-white text-[9px] font-black uppercase rounded-full shadow-xl border border-white/10 tracking-widest z-20">Plan Actual</div>
            )}
            <div className="mb-8">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 transition-all ${activePlanId === plan.id ? 'bg-[#5d3cfe] text-white' : 'bg-[#1c1d21] text-[#474556] group-hover:bg-[#5d3cfe]/20 group-hover:text-[#c7bfff]'}`}>
                 <plan.icon className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-black text-[#c8c4d9] uppercase tracking-[0.2em]">{plan.name}</h4>
              <div className="mt-4 flex items-baseline gap-1.5">
                <span className="text-lg font-black text-[#5d3cfe] italic">$</span>
                <span className="text-5xl font-black text-white leading-none tracking-tighter">{plan.price}</span>
                <span className="text-[10px] text-[#474556] font-black uppercase tracking-widest ml-1">/ mes</span>
              </div>
            </div>
            <ul className="space-y-4 mb-10 flex-1">
              {plan.features.map((feat, i) => (
                <li key={i} className="flex items-start gap-3 text-xs font-bold text-[#c8c4d9] opacity-80 group-hover:opacity-100 transition-opacity">
                  <Check className="w-4 h-4 text-[#52ffac] shrink-0 mt-0.5" /> {feat}
                </li>
              ))}
            </ul>
            <button
              onClick={() => {
                if (activePlanId !== plan.id) {
                  onUpgrade(plan.id);
                }
              }}
              disabled={activePlanId === plan.id || (subscription.status === 'pending_payment_verification' && subscription.pendingPlanId === plan.id)}
              className={`w-full py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activePlanId === plan.id
                  ? 'bg-[#1c1d21] text-[#52ffac] border border-[#52ffac]/40 cursor-default shadow-inner'
                  : subscription.pendingPlanId === plan.id && subscription.status === 'pending_payment_verification'
                    ? 'bg-amber-500/10 text-amber-500 border border-amber-500/40 cursor-wait'
                    : 'bg-[#5d3cfe] text-white hover:brightness-110 shadow-lg'
              }`}
            >
              {activePlanId === plan.id
                ? '✓ Plan Actual (Activo)'
                : (subscription.pendingPlanId === plan.id && subscription.status === 'pending_payment_verification')
                  ? '⏳ Verificación Pendiente'
                  : (Number(plan.price) === 0 ? 'Retornar a Base' : 'Mejorar Ahora')}
            </button>
          </div>
        ))}
      </div>

      <div className="pt-14 space-y-10 pb-20">
         {role === 'client' && (
           <div className="bg-gradient-to-br from-[#1c1d21] to-[#121317] border border-[#52ffac]/25 rounded-[2rem] p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center gap-6 shadow-2xl">
             <div className="w-14 h-14 rounded-2xl bg-[#52ffac]/10 border border-[#52ffac]/30 flex items-center justify-center text-[#52ffac] shrink-0">
               <ShieldCheck className="w-8 h-8" />
             </div>
             <div className="space-y-2.5 flex-1">
               <div className="flex flex-wrap items-center gap-2">
                 <span className="px-2.5 py-0.5 rounded-full bg-[#52ffac]/15 text-[#52ffac] text-[9px] font-black uppercase tracking-widest">Póliza Posservicio</span>
                 <h4 className="text-base sm:text-lg font-black text-white uppercase tracking-tight">¿En qué consiste el Seguro / Garantía Mantech Protection?</h4>
               </div>
               <p className="text-[11px] text-[#52ffac] font-bold">
                 ✓ Nota: El Pago Protegido en Custodia (Escrow) y el Respaldo Mantech ID + Trazabilidad GPS están incluidos en TODOS los planes desde Gratis.
               </p>
               <p className="text-xs text-[#c8c4d9] leading-relaxed">
                 <strong>1. Orden Directa de Retrabajo sin Costo (Alerta al Técnico):</strong> Durante los 30 días posservicio, si el equipo presenta la misma falla, presionas <em>"Solicitar Retrabajo por Garantía"</em> en tu panel y el sistema notifica de inmediato al técnico en su celular, reactiva el chat directo y genera la orden correctiva a <strong>B/. 0.00 en mano de obra</strong>.{' '}
                 <strong>2. Rescate con 2.º Especialista en 24h:</strong> Si el técnico original no confirma o no acude en menos de 24 horas, el Centro de Control MantechPro despacha un segundo especialista certificado de respaldo sin costo de mano de obra.{' '}
                 <strong>3. Arbitraje Prioritario y Cobertura en Sitio:</strong> Respaldo y mediación prioritaria ante desperfectos derivados de la intervención técnica documentados en el acta fotográfica Antes/Después.
               </p>
             </div>
           </div>
         )}

         <div className="text-center md:text-left space-y-2">
            <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Comparativa de <span className="text-[#52ffac]">Alto Nivel</span></h3>
            <p className="text-[10px] text-[#8a879d] font-black uppercase tracking-[0.3em]">Exigencia técnica y herramientas destacadas para {role === 'tech' ? 'Especialistas' : 'Empresas y Flotas'}</p>
         </div>
         <div className="bg-[#121317] border border-[#2a2b2f] rounded-[2rem] sm:rounded-[3rem] shadow-2xl overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
               <thead>
                  <tr className="bg-[#1c1d21] border-b border-[#2a2b2f]">
                     <th className="p-6 sm:p-8 text-[10px] font-black text-white uppercase tracking-widest">Herramienta / Funcionalidad</th>
                     <th className="p-6 sm:p-8 text-center text-[10px] font-black text-[#c8c4d9] uppercase tracking-widest">Gratis</th>
                     <th className="p-6 sm:p-8 text-center text-[10px] font-black text-white uppercase tracking-widest bg-white/5">Emprendedor</th>
                     <th className="p-6 sm:p-8 text-center text-[10px] font-black text-[#5d3cfe] uppercase tracking-widest bg-[#5d3cfe]/5">Profesional</th>
                     <th className="p-6 sm:p-8 text-center text-[10px] font-black text-amber-500 uppercase tracking-widest">Enterprise</th>
                  </tr>
               </thead>
               <tbody className="text-xs font-bold text-[#e3e2e8]">
                  {tableRows.map((row: any, i: number) => (
                    <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                       <td className="p-6 sm:p-8">
                          <div className="flex items-center gap-3">
                             <div className="p-2 bg-white/5 rounded-lg">
                               <row.icon className="w-4 h-4 text-[#5d3cfe]" />
                             </div>
                             <div>
                                <span className="block text-[8px] text-[#8a879d] font-black uppercase mb-1 tracking-widest">{row.cat}</span>
                                <span className="text-white font-bold">{row.f}</span>
                             </div>
                          </div>
                       </td>
                       <td className="p-6 sm:p-8 text-center opacity-80 font-black">
                         {role === 'client' ? (row.g || 'Hasta 5') : '---'}
                       </td>
                       <td className="p-6 sm:p-8 text-center text-white bg-white/5 font-black">{row.b}</td>
                       <td className="p-6 sm:p-8 text-center text-white bg-[#5d3cfe]/5 font-black">{row.p}</td>
                       <td className="p-6 sm:p-8 text-center text-amber-400 font-black">{row.e}</td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
}
