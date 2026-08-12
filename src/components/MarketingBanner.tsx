import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, X, Zap, ArrowRight, ShieldCheck } from 'lucide-react';

interface Ad {
  id: number;
  title: string;
  image: string;
  link: string;
  placement: string;
  cta?: string;
}

interface Props {
  placement: 'client' | 'tech' | 'marketplace' | 'landing';
}

export default function MarketingBanner({ placement }: Props) {
  const [ads, setAds] = useState<Ad[]>([]);
  const [currentIdx, setCurrentPromo] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "config", "marketing"), (docSnap) => {
      if (docSnap.exists()) {
        const allAds = docSnap.data().banners || [];
        setAds(allAds.filter((a: Ad) => a.placement === placement));
      }
    });
    return () => unsub();
  }, [placement]);

  useEffect(() => {
    if (ads.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentPromo((prev) => (prev + 1) % ads.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [ads]);

  if (!visible || ads.length === 0) return null;

  const current = ads[currentIdx];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={current.id}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.02 }}
        className="relative w-full group"
      >
        <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500/20 to-purple-600/20 rounded-[2.5rem] blur opacity-0 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>

        <div className="relative bg-[#0d0e12] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl">
          <a href={current.link} target="_blank" rel="noopener noreferrer" className="flex flex-col md:flex-row items-center w-full min-h-[140px] sm:min-h-[180px]">

            {/* Zona de Imagen con Overlay Dinámico */}
            <div className="w-full md:w-1/3 h-48 md:h-full relative overflow-hidden bg-[#1c1d21]">
               {current.image && current.image.startsWith('http') ? (
                 <img
                   src={current.image}
                   className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                   alt={current.title}
                   onError={(e) => {
                     (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800';
                   }}
                 />
               ) : (
                 <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#5d3cfe]/20 to-[#121317] p-6">
                    <Zap className="w-12 h-12 text-[#52ffac] mb-3 animate-pulse" />
                    <p className="text-[8px] font-black text-white/20 uppercase tracking-widest text-center">MantechPro <br/> Visual Engine</p>
                 </div>
               )}
               <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/80 via-transparent to-transparent"></div>
            </div>

            {/* Contenido Editorial del Ad */}
            <div className="flex-1 p-8 sm:p-10 space-y-4">
               <div className="flex items-center gap-3">
                  <div className="px-3 py-1 bg-amber-500 text-black rounded-lg text-[8px] font-black uppercase tracking-[0.2em] shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                     Anuncio Patrocinado
                  </div>
                  <div className="flex items-center gap-1 text-[8px] font-black text-[#474556] uppercase tracking-widest">
                     <ShieldCheck className="w-3 h-3" /> Verificado por MantechPro
                  </div>
               </div>

               <div className="space-y-2">
                  <h3 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-tighter italic leading-none group-hover:text-amber-500 transition-colors">
                     {current.title}
                  </h3>
                  <p className="text-[#c8c4d9] text-xs sm:text-sm font-medium opacity-60 leading-relaxed max-w-2xl">
                     Aproveche los beneficios exclusivos de nuestra red técnica para optimizar la salud de sus activos industriales en Ciudad de Panamá.
                  </p>
               </div>

               <div className="flex items-center gap-4 pt-2">
                  <div className="px-6 py-3 bg-white text-black rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-amber-500 transition-all shadow-xl">
                     {current.cta || 'Comprar Ahora'} <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                  <div className="hidden sm:flex items-center gap-1.5 text-[9px] font-bold text-[#474556] uppercase tracking-widest">
                     Mantech Protection <ShieldCheck className="w-3 h-3 text-[#52ffac]" />
                  </div>
               </div>
            </div>
          </a>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
