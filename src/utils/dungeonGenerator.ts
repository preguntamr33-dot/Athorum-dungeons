import { DungeonMap, FloorAffix, Item, Monster, Position, TileType, VisibilityState } from '../types';
import { generateProceduralWeapon } from './proceduralWeapons';
import { generateProceduralBoss } from './proceduralBosses';

interface Room {
  x: number;
  y: number;
  w: number;
  h: number;
  centerX: number;
  centerY: number;
  roomType?: 'stone' | 'wood' | 'water' | 'lava' | 'acid' | 'ice' | 'necropolis' | 'void';
}

export interface DungeonThemeInfo {
  depthMin: number;
  depthMax: number;
  name: string;
  color: string;
  floorColor: string;
  biomeId: 'catacombs' | 'crypt' | 'glacier' | 'magma' | 'necropolis' | 'sunken' | 'void' | 'celestial';
  description: string;
}

export const THEMES: DungeonThemeInfo[] = [
  { depthMin: 1, depthMax: 3, name: 'Catacumbas de Piedra Ancestral', color: '#94a3b8', floorColor: '#1e293b', biomeId: 'catacombs', description: 'Galerías subterráneas erosionadas por los siglos.' },
  { depthMin: 4, depthMax: 6, name: 'Cripta de la Podredumbre Fúngica', color: '#10b981', floorColor: '#064e3b', biomeId: 'crypt', description: 'Aguas estancadas, charcos de ácido y esporas venenosas.' },
  { depthMin: 7, depthMax: 9, name: 'Cavernas Glaciares de Niflheim', color: '#38bdf8', floorColor: '#0c4a6e', biomeId: 'glacier', description: 'Paredes de hielo congelado y caminos resbaladizos.' },
  { depthMin: 10, depthMax: 12, name: 'Fundición y Caldera de Magma', color: '#f97316', floorColor: '#431407', biomeId: 'magma', description: 'Ríos de lava ardiente y barriles explosivos.' },
  { depthMin: 13, depthMax: 15, name: 'Necrópolis Sangrienta del Culto', color: '#ef4444', floorColor: '#450a0a', biomeId: 'necropolis', description: 'Altares de sangre y muros resquebrajados con secretos.' },
  { depthMin: 16, depthMax: 19, name: 'Ruinas Sumergidas del Templo', color: '#06b6d4', floorColor: '#164e63', biomeId: 'sunken', description: 'Canales inundados con pasarelas y tesoros hundidos.' },
  { depthMin: 20, depthMax: 24, name: 'Santuario del Vacío Astral', color: '#a855f7', floorColor: '#2e1065', biomeId: 'void', description: 'Monolitos arcanos y vórtices que desafían la realidad.' },
  { depthMin: 25, depthMax: 9999, name: 'Ciudadela de la Singularidad', color: '#eab308', floorColor: '#422006', biomeId: 'celestial', description: 'La cúspide infinita custodiada por deidades primigenias.' },
];

export function getDungeonTheme(depth: number): DungeonThemeInfo {
  return THEMES.find(t => depth >= t.depthMin && depth <= t.depthMax) || THEMES[THEMES.length - 1];
}

export const FLOOR_AFFIXES: FloorAffix[] = [
  { id: 'abundance', name: 'Cámara de Abundancia', description: '+50% más cofres y mercader garantizado', badgeColor: '#fbbf24' },
  { id: 'dense_fog', name: 'Niebla Asfixiante', description: 'Visión reducida, pero botines de mayor rareza', badgeColor: '#94a3b8' },
  { id: 'monster_nest', name: 'Nido Hostil', description: 'Horda de enemigos voraces con doble XP', badgeColor: '#ef4444' },
  { id: 'sanctuary', name: 'Santuario Sagrado', description: 'Múltiples altares benditos y monolitos protectores', badgeColor: '#a855f7' },
  { id: 'blood_moon', name: 'Fiebre Sangrienta', description: 'Enemigos con +20% ATK arrojan armas legendarias', badgeColor: '#f43f5e' },
  { id: 'standard', name: 'Piso Clásico', description: 'Exploración equilibrada de la mazmorra', badgeColor: '#64748b' }
];

