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
  const [name, setName] = useState(profile.name);
  const [title, setTitle] = useState(profile.title);
  const [category, setCategory] = useState<TechCategory>(profile.category);
  const [experienceYears, setExperienceYears] = useState(profile.experienceYears);
  const [hourlyRate, setHourlyRate] = useState(profile.hourlyRate);
  const [location, setLocation] = useState(profile.location);
  const [companyName, setCompanyName] = useState(profile.companyName || '');
  const [bio, setBio] = useState(profile.bio);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName(profile.name);
      setTitle(profile.title);
      setCategory(profile.category);
      setExperienceYears(profile.experienceYears);
      setHourlyRate(profile.hourlyRate);
      setLocation(profile.location);
      setCompanyName(profile.companyName || '');
      setBio(profile.bio);
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
        companyName,
        bio
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-zinc-100 animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center px-6 py-4 bg-zinc-50 border-b border-zinc-100">
          <h2 className="text-lg font-black text-zinc-900 flex items-center gap-2 uppercase tracking-tight">
            <User className="w-5 h-5 text-indigo-600" />
            Editar Mi Perfil Profesional
          </h2>
          <button onClick={onClose} className="p-1 rounded-full text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-black text-zinc-500 flex items-center gap-1.5">
                <User className="w-3 h-3" /> Nombre Completo
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-zinc-900 font-bold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-black text-zinc-500 flex items-center gap-1.5">
                <Award className="w-3 h-3" /> Título Profesional
              </label>
              <input
                type="text"
                required
                placeholder="Ej: Mecánico Automotriz Certificado"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-zinc-900 font-bold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-black text-zinc-500 flex items-center gap-1.5">
                <Briefcase className="w-3 h-3" /> Categoría Principal
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TechCategory)}
                className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-zinc-900 font-bold appearance-none"
              >
                <option value="mecanico">Mecánico Automotriz</option>
                <option value="tecnico_ac">Aire Acondicionado</option>
                <option value="electricista">Electricista</option>
                <option value="informatico">Informático / IT</option>
                <option value="plomero">Plomero</option>
                <option value="especialista_solar">Especialista Solar</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-black text-zinc-500 flex items-center gap-1.5">
                <Briefcase className="w-3 h-3" /> Años de Experiencia
              </label>
              <input
                type="number"
                min="0"
                required
                value={experienceYears}
                onChange={(e) => setExperienceYears(Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-zinc-900 font-bold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-black text-zinc-500 flex items-center gap-1.5">
                <DollarSign className="w-3 h-3" /> Tarifa por Hora (USD)
              </label>
              <input
                type="number"
                min="0"
                required
                value={hourlyRate}
                onChange={(e) => setHourlyRate(Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-zinc-900 font-bold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-black text-zinc-500 flex items-center gap-1.5">
                <MapPin className="w-3 h-3" /> Ubicación (Panamá)
              </label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-zinc-900 font-bold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-black text-zinc-500 flex items-center gap-1.5">
                <Briefcase className="w-3 h-3" /> Empresa / Taller
              </label>
              <input
                type="text"
                placeholder="Nombre de la empresa o independiente..."
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-zinc-900 font-bold"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-black text-zinc-500 flex items-center gap-1.5">
              <FileText className="w-3 h-3" /> Bio / Descripción Profesional
            </label>
            <textarea
              required
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Describe tu experiencia y especialidades..."
              className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-zinc-900 font-medium leading-relaxed"
            />
          </div>

          <div className="pt-4 border-t border-zinc-100 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 border border-zinc-200 text-zinc-600 rounded-xl text-xs font-bold hover:bg-zinc-50 transition-all active:scale-95"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-8 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-black flex items-center gap-2 hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all active:scale-95 disabled:opacity-50"
            >
              {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Guardar Perfil
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


