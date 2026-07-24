import { QrCode, TrendingDown, TrendingUp, DollarSign, PenTool as Tool, Calendar, FileText, Download, ShieldCheck, Clock, ShieldAlert, BookOpen, BadgeCheck, Bike } from 'lucide-react';

interface AssetIntelligentCardProps {
  asset: Asset;
  requests: JobRequest[];
  onOpenDetails: (asset: Asset) => void;
  onOpenPreTrip: (asset: Asset) => void;
}

export default function AssetIntelligentCard({ asset, requests, onOpenDetails, onOpenPreTrip }: AssetIntelligentCardProps) {
  // Idea 2: Cálculo de Costo Operativo Real
  const assetRequests = requests.filter(r => r.assetId === asset.id && r.status === 'completed');
  const totalSpend = assetRequests.reduce((sum, r) => sum + (r.price || 0), 0);

  const unit = asset.type === 'generator' || asset.type === 'industrial_equip' ? 'Hora' : 'KM';
  const usage = asset.mileage || asset.usageHours || 1;
  const costPerUnit = totalSpend / usage;

  // Cálculo de Garantía
  const isUnderWarranty = asset.purchaseDate && asset.warrantyMonths &&
    (new Date(asset.purchaseDate).setMonth(new Date(asset.purchaseDate).getMonth() + asset.warrantyMonths) > Date.now());

  // Idea 1: QR Code dinámico
  const qrData = `https://mantechpro.pa/asset/${asset.id}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}&bgcolor=121317&color=ffffff`;

  return (
    <div className="bg-[#121317] border border-white/5 rounded-[2.5rem] overflow-hidden group hover:border-[#5d3cfe]/50 transition-all shadow-2xl">
      {/* Visual Header */}
      <div className="h-32 bg-gradient-to-br from-[#1c1d21] to-[#0d0e12] p-6 flex justify-between items-start relative overflow-hidden">
        <div className="relative z-10">
          <h4 className="text-lg font-black text-white uppercase tracking-tight leading-none">{asset.name}</h4>
          <p className="text-[10px] font-black text-[#5d3cfe] uppercase tracking-widest mt-1">{asset.licensePlate || asset.serialNumber}</p>
        </div>

        {/* Idea 1: Botón QR Flotante */}
        <button
          onClick={(e) => { e.stopPropagation(); window.open(qrUrl, '_blank'); }}
          className="relative z-10 p-2 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-[#5d3cfe] transition-all group/qr"
        >
          <QrCode className="w-5 h-5" />
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-black text-[7px] font-black uppercase py-1 px-2 rounded opacity-0 group-hover/qr:opacity-100 transition-opacity whitespace-nowrap">
            Imprimir QR
          </div>
        </button>

        {/* Decoración de fondo */}
        <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity transform rotate-12">
          {asset.type === 'moto' ? <Bike className="w-24 h-24 text-white" /> : <Tool className="w-24 h-24 text-white" />}
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Idea 2: Métricas de Costo Operativo */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-[#0d0e12] rounded-2xl border border-white/5">
            <span className="text-[8px] font-black text-[#474556] uppercase tracking-widest block mb-1">Gasto Total</span>
            <p className="text-sm font-black text-white leading-none">${totalSpend.toLocaleString()}</p>
          </div>
          <div className="p-4 bg-[#0d0e12] rounded-2xl border border-white/5">
            <span className="text-[8px] font-black text-[#474556] uppercase tracking-widest block mb-1">Costo por {unit}</span>
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-black text-[#52ffac] leading-none">${costPerUnit.toFixed(2)}</p>
              {costPerUnit > 0.5 ? <TrendingUp className="w-3 h-3 text-rose-500" /> : <TrendingDown className="w-3 h-3 text-[#52ffac]" />}
            </div>
          </div>
        </div>

        {/* Bóveda de Garantías */}
        {asset.purchaseDate && (
           <div className={`p-4 rounded-2xl border flex items-center justify-between ${isUnderWarranty ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-rose-500/5 border-rose-500/20'}`}>
              <div className="flex items-center gap-3">
                 <BadgeCheck className={`w-5 h-5 ${isUnderWarranty ? 'text-[#52ffac]' : 'text-rose-500'}`} />
                 <div>
                    <p className="text-[8px] font-black text-[#474556] uppercase tracking-widest leading-none">Estatus de Garantía</p>
                    <h5 className="text-white font-bold uppercase text-[10px] mt-1">{isUnderWarranty ? 'Vigente' : 'Vencida'}</h5>
                 </div>
              </div>
              <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">{asset.warrantyMonths} meses</span>
           </div>
        )}

        {/* Resumen de Estado y Predicción */}
        <div className="space-y-4">
          <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-2">
            <p className="text-[8px] font-black text-[#5d3cfe] uppercase tracking-[0.2em] flex items-center gap-2">
              <Clock className="w-3 h-3" /> Predicción Mantech IA
            </p>
            <div className="flex justify-between items-end">
              <span className="text-[10px] font-bold text-white uppercase tracking-tight">Próximo Mtto.</span>
              <span className="text-xs font-black text-[#52ffac]">{asset.usageStats?.predictedMaintenanceDate || asset.nextMaintenanceDate}</span>
            </div>
            <p className="text-[7px] text-[#474556] font-medium italic">Basado en promedio diario de {asset.usageStats?.dailyAvgKm || 0} KM.</p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); onOpenPreTrip(asset); }}
              className="flex-1 py-3 bg-white/5 border border-white/10 text-white rounded-xl text-[8px] font-black uppercase flex items-center justify-center gap-2 hover:bg-[#5d3cfe] transition-all"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#52ffac]" /> Checklist Pre-Viaje
            </button>
            <button
              onClick={() => onOpenDetails(asset)}
              className="flex-1 py-3 bg-[#1c1d21] text-white border border-white/5 rounded-xl text-[8px] font-black uppercase hover:bg-white hover:text-black transition-all"
            >
              Combustible ➔
            </button>
          </div>
        </div>

        <button
          onClick={() => {
            const printContent = `
              <html>
                <body style="font-family: sans-serif; padding: 40px; background: #fff;">
                  <h1 style="color: #5d3cfe; border-bottom: 2px solid #5d3cfe; padding-bottom: 10px;">Certificado de Salud: ${asset.name}</h1>
                  <p><strong>Placa:</strong> ${asset.licensePlate || 'N/A'}</p>
                  <p><strong>Odómetro Actual:</strong> ${asset.mileage || 0} KM</p>
                  <p><strong>Gasto Acumulado:</strong> $${totalSpend}</p>
                  <p><strong>Costo por KM:</strong> $${costPerUnit.toFixed(2)}</p>
                  <hr/>
                  <h3>Últimas 5 Inspecciones de Seguridad:</h3>
                  <ul>
                    ${asset.preTripInspections?.slice(-5).map(ins => `
                      <li>${new Date(ins.date).toLocaleDateString()} - Resultado: ${ins.result === 'safe' ? 'OK' : 'ALERTA'}</li>
                    `).join('') || 'Sin registros'}
                  </ul>
                  <p style="font-size: 10px; color: #888; margin-top: 50px;">Generado por MantechPro Panama - Protocolo Sat-Link V4</p>
                </body>
              </html>
            `;
            const win = window.open('', '_blank');
            win?.document.write(printContent);
            win?.document.close();
            win?.print();
          }}
          className="w-full py-4 bg-white/5 text-white border border-white/5 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] hover:bg-emerald-500 hover:text-black transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          <FileText className="w-4 h-4" /> Generar Certificado PDF
        </button>
      </div>
    </div>
  );
}
