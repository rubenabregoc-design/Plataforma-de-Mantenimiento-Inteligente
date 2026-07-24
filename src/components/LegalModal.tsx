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
    <div className="fixed inset-0 z-[4000] bg-[#0d0e12]/95 backdrop-blur-2xl flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="max-w-3xl w-full bg-[#121317] border border-white/10 rounded-[3rem] overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.8)] relative"
      >
        <button onClick={onClose} className="absolute top-8 right-8 z-50 p-3 bg-white/5 hover:bg-rose-600 text-white rounded-2xl border border-white/10 transition-all active:scale-90">
          <X className="w-5 h-5" />
        </button>

        <div className="p-12 space-y-10 max-h-[80vh] overflow-y-auto custom-scrollbar">
          <div className="flex items-center gap-6">
             <div className="w-16 h-16 bg-[#5d3cfe]/10 border border-[#5d3cfe]/20 rounded-[1.5rem] flex items-center justify-center text-[#5d3cfe]">
                {type === 'privacy' ? <Lock className="w-8 h-8" /> : <Scale className="w-8 h-8" />}
             </div>
             <div>
                <h2 className="text-3xl font-black text-white uppercase tracking-tighter leading-none">
                   {type === 'privacy' ? 'Política de Privacidad' : 'Términos y Condiciones'}
                </h2>
                <p className="text-[10px] text-[#474556] font-black uppercase tracking-[0.4em] mt-2">Protocolo Legal MantechPro Panamá</p>
             </div>
          </div>

          <div className="prose prose-invert max-w-none text-[#c8c4d9] space-y-6 text-sm leading-relaxed">
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
            className="w-full py-5 bg-[#5d3cfe] text-white rounded-[2rem] text-xs font-black uppercase tracking-[0.2em] shadow-2xl hover:brightness-110 transition-all"
          >
            He leído y acepto los términos
          </button>
        </div>
      </motion.div>
    </div>
  );
}
