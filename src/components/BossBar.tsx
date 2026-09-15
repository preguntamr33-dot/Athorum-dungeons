import React from 'react';
import { Monster } from '../types';
import { ProceduralBossData } from '../utils/proceduralBosses';
import { Flame, Skull, ShieldAlert, Sparkles } from 'lucide-react';

interface BossBarProps {
  boss: Monster;
}

export const BossBar: React.FC<BossBarProps> = ({ boss }) => {
  const bossData = boss.bossData as ProceduralBossData | undefined;
  const hpPercent = Math.max(0, Math.min(100, (boss.hp / boss.maxHp) * 100));
  const isEnraged = bossData ? bossData.phase === 2 || bossData.hasEnraged : boss.hp <= boss.maxHp * 0.5;

  const elementColor = bossData?.primaryColor || '#dc2626';
  const accentColor = bossData?.accentColor || '#f97316';

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-2 pointer-events-none transition-all duration-300">
      <div className="bg-slate-950/90 backdrop-blur-md border border-slate-700/80 rounded-xl p-3 shadow-2xl relative overflow-hidden">
        {/* Ambient elemental glow */}
        <div 
          className="absolute -top-10 -left-10 w-36 h-36 rounded-full blur-2xl opacity-20 pointer-events-none"
          style={{ backgroundColor: elementColor }}
        />
        <div 
          className="absolute -bottom-10 -right-10 w-36 h-36 rounded-full blur-2xl opacity-20 pointer-events-none"
          style={{ backgroundColor: accentColor }}
        />

        {/* Boss Header */}
        <div className="flex items-center justify-between gap-3 mb-1.5 relative z-10">
          <div className="flex items-center gap-2 min-w-0">
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center border shadow-inner shrink-0"
              style={{ 
                backgroundColor: `${elementColor}33`, 
                borderColor: `${elementColor}88` 
              }}
            >
              {isEnraged ? (
                <Flame className="w-5 h-5 text-amber-400 animate-pulse" />
              ) : (
                <Skull className="w-4 h-4 text-red-400" />
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-serif font-black tracking-wide text-sm md:text-base text-slate-100 uppercase truncate drop-shadow-sm">
                  {boss.name}
                </span>
                {bossData?.archetype && (
                  <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                    {bossData.archetype}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 truncate">
                {bossData?.epithet || 'Guardián de la Mazmorra'}
              </p>
            </div>
          </div>

          {/* Phase Badge */}
          <div className="shrink-0 flex items-center gap-1">
            {isEnraged ? (
              <span className="flex items-center gap-1 text-[11px] font-bold text-red-400 bg-red-950/80 border border-red-800 px-2 py-0.5 rounded-full animate-pulse shadow-sm">
                <ShieldAlert className="w-3 h-3" /> FASE 2: ¡FURIA!
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[11px] font-medium text-amber-300 bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 rounded-full">
                <Sparkles className="w-3 h-3 text-amber-400" /> FASE 1
              </span>
            )}
          </div>
        </div>

        {/* Dynamic Boss HP Bar */}
        <div className="relative w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800 p-0.5 shadow-inner">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              isEnraged 
                ? 'bg-gradient-to-r from-red-600 via-orange-500 to-amber-400' 
                : 'bg-gradient-to-r from-red-700 via-rose-600 to-red-500'
            }`}
            style={{ width: `${hpPercent}%` }}
          />
        </div>

        {/* Stats below bar */}
        <div className="flex justify-between text-[11px] font-mono text-slate-400 mt-1">
          <span>ATK: {boss.atk} | DEF: {boss.def}</span>
          <span className="font-semibold text-slate-300">
            {boss.hp} / {boss.maxHp} HP ({Math.round(hpPercent)}%)
          </span>
        </div>
      </div>
    </div>
  );
};
