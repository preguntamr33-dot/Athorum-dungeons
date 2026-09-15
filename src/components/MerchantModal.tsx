import React from 'react';
import { Item } from '../types';
import { X, Coins, Store } from 'lucide-react';
import { ItemIcon } from './ItemIcon';

interface MerchantModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerGold: number;
  stock: Item[];
  onBuyItem: (item: Item) => void;
}

export const MerchantModal: React.FC<MerchantModalProps> = ({
  isOpen,
  onClose,
  playerGold,
  stock,
  onBuyItem,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl flex flex-col max-h-[85vh] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/95">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Store className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-cinzel font-bold text-slate-100">Mercader de la Mazmorra</h2>
              <p className="text-[11px] text-amber-400 font-mono">Bazar de las Profundidades</p>
            </div>
          </div>
          <button
            id="btn-close-merchant"
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Player gold bar */}
        <div className="px-4 py-2 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400">Tu Oro disponible:</span>
          <div className="flex items-center gap-1 text-amber-400 font-bold">
            <Coins className="w-4 h-4" />
            <span>{playerGold}</span>
          </div>
        </div>

        {/* Goods List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {stock.length === 0 ? (
            <div className="text-slate-500 text-center py-8 text-xs font-mono">
              ¡Mercancía agotada! El mercader agradece tu patrocinio.
            </div>
          ) : (
            stock.map((item) => {
              const canAfford = playerGold >= item.value;
              return (
                <div
                  key={item.id}
                  className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <ItemIcon item={item} size="md" showRarityGlow={true} />
                    <div>
                      <div className="text-xs font-semibold text-slate-200">{item.name}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{item.description}</div>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={!canAfford}
                    onClick={() => onBuyItem(item)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
                      canAfford
                        ? 'bg-amber-600 hover:bg-amber-500 text-slate-950 active:scale-95 shadow'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <span>{item.value}</span>
                    <Coins className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
