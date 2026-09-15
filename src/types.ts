export type TileType = 
  | 'wall' 
  | 'floor' 
  | 'wood'
  | 'water'
  | 'bridge'
  | 'lava'
  | 'acid'
  | 'ice'
  | 'web'
  | 'barrel_explosive'
  | 'cracked_wall'
  | 'shrine_blood'
  | 'obelisk'
  | 'stairs_down' 
  | 'chest' 
  | 'chest_open' 
  | 'door_closed' 
  | 'door_open' 
  | 'shrine' 
  | 'trap' 
  | 'barrel' 
  | 'merchant';

export enum VisibilityState {
  UNEXPLORED = 0,
  EXPLORED = 1,
  VISIBLE = 2,
}

export type PlayerClassId = 'warrior' | 'mage' | 'rogue';

export interface PlayerClassConfig {
  id: PlayerClassId;
  name: string;
  title: string;
  description: string;
  icon: string;
  baseHp: number;
  baseMp: number;
  baseAtk: number;
  baseDef: number;
  baseCrit: number;
  visionRadius: number;
  skillName: string;
  skillDescription: string;
  skillCooldown: number;
  skillCostMp: number;
}

export type ItemType = 'weapon' | 'armor' | 'ring' | 'potion' | 'scroll' | 'gold';
export type ItemRarity = 'common' | 'rare' | 'epic' | 'legendary';

export type WeaponArchetype = 'sword' | 'staff' | 'dagger' | 'axe' | 'spear' | 'hammer';
export type WeaponBladeShape =
  | 'straight'
  | 'serrated'
  | 'curved'
  | 'flamberge'
  | 'broad'
  | 'crystal'
  | 'double_axe'
  | 'halberd'
  | 'trident'
  | 'spiked_mace';
export type WeaponGuardShape =
  | 'cross'
  | 'winged'
  | 'curved_horns'
  | 'round_plate'
  | 'runic_disc'
  | 'skull'
  | 'minimal';
export type WeaponGripType =
  | 'leather'
  | 'gold_wrap'
  | 'dark_wood'
  | 'bone'
  | 'iron_band'
  | 'cloth_crimson';
export type WeaponPommelType =
  | 'gem'
  | 'skull'
  | 'crescent'
  | 'spike'
  | 'sphere'
  | 'ring';
export type WeaponElement =
  | 'physical'
  | 'fire'
  | 'ice'
  | 'lightning'
  | 'void'
  | 'holy'
  | 'poison';

export interface WeaponModularParts {
  archetype: WeaponArchetype;
  bladeShape: WeaponBladeShape;
  guardShape: WeaponGuardShape;
  gripType: WeaponGripType;
  pommelShape: WeaponPommelType;
  element: WeaponElement;
  // Color palette
  bladeColor: string;
  bladeHighlight: string;
  guardColor: string;
  gripColor: string;
  pommelColor: string;
  elementColor: string;
  glowColor?: string;
  hasGlow: boolean;
  glowRadius: number;
  // Sizing & proportion modifiers
  bladeLength: number;
  bladeWidth: number;
  guardWidth: number;
  gripLength: number;
}

export interface Item {
  id: string;
  name: string;
  type: ItemType;
  rarity: ItemRarity;
  icon: string;
  iconKey?: string;
  description: string;
  value: number; // gold value
  atkBonus?: number;
  defBonus?: number;
  hpBonus?: number;
  mpBonus?: number;
  critBonus?: number;
  visionBonus?: number;
  range?: number; // 1 for normal melee, 2 for polearm/spear
  healAmount?: number;
  mpRestoreAmount?: number;
  effect?: 'heal' | 'restore_mp' | 'teleport' | 'reveal_map' | 'strength_buff' | 'invulnerability';
  weaponParts?: WeaponModularParts;
}

export interface FloatingText {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  createdAt: number;
}

export interface Position {
  x: number;
  y: number;
}

export interface Monster {
  id: string;
  name: string;
  symbol: string;
  monsterType?: string;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  atk: number;
  def: number;
  expValue: number;
  color: string;
  isBoss?: boolean;
  tier: number;
  stunnedTurns?: number;
  bossData?: any; // ProceduralBossData
}

export interface PlayerStats {
  level: number;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  atk: number;
  def: number;
  critChance: number; // percentage, e.g. 15 = 15%
  visionRadius: number;
  exp: number;
  nextLevelExp: number;
  gold: number;
  depth: number;
  kills: number;
  skillCooldownLeft: number;
}

export interface Equipment {
  weapon: Item | null;
  armor: Item | null;
  ring: Item | null;
}

export interface FloorAffix {
  id: string;
  name: string;
  description: string;
  badgeColor: string;
}

export interface DungeonMap {
  width: number;
  height: number;
  tiles: TileType[][];
  visibility: VisibilityState[][];
  items: Map<string, Item>; // key: `${x},${y}`
  monsters: Monster[];
  stairsDownPos: Position;
  themeName: string;
  themeColor: string;
  floorAffix?: FloorAffix;
  bossTelegraphTiles?: Position[];
}

export interface CombatLogMessage {
  id: string;
  text: string;
  type: 'info' | 'combat' | 'crit' | 'danger' | 'loot' | 'level' | 'shrine';
  timestamp: number;
}

export interface RunHistoryRecord {
  id: string;
  date: string;
  playerClass: string;
  depthReached: number;
  levelReached: number;
  goldCollected: number;
  monstersSlain: number;
  deathCause: string;
}
