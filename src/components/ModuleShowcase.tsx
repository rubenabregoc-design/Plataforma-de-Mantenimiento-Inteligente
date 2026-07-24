import React, { useState } from 'react';
import { Truck, ShieldCheck, PieChart, Store, Building2, BadgeCheck, ChevronRight, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const modules = [
  {
    id: 'logistics',
    title: 'Comando Logístico & Flotas',
    tag: 'Eficiencia en Ruta',
    desc: 'Gestione flotas masivas o vehículos de despacho en tiempo real. Telemetría avanzada para optimizar rutas, combustible y predecir mantenimientos en Panamá.',
    benefits: [
      { t: 'Rastreo Satelital Milimétrico', d: 'Ubicación GPS en tiempo real con precisión industrial por todo Panamá.' },
      { t: 'Algoritmos de Telemetría MDM', d: 'Detección de anomalías mediante el modelo de degradación multivariable de MantechPro.' },
      { t: 'Sensores Virtuales de Activos', d: 'Cálculo de vida útil remanente (ROL) basado en estrés térmico, altitud y clima.' }
    ],
    icon: Truck,
    color: '#52ffac'
  },
  {
    id: 'residential',
    title: 'Gestión PH & Residencial',
    tag: 'Hogar Conectado',
    desc: 'La solución definitiva para administradores de PH y propietarios. Control de áreas comunes, ascensores, plantas eléctricas y soporte técnico SOS 24/7.',
    benefits: [
      { t: 'Bóveda de Garantías Digital', d: 'Almacene y monitoree fechas de vencimiento de sus activos automáticamente.' },
      { t: 'Botón de Emergencia SOS', d: 'Asistencia técnica inmediata para fallas críticas en su hogar o PH.' },
      { t: 'Certificados de Salud del Equipo', d: 'Documentación oficial que garantiza la operatividad de sus equipos.' }
    ],
    icon: Building2,
    color: '#5d3cfe'
  },
  {
    id: 'industrial',
    title: 'Continuidad Industrial B2B',
    tag: 'Grado Empresarial',
    desc: 'Optimice activos críticos como chillers, generadores y maquinaria pesada. MantechPro asegura que su línea de producción o negocio nunca se detenga.',
    benefits: [
      { t: 'Dashboard de ROI Financiero', d: 'Visualice el retorno de inversión y ahorro operativo en tiempo real.' },
      { t: 'Checklist de Grado Industrial', d: 'Protocolos de mantenimiento rigurosos para maquinaria de alto valor.' },
      { t: 'Auditoría de Inversión Real', d: 'Control detallado de cada dólar invertido en infraestructura técnica.' }
    ],
    icon: PieChart,
    color: '#e11d48'
  },
  {
    id: 'security',
    title: 'Blindaje Mantech ID',
    tag: 'Confianza Total',
    desc: 'Protocolos de validación únicos. Generamos el Récord Policivo desde la plataforma y verificamos Cédulas biométricamente para una seguridad inigualable.',
    benefits: [
      { t: 'Récord Policivo Digital', d: 'Generación instantánea de perfil de conducta y seguridad nativo de la plataforma.' },
      { t: 'Validación de Cédula Pro', d: 'Cruce de datos y verificación de identidad para máxima seguridad.' },
      { t: 'Pagos Protegidos por Escrow', d: 'Fondos liberados solo tras la firma de conformidad del cliente.' }
    ],
    icon: ShieldCheck,
    color: '#f59e0b'
  }
];

export default function ModuleShowcase() {
  const [activeTab, setActiveTab] = useState(modules[0].id);

  const current = modules.find(m => m.id === activeTab)!;

  return (
    <section className="py-32 px-8 bg-[#0d0e12] overflow-hidden scroll-mt-32">
      <div className="max-w-7xl mx-auto space-y-20">

        <div className="text-center space-y-6">
           <span className="text-[10px] font-black text-[#5d3cfe] uppercase tracking-[0.4em]">Ecosistema Maestro V4</span>
           <h2 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter leading-tight">
             Ingeniería <span className="text-white/40">Aplicada</span>
           </h2>
           <p className="text-sm md:text-lg text-[#c8c4d9] font-medium max-w-3xl mx-auto opacity-90">
             Una infraestructura diseñada para cubrir todas las necesidades: desde el hogar hasta la industria pesada y la logística compleja en Panamá.
           </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          {/* Navegación de Módulos */}
          <div className="lg:col-span-5 space-y-4">
            {modules.map((m) => (
              <button
                key={m.id}
                onClick={() => setActiveTab(m.id)}
                className={`w-full p-8 rounded-[2.5rem] border transition-all text-left group relative overflow-hidden
                  ${activeTab === m.id
                    ? 'bg-[#1c1d21] border-[#5d3cfe]/30 shadow-2xl scale-[1.02]'
                    : 'bg-transparent border-white/5 hover:border-white/20 hover:bg-white/5'}`}
              >
                {activeTab === m.id && (
                  <motion.div
                    layoutId="active-bg"
                    className="absolute inset-0 bg-gradient-to-r from-[#5d3cfe]/5 to-transparent pointer-events-none"
                  />
                )}
                <div className="flex items-center gap-6 relative z-10">
                   <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500
                     ${activeTab === m.id ? 'bg-[#5d3cfe] text-white' : 'bg-white/5 text-white/40'}`}>
                      <m.icon className="w-7 h-7" />
                   </div>
                   <div>
                      <span className={`text-[9px] font-black uppercase tracking-[0.3em] mb-1 block
                        ${activeTab === m.id ? 'text-[#5d3cfe]' : 'text-[#474556]'}`}>
                        {m.tag}
                      </span>
                      <h4 className="text-lg font-black text-white uppercase tracking-tight">{m.title}</h4>
                   </div>
                </div>
              </button>
            ))}
          </div>

          {/* Detalle del Módulo */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-[#121317] border border-white/5 rounded-[4rem] p-10 md:p-16 space-y-10 relative overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.5)]"
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#5d3cfe]/5 rounded-full blur-[100px]" />

                <div className="space-y-6 relative z-10">
                  <h3 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter italic leading-none">
                    Soluciones integrales <br />
                    <span style={{ color: current.color }}>para Panamá.</span>
                  </h3>
                  <p className="text-[#c8c4d9] text-lg md:text-xl font-medium leading-relaxed opacity-90">
                    {current.desc}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                  {current.benefits.map((b: any, i: number) => (
                    <div key={i} className="flex flex-col gap-2 bg-black/40 p-6 rounded-3xl border border-white/5 group/benefit hover:border-[#5d3cfe]/30 transition-all duration-500">
                       <div className="flex items-center gap-4">
                          <CheckCircle2 className="w-5 h-5 shrink-0 transition-transform group-hover/benefit:scale-110" style={{ color: current.color }} />
                          <span className="text-[11px] font-black text-white uppercase tracking-wider leading-tight">{b.t}</span>
                       </div>
                       <p className="text-[10px] text-[#c8c4d9]/50 font-bold leading-relaxed max-h-0 overflow-hidden group-hover/benefit:max-h-20 transition-all duration-500 opacity-0 group-hover/benefit:opacity-100 pl-9">
                          {b.d}
                       </p>
                    </div>
                  ))}
                </div>

                <div className="pt-6 border-t border-white/5 flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-3">
                     <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: current.color }} />
                     <span className="text-[9px] font-black text-[#474556] uppercase tracking-[0.3em]">Protocolo Mantech V4 Activo</span>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

        </div>
      </div>
    </section>
  );
}