export function getFloorAffix(depth: number): FloorAffix {
  if (depth % 5 === 0) {
    return {
      id: 'boss_lair',
      name: 'Guarida del Guardián',
      description: '¡El Jefe de Piso aguarda en la cámara final!',
      badgeColor: '#dc2626'
    };
  }
  // 35% chance for a special affix
  if (depth >= 2 && Math.random() < 0.35) {
    const specialPool = FLOOR_AFFIXES.filter(a => a.id !== 'standard');
    return specialPool[Math.floor(Math.random() * specialPool.length)];
  }
  return FLOOR_AFFIXES.find(a => a.id === 'standard') || FLOOR_AFFIXES[0];
}

const MONSTER_TEMPLATES = [
  // Tier 1 (depth 1+) - Catacumbas
  { name: 'Rata Gigante', monsterType: 'rat', symbol: 'R', baseHp: 16, baseAtk: 4, baseDef: 1, exp: 12, color: '#a8a29e', minDepth: 1 },
  { name: 'Murciélago Vampiro', monsterType: 'bat', symbol: 'V', baseHp: 14, baseAtk: 5, baseDef: 0, exp: 15, color: '#94a3b8', minDepth: 1 },
  { name: 'Esqueleto Soldado', monsterType: 'skeleton', symbol: 'S', baseHp: 24, baseAtk: 7, baseDef: 2, exp: 25, color: '#f8fafc', minDepth: 2 },
  { name: 'Goblin Ladrón', monsterType: 'goblin_thief', symbol: 'G', baseHp: 20, baseAtk: 6, baseDef: 1, exp: 20, color: '#84cc16', minDepth: 2 },
  
  // Tier 2 (depth 4+) - Cripta Fúngica
  { name: 'Goblin Arquero', monsterType: 'goblin_archer', symbol: 'A', baseHp: 28, baseAtk: 10, baseDef: 2, exp: 38, color: '#22c55e', minDepth: 4 },
  { name: 'Zombi Purulento', monsterType: 'zombie', symbol: 'Z', baseHp: 48, baseAtk: 9, baseDef: 4, exp: 50, color: '#4d7c0f', minDepth: 4 },
  { name: 'Araña de la Cripta', monsterType: 'spider', symbol: 'SP', baseHp: 32, baseAtk: 11, baseDef: 2, exp: 42, color: '#15803d', minDepth: 5 },
  
  // Tier 3 (depth 7+) - Cavernas Glaciares
  { name: 'Espectro Gélido', monsterType: 'wraith', symbol: 'W', baseHp: 42, baseAtk: 14, baseDef: 3, exp: 55, color: '#38bdf8', minDepth: 7 },
  { name: 'Golem de Hielo', monsterType: 'frost_golem', symbol: 'FG', baseHp: 75, baseAtk: 15, baseDef: 7, exp: 85, color: '#0284c7', minDepth: 7 },
  { name: 'Orco Berserker', monsterType: 'orc', symbol: 'O', baseHp: 65, baseAtk: 16, baseDef: 5, exp: 80, color: '#f97316', minDepth: 8 },
  
  // Tier 4 (depth 10+) - Caldera de Magma
  { name: 'Demonio Ígneo', monsterType: 'demon', symbol: 'D', baseHp: 100, baseAtk: 22, baseDef: 7, exp: 140, color: '#ef4444', minDepth: 10 },
  { name: 'Nigromante Oscuro', monsterType: 'necromancer', symbol: 'N', baseHp: 65, baseAtk: 22, baseDef: 4, exp: 120, color: '#c084fc', minDepth: 10 },
  { name: 'Golem de Lava', monsterType: 'golem', symbol: 'M', baseHp: 120, baseAtk: 20, baseDef: 11, exp: 170, color: '#ea580c', minDepth: 11 },

  // Tier 5 (depth 13+) - Necrópolis Sangrienta
  { name: 'Vampiro Noble', monsterType: 'vampire', symbol: 'VP', baseHp: 110, baseAtk: 26, baseDef: 8, exp: 190, color: '#be123c', minDepth: 13 },
  { name: 'Caballero de la Muerte', monsterType: 'death_knight', symbol: 'DK', baseHp: 140, baseAtk: 28, baseDef: 12, exp: 230, color: '#881337', minDepth: 14 },

  // Tier 6 (depth 16+) - Ruinas Sumergidas
  { name: 'Sirenio Abisal', monsterType: 'abyssal_siren', symbol: 'AS', baseHp: 135, baseAtk: 30, baseDef: 9, exp: 250, color: '#0891b2', minDepth: 16 },
  { name: 'Monstruo de las Mareas', monsterType: 'tide_monster', symbol: 'TM', baseHp: 165, baseAtk: 32, baseDef: 13, exp: 290, color: '#0e7490', minDepth: 17 },

  // Tier 7 (depth 20+) - Vacío y Ciudadela Astral
  { name: 'Caminante del Vacío', monsterType: 'void_walker', symbol: 'K', baseHp: 180, baseAtk: 36, baseDef: 14, exp: 350, color: '#d946ef', minDepth: 20 },
  { name: 'Ojo Cósmico Flotante', monsterType: 'cosmic_eye', symbol: 'CE', baseHp: 150, baseAtk: 40, baseDef: 10, exp: 380, color: '#a855f7', minDepth: 22 },
  { name: 'Guardián Celestial', monsterType: 'celestial_sentinel', symbol: 'CS', baseHp: 220, baseAtk: 44, baseDef: 18, exp: 500, color: '#facc15', minDepth: 25 },
];

