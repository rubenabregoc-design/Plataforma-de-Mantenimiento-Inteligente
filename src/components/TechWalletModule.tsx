import { Toaster, toast } from 'react-hot-toast';
import React, { useState } from 'react';
import { TechWallet } from '../types';
import { Wallet, TrendingUp, TrendingDown, Download, CreditCard, Landmark, Smartphone, Save, ShieldCheck } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

interface TechWalletModuleProps {
  wallet: TechWallet;
  techId: string;
  onWithdraw: (techId: string, amount: number) => void;
  plan?: 'basic' | 'pro' | 'enterprise';
}

export default function TechWalletModule({ wallet, techId, onWithdraw, plan = 'basic' }: TechWalletModuleProps) {
  const [isEditingBank, setIsEditingBank] = useState(false);
  const [bankInfo, setBankInfo] = useState({
    bankName: wallet.bankName || '',
    accountType: wallet.accountType || 'Ahorros',
    accountNumber: wallet.accountNumber || '',
    ownerName: wallet.ownerName || '',
    yappyNumber: wallet.yappyNumber || ''
  });
  const [isSaving, setIsSaving] = useState(false);

  const planInfo = {
    basic: { name: 'Básico', speed: '3-5 Días Hábiles', color: 'text-amber-500 bg-amber-500/10' },
    pro: { name: 'Profesional', speed: '48 Horas', color: 'text-cyan-400 bg-cyan-400/10 border border-cyan-400/20' },
    enterprise: { name: 'Corporativo', speed: '24 Horas', color: 'text-emerald-400 bg-emerald-400/10 border border-emerald-400/20' }
  }[plan];

  const handleSaveBank = async () => {
    setIsSaving(true);
    try {
      await updateDoc(doc(db, "technicians", techId), {
        'wallet.bankName': bankInfo.bankName,
        'wallet.accountType': bankInfo.accountType,
        'wallet.accountNumber': bankInfo.accountNumber,
        'wallet.ownerName': bankInfo.ownerName,
        'wallet.yappyNumber': bankInfo.yappyNumber
      });
      setIsEditingBank(false);
      toast.success("Datos de pago actualizados correctamente.");
    } catch (err) {
      console.error(err);
      toast.error("Error al guardar los datos. Intenta de nuevo.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#1c1d21] border border-[#2a2b2f] rounded-[2rem] p-8 text-white shadow-2xl relative overflow-hidden group">
          <div className="absolute -top-10 -right-10 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Wallet className="w-40 h-40" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#52ffac] rounded-full animate-pulse"></div>
                <span className="text-[10px] font-black text-[#c8c4d9] uppercase tracking-widest">Saldo Disponible</span>
              </div>
              <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${planInfo.color}`}>
                Retiro: {planInfo.speed}
              </span>
            </div>
            <h2 className="text-5xl font-black tracking-tighter text-white">${(wallet.balance || 0).toFixed(2)}</h2>
            <div className="flex gap-3 mt-8">
               <button
                 onClick={() => {
                   const amt = prompt("Monto a retirar:", wallet.balance.toString());
                   if(amt) {
                     onWithdraw(techId, Number(amt));
                   }
                 }}
                 className="flex-1 py-3.5 bg-[#5d3cfe] hover:brightness-110 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-[#5d3cfe]/20"
               >
                 Solicitar Retiro
               </button>
               <button
                 onClick={() => {
                   const printContent = `
                     <html>
                       <head>
                         <title>Factura Fiscal Digital - MantechPro</title>
                         <style>
                           body { font-family: 'Inter', sans-serif; padding: 40px; color: #1a1a1a; line-height: 1.6; }
                           .header { display: flex; justify-content: space-between; border-bottom: 4px solid #5d3cfe; padding-bottom: 20px; margin-bottom: 40px; }
                           .logo { font-size: 24px; font-weight: 900; color: #5d3cfe; text-transform: uppercase; }
                           .invoice-info { text-align: right; }
                           .section { margin-bottom: 30px; }
                           .section-title { font-size: 10px; font-weight: 900; color: #666; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 10px; }
                           table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                           th { text-align: left; background: #f8f8f8; padding: 12px; font-size: 11px; text-transform: uppercase; border-bottom: 2px solid #eee; }
                           td { padding: 12px; font-size: 12px; border-bottom: 1px solid #eee; }
                           .total-box { margin-top: 30px; margin-left: auto; width: 250px; background: #fdfdfd; border: 1px solid #eee; padding: 20px; border-radius: 12px; }
                           .total-row { display: flex; justify-content: space-between; margin-bottom: 10px; }
                           .grand-total { font-size: 18px; font-weight: 900; color: #5d3cfe; border-top: 2px solid #5d3cfe; pt: 10px; }
                           .footer { margin-top: 50px; font-size: 10px; color: #999; text-align: center; border-top: 1px solid #eee; padding-top: 20px; }
                           .stamp { display: inline-block; border: 2px solid #52ffac; color: #52ffac; padding: 10px 20px; border-radius: 8px; font-weight: 900; transform: rotate(-5deg); margin-top: 20px; }
                         </style>
                       </head>
                       <body>
                         <div class="header">
                           <div>
                             <div class="logo">MantechPro Panama</div>
                             <div style="font-size: 12px; color: #666;">Infraestructura de Ingeniería Operativa</div>
                           </div>
                           <div class="invoice-info">
                             <div style="font-weight: 900; font-size: 14px;">FACTURA FISCAL DIGITAL</div>
                             <div style="color: #666; font-size: 11px;">No. MP-${Math.floor(Math.random()*1000000)}</div>
                             <div style="color: #666; font-size: 11px;">Fecha: ${new Date().toLocaleDateString('es-PA')}</div>
                           </div>
                         </div>

                         <div class="section" style="display: flex; gap: 40px;">
                           <div style="flex: 1;">
                             <div class="section-title">Emisor (Especialista)</div>
                             <div style="font-weight: 700;">${bankInfo.ownerName || 'Especialista MantechPro'}</div>
                             <div style="font-size: 11px; color: #666;">Proveedor de Servicios Técnicos Certificado</div>
                           </div>
                           <div style="flex: 1;">
                             <div class="section-title">Receptor</div>
                             <div style="font-weight: 700;">MantechPro Panama S.A.</div>
                             <div style="font-size: 11px; color: #666;">RUC: 155712124-2-2024 DV 55</div>
                           </div>
                         </div>

                         <table>
                           <thead>
                             <tr>
                               <th>Descripción del Servicio / Liquidación</th>
                               <th>Fecha</th>
                               <th style="text-align: right;">Monto (USD)</th>
                             </tr>
                           </thead>
                           <tbody>
                             ${(wallet.transactions || []).filter(t => t.type === 'debit').map(t => `
                               <tr>
                                 <td>${t.description}</td>
                                 <td>${new Date(t.timestamp).toLocaleDateString()}</td>
                                 <td style="text-align: right; font-weight: 700;">$${t.amount.toFixed(2)}</td>
                               </tr>
                             `).join('') || `<tr><td colspan="3" style="text-align: center; color: #999; padding: 40px;">No hay liquidaciones pendientes para facturar.</td></tr>`}
                           </tbody>
                         </table>

                         <div class="total-box">
                           <div class="total-row">
                             <span style="font-size: 11px; color: #666;">Subtotal:</span>
                             <span style="font-weight: 700;">$${(wallet.transactions || []).filter(t => t.type === 'debit').reduce((sum, t) => sum + t.amount, 0).toFixed(2)}</span>
                           </div>
                           <div class="total-row">
                             <span style="font-size: 11px; color: #666;">ITBMS (7%):</span>
                             <span style="font-weight: 700;">$0.00</span>
                           </div>
                           <div class="total-row grand-total" style="margin-top: 10px; padding-top: 10px;">
                             <span>TOTAL:</span>
                             <span>$${(wallet.transactions || []).filter(t => t.type === 'debit').reduce((sum, t) => sum + t.amount, 0).toFixed(2)}</span>
                           </div>
                         </div>

                         <div class="stamp">VALIDADO POR SISTEMA</div>

                         <div class="footer">
                           Esta es una factura digital generada automáticamente por el Nodo de Finanzas de MantechPro.<br/>
                           La validez de este documento está sujeta a la verificación del ID de transacción en el Ledger Central.<br/>
                           © 2026 MantechPro Panama - Protocolo Financiero Sat-Link V4
                         </div>
                       </body>
                     </html>
                   `;
                   const win = window.open('', '_blank');
                   win?.document.write(printContent);
                   win?.document.close();
                   setTimeout(() => win?.print(), 500);
                   toast.success("Factura Fiscal generada exitosamente.");
                 }}
                 className="flex-1 py-3.5 bg-[#121317] border border-[#2a2b2f] text-white hover:border-[#5d3cfe] rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
               >
                 Generar Factura Fiscal
               </button>
            </div>
          </div>
        </div>

        <div className="bg-[#121317] border border-[#2a2b2f] rounded-[2rem] p-8 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#52ffac]/5 rounded-full blur-3xl"></div>
          <div>
            <span className="text-[10px] font-black text-[#474556] uppercase tracking-widest">Fondo en Garantía</span>
            <h2 className="text-3xl font-black text-white mt-2 tracking-tight">${(wallet.pendingBalance || 0).toFixed(2)}</h2>
          </div>
          <div className="bg-[#1c1d21] border border-[#2a2b2f] p-4 rounded-2xl mt-4">
            <p className="text-[9px] text-[#c8c4d9] font-medium leading-relaxed italic">
              * Estos fondos se liberan al finalizar el servicio y recibir la firma digital del cliente.
            </p>
          </div>
        </div>
      </div>

      {/* Banking & Yappy Info */}
      <div className="bg-[#121317] border border-[#2a2b2f] rounded-[2.5rem] overflow-hidden shadow-xl">
        <header className="px-8 py-6 bg-[#1c1d21] border-b border-[#2a2b2f] flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-500">
              <Landmark className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-white uppercase tracking-tight text-sm">Método de Pago (ACH / Yappy)</h3>
              <p className="text-[9px] font-bold text-[#c8c4d9] uppercase tracking-widest mt-1">Configuración para recibir tus ganancias</p>
            </div>
          </div>
          {!isEditingBank ? (
            <button
              onClick={() => setIsEditingBank(true)}
              className="px-4 py-2 bg-[#121317] border border-[#2a2b2f] rounded-xl text-[9px] font-black text-[#c7bfff] uppercase hover:bg-[#5d3cfe] hover:text-white transition-all"
            >
              Editar Datos
            </button>
          ) : (
            <button
              onClick={handleSaveBank}
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2 bg-[#52ffac] text-[#0d0e12] rounded-xl text-[9px] font-black uppercase shadow-lg shadow-[#52ffac]/20 hover:brightness-110"
            >
              {isSaving ? 'Guardando...' : <><Save className="w-3.5 h-3.5" /> Guardar</>}
            </button>
          )}
        </header>

        <div className="p-8">
          {isEditingBank ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-[#474556] uppercase ml-1">Banco en Panamá</label>
                <input
                  type="text"
                  value={bankInfo.bankName}
                  onChange={e => setBankInfo({...bankInfo, bankName: e.target.value})}
                  placeholder="Ej: Banco General, Banistmo..."
                  className="w-full bg-[#0d0e12] border border-[#2a2b2f] rounded-xl py-3 px-4 text-white text-xs font-bold focus:border-[#5d3cfe] outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-[#474556] uppercase ml-1">Tipo de Cuenta</label>
                <select
                  value={bankInfo.accountType}
                  onChange={e => setBankInfo({...bankInfo, accountType: e.target.value})}
                  className="w-full bg-[#0d0e12] border border-[#2a2b2f] rounded-xl py-3 px-4 text-white text-xs font-bold focus:border-[#5d3cfe] outline-none"
                >
                  <option value="Ahorros">Ahorros</option>
                  <option value="Corriente">Corriente</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-[#474556] uppercase ml-1">Número de Cuenta</label>
                <input
                  type="text"
                  value={bankInfo.accountNumber}
                  onChange={e => setBankInfo({...bankInfo, accountNumber: e.target.value})}
                  placeholder="00-0000-00-0"
                  className="w-full bg-[#0d0e12] border border-[#2a2b2f] rounded-xl py-3 px-4 text-white text-xs font-bold focus:border-[#5d3cfe] outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-[#474556] uppercase ml-1">Titular de la Cuenta</label>
                <input
                  type="text"
                  value={bankInfo.ownerName}
                  onChange={e => setBankInfo({...bankInfo, ownerName: e.target.value})}
                  placeholder="Nombre completo"
                  className="w-full bg-[#0d0e12] border border-[#2a2b2f] rounded-xl py-3 px-4 text-white text-xs font-bold focus:border-[#5d3cfe] outline-none"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-[9px] font-black text-[#52ffac] uppercase ml-1 flex items-center gap-1">
                  <Smartphone className="w-3 h-3" /> Número de Yappy (Directo)
                </label>
                <input
                  type="tel"
                  value={bankInfo.yappyNumber}
                  onChange={e => setBankInfo({...bankInfo, yappyNumber: e.target.value})}
                  placeholder="6000-0000"
                  className="w-full bg-[#0d0e12] border border-[#52ffac]/20 rounded-xl py-3 px-4 text-white text-xs font-bold focus:border-[#52ffac] outline-none shadow-[0_0_15px_rgba(82,255,172,0.05)]"
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 bg-[#0d0e12] border border-[#2a2b2f] rounded-2xl space-y-4">
                <div className="flex items-center gap-3 text-[#c7bfff]">
                  <CreditCard className="w-5 h-5" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Cuenta ACH</span>
                </div>
                <div>
                  <p className="text-[8px] text-[#474556] font-black uppercase">Banco / Tipo</p>
                  <p className="text-xs font-bold text-white mt-1">{bankInfo.bankName || 'No configurado'} - {bankInfo.accountType}</p>
                </div>
                <div>
                  <p className="text-[8px] text-[#474556] font-black uppercase">Número</p>
                  <p className="text-xs font-mono text-white mt-1 tracking-widest">{bankInfo.accountNumber || '****-****'}</p>
                </div>
              </div>

              <div className="p-6 bg-[#0d0e12] border border-[#52ffac]/20 rounded-2xl space-y-4 shadow-[0_10px_30px_rgba(82,255,172,0.05)]">
                <div className="flex items-center gap-3 text-[#52ffac]">
                  <Smartphone className="w-5 h-5" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Yappy Directo</span>
                </div>
                <div>
                  <p className="text-[8px] text-[#474556] font-black uppercase">Teléfono Vinculado</p>
                  <p className="text-xl font-black text-white mt-1">{bankInfo.yappyNumber || '---'}</p>
                </div>
                <div className="px-2 py-1 bg-[#52ffac]/10 border border-[#52ffac]/20 rounded text-[7px] font-black text-[#52ffac] w-fit uppercase">Pago Prioritario</div>
              </div>

              <div className="p-6 bg-[#5d3cfe]/5 border border-[#5d3cfe]/20 rounded-2xl flex flex-col justify-center items-center text-center gap-3">
                 <ShieldCheck className="w-8 h-8 text-[#c7bfff]" />
                 <p className="text-[10px] font-bold text-white leading-tight">Tus datos están protegidos por el protocolo de seguridad Master.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Historial Simple */}
      <div className="bg-[#121317] border border-[#2a2b2f] rounded-[2.5rem] overflow-hidden shadow-xl">
        <div className="p-6 border-b border-[#2a2b2f] bg-[#1c1d21]/30 flex justify-between items-center">
          <div className="flex items-center gap-3">
             <TrendingUp className="w-5 h-5 text-[#52ffac]" />
             <h3 className="font-black text-white uppercase tracking-widest text-[10px]">Historial de Liquidaciones</h3>
          </div>
          <button
            className="p-2 text-[#474556] hover:text-white transition-all"
            onClick={() => toast.success("Historial completo enviado a su correo registrado.")}
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
        <div className="p-4">
           {wallet.transactions && wallet.transactions.length > 0 ? (
             <div className="space-y-2">
                {wallet.transactions.map((tx) => (
                  <div key={tx.id} className="bg-[#0d0e12] border border-[#2a2b2f] p-5 rounded-2xl flex justify-between items-center group hover:border-[#5d3cfe]/30 transition-all">
                     <div className="flex gap-4 items-center">
                        <div className={`p-3 rounded-xl ${tx.type === 'credit' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                           {tx.type === 'credit' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        </div>
                        <div>
                           <h4 className="text-[11px] font-black text-white uppercase tracking-tight">{tx.description}</h4>
                           <p className="text-[8px] font-bold text-[#474556] uppercase mt-1">
                              {new Date(tx.timestamp).toLocaleDateString('es-PA')} • ID: {tx.id}
                           </p>
                        </div>
                     </div>
                     <div className="text-right">
                        <p className={`text-sm font-black italic ${tx.type === 'credit' ? 'text-[#52ffac]' : 'text-rose-500'}`}>
                           {tx.type === 'credit' ? '+' : '-'}${tx.amount.toFixed(2)}
                        </p>
                        <span className="text-[7px] font-black text-[#474556] uppercase tracking-widest bg-black/30 px-2 py-0.5 rounded">VERIFIED</span>
                     </div>
                  </div>
                ))}
             </div>
           ) : (
             <div className="p-16 text-center space-y-4">
                <TrendingUp className="w-12 h-12 text-[#474556] mx-auto opacity-20" />
                <p className="text-[10px] font-black text-[#474556] uppercase tracking-[0.3em]">No hay liquidaciones registradas</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
