import React, { useState, useEffect } from 'react';
import { Asset, AssetType } from '../types';
import { Plus, X, Car, ShieldCheck, Cpu, Sliders, BatteryCharging, Zap, RotateCcw, Edit2 } from 'lucide-react';

interface AssetRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (asset: Omit<Asset, 'id' | 'registeredAt'>) => void;
  editingAsset?: Asset | null;
}

export default function AssetRegisterModal({ isOpen, onClose, onAdd, editingAsset }: AssetRegisterModalProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<AssetType>('car');
  const [details, setDetails] = useState('');
  const [mileage, setMileage] = useState<number>(0);
  const [usageHours, setUsageHours] = useState<number>(0);
  const [lastMaintenance, setLastMaintenance] = useState('');
  const [nextMaintenance, setNextMaintenance] = useState('');

  useEffect(() => {
    if (editingAsset) {
      setName(editingAsset.name);
      setType(editingAsset.type);
      setDetails(editingAsset.details);
      setMileage(editingAsset.mileage || 0);
      setUsageHours(editingAsset.usageHours || 0);
      setLastMaintenance(editingAsset.lastMaintenanceDate || '');
      setNextMaintenance(editingAsset.nextMaintenanceDate || '');
    } else {
      setName('');
      setType('car');
      setDetails('');
      setMileage(0);
      setUsageHours(0);
      setLastMaintenance('');
      setNextMaintenance('');
    }
  }, [editingAsset, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !lastMaintenance || !nextMaintenance) return;

    onAdd({
      name,
      type,
      details,
      mileage: type === 'car' || type === 'moto' ? Number(mileage) : undefined,
      usageHours: type === 'generator' || type === 'industrial_equip' ? Number(usageHours) : undefined,
      lastMaintenanceDate: lastMaintenance,
      nextMaintenanceDate: nextMaintenance,
    });

    onClose();
  };

  const getAssetIcon = (assetType: AssetType) => {
    switch (assetType) {
      case 'car':
      case 'moto':
        return <Car className="w-5 h-5 text-indigo-500" />;
      case 'ac':
        return <Sliders className="w-5 h-5 text-sky-500" />;
      case 'computer':
        return <Cpu className="w-5 h-5 text-emerald-500" />;
      case 'generator':
        return <Zap className="w-5 h-5 text-amber-500" />;
      case 'solar_panels':
        return <BatteryCharging className="w-5 h-5 text-orange-500" />;
      default:
        return <ShieldCheck className="w-5 h-5 text-teal-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-100">
        <div className="flex justify-between items-center px-6 py-4 bg-gray-50 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            {editingAsset ? <Edit2 className="w-5 h-5 text-indigo-600" /> : <Plus className="w-5 h-5 text-indigo-600" />}
            {editingAsset ? 'Editar Equipo o Activo' : 'Registrar Nuevo Equipo o Activo'}
          </h2>
          <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Activo / Equipo</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { type: 'car', label: 'Carro / Vehículo' },
                { type: 'ac', label: 'Aire Acondicionado' },
                { type: 'computer', label: 'Infraestructura TI / PC' },
                { type: 'generator', label: 'Planta Eléctrica' },
                { type: 'solar_panels', label: 'Paneles Solares' },
                { type: 'moto', label: 'Moto / Lancha' },
                { type: 'industrial_equip', label: 'Equipo Industrial' },
                { type: 'house', label: 'Hogar / Plomería' },
              ].map((item) => (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => setType(item.type as AssetType)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-left text-xs font-medium transition-all ${
                    type === item.type
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-900 shadow-xs'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {getAssetIcon(item.type as AssetType)}
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Descriptivo</label>
            <input
              type="text"
              required
              placeholder="Ej: Toyota Yaris, Aire Split Habitación, Servidor Dell"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Especificaciones / Detalles</label>
            <textarea
              placeholder="Ej: Marca Samsung, Inverter 12000 BTU, Placa 4512-B, Año 2021"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
            />
          </div>

          {/* Conditional Metrics */}
          {(type === 'car' || type === 'moto') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kilometraje Actual (km)</label>
              <input
                type="number"
                min="0"
                value={mileage}
                onChange={(e) => setMileage(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-gray-900"
              />
            </div>
          )}

          {(type === 'generator' || type === 'industrial_equip') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Horas de Uso Actuales</label>
              <input
                type="number"
                min="0"
                value={usageHours}
                onChange={(e) => setUsageHours(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-gray-900"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Último Mantenimiento</label>
              <input
                type="date"
                required
                value={lastMaintenance}
                onChange={(e) => setLastMaintenance(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-gray-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Próximo Mantenimiento</label>
              <input
                type="date"
                required
                value={nextMaintenance}
                onChange={(e) => setNextMaintenance(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-gray-800"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-xs"
            >
              {editingAsset ? 'Guardar Cambios' : 'Registrar Activo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
