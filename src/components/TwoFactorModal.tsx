import React, { useState } from 'react';
import { ShieldCheck, Lock, ArrowRight, Smartphone } from 'lucide-react';

interface Props {
  onVerify: () => void;
  email: string;
}

export default function TwoFactorModal({ onVerify, email }: Props) {
  const [code, setCode] = useState(['', '', '', '', '', '']);

  const handleInput = (v: string, i: number) => {
    if (v.length > 1) return;
    const newCode = [...code];
    newCode[i] = v;
    setCode(newCode);
    if (v && i < 5) document.getElementById(`digit-${i+1}`)?.focus();
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-[#0d0e12]/95 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#121317] border border-[#2a2b2f] p-12 rounded-[3rem] space-y-10 shadow-3xl text-center animate-fade-in-up">
        <div className="space-y-4">
          <div className="w-20 h-20 bg-[#5d3cfe]/10 border border-[#5d3cfe]/20 rounded-3xl mx-auto flex items-center justify-center text-[#5d3cfe]">
             <Smartphone className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Verificación 2FA</h2>
          <p className="text-xs text-[#c8c4d9] font-medium leading-relaxed opacity-60">Hemos enviado un código de seguridad a <br/><span className="text-[#5d3cfe]">{email}</span></p>
        </div>

        <div className="flex justify-center gap-3">
          {code.map((d, i) => (
            <input
              key={i}
              id={`digit-${i}`}
              type="text"
              value={d}
              onChange={(e) => handleInput(e.target.value, i)}
              className="w-12 h-16 bg-[#1c1d21] border border-[#2a2b2f] rounded-2xl text-center text-2xl font-black text-[#52ffac] focus:border-[#5d3cfe] outline-none transition-all"
            />
          ))}
        </div>

        <button
          onClick={onVerify}
          className="w-full py-5 bg-[#5d3cfe] text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] shadow-2xl shadow-[#5d3cfe]/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-4"
        >
          Verificar Identidad <ShieldCheck className="w-4 h-4" />
        </button>

        <div className="flex flex-col gap-4">
          <p className="text-[9px] font-black text-[#474556] uppercase tracking-widest cursor-pointer hover:text-white transition-colors">¿No recibiste el código? Reenviar</p>
          <button
            onClick={() => window.location.reload()}
            className="text-[9px] font-black text-rose-500 uppercase tracking-widest hover:underline"
          >
            ¿Correo incorrecto? Salir y corregir
          </button>

          {/* BYPASS TÁCTICO PARA PRUEBAS */}
          <button
            onClick={onVerify}
            className="text-[8px] font-black text-white/10 uppercase tracking-[0.4em] hover:text-[#52ffac] transition-all mt-4"
          >
            [ Bypass 2FA Dev ]
          </button>
        </div>
      </div>
    </div>
  );
}
