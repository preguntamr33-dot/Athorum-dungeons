import {
  Item,
  ItemRarity,
  WeaponArchetype,
  WeaponBladeShape,
  WeaponElement,
  WeaponGripType,
  WeaponGuardShape,
  WeaponModularParts,
  WeaponPommelType,
} from '../types';

// =======================================================
// PROCEDURAL WEAPON GENERATOR & CANVAS RENDERER
// Generates modular fantasy weapons with coherent parts,
// custom palettes, elemental auras, and procedural names.
// =======================================================

// Color palettes per element
const ELEMENT_PALETTES: Record<
  WeaponElement,
  {
    blade: string;
    bladeHighlight: string;
    guard: string;
    grip: string;
    pommel: string;
    element: string;
    glow: string;
  }
> = {
  physical: {
    blade: '#e2e8f0', // Cold forged steel
    bladeHighlight: '#f8fafc',
    guard: '#d97706', // Burnished bronze
    grip: '#78350f', // Leather
    pommel: '#b45309',
    element: '#94a3b8',
    glow: 'rgba(203, 213, 225, 0.35)',
  },
  fire: {
    blade: '#ea580c', // Molten ember
    bladeHighlight: '#fef08a',
    guard: '#7c2d12', // Obsidian / scorched brass
    grip: '#451a03',
    pommel: '#dc2626',
    element: '#ef4444',
    glow: 'rgba(239, 68, 68, 0.7)',
  },
  ice: {
    blade: '#38bdf8', // Glacial crystal
    bladeHighlight: '#ffffff',
    guard: '#0369a1', // Deep arctic steel
    grip: '#0c4a6e',
    pommel: '#7dd3fc',
    element: '#0284c7',
    glow: 'rgba(56, 189, 248, 0.7)',
  },
  lightning: {
    blade: '#facc15', // Storm-charged gold
    bladeHighlight: '#ffffff',
    guard: '#854d0e',
    grip: '#1e293b',
    pommel: '#eab308',
    element: '#38bdf8',
    glow: 'rgba(250, 204, 21, 0.75)',
  },
  void: {
    blade: '#475569', // Dark abyssal slate
    bladeHighlight: '#c084fc',
    guard: '#1e1b4b', // Cosmic midnight
    grip: '#0f172a',
    pommel: '#9333ea',
    element: '#a855f7',
    glow: 'rgba(168, 85, 247, 0.75)',
  },
  holy: {
    blade: '#fef08a', // Celestial silver-gold
    bladeHighlight: '#ffffff',
    guard: '#eab308', // Gilded gold
    grip: '#78350f',
    pommel: '#fbbf24',
    element: '#fde047',
    glow: 'rgba(251, 191, 36, 0.8)',
  },
  poison: {
    blade: '#15803d', // Venom-steeped alloy
    bladeHighlight: '#86efac',
    guard: '#14532d',
    grip: '#052e16',
    pommel: '#22c55e',
    element: '#4ade80',
    glow: 'rgba(34, 197, 94, 0.75)',
  },
};

// Spanish procedural naming dictionaries
const ELEMENT_PREFIXES: Record<WeaponElement, string[]> = {
  physical: ['Pura', 'Afilada', 'Templada', 'Pesada', 'Dentada', 'Equilibrada', 'Veterana', 'Impecable'],
  fire: ['Flamígera', 'Ígnea', 'Ardiente', 'Volcánica', 'Solar', 'Carmesí', 'del Magma', 'Infernal'],
  ice: ['Glacial', 'Céleste', 'Polar', 'de Escarcha', 'Ártica', 'Gélida', 'Invernal', 'Prismática'],
  lightning: ['Tempestuosa', 'Relampagueante', 'Eléctrica', 'del Trueno', 'Fulgurante', 'Torrencial'],
  void: ['Abisal', 'Sombría', 'del Vacío', 'Astral', 'Oscura', 'Nigromántica', 'Eclíptica', 'Espectral'],
  holy: ['Radiante', 'Sagrada', 'Bendita', 'Solar', 'Purificadora', 'Inmaculada', 'Celestial'],
  poison: ['Venenosa', 'Tóxica', 'Ácida', 'Mortal', 'Pútrida', 'Corrosiva', 'Sepulcral'],
};

