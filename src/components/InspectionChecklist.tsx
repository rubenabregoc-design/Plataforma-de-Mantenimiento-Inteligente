import React from 'react';
import { InspectionStep } from '../types';
import { Check, X, Minus, Info } from 'lucide-react';

interface InspectionChecklistProps {
  steps: InspectionStep[];
  onUpdateStep: (id: string, status: InspectionStep['status']) => void;
  readOnly?: boolean;
}

export default function InspectionChecklist({ steps, onUpdateStep, readOnly = false }: InspectionChecklistProps) {
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
          <div className="flex items-center gap-3">
            <div className={`p-1.5 rounded-lg border ${
              step.status === 'ok' ? 'bg-emerald-100 border-emerald-200 text-emerald-700' :
              step.status === 'fail' ? 'bg-red-100 border-red-200 text-red-700' :
              'bg-white border-zinc-200 text-zinc-400'
            }`}>
              {step.status === 'ok' && <Check className="w-4 h-4" />}
              {step.status === 'fail' && <X className="w-4 h-4" />}
              {(step.status === 'pending' || step.status === 'na') && <Minus className="w-4 h-4" />}
            </div>
            <div>
              <p className={`text-xs font-black uppercase tracking-tight ${
                step.status === 'ok' ? 'text-emerald-900' :
                step.status === 'fail' ? 'text-red-900' : 'text-zinc-600'
              }`}>{step.label}</p>
            </div>
          </div>

          {!readOnly && (
            <div className="flex bg-white rounded-xl border border-zinc-200 p-1 shadow-sm shrink-0">
              <button
                onClick={() => onUpdateStep(step.id, 'ok')}
                className={`px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${
                  step.status === 'ok' ? 'bg-emerald-600 text-white' : 'text-zinc-400 hover:bg-zinc-50'
                }`}
              >OK</button>
              <button
                onClick={() => onUpdateStep(step.id, 'fail')}
                className={`px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${
                  step.status === 'fail' ? 'bg-red-600 text-white' : 'text-zinc-400 hover:bg-zinc-50'
                }`}
              >FAIL</button>
              <button
                onClick={() => onUpdateStep(step.id, 'na')}
                className={`px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${
                  step.status === 'na' ? 'bg-zinc-900 text-white' : 'text-zinc-400 hover:bg-zinc-50'
                }`}
              >N/A</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
