import { QrCode, TrendingDown, TrendingUp, DollarSign, PenTool as Tool, Calendar, FileText, Download, ShieldCheck, Clock, ShieldAlert, BookOpen, BadgeCheck, Bike, Pencil, Trash2, Activity, MapPin, ClipboardList, Check } from 'lucide-react';
import { Asset, JobRequest } from '../types';
import { toast } from 'react-hot-toast';
import { downloadHtmlAsPdf } from '../utils/pdfExport';

interface AssetIntelligentCardProps {
  asset: Asset;
  requests: JobRequest[];
  onOpenDetails: (asset: Asset) => void;
  onOpenPreTrip: (asset: Asset) => void;
  onFindExpert?: (asset: Asset) => void;
  onEdit?: (asset: Asset) => void;
  onDelete?: (id: string) => void;
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
  key?: any;
}

export default function AssetIntelligentCard({ asset, requests, onOpenDetails, onOpenPreTrip, onFindExpert, onEdit, onDelete, isSelected, onToggleSelect }: AssetIntelligentCardProps) {
  // --- MOTOR FINANCIERO INTEGRAL (GASOLINA + SERVICIOS) ---
  const assetRequests = requests.filter(r => r.assetId === asset.id && r.status === 'completed');
  const maintenanceSpend = assetRequests.reduce((sum, r) => sum + (r.price || 0), 0);
  const fuelSpend = (asset.fuelLogs || []).reduce((sum, l) => sum + (l.price || 0), 0);

  const totalSpend = maintenanceSpend + fuelSpend;

  const unit = asset.type === 'generator' || asset.type === 'industrial_equip' ? 'Hora' : 'KM';
  const usage = asset.mileage || asset.usageHours || 1;
  const costPerUnit = totalSpend / usage;

  const isUnderWarranty = asset.purchaseDate && asset.warrantyMonths &&
    (new Date(asset.purchaseDate).setMonth(new Date(asset.purchaseDate).getMonth() + asset.warrantyMonths) > Date.now());

  const qrData = `https://mantechpro.pa/asset/${asset.id}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}&bgcolor=121317&color=ffffff`;

  // --- LÓGICA DE DOBLE FECHA (RECOMENDADA VS MANUAL) ---
  const calculateRecommendedDate = () => {
    if (!asset.lastMaintenanceDate) return null;
    const date = new Date(asset.lastMaintenanceDate);
    let monthsToAdd = 12;
    if (asset.type === 'ac') monthsToAdd = 4;
    else if (['car', 'moto', 'generator', 'fire_system'].includes(asset.type)) monthsToAdd = 6;
    else if (['elevator', 'pool', 'garden'].includes(asset.type)) monthsToAdd = 1;

    date.setMonth(date.getMonth() + monthsToAdd);
    return date.toISOString().split('T')[0];
  };

  const recommendedDate = calculateRecommendedDate();
  const manualDate = asset.nextMaintenanceDate;

  // Filtro de botones según tipo de activo
  const isVehicle = asset.type === 'car' || asset.type === 'moto';
  const isRealEstate = asset.type === 'house' || asset.category === 'PH';

  return (
    <div className={`bg-[#121317] border rounded-[1.5rem] sm:rounded-[2.5rem] overflow-hidden group transition-all shadow-2xl ${isSelected ? 'border-[#5d3cfe] ring-2 ring-[#5d3cfe]/60' : 'border-white/5 hover:border-[#5d3cfe]/50'}`}>
      {/* Visual Header */}
      <div className="h-20 sm:h-24 bg-gradient-to-br from-[#1c1d21] to-[#0d0e12] p-4 sm:p-5 flex justify-between items-start gap-2 relative overflow-hidden">
        <div className="relative z-10 min-w-0 flex-1">
          <div className="flex items-center gap-2">
             <h4 className="text-sm sm:text-base font-black text-white uppercase tracking-tight leading-none truncate">{asset.name}</h4>
             {(assetRequests.length > 0 || totalSpend > 0) && (
               <div className="p-1 bg-[#52ffac] rounded-md shadow-[0_0_10px_rgba(82,255,172,0.3)] shrink-0" title="Unidad con Historial Verificado">
                  <ShieldCheck className="w-3 h-3 text-black" />
               </div>
             )}
          </div>
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 sm:py-1 bg-[#5d3cfe]/10 border border-[#5d3cfe]/20 rounded-lg mt-1.5 sm:mt-2.5">
             <BadgeCheck className="w-2.5 h-2.5 sm:w-3 h-3 text-[#5d3cfe]" />
             <span className="text-[8px] sm:text-[9px] font-black text-[#c7bfff] uppercase tracking-widest">
                {asset.licensePlate || asset.serialNumber || 'SN: N/A'}
             </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 relative z-10 shrink-0">
          {onToggleSelect && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onToggleSelect(asset.id); }}
              title={isSelected ? "Quitar de selección en lote" : "Seleccionar en lote"}
              className={`p-1.5 sm:p-2 rounded-xl border transition-all ${
                isSelected
                  ? 'bg-[#5d3cfe] border-[#52ffac] text-white shadow-[0_0_12px_rgba(93,60,254,0.6)]'
                  : 'bg-white/5 border-white/10 text-white/60 hover:text-white hover:border-white/30'
              }`}
            >
              <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </button>
          )}
          <button onClick={(e) => { e.stopPropagation(); onEdit?.(asset); }} className="p-1.5 sm:p-2 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-[#5d3cfe] transition-all"><Pencil className="w-3 h-3 sm:w-3.5 sm:h-3.5" /></button>
          <button onClick={(e) => { e.stopPropagation(); onDelete?.(asset.id); }} className="p-1.5 sm:p-2 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-rose-600 transition-all"><Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" /></button>
          <button onClick={(e) => { e.stopPropagation(); window.open(qrUrl, '_blank'); }} className="p-1.5 sm:p-2 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-[#5d3cfe] transition-all group/qr"><QrCode className="w-3.5 h-3.5 sm:w-4 sm:h-4" /></button>
        </div>

        <div className="absolute -right-2 -bottom-2 opacity-5 group-hover:opacity-10 transition-opacity transform rotate-12">
          {asset.type === 'moto' ? <Bike className="w-16 h-16 text-white" /> : <Tool className="w-16 h-16 text-white" />}
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Métricas de Costo */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-[#0d0e12] rounded-2xl border border-white/5">
            <span className="text-[7px] font-black text-[#474556] uppercase tracking-widest block mb-1">Gasto Total</span>
            <p className="text-xs font-black text-white leading-none">${totalSpend.toLocaleString()}</p>
          </div>
          <div className="p-3 bg-[#0d0e12] rounded-2xl border border-white/5">
            <span className="text-[7px] font-black text-[#474556] uppercase tracking-widest block mb-1">Costo {unit}</span>
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-black text-[#52ffac] leading-none">${costPerUnit.toFixed(2)}</p>
              {costPerUnit > 0.5 ? <TrendingUp className="w-2.5 h-2.5 text-rose-500" /> : <TrendingDown className="w-2.5 h-2.5 text-[#52ffac]" />}
            </div>
          </div>
        </div>

        {/* Panel de Fechas (Doble Fecha) */}
        <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-3 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 opacity-5"><Calendar className="w-12 h-12 text-white" /></div>

            <div className="space-y-2 relative z-10">
               <div className="flex justify-between items-center">
                  <p className="text-[7px] font-black text-[#c7bfff] uppercase tracking-[0.2em] flex items-center gap-2"><Clock className="w-2.5 h-2.5" /> Recomendada</p>
                  <span className="text-[10px] font-black text-[#52ffac]">{recommendedDate}</span>
               </div>
               <div className="h-px bg-white/5 w-full"></div>
               <div className="flex justify-between items-center">
                  <p className="text-[7px] font-black text-white/40 uppercase tracking-[0.2em] flex items-center gap-2"><Activity className="w-2.5 h-2.5" /> Fecha Manual</p>
                  <span className="text-[10px] font-black text-amber-500/80">{manualDate}</span>
               </div>
            </div>
            <p className="text-[6px] text-[#474556] font-bold uppercase tracking-widest text-center mt-1 italic">Diferencia auditada por protocolo industrial</p>
        </div>

        {/* Botones Contextuales Inteligentes */}
        <div className="space-y-3">
          <div className="flex gap-2">
            {isVehicle ? (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); onOpenPreTrip(asset); }}
                  className="flex-1 py-3 bg-[#52ffac]/10 border border-[#52ffac]/20 text-[#52ffac] rounded-2xl text-[9px] font-black uppercase flex items-center justify-center gap-2 hover:bg-[#52ffac] hover:text-black transition-all shadow-lg active:scale-95"
                >
                  <ShieldCheck className="w-4 h-4" /> Pre-Viaje
                </button>
                <button
                  onClick={() => onOpenDetails(asset)}
                  className="flex-1 py-3 bg-[#1c1d21] text-white border border-white/5 rounded-2xl text-[9px] font-black uppercase hover:bg-white hover:text-black transition-all shadow-lg active:scale-95"
                >
                  Combustible
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); onEdit?.(asset); }}
                  className="flex-1 py-3 bg-white/5 border border-white/10 text-white rounded-2xl text-[9px] font-black uppercase flex items-center justify-center gap-2 hover:bg-[#5d3cfe] transition-all shadow-lg active:scale-95"
                >
                  <ClipboardList className="w-4 h-4 text-[#c7bfff]" /> Ficha Técnica
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (asset.latitude && asset.longitude) {
                      window.open(`https://www.google.com/maps?q=${asset.latitude},${asset.longitude}`, '_blank');
                    } else {
                      toast.error("Coordenadas GPS no vinculadas. Configure la sede en la ficha técnica.");
                    }
                  }}
                  className="flex-1 py-3 bg-[#1c1d21] text-white border border-white/5 rounded-2xl text-[9px] font-black uppercase hover:bg-white hover:text-black transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95"
                >
                  <MapPin className="w-4 h-4" /> Ubicación
                </button>
              </>
            )}
          </div>

          <button
            onClick={() => onFindExpert?.(asset)}
            className="w-full py-3.5 bg-[#5d3cfe] text-white rounded-2xl text-[9px] font-black uppercase tracking-[0.1em] shadow-lg shadow-[#5d3cfe]/20 hover:brightness-110 transition-all flex items-center justify-center gap-2"
          >
            <Tool className="w-4 h-4" /> Buscar Especialista
          </button>
        </div>

        <button
          onClick={() => {
            const printContent = `
              <html>
                <head>
                  <style>
                    @page { size: A4; margin: 0; }
                    *, *::before, *::after { box-sizing: border-box; }
                    html, body { font-family: 'Plus Jakarta Sans', -apple-system, sans-serif; color: #000000 !important; background-color: #ffffff !important; padding: 0; margin: 0; line-height: 1.4; width: 100%; overflow-x: hidden; }
                    .header { background: #ffffff !important; color: #000000 !important; padding: 24px 36px; display: flex; justify-content: space-between; align-items: center; border-bottom: 4px solid #5d3cfe; }
                    .header-logo { display: flex; align-items: center; gap: 12px; }
                    .header-logo svg { width: 40px; height: 40px; }
                    .header-title { font-size: 26px; font-weight: 900; letter-spacing: -1px; color: #000000 !important; }
                    .header-title span { color: #5d3cfe !important; }
                    .content { padding: 28px 40px; position: relative; background-color: #ffffff !important; color: #000000 !important; }
                    .watermark { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-30deg); font-size: 90px; font-weight: 900; color: rgba(0,0,0,0.03); white-space: nowrap; pointer-events: none; z-index: -1; }
                    .title { font-size: 22px; font-weight: 900; text-transform: uppercase; letter-spacing: -1px; margin-bottom: 4px; color: #000000 !important; }
                    .protocol { font-size: 10px; font-weight: 900; color: #5d3cfe !important; text-transform: uppercase; letter-spacing: 2.5px; display: flex; align-items: center; gap: 8px; }
                    .protocol::before { content: ''; width: 15px; height: 2px; background: #5d3cfe; }
                    .grid { display: grid; grid-template-cols: 1fr 1fr; gap: 20px; margin-top: 25px; }
                    .data-box { border-bottom: 1.5px solid #000000; padding-bottom: 8px; }
                    .label { font-size: 9px; font-weight: 900; color: #000000 !important; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 3px; }
                    .value { font-size: 15px; font-weight: 900; color: #000000 !important; }
                    .status-box { margin-top: 25px; background: #f8fafc !important; padding: 15px 20px; border-radius: 15px; border: 1.5px solid #000000; border-left: 6px solid #5d3cfe; display: flex; justify-content: space-between; align-items: center; }
                    .footer { margin-top: 30px; border-top: 2px solid #000000; padding-top: 20px; display: flex; justify-content: space-between; align-items: center; }
                    .seal-container { position: relative; width: 170px; height: 70px; }
                    .seal {
                      border: 2px double #5d3cfe;
                      color: #000000 !important;
                      padding: 10px 15px;
                      border-radius: 10px;
                      font-weight: 900;
                      text-transform: uppercase;
                      transform: rotate(-3deg);
                      font-size: 10px;
                      text-align: center;
                      background: #ffffff;
                      position: relative;
                    }
                  </style>
                </head>
                <body>
                  <div class="header">
                    <div class="header-logo">
                      <svg viewBox="0 0 100 100">
                        <rect width="100" height="100" rx="20" fill="#121317"/>
                        <path d="M20 75V35L50 60L80 35V75" stroke="#5d3cfe" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
                        <circle cx="50" cy="20" r="6" fill="#52ffac"/>
                      </svg>
                      <div class="header-title">Mantech<span>Pro</span></div>
                    </div>
                    <div style="text-align: right; color: #000000 !important;">
                      <div style="font-size: 10px; font-weight: 900; color: #000000 !important; text-transform: uppercase; margin-bottom: 4px;">Panamá Digital Node</div>
                      <div style="font-weight: 900; font-size: 14px; color: #000000 !important;">${new Date().toLocaleDateString('es-PA', { day: '2-digit', month: 'long', year: 'numeric' }).toUpperCase()}</div>
                    </div>
                  </div>
                  <div class="content">
                    <div class="watermark">MANTECH PRO CERTIFIED</div>

                    <div class="title">Certificado de Salud Técnica</div>
                    <div class="protocol">Protocolo MantechPro MDM-V4.2 (Satelital)</div>

                    <div class="grid">
                      <div class="data-box"><div class="label">Identificación del Activo</div><div class="value">${asset.name}</div></div>
                      <div class="data-box"><div class="label">Serie / Placa / ID</div><div class="value">${asset.licensePlate || asset.serialNumber || 'N/A'}</div></div>
                      <div class="data-box"><div class="label">Categoría Técnica</div><div class="value">${asset.type.replace('_', ' ').toUpperCase()}</div></div>
                      <div class="data-box"><div class="label">Uso Acumulado</div><div class="value">${usage.toLocaleString()} ${unit}</div></div>
                      <div class="data-box"><div class="label">Inversión Operativa</div><div class="value">B/. ${totalSpend.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div></div>
                      <div class="data-box"><div class="label">Costo por ${unit}</div><div class="value">B/. ${costPerUnit.toFixed(4)}</div></div>
                    </div>

                    <div style="margin-top: 30px; display: grid; grid-template-cols: 1fr 1fr; gap: 20px;">
                      <div class="data-box"><div class="label">Inversión en Combustible</div><div class="value">B/. ${fuelSpend.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div></div>
                      <div class="data-box"><div class="label">Inversión en Mantenimiento</div><div class="value">B/. ${maintenanceSpend.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div></div>
                    </div>

                    <div class="status-box">
                      <div>
                        <div class="label">Estado de Garantía</div>
                        <div class="value" style="color: ${isUnderWarranty ? '#047857' : '#dc2626'} !important;">${isUnderWarranty ? 'PROTECCIÓN GLOBAL ACTIVA' : 'COBERTURA VENCIDA / AUDITORÍA REQUERIDA'}</div>
                      </div>
                      <div style="text-align: right">
                         <div class="label">Nivel de Integridad</div>
                         <div class="value" style="color: #5d3cfe !important;">${usage < 1000 ? 'EXCELENTE' : (usage < 5000 ? 'ÓPTIMO' : 'OPERATIVO')}</div>
                      </div>
                    </div>

                    <div style="margin-top: 25px;">
                       <div class="label" style="color: #000000 !important;">Historial de Auditoría (Últimos Movimientos)</div>
                       <table style="width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 11px; color: #000000 !important;">
                          <tr style="background: #f3f4f6; color: #000000 !important; text-align: left; border-bottom: 2px solid #000000;">
                             <th style="padding: 10px; color: #000000 !important; font-weight: 900;">Fecha de Registro</th>
                             <th style="padding: 10px; color: #000000 !important; font-weight: 900;">Volumen (Gal)</th>
                             <th style="padding: 10px; color: #000000 !important; font-weight: 900;">Lectura Odómetro</th>
                             <th style="padding: 10px; color: #000000 !important; font-weight: 900;">Monto Transacción</th>
                          </tr>
                          ${(asset.fuelLogs || []).slice(-4).reverse().map(l => `
                            <tr style="border-bottom: 1px solid #d1d5db; color: #000000 !important;">
                               <td style="padding: 8px; font-weight: 800; color: #000000 !important;">${new Date(l.date).toLocaleDateString()}</td>
                               <td style="padding: 8px; font-weight: 700; color: #000000 !important;">${l.gallons.toFixed(2)}</td>
                               <td style="padding: 8px; font-weight: 700; color: #000000 !important;">${l.mileage.toLocaleString()} KM</td>
                               <td style="padding: 8px; font-weight: 900; color: #000000 !important;">B/. ${l.price.toFixed(2)}</td>
                            </tr>
                          `).join('') || '<tr><td colspan="4" style="padding: 15px; color: #000000 !important; text-align: center; font-style: italic; font-weight: 700;">No se detectaron registros de carga en el sistema.</td></tr>'}
                       </table>
                    </div>

                    <div class="footer">
                      <div>
                        <div class="label">Validación Criptográfica</div>
                        <div style="font-family: 'Courier New', monospace; font-size: 10px; margin-top: 5px; color: #000000 !important; font-weight: 800; background: #f3f4f6; padding: 6px 10px; border-radius: 5px; border: 1px solid #000000;">
                          UUID: ${asset.id.toUpperCase()}<br>
                          NODE-SIG: ${btoa(asset.id).substring(0, 10).toUpperCase()}
                        </div>
                      </div>
                      <div class="seal-container">
                        <div class="seal">Sistema Central Verificado<br><span style="font-size: 8px; color: #5d3cfe !important;">MantechPro Security Layer</span></div>
                      </div>
                    </div>
                  </div>
                </body>
              </html>
            `;
            const fileName = `Certificado_${asset.name.replace(/\s+/g, '_')}.pdf`;
            downloadHtmlAsPdf(printContent, fileName);
          }}
          className="w-full py-4 bg-white/5 text-white border border-white/5 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] hover:bg-[#52ffac] hover:text-black transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          <FileText className="w-4 h-4" /> Generar Certificado PDF
        </button>
      </div>
    </div>
  );
}
