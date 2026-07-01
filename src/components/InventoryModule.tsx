import React, { useState } from 'react';
import { InventoryItem, Asset } from '../types';
import { Box, Plus, AlertTriangle, Search, Package, ArrowRight, Tag, Check, ShieldCheck, Trash2 } from 'lucide-react';

interface InventoryModuleProps {
  items: InventoryItem[];
  assets: Asset[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onAddItem: (item: Omit<InventoryItem, 'id'>) => void;
  onDeleteItem: (id: string) => void;
}

export default function InventoryModule({ items, assets, onUpdateQuantity, onAddItem, onDeleteItem }: InventoryModuleProps) {
  const [searchTerm, setSearchSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [newItem, setNewItem] = useState<Omit<InventoryItem, 'id'>>({
    name: '',
    category: 'general',
    quantity: 0,
    minStock: 1,
    unit: 'unidades',
    pricePerUnit: 0,
    compatibleAssets: []
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name) return;
    onAddItem(newItem);
    setIsModalOpen(false);
    setNewItem({
      name: '',
      category: 'general',
      quantity: 0,
      minStock: 1,
      unit: 'unidades',
      pricePerUnit: 0,
      compatibleAssets: []
    });
  };

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStockItems = items.filter(item => item.quantity <= item.minStock);

  return (
    <div className="space-y-6">
      {/* Modal para añadir item */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md border border-zinc-200 shadow-2xl overflow-hidden animate-fade-in">
            <div className="p-6 bg-zinc-900 text-white flex justify-between items-center">
              <h3 className="font-black uppercase tracking-widest text-sm">Nuevo Repuesto</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-white transition-colors">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-black text-zinc-400 uppercase mb-1">Nombre del Insumo</label>
                <input
                  type="text" required
                  className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-500 outline-none text-zinc-900"
                  value={newItem.name}
                  onChange={e => setNewItem({...newItem, name: e.target.value})}
                  placeholder="Ej: Aceite 5W-30 Full Synthetic"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-zinc-400 uppercase mb-1">Categoría</label>
                  <select
                    className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold outline-none text-zinc-900"
                    value={newItem.category}
                    onChange={e => setNewItem({...newItem, category: e.target.value as any})}
                  >
                    <option value="aceites">Aceites</option>
                    <option value="filtros">Filtros</option>
                    <option value="frenos">Frenos</option>
                    <option value="electricidad">Electricidad</option>
                    <option value="general">General</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-zinc-400 uppercase mb-1">Unidad</label>
                  <input
                    type="text"
                    className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold outline-none text-zinc-900"
                    value={newItem.unit}
                    onChange={e => setNewItem({...newItem, unit: e.target.value})}
                    placeholder="unidades, galones..."
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-zinc-400 uppercase mb-1">Cantidad Inicial</label>
                  <input
                    type="number"
                    className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold outline-none text-zinc-900"
                    value={newItem.quantity}
                    onChange={e => setNewItem({...newItem, quantity: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-zinc-400 uppercase mb-1">Aviso Stock Mínimo</label>
                  <input
                    type="number"
                    className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold outline-none text-zinc-900"
                    value={newItem.minStock}
                    onChange={e => setNewItem({...newItem, minStock: Number(e.target.value)})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-zinc-400 uppercase mb-2">Asociar a Equipos Compatibles</label>
                <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-3 max-h-[120px] overflow-y-auto space-y-2">
                  {assets.map(a => (
                    <label key={a.id} className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative flex items-center justify-center">
                        <input
                          type="checkbox"
                          className="peer appearance-none w-5 h-5 border-2 border-zinc-300 rounded-lg checked:bg-indigo-600 checked:border-indigo-600 transition-all cursor-pointer"
                          checked={newItem.compatibleAssets.includes(a.id)}
                          onChange={e => {
                            const current = newItem.compatibleAssets;
                            const next = e.target.checked
                              ? [...current, a.id]
                              : current.filter(id => id !== a.id);
                            setNewItem({...newItem, compatibleAssets: next});
                          }}
                        />
                        <Check className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
                      </div>
                      <span className="text-xs font-bold text-zinc-700 group-hover:text-indigo-600 transition-colors">{a.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
              >
                Registrar en Inventario
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Low Stock Alerts */}
      {lowStockItems.length > 0 && (
        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-xl animate-pulse">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-amber-600 w-5 h-5" />
            <div>
              <p className="text-sm font-black text-amber-900 uppercase tracking-tight">Alerta de Stock Bajo</p>
              <p className="text-xs text-amber-700">Tienes {lowStockItems.length} repuestos por debajo del mínimo. Considera reponer pronto.</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Inventory List */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-sm flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Buscar repuesto, categoría o equipo..."
                className="w-full pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={searchTerm}
                onChange={(e) => setSearchSearchTerm(e.target.value)}
              />
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-indigo-600 text-white p-2.5 rounded-xl hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 active:scale-90"
              title="Añadir nuevo repuesto"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredItems.map(item => (
              <div key={item.id} className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-sm hover:border-indigo-300 transition-all">
                <div className="flex justify-between items-start mb-3">
                  <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                    <Package className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase border ${
                      item.quantity <= item.minStock ? 'bg-red-50 text-red-600 border-red-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                    }`}>
                      {item.quantity} {item.unit}
                    </span>
                    <button
                      onClick={() => {
                        if(confirm('¿Estás seguro de eliminar este repuesto?')) {
                          onDeleteItem(item.id);
                        }
                      }}
                      className="p-1.5 text-zinc-300 hover:text-red-500 transition-colors"
                      title="Eliminar repuesto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h4 className="font-black text-zinc-900 text-sm">{item.name}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <Tag className="w-3 h-3 text-zinc-400" />
                  <span className="text-[10px] text-zinc-500 font-bold uppercase">{item.category}</span>
                </div>

                <div className="mt-4 pt-4 border-t border-zinc-100 flex items-center justify-between">
                  <div className="text-[10px] text-zinc-400 font-bold">
                    PRECIO REF: <span className="text-zinc-900">${item.pricePerUnit}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onUpdateQuantity(item.id, -1)}
                      className="w-8 h-8 rounded-lg bg-zinc-100 text-zinc-600 font-black hover:bg-zinc-200"
                    >-</button>
                    <button
                      onClick={() => onUpdateQuantity(item.id, 1)}
                      className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-black hover:bg-indigo-700"
                    >+</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Compatible Assets Sidebar */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-zinc-900 rounded-2xl p-5 text-white shadow-xl">
            <h3 className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-4">Uso en Equipos</h3>
            <div className="space-y-4">
              {assets.slice(0, 3).map(asset => {
                const compatibleItems = items.filter(i => i.compatibleAssets.includes(asset.id));
                return (
                  <div key={asset.id} className="p-3 bg-white/5 rounded-xl border border-white/10">
                    <p className="text-[11px] font-black">{asset.name}</p>
                    <p className="text-[9px] text-zinc-400 mb-2 uppercase">{compatibleItems.length} Repuestos compatibles</p>
                    <div className="flex flex-wrap gap-1">
                      {compatibleItems.map(i => (
                        <span key={i.id} className="text-[8px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-500/30">
                          {i.name}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
