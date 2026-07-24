import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, User, ShieldCheck, Zap, DollarSign, Bot } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'advisor';
  timestamp: string;
}

interface AdvisorChatWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  initialMode?: 'general' | 'sales';
}

export default function AdvisorChatWidget({ isOpen, onClose, userName, initialMode = 'general' }: AdvisorChatWidgetProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMsg = initialMode === 'sales'
        ? `¡Hola ${userName}! 👋 Soy su Consultor MantechPro de Ventas. ¿Desea conocer nuestros planes corporativos o cotizar una membresía de flota?`
        : `¡Hola ${userName}! Soy su Asesor MantechPro para Panamá. Como su gestor central, puedo asistirle con sus contratos, cambios de técnicos o información de planes. ¿En qué puedo asistirle hoy?`;

      setMessages([{
        id: '1',
        text: welcomeMsg,
        sender: 'advisor',
        timestamp: new Date().toISOString()
      }]);
    }
  }, [isOpen, initialMode, userName]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');

    // Respuesta simulada del Asesor
    setTimeout(() => {
      const reply: Message = {
        id: (Date.now() + 1).toString(),
        text: "Entendido. He recibido su consulta. Un especialista de mi equipo revisará su caso y le responderemos en menos de 15 minutos. Gracias por su paciencia.",
        sender: 'advisor',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, reply]);
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[2000] bg-[#0d0e12]/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-2xl h-[85vh] bg-[#121317] border border-white/10 rounded-[3.5rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)] flex flex-col animate-fade-in-up">

        {/* HEADER */}
        <header className="px-10 py-8 bg-[#0d0e12] border-b border-white/5 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-[#5d3cfe]/10 border border-[#5d3cfe]/20 flex items-center justify-center text-[#5d3cfe]">
              <Bot className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white uppercase tracking-tighter">ASESOR MANTECHPRO</h3>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-2 h-2 rounded-full bg-[#52ffac] animate-pulse"></div>
                <span className="text-[10px] text-[#52ffac] font-black uppercase tracking-widest">En línea ahora</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-rose-600 transition-all group">
            <X className="w-6 h-6 text-white group-hover:rotate-90 transition-transform" />
          </button>
        </header>

        {/* CONSULTAS FRECUENTES (QUICK ACTIONS) */}
        <div className="px-10 py-4 bg-[#1c1d21]/30 border-b border-white/5 flex gap-3 overflow-x-auto custom-scrollbar shrink-0">
           {["¿CÓMO FUNCIONAN LAS SUBASTAS?", "¿EL PRECIO PUEDE CAMBIAR?", "¿QUÉ ES LA BÓVEDA DE GARANTÍAS?", "¿ES SEGURO EL PAGO?"].map(q => (
             <button key={q} onClick={() => setInputText(q)} className="whitespace-nowrap px-6 py-2 bg-white/5 border border-white/10 rounded-full text-[9px] font-black text-[#c8c4d9] uppercase tracking-widest hover:border-[#5d3cfe] hover:text-white transition-all">
               {q}
             </button>
           ))}
        </div>

        {/* MESSAGES AREA */}
        <div className="flex-1 p-10 overflow-y-auto space-y-8 bg-grid-white/[0.01] custom-scrollbar">
          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
              <div className={`max-w-[80%] p-8 rounded-[2.5rem] shadow-2xl ${
                m.sender === 'user'
                  ? 'bg-[#5d3cfe] text-white rounded-tr-none'
                  : 'bg-[#1c1d21] text-[#c8c4d9] border border-white/5 rounded-tl-none'
              }`}>
                <p className="text-sm font-medium leading-relaxed" dangerouslySetInnerHTML={{ __html: m.text.replace(/MantechPro|contratos|técnicos|planes|ventas/g, '<strong>$&</strong>') }}></p>
                <div className={`mt-4 text-[9px] font-black uppercase tracking-widest ${m.sender === 'user' ? 'text-white/40' : 'text-[#474556]'}`}>
                  {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
          <div ref={scrollRef} />
        </div>

        {/* INPUT FORM */}
        <form onSubmit={handleSend} className="p-8 bg-[#0d0e12] border-t border-white/5 flex gap-4">
          <input
            type="text"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            placeholder="Escriba su consulta administrativa aquí..."
            className="flex-1 bg-[#121317] border border-white/10 rounded-2xl px-8 py-4 text-white text-sm outline-none focus:border-[#5d3cfe] transition-all"
          />
          <button type="submit" className="w-14 h-14 bg-[#5d3cfe] text-white rounded-2xl flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all">
            <Send className="w-6 h-6 rotate-45" />
          </button>
        </form>

        <footer className="px-10 py-4 bg-[#0d0e12] flex justify-between items-center shrink-0 opacity-20 grayscale">
          <span className="text-[8px] font-black uppercase tracking-widest">Mantech Pro Support</span>
          <span className="text-[8px] font-black uppercase tracking-widest">Protocolo de Conexión Segura</span>
        </footer>
      </div>
    </div>
  );
}
