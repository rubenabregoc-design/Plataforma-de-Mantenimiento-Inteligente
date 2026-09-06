import React, { useState, useEffect } from 'react';
import { X, Save, User, Phone, MapPin, Building2, FileText, RefreshCw, ShieldCheck } from 'lucide-react';

interface UserProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  userData: any;
  userEmail: string;
  role: 'client' | 'tech' | 'admin' | null;
  onSave: (updatedData: {
    name: string;
    phone?: string;
    location?: string;
    company?: string;
    cedula?: string;
  }) => Promise<void>;
}

export default function UserProfileEditModal({
  isOpen,
  onClose,
  userData,
  userEmail,
  role,
  onSave
}: UserProfileEditModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [company, setCompany] = useState('');
  const [cedula, setCedula] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen && userData) {
      setName(userData.name || '');
      setPhone(userData.phone || '');
      setLocation(userData.location || userData.address || '');
      setCompany(userData.company || userData.companyName || userData.building || '');
      setCedula(userData.cedula || userData.ruc || '');
    }
  }, [isOpen, userData]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave({
        name: name.trim(),
        phone: phone.trim(),
        location: location.trim(),
        company: company.trim(),
        cedula: cedula.trim()
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const roleLabel = role === 'admin' ? 'Administrador Central' : role === 'tech' ? 'Especialista Técnico' : 'Cliente / Propietario';

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-lg bg-[#121317] rounded-2xl sm:rounded-3xl border border-white/10 shadow-2xl overflow-hidden animate-fade-in-up">
        <header className="px-5 py-4 sm:px-6 sm:py-5 bg-[#1c1d21] border-b border-white/5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#5d3cfe]/10 border border-[#5d3cfe]/30 flex items-center justify-center text-[#5d3cfe]">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-tight">Editar Perfil</h2>
              <p className="text-[9px] text-[#6b697e] font-bold uppercase tracking-wider">{roleLabel}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl bg-white/5 text-[#6b697e] hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto custom-scrollbar">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-[#6b697e] uppercase tracking-wider ml-1">
              Nombre Completo o Razón Social
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ej: Juan Pérez o Empresa S.A."
                className="w-full bg-[#1c1d21] border border-[#2a2b2f] rounded-xl py-2.5 pl-4 pr-10 text-xs sm:text-sm font-bold text-white focus:border-[#5d3cfe] outline-none transition-all"
              />
              <User className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b697e]" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-[#6b697e] uppercase tracking-wider ml-1">
              Correo Electrónico (Registrado)
            </label>
            <input
              type="email"
              readOnly
              value={userEmail}
              className="w-full bg-[#0d0e12] border border-white/5 rounded-xl py-2.5 px-4 text-xs font-semibold text-[#6b697e] cursor-not-allowed outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-[#6b697e] uppercase tracking-wider ml-1">
                Teléfono / WhatsApp
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="Ej: +507 6123-4567"
                  className="w-full bg-[#1c1d21] border border-[#2a2b2f] rounded-xl py-2.5 pl-4 pr-10 text-xs sm:text-sm font-medium text-white focus:border-[#5d3cfe] outline-none transition-all"
                />
                <Phone className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b697e]" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-[#6b697e] uppercase tracking-wider ml-1">
                Cédula o RUC
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={cedula}
                  onChange={e => setCedula(e.target.value)}
                  placeholder="Ej: 8-123-456 DV 78"
                  className="w-full bg-[#1c1d21] border border-[#2a2b2f] rounded-xl py-2.5 pl-4 pr-10 text-xs sm:text-sm font-medium text-white focus:border-[#5d3cfe] outline-none transition-all"
                />
                <FileText className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b697e]" />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-[#6b697e] uppercase tracking-wider ml-1">
              Empresa, Edificio o PH
            </label>
            <div className="relative">
              <input
                type="text"
                value={company}
                onChange={e => setCompany(e.target.value)}
                placeholder="Ej: PH Sky Residences o Constructora Beta"
                className="w-full bg-[#1c1d21] border border-[#2a2b2f] rounded-xl py-2.5 pl-4 pr-10 text-xs sm:text-sm font-medium text-white focus:border-[#5d3cfe] outline-none transition-all"
              />
              <Building2 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b697e]" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-[#6b697e] uppercase tracking-wider ml-1">
              Ubicación / Dirección
            </label>
            <div className="relative">
              <input
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="Ej: Calle 50, Bella Vista, Ciudad de Panamá"
                className="w-full bg-[#1c1d21] border border-[#2a2b2f] rounded-xl py-2.5 pl-4 pr-10 text-xs sm:text-sm font-medium text-white focus:border-[#5d3cfe] outline-none transition-all"
              />
              <MapPin className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b697e]" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full py-3 bg-[#5d3cfe] hover:bg-[#4d2ee0] text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg shadow-[#5d3cfe]/20 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
          >
            {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Guardar Cambios del Perfil
          </button>
        </form>
      </div>
    </div>
  );
}
