import React from 'react';
import { TechProfile } from '../types';
import { ShieldCheck, QrCode, MapPin, Star, User, Building2, BadgeCheck } from 'lucide-react';
import MantechProLogo from './Logo';

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
      <div className="bg-[#121317] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] relative group">
        {/* LUZ DE FONDO DINÁMICA */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-[#5d3cfe]/20 to-transparent opacity-50 group-hover:opacity-100 transition-opacity"></div>

        {/* Encabezado con marca */}
        <div className="bg-white/[0.03] backdrop-blur-md p-5 flex justify-between items-center border-b border-white/5 relative z-10">
           <MantechProLogo size="sm" showText={false} />
           <div className="flex items-center gap-2">
              <span className="text-white font-black text-[8px] uppercase tracking-[0.3em]">Master Credential</span>
              <BadgeCheck className="text-[#52ffac] w-4 h-4" />
           </div>
        </div>

        {/* Cuerpo de la Credencial */}
        <div className="p-8 text-center space-y-6 relative z-10">
           {/* Foto del Técnico */}
           <div className="relative inline-block">
              <div className="w-28 h-28 rounded-[2rem] bg-[#0d0e12] border-2 border-white/10 overflow-hidden mx-auto shadow-2xl relative">
                 {tech.profileImage ? (
                    <img src={tech.profileImage} className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-700" alt={tech.name} />
                 ) : tech.portfolioImages?.[0] ? (
                    <img src={tech.portfolioImages[0]} className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-700" alt={tech.name} />
                 ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#474556]">
                       <User className="w-12 h-12" />
                    </div>
                 )}
              </div>
              <div className="absolute -bottom-2 -right-2 bg-[#52ffac] text-[#0d0e12] p-2 rounded-xl shadow-[0_0_20px_rgba(82,255,172,0.4)] border-4 border-[#121317]">
                 <ShieldCheck className="w-4 h-4" />
              </div>
           </div>

           {/* Información Principal */}
           <div className="space-y-2">
              {tech.companyName && (
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#52ffac]/10 border border-[#52ffac]/20 rounded-full mb-2">
                   <Building2 className="w-3 h-3 text-[#52ffac]" />
                   <span className="text-[8px] font-black text-[#52ffac] uppercase tracking-widest">{tech.companyName}</span>
                </div>
              )}
              <h3 className="text-2xl font-black text-white uppercase tracking-tighter leading-tight italic">{tech.name}</h3>
              <div className="flex flex-col items-center gap-1">
                <div className="bg-[#1c1d21] px-4 py-1.5 rounded-lg border border-white/5 inline-block">
                  <p className="text-[#c8c4d9] text-[10px] font-black uppercase tracking-[0.2em]">{tech.category.replace('_', ' ')}</p>
                </div>
                {tech.cedula && (
                  <p className="text-[9px] font-black text-[#474556] uppercase tracking-[0.4em] mt-2">Cédula: {tech.cedula}</p>
                )}
              </div>
           </div>

           {/* Detalles de Seguridad */}
           <div className="grid grid-cols-2 gap-4 py-5 border-y border-white/5 bg-white/[0.02] rounded-2xl">
              <div className="text-center space-y-1">
                 <p className="text-[7px] font-black text-[#474556] uppercase tracking-[0.3em]">Status</p>
                 <div className="flex items-center justify-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#52ffac] animate-pulse"></div>
                    <span className="text-[10px] font-black text-white uppercase tracking-tight">Activo</span>
                 </div>
              </div>
              <div className="text-center space-y-1 border-l border-white/5">
                 <p className="text-[7px] font-black text-[#474556] uppercase tracking-[0.3em]">ID Validación</p>
                 <span className="text-[10px] font-black text-[#5d3cfe] uppercase tracking-tight">{validationCode}</span>
              </div>
           </div>

           {/* QR Code dinámico */}
           <div className="space-y-4 pt-2">
              <div className="bg-white p-3 rounded-2xl inline-block shadow-[0_20px_50px_rgba(93,60,254,0.2)] group-hover:rotate-1 transition-transform">
                 <img src={qrUrl} alt="QR de Validación" className="w-24 h-24" />
              </div>
              <p className="text-[9px] text-[#474556] font-black uppercase tracking-[0.2em] leading-relaxed px-6">
                "{(tech.bio || "Especialista certificado MantechPro.").substring(0, 45)}..."
              </p>
           </div>
        </div>

        {/* Footer de marca técnica */}
        <div className="px-8 py-4 bg-[#1c1d21] border-t border-white/5 flex justify-between items-center">
           <div className="flex items-center gap-2 text-[#c8c4d9]">
              <MapPin className="w-3 h-3 text-[#5d3cfe]" />
              <span className="text-[9px] font-black uppercase tracking-widest">{(tech.location || 'Panamá').split(',')[0]}</span>
           </div>
           <div className="text-[8px] font-black text-white/20 uppercase tracking-[0.4em]">Protocolo V4</div>
        </div>
      </div>

      {/* Marca de Acreditación */}
      <div className="mt-6 flex flex-col items-center gap-3 opacity-30 group-hover:opacity-60 transition-opacity">
         <div className="h-px bg-white/10 w-24"></div>
         <p className="text-[8px] font-black text-white uppercase tracking-[0.4em]">MantechPro Security Core</p>
      </div>
    </div>
  );
}
