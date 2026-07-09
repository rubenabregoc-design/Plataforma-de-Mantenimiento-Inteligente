import { toast } from 'react-hot-toast';
import React, { useState, useEffect } from 'react';
import { X, Send, User, Mail, LifeBuoy, ShieldCheck, Zap } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string;
  userName?: string;
  userId?: string;
  userRole?: string;
  plan?: string;
}

export default function SupportModal({ isOpen, onClose, userEmail, userName, userId, userRole, plan = 'basic' }: SupportModalProps) {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setGuestName('');
      setGuestEmail('');
      setSubject('');
      setMessage('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    try {
      const ticketData = {
        userName: userId ? userName : guestName,
        userEmail: userId ? userEmail : guestEmail,
        userId: userId || 'guest',
        userRole: userRole || 'guest',
        subject,
        message,
        status: 'new',
        priority: userId ? 'high' : 'medium',
        source: userId ? 'app_internal' : 'login_screen',
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, "support_tickets"), ticketData);

      toast.success(userId
        ? `¡Ticket enviado, ${userName}! El equipo técnico lo atenderá con prioridad alta.`
        : "¡Ticket enviado! Revisaremos tu caso y te ayudaremos a acceder a tu cuenta."
      );

      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Error al enviar el ticket. Verifica tu conexión e intenta nuevamente.");
    } finally {
      setIsSending(false);
    }
  };

  const getProfessionalRole = (role?: string) => {
    if (role === 'admin') return 'CONTROL CENTRAL MASTER';
    if (role === 'tech') return 'TÉCNICO ESPECIALISTA';
    return 'CLIENTE';
  };

  const getSupportLabel = () => {
    if (!userId) return "Atención Master: Respuesta garantizada en < 2 horas";
    switch(plan) {
      case 'plan-enterprise': return "VIP SUPPORT: Respuesta inmediata con Gerente Dedicado";
      case 'plan-pro': return "PRIORITY 24/7: Respuesta técnica prioritaria en < 30 min";
      default: return "STANDARD SUPPORT: Respuesta técnica en < 2 horas";
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#0d0e12]/95 backdrop-blur-md">
      <div className="w-full max-w-lg bg-[#121317] rounded-[2.5rem] border border-[#2a2b2f] shadow-2xl overflow-hidden animate-fade-in-up">
        <header className="px-8 py-6 bg-[#1c1d21] border-b border-[#2a2b2f] flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-lg ${userId ? 'bg-[#5d3cfe]/10 border-[#5d3cfe]/30 text-[#c7bfff]' : 'bg-rose-600/10 border-rose-600/30 text-rose-500'}`}>
              {userId ? <Zap className="w-6 h-6" /> : <LifeBuoy className="w-6 h-6" />}
            </div>
            <div>
              <h2 className="text-xl font-black text-white uppercase tracking-tight">
                {userId ? 'Soporte Inteligente' : 'Centro de Ayuda'}
              </h2>
              <p className="text-[10px] font-black text-[#c8c4d9] uppercase tracking-widest mt-1">
                {userId ? `Perfil: ${getProfessionalRole(userRole)}` : 'Problemas de Acceso / Consultas'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-[#474556] hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          {userId && (
            <div className="bg-[#5d3cfe]/5 border border-[#5d3cfe]/10 p-4 rounded-2xl flex items-center gap-4 mb-2">
              <div className="w-10 h-10 rounded-full bg-[#5d3cfe] flex items-center justify-center text-white font-black text-sm">
                {userName?.charAt(0)}
              </div>
              <div>
                <p className="text-xs font-black text-white uppercase">{userName}</p>
                <p className="text-[9px] text-[#c7bfff] font-bold uppercase tracking-widest">ID: {userId.substring(0,8)}... (Prioridad Alta)</p>
              </div>
              <ShieldCheck className="w-5 h-5 text-[#52ffac] ml-auto" />
            </div>
          )}

          {!userId && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-[#474556] uppercase tracking-widest ml-1">Tu Nombre</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#474556]" />
                  <input required type="text" value={guestName} onChange={e => setGuestName(e.target.value)} placeholder="Nombre completo"
                    className="w-full bg-[#0d0e12] border border-[#2a2b2f] rounded-xl py-3.5 pl-12 pr-4 text-sm font-bold text-white focus:border-[#5d3cfe] outline-none transition-all" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-[#474556] uppercase tracking-widest ml-1">Tu Correo</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#474556]" />
                  <input required type="email" value={guestEmail} onChange={e => setGuestEmail(e.target.value)} placeholder="email@ejemplo.com"
                    className="w-full bg-[#0d0e12] border border-[#2a2b2f] rounded-xl py-3.5 pl-12 pr-4 text-sm font-bold text-white focus:border-[#5d3cfe] outline-none transition-all" />
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[9px] font-black text-[#474556] uppercase tracking-widest ml-1">Asunto</label>
            <input required type="text" value={subject} onChange={e => setSubject(e.target.value)}
              placeholder={userId ? "¿En qué podemos ayudarte hoy?" : "Ej: No puedo entrar a mi cuenta"}
              className="w-full bg-[#0d0e12] border border-[#2a2b2f] rounded-xl py-3.5 px-4 text-sm font-bold text-white focus:border-[#5d3cfe] outline-none transition-all" />
          </div>

          <div className="space-y-2">
            <label className="text-[9px] font-black text-[#474556] uppercase tracking-widest ml-1">Descripción del problema</label>
            <textarea required rows={4} value={message} onChange={e => setMessage(e.target.value)} placeholder="Escribe los detalles aquí..."
              className="w-full bg-[#0d0e12] border border-[#2a2b2f] rounded-xl py-3.5 px-4 text-sm font-medium text-white focus:border-[#5d3cfe] outline-none transition-all resize-none" />
          </div>

          <button type="submit" disabled={isSending}
            className={`w-full py-5 rounded-xl text-xs font-black uppercase tracking-widest shadow-xl transition-all flex items-center justify-center gap-3 disabled:opacity-50 ${
              userId ? 'bg-[#5d3cfe] text-white shadow-[#5d3cfe]/20 hover:brightness-110' : 'bg-rose-600 text-white shadow-rose-600/20 hover:brightness-110'
            }`}
          >
            {isSending ? "ENVIANDO..." : <Send className="w-4 h-4" />}
            {userId ? "ENVIAR CONSULTA TÉCNICA" : "SOLICITAR AYUDA DE ACCESO"}
          </button>
        </form>

        <footer className="px-8 py-4 bg-[#1c1d21] border-t border-[#2a2b2f] text-center">
           <p className="text-[9px] text-[#474556] font-black uppercase tracking-widest italic">
             {getSupportLabel()}
           </p>
        </footer>
      </div>
    </div>
  );
}
