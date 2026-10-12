import React, { useEffect, useRef, useState } from 'react';
import { X, Mic, MicOff, Video, VideoOff, PhoneOff, ShieldCheck, Zap, User, UserCheck, Signal } from 'lucide-react';
import { db } from '../firebase';
import { collection, doc, addDoc, onSnapshot, updateDoc, getDoc, setDoc, deleteDoc, collectionGroup, query, where, getDocs } from 'firebase/firestore';
import { toast } from 'react-hot-toast';

interface VideoCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomName: string;
  userName: string;
  isVoiceOnly?: boolean;
}

export default function VideoCallModal({ isOpen, onClose, roomName, userName, isVoiceOnly = false }: VideoCallModalProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(isVoiceOnly);
  const [status, setStatus] = useState('Iniciando...');

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const pc = useRef<RTCPeerConnection | null>(null);
  const localStream = useRef<MediaStream | null>(null);

  const servers = {
    iceServers: [
      { urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'] },
    ],
    iceCandidatePoolSize: 10,
  };

  const unsubs = useRef<(() => void)[]>([]);

  useEffect(() => {
    if (isOpen) {
      initCall();
    }
    return () => cleanup();
  }, [isOpen]);

  const cleanup = () => {
    unsubs.current.forEach(unsub => unsub());
    unsubs.current = [];
    localStream.current?.getTracks().forEach(track => track.stop());
    localStream.current = null;
    if (pc.current) {
      pc.current.close();
      pc.current = null;
    }
  };

  const endCall = async () => {
    try {
      const callDoc = doc(db, 'calls', roomName);
      await setDoc(callDoc, { ended: true }, { merge: true });
    } catch (e) {
      console.warn("Error marking call ended", e);
    }
    cleanup();
    onClose();
  };

  const initCall = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      toast.error("Tu dispositivo no soporta llamadas WebRTC en este navegador.");
      setStatus('No soportado');
      return;
    }

    pc.current = new RTCPeerConnection(servers);

    try {
      try {
        localStream.current = await navigator.mediaDevices.getUserMedia({
          video: !isVoiceOnly,
          audio: true
        });
      } catch (mediaErr: any) {
        console.warn("Retrying with audio-only...", mediaErr);
        localStream.current = await navigator.mediaDevices.getUserMedia({
          video: false,
          audio: true
        });
        setIsVideoOff(true);
        toast("Iniciando en modo solo voz.", { icon: '📞' });
      }

      if (localVideoRef.current && localStream.current) {
        localVideoRef.current.srcObject = localStream.current;
      }

      localStream.current.getTracks().forEach(track => {
        pc.current?.addTrack(track, localStream.current!);
      });

      pc.current.ontrack = (event) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
          setStatus('En línea (Conectado)');
        }
      };

      const callDoc = doc(db, 'calls', roomName);
      const answerCandidates = collection(callDoc, 'answerCandidates');
      const offerCandidates = collection(callDoc, 'offerCandidates');

      const callSnap = await getDoc(callDoc);
      const callData = callSnap.data();
      const isJoining = Boolean(callData && !callData.ended && !callData.answer && callData.offer);

      pc.current.onicecandidate = (event) => {
        if (event.candidate) {
          const candCollection = isJoining ? answerCandidates : offerCandidates;
          addDoc(candCollection, event.candidate.toJSON());
        }
      };

      if (!isJoining) {
        // SOY EL QUE INICIA LA LLAMADA (OFFERER)
        setStatus('Llamando...');
        const offerDescription = await pc.current.createOffer();
        await pc.current.setLocalDescription(offerDescription);

        await setDoc(callDoc, {
          offer: { sdp: offerDescription.sdp, type: offerDescription.type },
          caller: userName,
          isVoiceOnly: Boolean(isVoiceOnly),
          ended: false,
          createdAt: Date.now()
        });

        const unsubCall = onSnapshot(callDoc, (snapshot) => {
          const data = snapshot.data();
          if (data?.ended) {
            toast("Llamada finalizada.", { icon: '📴' });
            cleanup();
            onClose();
            return;
          }
          if (!pc.current?.currentRemoteDescription && data?.answer) {
            const answerDescription = new RTCSessionDescription(data.answer);
            pc.current?.setRemoteDescription(answerDescription);
            setStatus('En línea');
          }
        });
        unsubs.current.push(unsubCall);

        const unsubCandidates = onSnapshot(answerCandidates, (snapshot) => {
          snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
              pc.current?.addIceCandidate(new RTCIceCandidate(change.doc.data()));
            }
          });
        });
        unsubs.current.push(unsubCandidates);

      } else {
        // SOY EL QUE RECIBE LA LLAMADA (ANSWERER)
        setStatus('Conectando a la llamada...');
        const offerDescription = callData.offer;
        await pc.current.setRemoteDescription(new RTCSessionDescription(offerDescription));

        const answerDescription = await pc.current.createAnswer();
        await pc.current.setLocalDescription(answerDescription);

        await updateDoc(callDoc, {
          answer: { sdp: answerDescription.sdp, type: answerDescription.type },
          receiver: userName
        });

        const unsubCall = onSnapshot(callDoc, (snapshot) => {
          const data = snapshot.data();
          if (data?.ended) {
            toast("Llamada finalizada.", { icon: '📴' });
            cleanup();
            onClose();
          }
        });
        unsubs.current.push(unsubCall);

        const unsubCandidates = onSnapshot(offerCandidates, (snapshot) => {
          snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
              pc.current?.addIceCandidate(new RTCIceCandidate(change.doc.data()));
            }
          });
        });
        unsubs.current.push(unsubCandidates);
      }

    } catch (err: any) {
      console.error("Error en WebRTC:", err);
      setStatus('Error de conexión');
      toast.error('No se pudo establecer la llamada: ' + (err?.message || 'Error de medios'));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[800] bg-[#0d0e12] flex flex-col items-center justify-center animate-fade-in">

      {/* HEADER NATIVO */}
      <div className="absolute top-8 left-0 right-0 px-6 sm:px-10 flex justify-between items-center z-50">
         <div className="flex items-center gap-4 bg-black/40 backdrop-blur-xl p-3 rounded-2xl border border-white/5">
            <div className={`w-10 h-10 ${isVoiceOnly ? 'bg-[#5d3cfe]' : 'bg-[#52ffac]'} rounded-xl flex items-center justify-center shadow-lg`}>
               {isVoiceOnly ? <Mic className="w-5 h-5 text-white" /> : <Video className="w-5 h-5 text-black" />}
            </div>
            <div>
               <h2 className="text-white text-xs font-black uppercase tracking-widest">
                 {isVoiceOnly ? 'Llamada de Voz P2P' : 'Videoasistencia MantechPro'}
               </h2>
               <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="w-1.5 h-1.5 bg-[#52ffac] rounded-full animate-pulse"></div>
                  <span className="text-[9px] text-[#52ffac] font-bold uppercase tracking-widest">{status}</span>
               </div>
            </div>
         </div>

         <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-full backdrop-blur-md">
               <span className="text-[8px] font-black text-[#c8c4d9] uppercase tracking-[0.2em] flex items-center gap-2">
                  <Signal className="w-3 h-3 text-[#52ffac]" /> WebRTC Seguro
               </span>
            </div>
         </div>
      </div>

      {/* ÁREA DE VIDEO / AUDIO PRINCIPAL */}
      <div className="relative w-full h-full p-4 pt-24 pb-28 flex flex-col items-center justify-center">

        {/* CONTENEDOR PRINCIPAL */}
        <div className="w-full h-full max-w-5xl bg-[#121317] rounded-[2.5rem] border border-white/5 overflow-hidden relative shadow-2xl flex items-center justify-center">
           <video
             ref={remoteVideoRef}
             autoPlay
             playsInline
             className={`w-full h-full object-cover ${isVoiceOnly ? 'hidden' : ''}`}
           />
           {(isVoiceOnly || !remoteVideoRef.current?.srcObject) && (
             <div className="absolute inset-0 flex flex-col items-center justify-center text-[#474556] gap-6">
                <div className="relative">
                   <div className="w-28 h-28 rounded-full bg-[#5d3cfe]/20 border-2 border-[#5d3cfe] flex items-center justify-center animate-pulse shadow-[0_0_50px_rgba(93,60,254,0.3)]">
                      {isVoiceOnly ? <Mic className="w-12 h-12 text-[#c7bfff]" /> : <User className="w-12 h-12 text-[#5d3cfe]" />}
                   </div>
                   <div className="absolute -top-2 -right-2 bg-emerald-600 px-2.5 py-1 rounded-lg text-[8px] font-black text-white uppercase tracking-wider">
                     {status}
                   </div>
                </div>
                <div className="text-center space-y-1.5">
                   <p className="text-sm font-black uppercase tracking-[0.3em] text-white">
                     {isVoiceOnly ? 'Llamada de Voz Activa' : 'Videoasistencia Remota'}
                   </p>
                   <p className="text-[10px] font-bold uppercase text-[#8e8d9f] tracking-widest">
                     Sala: {roomName}
                   </p>
                </div>
             </div>
           )}
        </div>

        {/* VIDEO LOCAL (YO) - FLOTANTE (Solo si hay video activado) */}
        {!isVoiceOnly && !isVideoOff && (
          <div className="absolute bottom-32 right-8 w-32 h-48 md:w-48 md:h-64 bg-[#1c1d21] rounded-[2rem] border-2 border-[#5d3cfe] overflow-hidden shadow-2xl z-40 group cursor-move active:scale-95 transition-transform">
             <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
             <div className="absolute top-4 left-4 px-2 py-1 bg-black/40 backdrop-blur-md rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-[7px] font-bold text-white uppercase tracking-widest">Mi Cámara</span>
             </div>
          </div>
        )}
      </div>

      {/* BARRA DE CONTROLES */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-6 px-8 py-4 bg-[#1c1d21]/80 backdrop-blur-3xl border border-white/10 rounded-[3rem] shadow-2xl z-50">
        <button
          type="button"
          onClick={() => {
            if (localStream.current) {
              const audioTrack = localStream.current.getAudioTracks()[0];
              if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsMuted(!audioTrack.enabled);
              }
            }
          }}
          className={`p-4 rounded-2xl transition-all cursor-pointer ${isMuted ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/20' : 'bg-white/5 text-[#c8c4d9] hover:bg-white/10 border border-white/5'}`}
          title={isMuted ? "Activar micrófono" : "Silenciar micrófono"}
        >
          {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
        </button>

        <button
          type="button"
          onClick={endCall}
          className="p-5 bg-rose-600 rounded-[2rem] text-white hover:scale-110 active:scale-95 transition-all shadow-[0_20px_50px_rgba(225,29,72,0.4)] border border-rose-400/20 cursor-pointer"
          title="Finalizar llamada"
        >
          <PhoneOff className="w-7 h-7" />
        </button>

        {!isVoiceOnly && (
          <button
            type="button"
            onClick={() => {
              if (localStream.current) {
                const videoTrack = localStream.current.getVideoTracks()[0];
                if (videoTrack) {
                  videoTrack.enabled = !videoTrack.enabled;
                  setIsVideoOff(!videoTrack.enabled);
                }
              }
            }}
            className={`p-4 rounded-2xl transition-all cursor-pointer ${isVideoOff ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/20' : 'bg-white/5 text-[#c8c4d9] hover:bg-white/10 border border-white/5'}`}
            title={isVideoOff ? "Activar cámara" : "Desactivar cámara"}
          >
            {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
          </button>
        )}
      </div>

    </div>
  );
}
