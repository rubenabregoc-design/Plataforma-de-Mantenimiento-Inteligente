import React, { useState, useEffect, useRef } from 'react';
import { MessageCircleMore, Send, X, Sparkles, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  text: string;
  sender: 'bot' | 'user';
  timestamp: Date;
}

export default function Chatbot247() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: '¡Hola! Soy tu asistente experto de MantechPro Panamá 🇵🇦. Estoy aquí para apoyarte 24/7 con el diagnóstico de tus equipos y servicios técnicos. ¿En qué parte de la ciudad te encuentras hoy?',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsBotTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(scrollToBottom, 100);
    }
  }, [messages, isTyping, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsBotTyping(true);

    // Simulación de Asistente Virtual 24/7
    setTimeout(() => {
      let botResponse = "Entiendo tu consulta. Un especialista revisará esto pronto, pero mientras tanto te sugiero revisar el módulo de Diagnóstico para una respuesta técnica inmediata.";

      const lowerInput = input.toLowerCase();
      if (lowerInput.includes('hola') || lowerInput.includes('buenos')) {
        botResponse = "¡Hola! ¿Cómo puedo asistirte con tus equipos de mantenimiento hoy?";
      } else if (lowerInput.includes('precio') || lowerInput.includes('cuanto cuesta') || lowerInput.includes('tarifa')) {
        botResponse = "Los precios varían según el técnico y el tipo de equipo. Puedes solicitar una cotización gratuita en el Marketplace de Técnicos.";
      } else if (lowerInput.includes('emergencia') || lowerInput.includes('urgente') || lowerInput.includes('falla')) {
        botResponse = "Para emergencias críticas (humo, chispas o inundación), te recomiendo apagar el equipo desde el breaker principal y solicitar un técnico de categoría 'Urgente' en el sistema.";
      } else if (lowerInput.includes('pago') || lowerInput.includes('yappy') || lowerInput.includes('tarjeta')) {
        botResponse = "MantechPro acepta Yappy, ACH y Tarjetas de Crédito de forma segura a través de nuestra pasarela de pagos blindada.";
      }

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMsg]);
      setIsBotTyping(false);
    }, 1500);
  };

  return (
    <div className="fixed bottom-20 right-4 md:bottom-8 md:right-8 z-[100] font-sans flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="bg-[#121317] border border-[#2a2b2f] w-[320px] md:w-[380px] h-[450px] md:h-[520px] max-h-[calc(100vh-140px)] rounded-[2rem] shadow-2xl flex flex-col overflow-hidden mb-4"
          >
            {/* Header */}
            <div className="bg-[#5d3cfe] p-5 md:p-6 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                  <Zap className="w-6 h-6 text-yellow-300 fill-yellow-300" />
                </div>
                <div>
                  <h4 className="text-xs md:text-sm font-black uppercase tracking-tight leading-none">Asistente Panamá 24/7</h4>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                    <span className="text-[9px] font-bold opacity-80 uppercase tracking-widest">Servicio Activo</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-all shrink-0">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar bg-[#0d0e12]/50">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-[#5d3cfe] text-white rounded-tr-none'
                      : 'bg-[#1c1d21] border border-[#2a2b2f] text-[#e3e2e8] rounded-tl-none'
                  }`}>
                    {msg.text}
                    <div className={`text-[8px] mt-1.5 font-bold uppercase opacity-50 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                    </div>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-[#1c1d21] border border-[#2a2b2f] p-3 rounded-2xl rounded-tl-none">
                    <div className="flex gap-1">
                      <span className="w-1 h-1 bg-[#474556] rounded-full animate-bounce"></span>
                      <span className="w-1 h-1 bg-[#474556] rounded-full animate-bounce [animation-delay:0.2s]"></span>
                      <span className="w-1 h-1 bg-[#474556] rounded-full animate-bounce [animation-delay:0.4s]"></span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={scrollToBottom} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-[#121317] border-t border-[#2a2b2f] shrink-0">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Escribe tu consulta aquí..."
                  className="flex-1 bg-[#0d0e12] border border-[#2a2b2f] rounded-xl px-4 py-2.5 text-xs text-white focus:border-[#5d3cfe] outline-none transition-all"
                />
                <button
                  onClick={handleSend}
                  className="bg-[#5d3cfe] p-2.5 rounded-xl text-white hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-[#5d3cfe]/20"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[8px] text-[#474556] text-center mt-3 font-black uppercase tracking-widest flex items-center justify-center gap-1">
                <Sparkles className="w-2.5 h-2.5" /> Desarrollado por Mantech Engine
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 md:w-16 md:h-16 bg-[#5d3cfe] rounded-full flex items-center justify-center text-white shadow-2xl shadow-[#5d3cfe]/40 relative group overflow-hidden border-2 border-white/10"
      >
        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        {isOpen ? <X className="w-7 h-7" /> : <MessageCircleMore className="w-8 h-8" />}
      </motion.button>
    </div>
  );
}
