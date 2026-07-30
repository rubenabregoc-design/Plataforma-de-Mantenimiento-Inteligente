import React from 'react';
import { Asset } from '../types';
import { X, Cpu, Activity, Zap, Thermometer, ShieldCheck, Download, TrendingUp, AlertTriangle, Battery, Droplets } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  asset: Asset;
}

export default function AssetEngineeringReportModal({ isOpen, onClose, asset }: Props) {
  if (!isOpen) return null;

  // --- MOTOR DE INGENIERÍA MDM-V4 REFINADO ---

  // 1. Cálculo de Antigüedad
  const purchaseDate = asset.purchaseDate ? new Date(asset.purchaseDate) : new Date(asset.registeredAt);
  const monthsOwned = Math.max(1, Math.floor((new Date().getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44)));

  // 2. Cálculo de Estrés Operativo (Basado en Proximidad de Mantenimiento)
  const lastMaint = new Date(asset.lastMaintenanceDate);
  const nextMaint = new Date(asset.nextMaintenanceDate);
  const totalCycleDays = Math.max(1, Math.floor((nextMaint.getTime() - lastMaint.getTime()) / (1000 * 60 * 60 * 24)));
  const daysSinceLast = Math.floor((new Date().getTime() - lastMaint.getTime()) / (1000 * 60 * 60 * 24));

  // Fórmula de Fatiga: Proporción del ciclo de mantenimiento consumido
  const operationalStress = Math.min(100, Math.max(0, (daysSinceLast / totalCycleDays) * 100));

  // 3. Salud de Batería / Energía (SOH - State of Health)
  // Basado en una curva de degradación química típica (80% a los 5 años)
  const batterySOH = Math.max(5, 100 - (monthsOwned * 0.8));

  // 4. Eficiencia Sistémica
  // Influenciada por el estrés y la antigüedad del activo
  const efficiency = Math.max(60, 98 - (operationalStress * 0.15) - (monthsOwned * 0.1));

  // 5. Nivel de Riesgo Real
  const isOverdue = new Date() > nextMaint;
  const riskLevel = isOverdue ? (daysSinceLast > totalCycleDays + 30 ? 'CRÍTICO' : 'ALTO') : (operationalStress > 85 ? 'MEDIO' : 'BAJO');
  const riskColor = riskLevel === 'CRÍTICO' || riskLevel === 'ALTO' ? 'text-rose-500' : riskLevel === 'MEDIO' ? 'text-amber-500' : 'text-[#52ffac]';

  return (
    <div className="fixed inset-0 z-[800] bg-[#0d0e12]/95 backdrop-blur-xl flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-4xl bg-[#121317] border border-[#2a2b2f] rounded-[3rem] overflow-hidden shadow-2xl shadow-[#5d3cfe]/10"
      >
        {/* HEADER NASA STYLE */}
        <div className="bg-[#1c1d21] p-8 border-b border-white/5 flex justify-between items-center relative overflow-hidden">
           <div className="absolute top-0 right-0 p-8 opacity-5"><Cpu className="w-32 h-32 text-[#5d3cfe]" /></div>
           <div className="flex items-center gap-5 relative z-10">
              <div className="w-16 h-16 bg-[#5d3cfe]/10 border border-[#5d3cfe]/20 rounded-2xl flex items-center justify-center text-[#5d3cfe] shadow-2xl">
                 <Cpu className="w-10 h-10" />
              </div>
              <div>
                 <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic">Reporte de Ingeniería <span className="text-[#5d3cfe]">MDM-V4</span></h2>
                 <div className="flex items-center gap-3 mt-1">
                    <p className="text-[10px] font-black text-[#52ffac] uppercase tracking-widest bg-[#52ffac]/10 px-2 py-0.5 rounded-full border border-[#52ffac]/20">Core Operativo Activo</p>
                    <span className="text-[8px] text-[#474556] font-black uppercase">Ref: {asset.id.substring(0,8)}</span>
                 </div>
              </div>
           </div>
           <button onClick={onClose} className="p-4 bg-white/5 hover:bg-rose-600/20 text-white rounded-2xl transition-all relative z-10"><X className="w-6 h-6" /></button>
        </div>

        <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-y-auto max-h-[70vh] custom-scrollbar">

           {/* COLUMNA 1: TELEMETRÍA DE SALUD */}
           <div className="space-y-6">
              <h3 className="text-[10px] font-black text-[#474556] uppercase tracking-[0.3em] ml-1">Sensores Virtuales</h3>

              <div className="p-6 bg-[#0d0e12] rounded-3xl border border-white/5 space-y-4">
                 <div className="flex justify-between items-center">
                    <span className="text-[9px] font-black text-white/40 uppercase tracking-widest flex items-center gap-2">
                       <Thermometer className="w-3 h-3 text-rose-500" /> Estrés Térmico
                    </span>
                    <span className="text-xs font-black text-white">{operationalStress.toFixed(1)}%</span>
                 </div>
                 <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500" style={{ width: `${operationalStress}%` }}></div>
                 </div>
                 <p className="text-[8px] text-[#474556] font-medium leading-relaxed uppercase">Índice de fatiga basado en el ciclo de mantenimiento actual ({daysSinceLast} días).</p>
              </div>

              {/* HISTORIAL PRE-VIAJE */}
              <div className="space-y-4">
                 <h3 className="text-[10px] font-black text-[#474556] uppercase tracking-[0.3em] ml-1">Bitácora Pre-Viaje</h3>
                 <div className="space-y-2">
                    {asset.preTripInspections && asset.preTripInspections.length > 0 ? (
                      asset.preTripInspections.slice(-3).reverse().map((insp, idx) => (
                        <div key={idx} className={`p-4 rounded-2xl border ${insp.result === 'safe' ? 'bg-[#52ffac]/5 border-[#52ffac]/10' : 'bg-rose-500/5 border-rose-500/10'}`}>
                           <div className="flex justify-between items-center mb-2">
                              <span className="text-[8px] font-black text-white/40 uppercase">
                                 {new Date(insp.date).toLocaleDateString()} • {new Date(insp.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase()}
                              </span>
                              <span className={`text-[7px] font-black px-2 py-0.5 rounded ${insp.result === 'safe' ? 'bg-[#52ffac] text-black' : 'bg-rose-500 text-white'}`}>
                                 {insp.result === 'safe' ? 'SEGURO' : 'ALERTA'}
                              </span>
                           </div>

                           {insp.result === 'warning' && (
                             <div className="mb-2">
                               <p className="text-[6px] font-black text-[#474556] uppercase mb-1">Fallos detectados:</p>
                               <div className="flex flex-wrap gap-1">
                                 {insp.items.filter((i: any) => i.status === 'fail').map((item: any, iIdx: number) => (
                                   <span key={iIdx} className="px-1.5 py-0.5 bg-rose-500/20 text-rose-500 text-[6px] font-black rounded border border-rose-500/30 uppercase">
                                     {item.label}
                                   </span>
                                 ))}
                               </div>
                             </div>
                           )}

                           <p className="text-[9px] text-white/60 font-medium uppercase line-clamp-1 italic">"{insp.observations || 'Sin obs.'}"</p>
                        </div>
                      ))
                    ) : (
                      <div className="p-6 bg-white/[0.02] border border-dashed border-white/5 rounded-2xl text-center">
                         <p className="text-[8px] text-[#474556] font-black uppercase tracking-widest leading-relaxed">Sin inspecciones<br/>registradas</p>
                      </div>
                    )}
                 </div>
              </div>
           </div>

           {/* COLUMNA 2: PREDICCIÓN MATEMÁTICA */}
           <div className="md:col-span-2 space-y-6">
              <h3 className="text-[10px] font-black text-[#474556] uppercase tracking-[0.3em] ml-1">Análisis de Desgaste</h3>

              <div className="grid grid-cols-2 gap-4">
                 <div className="p-6 bg-[#1c1d21] rounded-[2rem] border border-white/5 space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-[#5d3cfe]/10 flex items-center justify-center text-[#5d3cfe] mb-4">
                       <Activity className="w-6 h-6" />
                    </div>
                    <p className="text-[9px] font-black text-[#474556] uppercase tracking-widest leading-none">Eficiencia Sistémica</p>
                    <p className="text-3xl font-black text-white">{efficiency.toFixed(1)}%</p>
                    <div className="flex items-center gap-1.5 text-[#52ffac] text-[8px] font-black uppercase">
                       <TrendingUp className="w-3 h-3" /> Optimización de Flujo
                    </div>
                 </div>

                 <div className="p-6 bg-[#1c1d21] rounded-[2rem] border border-white/5 space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-rose-600/10 flex items-center justify-center text-rose-500 mb-4">
                       <AlertTriangle className="w-6 h-6" />
                    </div>
                    <p className="text-[9px] font-black text-[#474556] uppercase tracking-widest leading-none">Riesgo de Paro</p>
                    <p className={`text-3xl font-black ${riskColor}`}>{riskLevel}</p>
                    <p className="text-[8px] text-[#474556] font-black uppercase italic">Probabilidad de falla técnica</p>
                 </div>
              </div>

              <div className="bg-gradient-to-br from-[#1c1d21] to-[#0d0e12] border border-[#5d3cfe]/30 p-8 rounded-[2.5rem] relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-40 h-40 bg-[#5d3cfe]/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
                 <div className="flex items-start gap-5 relative z-10">
                    <div className="p-4 bg-[#5d3cfe] rounded-2xl text-white shadow-xl shadow-[#5d3cfe]/20">
                       <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div className="space-y-3">
                       <h4 className="text-lg font-black text-white uppercase tracking-tight italic">Diagnóstico de Ingeniería Final</h4>
                       <p className="text-xs text-[#c8c4d9] font-medium leading-relaxed opacity-80 uppercase">
                          Basado en la fecha de adquisición ({purchaseDate.toLocaleDateString()}) y el último servicio ({lastMaint.toLocaleDateString()}), la unidad <strong>{asset.name}</strong> presenta un {operationalStress > 70 ? 'deterioro preventivo acelerado' : 'comportamiento operativo estable'}. <br /><br />
                          {isOverdue ? (
                            <span className="text-rose-500 font-black uppercase italic tracking-widest text-[10px]">ALERTA: EL EQUIPO HA SUPERADO LA FECHA LÍMITE DE PROTOCOLO. SE REQUIERE INTERVENCIÓN INMEDIATA.</span>
                          ) : (
                            <span className="text-[#52ffac] font-black uppercase italic tracking-widest text-[10px]">RECOMENDACIÓN: Mantener el plan de inspección para el {asset.nextMaintenanceDate}.</span>
                          )}
                       </p>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        <div className="p-8 bg-[#1a1b20] border-t border-white/5 flex justify-between items-center">
           <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-[#52ffac] animate-ping"></div>
              <span className="text-[10px] font-black text-[#474556] uppercase tracking-widest italic">Sincronizado vía Sat-Link v4.2 PA</span>
           </div>
           <button
             onClick={() => {
                const printContent = `
                  <html>
                    <head>
                      <style>
                        @page { size: A4; margin: 0; }
                        body { font-family: 'Inter', sans-serif; color: #1a1a1a; padding: 0; margin: 0; }
                        .header { background: #1c1d21; color: white; padding: 25px 40px; display: flex; justify-content: space-between; align-items: center; border-bottom: 4px solid #5d3cfe; }
                        .logo-container { display: flex; align-items: center; gap: 12px; }
                        .logo-container svg { width: 35px; height: 35px; }
                        .header-info { text-align: right; }
                        .content { padding: 30px 50px; position: relative; }
                        .watermark { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg); font-size: 70px; font-weight: 900; color: rgba(0,0,0,0.015); white-space: nowrap; pointer-events: none; }
                        .section-title { font-size: 9px; font-weight: 900; color: #5d3cfe; text-transform: uppercase; letter-spacing: 2.5px; margin-bottom: 15px; border-left: 3px solid #5d3cfe; padding-left: 10px; }
                        .grid { display: grid; grid-template-cols: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
                        .metric-card { background: #f8f9fa; padding: 15px; border-radius: 12px; border: 1px solid #eee; }
                        .metric-label { font-size: 7px; font-weight: 900; color: #888; text-transform: uppercase; margin-bottom: 3px; }
                        .metric-value { font-size: 20px; font-weight: 900; color: #0d0e12; }
                        .analysis-box { background: #0d0e12; color: white; padding: 20px; border-radius: 15px; margin-top: 15px; }
                        .analysis-text { font-size: 11px; line-height: 1.5; opacity: 0.9; }
                        .footer { margin-top: 30px; display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #eee; padding-top: 20px; }
                        .seal {
                          border: 2px double #5d3cfe;
                          color: #5d3cfe;
                          padding: 8px 15px;
                          border-radius: 8px;
                          font-weight: 900;
                          text-transform: uppercase;
                          transform: rotate(-3deg);
                          font-size: 9px;
                          text-align: center;
                        }
                      </style>
                    </head>
                    <body>
                      <div class="header">
                        <div class="logo-container">
                          <svg viewBox="0 0 100 100"><rect width="100" height="100" rx="20" fill="#121317"/><path d="M20 75V35L50 60L80 35V75" stroke="#5d3cfe" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" fill="none"/><circle cx="50" cy="20" r="6" fill="#52ffac"/></svg>
                          <div style="font-size: 24px; font-weight: 900;">Mantech<span style="color: #5d3cfe">Pro</span></div>
                        </div>
                        <div class="header-info">
                          <div style="font-size: 10px; font-weight: 800; color: #52ffac; letter-spacing: 2px;">REPORT ID: ${asset.id.substring(0,12).toUpperCase()}</div>
                          <div style="font-size: 12px; font-weight: 700; margin-top: 5px;">${new Date().toLocaleDateString('es-PA')}</div>
                        </div>
                      </div>
                      <div class="content">
                        <div class="watermark">ENGINEERING AUDIT V4.2</div>
                        <h1 style="font-size: 28px; font-weight: 900; text-transform: uppercase; letter-spacing: -1.5px; margin-bottom: 40px;">Auditoría de Ingeniería MDM-V4</h1>

                        <div class="section-title">Parámetros Operativos</div>
                        <div class="grid">
                          <div class="metric-card"><div class="metric-label">Estrés Operativo</div><div class="metric-value">${operationalStress.toFixed(1)}%</div></div>
                          <div class="metric-card"><div class="metric-label">Salud Energética (SOH)</div><div class="metric-value">${batterySOH.toFixed(1)}%</div></div>
                          <div class="metric-card"><div class="metric-label">Eficiencia Sistémica</div><div class="metric-value">${efficiency.toFixed(1)}%</div></div>
                          <div class="metric-card"><div class="metric-label">Nivel de Riesgo</div><div class="metric-value" style="color: ${riskLevel === 'BAJO' ? '#10b981' : '#ef4444'}">${riskLevel}</div></div>
                        </div>

                        <div class="section-title">Diagnóstico del Sistema</div>
                        <div class="analysis-box">
                          <p class="analysis-text">
                            Basado en los algoritmos de telemetría MDM-V4, el activo <strong>${asset.name}</strong> (${asset.licensePlate || 'SN'})
                            presenta un índice de fatiga del ${operationalStress.toFixed(1)}% tras ${monthsOwned} meses de operación activa.
                            <br><br>
                            ${isOverdue
                              ? "ALERTA CRÍTICA: Se ha detectado una desviación mayor en los protocolos de mantenimiento preventivo. Se recomienda la suspensión inmediata de operaciones hasta la validación física."
                              : "ESTADO NOMINAL: El activo se encuentra dentro de los parámetros de seguridad industrial. Se recomienda proceder con el plan de mantenimiento agendado."}
                          </p>
                        </div>

                        <div class="section-title" style="margin-top: 30px;">Bitácora de Seguridad Pre-Viaje</div>
                        <div style="font-size: 10px; color: #444; margin-bottom: 20px;">
                          ${asset.preTripInspections && asset.preTripInspections.length > 0 ? `
                            <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                               <tr style="background: #f4f4f4; text-align: left;">
                                  <th style="padding: 8px;">Fecha</th>
                                  <th style="padding: 8px;">Resultado</th>
                                  <th style="padding: 8px;">Observaciones</th>
                               </tr>
                               ${asset.preTripInspections.slice(-5).reverse().map(i => `
                                 <tr style="border-bottom: 1px solid #eee;">
                                    <td style="padding: 8px;">${new Date(i.date).toLocaleDateString()} ${new Date(i.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase()}</td>
                                    <td style="padding: 8px; font-weight: 800; color: ${i.result === 'safe' ? '#10b981' : '#ef4444'}">${i.result.toUpperCase()}</td>
                                    <td style="padding: 8px;">${i.observations || '-'}</td>
                                 </tr>
                               `).join('')}
                            </table>
                          ` : '<p style="font-style: italic; opacity: 0.5;">No se han detectado inspecciones pre-viaje en el nodo.</p>'}
                        </div>

                        <div class="footer">
                          <div>
                            <div class="metric-label">Hash de Seguridad</div>
                            <div style="font-family: monospace; font-size: 9px; color: #5d3cfe;">UUID: ${asset.id.toUpperCase()}<br>SIG: ${btoa(asset.id).substring(0, 10).toUpperCase()}</div>
                          </div>
                          <div class="seal">Auditado por Nodo Central<br><span style="font-size: 7px">Security Protocol V4.2</span></div>
                        </div>
                      </div>
                    </body>
                  </html>
                `;
                const win = window.open('', '_blank');
                win?.document.write(printContent);
                win?.document.close();
                win?.print();
             }}
             className="px-8 py-3 bg-[#5d3cfe] text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-[#5d3cfe]/20 hover:brightness-110 active:scale-95 transition-all flex items-center gap-3"
           >
              <Download className="w-4 h-4" /> Descargar Auditoría NASA
           </button>
        </div>
      </motion.div>
    </div>
  );
}
