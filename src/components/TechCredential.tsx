import React from 'react';
import { TechProfile } from '../types';
import { ShieldCheck, QrCode, MapPin, Star, User, Building2 } from 'lucide-react';

interface TechCredentialProps {
  tech: TechProfile;
}

export default function TechCredential({ tech }: TechCredentialProps) {
  // Generar un código de validación único - Solo el ID para escaneo rápido
  const validationCode = `MP-${tech.id.substring(0, 8).toUpperCase()}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${tech.id}`;

  return (
    <div className="w-full max-w-[320px] mx-auto animate-fade-in-up">
      {/* Frente de la Credencial */}
      <div className="bg-[#121317] border border-[#2a2b2f] rounded-[2rem] overflow-hidden shadow-2xl relative">
        {/* Encabezado con marca */}
        <div className="bg-gradient-to-r from-[#5d3cfe] to-[#c7bfff] p-4 flex justify-between items-center">
           <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-white/20 rounded flex items-center justify-center backdrop-blur-md">
                 <span className="text-white font-black italic text-[10px]">M</span>
              </div>
              <span className="text-white font-black text-[9px] uppercase tracking-widest">MantechPro ID</span>
           </div>
           <ShieldCheck className="text-white w-4 h-4" />
        </div>

        {/* Cuerpo de la Credencial */}
        <div className="p-6 text-center space-y-4">
           {/* Foto del Técnico */}
           <div className="relative inline-block">
              <div className="w-24 h-24 rounded-2xl bg-[#0d0e12] border-2 border-[#2a2b2f] overflow-hidden mx-auto shadow-inner">
                 {tech.portfolioImages?.[0] ? (
                    <img src={tech.portfolioImages[0]} className="w-full h-full object-cover" alt={tech.name} />
                 ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#474556]">
                       <User className="w-10 h-10" />
                    </div>
                 )}
              </div>
              <div className="absolute -bottom-1 -right-1 bg-[#52ffac] text-[#0d0e12] p-1 rounded-lg shadow-lg border-2 border-[#121317]">
                 <ShieldCheck className="w-3 h-3" />
              </div>
           </div>

           {/* Información Principal */}
           <div>
              {tech.companyName && (
                <div className="mb-1 inline-flex items-center gap-1 px-2 py-0.5 bg-white/5 border border-white/10 rounded-md">
                   <Building2 className="w-3 h-3 text-[#52ffac]" />
                   <span className="text-[8px] font-black text-white uppercase tracking-tight">{tech.companyName}</span>
                </div>
              )}
              <h3 className="text-lg font-black text-white uppercase tracking-tight">{tech.name}</h3>
              <p className="text-[#52ffac] text-[9px] font-black uppercase tracking-[0.2em] mt-0.5">{tech.category.replace('_', ' ')}</p>
           </div>

           {/* Detalles de Seguridad */}
           <div className="grid grid-cols-2 gap-3 py-3 border-y border-[#2a2b2f]/50">
              <div className="text-left space-y-0.5">
                 <p className="text-[7px] font-black text-[#474556] uppercase tracking-widest">Estado</p>
                 <div className="flex items-center gap-1">
                    <div className="w-1 h-1 rounded-full bg-[#52ffac] animate-pulse"></div>
                    <span className="text-[9px] font-bold text-white uppercase">Activo</span>
                 </div>
              </div>
              <div className="text-left space-y-0.5">
                 <p className="text-[7px] font-black text-[#474556] uppercase tracking-widest">Validación</p>
                 <span className="text-[9px] font-bold text-[#c7bfff] uppercase">{validationCode}</span>
              </div>
           </div>

           {/* QR Code dinámico */}
           <div className="space-y-3">
              <div className="bg-white p-2 rounded-xl inline-block shadow-xl">
                 <img src={qrUrl} alt="QR de Validación" className="w-20 h-24" />
              </div>
              <p className="text-[9px] text-white/60 font-medium italic leading-relaxed px-4">
                "{tech.bio || "Técnico Certificado MantechPro."}"
              </p>
           </div>
        </div>

        {/* Footer de marca técnica */}
        <div className="px-6 py-3 bg-[#1c1d21] border-t border-[#2a2b2f] flex justify-between items-center">
           <div className="flex items-center gap-1.5 text-[#474556]">
              <MapPin className="w-2.5 h-2.5" />
              <span className="text-[8px] font-black uppercase">{tech.location.split(',')[0]}</span>
           </div>
           {tech.plan === 'premium' && (
              <div className="flex items-center gap-1 px-1.5 py-0.5 bg-[#5d3cfe]/10 border border-[#5d3cfe]/30 rounded-full">
                 <Building2 className="w-2 h-2 text-[#c7bfff]" />
                 <span className="text-[7px] font-black text-[#c7bfff] uppercase">Partner</span>
              </div>
           )}
        </div>
      </div>

      {/* Marca del Técnico (Opcional) */}
      <div className="mt-3 flex items-center justify-center gap-2 opacity-40">
         <p className="text-[7px] font-black text-[#474556] uppercase tracking-[0.2em]">Acreditado por MantechPro © 2026</p>
      </div>
    </div>
  );
}
