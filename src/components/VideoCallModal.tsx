import React, { useEffect, useRef, useState } from 'react';
import { X, Mic, MicOff, Video, VideoOff, PhoneOff, ShieldCheck, Zap, User, UserCheck, Signal } from 'lucide-react';
import { db } from '../firebase';
import { collection, doc, addDoc, onSnapshot, updateDoc, getDoc, setDoc, deleteDoc, collectionGroup, query, where, getDocs } from 'firebase/firestore';

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

  useEffect(() => {
    if (isOpen) {
      initCall();
    }
    return () => cleanup();
  }, [isOpen]);

  const cleanup = () => {
    localStream.current?.getTracks().forEach(track => track.stop());
    if (pc.current) {
      pc.current.close();
      pc.current = null;
    }
  };

  const initCall = async () => {
    pc.current = new RTCPeerConnection(servers);

    try {
      localStream.current = await navigator.mediaDevices.getUserMedia({
        video: !isVoiceOnly,
        audio: true
      });

      if (localVideoRef.current) localVideoRef.current.srcObject = localStream.current;

      localStream.current.getTracks().forEach(track => {
        pc.current?.addTrack(track, localStream.current!);
      });

      pc.current.ontrack = (event) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
          setStatus('En línea');
        }
      };

      const callDoc = doc(db, 'calls', roomName);
      const answerCandidates = collection(callDoc, 'answerCandidates');
      const offerCandidates = collection(callDoc, 'offerCandidates');

      pc.current.onicecandidate = (event) => {
        if (event.candidate) {
          const candCollection = status === 'Uniendo...' ? answerCandidates : offerCandidates;
          addDoc(candCollection, event.candidate.toJSON());
        }
      };

      const callData = (await getDoc(callDoc)).data();

      if (!callData) {
        // SOY EL QUE LLAMA (OFFERER)
        setStatus('Llamando...');
        const offerDescription = await pc.current.createOffer();
        await pc.current.setLocalDescription(offerDescription);

        await setDoc(callDoc, { offer: { sdp: offerDescription.sdp, type: offerDescription.type } });

        onSnapshot(callDoc, (snapshot) => {
          const data = snapshot.data();
          if (!pc.current?.currentRemoteDescription && data?.answer) {
            const answerDescription = new RTCSessionDescription(data.answer);
            pc.current?.setRemoteDescription(answerDescription);
          }
        });

        onSnapshot(answerCandidates, (snapshot) => {
          snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
              pc.current?.addIceCandidate(new RTCIceCandidate(change.doc.data()));
            }
          });
        });

      } else {
        // SOY EL QUE RECIBE (ANSWERER)
        setStatus('Uniendo...');
        const offerDescription = callData.offer;
        await pc.current.setRemoteDescription(new RTCSessionDescription(offerDescription));

        const answerDescription = await pc.current.createAnswer();
        await pc.current.setLocalDescription(answerDescription);

        await updateDoc(callDoc, { answer: { sdp: answerDescription.sdp, type: answerDescription.type } });

        onSnapshot(offerCandidates, (snapshot) => {
          snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
              pc.current?.addIceCandidate(new RTCIceCandidate(change.doc.data()));
            }
          });
        });
      }

    } catch (err) {
      console.error(err);
      setStatus('Error de cámara');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[800] bg-[#0d0e12] flex flex-col items-center justify-center">

      {/* HEADER NATIVO */}
      <div className="absolute top-8 left-0 right-0 px-10 flex justify-between items-center z-50">
         <div className="flex items-center gap-4 bg-black/20 backdrop-blur-xl p-3 rounded-2xl border border-white/5">
            <div className="w-10 h-10 bg-[#5d3cfe] rounded-xl flex items-center justify-center shadow-lg">
               <Zap className="w-5 h-5 text-white fill-current" />
            </div>
            <div>
               <h2 className="text-white text-xs font-black uppercase tracking-widest">MantechPro Native</h2>
               <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="w-1.5 h-1.5 bg-[#52ffac] rounded-full animate-pulse"></div>
                  <span className="text-[9px] text-[#52ffac] font-bold uppercase tracking-widest">{status}</span>
               </div>
            </div>
         </div>

         <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-full backdrop-blur-md">
               <span className="text-[8px] font-black text-[#c8c4d9] uppercase tracking-[0.2em] flex items-center gap-2">
                  <Signal className="w-3 h-3" /> Canales Encriptados
               </span>
            </div>
         </div>
      </div>

      {/* ÁREA DE VIDEO PRINCIPAL */}
      <div className="relative w-full h-full p-4 flex flex-col md:flex-row gap-4">

        {/* VIDEO REMOTO (EL OTRO) */}
        <div className="flex-1 bg-[#121317] rounded-[2.5rem] border border-white/5 overflow-hidden relative shadow-2xl">
           <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
           {!remoteVideoRef.current?.srcObject && (
             <div className="absolute inset-0 flex flex-col items-center justify-center text-[#474556] gap-6">
                <div className="relative">
                   <div className="w-24 h-24 rounded-full bg-[#5d3cfe]/10 border border-[#5d3cfe]/20 flex items-center justify-center animate-pulse">
                      <User className="w-10 h-10 text-[#5d3cfe]" />
                   </div>
                   <div className="absolute -top-2 -right-2 bg-rose-600 px-2 py-1 rounded-lg text-[7px] font-black text-white uppercase">Encifrado</div>
                </div>
                <div className="text-center space-y-1">
                   <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white">Sincronizando Nodo</p>
                   <p className="text-[8px] font-medium uppercase text-[#474556] tracking-widest">Esperando al interlocutor en la sala...</p>
                </div>
             </div>
           )}
        </div>

        {/* VIDEO LOCAL (YO) - FLOTANTE */}
        <div className="absolute bottom-32 right-8 w-32 h-48 md:w-48 md:h-64 bg-[#1c1d21] rounded-[2rem] border-2 border-[#5d3cfe] overflow-hidden shadow-2xl z-40 group cursor-move active:scale-95 transition-transform">
           <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
           <div className="absolute top-4 left-4 px-2 py-1 bg-black/40 backdrop-blur-md rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-[7px] font-bold text-white uppercase tracking-widest">Vista Local</span>
           </div>
        </div>
      </div>

      {/* BARRA DE COMANDOS */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-6 px-10 py-5 bg-[#1c1d21]/60 backdrop-blur-3xl border border-white/10 rounded-[3rem] shadow-2xl z-50">
        <button
          onClick={() => {
            if (localStream.current) {
              const audioTrack = localStream.current.getAudioTracks()[0];
              if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsMuted(!audioTrack.enabled);
              }
            }
          }}
          className={`p-4 rounded-2xl transition-all ${isMuted ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/20' : 'bg-white/5 text-[#c8c4d9] hover:bg-white/10 border border-white/5'}`}
        >
          {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
        </button>

        <button
          onClick={onClose}
          className="p-6 bg-rose-600 rounded-[2rem] text-white hover:scale-110 active:scale-95 transition-all shadow-[0_20px_50px_rgba(225,29,72,0.4)] border border-rose-400/20"
        >
          <PhoneOff className="w-8 h-8" />
        </button>

        <button
          onClick={() => {
            if (localStream.current) {
              const videoTrack = localStream.current.getVideoTracks()[0];
              if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setIsVideoOff(!videoTrack.enabled);
              }
            }
          }}
          className={`p-4 rounded-2xl transition-all ${isVideoOff ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/20' : 'bg-white/5 text-[#c8c4d9] hover:bg-white/10 border border-white/5'}`}
        >
          {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
        </button>
      </div>

    </div>
  );
}
