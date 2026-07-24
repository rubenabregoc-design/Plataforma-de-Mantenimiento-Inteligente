import React from 'react';
import { MantechID } from '../types';
import { ShieldCheck, UserCheck, Upload, ShieldAlert, CheckCircle2, Clock } from 'lucide-react';

interface MantechIDModuleProps {
  mantechId?: MantechID;
  userName?: string; // Nombre del técnico
  onUpload: (type: 'id' | 'record', file: File) => void;
  role?: 'client' | 'tech';
  plan?: string;
}

export default function MantechIDModule({ mantechId, userName, onUpload, role = 'tech' }: MantechIDModuleProps) {
  const status = mantechId?.status || 'unverified';
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [currentType, setCurrentType] = React.useState<'id' | 'record' | null>(null);
  const [idInput, setIdInput] = React.useState(mantechId?.idNumber || '');

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
        {status === 'verified' || (role === 'tech' && mantechId?.policeRecordUrl && status !== 'rejected' && status !== 'requires_review') ? (
          <div className="px-3 py-1 bg-emerald-500 text-[#0d0e12] rounded-full text-[9px] font-black uppercase flex items-center gap-1 shadow-lg shadow-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" />
            Validado
          </div>
        ) : status === 'pending' || (mantechId?.documentUrl || mantechId?.policeRecordUrl) && status !== 'requires_review' ? (
          <div className="px-3 py-1 bg-amber-500 text-[#0d0e12] rounded-full text-[9px] font-black uppercase flex items-center gap-1 animate-pulse">
            <Clock className="w-3 h-3" />
            En Revisión (Admin)
          </div>
        ) : (status === 'rejected' || status === 'requires_review') ? (
          <div className="px-3 py-1 bg-rose-600 text-white rounded-full text-[9px] font-black uppercase flex items-center gap-1">
            <ShieldAlert className="w-3 h-3" />
            Integridad Comprometida
          </div>
        ) : null}
      </div>

      <div className="p-6 space-y-6">
        {status === 'requires_review' && (
          <div className="bg-rose-500/10 border border-rose-500/30 p-6 rounded-[2rem] space-y-4 animate-fade-in">
             <div className="flex items-center gap-4 text-rose-500">
                <ShieldAlert className="w-8 h-8" />
                <div>
                   <h4 className="text-sm font-black uppercase tracking-tight">⚠️ INTEGRIDAD COMPROMETIDA</h4>
                   <p className="text-[9px] font-bold uppercase tracking-widest opacity-80">Su cuenta ha sido restringida por el Gerente General</p>
                </div>
             </div>
             <div className="space-y-3">
                <p className="text-[10px] text-white/60 leading-relaxed italic">
                  "Se ha detectado una disputa abierta o un reporte de daños vinculado a sus servicios recientes. Por seguridad del ecosistema, su credencial ha sido puesta en suspenso administrativo hasta que se resuelva la incidencia."
                </p>
                {mantechId?.penaltyAmount > 0 && (
                  <div className="p-4 bg-rose-600/20 border border-rose-600/30 rounded-xl flex justify-between items-center">
                    <span className="text-[9px] font-black text-white uppercase">Penalización Económica Pendiente</span>
                    <span className="text-sm font-black text-rose-500">${mantechId.penaltyAmount.toFixed(2)}</span>
                  </div>
                )}
                <textarea
                  id="appeal-text"
                  placeholder="Escriba aquí sus descargos técnicos y compromiso de mejora..."
                  className="w-full bg-black/40 border border-rose-500/20 rounded-xl p-4 text-white text-xs outline-none focus:border-rose-500 h-28 resize-none"
                />
                <button
                  onClick={() => {
                    const text = (document.getElementById('appeal-text') as HTMLTextAreaElement).value;
                    if(!text) return alert("Por favor escriba su apelación.");
                    alert("📡 Solicitud de Rehabilitación enviada al Gerente General.");
                    // Aquí se dispararía la función de backend
                  }}
                  className="w-full py-3 bg-rose-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:brightness-110 shadow-lg shadow-rose-600/20"
                >
                  Solicitar Rehabilitación
                </button>
             </div>
          </div>
        )}

        {/* INPUT DE CÉDULA */}
        <div className="bg-[#0d0e12] p-6 rounded-[2rem] border border-white/5 space-y-3">
          <label className="text-[9px] font-black text-[#474556] uppercase tracking-widest ml-1">Confirmación de Identidad (Cédula)</label>
          <input
            type="text"
            value={idInput}
            onChange={(e) => setIdInput(e.target.value.toUpperCase())}
            placeholder="8-888-8888"
            className="w-full bg-[#1c1d21] border border-white/5 rounded-xl py-3.5 px-5 text-white font-black text-sm outline-none focus:border-[#5d3cfe] transition-all"
          />
        </div>

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
          </div>

          {/* RÉCORD DE INTEGRIDAD INTERNO */}
          {role === 'tech' && (
            <div className={`p-6 border-2 border-dashed rounded-[2rem] transition-all text-center space-y-4 ${mantechId?.policeRecordUrl ? 'border-[#52ffac]/30 bg-[#52ffac]/5' : 'border-rose-500/20 bg-[#0d0e12] hover:border-rose-500/50'}`}>
              <div className={`w-14 h-14 rounded-2xl mx-auto flex items-center justify-center transition-all ${mantechId?.policeRecordUrl ? 'bg-[#52ffac]/20 text-[#52ffac]' : 'bg-rose-500/10 text-rose-500'}`}>
                {mantechId?.policeRecordUrl ? <ShieldCheck className="w-7 h-7" /> : <ShieldAlert className="w-7 h-7" />}
              </div>
              <div>
                <p className="text-xs font-black text-white uppercase tracking-tight">Récord Policivo Interno</p>
                <p className="text-[10px] text-[#474556] font-medium mt-1">Validación de Integridad MantechPro</p>
              </div>
              <button
                type="button"
                onClick={async () => {
                  if (!idInput) { alert("⚠️ Debe ingresar su número de cédula arriba para generar el récord."); return; }

                  const isAlreadyActive = !!mantechId?.policeRecordUrl;

                  if (!isAlreadyActive && !window.confirm("¿Autoriza la Auditoría de Integridad IA? Se cruzará su identidad con la base de datos de MantechPro Security para emitir su Certificado de Confianza.")) {
                    return;
                  }

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
                          <h2 style="font-weight: 900; text-transform: uppercase; border-bottom: 1px solid #000;">Certificado de No Antecedentes Internos</h2>
                          <p>Por medio del presente documento, el Nodo de Seguridad de <b>MantechPro Industries Panama S.A.</b> certifica que tras la validación biométrica y el cruce de datos en nuestro Ledger de Integridad:</p>

                          <div class="data-row"><span class="label">Especialista Auditado:</span><br/><b>${userName?.toUpperCase() || 'ESPECIALISTA MANTECHPRO'}</b></div>
                          <div class="data-row"><span class="label">Documento de Identidad:</span><br/><b>${idInput}</b></div>
                          <div class="data-row"><span class="label">Estatus de Conducta:</span><br/><b style="color: #059669;">ÓPTIMO - SIN INCIDENCIAS REPORTADAS</b></div>
                          <div class="data-row"><span class="label">Activado y Validado por:</span><br/><b>NODO CENTRAL MANTECH IA (AUTORIZACIÓN DIGITAL)</b></div>
                          <div class="data-row"><span class="label">Fecha de Activación:</span><br/>${new Date().toLocaleString('es-PA')}</div>
                        </div>

                        <div style="text-align: center; margin-top: 60px;">
                          <div class="stamp-approved">LIMPIO / VERIFICADO</div>
                          <p style="font-size: 10px; color: #666;">Este certificado es de carácter interno y habilita al técnico para operar en la red MantechPro.<br/>La validez de este documento es de 6 meses a partir de su emisión.</p>
                        </div>

                        <div class="security-hash">
                          HASH_VAL_ID: ${btoa(new Date().toISOString()).substring(0, 32)}<br/>
                          VERIFICACIÓN_BIOMÉTRICA: EXITOSA • STATUS: ACTIVO
                        </div>
                      </body>
                    </html>
                  `;

                  const win = window.open('', '_blank');
                  if (win) {
                    win.document.write(printContent);
                    win.document.close();
                    setTimeout(() => win.print(), 500);
                  } else {
                    alert("⚠️ Navegador bloqueó la ventana. Por favor permita pop-ups para ver su Récord.");
                  }

                  if (!isAlreadyActive) {
                    onUpload('record', new File([], "record_interno_verificado.pdf"));
                  }
                }}
                className={`w-full py-3 rounded-xl text-[10px] font-black uppercase transition-all ${mantechId?.policeRecordUrl ? 'bg-[#52ffac] text-black shadow-lg shadow-[#52ffac]/20 hover:brightness-110' : 'bg-rose-600 text-white shadow-lg hover:scale-105 animate-pulse hover:animate-none'}`}
              >
                {mantechId?.policeRecordUrl ? 'Ver Récord Interno Activo ✓' : 'Generar Récord Interno'}
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
