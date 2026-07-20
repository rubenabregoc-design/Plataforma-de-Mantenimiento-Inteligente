import React from 'react';
import { MantechID } from '../types';
import { ShieldCheck, UserCheck, AlertCircle, Upload, ShieldAlert, CheckCircle2, Star, Clock } from 'lucide-react';

interface MantechIDModuleProps {
  mantechId?: MantechID;
  onUpload: (type: 'id' | 'record', file: File) => void;
  role?: 'client' | 'tech';
  plan?: string;
}

export default function MantechIDModule({ mantechId, onUpload, role = 'tech', plan = 'basic' }: MantechIDModuleProps) {
  const status = mantechId?.status || 'unverified';
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [currentType, setCurrentType] = React.useState<'id' | 'record' | null>(null);

  const handleButtonClick = (type: 'id' | 'record') => {
    // Si ya hay un documento, no permitimos cambiarlo si está pendiente o verificado
    if (type === 'id' && mantechId?.documentUrl) return;
    if (type === 'record' && mantechId?.policeRecordUrl) return;

    setCurrentType(type);
    if (fileInputRef.current) {
      fileInputRef.current.accept = type === 'id' ? 'image/*' : 'application/pdf,image/*';
      fileInputRef.current.click();
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && currentType) {
      onUpload(currentType, file);
      e.target.value = '';
    }
  };

  return (
    <div className="bg-[#121317] rounded-3xl border border-white/5 shadow-2xl overflow-hidden">
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={onFileChange}
      />

      <div className="p-6 bg-gradient-to-tr from-zinc-900 to-indigo-950 text-white flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${status === 'verified' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-black uppercase tracking-widest text-sm text-white">Mantech ID <span className="text-indigo-400">Security</span></h3>
            <p className="text-[10px] text-zinc-400 font-medium">Validación de Identidad Legal para Panamá</p>
          </div>
        </div>
        {status === 'verified' ? (
          <div className="px-3 py-1 bg-emerald-500 text-[#0d0e12] rounded-full text-[9px] font-black uppercase flex items-center gap-1 shadow-lg shadow-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" />
            Validado
          </div>
        ) : (mantechId?.documentUrl || mantechId?.policeRecordUrl) ? (
          <div className="px-3 py-1 bg-amber-500 text-[#0d0e12] rounded-full text-[9px] font-black uppercase flex items-center gap-1 animate-pulse">
            <Clock className="w-3 h-3" />
            Por Validar
          </div>
        ) : null}
      </div>

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* CÉDULA */}
          <div className={`p-6 border-2 border-dashed rounded-[2rem] transition-all text-center space-y-4 ${mantechId?.documentUrl ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-white/5 bg-[#0d0e12] hover:border-[#5d3cfe]/50'}`}>
            <div className={`w-14 h-14 rounded-2xl mx-auto flex items-center justify-center transition-all ${mantechId?.documentUrl ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-[#474556]'}`}>
              {mantechId?.documentUrl ? <CheckCircle2 className="w-7 h-7" /> : <UserCheck className="w-7 h-7" />}
            </div>
            <div>
              <p className="text-xs font-black text-white uppercase tracking-tight">Documento de Identidad</p>
              <p className="text-[10px] text-[#474556] font-medium mt-1">Cédula o Pasaporte vigente</p>
            </div>
            <button
              type="button"
              disabled={!!mantechId?.documentUrl}
              onClick={() => handleButtonClick('id')}
              className={`w-full py-3 rounded-xl text-[10px] font-black uppercase transition-all ${mantechId?.documentUrl ? 'bg-emerald-500/10 text-emerald-400 cursor-not-allowed' : 'bg-[#5d3cfe] text-white shadow-lg'}`}
            >
              {mantechId?.documentUrl ? 'Cédula Registrada' : 'Subir Documento'}
            </button>
            {mantechId?.documentUrl && (
              <p className="text-[9px] text-[#474556] font-black uppercase flex items-center justify-center gap-1">
                <ShieldAlert className="w-3 h-3 text-amber-500" /> Sujeto a validación por auditoría
              </p>
            )}
          </div>

          {/* RÉCORD / REFERENCIAS (Solo para Técnicos) */}
          {role === 'tech' && (
            <div className={`p-6 border-2 border-dashed rounded-[2rem] transition-all text-center space-y-4 ${mantechId?.policeRecordUrl ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-white/5 bg-[#0d0e12] hover:border-[#5d3cfe]/50'}`}>
              <div className={`w-14 h-14 rounded-2xl mx-auto flex items-center justify-center transition-all ${mantechId?.policeRecordUrl ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-[#474556]'}`}>
                {mantechId?.policeRecordUrl ? <ShieldCheck className="w-7 h-7" /> : <ShieldAlert className="w-7 h-7" />}
              </div>
              <div>
                <p className="text-xs font-black text-white uppercase tracking-tight">Récord Policivo</p>
                <p className="text-[10px] text-[#474556] font-medium mt-1">Antecedentes legales (Panamá)</p>
              </div>
              <button
                type="button"
                disabled={!!mantechId?.policeRecordUrl}
                onClick={() => handleButtonClick('record')}
                className={`w-full py-3 rounded-xl text-[10px] font-black uppercase transition-all ${mantechId?.policeRecordUrl ? 'bg-emerald-500/10 text-emerald-400 cursor-not-allowed' : 'bg-[#5d3cfe] text-white shadow-lg'}`}
              >
                {mantechId?.policeRecordUrl ? 'Historial Cargado' : 'Subir Antecedentes'}
              </button>
            </div>
          )}
        </div>

        <div className="pt-6 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="space-y-1">
            <p className="text-[10px] text-[#474556] font-black uppercase flex items-center gap-2 justify-center md:justify-start">
               <ShieldCheck className="w-3 h-3 text-[#52ffac]" /> Protocolo de Privacidad Ley 81
            </p>
            <p className="text-[9px] text-[#474556] max-w-md">
              Sus documentos se almacenan con cifrado militar AES-256 y solo son visibles para auditores certificados de MantechPro.
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-[#1c1d21] border border-white/5 rounded-xl">
             <div className="w-1.5 h-1.5 rounded-full bg-[#52ffac] animate-pulse"></div>
             <span className="text-[8px] font-black text-white/50 uppercase tracking-widest">Nivel de Seguridad: Master Pro</span>
          </div>
        </div>
      </div>
    </div>
  );
}