const ARCHETYPE_NAMES: Record<WeaponArchetype, string[]> = {
  sword: ['Espada', 'Mandoble', 'Cimitarra', 'Ropera', 'Hoja de Acero', 'Sable'],
  staff: ['Báculo', 'Cetro', 'Vara Arcana', 'Pértiga', 'Bastón', 'Catalizador'],
  dagger: ['Daga', 'Estilete', 'Cuchillo', 'Kris', 'Punzón', 'Hoja Oculta'],
  axe: ['Hacha de Guerra', 'Hacha Barbada', 'Hacha Doble', 'Tajo Feroz', 'Hendedor'],
  spear: ['Lanza', 'Alabarda', 'Tridente', 'Pica', 'Chuzo de Asedio'],
  hammer: ['Martillo de Guerra', 'Maza Pesada', 'Lucero del Alba', 'Mazo Rompehuesos'],
};

const SUFFIX_LORE = [
  'de los Reyes Caídos',
  'del Abismo Eterno',
  'de la Cripta Ancestral',
  'del Titán Olvidado',
  'de las Profundidades',
  'del Fénix Dorado',
  'del Guardián Silencioso',
  'de las Estepas Sombrías',
  'del Dragón Esmeralda',
  'de la Tempestad Oculta',
  'del Ocaso Eterno',
  'de la Victoria Sagrada',
  'de la Luna Llena',
  'del Conquistador',
  'de Sangre y Acero',
];

/**
 * Procedurally generates a modular weapon with guaranteed compatible parts,
 * custom naming, color coordination, and stat distribution.
 */
