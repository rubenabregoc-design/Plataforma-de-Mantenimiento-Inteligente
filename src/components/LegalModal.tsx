import React from 'react';
import { X, ShieldCheck, FileText, Scale, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'privacy' | 'terms';
}

export default function LegalModal({ isOpen, onClose, type }: LegalModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[4000] bg-[#0d0e12] sm:bg-black/85 sm:backdrop-blur-xl flex flex-col justify-end sm:justify-center sm:items-center p-0 sm:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full h-full sm:h-auto sm:max-w-3xl sm:max-h-[85vh] bg-[#0d0e12] sm:bg-[#121317] sm:border border-white/10 sm:rounded-3xl overflow-hidden shadow-2xl relative flex flex-col pt-[max(env(safe-area-inset-top),0.75rem)] pb-[max(env(safe-area-inset-bottom),1rem)]"
      >
        {/* HEADER */}
        <div className="px-5 py-4 sm:px-8 sm:py-6 border-b border-white/5 flex justify-between items-center bg-[#16171d] shrink-0">
          <div className="flex items-center gap-3 sm:gap-4 pr-3">
             <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#5d3cfe]/10 border border-[#5d3cfe]/20 rounded-xl flex items-center justify-center text-[#5d3cfe] shrink-0">
                {type === 'privacy' ? <Lock className="w-5 h-5" /> : <Scale className="w-5 h-5" />}
             </div>
             <div>
                <h2 className="text-base sm:text-2xl font-black text-white uppercase tracking-tight leading-tight">
                   {type === 'privacy' ? 'Política de Privacidad' : 'Términos y Condiciones'}
                </h2>
                <p className="text-[9px] text-[#8a879d] font-bold uppercase tracking-wider mt-0.5">Protocolo Legal MantechPro Panamá</p>
             </div>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 bg-white/5 hover:bg-rose-600 text-white rounded-xl border border-white/10 transition-all active:scale-90 shrink-0"
            aria-label="Cerrar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 sm:p-8 space-y-6 overflow-y-auto no-scrollbar flex-1 text-[#c8c4d9] text-xs sm:text-sm leading-relaxed">
          <div className="prose prose-invert max-w-none text-[#c8c4d9] space-y-6 text-xs sm:text-sm leading-relaxed">
            {type === 'privacy' ? (
              <>
                <p className="font-bold text-white uppercase">1. Protección de Datos (Ley 81)</p>
                <p>MantechPro Industries Panamá cumple estrictamente con la Ley 81 de Protección de Datos Personales. Sus datos de identidad, ubicación y registros de activos son encriptados bajo el estándar AES-256.</p>

                <p className="font-bold text-white uppercase">2. Geolocalización</p>
                <p>Para habilitar el "Radar de Ingeniería" y la "Auditoría MDM-V4", recopilamos datos de ubicación precisa en segundo plano. Esto es vital para el seguimiento de flotas y la seguridad del cliente en sitio.</p>

                <p className="font-bold text-white uppercase">3. Uso de Imagen y Biometría</p>
                <p>Las fotos cargadas en el "Mantech ID" y el "Proof of Work" se utilizan exclusivamente para validación de seguridad y auditoría de garantías. No se comparten con terceros con fines publicitarios.</p>
              </>
            ) : (
              <>
                <p className="font-bold text-white uppercase">1. Naturaleza del Servicio</p>
                <p>MantechPro es una plataforma de intermediación técnica. Al contratar, usted acepta que MantechPro actúa como garante y árbitro digital del servicio contratado.</p>

                <p className="font-bold text-white uppercase">2. Ventanas de Pago y Reserva</p>
                <p>Las reservas urgentes (&lt; 48h) requieren el pago en un periodo de 4 a 12 horas dependiendo del perfil del cliente. El incumplimiento libera el cupo automáticamente (FIFO Protocol).</p>

                <p className="font-bold text-white uppercase">3. Garantía y Disputas</p>
                <p>Todo servicio contratado por la App cuenta con el respaldo de MantechPro. Las disputas deben abrirse antes de la firma de conformidad para congelar los fondos en Escrow.</p>

                <p className="font-bold text-white uppercase">4. Penalidades</p>
                <p>Cancelaciones por parte del cliente con menos de 12 horas de antelación incurren en un 20% de penalidad por lucro cesante del técnico asignado.</p>
              </>
            )}
          </div>

          <button
            onClick={onClose}
            className="w-full py-4 bg-gradient-to-r from-[#5d3cfe] to-[#4c2bd6] text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-xl hover:brightness-110 active:scale-95 transition-all mt-4"
          >
            He leído y acepto los términos
          </button>
        </div>
      </motion.div>
    </div>
  );
}
