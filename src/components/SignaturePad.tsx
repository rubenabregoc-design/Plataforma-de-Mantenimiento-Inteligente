import React, { useRef, useState, useEffect } from 'react';
import { RotateCcw, Check, ShieldCheck, X } from 'lucide-react';

interface SignaturePadProps {
  onSave: (signature: string) => void;
  onCancel: () => void;
}

export default function SignaturePad({ onSave, onCancel }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set line style
    ctx.strokeStyle = '#c7bfff';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const getPos = (e: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      let clientX, clientY;
      if (window.TouchEvent && e instanceof TouchEvent) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        clientX = (e as MouseEvent).clientX;
        clientY = (e as MouseEvent).clientY;
      }
      return {
        x: clientX - rect.left,
        y: clientY - rect.top
      };
    };

    const handleStart = (e: MouseEvent | TouchEvent) => {
      if (e.cancelable) e.preventDefault();
      const pos = getPos(e);
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
      isDrawingRef.current = true;
    };

    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!isDrawingRef.current) return;
      if (e.cancelable) e.preventDefault();
      const pos = getPos(e);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    };

    const handleEnd = () => {
      isDrawingRef.current = false;
    };

    // Attach listeners with passive: false to allow preventDefault
    canvas.addEventListener('mousedown', handleStart);
    canvas.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleEnd);

    canvas.addEventListener('touchstart', handleStart, { passive: false });
    canvas.addEventListener('touchmove', handleMove, { passive: false });
    canvas.addEventListener('touchend', handleEnd);

    return () => {
      canvas.removeEventListener('mousedown', handleStart);
      canvas.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      canvas.removeEventListener('touchstart', handleStart);
      canvas.removeEventListener('touchmove', handleMove);
      canvas.removeEventListener('touchend', handleEnd);
    };
  }, []);

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const save = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // Check if canvas is empty before saving if needed
    onSave(canvas.toDataURL('image/png'));
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="bg-[#0d0e12] border-2 border-[#2a2b2f] rounded-3xl relative overflow-hidden h-56 shadow-inner group">
        <canvas
          ref={canvasRef}
          width={600}
          height={300}
          className="absolute inset-0 w-full h-full touch-none cursor-crosshair"
        />
        <div className="absolute top-4 left-4 pointer-events-none opacity-20">
           <ShieldCheck className="w-12 h-12 text-[#474556]" />
        </div>
        <div className="absolute top-4 right-4 flex gap-2">
          <button
            type="button"
            onClick={clear}
            className="p-2.5 bg-[#1c1d21] border border-[#2a2b2f] text-[#c8c4d9] hover:text-white rounded-xl shadow-xl transition-all"
            title="Limpiar"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none text-center">
           <p className="text-[8px] font-black text-[#474556] uppercase tracking-[0.4em]">Firma Digital Autorizada</p>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-4 border border-[#2a2b2f] text-[#c8c4d9] rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#1c1d21] transition-all"
        >
          <X className="w-4 h-4 inline mr-2" /> Cancelar
        </button>
        <button
          type="button"
          onClick={save}
          className="flex-1 py-4 bg-[#5d3cfe] text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-[#5d3cfe]/20 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          <Check className="w-4 h-4" /> Finalizar y Cobrar
        </button>
      </div>
    </div>
  );
}
