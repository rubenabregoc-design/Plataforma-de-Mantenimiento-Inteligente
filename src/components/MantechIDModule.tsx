import React from 'react';
import { MantechID } from '../types';
import { ShieldCheck, UserCheck, AlertCircle, Upload, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface MantechIDModuleProps {
  mantechId?: MantechID;
  onUpload: (type: 'id' | 'record') => void;
}

export default function MantechIDModule({ mantechId, onUpload, role = 'tech' }: MantechIDModuleProps & { role?: 'client' | 'tech' }) {
  const status = mantechId?.status || 'unverified';
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [currentType, setCurrentType] = React.useState<'id' | 'record' | null>(null);

  const handleButtonClick = (type: 'id' | 'record') => {
    setCurrentType(type);
    if (fileInputRef.current) {
      // Configurar aceptación según tipo
      fileInputRef.current.accept = type === 'id' ? 'image/*' : 'application/pdf,image/*';
      fileInputRef.current.click();
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && currentType) {
      onUpload(currentType, file);
      // Reset input para permitir subir el mismo archivo si se desea
      e.target.value = '';
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden">
      {/* Input oculto compatible con PC y Android */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={onFileChange}
      />

      <div className="p-6 bg-gradient-to-tr from-zinc-900 to-indigo-950 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${status === 'verified' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-black uppercase tracking-widest text-sm">Mantech ID <span className="text-indigo-400">Verificado</span></h3>
            <p className="text-[10px] text-zinc-300 font-medium">Seguridad y Confianza para el Mercado Panameño</p>
          </div>
        </div>
        {status === 'verified' && (
          <div className="px-3 py-1 bg-emerald-500 rounded-full text-[9px] font-black uppercase flex items-center gap-1 shadow-lg shadow-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" />
            Verificado
          </div>
        )}
      </div>

      <div className="p-6 space-y-6">
        {status === 'unverified' && (
          <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex gap-4">
            <ShieldCheck className="w-6 h-6 text-indigo-600 shrink-0" />
            <div className="space-y-1">
              <p className="text-xs font-black text-indigo-900 uppercase tracking-tight">Sello de Seguridad Opcional</p>
              <p className="text-[11px] text-indigo-800 font-medium leading-relaxed">
                {role === 'client'
                  ? "Obtén mayor prioridad y confianza con los técnicos validando tu identidad. Este paso es opcional y no limita tus funciones actuales."
                  : "Aumenta tu visibilidad y accede a contratos corporativos validando tu perfil profesional. El sello es un distintivo de confianza para tus clientes."}
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 border-2 border-dashed border-zinc-200 rounded-3xl hover:border-indigo-400 transition-all group cursor-pointer text-center space-y-3">
            <div className="w-12 h-12 bg-zinc-50 rounded-full mx-auto flex items-center justify-center text-zinc-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-black text-zinc-900 uppercase">Cédula de Identidad</p>
              <p className="text-[10px] text-zinc-500 font-medium">JPG o PNG (Frente y reverso)</p>
            </div>
            <button
              type="button"
              onClick={() => handleButtonClick('id')}
              className="px-4 py-1.5 bg-zinc-100 group-hover:bg-indigo-600 group-hover:text-white rounded-xl text-[10px] font-black uppercase transition-all"
            >
              {mantechId?.documentUrl ? 'Documento Subido' : 'Seleccionar Archivo'}
            </button>
          </div>

          {role === 'tech' && (
            <div className="p-5 border-2 border-dashed border-zinc-200 rounded-3xl hover:border-indigo-400 transition-all group cursor-pointer text-center space-y-3">
              <div className="w-12 h-12 bg-zinc-50 rounded-full mx-auto flex items-center justify-center text-zinc-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-black text-zinc-900 uppercase">Validación MantechPro</p>
                <p className="text-[10px] text-zinc-500 font-medium">Historial de Confianza Interno</p>
              </div>
              <div className="space-y-2">
                 <button
                   type="button"
                   onClick={() => handleButtonClick('record')}
                   className="w-full px-4 py-1.5 bg-zinc-100 group-hover:bg-indigo-600 group-hover:text-white rounded-xl text-[10px] font-black uppercase transition-all"
                 >
                   {mantechId?.policeRecordUrl ? 'Historial Cargado' : 'Subir Referencias'}
                 </button>
                 <p className="text-[9px] text-indigo-600 font-black uppercase tracking-tight">Sello de Validación MantechPro</p>
                 <p className="text-[8px] text-zinc-400 font-medium uppercase tracking-tighter leading-tight">Procesado automáticamente por nuestro sistema de confianza.</p>
              </div>
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-zinc-100 flex items-center justify-between gap-4">
          <p className="text-[10px] text-zinc-400 leading-tight">
            * Tus documentos están protegidos bajo la Ley de Protección de Datos Personales de Panamá. Solo serán revisados por auditores autorizados.
          </p>
          <div className="shrink-0 flex gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
            <span className="w-2 h-2 rounded-full bg-zinc-200"></span>
            <span className="w-2 h-2 rounded-full bg-zinc-200"></span>
          </div>
        </div>
      </div>
    </div>
  );
}
