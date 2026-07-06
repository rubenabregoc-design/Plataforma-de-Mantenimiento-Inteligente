import React, { useState } from 'react';
import { InventoryItem, Asset } from '../types';
import { Search, Plus, Package, Tag, Trash2, ArrowRight, Info, AlertTriangle } from 'lucide-react';

interface InventoryModuleProps {
  items: InventoryItem[];
  assets: Asset[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onAddItem: (item: Omit<InventoryItem, 'id'>) => void;
  onDeleteItem: (id: string) => void;
  onUpdateItem?: (item: InventoryItem) => void;
}

export default function InventoryModule({ items, assets, onUpdateQuantity, onAddItem, onDeleteItem, onUpdateItem }: InventoryModuleProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [newItem, setNewItem] = useState({ name: '', category: 'Repuestos', quantity: 0, minStock: 5, unit: 'unidades', pricePerUnit: 0 });

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem && onUpdateItem) {
      onUpdateItem({ ...editingItem, ...newItem } as InventoryItem);
      setEditingItem(null);
    } else {
      onAddItem(newItem as any);
    }
    setNewItem({ name: '', category: 'Repuestos', quantity: 0, minStock: 5, unit: 'unidades', pricePerUnit: 0 });
    setIsAdding(false);
  };

  const startEditing = (item: InventoryItem) => {
    setEditingItem(item);
    setNewItem({
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      minStock: item.minStock,
      unit: item.unit,
      pricePerUnit: item.pricePerUnit
    });
    setIsAdding(true);
  };


  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in-up">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase">Repuestos</h1>
          <p className="text-[#c8c4d9] font-medium mt-2">Control de inventario y consumibles industriales.</p>
        </div>
        <button
          onClick={() => {
            if (isAdding) {
              setEditingItem(null);
              setNewItem({ name: '', category: 'Repuestos', quantity: 0, minStock: 5, unit: 'unidades', pricePerUnit: 0 });
            }
            setIsAdding(!isAdding);
          }}
          className={`w-14 h-14 rounded-2xl text-white flex items-center justify-center shadow-lg active:scale-95 transition-all ${isAdding ? 'bg-rose-600 shadow-rose-600/20 rotate-45' : 'bg-[#5d3cfe] shadow-[#5d3cfe]/20'}`}
        >
          <Plus className="w-8 h-8" />
        </button>
      </header>

      {isAdding && (
        <form onSubmit={handleAddItem} className="bg-[#121317] border border-[#2a2b2f] p-8 rounded-[2rem] space-y-6 animate-fade-in-up shadow-2xl relative overflow-hidden">
          <div className="scanline"></div>
          <div className="flex items-center gap-3 mb-2 relative z-10">
            <div className="p-2 bg-[#5d3cfe]/10 rounded-lg text-[#5d3cfe]">
               <Package className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-black text-white uppercase tracking-widest">{editingItem ? 'Editar Insumo' : 'Nuevo Item de Inventario'}</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
            <div className="space-y-2">
              <label className="text-[9px] font-black text-[#474556] uppercase tracking-widest ml-1">Nombre del Insumo</label>
              <input required type="text" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} placeholder="Ej: Filtro de Aceite" className="w-full bg-[#0d0e12] border border-[#2a2b2f] rounded-xl py-3 px-4 text-xs font-bold text-white focus:border-[#c7bfff] outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black text-[#474556] uppercase tracking-widest ml-1">Categoría</label>
              <select value={newItem.category} onChange={e => setNewItem({...newItem, category: e.target.value as any})} className="w-full bg-[#0d0e12] border border-[#2a2b2f] rounded-xl py-3 px-4 text-xs font-bold text-white focus:border-[#c7bfff] outline-none">
                <option value="Repuestos">Repuestos</option>
                <option value="Lubricantes">Lubricantes</option>
                <option value="Consumibles">Consumibles</option>
                <option value="Herramientas">Herramientas</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black text-[#474556] uppercase tracking-widest ml-1">Cantidad {editingItem ? 'Actual' : 'Inicial'}</label>
              <input required type="number" value={newItem.quantity} onChange={e => setNewItem({...newItem, quantity: Number(e.target.value)})} className="w-full bg-[#0d0e12] border border-[#2a2b2f] rounded-xl py-3 px-4 text-xs font-bold text-white focus:border-[#c7bfff] outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black text-[#474556] uppercase tracking-widest ml-1">Precio por Unidad (B/.)</label>
              <input required type="number" step="0.01" value={newItem.pricePerUnit} onChange={e => setNewItem({...newItem, pricePerUnit: Number(e.target.value)})} className="w-full bg-[#0d0e12] border border-[#2a2b2f] rounded-xl py-3 px-4 text-xs font-bold text-white focus:border-[#c7bfff] outline-none" />
            </div>
          </div>
          <button type="submit" className="w-full py-4 bg-[#5d3cfe] text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-[#5d3cfe]/20 hover:brightness-110 active:scale-95 transition-all relative z-10">
            {editingItem ? 'Guardar Cambios' : 'Registrar en Inventario'}
          </button>
        </form>
      )}

      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#474556]" />
          <input
            type="text"
            placeholder="Buscar insumo, categoría o compatibilidad..."
            className="w-full bg-[#121317] border border-[#2a2b2f] rounded-2xl py-4 pl-14 pr-6 text-sm font-bold text-white focus:border-[#c7bfff] outline-none transition-all shadow-inner"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map(item => (
          <div key={item.id} className="modern-card p-6 flex flex-col gap-6 relative group border border-[#2a2b2f] bg-[#121317]">
             <div className="flex justify-between items-start">
                <div className="p-3 bg-[#c7bfff]/10 rounded-xl text-[#c7bfff] border border-[#c7bfff]/20">
                  <Package className="w-6 h-6" />
                </div>
                <div className="flex flex-col items-end gap-2">
                   <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${item.quantity <= item.minStock ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 'bg-[#52ffac]/10 text-[#52ffac] border-[#52ffac]/20'}`}>
                      {item.quantity} {item.unit.toUpperCase()}
                   </span>
                   {item.quantity <= item.minStock && (
                     <div className="flex items-center gap-1 text-rose-500">
                        <AlertTriangle className="w-3 h-3" />
                        <span className="text-[8px] font-black uppercase">Stock Bajo</span>
                     </div>
                   )}
                </div>
             </div>

             <div className="flex-1">
                <h4 className="text-xl font-black text-white mb-1 uppercase tracking-tight leading-tight">{item.name}</h4>
                <div className="flex items-center gap-2 text-[#474556]">
                   <Tag className="w-3 h-3" />
                   <span className="text-[10px] font-bold uppercase tracking-widest">{item.category}</span>
                </div>
             </div>

             <div className="bg-[#0d0e12] border border-[#2a2b2f]/50 p-5 rounded-2xl flex items-center justify-between shadow-inner">
                <div className="flex flex-col">
                   <span className="text-[8px] font-black text-[#474556] uppercase tracking-widest mb-1">Precio Ref.</span>
                   <span className="text-lg font-black text-[#52ffac]">$ {item.pricePerUnit.toFixed(2)}</span>
                </div>
                <div className="flex items-center bg-[#1c1d21] rounded-xl p-1 border border-[#2a2b2f]">
                   <button onClick={() => onUpdateQuantity(item.id, -1)} className="w-8 h-8 rounded-lg bg-[#0d0e12] text-white font-black hover:bg-[#2a2b2f] transition-all flex items-center justify-center">-</button>
                   <span className="text-sm font-black text-white w-10 text-center">{item.quantity}</span>
                   <button onClick={() => onUpdateQuantity(item.id, 1)} className="w-8 h-8 rounded-lg bg-[#0d0e12] text-white font-black hover:bg-[#2a2b2f] transition-all flex items-center justify-center">+</button>
                </div>
             </div>

             <div className="flex justify-between items-center mt-2 border-t border-[#2a2b2f] pt-4">
                <button onClick={() => onDeleteItem(item.id)} className="text-[#474556] hover:text-rose-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                <button
                  onClick={() => startEditing(item)}
                  className="text-[#5d3cfe] text-[10px] font-black uppercase tracking-widest flex items-center gap-1 hover:underline"
                >
                  Gestionar <ArrowRight className="w-4 h-4" />
                </button>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}
