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
        className="w-full max-w-[8.5in] bg-white text-zinc-900 shadow-2xl flex flex-col border-t-[12px] border-[#0d0e12] p-[0.6in] shrink-0"
        style={{ minHeight: '11in', boxSizing: 'border-box' }}
      >

        {/* HEADER CORPORATIVO */}
        <header className="flex justify-between items-start border-b-2 border-zinc-100 pb-8 mb-10">
          <div className="flex items-center gap-6">
             <div className="w-16 h-16 bg-[#0d0e12] rounded-2xl flex items-center justify-center p-3 shadow-xl">
                <img src="/logo.svg" alt="Logo" className="w-full h-full object-contain" />
             </div>
             <div>
                <h1 className="text-3xl font-black tracking-tighter leading-tight uppercase">
                   Mantech<span className="text-[#5d3cfe]">Pro</span>
                </h1>
                <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-400 mt-1">
                   Ingeniería Operativa Panamá
                </p>
             </div>
          </div>

          <div className="text-right">
             <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Número de Reporte</h3>
             <p className="font-black text-2xl text-[#0d0e12] leading-none tracking-tighter uppercase">
                #{request.id.substring(0,8).toUpperCase()}
             </p>
             <p className="text-[11px] font-bold text-zinc-500 mt-3 uppercase tracking-widest">{docDate}</p>
          </div>
        </header>

        {/* RESUMEN EJECUTIVO */}
        <div className="grid grid-cols-6 gap-2 mb-12">
          {[
            { label: 'Activo', value: request.assetName || '---' },
            { label: 'Especialista', value: request.techName || '---' },
            { label: 'Modalidad', value: request.serviceType === 'remote' ? `REMOTO` : 'PRESENCIAL' },
            { label: 'Plataforma / Pago', value: request.serviceType === 'remote' ? request.remotePlatform?.toUpperCase() : request.paymentMethod?.toUpperCase() || 'YAPPY' },
            { label: 'Tiempo', value: getTimeDisplay() },
            { label: 'Inversión', value: `$${Number(request.price || 0).toFixed(2)}`, highlight: true },
          ].map((item, i) => (
            <div key={i} className={`p-3 rounded-xl border ${item.highlight ? 'border-[#52ffac] bg-emerald-50/20' : 'border-zinc-100 bg-zinc-50/50'}`}>
              <h3 className="text-[7px] font-black uppercase text-zinc-400 mb-1.5">{item.label}</h3>
              <p className="text-[9px] font-black text-zinc-900 uppercase leading-tight truncate">{item.value}</p>
            </div>
          ))}
        </div>

        {/* CONTENIDO TÉCNICO */}
        <div className="flex-1 space-y-12">

          <section>
             <div className="flex items-center gap-3 border-b-2 border-zinc-100 pb-3 mb-5">
                <FileText className="w-5 h-5 text-[#5d3cfe]" />
                <h2 className="text-[13px] font-black uppercase tracking-widest text-zinc-800">Descripción de Intervención</h2>
             </div>
             <div className="bg-zinc-50 p-8 rounded-2xl border border-zinc-100 shadow-inner relative">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-[#5d3cfe]"></div>
                <p className="text-[14px] leading-relaxed italic text-zinc-700 font-medium">
                   "{request.description}"
                </p>
             </div>
          </section>

          <section>
             <div className="flex items-center gap-3 border-b-2 border-zinc-100 pb-3 mb-5">
                <CheckCircle2 className="w-5 h-5 text-[#5d3cfe]" />
                <h2 className="text-[13px] font-black uppercase tracking-widest text-zinc-800">Tareas Realizadas</h2>
             </div>
             <table className="w-full text-left">
                <thead>
                  <tr className="border-b-2 border-zinc-100 text-[10px] font-black uppercase text-zinc-400">
                    <th className="py-3">Descripción de la Labor</th>
                    <th className="py-3 text-right">Validación</th>
                  </tr>
                </thead>
                <tbody>
                  {request.checklist?.map((task) => (
                    <tr key={task.id} className="border-b border-zinc-50">
                      <td className="py-4 text-[12px] font-bold text-zinc-800 uppercase">{task.description}</td>
                      <td className="py-4 text-right">
                        <span className={`px-3 py-1 rounded-full font-black uppercase text-[8px] tracking-widest ${task.isCompleted ? 'bg-emerald-100 text-emerald-600' : 'bg-zinc-100 text-zinc-400'}`}>
                          {task.isCompleted ? 'CERTIFICADO' : 'PENDIENTE'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
             </table>
          </section>

          {request.materials && request.materials.length > 0 && (
            <section>
              <div className="flex items-center gap-3 border-b-2 border-zinc-100 pb-3 mb-5">
                <Package className="w-5 h-5 text-[#5d3cfe]" />
                <h2 className="text-[13px] font-black uppercase tracking-widest text-zinc-800">Insumos y Repuestos</h2>
              </div>
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b-2 border-zinc-100 text-[10px] font-black uppercase text-zinc-400">
                    <th className="py-3">Descripción de Material</th>
                    <th className="py-3 text-center">Cant.</th>
                    <th className="py-3 text-right">Monto Unit.</th>
                    <th className="py-3 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {request.materials.map((m, idx) => (
                    <tr key={idx} className="border-b border-zinc-50">
                      <td className="py-4 text-[11px] font-black text-zinc-800 uppercase">{m.name}</td>
                      <td className="py-4 text-center font-black text-[#5d3cfe] text-sm">x{m.quantity}</td>
                      <td className="py-4 text-right font-bold text-zinc-400">${Number(m.price).toFixed(2)}</td>
                      <td className="py-4 text-right font-black text-zinc-900 text-sm">${(Number(m.price) * Number(m.quantity)).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}
        </div>

        {/* ÁREA DE FIRMAS Y CIERRE */}
        <div className="mt-12 pt-10 border-t-2 border-zinc-100">
           <div className="grid grid-cols-2 gap-12">
              <div className="space-y-4">
                 <h3 className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.3em] border-b border-zinc-100 pb-2">Especialista Responsable</h3>
                 <div className="h-16 flex items-end">
                    <p className="text-sm font-black uppercase tracking-tight">{request.techName}</p>
                 </div>
                 <p className="text-[8px] text-zinc-400 font-bold uppercase tracking-widest">ID Técnico Certificado • MantechPro</p>
              </div>

              <div className="space-y-4 text-center">
                 <h3 className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.3em] border-b border-zinc-100 pb-2">Validación del Cliente</h3>
                 <div className="h-16 flex items-center justify-center bg-zinc-50 rounded-2xl relative border-2 border-dashed border-zinc-200 overflow-hidden mx-auto max-w-[200px]">
                    {request.clientSignature ? (
                      <img src={request.clientSignature} className="max-h-12 opacity-90 object-contain scale-125" alt="Firma" />
                    ) : (
                      <div className="flex flex-col items-center gap-1 opacity-20">
                         <span className="text-xl text-zinc-300">-</span>
                         <span className="text-[7px] font-black uppercase tracking-widest">PENDIENTE</span>
                      </div>
                    )}
                    {request.clientSignature && <div className="absolute top-1 right-1 flex items-center gap-1 text-[6px] font-black text-emerald-600 bg-white px-2 py-0.5 rounded-full border border-emerald-100 shadow-sm"><BadgeCheck className="w-2.5 h-2.5" /> ID VERIFIED</div>}
                 </div>
                 <div className="space-y-1">
                    <p className="text-[11px] font-black uppercase tracking-tighter text-zinc-900">{request.clientName}</p>
                    <p className="text-[8px] text-zinc-400 font-bold uppercase tracking-widest">Firma Biométrica Registrada</p>
                 </div>
              </div>
           </div>
        </div>

        {/* PIE DE PÁGINA CORPORATIVO */}
        <footer className="mt-16 pt-8 flex justify-between items-center text-zinc-400 border-t-2 border-zinc-100">
          <div className="flex items-center gap-3">
             <MapPin className="w-4 h-4 text-[#5d3cfe]" />
             <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-900 leading-none">MantechPro Industries Panama S.A.</p>
                <p className="text-[8px] font-bold uppercase text-zinc-400 mt-1">Red de Soporte Operativo • Master Node Panamá</p>
             </div>
          </div>
          <div className="text-right">
             <p className="text-[10px] font-black uppercase tracking-widest text-zinc-800">ORIGINAL - COPIA FIEL</p>
             <p className="text-[8px] font-bold uppercase text-[#5d3cfe] mt-1">Documento Técnico GOB.PA</p>
          </div>
        </footer>
      </article>
    </div>
  );
}
