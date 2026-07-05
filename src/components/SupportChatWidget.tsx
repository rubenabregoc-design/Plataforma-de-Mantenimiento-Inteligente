import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, JobRequest } from '../types';
import { Send, MapPin, Paperclip, CheckCheck, User, Wrench, Image as ImageIcon, FileText, Maximize2, Minimize2, Video, Phone, QrCode } from 'lucide-react';

interface SupportChatWidgetProps {
  request: JobRequest | null;
  role: 'client' | 'tech';
  onSendMessage: (text: string, image?: string) => void;
  messages: ChatMessage[];
  techName?: string;
  isMaximized?: boolean;
  onToggleMaximize?: () => void;
  onStartVideoCall?: (roomName: string, isVoiceOnly?: boolean) => void;
  onOpenScanner?: () => void;
}

export default function SupportChatWidget({
  request,
  role,
  onSendMessage,
  messages,
  techName,
  isMaximized,
  onToggleMaximize,
  onStartVideoCall,
  onOpenScanner
}: SupportChatWidgetProps) {
  const [text, setText] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSendMessage(text);
    setText('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onSendMessage('', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleShareLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        const locationUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
        onSendMessage(`📍 Mi ubicación actual: ${locationUrl}`);
      }, (error) => {
        console.error("Error al obtener ubicación:", error);
        alert("No se pudo obtener la ubicación. Asegúrate de dar permisos al navegador.");
      });
    } else {
      alert("Tu navegador no soporta geolocalización.");
    }
  };

  if (!request) {
    return (
      <div className="bg-[#1f1f24] rounded-2xl border border-dashed border-[#474556]/30 p-8 text-center text-[#c8c4d9] h-full flex flex-col justify-center items-center">
        <User className="w-12 h-12 text-[#c7bfff]/30 mb-2.5" />
        <h4 className="font-extrabold text-[#e3e2e8] text-xs uppercase tracking-wider">Sin Conversaciones Activas</h4>
        <p className="text-[11px] text-[#c8c4d9]/70 max-w-xs mx-auto mt-1.5 leading-relaxed">
          Las salas de chat se habilitan automáticamente una vez que solicitas una cotización o inicias un servicio con un técnico.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#121317] flex flex-col h-full overflow-hidden border border-[#2a2b2f] rounded-[2rem] shadow-2xl">
      
      {/* Target header */}
      <div className="px-6 py-4 border-b border-[#2a2b2f] bg-[#0d0e12]/80 backdrop-blur-md flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#5d3cfe]/10 border border-[#5d3cfe]/30 flex items-center justify-center text-[#c7bfff]">
            {role === 'client' ? <Wrench className="w-5 h-5" /> : <User className="w-5 h-5" />}
          </div>
          <div>
            <span className="text-[9px] text-[#474556] font-black uppercase tracking-[0.2em] block">
              {role === 'client' ? 'Canal Técnico' : 'Portal del Cliente'}
            </span>
            <span className="text-sm font-black text-white tracking-tight block mt-0.5">
              {role === 'client' ? techName || request.techName : request.clientName}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {role === 'client' && onOpenScanner && (
            <button
              onClick={onOpenScanner}
              className="p-2.5 bg-[#1c1d21] border border-[#2a2b2f] rounded-xl text-[#52ffac] hover:bg-[#52ffac] hover:text-black transition-all shadow-lg group"
              title="Escanear Credencial del Técnico"
            >
              <QrCode className="w-4 h-4 group-hover:scale-110 transition-transform" />
            </button>
          )}
          {onStartVideoCall && request && (
            <>
              <button
                onClick={() => onStartVideoCall(`MantechPro_Room_${request.id}`, true)}
                className="p-2.5 bg-[#1c1d21] border border-[#2a2b2f] rounded-xl text-[#c7bfff] hover:bg-[#5d3cfe] hover:text-white transition-all shadow-lg group"
                title="Llamada de Voz Interna"
              >
                <Phone className="w-4 h-4 group-hover:scale-110 transition-transform" />
              </button>
              <button
                onClick={() => onStartVideoCall(`MantechPro_Room_${request.id}`, false)}
                className="p-2.5 bg-[#1c1d21] border border-[#2a2b2f] rounded-xl text-[#52ffac] hover:bg-[#52ffac] hover:text-black transition-all shadow-lg group"
                title="Videoasistencia Remota"
              >
                <Video className="w-4 h-4 group-hover:scale-110 transition-transform" />
              </button>
            </>
          )}
          <div className="px-3 py-1.5 rounded-full bg-[#1c1d21] text-[8px] font-black text-[#c8c4d9] border border-[#2a2b2f] uppercase tracking-widest hidden sm:block">
            Soporte: {request.assetName}
          </div>
          {onToggleMaximize && (
            <button
              onClick={onToggleMaximize}
              className="p-2 bg-[#1c1d21] border border-[#2a2b2f] rounded-lg text-[#c8c4d9] hover:text-white transition-all shadow-lg"
              title={isMaximized ? "Contraer" : "Expandir conversación"}
            >
              {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {/* Messages layout */}
      <div className="flex-1 p-6 overflow-y-auto space-y-8 bg-[#0d0e12]/40 custom-scrollbar">
        <div className="text-center pb-4">
          <span className="text-[7px] font-black text-[#474556] uppercase tracking-[0.4em] flex items-center justify-center gap-2">
            <span className="w-6 h-px bg-[#2a2b2f]"></span>
            Protocolo de Seguridad de Mensajería
            <span className="w-6 h-px bg-[#2a2b2f]"></span>
          </span>
        </div>

        {messages.map((msg) => {
          const isMe = (role === 'client' && msg.sender === 'client') || (role === 'tech' && msg.sender === 'tech');
          return (
            <div
              key={msg.id}
              className={`flex flex-col max-w-[85%] ${isMe ? 'ml-auto items-end' : 'mr-auto items-start'} animate-fade-in-up`}
            >
              <div
                className={`p-5 rounded-[1.5rem] text-sm font-medium leading-relaxed shadow-2xl transition-all hover:scale-[1.01] ${
                  isMe
                    ? 'bg-[#5d3cfe] text-white rounded-tr-none shadow-[#5d3cfe]/20'
                    : 'bg-[#1c1d21] text-[#e3e2e8] rounded-tl-none border border-[#2a2b2f]'
                }`}
              >
                {msg.text && <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>}

                {msg.image && (
                  <div className="mt-4 rounded-2xl overflow-hidden border border-white/5 shadow-2xl">
                    <img src={msg.image} alt="Evidencia" className="w-full max-h-[500px] object-contain bg-black/20" />
                  </div>
                )}
              </div>
              
              <div className={`flex items-center gap-2 mt-2 text-[9px] font-black uppercase tracking-widest ${isMe ? 'text-[#c7bfff]' : 'text-[#474556]'}`}>
                <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
                {isMe && <CheckCheck className="w-3.5 h-3.5 opacity-60" />}
              </div>
            </div>
          );
        })}
        <div ref={chatEndRef} />
      </div>

      {/* Real attachments */}
      <div className="px-6 py-2 border-t border-[#2a2b2f] bg-[#0d0e12]/80 flex items-center gap-3 overflow-x-auto custom-scrollbar shrink-0">
        <input
          type="file"
          accept="image/*"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileChange}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 px-3 py-1.5 border border-[#2a2b2f] rounded-lg hover:border-[#5d3cfe]/50 text-[9px] font-black uppercase tracking-widest text-[#c8c4d9] transition-all cursor-pointer"
        >
          <ImageIcon className="w-3.5 h-3.5 text-[#5d3cfe]" />
          Adjuntar Evidencia
        </button>
        <button
          onClick={handleShareLocation}
          className="flex items-center gap-2 px-3 py-1.5 border border-[#2a2b2f] rounded-lg hover:border-rose-500/50 text-[9px] font-black uppercase tracking-widest text-[#c8c4d9] transition-all cursor-pointer"
        >
          <MapPin className="w-3.5 h-3.5 text-rose-500" />
          Enviar GPS
        </button>
      </div>

      {/* Input box */}
      <form onSubmit={handleSubmit} className="p-5 pt-2 border-t border-[#2a2b2f] bg-[#0d0e12]/90 flex items-center gap-3 shrink-0">
        <div className="flex-1 relative">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Escriba aquí..."
            className="w-full px-5 py-3 bg-[#121317] border border-[#2a2b2f] rounded-xl text-xs font-bold text-white focus:border-[#5d3cfe] outline-none transition-all placeholder-[#474556]"
          />
        </div>
        <button
          type="submit"
          disabled={!text.trim()}
          className="p-3 bg-[#5d3cfe] hover:brightness-110 disabled:opacity-20 text-white rounded-xl transition-all shadow-lg shadow-[#5d3cfe]/20 cursor-pointer active:scale-95"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
