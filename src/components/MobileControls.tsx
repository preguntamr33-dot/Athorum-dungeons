import React from 'react';
import { PlayerClassConfig, PlayerStats } from '../types';
import { 
  Compass, 
  Sparkles, 
  FlaskConical, 
  ShieldAlert, 
  Swords, 
  Hourglass, 
  ChevronDown 
} from 'lucide-react';

interface MobileControlsProps {
  onMove: (dx: number, dy: number) => void;
  onWaitTurn: () => void;
  onAutoExplore: () => void;
  onUseSkill: () => void;
  onQuickPotion: () => void;
  onStairsDown: () => void;
  isOnStairs: boolean;
  classConfig: PlayerClassConfig;
  playerStats: PlayerStats;
  potionCount: number;
}

export const MobileControls: React.FC<MobileControlsProps> = ({
  onMove,
  onWaitTurn,
  onAutoExplore,
  onUseSkill,
  onQuickPotion,
  onStairsDown,
  isOnStairs,
  classConfig,
  playerStats,
  potionCount,
}) => {
  const canCastSkill =
    playerStats.skillCooldownLeft <= 0 && playerStats.mp >= classConfig.skillCostMp;

  return (
    <div id="mobile-controls-panel" className="w-full bg-slate-900/95 border-t border-slate-800/80 px-3 py-2 select-none touch-none">
      <div className="max-w-md mx-auto flex items-center justify-between gap-3">
        {/* Virtual D-Pad (Left Side) */}
        <div className="relative w-36 h-36 flex-shrink-0 flex items-center justify-center">
          {/* North */}
          <button
            id="dpad-up"
            type="button"
            aria-label="Mover Arriba"
            onClick={() => onMove(0, -1)}
            className="absolute top-0 w-11 h-11 bg-slate-800 active:bg-amber-600 hover:bg-slate-700 text-slate-100 rounded-lg flex items-center justify-center border border-slate-700 active:scale-95 shadow-md transition-transform"
          >
            ▲
          </button>

          {/* West */}
          <button
            id="dpad-left"
            type="button"
            aria-label="Mover Izquierda"
            onClick={() => onMove(-1, 0)}
            className="absolute left-0 w-11 h-11 bg-slate-800 active:bg-amber-600 hover:bg-slate-700 text-slate-100 rounded-lg flex items-center justify-center border border-slate-700 active:scale-95 shadow-md transition-transform"
          >
            ◀
          </button>

          {/* Center (Wait / Rest 1 turn) */}
          <button
            id="dpad-wait"
            type="button"
            title="Esperar turno (⏳)"
            aria-label="Esperar turno"
            onClick={onWaitTurn}
            className="w-10 h-10 bg-slate-800/90 active:bg-slate-600 text-amber-400 rounded-full flex flex-col items-center justify-center border border-slate-700 active:scale-90 text-[10px] font-bold shadow"
          >
            <Hourglass className="w-4 h-4" />
          </button>

          {/* East */}
          <button
            id="dpad-right"
            type="button"
            aria-label="Mover Derecha"
            onClick={() => onMove(1, 0)}
            className="absolute right-0 w-11 h-11 bg-slate-800 active:bg-amber-600 hover:bg-slate-700 text-slate-100 rounded-lg flex items-center justify-center border border-slate-700 active:scale-95 shadow-md transition-transform"
          >
            ▶
          </button>

          {/* South */}
          <button
            id="dpad-down"
            type="button"
            aria-label="Mover Abajo"
            onClick={() => onMove(0, 1)}
            className="absolute bottom-0 w-11 h-11 bg-slate-800 active:bg-amber-600 hover:bg-slate-700 text-slate-100 rounded-lg flex items-center justify-center border border-slate-700 active:scale-95 shadow-md transition-transform"
          >
            ▼
          </button>
        </div>

        {/* Action Action Buttons (Right Side) */}
        <div className="flex-1 grid grid-cols-2 gap-2">
          {/* Special Class Skill */}
          <button
            id="action-skill"
            type="button"
            onClick={onUseSkill}
            disabled={!canCastSkill}
            className={`relative flex flex-col items-center justify-center py-2 px-1 rounded-xl border transition-all text-xs font-semibold ${
              canCastSkill
                ? 'bg-gradient-to-b from-purple-700 to-indigo-900 border-purple-400/50 text-white shadow-lg shadow-purple-950/40 active:scale-95'
                : 'bg-slate-800/50 border-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <Sparkles className="w-5 h-5 text-purple-300 mb-0.5" />
            <span className="truncate max-w-[85px] leading-tight text-[11px]">{classConfig.skillName}</span>
            <div className="flex items-center gap-1 text-[9px] text-purple-200/90 mt-0.5">
              <span>{classConfig.skillCostMp} MP</span>
              {playerStats.skillCooldownLeft > 0 && (
                <span className="bg-red-950 px-1 rounded text-red-300 font-mono">
                  {playerStats.skillCooldownLeft}t
                </span>
              )}
            </div>
          </button>

          {/* Quick Potion */}
          <button
            id="action-potion"
            type="button"
            onClick={onQuickPotion}
            disabled={potionCount <= 0}
            className={`relative flex flex-col items-center justify-center py-2 px-1 rounded-xl border transition-all text-xs font-semibold ${
              potionCount > 0
                ? 'bg-gradient-to-b from-emerald-700 to-emerald-950 border-emerald-500/50 text-emerald-100 shadow-md active:scale-95'
                : 'bg-slate-800/40 border-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <FlaskConical className="w-5 h-5 text-emerald-300 mb-0.5" />
            <span className="leading-tight text-[11px]">Poción</span>
            <span className="text-[10px] text-emerald-300 font-mono mt-0.5">
              x{potionCount}
            </span>
          </button>

          {/* Stairs Down / Interact (contextual) */}
          {isOnStairs ? (
            <button
              id="action-stairs"
              type="button"
              onClick={onStairsDown}
              className="col-span-2 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-600 border border-amber-300 text-slate-950 font-bold text-xs shadow-lg animate-pulse active:scale-95"
            >
              <ChevronDown className="w-4 h-4" />
              <span>DESCENDER AL PISO {playerStats.depth + 1}</span>
            </button>
          ) : (
            <>
              {/* Auto Explore */}
              <button
                id="action-auto-explore"
                type="button"
                onClick={onAutoExplore}
                className="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 active:scale-95 text-xs"
              >
                <Compass className="w-5 h-5 text-sky-400 mb-0.5" />
                <span className="text-[11px] leading-tight">Explorar</span>
                <span className="text-[9px] text-slate-400">Auto-paso</span>
              </button>

              {/* Wait / Rest */}
              <button
                id="action-wait"
                type="button"
                onClick={onWaitTurn}
                className="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 active:scale-95 text-xs"
              >
                <Hourglass className="w-5 h-5 text-amber-400 mb-0.5" />
                <span className="text-[11px] leading-tight">Pasar</span>
                <span className="text-[9px] text-slate-400">1 Turno</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
