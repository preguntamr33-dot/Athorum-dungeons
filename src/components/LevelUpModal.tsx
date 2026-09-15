import React from 'react';
import { Sparkles, Heart, Swords, Shield, Zap, Eye, Droplet } from 'lucide-react';

export interface LevelUpPerk {
  id: string;
  title: string;
  description: string;
  icon: string;
  apply: () => void;
}

interface LevelUpModalProps {
  isOpen: boolean;
  level: number;
  perks: LevelUpPerk[];
  onSelectPerk: (perk: LevelUpPerk) => void;
}

export const LevelUpModal: React.FC<LevelUpModalProps> = ({
  isOpen,
  level,
  perks,
  onSelectPerk,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-gradient-to-b from-slate-900 to-indigo-950 border-2 border-amber-500/80 rounded-2xl p-5 shadow-2xl flex flex-col items-center text-center">
        <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-400 flex items-center justify-center mb-3">
          <Sparkles className="w-6 h-6 text-amber-400 animate-bounce" />
        </div>

        <h2 className="text-xl font-cinzel font-bold text-amber-300">¡NIVEL {level} ALCANZADO!</h2>
        <p className="text-xs text-slate-300 mt-1 mb-5">
          Elige una bendición para fortalecer a tu héroe en las profundidades:
        </p>

        <div className="w-full space-y-3">
          {perks.map((perk) => (
            <button
              key={perk.id}
              type="button"
              onClick={() => onSelectPerk(perk)}
              className="w-full p-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 hover:border-amber-400 text-left transition-all active:scale-98 flex items-center gap-3 group"
            >
              <div className="text-3xl p-2 rounded-lg bg-slate-950/70 border border-slate-800 group-hover:scale-110 transition-transform">
                {perk.icon}
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-slate-100 group-hover:text-amber-300 transition-colors">
                  {perk.title}
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">{perk.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
