import React from 'react';
import { Asset, TechProfile } from '../types';
import { AlertCircle, ShieldAlert, Phone, MapPin, Zap, X, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

interface HomeEmergencySOSProps {
  isOpen: boolean;
  onClose: () => void;
  assets: Asset[];
  technicians: TechProfile[];
  onCallTech: (tech: TechProfile) => void;
}

export default function HomeEmergencySOS({ isOpen, onClose, assets, technicians, onCallTech }: HomeEmergencySOSProps) {
  const { t } = useTranslation();
  if (!isOpen) return null;

  // Filtrar técnicos que son Partner o Pro para emergencias
  const emergencyTechs = technicians.filter(t => t.plan !== 'basic' && t.isOnline).slice(0, 3);

  return (
    <div className="fixed inset-0 z-[800] bg-[#0d0e12]/95 backdrop-blur-2xl flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-2xl bg-[#121317] border border-rose-500/20 rounded-[3rem] overflow-hidden shadow-[0_0_100px_rgba(244,63,94,0.15)]"
      >
        <div className="bg-rose-600 p-8 flex justify-between items-center">
          <div className="flex items-center gap-4 text-white">
            <ShieldAlert className="w-10 h-10 animate-pulse" />
            <div>
              <h2 className="text-3xl font-black uppercase tracking-tighter italic">{t('sos_emergency')} 24/7</h2>
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">{t('sos_desc', 'Asistencia Técnica Inmediata en Panamá')}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all">
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        <div className="p-8 md:p-10 space-y-10">
          {/* Instrucciones de Seguridad */}
          <div className="bg-[#1c1d21] border border-rose-500/30 p-6 rounded-[2rem] space-y-6 shadow-inner">
            <h3 className="text-xs font-black text-rose-500 uppercase tracking-widest flex items-center gap-2">
              <AlertCircle className="w-5 h-5" /> {t('first_aid_protocol', 'Protocolo de Emergencia en Sitio')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-4">
                  <div className="flex gap-4">
                     <span className="flex-shrink-0 w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px] font-black">1</span>
                     <p className="text-xs font-bold text-white leading-relaxed">
                        {t('sos_step1', 'Mantenga la calma y asegure el área para evitar accidentes adicionales.')}
                     </p>
                  </div>
                  <div className="flex gap-4">
                     <span className="flex-shrink-0 w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px] font-black">2</span>
                     <p className="text-xs font-bold text-zinc-200 leading-relaxed">
                        {t('sos_step2', 'Fugas de Agua/Gas: Localice la llave de paso principal y ciérrela inmediatamente.')}
                     </p>
                  </div>
               </div>
               <div className="space-y-4">
                  <div className="flex gap-4">
                     <span className="flex-shrink-0 w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px] font-black">3</span>
                     <p className="text-xs font-bold text-zinc-200 leading-relaxed">
                        {t('sos_step3', 'Fallas Eléctricas: No manipule cables ni tableros sin equipo de protección.')}
                     </p>
                  </div>
                  <div className="flex gap-4 text-emerald-400">
                     <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                        <ShieldAlert className="w-3.5 h-3.5" />
                     </div>
                     <p className="text-[10px] font-black uppercase leading-tight tracking-wide">
                        {t('sos_use', 'Al presionar "Solicitar", se despacha alerta prioritaria al técnico más cercano.')}
                     </p>
                  </div>
               </div>
            </div>
          </div>

          {/* Técnicos de Respuesta Rápida */}
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h4 className="text-[10px] font-black text-[#474556] uppercase tracking-widest">{t('online_specialists', 'Especialistas en Línea (Cercanos)')}</h4>
              <span className="px-3 py-1 bg-[#52ffac]/10 text-[#52ffac] rounded-full text-[8px] font-black uppercase">{t('response_time', 'Respuesta < 20 min')}</span>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {emergencyTechs.map(tech => (
                <div key={tech.id} className="bg-[#0d0e12] border border-white/5 p-5 rounded-2xl flex justify-between items-center group hover:border-rose-500/30 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-[#5d3cfe] font-black uppercase">
                      {tech.name[0]}
                    </div>
                    <div>
                      <h5 className="text-sm font-black text-white uppercase tracking-tight">{tech.name}</h5>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9px] font-bold text-[#52ffac] uppercase">{tech.category.replace('_',' ')}</span>
                        <div className="w-1 h-1 rounded-full bg-[#474556]"></div>
                        <span className="text-[9px] font-bold text-[#c8c4d9] uppercase">{tech.plan === 'enterprise' ? 'Sello Gold' : t('verified', 'Verificado')}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => onCallTech(tech)}
                    className="flex items-center gap-3 px-6 py-3 bg-rose-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-rose-600/20 hover:scale-105 active:scale-95 transition-all"
                  >
                    <Phone className="w-3.5 h-3.5" /> {t('request_now', 'Solicitar Ahora')}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4 text-[#474556]">
            <MapPin className="w-4 h-4" />
            <p className="text-[9px] font-black uppercase tracking-widest">{t('location_sent', 'Su ubicación actual ha sido enviada a la Central MantechPro para coordinar el arribo.')}</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
