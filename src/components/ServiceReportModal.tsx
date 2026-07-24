import React, { useEffect } from 'react';
import { JobRequest } from '../types';
import { X, CheckCircle2, Package, Download, MapPin, BadgeCheck, FileText } from 'lucide-react';

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
    const reportEl = document.getElementById('printable-report');
    if (!reportEl) return;

    const pw = window.open('', '_blank', 'width=900,height=700');
    if (!pw) { window.print(); return; }

    pw.document.write(`<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Certificado #${request.id.substring(0, 8).toUpperCase()} - MantechPro</title>
  <script src="https://cdn.tailwindcss.com"><\/script>
  <style>
    @page { size: letter portrait; margin: 0.4in 0.5in; }
    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    body { margin: 0; padding: 0; background: white; }
    #printable-report { width: 100%; box-shadow: none !important; border-top: 10px solid #0d0e12; border-left: none; border-right: none; border-bottom: none; }
    section, header, footer, table, tr { page-break-inside: avoid; }
    footer { margin-top: auto; padding-top: 1.5rem; border-top: 2px solid #f4f4f5; display: flex; justify-content: space-between; align-items: center; color: #a1a1aa; }
    .shadow-2xl { box-shadow: none !important; }
    .rounded-2xl { border-radius: 0.75rem; }
    .rounded-xl { border-radius: 0.5rem; }
  <\/style>
</head>
<body>
  ${reportEl.outerHTML}
  <script>
    window.addEventListener('load', function() {
      setTimeout(function() { window.print(); window.close(); }, 400);
    });
  <\/script>
</body>
</html>`);
    pw.document.close();
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
             className="px-8 py-4 bg-[#52ffac] text-[#0d0e12] rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl hover:scale-105 transition-all flex items-center gap-3 border-none cursor-pointer"
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
        className="w-full max-w-[8.5in] bg-white text-zinc-900 shadow-2xl flex flex-col border-t-[12px] border-[#0d0e12] p-[0.4in] shrink-0"
        style={{ height: '11in', boxSizing: 'border-box', overflow: 'hidden' }}
      >

        {/* HEADER CORPORATIVO */}
        <header className="flex justify-between items-start border-b-2 border-zinc-100 pb-4 mb-6">
          <div className="flex items-center gap-4">
             <div className="w-14 h-14 bg-[#0d0e12] rounded-2xl flex items-center justify-center p-2.5 shadow-xl">
                <img src="/logo.svg" alt="Logo" className="w-full h-full object-contain" />
             </div>
             <div>
                <h1 className="text-2xl font-black tracking-tighter leading-tight uppercase">
                   Mantech<span className="text-[#5d3cfe]">Pro</span>
                </h1>
                <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-zinc-400 mt-0.5">
                   Ingeniería Operativa Panamá
                </p>
             </div>
          </div>

          <div className="text-right">
             <h3 className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-0.5">Número de Reporte</h3>
             <p className="font-black text-xl text-[#0d0e12] leading-none tracking-tighter uppercase">
                #{request.id.substring(0,8).toUpperCase()}
             </p>
             {request.cufe && (
               <p className="text-[7px] font-black text-[#5d3cfe] mt-1 uppercase tracking-tighter">
                 CUFE: {request.cufe}
               </p>
             )}
             <p className="text-[10px] font-bold text-zinc-500 mt-2 uppercase tracking-widest">{docDate}</p>
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
          {request.proofOfWork && (
            <section>
              <div className="flex items-center gap-2 border-b-2 border-zinc-100 pb-2 mb-3">
                <ShieldCheck className="w-4 h-4 text-[#52ffac]" />
                <h2 className="text-[11px] font-black uppercase tracking-widest text-zinc-800">Evidencia Inalterable</h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="aspect-video rounded-xl overflow-hidden border-2 border-zinc-100 shadow-sm relative">
                    <img src={request.proofOfWork.oldPartPhoto} className="w-full h-full object-cover grayscale" alt="Vieja" />
                    <div className="absolute bottom-1.5 left-1.5 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg">
                      <span className="text-[6px] font-black text-white uppercase tracking-widest">Captured • Old Part</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="aspect-video rounded-xl overflow-hidden border-2 border-zinc-100 shadow-sm relative">
                    <img src={request.proofOfWork.newPartPhoto} className="w-full h-full object-cover" alt="Nueva" />
                    <div className="absolute bottom-1.5 left-1.5 bg-[#52ffac]/90 backdrop-blur-md px-2 py-1 rounded-lg">
                      <span className="text-[6px] font-black text-black uppercase tracking-widest">Verified • New Part</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Marca de Agua de Ubicación */}
              <div className="mt-3 p-3 bg-zinc-50 rounded-xl border border-zinc-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 text-[#5d3cfe]" />
                    <span className="text-[8px] font-bold text-zinc-800">{request.proofOfWork.location.lat.toFixed(4)}, {request.proofOfWork.location.lng.toFixed(4)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 border-l border-zinc-200 pl-4">
                    <Clock className="w-3 h-3 text-[#5d3cfe]" />
                    <span className="text-[8px] font-bold text-zinc-800">{new Date(request.proofOfWork.timestamp).toLocaleString('es-PA')}</span>
                  </div>
                </div>
                <p className="text-[7px] font-black text-zinc-300 uppercase italic">Hash: {request.id.substring(0,8)}</p>
              </div>
            </section>
          )}

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

              <div className="space-y-2 text-center">
                 <h3 className="text-[8px] font-black text-zinc-400 uppercase tracking-[0.3em] border-b border-zinc-100 pb-1">Validación Cliente</h3>
                 <div className="h-12 flex items-center justify-center bg-zinc-50 rounded-xl relative border border-dashed border-zinc-200 overflow-hidden mx-auto max-w-[150px]">
                    {request.clientSignature && <img src={request.clientSignature} className="max-h-8 object-contain" alt="Firma" />}
                 </div>
                 <p className="text-[9px] font-black uppercase tracking-tighter text-zinc-900">{request.clientName}</p>
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
