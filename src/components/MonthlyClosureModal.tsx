import React, { useState, useEffect } from 'react';
import { X, Printer, ShieldCheck, Zap, Mail, Loader2, Globe, Building2 } from 'lucide-react';
import api from '../services/api';
import { downloadHtmlAsPdf } from '../utils/pdfExport';
import { toast } from 'react-hot-toast';

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
      // Usamos el cliente centralizado para que funcione tanto en Web como en Android Nativo
      await api.post('/api/send-report', {
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

  const reportID = `REP-${data.year}-${data.month.substring(0, 3).toUpperCase()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(reportID)}`;

  const handlePrint = async () => {
    const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Certificación de Cierre Mensual - ${reportID}</title>
  <style>
    * { box-sizing: border-box; color: #000000 !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; margin: 0; padding: 36px; background: #ffffff; color: #000000; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #000000; padding-bottom: 20px; margin-bottom: 30px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-top: 24px; }
    .row { display: flex; justify-content: space-between; border-bottom: 1px solid #cccccc; padding: 10px 0; font-size: 13px; font-weight: 700; }
    .box { background: #f4f4f5; border: 2px solid #000000; padding: 14px; display: flex; justify-content: space-between; align-items: center; margin-top: 14px; border-radius: 10px; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div style="font-size: 26px; font-weight: 900; text-transform: uppercase;">Mantech<span style="color: #5d3cfe !important;">Pro</span></div>
      <div style="font-size: 10px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase; margin-top: 4px;">Industries Inc. Panamá • mantech-pro.com</div>
    </div>
    <div style="text-align: right;">
      <div style="font-size: 10px; font-weight: 900; text-transform: uppercase;">Reporte No.</div>
      <div style="font-size: 14px; font-weight: 900; font-family: monospace;">${reportID}</div>
      <div style="font-size: 10px; font-weight: 800; margin-top: 4px;">Fecha: ${new Date().toLocaleDateString('es-PA')}</div>
    </div>
  </div>
  <div style="text-align: center; margin-bottom: 30px;">
    <h2 style="font-size: 22px; font-weight: 900; text-transform: uppercase; border-bottom: 2px solid #000000; display: inline-block; padding-bottom: 6px; margin: 0;">Certificación de Cierre Mensual</h2>
    <p style="font-size: 12px; font-weight: 800; margin-top: 8px;">Estado Financiero y Operativo correspondiente al periodo de ${data.month} ${data.year}</p>
  </div>
  <div class="grid">
    <div>
      <h3 style="font-size: 12px; font-weight: 900; text-transform: uppercase; border-bottom: 2px solid #000000; padding-bottom: 6px;">Resumen de Ingresos</h3>
      <div class="row"><span>Comisiones por Servicios (15%)</span><span>$${data.totalCommissions.toFixed(2)}</span></div>
      <div class="row"><span>Membresías Técnicas Premium</span><span>$${data.totalSubscriptions.toFixed(2)}</span></div>
      <div class="box"><span style="font-size: 11px; font-weight: 900; text-transform: uppercase;">Total Bruto Recaudado</span><span style="font-size: 18px; font-weight: 900;">$${(data.totalCommissions + data.totalSubscriptions).toFixed(2)}</span></div>
    </div>
    <div>
      <h3 style="font-size: 12px; font-weight: 900; text-transform: uppercase; border-bottom: 2px solid #000000; padding-bottom: 6px;">Pasivos & Liquidaciones</h3>
      <div class="row"><span>Pagos a Técnicos (Pendientes)</span><span style="color: #be123c !important;">-$${data.pendingPayments.toFixed(2)}</span></div>
      <div class="row"><span>Costos de Servidor (AWS/Firebase)</span><span>$0.00</span></div>
      <div class="box"><span style="font-size: 11px; font-weight: 900; text-transform: uppercase;">Utilidad Neta Auditada</span><span style="font-size: 18px; font-weight: 900;">$${data.netUtility.toFixed(2)}</span></div>
    </div>
  </div>
  <div style="margin-top: 50px; padding-top: 20px; border-top: 2px solid #000000; display: flex; justify-content: space-between; align-items: center;">
    <div style="font-size: 10px; font-weight: 900; text-transform: uppercase;">✓ Certificación Master MantechPro V4.2</div>
    <div style="font-size: 10px; font-weight: 800;">Documento auditado digitalmente • Ciudad de Panamá</div>
  </div>
</body>
</html>`;
    const loadingId = toast.loading('Generando PDF de Cierre Mensual...');
    try {
      await downloadHtmlAsPdf(html, `Cierre_Mensual_${data.month}_${data.year}`);
      toast.dismiss(loadingId);
      toast.success('Certificación PDF lista');
    } catch (e) {
      toast.dismiss(loadingId);
      window.print();
    }
  };

  return (
    <div className="fixed inset-0 z-[700] bg-[#0d0e12]/95 backdrop-blur-xl flex justify-center p-4 overflow-y-auto custom-scrollbar">
      <div className="w-full max-w-4xl bg-white text-black rounded-[2rem] shadow-2xl overflow-hidden animate-fade-in print-container my-auto flex flex-col print:rounded-none">

        {/* ENCABEZADO */}
        <div className="p-6 md:p-10 border-b border-zinc-300 flex justify-between items-start">
          <div className="flex items-center gap-4 md:gap-6">
            <div className="w-14 h-14 md:w-16 md:h-16 bg-[#121317] rounded-xl flex items-center justify-center shadow-lg">
               <svg viewBox="0 0 100 100" className="w-9 h-9 md:w-10 md:h-10" fill="none">
                 <path d="M20 75V35L50 60L80 35V75" stroke="#5d3cfe" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round"/>
                 <circle cx="50" cy="20" r="6" fill="#52ffac"/>
               </svg>
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black uppercase tracking-tight leading-none text-black">Mantech<span className="text-[#5d3cfe]">Pro</span></h1>
              <p className="text-[9px] font-black text-black uppercase tracking-[0.3em] mt-1">Industries Inc. Panamá</p>
              <div className="flex gap-4 mt-3 text-[8px] font-black text-black uppercase tracking-widest">
                <span className="flex items-center gap-1"><Globe className="w-3 h-3" /> mantech-pro.com</span>
                <span className="flex items-center gap-1"><Building2 className="w-3 h-3" /> Ciudad de Panamá</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="bg-zinc-100 px-4 py-2 rounded-lg border border-zinc-300">
               <p className="text-[7px] font-black text-black uppercase tracking-widest">Reporte No.</p>
               <p className="text-xs font-black font-mono text-black">{reportID}</p>
            </div>
            <p className="text-[8px] font-black text-black uppercase tracking-widest mt-2">Fecha: {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        {/* CUERPO CENTRAL */}
        <div className="px-6 md:px-16 py-8 md:py-12 space-y-10 md:space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-xl md:text-2xl font-black uppercase tracking-[0.2em] border-b-2 border-black inline-block pb-2 text-black">Certificación de Cierre Mensual</h2>
            <p className="text-xs text-black italic font-bold">Estado Financiero y Operativo correspondiente al periodo de {data.month} {data.year}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">
            <div className="space-y-6">
               <h3 className="text-[10px] font-black uppercase tracking-widest text-black border-b border-zinc-300 pb-2">Resumen de Ingresos</h3>
               <div className="space-y-4">
                 <div className="flex justify-between text-xs border-b border-zinc-200 pb-2">
                   <span className="text-black font-bold">Comisiones por Servicios (15%)</span>
                   <span className="font-black font-mono text-black">${data.totalCommissions.toFixed(2)}</span>
                 </div>
                 <div className="flex justify-between text-xs border-b border-zinc-200 pb-2">
                   <span className="text-black font-bold">Membresías Técnicas Premium</span>
                   <span className="font-black font-mono text-black">${data.totalSubscriptions.toFixed(2)}</span>
                 </div>
                 <div className="flex justify-between items-center bg-zinc-100 p-4 border border-zinc-300">
                   <span className="text-[9px] font-black uppercase text-black">Total Bruto Recaudado</span>
                   <span className="text-lg font-black font-mono text-black">${(data.totalCommissions + data.totalSubscriptions).toFixed(2)}</span>
                 </div>
               </div>
            </div>

            <div className="space-y-6">
               <h3 className="text-[10px] font-black uppercase tracking-widest text-black border-b border-zinc-300 pb-2">Pasivos & Liquidaciones</h3>
               <div className="space-y-4">
                 <div className="flex justify-between text-xs border-b border-zinc-200 pb-2">
                   <span className="text-black font-bold">Pagos a Técnicos (Pendientes)</span>
                   <span className="font-black font-mono text-rose-700">-${data.pendingPayments.toFixed(2)}</span>
                 </div>
                 <div className="flex justify-between text-xs border-b border-zinc-200 pb-2">
                   <span className="text-black font-bold">Costos de Servidor (AWS/Firebase)</span>
                   <span className="font-black font-mono text-black">$0.00</span>
                 </div>
                 <div className="flex justify-between items-center bg-black text-white p-4 shadow-xl">
                   <span className="text-[9px] font-black uppercase">Utilidad Neta Auditada</span>
                   <span className="text-lg font-black font-mono">${data.netUtility.toFixed(2)}</span>
                 </div>
               </div>
            </div>
          </div>

          {/* PIE DE VALIDACIÓN */}
          <div className="mt-12 md:mt-20 pt-8 md:pt-10 flex justify-between items-end border-t border-zinc-300">
             <div className="flex flex-col items-center gap-2 text-center">
                <ShieldCheck className="w-12 h-12 text-[#059669]" />
                <p className="text-[8px] font-black uppercase text-black">Certificación Master</p>
             </div>
             <div className="text-center space-y-1">
                <p className="text-[9px] font-black uppercase tracking-widest border-b border-black text-black">Validación Digital</p>
                <p className="text-[7px] text-black font-bold uppercase w-48 mx-auto leading-tight">Este documento certifica que los valores presentados han sido auditados bajo el protocolo V4.2.</p>
             </div>
             <div className="border border-zinc-300 p-2 rounded-lg bg-white">
                <img src={qrUrl} alt="QR" className="w-16 h-16" />
             </div>
          </div>
        </div>

        {/* CONTROLES */}
        <footer className="p-6 md:p-8 bg-zinc-100 border-t border-zinc-300 flex justify-between items-center no-print">
           <button onClick={handlePrint} className="flex items-center gap-2 px-6 md:px-8 py-3 bg-zinc-900 text-white rounded-xl text-xs font-black uppercase transition-all hover:bg-black">
             <Printer className="w-4 h-4 text-[#52ffac]" /> Descargar / Imprimir PDF
           </button>
           <button onClick={onClose} className="text-black hover:text-zinc-700 font-black uppercase text-[10px]">Cerrar</button>
        </footer>
      </div>
    </div>
  );
}
