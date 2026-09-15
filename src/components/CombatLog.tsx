import React from 'react';
import { CombatLogMessage } from '../types';
import { X, ShieldAlert, Sparkles, Trophy } from 'lucide-react';

interface CombatLogProps {
  logs: CombatLogMessage[];
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
}

export const CombatLog: React.FC<CombatLogProps> = ({ logs, isOpen, onClose, onOpen }) => {
  const latestMessage = logs[logs.length - 1];

  const getColorClass = (type: CombatLogMessage['type']) => {
    switch (type) {
      case 'combat':
        return 'text-slate-200';
      case 'crit':
        return 'text-amber-400 font-bold';
      case 'danger':
        return 'text-red-400 font-semibold';
      case 'loot':
        return 'text-emerald-400';
      case 'level':
        return 'text-purple-300 font-bold';
      case 'shrine':
        return 'text-cyan-300 font-semibold';
      default:
        return 'text-slate-300';
    }
  };

  return (
    <>
      {/* Ticker Bar (Always visible below canvas) */}
      <div
        id="combat-log-ticker"
        onClick={onOpen}
        className="w-full bg-slate-950/90 border-t border-b border-slate-800/80 px-3 py-1.5 flex items-center justify-between cursor-pointer hover:bg-slate-900 transition-colors"
      >
        <div className="flex-1 truncate text-xs font-mono">
          {latestMessage ? (
            <span className={getColorClass(latestMessage.type)}>
              {latestMessage.text}
            </span>
          ) : (
            <span className="text-slate-500 italic">Explora la mazmorra...</span>
          )}
        </div>
        <span className="text-[10px] text-slate-500 font-mono ml-2">Historial ▲</span>
      </div>

      {/* Full Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl flex flex-col max-h-[80vh] shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/90">
              <h2 className="text-sm font-cinzel font-bold text-amber-400 flex items-center gap-2">
                📜 Bitácora de la Mazmorra
              </h2>
              <button
                id="btn-close-log"
                type="button"
                onClick={onClose}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 font-mono text-xs">
              {logs.length === 0 ? (
                <div className="text-slate-500 text-center py-6">Sin registros aún</div>
              ) : (
                logs
                  .slice()
                  .reverse()
                  .map((log) => (
                    <div
                      key={log.id}
                      className={`p-2 rounded-lg bg-slate-950/60 border border-slate-800/60 leading-relaxed ${getColorClass(
                        log.type
                      )}`}
                    >
                      {log.text}
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
