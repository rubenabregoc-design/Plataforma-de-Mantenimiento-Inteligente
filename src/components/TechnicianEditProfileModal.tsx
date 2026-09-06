import React, { useState, useEffect, useRef } from 'react';
import { TechProfile, TechCategory } from '../types';
import { X, Save, User, Briefcase, DollarSign, MapPin, FileText, Award, RefreshCw, ShieldCheck, HelpCircle, Building, ChevronDown, Check, Search, Plus } from 'lucide-react';

const TECH_CATEGORIES: { value: TechCategory; label: string }[] = [
  { value: 'mecanico', label: 'Mecánico Automotriz' },
  { value: 'tecnico_ac', label: 'Técnico Aire Acondicionado' },
  { value: 'electricista', label: 'Ingeniero Eléctrico' },
  { value: 'informatico', label: 'Informático / IT' },
  { value: 'plomero', label: 'Plomero Especialista' },
  { value: 'especialista_solar', label: 'Especialista Solar' },
  { value: 'refrigeracion', label: 'Refrigeración Comercial e Industrial' },
  { value: 'plantas_electricas', label: 'Plantas Eléctricas y Generadores' },
  { value: 'ascensores', label: 'Ascensores y Elevadores' },
  { value: 'contra_incendio', label: 'Sistemas Contra Incendio' },
  { value: 'domotica', label: 'Domótica y Automatización' },
  { value: 'albanileria', label: 'Albañilería y Construcción' },
  { value: 'reparacion_hogar', label: 'Reparaciones del Hogar' },
  { value: 'jardineria', label: 'Jardinería / Paisajismo' },
  { value: 'piscinas', label: 'Mantenimiento de Piscinas' },
  { value: 'limpieza', label: 'Servicios de Limpieza' },
  { value: 'lavado_muebles', label: 'Lavado de Muebles y Tapicería' },
  { value: 'fotografo', label: 'Fotógrafo Profesional' },
  { value: 'estilista', label: 'Estilista / Barbería' },
  { value: 'entrenador', label: 'Entrenador Personal' },
  { value: 'masajista', label: 'Masajista Terapéutico' },
  { value: 'chef', label: 'Chef Privado / Catering' },
  { value: 'mascotas', label: 'Cuidado de Mascotas' },
  { value: 'legal', label: 'Asesoría Legal' },
  { value: 'contabilidad', label: 'Contabilidad y Finanzas' },
];

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
  const [secondaryCategories, setSecondaryCategories] = useState<TechCategory[]>(profile.secondaryCategories || []);
  const [experienceYears, setExperienceYears] = useState(profile.experienceYears || 0);
  const [hourlyRate, setHourlyRate] = useState(profile.hourlyRate || 0);
  const [location, setLocation] = useState(profile.location || '');
  const [phone, setPhone] = useState(profile.phone || '');
  const [bio, setBio] = useState(profile.bio || '');
  const [companyName, setCompanyName] = useState(profile.companyName || '');
  const [hasInsurance, setHasInsurance] = useState(profile.hasLiabilityInsurance || false);

  // Selector personalizado de especialidad principal
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');
  const categoryDropdownRef = useRef<HTMLDivElement>(null);

  // Selector de especialidades secundarias
  const [isSecondaryOpen, setIsSecondaryOpen] = useState(false);
  const secondaryDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
        setIsCategoryOpen(false);
      }
      if (secondaryDropdownRef.current && !secondaryDropdownRef.current.contains(event.target as Node)) {
        setIsSecondaryOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
      setSecondaryCategories(profile.secondaryCategories || []);
      setExperienceYears(profile.experienceYears || 0);
      setHourlyRate(profile.hourlyRate || 0);
      setLocation(profile.location || '');
      setPhone(profile.phone || '');
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
        secondaryCategories,
        experienceYears: Number(experienceYears),
        hourlyRate: Number(hourlyRate),
        location,
        phone,
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

  const filteredCategories = TECH_CATEGORIES.filter(cat =>
    cat.label.toLowerCase().includes(categorySearch.toLowerCase())
  );

  const availableSecondaryCategories = TECH_CATEGORIES.filter(
    cat => cat.value !== category && !secondaryCategories.includes(cat.value)
  );

  const currentCategoryLabel = TECH_CATEGORIES.find(c => c.value === category)?.label || 'Seleccionar especialidad';

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-[#0d0e12]/90 backdrop-blur-md">
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
          <div className="space-y-6 relative z-30">
            <h3 className="text-[10px] font-black text-[#5d3cfe] uppercase tracking-[0.4em] border-l-2 border-[#5d3cfe] pl-3">Identidad Profesional</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#474556] uppercase tracking-widest ml-1">Nombre Oficial</label>
                <input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="Ej: Pedro Castillo" className="w-full bg-[#1c1d21] border border-[#2a2b2f] rounded-xl py-3.5 px-4 text-sm font-bold text-white focus:border-[#5d3cfe] outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#474556] uppercase tracking-widest ml-1">Nombre Comercial / Empresa</label>
                <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Ej: MultiServicios S.A." className="w-full bg-[#1c1d21] border border-[#2a2b2f] rounded-xl py-3.5 px-4 text-sm font-bold text-white focus:border-[#c7bfff] outline-none" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#474556] uppercase tracking-widest ml-1">Teléfono / WhatsApp</label>
                <input type="text" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Ej: +507 6123-4567" className="w-full bg-[#1c1d21] border border-[#2a2b2f] rounded-xl py-3.5 px-4 text-sm font-bold text-white focus:border-[#5d3cfe] outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#474556] uppercase tracking-widest ml-1">Ubicación / Ciudad</label>
                <input type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="Ej: Ciudad de Panamá, San Francisco" className="w-full bg-[#1c1d21] border border-[#2a2b2f] rounded-xl py-3.5 px-4 text-sm font-bold text-white focus:border-[#5d3cfe] outline-none" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 relative" ref={categoryDropdownRef}>
                <label className="text-[10px] font-black text-[#474556] uppercase tracking-widest ml-1 flex items-center justify-between">
                  <span>Especialidad Principal</span>
                  <span className="text-[9px] text-[#5d3cfe] lowercase font-semibold">25 disponibles</span>
                </label>
                
                {/* Botón Trigger del Dropdown */}
                <button
                  type="button"
                  onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                  className={`w-full bg-[#1c1d21] border ${isCategoryOpen ? 'border-[#5d3cfe] ring-2 ring-[#5d3cfe]/20' : 'border-[#2a2b2f]'} rounded-xl py-3.5 px-4 text-sm font-bold text-white outline-none flex items-center justify-between transition-all hover:border-[#5d3cfe]/60 text-left`}
                >
                  <span className="truncate">{currentCategoryLabel}</span>
                  <ChevronDown className={`w-4 h-4 text-[#8e8d9a] transition-transform duration-200 shrink-0 ml-2 ${isCategoryOpen ? 'rotate-180 text-[#5d3cfe]' : ''}`} />
                </button>

                {/* Lista Desplegable con Scroll Suave y Búsqueda Rápida */}
                {isCategoryOpen && (
                  <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-[#17181c] border border-[#3b3d45] rounded-2xl shadow-2xl p-2.5 backdrop-blur-2xl animate-fade-in-up">
                    <div className="relative mb-2">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8e8d9a]" />
                      <input
                        type="text"
                        autoFocus
                        placeholder="Buscar especialidad..."
                        value={categorySearch}
                        onChange={e => setCategorySearch(e.target.value)}
                        className="w-full bg-[#0d0e12] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs font-semibold text-white placeholder-[#5a5965] focus:border-[#5d3cfe] outline-none"
                      />
                    </div>
                    
                    <div className="max-h-56 overflow-y-auto space-y-1 custom-scrollbar pr-1">
                      {filteredCategories.length === 0 ? (
                        <div className="text-center py-4 text-xs text-[#6e6d7a] font-medium">
                          No se encontraron especialidades
                        </div>
                      ) : (
                        filteredCategories.map(cat => {
                          const isSelected = cat.value === category;
                          return (
                            <button
                              key={cat.value}
                              type="button"
                              onClick={() => {
                                setCategory(cat.value);
                                setIsCategoryOpen(false);
                                setCategorySearch('');
                              }}
                              className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
                                isSelected
                                  ? 'bg-[#5d3cfe]/15 text-white border border-[#5d3cfe]/40'
                                  : 'text-[#c8c4d9] hover:bg-white/5 hover:text-white'
                              }`}
                            >
                              <span>{cat.label}</span>
                              {isSelected && <Check className="w-3.5 h-3.5 text-[#5d3cfe]" />}
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#474556] uppercase tracking-widest ml-1">Tarifa Base por Hora (B/.)</label>
                <input type="number" required value={hourlyRate} onChange={e => setHourlyRate(Number(e.target.value))} className="w-full bg-[#1c1d21] border border-[#2a2b2f] rounded-xl py-3.5 px-4 text-sm font-bold text-[#52ffac] outline-none" />
              </div>
            </div>

            {/* Especialidades Secundarias / Adicionales */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black text-[#c7bfff] uppercase tracking-widest ml-1 flex items-center gap-2">
                  <Award className="w-3.5 h-3.5 text-[#5d3cfe]" /> Especialidades Secundarias / Adicionales
                </label>
                <span className="text-[9px] font-bold text-[#8e8d9a]">
                  {secondaryCategories.length} seleccionada{secondaryCategories.length !== 1 ? 's' : ''}
                </span>
              </div>
              <p className="text-[10px] text-[#6e6d7a] ml-1">
                Aparecerás en los filtros del Marketplace para cada una de las especialidades que agregues aquí.
              </p>

              {/* Chips de especialidades seleccionadas */}
              <div className="flex flex-wrap gap-2 p-3.5 bg-[#0d0e12] border border-white/5 rounded-2xl min-h-[52px] items-center">
                {secondaryCategories.length === 0 ? (
                  <span className="text-xs text-[#525060] italic px-1">Sin especialidades adicionales seleccionadas</span>
                ) : (
                  secondaryCategories.map(catVal => {
                    const label = TECH_CATEGORIES.find(c => c.value === catVal)?.label || catVal;
                    return (
                      <span
                        key={catVal}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#5d3cfe]/20 text-[#c7bfff] border border-[#5d3cfe]/30 rounded-xl text-xs font-bold animate-fade-in"
                      >
                        {label}
                        <button
                          type="button"
                          onClick={() => setSecondaryCategories(secondaryCategories.filter(c => c !== catVal))}
                          className="hover:text-rose-400 p-0.5 rounded-full transition-colors ml-1"
                          title="Eliminar especialidad"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    );
                  })
                )}
              </div>

              {/* Botón y Dropdown para agregar más */}
              <div className="relative" ref={secondaryDropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsSecondaryOpen(!isSecondaryOpen)}
                  className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl text-xs font-bold transition-all flex items-center gap-2 hover:border-[#5d3cfe]/50"
                >
                  <Plus className="w-3.5 h-3.5 text-[#52ffac]" />
                  <span>Agregar Especialidad Adicional...</span>
                </button>

                {isSecondaryOpen && (
                  <div className="absolute top-full left-0 mt-2 w-80 max-w-[90vw] z-50 bg-[#17181c] border border-[#3b3d45] rounded-2xl shadow-2xl p-2.5 backdrop-blur-2xl animate-fade-in-up">
                    <div className="max-h-52 overflow-y-auto space-y-1 custom-scrollbar pr-1">
                      {availableSecondaryCategories.length === 0 ? (
                        <div className="text-center py-3 text-xs text-[#6e6d7a] font-medium">
                          Has seleccionado todas las categorías disponibles
                        </div>
                      ) : (
                        availableSecondaryCategories.map(cat => (
                          <button
                            key={cat.value}
                            type="button"
                            onClick={() => {
                              setSecondaryCategories([...secondaryCategories, cat.value]);
                              setIsSecondaryOpen(false);
                            }}
                            className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-[#c8c4d9] hover:bg-[#5d3cfe]/20 hover:text-white transition-all flex items-center justify-between"
                          >
                            <span>{cat.label}</span>
                            <Plus className="w-3 h-3 text-[#52ffac]" />
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
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
