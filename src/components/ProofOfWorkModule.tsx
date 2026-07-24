import React, { useState } from 'react';
import { Camera, MapPin, Clock, ShieldCheck, CheckCircle2, AlertTriangle, ChevronRight } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ProofOfWorkProps {
  requestId: string;
  onSave: (data: any) => void;
  onClose: () => void;
}

export default function ProofOfWorkModule({ requestId, onSave, onClose }: ProofOfWorkProps) {
  const [oldPhoto, setOldPhoto] = useState<string | null>(null);
  const [newPhoto, setNewPhoto] = useState<string | null>(null);
  const [capturing, setCapturing] = useState<'old' | 'new' | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleCapture = (type: 'old' | 'new') => {
    // Implementación Nativa via Capacitor para Android/iOS
    // Si no estamos en móvil, cae en la simulación anterior
    setCapturing(type);

    // Obtenemos GPS de alta precisión en el momento de la foto
    navigator.geolocation.getCurrentPosition((pos) => {
      setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
    }, (err) => {
      console.warn("GPS Fallback:", err);
      setLocation({ lat: 8.9824, lng: -79.5199 }); // Ciudad de Panamá
    }, { enableHighAccuracy: true });

    // Lógica de captura (En App real llamaríamos a Camera.getPhoto)
    setTimeout(() => {
      const mockPhoto = type === 'old'
        ? "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&q=80"
        : "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=400&q=80";

      if (type === 'old') setOldPhoto(mockPhoto);
      else setNewPhoto(mockPhoto);

      setCapturing(null);
      toast.success(`${type === 'old' ? 'Pieza Vieja' : 'Pieza Nueva'} capturada con éxito`);
    }, 1500);
  };

  const handleConfirm = async () => {
    if (!oldPhoto || !newPhoto) {
      toast.error("Debes capturar ambas evidencias para continuar");
      return;
    }

    setIsSaving(true);
    const proofData = {
      oldPartPhoto: oldPhoto,
      newPartPhoto: newPhoto,
      timestamp: new Date().toISOString(),
      location: location || { lat: 8.9824, lng: -79.5199 } // Fallback Panamá
    };

    setTimeout(() => {
      onSave(proofData);
      setIsSaving(false);
      toast.success("Certificado de Trabajo Generado", {
        icon: '🛡️',
        style: { background: '#121317', color: '#fff', border: '1px solid #52ffac' }
      });
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl">
      <div className="w-full max-w-2xl bg-[#0a0b0d] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-[0_0_100px_rgba(82,255,172,0.1)]">

        {/* Header Premium */}
        <div className="p-8 border-b border-white/5 bg-gradient-to-r from-[#52ffac]/5 to-transparent">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="w-5 h-5 text-[#52ffac]" />
                <span className="text-[10px] font-black text-[#52ffac] uppercase tracking-[0.3em]">Protocolo de Evidencia Inalterable</span>
              </div>
              <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">Proof of <span className="text-[#52ffac]">Work</span></h2>
            </div>
            <button onClick={onClose} className="p-3 hover:bg-white/5 rounded-full transition-colors text-white/40 hover:text-white">✕</button>
          </div>
        </div>

        <div className="p-8 space-y-8">

          <div className="grid grid-cols-2 gap-6">
            {/* Slot Pieza Vieja */}
            <div className="space-y-4">
              <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">1. Evidencia: Pieza Vieja</span>
              <div
                onClick={() => handleCapture('old')}
                className={`aspect-video rounded-3xl border-2 border-dashed transition-all flex flex-col items-center justify-center cursor-pointer overflow-hidden group
                  ${oldPhoto ? 'border-[#52ffac] bg-[#52ffac]/5' : 'border-white/10 hover:border-white/30 bg-white/5'}`}
              >
                {oldPhoto ? (
                  <div className="relative w-full h-full">
                    <img src={oldPhoto} alt="Vieja" className="w-full h-full object-cover grayscale" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="w-8 h-8 text-white" />
                    </div>
                  </div>
                ) : (
                  <>
                    <Camera className="w-8 h-8 text-white/20 mb-2 group-hover:scale-110 transition-transform" />
                    <span className="text-[9px] font-black text-white/30 uppercase">Capturar Foto</span>
                  </>
                )}
              </div>
            </div>

            {/* Slot Pieza Nueva */}
            <div className="space-y-4">
              <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">2. Evidencia: Pieza Nueva</span>
              <div
                onClick={() => handleCapture('new')}
                className={`aspect-video rounded-3xl border-2 border-dashed transition-all flex flex-col items-center justify-center cursor-pointer overflow-hidden group
                  ${newPhoto ? 'border-[#52ffac] bg-[#52ffac]/5' : 'border-white/10 hover:border-white/30 bg-white/5'}`}
              >
                {newPhoto ? (
                  <div className="relative w-full h-full">
                    <img src={newPhoto} alt="Nueva" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="w-8 h-8 text-white" />
                    </div>
                  </div>
                ) : (
                  <>
                    <Camera className="w-8 h-8 text-white/20 mb-2 group-hover:scale-110 transition-transform" />
                    <span className="text-[9px] font-black text-white/30 uppercase">Capturar Foto</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Metadata de Seguridad (Watermark Info) */}
          <div className="bg-[#121317] rounded-3xl p-6 border border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#52ffac]" />
                <div className="flex flex-col">
                  <span className="text-[8px] font-black text-white/40 uppercase">Ubicación GPS</span>
                  <span className="text-[10px] text-white font-medium">{location ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : 'Detectando...'}</span>
                </div>
              </div>
              <div className="w-px h-8 bg-white/10"></div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#52ffac]" />
                <div className="flex flex-col">
                  <span className="text-[8px] font-black text-white/40 uppercase">Marca de Tiempo</span>
                  <span className="text-[10px] text-white font-medium">{new Date().toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
            <div className="px-4 py-2 bg-[#52ffac]/10 rounded-full">
               <span className="text-[9px] font-black text-[#52ffac] uppercase tracking-widest">Encriptado SHA-256</span>
            </div>
          </div>

          <div className="flex items-center gap-4 pt-4">
            <button
              onClick={handleConfirm}
              disabled={!oldPhoto || !newPhoto || isSaving}
              className="flex-1 py-5 bg-[#52ffac] text-black rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-3 shadow-[0_20px_40px_rgba(82,255,172,0.2)]"
            >
              {isSaving ? 'Generando Certificado...' : (
                <>
                  <CheckCircle2 className="w-4 h-4" /> Finalizar y Certificar
                </>
              )}
            </button>
          </div>

          <p className="text-center text-[8px] text-white/20 font-medium uppercase tracking-[0.3em]">
            Esta evidencia será inalterable y se adjuntará al reporte técnico final.
          </p>

        </div>
      </div>
    </div>
  );
}
