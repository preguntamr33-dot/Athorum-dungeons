import React from 'react';
import { RunHistoryRecord } from '../types';
import { Skull, Trophy, RotateCcw } from 'lucide-react';

interface GameOverModalProps {
  isOpen: boolean;
  depthReached: number;
  levelReached: number;
  goldCollected: number;
  monstersSlain: number;
  deathCause: string;
  playerClass: string;
  highScores: RunHistoryRecord[];
  onRestart: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isOpen,
  depthReached,
  levelReached,
  goldCollected,
  monstersSlain,
  deathCause,
  highScores,
  onRestart,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-gradient-to-b from-slate-900 to-rose-950/80 border border-rose-900/60 rounded-2xl p-5 shadow-2xl flex flex-col items-center text-center max-h-[90vh] overflow-y-auto">
        <div className="w-16 h-16 rounded-full bg-rose-950/80 border-2 border-rose-600/70 flex items-center justify-center mb-3">
          <Skull className="w-8 h-8 text-rose-400" />
        </div>

        <h2 className="text-2xl font-cinzel font-bold text-rose-400 tracking-wider">HAS SUCUMBIDO</h2>
        <p className="text-xs text-rose-300/80 font-mono mt-1 mb-4 italic">
          "{deathCause}"
        </p>

        {/* Run summary cards */}
        <div className="w-full grid grid-cols-2 gap-2 mb-4 font-mono text-xs">
          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className="text-slate-400 text-[10px] block">Profundidad</span>
            <span className="text-base font-bold text-amber-400">Piso {depthReached}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className="text-slate-400 text-[10px] block">Nivel de Héroe</span>
            <span className="text-base font-bold text-indigo-300">Nivel {levelReached}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className="text-slate-400 text-[10px] block">Monstruos Eliminados</span>
            <span className="text-base font-bold text-red-400">{monstersSlain}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className="text-slate-400 text-[10px] block">Oro Recolectado</span>
            <span className="text-base font-bold text-amber-300">{goldCollected} 🪙</span>
          </div>
        </div>

        {/* Hall of Fame / High Scores */}
        <div className="w-full mb-5 bg-slate-950/60 rounded-xl p-3 border border-slate-800 text-left">
          <div className="flex items-center gap-1.5 text-xs font-cinzel font-bold text-amber-400 mb-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>Salón de Récords Locales</span>
          </div>
          <div className="space-y-1.5 max-h-32 overflow-y-auto font-mono text-[11px]">
            {highScores.length === 0 ? (
              <span className="text-slate-500 text-xs">Primer intento registrado.</span>
            ) : (
              highScores.slice(0, 5).map((rec, i) => (
                <div
                  key={rec.id}
                  className="flex items-center justify-between py-1 border-b border-slate-800/60 last:border-0 text-slate-300"
                >
                  <span className="flex items-center gap-1.5">
                    <span className="text-amber-500 font-bold">#{i + 1}</span>
                    <span>{rec.playerClass}</span>
                  </span>
                  <div className="flex items-center gap-3 text-slate-400">
                    <span className="text-amber-400 font-semibold">Piso {rec.depthReached}</span>
                    <span>{rec.goldCollected} 🪙</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Restart Button */}
        <button
          id="btn-restart-game"
          type="button"
          onClick={onRestart}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-cinzel font-bold text-sm shadow-xl active:scale-95 flex items-center justify-center gap-2 transition-transform cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>INICIAR NUEVA EXPEDICIÓN</span>
        </button>
      </div>
    </div>
  );
};
