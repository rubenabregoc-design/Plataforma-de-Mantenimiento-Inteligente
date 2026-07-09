import { toast } from 'react-hot-toast';
import React, { useState } from 'react';
import { X, Send, User, Mail, MessageSquare, Smartphone, ExternalLink } from 'lucide-react';

interface SupportResponseModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: any;
}

export default function SupportResponseModal({ isOpen, onClose, ticket }: SupportResponseModalProps) {
  const [response, setResponse] = useState('');
  const [isSending, setIsSending] = useState(false);

  if (!isOpen || !ticket) return null;

  const handleSendResponse = async (type: 'app' | 'email' | 'whatsapp') => {
    setIsSending(true);
    // Simulación de envío
    setTimeout(() => {
      if (type === 'email') {
        window.location.href = `mailto:${ticket.userEmail}?subject=Respuesta MantechPro: ${ticket.subject}&body=Hola ${ticket.userName},%0D%0A%0D%0A${response}`;
      } else if (type === 'whatsapp' && ticket.userPhone) {
        const phone = ticket.userPhone.replace(/[^0-9]/g, '');
        window.open(`https://wa.me/${phone}?text=Hola ${ticket.userName}, soy el Administrador Master de MantechPro. Respecto a su ticket "${ticket.subject}": ${response}`, '_blank');
      } else {
        toast.success("Respuesta enviada a través del canal interno de la App.");
      }
      setIsSending(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-[600] bg-[#0d0e12]/95 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-[#121317] border border-white/10 rounded-[3rem] overflow-hidden shadow-2xl">
        <header className="px-8 py-6 bg-[#1c1d21] border-b border-white/5 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#5d3cfe]/10 rounded-2xl text-[#c7bfff]">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white uppercase tracking-tight">Atender Ticket Maestro</h2>
              <p className="text-[10px] font-black text-[#c8c4d9] uppercase tracking-widest mt-1">Gestión Directa del Administrador</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-[#474556] hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </header>

        <div className="p-8 space-y-6">
          {/* Info del Ticket */}
          <div className="bg-[#0d0e12] border border-white/5 rounded-[2rem] p-6 space-y-4">
             <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-full bg-[#1c1d21] flex items-center justify-center text-white font-black text-xs">
                     {ticket.userName.charAt(0)}
                   </div>
                   <div>
                     <p className="text-xs font-black text-white uppercase">{ticket.userName}</p>
                     <p className="text-[9px] text-[#474556] font-bold uppercase tracking-widest">{ticket.userEmail}</p>
                   </div>
                </div>
                <span className="px-2 py-0.5 bg-rose-500/10 text-rose-500 rounded text-[7px] font-black uppercase border border-rose-500/20">Alta Prioridad</span>
             </div>
             <div className="h-px bg-white/5"></div>
             <div>
                <p className="text-[9px] font-black text-[#5d3cfe] uppercase tracking-widest mb-1">Asunto: {ticket.subject}</p>
                <p className="text-sm text-[#c8c4d9] leading-relaxed italic">"{ticket.message}"</p>
             </div>
          </div>

          <div className="space-y-2">
            <label className="text-[9px] font-black text-[#474556] uppercase ml-1">Escribir Respuesta Oficial</label>
            <textarea
              rows={4}
              value={response}
              onChange={e => setResponse(e.target.value)}
              placeholder="Escribe aquí la solución o respuesta para el usuario..."
              className="w-full bg-[#0d0e12] border border-[#2a2b2f] rounded-2xl py-4 px-5 text-sm font-medium text-white focus:border-[#5d3cfe] outline-none transition-all resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <button
               onClick={() => handleSendResponse('app')}
               disabled={!response.trim() || isSending}
               className="flex items-center justify-center gap-2 py-4 bg-[#5d3cfe] text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-[#5d3cfe]/20 hover:brightness-110 transition-all disabled:opacity-30"
             >
               <Send className="w-3.5 h-3.5" /> Enviar por App
             </button>
             <button
               onClick={() => handleSendResponse('email')}
               disabled={!response.trim() || isSending}
               className="flex items-center justify-center gap-2 py-4 bg-[#1c1d21] border border-white/10 text-[#c7bfff] rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#5d3cfe] hover:text-white transition-all disabled:opacity-30"
             >
               <Mail className="w-3.5 h-3.5" /> Enviar E-mail
             </button>
             <button
               onClick={() => handleSendResponse('whatsapp')}
               disabled={!response.trim() || isSending || !ticket.userPhone}
               className="flex items-center justify-center gap-2 py-4 bg-[#1c1d21] border border-white/10 text-[#52ffac] rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#25D366] hover:text-white transition-all disabled:opacity-30"
             >
               <Smartphone className="w-3.5 h-3.5" /> Vía WhatsApp
             </button>
          </div>
        </div>

        <footer className="px-8 py-4 bg-[#1c1d21] border-t border-white/5 text-center">
           <p className="text-[9px] text-[#474556] font-black uppercase tracking-widest">Al responder, el ticket se marcará como "Atendido" en el sistema global.</p>
        </footer>
      </div>
    </div>
  );
}
