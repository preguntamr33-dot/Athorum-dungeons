import React, { useState } from 'react';
import { PlayerClassId } from '../types';
import { PLAYER_CLASSES } from '../utils/classes';
import { CharacterAvatar } from './CharacterAvatar';
import { Compass, Swords } from 'lucide-react';

interface ClassSelectScreenProps {
  onStartGame: (chosenClass: PlayerClassId) => void;
}

export const ClassSelectScreen: React.FC<ClassSelectScreenProps> = ({ onStartGame }) => {
  const [selectedClass, setSelectedClass] = useState<PlayerClassId>('warrior');
  const classList = Object.values(PLAYER_CLASSES);
  const activeClass = PLAYER_CLASSES[selectedClass];

  return (
    <div className="w-full h-full flex flex-col items-center justify-between p-4 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100 select-none overflow-y-auto">
      {/* Title & Lore Header */}
      <div className="text-center mt-2 mb-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono mb-2">
          <Swords className="w-3.5 h-3.5 text-amber-400" /> Roguelike Clásico para Android
        </div>
        <h1 className="text-2xl sm:text-3xl font-cinzel font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500">
          MAZMORRA INFINITA
        </h1>
        <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto font-sans leading-relaxed">
          Niebla de guerra, laberintos procedurales sin fin y combate táctico por turnos.
        </p>
      </div>

      {/* Class Selection Carousel / Tabs */}
      <div className="w-full max-w-md space-y-4 my-auto">
        <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block text-center">
          Elige tu Clase de Héroe
        </span>

        <div className="grid grid-cols-3 gap-2">
          {classList.map((cls) => {
            const isSelected = selectedClass === cls.id;
            return (
              <button
                key={cls.id}
                type="button"
                onClick={() => setSelectedClass(cls.id)}
                className={`p-3 rounded-2xl border flex flex-col items-center justify-center transition-all ${
                  isSelected
                    ? 'bg-amber-500/20 border-amber-400 shadow-lg shadow-amber-500/10 scale-105'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 opacity-70 hover:opacity-100'
                }`}
              >
                <div className="mb-1.5 flex items-center justify-center">
                  <CharacterAvatar classId={cls.id} size={44} animated={isSelected} />
                </div>
                <span className={`text-xs font-bold ${isSelected ? 'text-amber-300' : 'text-slate-300'}`}>
                  {cls.name}
                </span>
                <span className="text-[10px] text-slate-400">{cls.title}</span>
              </button>
            );
          })}
        </div>

        {/* Selected Class Deep Info Card */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2.5">
              <CharacterAvatar classId={activeClass.id} size={36} animated={true} />
              <div>
                <span>{activeClass.name}</span>
                <span className="text-slate-400 font-normal ml-1.5 text-xs">· {activeClass.title}</span>
              </div>
            </h3>
            <p className="text-xs text-slate-400 mt-1">{activeClass.description}</p>
          </div>

          {/* Stats Badges */}
          <div className="grid grid-cols-3 gap-2 text-xs font-mono">
            <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <span className="text-[10px] text-red-400 block">Salud</span>
              <span className="font-bold text-slate-200">{activeClass.baseHp} HP</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <span className="text-[10px] text-blue-400 block">Maná</span>
              <span className="font-bold text-slate-200">{activeClass.baseMp} MP</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <span className="text-[10px] text-amber-400 block">Ataque</span>
              <span className="font-bold text-slate-200">{activeClass.baseAtk}</span>
            </div>
          </div>

          {/* Skill Preview */}
          <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-800/40">
            <span className="text-[10px] font-mono text-purple-400 uppercase font-bold block">
              Habilidad Activa
            </span>
            <div className="font-bold text-purple-200 text-xs mt-0.5">
              {activeClass.skillName}
            </div>
            <p className="text-[11px] text-purple-300/80 mt-0.5 leading-tight">
              {activeClass.skillDescription}
            </p>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="w-full max-w-md mt-4 mb-2">
        <button
          id="btn-start-expedition"
          type="button"
          onClick={() => onStartGame(selectedClass)}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-slate-950 font-cinzel font-bold text-base shadow-xl shadow-amber-950/50 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>DESCENDER A LA MAZMORRA</span>
          <Compass className="w-5 h-5 text-slate-950" />
        </button>
      </div>
    </div>
  );
};
