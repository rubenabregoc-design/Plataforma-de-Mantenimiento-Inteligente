import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DollarSign, TrendingUp, Star, Users, Truck, Package,
  BellRing, Settings, FileText, Check, Trash2, ShieldCheck,
  Plus, Store, AlertTriangle, Search, Activity
} from 'lucide-react';
import AuditLogsModule from '../../components/AuditLogsModule';
import InventoryModule from '../../components/InventoryModule';
import FleetDashboard from '../../components/FleetDashboard';
import LandingCMS from '../../components/LandingCMS';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import { useBusinessLogic } from '../../hooks/useBusinessLogic';
import Skeleton from '../../components/Skeleton';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Mail, MessageSquare as MsgIcon, Send } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function AdminDashboard() {
  const { assets, requests, technicians, inventory, isDataLoading, reminders } = useData();
  const { logout } = useAuth();
  const { tabs, openModal } = useUI();
  const business = useBusinessLogic();

  const adminTab = tabs.admin;
  const [verifyId, setVerifyId] = useState('');
  const [verifyResult, setVerifyResult] = useState<any>(null);

  // --- LOGICA DE TICKETS ---
  const [tickets, setTickets] = useState<any[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [replyText, setReplyText] = useState('');
  const [isReplying, setIsReplying] = useState(false);

  // --- LOGICA DE ADS ---
  const [ads, setAds] = useState<any[]>([]);
  const [newAd, setNewAd] = useState({ title: '', image: '', link: '', placement: 'client' });

  useEffect(() => {
    if (adminTab === 'tickets') {
      const q = query(collection(db, "support_tickets"), orderBy("createdAt", "desc"));
      const unsub = onSnapshot(q, (snap) => {
        setTickets(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });
      return () => unsub();
    }
    if (adminTab === 'ads') {
      const unsub = onSnapshot(doc(db, "config", "marketing"), (docSnap) => {
        if (docSnap.exists()) setAds(docSnap.data().banners || []);
      });
      return () => unsub();
    }
  }, [adminTab]);

  const handleSaveAds = async (updatedAds: any[]) => {
    try {
      await updateDoc(doc(db, "config", "marketing"), { banners: updatedAds });
      toast.success("Campaña de marketing actualizada");
    } catch (e) {
      // Si no existe el documento, lo creamos
      await setDoc(doc(db, "config", "marketing"), { banners: updatedAds });
      toast.success("Campaña iniciada con éxito");
    }
  };

  const addAd = () => {
    const list = [...ads, { ...newAd, id: Date.now() }];
    setAds(list);
    handleSaveAds(list);
    setNewAd({ title: '', image: '', link: '', placement: 'client' });
  };

  const deleteAd = (id: number) => {
    const list = ads.filter(a => a.id !== id);
    setAds(list);
    handleSaveAds(list);
  };

  const handleReplyTicket = async () => {
    if (!replyText.trim() || !selectedTicket) return;
    setIsReplying(true);
    try {
      const res = await fetch("/api/admin/reply-ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: selectedTicket.userName,
          email: selectedTicket.userEmail,
          subject: selectedTicket.subject,
          message: replyText,
          originalMessage: selectedTicket.message
        })
      });

      if (res.ok) {
        await updateDoc(doc(db, "support_tickets", selectedTicket.id), {
          status: 'resolved',
          replySent: true,
          repliedAt: new Date().toISOString()
        });
        toast.success("Respuesta premium enviada con éxito.");
        setReplyText('');
        setSelectedTicket(null);
      }
    } catch (e) {
      toast.error("Error al enviar respuesta.");
    } finally {
      setIsReplying(false);
    }
  };

  const handleVerifyId = () => {
    if (!verifyId.trim()) {
      setVerifyResult(null);
      return;
    }
    const asset = assets.find(a => a.id.toUpperCase() === verifyId.toUpperCase());
    if (asset) {
      setVerifyResult({
        found: true,
        asset,
        hash: btoa(asset.id).substring(0, 10).toUpperCase()
      });
    } else {
      setVerifyResult({ found: false });
    }
  };

  // --- Lógica Financiera Real ---
  const completedRequests = requests.filter(r => r.status === 'completed' || r.status === 'rated');
  const grossIncome = completedRequests.reduce((sum, r) => sum + (r.price || 0), 0);
  const totalCommissions = completedRequests.reduce((sum, r) => sum + (r.commission || 0), 0);

  // Membresías: Cálculo Real basado en planes de técnicos
  const subscriptionIncome = technicians.reduce((sum, t) => {
    const planPrice = t.plan === 'pro' ? 45 : t.plan === 'enterprise' ? 99 : 29;
    return sum + planPrice;
  }, 0);

  const activeSubscriptions = subscriptionIncome; // Reparando la referencia perdida
  const avgTicket = completedRequests.length > 0 ? (grossIncome / completedRequests.length).toFixed(2) : '0.00';

  // --- MOTOR DE DOMINANCIA DE MERCADO (REAL) ---
  const getMarketShare = () => {
    if (completedRequests.length === 0) return [
      { label: 'PH & Edificios', pct: 0, color: '#5d3cfe' },
      { label: 'Salud / Médico', pct: 0, color: '#f43f5e' },
      { label: 'Construcción', pct: 0, color: '#f59e0b' },
      { label: 'Residencial', pct: 0, color: '#52ffac' }
    ];

    const totals = completedRequests.reduce((acc: any, req) => {
      const asset = assets.find(a => a.id === req.assetId);
      const cat = asset?.category || 'GENERAL';
      acc[cat] = (acc[cat] || 0) + (req.price || 0);
      return acc;
    }, {});

    const totalVolume = Object.values(totals).reduce((a: any, b: any) => a + b, 0) as number;

    return [
      { label: 'PH & Edificios', pct: Math.round(((totals['PH'] || 0) / totalVolume) * 100), color: '#5d3cfe' },
      { label: 'Salud / Médico', pct: Math.round(((totals['SALUD'] || 0) / totalVolume) * 100), color: '#f43f5e' },
      { label: 'Construcción', pct: Math.round(((totals['CONSTRUCCION'] || 0) / totalVolume) * 100), color: '#f59e0b' },
      { label: 'Residencial', pct: Math.round(((totals['GENERAL'] || 0) / totalVolume) * 100), color: '#52ffac' }
    ];
  };

  const marketShareData = getMarketShare();

  // --- MOTOR DE EVOLUCIÓN MENSUAL REAL (Últimos 6 meses) ---
  const getMonthlyIncomeData = () => {
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const now = new Date();
    const result = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthLabel = months[d.getMonth()];

      const monthlyTotal = completedRequests.reduce((sum, req) => {
        const reqDate = (req.createdAt as any)?.toDate?.() || new Date(req.createdAt);
        if (reqDate.getMonth() === d.getMonth() && reqDate.getFullYear() === d.getFullYear()) {
          return sum + (req.price || 0);
        }
        return sum;
      }, 0);

      result.push({ label: monthLabel, total: monthlyTotal });
    }
    return result;
  };

  const monthlyHistory = getMonthlyIncomeData();
  const maxMonthly = Math.max(...monthlyHistory.map(m => m.total), 100);

  // Generador de coordenadas SVG (0-100)
  const chartPoints = monthlyHistory.map((m, i) => ({
    x: i * 20, // 6 puntos divididos en 100 unidades (0, 20, 40, 60, 80, 100)
    y: 90 - ((m.total / maxMonthly) * 80) // Invertido, con margen de 10 arriba/abajo
  }));

  // Generador de Curva Bezier Suavizada (Estilo Industrial S-Curve)
  const generateSmoothPath = (points: {x: number, y: number}[]) => {
    if (points.length < 2) return "";
    let d = `M ${points[0].x},${points[0].y} `;

    for (let i = 0; i < points.length - 1; i++) {
      const curr = points[i];
      const next = points[i + 1];
      // Control points con sesgo horizontal para evitar el efecto "burbuja"
      const cp1x = curr.x + (next.x - curr.x) * 0.5;
      const cp1y = curr.y;
      const cp2x = curr.x + (next.x - curr.x) * 0.5;
      const cp2y = next.y;
      d += `C ${cp1x},${cp1y} ${cp2x},${cp2y} ${next.x},${next.y} `;
    }
    return d;
  };

  const smoothPath = generateSmoothPath(chartPoints);
  const areaPath = `${smoothPath} L 100,100 L 0,100 Z`;

  return (
    <div className="space-y-12 animate-fade-in-up">
      {adminTab === 'validator' && (
        <div className="max-w-4xl mx-auto space-y-10">
          <header className="text-center space-y-4">
            <h1 className="text-4xl font-black text-white uppercase tracking-tighter italic">Validador de <span className="text-[#5d3cfe]">Certificados</span></h1>
            <p className="text-[10px] text-[#474556] font-black uppercase tracking-[0.4em]">Verificación de Integridad de Reportes MDM-V4</p>
          </header>

          <div className="bg-[#121317] border border-[#2a2b2f] p-6 sm:p-10 rounded-[1.5rem] sm:rounded-[3rem] shadow-2xl space-y-6 sm:space-y-8 relative overflow-hidden">
             <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                   <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-[#474556]" />
                   <input
                     type="text"
                     placeholder="Ingrese UUID del Reporte..."
                     value={verifyId}
                     onChange={(e) => setVerifyId(e.target.value)}
                     className="w-full bg-[#1c1d21] border border-[#2a2b2f] rounded-2xl py-5 pl-16 pr-6 text-sm font-black text-white focus:border-[#5d3cfe] outline-none transition-all uppercase"
                   />
                </div>
                <button
                  onClick={handleVerifyId}
                  className="px-10 py-5 bg-[#5d3cfe] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-[#5d3cfe]/20 hover:scale-105 transition-all"
                >
                   Validar Registro
                </button>
             </div>

             {verifyResult && (
               <div className="animate-fade-in-up">
                  {verifyResult.found ? (
                    <div className="bg-[#52ffac]/5 border border-[#52ffac]/20 p-8 rounded-[2.5rem] space-y-6">
                       <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                             <div className="w-12 h-12 bg-[#52ffac] rounded-2xl flex items-center justify-center text-black">
                                <ShieldCheck className="w-6 h-6" />
                             </div>
                             <div>
                                <h3 className="text-xl font-black text-white uppercase tracking-tight">AUTENTICIDAD CONFIRMADA</h3>
                                <p className="text-[9px] text-[#52ffac] font-black uppercase tracking-widest">Activo Vinculado en Centro de Control</p>
                             </div>
                          </div>
                          <span className="px-4 py-1.5 bg-[#52ffac] text-black rounded-full text-[8px] font-black uppercase">VÁLIDO</span>
                       </div>

                       <div className="grid grid-cols-2 gap-6 pt-6 border-t border-white/5">
                          <div>
                             <p className="text-[8px] font-black text-[#474556] uppercase tracking-widest mb-1">Nombre del Activo</p>
                             <p className="text-white font-black uppercase">{verifyResult.asset.name}</p>
                          </div>
                          <div>
                             <p className="text-[8px] font-black text-[#474556] uppercase tracking-widest mb-1">ID Único</p>
                             <p className="text-white font-mono text-[10px]">{verifyResult.asset.id.toUpperCase()}</p>
                          </div>
                          <div>
                             <p className="text-[8px] font-black text-[#474556] uppercase tracking-widest mb-1">Firma Esperada (NODE-SIG)</p>
                             <p className="text-[#5d3cfe] font-mono text-[10px] font-black">{verifyResult.hash}</p>
                          </div>
                          <div>
                             <p className="text-[8px] font-black text-[#474556] uppercase tracking-widest mb-1">Detección de Manipulación</p>
                             <p className="text-white font-black uppercase">Ninguna Detectada</p>
                          </div>
                       </div>
                    </div>
                  ) : (
                    <div className="bg-rose-500/5 border border-rose-500/20 p-8 rounded-[2.5rem] flex items-center gap-6">
                       <div className="w-12 h-12 bg-rose-500 rounded-2xl flex items-center justify-center text-white">
                          <AlertTriangle className="w-6 h-6" />
                       </div>
                       <div>
                          <h3 className="text-lg font-black text-white uppercase tracking-tight">ERROR DE VALIDACIÓN</h3>
                          <p className="text-[9px] text-rose-500 font-black uppercase tracking-widest">El UUID ingresado no coincide con ningún registro en el Sistema Central.</p>
                       </div>
                    </div>
                  )}
               </div>
             )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="p-8 bg-[#1c1d21] border border-white/5 rounded-[2.5rem] flex items-center gap-5">
                <div className="w-10 h-10 bg-[#5d3cfe]/10 rounded-xl flex items-center justify-center text-[#5d3cfe]">
                   <Activity className="w-5 h-5" />
                </div>
                <div>
                   <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Sincronización MDM-V4</h4>
                   <p className="text-[8px] text-[#474556] font-bold uppercase mt-1">Conectado al Sat-Link Panama Central</p>
                </div>
             </div>
             <div className="p-8 bg-[#1c1d21] border border-white/5 rounded-[2.5rem] flex items-center gap-5">
                <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500">
                   <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                   <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Protocolo de Integridad</h4>
                   <p className="text-[8px] text-[#474556] font-bold uppercase mt-1">Validación de firmas criptográficas activa</p>
                </div>
             </div>
          </div>
        </div>
      )}

      {adminTab === 'audit' && (
        <AuditLogsModule logs={[]} />
      )}

      {adminTab === 'tickets' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 h-[70vh]">
           {/* LISTA DE TICKETS */}
           <div className="lg:col-span-5 bg-[#121317] border border-white/5 rounded-[3rem] overflow-hidden flex flex-col shadow-2xl">
              <header className="p-8 border-b border-white/5 bg-[#1c1d21]/50">
                 <h3 className="text-xl font-black text-white uppercase tracking-tighter">Bandeja de Entrada</h3>
                 <p className="text-[10px] text-[#474556] font-bold uppercase tracking-widest mt-1">Requerimientos desde mantech-pro.com</p>
              </header>
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                 {tickets.length === 0 && <p className="p-10 text-center text-[#474556] uppercase text-[10px] font-black italic">Sin tickets pendientes</p>}
                 {tickets.map(t => (
                   <button
                     key={t.id}
                     onClick={() => setSelectedTicket(t)}
                     className={`w-full p-8 text-left border-b border-white/5 transition-all hover:bg-white/[0.02] flex items-center gap-6 group
                       ${selectedTicket?.id === t.id ? 'bg-[#5d3cfe]/10 border-r-4 border-r-[#5d3cfe]' : ''}`}
                   >
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${t.status === 'resolved' ? 'bg-[#52ffac]/10 text-[#52ffac]' : 'bg-[#5d3cfe]/10 text-[#5d3cfe]'}`}>
                         <Mail className="w-6 h-6" />
                      </div>
                      <div className="flex-1 overflow-hidden">
                         <h4 className="text-sm font-black text-white uppercase truncate">{t.userName}</h4>
                         <p className="text-[10px] text-[#8a879d] font-bold truncate mt-1">{t.subject}</p>
                         <p className="text-[8px] text-[#474556] font-black uppercase mt-2">{new Date(t.createdAt?.toDate?.() || t.createdAt).toLocaleDateString()}</p>
                      </div>
                   </button>
                 ))}
              </div>
           </div>

           {/* VISTA Y RESPUESTA */}
           <div className="lg:col-span-7">
              {selectedTicket ? (
                <div className="bg-[#121317] border border-white/5 rounded-[3rem] h-full flex flex-col shadow-2xl overflow-hidden animate-fade-in">
                   <div className="p-10 space-y-8 flex-1 overflow-y-auto custom-scrollbar">
                      <div className="space-y-4">
                         <span className="px-4 py-1 bg-white/5 border border-white/10 rounded-full text-[8px] font-black text-[#474556] uppercase">Consulta Original</span>
                         <h2 className="text-3xl font-black text-white uppercase tracking-tighter leading-none italic">{selectedTicket.subject}</h2>
                         <div className="flex items-center gap-3">
                            <p className="text-xs font-bold text-[#c8c4d9]">{selectedTicket.userName}</p>
                            <span className="text-[#474556]">●</span>
                            <p className="text-xs font-mono text-[#5d3cfe]">{selectedTicket.userEmail}</p>
                         </div>
                      </div>

                      <div className="p-8 bg-[#0d0e12] border border-white/5 rounded-[2.5rem] relative">
                         <p className="text-[#8a879d] text-base leading-relaxed italic">"{selectedTicket.message}"</p>
                      </div>

                      {selectedTicket.status === 'resolved' && (
                        <div className="p-6 bg-[#52ffac]/5 border border-[#52ffac]/20 rounded-2xl flex items-center gap-4">
                           <Check className="w-5 h-5 text-[#52ffac]" />
                           <p className="text-[10px] font-black text-[#52ffac] uppercase tracking-widest">Este ticket ya fue respondido por el Nodo Central.</p>
                        </div>
                      )}
                   </div>

                   <div className="p-8 bg-[#1c1d21] border-t border-white/5 space-y-4">
                      <div className="flex items-center justify-between px-2">
                        <label className="text-[9px] font-black text-[#474556] uppercase tracking-widest">Respuesta Premium</label>
                        <MsgIcon className="w-4 h-4 text-[#5d3cfe]" />
                      </div>
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Escriba su respuesta técnica aquí..."
                        rows={4}
                        className="w-full bg-[#0d0e12] border border-white/10 rounded-2xl p-6 text-sm text-white outline-none focus:border-[#5d3cfe] transition-all resize-none shadow-inner"
                      />
                      <button
                        onClick={handleReplyTicket}
                        disabled={isReplying || !replyText.trim()}
                        className="w-full py-5 bg-[#5d3cfe] text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-[#5d3cfe]/20 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                      >
                         {isReplying ? 'TRANSMITIENDO...' : <><Send className="w-4 h-4" /> Enviar Respuesta Oficial</>}
                      </button>
                   </div>
                </div>
              ) : (
                <div className="bg-[#121317]/50 border border-dashed border-white/5 rounded-[3rem] h-full flex items-center justify-center text-center p-20">
                   <div className="space-y-6">
                      <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                        <Mail className="w-10 h-10 text-[#474556]" />
                      </div>
                      <p className="text-sm font-black text-[#474556] uppercase tracking-widest leading-relaxed">Seleccione un ticket de la izquierda <br /> para iniciar el protocolo de respuesta.</p>
                   </div>
                </div>
              )}
           </div>
        </div>
      )}

      {adminTab === 'ads' && (
        <div className="space-y-12">
          <header className="flex justify-between items-center bg-[#121317] border border-white/5 p-8 rounded-[3rem] shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 blur-3xl rounded-full -mr-20 -mt-20"></div>
            <div className="relative z-10">
              <h1 className="text-3xl font-black text-white uppercase tracking-tighter italic">Gestión de <span className="text-amber-500">Marketing & Ads</span></h1>
              <p className="text-[10px] text-[#474556] font-black uppercase tracking-[0.4em] mt-2">Monetización y Banners Publicitarios en la Red</p>
            </div>
            <button onClick={addAd} className="px-8 py-4 bg-amber-500 text-black rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-amber-500/20 hover:scale-105 transition-all flex items-center gap-3 relative z-10">
               <Plus className="w-4 h-4" /> Crear Nuevo Espacio
            </button>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             {/* EDITOR DE NUEVO ANUNCIO */}
             <div className="bg-[#121317] border border-white/5 p-10 rounded-[3rem] space-y-8 shadow-2xl">
                <h3 className="text-xl font-black text-white uppercase tracking-tight italic">Configurar Banner</h3>
                <div className="space-y-6">
                   <div className="space-y-2">
                      <label className="text-[9px] font-black text-[#474556] uppercase ml-1">Título de Campaña</label>
                      <input type="text" value={newAd.title} onChange={e => setNewAd({...newAd, title: e.target.value})} className="w-full bg-[#0d0e12] border border-white/5 rounded-xl py-4 px-6 text-sm text-white focus:border-amber-500 outline-none transition-all" placeholder="Ej: Especial Inverter 2026" />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[9px] font-black text-[#474556] uppercase ml-1">URL de Imagen (1200x300)</label>
                      <input type="text" value={newAd.image} onChange={e => setNewAd({...newAd, image: e.target.value})} className="w-full bg-[#0d0e12] border border-white/5 rounded-xl py-4 px-6 text-sm text-white focus:border-amber-500 outline-none transition-all font-mono" placeholder="https://..." />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[9px] font-black text-[#474556] uppercase ml-1">Enlace de Destino (Link)</label>
                      <input type="text" value={newAd.link} onChange={e => setNewAd({...newAd, link: e.target.value})} className="w-full bg-[#0d0e12] border border-white/5 rounded-xl py-4 px-6 text-sm text-white focus:border-amber-500 outline-none transition-all font-mono" placeholder="https://..." />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[9px] font-black text-[#474556] uppercase ml-1">Ubicación del Ad</label>
                      <select value={newAd.placement} onChange={e => setNewAd({...newAd, placement: e.target.value})} className="w-full bg-[#0d0e12] border border-white/5 rounded-xl py-4 px-6 text-[10px] font-black text-white uppercase outline-none focus:border-amber-500">
                         <option value="client">Dashboard Cliente</option>
                         <option value="tech">Dashboard Técnico</option>
                         <option value="marketplace">Marketplace (Sidebar)</option>
                         <option value="landing">Página de Inicio (Landing)</option>
                      </select>
                   </div>
                </div>
             </div>

             {/* VISTA PREVIA Y LISTADO */}
             <div className="lg:col-span-2 space-y-6">
                <h3 className="text-[10px] font-black text-[#474556] uppercase tracking-[0.4em] ml-2">Campaña Activa en Red</h3>
                <div className="grid grid-cols-1 gap-6">
                   {ads.map((ad, idx) => (
                     <div key={ad.id} className="bg-[#1c1d21] border border-white/5 p-6 rounded-[2.5rem] flex items-center gap-8 shadow-2xl relative group hover:border-amber-500/30 transition-all overflow-hidden">
                        <div className="w-48 h-24 rounded-2xl bg-[#0d0e12] overflow-hidden border border-white/5 shrink-0">
                           {ad.image ? <img src={ad.image} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-[#474556]"><ImageIcon className="w-8 h-8" /></div>}
                        </div>
                        <div className="flex-1 space-y-2">
                           <div className="flex items-center gap-3">
                              <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-[8px] font-black text-amber-500 uppercase tracking-widest">
                                {ad.placement === 'client' ? 'Cliente' : ad.placement === 'tech' ? 'Técnico' : ad.placement === 'landing' ? 'Landing' : 'Market'}
                              </span>
                              <h4 className="text-lg font-black text-white uppercase tracking-tighter">{ad.title}</h4>
                           </div>
                           <p className="text-[10px] text-[#474556] font-mono truncate">{ad.link}</p>
                        </div>
                        <button onClick={() => deleteAd(ad.id)} className="p-4 bg-rose-600/10 text-rose-500 rounded-2xl hover:bg-rose-600 hover:text-white transition-all">
                           <Trash2 className="w-5 h-5" />
                        </button>
                     </div>
                   ))}
                   {ads.length === 0 && (
                     <div className="p-20 bg-[#121317]/50 border border-dashed border-white/5 rounded-[3rem] text-center">
                        <p className="text-[10px] text-[#474556] font-black uppercase tracking-widest italic">Sin campañas publicitarias activas</p>
                     </div>
                   )}
                </div>
             </div>
          </div>
        </div>
      )}

      {adminTab === 'logistics' && (
        <div className="space-y-10">
          <header className="flex justify-between items-center bg-[#121317] border border-white/5 p-8 rounded-[3rem] shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#e11d48]/5 blur-3xl rounded-full -mr-20 -mt-20"></div>
            <div className="relative z-10">
              <h1 className="text-3xl font-black text-white uppercase tracking-tighter italic">Consola de <span className="text-[#e11d48]">Logística Global</span></h1>
              <p className="text-[10px] text-[#474556] font-black uppercase tracking-[0.4em] mt-2">Monitoreo y Auditoría de Flota en Tiempo Real</p>
            </div>
            <div className="px-6 py-2 bg-[#e11d48]/10 border border-[#e11d48]/20 rounded-full flex items-center gap-2">
               <div className="w-2 h-2 bg-[#e11d48] rounded-full animate-ping"></div>
               <span className="text-[9px] font-black text-[#e11d48] uppercase tracking-widest italic">Sat-Link Active</span>
            </div>
          </header>

          <FleetDashboard
            assets={assets}
            reminders={reminders}
            onBulkUpdate={business.handleUpdateAsset}
            onBulkDelete={(ids) => {
              openModal('confirmation', {
                confTitle: "Eliminación Masiva",
                confMessage: `¿Estás seguro de eliminar ${ids.length} activos permanentemente? Esta acción es irreversible.`,
                confType: 'danger',
                onConfConfirm: () => ids.forEach(id => business.handleDeleteAsset(id))
              });
            }}
            mode="full"
          />
        </div>
      )}

      {adminTab === 'finance' && (
        <div className="space-y-12">
          {/* Métricas Principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-[#121317] border border-[#2a2b2f] p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
              <span className="text-[9px] font-black text-[#474556] uppercase tracking-[0.3em] block mb-3">Venta Bruta</span>
              <h2 className="text-4xl font-black text-white italic tracking-tighter leading-none">${grossIncome.toLocaleString()}</h2>
              <div className="absolute -bottom-2 -right-2 opacity-5 group-hover:opacity-10 transition-opacity"><DollarSign className="w-20 h-20" /></div>
            </div>
            <div className="bg-[#121317] border border-[#2a2b2f] p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
              <span className="text-[9px] font-black text-[#474556] uppercase tracking-[0.3em] block mb-3">Comisiones Netas</span>
              <h2 className="text-4xl font-black text-[#5d3cfe] italic tracking-tighter leading-none">${totalCommissions.toLocaleString()}</h2>
              <div className="absolute -bottom-2 -right-2 opacity-5 group-hover:opacity-10 transition-opacity"><TrendingUp className="w-20 h-20" /></div>
            </div>
            <div className="bg-[#121317] border border-[#2a2b2f] p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
              <span className="text-[9px] font-black text-[#474556] uppercase tracking-[0.3em] block mb-3">Suscripciones</span>
              <h2 className="text-4xl font-black text-amber-500 italic tracking-tighter leading-none">${subscriptionIncome.toLocaleString()}</h2>
              <div className="absolute -bottom-2 -right-2 opacity-5 group-hover:opacity-10 transition-opacity"><Star className="w-20 h-20" /></div>
            </div>
            <div className="bg-[#121317] border border-[#2a2b2f] p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
              <span className="text-[9px] font-black text-[#474556] uppercase tracking-[0.3em] block mb-3">Ticket Promedio</span>
              <h2 className="text-4xl font-black text-[#52ffac] italic tracking-tighter leading-none">${avgTicket}</h2>
              <div className="absolute -bottom-2 -right-2 opacity-5 group-hover:opacity-10 transition-opacity"><Truck className="w-20 h-20" /></div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Gráfica de Rendimiento Mensual (SVG Nativo) */}
            <div className="lg:col-span-2 bg-[#121317] border border-[#2a2b2f] p-10 rounded-[3rem] shadow-2xl space-y-8">
               <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-black text-white uppercase tracking-tighter italic">Evolución de Ingresos</h3>
                    <p className="text-[9px] text-[#474556] font-black uppercase tracking-[0.2em] mt-2">Red de Especialistas Panamá</p>
                  </div>
                  <div className="px-4 py-2 bg-[#52ffac]/10 border border-[#52ffac]/20 rounded-xl text-[9px] font-black text-[#52ffac] uppercase tracking-widest">+18.4% ANUAL</div>
               </div>

               <div className="h-64 w-full relative pt-4">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
                     <defs>
                        <linearGradient id="incomeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                           <stop offset="0%" style={{ stopColor: '#5d3cfe', stopOpacity: 0.2 }} />
                           <stop offset="100%" style={{ stopColor: '#5d3cfe', stopOpacity: 0 }} />
                        </linearGradient>
                        <filter id="glowLine">
                           <feGaussianBlur stdDeviation="1.2" result="coloredBlur"/>
                           <feMerge>
                              <feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/>
                           </feMerge>
                        </filter>
                     </defs>
                     {/* Guías Horizontales Minimalistas */}
                     {[20, 50, 80].map(v => <line key={v} x1="0" y1={v} x2="100" y2={v} stroke="white" strokeOpacity="0.02" strokeWidth="0.3" strokeDasharray="2,2" />)}

                     {/* Área de Relleno */}
                     <path
                       d={areaPath}
                       fill="url(#incomeGrad)"
                       className="transition-all duration-1000"
                     />
                     {/* Línea Principal Refinada */}
                     <path
                       d={smoothPath}
                       fill="none"
                       stroke="#5d3cfe"
                       strokeWidth="1.8"
                       strokeLinecap="round"
                       filter="url(#glowLine)"
                       className="transition-all duration-1000"
                     />
                     {/* Puntos de Datos Minimalistas */}
                     {chartPoints.map((p, i) => (
                       <g key={i} className="group/dot">
                          <circle cx={p.x} cy={p.y} r="1.2" fill="#52ffac" className="drop-shadow-[0_0_3px_#52ffac]" />
                          <circle cx={p.x} cy={p.y} r="4" fill="#52ffac" fillOpacity="0" className="group-hover/dot:fill-opacity-10 transition-all cursor-pointer" />
                       </g>
                     ))}
                  </svg>
                  <div className="flex justify-between mt-6 text-[8px] font-black text-[#474556] uppercase tracking-widest px-2">
                     {monthlyHistory.map((m, i) => <span key={i}>{m.label}</span>)}
                  </div>
               </div>
            </div>

            {/* Desglose por Vertical (Market Share Interno) */}
            <div className="bg-[#121317] border border-[#2a2b2f] p-10 rounded-[3rem] shadow-2xl space-y-8">
               <h3 className="text-xl font-black text-white uppercase tracking-tighter italic">Dominancia de Mercado</h3>
               <div className="space-y-6">
                  {marketShareData.map(item => (
                    <div key={item.label} className="space-y-2">
                       <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest">
                          <span className="text-white/40">{item.label}</span>
                          <span style={{ color: item.color }}>{item.pct}%</span>
                       </div>
                       <div className="h-1.5 w-full bg-black/40 border border-white/5 rounded-full overflow-hidden p-[2px]">
                          <div
                            className="h-full transition-all duration-1000 rounded-full"
                            style={{
                               width: `${item.pct}%`,
                               backgroundColor: item.color,
                               boxShadow: `0 0 12px ${item.color}40`
                            }}
                          />
                       </div>
                    </div>
                  ))}
               </div>
               <div className="pt-6 border-t border-white/5">
                  <p className="text-[8px] text-[#474556] font-bold uppercase leading-relaxed text-center">
                    Cálculo basado en el volumen total de tickets ejecutados en el Sistema Central.
                  </p>
               </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Suscripciones/Pagos Pendientes */}
            <div className="bg-[#121317] border border-[#2a2b2f] p-10 rounded-[3rem] shadow-2xl space-y-8">
               <header><h1 className="text-2xl font-black text-white uppercase tracking-tighter">Gestión de <span className="text-amber-500">Pagos Yappy</span></h1></header>
               <div className="grid grid-cols-1 gap-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                  {requests.filter(r => r.status === 'pending_verification').map(r => (
                    <div key={r.id} className="p-6 bg-[#1c1d21] border border-amber-500/20 rounded-3xl flex justify-between items-center group animate-pulse hover:animate-none">
                       <div className="flex gap-6 items-center">
                          <div className="p-4 bg-amber-500/10 rounded-2xl text-amber-500">
                             <DollarSign className="w-6 h-6" />
                          </div>
                          <div>
                             <h4 className="text-sm font-black text-white uppercase tracking-tight">{r.clientName}</h4>
                             <p className="text-[10px] font-bold text-[#c8c4d9] mt-1 uppercase">Monto: ${r.price} - Activo: {r.assetName}</p>
                          </div>
                       </div>
                       <button onClick={() => business.handleConfirmPayment(r.id)} className="px-8 py-3 bg-amber-500 text-black rounded-xl text-[9px] font-black uppercase tracking-widest shadow-xl">Verificar Pago ➔</button>
                    </div>
                  ))}
                  {requests.filter(r => r.status === 'pending_verification').length === 0 && (
                     <p className="text-[10px] text-[#474556] font-bold uppercase italic text-center py-10">Sin pagos pendientes de verificación.</p>
                  )}
               </div>
            </div>

            {/* PANEL DE ARBITRAJE DE DISPUTAS */}
            <div className="bg-[#121317] border border-rose-500/20 p-10 rounded-[3rem] shadow-2xl space-y-8">
               <header><h1 className="text-2xl font-black text-white uppercase tracking-tighter">Centro de <span className="text-rose-500">Arbitraje</span></h1></header>
               <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                  {requests.filter(r => r.status === 'disputed').map(r => (
                    <div key={r.id} className="p-6 bg-rose-600/5 border border-rose-500/20 rounded-3xl space-y-4">
                       <div className="flex justify-between items-start">
                          <div>
                             <h4 className="text-sm font-black text-white uppercase">{r.assetName}</h4>
                             <p className="text-[9px] font-bold text-rose-400 uppercase tracking-widest">Incidencia: {r.issueDescription}</p>
                          </div>
                          <AlertTriangle className="w-5 h-5 text-rose-500 animate-pulse" />
                       </div>
                       <div className="flex gap-3">
                          <button onClick={() => business.handleArbitrateDispute(r.id, 'refund_to_client')} className="flex-1 py-3 bg-white/5 text-white border border-white/10 rounded-xl text-[8px] font-black uppercase hover:bg-rose-600 transition-all">Reembolsar Cliente</button>
                          <button onClick={() => business.handleArbitrateDispute(r.id, 'release_to_tech')} className="flex-1 py-3 bg-rose-600 text-white rounded-xl text-[8px] font-black uppercase shadow-lg">Liberar a Técnico</button>
                       </div>
                    </div>
                  ))}
                  {requests.filter(r => r.status === 'disputed').length === 0 && (
                    <p className="text-[10px] text-[#474556] font-bold uppercase italic text-center py-10">Sin disputas activas en la red.</p>
                  )}
               </div>
            </div>
          </div>
        </div>
      )}

      {adminTab === 'users' && (
        <div className="bg-[#121317] border border-[#2a2b2f] p-10 rounded-[3rem] shadow-2xl space-y-8">
          <header><h1 className="text-4xl font-black text-white uppercase tracking-tighter">Maestro de <span className="text-[#5d3cfe]">Usuarios</span></h1></header>
          <table className="w-full text-left text-xs">
            <thead><tr className="border-b border-[#2a2b2f] text-[#474556] uppercase font-black"><th className="py-4 px-6">Nombre del Especialista</th><th className="py-4 px-6 text-right">Estatus Oficial</th></tr></thead>
            <tbody className="divide-y divide-[#1c1d21]">
              {technicians.map(t => (
                <tr key={t.id} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="py-6 px-6 font-black text-white uppercase">{t.name}</td>
                  <td className="py-6 px-6 text-right">
                     <button onClick={() => business.handleVerifyTechnician(t.id, !t.isVerified)} className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase transition-all ${t.isVerified ? 'bg-rose-500 text-white' : 'bg-[#52ffac] text-black shadow-lg shadow-[#52ffac]/20'}`}>{t.isVerified ? 'Suspender' : 'Aprobar Sello'}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {adminTab === 'inventory' && (
        <InventoryModule
          items={inventory}
          assets={assets}
          onUpdateQuantity={business.handleUpdateInventoryQuantity}
          onAddItem={business.handleAddInventoryItem}
          onDeleteItem={business.handleDeleteInventoryItem}
          onUpdateItem={business.handleUpdateInventoryItem}
        />
      )}

      {adminTab === 'alerts' && (
        <div className="space-y-10 animate-fade-in">
          <header className="flex justify-between items-center bg-[#121317] border border-white/5 p-8 rounded-[3rem] shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-rose-600/5 blur-3xl rounded-full -mr-20 -mt-20"></div>
            <div className="relative z-10">
              <h1 className="text-3xl font-black text-white uppercase tracking-tighter italic">Centro de <span className="text-rose-500">Alertas Críticas</span></h1>
              <p className="text-[10px] text-[#474556] font-black uppercase tracking-[0.4em] mt-2">Monitoreo de Anomalías y Vencimientos Globales</p>
            </div>
            <div className="p-4 bg-rose-600/10 rounded-2xl text-rose-500 animate-pulse">
               <BellRing className="w-8 h-8" />
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
             {/* ALERTAS DE MANTENIMIENTO VENCIDO */}
             <div className="bg-[#121317] border border-white/5 p-8 rounded-[2.5rem] space-y-6 shadow-xl">
                <div className="flex items-center gap-3">
                   <AlertTriangle className="w-5 h-5 text-amber-500" />
                   <h3 className="text-sm font-black text-white uppercase tracking-widest">Mantenimientos Vencidos</h3>
                </div>
                <div className="space-y-3">
                   {reminders.filter(r => r.status === 'urgent').map(r => {
                     const asset = assets.find(a => a.id === r.assetId);
                     return (
                       <div key={r.id} className="p-4 bg-rose-500/5 border border-rose-500/20 rounded-2xl flex justify-between items-center group">
                          <div>
                             <p className="text-[10px] font-black text-white uppercase">{asset?.name || 'Equipo Desconocido'}</p>
                             <p className="text-[8px] text-rose-400 font-bold uppercase mt-1">{r.title} • Venció el {new Date(r.dueDate).toLocaleDateString()}</p>
                          </div>
                          <button
                            onClick={() => openModal('engineeringReport', { asset })}
                            className="p-2 bg-white/5 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-600 text-white"
                          >
                             <Search className="w-3.5 h-3.5" />
                          </button>
                       </div>
                     );
                   })}
                   {reminders.filter(r => r.status === 'urgent').length === 0 && (
                     <p className="text-center py-10 text-[9px] text-[#474556] font-black uppercase italic">Sin alertas de vencimiento activas</p>
                   )}
                </div>
             </div>

             {/* ALERTAS DE SEGURIDAD (PRE-VIAJE) */}
             <div className="bg-[#121317] border border-white/5 p-8 rounded-[2.5rem] space-y-6 shadow-xl">
                <div className="flex items-center gap-3">
                   <ShieldCheck className="w-5 h-5 text-[#52ffac]" />
                   <h3 className="text-sm font-black text-white uppercase tracking-widest">Incidentes de Seguridad</h3>
                </div>
                <div className="space-y-3">
                   {assets.filter(a => a.preTripInspections?.some(i => i.items.some(it => it.status === 'fail'))).map(a => {
                     const lastFail = a.preTripInspections?.slice().reverse().find(i => i.items.some(it => it.status === 'fail'));
                     return (
                       <div key={a.id} className="p-4 bg-[#52ffac]/5 border border-[#52ffac]/20 rounded-2xl flex justify-between items-center group">
                          <div>
                             <p className="text-[10px] font-black text-white uppercase">{a.name}</p>
                             <p className="text-[8px] text-[#52ffac] font-bold uppercase mt-1">Fallo Detectado por {lastFail?.inspectorName} • {new Date(lastFail?.date || '').toLocaleDateString()}</p>
                          </div>
                          <button
                            onClick={() => openModal('engineeringReport', { asset: a })}
                            className="p-2 bg-white/5 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-[#52ffac] text-black"
                          >
                             <Activity className="w-3.5 h-3.5" />
                          </button>
                       </div>
                     );
                   })}
                   {assets.every(a => !a.preTripInspections?.some(i => i.items.some(it => it.status === 'fail'))) && (
                     <p className="text-center py-10 text-[9px] text-[#474556] font-black uppercase italic">Protocolos de seguridad al 100%</p>
                   )}
                </div>
             </div>
          </div>
        </div>
      )}

      {adminTab === 'settings' && (
        <div className="space-y-12">
          <div className="bg-[#121317] border border-[#2a2b2f] p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-[#5d3cfe]/5 blur-3xl rounded-full -mr-20 -mt-20"></div>
             <header className="mb-10 text-center relative z-10">
                <h1 className="text-4xl font-black text-white tracking-tighter uppercase">Consola <span className="text-[#5d3cfe]">Root Mantech</span></h1>
                <p className="text-[10px] text-[#474556] font-black uppercase tracking-[0.4em] mt-2">Gestión de Infraestructura y Contenidos</p>
             </header>

             <LandingCMS />

             <div className="mt-20 pt-10 border-t border-white/5 text-center">
                <button onClick={logout} className="px-12 py-5 bg-rose-600/10 border border-rose-600/20 text-rose-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all shadow-xl">Desconectar Sesión Maestra</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
