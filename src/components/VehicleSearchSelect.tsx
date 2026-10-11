import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Asset } from '../types';
import { Truck, Search, Check, ChevronDown, X, Gauge, MapPin } from 'lucide-react';

interface VehicleSearchSelectProps {
  vehicles: Asset[];
  selectedId: string;
  onSelect: (assetId: string) => void;
  placeholder?: string;
  allowEmpty?: boolean;
  emptyLabel?: string;
  compact?: boolean;
}

export default function VehicleSearchSelect({
  vehicles,
  selectedId,
  onSelect,
  placeholder = 'Seleccionar Vehículo',
  allowEmpty = true,
  emptyLabel = 'Sin vehículo asignado (En Reserva)',
  compact = false
}: VehicleSearchSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedVehicle = useMemo(
    () => vehicles.find(v => v.id === selectedId || v.name === selectedId),
    [vehicles, selectedId]
  );

  const filteredVehicles = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return vehicles;
    return vehicles.filter(
      v =>
        v.name.toLowerCase().includes(q) ||
        (v.licensePlate && v.licensePlate.toLowerCase().includes(q)) ||
        (v.location && v.location.toLowerCase().includes(q)) ||
        (v.driverName && v.driverName.toLowerCase().includes(q))
    );
  }, [vehicles, search]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Botón Disparador */}
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        className={`w-full flex items-center justify-between gap-2.5 bg-[#0d0e12] border ${
          isOpen ? 'border-[#5d3cfe] ring-2 ring-[#5d3cfe]/20' : 'border-white/10 hover:border-white/25'
        } rounded-2xl transition-all text-left ${
          compact ? 'px-3 py-2.5' : 'px-4 py-3'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
              selectedVehicle
                ? 'bg-amber-500/15 border border-amber-500/30 text-amber-400'
                : 'bg-white/5 border border-white/10 text-[#8a879d]'
            }`}
          >
            <Truck className="w-4 h-4" />
          </div>
          {selectedVehicle ? (
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-black text-white uppercase truncate">
                  {selectedVehicle.name}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[9px] font-black uppercase tracking-wider shrink-0">
                  {selectedVehicle.licensePlate || 'S/P'}
                </span>
              </div>
              {!compact && (
                <p className="text-[10px] text-[#8a879d] font-bold truncate mt-0.5">
                  {selectedVehicle.mileage ? `${selectedVehicle.mileage.toLocaleString()} KM` : '0 KM'}
                  {selectedVehicle.driverName ? ` • Cond: ${selectedVehicle.driverName}` : ''}
                </p>
              )}
            </div>
          ) : (
            <span className="text-xs font-black text-[#8a879d] uppercase tracking-wider truncate">
              {placeholder}
            </span>
          )}
        </div>
        <ChevronDown
          className={`w-4 h-4 text-[#8a879d] shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-[#5d3cfe]' : ''
          }`}
        />
      </button>

      {/* Modal / Dropdown Buscador Profesional */}
      {isOpen && (
        <div className="fixed inset-x-4 top-[15%] sm:absolute sm:inset-x-0 sm:top-full sm:mt-2 z-[600] bg-[#14151b] border border-white/15 rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.85)] overflow-hidden animate-fade-in">
          {/* Cabecera del selector */}
          <div className="p-3.5 border-b border-white/10 bg-[#0d0e12]/90 space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5" /> Flota Registrada ({filteredVehicles.length})
              </span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg bg-white/5 text-[#8a879d] hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-[#8a879d] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar camión por unidad, placa (ej. CP-2433) o chofer..."
                autoFocus
                className="w-full bg-[#16171d] border border-white/10 rounded-xl py-2.5 pl-10 pr-8 text-xs text-white placeholder:text-[#6e6d7a] outline-none focus:border-amber-400 font-bold"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8a879d] hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Lista de Vehículos */}
          <div className="max-h-72 overflow-y-auto divide-y divide-white/5 custom-scrollbar">
            {allowEmpty && (
              <button
                type="button"
                onClick={() => {
                  onSelect('');
                  setIsOpen(false);
                  setSearch('');
                }}
                className={`w-full px-4 py-3 flex items-center justify-between text-left transition-colors ${
                  !selectedId ? 'bg-[#5d3cfe]/15 text-white' : 'hover:bg-white/5 text-[#8a879d]'
                }`}
              >
                <span className="text-[11px] font-black uppercase tracking-wider">{emptyLabel}</span>
                {!selectedId && <Check className="w-4 h-4 text-[#52ffac] shrink-0" />}
              </button>
            )}

            {filteredVehicles.length > 0 ? (
              filteredVehicles.map(v => {
                const isSelected = v.id === selectedId || v.name === selectedId;
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => {
                      onSelect(v.id);
                      setIsOpen(false);
                      setSearch('');
                    }}
                    className={`w-full px-4 py-3 flex items-center justify-between gap-3 text-left transition-all ${
                      isSelected
                        ? 'bg-amber-500/15 border-l-4 border-amber-400'
                        : 'hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-black text-xs ${
                          isSelected
                            ? 'bg-amber-500 text-black'
                            : 'bg-[#0d0e12] border border-white/10 text-amber-400'
                        }`}
                      >
                        <Truck className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-black text-white uppercase truncate">
                            {v.name}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[9px] font-black uppercase tracking-wider">
                            {v.licensePlate || 'S/P'}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-[10px] text-[#8a879d] font-bold">
                          <span className="flex items-center gap-1">
                            <Gauge className="w-3 h-3 text-[#52ffac]" />
                            {(v.mileage || 0).toLocaleString()} KM
                          </span>
                          {v.location && (
                            <span className="flex items-center gap-1 truncate">
                              <MapPin className="w-3 h-3 text-[#5d3cfe]" />
                              {v.location}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border ${
                        isSelected
                          ? 'bg-[#52ffac] border-[#52ffac] text-black'
                          : 'border-white/15 text-transparent'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="py-8 px-4 text-center">
                <p className="text-xs font-black text-white/50 uppercase">
                  No se encontró ningún camión con "{search}"
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
