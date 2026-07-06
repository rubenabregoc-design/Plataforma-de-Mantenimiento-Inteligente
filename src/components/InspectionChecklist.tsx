import React, { useState } from 'react';
import { InspectionStep } from '../types';
import { Check, X, Minus, Info, Trash2, Plus } from 'lucide-react';

interface InspectionChecklistProps {
  steps: InspectionStep[];
  onUpdateStep: (id: string, status: InspectionStep['status']) => void;
  onAddStep?: (label: string) => void;
  onDeleteStep?: (id: string) => void;
  readOnly?: boolean;
}

export default function InspectionChecklist({ steps, onUpdateStep, onAddStep, onDeleteStep, readOnly = false }: InspectionChecklistProps) {
  const [newStepLabel, setNewStepLabel] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStepLabel.trim() || !onAddStep) return;
    onAddStep(newStepLabel.trim());
    setNewStepLabel('');
  };

  return (
    <div className="space-y-3">
      {steps.map((step) => (
        <div
          key={step.id}
          className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
            step.status === 'ok' ? 'bg-emerald-50 border-emerald-100' :
            step.status === 'fail' ? 'bg-red-50 border-red-100' :
            'bg-zinc-50 border-zinc-100'
          }`}
        >
          <div className="flex items-center gap-3 flex-1">
            {!readOnly && onDeleteStep && (
              <button
                onClick={() => onDeleteStep(step.id)}
                className="text-zinc-300 hover:text-red-500 transition-colors"
                title="Eliminar tarea"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
            <div className={`p-1.5 rounded-lg border ${
              step.status === 'ok' ? 'bg-emerald-100 border-emerald-200 text-emerald-700' :
              step.status === 'fail' ? 'bg-red-100 border-red-200 text-red-700' :
              'bg-white border-zinc-200 text-zinc-400'
            }`}>
              {step.status === 'ok' && <Check className="w-4 h-4" />}
              {step.status === 'fail' && <X className="w-4 h-4" />}
              {(step.status === 'pending' || step.status === 'na') && <Minus className="w-4 h-4" />}
            </div>
            <div className="flex-1">
              <p className={`text-[11px] font-black uppercase tracking-tight leading-tight ${
                step.status === 'ok' ? 'text-emerald-900' :
                step.status === 'fail' ? 'text-red-900' : 'text-zinc-600'
              }`}>{step.label}</p>
            </div>
          </div>

          {!readOnly && (
            <div className="flex bg-white rounded-xl border border-zinc-200 p-1 shadow-sm shrink-0">
              <button
                onClick={() => onUpdateStep(step.id, 'ok')}
                className={`px-2.5 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${
                  step.status === 'ok' ? 'bg-emerald-600 text-white' : 'text-zinc-400 hover:bg-zinc-50 cursor-pointer'
                }`}
              >BIEN</button>
              <button
                onClick={() => onUpdateStep(step.id, 'fail')}
                className={`px-2.5 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${
                  step.status === 'fail' ? 'bg-red-600 text-white' : 'text-zinc-400 hover:bg-zinc-50 cursor-pointer'
                }`}
              >FALLO</button>
              <button
                onClick={() => onUpdateStep(step.id, 'na')}
                className={`px-2.5 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${
                  step.status === 'na' ? 'bg-zinc-900 text-white' : 'text-zinc-400 hover:bg-zinc-50 cursor-pointer'
                }`}
              >N/A</button>
            </div>
          )}
        </div>
      ))}

      {!readOnly && onAddStep && (
        <form onSubmit={handleAdd} className="mt-4 flex gap-2">
          <input
            type="text"
            placeholder="Añadir nueva tarea personalizada..."
            className="flex-1 bg-zinc-900 border border-[#2a2b2f] rounded-xl px-3 py-2 text-[10px] text-white font-bold outline-none focus:ring-2 focus:ring-indigo-500"
            value={newStepLabel}
            onChange={(e) => setNewStepLabel(e.target.value)}
          />
          <button
            type="submit"
            disabled={!newStepLabel.trim()}
            className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50 cursor-pointer shadow-sm shadow-indigo-100"
          >
            <Plus className="w-4 h-4" />
          </button>
        </form>
      )}
    </div>
  );
}

