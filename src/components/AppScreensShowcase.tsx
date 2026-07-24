import React, { useState, useEffect } from 'react';
import { Smartphone, Layout, Bell, Shield, Wallet, QrCode, Search, MessageSquare, ChevronRight, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';

const initialScreens = [
  {
    id: 'dashboard',
    title: 'Monitor de Activos',
    subtitle: 'Todo bajo control',
    desc: 'Visualice el estado de salud de todos sus activos en una sola vista. Reciba alertas preventivas automáticas y acceda a expedientes digitales mediante códigos QR.',
    icon: Layout,
    color: '#52ffac',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: 'market',
    title: 'Marketplace de Subasta',
    subtitle: 'El mejor precio, siempre',
    desc: 'Publique su necesidad técnica y deje que los especialistas certificados compitan enviando sus mejores propuestas. Usted elige al técnico por reputación, precio o cercanía.',
    icon: Search,
    color: '#5d3cfe',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: 'security',
    title: 'Centro de Seguridad ID',
    subtitle: 'Confianza Master V4',
    desc: 'Cada profesional cuenta con un Mantech ID validado. Generamos el Récord Policivo desde la plataforma y verificamos Cédulas biométricamente.',
    icon: Shield,
    color: '#e11d48',
    image: 'https://images.unsplash.com/photo-1557597774-9d2739f85a76?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: 'wallet',
    title: 'Billetera & Escrow',
    subtitle: 'Pagos Blindados',
    desc: 'Los fondos se mantienen en custodia segura y solo se liberan al técnico cuando usted firma la conformidad del servicio. Transparencia total en cada transacción.',
    icon: Wallet,
    color: '#f59e0b',
    image: 'https://images.unsplash.com/photo-1556742044-3c52d6e88c62?auto=format&fit=crop&q=80&w=1000'
  }
];

interface AppScreensShowcaseProps {
  onExplore: (title: string) => void;
}

export default function AppScreensShowcase({ onExplore }: AppScreensShowcaseProps) {
  const [screens, setScreens] = useState(initialScreens);
  const [activeId, setActiveId] = useState(initialScreens[0].id);

  useEffect(() => {
    // Escuchar cambios en la configuración del showcase desde Firestore
    // Se añade manejo de errores para evitar cierres por falta de permisos
    const unsub = onSnapshot(doc(db, "config", "showcase"), (doc) => {
      if (doc.exists()) {
        const data = doc.data().screens;
        if (data && Array.isArray(data)) {
          const iconMap: Record<string, any> = { Layout, Search, Shield, Wallet };
          const mapped = data.map((s: any) => ({
            ...s,
            icon: iconMap[s.iconName] || Layout
          }));
          setScreens(mapped);
          if (!mapped.find(s => s.id === activeId)) {
            setActiveId(mapped[0].id);
          }
        }
      }
    }, (error) => {
      console.warn("⚠️ Firestore: No se pudo cargar la configuración dinámica (permisos). Usando datos estáticos.", error.message);
      setScreens(initialScreens);
    });
    return () => unsub();
  }, [activeId]);

  const current = screens.find(s => s.id === activeId) || screens[0];

  return (
    <section className="py-32 px-8 bg-[#0a0b0d] relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_30%,#5d3cfe05,transparent_50%)] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto space-y-24">

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
           <div className="space-y-4">
              <span className="text-[10px] font-black text-[#5d3cfe] uppercase tracking-[0.4em]">Experiencia de Usuario</span>
              <h2 className="text-5xl md:text-8xl font-black text-white uppercase tracking-tighter leading-none">
                La App <span className="text-white/20">Master.</span>
              </h2>
           </div>
           <p className="max-w-md text-[#c8c4d9] font-medium text-lg opacity-60 leading-relaxed">
             Una interfaz diseñada para la velocidad y la seguridad. Explore los módulos que están transformando el soporte técnico en Panamá.
           </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">

           {/* LADO IZQUIERDO: Navegación de Pantallas */}
           <div className="lg:col-span-4 space-y-3">
              {screens.map((screen) => (
                <button
                  key={screen.id}
                  onClick={() => setActiveId(screen.id)}
                  className={`w-full p-6 rounded-[2rem] border transition-all text-left relative overflow-hidden group
                    ${activeId === screen.id
                      ? 'bg-[#1c1d21] border-white/10 shadow-2xl'
                      : 'bg-transparent border-transparent hover:bg-white/5 opacity-40 hover:opacity-100'}`}
                >
                  <div className="flex items-center gap-5 relative z-10">
                     <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all
                       ${activeId === screen.id ? 'bg-[#5d3cfe] text-white shadow-[0_0_20px_rgba(93,60,254,0.4)]' : 'bg-white/5 text-white/40'}`}>
                        <screen.icon className="w-6 h-6" />
                     </div>
                     <div>
                        <h4 className="text-base font-black text-white uppercase tracking-tight">{screen.title}</h4>
                        <p className="text-[9px] font-bold text-[#474556] uppercase tracking-widest mt-0.5">{screen.subtitle}</p>
                     </div>
                  </div>
                </button>
              ))}
           </div>

           {/* LADO DERECHO: Visualización de Pantalla (Móvil Mockup) */}
           <div className="lg:col-span-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeId}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-12 bg-[#121317] border border-white/5 p-10 md:p-16 rounded-[4rem] shadow-3xl"
                >
                   {/* Mockup de Celular */}
                   <div className="relative mx-auto w-[280px] h-[580px] bg-[#0d0e12] rounded-[3rem] border-[8px] border-[#1c1d21] shadow-2xl overflow-hidden shadow-[#000000]">
                      {/* Cámara Frontal */}
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-[#1c1d21] rounded-b-2xl z-20"></div>

                      {/* Pantalla App */}
                      <div className="w-full h-full relative">
                         <img src={current.image} alt="App Screen" className="w-full h-full object-cover opacity-60 mix-blend-luminosity hover:mix-blend-normal transition-all duration-700" />
                         <div className="absolute inset-0 bg-gradient-to-t from-[#0d0e12] via-transparent to-transparent"></div>

                         <div className="absolute bottom-8 left-6 right-6 space-y-4">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: current.color }}>
                               <current.icon className="w-5 h-5 text-black" />
                            </div>
                            <h5 className="text-xl font-black text-white uppercase tracking-tighter">{current.title}</h5>
                            <div className="h-1 w-12 rounded-full" style={{ backgroundColor: current.color }}></div>
                         </div>
                      </div>
                   </div>

                   {/* Explicación Técnica */}
                   <div className="flex flex-col justify-center space-y-8">
                      <div className="space-y-4">
                         <h3 className="text-3xl font-black text-white uppercase tracking-tighter italic leading-none">
                           Poder en la palma <br />
                           <span style={{ color: current.color }}>de su mano.</span>
                         </h3>
                         <p className="text-[#c8c4d9] font-medium text-lg leading-relaxed">
                           {current.desc}
                         </p>
                      </div>

                      <div className="space-y-4">
                         <div className="flex items-center gap-3">
                            <CheckCircle2 className="w-5 h-5" style={{ color: current.color }} />
                            <span className="text-[11px] font-black text-white uppercase tracking-widest">Sincronización Satelital Real</span>
                         </div>
                         <div className="flex items-center gap-3">
                            <CheckCircle2 className="w-5 h-5" style={{ color: current.color }} />
                            <span className="text-[11px] font-black text-white uppercase tracking-widest">Respaldo de Grado Bancario</span>
                         </div>
                      </div>

                      <button
                        onClick={() => onExplore(current.title)}
                        className="w-fit px-8 py-4 border rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all hover:bg-white hover:text-black cursor-pointer active:scale-95"
                        style={{ borderColor: `${current.color}40`, color: current.color }}
                      >
                        Explorar Módulo ➔
                      </button>
                   </div>
                </motion.div>
              </AnimatePresence>
           </div>

        </div>

      </div>
    </section>
  );
}
