import React from 'react';
import { JobRequest } from '../types';
import { X, Printer, FileText, CheckCircle2, Package, Clock, Calendar, ShieldCheck, Download } from 'lucide-react';

interface ServiceReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: JobRequest;
}

export default function ServiceReportModal({ isOpen, onClose, request }: ServiceReportModalProps) {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-[#0d0e12]/95 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-4xl bg-[#121317] rounded-[2.5rem] border border-[#2a2b2f] shadow-2xl overflow-hidden flex flex-col animate-fade-in-up print-container my-8">

        <header className="px-8 py-6 bg-[#1c1d21] border-b border-[#2a2b2f] flex justify-between items-center shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#5d3cfe]/10 flex items-center justify-center text-[#c7bfff] border border-[#5d3cfe]/30">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white uppercase tracking-tight leading-none">Reporte de Servicio Finalizado</h2>
              <p className="text-[10px] font-black text-[#c8c4d9] uppercase tracking-widest mt-2">Certificado de Conformidad # {request.id.substring(0,8)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 no-print">
            <button
              onClick={handlePrint}
              className="p-2.5 text-[#c8c4d9] hover:bg-[#121317] rounded-xl transition-all border border-transparent hover:border-[#2a2b2f] cursor-pointer"
              title="Imprimir Reporte"
            >
              <Printer className="w-5 h-5" />
            </button>
            <button onClick={onClose} className="p-2.5 text-[#474556] hover:text-white transition-all cursor-pointer">
              <X className="w-6 h-6" />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar grid-bg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#1c1d21] p-6 rounded-2xl border border-[#2a2b2f] space-y-4">
               <div className="flex items-center gap-2 text-[#c7bfff]">
                 <Package className="w-4 h-4" />
                 <span className="text-[10px] font-black uppercase tracking-widest">Activo Vinculado</span>
               </div>
               <h4 className="text-lg font-black text-white">{request.assetName}</h4>
               <p className="text-xs text-[#c8c4d9] opacity-70">Sistema industrial verificado por nodo local.</p>
            </div>

            <div className="bg-[#1c1d21] p-6 rounded-2xl border border-[#2a2b2f] space-y-4">
               <div className="flex items-center gap-2 text-[#52ffac]">
                 <ShieldCheck className="w-4 h-4" />
                 <span className="text-[10px] font-black uppercase tracking-widest">Especialista</span>
               </div>
               <h4 className="text-lg font-black text-white">{request.techName}</h4>
               <p className="text-xs text-[#c8c4d9] opacity-70">Ingeniero Certificado MantechPro.</p>
            </div>

            <div className="bg-[#1c1d21] p-6 rounded-2xl border border-[#2a2b2f] space-y-4">
               <div className="flex items-center gap-2 text-[#c7bfff]">
                 <Calendar className="w-4 h-4" />
                 <span className="text-[10px] font-black uppercase tracking-widest">Fecha de Cierre</span>
               </div>
               <h4 className="text-lg font-black text-white">2026-07-01</h4>
               <p className="text-xs text-[#c8c4d9] opacity-70">Sincronizado con el portal central.</p>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] border-l-4 border-[#5d3cfe] pl-4">Resumen Técnico de Intervención</h3>
            <div className="bg-[#1c1d21]/50 border border-[#2a2b2f] p-8 rounded-3xl space-y-6 shadow-inner">
               <div className="space-y-2">
                 <p className="text-[10px] font-black text-[#474556] uppercase tracking-widest">Trabajos Realizados</p>
                 <p className="text-sm text-[#e3e2e8] leading-relaxed font-medium">{request.description}</p>
               </div>
               <div className="h-px bg-[#2a2b2f]"></div>

               <div className="space-y-4">
                 <p className="text-[10px] font-black text-[#474556] uppercase tracking-widest">Insumos y Materiales Detallados</p>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(!request.materials || request.materials.length === 0) ? (
                      <p className="text-[10px] text-[#474556] italic">No se registraron materiales adicionales en este servicio.</p>
                    ) : (
                      request.materials.map((m, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-[#0d0e12] p-4 rounded-2xl border border-white/5 shadow-sm">
                           <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-[#52ffac]/10 flex items-center justify-center text-[#52ffac] font-black text-[10px]">x{m.quantity || 1}</div>
                              <span className="text-xs font-bold text-white uppercase">{m.name}</span>
                           </div>
                           <span className="text-xs font-black text-[#c7bfff]">${((m.price || 0) * (m.quantity || 1)).toFixed(2)}</span>
                        </div>
                      ))
                    )}
                 </div>
               </div>

               <div className="h-px bg-[#2a2b2f]"></div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-4">
                    <p className="text-[10px] font-black text-[#474556] uppercase tracking-widest">Evidencia Fotográfica</p>
                    <div className="aspect-video bg-[#0d0e12] rounded-2xl border border-[#2a2b2f] flex items-center justify-center relative overflow-hidden group">
                       <img src="https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=800&auto=format&fit=crop&q=80" className="w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-700" />
                       <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-[#5d3cfe]/20 no-print">
                          <button
                            onClick={() => window.open("https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?q=80", "_blank")}
                            className="bg-white text-[#0d0e12] px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#52ffac] transition-all cursor-pointer shadow-xl"
                          >
                            Ver Original
                          </button>
                       </div>
                    </div>
                 </div>
                 <div className="space-y-4">
                    <p className="text-[10px] font-black text-[#474556] uppercase tracking-widest">Firma de Conformidad</p>
                    <div className="aspect-video bg-[#0d0e12] rounded-2xl border border-[#2a2b2f] flex items-center justify-center p-6 relative">
                       {request.clientSignature ? (
                         <img src={request.clientSignature} className="max-h-full max-w-full invert opacity-80" alt="Firma" />
                       ) : (
                         <div className="text-[#474556] text-center">
                           <Clock className="w-8 h-8 mx-auto mb-2 opacity-20" />
                           <p className="text-[10px] font-black uppercase tracking-widest">Firma no disponible</p>
                         </div>
                       )}
                       <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-[#52ffac]/10 border border-[#52ffac]/20 px-2 py-1 rounded-lg">
                          <CheckCircle2 className="w-3 h-3 text-[#52ffac]" />
                          <span className="text-[8px] font-black text-[#52ffac] uppercase tracking-widest">Validado</span>
                       </div>
                    </div>
                 </div>
               </div>
            </div>
          </div>
        </div>

        <footer className="px-8 py-6 bg-[#1c1d21] border-t border-[#2a2b2f] flex justify-between items-center shrink-0">
          <div className="flex items-center gap-4 text-[#474556]">
             <ShieldCheck className="w-5 h-5" />
             <p className="text-[9px] font-black uppercase tracking-widest leading-none">Este documento tiene validez legal y técnica en todo el territorio nacional.</p>
          </div>
          <button
            onClick={handlePrint}
            className="bg-[#5d3cfe] text-[#0d0e12] px-8 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-[#5d3cfe]/20 hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 no-print cursor-pointer"
          >
            <Download className="w-4 h-4" /> Exportar PDF Certificado
          </button>
        </footer>
      </div>
    </div>
  );
}
