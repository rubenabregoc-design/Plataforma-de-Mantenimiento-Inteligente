import React, { useState, useEffect, useRef } from 'react';
import { collection, addDoc, query, orderBy, limit, onSnapshot, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { Radio, Mic, Volume2, ShieldCheck, Zap } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { triggerHaptic } from '../hooks/useAndroidNative';

interface PTTRadioModuleProps {
  userId: string;
  userName: string;
  role?: 'tech' | 'admin' | 'client';
  assetId?: string;
  channelId?: string;
  channelName?: string;
  unitName?: string;
  compact?: boolean;
}

export default function PTTRadioModule({
  userId,
  userName,
  role = 'tech',
  assetId = 'all',
  channelId = 'all',
  channelName,
  unitName,
  compact = false
}: PTTRadioModuleProps) {
  const [isTalking, setIsTalking] = useState(false);
  const [receivingFrom, setReceivingFrom] = useState<string | null>(null);
  const [isScannerActive, setIsScannerActive] = useState(true);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const pttStreamRef = useRef<MediaStream | null>(null);

  // Inicializar micrófono para PTT instantáneo
  useEffect(() => {
    const initMic = async () => {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          pttStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
        }
      } catch (e) {
        console.warn('Micrófono no autorizado aún para Radio PTT:', e);
      }
    };
    initMic();

    return () => {
      pttStreamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, []);

  // Generador de Tono de Radiofrecuencia (Sin dependencias externas)
  const playBeep = (type: 'start' | 'end') => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (type === 'start') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.12);
      } else {
        osc.type = 'square';
        osc.frequency.setValueAtTime(440, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.18);
      }
    } catch (e) {
      // AudioContext bloqueado hasta primer gesto de usuario
    }
  };

  // Escuchar transmisiones entrantes en tiempo real con AUTO-PURGA (Cero Almacenamiento)
  useEffect(() => {
    if (!isScannerActive) return;

    const q = query(collection(db, 'radio_signals'), orderBy('timestamp', 'desc'), limit(1));
    const unsub = onSnapshot(q, (snap) => {
      if (snap.empty) return;
      const signalDoc = snap.docs[0];
      const data = signalDoc.data();
      const now = Date.now();
      const msgTime = data.timestamp?.toMillis ? data.timestamp.toMillis() : now;

      // Descartar mis propias transmisiones o mensajes de más de 12 segundos
      const isTargetChannel = !channelId || channelId === 'all' || !data.channelId || data.channelId === 'all' || data.channelId === channelId;
      const isTargetAsset = !assetId || assetId === 'all' || !data.assetId || data.assetId === 'all' || data.assetId === assetId;

      if (data.senderId !== userId && isTargetChannel && isTargetAsset && now - msgTime < 12000) {
        if (data.status === 'talking') {
          setReceivingFrom(data.senderName || 'Operador');
          triggerHaptic('light');
        } else if (data.status === 'broadcast' && data.audioData) {
          setReceivingFrom(null);
          triggerHaptic('medium');

          // Reproducir en memoria pura
          const audio = new Audio(data.audioData);
          audio.volume = 1.0;

          // AUTO-PURGA INMEDIATA: Borrar documento tan pronto termine de sonar
          audio.onended = async () => {
            try {
              await deleteDoc(signalDoc.ref);
              console.log('🧹 [RADIO] Señal consumida y eliminada de la base de datos (0 bytes guardados).');
            } catch (err) {
              console.warn('Error purgando señal de radio:', err);
            }
          };

          audio.play().catch(e => {
            console.warn('Audio bloqueado por navegador:', e);
            // Si el navegador bloqueó la reproducción automática, purgar igualmente tras 10 segundos
            setTimeout(() => deleteDoc(signalDoc.ref).catch(() => {}), 10000);
          });
        }
      } else {
        setReceivingFrom(null);
      }
    });

    return () => unsub();
  }, [isScannerActive, userId, channelId, assetId]);

  // Comenzar a hablar (Push)
  const handleStartTalking = async () => {
    try {
      triggerHaptic('heavy');
      playBeep('start');
      setIsTalking(true);

      if (!pttStreamRef.current) {
        pttStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      }

      if (pttStreamRef.current) {
        mediaRecorderRef.current = new MediaRecorder(pttStreamRef.current);
        audioChunksRef.current = [];

        mediaRecorderRef.current.ondataavailable = (e) => {
          if (e.data.size > 0) audioChunksRef.current.push(e.data);
        };

        mediaRecorderRef.current.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = async () => {
            const base64Audio = reader.result as string;
            try {
              // Transmitir ráfaga volátil a Firestore en canal privado
              const docRef = await addDoc(collection(db, 'radio_signals'), {
                senderId: userId,
                senderName: userName || 'Técnico Móvil',
                role,
                status: 'broadcast',
                audioData: base64Audio,
                assetId,
                channelId,
                timestamp: serverTimestamp()
              });

              // Salvaguarda: si por alguna razón nadie escucha el audio, auto-eliminar a los 25 segundos
              setTimeout(async () => {
                try {
                  await deleteDoc(doc(db, 'radio_signals', docRef.id));
                } catch (e) {}
              }, 25000);
            } catch (err) {
              console.error('Error transmitiendo radio:', err);
              toast.error('Fallo al transmitir voz.');
            }
          };
        };

        mediaRecorderRef.current.start();
      }

      // Notificar a los demás que se está abriendo el canal
      await addDoc(collection(db, 'radio_signals'), {
        senderId: userId,
        senderName: userName || 'Técnico Móvil',
        status: 'talking',
        assetId,
        channelId,
        timestamp: serverTimestamp()
      });
    } catch (e) {
      console.error('Error al iniciar PTT:', e);
      setIsTalking(false);
    }
  };

  // Soltar botón (Talk)
  const handleStopTalking = async () => {
    if (!isTalking) return;
    setIsTalking(false);
    playBeep('end');
    triggerHaptic('light');

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    }

    try {
      await addDoc(collection(db, 'radio_signals'), {
        senderId: userId,
        status: 'idle',
        assetId,
        channelId,
        timestamp: serverTimestamp()
      });
    } catch (e) {}
  };

  return (
    <div className={`bg-[#121317] border border-[#2a2b2f] rounded-3xl p-5 shadow-2xl relative overflow-hidden transition-all ${
      receivingFrom ? 'border-[#52ffac] shadow-[#52ffac]/10 ring-2 ring-[#52ffac]/20' : isTalking ? 'border-[#5d3cfe] shadow-[#5d3cfe]/20' : ''
    }`}>
      {/* Indicador de Estado Superior */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className={`w-3 h-3 rounded-full flex items-center justify-center ${
            receivingFrom ? 'bg-[#52ffac] animate-ping' : isTalking ? 'bg-[#5d3cfe] animate-pulse' : 'bg-[#3b3d45]'
          }`} />
          <div>
            <div className="flex items-center gap-1.5">
              <Radio className={`w-4 h-4 ${receivingFrom ? 'text-[#52ffac]' : isTalking ? 'text-[#5d3cfe]' : 'text-[#8e8d9a]'}`} />
              <span className="text-[11px] font-black uppercase tracking-wider text-white">
                Radio PTT Flota {channelName ? `• ${channelName}` : ''}
              </span>
            </div>
            <p className="text-[9px] text-[#6e6d7a] font-bold uppercase tracking-wider">
              {unitName ? `Unidad Asignada: ${unitName} • ` : ''}Canal Privado • Cero Almacenamiento
            </p>
          </div>
        </div>

        {/* Estado Visual */}
        {receivingFrom ? (
          <span className="px-2.5 py-1 rounded-full bg-[#52ffac]/10 border border-[#52ffac]/30 text-[#52ffac] text-[10px] font-black animate-pulse flex items-center gap-1">
            <Volume2 className="w-3 h-3" /> Transmite: {receivingFrom}
          </span>
        ) : isTalking ? (
          <span className="px-2.5 py-1 rounded-full bg-[#5d3cfe]/20 border border-[#5d3cfe]/50 text-[#5d3cfe] text-[10px] font-black flex items-center gap-1">
            <Mic className="w-3 h-3 animate-bounce" /> Al Aire...
          </span>
        ) : (
          <span className="px-2.5 py-1 rounded-full bg-white/5 text-[#8e8d9a] text-[9px] font-bold">
            Canal Abierto
          </span>
        )}
      </div>

      {/* Botón PTT Principal (Presionar para hablar) */}
      <div className="flex flex-col items-center justify-center py-2">
        <button
          onMouseDown={handleStartTalking}
          onMouseUp={handleStopTalking}
          onTouchStart={handleStartTalking}
          onTouchEnd={handleStopTalking}
          onContextMenu={(e) => e.preventDefault()}
          className={`w-28 h-28 rounded-full border-4 flex flex-col items-center justify-center select-none cursor-pointer transition-all duration-150 active:scale-95 shadow-2xl ${
            isTalking
              ? 'bg-gradient-to-tr from-[#5d3cfe] to-[#795aff] border-white text-white shadow-[#5d3cfe]/50 scale-105'
              : receivingFrom
              ? 'bg-[#1c2d24] border-[#52ffac] text-[#52ffac]'
              : 'bg-[#1c1d21] border-[#2a2b2f] hover:border-[#5d3cfe]/50 text-white hover:bg-[#23242a]'
          }`}
        >
          <Mic className={`w-8 h-8 mb-1 ${isTalking ? 'animate-pulse text-white' : 'text-[#c5c3d4]'}`} />
          <span className="text-[10px] font-black uppercase tracking-wider text-center leading-tight">
            {isTalking ? 'Hablando...' : 'Mantener\nPresionado'}
          </span>
        </button>
        <p className="text-[10px] text-[#6e6d7a] font-bold uppercase tracking-wider mt-3">
          {isTalking ? 'Suelte para enviar mensaje de voz' : 'Mantenga presionado para hablar con la central'}
        </p>
      </div>

      {/* Pie de Módulo */}
      <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[9px] text-[#525160] font-bold">
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3 h-3 text-[#52ffac]" /> Transmisión en Tiempo Real
        </span>
        <span>Auto-Purga Activada (0 Storage)</span>
      </div>
    </div>
  );
}
