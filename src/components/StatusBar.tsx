import React from 'react';
import { FloorAffix, PlayerStats } from '../types';
import { Heart, Droplet, Coins, Backpack, User, ScrollText, Volume2, VolumeX, Sparkles } from 'lucide-react';

interface StatusBarProps {
  stats: PlayerStats;
  themeName: string;
  floorAffix?: FloorAffix;
  inventoryCount: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenInventory: () => void;
  onOpenCharacter: () => void;
  onOpenCombatLog: () => void;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  stats,
  themeName,
  floorAffix,
  inventoryCount,
  soundEnabled,
  onToggleSound,
  onOpenInventory,
  onOpenCharacter,
  onOpenCombatLog,
}) => {
  const hpPct = Math.max(0, Math.min(100, (stats.hp / stats.maxHp) * 100));
  const mpPct = Math.max(0, Math.min(100, (stats.mp / stats.maxMp) * 100));
  const expPct = Math.max(0, Math.min(100, (stats.exp / stats.nextLevelExp) * 100));

  return (
    <header id="game-status-bar" className="w-full bg-slate-900 border-b border-slate-800 px-3 py-2 select-none">
      <div className="max-w-md mx-auto flex flex-col gap-1.5">
        {/* Top line: Floor, Biome, Affix & Navigation icons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold font-mono text-xs border border-amber-500/30 shrink-0">
              PISO {stats.depth}
            </span>
            <span className="text-[11px] text-slate-300 font-medium truncate max-w-[130px]" title={themeName}>
              {themeName}
            </span>
            {floorAffix && floorAffix.id !== 'standard' && (
              <span 
                className="hidden sm:inline-flex items-center gap-0.5 text-[9px] font-mono px-1.5 py-0.5 rounded border truncate max-w-[110px]"
                style={{ 
                  color: floorAffix.badgeColor, 
                  borderColor: `${floorAffix.badgeColor}66`,
                  backgroundColor: `${floorAffix.badgeColor}18` 
                }}
                title={floorAffix.description}
              >
                <Sparkles className="w-2.5 h-2.5 shrink-0" />
                {floorAffix.name}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-amber-400 font-mono text-xs font-semibold">
              <Coins className="w-3.5 h-3.5" />
              <span>{stats.gold}</span>
            </div>

            {/* Quick Modals Toggles */}
            <button
              id="hud-btn-inventory"
              type="button"
              onClick={onOpenInventory}
              aria-label="Abrir Mochila"
              className="relative p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 active:scale-95"
            >
              <Backpack className="w-4 h-4 text-emerald-400" />
              {inventoryCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 text-[9px] text-white font-bold rounded-full flex items-center justify-center">
                  {inventoryCount}
                </span>
              )}
            </button>

            <button
              id="hud-btn-character"
              type="button"
              onClick={onOpenCharacter}
              aria-label="Abrir Perfil"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 active:scale-95"
            >
              <User className="w-4 h-4 text-sky-400" />
            </button>

            <button
              id="hud-btn-log"
              type="button"
              onClick={onOpenCombatLog}
              aria-label="Ver Registro"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 active:scale-95"
            >
              <ScrollText className="w-4 h-4 text-amber-300" />
            </button>

            <button
              id="hud-btn-sound"
              type="button"
              onClick={onToggleSound}
              aria-label={soundEnabled ? 'Silenciar sonido' : 'Activar sonido'}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 active:scale-95"
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-indigo-400" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-500" />
              )}
            </button>
          </div>
        </div>

        {/* Second line: Bars (HP, MP, EXP) */}
        <div className="grid grid-cols-2 gap-2">
          {/* Health Bar */}
          <div className="relative h-4 bg-slate-950 rounded-full overflow-hidden border border-red-950/80">
            <div
              className="h-full bg-gradient-to-r from-red-600 to-rose-500 transition-all duration-200"
              style={{ width: `${hpPct}%` }}
            />
            <div className="absolute inset-0 flex items-center justify-between px-2 text-[9px] font-mono font-bold text-white drop-shadow">
              <span className="flex items-center gap-0.5">
                <Heart className="w-2.5 h-2.5 fill-red-400" /> HP
              </span>
              <span>
                {stats.hp} / {stats.maxHp}
              </span>
            </div>
          </div>

          {/* Mana Bar */}
          <div className="relative h-4 bg-slate-950 rounded-full overflow-hidden border border-blue-950/80">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 transition-all duration-200"
              style={{ width: `${mpPct}%` }}
            />
            <div className="absolute inset-0 flex items-center justify-between px-2 text-[9px] font-mono font-bold text-white drop-shadow">
              <span className="flex items-center gap-0.5">
                <Droplet className="w-2.5 h-2.5 fill-cyan-400" /> MP
              </span>
              <span>
                {stats.mp} / {stats.maxMp}
              </span>
            </div>
          </div>
        </div>

        {/* Third line: Mini EXP bar with Level tag */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-indigo-300 font-mono">
            NV {stats.level}
          </span>
          <div className="flex-1 h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
              style={{ width: `${expPct}%` }}
            />
          </div>
          <span className="text-[9px] font-mono text-slate-400">
            {stats.exp}/{stats.nextLevelExp} XP
          </span>
        </div>
      </div>
    </header>
  );
};
