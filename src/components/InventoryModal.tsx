import React, { useState } from 'react';
import { Equipment, Item } from '../types';
import { X, Sparkles, Trash2, CheckCircle2, Shield, Sword, Gem, Package } from 'lucide-react';
import { ItemIcon } from './ItemIcon';
import { WeaponPreviewCanvas } from './WeaponPreviewCanvas';

interface InventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: Item[];
  equipment: Equipment;
  onEquipItem: (item: Item) => void;
  onUnequipItem: (slot: keyof Equipment) => void;
  onUseItem: (item: Item) => void;
  onDropItem: (item: Item) => void;
}

export const InventoryModal: React.FC<InventoryModalProps> = ({
  isOpen,
  onClose,
  inventory,
  equipment,
  onEquipItem,
  onUnequipItem,
  onUseItem,
  onDropItem,
}) => {
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [filter, setFilter] = useState<'all' | 'equip' | 'consumable'>('all');

  if (!isOpen) return null;

  const filteredItems = inventory.filter((item) => {
    if (filter === 'equip') return item.type === 'weapon' || item.type === 'armor' || item.type === 'ring';
    if (filter === 'consumable') return item.type === 'potion' || item.type === 'scroll';
    return true;
  });

  const getRarityBadge = (rarity: Item['rarity']) => {
    switch (rarity) {
      case 'legendary':
        return 'text-amber-400 bg-amber-950/60 border-amber-500/50';
      case 'epic':
        return 'text-purple-400 bg-purple-950/60 border-purple-500/50';
      case 'rare':
        return 'text-sky-400 bg-sky-950/60 border-sky-500/50';
      default:
        return 'text-slate-400 bg-slate-800 border-slate-700';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl flex flex-col max-h-[85vh] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/95">
          <h2 className="text-sm font-cinzel font-bold text-slate-100 flex items-center gap-2">
            <Package className="w-4 h-4 text-amber-400" />
            <span>Mochila y Equipamiento</span>
          </h2>
          <button
            id="btn-close-inventory"
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Equipment Loadout Slots */}
        <div className="p-3 bg-slate-950/50 border-b border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2 font-mono">
            Equipamiento Activo
          </span>
          <div className="grid grid-cols-3 gap-2">
            {/* Weapon Slot */}
            <div
              onClick={() => equipment.weapon && setSelectedItem(equipment.weapon)}
              className={`p-2.5 rounded-xl border flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                equipment.weapon
                  ? 'bg-slate-800/80 border-slate-700 hover:border-amber-500'
                  : 'bg-slate-900/40 border-dashed border-slate-800'
              }`}
            >
              <div className="mb-1">
                {equipment.weapon ? (
                  <ItemIcon item={equipment.weapon} size="sm" showRarityGlow={true} />
                ) : (
                  <div className="w-7 h-7 rounded-xl border border-dashed border-slate-700 flex items-center justify-center text-slate-600">
                    <Sword className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
              <span className="text-[10px] font-medium text-slate-300 truncate max-w-full">
                {equipment.weapon ? equipment.weapon.name : 'Sin Arma'}
              </span>
              <span className="text-[9px] text-slate-500">Arma</span>
            </div>

            {/* Armor Slot */}
            <div
              onClick={() => equipment.armor && setSelectedItem(equipment.armor)}
              className={`p-2.5 rounded-xl border flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                equipment.armor
                  ? 'bg-slate-800/80 border-slate-700 hover:border-amber-500'
                  : 'bg-slate-900/40 border-dashed border-slate-800'
              }`}
            >
              <div className="mb-1">
                {equipment.armor ? (
                  <ItemIcon item={equipment.armor} size="sm" showRarityGlow={true} />
                ) : (
                  <div className="w-7 h-7 rounded-xl border border-dashed border-slate-700 flex items-center justify-center text-slate-600">
                    <Shield className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
              <span className="text-[10px] font-medium text-slate-300 truncate max-w-full">
                {equipment.armor ? equipment.armor.name : 'Sin Armadura'}
              </span>
              <span className="text-[9px] text-slate-500">Armadura</span>
            </div>

            {/* Ring / Relic Slot */}
            <div
              onClick={() => equipment.ring && setSelectedItem(equipment.ring)}
              className={`p-2.5 rounded-xl border flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                equipment.ring
                  ? 'bg-slate-800/80 border-slate-700 hover:border-amber-500'
                  : 'bg-slate-900/40 border-dashed border-slate-800'
              }`}
            >
              <div className="mb-1">
                {equipment.ring ? (
                  <ItemIcon item={equipment.ring} size="sm" showRarityGlow={true} />
                ) : (
                  <div className="w-7 h-7 rounded-xl border border-dashed border-slate-700 flex items-center justify-center text-slate-600">
                    <Gem className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
              <span className="text-[10px] font-medium text-slate-300 truncate max-w-full">
                {equipment.ring ? equipment.ring.name : 'Sin Reliquia'}
              </span>
              <span className="text-[9px] text-slate-500">Reliquia</span>
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex gap-1.5 px-3 py-2 border-b border-slate-800 bg-slate-900 text-xs">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
              filter === 'all' ? 'bg-amber-600 text-slate-950 font-bold' : 'bg-slate-800 text-slate-300'
            }`}
          >
            Todos ({inventory.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('equip')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
              filter === 'equip' ? 'bg-amber-600 text-slate-950 font-bold' : 'bg-slate-800 text-slate-300'
            }`}
          >
            Equipo
          </button>
          <button
            type="button"
            onClick={() => setFilter('consumable')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
              filter === 'consumable' ? 'bg-amber-600 text-slate-950 font-bold' : 'bg-slate-800 text-slate-300'
            }`}
          >
            Pociones y Rollos
          </button>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
          {filteredItems.length === 0 ? (
            <div className="text-slate-500 text-center py-8 text-xs font-mono">
              Mochila vacía. Encuentra cofres o derrota monstruos.
            </div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
                  selectedItem?.id === item.id
                    ? 'bg-slate-800 border-amber-500'
                    : 'bg-slate-950/70 border-slate-800/80 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <ItemIcon item={item} size="md" showRarityGlow={true} />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-200">{item.name}</span>
                      <span
                        className={`text-[9px] uppercase px-1.5 py-0.2 rounded border font-mono ${getRarityBadge(
                          item.rarity
                        )}`}
                      >
                        {item.rarity}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      {item.atkBonus && `+${item.atkBonus} ATK `}
                      {item.defBonus && `+${item.defBonus} DEF `}
                      {item.hpBonus && `+${item.hpBonus} HP `}
                      {item.critBonus && `+${item.critBonus}% CRIT `}
                      {item.healAmount && `Cura ${item.healAmount} HP `}
                      {item.mpRestoreAmount && `+${item.mpRestoreAmount} MP `}
                    </div>
                  </div>
                </div>

                <div className="text-amber-400 font-mono text-xs font-semibold">
                  {item.value} 🪙
                </div>
              </div>
            ))
          )}
        </div>

        {/* Selected Item Detail & Actions Drawer */}
        {selectedItem && (
          <div className="p-3 bg-slate-950 border-t border-slate-800 flex flex-col gap-2">
            <div className="flex items-start gap-2.5">
              {selectedItem.weaponParts ? (
                <div className="p-1 rounded-xl bg-slate-900 border border-slate-700/60 shadow-inner flex items-center justify-center">
                  <WeaponPreviewCanvas weaponParts={selectedItem.weaponParts} size={42} animated={true} />
                </div>
              ) : (
                <ItemIcon item={selectedItem} size="md" showRarityGlow={true} />
              )}
              <div className="flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h4 className="text-xs font-bold text-slate-100">
                    {selectedItem.name}
                  </h4>
                  {selectedItem.weaponParts?.element && selectedItem.weaponParts.element !== 'none' && (
                    <span
                      className="text-[9px] uppercase px-1.5 py-0.2 rounded-full font-bold border"
                      style={{
                        borderColor: selectedItem.weaponParts.auraColor,
                        color: selectedItem.weaponParts.auraColor,
                        backgroundColor: `${selectedItem.weaponParts.auraColor}15`,
                      }}
                    >
                      {selectedItem.weaponParts.element}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">{selectedItem.description}</p>
                {selectedItem.weaponParts && (
                  <div className="text-[9px] text-slate-400 mt-1 font-mono flex flex-wrap gap-x-2 gap-y-0.5">
                    <span>Hoja: <b className="text-slate-300">{selectedItem.weaponParts.bladeShape}</b></span>
                    <span>Guarda: <b className="text-slate-300">{selectedItem.weaponParts.guardShape}</b></span>
                    <span>Mango: <b className="text-slate-300">{selectedItem.weaponParts.gripMaterial}</b></span>
                    <span>Pomo: <b className="text-slate-300">{selectedItem.weaponParts.pommelShape}</b></span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              {/* If it's an equipable item */}
              {(selectedItem.type === 'weapon' ||
                selectedItem.type === 'armor' ||
                selectedItem.type === 'ring') && (
                <>
                  {[equipment.weapon, equipment.armor, equipment.ring].some((e) => e?.id === selectedItem.id) ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (equipment.weapon?.id === selectedItem.id) onUnequipItem('weapon');
                        if (equipment.armor?.id === selectedItem.id) onUnequipItem('armor');
                        if (equipment.ring?.id === selectedItem.id) onUnequipItem('ring');
                        setSelectedItem(null);
                      }}
                      className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 active:scale-95 cursor-pointer"
                    >
                      Desequipar
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        onEquipItem(selectedItem);
                        setSelectedItem(null);
                      }}
                      className="flex-1 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 text-xs font-bold shadow active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Equipar
                    </button>
                  )}
                </>
              )}

              {/* If it's a consumable */}
              {(selectedItem.type === 'potion' || selectedItem.type === 'scroll') && (
                <button
                  type="button"
                  onClick={() => {
                    onUseItem(selectedItem);
                    setSelectedItem(null);
                  }}
                  className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" /> {selectedItem.type === 'potion' ? 'Beber' : 'Leer'}
                </button>
              )}

              {/* Drop item */}
              <button
                type="button"
                onClick={() => {
                  onDropItem(selectedItem);
                  setSelectedItem(null);
                }}
                className="p-2 rounded-xl bg-slate-800 hover:bg-red-950/60 text-slate-400 hover:text-red-300 border border-slate-700 active:scale-95 cursor-pointer"
                title="Tirar al suelo"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
