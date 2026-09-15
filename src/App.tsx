import React, { useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import { 
  CombatLogMessage, 
  DungeonMap, 
  Equipment, 
  FloatingText, 
  Item, 
  Monster, 
  PlayerClassId, 
  PlayerStats, 
  Position, 
  RunHistoryRecord, 
  TileType, 
  VisibilityState 
} from './types';
import { PLAYER_CLASSES } from './utils/classes';
import { computeFOV, isTileVisible } from './utils/fov';
import { generateDungeonFloor, generateLootItem } from './utils/dungeonGenerator';
import { generateProceduralWeapon } from './utils/proceduralWeapons';
import { soundManager } from './utils/sound';
import { DungeonCanvas } from './components/DungeonCanvas';
import { MobileControls } from './components/MobileControls';
import { StatusBar } from './components/StatusBar';
import { CombatLog } from './components/CombatLog';
import { InventoryModal } from './components/InventoryModal';
import { CharacterModal } from './components/CharacterModal';
import { LevelUpModal, LevelUpPerk } from './components/LevelUpModal';
import { MerchantModal } from './components/MerchantModal';
import { GameOverModal } from './components/GameOverModal';
import { ClassSelectScreen } from './components/ClassSelectScreen';
import { BossBar } from './components/BossBar';
import { Smartphone, Monitor } from 'lucide-react';

const HIGH_SCORES_KEY = 'infinidungeon_high_scores_v1';

export default function App() {
  // Navigation & High-level State
  const [gameStatus, setGameStatus] = useState<'start_screen' | 'playing' | 'game_over'>('start_screen');
  const [selectedClassId, setSelectedClassId] = useState<PlayerClassId>('warrior');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isMobileFrameView, setIsMobileFrameView] = useState<boolean>(false);

  // Player & Dungeon State
  const [playerPos, setPlayerPos] = useState<Position>({ x: 0, y: 0 });
  const [playerStats, setPlayerStats] = useState<PlayerStats>({
    level: 1,
    hp: 100,
    maxHp: 100,
    mp: 20,
    maxMp: 20,
    atk: 14,
    def: 6,
    critChance: 8,
    visionRadius: 6,
    exp: 0,
    nextLevelExp: 40,
    gold: 20,
    depth: 1,
    kills: 0,
    skillCooldownLeft: 0,
  });

  const [equipment, setEquipment] = useState<Equipment>({
    weapon: null,
    armor: null,
    ring: null,
  });

  const [inventory, setInventory] = useState<Item[]>([]);
  const [dungeon, setDungeon] = useState<DungeonMap | null>(null);
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [combatLogs, setCombatLogs] = useState<CombatLogMessage[]>([]);

  // Modals state
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [isCharacterOpen, setIsCharacterOpen] = useState(false);
  const [isCombatLogOpen, setIsCombatLogOpen] = useState(false);
  const [isMerchantOpen, setIsMerchantOpen] = useState(false);
  const [merchantStock, setMerchantStock] = useState<Item[]>([]);
  const [isLevelUpOpen, setIsLevelUpOpen] = useState(false);
  const [levelUpPerks, setLevelUpPerks] = useState<LevelUpPerk[]>([]);

  // Death / End Stats
  const [deathCause, setDeathCause] = useState<string>('');
  const [highScores, setHighScores] = useState<RunHistoryRecord[]>([]);

  // Natural regeneration turn counter
  const turnsCountRef = useRef(0);

  // Load High Scores from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(HIGH_SCORES_KEY);
      if (saved) {
        setHighScores(JSON.parse(saved));
      }
    } catch {}
  }, []);

  // Save High Score
  const saveHighScore = useCallback((depth: number, level: number, gold: number, kills: number, cause: string) => {
    const record: RunHistoryRecord = {
      id: Math.random().toString(36).substring(2, 9),
      date: new Date().toLocaleDateString(),
      playerClass: PLAYER_CLASSES[selectedClassId].name,
      depthReached: depth,
      levelReached: level,
      goldCollected: gold,
      monstersSlain: kills,
      deathCause: cause,
    };

    setHighScores(prev => {
      const updated = [record, ...prev].sort((a, b) => b.depthReached - a.depthReached || b.goldCollected - a.goldCollected);
      try {
        localStorage.setItem(HIGH_SCORES_KEY, JSON.stringify(updated.slice(0, 10)));
      } catch {}
      return updated.slice(0, 10);
    });
  }, [selectedClassId]);

  // Log Message Helper
  const addLog = useCallback((text: string, type: CombatLogMessage['type'] = 'info') => {
    const entry: CombatLogMessage = {
      id: Math.random().toString(36).substring(2, 9),
      text,
      type,
      timestamp: Date.now(),
    };
    setCombatLogs(prev => [...prev.slice(-35), entry]);
  }, []);

  // Floating text helper
  const addFloatingText = useCallback((x: number, y: number, text: string, color: string) => {
    const ft: FloatingText = {
      id: Math.random().toString(36).substring(2, 9),
      x,
      y,
      text,
      color,
      createdAt: Date.now(),
    };
    setFloatingTexts(prev => [...prev, ft]);
  }, []);

  // Cleanup old floating texts
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setFloatingTexts(prev => prev.filter(ft => now - ft.createdAt < 1200));
    }, 400);
    return () => clearInterval(interval);
  }, []);

  // Calculate current effective stats
  const effectiveAtk = playerStats.atk + (equipment.weapon?.atkBonus || 0) + (equipment.ring?.atkBonus || 0);
  const effectiveDef = playerStats.def + (equipment.armor?.defBonus || 0) + (equipment.ring?.defBonus || 0);
  const effectiveCrit = playerStats.critChance + (equipment.weapon?.critBonus || 0) + (equipment.ring?.critBonus || 0);
  const effectiveVision = playerStats.visionRadius + (equipment.armor?.visionBonus || 0) + (equipment.ring?.visionBonus || 0);

  // Initialize a new floor
  const initFloor = useCallback((depth: number, preservedPlayerStats?: PlayerStats) => {
    const { dungeon: newDungeon, playerStartPos } = generateDungeonFloor(depth);

    // Initial FOV computation
    const updatedVis = computeFOV(
      newDungeon.width,
      newDungeon.height,
      newDungeon.tiles,
      newDungeon.visibility,
      playerStartPos.x,
      playerStartPos.y,
      effectiveVision
    );
    newDungeon.visibility = updatedVis;

    setDungeon(newDungeon);
    setPlayerPos(playerStartPos);

    if (preservedPlayerStats) {
      setPlayerStats({
        ...preservedPlayerStats,
        depth,
      });
    }

    addLog(`Has descendido al Piso ${depth}: ${newDungeon.themeName}`, 'shrine');
    if (newDungeon.floorAffix && newDungeon.floorAffix.id !== 'standard') {
      addLog(`Modificador: ${newDungeon.floorAffix.name} (${newDungeon.floorAffix.description})`, 'level');
    }

    const floorBoss = newDungeon.monsters.find(m => m.isBoss || m.bossData);
    if (floorBoss) {
      addLog(`¡ALERTA! Una energía colosal emana de las profundidades: ¡${floorBoss.name} aguarda!`, 'danger');
    }

    soundManager.playStairs();
  }, [effectiveVision, addLog]);

  // Start new expedition game
  const handleStartGame = (chosenClass: PlayerClassId) => {
    setSelectedClassId(chosenClass);
    const cls = PLAYER_CLASSES[chosenClass];

    const initialStats: PlayerStats = {
      level: 1,
      hp: cls.baseHp,
      maxHp: cls.baseHp,
      mp: cls.baseMp,
      maxMp: cls.baseMp,
      atk: cls.baseAtk,
      def: cls.baseDef,
      critChance: cls.baseCrit,
      visionRadius: cls.visionRadius,
      exp: 0,
      nextLevelExp: 40,
      gold: 25,
      depth: 1,
      kills: 0,
      skillCooldownLeft: 0,
    };

    // Starter procedural equipment tailored to class archetype
    const starterArchetype = chosenClass === 'warrior' ? 'sword' : chosenClass === 'mage' ? 'staff' : 'dagger';
    const starterWeapon = generateProceduralWeapon(1, 'common', starterArchetype);

    const starterPotion: Item = {
      id: 'pot_start_1',
      name: 'Poción de Vida (+35)',
      type: 'potion',
      rarity: 'common',
      icon: 'potion',
      iconKey: 'potion_heal',
      description: 'Restaura 35 puntos de salud.',
      healAmount: 35,
      value: 15,
      effect: 'heal',
    };

    setEquipment({ weapon: starterWeapon, armor: null, ring: null });
    setInventory([starterPotion]);
    setCombatLogs([]);
    setFloatingTexts([]);
    setPlayerStats(initialStats);
    setGameStatus('playing');

    initFloor(1, initialStats);
    addLog(`¡Comienza la expedición con el ${cls.name}!`, 'level');
  };

  // Check Level Up
  const checkLevelUp = useCallback((currentStats: PlayerStats) => {
    if (currentStats.exp >= currentStats.nextLevelExp) {
      const nextLevel = currentStats.level + 1;
      const leftOverExp = currentStats.exp - currentStats.nextLevelExp;
      const newNextLevelExp = Math.round(currentStats.nextLevelExp * 1.6);

      soundManager.playLevelUp();
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
      });

      // Generate 3 random perks
      const potentialPerks: LevelUpPerk[] = [
        {
          id: 'hp',
          title: 'Vigor Colosal (+25 Salud)',
          description: 'Aumenta tu salud máxima en +25 HP y te cura 25 HP.',
          icon: '❤️',
          apply: () => {
            setPlayerStats(p => ({
              ...p,
              maxHp: p.maxHp + 25,
              hp: Math.min(p.maxHp + 25, p.hp + 25),
            }));
            addLog('¡Elegiste Vigor Colosal! (+25 HP)', 'level');
          },
        },
        {
          id: 'atk',
          title: 'Furia Implacable (+4 Ataque)',
          description: 'Incrementa permanentemente tu daño de ataque base en +4.',
          icon: '⚔️',
          apply: () => {
            setPlayerStats(p => ({ ...p, atk: p.atk + 4 }));
            addLog('¡Elegiste Furia Implacable! (+4 ATK)', 'level');
          },
        },
        {
          id: 'def',
          title: 'Bastión Impenetrable (+3 Defensa)',
          description: 'Reduce el daño recibido en +3 puntos de defensa permanente.',
          icon: '🛡️',
          apply: () => {
            setPlayerStats(p => ({ ...p, def: p.def + 3 }));
            addLog('¡Elegiste Bastión Impenetrable! (+3 DEF)', 'level');
          },
        },
        {
          id: 'crit',
          title: 'Ojo Certero (+7% Crítico)',
          description: 'Aumenta la probabilidad de asestar golpes críticos devastadores.',
          icon: '⚡',
          apply: () => {
            setPlayerStats(p => ({ ...p, critChance: p.critChance + 7 }));
            addLog('¡Elegiste Ojo Certero! (+7% Crítico)', 'level');
          },
        },
        {
          id: 'vision',
          title: 'Ojo de Águila (+1 Visión)',
          description: 'Despeja más niebla de guerra aumentando tu rango de visión.',
          icon: '👁️',
          apply: () => {
            setPlayerStats(p => ({ ...p, visionRadius: p.visionRadius + 1 }));
            addLog('¡Elegiste Ojo de Águila! (+1 Visión)', 'level');
          },
        },
        {
          id: 'mp',
          title: 'Resonancia Arcana (+20 Maná)',
          description: 'Aumenta tu maná máximo en +20 MP para lanzar más habilidades.',
          icon: '🔮',
          apply: () => {
            setPlayerStats(p => ({
              ...p,
              maxMp: p.maxMp + 20,
              mp: Math.min(p.maxMp + 20, p.mp + 20),
            }));
            addLog('¡Elegiste Resonancia Arcana! (+20 MP)', 'level');
          },
        },
      ];

      // Shuffle and pick 3
      const shuffled = potentialPerks.sort(() => 0.5 - Math.random()).slice(0, 3);
      setLevelUpPerks(shuffled);
      setIsLevelUpOpen(true);

      setPlayerStats(p => ({
        ...p,
        level: nextLevel,
        exp: leftOverExp,
        nextLevelExp: newNextLevelExp,
      }));
    }
  }, [addLog]);

  // Monster AI Turn
  const processMonstersTurn = useCallback((
    currentDungeon: DungeonMap,
    pPos: Position,
    currentStats: PlayerStats
  ): { nextDungeon: DungeonMap; updatedPlayerStats: PlayerStats; isDead: boolean } => {
    let updatedPlayerHp = currentStats.hp;
    let isDead = false;
    let killerName = '';

    // 1. Resolve any existing Boss telegraphed AoE explosion from previous turn
    let nextBossTelegraphTiles: Position[] | undefined = undefined;
    if (currentDungeon.bossTelegraphTiles && currentDungeon.bossTelegraphTiles.length > 0) {
      const hitPlayer = currentDungeon.bossTelegraphTiles.some(p => p.x === pPos.x && p.y === pPos.y);
      if (hitPlayer) {
        const aoeDmg = Math.max(12, Math.floor(18 + currentStats.depth * 2.5 - effectiveDef * 0.4));
        updatedPlayerHp -= aoeDmg;
        soundManager.playExplosion();
        addFloatingText(pPos.x, pPos.y, `-${aoeDmg} ¡EXPLOSIÓN!`, '#ef4444');
        addLog(`¡El ataque telegrafiado del Jefe estalla bajo tus pies por ${aoeDmg} de daño!`, 'danger');
        if (updatedPlayerHp <= 0) {
          isDead = true;
          killerName = 'Cataclismo Elemental del Jefe';
        }
      }
    }

    // 2. Boss Telegraphed Attack Charging
    const activeBoss = currentDungeon.monsters.find(m => (m.isBoss || m.bossData) && m.hp > 0);
    if (activeBoss && (!currentDungeon.bossTelegraphTiles || currentDungeon.bossTelegraphTiles.length === 0)) {
      const bdx = Math.abs(pPos.x - activeBoss.x);
      const bdy = Math.abs(pPos.y - activeBoss.y);
      if (bdx + bdy <= 7 && Math.random() < 0.35) {
        // Telegraph a 3x3 danger area around player's current position!
        const tilesToTelegraph: Position[] = [];
        for (let tx = pPos.x - 1; tx <= pPos.x + 1; tx++) {
          for (let ty = pPos.y - 1; ty <= pPos.y + 1; ty++) {
            if (currentDungeon.tiles[ty]?.[tx] && currentDungeon.tiles[ty][tx] !== 'wall') {
              tilesToTelegraph.push({ x: tx, y: ty });
            }
          }
        }
        nextBossTelegraphTiles = tilesToTelegraph;
        soundManager.playCrit();
        addLog(`¡${activeBoss.name} canaliza su devastador ataque de área! ¡MUÉVETE!`, 'danger');
      }
    }

    const nextMonsters: Monster[] = currentDungeon.monsters.map(monster => {
      if (monster.hp <= 0) return monster;

      // If monster is stunned
      if (monster.stunnedTurns && monster.stunnedTurns > 0) {
        return { ...monster, stunnedTurns: monster.stunnedTurns - 1 };
      }

      // Check distance to player
      const dx = pPos.x - monster.x;
      const dy = pPos.y - monster.y;
      const dist = Math.abs(dx) + Math.abs(dy);

      // Monster acts if close (within 7 tiles) or if player is visible to it
      if (dist <= 7) {
        // If adjacent, attack player!
        if (dist === 1) {
          const rawDamage = monster.atk;
          const damage = Math.max(1, rawDamage - effectiveDef);
          updatedPlayerHp -= damage;

          soundManager.playPlayerHurt();
          addFloatingText(pPos.x, pPos.y, `-${damage}`, '#ef4444');
          addLog(`¡${monster.name} te ataca por ${damage} de daño!`, 'danger');

          if (updatedPlayerHp <= 0) {
            isDead = true;
            killerName = monster.name;
          }

          return monster;
        }

        // Otherwise step toward player if path is clear
        let stepX = 0;
        let stepY = 0;

        if (Math.abs(dx) > Math.abs(dy)) {
          stepX = dx > 0 ? 1 : -1;
        } else {
          stepY = dy > 0 ? 1 : -1;
        }

        const targetX = monster.x + stepX;
        const targetY = monster.y + stepY;

        // Check if tile is walkable floor and not occupied by player or other monster
        const tile = currentDungeon.tiles[targetY]?.[targetX];
        const isOccupied =
          (targetX === pPos.x && targetY === pPos.y) ||
          currentDungeon.monsters.some(m => m.id !== monster.id && m.x === targetX && m.y === targetY);

        if (tile && tile !== 'wall' && tile !== 'door_closed' && !isOccupied) {
          return { ...monster, x: targetX, y: targetY };
        }
      }

      return monster;
    });

    const nextDungeon: DungeonMap = {
      ...currentDungeon,
      monsters: nextMonsters,
      bossTelegraphTiles: nextBossTelegraphTiles,
    };

    const nextStats: PlayerStats = {
      ...currentStats,
      hp: Math.max(0, updatedPlayerHp),
      skillCooldownLeft: Math.max(0, currentStats.skillCooldownLeft - 1),
    };

    if (isDead) {
      soundManager.playGameOver();
      const finalCause = `Derrotado por ${killerName} en el Piso ${currentStats.depth}`;
      setDeathCause(finalCause);
      saveHighScore(currentStats.depth, currentStats.level, currentStats.gold, currentStats.kills, finalCause);
      setGameStatus('game_over');
    }

    return { nextDungeon, updatedPlayerStats: nextStats, isDead };
  }, [effectiveDef, addFloatingText, addLog, saveHighScore]);

  // Player action / movement execution
  const executePlayerMove = useCallback((dx: number, dy: number) => {
    if (gameStatus !== 'playing' || !dungeon) return;

    const targetX = playerPos.x + dx;
    const targetY = playerPos.y + dy;

    // Boundary check
    if (targetX < 0 || targetX >= dungeon.width || targetY < 0 || targetY >= dungeon.height) {
      return;
    }

    const tile = dungeon.tiles[targetY][targetX];

    // 1. Check if attacking a monster in that tile
    const targetMonster = dungeon.monsters.find(m => m.x === targetX && m.y === targetY && m.hp > 0);
    if (targetMonster) {
      // Perform Attack
      const isCrit = Math.random() < effectiveCrit / 100;
      const baseDmg = Math.max(1, effectiveAtk - targetMonster.def);
      const damage = isCrit ? baseDmg * 2 : baseDmg;
      const updatedHp = targetMonster.hp - damage;

      if (isCrit) {
        soundManager.playCrit();
        addFloatingText(targetX, targetY, `¡CRÍTICO! -${damage}`, '#f59e0b');
        addLog(`¡Golpe crítico contra ${targetMonster.name} por ${damage} de daño!`, 'crit');
      } else {
        soundManager.playHit();
        addFloatingText(targetX, targetY, `-${damage}`, '#f8fafc');
        addLog(`Atacas a ${targetMonster.name} por ${damage} de daño.`, 'combat');
      }

      let updatedMonsters = dungeon.monsters.map(m =>
        m.id === targetMonster.id ? { ...m, hp: Math.max(0, updatedHp) } : m
      );

      // Boss phase 2 transition and enrage
      if (targetMonster.bossData && !targetMonster.bossData.hasEnraged && updatedHp > 0 && updatedHp <= targetMonster.maxHp * 0.5) {
        targetMonster.bossData.hasEnraged = true;
        targetMonster.bossData.phase = 2;
        targetMonster.atk = Math.round(targetMonster.atk * 1.35);
        soundManager.playCrit();
        addFloatingText(targetX, targetY, '¡FASE 2: ENFURECIDO!', '#ef4444');
        addLog(`¡${targetMonster.name} ENTRA EN FASE 2 Y DESATA SU FURIA PRIMIGENIA! (+35% ATK)`, 'danger');
      }

      let currentExp = playerStats.exp;
      let currentKills = playerStats.kills;
      let currentGold = playerStats.gold;

      // Monster died
      if (updatedHp <= 0) {
        currentExp += targetMonster.expValue;
        currentKills += 1;
        const goldDrop = Math.floor(Math.random() * (10 + playerStats.depth * 4)) + 5;
        currentGold += goldDrop;

        addLog(`¡${targetMonster.name} ha sido derrotado! (+${targetMonster.expValue} XP, +${goldDrop} 🪙)`, 'loot');
        addFloatingText(targetX, targetY, `+${goldDrop} 🪙`, '#fbbf24');
        soundManager.playGold();

        // Maybe drop guaranteed item on boss
        if (targetMonster.isBoss) {
          confetti({ particleCount: 70, spread: 80 });
          const bossLoot = generateProceduralWeapon(playerStats.depth, 'legendary');
          dungeon.items.set(`${targetX},${targetY}`, bossLoot);
          addLog(`¡El Jefe ha soltado una reliquia legendaria forjada: ${bossLoot.name}!`, 'level');
        } else if (Math.random() < 0.28) {
          const mobLoot = generateLootItem(playerStats.depth);
          dungeon.items.set(`${targetX},${targetY}`, mobLoot);
        }

        updatedMonsters = updatedMonsters.filter(m => m.id !== targetMonster.id);
      }

      // Update dungeon monsters
      const dungeonAfterCombat: DungeonMap = {
        ...dungeon,
        monsters: updatedMonsters,
      };

      // Process monster AI responses
      const statsAfterCombat: PlayerStats = {
        ...playerStats,
        exp: currentExp,
        kills: currentKills,
        gold: currentGold,
      };

      const { nextDungeon, updatedPlayerStats, isDead } = processMonstersTurn(
        dungeonAfterCombat,
        playerPos,
        statsAfterCombat
      );

      if (!isDead) {
        setDungeon(nextDungeon);
        setPlayerStats(updatedPlayerStats);
        checkLevelUp(updatedPlayerStats);
      }
      return;
    }

    // 2. Wall collision
    if (tile === 'wall') {
      return; // Can't walk into walls
    }

    // 3. Breakable barrel interaction
    if (tile === 'barrel') {
      soundManager.playHit();
      const goldFound = Math.floor(Math.random() * 8) + 2;
      addFloatingText(targetX, targetY, `+${goldFound} 🪙`, '#fbbf24');
      addLog(`¡Rompiste un barril y hallaste ${goldFound} monedas de oro!`, 'loot');

      const newTiles = dungeon.tiles.map(row => [...row]);
      newTiles[targetY][targetX] = 'floor';

      // 30% chance for a potion inside
      if (Math.random() < 0.3) {
        dungeon.items.set(`${targetX},${targetY}`, generateLootItem(playerStats.depth));
      }

      setDungeon({ ...dungeon, tiles: newTiles });
      setPlayerStats(p => ({ ...p, gold: p.gold + goldFound }));
      return;
    }

    // 3b. Explosive Barrel interaction (AoE Blast!)
    if (tile === 'barrel_explosive') {
      soundManager.playExplosion();
      const newTiles = dungeon.tiles.map(row => [...row]);
      newTiles[targetY][targetX] = 'floor';
      addFloatingText(targetX, targetY, '¡BOOM! 💥', '#ef4444');
      addLog('¡Detonaste el barril de pólvora en una poderosa deflagración!', 'danger');

      // AoE damage to monsters in 3x3
      const explosionDmg = Math.floor(40 + playerStats.depth * 3.5);
      const updatedMobs = dungeon.monsters.map(m => {
        if (Math.abs(m.x - targetX) <= 1 && Math.abs(m.y - targetY) <= 1) {
          const remHp = Math.max(0, m.hp - explosionDmg);
          addFloatingText(m.x, m.y, `-${explosionDmg}`, '#ef4444');
          return { ...m, hp: remHp };
        }
        return m;
      }).filter(m => m.hp > 0);

      // Damage player if caught in blast
      let updatedHp = playerStats.hp;
      if (Math.abs(playerPos.x - targetX) <= 1 && Math.abs(playerPos.y - targetY) <= 1) {
        const selfDmg = Math.max(8, Math.floor(explosionDmg * 0.35));
        updatedHp = Math.max(0, updatedHp - selfDmg);
        addFloatingText(playerPos.x, playerPos.y, `-${selfDmg}`, '#ef4444');
      }

      // Break any adjacent cracked walls
      for (let ey = targetY - 1; ey <= targetY + 1; ey++) {
        for (let ex = targetX - 1; ex <= targetX + 1; ex++) {
          if (newTiles[ey]?.[ex] === 'cracked_wall') {
            newTiles[ey][ex] = 'floor';
          }
        }
      }

      setDungeon({ ...dungeon, tiles: newTiles, monsters: updatedMobs });
      setPlayerStats(p => ({ ...p, hp: updatedHp }));
      return;
    }

    // 3c. Cracked Wall secret passage
    if (tile === 'cracked_wall') {
      soundManager.playHit();
      const newTiles = dungeon.tiles.map(row => [...row]);
      newTiles[targetY][targetX] = 'floor';
      addFloatingText(targetX, targetY, '¡MURO DERRUMBADO!', '#fbbf24');
      addLog('¡Golpeaste con fuerza la pared agrietada y descubriste un pasadizo secreto oculto!', 'loot');
      setDungeon({ ...dungeon, tiles: newTiles });
      return;
    }

    // 4. Closed Chest interaction
    if (tile === 'chest') {
      soundManager.playChest();
      const newTiles = dungeon.tiles.map(row => [...row]);
      newTiles[targetY][targetX] = 'chest_open';

      const chestLoot = generateLootItem(playerStats.depth, Math.random() < 0.35 ? 'epic' : 'rare');
      setInventory(prev => [...prev, chestLoot]);
      addLog(`¡Abriste un cofre misterioso y obtuviste ${chestLoot.name}!`, 'loot');
      addFloatingText(targetX, targetY, `¡${chestLoot.name}!`, '#38bdf8');

      setDungeon({ ...dungeon, tiles: newTiles });
      return;
    }

    // 5. Merchant NPC tile interaction
    if (tile === 'merchant') {
      // Open shop
      const shopStock = [
        generateLootItem(playerStats.depth, 'rare'),
        generateLootItem(playerStats.depth, 'epic'),
        {
          id: `pot_shop_1_${Date.now()}`,
          name: 'Super Poción de Vida',
          type: 'potion',
          rarity: 'rare',
          icon: '🧪',
          description: 'Restaura 75 HP al instante.',
          healAmount: 75,
          value: 40,
          effect: 'heal',
        } as Item,
        {
          id: `scroll_shop_1_${Date.now()}`,
          name: 'Pergamino de Cartografía Total',
          type: 'scroll',
          rarity: 'rare',
          icon: '🗺️',
          description: 'Revela toda la niebla del piso.',
          value: 50,
          effect: 'reveal_map',
        } as Item,
      ];
      setMerchantStock(shopStock);
      setIsMerchantOpen(true);
      return;
    }

    // 6. Shrine / Altar interaction
    if (tile === 'shrine') {
      soundManager.playPotion();
      const newTiles = dungeon.tiles.map(row => [...row]);
      newTiles[targetY][targetX] = 'floor';

      // Blessing: full HP/MP heal + temporary buff
      setPlayerStats(p => ({
        ...p,
        hp: p.maxHp,
        mp: p.maxMp,
      }));
      addFloatingText(targetX, targetY, '¡BENDICIÓN TOTAL!', '#a855f7');
      addLog('¡Rezas ante el Altar Sagrado! Tu salud y maná se han restaurado al máximo.', 'shrine');

      setDungeon({ ...dungeon, tiles: newTiles });
      return;
    }

    // 6b. Blood Altar interaction (Sacrifice for Power & Epic Weapon)
    if (tile === 'shrine_blood') {
      soundManager.playCrit();
      const newTiles = dungeon.tiles.map(row => [...row]);
      newTiles[targetY][targetX] = 'floor';

      const sacrificeHp = Math.min(22, Math.max(1, playerStats.hp - 1));
      const bloodWeapon = generateProceduralWeapon(playerStats.depth, 'epic');
      setInventory(prev => [...prev, bloodWeapon]);
      setPlayerStats(p => ({
        ...p,
        hp: Math.max(1, p.hp - sacrificeHp),
        atk: p.atk + 4,
      }));
      addFloatingText(targetX, targetY, '+4 ATK & ARMA SANGRIENTA', '#ef4444');
      addLog(`¡Pacto de Sangre consumado! Ofreciste ${sacrificeHp} HP a cambio de +4 ATK permanente y ${bloodWeapon.name}.`, 'danger');

      setDungeon({ ...dungeon, tiles: newTiles });
      return;
    }

    // 6c. Astral Obelisk (Full Map Revelation + DEF Boost)
    if (tile === 'obelisk') {
      soundManager.playSpell();
      const newTiles = dungeon.tiles.map(row => [...row]);
      newTiles[targetY][targetX] = 'floor';

      const fullVis = dungeon.visibility.map(row =>
        row.map(s => (s === VisibilityState.UNEXPLORED ? VisibilityState.EXPLORED : s))
      );
      setPlayerStats(p => ({
        ...p,
        def: p.def + 4,
        mp: p.maxMp,
      }));
      addFloatingText(targetX, targetY, '¡REVELACIÓN ASTRAL (+4 DEF)!', '#38bdf8');
      addLog('¡Canalizaste el Monolito Astral! Todo el piso ha sido cartografiado y tu armadura fue bendecida con +4 DEF.', 'level');

      setDungeon({ ...dungeon, tiles: newTiles, visibility: fullVis });
      return;
    }

    // 7. Regular Movement into Floor / Open tile
    const newPlayerPos: Position = { x: targetX, y: targetY };
    soundManager.playFootstep();

    // Check Trap
    let playerDamageFromTrap = 0;
    if (tile === 'trap') {
      playerDamageFromTrap = Math.floor(10 + playerStats.depth * 2);
      soundManager.playPlayerHurt();
      addFloatingText(targetX, targetY, `-${playerDamageFromTrap} TRAMPA`, '#ef4444');
      addLog(`¡Pisas una trampa de pinchos oculta! Sufres ${playerDamageFromTrap} de daño.`, 'danger');
    }

    // Check Lava hazard
    let playerDamageFromLava = 0;
    if (tile === 'lava') {
      playerDamageFromLava = Math.max(6, Math.floor(playerStats.maxHp * 0.12));
      soundManager.playPlayerHurt();
      addFloatingText(targetX, targetY, `-${playerDamageFromLava} LAVA`, '#f97316');
      addLog(`¡Caminas sobre lava ardiente! Sufres ${playerDamageFromLava} de daño por fuego.`, 'danger');
    }

    // Check Water splash
    if (tile === 'water') {
      addLog('Avanzas chapoteando por las aguas subterráneas.', 'info');
    }

    // Check Acid hazard
    let playerDamageFromAcid = 0;
    if (tile === 'acid') {
      playerDamageFromAcid = Math.max(5, Math.floor(playerStats.maxHp * 0.08));
      soundManager.playPlayerHurt();
      addFloatingText(targetX, targetY, `-${playerDamageFromAcid} ÁCIDO`, '#10b981');
      addLog(`¡Pisas un charco de ácido corrosivo! Sufres ${playerDamageFromAcid} de daño químico.`, 'danger');
    }

    // Check Ice sliding
    if (tile === 'ice') {
      addFloatingText(targetX, targetY, '¡HIELO!', '#38bdf8');
      addLog('Te deslizas con velocidad por el suelo congelado.', 'info');
    }

    // Check Web
    if (tile === 'web') {
      addFloatingText(targetX, targetY, '¡TELARAÑA!', '#94a3b8');
      addLog('Cortas los filamentos de la pegajosa telaraña para abrirte paso.', 'info');
    }

    // Check ground items to pick up
    const groundItem = dungeon.items.get(`${targetX},${targetY}`);
    if (groundItem) {
      soundManager.playPotion();
      dungeon.items.delete(`${targetX},${targetY}`);
      setInventory(prev => [...prev, groundItem]);
      addLog(`Has recogido del suelo: ${groundItem.name}`, 'loot');
      addFloatingText(targetX, targetY, `+${groundItem.name}`, '#22c55e');
    }

    // Natural regeneration every 8 turns
    turnsCountRef.current += 1;
    let regenHp = 0;
    let regenMp = 0;
    if (turnsCountRef.current % 8 === 0) {
      regenHp = 1;
      regenMp = 1;
    }

    const totalHazardDamage = playerDamageFromTrap + playerDamageFromLava + playerDamageFromAcid;
    const currentStatsUpdated: PlayerStats = {
      ...playerStats,
      hp: Math.max(0, Math.min(playerStats.maxHp, playerStats.hp - totalHazardDamage + regenHp)),
      mp: Math.min(playerStats.maxMp, playerStats.mp + regenMp),
    };

    if (currentStatsUpdated.hp <= 0) {
      soundManager.playGameOver();
      const cause = playerDamageFromLava > 0
        ? `Incinerado en magma ardiente en el Piso ${playerStats.depth}`
        : playerDamageFromAcid > 0
        ? `Disuelto en ácido corrosivo en el Piso ${playerStats.depth}`
        : `Caído en una trampa de púas en el Piso ${playerStats.depth}`;
      setDeathCause(cause);
      saveHighScore(playerStats.depth, playerStats.level, playerStats.gold, playerStats.kills, cause);
      setGameStatus('game_over');
      return;
    }

    // Recompute Fog of War for new player position
    const updatedVis = computeFOV(
      dungeon.width,
      dungeon.height,
      dungeon.tiles,
      dungeon.visibility,
      newPlayerPos.x,
      newPlayerPos.y,
      effectiveVision
    );

    const updatedDungeon: DungeonMap = {
      ...dungeon,
      visibility: updatedVis,
    };

    // Process Monster turns
    const { nextDungeon, updatedPlayerStats, isDead } = processMonstersTurn(
      updatedDungeon,
      newPlayerPos,
      currentStatsUpdated
    );

    if (!isDead) {
      setPlayerPos(newPlayerPos);
      setDungeon(nextDungeon);
      setPlayerStats(updatedPlayerStats);
      checkLevelUp(updatedPlayerStats);
    }
  }, [
    gameStatus,
    dungeon,
    playerPos,
    effectiveAtk,
    effectiveCrit,
    effectiveVision,
    playerStats,
    addFloatingText,
    addLog,
    processMonstersTurn,
    checkLevelUp,
    saveHighScore,
  ]);

  // Wait / Rest 1 Turn
  const handleWaitTurn = useCallback(() => {
    if (gameStatus !== 'playing' || !dungeon) return;

    soundManager.playFootstep();
    addLog('Esperas un turno alerta...', 'info');

    // Slight heal on deliberate rest
    const nextStats: PlayerStats = {
      ...playerStats,
      hp: Math.min(playerStats.maxHp, playerStats.hp + 2),
      mp: Math.min(playerStats.maxMp, playerStats.mp + 2),
    };

    const { nextDungeon, updatedPlayerStats, isDead } = processMonstersTurn(
      dungeon,
      playerPos,
      nextStats
    );

    if (!isDead) {
      setDungeon(nextDungeon);
      setPlayerStats(updatedPlayerStats);
    }
  }, [gameStatus, dungeon, playerPos, playerStats, addLog, processMonstersTurn]);

  // Class Special Skill execution
  const handleUseSkill = useCallback(() => {
    if (gameStatus !== 'playing' || !dungeon) return;
    const cls = PLAYER_CLASSES[selectedClassId];

    if (playerStats.skillCooldownLeft > 0) {
      addLog(`Habilidad en recarga (${playerStats.skillCooldownLeft} turnos restantes).`, 'danger');
      return;
    }
    if (playerStats.mp < cls.skillCostMp) {
      addLog(`¡No tienes suficiente maná! Requiere ${cls.skillCostMp} MP.`, 'danger');
      return;
    }

    soundManager.playSpell();

    if (selectedClassId === 'warrior') {
      // Golpe Sísmico: hits all 8 adjacent monsters and stuns them!
      let hitCount = 0;
      const skillDmg = Math.round(effectiveAtk * 2.2);

      const updatedMonsters = dungeon.monsters.map(m => {
        const dx = Math.abs(m.x - playerPos.x);
        const dy = Math.abs(m.y - playerPos.y);
        if (dx <= 1 && dy <= 1 && !(dx === 0 && dy === 0) && m.hp > 0) {
          hitCount++;
          const finalHp = Math.max(0, m.hp - skillDmg);
          addFloatingText(m.x, m.y, `¡SÍSMICO! -${skillDmg}`, '#f97316');
          return { ...m, hp: finalHp, stunnedTurns: 1 };
        }
        return m;
      });

      addLog(`¡${cls.skillName} golpea el suelo afectando a ${hitCount} enemigos por ${skillDmg} de daño!`, 'crit');

      setDungeon({ ...dungeon, monsters: updatedMonsters });
      setPlayerStats(p => ({
        ...p,
        mp: p.mp - cls.skillCostMp,
        skillCooldownLeft: cls.skillCooldown,
      }));
    } else if (selectedClassId === 'mage') {
      // Ráfaga Arcana: hits visible monster within 5 tiles
      const visibleMonsters = dungeon.monsters.filter(
        m => m.hp > 0 && isTileVisible(dungeon.visibility, m.x, m.y)
      );

      if (visibleMonsters.length === 0) {
        addLog('No hay monstruos a la vista para apuntar la Ráfaga Arcana.', 'info');
        return;
      }

      // Target closest visible monster
      const target = visibleMonsters.sort(
        (a, b) =>
          Math.hypot(a.x - playerPos.x, a.y - playerPos.y) -
          Math.hypot(b.x - playerPos.x, b.y - playerPos.y)
      )[0];

      const magicDmg = Math.round(effectiveAtk * 2.6);
      const updatedHp = Math.max(0, target.hp - magicDmg);

      addFloatingText(target.x, target.y, `¡ARCANA! -${magicDmg}`, '#a855f7');
      addLog(`¡Lanzas una Ráfaga Arcana a ${target.name} causándole ${magicDmg} de daño demoledor!`, 'crit');

      const updatedMonsters = dungeon.monsters.map(m =>
        m.id === target.id ? { ...m, hp: updatedHp } : m
      );

      setDungeon({ ...dungeon, monsters: updatedMonsters });
      setPlayerStats(p => ({
        ...p,
        mp: p.mp - cls.skillCostMp,
        skillCooldownLeft: cls.skillCooldown,
      }));
    } else {
      // Pícaro: Paso Sombrío (dash forward 3 tiles if passable, guaranteed critical)
      let nx = playerPos.x;
      let ny = playerPos.y;

      // Find closest open floor 2-3 tiles ahead
      const candidates = [
        { x: playerPos.x + 2, y: playerPos.y },
        { x: playerPos.x - 2, y: playerPos.y },
        { x: playerPos.x, y: playerPos.y + 2 },
        { x: playerPos.x, y: playerPos.y - 2 },
      ];

      const validSpot = candidates.find(
        c =>
          c.x >= 0 &&
          c.x < dungeon.width &&
          c.y >= 0 &&
          c.y < dungeon.height &&
          dungeon.tiles[c.y][c.x] === 'floor'
      );

      if (validSpot) {
        nx = validSpot.x;
        ny = validSpot.y;
      }

      addFloatingText(playerPos.x, playerPos.y, '¡SIGILO!', '#22c55e');
      addLog('¡Paso Sombrío ejecutado! Te desvaneces en las sombras.', 'shrine');

      setPlayerPos({ x: nx, y: ny });
      setPlayerStats(p => ({
        ...p,
        mp: p.mp - cls.skillCostMp,
        skillCooldownLeft: cls.skillCooldown,
        critChance: 100, // 100% crit next turn
      }));
    }
  }, [gameStatus, dungeon, selectedClassId, playerStats, effectiveAtk, playerPos, addLog, addFloatingText]);

  // Quick Potion
  const handleQuickPotion = useCallback(() => {
    const potion = inventory.find(i => i.type === 'potion' && i.healAmount);
    if (!potion) {
      addLog('No tienes pociones de vida en la mochila.', 'info');
      return;
    }

    const heal = potion.healAmount || 30;
    soundManager.playPotion();
    setPlayerStats(p => ({
      ...p,
      hp: Math.min(p.maxHp, p.hp + heal),
    }));
    addFloatingText(playerPos.x, playerPos.y, `+${heal} HP`, '#22c55e');
    addLog(`Bebes ${potion.name} y recuperas ${heal} puntos de salud.`, 'shrine');

    // Remove from inventory
    setInventory(prev => {
      const idx = prev.findIndex(item => item.id === potion.id);
      if (idx !== -1) {
        const copy = [...prev];
        copy.splice(idx, 1);
        return copy;
      }
      return prev;
    });
  }, [inventory, playerPos, addLog, addFloatingText]);

  // Auto-Explore step
  const handleAutoExplore = useCallback(() => {
    if (gameStatus !== 'playing' || !dungeon) return;

    // Search for nearest tile with visibility UNEXPLORED or ground loot
    let bestDist = Infinity;
    let targetDirection: Position | null = null;

    const dirs = [
      { x: 0, y: -1 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: -1, y: 0 },
    ];

    // Priority 1: Pick up visible loot if adjacent
    for (const d of dirs) {
      const tx = playerPos.x + d.x;
      const ty = playerPos.y + d.y;
      if (dungeon.items.has(`${tx},${ty}`)) {
        executePlayerMove(d.x, d.y);
        return;
      }
    }

    // Priority 2: Step toward unexplored darkness
    for (const d of dirs) {
      const tx = playerPos.x + d.x;
      const ty = playerPos.y + d.y;
      if (
        tx >= 0 &&
        tx < dungeon.width &&
        ty >= 0 &&
        ty < dungeon.height &&
        dungeon.tiles[ty][tx] !== 'wall'
      ) {
        // Count surrounding unexplored tiles
        let unexploredNear = 0;
        for (let dy = -2; dy <= 2; dy++) {
          for (let dx = -2; dx <= 2; dx++) {
            const ny = ty + dy;
            const nx = tx + dx;
            if (
              nx >= 0 &&
              nx < dungeon.width &&
              ny >= 0 &&
              ny < dungeon.height &&
              dungeon.visibility[ny][nx] === VisibilityState.UNEXPLORED
            ) {
              unexploredNear++;
            }
          }
        }
        if (unexploredNear > 0) {
          executePlayerMove(d.x, d.y);
          return;
        }
      }
    }

    // Fallback: take any valid step
    for (const d of dirs) {
      const tx = playerPos.x + d.x;
      const ty = playerPos.y + d.y;
      if (
        tx >= 0 &&
        tx < dungeon.width &&
        ty >= 0 &&
        ty < dungeon.height &&
        dungeon.tiles[ty][tx] !== 'wall'
      ) {
        executePlayerMove(d.x, d.y);
        return;
      }
    }
  }, [gameStatus, dungeon, playerPos, executePlayerMove]);

  // Descend to next floor
  const handleStairsDown = useCallback(() => {
    if (!dungeon) return;
    const nextDepth = playerStats.depth + 1;
    initFloor(nextDepth, playerStats);
  }, [dungeon, playerStats, initFloor]);

  // Click on canvas tile
  const handleTileClick = useCallback((tileX: number, tileY: number) => {
    if (gameStatus !== 'playing') return;
    const dx = tileX - playerPos.x;
    const dy = tileY - playerPos.y;

    // If adjacent, move or attack
    if (Math.abs(dx) <= 1 && Math.abs(dy) <= 1 && !(dx === 0 && dy === 0)) {
      executePlayerMove(dx, dy);
    } else {
      // Step closer along dominant axis
      const stepX = dx === 0 ? 0 : dx > 0 ? 1 : -1;
      const stepY = dy === 0 ? 0 : dy > 0 ? 1 : -1;
      if (Math.abs(dx) >= Math.abs(dy)) {
        executePlayerMove(stepX, 0);
      } else {
        executePlayerMove(0, stepY);
      }
    }
  }, [gameStatus, playerPos, executePlayerMove]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameStatus !== 'playing') return;
      if (isInventoryOpen || isCharacterOpen || isCombatLogOpen || isMerchantOpen || isLevelUpOpen) {
        if (e.key === 'Escape') {
          setIsInventoryOpen(false);
          setIsCharacterOpen(false);
          setIsCombatLogOpen(false);
          setIsMerchantOpen(false);
        }
        return;
      }

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          executePlayerMove(0, -1);
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          executePlayerMove(0, 1);
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          executePlayerMove(-1, 0);
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          executePlayerMove(1, 0);
          break;
        case ' ':
        case '.':
          e.preventDefault();
          handleWaitTurn();
          break;
        case 'e':
        case 'E':
          e.preventDefault();
          handleAutoExplore();
          break;
        case 'q':
        case 'Q':
          e.preventDefault();
          handleQuickPotion();
          break;
        case '1':
          e.preventDefault();
          handleUseSkill();
          break;
        case 'i':
        case 'I':
          e.preventDefault();
          setIsInventoryOpen(true);
          break;
        case 'c':
        case 'C':
          e.preventDefault();
          setIsCharacterOpen(true);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    gameStatus,
    isInventoryOpen,
    isCharacterOpen,
    isCombatLogOpen,
    isMerchantOpen,
    isLevelUpOpen,
    executePlayerMove,
    handleWaitTurn,
    handleAutoExplore,
    handleQuickPotion,
    handleUseSkill,
  ]);

  // Check if player is standing on stairs
  const isOnStairs = Boolean(
    dungeon &&
      dungeon.tiles[playerPos.y]?.[playerPos.x] === 'stairs_down'
  );

  // Inventory actions
  const handleEquipItem = (item: Item) => {
    soundManager.playChest();
    if (item.type === 'weapon') {
      const old = equipment.weapon;
      setEquipment(eq => ({ ...eq, weapon: item }));
      setInventory(inv => [...inv.filter(i => i.id !== item.id), ...(old ? [old] : [])]);
      addLog(`Equipaste arma: ${item.name}`, 'loot');
    } else if (item.type === 'armor') {
      const old = equipment.armor;
      setEquipment(eq => ({ ...eq, armor: item }));
      setInventory(inv => [...inv.filter(i => i.id !== item.id), ...(old ? [old] : [])]);
      addLog(`Equipaste armadura: ${item.name}`, 'loot');
    } else if (item.type === 'ring') {
      const old = equipment.ring;
      setEquipment(eq => ({ ...eq, ring: item }));
      setInventory(inv => [...inv.filter(i => i.id !== item.id), ...(old ? [old] : [])]);
      addLog(`Equipaste reliquia: ${item.name}`, 'loot');
    }
  };

  const handleUnequipItem = (slot: keyof Equipment) => {
    const item = equipment[slot];
    if (!item) return;
    setEquipment(eq => ({ ...eq, [slot]: null }));
    setInventory(inv => [...inv, item]);
    addLog(`Desequipaste: ${item.name}`, 'info');
  };

  const handleUseItem = (item: Item) => {
    if (item.type === 'potion') {
      soundManager.playPotion();
      if (item.healAmount) {
        setPlayerStats(p => ({ ...p, hp: Math.min(p.maxHp, p.hp + item.healAmount!) }));
        addFloatingText(playerPos.x, playerPos.y, `+${item.healAmount} HP`, '#22c55e');
        addLog(`Bebiste ${item.name} (+${item.healAmount} HP).`, 'shrine');
      } else if (item.mpRestoreAmount) {
        setPlayerStats(p => ({ ...p, mp: Math.min(p.maxMp, p.mp + item.mpRestoreAmount!) }));
        addFloatingText(playerPos.x, playerPos.y, `+${item.mpRestoreAmount} MP`, '#38bdf8');
        addLog(`Bebiste ${item.name} (+${item.mpRestoreAmount} MP).`, 'shrine');
      }
    } else if (item.type === 'scroll') {
      soundManager.playSpell();
      if (item.effect === 'reveal_map' && dungeon) {
        // Reveal full map in fog
        const fullVis = dungeon.visibility.map(row =>
          row.map(s => (s === VisibilityState.UNEXPLORED ? VisibilityState.EXPLORED : s))
        );
        setDungeon({ ...dungeon, visibility: fullVis });
        addLog('¡El pergamino revela toda la cartografía del piso actual!', 'level');
      } else if (item.effect === 'teleport' && dungeon) {
        // Safe teleport
        const randomX = Math.floor(Math.random() * (dungeon.width - 4)) + 2;
        const randomY = Math.floor(Math.random() * (dungeon.height - 4)) + 2;
        if (dungeon.tiles[randomY][randomX] === 'floor') {
          setPlayerPos({ x: randomX, y: randomY });
          addLog('¡Te teletransportas a través de los planos astrales!', 'shrine');
        }
      }
    }

    // Remove from bag
    setInventory(inv => inv.filter(i => i.id !== item.id));
  };

  const handleDropItem = (item: Item) => {
    if (!dungeon) return;
    dungeon.items.set(`${playerPos.x},${playerPos.y}`, item);
    setInventory(inv => inv.filter(i => i.id !== item.id));
    addLog(`Tiraste ${item.name} al suelo.`, 'info');
  };

  // Merchant actions
  const handleBuyItem = (item: Item) => {
    if (playerStats.gold < item.value) return;
    soundManager.playGold();
    setPlayerStats(p => ({ ...p, gold: p.gold - item.value }));
    setInventory(prev => [...prev, item]);
    setMerchantStock(stock => stock.filter(i => i.id !== item.id));
    addLog(`Compraste ${item.name} por ${item.value} 🪙.`, 'loot');
  };

  const potionCount = inventory.filter(i => i.type === 'potion' && i.healAmount).length;

  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-100 overflow-hidden font-sans select-none">
      {/* Viewport Frame Container (Responsive or Android Phone Shell) */}
      <div
        className={`relative w-full h-full flex flex-col bg-slate-950 overflow-hidden transition-all duration-300 ${
          isMobileFrameView
            ? 'max-w-[420px] max-h-[860px] rounded-[38px] border-4 border-slate-800 shadow-2xl my-auto'
            : 'max-w-md md:max-w-lg lg:max-w-2xl'
        }`}
      >
        {/* Android Notch / Frame Camera Status Bar */}
        <div className="w-full bg-slate-950 px-4 pt-2 pb-1 flex items-center justify-between text-[11px] text-slate-400 font-mono select-none">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-200">12:00</span>
            <span className="text-[9px] bg-slate-800 px-1.5 py-0.2 rounded text-slate-400">4G</span>
          </div>

          {/* Android Center Camera Hole */}
          <div className="w-3 h-3 rounded-full bg-slate-900 border border-slate-800" />

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsMobileFrameView(v => !v)}
              className="p-0.5 rounded text-slate-500 hover:text-slate-300"
              title={isMobileFrameView ? 'Cambiar a pantalla completa' : 'Ver en marco de Android'}
            >
              {isMobileFrameView ? <Monitor className="w-3 h-3" /> : <Smartphone className="w-3 h-3" />}
            </button>
            <span className="text-[10px]">98% 🔋</span>
          </div>
        </div>

        {/* Dynamic Game Views */}
        {gameStatus === 'start_screen' && (
          <ClassSelectScreen onStartGame={handleStartGame} />
        )}

        {gameStatus === 'playing' && dungeon && (
          <div className="flex-1 flex flex-col min-h-0 relative">
            {/* Top Status HUD */}
            <StatusBar
              stats={playerStats}
              themeName={dungeon.themeName}
              floorAffix={dungeon.floorAffix}
              inventoryCount={inventory.length}
              soundEnabled={soundEnabled}
              onToggleSound={() => {
                soundManager.enabled = !soundEnabled;
                setSoundEnabled(!soundEnabled);
              }}
              onOpenInventory={() => setIsInventoryOpen(true)}
              onOpenCharacter={() => setIsCharacterOpen(true)}
              onOpenCombatLog={() => setIsCombatLogOpen(true)}
            />

            {/* Central Dungeon Canvas (Fog of War & Real-time Action) */}
            <div className="flex-1 min-h-0 relative">
              {/* Active Boss Bar Overlay if boss is alive on floor */}
              {(() => {
                const floorBoss = dungeon.monsters.find(m => (m.isBoss || m.bossData) && m.hp > 0);
                if (!floorBoss) return null;
                return (
                  <div className="absolute top-2 left-0 right-0 z-20 pointer-events-none px-3">
                    <BossBar boss={floorBoss} />
                  </div>
                );
              })()}

              <DungeonCanvas
                dungeon={dungeon}
                playerPos={playerPos}
                playerClassId={selectedClassId}
                equippedWeapon={equipment.weapon}
                floatingTexts={floatingTexts}
                onTileClick={handleTileClick}
                onSwipeMove={executePlayerMove}
              />
            </div>

            {/* Tactical Combat Ticker */}
            <CombatLog
              logs={combatLogs}
              isOpen={isCombatLogOpen}
              onClose={() => setIsCombatLogOpen(false)}
              onOpen={() => setIsCombatLogOpen(true)}
            />

            {/* Android Touch Gamepad & Action Controls */}
            <MobileControls
              onMove={executePlayerMove}
              onWaitTurn={handleWaitTurn}
              onAutoExplore={handleAutoExplore}
              onUseSkill={handleUseSkill}
              onQuickPotion={handleQuickPotion}
              onStairsDown={handleStairsDown}
              isOnStairs={isOnStairs}
              classConfig={PLAYER_CLASSES[selectedClassId]}
              playerStats={playerStats}
              potionCount={potionCount}
            />
          </div>
        )}

        {/* Modals & Dialogs */}
        <InventoryModal
          isOpen={isInventoryOpen}
          onClose={() => setIsInventoryOpen(false)}
          inventory={inventory}
          equipment={equipment}
          onEquipItem={handleEquipItem}
          onUnequipItem={handleUnequipItem}
          onUseItem={handleUseItem}
          onDropItem={handleDropItem}
        />

        <CharacterModal
          isOpen={isCharacterOpen}
          onClose={() => setIsCharacterOpen(false)}
          stats={playerStats}
          classConfig={PLAYER_CLASSES[selectedClassId]}
          equipment={equipment}
        />

        <MerchantModal
          isOpen={isMerchantOpen}
          onClose={() => setIsMerchantOpen(false)}
          playerGold={playerStats.gold}
          stock={merchantStock}
          onBuyItem={handleBuyItem}
        />

        <LevelUpModal
          isOpen={isLevelUpOpen}
          level={playerStats.level}
          perks={levelUpPerks}
          onSelectPerk={(perk) => {
            perk.apply();
            setIsLevelUpOpen(false);
          }}
        />

        <GameOverModal
          isOpen={gameStatus === 'game_over'}
          depthReached={playerStats.depth}
          levelReached={playerStats.level}
          goldCollected={playerStats.gold}
          monstersSlain={playerStats.kills}
          deathCause={deathCause}
          playerClass={PLAYER_CLASSES[selectedClassId].name}
          highScores={highScores}
          onRestart={() => setGameStatus('start_screen')}
        />
      </div>
    </div>
  );
}
