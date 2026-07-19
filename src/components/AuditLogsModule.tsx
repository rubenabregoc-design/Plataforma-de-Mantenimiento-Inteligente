import React from 'react';
import { Clock, User, Shield, Info, Download } from 'lucide-react';
import * as XLSX from 'xlsx';

interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  timestamp: any;
  platform: string;
}

interface Props {
  logs: AuditLog[];
}

export default function AuditLogsModule({ logs }: Props) {
  const exportLogs = () => {
    const data = logs.map(l => ({
      Fecha: l.timestamp?.toDate().toLocaleString() || 'N/A',
      Usuario: l.userName,
      ID_Usuario: l.userId,
      Accion: l.action,
      Detalles: l.details,
      Plataforma: l.platform
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Audit Logs");
    const dateStr = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `MantechPro_Audit_Logs_${dateStr}.xlsx`);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
           <h3 className="text-2xl font-black text-white uppercase tracking-tighter italic">Historial de Actividad</h3>
           <p className="text-[10px] font-black text-[#474556] uppercase tracking-[0.3em] mt-1">Trazabilidad completa del sistema operativo</p>
        </div>
        <button
          onClick={exportLogs}
          className="flex items-center gap-3 px-6 py-3 bg-[#1c1d21] border border-white/5 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all"
        >
          <Download className="w-4 h-4" /> Exportar Logs
        </button>
      </div>

      <div className="bg-[#121317] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/40 border-b border-white/5">
                <th className="px-8 py-5 text-[9px] font-black text-[#474556] uppercase tracking-widest">Tiempo</th>
                <th className="px-8 py-5 text-[9px] font-black text-[#474556] uppercase tracking-widest">Usuario</th>
                <th className="px-8 py-5 text-[9px] font-black text-[#474556] uppercase tracking-widest">Acción</th>
                <th className="px-8 py-5 text-[9px] font-black text-[#474556] uppercase tracking-widest">Detalles</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.02]">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                       <Clock className="w-3.5 h-3.5 text-[#5d3cfe]" />
                       <span className="text-[11px] font-bold text-white/60">
                         {log.timestamp?.toDate().toLocaleString() || 'Sincronizando...'}
                       </span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-full bg-[#5d3cfe]/10 flex items-center justify-center border border-[#5d3cfe]/20 text-[#5d3cfe]">
                          <User className="w-4 h-4" />
                       </div>
                       <div>
                          <p className="text-xs font-black text-white uppercase tracking-tight">{log.userName}</p>
                          <p className="text-[8px] font-bold text-[#474556] tracking-widest uppercase">ID: {log.userId.substring(0,8)}...</p>
                       </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                      log.action.includes('DELETE') ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' :
                      log.action.includes('CREATE') ? 'bg-[#52ffac]/10 text-[#52ffac] border border-[#52ffac]/20' :
                      'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                    }`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                       <Info className="w-3.5 h-3.5 text-[#474556]" />
                       <p className="text-[11px] font-bold text-[#c8c4d9] leading-relaxed">{log.details}</p>
                    </div>
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center">
                    <Shield className="w-12 h-12 text-[#1c1d21] mx-auto mb-4" />
                    <p className="text-[10px] font-black text-[#474556] uppercase tracking-[0.4em]">Sin registros de actividad</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
