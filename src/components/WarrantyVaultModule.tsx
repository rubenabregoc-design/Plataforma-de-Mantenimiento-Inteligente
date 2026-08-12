import React from 'react';
import { Asset } from '../types';
import { ShieldCheck, AlertCircle, Clock, Calendar, ChevronRight, Archive, BadgeCheck, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

interface WarrantyVaultModuleProps {
  assets: Asset[];
  onNavigate?: (tab: string) => void;
}

import React, { useRef } from 'react';
import { Asset } from '../types';
import { ShieldCheck, AlertCircle, Clock, Calendar, ChevronRight, Archive, BadgeCheck, XCircle, FileText, Upload, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useBusinessLogic } from '../hooks/useBusinessLogic';

interface WarrantyVaultModuleProps {
  assets: Asset[];
  onNavigate?: (tab: string) => void;
}

export default function WarrantyVaultModule({ assets, onNavigate }: WarrantyVaultModuleProps) {
  const { t } = useTranslation();
  const business = useBusinessLogic();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedAssetId, setSelectedAssetId] = React.useState<string | null>(null);

  const getWarrantyInfo = (asset: Asset) => {
    // ... logic remains same ...
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && selectedAssetId) {
      await business.handleUploadWarrantyInvoice(selectedAssetId, file);
      setSelectedAssetId(null);
    }
  };

  const triggerUpload = (assetId: string) => {
    setSelectedAssetId(assetId);
    fileInputRef.current?.click();
  };

  const assetsWithWarranty = assets.filter(a => a.purchaseDate && a.warrantyMonths);

  return (
    <div className="space-y-10 animate-fade-in">
      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,.pdf" />
      <header className="flex justify-between items-end">
        {/* ... header code ... */}
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase">{t('warranty_vault', 'BÓVEDA DE').split(' ')[0]} <span className="text-[#5d3cfe]">{t('warranty_vault', 'GARANTÍAS').split(' ')[1]}</span></h1>
          <p className="text-[#c8c4d9] font-medium mt-2 italic opacity-60">{t('warranty_vault_desc', 'Monitoreo inteligente de cobertura y protección de activos.')}</p>
        </div>
        <div className="flex gap-4">
          <div className="px-5 py-2 bg-[#1c1d21] border border-white/5 rounded-xl text-center">
            <p className="text-[8px] font-black text-[#474556] uppercase tracking-widest">{t('protected_assets', 'Activos Protegidos')}</p>
            <p className="text-xl font-black text-[#5d3cfe]">{assetsWithWarranty.filter(a => getWarrantyInfo(a)?.status === 'valid').length}</p>
          </div>
          <div className="px-5 py-2 bg-[#1c1d21] border border-white/5 rounded-xl text-center">
            <p className="text-[8px] font-black text-[#474556] uppercase tracking-widest">{t('expiring_soon', 'Vencen Pronto')}</p>
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
              className={`p-6 bg-[#121317] border rounded-[2.5rem] flex flex-col justify-between group transition-all
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
                <div className="flex flex-col items-end gap-2">
                   {info.status === 'expiring' && (
                     <div className="flex items-center gap-2 px-3 py-1 bg-amber-500 text-black rounded-full text-[8px] font-black animate-pulse">
                       <AlertCircle className="w-3 h-3" /> {t('expiring_alert', 'ALERTA VENCIMIENTO')}
                     </div>
                   )}
                   {asset.invoiceUrl && (
                     <div className="flex items-center gap-2 px-3 py-1 bg-[#52ffac]/10 border border-[#52ffac]/20 text-[#52ffac] rounded-full text-[8px] font-black uppercase tracking-widest">
                       <BadgeCheck className="w-3 h-3" /> Digitalizada
                     </div>
                   )}
                </div>
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

              <div className="flex items-center justify-between pt-6 border-t border-white/5">
                <div className="flex flex-col">
                  <span className="text-[8px] font-black text-[#474556] uppercase">{t('coverage_status', 'Estado de Cobertura')}</span>
                  <span className={`text-[10px] font-black uppercase tracking-widest mt-1
                    ${info.status === 'valid' ? 'text-[#52ffac]' : info.status === 'expiring' ? 'text-amber-500' : 'text-rose-500'}`}>
                    {info.status === 'valid' ? t('active_protection', 'PROTECCIÓN ACTIVA') : info.status === 'expiring' ? `${t('expires_in', 'VENCE EN')} ${info.daysRemaining} ${t('days_left', 'DÍAS')}` : t('expired', 'GARANTÍA VENCIDA')}
                  </span>
                </div>
                <div className="flex gap-2">
                   {asset.invoiceUrl ? (
                     <a href={asset.invoiceUrl} target="_blank" rel="noopener noreferrer" className="p-3 bg-[#5d3cfe]/10 text-[#5d3cfe] rounded-xl hover:bg-[#5d3cfe] hover:text-white transition-all border border-[#5d3cfe]/20">
                        <Eye className="w-4 h-4" />
                     </a>
                   ) : (
                     <button onClick={() => triggerUpload(asset.id)} className="p-3 bg-white/5 text-[#474556] rounded-xl hover:bg-white/10 hover:text-white transition-all border border-white/5 flex items-center gap-2">
                        <Upload className="w-4 h-4" />
                        <span className="text-[8px] font-black uppercase tracking-widest">Subir Factura</span>
                     </button>
                   )}
                   <button className="p-3 bg-white/5 hover:bg-rose-600/10 text-white/40 hover:text-rose-500 rounded-xl transition-all border border-white/5">
                     <Archive className="w-4 h-4" />
                   </button>
                </div>
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
      <div className="bg-gradient-to-r from-[#5d3cfe]/10 to-transparent border border-[#5d3cfe]/20 p-10 rounded-[3.5rem] flex flex-col md:flex-row items-center justify-between gap-8">
         <div className="flex items-center gap-8">
            <div className="w-20 h-20 bg-[#5d3cfe] rounded-[2rem] flex items-center justify-center shadow-2xl shadow-[#5d3cfe]/40 shrink-0">
               <BadgeCheck className="w-10 h-10 text-white" />
            </div>
            <div className="space-y-2">
               <h3 className="text-2xl font-black text-white uppercase tracking-tighter italic">{t('optimize_coverage', 'Optimice sus Coberturas')}</h3>
               <p className="text-xs text-[#c8c4d9] font-medium uppercase tracking-[0.2em] opacity-60 leading-relaxed max-w-md">{t('warranty_ia_desc', 'El Protocolo MantechPro recomienda mantenimientos preventivos 30 días antes del vencimiento legal.')}</p>
            </div>
         </div>
         <button
           onClick={() => onNavigate?.('subscriptions')}
           className="w-full md:w-auto px-10 py-5 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:scale-105 transition-all shadow-xl"
         >
           {t('view_extensions', 'Ver Planes de Extensión')}
         </button>
      </div>
    </div>
  );
}
