import React from 'react';
import { UserSubscription } from '../types';
import { ShieldCheck, Zap, Star, Check, Calendar, CreditCard, Building2, Package, DollarSign, Clock, LayoutDashboard, BrainCircuit, FileText, Users, Globe, ShieldAlert } from 'lucide-react';

interface SubscriptionModuleProps {
  subscription: UserSubscription;
  onUpgrade: (planId: string) => void;
  role?: 'client' | 'tech';
}

export default function SubscriptionModule({ subscription, onUpgrade, role = 'client' }: SubscriptionModuleProps) {
  const activePlanId = subscription.planId;

  const clientPlans = [
    {
      id: 'plan-basic',
      name: 'Básico',
      price: '0',
      features: [
        'Hasta 3 activos registrados',
        'Diagnóstico manual asistido',
        'Soporte vía chat estándar'
      ],
      icon: Package
    },
    {
      id: 'plan-pro',
      name: 'Profesional',
      price: '15',
      features: [
        'Hasta 15 activos registrados',
        'Control de Flota (Modo Lite)',
        'Diagnóstico predictivo full',
        'Soporte prioritario 24/7',
        'Garantía Extendida Mantech'
      ],
      icon: Zap,
      highlight: true
    },
    {
      id: 'plan-enterprise',
      name: 'Corporativo',
      price: '45',
      features: [
        'Activos ILIMITADOS',
        'Tablero de Flota Masiva (Lote)',
        'Auditoría Masiva (PDF/Excel)',
        'Gerente de cuenta dedicado',
        'API & Integración ERP'
      ],
      icon: Building2
    }
  ];

  const techPlans = [
    { id: 'plan-basic', name: 'Técnico Standard', price: '0', features: ['Comisión de servicio 15%', 'Retiros en 5 días hábiles', 'Perfil verificado estándar'], icon: Package },
    { id: 'plan-pro', name: 'Técnico Pro', price: '15', features: ['Comisión reducida 10%', 'Retiros en 48 Horas', 'Sello de Confianza Gold', 'Acceso a contratos B2B'], icon: Zap, highlight: true },
    { id: 'plan-enterprise', name: 'Especialista Élite', price: '45', features: ['Comisión mínima 8%', 'Retiros en 24 Horas', 'Sello Gold + VIP', 'Prioridad en marketplace'], icon: Building2 }
  ];

  const plans = role === 'tech' ? techPlans : clientPlans;

  // Tablas comparativas por rol
  const clientTable = [
    { f: "Capacidad de Activos (Equipos)", b: "Hasta 3", p: "Hasta 15", e: "ILIMITADOS", cat: "Operación", icon: LayoutDashboard },
    { f: "Diagnóstico Predictivo", b: "MANUAL", p: "ASISTIDO", e: "AUTOMÁTICO (IA)", cat: "Ingeniería", icon: BrainCircuit },
    { f: "Reportes de Auditoría", b: "❌", p: "BÁSICO", e: "FULL (Excel/PDF)", cat: "Cumplimiento", icon: FileText },
    { f: "Gestión de Sedes", b: "ÚNICA", p: "HASTA 2", e: "ILIMITADAS (GPS)", cat: "Operación", icon: Globe },
    { f: "Prioridad en Emergencias", b: "ESTÁNDAR", p: "ALTA", e: "CRÍTICA (<15 min)", cat: "Soporte", icon: ShieldAlert },
    { f: "Gerente de Cuenta", b: "❌", p: "VÍA CHAT", e: "DEDICADO (WhatsApp)", cat: "Soporte", icon: Users }
  ];

  const techTable = [
    { f: "Comisión por Servicio", b: "15%", p: "10%", e: "8%", cat: "Finanzas", icon: DollarSign },
    { f: "Retiros de Billetera", b: "5 DÍAS", p: "48 HORAS", e: "24 HORAS", cat: "Finanzas", icon: Clock },
    { f: "Sello de Confianza Gold", b: "❌", p: "✅", e: "✅ + VIP", cat: "Seguridad", icon: Star },
    { f: "Acceso a Contratos B2B/PH", b: "❌", p: "SÓLO LECTURA", e: "✅ FULL", cat: "Mercado", icon: Zap }
  ];

  const tableRows = role === 'tech' ? techTable : clientTable;

  return (
    <div className="space-y-10 animate-fade-in-up">
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
              ? 'Aumenta tu rentabilidad con comisiones bajas y pagos rápidos.'
              : 'Blindaje total para tus activos críticos con tecnología de punta.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-6">
        {plans.map((plan) => (
          <div key={plan.id} className={`p-8 flex flex-col transition-all relative group bg-[#121317] rounded-[2rem] border ${
            activePlanId === plan.id ? 'border-[#5d3cfe] shadow-2xl ring-1 ring-[#5d3cfe]/30' : 'border-[#2a2b2f] hover:border-[#5d3cfe]/30 shadow-lg'
          }`}>
            {activePlanId === plan.id && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1.5 bg-[#5d3cfe] text-white text-[9px] font-black uppercase rounded-full shadow-xl border border-white/10 tracking-widest z-20">
                Plan Actual
              </div>
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
                  <Check className="w-4 h-4 text-[#52ffac] shrink-0 mt-0.5" />
                  {feat}
                </li>
              ))}
            </ul>

            <button
              onClick={() => onUpgrade(plan.id)}
              disabled={activePlanId === plan.id || subscription.status === 'pending_payment_verification'}
              className={`w-full py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activePlanId === plan.id
                ? 'bg-[#1c1d21] text-[#474556] border border-[#2a2b2f] cursor-default'
                : 'bg-[#5d3cfe] text-white hover:brightness-110 shadow-lg'
              }`}
            >
              {activePlanId === plan.id ? 'Activo' : 'Mejorar Ahora'}
            </button>
          </div>
        ))}
      </div>

      {/* COMPARATIVA DINÁMICA MEJORADA */}
      <div className="pt-20 space-y-8 pb-20">
         <div className="text-center space-y-2">
            <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Comparativa de <span className="text-[#52ffac]">Alto Nivel</span></h3>
            <p className="text-[10px] text-[#474556] font-black uppercase tracking-[0.3em]">Exigencia técnica para {role === 'tech' ? 'Especialistas' : 'Empresas'}</p>
         </div>

         <div className="bg-[#121317] border border-[#2a2b2f] rounded-[3rem] overflow-hidden shadow-2xl overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
               <thead>
                  <tr className="bg-[#1c1d21] border-b border-[#2a2b2f]">
                     <th className="p-8 text-[10px] font-black text-white uppercase tracking-widest">Funcionalidad</th>
                     <th className="p-8 text-center text-[10px] font-black text-[#c8c4d9] uppercase tracking-widest">Básico</th>
                     <th className="p-8 text-center text-[10px] font-black text-[#5d3cfe] uppercase tracking-widest bg-[#5d3cfe]/5">Profesional</th>
                     <th className="p-8 text-center text-[10px] font-black text-amber-500 uppercase tracking-widest">Corporativo</th>
                  </tr>
               </thead>
               <tbody className="text-xs font-bold text-[#e3e2e8]">
                  {tableRows.map((row, i) => (
                    <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                       <td className="p-8">
                          <div className="flex items-center gap-3">
                             <row.icon className="w-4 h-4 text-[#5d3cfe]" />
                             <div>
                                <span className="block text-[8px] text-[#474556] font-black uppercase mb-1 tracking-widest">{row.cat}</span>
                                <span className="text-white font-bold">{row.f}</span>
                             </div>
                          </div>
                       </td>
                       <td className="p-8 text-center opacity-80 font-black">{row.b}</td>
                       <td className="p-8 text-center text-white bg-[#5d3cfe]/5 font-black">{row.p}</td>
                       <td className="p-8 text-center text-amber-400 font-black">{row.e}</td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
}
