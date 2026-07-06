import React, { useState, useEffect } from 'react';
import { X, QrCode, ShieldCheck, Camera, Zap, AlertTriangle, Loader2 } from 'lucide-react';
import { TechProfile } from '../types';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (techId: string) => void;
  technicians: TechProfile[];
}

declare global {
  interface Window {
    Html5QrcodeScanner: any;
  }
}

export default function QRScannerModal({ isOpen, onClose, onScanSuccess, technicians }: QRScannerModalProps) {
  const [isScanning, setIsScanning] = useState(true);
  const [scanResult, setScanResult] = useState<TechProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let scanner: any = null;

    if (isOpen && isScanning) {
      // Esperar un momento a que el DOM esté listo
      const timer = setTimeout(() => {
        try {
          scanner = new window.Html5QrcodeScanner(
            "reader",
            {
              fps: 10,
              qrbox: { width: 250, height: 250 },
              aspectRatio: 1.0
            },
            false
          );

          scanner.render((decodedText: string) => {
            // Intentar encontrar al técnico por ID o por nombre contenido en el QR
            const tech = technicians.find(t => t.id === decodedText || decodedText.includes(t.name));

            if (tech) {
              scanner.clear();
              setScanResult(tech);
              setIsScanning(false);
              onScanSuccess(tech.id);
            } else {
              // Si el QR no es de un técnico registrado
              console.warn("QR detectado pero no reconocido como técnico:", decodedText);
            }
          }, (err: any) => {
            // Errores silenciosos de escaneo (cuando no hay QR en el cuadro)
          });
        } catch (err) {
          console.error("Scanner Error:", err);
          setError("Error al iniciar el motor de escaneo. Revisa los permisos de cámara.");
        }
      }, 500);

      return () => {
        if (scanner) {
          scanner.clear().catch((e: any) => console.error(e));
        }
        clearTimeout(timer);
      };
    }
  }, [isOpen, isScanning, technicians, onScanSuccess]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[500] bg-[#0d0e12]/98 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#121317] border border-white/10 rounded-[3rem] overflow-hidden shadow-2xl">

        <header className="px-8 py-6 border-b border-white/5 flex justify-between items-center bg-[#1c1d21]/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#5d3cfe]/10 rounded-xl text-[#c7bfff]">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white uppercase tracking-tight">Scanner Mantech ID</h2>
              <p className="text-[9px] font-bold text-[#52ffac] uppercase tracking-widest">Validación Real de Especialista</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-[#474556] hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </header>

        <div className="p-8">
          {error ? (
            <div className="text-center space-y-6 py-10">
               <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto text-rose-500">
                 <AlertTriangle className="w-10 h-10" />
               </div>
               <p className="text-sm font-bold text-white uppercase">{error}</p>
               <button onClick={onClose} className="px-8 py-3 bg-[#1c1d21] text-white rounded-xl text-[10px] font-black uppercase">Cerrar</button>
            </div>
          ) : isScanning ? (
            <div className="space-y-8 text-center">
              {/* CONTENEDOR DEL ESCÁNER REAL */}
              <div className="relative w-72 h-72 mx-auto border-2 border-[#5d3cfe]/30 rounded-[3rem] overflow-hidden bg-black shadow-[0_0_50px_rgba(93,60,254,0.2)]">
                <div id="reader" className="w-full h-full"></div>

                {/* Overlay de diseño sobre el scanner */}
                <div className="absolute inset-0 pointer-events-none border-[20px] border-[#121317]"></div>
                <div className="absolute top-0 left-0 w-full h-1 bg-[#52ffac] shadow-[0_0_20px_#52ffac] animate-scan-line"></div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-black text-white uppercase tracking-widest">Buscando Código QR</p>
                <p className="text-[10px] text-[#c8c4d9] font-medium leading-relaxed italic">
                  Apunte la cámara a la credencial que el técnico tiene abierta en su app.
                </p>
              </div>
            </div>
          ) : scanResult && (
            <div className="animate-fade-in-up space-y-6">
              <div className={`rounded-[2.5rem] p-8 text-center space-y-4 border ${scanResult.isVerified ? 'bg-[#52ffac]/5 border-[#52ffac]/20' : 'bg-rose-500/5 border-rose-500/20'}`}>
                 <div className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center shadow-2xl ${scanResult.isVerified ? 'bg-[#52ffac] text-[#0d0e12]' : 'bg-rose-500 text-white'}`}>
                   {scanResult.isVerified ? <ShieldCheck className="w-12 h-12" /> : <AlertTriangle className="w-12 h-12" />}
                 </div>
                 <div>
                   <h3 className="text-2xl font-black text-white uppercase tracking-tight">
                     {scanResult.isVerified ? 'Identidad Validada' : 'No Verificado'}
                   </h3>
                   <p className={`text-[10px] font-bold uppercase tracking-widest ${scanResult.isVerified ? 'text-[#52ffac]' : 'text-rose-500'}`}>
                     {scanResult.isVerified ? 'Técnico Oficial MantechPro' : '¡Precaución: Sin credenciales!'}
                   </p>
                 </div>
              </div>

              <div className="bg-[#1c1d21] border border-white/5 rounded-[2rem] p-6 flex items-center gap-5">
                 <div className="w-16 h-16 rounded-2xl bg-[#5d3cfe] flex items-center justify-center text-white font-black text-xl shadow-lg">
                   {scanResult.name.charAt(0)}
                 </div>
                 <div className="flex-1">
                   <p className="text-sm font-black text-white uppercase tracking-tight">{scanResult.name}</p>
                   <p className="text-[10px] text-[#c8c4d9] font-bold uppercase mt-1">{scanResult.category}</p>
                 </div>
              </div>

              <button
                onClick={onClose}
                className="w-full py-5 bg-[#5d3cfe] text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-[#5d3cfe]/20 hover:brightness-110 active:scale-95 transition-all"
              >
                Confirmar & Autorizar Entrada
              </button>
            </div>
          )}
        </div>

        <footer className="px-8 py-4 bg-[#1c1d21]/50 border-t border-white/5 text-center flex items-center justify-center gap-2">
           <Zap className="w-3 h-3 text-amber-500 fill-current" />
           <p className="text-[8px] text-[#474556] font-black uppercase tracking-[0.2em]">Cifrado de Punto a Punto con el Nodo Central</p>
        </footer>

        <style>{`
          #reader { border: none !important; }
          #reader video { object-fit: cover !important; }
          #reader__dashboard { display: none !important; }
          @keyframes scan-line {
            0% { top: 0; }
            100% { top: 100%; }
          }
          .animate-scan-line {
            animation: scan-line 3s linear infinite;
          }
        `}</style>
      </div>
    </div>
  );
}
