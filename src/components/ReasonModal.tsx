import React, { useState } from 'react';
import { X, Send, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ReasonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  title: string;
  placeholder?: string;
  buttonText?: string;
}

export default function ReasonModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  placeholder = "Escriba aquí...",
  buttonText = "Confirmar"
}: ReasonModalProps) {
  const [reason, setReason] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;
    onConfirm(reason);
    setReason('');
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="w-full max-w-md bg-[#121317] border border-[#2a2b2f] rounded-[2.5rem] p-8 md:p-10 space-y-8 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-600 blur-[80px] opacity-10"></div>

          <div className="text-center space-y-4 relative z-10">
            <h3 className="text-2xl font-black text-white uppercase tracking-tighter italic">{title}</h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <textarea
              required
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder={placeholder}
              className="w-full bg-black border border-white/10 rounded-2xl p-6 text-sm text-white focus:border-[#5d3cfe] outline-none transition-all resize-none h-32 shadow-inner"
            />

            <div className="flex gap-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-4 bg-[#1c1d21] border border-[#2a2b2f] text-[#c8c4d9] rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-[1.5] py-4 bg-[#5d3cfe] text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-[#5d3cfe]/20 transition-all hover:scale-102 active:scale-95 flex items-center justify-center gap-2"
              >
                <Send className="w-3.5 h-3.5" /> {buttonText}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
