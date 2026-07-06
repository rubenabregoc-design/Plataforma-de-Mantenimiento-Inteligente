import React, { useState } from 'react';
import { TechWallet } from '../types';
import { Wallet, TrendingUp, TrendingDown, Download, CreditCard, Landmark, Smartphone, Save, ShieldCheck } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

interface TechWalletModuleProps {
  wallet: TechWallet;
  techId: string;
}

export default function TechWalletModule({ wallet, techId }: TechWalletModuleProps) {
  const [isEditingBank, setIsEditingBank] = useState(false);
  const [bankInfo, setBankInfo] = useState({
    bankName: wallet.bankName || '',
    accountType: wallet.accountType || 'Ahorros',
    accountNumber: wallet.accountNumber || '',
    ownerName: wallet.ownerName || '',
    yappyNumber: wallet.yappyNumber || ''
  });
  const [isSaving, setIsSaving] = useState(false);

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
      alert("Datos de pago actualizados correctamente.");
    } catch (err) {
      console.error(err);
      alert("Error al guardar los datos.");
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
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-[#52ffac] rounded-full animate-pulse"></div>
              <span className="text-[10px] font-black text-[#c8c4d9] uppercase tracking-widest">Saldo Disponible</span>
            </div>
            <h2 className="text-5xl font-black tracking-tighter text-white">${(wallet.balance || 0).toFixed(2)}</h2>
            <div className="flex gap-3 mt-8">
               <button className="flex-1 py-3.5 bg-[#5d3cfe] hover:brightness-110 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-[#5d3cfe]/20">
                 Solicitar Retiro
               </button>
               <button
                 onClick={() => alert("Generando Factura Fiscal Digital (PDF)... El documento estará disponible en su historial en breve.")}
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
      <div className="bg-[#121317] border border-[#2a2b2f] rounded-[2.5rem] overflow-hidden">
        <div className="p-6 border-b border-[#2a2b2f] bg-[#1c1d21]/30 flex justify-between items-center">
          <h3 className="font-black text-white uppercase tracking-widest text-[10px]">Historial de Liquidaciones</h3>
          <button className="p-2 text-[#474556] hover:text-white transition-all">
            <Download className="w-4 h-4" />
          </button>
        </div>
        <div className="p-10 text-center space-y-4">
           <TrendingUp className="w-12 h-12 text-[#474556] mx-auto opacity-20" />
           <p className="text-[10px] font-black text-[#474556] uppercase tracking-[0.3em]">No hay liquidaciones recientes</p>
        </div>
      </div>
    </div>
  );
}
