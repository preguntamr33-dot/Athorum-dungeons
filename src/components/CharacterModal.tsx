import React from 'react';
import { PlayerClassConfig, PlayerStats, Equipment } from '../types';
import { X, Shield, Swords, Eye, Zap, Heart, Droplet, Skull, Coins, Sparkles } from 'lucide-react';
import { CharacterAvatar } from './CharacterAvatar';
import { WeaponPreviewCanvas } from './WeaponPreviewCanvas';

interface CharacterModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: PlayerStats;
  classConfig: PlayerClassConfig;
  equipment: Equipment;
}

export const CharacterModal: React.FC<CharacterModalProps> = ({
  isOpen,
  onClose,
  stats,
  classConfig,
  equipment,
}) => {
  if (!isOpen) return null;

  const totalAtk = stats.atk + (equipment.weapon?.atkBonus || 0) + (equipment.ring?.atkBonus || 0);
  const totalDef = stats.def + (equipment.armor?.defBonus || 0) + (equipment.ring?.defBonus || 0);
  const totalCrit = stats.critChance + (equipment.weapon?.critBonus || 0) + (equipment.ring?.critBonus || 0);
  const totalVision = stats.visionRadius + (equipment.armor?.visionBonus || 0) + (equipment.ring?.visionBonus || 0);

  const weapon = equipment.weapon;
  const parts = weapon?.weaponParts;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl flex flex-col max-h-[85vh] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/95">
          <div className="flex items-center gap-2.5">
            <CharacterAvatar classId={classConfig.id} equippedWeapon={equipment.weapon} size={40} animated={true} />
            <div>
              <h2 className="text-sm font-cinzel font-bold text-slate-100">{classConfig.name}</h2>
              <p className="text-[11px] text-amber-400 font-mono">{classConfig.title}</p>
            </div>
          </div>
          <button
            id="btn-close-character"
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-xs">
          {/* Main Progress block */}
          <div className="grid grid-cols-2 gap-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <div>
              <span className="text-slate-400 text-[10px] block">Nivel</span>
              <span className="text-base font-bold text-indigo-300 font-mono">{stats.level}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block">Profundidad actual</span>
              <span className="text-base font-bold text-amber-400 font-mono">Piso {stats.depth}</span>
            </div>
          </div>

          {/* Combat Attributes */}
          <div className="space-y-2">
            <h3 className="font-semibold text-slate-300 uppercase tracking-wider text-[11px] font-mono">
              Atributos de Combate
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center gap-2.5">
                <Heart className="w-4 h-4 text-red-400" />
                <div>
                  <div className="text-[10px] text-slate-400">Salud Máx.</div>
                  <div className="text-sm font-bold text-slate-100">{stats.maxHp} HP</div>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center gap-2.5">
                <Droplet className="w-4 h-4 text-cyan-400" />
                <div>
                  <div className="text-[10px] text-slate-400">Maná Máx.</div>
                  <div className="text-sm font-bold text-slate-100">{stats.maxMp} MP</div>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center gap-2.5">
                <Swords className="w-4 h-4 text-amber-400" />
                <div>
                  <div className="text-[10px] text-slate-400">Ataque Total</div>
                  <div className="text-sm font-bold text-amber-300">{totalAtk}</div>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center gap-2.5">
                <Shield className="w-4 h-4 text-sky-400" />
                <div>
                  <div className="text-[10px] text-slate-400">Defensa Total</div>
                  <div className="text-sm font-bold text-sky-300">{totalDef}</div>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center gap-2.5">
                <Zap className="w-4 h-4 text-yellow-400" />
                <div>
                  <div className="text-[10px] text-slate-400">Golpe Crítico</div>
                  <div className="text-sm font-bold text-yellow-300">{totalCrit}%</div>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center gap-2.5">
                <Eye className="w-4 h-4 text-emerald-400" />
                <div>
                  <div className="text-[10px] text-slate-400">Radio de Visión</div>
                  <div className="text-sm font-bold text-emerald-300">{totalVision} casillas</div>
                </div>
              </div>
            </div>
          </div>

          {/* Equipped Weapon Detailed Showcase (Procedural Parts) */}
          {weapon && (
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1.5">
                  <Swords className="w-3.5 h-3.5 text-amber-400" />
                  Arma Forjada Equipada
                </span>
                {parts?.element && parts.element !== 'none' && (
                  <span
                    className="text-[9px] uppercase px-2 py-0.5 rounded-full font-bold border"
                    style={{
                      borderColor: parts.auraColor,
                      color: parts.auraColor,
                      backgroundColor: `${parts.auraColor}15`,
                    }}
                  >
                    ✦ {parts.element.toUpperCase()}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                {parts ? (
                  <div className="p-1 rounded-xl bg-slate-900 border border-slate-700/60 shadow-inner flex items-center justify-center">
                    <WeaponPreviewCanvas weaponParts={parts} size={48} animated={true} />
                  </div>
                ) : null}

                <div className="flex-1">
                  <div className="text-xs font-bold text-slate-100">{weapon.name}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{weapon.description}</div>
                  {parts && (
                    <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[9px] text-slate-400 mt-1.5 pt-1.5 border-t border-slate-800/80 font-mono">
                      <span><b className="text-slate-300">Hoja:</b> {parts.bladeShape}</span>
                      <span><b className="text-slate-300">Guarda:</b> {parts.guardShape}</span>
                      <span><b className="text-slate-300">Mango:</b> {parts.gripMaterial}</span>
                      <span><b className="text-slate-300">Pomo:</b> {parts.pommelShape}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Special Skill card */}
          <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-800/40">
            <span className="text-[10px] uppercase font-bold text-purple-400 block mb-1">
              Habilidad Única de Clase
            </span>
            <div className="font-bold text-purple-200 text-sm">{classConfig.skillName}</div>
            <p className="text-[11px] text-purple-300/80 mt-1 font-sans">{classConfig.skillDescription}</p>
            <div className="flex gap-3 text-[10px] text-purple-400 mt-2 font-mono">
              <span>Costo: {classConfig.skillCostMp} MP</span>
              <span>Recarga: {classConfig.skillCooldown} turnos</span>
            </div>
          </div>

          {/* Lifetime stats of current run */}
          <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 flex items-center justify-around">
            <div className="flex items-center gap-2">
              <Skull className="w-4 h-4 text-red-400" />
              <div>
                <div className="text-[10px] text-slate-400">Monstruos</div>
                <div className="font-bold text-slate-200">{stats.kills}</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Coins className="w-4 h-4 text-amber-400" />
              <div>
                <div className="text-[10px] text-slate-400">Oro Recolectado</div>
                <div className="font-bold text-amber-300">{stats.gold}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
