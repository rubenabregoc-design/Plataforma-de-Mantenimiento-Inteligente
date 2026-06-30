import React, { useRef, useState, useEffect } from 'react';
import { RotateCcw, Check } from 'lucide-react';

interface SignaturePadProps {
  onSave: (signature: string) => void;
  onCancel: () => void;
}

export default function SignaturePad({ onSave, onCancel }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
  }, []);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent): { x: number, y: number } | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();

    let clientX, clientY;
    if ('touches' in e) {
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

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const coords = getCoordinates(e);
    if (!coords) return;

    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    e.preventDefault();
    const coords = getCoordinates(e);
    if (!coords) return;

    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

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
    // Check if canvas is empty (optional but recommended)
    onSave(canvas.toDataURL('image/png'));
  };

  return (
    <div className="space-y-4">
      <div className="bg-zinc-50 border-2 border-zinc-200 rounded-2xl relative overflow-hidden h-48">
        <canvas
          ref={canvasRef}
          width={400}
          height={200}
          className="absolute inset-0 w-full h-full touch-none cursor-crosshair"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseOut={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
        <div className="absolute top-2 right-2 flex gap-2">
          <button
            type="button"
            onClick={clear}
            className="p-2 bg-white/80 hover:bg-white text-zinc-500 rounded-lg shadow-sm transition-all"
            title="Limpiar"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-600 rounded-xl text-xs font-bold transition-all"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={save}
          className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2"
        >
          <Check className="w-4 h-4" />
          Confirmar Firma
        </button>
      </div>
    </div>
  );
}
