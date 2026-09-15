import { Monster, Position } from '../types';
import { generateProceduralWeapon } from './proceduralWeapons';

export type BossArchetype = 
  | 'colossus' 
  | 'demon' 
  | 'lich' 
  | 'hydra' 
  | 'void_herald' 
  | 'frost_titan' 
  | 'corrupted_knight';

export type BossElement = 'fire' | 'ice' | 'lightning' | 'void' | 'poison' | 'blood';

export interface BossSpecialAbility {
  name: string;
  description: string;
  type: 'telegraph_aoe' | 'summon_minions' | 'elemental_burn' | 'life_drain';
  cooldownTurns: number;
}

export interface ProceduralBossData {
  title: string;
  epithet: string;
  archetype: BossArchetype;
  element: BossElement;
  primaryColor: string;
  accentColor: string;
  ability: BossSpecialAbility;
  phase: 1 | 2;
  hasEnraged: boolean;
  telegraphedTiles: Position[];
}

const BOSS_NAME_PREFIXES = [
  'Malakor', 'Gorzath', 'Valxir', 'Thalor', 'Xul’Krag', 
  'Azgash', 'Mortis', 'Kael’Thas', 'Ignis', 'Vorvath', 
  'Sylith', 'Dravok', 'Nyxath', 'Baelor', 'Vorgar',
  'Zephyros', 'Ragnor', 'Morgath', 'Oblivion', 'Kalyth'
];

const BOSS_EPITHETS: Record<BossElement, string[]> = {
  fire: [
    'el Señor del Magma',
    'el Azote de las Cenizas',
    'la Llama Eterna',
    'el Forjador del Purgatorio',
    'el Dragón de Fuego'
  ],
  ice: [
    'el Rey de la Escarcha',
    'el Titán Glacial',
    'la Ventisca Sin Fin',
    'el Espectro del Cero Absoluto',
    'el Corazón Gélido'
  ],
  lightning: [
    'la Ira de la Tempestad',
    'el Heraldo del Trueno',
    'el Fulgor Celestial',
    'el Destructor del Rayo',
    'la Chispa Primordial'
  ],
  void: [
    'el Devorador de Almas',
    'el Hereje del Vacío',
    'la Sombra Infinita',
    'el Ojo del Abismo',
    'el Caminante de la Nada'
  ],
  poison: [
    'la Reina de la Podredumbre',
    'el Azote Ponzoñoso',
    'la Peste Subterránea',
    'el Tumor de la Cripta',
    'el Envenenador Arcano'
  ],
  blood: [
    'el Verdugo Carmesí',
    'el Señor de la Sangre',
    'el Desgarrador de Carne',
    'el Vampiro Ancestral',
    'el Segador de Vidas'
  ]
};

const ELEMENT_COLORS: Record<BossElement, { primary: string; accent: string }> = {
  fire: { primary: '#dc2626', accent: '#f97316' },
  ice: { primary: '#0284c7', accent: '#38bdf8' },
  lightning: { primary: '#eab308', accent: '#fef08a' },
  void: { primary: '#7e22ce', accent: '#c084fc' },
  poison: { primary: '#15803d', accent: '#4ade80' },
  blood: { primary: '#991b1b', accent: '#f43f5e' }
};

const ARCHETYPES: BossArchetype[] = [
  'colossus',
  'demon',
  'lich',
  'hydra',
  'void_herald',
  'frost_titan',
  'corrupted_knight'
];

/**
 * Generates a completely procedural Boss with unique traits, visuals, and powers.
 */
export function generateProceduralBoss(depth: number, isMilestoneGuardian: boolean = true): Monster {
  const prefix = BOSS_NAME_PREFIXES[Math.floor(Math.random() * BOSS_NAME_PREFIXES.length)];
  
  // Element selection based on depth or random
  const elements: BossElement[] = ['fire', 'ice', 'lightning', 'void', 'poison', 'blood'];
  const element = elements[Math.floor(Math.random() * elements.length)];
  const epithets = BOSS_EPITHETS[element];
  const epithet = epithets[Math.floor(Math.random() * epithets.length)];
  const fullName = `${prefix}, ${epithet}`;

  const archetype = ARCHETYPES[Math.floor(Math.random() * ARCHETYPES.length)];
  const colors = ELEMENT_COLORS[element];

  // Base stats scaling
  const scale = 1 + depth * 0.22;
  const hp = Math.round((isMilestoneGuardian ? 200 : 120) * scale);
  const atk = Math.round((isMilestoneGuardian ? 18 : 12) * scale);
  const def = Math.round((isMilestoneGuardian ? 6 : 4) * (1 + depth * 0.08));
  const expValue = Math.round((isMilestoneGuardian ? 400 : 200) * scale);

  const ability: BossSpecialAbility = {
    name: element === 'fire' ? 'Nova de Llamas' : element === 'ice' ? 'Ventisca Gélida' : 'Explosión de Energía',
    description: 'Carga un cataclismo en un área de 3x3.',
    type: 'telegraph_aoe',
    cooldownTurns: 3,
  };

  const bossData: ProceduralBossData = {
    title: prefix,
    epithet,
    archetype,
    element,
    primaryColor: colors.primary,
    accentColor: colors.accent,
    ability,
    phase: 1,
    hasEnraged: false,
    telegraphedTiles: []
  };

  return {
    id: `boss_proc_${depth}_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    name: fullName,
    symbol: '★B',
    monsterType: `proc_boss_${archetype}_${element}`,
    x: 0,
    y: 0,
    hp,
    maxHp: hp,
    atk,
    def,
    expValue,
    color: colors.primary,
    isBoss: true,
    tier: Math.max(1, Math.floor(depth / 4) + 1),
    bossData
  };
}
