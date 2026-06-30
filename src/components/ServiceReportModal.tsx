import React from 'react';
import { JobRequest } from '../types';
import { X, Printer, FileText, CheckCircle2, Package, Clock, Calendar, ShieldCheck } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm print:relative print:p-0 print:bg-white print:z-0">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-zinc-100 flex flex-col max-h-[90vh] print:max-h-none print:shadow-none print:border-none print:w-full print:rounded-none">

        {/* Header - Hidden in Print */}
        <div className="flex justify-between items-center px-6 py-4 bg-zinc-900 text-white shrink-0 print:hidden">
          <h2 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-400" />
            Reporte Final de Servicio
          </h2>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-xl transition-all"
              title="Imprimir reporte"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-xl transition-all">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Report Content */}
        <div className="flex-1 overflow-y-auto p-10 space-y-6 font-sans text-zinc-900 print:overflow-visible print:p-0 print:m-0">

          {/* Brand & ID */}
          <div className="flex justify-between items-start border-b-2 border-zinc-100 pb-6 print:border-zinc-300">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center print:bg-black">
                  <div className="w-4 h-4 bg-white rounded-xs"></div>
                </div>
                <span className="text-2xl font-black tracking-tighter">Mantech<span className="text-indigo-600 print:text-black">Pro</span></span>
              </div>
              <p className="text-[11px] text-zinc-400 font-bold uppercase tracking-widest print:text-zinc-500">Servicios Técnicos Especializados • Panamá</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-black text-zinc-400 uppercase print:text-zinc-500">Comprobante de Servicio</span>
              <p className="text-base font-mono font-black text-zinc-900">#{request.id.substring(0, 10).toUpperCase()}</p>
            </div>
          </div>

          {/* Summary Grid */}
          <div className="grid grid-cols-2 gap-4 bg-zinc-50 p-6 rounded-2xl border border-zinc-100 print:bg-white print:border-zinc-200 print:rounded-none">
            <div className="space-y-4">
              <div>
                <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block mb-0.5">Cliente</span>
                <p className="text-sm font-extrabold text-zinc-800">{request.clientName}</p>
              </div>
              <div>
                <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block mb-0.5">Equipo / Activo</span>
                <p className="text-sm font-extrabold text-zinc-800">{request.assetName}</p>
              </div>
              <div>
                <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block mb-0.5">Eficiencia Logística</span>
                <p className="text-[10px] font-bold text-zinc-600">
                  {request.rescheduleCount && request.rescheduleCount > 0
                    ? `⚠️ ${request.rescheduleCount} Reprogramaciones realizadas`
                    : '✅ Puntualidad Perfecta'}
                </p>
                <div className="mt-1.5 flex items-center gap-1.5 p-1.5 bg-indigo-50 border border-indigo-100 rounded-lg text-[9px] text-indigo-900 font-black uppercase">
                  <Calendar className="w-3 h-3" />
                  Duración Total: {request.resumeCount ? request.resumeCount : 1} {request.resumeCount && request.resumeCount > 1 ? 'Días' : 'Día'} de labor
                </div>
              </div>
            </div>
            <div className="space-y-4 text-right">
              <div>
                <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block mb-0.5">Especialista</span>
                <p className="text-sm font-extrabold text-indigo-600 print:text-black">{request.techName}</p>
              </div>
              <div>
                <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block mb-0.5">Fecha Finalización</span>
                <p className="text-sm font-extrabold text-zinc-800">{request.visitFinishedAt ? new Date(request.visitFinishedAt).toLocaleDateString('es-PA') : 'N/A'}</p>
              </div>
              <div>
                <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block mb-0.5">Calificación Final</span>
                <div className="flex justify-end items-center gap-1">
                  <span className="text-xs font-black text-zinc-900">{request.rating || 'N/A'}</span>
                  <div className="w-3 h-3 bg-amber-400 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Checklist Section */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2 border-b border-zinc-100 pb-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              Actividades Realizadas
            </h3>
            <div className="grid gap-2">
              {request.checklist?.map((task) => (
                <div key={task.id} className="flex items-center gap-3 p-3 bg-white border border-zinc-100 rounded-xl">
                  <div className="w-5 h-5 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <span className="text-xs font-bold text-zinc-700">{task.description}</span>
                </div>
              ))}
              {(!request.checklist || request.checklist.length === 0) && (
                <p className="text-xs text-zinc-400 italic">No se registraron tareas específicas.</p>
              )}
            </div>
          </div>

          {/* Materials Section */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2 border-b border-zinc-100 pb-2">
              <Package className="w-3.5 h-3.5 text-indigo-500" />
              Insumos y Repuestos Utilizados
            </h3>
            <table className="w-full text-xs">
              <thead className="bg-zinc-50">
                <tr>
                  <th className="text-left p-2 font-black text-zinc-400 uppercase">Descripción</th>
                  <th className="text-right p-2 font-black text-zinc-400 uppercase">Cargo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {request.materials?.map((m, i) => (
                  <tr key={i}>
                    <td className="p-2 font-bold text-zinc-700">{m.name}</td>
                    <td className="p-2 text-right font-black text-zinc-900">${m.price.toFixed(2)}</td>
                  </tr>
                ))}
                {(!request.materials || request.materials.length === 0) && (
                  <tr>
                    <td colSpan={2} className="p-4 text-center text-zinc-400 italic">No se utilizaron materiales adicionales.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Timeline & Signature */}
          <div className="grid grid-cols-2 gap-10 pt-6 border-t border-zinc-100">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <Clock className="w-3.5 h-3.5" />
                <span>Iniciado: {request.visitStartedAt ? new Date(request.visitStartedAt).toLocaleString() : 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <Clock className="w-3.5 h-3.5" />
                <span>Finalizado: {request.visitFinishedAt ? new Date(request.visitFinishedAt).toLocaleString() : 'N/A'}</span>
              </div>
            </div>

            <div className="bg-zinc-900 text-white p-4 rounded-2xl flex justify-between items-center">
              <span className="text-[10px] font-black uppercase">Total Facturado:</span>
              <span className="text-xl font-black text-emerald-400">${request.price?.toFixed(2)}</span>
            </div>
          </div>

          {/* Legal Footer */}
          <div className="pt-10 border-t border-zinc-100 grid grid-cols-2 gap-8 items-center">
            <div className="text-center space-y-2">
              {request.clientSignature ? (
                <div className="space-y-1">
                  <img src={request.clientSignature} alt="Firma del Cliente" className="h-16 mx-auto object-contain mix-blend-multiply" />
                  <div className="w-40 h-px bg-zinc-300 mx-auto"></div>
                  <span className="text-[8px] font-black text-zinc-400 uppercase">Firma del Cliente</span>
                </div>
              ) : (
                <div className="py-8 border-b border-zinc-200 w-40 mx-auto"></div>
              )}
            </div>

            <div className="text-center space-y-2">
              <div className="flex justify-center items-center gap-1.5 text-[10px] font-black text-zinc-800 uppercase">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Garantía Panamá Mantech
              </div>
              <p className="text-[8px] text-zinc-400 max-w-[180px] mx-auto leading-relaxed">
                Este mantenimiento fue realizado bajo los estándares de calidad. Garantía técnica de 30 días.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
