import React, { useEffect } from 'react';
import { JobRequest } from '../types';
import { X, Printer, CheckCircle2, Package, Clock, ShieldCheck, Download, MapPin, BadgeCheck, Check, FileText } from 'lucide-react';

interface ServiceReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: JobRequest;
}

export default function ServiceReportModal({ isOpen, onClose, request }: ServiceReportModalProps) {

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => document.body.classList.remove('modal-open');
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

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
    if (!dateStr) return '---';
    try {
      return new Date(dateStr).toLocaleTimeString('es-PA', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (e) { return '---'; }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-start justify-center bg-[#0d0e12]/95 backdrop-blur-2xl overflow-y-auto no-print-backdrop pt-10 pb-32 px-4">
      <style>{`
        @media print {
          @page {
            size: 8.5in 11in;
            margin: 0;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            width: 8.5in !important;
            height: 11in !important;
            overflow: hidden !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body * { visibility: hidden !important; }
          #printable-report, #printable-report * { visibility: visible !important; }
          #printable-report {
            visibility: visible !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 8.5in !important;
            height: 11in !important;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            display: flex !important;
            flex-direction: column !important;
            background: white !important;
          }
          .no-print { display: none !important; }
        }
      `}</style>

      {/* BOTÓN FLOTANTE FUERA DEL REPORTE */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[1000] no-print">
        <button
          onClick={handlePrint}
          className="bg-[#52ffac] text-[#0d0e12] px-12 py-5 rounded-[2rem] text-[11px] font-black uppercase tracking-[0.3em] shadow-[0_20px_50px_rgba(82,255,172,0.4)] hover:scale-105 active:scale-95 transition-all flex items-center gap-4 border-none"
        >
          <Download className="w-5 h-5" />
          Generar PDF Oficial
        </button>
      </div>

      {/* REPORTE TAMAÑO CARTA EXACTO */}
      <div id="printable-report" className="w-[8.5in] h-[11in] bg-white text-zinc-900 shadow-2xl flex flex-col relative overflow-hidden border-none shrink-0">

        {/* HEADER CORPORATIVO */}
        <header className="h-[1.5in] px-14 bg-[#0d0e12] text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-6">
             <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center p-3 shadow-xl">
                <img src="/logo.svg" alt="Logo" className="w-full h-full object-contain" />
             </div>
             <div className="space-y-1">
                <h1 className="text-3xl font-black tracking-tighter leading-none italic">Mantech<span className="text-[#5d3cfe]">Pro</span></h1>
                <p className="text-[9px] font-black tracking-[0.4em] text-[#52ffac] uppercase opacity-90">Ingeniería Operativa Panamá</p>
             </div>
          </div>

          <div className="text-right space-y-2">
             <h2 className="text-sm font-black uppercase tracking-widest text-[#5d3cfe]">Certificado de Servicio Técnico</h2>
             <p className="text-white font-black text-2xl tracking-tighter leading-none">ID: {request.id.substring(0,10).toUpperCase()}</p>
             <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">{formatDate(request.visitFinishedAt)}</p>
          </div>

          <button onClick={onClose} className="absolute top-6 right-6 p-2 text-white/20 hover:text-white no-print">
            <X className="w-6 h-6" />
          </button>
        </header>

        {/* CONTENIDO PRINCIPAL - FLEX-1 PARA EMPUJAR FOOTER */}
        <div className="flex-1 px-14 py-12 flex flex-col gap-10">

          <div className="grid grid-cols-12 gap-12 items-start">

            {/* BITÁCORA Y TAREAS */}
            <div className="col-span-7 space-y-10">
              <section className="space-y-4">
                 <div className="flex items-center gap-3 border-b-2 border-zinc-100 pb-3">
                    <FileText className="w-5 h-5 text-[#5d3cfe]" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Detalles de la Intervención</h3>
                 </div>
                 <div className="bg-zinc-50 p-8 rounded-[2rem] border border-zinc-100 shadow-inner">
                    <p className="text-[13px] text-zinc-800 leading-relaxed font-bold italic">"{request.description}"</p>
                 </div>
              </section>

              <section className="space-y-4">
                 <div className="flex items-center gap-3 border-b-2 border-zinc-100 pb-3">
                    <CheckCircle2 className="w-5 h-5 text-[#5d3cfe]" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Tareas Realizadas</h3>
                 </div>
                 <div className="grid grid-cols-1 gap-3">
                    {request.checklist?.map((task: any) => (
                      <div key={task.id} className="flex items-center gap-4 bg-zinc-50/50 p-4 rounded-xl border border-zinc-100">
                         <div className={`w-6 h-6 rounded-full flex items-center justify-center ${task.isCompleted ? 'bg-emerald-100 text-emerald-600' : 'bg-zinc-100 text-zinc-300'}`}>
                            {task.isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : <Clock className="w-4 h-4" />}
                         </div>
                         <span className="text-[11px] font-bold text-zinc-800">{task.description}</span>
                      </div>
                    ))}
                 </div>
              </section>

              {request.materials && request.materials.length > 0 && (
                <section className="space-y-4">
                  <div className="flex items-center gap-3 border-b-2 border-zinc-100 pb-3">
                      <Package className="w-5 h-5 text-[#5d3cfe]" />
                      <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Materiales & Repuestos</h3>
                  </div>
                  <div className="space-y-2">
                      {request.materials.map((m: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center py-3 border-b border-zinc-100 px-2">
                            <span className="text-[11px] font-bold text-zinc-800 uppercase flex-1">
                               <span className="text-[#5d3cfe] mr-3">x{m.quantity || 1}</span> {m.name}
                            </span>
                            <span className="text-[11px] font-black text-zinc-900">${((Number(m.price) || 0) * (Number(m.quantity) || 1)).toFixed(2)}</span>
                        </div>
                      ))}
                  </div>
                </section>
              )}
            </div>

            {/* RESUMEN TÉCNICO Y FIRMA */}
            <aside className="col-span-5 space-y-10">
               <div className="bg-[#0d0e12] p-8 rounded-[2.5rem] text-white space-y-6 shadow-xl">
                  <h4 className="text-[9px] font-black text-[#5d3cfe] uppercase tracking-[0.4em] text-center">Ficha Técnica</h4>
                  <div className="space-y-4">
                     <div className="text-center">
                        <p className="text-[7px] text-zinc-500 uppercase tracking-widest mb-1">Activo</p>
                        <p className="text-[13px] font-black uppercase text-[#52ffac]">{request.assetName}</p>
                     </div>
                     <div className="h-px bg-white/5"></div>
                     <div className="text-center">
                        <p className="text-[7px] text-zinc-500 uppercase tracking-widest mb-1">Especialista</p>
                        <p className="text-[13px] font-black uppercase text-white">{request.techName}</p>
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/5 p-4 rounded-2xl text-center">
                           <p className="text-[7px] text-zinc-500 uppercase mb-1">Inicio</p>
                           <p className="text-[11px] font-bold">{formatTime(request.visitStartedAt)}</p>
                        </div>
                        <div className="bg-white/5 p-4 rounded-2xl text-center">
                           <p className="text-[7px] text-zinc-500 uppercase mb-1">Fin</p>
                           <p className="text-[11px] font-bold">{formatTime(request.visitFinishedAt)}</p>
                        </div>
                     </div>
                  </div>
                  <div className="pt-6 border-t border-white/10 text-center space-y-1">
                     <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Inversión Total</p>
                     <p className="text-5xl font-black text-[#52ffac] italic tracking-tighter">${request.price?.toFixed(2)}</p>
                  </div>
               </div>

               <div className="bg-zinc-50 border-2 border-zinc-100 p-8 rounded-[3rem] text-center space-y-6">
                  <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.4em]">Firma de Conformidad</p>
                  <div className="aspect-[4/3] bg-white rounded-3xl border border-zinc-200 flex items-center justify-center p-8 relative">
                     {request.clientSignature ? (
                        <img src={request.clientSignature} className="max-h-full max-w-full opacity-90 scale-110" alt="Firma" />
                     ) : (
                        <p className="text-[10px] text-zinc-300 font-black uppercase tracking-widest">Esperando Firma</p>
                     )}
                     {request.clientSignature && <div className="absolute top-4 right-4 px-3 py-1 bg-[#52ffac] text-[8px] font-black rounded-lg text-[#0d0e12] uppercase tracking-tighter">VERIFIED</div>}
                  </div>
                  <div className="space-y-1">
                     <p className="text-xs font-black text-zinc-900 uppercase">{request.clientName}</p>
                     <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Validación Biométrica Digital</p>
                  </div>
               </div>
            </aside>

          </div>
        </div>

        {/* PIE DE PÁGINA FIJO */}
        <footer className="h-[1in] px-14 bg-[#0d0e12] text-white flex justify-between items-center shrink-0 border-t border-white/10 mt-auto">
          <div className="flex items-center gap-6">
             <div className="w-10 h-10 bg-[#5d3cfe]/20 rounded-full flex items-center justify-center">
                <MapPin className="w-5 h-5 text-[#5d3cfe]" />
             </div>
             <div className="text-left space-y-1">
                <p className="text-[12px] font-black uppercase tracking-widest text-white leading-none">MantechPro Industries Panama S.A.</p>
                <p className="text-[8px] font-medium uppercase tracking-[0.2em] text-[#52ffac] opacity-60">Red de Soporte Master Node • Ciudad de Panamá</p>
             </div>
          </div>

          <div className="text-right space-y-1.5 opacity-50">
             <p className="text-[9px] font-black text-zinc-300 uppercase tracking-[0.5em] leading-none">ORIGINAL - COPIA FIEL</p>
             <p className="text-[7px] font-bold text-[#5d3cfe] uppercase tracking-[0.2em]">DOCUMENTO LEGAL VINCULANTE GOB.PA</p>
          </div>
        </footer>

      </div>
    </div>
  );
}
