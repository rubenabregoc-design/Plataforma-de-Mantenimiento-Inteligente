import React, { useState, useEffect } from 'react';
import { X, Printer, ShieldCheck, Zap, Mail, Loader2, Globe, Building2 } from 'lucide-react';
import axios from 'axios';

interface MonthlyClosureModalProps {
  isOpen: boolean;
  onClose: () => void;
  adminEmail: string;
  data: {
    totalCommissions: number;
    totalSubscriptions: number;
    pendingPayments: number;
    netUtility: number;
    month: string;
    year: number;
  };
}

export default function MonthlyClosureModal({ isOpen, onClose, adminEmail, data }: MonthlyClosureModalProps) {
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    if (isOpen && !emailSent) {
      const timer = setTimeout(() => handleAutoSendEmail(), 2000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleAutoSendEmail = async () => {
    setIsSendingEmail(true);
    try {
      // Aseguramos que la URL sea la correcta y manejamos el éxito visualmente
      await axios.post('http://localhost:8080/api/send-report', {
        to: adminEmail,
        reportData: data
      });
      setEmailSent(true);
    } catch (err) {
      console.error("Error enviando reporte automático:", err);
      // Re-intento silencioso o manejo de error visual
      setTimeout(() => setIsSendingEmail(false), 3000);
    } finally {
      setIsSendingEmail(false);
    }
  };

  if (!isOpen) return null;

  const handlePrint = () => window.print();

  const reportID = `REP-${data.year}-${data.month.substring(0, 3).toUpperCase()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(reportID)}`;

  return (
    <div className="fixed inset-0 z-[700] bg-[#0d0e12]/95 backdrop-blur-xl flex justify-center p-4 overflow-y-auto custom-scrollbar">
      <div className="w-full max-w-4xl bg-white text-black rounded-[2rem] shadow-2xl overflow-hidden animate-fade-in print-container my-auto flex flex-col print:rounded-none">

        {/* ENCABEZADO */}
        <div className="p-10 border-b border-zinc-200 flex justify-between items-start">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-[#121317] rounded-xl flex items-center justify-center shadow-lg">
               <svg viewBox="0 0 100 100" className="w-10 h-10" fill="none">
                 <path d="M20 75V35L50 60L80 35V75" stroke="#5d3cfe" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round"/>
                 <circle cx="50" cy="20" r="6" fill="#52ffac"/>
               </svg>
            </div>
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tight leading-none text-black">MantechPro</h1>
              <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-[0.3em] mt-1">Industries Inc. Panamá</p>
              <div className="flex gap-4 mt-3 text-[8px] font-bold text-zinc-500 uppercase tracking-widest">
                <span className="flex items-center gap-1"><Globe className="w-3 h-3" /> mantechpro.pa</span>
                <span className="flex items-center gap-1"><Building2 className="w-3 h-3" /> Ciudad de Panamá</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="bg-zinc-100 px-4 py-2 rounded-lg border border-zinc-200">
               <p className="text-[7px] font-black text-zinc-500 uppercase tracking-widest">Reporte No.</p>
               <p className="text-xs font-black font-mono text-black">{reportID}</p>
            </div>
            <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest mt-2">Fecha: {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        {/* CUERPO CENTRAL */}
        <div className="px-16 py-12 space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-2xl font-black uppercase tracking-[0.2em] border-b-2 border-zinc-900 inline-block pb-2 text-black">Certificación de Cierre Mensual</h2>
            <p className="text-xs text-zinc-600 italic font-medium text-black">Estado Financiero y Operativo correspondiente al periodo de {data.month} {data.year}</p>
          </div>

          <div className="grid grid-cols-2 gap-16">
            <div className="space-y-6">
               <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-800 border-b border-zinc-100 pb-2">Resumen de Ingresos</h3>
               <div className="space-y-4">
                 <div className="flex justify-between text-xs border-b border-zinc-50 pb-2">
                   <span className="text-zinc-700 font-medium">Comisiones por Servicios (15%)</span>
                   <span className="font-bold font-mono text-black">${data.totalCommissions.toFixed(2)}</span>
                 </div>
                 <div className="flex justify-between text-xs border-b border-zinc-50 pb-2">
                   <span className="text-zinc-700 font-medium">Membresías Técnicas Premium</span>
                   <span className="font-bold font-mono text-black">${data.totalSubscriptions.toFixed(2)}</span>
                 </div>
                 <div className="flex justify-between items-center bg-zinc-50 p-4 border border-zinc-100">
                   <span className="text-[9px] font-black uppercase text-zinc-800">Total Bruto Recaudado</span>
                   <span className="text-lg font-black font-mono text-black">${(data.totalCommissions + data.totalSubscriptions).toFixed(2)}</span>
                 </div>
               </div>
            </div>

            <div className="space-y-6">
               <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-800 border-b border-zinc-100 pb-2">Pasivos & Liquidaciones</h3>
               <div className="space-y-4">
                 <div className="flex justify-between text-xs border-b border-zinc-50 pb-2">
                   <span className="text-zinc-700 font-medium">Pagos a Técnicos (Pendientes)</span>
                   <span className="font-bold font-mono text-rose-600">-${data.pendingPayments.toFixed(2)}</span>
                 </div>
                 <div className="flex justify-between text-xs border-b border-zinc-50 pb-2">
                   <span className="text-zinc-700 font-medium">Costos de Servidor (AWS/Firebase)</span>
                   <span className="font-bold font-mono text-black">$0.00</span>
                 </div>
                 <div className="flex justify-between items-center bg-black text-white p-4 shadow-xl">
                   <span className="text-[9px] font-black uppercase">Utilidad Neta Auditada</span>
                   <span className="text-lg font-black font-mono">${data.netUtility.toFixed(2)}</span>
                 </div>
               </div>
            </div>
          </div>

          {/* PIE DE VALIDACIÓN */}
          <div className="mt-20 pt-10 flex justify-between items-end border-t border-zinc-100">
             <div className="flex flex-col items-center gap-2 text-center">
                <ShieldCheck className="w-12 h-12 text-[#52ffac]" />
                <p className="text-[8px] font-black uppercase text-zinc-800">Certificación Master</p>
             </div>
             <div className="text-center space-y-1">
                <p className="text-[9px] font-black uppercase tracking-widest border-b border-zinc-900 text-black">Validación Digital</p>
                <p className="text-[7px] text-zinc-800 font-bold uppercase w-48 mx-auto leading-tight">Este documento certifica que los valores presentados han sido auditados bajo el protocolo V4.2.</p>
             </div>
             <div className="border border-zinc-200 p-2 rounded-lg bg-white">
                <img src={qrUrl} alt="QR" className="w-16 h-16" />
             </div>
          </div>
        </div>

        {/* CONTROLES */}
        <footer className="p-8 bg-zinc-50 border-t border-zinc-100 flex justify-between items-center no-print">
           <button onClick={handlePrint} className="flex items-center gap-2 px-8 py-3 bg-zinc-900 text-white rounded-xl text-xs font-black uppercase transition-all hover:bg-black">
             <Printer className="w-4 h-4 text-[#52ffac]" /> Imprimir Reporte
           </button>
           <button onClick={onClose} className="text-zinc-400 hover:text-zinc-900 font-bold uppercase text-[10px]">Cerrar</button>
        </footer>
      </div>
    </div>
  );
}