const BOSS_TEMPLATES = [
  { depth: 5, name: 'Señor Esqueleto Maldito', monsterType: 'boss_skeleton', symbol: 'SK', hp: 160, atk: 18, def: 6, exp: 300, color: '#e2e8f0' },
  { depth: 10, name: 'Minotauro del Laberinto', monsterType: 'boss_minotaur', symbol: 'MN', hp: 280, atk: 28, def: 11, exp: 600, color: '#f97316' },
  { depth: 15, name: 'Archimago Espectral', monsterType: 'boss_archmage', symbol: 'AM', hp: 420, atk: 38, def: 14, exp: 1000, color: '#a855f7' },
  { depth: 20, name: 'Dragón del Abismo', monsterType: 'boss_dragon', symbol: 'DR', hp: 650, atk: 52, def: 20, exp: 2000, color: '#ef4444' },
];

export function generateLootItem(depth: number, guaranteedRarity?: 'rare' | 'epic' | 'legendary'): Item {
  const roll = Math.random();
  const randId = Math.random().toString(36).substring(2, 9);
  
  // Decide rarity
  let rarity: 'common' | 'rare' | 'epic' | 'legendary' = 'common';
  if (guaranteedRarity) {
    rarity = guaranteedRarity;
  } else if (roll > 0.94 + Math.max(0, (20 - depth) * 0.002)) {
    rarity = 'legendary';
  } else if (roll > 0.82) {
    rarity = 'epic';
  } else if (roll > 0.55) {
    rarity = 'rare';
  }

  const multiplier = 1 + depth * 0.2;
  const rarityMult = rarity === 'legendary' ? 2.5 : rarity === 'epic' ? 1.8 : rarity === 'rare' ? 1.4 : 1.0;

  // Decide type
  const typeRoll = Math.random();
  if (typeRoll < 0.28) {
    // Potion
    const pType = Math.random();
    if (pType < 0.55) {
      const heal = Math.round(30 * multiplier);
      return {
        id: `pot_heal_${randId}`,
        name: `Poción de Vida (+${heal})`,
        type: 'potion',
        rarity: 'common',
        icon: 'potion',
        iconKey: 'potion_heal',
        description: `Restaura ${heal} puntos de salud al instante.`,
        healAmount: heal,
        value: Math.round(15 * multiplier),
        effect: 'heal',
      };
    } else if (pType < 0.85) {
      const mana = Math.round(25 * multiplier);
      return {
        id: `pot_mana_${randId}`,
        name: `Elixir de Maná (+${mana})`,
        type: 'potion',
        rarity: 'common',
        icon: 'potion',
        iconKey: 'potion_mana',
        description: `Restaura ${mana} puntos de maná.`,
        mpRestoreAmount: mana,
        value: Math.round(15 * multiplier),
        effect: 'restore_mp',
      };
    } else {
      return {
        id: `pot_str_${randId}`,
        name: 'Poción de Fuerza Titánica',
        type: 'potion',
        rarity: 'rare',
        icon: 'potion',
        iconKey: 'potion_str',
        description: 'Otorga fuerza destructiva temporalmente.',
        value: Math.round(30 * multiplier),
        effect: 'strength_buff',
      };
    }
  } else if (typeRoll < 0.45) {
    // Scroll
    const sType = Math.random();
    if (sType < 0.5) {
      return {
        id: `scroll_teleport_${randId}`,
        name: 'Pergamino de Escape',
        type: 'scroll',
        rarity: 'rare',
        icon: 'scroll',
        iconKey: 'scroll_teleport',
        description: 'Te teletransporta a un lugar seguro de la mazmorra.',
        value: Math.round(25 * multiplier),
        effect: 'teleport',
      };
    } else {
      return {
        id: `scroll_map_${randId}`,
        name: 'Pergamino de Cartografía',
        type: 'scroll',
        rarity: 'rare',
        icon: 'scroll',
        iconKey: 'scroll_map',
        description: 'Revela toda la estructura del piso actual en la niebla.',
        value: Math.round(35 * multiplier),
        effect: 'reveal_map',
      };
    }
  } else if (typeRoll < 0.72) {
    // Modular Procedural Weapon!
    return generateProceduralWeapon(depth, rarity);
  } else if (typeRoll < 0.90) {
    // Armor
    const armors = [
      { name: 'Cota de Malla', baseDef: 3, hp: 15, iconKey: 'chainmail' },
      { name: 'Armadura de Placas', baseDef: 6, hp: 30, iconKey: 'plate' },
      { name: 'Túnica Encantada', baseDef: 2, hp: 10, mpBonus: 25, iconKey: 'robe' },
      { name: 'Capa de Acechador', baseDef: 4, hp: 12, visionBonus: 1, iconKey: 'cloak' },
    ];
    const picked = armors[Math.floor(Math.random() * armors.length)];
    const def = Math.round(picked.baseDef * multiplier * rarityMult);
    const hp = Math.round(picked.hp * multiplier * rarityMult);

    return {
      id: `arm_${randId}`,
      name: `${picked.name} [${rarity.toUpperCase()}]`,
      type: 'armor',
      rarity,
      icon: 'shield',
      iconKey: picked.iconKey,
      description: `Protección resistente. Otorga +${def} DEF y +${hp} Salud Máxima.`,
      defBonus: def,
      hpBonus: hp,
      mpBonus: picked.mpBonus ? Math.round(picked.mpBonus * rarityMult) : undefined,
      visionBonus: picked.visionBonus,
      value: Math.round(35 * multiplier * rarityMult),
    };
  } else {
    // Ring / Relic
    const rings = [
      { name: 'Anillo de Sangre', hp: 25, atk: 3, iconKey: 'ring' },
      { name: 'Anillo del Búho', visionBonus: 2, crit: 8, iconKey: 'eye' },
      { name: 'Amuleto del Místico', mpBonus: 30, atk: 4, iconKey: 'amulet' },
      { name: 'Sortija de Protección', defBonus: 5, hp: 20, iconKey: 'gem' },
    ];
    const picked = rings[Math.floor(Math.random() * rings.length)];
    return {
      id: `ring_${randId}`,
      name: `${picked.name} [${rarity.toUpperCase()}]`,
      type: 'ring',
      rarity,
      icon: 'gem',
      iconKey: picked.iconKey,
      description: 'Joya ancestral imbuida con magia arcana.',
      hpBonus: picked.hp ? Math.round(picked.hp * rarityMult) : undefined,
      mpBonus: picked.mpBonus ? Math.round(picked.mpBonus * rarityMult) : undefined,
      atkBonus: picked.atk ? Math.round(picked.atk * rarityMult) : undefined,
      defBonus: picked.defBonus ? Math.round(picked.defBonus * rarityMult) : undefined,
      visionBonus: picked.visionBonus,
      critBonus: picked.crit ? Math.round(picked.crit * rarityMult) : undefined,
      value: Math.round(50 * multiplier * rarityMult),
    };
  }
}

