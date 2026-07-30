import React, { useState, useRef } from 'react';
import { MantechID } from '../types';
import { ShieldCheck, UserCheck, ShieldAlert, CheckCircle2, Clock } from 'lucide-react';
import ConfirmationModal from './ConfirmationModal';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

interface MantechIDModuleProps {
  mantechId?: MantechID;
  userName?: string; // Nombre del técnico
  cedula?: string;   // Cédula inmutable del perfil
  onUpload: (type: 'id' | 'record', file: File) => void;
  role?: 'client' | 'tech';
  plan?: string;
}

export default function MantechIDModule({ mantechId, userName, cedula, onUpload, role = 'tech' }: MantechIDModuleProps) {
  const { t } = useTranslation();
  const status = mantechId?.status || 'unverified';
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentType, setCurrentType] = useState<'id' | 'record' | null>(null);
  const [isIntegrityModalOpen, setIsIntegrityModalOpen] = useState(false);

  const handleButtonClick = (type: 'id' | 'record') => {
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

  const handleGenerateCertificate = () => {
    const printContent = `
      <html>
        <head>
          <title>Certificado de Integridad Interno - MantechPro</title>
          <style>
            body { font-family: sans-serif; padding: 50px; color: #1a1a1a; line-height: 1.5; background: white; }
            .header { display: flex; justify-content: space-between; border-bottom: 3px solid #000; padding-bottom: 20px; }
            .stamp-approved { border: 4px solid #059669; color: #059669; padding: 15px; font-weight: 900; text-transform: uppercase; transform: rotate(-15deg); display: inline-block; margin: 20px; border-radius: 10px; font-size: 24px; }
            .security-hash { font-family: monospace; font-size: 10px; color: #888; margin-top: 50px; word-break: break-all; }
            .data-row { margin: 10px 0; border-bottom: 1px solid #eee; padding-bottom: 5px; }
            .label { font-weight: 900; font-size: 10px; text-transform: uppercase; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1 style="margin:0; font-size: 28px; font-weight: 900;">MANTECH<span style="color:#5d3cfe">PRO</span></h1>
              <p style="margin:0; font-size: 10px; font-weight: 700; letter-spacing: 2px;">AUDITORÍA DE INTEGRIDAD INTERNA V4</p>
            </div>
            <div style="text-align: right">
              <p style="margin:0; font-weight: 900;">EXP: ${Math.floor(Math.random()*999999)}</p>
              <p style="margin:0; font-size: 10px;">PANAMÁ, ${new Date().toLocaleDateString('es-PA')}</p>
            </div>
          </div>

          <div style="margin-top: 40px;">
            <h2 style="font-weight: 900; text-transform: uppercase; border-bottom: 1px solid #000;">Certificado de Confianza Técnica</h2>
            <p>Por medio del presente documento, el Nodo de Seguridad de <b>MantechPro Industries Panama S.A.</b> certifica que tras la verificación documental y el cruce de datos en nuestro Ledger de Integridad:</p>

            <div class="data-row"><span class="label">Especialista Auditado:</span><br/><b>${userName?.toUpperCase() || 'ESPECIALISTA MANTECHPRO'}</b></div>
            <div class="data-row"><span class="label">Documento de Identidad:</span><br/><b>${cedula || 'NO REGISTRADA'}</b></div>
            <div class="data-row"><span class="label">Estatus de Conducta:</span><br/><b style="color: #059669;">ÓPTIMO - NIVEL DE CONFIANZA ALTO</b></div>
            <div class="data-row"><span class="label">Validado por:</span><br/><b>NODO CENTRAL MANTECH (AUTORIZACIÓN DIGITAL)</b></div>
            <div class="data-row"><span class="label">Fecha de Activación:</span><br/>${new Date().toLocaleString('es-PA')}</div>
          </div>

          <div style="text-align: center; margin-top: 60px;">
            <div class="stamp-approved">VERIFICACIÓN COMPLETA</div>
          </div>

          <div class="security-hash">
            HASH_VAL_ID: ${btoa(new Date().toISOString()).substring(0, 32)}<br/>
            VALIDACIÓN_BLOCKCHAIN: EXITOSA • STATUS: ACTIVO
          </div>
        </body>
      </html>
    `;

    const win = window.open('', '_blank');
    if (win) {
      win.document.write(printContent);
      win.document.close();
      setTimeout(() => win.print(), 500);
      toast.success("Certificado de Confianza emitido y registrado.");
    } else {
      toast.error("El navegador bloqueó la ventana emergente.");
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
            <h3 className="font-black uppercase tracking-widest text-sm text-white">{t('mantech_id_title')}</h3>
            <p className="text-[10px] text-zinc-400 font-medium">{t('mantech_id_desc')}</p>
          </div>
        </div>
        {status === 'verified' || (role === 'tech' && mantechId?.policeRecordUrl) ? (
          <div className="px-3 py-1 bg-emerald-500 text-[#0d0e12] rounded-full text-[9px] font-black uppercase flex items-center gap-1 shadow-lg shadow-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" />
            {t('identity_verified')}
          </div>
        ) : (
          <div className="px-3 py-1 bg-amber-500 text-[#0d0e12] rounded-full text-[9px] font-black uppercase flex items-center gap-1 animate-pulse">
            <Clock className="w-3 h-3" />
            {t('identity_pending')}
          </div>
        )}
      </div>

      <div className="p-6 space-y-6">
        <div className="bg-[#0d0e12] p-6 rounded-[2rem] border border-white/5 flex items-center justify-between group">
          <div>
            <label className="text-[9px] font-black text-[#474556] uppercase tracking-widest ml-1">{t('identity_registered')}</label>
            <p className="text-xl font-black text-white ml-1 mt-1 tracking-tighter italic">{cedula || '---'}</p>
          </div>
          <div className="p-3 bg-white/5 rounded-2xl">
             <ShieldCheck className="w-6 h-6 text-[#52ffac] opacity-40 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className={`p-6 border-2 border-dashed rounded-[2rem] transition-all text-center space-y-4 ${mantechId?.documentUrl ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-white/5 bg-[#0d0e12] hover:border-[#5d3cfe]/50'}`}>
            <div className={`w-14 h-14 rounded-2xl mx-auto flex items-center justify-center transition-all ${mantechId?.documentUrl ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-[#474556]'}`}>
              <UserCheck className="w-7 h-7" />
            </div>
            <div>
              <p className="text-xs font-black text-white uppercase tracking-tight">{t('id_document')}</p>
              <p className="text-[10px] text-[#474556] font-medium mt-1">{t('id_document_desc')}</p>
            </div>
            <button
              type="button"
              disabled={!!mantechId?.documentUrl}
              onClick={() => handleButtonClick('id')}
              className={`w-full py-3 rounded-xl text-[10px] font-black uppercase transition-all ${mantechId?.documentUrl ? 'bg-emerald-500/10 text-emerald-400 cursor-not-allowed' : 'bg-[#5d3cfe] text-white shadow-lg'}`}
            >
              {mantechId?.documentUrl ? t('document_registered') : t('upload_document')}
            </button>
          </div>

          {role === 'tech' && (
            <div className={`p-6 border-2 border-dashed rounded-[2rem] transition-all text-center space-y-4 ${mantechId?.policeRecordUrl ? 'border-[#52ffac]/30 bg-[#52ffac]/5' : 'border-rose-500/20 bg-[#0d0e12] hover:border-rose-500/50'}`}>
              <div className={`w-14 h-14 rounded-2xl mx-auto flex items-center justify-center transition-all ${mantechId?.policeRecordUrl ? 'bg-[#52ffac]/20 text-[#52ffac]' : 'bg-rose-500/10 text-rose-500'}`}>
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div>
                <p className="text-xs font-black text-white uppercase tracking-tight">{t('integrity_record')}</p>
                <p className="text-[10px] text-[#474556] font-medium mt-1">{t('integrity_record_desc')}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!cedula) return toast.error("⚠️ Error: Cédula no localizada.");
                  if (mantechId?.policeRecordUrl) return handleGenerateCertificate(); // Ver de nuevo
                  setIsIntegrityModalOpen(true);
                }}
                className={`w-full py-3 rounded-xl text-[10px] font-black uppercase transition-all ${mantechId?.policeRecordUrl ? 'bg-[#52ffac] text-black shadow-lg shadow-[#52ffac]/20 hover:brightness-110' : 'bg-rose-600 text-white shadow-lg animate-pulse hover:animate-none'}`}
              >
                {mantechId?.policeRecordUrl ? t('view_record_active') : t('generate_audit')}
              </button>
            </div>
          )}
        </div>

        <div className="pt-6 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="space-y-1">
            <p className="text-[10px] text-[#474556] font-black uppercase flex items-center gap-2 justify-center md:justify-start">
               <ShieldCheck className="w-3 h-3 text-[#52ffac]" /> {t('privacy_protocol')}
            </p>
            <p className="text-[9px] text-[#474556] max-w-md">
              {t('privacy_desc')}
            </p>
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={isIntegrityModalOpen}
        onClose={() => setIsIntegrityModalOpen(false)}
        onConfirm={handleGenerateCertificate}
        title="Auditoría de Integridad Oficial"
        message="¿Autoriza la Auditoría de Integridad? Se cruzará su identidad con la base de datos de MantechPro Security para emitir su Certificado de Confianza oficial para PH y Empresas."
        confirmText="Autorizar Auditoría"
      />
    </div>
  );
}
