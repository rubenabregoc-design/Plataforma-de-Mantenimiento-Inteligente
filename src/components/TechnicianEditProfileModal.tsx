import React, { useState, useEffect } from 'react';
import { TechProfile, TechCategory } from '../types';
import { X, Save, User, Briefcase, DollarSign, MapPin, FileText, Award, RefreshCw, ShieldCheck, HelpCircle, Building } from 'lucide-react';

interface TechnicianEditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: TechProfile;
  onSave: (updatedData: Partial<TechProfile>) => Promise<void>;
}
export default function TechnicianEditProfileModal({ isOpen, onClose, profile, onSave }: TechnicianEditProfileModalProps) {
  const [name, setName] = useState(profile.name || '');
  const [title, setTitle] = useState(profile.title || '');
  const [category, setCategory] = useState<TechCategory>(profile.category || 'mecanico');
  const [experienceYears, setExperienceYears] = useState(profile.experienceYears || 0);
  const [hourlyRate, setHourlyRate] = useState(profile.hourlyRate || 0);
  const [location, setLocation] = useState(profile.location || '');
  const [bio, setBio] = useState(profile.bio || '');
  const [companyName, setCompanyName] = useState(profile.companyName || '');
  const [hasInsurance, setHasInsurance] = useState(profile.hasLiabilityInsurance || false);

  // Información Fiscal (Modelo V7)
  const [isDGIInscribed, setIsDGIInscribed] = useState(profile.fiscalInfo?.isDGIInscribed || false);
  const [emitsElectronicInvoice, setEmitsElectronicInvoice] = useState(profile.fiscalInfo?.emitsElectronicInvoice || false);
  const [itbmsStatus, setItbmsStatus] = useState<'yes' | 'no' | 'unsure'>(profile.fiscalInfo?.itbmsStatus || 'no');
  const [ruc, setRuc] = useState(profile.fiscalInfo?.ruc || '');
  const [contributorType, setContributorType] = useState<'natural' | 'legal'>(profile.fiscalInfo?.contributorType || 'natural');

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen && profile) {
      setName(profile.name || '');
      setTitle(profile.title || '');
      setCategory(profile.category || 'mecanico');
      setExperienceYears(profile.experienceYears || 0);
      setHourlyRate(profile.hourlyRate || 0);
      setLocation(profile.location || '');
      setBio(profile.bio || '');
      setCompanyName(profile.companyName || '');
      setHasInsurance(profile.hasLiabilityInsurance || false);

      setIsDGIInscribed(profile.fiscalInfo?.isDGIInscribed || false);
      setEmitsElectronicInvoice(profile.fiscalInfo?.emitsElectronicInvoice || false);
      setItbmsStatus(profile.fiscalInfo?.itbmsStatus || 'no');
      setRuc(profile.fiscalInfo?.ruc || '');
      setContributorType(profile.fiscalInfo?.contributorType || 'natural');
    }
  }, [isOpen, profile]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave({
        name,
        title,
        category,
        experienceYears: Number(experienceYears),
        hourlyRate: Number(hourlyRate),
        location,
        bio,
        companyName,
        hasLiabilityInsurance: hasInsurance,
        isTaxObligated: itbmsStatus === 'yes',
        fiscalInfo: {
          isDGIInscribed,
          emitsElectronicInvoice,
          ruc,
          contributorType,
          itbmsStatus
        }
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0d0e12]/90 backdrop-blur-md">
      <div className="w-full max-w-2xl bg-[#121317] rounded-[2rem] border border-[#2a2b2f] shadow-2xl overflow-hidden animate-fade-in-up">
        <header className="px-8 py-6 bg-[#1c1d21] border-b border-[#2a2b2f] flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#5d3cfe]/10 border border-[#5d3cfe]/30 flex items-center justify-center text-[#c7bfff]">
              <User className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-black text-white uppercase tracking-tight">Perfil Profesional y Fiscal</h2>
          </div>
          <button onClick={onClose} className="p-2 text-[#474556] hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="p-8 space-y-8 max-h-[75vh] overflow-y-auto custom-scrollbar">

          {/* SECCIÓN 1: IDENTIDAD PROFESIONAL */}
          <div className="space-y-6">
            <h3 className="text-[10px] font-black text-[#5d3cfe] uppercase tracking-[0.4em] border-l-2 border-[#5d3cfe] pl-3">Identidad Profesional</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#474556] uppercase tracking-widest ml-1">Nombre Oficial</label>
                <input type="text" readOnly value={name} className="w-full bg-[#0d0e12] border border-[#2a2b2f] rounded-xl py-3.5 px-4 text-sm font-bold text-[#474556] cursor-not-allowed outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#474556] uppercase tracking-widest ml-1">Nombre Comercial / Empresa</label>
                <input type="text" required value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Ej: MultiServicios S.A." className="w-full bg-[#1c1d21] border border-[#2a2b2f] rounded-xl py-3.5 px-4 text-sm font-bold text-white focus:border-[#c7bfff] outline-none" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#474556] uppercase tracking-widest ml-1">Especialidad Principal</label>
                <select value={category} onChange={e => setCategory(e.target.value as TechCategory)} className="w-full bg-[#1c1d21] border border-[#2a2b2f] rounded-xl py-3.5 px-4 text-sm font-bold text-white outline-none">
                  <option value="mecanico">Mecánico Automotriz</option>
                  <option value="tecnico_ac">Técnico Aire Acondicionado</option>
                  <option value="electricista">Ingeniero Eléctrico</option>
                  <option value="informatico">Informático / IT</option>
                  <option value="plomero">Plomero Especialista</option>
                  <option value="especialista_solar">Especialista Solar</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#474556] uppercase tracking-widest ml-1">Tarifa Base por Hora (B/.)</label>
                <input type="number" required value={hourlyRate} onChange={e => setHourlyRate(Number(e.target.value))} className="w-full bg-[#1c1d21] border border-[#2a2b2f] rounded-xl py-3.5 px-4 text-sm font-bold text-[#52ffac] outline-none" />
              </div>
            </div>
          </div>

          {/* SECCIÓN 2: INFORMACIÓN FISCAL (MODELO PANAMÁ V7) */}
          <div className="space-y-6 bg-white/[0.02] p-6 rounded-[2rem] border border-white/5">
            <h3 className="text-[10px] font-black text-amber-500 uppercase tracking-[0.4em] border-l-2 border-amber-500 pl-3">Configuración Fiscal DGI</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Pregunta 1: Inscrito DGI */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-[#c8c4d9] uppercase tracking-widest">¿Está inscrito en la DGI?</label>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setIsDGIInscribed(true)} className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase border transition-all ${isDGIInscribed ? 'bg-indigo-500 border-indigo-500 text-white' : 'bg-black/40 border-white/10 text-[#474556]'}`}>Sí</button>
                  <button type="button" onClick={() => setIsDGIInscribed(false)} className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase border transition-all ${!isDGIInscribed ? 'bg-white/10 border-white/20 text-white' : 'bg-black/40 border-white/10 text-[#474556]'}`}>No</button>
                </div>
              </div>

              {/* Pregunta 2: Factura Electrónica */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-[#c8c4d9] uppercase tracking-widest">¿Emite factura electrónica?</label>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setEmitsElectronicInvoice(true)} className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase border transition-all ${emitsElectronicInvoice ? 'bg-indigo-500 border-indigo-500 text-white' : 'bg-black/40 border-white/10 text-[#474556]'}`}>Sí</button>
                  <button type="button" onClick={() => setEmitsElectronicInvoice(false)} className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase border transition-all ${!emitsElectronicInvoice ? 'bg-white/10 border-white/20 text-white' : 'bg-black/40 border-white/10 text-[#474556]'}`}>No</button>
                </div>
              </div>
            </div>

            {/* Pregunta 3: ITBMS Status */}
            <div className="space-y-4">
              <label className="text-[10px] font-black text-[#c8c4d9] uppercase tracking-widest">¿Sus servicios están sujetos al cobro de ITBMS?</label>
              <div className="grid grid-cols-3 gap-2">
                <button type="button" onClick={() => setItbmsStatus('yes')} className={`py-3 rounded-xl text-[9px] font-black uppercase border transition-all ${itbmsStatus === 'yes' ? 'bg-indigo-500 border-indigo-500 text-white shadow-lg' : 'bg-black/40 border-white/10 text-[#474556]'}`}>Sí (Cobrar 7%)</button>
                <button type="button" onClick={() => setItbmsStatus('no')} className={`py-3 rounded-xl text-[9px] font-black uppercase border transition-all ${itbmsStatus === 'no' ? 'bg-white/10 border-white/20 text-white' : 'bg-black/40 border-white/10 text-[#474556]'}`}>No (Exento)</button>
                <button type="button" onClick={() => setItbmsStatus('unsure')} className={`py-3 rounded-xl text-[9px] font-black uppercase border transition-all ${itbmsStatus === 'unsure' ? 'bg-amber-500/20 border-amber-500/40 text-amber-500' : 'bg-black/40 border-white/10 text-[#474556]'}`}>No estoy seguro</button>
              </div>
              {itbmsStatus === 'unsure' && (
                <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                  <HelpCircle className="w-4 h-4 text-amber-500 shrink-0" />
                  <p className="text-[8px] text-amber-200/80 font-bold uppercase leading-relaxed">Le recomendamos consultar con su contador antes de comenzar. MantechPro aplicará ITBMS basado únicamente en su selección.</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#474556] uppercase tracking-widest ml-1">RUC (Registro Único de Contribuyente)</label>
                <div className="relative">
                  <input type="text" value={ruc} onChange={e => setRuc(e.target.value)} placeholder="8-XXX-XXXX DV-XX" className="w-full bg-[#0d0e12] border border-white/10 rounded-xl py-3.5 px-4 text-sm font-bold text-white focus:border-amber-500 outline-none" />
                  <Building className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#474556]" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#474556] uppercase tracking-widest ml-1">Tipo de Contribuyente</label>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setContributorType('natural')} className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase border transition-all ${contributorType === 'natural' ? 'bg-white/10 border-white/20 text-white' : 'bg-black/40 border-white/10 text-[#474556]'}`}>Persona Natural</button>
                  <button type="button" onClick={() => setContributorType('legal')} className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase border transition-all ${contributorType === 'legal' ? 'bg-white/10 border-white/20 text-white' : 'bg-black/40 border-white/10 text-[#474556]'}`}>Persona Jurídica</button>
                </div>
              </div>
            </div>
          </div>

          {/* SECCIÓN 3: RESPONSABILIDAD Y SEGUROS */}
          <div className="space-y-6">
            <h3 className="text-[10px] font-black text-rose-500 uppercase tracking-[0.4em] border-l-2 border-rose-500 pl-3">Responsabilidad Técnica</h3>
            <div className="p-4 bg-rose-500/5 border border-rose-500/10 rounded-2xl">
               <p className="text-[9px] text-[#c8c4d9] font-medium leading-relaxed italic">
                 <strong>Aviso Legal:</strong> MantechPro es un marketplace de intermediación. Al prestar servicios, usted emite su propia factura al cliente. MantechPro le facturará a usted el 7% de ITBMS únicamente sobre el valor de la comisión de plataforma.
               </p>
            </div>
            <div className="space-y-3">
               <label className="text-[10px] font-black text-[#474556] uppercase tracking-widest">Póliza de Daños a Terceros</label>
               <div className="flex gap-3">
                 <button type="button" onClick={() => setHasInsurance(true)} className={`flex-1 py-3 rounded-xl border text-[9px] font-black uppercase transition-all ${hasInsurance ? 'bg-[#52ffac] border-[#52ffac] text-black shadow-lg' : 'bg-[#1c1d21] border-[#2a2b2f] text-[#c8c4d9]'}`}>Protegido por Póliza</button>
                 <button type="button" onClick={() => setHasInsurance(false)} className={`flex-1 py-3 rounded-xl border text-[9px] font-black uppercase transition-all ${!hasInsurance ? 'bg-rose-500/10 border-rose-500/30 text-rose-500' : 'bg-[#1c1d21] border-[#2a2b2f] text-[#c8c4d9]'}`}>Sin Seguro</button>
               </div>
            </div>
          </div>

          {/* BIOGRAFÍA */}
          <div className="space-y-2 pt-4">
            <label className="text-[10px] font-black text-[#474556] uppercase tracking-widest ml-1">Perfil Público (Bio)</label>
            <textarea required rows={4} value={bio} onChange={e => setBio(e.target.value)} className="w-full bg-[#1c1d21] border border-[#2a2b2f] rounded-xl py-4 px-5 text-sm font-medium text-white focus:border-[#c7bfff] outline-none transition-all leading-relaxed resize-none" />
          </div>

          <button type="submit" disabled={isSaving} className="w-full py-5 bg-[#5d3cfe] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-[#5d3cfe]/20 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-3">
             {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Actualizar Credenciales Maestras
          </button>
        </form>
      </div>
    </div>
  );
}
