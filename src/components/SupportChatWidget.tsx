import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, JobRequest } from '../types';
import { Send, MapPin, Paperclip, CheckCheck, User, Wrench, Image as ImageIcon, FileText } from 'lucide-react';

interface SupportChatWidgetProps {
  request: JobRequest | null;
  role: 'client' | 'tech';
  onSendMessage: (text: string, image?: string) => void;
  messages: ChatMessage[];
  techName?: string;
}

export default function SupportChatWidget({ request, role, onSendMessage, messages, techName }: SupportChatWidgetProps) {
  const [text, setText] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSendMessage(text);
    setText('');
  };

  const handleAttachMock = (type: 'photo' | 'doc' | 'location') => {
    if (type === 'photo') {
      onSendMessage('Adjunción: Evidencia fotográfica de los serpentines.', 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&auto=format&fit=crop&q=60');
    } else if (type === 'doc') {
      onSendMessage('Adjunción: Copia digital del manual de especificaciones (PDF).');
    } else {
      onSendMessage('Ubicación compartida: Vía Argentina, Bella Vista, Ciudad de Panamá.');
    }
  };

  if (!request) {
    return (
      <div className="bg-white rounded-2xl border border-dashed border-zinc-200 p-8 text-center text-zinc-400 h-full flex flex-col justify-center items-center">
        <User className="w-12 h-12 text-zinc-300 mb-2.5" />
        <h4 className="font-extrabold text-zinc-800 text-xs uppercase tracking-wider">Sin Conversaciones Activas</h4>
        <p className="text-[11px] text-zinc-450 max-w-xs mx-auto mt-1.5 leading-relaxed">
          Las salas de chat se habilitan automáticamente una vez que solicitas una cotización o inicias un servicio con un técnico.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm flex flex-col h-[500px] overflow-hidden">
      
      {/* Target header */}
      <div className="px-5 py-4 border-b border-zinc-100 bg-zinc-50/80 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
            {role === 'client' ? <Wrench className="w-4 h-4" /> : <User className="w-4 h-4" />}
          </div>
          <div>
            <span className="text-[10px] text-zinc-400 font-black uppercase tracking-widest block">
              {role === 'client' ? 'Técnico Especialista' : 'Cliente Registrado'}
            </span>
            <span className="text-sm font-black text-zinc-900 tracking-tight block mt-0.5">
              {role === 'client' ? techName || request.techName : request.clientName}
            </span>
          </div>
        </div>

        <div className="px-3 py-1 rounded-xl bg-indigo-50 text-[10px] font-extrabold text-indigo-700 border border-indigo-100 uppercase tracking-wide">
          Servicio: {request.assetName}
        </div>
      </div>

      {/* Messages layout */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-zinc-50/40">
        <div className="text-center py-1">
          <span className="text-[9px] bg-zinc-200/60 text-zinc-500 font-extrabold px-2.5 py-1 rounded-lg uppercase tracking-wider">
            Canal de comunicación encriptado
          </span>
        </div>

        {messages.map((msg) => {
          const isMe = (role === 'client' && msg.sender === 'client') || (role === 'tech' && msg.sender === 'tech');
          return (
            <div
              key={msg.id}
              className={`flex flex-col max-w-[78%] ${isMe ? 'ml-auto items-end' : 'mr-auto items-start'}`}
            >
              <div
                className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                  isMe
                    ? 'bg-indigo-650 text-white rounded-tr-none shadow-md shadow-indigo-100'
                    : 'bg-white text-zinc-800 rounded-tl-none shadow-xs border border-zinc-200'
                }`}
              >
                {msg.text}

                {msg.image && (
                  <div className="mt-2.5 rounded-xl overflow-hidden border border-black/10">
                    <img src={msg.image} alt="Evidencia" className="w-full max-h-40 object-cover" />
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-1.5 mt-1 text-[9px] text-zinc-400 font-bold uppercase">
                <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                {isMe && <CheckCheck className="w-3.5 h-3.5 text-indigo-500" />}
              </div>
            </div>
          );
        })}
        <div ref={chatEndRef} />
      </div>

      {/* Quick attachments */}
      <div className="px-4.5 py-2 border-t border-zinc-100 bg-white flex items-center gap-2 overflow-x-auto">
        <span className="text-[9px] text-zinc-400 uppercase font-black tracking-widest shrink-0">Simular:</span>
        <button
          onClick={() => handleAttachMock('photo')}
          className="flex items-center gap-1.5 p-1.5 px-3 border border-zinc-200 rounded-xl hover:bg-zinc-50 text-[10px] text-zinc-650 transition-all font-bold whitespace-nowrap cursor-pointer hover:border-zinc-300"
        >
          <ImageIcon className="w-3.5 h-3.5 text-indigo-500" />
          Foto de Falla
        </button>
        <button
          onClick={() => handleAttachMock('doc')}
          className="flex items-center gap-1.5 p-1.5 px-3 border border-zinc-200 rounded-xl hover:bg-zinc-50 text-[10px] text-zinc-650 transition-all font-bold whitespace-nowrap cursor-pointer hover:border-zinc-300"
        >
          <FileText className="w-3.5 h-3.5 text-emerald-500" />
          Manual de Instrucciones
        </button>
        <button
          onClick={() => handleAttachMock('location')}
          className="flex items-center gap-1.5 p-1.5 px-3 border border-zinc-200 rounded-xl hover:bg-zinc-50 text-[10px] text-zinc-650 transition-all font-bold whitespace-nowrap cursor-pointer hover:border-zinc-300"
        >
          <MapPin className="w-3.5 h-3.5 text-rose-500" />
          Compartir Ubicación
        </button>
      </div>

      {/* Input box */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-zinc-100 bg-white flex items-center gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Escribe un mensaje de coordinación..."
          className="flex-1 px-3 py-2.5 border border-zinc-250 bg-white rounded-xl text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-zinc-400"
        />
        <button
          type="submit"
          disabled={!text.trim()}
          className="p-3 bg-indigo-650 hover:bg-indigo-750 disabled:opacity-40 text-white rounded-xl transition-all shadow-sm cursor-pointer"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}
