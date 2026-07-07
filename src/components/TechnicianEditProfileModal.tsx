import React, { useState, useEffect } from 'react';
import { TechProfile, TechCategory } from '../types';
import { X, Save, User, Briefcase, DollarSign, MapPin, FileText, Award, RefreshCw } from 'lucide-react';

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
        companyName
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
            <h2 className="text-xl font-black text-white uppercase tracking-tight">Editar Perfil Profesional</h2>
          </div>
          <button onClick={onClose} className="p-2 text-[#474556] hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-[#474556] uppercase tracking-widest ml-1">Nombre Completo</label>
              <input type="text" readOnly value={name} className="w-full bg-[#0d0e12] border border-[#2a2b2f] rounded-xl py-3.5 px-4 text-sm font-bold text-[#474556] cursor-not-allowed outline-none" title="Solo el Administrador Master puede cambiar nombres oficiales" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-[#474556] uppercase tracking-widest ml-1">Categoría</label>
              <select value={category} onChange={e => setCategory(e.target.value as TechCategory)} className="w-full bg-[#1c1d21] border border-[#2a2b2f] rounded-xl py-3.5 px-4 text-sm font-bold text-white focus:border-[#c7bfff] outline-none transition-all">
                <option value="mecanico">Mecánico Automotriz</option>
                <option value="tecnico_ac">Técnico Aire Acondicionado</option>
                <option value="electricista">Ingeniero Eléctrico</option>
                <option value="informatico">Informático / IT</option>
                <option value="plomero">Plomero Especialista</option>
                <option value="especialista_solar">Especialista Solar</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-[#474556] uppercase tracking-widest ml-1">Años de Experiencia</label>
              <input type="number" required value={experienceYears} onChange={e => setExperienceYears(Number(e.target.value))} className="w-full bg-[#1c1d21] border border-[#2a2b2f] rounded-xl py-3.5 px-4 text-sm font-bold text-white focus:border-[#c7bfff] outline-none transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-[#474556] uppercase tracking-widest ml-1">Tarifa por Hora (B/.)</label>
              <input type="number" required value={hourlyRate} onChange={e => setHourlyRate(Number(e.target.value))} className="w-full bg-[#1c1d21] border border-[#2a2b2f] rounded-xl py-3.5 px-4 text-sm font-bold text-[#52ffac] focus:border-[#c7bfff] outline-none transition-all" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
               <label className="text-[10px] font-black text-[#474556] uppercase tracking-widest ml-1">Nombre de Empresa (Opcional)</label>
               <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Ej: MultiServicios S.A." className="w-full bg-[#1c1d21] border border-[#2a2b2f] rounded-xl py-3.5 px-4 text-sm font-bold text-white focus:border-[#c7bfff] outline-none transition-all" />
            </div>
            <div className="space-y-2">
               <label className="text-[10px] font-black text-[#474556] uppercase tracking-widest ml-1">Ubicación de Operación</label>
               <input type="text" required value={location} onChange={e => setLocation(e.target.value)} placeholder="Ciudad de Panamá, Panamá Oeste..." className="w-full bg-[#1c1d21] border border-[#2a2b2f] rounded-xl py-3.5 px-4 text-sm font-bold text-white focus:border-[#c7bfff] outline-none transition-all" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-[#474556] uppercase tracking-widest ml-1">Bio / Perfil Profesional</label>
            <textarea required rows={5} value={bio} onChange={e => setBio(e.target.value)} className="w-full bg-[#1c1d21] border border-[#2a2b2f] rounded-xl py-3.5 px-4 text-sm font-medium text-white focus:border-[#c7bfff] outline-none transition-all leading-relaxed" />
          </div>

          <button type="submit" disabled={isSaving} className="w-full py-5 bg-[#5d3cfe] text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-xl shadow-[#5d3cfe]/20 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-3">
             {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Guardar Perfil Verificado
          </button>
        </form>
      </div>
    </div>
  );
}
