import React from 'react';
import { Asset } from '../types';
import { ShieldCheck, AlertCircle, Clock, Calendar, ChevronRight, Archive, BadgeCheck, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

interface WarrantyVaultModuleProps {
  assets: Asset[];
}

export default function WarrantyVaultModule({ assets }: WarrantyVaultModuleProps) {
  const { t } = useTranslation();

  const getWarrantyInfo = (asset: Asset) => {
    if (!asset.purchaseDate || !asset.warrantyMonths) return null;

    const purchase = new Date(asset.purchaseDate);
    const expiration = new Date(purchase);
    expiration.setMonth(expiration.getMonth() + asset.warrantyMonths);

    const now = new Date();
    const diffTime = expiration.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let status: 'valid' | 'expiring' | 'expired' = 'valid';
    if (diffDays < 0) status = 'expired';
    else if (diffDays <= 30) status = 'expiring';

    return {
      expirationDate: expiration.toLocaleDateString('es-PA'),
      daysRemaining: diffDays,
      status
    };
  };

  const assetsWithWarranty = assets.filter(a => a.purchaseDate && a.warrantyMonths);

  return (
    <div className="space-y-10 animate-fade-in">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase">{t('warranty_vault').split(' ')[0]} <span className="text-[#5d3cfe]">{t('warranty_vault').split(' ')[1]}</span></h1>
          <p className="text-[#c8c4d9] font-medium mt-2 italic opacity-60">{t('warranty_vault_desc', 'Monitoreo inteligente de cobertura y protección de activos.')}</p>
        </div>
        <div className="flex gap-4">
          <div className="px-5 py-2 bg-[#1c1d21] border border-white/5 rounded-xl text-center">
            <p className="text-[8px] font-black text-[#474556] uppercase tracking-widest">{t('protected_assets')}</p>
            <p className="text-xl font-black text-[#5d3cfe]">{assetsWithWarranty.filter(a => getWarrantyInfo(a)?.status === 'valid').length}</p>
          </div>
          <div className="px-5 py-2 bg-[#1c1d21] border border-white/5 rounded-xl text-center">
            <p className="text-[8px] font-black text-[#474556] uppercase tracking-widest">{t('expiring_soon')}</p>
            <p className="text-xl font-black text-amber-500">{assetsWithWarranty.filter(a => getWarrantyInfo(a)?.status === 'expiring').length}</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {assetsWithWarranty.length > 0 ? assetsWithWarranty.map(asset => {
          const info = getWarrantyInfo(asset)!;
          return (
            <motion.div
              key={asset.id}
              whileHover={{ scale: 1.01 }}
              className={`p-6 bg-[#121317] border rounded-[2rem] flex flex-col justify-between group transition-all
                ${info.status === 'expiring' ? 'border-amber-500/30' : info.status === 'expired' ? 'border-rose-500/20' : 'border-white/5'}`}
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center
                    ${info.status === 'expiring' ? 'bg-amber-500/10 text-amber-500' : info.status === 'expired' ? 'bg-rose-500/10 text-rose-500' : 'bg-[#52ffac]/10 text-[#52ffac]'}`}>
                    {info.status === 'expired' ? <XCircle className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
                  </div>
                  <div>
                    <h4 className="font-black text-white uppercase tracking-tight">{asset.name}</h4>
                    <p className="text-[10px] text-[#474556] font-black uppercase tracking-widest">{asset.details}</p>
                  </div>
                </div>
                {info.status === 'expiring' && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-amber-500 text-black rounded-full text-[8px] font-black animate-pulse">
                    <AlertCircle className="w-3 h-3" /> {t('expiring_alert', 'ALERTA VENCIMIENTO')}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-[#0d0e12] p-4 rounded-2xl border border-white/5">
                  <span className="text-[8px] font-black text-[#474556] uppercase tracking-[0.2em] block mb-1">{t('purchase_date', 'Fecha de Compra')}</span>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3 h-3 text-[#5d3cfe]" />
                    <span className="text-xs font-bold text-white uppercase">{new Date(asset.purchaseDate!).toLocaleDateString('es-PA')}</span>
                  </div>
                </div>
                <div className="bg-[#0d0e12] p-4 rounded-2xl border border-white/5">
                  <span className="text-[8px] font-black text-[#474556] uppercase tracking-[0.2em] block mb-1">{t('warranty_end', 'Fin de Garantía')}</span>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3 text-[#5d3cfe]" />
                    <span className="text-xs font-bold text-white uppercase">{info.expirationDate}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <div className="flex flex-col">
                  <span className="text-[8px] font-black text-[#474556] uppercase">{t('coverage_status', 'Estado de Cobertura')}</span>
                  <span className={`text-[10px] font-black uppercase tracking-widest mt-1
                    ${info.status === 'valid' ? 'text-[#52ffac]' : info.status === 'expiring' ? 'text-amber-500' : 'text-rose-500'}`}>
                    {info.status === 'valid' ? t('active_protection') : info.status === 'expiring' ? `${t('expires_in', 'Vence en')} ${info.daysRemaining} ${t('days_left')}` : t('expired')}
                  </span>
                </div>
                <button className="p-3 bg-white/5 hover:bg-[#5d3cfe]/20 text-white hover:text-[#5d3cfe] rounded-xl transition-all">
                  <Archive className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          );
        }) : (
          <div className="col-span-2 py-20 bg-[#121317] border border-dashed border-white/10 rounded-[3rem] text-center space-y-4">
             <ShieldCheck className="w-12 h-12 text-[#474556] mx-auto opacity-20" />
             <p className="text-sm font-black text-[#474556] uppercase tracking-widest">{t('no_warranties', 'No se han registrado activos con garantía aún.')}</p>
          </div>
        )}
      </div>

      {/* Tarjeta de Sugerencia IA */}
      <div className="bg-gradient-to-r from-[#5d3cfe]/10 to-transparent border border-[#5d3cfe]/20 p-8 rounded-[2.5rem] flex items-center justify-between">
         <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-[#5d3cfe] rounded-3xl flex items-center justify-center shadow-xl shadow-[#5d3cfe]/20">
               <BadgeCheck className="w-8 h-8 text-white" />
            </div>
            <div>
               <h3 className="text-lg font-black text-white uppercase tracking-tighter italic">{t('optimize_coverage', 'Optimice sus Coberturas')}</h3>
               <p className="text-[10px] text-[#c8c4d9] font-medium uppercase tracking-widest opacity-60">{t('warranty_ia_desc', 'MantechPro recomienda mantenimientos preventivos 30 días antes del fin de la garantía.')}</p>
            </div>
         </div>
         <button className="px-8 py-4 bg-white text-black rounded-2xl text-[9px] font-black uppercase tracking-widest hover:scale-105 transition-all">{t('view_extensions', 'Ver Planes de Extensión')}</button>
      </div>
    </div>
  );
}