export function generateDungeonFloor(depth: number): {
  dungeon: DungeonMap;
  playerStartPos: Position;
} {
  const width = 36;
  const height = 36;

  // Initialize grid with solid walls
  const tiles: TileType[][] = Array.from({ length: height }, () => 
    Array.from({ length: width }, () => 'wall' as TileType)
  );
  const visibility: VisibilityState[][] = Array.from({ length: height }, () =>
    Array.from({ length: width }, () => VisibilityState.UNEXPLORED)
  );

  const rooms: Room[] = [];
  const maxRooms = 12;
  const minRoomSize = 5;
  const maxRoomSize = 9;

  // Generate non-overlapping rooms
  for (let r = 0; r < 40 && rooms.length < maxRooms; r++) {
    const w = Math.floor(Math.random() * (maxRoomSize - minRoomSize + 1)) + minRoomSize;
    const h = Math.floor(Math.random() * (maxRoomSize - minRoomSize + 1)) + minRoomSize;
    const x = Math.floor(Math.random() * (width - w - 2)) + 1;
    const y = Math.floor(Math.random() * (height - h - 2)) + 1;

    // Check collision with existing rooms (with 1 tile padding)
    let overlaps = false;
    for (const other of rooms) {
      if (
        x <= other.x + other.w + 1 &&
        x + w + 1 >= other.x &&
        y <= other.y + other.h + 1 &&
        y + h + 1 >= other.y
      ) {
        overlaps = true;
        break;
      }
    }

    if (!overlaps) {
      const theme = getDungeonTheme(depth);
      // Determine room tile theme based on depth and biome
      let roomType: 'stone' | 'wood' | 'water' | 'lava' | 'acid' | 'ice' | 'necropolis' | 'void' = 'stone';
      const rRoll = Math.random();

      if (rooms.length === 0) {
        // First room (Player spawn) is always classic stone floor
        roomType = 'stone';
      } else if (rooms.length === 1 && depth % 3 === 0) {
        // Merchant room on floors 3, 6, 9... has warm wood floor!
        roomType = 'wood';
      } else if (theme.biomeId === 'crypt' && rRoll < 0.45) {
        roomType = 'acid';
      } else if (theme.biomeId === 'glacier' && rRoll < 0.5) {
        roomType = 'ice';
      } else if (theme.biomeId === 'magma' && rRoll < 0.4) {
        roomType = 'lava';
      } else if (theme.biomeId === 'necropolis' && rRoll < 0.35) {
        roomType = 'necropolis';
      } else if (theme.biomeId === 'sunken' && rRoll < 0.45) {
        roomType = 'water';
      } else if ((theme.biomeId === 'void' || theme.biomeId === 'celestial') && rRoll < 0.4) {
        roomType = 'void';
      } else if (rRoll < 0.25) {
        roomType = 'wood';
      }

      // Carve room based on its type
      for (let ry = y; ry < y + h; ry++) {
        for (let rx = x; rx < x + w; rx++) {
          if (roomType === 'wood') {
            tiles[ry][rx] = 'wood';
          } else if (roomType === 'ice') {
            // Central ice pond
            const isBorder = ry === y || ry === y + h - 1 || rx === x || rx === x + w - 1;
            tiles[ry][rx] = isBorder ? 'floor' : 'ice';
          } else if (roomType === 'acid') {
            // Toxic pool in the center
            const isBorder = ry <= y + 1 || ry >= y + h - 2 || rx <= x + 1 || rx >= x + w - 2;
            tiles[ry][rx] = isBorder ? 'floor' : 'acid';
          } else if (roomType === 'water') {
            // Pool in the middle with a bridge across
            const isBorder = ry === y || ry === y + h - 1 || rx === x || rx === x + w - 1;
            const isMidY = ry === Math.floor(y + h / 2);
            if (isBorder) {
              tiles[ry][rx] = 'floor';
            } else if (isMidY) {
              // Wooden bridge crossing the pond
              tiles[ry][rx] = 'bridge';
            } else {
              tiles[ry][rx] = 'water';
            }
          } else if (roomType === 'lava') {
            // Lava in central spot with stone bridge
            const isBorder = ry <= y + 1 || ry >= y + h - 2 || rx <= x + 1 || rx >= x + w - 2;
            const isMidX = rx === Math.floor(x + w / 2);
            if (isBorder || isMidX) {
              tiles[ry][rx] = 'floor';
            } else {
              tiles[ry][rx] = 'lava';
            }
          } else {
            tiles[ry][rx] = 'floor';
          }
        }
      }

      rooms.push({
        x,
        y,
        w,
        h,
        centerX: Math.floor(x + w / 2),
        centerY: Math.floor(y + h / 2),
        roomType,
      });
    }
  }

  // Fallback if not enough rooms
  if (rooms.length < 3) {
    const w = 6, h = 6, x = 3, y = 3;
    for (let ry = y; ry < y + h; ry++) {
      for (let rx = x; rx < x + w; rx++) tiles[ry][rx] = 'floor';
    }
    rooms.push({ x, y, w, h, centerX: 6, centerY: 6, roomType: 'stone' });
  }

  // Connect rooms with corridors (always stone floor)
  for (let i = 0; i < rooms.length - 1; i++) {
    const roomA = rooms[i];
    const roomB = rooms[i + 1];

    let currX = roomA.centerX;
    let currY = roomA.centerY;

    while (currX !== roomB.centerX) {
      if (tiles[currY][currX] === 'wall') tiles[currY][currX] = 'floor';
      currX += currX < roomB.centerX ? 1 : -1;
    }
    while (currY !== roomB.centerY) {
      if (tiles[currY][currX] === 'wall') tiles[currY][currX] = 'floor';
      currY += currY < roomB.centerY ? 1 : -1;
    }
  }

  // Additional loop corridor
  if (rooms.length >= 4) {
    const roomFirst = rooms[0];
    const roomLast = rooms[rooms.length - 1];
    let cx = roomFirst.centerX;
    let cy = roomFirst.centerY;
    while (cx !== roomLast.centerX) {
      if (tiles[cy][cx] === 'wall') tiles[cy][cx] = 'floor';
      cx += cx < roomLast.centerX ? 1 : -1;
    }
    while (cy !== roomLast.centerY) {
      if (tiles[cy][cx] === 'wall') tiles[cy][cx] = 'floor';
      cy += cy < roomLast.centerY ? 1 : -1;
    }
  }

  // Player starts in room 0
  const playerStartPos: Position = {
    x: rooms[0].centerX,
    y: rooms[0].centerY,
  };
  tiles[playerStartPos.y][playerStartPos.x] = 'floor';

  // Stairs down placed in the furthest room
  const lastRoom = rooms[rooms.length - 1];
  const stairsDownPos: Position = {
    x: lastRoom.centerX,
    y: lastRoom.centerY,
  };
  tiles[stairsDownPos.y][stairsDownPos.x] = 'stairs_down';

  // Items map
  const items = new Map<string, Item>();
  const monsters: Monster[] = [];

  const theme = getDungeonTheme(depth);
  const floorAffix = getFloorAffix(depth);

  // 1. Procedural Boss Spawning
  // Guaranteed Boss every 5 floors (Floor 5, 10, 15, 20, 25, 30, 35...)
  const isMilestoneBossFloor = depth % 5 === 0;
  if (isMilestoneBossFloor) {
    const boss = generateProceduralBoss(depth, true);
    boss.x = lastRoom.centerX + 1 < width && tiles[lastRoom.centerY][lastRoom.centerX + 1] !== 'wall' ? lastRoom.centerX + 1 : lastRoom.centerX;
    boss.y = lastRoom.centerY - 1 >= 0 && tiles[lastRoom.centerY - 1][lastRoom.centerX] !== 'wall' ? lastRoom.centerY - 1 : lastRoom.centerY;
    monsters.push(boss);
  } else if (depth >= 3 && Math.random() < 0.20) {
    // 20% chance for a rogue Mini-Boss in a deep chamber!
    const miniBoss = generateProceduralBoss(depth, false);
    const targetRoom = rooms[Math.min(rooms.length - 1, Math.floor(rooms.length * 0.7))];
    miniBoss.x = targetRoom.centerX;
    miniBoss.y = targetRoom.centerY;
    monsters.push(miniBoss);
  }

  // Populate other rooms with monsters, chests, barrels, shrines, traps, merchants
  const availableMonsters = MONSTER_TEMPLATES.filter(m => depth >= m.minDepth);

  const isWalkableTile = (t: TileType) => 
    t === 'floor' || t === 'wood' || t === 'bridge' || t === 'water' || t === 'ice' || t === 'acid' || t === 'web';

  rooms.forEach((room, roomIdx) => {
    // Skip player start room for monsters
    if (roomIdx !== 0) {
      // Monsters in room (1 to 3 depending on depth and floor affix)
      const affixBonus = floorAffix.id === 'monster_nest' ? 2 : 0;
      const monsterCount = Math.min(5, Math.floor(Math.random() * (1 + depth * 0.22)) + 1 + affixBonus);
      for (let m = 0; m < monsterCount; m++) {
        const mx = room.x + 1 + Math.floor(Math.random() * (room.w - 2));
        const my = room.y + 1 + Math.floor(Math.random() * (room.h - 2));

        if (
          isWalkableTile(tiles[my][mx]) &&
          !(mx === stairsDownPos.x && my === stairsDownPos.y) &&
          !monsters.some(mon => mon.x === mx && mon.y === my)
        ) {
          const tmpl = availableMonsters[Math.floor(Math.random() * availableMonsters.length)] || MONSTER_TEMPLATES[0];
          const scale = 1 + (depth - tmpl.minDepth) * 0.12;
          const hp = Math.round(tmpl.baseHp * scale);

          monsters.push({
            id: `mob_${roomIdx}_${m}_${depth}`,
            name: tmpl.name,
            symbol: tmpl.symbol,
            monsterType: tmpl.monsterType,
            x: mx,
            y: my,
            hp,
            maxHp: hp,
            atk: Math.round(tmpl.baseAtk * scale * (floorAffix.id === 'blood_moon' ? 1.2 : 1)),
            def: Math.round(tmpl.baseDef * scale),
            expValue: Math.round(tmpl.exp * scale * (floorAffix.id === 'monster_nest' ? 2 : 1)),
            color: tmpl.color,
            tier: 1,
          });
        }
      }

      // Chests (higher chance with abundance affix)
      const chestChance = floorAffix.id === 'abundance' ? 0.7 : 0.42;
      if (Math.random() < chestChance) {
        const cx = room.x + Math.floor(Math.random() * room.w);
        const cy = room.y + Math.floor(Math.random() * room.h);
        if (isWalkableTile(tiles[cy][cx]) && !(cx === stairsDownPos.x && cy === stairsDownPos.y)) {
          tiles[cy][cx] = 'chest';
        }
      }

      // Breakable barrels (regular vs explosive)
      if (Math.random() < 0.5) {
        const bx = room.x + Math.floor(Math.random() * room.w);
        const by = room.y + Math.floor(Math.random() * room.h);
        if (isWalkableTile(tiles[by][bx]) && !(bx === stairsDownPos.x && by === stairsDownPos.y)) {
          // In magma biome or 25% chance deeper: explosive barrel!
          if (theme.biomeId === 'magma' || (depth >= 5 && Math.random() < 0.3)) {
            tiles[by][bx] = 'barrel_explosive';
          } else {
            tiles[by][bx] = 'barrel';
          }
        }
      }

      // Shrines & Altars
      if (Math.random() < (floorAffix.id === 'sanctuary' ? 0.6 : 0.28)) {
        const sx = room.x + Math.floor(Math.random() * room.w);
        const sy = room.y + Math.floor(Math.random() * room.h);
        if (isWalkableTile(tiles[sy][sx]) && !(sx === stairsDownPos.x && sy === stairsDownPos.y)) {
          if (theme.biomeId === 'necropolis' || (depth >= 6 && Math.random() < 0.35)) {
            tiles[sy][sx] = 'shrine_blood';
          } else if (theme.biomeId === 'void' || theme.biomeId === 'celestial' || Math.random() < 0.2) {
            tiles[sy][sx] = 'obelisk';
          } else {
            tiles[sy][sx] = 'shrine';
          }
        }
      }

      // Traps (30% chance)
      if (Math.random() < 0.28) {
        const tx = room.x + Math.floor(Math.random() * room.w);
        const ty = room.y + Math.floor(Math.random() * room.h);
        if (isWalkableTile(tiles[ty][tx]) && !(tx === stairsDownPos.x && ty === stairsDownPos.y)) {
          tiles[ty][tx] = 'trap';
        }
      }

      // Spiderwebs in crypts
      if (theme.biomeId === 'crypt' && Math.random() < 0.4) {
        const wx = room.x + Math.floor(Math.random() * room.w);
        const wy = room.y + Math.floor(Math.random() * room.h);
        if (tiles[wy][wx] === 'floor' && !(wx === stairsDownPos.x && wy === stairsDownPos.y)) {
          tiles[wy][wx] = 'web';
        }
      }

      // Spawn wandering merchant on floor 3, 6, 9... or abundance affix or 10% chance
      if ((depth % 3 === 0 && roomIdx === 1) || floorAffix.id === 'abundance' || (depth > 2 && Math.random() < 0.1)) {
        const mx = room.centerX;
        const my = room.centerY;
        if (isWalkableTile(tiles[my][mx]) && !(mx === stairsDownPos.x && my === stairsDownPos.y)) {
          tiles[my][mx] = 'merchant';
        }
      }

      // Loose ground loot (weapons, potions, gold)
      if (Math.random() < 0.4) {
        const ix = room.x + Math.floor(Math.random() * room.w);
        const iy = room.y + Math.floor(Math.random() * room.h);
        if (isWalkableTile(tiles[iy][ix]) && !items.has(`${ix},${iy}`)) {
          items.set(`${ix},${iy}`, generateLootItem(depth));
        }
      }
    }
  });

  // Secret cracked wall alcove (45% chance per floor)
  if (rooms.length >= 3 && Math.random() < 0.45) {
    const r = rooms[1];
    const wallX = r.x + r.w;
    const wallY = r.centerY;
    if (wallX + 1 < width - 1 && tiles[wallY][wallX] === 'wall' && tiles[wallY][wallX + 1] === 'wall') {
      tiles[wallY][wallX] = 'cracked_wall';
      tiles[wallY][wallX + 1] = 'floor';
      items.set(`${wallX + 1},${wallY}`, generateLootItem(depth, 'epic'));
    }
  }

  return {
    dungeon: {
      width,
      height,
      tiles,
      visibility,
      items,
      monsters,
      stairsDownPos,
      themeName: theme.name,
      themeColor: theme.color,
      floorAffix,
    },
    playerStartPos,
  };
}
