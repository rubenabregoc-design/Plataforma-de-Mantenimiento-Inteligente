import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Save, Image as ImageIcon, Layout, Search, Shield, Wallet, Trash2, Plus, FileText, Globe, Newspaper } from 'lucide-react';
import { toast } from 'react-hot-toast';

const initialScreens = [
  { id: 'dashboard', title: 'Monitor de Activos', subtitle: 'Todo bajo control', desc: 'Visualice el estado de salud de todos sus activos en una sola vista.', iconName: 'Layout', color: '#52ffac', image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1000' },
  { id: 'market', title: 'Marketplace de Subasta', subtitle: 'El mejor precio, siempre', desc: 'Publique su necesidad técnica y deje que los especialistas certificados compitan.', iconName: 'Search', color: '#5d3cfe', image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1000' },
  { id: 'security', title: 'Centro de Seguridad ID', subtitle: 'Confianza Master V4', desc: 'Cada profesional cuenta con un Mantech ID validado.', iconName: 'Shield', color: '#e11d48', image: 'https://images.unsplash.com/photo-1557597774-9d2739f85a76?auto=format&fit=crop&q=80&w=1000' },
  { id: 'wallet', title: 'Billetera & Escrow', subtitle: 'Pagos Blindados', desc: 'Los fondos se mantienen en custodia segura.', iconName: 'Wallet', color: '#f59e0b', image: 'https://images.unsplash.com/photo-1556742044-3c52d6e88c62?auto=format&fit=crop&q=80&w=1000' }
];

export default function LandingCMS() {
  const [screens, setScreens] = useState<any[]>(initialScreens);
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      // Cargar Showcase
      const showcaseRef = doc(db, "config", "showcase");
      const showcaseSnap = await getDoc(showcaseRef);
      if (showcaseSnap.exists() && showcaseSnap.data().screens) {
        setScreens(showcaseSnap.data().screens);
      }

      // Cargar Noticias
      const newsRef = doc(db, "config", "news");
      const newsSnap = await getDoc(newsRef);
      if (newsSnap.exists() && newsSnap.data().articles) {
        setNews(newsSnap.data().articles);
      } else {
        setNews([
          { id: 1, title: 'Inauguración Nodo Panamá', date: '2026-08-01', summary: 'MantechPro expande su capacidad de respuesta inmediata.', category: 'Sala de Prensa' }
        ]);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleSave = async () => {
    try {
      await setDoc(doc(db, "config", "showcase"), { screens });
      await setDoc(doc(db, "config", "news"), { articles: news });
      toast.success("Ecosistema de contenido actualizado");
    } catch (error) {
      toast.error("Error al guardar cambios");
    }
  };

  const updateScreen = (index: number, field: string, value: string) => {
    const newScreens = [...screens];
    newScreens[index] = { ...newScreens[index], [field]: value };
    setScreens(newScreens);
  };

  const addNews = () => {
    setNews([{ id: Date.now(), title: 'Nueva Noticia', date: new Date().toISOString().split('T')[0], summary: 'Breve descripción del hito...', category: 'Blog' }, ...news]);
  };

  const updateNews = (index: number, field: string, value: string) => {
    const newNews = [...news];
    newNews[index] = { ...newNews[index], [field]: value };
    setNews(newNews);
  };

  const deleteNews = (id: number) => {
    setNews(news.filter(n => n.id !== id));
  };

  if (loading) return <div className="p-10 text-center text-white font-black uppercase tracking-widest animate-pulse">Cargando Motor de Contenido...</div>;

  return (
    <div className="space-y-20 animate-fade-in-up">
      {/* SECCIÓN 1: SHOWCASE */}
      <div className="space-y-10">
        <div className="flex justify-between items-center border-b border-white/5 pb-6">
          <div>
             <h3 className="text-2xl font-black text-white uppercase tracking-tighter italic">Editor de <span className="text-[#5d3cfe]">Showcase</span></h3>
             <p className="text-[10px] text-[#474556] font-bold uppercase tracking-[0.3em] mt-1">Gestión de Pantallas de la Landing Page</p>
          </div>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-8 py-4 bg-[#52ffac] text-black rounded-2xl text-[10px] font-black uppercase shadow-xl shadow-[#52ffac]/20 hover:scale-105 transition-all"
          >
            <Save className="w-4 h-4" /> Sincronizar Ecosistema
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {screens.map((screen, idx) => (
            <div key={idx} className="bg-[#1c1d21] border border-white/5 p-8 rounded-[2.5rem] space-y-6 shadow-2xl relative group">
              <div className="flex justify-between items-start">
                 <div className="w-12 h-12 rounded-xl bg-[#5d3cfe]/10 flex items-center justify-center text-[#5d3cfe] border border-[#5d3cfe]/20">
                    <ImageIcon className="w-6 h-6" />
                 </div>
                 <span className="text-[8px] font-black text-[#474556] uppercase tracking-widest">Módulo #{idx + 1}</span>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-[#474556] uppercase ml-1">Título del Módulo</label>
                  <input
                    type="text"
                    value={screen.title}
                    onChange={(e) => updateScreen(idx, 'title', e.target.value)}
                    className="w-full bg-[#0d0e12] border border-white/5 rounded-xl py-3 px-4 text-white text-xs font-bold outline-none focus:border-[#5d3cfe] transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black text-[#474556] uppercase ml-1">URL de la Imagen (Mockup)</label>
                  <input
                    type="text"
                    value={screen.image}
                    onChange={(e) => updateScreen(idx, 'image', e.target.value)}
                    className="w-full bg-[#0d0e12] border border-white/5 rounded-xl py-3 px-4 text-white text-xs font-mono outline-none focus:border-[#5d3cfe] transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black text-[#474556] uppercase ml-1">Descripción Técnica</label>
                  <textarea
                    rows={3}
                    value={screen.desc}
                    onChange={(e) => updateScreen(idx, 'desc', e.target.value)}
                    className="w-full bg-[#0d0e12] border border-white/5 rounded-xl py-3 px-4 text-white text-xs font-medium outline-none focus:border-[#5d3cfe] transition-all resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-[#474556] uppercase ml-1">Icono (Nombre)</label>
                    <select
                      value={screen.iconName}
                      onChange={(e) => updateScreen(idx, 'iconName', e.target.value)}
                      className="w-full bg-[#0d0e12] border border-white/5 rounded-xl py-3 px-4 text-white text-[10px] font-black uppercase outline-none focus:border-[#5d3cfe]"
                    >
                      <option value="Layout">Dashboard</option>
                      <option value="Search">Lupa / Market</option>
                      <option value="Shield">Escudo / Seg</option>
                      <option value="Wallet">Billetera</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-[#474556] uppercase ml-1">Color Acento</label>
                    <input
                      type="color"
                      value={screen.color}
                      onChange={(e) => updateScreen(idx, 'color', e.target.value)}
                      className="w-full h-[42px] bg-[#0d0e12] border border-white/5 rounded-xl p-1 outline-none cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECCIÓN 2: NOTICIAS Y BLOG (INTERACTIVIDAD) */}
      <div className="space-y-10">
        <div className="flex justify-between items-center border-b border-white/5 pb-6">
          <div>
             <h3 className="text-2xl font-black text-white uppercase tracking-tighter italic">Gestión de <span className="text-[#52ffac]">Noticias y Blog</span></h3>
             <p className="text-[10px] text-[#474556] font-bold uppercase tracking-[0.3em] mt-1">Sube contenido dinámico para el Footer</p>
          </div>
          <button
            onClick={addNews}
            className="flex items-center gap-2 px-8 py-4 bg-[#5d3cfe] text-white rounded-2xl text-[10px] font-black uppercase shadow-xl hover:scale-105 transition-all"
          >
            <Plus className="w-4 h-4" /> Nuevo Hito Industrial
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {news.map((n, idx) => (
            <div key={n.id} className="bg-[#1c1d21] border border-white/5 p-8 rounded-[2.5rem] grid grid-cols-1 md:grid-cols-4 gap-8 shadow-2xl group">
               <div className="space-y-4">
                  <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-[#52ffac]">
                    <Newspaper className="w-6 h-6" />
                  </div>
                  <select
                    value={n.category}
                    onChange={(e) => updateNews(idx, 'category', e.target.value)}
                    className="w-full bg-[#0d0e12] border border-white/5 rounded-xl py-2 px-3 text-[10px] font-black text-white uppercase"
                  >
                    <option value="Sala de Prensa">Sala de Prensa</option>
                    <option value="Blog">Blog Técnico</option>
                    <option value="Inversionistas">Inversionistas</option>
                  </select>
                  <input
                    type="date"
                    value={n.date}
                    onChange={(e) => updateNews(idx, 'date', e.target.value)}
                    className="w-full bg-[#0d0e12] border border-white/5 rounded-xl py-2 px-3 text-[10px] font-black text-white uppercase"
                  />
               </div>

               <div className="md:col-span-2 space-y-4">
                  <input
                    type="text"
                    value={n.title}
                    placeholder="Título de la noticia..."
                    onChange={(e) => updateNews(idx, 'title', e.target.value)}
                    className="w-full bg-transparent border-b border-white/10 py-2 text-lg font-black text-white uppercase tracking-tighter outline-none focus:border-[#52ffac]"
                  />
                  <textarea
                    rows={2}
                    value={n.summary}
                    placeholder="Resumen para el portal..."
                    onChange={(e) => updateNews(idx, 'summary', e.target.value)}
                    className="w-full bg-transparent text-sm text-[#8a879d] leading-relaxed resize-none outline-none"
                  />
               </div>

               <div className="flex flex-col justify-center items-end">
                  <button
                    onClick={() => deleteNews(n.id)}
                    className="p-4 bg-rose-600/10 text-rose-500 rounded-2xl hover:bg-rose-600 hover:text-white transition-all"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
               </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