export function generateProceduralWeapon(
  depth: number,
  rarity?: ItemRarity,
  forcedArchetype?: WeaponArchetype
): Item {
  const randId = Math.random().toString(36).substring(2, 9);

  // 1. Determine Rarity if not forced
  let finalRarity: ItemRarity = rarity || 'common';
  if (!rarity) {
    const roll = Math.random();
    if (roll < 0.55) finalRarity = 'common';
    else if (roll < 0.83) finalRarity = 'rare';
    else if (roll < 0.96) finalRarity = 'epic';
    else finalRarity = 'legendary';
  }

  // 2. Select Archetype
  const archetypes: WeaponArchetype[] = ['sword', 'staff', 'dagger', 'axe', 'spear', 'hammer'];
  const archetype: WeaponArchetype = forcedArchetype || archetypes[Math.floor(Math.random() * archetypes.length)];

  // 3. Select Blade/Head Shape matching archetype seamlessly
  let bladeShape: WeaponBladeShape = 'straight';
  if (archetype === 'sword') {
    const choices: WeaponBladeShape[] = ['straight', 'curved', 'serrated', 'flamberge', 'broad'];
    bladeShape = choices[Math.floor(Math.random() * choices.length)];
  } else if (archetype === 'dagger') {
    const choices: WeaponBladeShape[] = ['straight', 'curved', 'serrated', 'flamberge'];
    bladeShape = choices[Math.floor(Math.random() * choices.length)];
  } else if (archetype === 'staff') {
    bladeShape = 'crystal';
  } else if (archetype === 'axe') {
    const choices: WeaponBladeShape[] = ['broad', 'double_axe', 'halberd'];
    bladeShape = choices[Math.floor(Math.random() * choices.length)];
  } else if (archetype === 'spear') {
    const choices: WeaponBladeShape[] = ['straight', 'halberd', 'trident'];
    bladeShape = choices[Math.floor(Math.random() * choices.length)];
  } else if (archetype === 'hammer') {
    bladeShape = 'spiked_mace';
  }

  // 4. Select Guard Shape
  let guardShape: WeaponGuardShape = 'cross';
  if (archetype === 'staff') {
    guardShape = Math.random() < 0.5 ? 'runic_disc' : 'winged';
  } else if (archetype === 'dagger') {
    guardShape = Math.random() < 0.5 ? 'minimal' : 'curved_horns';
  } else {
    const choices: WeaponGuardShape[] = ['cross', 'winged', 'curved_horns', 'round_plate', 'skull'];
    guardShape = choices[Math.floor(Math.random() * choices.length)];
  }

  // 5. Select Grip & Pommel
  const grips: WeaponGripType[] = ['leather', 'gold_wrap', 'dark_wood', 'bone', 'iron_band', 'cloth_crimson'];
  const gripType = grips[Math.floor(Math.random() * grips.length)];

  const pommels: WeaponPommelType[] = ['gem', 'skull', 'crescent', 'spike', 'sphere', 'ring'];
  const pommelShape = pommels[Math.floor(Math.random() * pommels.length)];

  // 6. Select Element
  let element: WeaponElement = 'physical';
  if (finalRarity !== 'common') {
    const elements: WeaponElement[] = ['fire', 'ice', 'lightning', 'void', 'holy', 'poison'];
    element = elements[Math.floor(Math.random() * elements.length)];
  }

  const palette = ELEMENT_PALETTES[element];
  const hasGlow = finalRarity !== 'common';
  const glowRadius = finalRarity === 'legendary' ? 12 : finalRarity === 'epic' ? 9 : 6;

  // Proportions according to archetype
  let bladeLength = 14;
  let bladeWidth = 4;
  let guardWidth = 10;
  let gripLength = 6;

  if (archetype === 'staff') {
    bladeLength = 8; // staff head
    bladeWidth = 7;
    guardWidth = 6;
    gripLength = 18; // long shaft
  } else if (archetype === 'dagger') {
    bladeLength = 8;
    bladeWidth = 3;
    guardWidth = 6;
    gripLength = 4;
  } else if (archetype === 'axe') {
    bladeLength = 10;
    bladeWidth = 12;
    guardWidth = 5;
    gripLength = 12;
  } else if (archetype === 'spear') {
    bladeLength = 12;
    bladeWidth = 5;
    guardWidth = 6;
    gripLength = 16;
  } else if (archetype === 'hammer') {
    bladeLength = 9;
    bladeWidth = 10;
    guardWidth = 6;
    gripLength = 10;
  }

  const weaponParts: WeaponModularParts = {
    archetype,
    bladeShape,
    guardShape,
    gripType,
    pommelShape,
    element,
    bladeColor: palette.blade,
    bladeHighlight: palette.bladeHighlight,
    guardColor: palette.guard,
    gripColor: palette.grip,
    pommelColor: palette.pommel,
    elementColor: palette.element,
    glowColor: palette.glow,
    hasGlow,
    glowRadius,
    bladeLength,
    bladeWidth,
    guardWidth,
    gripLength,
  };

  // 7. Calculate Stats
  const rarityMult =
    finalRarity === 'legendary' ? 2.5 : finalRarity === 'epic' ? 1.8 : finalRarity === 'rare' ? 1.3 : 1.0;
  const depthMult = 1 + (depth - 1) * 0.22;

  let baseAtk = 6;
  let baseCrit = 5;
  let range = 1;
  let mpBonus = undefined;

  if (archetype === 'sword') {
    baseAtk = 7;
    baseCrit = 6;
  } else if (archetype === 'dagger') {
    baseAtk = 4;
    baseCrit = 16;
  } else if (archetype === 'axe') {
    baseAtk = 9;
    baseCrit = 3;
  } else if (archetype === 'spear') {
    baseAtk = 6;
    baseCrit = 7;
    range = 2; // Polearm extended reach!
  } else if (archetype === 'staff') {
    baseAtk = 6;
    baseCrit = 8;
    mpBonus = Math.round(15 * rarityMult);
  } else if (archetype === 'hammer') {
    baseAtk = 10;
    baseCrit = 2;
  }

  const finalAtk = Math.max(3, Math.round(baseAtk * depthMult * rarityMult));
  const finalCrit = Math.min(60, Math.round(baseCrit * (1 + (rarityMult - 1) * 0.5)));
  const finalValue = Math.round(25 * depthMult * rarityMult);

  // 8. Procedural Name Synthesis
  const prefixList = ELEMENT_PREFIXES[element];
  const prefix = prefixList[Math.floor(Math.random() * prefixList.length)];
  const archNames = ARCHETYPE_NAMES[archetype];
  const archName = archNames[Math.floor(Math.random() * archNames.length)];
  const suffix = SUFFIX_LORE[Math.floor(Math.random() * SUFFIX_LORE.length)];

  const fullName = `${prefix} ${archName} ${suffix}`;

  // Translated part names for description
  const shapeLabels: Record<WeaponBladeShape, string> = {
    straight: 'Hoja recta',
    serrated: 'Hoja dentada de sierra',
    curved: 'Filo curvo oriental',
    flamberge: 'Hoja flamberge ondulada',
    broad: 'Hoja ancha de verdugo',
    crystal: 'Núcleo de cristal arcano',
    double_axe: 'Doble filo de batalla',
    halberd: 'Cuchilla de alabarda',
    trident: 'Tridente de 3 púas',
    spiked_mace: 'Cabezal con púas de hierro',
  };

  const guardLabels: Record<WeaponGuardShape, string> = {
    cross: 'Cruz clásica de acero',
    winged: 'Alas de fénix ascendentes',
    curved_horns: 'Cuernos de dragón curvados',
    round_plate: 'Disco tsuba grabado',
    runic_disc: 'Aro con runas de poder',
    skull: 'Fauce de bestia dorada',
    minimal: 'Guarda oculta aerodinámica',
  };

  const gripLabels: Record<WeaponGripType, string> = {
    leather: 'Cuero trenzado',
    gold_wrap: 'Hilo de oro entrelazado',
    dark_wood: 'Madera de roble oscuro',
    bone: 'Hueso de dragón ancestral',
    iron_band: 'Anillos de hierro forjado',
    cloth_crimson: 'Seda carmesí de asesino',
  };

  const pommelLabels: Record<WeaponPommelType, string> = {
    gem: 'Gema engarzada',
    skull: 'Cráneo tallado',
    crescent: 'Media luna de contrapeso',
    spike: 'Púa perforante',
    sphere: 'Pomo esférico macizo',
    ring: 'Anillo con cinta mística',
  };

  const elementNames: Record<WeaponElement, string> = {
    physical: 'Acero Forjado',
    fire: 'Fuego Ígneo (+Quemadura)',
    ice: 'Hielo Glacial (+Ralentización)',
    lightning: 'Rayo Eléctrico (+Descarga)',
    void: 'Energía Abisal (+Drenaje)',
    holy: 'Luz Sagrada (+Purificación)',
    poison: 'Veneno Letal (+Ácido)',
  };

  const description = `${shapeLabels[bladeShape]} con ${guardLabels[guardShape]}, empuñadura de ${gripLabels[gripType]} y ${pommelLabels[pommelShape]}. Imbuida con ${elementNames[element]}.`;

  return {
    id: `wep_proc_${randId}`,
    name: fullName,
    type: 'weapon',
    rarity: finalRarity,
    icon: archetype,
    iconKey: archetype,
    description,
    value: finalValue,
    atkBonus: finalAtk,
    critBonus: finalCrit,
    mpBonus,
    range,
    weaponParts,
  };
}

