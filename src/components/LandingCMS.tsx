import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Save, Image as ImageIcon, Layout, Search, Shield, Wallet, Trash2, Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';

const initialScreens = [
  { id: 'dashboard', title: 'Monitor de Activos', subtitle: 'Todo bajo control', desc: 'Visualice el estado de salud de todos sus activos en una sola vista.', iconName: 'Layout', color: '#52ffac', image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1000' },
  { id: 'market', title: 'Marketplace de Subasta', subtitle: 'El mejor precio, siempre', desc: 'Publique su necesidad técnica y deje que los especialistas certificados compitan.', iconName: 'Search', color: '#5d3cfe', image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1000' },
  { id: 'security', title: 'Centro de Seguridad ID', subtitle: 'Confianza Master V4', desc: 'Cada profesional cuenta con un Mantech ID validado.', iconName: 'Shield', color: '#e11d48', image: 'https://images.unsplash.com/photo-1557597774-9d2739f85a76?auto=format&fit=crop&q=80&w=1000' },
  { id: 'wallet', title: 'Billetera & Escrow', subtitle: 'Pagos Blindados', desc: 'Los fondos se mantienen en custodia segura.', iconName: 'Wallet', color: '#f59e0b', image: 'https://images.unsplash.com/photo-1556742044-3c52d6e88c62?auto=format&fit=crop&q=80&w=1000' }
];

export default function LandingCMS() {
  const [screens, setScreens] = useState<any[]>(initialScreens);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const docRef = doc(db, "config", "showcase");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists() && docSnap.data().screens) {
        setScreens(docSnap.data().screens);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleSave = async () => {
    try {
      await setDoc(doc(db, "config", "showcase"), { screens });
      toast.success("Showcase actualizado con éxito");
    } catch (error) {
      toast.error("Error al guardar cambios");
    }
  };

  const updateScreen = (index: number, field: string, value: string) => {
    const newScreens = [...screens];
    newScreens[index] = { ...newScreens[index], [field]: value };
    setScreens(newScreens);
  };

  if (loading) return <div className="p-10 text-center text-white font-black uppercase tracking-widest animate-pulse">Cargando Motor de Contenido...</div>;

  return (
    <div className="space-y-10 animate-fade-in-up">
      <div className="flex justify-between items-center">
        <div>
           <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Editor de <span className="text-[#5d3cfe]">Showcase</span></h3>
           <p className="text-[10px] text-[#474556] font-bold uppercase tracking-[0.3em] mt-1">Gestión de Pantallas de la Landing Page</p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-3 bg-[#52ffac] text-black rounded-xl text-[10px] font-black uppercase shadow-lg shadow-[#52ffac]/20 hover:scale-105 transition-all"
        >
          <Save className="w-4 h-4" /> Guardar Cambios
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
  );
}
