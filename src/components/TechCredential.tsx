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
    <div className="w-full max-w-sm mx-auto animate-fade-in-up">
      {/* Frente de la Credencial */}
      <div className="bg-[#121317] border border-[#2a2b2f] rounded-[2.5rem] overflow-hidden shadow-2xl relative">
        {/* Encabezado con marca */}
        <div className="bg-gradient-to-r from-[#5d3cfe] to-[#c7bfff] p-6 flex justify-between items-center">
           <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-md">
                 <span className="text-white font-black italic text-sm">M</span>
              </div>
              <span className="text-white font-black text-xs uppercase tracking-widest">MantechPro ID</span>
           </div>
           <ShieldCheck className="text-white w-5 h-5" />
        </div>

        {/* Cuerpo de la Credencial */}
        <div className="p-8 text-center space-y-6">
           {/* Foto del Técnico */}
           <div className="relative inline-block">
              <div className="w-32 h-32 rounded-3xl bg-[#0d0e12] border-4 border-[#2a2b2f] overflow-hidden mx-auto shadow-inner">
                 {tech.portfolioImages?.[0] ? (
                    <img src={tech.portfolioImages[0]} className="w-full h-full object-cover" alt={tech.name} />
                 ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#474556]">
                       <User className="w-12 h-12" />
                    </div>
                 )}
              </div>
              <div className="absolute -bottom-2 -right-2 bg-[#52ffac] text-[#0d0e12] p-1.5 rounded-xl shadow-lg border-4 border-[#121317]">
                 <ShieldCheck className="w-4 h-4" />
              </div>
           </div>

           {/* Información Principal */}
           <div>
              {tech.companyName && (
                <div className="mb-2 inline-flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 rounded-lg">
                   <Building2 className="w-3.5 h-3.5 text-[#52ffac]" />
                   <span className="text-[10px] font-black text-white uppercase tracking-tight">{tech.companyName}</span>
                </div>
              )}
              <h3 className="text-xl font-black text-white uppercase tracking-tight">{tech.name}</h3>
              <p className="text-[#52ffac] text-[10px] font-black uppercase tracking-[0.25em] mt-1">{tech.category.replace('_', ' ')}</p>
           </div>

           {/* Detalles de Seguridad */}
           <div className="grid grid-cols-2 gap-4 py-4 border-y border-[#2a2b2f]/50">
              <div className="text-left space-y-1">
                 <p className="text-[8px] font-black text-[#474556] uppercase tracking-widest">Estado</p>
                 <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#52ffac] animate-pulse"></div>
                    <span className="text-[10px] font-bold text-white uppercase">Activo</span>
                 </div>
              </div>
              <div className="text-left space-y-1">
                 <p className="text-[8px] font-black text-[#474556] uppercase tracking-widest">Validación</p>
                 <span className="text-[10px] font-bold text-[#c7bfff] uppercase">{validationCode}</span>
              </div>
           </div>

           {/* QR Code dinámico */}
           <div className="space-y-4">
              <div className="bg-white p-3 rounded-2xl inline-block shadow-xl">
                 <img src={qrUrl} alt="QR de Validación" className="w-24 h-24" />
              </div>
              <p className="text-[10px] text-white font-medium italic leading-relaxed px-6">
                "{tech.bio || "Técnico Certificado MantechPro."}"
              </p>
           </div>
        </div>

        {/* Footer de marca técnica */}
        <div className="px-8 py-4 bg-[#1c1d21] border-t border-[#2a2b2f] flex justify-between items-center">
           <div className="flex items-center gap-2 text-[#474556]">
              <MapPin className="w-3 h-3" />
              <span className="text-[9px] font-black uppercase">{tech.location.split(',')[0]}</span>
           </div>
           {tech.plan === 'premium' && (
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-[#5d3cfe]/10 border border-[#5d3cfe]/30 rounded-full">
                 <Building2 className="w-2.5 h-2.5 text-[#c7bfff]" />
                 <span className="text-[8px] font-black text-[#c7bfff] uppercase">Partner</span>
              </div>
           )}
        </div>
      </div>

      {/* Marca del Técnico (Opcional) */}
      <div className="mt-4 flex items-center justify-center gap-2 opacity-50 grayscale hover:opacity-100 transition-all">
         <p className="text-[8px] font-black text-[#474556] uppercase tracking-widest italic">Acreditado por MantechPro Industries Inc. © 2026</p>
      </div>
    </div>
  );
}
