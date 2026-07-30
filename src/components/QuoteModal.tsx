import React, { useState } from 'react';
import { X, DollarSign, Calculator, Send, Info, ShieldCheck, Plus, Trash2, Calendar, Clock, Timer, CheckCircle2, ListChecks } from 'lucide-react';
import { JobRequest } from '../types';
import { toast } from 'react-hot-toast';

interface QuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: JobRequest;
  onSend: (requestId: string, price: number, commission: number, notes?: string, materials?: any[], checklist?: any[], schedule?: any) => void;
  techPlan?: 'basic' | 'pro' | 'enterprise';
}

export default function QuoteModal({ isOpen, onClose, request, onSend, techPlan = 'basic' }: QuoteModalProps) {
  const [price, setPrice] = useState('');
  const [techNotes, setTechNotes] = useState('');

  // Gestión de Materiales
  const [materials, setMaterials] = useState<{name: string, price: number, quantity: number}[]>([]);
  const [newMatName, setNewMatName] = useState('');
  const [newMatPrice, setNewMatPrice] = useState('');
  const [newMatQty, setNewMatQty] = useState('1');

  // Gestión de Tareas
  const [tasks, setTasks] = useState<{id: string, description: string, isCompleted: boolean}[]>([]);
  const [newTaskDesc, setNewTaskDesc] = useState('');

  // Cronograma
  const [schedDate, setSchedDate] = useState(request.scheduledDate || new Date().toISOString().split('T')[0]);
  const [schedTime, setSchedTime] = useState(request.scheduledTime || '09:00');
  const [schedDuration, setSchedDuration] = useState('2');
  const [travelTime, setTravelTime] = useState('30');

  if (!isOpen) return null;

  // Generar próximos 5 días para selección rápida
  const nextDays = Array.from({length: 5}, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      date: d.toISOString().split('T')[0],
      label: i === 0 ? 'Hoy' : i === 1 ? 'Mañana' : d.toLocaleDateString('es-PA', {weekday: 'short'}).toUpperCase().replace('.', ''),
      dayNum: d.getDate()
    };
  });

  // Lógica de Comisiones por Plan: 20% (Basic), 15% (Pro), 10% (Enterprise)
  const commissionRate = techPlan === 'enterprise' ? 0.10 : (techPlan === 'pro' ? 0.15 : 0.20);

  const numericPrice = Number(price) || 0;
  const commission = numericPrice * commissionRate;
  const earnings = numericPrice - commission;

  const handleAddMaterial = () => {
    if (!newMatName || !newMatPrice) return;
    setMaterials([...materials, { name: newMatName, price: Number(newMatPrice), quantity: Number(newMatQty) }]);
    setNewMatName('');
    setNewMatPrice('');
    setNewMatQty('1');
  };

  const handleAddTask = () => {
    if (!newTaskDesc) return;
    setTasks([...tasks, { id: Date.now().toString(), description: newTaskDesc, isCompleted: false }]);
    setNewTaskDesc('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (numericPrice <= 0) return toast.error("El precio debe ser mayor a 0.");

    onSend(
      request.id,
      numericPrice,
      commission,
      techNotes,
      materials,
      tasks,
      { date: schedDate, time: schedTime, duration: Number(schedDuration), travelTime: Number(travelTime) }
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[700] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-[#121317] border border-white/10 rounded-[3rem] shadow-2xl animate-fade-in-up flex flex-col max-h-[90vh]">

        <header className="p-8 border-b border-white/5 flex justify-between items-center bg-[#1c1d21] shrink-0">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-[#5d3cfe]/10 border border-[#5d3cfe]/20 rounded-2xl flex items-center justify-center text-[#5d3cfe] shadow-2xl">
              <Calculator className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Módulo de <span className="text-[#5d3cfe]">Cotización Pro</span></h3>
              <p className="text-[10px] text-[#474556] font-bold uppercase tracking-widest leading-none mt-1">Activo: {request.assetName}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-4 bg-white/5 hover:bg-rose-600/20 text-white/40 hover:text-white rounded-3xl transition-all">
            <X className="w-6 h-6" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-12">

          {/* REQUERIMIENTO */}
          <div className="bg-[#0d0e12] p-6 rounded-2xl border border-white/5 space-y-4 shadow-inner">
             <div className="flex items-start gap-4">
                <div className="p-3 bg-[#5d3cfe]/10 rounded-xl text-[#5d3cfe]">
                   <Info className="w-5 h-5" />
                </div>
                <div>
                   <h4 className="text-[11px] font-black text-white uppercase mb-1">Preferencia del Cliente</h4>
                   <p className="text-xs text-[#c8c4d9] italic leading-relaxed">"{request.description}"</p>
                   <div className="flex gap-4 mt-3">
                      <div className="flex items-center gap-1.5 text-[9px] font-black text-[#52ffac] uppercase">
                         <Calendar className="w-3 h-3" /> {request.scheduledDate || 'No especificada'}
                      </div>
                      <div className="flex items-center gap-1.5 text-[9px] font-black text-[#52ffac] uppercase">
                         <Clock className="w-3 h-3" /> {request.scheduledTime || 'Cualquier hora'}
                      </div>
                   </div>
                </div>
             </div>
          </div>

          {/* CRONOGRAMA */}
          <section className="space-y-8">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <Calendar className="w-4 h-4 text-[#c7bfff]" />
                   <h4 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Cronograma y Arribo</h4>
                </div>
                <div className="flex gap-1.5 overflow-x-auto custom-scrollbar-hidden">
                   {nextDays.map((d) => (
                     <button
                       key={d.date}
                       type="button"
                       onClick={() => setSchedDate(d.date)}
                       className={`px-3 py-2 rounded-xl border flex flex-col items-center min-w-[55px] transition-all ${
                         schedDate === d.date
                           ? 'bg-[#5d3cfe] border-[#5d3cfe] text-white shadow-lg scale-105'
                           : 'bg-black border-white/5 text-[#474556] hover:border-white/20'
                       }`}
                     >
                        <span className="text-[7px] font-black uppercase leading-none mb-1">{d.label}</span>
                        <span className="text-xs font-black leading-none">{d.dayNum}</span>
                     </button>
                   ))}
                </div>
             </div>

             <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-3">
                   <label className="text-[9px] font-black text-[#474556] uppercase tracking-widest ml-1">Fecha y Hora de Inicio</label>
                   <div className="flex gap-2">
                      <input
                        type="date"
                        value={schedDate}
                        onChange={e => setSchedDate(e.target.value)}
                        onClick={(e) => (e.target as any).showPicker?.()}
                        className="flex-[2] bg-black border border-white/10 rounded-xl p-4 text-xs font-black text-white outline-none focus:border-[#5d3cfe] cursor-pointer"
                      />
                      <input
                        type="time"
                        value={schedTime}
                        onChange={e => setSchedTime(e.target.value)}
                        onClick={(e) => (e.target as any).showPicker?.()}
                        className="flex-1 bg-black border border-white/10 rounded-xl p-4 text-xs font-black text-white outline-none focus:border-[#5d3cfe] cursor-pointer"
                      />
                   </div>
                </div>

                <div className="space-y-3">
                   <label className="text-[9px] font-black text-[#474556] uppercase tracking-widest ml-1">Duración Estimada</label>
                   <div className="flex bg-black border border-white/10 rounded-xl p-1">
                      {[1, 2, 4, 8].map(h => (
                        <button
                          key={h}
                          type="button"
                          onClick={() => setSchedDuration(h.toString())}
                          className={`flex-1 py-3 rounded-lg text-[10px] font-black transition-all ${Number(schedDuration) === h ? 'bg-[#5d3cfe] text-white shadow-lg' : 'text-[#474556] hover:text-white'}`}
                        >
                          {h}H
                        </button>
                      ))}
                      <input
                        type="number"
                        value={schedDuration}
                        onChange={e => setSchedDuration(e.target.value)}
                        className="w-12 bg-transparent text-center text-[10px] font-black text-white outline-none"
                        placeholder="+"
                      />
                   </div>
                </div>

                <div className="sm:col-span-2 space-y-3">
                   <label className="text-[9px] font-black text-[#474556] uppercase tracking-widest ml-1 text-[#52ffac]">Tiempo de Llegada (ETA)</label>
                   <div className="flex bg-black border border-white/10 rounded-xl p-1">
                      {[15, 30, 45, 60].map(m => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setTravelTime(m.toString())}
                          className={`flex-1 py-3 rounded-lg text-[10px] font-black transition-all ${Number(travelTime) === m ? 'bg-[#52ffac] text-black shadow-lg' : 'text-[#474556] hover:text-[#52ffac]'}`}
                        >
                          {m} MIN
                        </button>
                      ))}
                      <input
                        type="number"
                        value={travelTime}
                        onChange={e => setTravelTime(e.target.value)}
                        className="w-16 bg-transparent text-center text-[10px] font-black text-[#52ffac] outline-none"
                        placeholder="+"
                      />
                   </div>
                </div>
             </div>
             <p className="text-[7px] text-amber-500 font-black uppercase italic text-center">Protocolo de sincronización de agenda activo.</p>
          </section>

          {/* DIAGNÓSTICO */}
          <section className="space-y-4">
             <div className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-[#52ffac]" />
                <h4 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Diagnóstico y Ventajas</h4>
             </div>
             <textarea
                value={techNotes}
                onChange={(e) => setTechNotes(e.target.value)}
                placeholder="Describa el diagnóstico técnico, beneficios de su servicio y por qué es la mejor opción..."
                className="w-full bg-black border border-white/10 rounded-2xl p-6 text-sm text-white focus:border-[#5d3cfe] outline-none transition-all placeholder:text-white/10 resize-none min-h-[120px]"
             />
          </section>

          {/* MATERIALES Y REPUESTOS */}
          <section className="space-y-6">
             <div className="flex items-center gap-3">
                <Plus className="w-4 h-4 text-[#c7bfff]" />
                <h4 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Materiales / Repuestos Incluidos</h4>
             </div>

             <div className="flex gap-2">
                <input type="text" placeholder="Nombre Repuesto" value={newMatName} onChange={e => setNewMatName(e.target.value)} className="flex-[2] bg-black border border-white/5 rounded-xl p-3 text-xs font-bold text-white" />
                <input type="number" placeholder="B/." value={newMatPrice} onChange={e => setNewMatPrice(e.target.value)} className="flex-1 bg-black border border-white/5 rounded-xl p-3 text-xs font-bold text-[#52ffac]" />
                <input type="number" placeholder="Cant." value={newMatQty} onChange={e => setNewMatQty(e.target.value)} className="w-16 bg-black border border-white/5 rounded-xl p-3 text-xs font-bold text-white text-center" />
                <button type="button" onClick={handleAddMaterial} className="p-3 bg-[#5d3cfe] text-white rounded-xl"><Plus className="w-4 h-4" /></button>
             </div>

             <div className="space-y-2">
                {materials.map((m, i) => (
                  <div key={i} className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/5">
                     <span className="text-[10px] font-black text-white uppercase">{m.name} (x{m.quantity})</span>
                     <div className="flex items-center gap-4">
                        <span className="text-[10px] font-black text-[#52ffac]">B/. {(m.price * m.quantity).toFixed(2)}</span>
                        <button type="button" onClick={() => setMaterials(materials.filter((_, idx) => idx !== i))} className="text-rose-500"><Trash2 className="w-3.5 h-3.5" /></button>
                     </div>
                  </div>
                ))}
             </div>
          </section>

          {/* TAREAS / CHECKLIST */}
          <section className="space-y-6">
             <div className="flex items-center gap-3">
                <ListChecks className="w-4 h-4 text-[#c7bfff]" />
                <h4 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Plan de Trabajo (Tareas)</h4>
             </div>

             <div className="flex gap-2">
                <input type="text" placeholder="Nueva tarea o hito del servicio..." value={newTaskDesc} onChange={e => setNewTaskDesc(e.target.value)} className="flex-1 bg-black border border-white/5 rounded-xl p-3 text-xs font-bold text-white" />
                <button type="button" onClick={handleAddTask} className="p-3 bg-[#52ffac] text-[#0d0e12] rounded-xl"><Plus className="w-4 h-4" /></button>
             </div>

             <div className="space-y-2">
                {tasks.map((t, i) => (
                  <div key={i} className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/5">
                     <span className="text-[10px] font-black text-white/70 uppercase">{t.description}</span>
                     <button type="button" onClick={() => setTasks(tasks.filter((_, idx) => idx !== i))} className="text-rose-500"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                ))}
             </div>
          </section>

          {/* PRECIO FINAL */}
          <section className="space-y-8 pt-6 border-t border-white/5">
             <div className="space-y-4">
                <label className="text-[10px] font-black text-white uppercase tracking-[0.3em] ml-2">Presupuesto Final Solicitado (B/.)</label>
                <div className="relative">
                   <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-[#52ffac]" />
                   <input
                     required
                     type="number"
                     step="any"
                     placeholder="0.00"
                     value={price}
                     onChange={(e) => setPrice(e.target.value)}
                     className="w-full bg-black border-2 border-[#5d3cfe] rounded-[2rem] py-8 pl-16 pr-6 text-4xl font-black text-white focus:border-[#52ffac] outline-none transition-all placeholder:text-white/5 italic tracking-tighter"
                   />
                </div>
             </div>

             <div className="grid grid-cols-2 gap-6">
                <div className="p-6 bg-[#1c1d21] border border-white/5 rounded-3xl space-y-2 shadow-inner">
                   <span className="text-[8px] font-black text-[#474556] uppercase tracking-widest block">Comisión Plataforma ({(commissionRate * 100).toFixed(0)}%)</span>
                   <p className="text-lg font-black text-rose-500 italic">B/. {commission.toFixed(2)}</p>
                </div>
                <div className="p-6 bg-[#52ffac]/5 border border-[#52ffac]/20 rounded-3xl space-y-2 shadow-inner">
                   <span className="text-[8px] font-black text-[#474556] uppercase tracking-widest block">Tu Ganancia Neta</span>
                   <p className="text-lg font-black text-[#52ffac] italic">B/. {earnings.toFixed(2)}</p>
                </div>
             </div>
          </section>
        </div>

        <footer className="p-8 bg-[#0d0e12] border-t border-white/5 shrink-0 flex gap-4">
           <button
             type="button"
             onClick={onClose}
             className="flex-1 py-5 bg-white/5 border border-white/10 text-[#474556] rounded-2xl text-[10px] font-black uppercase tracking-widest hover:text-white transition-all"
           >
              Cancelar
           </button>
           <button
             onClick={handleSubmit}
             disabled={numericPrice <= 0}
             className="flex-[2] py-5 bg-[#5d3cfe] text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] shadow-xl shadow-[#5d3cfe]/20 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
           >
             <Send className="w-5 h-5" /> TRANSMITIR COTIZACIÓN OFICIAL
           </button>
        </footer>
      </div>
    </div>
  );
}

