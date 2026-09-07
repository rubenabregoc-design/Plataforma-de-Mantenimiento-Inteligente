import React, { useState, useEffect, useRef } from 'react';
import {
  collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, limit
} from 'firebase/firestore';
import { db } from '../firebase';
import {
  Send, MapPin, AlertTriangle, Truck, User, Clock, ShieldCheck,
  Headset, Radio, CheckCheck, RefreshCw, Paperclip, PhoneCall
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { triggerHaptic } from '../hooks/useAndroidNative';

interface FleetDispatchChatProps {
  userId: string;
  userName: string;
  userRole?: string;
  companyId?: string;
  assignedAssetName?: string;
}

interface DispatchMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'driver' | 'dispatcher' | 'admin';
  text: string;
  locationUrl?: string;
  createdAt: any;
  type?: 'text' | 'location' | 'sos' | 'request_asset';
}

export default function FleetDispatchChat({
  userId,
  userName,
  userRole = 'driver',
  companyId = 'general_fleet',
  assignedAssetName
}: FleetDispatchChatProps) {
  const [messages, setMessages] = useState<DispatchMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Escuchar mensajes del canal de despacho de la flota en tiempo real
  useEffect(() => {
    const q = query(
      collection(db, 'messages'),
      where('channel', '==', 'fleet_dispatch'),
      orderBy('createdAt', 'asc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as DispatchMessage[];
      setMessages(msgs);
    }, (err) => {
      console.warn('Error cargando mensajes de despacho:', err);
    });

    return () => unsubscribe();
  }, [companyId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Enviar mensaje a la Central de Despacho
  const handleSendMessage = async (textToSend?: string, msgType: 'text' | 'location' | 'sos' | 'request_asset' = 'text', locationUrl?: string) => {
    const finalMsg = (textToSend || inputText).trim();
    if (!finalMsg && !locationUrl) return;

    try {
      setIsSending(true);
      triggerHaptic('light');

      await addDoc(collection(db, 'messages'), {
        channel: 'fleet_dispatch',
        senderId: userId,
        senderName: userName || 'Conductor',
        senderRole: userRole,
        text: finalMsg,
        locationUrl: locationUrl || null,
        type: msgType,
        assignedAssetName: assignedAssetName || 'Sin unidad',
        createdAt: serverTimestamp()
      });

      setInputText('');

      // Si es solicitud de camión o primer mensaje, respuesta automática de acuse de recibo de la Torre de Control
      if (msgType === 'request_asset') {
        setTimeout(async () => {
          try {
            await addDoc(collection(db, 'messages'), {
              channel: 'fleet_dispatch',
              senderId: 'dispatch-bot',
              senderName: 'Torre de Control (Despacho)',
              senderRole: 'dispatcher',
              text: `Recibido, conductor ${userName}. Su solicitud de asignación ha sido transmitida al Coordinador de Flota de turno en Panamá. En breve se le vinculará la unidad correspondiente.`,
              type: 'text',
              createdAt: serverTimestamp()
            });
          } catch (e) {
            console.warn(e);
          }
        }, 1200);
      }
    } catch (err) {
      console.error('Error enviando mensaje a despacho:', err);
      toast.error('Error al enviar mensaje a la central.');
    } finally {
      setIsSending(false);
    }
  };

  // Enviar coordenadas GPS a la Torre de Control
  const handleShareLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocalización no soportada en este dispositivo.');
      return;
    }

    triggerHaptic('medium');
    const loadToast = toast.loading('Obteniendo coordenadas satelitales...');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        toast.dismiss(loadToast);
        const { latitude, longitude } = pos.coords;
        const mapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
        handleSendMessage(
          `📍 Ubicación GPS transmitida: Coordenadas ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`,
          'location',
          mapsUrl
        );
        toast.success('Ubicación compartida con Despacho.');
      },
      (err) => {
        toast.dismiss(loadToast);
        toast.error('Permiso de GPS denegado.');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Formato de hora 12 horas con AM/PM
  const formatTime = (ts: any) => {
    if (!ts) return '';
    const date = ts.toDate ? ts.toDate() : new Date(ts);
    return date.toLocaleTimeString('es-PA', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  return (
    <div className="bg-[#121317] border border-[#2a2b2f] rounded-3xl shadow-2xl flex flex-col h-[650px] overflow-hidden">
      {/* HEADER DE LA SALA DE DESPACHO */}
      <div className="p-4 sm:p-5 bg-[#17181d] border-b border-white/5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#5d3cfe] to-[#52ffac] flex items-center justify-center text-white shadow-md shadow-[#5d3cfe]/20">
            <Headset className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black text-white uppercase tracking-tight">
                Canal Central de Despacho & Flota
              </h3>
              <span className="w-2 h-2 rounded-full bg-[#52ffac] animate-ping" />
            </div>
            <p className="text-[10px] text-[#8e8d9a] font-bold">
              Torre de control en línea • Asignaciones, relevos y asistencia en ruta
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2">
          <span className="text-[9px] font-black uppercase text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            Canal Operativo Seguro
          </span>
        </div>
      </div>

      {/* QUICK PRE-MADE ACTIONS BAR PARA CABINA */}
      <div className="px-4 py-2.5 bg-[#0d0e12] border-b border-white/5 flex items-center gap-2 overflow-x-auto custom-scrollbar shrink-0">
        <button
          onClick={() => handleSendMessage(
            `Central: Soy ${userName}. Solicito asignación formal de vehículo/camión para iniciar turno.`,
            'request_asset'
          )}
          className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 text-[10px] font-black uppercase whitespace-nowrap transition-all flex items-center gap-1.5 active:scale-95 shrink-0"
        >
          <Truck className="w-3.5 h-3.5" />
          Solicitar Asignación de Camión
        </button>

        <button
          onClick={handleShareLocation}
          className="px-3 py-1.5 rounded-xl bg-[#52ffac]/10 hover:bg-[#52ffac]/20 border border-[#52ffac]/30 text-[#52ffac] text-[10px] font-black uppercase whitespace-nowrap transition-all flex items-center gap-1.5 active:scale-95 shrink-0"
        >
          <MapPin className="w-3.5 h-3.5" />
          Enviar Coordenadas GPS
        </button>

        <button
          onClick={() => handleSendMessage(`Central: Reportando congestión vehicular y retraso en ruta.`, 'text')}
          className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[#c8c4d9] text-[10px] font-black uppercase whitespace-nowrap transition-all flex items-center gap-1.5 active:scale-95 shrink-0"
        >
          <Clock className="w-3.5 h-3.5" />
          Reportar Tráfico / Retraso
        </button>

        <button
          onClick={() => handleSendMessage(`Central: Solicitando autorización para parada de descanso / comida.`, 'text')}
          className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[#c8c4d9] text-[10px] font-black uppercase whitespace-nowrap transition-all flex items-center gap-1.5 active:scale-95 shrink-0"
        >
          Parada de Descanso
        </button>
      </div>

      {/* ÁREA DE CONVERSACIONES */}
      <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-3.5 custom-scrollbar bg-[#0d0e12]/60">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#5d3cfe]">
              <Headset className="w-7 h-7" />
            </div>
            <div className="space-y-1 max-w-sm">
              <h4 className="text-sm font-black text-white uppercase">
                Canal de Despacho Activo
              </h4>
              <p className="text-xs text-[#8e8d9a] leading-relaxed">
                Este es el canal oficial de comunicación con la Torre de Control y el Coordinador de Flota.
                Escribe un mensaje o presiona <strong>"Solicitar Asignación de Camión"</strong> arriba.
              </p>
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === userId;
            const isDispatcher = msg.senderRole === 'dispatcher' || msg.senderId === 'dispatch-bot';

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center gap-1.5 mb-1 px-1">
                  <span className="text-[10px] font-black text-[#8e8d9a] uppercase">
                    {msg.senderName}
                  </span>
                  {isDispatcher && (
                    <span className="px-1.5 py-0.2 rounded text-[7px] font-black uppercase bg-[#5d3cfe]/20 text-[#c7bfff] border border-[#5d3cfe]/40">
                      Coordinación
                    </span>
                  )}
                  <span className="text-[9px] text-[#474556]">
                    {formatTime(msg.createdAt)}
                  </span>
                </div>

                <div
                  className={`max-w-[85%] sm:max-w-[70%] p-3.5 rounded-2xl text-xs font-medium leading-relaxed shadow-md ${
                    isMe
                      ? 'bg-[#5d3cfe] text-white rounded-br-none'
                      : isDispatcher
                      ? 'bg-[#1c1d21] border border-[#5d3cfe]/40 text-white rounded-bl-none'
                      : 'bg-[#1c1d21] border border-white/5 text-[#e3e2e8] rounded-bl-none'
                  }`}
                >
                  <p className="break-words">{msg.text}</p>

                  {msg.locationUrl && (
                    <a
                      href={msg.locationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/40 hover:bg-black/60 text-[#52ffac] font-black text-[10px] uppercase tracking-wider transition-colors border border-[#52ffac]/30"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      Ver Coordenadas en Google Maps ↗
                    </a>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={chatEndRef} />
      </div>

      {/* INPUT FORM DE ENVÍO */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-3 sm:p-4 bg-[#17181d] border-t border-white/5 flex items-center gap-2 shrink-0"
      >
        <button
          type="button"
          onClick={handleShareLocation}
          className="p-2.5 rounded-xl bg-white/5 hover:bg-[#52ffac]/15 border border-white/10 hover:border-[#52ffac]/40 text-[#8a879d] hover:text-[#52ffac] transition-all active:scale-95 shrink-0"
          title="Compartir GPS con Torre de Control"
        >
          <MapPin className="w-4 h-4" />
        </button>

        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Escribir a la Torre de Control y Despacho..."
          className="flex-1 bg-[#0d0e12] border border-[#2a2b2f] rounded-xl px-4 py-3 text-xs text-white placeholder-[#474556] outline-none focus:border-[#5d3cfe] transition-colors"
        />

        <button
          type="submit"
          disabled={!inputText.trim() || isSending}
          className="p-3 rounded-xl bg-gradient-to-r from-[#5d3cfe] to-[#7353ff] hover:brightness-110 text-white shadow-lg shadow-[#5d3cfe]/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 shrink-0 flex items-center justify-center"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
