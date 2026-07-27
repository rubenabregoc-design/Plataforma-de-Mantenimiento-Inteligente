import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, X, Check } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'info' | 'success';
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Aceptar',
  cancelText = 'Cancelar',
  type = 'info'
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="w-full max-w-md bg-[#121317] border border-[#2a2b2f] rounded-[2.5rem] p-8 md:p-10 space-y-8 shadow-2xl relative overflow-hidden"
        >
          {/* LUZ DE FONDO DINÁMICA */}
          <div className={`absolute top-0 right-0 w-32 h-32 blur-[80px] opacity-20 ${
            type === 'danger' ? 'bg-rose-600' : type === 'success' ? 'bg-[#52ffac]' : 'bg-[#5d3cfe]'
          }`}></div>

          <div className="text-center space-y-4 relative z-10">
            <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mx-auto border shadow-lg ${
              type === 'danger' ? 'bg-rose-500/10 border-rose-500/20 text-rose-500 shadow-rose-500/10' :
              type === 'success' ? 'bg-[#52ffac]/10 border-[#52ffac]/20 text-[#52ffac] shadow-[#52ffac]/10' :
              'bg-[#5d3cfe]/10 border-[#5d3cfe]/20 text-[#5d3cfe] shadow-[#5d3cfe]/10'
            }`}>
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black text-white uppercase tracking-tighter italic">{title}</h3>
            <p className="text-xs text-[#c8c4d9] font-medium leading-relaxed opacity-70">
              {message}
            </p>
          </div>

          <div className="flex gap-4 relative z-10">
            <button
              onClick={onClose}
              className="flex-1 py-4 bg-[#1c1d21] border border-[#2a2b2f] text-[#c8c4d9] rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all active:scale-95"
            >
              {cancelText}
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`flex-1 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg transition-all active:scale-95 ${
                type === 'danger' ? 'bg-rose-600 text-white shadow-rose-600/20' :
                type === 'success' ? 'bg-[#52ffac] text-black shadow-[#52ffac]/20' :
                'bg-[#5d3cfe] text-white shadow-[#5d3cfe]/20'
              }`}
            >
              {confirmText}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
