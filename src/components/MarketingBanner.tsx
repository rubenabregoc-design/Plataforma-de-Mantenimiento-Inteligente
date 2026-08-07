import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, X } from 'lucide-react';

interface Ad {
  id: number;
  title: string;
  image: string;
  link: string;
  placement: string;
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
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="relative w-full bg-[#121317] border border-white/5 rounded-[2rem] overflow-hidden shadow-2xl group"
      >
        <a href={current.link} target="_blank" rel="noopener noreferrer" className="block w-full h-[120px] sm:h-[180px] relative">
          <img src={current.image} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-700" alt={current.title} />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/20 to-transparent flex flex-col justify-center px-10">
             <div className="space-y-2">
                <span className="text-[8px] font-black text-amber-500 uppercase tracking-[0.4em]">Anuncio Patrocinado</span>
                <h3 className="text-xl sm:text-3xl font-black text-white uppercase tracking-tighter italic leading-none">{current.title}</h3>
                <div className="flex items-center gap-2 text-[#c8c4d9] text-[10px] font-bold uppercase tracking-widest mt-4">
                   Ver Oferta <ExternalLink className="w-3.5 h-3.5" />
                </div>
             </div>
          </div>
        </a>
        <button onClick={() => setVisible(false)} className="absolute top-4 right-4 p-2 bg-black/40 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
           <X className="w-4 h-4" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
