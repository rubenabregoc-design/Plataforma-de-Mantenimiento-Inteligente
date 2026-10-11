import React, { useEffect } from 'react';
import { JobRequest } from '../types';
import { X, CheckCircle2, Package, Download, MapPin, BadgeCheck, FileText, ShieldCheck, Clock, AlertTriangle } from 'lucide-react';


interface ServiceReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: JobRequest;
}

export default function ServiceReportModal({ isOpen, onClose, request }: ServiceReportModalProps) {

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '---';
    try {
      return new Date(dateStr).toLocaleDateString('es-PA', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
    } catch (e) { return '---'; }
  };

  const formatTime = (dateStr?: string) => {
    if (!dateStr) return null;
    try {
      return new Date(dateStr).toLocaleTimeString('es-PA', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (e) { return null; }
  };

  const getTimeDisplay = () => {
    const start = formatTime(request.visitStartedAt);
    const end = formatTime(request.visitFinishedAt);
    if (start && end) return `${start} – ${end}`;
    if (request.scheduledTime) {
      // Si scheduledTime es "HH:MM", formatear a 12h
      if (request.scheduledTime.includes(':')) {
        const [h, m] = request.scheduledTime.split(':');
        const hh = parseInt(h);
        const suffix = hh >= 12 ? 'PM' : 'AM';
        const h12 = hh % 12 || 12;
        return `${h12}:${m} ${suffix}`;
      }
      return request.scheduledTime;
    }
    return 'En Sitio';
  };

  const docDate = formatDate(request.visitFinishedAt || request.scheduledDate || request.createdAt);

  const handlePrint = () => {
    const html = `
      <html>
        <head>
          <style>
            @page { size: A4; margin: 0; }
            *, *::before, *::after { box-sizing: border-box; }
            html, body { font-family: 'Plus Jakarta Sans', -apple-system, sans-serif; color: #000000 !important; background-color: #ffffff !important; margin: 0; padding: 0; width: 100%; }
            .wrap { padding: 30px 40px; border-top: 10px solid #0d0e12; background: #ffffff; color: #000000; }
            .hdr { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #000000; padding-bottom: 16px; margin-bottom: 22px; }
            .logo-box { display: flex; align-items: center; gap: 14px; }
            .grid6 { display: grid; grid-template-cols: repeat(3, 1fr); gap: 12px; margin-bottom: 24px; }
            .card { padding: 12px; border-radius: 10px; border: 1.5px solid #000000; background: #f8fafc; }
            .lbl { font-size: 9px; font-weight: 900; text-transform: uppercase; color: #000000 !important; margin-bottom: 4px; }
            .val { font-size: 13px; font-weight: 900; text-transform: uppercase; color: #000000 !important; }
            .sec-title { font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; color: #5d3cfe !important; border-bottom: 2px solid #000000; padding-bottom: 6px; margin-bottom: 12px; margin-top: 20px; }
            .desc-box { background: #f8fafc; padding: 16px; border-radius: 12px; border: 1.5px solid #000000; border-left: 5px solid #5d3cfe; font-size: 12px; font-weight: 700; color: #000000 !important; }
            table { width: 100%; border-collapse: collapse; margin-top: 8px; }
            td { padding: 8px 4px; border-bottom: 1px solid #d1d5db; font-size: 11px; font-weight: 800; color: #000000 !important; text-transform: uppercase; }
            .ftr { margin-top: 32px; padding-top: 16px; border-top: 2px solid #000000; display: flex; justify-content: space-between; font-size: 10px; font-weight: 900; color: #000000 !important; text-transform: uppercase; }
          </style>
        </head>
        <body>
          <div class="wrap">
            <div class="hdr">
              <div class="logo-box">
                <svg viewBox="0 0 100 100" style="width: 44px; height: 44px;">
                  <rect width="100" height="100" rx="20" fill="#121317"/>
                  <path d="M20 75V35L50 60L80 35V75" stroke="#5d3cfe" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
                  <circle cx="50" cy="20" r="6" fill="#52ffac"/>
                </svg>
                <div>
                  <div style="font-size: 26px; font-weight: 900; color: #000000 !important; letter-spacing: -1px;">Mantech<span style="color: #5d3cfe !important;">Pro</span></div>
                  <div style="font-size: 9px; font-weight: 900; text-transform: uppercase; letter-spacing: 3px; color: #000000 !important;">Ingeniería Operativa Panamá</div>
                </div>
              </div>
              <div style="text-align: right; color: #000000 !important;">
                <div style="font-size: 9px; font-weight: 900; text-transform: uppercase; color: #000000 !important;">Número de Reporte</div>
                <div style="font-size: 20px; font-weight: 900; color: #000000 !important;">#${request.id.substring(0,8).toUpperCase()}</div>
                <div style="font-size: 11px; font-weight: 800; color: #000000 !important; margin-top: 4px;">${docDate}</div>
              </div>
            </div>

            <div class="grid6">
              <div class="card"><div class="lbl">Activo</div><div class="val">${request.assetName || '---'}</div></div>
              <div class="card"><div class="lbl">Especialista</div><div class="val">${request.techName || '---'}</div></div>
              <div class="card"><div class="lbl">Empresa</div><div class="val">${request.techCompanyName || 'MantechPro Independent'}</div></div>
              <div class="card"><div class="lbl">Modalidad</div><div class="val">${request.serviceType === 'remote' ? 'REMOTO' : 'PRESENCIAL'}</div></div>
              <div class="card"><div class="lbl">Tiempo</div><div class="val">${getTimeDisplay()}</div></div>
              <div class="card" style="border-color: #5d3cfe;"><div class="lbl">Inversión Total</div><div class="val">$${Number(request.price || 0).toFixed(2)}</div></div>
            </div>

            <div class="sec-title">Descripción de Intervención</div>
            <div class="desc-box">"${request.description}"</div>

            <div class="sec-title">Tareas Realizadas</div>
            <table>
              <tbody>
                ${(request.checklist || []).slice(0, 8).map((task) => `
                  <tr>
                    <td>${task.description}</td>
                    <td style="text-align: right; color: #047857 !important;">CERTIFICADO</td>
                  </tr>
                `).join('') || '<tr><td>Inspección y protocolo técnico general completado</td><td style="text-align: right; color: #047857 !important;">CERTIFICADO</td></tr>'}
              </tbody>
            </table>

            <div style="display: grid; grid-template-cols: 1fr 1fr; gap: 24px; margin-top: 30px; padding-top: 20px; border-top: 2px solid #000000;">
              <div>
                <div class="lbl">Especialista Responsable</div>
                <div class="val">${request.techName || 'Técnico Certificado'}</div>
                <div style="font-size: 9px; font-weight: 800; color: #000000 !important; margin-top: 2px;">${request.techCompanyName || 'Técnico Certificado MantechPro'}</div>
              </div>
              <div>
                <div class="lbl">Validación Cliente</div>
                <div class="val">${request.clientName || 'Cliente Verificado'}</div>
                <div style="font-size: 9px; font-weight: 800; color: #047857 !important; margin-top: 2px;">FIRMA DIGITAL AUDITADA MDM-V4</div>
              </div>
            </div>

            <div class="ftr">
              <span>MantechPro Industries Panama S.A.</span>
              <span>ORIGINAL - COPIA FIEL</span>
            </div>
          </div>
        </body>
      </html>
    `;
    import('../utils/pdfExport').then(({ downloadHtmlAsPdf }) => {
      downloadHtmlAsPdf(html, `Certificado_Servicio_${request.id.substring(0, 8).toUpperCase()}.pdf`);
    });
  };

  return (
    <div className="fixed inset-0 z-[999] bg-[#0d0e12]/98 backdrop-blur-2xl flex flex-col items-center overflow-y-auto pt-10 pb-32 px-4">

      {/* ACCIONES SUPERIORES (NO PRINT) */}
      <div className="w-full max-w-[8.5in] flex justify-between items-center mb-8 no-print">
        <div className="flex items-center gap-4 text-white">
           <div className="w-12 h-12 bg-[#5d3cfe] rounded-2xl flex items-center justify-center shadow-xl">
              <FileText className="w-6 h-6 text-white" />
           </div>
           <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-[#5d3cfe]">Documento Técnico</p>
              <h2 className="text-sm font-black uppercase tracking-tight">Certificado Oficial</h2>
           </div>
        </div>
        <div className="flex gap-4">
           <button
             onClick={handlePrint}
             className="px-6 sm:px-8 py-3.5 sm:py-4 bg-[#52ffac] text-[#0d0e12] rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl hover:scale-105 transition-all flex items-center gap-3 border-none cursor-pointer"
           >
             <Download className="w-4 h-4" /> Guardar PDF Oficial
           </button>
           <button onClick={onClose} className="p-4 bg-white/5 text-white/40 hover:text-white rounded-2xl transition-all border-none cursor-pointer">
             <X className="w-6 h-6" />
           </button>
        </div>
      </div>

      {/* DOCUMENTO MAESTRO (RIGID LETTER) */}
      <article
        id="printable-report"
        className="w-full max-w-[8.5in] bg-white text-black shadow-2xl flex flex-col border-t-[12px] border-[#0d0e12] p-[0.4in] shrink-0"
        style={{ minHeight: '11in', boxSizing: 'border-box' }}
      >

        {/* HEADER CORPORATIVO */}
        <header className="flex justify-between items-start border-b-2 border-black pb-4 mb-6">
          <div className="flex items-center gap-4">
             <div className="w-14 h-14 bg-[#0d0e12] rounded-2xl flex items-center justify-center p-2.5 shadow-xl">
                <img src="/logo.svg" alt="Logo" className="w-full h-full object-contain" />
             </div>
             <div>
                <h1 className="text-2xl font-black tracking-tighter leading-tight uppercase text-black">
                   Mantech<span className="text-[#5d3cfe]">Pro</span>
                </h1>
                <p className="text-[9px] font-black uppercase tracking-[0.4em] text-black mt-0.5">
                   Ingeniería Operativa Panamá
                </p>
             </div>
          </div>

          <div className="text-right">
             <h3 className="text-[9px] font-black uppercase tracking-widest text-black mb-0.5">Número de Reporte</h3>
             <p className="font-black text-xl text-black leading-none tracking-tighter uppercase">
                #${request.id.substring(0,8).toUpperCase()}
             </p>
             {request.cufe && (
               <p className="text-[7px] font-black text-[#5d3cfe] mt-1 uppercase tracking-tighter">
                 CUFE: {request.cufe}
               </p>
             )}
             <p className="text-[10px] font-black text-black mt-2 uppercase tracking-widest">{docDate}</p>
          </div>
        </header>

        {/* RESUMEN EJECUTIVO */}
        <div className="grid grid-cols-6 gap-2 mb-8">
          {[
            { label: 'Activo', value: request.assetName || '---' },
            { label: 'Especialista', value: request.techName || '---' },
            { label: 'Empresa', value: request.techCompanyName || 'MantechPro Independent' },
            { label: 'Modalidad', value: request.serviceType === 'remote' ? `REMOTO` : 'PRESENCIAL' },
            { label: 'Tiempo', value: getTimeDisplay() },
            { label: 'Inversión Total', value: `$${Number(request.price || 0).toFixed(2)}`, highlight: true },
          ].map((item, i) => (
            <div key={i} className={`p-2 rounded-xl border ${item.highlight ? 'border-[#5d3cfe] bg-indigo-50/20' : 'border-zinc-100 bg-zinc-50/50'}`}>
              <h3 className="text-[6px] font-black uppercase text-zinc-400 mb-1">{item.label}</h3>
              <p className="text-[8px] font-black text-zinc-900 uppercase leading-tight truncate">{item.value}</p>
              {item.highlight && request.itbmsAmount && (
                <p className="text-[5px] text-zinc-400 font-bold uppercase mt-0.5">Incluye ITBMS (7%)</p>
              )}
            </div>
          ))}
        </div>

        {/* CONTENIDO TÉCNICO */}
        <div className="flex-1 space-y-6">

          <section>
             <div className="flex items-center gap-2 border-b-2 border-zinc-100 pb-2 mb-3">
                <FileText className="w-4 h-4 text-[#5d3cfe]" />
                <h2 className="text-[11px] font-black uppercase tracking-widest text-zinc-800">Descripción de Intervención</h2>
             </div>
             <div className="bg-zinc-50 p-6 rounded-2xl border border-zinc-100 shadow-inner relative">
                <div className="absolute top-0 left-0 w-1 h-full bg-[#5d3cfe]"></div>
                <p className="text-[12px] leading-relaxed italic text-zinc-700 font-medium">
                   "{request.description}"
                </p>
             </div>
          </section>

          {/* EVIDENCIA INALTERABLE (Proof of Work) */}
          <section className="grid grid-cols-2 gap-8">
             <div className="space-y-4">
                <div className="flex items-center gap-2 border-b-2 border-zinc-100 pb-2">
                   <ShieldCheck className="w-4 h-4 text-[#52ffac]" />
                   <h2 className="text-[11px] font-black uppercase tracking-widest text-zinc-800">Evidencia de Trabajo</h2>
                </div>
                {request.proofOfWork ? (
                   <div className="grid grid-cols-2 gap-2">
                      <img src={request.proofOfWork.oldPartPhoto} className="aspect-video rounded-lg object-cover grayscale border border-zinc-100" />
                      <img src={request.proofOfWork.newPartPhoto} className="aspect-video rounded-lg object-cover border border-zinc-100" />
                   </div>
                ) : <p className="text-[9px] text-zinc-400 italic">No se adjuntó evidencia fotográfica.</p>}
             </div>

             <div className="space-y-4">
                <div className="flex items-center gap-2 border-b-2 border-zinc-100 pb-2">
                   <AlertTriangle className="w-4 h-4 text-amber-500" />
                   <h2 className="text-[11px] font-black uppercase tracking-widest text-zinc-800">Alertas e Imprevistos</h2>
                </div>
                <div className="bg-zinc-50 p-3 rounded-xl space-y-2">
                   {request.status === 'disputed' && <p className="text-[8px] text-rose-600 font-bold uppercase tracking-tight">• INCIDENCIA REPORTADA EN SITIO</p>}
                   {request.priceAdjustment && <p className="text-[8px] text-zinc-600 font-medium leading-tight">AJUSTE: B/. ${request.priceAdjustment.newPrice} (${request.priceAdjustment.reason})</p>}
                   <p className="text-[8px] text-zinc-500 uppercase font-black">Auditado por Protocolo MDM-V4</p>
                </div>
             </div>
          </section>

          <section>
             <div className="flex items-center gap-2 border-b-2 border-zinc-100 pb-2 mb-3">
                <CheckCircle2 className="w-4 h-4 text-[#5d3cfe]" />
                <h2 className="text-[11px] font-black uppercase tracking-widest text-zinc-800">Tareas Realizadas</h2>
             </div>
             <table className="w-full text-left">
                <tbody>
                  {request.checklist?.slice(0, 6).map((task) => (
                    <tr key={task.id} className="border-b border-zinc-50">
                      <td className="py-2 text-[10px] font-bold text-zinc-800 uppercase">{task.description}</td>
                      <td className="py-2 text-right">
                        <span className="px-2 py-0.5 rounded-full font-black uppercase text-[7px] bg-emerald-100 text-emerald-600">CERTIFICADO</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
             </table>
          </section>
        </div>

        {/* ÁREA DE FIRMAS Y CIERRE */}
        <div className="mt-6 pt-6 border-t-2 border-zinc-100">
           <div className="grid grid-cols-2 gap-8">
              <div className="space-y-2">
                 <h3 className="text-[8px] font-black text-zinc-400 uppercase tracking-[0.3em] border-b border-zinc-100 pb-1">Especialista</h3>
                 <p className="text-xs font-black uppercase tracking-tight">{request.techName}</p>
                 <p className="text-[7px] text-zinc-400 font-bold uppercase tracking-widest">{request.techCompanyName || 'Técnico Certificado MantechPro'}</p>
              </div>

              <div className="space-y-2 text-center relative">
                 <h3 className="text-[8px] font-black text-zinc-400 uppercase tracking-[0.3em] border-b border-zinc-100 pb-1">Validación Cliente</h3>
                 <div className="h-12 flex items-center justify-center bg-zinc-50 rounded-xl relative border border-dashed border-zinc-200 overflow-hidden mx-auto max-w-[150px]">
                    {request.clientSignature && <img src={request.clientSignature} className="max-h-8 object-contain" alt="Firma" />}
                 </div>
                 <p className="text-[9px] font-black uppercase tracking-tighter text-zinc-900">{request.clientName}</p>

                 {/* SELLO PROFESIONAL EN REPORTE */}
                 <div className="absolute -top-12 -right-4 w-24 h-24 pointer-events-none opacity-80">
                    <div className="w-full h-full border-4 double border-[#52ffac] rounded-full flex flex-col items-center justify-center rotate-[-15deg] bg-white/50 backdrop-blur-sm">
                       <span className="text-[8px] font-black text-[#52ffac] uppercase leading-none">VERIFICADO</span>
                       <span className="text-[5px] font-bold text-[#52ffac] uppercase mt-1">MANTECHPRO</span>
                       <div className="w-8 h-0.5 bg-[#52ffac] my-1"></div>
                       <span className="text-[4px] font-black text-[#52ffac]">${new Date().getTime().toString(16).toUpperCase()}</span>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* PIE DE PÁGINA CORPORATIVO */}
        <footer className="mt-auto pt-4 flex justify-between items-center text-zinc-400 border-t-2 border-zinc-100">
          <div className="flex items-center gap-3">
             <MapPin className="w-3 h-3 text-[#5d3cfe]" />
             <p className="text-[8px] font-black uppercase tracking-[0.2em] text-zinc-900">MantechPro Industries Panama S.A.</p>
          </div>
          <div className="text-right">
             <p className="text-[8px] font-black uppercase tracking-widest text-zinc-800">ORIGINAL - COPIA FIEL</p>
          </div>
        </footer>
      </article>
    </div>
  );
}
