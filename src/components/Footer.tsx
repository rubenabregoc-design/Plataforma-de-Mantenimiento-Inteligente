import React, { useState, useEffect } from 'react';
import { Globe, Instagram, Youtube, Linkedin, Twitter, MapPin, Newspaper, Rocket, BarChart3 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import MantechProLogo from './Logo';
import { useUI } from '../context/UIContext';
import { db } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';

export default function Footer() {
  const { t, i18n } = useTranslation();
  const { openModal } = useUI();
  const [dynamicNews, setDynamicNews] = useState<any[]>([]);

  useEffect(() => {
    // Escuchar noticias en tiempo real desde el Panel de Administrador
    const unsub = onSnapshot(doc(db, "config", "news"), (docSnap) => {
      if (docSnap.exists() && docSnap.data().articles) {
        setDynamicNews(docSnap.data().articles.slice(0, 3));
      }
    });
    return () => unsub();
  }, []);

  const sections = [
    {
      title: 'Compañía',
      links: ['Quiénes somos', 'Lo que ofrecemos', 'Sala de prensa', 'Blog', 'Oportunidades laborales']
    },
    {
      title: 'Servicios',
      links: ['Flotas B2B', 'Soporte Residencial', 'Mantenimiento Industrial', 'SOS Hogar 24/7', 'Marketplace']
    },
    {
      title: 'Ciudadanía global',
      links: ['Seguridad Mantech ID', 'Sostenibilidad', 'Ecosistema Panamá']
    },
    {
      title: 'Recursos',
      links: ['Centro de Ayuda', 'Guías Técnicas', 'ROI Dashboard', 'Bóveda de Garantías']
    }
  ];

  // Noticias por defecto si no hay en Firestore
  const defaultNews = [
    { category: 'Sala de prensa', title: 'Expansión Nodo Panamá', summary: 'Recibe anuncios sobre asociaciones, actualizaciones de la app e iniciativas regionales.', icon: Globe },
    { category: 'Blog', title: 'Cultura Técnica', summary: 'Encuentra nuevas soluciones para optimizar tus activos y conoce nuestras alianzas.', icon: Youtube },
    { category: 'Inversionistas', title: 'Relaciones Globales', summary: 'Descarga reportes financieros y consulta los planes de expansión corporativa.', icon: Linkedin }
  ];

  const newsToDisplay = dynamicNews.length > 0 ? dynamicNews : defaultNews;

  return (
    <footer className="bg-black text-white pt-24 pb-12 px-8 font-sans border-t border-white/5">
      <div className="max-w-7xl mx-auto space-y-20">

        {/* TOP: Dynamic News Section (ADMIN INTERACTIVE) */}
        <section className="space-y-12">
          <div className="flex flex-col md:flex-row justify-between items-end gap-6">
             <div className="space-y-4">
                <span className="text-[10px] font-black text-[#5d3cfe] uppercase tracking-[0.4em]">Hitos del Ecosistema</span>
                <h2 className="text-3xl md:text-5xl font-black tracking-tighter leading-none italic uppercase">Novedades <span className="text-white/20">MantechPro.</span></h2>
             </div>
             <p className="max-w-xs text-[10px] text-[#474556] font-bold uppercase tracking-widest leading-relaxed">
                Contenido dinámico actualizado en tiempo real.
             </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {newsToDisplay.map((n, i) => (
              <div key={i} className="p-8 bg-[#0d0e12] border border-white/5 rounded-[2.5rem] space-y-6 group hover:border-[#5d3cfe]/30 transition-all shadow-2xl relative overflow-hidden">
                 <div className="flex justify-between items-start relative z-10">
                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-[#5d3cfe] group-hover:bg-[#5d3cfe] group-hover:text-white transition-all duration-500 overflow-hidden">
                       {n.image ? (
                         <img src={n.image} className="w-full h-full object-cover" alt="Hito" />
                       ) : (
                         n.category === 'Sala de Prensa' ? <Newspaper className="w-6 h-6" /> :
                         n.category === 'Blog' ? <Rocket className="w-6 h-6" /> : <BarChart3 className="w-6 h-6" />
                       )}
                    </div>
                    <span className="text-[8px] font-black text-[#474556] uppercase tracking-[0.3em]">{n.date || 'NOTICIA LIVE'}</span>
                 </div>

                 <div className="space-y-3 relative z-10">
                    <h3 className="text-xl font-black uppercase tracking-tight leading-tight group-hover:text-[#5d3cfe] transition-colors">{n.title}</h3>
                    <p className="text-[#c8c4d9] text-xs leading-relaxed opacity-60 text-justify line-clamp-3">
                      {n.summary}
                    </p>
                 </div>

                 <button
                    onClick={() => openModal('info', { infoSlug: n.category })}
                    className="inline-flex items-center gap-2 text-[9px] font-black text-[#5d3cfe] uppercase tracking-[0.2em] group-hover:gap-4 transition-all relative z-10"
                 >
                    Ver detalle industrial ➔
                 </button>

                 <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-[#5d3cfe]/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
            ))}
          </div>
        </section>

        {/* MIDDLE: Main Navigation & Newsletter */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          <div className="lg:col-span-4 space-y-8">
            <MantechProLogo size="md" />
            <p className="text-[10px] text-[#474556] font-black uppercase tracking-[0.3em] leading-relaxed">
              La primera infraestructura digital para el mantenimiento predictivo en Panamá. Uniendo ingeniería y tecnología.
            </p>
            <div className="pt-4 space-y-4">
               <h4 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Boletín de Ingeniería</h4>
               <div className="flex gap-2">
                  <input type="email" placeholder="email@industria.com" className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[10px] text-white outline-none focus:border-[#5d3cfe]" />
                  <button onClick={() => toast.success("Suscrito al boletín oficial.")} className="px-6 py-3 bg-[#5d3cfe] text-white rounded-xl text-[10px] font-black uppercase shadow-lg shadow-[#5d3cfe]/20">Unirse</button>
               </div>
            </div>
          </div>

          <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-8">
            {sections.map((section, idx) => (
              <div key={idx} className="space-y-6">
                <h4 className="font-black text-xs uppercase tracking-[0.3em] text-white/40">{section.title}</h4>
                <ul className="space-y-3">
                  {section.links.map((link, lIdx) => (
                    <li key={lIdx}>
                      <button
                        onClick={() => openModal('info', { infoSlug: link })}
                        className="text-[#c8c4d9] hover:text-white text-sm transition-colors opacity-70 hover:opacity-100 text-left cursor-pointer font-medium"
                      >
                        {link}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* BOTTOM: Social & Stores */}
        <div className="pt-12 border-t border-white/10 space-y-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-8">
              <div className="flex gap-6">
                <Linkedin className="w-5 h-5 cursor-pointer hover:text-[#5d3cfe] transition-all" />
                <Youtube className="w-5 h-5 cursor-pointer hover:text-[#5d3cfe] transition-all" />
                <Instagram className="w-5 h-5 cursor-pointer hover:text-[#5d3cfe] transition-all" />
                <Twitter className="w-5 h-5 cursor-pointer hover:text-[#5d3cfe] transition-all" />
              </div>
              <div className="hidden md:flex items-center gap-6 text-[10px] font-black uppercase tracking-widest ml-8 text-white/20">
                <div className="flex items-center gap-2 cursor-pointer hover:text-[#5d3cfe] transition-colors">
                  <Globe className="w-4 h-4" />
                  <span>{i18n.language.toUpperCase()} (Panamá)</span>
                </div>
                <div className="flex items-center gap-2 cursor-pointer hover:text-[#5d3cfe] transition-colors">
                  <MapPin className="w-4 h-4" />
                  <span>Ciudad de Panamá, PA</span>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <a href="#" className="hover:opacity-80 transition-opacity grayscale hover:grayscale-0">
                <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Get it on Google Play" className="h-10" />
              </a>
              <a href="#" className="hover:opacity-80 transition-opacity grayscale hover:grayscale-0">
                <img src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg" alt="Download on the App Store" className="h-10" />
              </a>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-[10px] text-[#474556] font-black uppercase tracking-widest">
              © 2026 MantechPro Panama Industries S.A. | <a href="mailto:info@mantech-pro.com" className="hover:text-white transition-colors">info@mantech-pro.com</a>
            </p>
            <div className="flex gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-[#474556]">
              <a href="#" className="hover:text-white transition-colors">Privacidad</a>
              <a href="#" className="hover:text-white transition-colors">Accesibilidad</a>
              <a href="#" className="hover:text-white transition-colors">Términos</a>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}