/**
 * Draws the assembled procedural modular weapon onto any CanvasRenderingContext2D.
 * Parts snap together perfectly along the central weapon axis.
 */
export function drawProceduralWeapon(
  ctx: CanvasRenderingContext2D,
  parts: WeaponModularParts,
  x: number,
  y: number,
  scale: number = 1,
  angle: number = 0,
  time: number = 0,
  options?: {
    showAura?: boolean;
    isEquipped?: boolean;
  }
) {
  const s = scale;
  const showAura = options?.showAura ?? parts.hasGlow;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);

  // ----------------------------------------------------
  // 1. ELEMENTAL GLOW / AURA (Background under the weapon)
  // ----------------------------------------------------
  if (showAura && parts.hasGlow && parts.glowColor) {
    const pulse = Math.sin(time * 0.006) * 2 * s;
    const auraRad = (parts.glowRadius * s) + pulse;

    // Glowing aura along the blade length
    const auraGrad = ctx.createRadialGradient(0, -parts.bladeLength * 0.5 * s, 1, 0, -parts.bladeLength * 0.5 * s, auraRad * 1.5);
    auraGrad.addColorStop(0, parts.glowColor);
    auraGrad.addColorStop(0.6, parts.glowColor.replace('0.7', '0.25').replace('0.75', '0.25').replace('0.8', '0.3'));
    auraGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = auraGrad;
    ctx.beginPath();
    ctx.arc(0, -parts.bladeLength * 0.5 * s, auraRad * 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Floating elemental ember particles
    for (let p = 0; p < 3; p++) {
      const pOffset = ((time * 0.003 + p * 1.8) % 1) * parts.bladeLength * s;
      const pWobble = Math.sin(time * 0.01 + p * 2) * (parts.bladeWidth * 0.6 * s);
      ctx.fillStyle = parts.bladeHighlight;
      ctx.beginPath();
      ctx.arc(pWobble, -pOffset, 1.2 * s, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ----------------------------------------------------
  // 2. POMMEL / BASE (y = gripLength to gripLength + pommelSize)
  // ----------------------------------------------------
  const gripEndY = parts.gripLength * s;

  ctx.fillStyle = parts.pommelColor;
  ctx.strokeStyle = parts.guardColor;
  ctx.lineWidth = 1 * s;

  switch (parts.pommelShape) {
    case 'gem':
      // Cut jewel pommel
      ctx.beginPath();
      ctx.moveTo(0, gripEndY + 4.5 * s);
      ctx.lineTo(-2.5 * s, gripEndY + 2 * s);
      ctx.lineTo(0, gripEndY);
      ctx.lineTo(2.5 * s, gripEndY + 2 * s);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Jewel glint
      ctx.fillStyle = parts.bladeHighlight;
      ctx.fillRect(-0.8 * s, gripEndY + 1.5 * s, 1.6 * s, 1.2 * s);
      break;

    case 'skull':
      // Mini metal horned skull pommel
      ctx.beginPath();
      ctx.arc(0, gripEndY + 2.5 * s, 2.5 * s, 0, Math.PI * 2);
      ctx.fill();
      // Eye sockets
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-1.2 * s, gripEndY + 2 * s, 0.9 * s, 0.9 * s);
      ctx.fillRect(0.3 * s, gripEndY + 2 * s, 0.9 * s, 0.9 * s);
      break;

    case 'crescent':
      // Inverted crescent moon
      ctx.beginPath();
      ctx.arc(0, gripEndY + 1.5 * s, 3 * s, 0.2 * Math.PI, 0.8 * Math.PI, false);
      ctx.lineTo(0, gripEndY);
      ctx.closePath();
      ctx.fill();
      break;

    case 'spike':
      // Sharp piercing pommel cone
      ctx.beginPath();
      ctx.moveTo(-1.8 * s, gripEndY);
      ctx.lineTo(1.8 * s, gripEndY);
      ctx.lineTo(0, gripEndY + 4.5 * s);
      ctx.closePath();
      ctx.fill();
      break;

    case 'ring':
      // Loop ring with dangling charm
      ctx.lineWidth = 1.2 * s;
      ctx.beginPath();
      ctx.arc(0, gripEndY + 2.5 * s, 2 * s, 0, Math.PI * 2);
      ctx.stroke();
      // Little charm
      ctx.fillStyle = parts.elementColor;
      ctx.fillRect(-0.8 * s, gripEndY + 4.5 * s, 1.6 * s, 2 * s);
      break;

    case 'sphere':
    default:
      // Heavy spherical counterweight
      ctx.beginPath();
      ctx.arc(0, gripEndY + 2 * s, 2.2 * s, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      break;
  }

  // ----------------------------------------------------
  // 3. GRIP / SHAFT (y = 0 to gripLength)
  // ----------------------------------------------------
  const gripW = (parts.archetype === 'staff' || parts.archetype === 'spear' ? 2 : 2.5) * s;
  ctx.fillStyle = parts.gripColor;
  ctx.fillRect(-gripW / 2, 0, gripW, gripEndY);

  // Grip texture & wraps
  if (parts.gripType === 'leather' || parts.gripType === 'cloth_crimson') {
    ctx.strokeStyle = parts.gripType === 'cloth_crimson' ? '#b91c1c' : '#a16207';
    ctx.lineWidth = 0.8 * s;
    for (let gy = 2 * s; gy < gripEndY - 1 * s; gy += 2.5 * s) {
      ctx.beginPath();
      ctx.moveTo(-gripW / 2, gy);
      ctx.lineTo(gripW / 2, gy + 1.5 * s);
      ctx.stroke();
    }
  } else if (parts.gripType === 'gold_wrap' || parts.gripType === 'iron_band') {
    ctx.fillStyle = parts.gripType === 'gold_wrap' ? '#f59e0b' : '#64748b';
    for (let gy = 1.5 * s; gy < gripEndY; gy += 3 * s) {
      ctx.fillRect(-gripW / 2 - 0.4 * s, gy, gripW + 0.8 * s, 0.8 * s);
    }
  } else if (parts.gripType === 'bone') {
    ctx.fillStyle = '#f8fafc';
    for (let gy = 2 * s; gy < gripEndY; gy += 3.5 * s) {
      ctx.beginPath();
      ctx.arc(0, gy, gripW * 0.7, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ----------------------------------------------------
  // 4. GUARD / COLLAR (Centered at y = 0)
  // ----------------------------------------------------
  ctx.fillStyle = parts.guardColor;
  ctx.strokeStyle = parts.bladeHighlight;
  ctx.lineWidth = 0.8 * s;

  const gw = parts.guardWidth * s;

  switch (parts.guardShape) {
    case 'winged':
      // Upswept Phoenix Wings
      ctx.beginPath();
      ctx.moveTo(0, 1.5 * s);
      ctx.quadraticCurveTo(-gw * 0.4, 0, -gw * 0.5, -4 * s);
      ctx.quadraticCurveTo(-gw * 0.25, -2 * s, 0, -0.5 * s);
      ctx.quadraticCurveTo(gw * 0.25, -2 * s, gw * 0.5, -4 * s);
      ctx.quadraticCurveTo(gw * 0.4, 0, 0, 1.5 * s);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;

    case 'curved_horns':
      // Dragon Horns swooping downward
      ctx.beginPath();
      ctx.moveTo(0, -1.5 * s);
      ctx.quadraticCurveTo(-gw * 0.35, -2 * s, -gw * 0.5, 3 * s);
      ctx.lineTo(-gw * 0.35, 1 * s);
      ctx.lineTo(0, 1 * s);
      ctx.lineTo(gw * 0.35, 1 * s);
      ctx.lineTo(gw * 0.5, 3 * s);
      ctx.quadraticCurveTo(gw * 0.35, -2 * s, 0, -1.5 * s);
      ctx.closePath();
      ctx.fill();
      break;

    case 'round_plate':
      // Circular Tsuba guard
      ctx.beginPath();
      ctx.ellipse(0, 0, gw * 0.45, 2.5 * s, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      break;

    case 'runic_disc':
      // Glowing runic disc
      ctx.beginPath();
      ctx.ellipse(0, 0, gw * 0.45, 2.8 * s, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = parts.elementColor;
      ctx.beginPath();
      ctx.arc(-gw * 0.25, 0, 1 * s, 0, Math.PI * 2);
      ctx.arc(gw * 0.25, 0, 1 * s, 0, Math.PI * 2);
      ctx.fill();
      break;

    case 'skull':
      // Dragon or beast mouth collar
      ctx.beginPath();
      ctx.arc(0, 0, 3.5 * s, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(-2 * s, -1 * s, 4 * s, 1.5 * s);
      break;

    case 'minimal':
      // Sleek bolster collar
      ctx.fillRect(-gw * 0.25, -1 * s, gw * 0.5, 2 * s);
      break;

    case 'cross':
    default:
      // Traditional Crossguard
      ctx.beginPath();
      ctx.roundRect(-gw * 0.5, -1.2 * s, gw, 2.4 * s, 1 * s);
      ctx.fill();
      // Quillon ends
      ctx.fillStyle = parts.pommelColor;
      ctx.fillRect(-gw * 0.5 - 0.8 * s, -1.6 * s, 1.2 * s, 3.2 * s);
      ctx.fillRect(gw * 0.5 - 0.4 * s, -1.6 * s, 1.2 * s, 3.2 * s);
      break;
  }

  // ----------------------------------------------------
  // 5. BLADE / HEAD / TIP (y = 0 upwards to -bladeLength)
  // ----------------------------------------------------
  const bl = parts.bladeLength * s;
  const bw = parts.bladeWidth * s;

  ctx.fillStyle = parts.bladeColor;
  ctx.strokeStyle = parts.bladeHighlight;
  ctx.lineWidth = 0.8 * s;

  if (parts.bladeShape === 'straight') {
    // Classic straight blade tapering to spear tip
    ctx.beginPath();
    ctx.moveTo(-bw * 0.5, 0);
    ctx.lineTo(-bw * 0.45, -bl * 0.75);
    ctx.lineTo(0, -bl);
    ctx.lineTo(bw * 0.45, -bl * 0.75);
    ctx.lineTo(bw * 0.5, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Central fuller / groove
    ctx.fillStyle = parts.bladeHighlight;
    ctx.fillRect(-0.5 * s, -bl * 0.7, 1 * s, bl * 0.68);
  } else if (parts.bladeShape === 'curved') {
    // Scimitar / Katana curved razor blade
    ctx.beginPath();
    ctx.moveTo(-bw * 0.4, 0);
    ctx.quadraticCurveTo(-bw * 0.2, -bl * 0.5, bw * 0.6, -bl);
    ctx.quadraticCurveTo(bw * 0.1, -bl * 0.6, bw * 0.2, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Edge shine
    ctx.fillStyle = parts.bladeHighlight;
    ctx.beginPath();
    ctx.moveTo(-bw * 0.3, 0);
    ctx.quadraticCurveTo(-bw * 0.15, -bl * 0.5, bw * 0.5, -bl);
    ctx.stroke();
  } else if (parts.bladeShape === 'serrated') {
    // Sawtooth serrated blade
    ctx.beginPath();
    ctx.moveTo(-bw * 0.5, 0);
    const teeth = 4;
    for (let t = 0; t < teeth; t++) {
      const ty = (-bl / teeth) * (t + 0.5);
      const tyNext = (-bl / teeth) * (t + 1);
      ctx.lineTo(-bw * 0.65, ty);
      ctx.lineTo(-bw * 0.35, tyNext);
    }
    ctx.lineTo(0, -bl);
    for (let t = teeth - 1; t >= 0; t--) {
      const ty = (-bl / teeth) * (t + 1);
      const tyNext = (-bl / teeth) * (t + 0.5);
      ctx.lineTo(bw * 0.35, ty);
      ctx.lineTo(bw * 0.65, tyNext);
    }
    ctx.lineTo(bw * 0.5, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (parts.bladeShape === 'flamberge') {
    // Undulating flame blade
    ctx.beginPath();
    ctx.moveTo(-bw * 0.4, 0);
    ctx.bezierCurveTo(-bw * 0.7, -bl * 0.3, bw * 0.1, -bl * 0.6, 0, -bl);
    ctx.bezierCurveTo(-bw * 0.1, -bl * 0.6, bw * 0.7, -bl * 0.3, bw * 0.4, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (parts.bladeShape === 'broad') {
    // Heavy wide executioner claymore
    ctx.beginPath();
    ctx.moveTo(-bw * 0.6, 0);
    ctx.lineTo(-bw * 0.6, -bl * 0.85);
    ctx.lineTo(0, -bl);
    ctx.lineTo(bw * 0.6, -bl * 0.85);
    ctx.lineTo(bw * 0.6, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Runic symbols down the broad blade
    ctx.fillStyle = parts.elementColor;
    for (let r = 1; r <= 3; r++) {
      ctx.fillRect(-0.8 * s, -bl * 0.25 * r, 1.6 * s, 1.6 * s);
    }
  } else if (parts.bladeShape === 'double_axe') {
    // Dual crescent battle-axe blades on central shaft
    // Central pole extension
    ctx.fillStyle = parts.guardColor;
    ctx.fillRect(-1.2 * s, -bl, 2.4 * s, bl);

    // Left axe crescent
    ctx.fillStyle = parts.bladeColor;
    ctx.beginPath();
    ctx.moveTo(-1 * s, -bl * 0.2);
    ctx.quadraticCurveTo(-bw * 0.9, -bl * 0.6, -1 * s, -bl * 0.95);
    ctx.quadraticCurveTo(-bw * 0.4, -bl * 0.6, -1 * s, -bl * 0.2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Right axe crescent
    ctx.beginPath();
    ctx.moveTo(1 * s, -bl * 0.2);
    ctx.quadraticCurveTo(bw * 0.9, -bl * 0.6, 1 * s, -bl * 0.95);
    ctx.quadraticCurveTo(bw * 0.4, -bl * 0.6, 1 * s, -bl * 0.2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Top spike
    ctx.fillStyle = parts.bladeHighlight;
    ctx.beginPath();
    ctx.moveTo(-1.2 * s, -bl);
    ctx.lineTo(0, -bl - 4 * s);
    ctx.lineTo(1.2 * s, -bl);
    ctx.closePath();
    ctx.fill();
  } else if (parts.bladeShape === 'halberd') {
    // Halberd: thrusting spear top + axe blade on one side + hook on other
    ctx.fillStyle = parts.guardColor;
    ctx.fillRect(-1 * s, -bl, 2 * s, bl);

    // Axe head on left
    ctx.fillStyle = parts.bladeColor;
    ctx.beginPath();
    ctx.moveTo(-1 * s, -bl * 0.35);
    ctx.lineTo(-bw * 0.8, -bl * 0.6);
    ctx.lineTo(-1 * s, -bl * 0.85);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Armor-piercing rear spike
    ctx.beginPath();
    ctx.moveTo(1 * s, -bl * 0.55);
    ctx.lineTo(bw * 0.45, -bl * 0.6);
    ctx.lineTo(1 * s, -bl * 0.65);
    ctx.closePath();
    ctx.fill();

    // Top spearhead
    ctx.beginPath();
    ctx.moveTo(-1.5 * s, -bl);
    ctx.lineTo(0, -bl - 5 * s);
    ctx.lineTo(1.5 * s, -bl);
    ctx.closePath();
    ctx.fill();
  } else if (parts.bladeShape === 'trident') {
    // 3-pronged sea trident
    ctx.fillStyle = parts.guardColor;
    ctx.fillRect(-1 * s, -bl * 0.5, 2 * s, bl * 0.5);

    // Crossbar
    ctx.fillRect(-bw * 0.5, -bl * 0.5, bw, 2 * s);

    // Central spear prong
    ctx.fillStyle = parts.bladeColor;
    ctx.beginPath();
    ctx.moveTo(-1.2 * s, -bl * 0.5);
    ctx.lineTo(0, -bl - 3 * s);
    ctx.lineTo(1.2 * s, -bl * 0.5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Left tine
    ctx.beginPath();
    ctx.moveTo(-bw * 0.5, -bl * 0.5);
    ctx.lineTo(-bw * 0.45, -bl);
    ctx.lineTo(-bw * 0.35, -bl * 0.5);
    ctx.closePath();
    ctx.fill();

    // Right tine
    ctx.beginPath();
    ctx.moveTo(bw * 0.35, -bl * 0.5);
    ctx.lineTo(bw * 0.45, -bl);
    ctx.lineTo(bw * 0.5, -bl * 0.5);
    ctx.closePath();
    ctx.fill();
  } else if (parts.bladeShape === 'spiked_mace') {
    // Warhammer or Spiked Bludgeon
    ctx.fillStyle = parts.guardColor;
    ctx.fillRect(-1.2 * s, -bl * 0.4, 2.4 * s, bl * 0.4);

    // Heavy forged block
    ctx.fillStyle = parts.bladeColor;
    ctx.fillRect(-bw * 0.45, -bl * 0.95, bw * 0.9, bl * 0.55);
    ctx.strokeRect(-bw * 0.45, -bl * 0.95, bw * 0.9, bl * 0.55);

    // Protruding steel spikes
    ctx.fillStyle = parts.bladeHighlight;
    // Left spike
    ctx.beginPath();
    ctx.moveTo(-bw * 0.45, -bl * 0.8);
    ctx.lineTo(-bw * 0.7, -bl * 0.7);
    ctx.lineTo(-bw * 0.45, -bl * 0.6);
    ctx.closePath();
    ctx.fill();
    // Right spike
    ctx.beginPath();
    ctx.moveTo(bw * 0.45, -bl * 0.8);
    ctx.lineTo(bw * 0.7, -bl * 0.7);
    ctx.lineTo(bw * 0.45, -bl * 0.6);
    ctx.closePath();
    ctx.fill();
    // Top spike
    ctx.beginPath();
    ctx.moveTo(-1.5 * s, -bl * 0.95);
    ctx.lineTo(0, -bl - 3 * s);
    ctx.lineTo(1.5 * s, -bl * 0.95);
    ctx.closePath();
    ctx.fill();
  } else if (parts.bladeShape === 'crystal') {
    // Arcane Staff / Wand Head with floating glowing crystal orb
    const staffTopY = -bl * 0.6;
    ctx.fillStyle = parts.guardColor;
    ctx.fillRect(-1.2 * s, staffTopY, 2.4 * s, bl * 0.6);

    // Prongs encircling the orb
    ctx.strokeStyle = parts.guardColor;
    ctx.lineWidth = 1.8 * s;
    ctx.beginPath();
    ctx.arc(0, -bl, 4 * s, 0.4 * Math.PI, 1.6 * Math.PI);
    ctx.stroke();

    // Floating orb in the center
    const orbBob = Math.sin(time * 0.008) * 1.5 * s;
    const orbY = -bl + orbBob;

    // Glowing core
    const orbGlow = ctx.createRadialGradient(0, orbY, 1, 0, orbY, 6 * s);
    orbGlow.addColorStop(0, parts.elementColor);
    orbGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = orbGlow;
    ctx.beginPath();
    ctx.arc(0, orbY, 6 * s, 0, Math.PI * 2);
    ctx.fill();

    // Solid inner core
    ctx.fillStyle = parts.elementColor;
    ctx.beginPath();
    ctx.arc(0, orbY, 2.8 * s, 0, Math.PI * 2);
    ctx.fill();

    // Prismatic highlight
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-0.8 * s, orbY - 0.8 * s, 1 * s, 0, Math.PI * 2);
    ctx.fill();
  }

  // ----------------------------------------------------
  // 6. ELEMENTAL CORE GEM (at junction y = 0 or on blade)
  // ----------------------------------------------------
  if (parts.element !== 'physical') {
    // Mounted elemental socket stone
    ctx.fillStyle = parts.elementColor;
    ctx.beginPath();
    ctx.arc(0, -1 * s, 1.8 * s, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-0.5 * s, -1.5 * s, 0.6 * s, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}
