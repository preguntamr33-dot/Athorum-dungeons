import { Item, Monster, PlayerClassId } from '../types';
import { drawProceduralWeapon } from './proceduralWeapons';
import { drawProceduralBossSprite } from './proceduralBossRenderer';

/**
 * Character & Monster Sprites Renderer
 * Pure Canvas procedural pixel & stylized character drawings.
 * Completely replaces all emojis with distinct, animated fantasy characters.
 */

// ==========================================
// 1. HERO CHARACTER SPRITES
// ==========================================

export function drawWarriorSprite(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  time: number,
  equippedWeapon?: Item | null
) {
  const breathe = Math.sin(time * 0.004) * 1.5;
  const s = size / 32; // base scale

  ctx.save();
  ctx.translate(cx, cy + breathe);

  // 1. Cape behind (Tattered Red/Crimson cape)
  ctx.fillStyle = '#991b1b';
  ctx.beginPath();
  ctx.moveTo(-7 * s, -4 * s);
  ctx.lineTo(-11 * s, 11 * s);
  ctx.lineTo(9 * s, 11 * s);
  ctx.lineTo(7 * s, -4 * s);
  ctx.closePath();
  ctx.fill();

  // 2. Legs / Iron Greaves
  ctx.fillStyle = '#334155';
  ctx.fillRect(-5 * s, 6 * s, 4 * s, 6 * s);
  ctx.fillRect(1 * s, 6 * s, 4 * s, 6 * s);
  // Boots
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(-6 * s, 10 * s, 5 * s, 3 * s);
  ctx.fillRect(1 * s, 10 * s, 5 * s, 3 * s);

  // 3. Body / Iron Breastplate
  ctx.fillStyle = '#64748b';
  ctx.fillRect(-6 * s, -4 * s, 12 * s, 11 * s);

  // Breastplate highlight & emblem
  ctx.fillStyle = '#94a3b8';
  ctx.fillRect(-4 * s, -3 * s, 8 * s, 5 * s);
  // Golden cross insignia
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(-1 * s, -2 * s, 2 * s, 6 * s);
  ctx.fillRect(-3 * s, 0 * s, 6 * s, 2 * s);

  // Heavy steel pauldrons (shoulders)
  ctx.fillStyle = '#475569';
  ctx.beginPath();
  ctx.arc(-7 * s, -3 * s, 4 * s, 0, Math.PI * 2);
  ctx.arc(7 * s, -3 * s, 4 * s, 0, Math.PI * 2);
  ctx.fill();

  // 4. Knight Helmet (Greathelm)
  ctx.fillStyle = '#cbd5e1';
  ctx.beginPath();
  ctx.arc(0, -9 * s, 6.5 * s, 0, Math.PI * 2);
  ctx.fill();

  // Helmet visor band
  ctx.fillStyle = '#334155';
  ctx.fillRect(-5.5 * s, -10 * s, 11 * s, 4 * s);
  // Glowing eye slit
  ctx.fillStyle = '#38bdf8';
  ctx.fillRect(-3.5 * s, -9 * s, 3 * s, 1.5 * s);
  ctx.fillRect(0.5 * s, -9 * s, 3 * s, 1.5 * s);

  // Red Knight Plume / Crest on helmet
  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.ellipse(0, -16 * s, 2.5 * s, 4.5 * s, 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#f87171';
  ctx.beginPath();
  ctx.ellipse(0.5 * s, -16.5 * s, 1.2 * s, 3.5 * s, 0.1, 0, Math.PI * 2);
  ctx.fill();

  // 5. Left Hand: Sturdy Kite Shield
  const shieldX = -10 * s;
  const shieldY = -1 * s;
  ctx.fillStyle = '#1e3a8a'; // Royal blue field
  ctx.beginPath();
  ctx.moveTo(shieldX - 4 * s, shieldY - 7 * s);
  ctx.lineTo(shieldX + 4 * s, shieldY - 7 * s);
  ctx.lineTo(shieldX + 4 * s, shieldY + 3 * s);
  ctx.lineTo(shieldX, shieldY + 9 * s);
  ctx.lineTo(shieldX - 4 * s, shieldY + 3 * s);
  ctx.closePath();
  ctx.fill();

  // Shield iron rim & boss
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 1.5 * s;
  ctx.stroke();
  ctx.fillStyle = '#fbbf24'; // Gold central boss
  ctx.beginPath();
  ctx.arc(shieldX, shieldY, 2.5 * s, 0, Math.PI * 2);
  ctx.fill();

  // 6. Right Hand: Equipped Weapon or Gauntlet Fist
  const handX = 10 * s;
  const handY = 0 * s;

  if (equippedWeapon && equippedWeapon.weaponParts) {
    // Draw the actual procedural modular weapon assembled in the warrior's hand!
    drawProceduralWeapon(
      ctx,
      equippedWeapon.weaponParts,
      handX,
      handY,
      1.1 * s,
      -0.18 + Math.sin(time * 0.003) * 0.05,
      time,
      { showAura: true, isEquipped: true }
    );
    // Steel gauntlet gripped firmly around the weapon hilt
    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.arc(handX, handY + 1 * s, 2.6 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(handX - 1.5 * s, handY - 0.5 * s, 3 * s, 2 * s);
  } else if (equippedWeapon) {
    // Fallback standard broadsword
    const swordX = 10 * s;
    const swordY = -3 * s;
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(swordX - 1.5 * s, swordY - 14 * s, 3 * s, 15 * s);
    ctx.beginPath();
    ctx.moveTo(swordX - 1.5 * s, swordY - 14 * s);
    ctx.lineTo(swordX, swordY - 18 * s);
    ctx.lineTo(swordX + 1.5 * s, swordY - 14 * s);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#93c5fd';
    ctx.fillRect(swordX - 0.5 * s, swordY - 16 * s, 1 * s, 17 * s);
    ctx.fillStyle = '#d97706';
    ctx.fillRect(swordX - 5 * s, swordY + 1 * s, 10 * s, 2 * s);
    ctx.fillStyle = '#78350f';
    ctx.fillRect(swordX - 1 * s, swordY + 3 * s, 2 * s, 4 * s);
    ctx.fillStyle = '#d97706';
    ctx.beginPath();
    ctx.arc(swordX, swordY + 7.5 * s, 2 * s, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Unarmed: heavy steel clenched gauntlet fist
    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.arc(handX - 1 * s, handY + 3 * s, 3.2 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(handX - 2.5 * s, handY + 1.5 * s, 3.5 * s, 2 * s);
  }

  ctx.restore();
}

export function drawMageSprite(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  time: number,
  equippedWeapon?: Item | null
) {
  const float = Math.sin(time * 0.005) * 2;
  const s = size / 32;

  ctx.save();
  ctx.translate(cx, cy + float);

  // 1. Flowing Arcane Robes (Midnight Purple / Violet)
  ctx.fillStyle = '#4c1d95';
  ctx.beginPath();
  ctx.moveTo(-6 * s, -4 * s);
  ctx.lineTo(-10 * s, 12 * s);
  ctx.lineTo(10 * s, 12 * s);
  ctx.lineTo(6 * s, -4 * s);
  ctx.closePath();
  ctx.fill();

  // Robe golden runic embroidery trim
  ctx.fillStyle = '#fbbf24';
  ctx.fillRect(-9 * s, 10 * s, 18 * s, 2 * s);
  ctx.fillRect(-1 * s, -3 * s, 2 * s, 13 * s);

  // 2. Cloak sleeves
  ctx.fillStyle = '#5b21b6';
  ctx.beginPath();
  ctx.ellipse(-7 * s, 1 * s, 4 * s, 3 * s, -0.3, 0, Math.PI * 2);
  ctx.ellipse(7 * s, 1 * s, 4 * s, 3 * s, 0.3, 0, Math.PI * 2);
  ctx.fill();

  // 3. Face & Mysterious Cowl
  ctx.fillStyle = '#0f172a'; // Shadowed face
  ctx.beginPath();
  ctx.arc(0, -7 * s, 5.5 * s, 0, Math.PI * 2);
  ctx.fill();

  // Piercing glowing cyan eyes
  ctx.fillStyle = '#38bdf8';
  ctx.beginPath();
  ctx.arc(-2.5 * s, -7 * s, 1.5 * s, 0, Math.PI * 2);
  ctx.arc(2.5 * s, -7 * s, 1.5 * s, 0, Math.PI * 2);
  ctx.fill();

  // Flowing white wizard beard
  ctx.fillStyle = '#e2e8f0';
  ctx.beginPath();
  ctx.moveTo(-4 * s, -4 * s);
  ctx.lineTo(0, 4 * s);
  ctx.lineTo(4 * s, -4 * s);
  ctx.closePath();
  ctx.fill();

  // 4. Pointed Wizard Hat
  // Brim
  ctx.fillStyle = '#312e81';
  ctx.beginPath();
  ctx.ellipse(0, -10 * s, 9 * s, 3 * s, 0, 0, Math.PI * 2);
  ctx.fill();
  // Hat cone
  ctx.beginPath();
  ctx.moveTo(-6 * s, -10 * s);
  ctx.quadraticCurveTo(2 * s, -16 * s, 3 * s, -22 * s);
  ctx.quadraticCurveTo(-1 * s, -16 * s, 6 * s, -10 * s);
  ctx.closePath();
  ctx.fill();
  // Hat golden star buckle
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(-2 * s, -11.5 * s, 4 * s, 2 * s);

  // 5. Left Hand: Equipped Weapon or Arcane Channeling
  const staffX = -10 * s;
  const staffY = 0 * s;

  if (equippedWeapon && equippedWeapon.weaponParts) {
    // Render the actual procedural weapon in the Mage's hand!
    drawProceduralWeapon(
      ctx,
      equippedWeapon.weaponParts,
      staffX,
      staffY + 2 * s,
      1.05 * s,
      0.08 + Math.sin(time * 0.004) * 0.04,
      time,
      { showAura: true, isEquipped: true }
    );
    // Mage's mystic violet glove holding the shaft/hilt
    ctx.fillStyle = '#5b21b6';
    ctx.beginPath();
    ctx.arc(staffX, staffY + 2 * s, 2.5 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(staffX - 1 * s, staffY + 1 * s, 2 * s, 1.5 * s);
  } else if (equippedWeapon) {
    // Fallback standard elderwood staff
    ctx.fillStyle = '#78350f';
    ctx.fillRect(staffX - 1.5 * s, staffY - 14 * s, 3 * s, 25 * s);
    ctx.fillStyle = '#92400e';
    ctx.beginPath();
    ctx.moveTo(staffX - 4 * s, staffY - 11 * s);
    ctx.lineTo(staffX, staffY - 17 * s);
    ctx.lineTo(staffX + 4 * s, staffY - 11 * s);
    ctx.stroke();

    const orbBob = Math.sin(time * 0.008) * 2;
    const orbY = staffY - 17 * s + orbBob;
    const orbGlow = ctx.createRadialGradient(staffX, orbY, 1, staffX, orbY, 12 * s);
    orbGlow.addColorStop(0, 'rgba(192, 132, 252, 0.8)');
    orbGlow.addColorStop(0.5, 'rgba(147, 51, 234, 0.3)');
    orbGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = orbGlow;
    ctx.beginPath();
    ctx.arc(staffX, orbY, 12 * s, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#c084fc';
    ctx.beginPath();
    ctx.arc(staffX, orbY, 3.5 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(staffX - 1 * s, orbY - 1 * s, 1.2 * s, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Unarmed: open hand casting shimmering mana spark
    ctx.fillStyle = '#5b21b6';
    ctx.beginPath();
    ctx.arc(staffX + 2 * s, staffY + 3 * s, 2.5 * s, 0, Math.PI * 2);
    ctx.fill();
    // Floating mana spark
    const sparkPulse = Math.sin(time * 0.01) * 1.5;
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(staffX + 2 * s, staffY - 3 * s, 2.5 * s + sparkPulse, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

export function drawRogueSprite(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  time: number,
  equippedWeapon?: Item | null
) {
  const s = size / 32;
  const sway = Math.sin(time * 0.006) * 1.2;

  ctx.save();
  ctx.translate(cx + sway, cy);

  // 1. Stealth Dark Cloak (Tattered edges)
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.moveTo(-7 * s, -4 * s);
  ctx.lineTo(-10 * s, 11 * s);
  ctx.lineTo(0, 9 * s);
  ctx.lineTo(10 * s, 11 * s);
  ctx.lineTo(7 * s, -4 * s);
  ctx.closePath();
  ctx.fill();

  // 2. Leather Gambeson & Crossed Belts
  ctx.fillStyle = '#1c1917';
  ctx.fillRect(-5 * s, -3 * s, 10 * s, 12 * s);

  // Leather armor harness
  ctx.fillStyle = '#78350f';
  ctx.fillRect(-5 * s, 3 * s, 10 * s, 2 * s); // belt
  ctx.fillStyle = '#a16207';
  ctx.fillRect(-1 * s, 3 * s, 2 * s, 2 * s); // belt buckle

  // Crossed bandolier throwing knives
  ctx.fillStyle = '#44403c';
  ctx.fillRect(-4 * s, -2 * s, 8 * s, 1.5 * s);
  ctx.fillStyle = '#cbd5e1';
  ctx.fillRect(-2 * s, -2 * s, 2 * s, 1.5 * s);

  // Boots
  ctx.fillStyle = '#292524';
  ctx.fillRect(-4 * s, 9 * s, 3 * s, 4 * s);
  ctx.fillRect(1 * s, 9 * s, 3 * s, 4 * s);

  // 3. Shadow Cowl / Assassin Hood
  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.arc(0, -8 * s, 6.5 * s, 0, Math.PI * 2);
  ctx.fill();

  // Pointed hood peak
  ctx.beginPath();
  ctx.moveTo(-5 * s, -11 * s);
  ctx.lineTo(0, -16 * s);
  ctx.lineTo(5 * s, -11 * s);
  ctx.closePath();
  ctx.fill();

  // Thief Face Mask (Dark veil covering lower face)
  ctx.fillStyle = '#020617';
  ctx.fillRect(-4 * s, -7 * s, 8 * s, 5 * s);

  // Sharp Golden Feline Assassin Eyes
  ctx.fillStyle = '#facc15';
  ctx.beginPath();
  ctx.ellipse(-2.5 * s, -7 * s, 1.5 * s, 1 * s, -0.1, 0, Math.PI * 2);
  ctx.ellipse(2.5 * s, -7 * s, 1.5 * s, 1 * s, 0.1, 0, Math.PI * 2);
  ctx.fill();

  // 4. Weapons in Hands: Equipped Procedural Weapon or Dual Assassin Daggers
  const rHandX = 9 * s;
  const rHandY = 1 * s;
  const lHandX = -9 * s;
  const lHandY = 1 * s;

  if (equippedWeapon && equippedWeapon.weaponParts) {
    // Primary weapon in right hand
    drawProceduralWeapon(
      ctx,
      equippedWeapon.weaponParts,
      rHandX,
      rHandY,
      1.0 * s,
      0.22 + Math.sin(time * 0.005) * 0.04,
      time,
      { showAura: true, isEquipped: true }
    );
    // Dark leather glove gripping right weapon
    ctx.fillStyle = '#1c1917';
    ctx.beginPath();
    ctx.arc(rHandX, rHandY + 1 * s, 2.2 * s, 0, Math.PI * 2);
    ctx.fill();

    // Off-hand weapon (reverse-grip parrying blade matched with equipped weapon parts)
    drawProceduralWeapon(
      ctx,
      equippedWeapon.weaponParts,
      lHandX,
      lHandY,
      0.82 * s,
      Math.PI - 0.25,
      time,
      { showAura: true, isEquipped: true }
    );
    // Dark leather glove gripping offhand weapon
    ctx.fillStyle = '#1c1917';
    ctx.beginPath();
    ctx.arc(lHandX, lHandY + 1 * s, 2.2 * s, 0, Math.PI * 2);
    ctx.fill();
  } else if (equippedWeapon) {
    // Fallback dual daggers
    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.moveTo(lHandX, lHandY);
    ctx.lineTo(lHandX - 3 * s, lHandY - 10 * s);
    ctx.lineTo(lHandX + 1 * s, lHandY - 8 * s);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(lHandX - 2 * s, lHandY - 7 * s, 1 * s, 4 * s);

    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.moveTo(rHandX, rHandY);
    ctx.lineTo(rHandX + 2 * s, rHandY + 10 * s);
    ctx.lineTo(rHandX - 1 * s, rHandY + 8 * s);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(rHandX, rHandY + 3 * s, 1 * s, 4 * s);
  } else {
    // Unarmed: stealth leather-gloved fists
    ctx.fillStyle = '#1c1917';
    ctx.beginPath();
    ctx.arc(lHandX + 2 * s, lHandY + 3 * s, 2.4 * s, 0, Math.PI * 2);
    ctx.arc(rHandX - 2 * s, rHandY + 3 * s, 2.4 * s, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

export function drawPlayerCharacter(
  ctx: CanvasRenderingContext2D,
  classId: PlayerClassId,
  cx: number,
  cy: number,
  size: number,
  time: number,
  equippedWeapon?: Item | null
) {
  if (classId === 'warrior') {
    drawWarriorSprite(ctx, cx, cy, size, time, equippedWeapon);
  } else if (classId === 'mage') {
    drawMageSprite(ctx, cx, cy, size, time, equippedWeapon);
  } else {
    drawRogueSprite(ctx, cx, cy, size, time, equippedWeapon);
  }
}

// ==========================================
// 2. MONSTER SPRITES (NO EMOJIS, NO LETTERS)
// ==========================================

export function drawMonsterCharacter(
  ctx: CanvasRenderingContext2D,
  monster: Monster,
  cx: number,
  cy: number,
  size: number,
  time: number
) {
  const type = monster.monsterType || monster.name.toLowerCase();

  // Procedural Boss custom drawing
  if (monster.bossData || type.startsWith('proc_boss')) {
    drawProceduralBossSprite(ctx, monster, cx, cy, size, time);
    return;
  }

  const s = size / 32;

  ctx.save();
  ctx.translate(cx, cy);

  if (type.includes('boss_dragon') || type.includes('dragón') || type.includes('dragon')) {
    // === BOSS: DRAGON DEL ABISMO ===
    const wingFlap = Math.sin(time * 0.008) * 4 * s;
    // Dragon Wings
    ctx.fillStyle = '#7f1d1d';
    // Left wing
    ctx.beginPath();
    ctx.moveTo(-5 * s, -2 * s);
    ctx.lineTo(-18 * s, -14 * s + wingFlap);
    ctx.lineTo(-12 * s, 2 * s);
    ctx.closePath();
    ctx.fill();
    // Right wing
    ctx.beginPath();
    ctx.moveTo(5 * s, -2 * s);
    ctx.lineTo(18 * s, -14 * s + wingFlap);
    ctx.lineTo(12 * s, 2 * s);
    ctx.closePath();
    ctx.fill();

    // Dragon Body & Scales
    ctx.fillStyle = '#991b1b';
    ctx.beginPath();
    ctx.ellipse(0, 2 * s, 10 * s, 11 * s, 0, 0, Math.PI * 2);
    ctx.fill();

    // Chest scales (Molten red-orange)
    ctx.fillStyle = '#ea580c';
    ctx.beginPath();
    ctx.ellipse(0, 3 * s, 6 * s, 7 * s, 0, 0, Math.PI * 2);
    ctx.fill();

    // Dragon Head & Horned Crest
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.arc(0, -9 * s, 7 * s, 0, Math.PI * 2);
    ctx.fill();

    // Black Draconic Horns
    ctx.fillStyle = '#1c1917';
    ctx.beginPath();
    ctx.moveTo(-5 * s, -11 * s);
    ctx.lineTo(-12 * s, -19 * s);
    ctx.lineTo(-3 * s, -14 * s);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(5 * s, -11 * s);
    ctx.lineTo(12 * s, -19 * s);
    ctx.lineTo(3 * s, -14 * s);
    ctx.closePath();
    ctx.fill();

    // Molten Glowing Eyes & Fire Breath Nostrils
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.ellipse(-3 * s, -9 * s, 2 * s, 1 * s, -0.2, 0, Math.PI * 2);
    ctx.ellipse(3 * s, -9 * s, 2 * s, 1 * s, 0.2, 0, Math.PI * 2);
    ctx.fill();
    // Glowing smoke embers from mouth
    ctx.fillStyle = '#f97316';
    ctx.fillRect(-2 * s, -4 * s, 4 * s, 2 * s);
  } else if (type.includes('boss_minotaur') || type.includes('minotauro')) {
    // === BOSS: MINOTAURO DEL LABERINTO ===
    // Muscular Brown Furry Body
    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.roundRect(-9 * s, -4 * s, 18 * s, 16 * s, 4 * s);
    ctx.fill();

    // Beast Head
    ctx.fillStyle = '#451a03';
    ctx.beginPath();
    ctx.arc(0, -8 * s, 7.5 * s, 0, Math.PI * 2);
    ctx.fill();

    // Giant Curved Horns
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.moveTo(-6 * s, -10 * s);
    ctx.quadraticCurveTo(-16 * s, -16 * s, -14 * s, -6 * s);
    ctx.lineTo(-4 * s, -8 * s);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(6 * s, -10 * s);
    ctx.quadraticCurveTo(16 * s, -16 * s, 14 * s, -6 * s);
    ctx.lineTo(4 * s, -8 * s);
    ctx.closePath();
    ctx.fill();

    // Golden Nose Ring
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.8 * s;
    ctx.beginPath();
    ctx.arc(0, -3 * s, 2.5 * s, 0, Math.PI * 2);
    ctx.stroke();

    // Glowing Crimson Furious Eyes
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(-3.5 * s, -9 * s, 2 * s, 1.5 * s);
    ctx.fillRect(1.5 * s, -9 * s, 2 * s, 1.5 * s);

    // Massive Double-Headed Greataxe
    ctx.fillStyle = '#64748b';
    ctx.fillRect(10 * s, -15 * s, 6 * s, 10 * s);
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(11 * s, -18 * s, 2 * s, 26 * s); // haft
  } else if (type.includes('boss_skeleton') || type.includes('señor esqueleto') || type.includes('lich')) {
    // === BOSS: SEÑOR ESQUELETO MALDITO ===
    // Royal Tattered Crimson Cape
    ctx.fillStyle = '#881337';
    ctx.fillRect(-9 * s, -6 * s, 18 * s, 18 * s);

    // Ribcage & Black Armor
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-6 * s, -4 * s, 12 * s, 12 * s);
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(-4 * s, -2 * s, 8 * s, 2 * s);
    ctx.fillRect(-3 * s, 2 * s, 6 * s, 2 * s);

    // Giant Bleached Skull
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.arc(0, -8 * s, 7 * s, 0, Math.PI * 2);
    ctx.fill();

    // Spiked Golden King Crown with Gems
    ctx.fillStyle = '#eab308';
    ctx.beginPath();
    ctx.moveTo(-7 * s, -11 * s);
    ctx.lineTo(-8 * s, -17 * s);
    ctx.lineTo(-4 * s, -13 * s);
    ctx.lineTo(0, -18 * s);
    ctx.lineTo(4 * s, -13 * s);
    ctx.lineTo(8 * s, -17 * s);
    ctx.lineTo(7 * s, -11 * s);
    ctx.closePath();
    ctx.fill();
    // Crown Ruby
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.arc(0, -12 * s, 1.5 * s, 0, Math.PI * 2);
    ctx.fill();

    // Glowing Red Soul-Fire Eyes
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(-2.5 * s, -7 * s, 1.8 * s, 0, Math.PI * 2);
    ctx.arc(2.5 * s, -7 * s, 1.8 * s, 0, Math.PI * 2);
    ctx.fill();
  } else if (type.includes('boss_archmage') || type.includes('archimago')) {
    // === BOSS: ARCHIMAGO ESPECTRAL ===
    // Rotating Arcane Runes Ring
    const rot = time * 0.003;
    ctx.strokeStyle = '#c084fc';
    ctx.lineWidth = 1.5 * s;
    ctx.beginPath();
    ctx.arc(0, 0, 13 * s, rot, rot + Math.PI * 1.5);
    ctx.stroke();

    // Ethereal Ghostly Robe
    ctx.fillStyle = '#581c87';
    ctx.beginPath();
    ctx.moveTo(-7 * s, -4 * s);
    ctx.lineTo(-11 * s, 13 * s);
    ctx.lineTo(11 * s, 13 * s);
    ctx.lineTo(7 * s, -4 * s);
    ctx.closePath();
    ctx.fill();

    // Astral Hood & Mask
    ctx.fillStyle = '#2e1065';
    ctx.beginPath();
    ctx.arc(0, -7 * s, 6.5 * s, 0, Math.PI * 2);
    ctx.fill();

    // Lightning Blue Eyes
    ctx.fillStyle = '#67e8f9';
    ctx.beginPath();
    ctx.arc(-2.5 * s, -7 * s, 1.8 * s, 0, Math.PI * 2);
    ctx.arc(2.5 * s, -7 * s, 1.8 * s, 0, Math.PI * 2);
    ctx.fill();

    // Floating Grimoire
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(8 * s, -4 * s, 6 * s, 8 * s);
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(9 * s, -3 * s, 4 * s, 6 * s);
  } else if (type.includes('rat') || type.includes('rata')) {
    // === RATA GIGANTE ===
    // Brown furry body
    ctx.fillStyle = '#78716c';
    ctx.beginPath();
    ctx.ellipse(0, 2 * s, 8 * s, 6 * s, 0, 0, Math.PI * 2);
    ctx.fill();

    // Pink twitching ears
    ctx.fillStyle = '#f472b6';
    ctx.beginPath();
    ctx.arc(-5 * s, -3 * s, 2.5 * s, 0, Math.PI * 2);
    ctx.arc(-1 * s, -4 * s, 2.5 * s, 0, Math.PI * 2);
    ctx.fill();

    // Head
    ctx.fillStyle = '#57534e';
    ctx.beginPath();
    ctx.arc(-3 * s, 0, 4.5 * s, 0, Math.PI * 2);
    ctx.fill();

    // Red beady eye & sharp snout
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(-5 * s, -1 * s, 1.5 * s, 0, Math.PI * 2);
    ctx.fill();
    // Teeth
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-7 * s, 1 * s, 1.5 * s, 2 * s);

    // Long pink tail
    ctx.strokeStyle = '#f472b6';
    ctx.lineWidth = 1.5 * s;
    ctx.beginPath();
    ctx.moveTo(7 * s, 3 * s);
    ctx.quadraticCurveTo(12 * s, -2 * s, 11 * s, 6 * s);
    ctx.stroke();
  } else if (type.includes('bat') || type.includes('murciélago') || type.includes('murcielago')) {
    // === MURCIÉLAGO VAMPIRO ===
    const flap = Math.sin(time * 0.015) * 5 * s;
    // Leathery Wings
    ctx.fillStyle = '#334155';
    // Left
    ctx.beginPath();
    ctx.moveTo(-2 * s, 0);
    ctx.lineTo(-12 * s, -6 * s + flap);
    ctx.lineTo(-8 * s, 4 * s);
    ctx.closePath();
    ctx.fill();
    // Right
    ctx.beginPath();
    ctx.moveTo(2 * s, 0);
    ctx.lineTo(12 * s, -6 * s + flap);
    ctx.lineTo(8 * s, 4 * s);
    ctx.closePath();
    ctx.fill();

    // Furry Body & Head
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(0, 0, 4 * s, 0, Math.PI * 2);
    ctx.fill();

    // Pointed ears
    ctx.beginPath();
    ctx.moveTo(-3 * s, -3 * s);
    ctx.lineTo(-4 * s, -7 * s);
    ctx.lineTo(-1 * s, -4 * s);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(3 * s, -3 * s);
    ctx.lineTo(4 * s, -7 * s);
    ctx.lineTo(1 * s, -4 * s);
    ctx.closePath();
    ctx.fill();

    // Glowing yellow eyes & fangs
    ctx.fillStyle = '#eab308';
    ctx.fillRect(-2 * s, -1 * s, 1.5 * s, 1 * s);
    ctx.fillRect(0.5 * s, -1 * s, 1.5 * s, 1 * s);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-1.5 * s, 2 * s, 1 * s, 1.5 * s);
    ctx.fillRect(0.5 * s, 2 * s, 1 * s, 1.5 * s);
  } else if (type.includes('skeleton') || type.includes('esqueleto')) {
    // === ESQUELETO SOLDADO ===
    // Bleached skull
    ctx.fillStyle = '#f1f5f9';
    ctx.beginPath();
    ctx.arc(0, -6 * s, 5.5 * s, 0, Math.PI * 2);
    ctx.fill();

    // Dark eye sockets
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(-2 * s, -6 * s, 1.6 * s, 0, Math.PI * 2);
    ctx.arc(2 * s, -6 * s, 1.6 * s, 0, Math.PI * 2);
    ctx.fill();
    // Glowing faint red pinpricks in sockets
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(-2 * s, -6 * s, 1 * s, 1 * s);
    ctx.fillRect(2 * s, -6 * s, 1 * s, 1 * s);

    // Ribcage
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(-4 * s, 0, 8 * s, 1.5 * s);
    ctx.fillRect(-3.5 * s, 3 * s, 7 * s, 1.5 * s);
    ctx.fillRect(-3 * s, 6 * s, 6 * s, 1.5 * s);
    // Spine
    ctx.fillRect(-1 * s, -1 * s, 2 * s, 9 * s);

    // Rusty sword in bony hand
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(6 * s, -9 * s, 2 * s, 14 * s);
    ctx.fillStyle = '#78350f';
    ctx.fillRect(4 * s, 2 * s, 6 * s, 1.5 * s);
  } else if (type.includes('goblin') || type.includes('ladrón') || type.includes('ladron') || type.includes('arquero')) {
    // === GOBLIN ===
    const isArcher = type.includes('arquero') || type.includes('archer');

    // Green Head
    ctx.fillStyle = '#4ade80';
    ctx.beginPath();
    ctx.arc(0, -4 * s, 5.5 * s, 0, Math.PI * 2);
    ctx.fill();

    // Long Pointed Goblin Ears
    ctx.beginPath();
    ctx.moveTo(-4 * s, -4 * s);
    ctx.lineTo(-10 * s, -6 * s);
    ctx.lineTo(-4 * s, -1 * s);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(4 * s, -4 * s);
    ctx.lineTo(10 * s, -6 * s);
    ctx.lineTo(4 * s, -1 * s);
    ctx.closePath();
    ctx.fill();

    // Yellow sinister eyes & wicked grin
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(-3 * s, -5 * s, 1.5 * s, 1.5 * s);
    ctx.fillRect(1.5 * s, -5 * s, 1.5 * s, 1.5 * s);

    // Ragged tunic
    ctx.fillStyle = isArcher ? '#78350f' : '#b45309';
    ctx.fillRect(-4 * s, 1 * s, 8 * s, 8 * s);

    if (isArcher) {
      // Shortbow
      ctx.strokeStyle = '#92400e';
      ctx.lineWidth = 1.8 * s;
      ctx.beginPath();
      ctx.arc(7 * s, 2 * s, 6 * s, -Math.PI * 0.4, Math.PI * 0.4);
      ctx.stroke();
    } else {
      // Crooked Dagger & Loot Sack
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(6 * s, -2 * s, 2 * s, 7 * s);
      // Gold sack
      ctx.fillStyle = '#ca8a04';
      ctx.beginPath();
      ctx.arc(-6 * s, 5 * s, 3.5 * s, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (type.includes('wraith') || type.includes('espectro') || type.includes('fantasma')) {
    // === ESPECTRO GÉLIDO ===
    const wisps = Math.sin(time * 0.007) * 2 * s;
    // Glowing translucent shroud
    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.moveTo(-6 * s, -8 * s);
    ctx.quadraticCurveTo(-9 * s + wisps, 2 * s, -5 * s + wisps, 11 * s);
    ctx.lineTo(0, 8 * s);
    ctx.lineTo(5 * s - wisps, 11 * s);
    ctx.quadraticCurveTo(9 * s - wisps, 2 * s, 6 * s, -8 * s);
    ctx.closePath();
    ctx.fill();

    // Hood & Spectral Ice-Blue Glow
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(0, -7 * s, 5 * s, 0, Math.PI * 2);
    ctx.fill();

    // Hollow eyes
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-2.5 * s, -8 * s, 2 * s, 2 * s);
    ctx.fillRect(0.5 * s, -8 * s, 2 * s, 2 * s);
  } else if (type.includes('zombie') || type.includes('zombi')) {
    // === ZOMBI PURULENTO ===
    // Decayed olive/green skin
    ctx.fillStyle = '#65a30d';
    ctx.beginPath();
    ctx.arc(0, -6 * s, 6 * s, 0, Math.PI * 2);
    ctx.fill();

    // Rotting vacant eyes
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(-3 * s, -7 * s, 2 * s, 2 * s);
    ctx.fillStyle = '#1c1917';
    ctx.fillRect(1.5 * s, -6 * s, 1.5 * s, 1.5 * s);

    // Tattered decayed tunic
    ctx.fillStyle = '#44403c';
    ctx.fillRect(-5 * s, 0, 10 * s, 9 * s);

    // Outstretched clawing zombie arms
    ctx.fillStyle = '#4d7c0f';
    ctx.fillRect(-9 * s, 1 * s, 5 * s, 3 * s);
    ctx.fillRect(4 * s, 2 * s, 5 * s, 3 * s);
  } else if (type.includes('orc') || type.includes('orco')) {
    // === ORCO BERSERKER ===
    // Muscular Green Heavy Body
    ctx.fillStyle = '#15803d';
    ctx.fillRect(-7 * s, -4 * s, 14 * s, 14 * s);

    // Head with jaw & protruding lower tusks
    ctx.fillStyle = '#16a34a';
    ctx.beginPath();
    ctx.arc(0, -7 * s, 6.5 * s, 0, Math.PI * 2);
    ctx.fill();

    // Tusks
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.moveTo(-3 * s, -3 * s);
    ctx.lineTo(-4 * s, -6 * s);
    ctx.lineTo(-2 * s, -3 * s);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(3 * s, -3 * s);
    ctx.lineTo(4 * s, -6 * s);
    ctx.lineTo(2 * s, -3 * s);
    ctx.closePath();
    ctx.fill();

    // Fiery red eyes & War Paint
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(-3 * s, -8 * s, 2 * s, 1.5 * s);
    ctx.fillRect(1 * s, -8 * s, 2 * s, 1.5 * s);

    // Spiked Pauldrons & Giant Battleaxe
    ctx.fillStyle = '#334155';
    ctx.fillRect(8 * s, -14 * s, 6 * s, 8 * s);
    ctx.fillStyle = '#78350f';
    ctx.fillRect(9 * s, -16 * s, 2 * s, 22 * s);
  } else if (type.includes('necromancer') || type.includes('nigromante')) {
    // === NIGROMANTE OSCURO ===
    // Hooded Purple/Black Robes
    ctx.fillStyle = '#1e1b4b';
    ctx.beginPath();
    ctx.moveTo(-6 * s, -4 * s);
    ctx.lineTo(-9 * s, 12 * s);
    ctx.lineTo(9 * s, 12 * s);
    ctx.lineTo(6 * s, -4 * s);
    ctx.closePath();
    ctx.fill();

    // Shadow Hood & Glowing Green Eyes
    ctx.fillStyle = '#09090b';
    ctx.beginPath();
    ctx.arc(0, -7 * s, 5.5 * s, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#4ade80';
    ctx.fillRect(-2.5 * s, -7 * s, 1.5 * s, 1.5 * s);
    ctx.fillRect(1 * s, -7 * s, 1.5 * s, 1.5 * s);

    // Skeletal Staff with Horned Skull
    ctx.fillStyle = '#78350f';
    ctx.fillRect(-9 * s, -12 * s, 2 * s, 20 * s);
    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.arc(-8 * s, -14 * s, 3.5 * s, 0, Math.PI * 2);
    ctx.fill();
    // Swirling necrotic miasma
    ctx.fillStyle = 'rgba(168, 85, 247, 0.6)';
    ctx.beginPath();
    ctx.arc(-8 * s, -14 * s, 6 * s, 0, Math.PI * 2);
    ctx.fill();
  } else if (type.includes('golem')) {
    // === GOLEM DE PIEDRA ===
    // Heavy chiseled granite body
    ctx.fillStyle = '#475569';
    ctx.fillRect(-8 * s, -5 * s, 16 * s, 16 * s);

    // Stone Head
    ctx.fillStyle = '#64748b';
    ctx.fillRect(-5 * s, -12 * s, 10 * s, 7 * s);

    // Glowing runic magma cracks in chest
    ctx.fillStyle = '#f97316';
    ctx.fillRect(-4 * s, -2 * s, 8 * s, 2 * s);
    ctx.fillRect(0, 0, 2 * s, 6 * s);
    // Glowing eyes
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(-3 * s, -9 * s, 2 * s, 2 * s);
    ctx.fillRect(1 * s, -9 * s, 2 * s, 2 * s);

    // Massive Boulder Fists
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.arc(-10 * s, 4 * s, 4 * s, 0, Math.PI * 2);
    ctx.arc(10 * s, 4 * s, 4 * s, 0, Math.PI * 2);
    ctx.fill();
  } else if (type.includes('demon') || type.includes('demonio')) {
    // === DEMONIO ÍGNEO ===
    // Fiery Wings
    ctx.fillStyle = '#991b1b';
    ctx.beginPath();
    ctx.moveTo(-4 * s, -2 * s);
    ctx.lineTo(-14 * s, -10 * s);
    ctx.lineTo(-9 * s, 4 * s);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(4 * s, -2 * s);
    ctx.lineTo(14 * s, -10 * s);
    ctx.lineTo(9 * s, 4 * s);
    ctx.closePath();
    ctx.fill();

    // Crimson Fiend Body
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.ellipse(0, 1 * s, 6 * s, 8 * s, 0, 0, Math.PI * 2);
    ctx.fill();

    // Demon Horns
    ctx.fillStyle = '#1c1917';
    ctx.beginPath();
    ctx.moveTo(-3 * s, -8 * s);
    ctx.lineTo(-8 * s, -15 * s);
    ctx.lineTo(-2 * s, -10 * s);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(3 * s, -8 * s);
    ctx.lineTo(8 * s, -15 * s);
    ctx.lineTo(2 * s, -10 * s);
    ctx.closePath();
    ctx.fill();

    // Glowing Yellow Eyes
    ctx.fillStyle = '#fde047';
    ctx.fillRect(-2.5 * s, -6 * s, 1.5 * s, 1.5 * s);
    ctx.fillRect(1 * s, -6 * s, 1.5 * s, 1.5 * s);
  } else {
    // === VOID WALKER / GENERIC MONSTER FALLBACK ===
    ctx.fillStyle = monster.color || '#a855f7';
    ctx.beginPath();
    ctx.arc(0, 0, 7 * s, 0, Math.PI * 2);
    ctx.fill();
    // Glowing mystic eye
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, 0, 3 * s, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

// ==========================================
// 3. GROUND ITEMS SPRITE RENDERER (NO EMOJIS)
// ==========================================

export function drawGroundItemSprite(
  ctx: CanvasRenderingContext2D,
  item: Item,
  cx: number,
  cy: number,
  size: number,
  time: number
) {
  const bob = Math.sin(time * 0.005) * 1.5;
  const s = size / 32;

  ctx.save();
  ctx.translate(cx, cy + bob);

  const key = (item.iconKey || item.type || '').toLowerCase();

  if (item.type === 'potion') {
    // Potion flask with liquid
    const liquidColor = key.includes('mana')
      ? '#38bdf8'
      : key.includes('str')
      ? '#f97316'
      : '#ef4444';

    // Glass phial
    ctx.fillStyle = liquidColor;
    ctx.beginPath();
    ctx.arc(0, 2 * s, 5 * s, 0, Math.PI * 2);
    ctx.fill();

    // Neck & Cork
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.fillRect(-2 * s, -4 * s, 4 * s, 3 * s);
    ctx.fillStyle = '#78350f'; // cork
    ctx.fillRect(-2 * s, -6 * s, 4 * s, 2 * s);

    // Glass shine
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-1.5 * s, 0, 1.5 * s, 0, Math.PI * 2);
    ctx.fill();
  } else if (item.type === 'scroll') {
    // Parchment Scroll
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(-6 * s, -4 * s, 12 * s, 8 * s);
    // Red Ribbon
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(-1 * s, -4 * s, 2 * s, 8 * s);
    // Rolled wooden ends
    ctx.fillStyle = '#78350f';
    ctx.fillRect(-7 * s, -5 * s, 2 * s, 10 * s);
    ctx.fillRect(5 * s, -5 * s, 2 * s, 10 * s);
  } else if (item.type === 'weapon') {
    if (item.weaponParts) {
      // Draw the assembled procedural weapon on the ground with its aura!
      drawProceduralWeapon(
        ctx,
        item.weaponParts,
        0,
        0,
        0.95 * s,
        -Math.PI / 4,
        time,
        { showAura: true }
      );
    } else {
      // Gleaming Silver Sword
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.moveTo(-6 * s, 6 * s);
      ctx.lineTo(6 * s, -6 * s);
      ctx.lineTo(7 * s, -5 * s);
      ctx.lineTo(-5 * s, 7 * s);
      ctx.closePath();
      ctx.fill();
      // Crossguard & Hilt
      ctx.fillStyle = '#eab308';
      ctx.fillRect(-6 * s, 4 * s, 3 * s, 3 * s);
      ctx.fillStyle = '#78350f';
      ctx.fillRect(-8 * s, 6 * s, 3 * s, 3 * s);
    }
  } else if (item.type === 'armor') {
    // Iron Shield / Chestplate
    ctx.fillStyle = '#64748b';
    ctx.beginPath();
    ctx.moveTo(-5 * s, -5 * s);
    ctx.lineTo(5 * s, -5 * s);
    ctx.lineTo(5 * s, 2 * s);
    ctx.lineTo(0, 7 * s);
    ctx.lineTo(-5 * s, 2 * s);
    ctx.closePath();
    ctx.fill();
    // Gold cross
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(-1 * s, -3 * s, 2 * s, 7 * s);
    ctx.fillRect(-3 * s, -1 * s, 6 * s, 2 * s);
  } else if (item.type === 'ring') {
    // Glowing Gem Ring
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2 * s;
    ctx.beginPath();
    ctx.arc(0, 1 * s, 4 * s, 0, Math.PI * 2);
    ctx.stroke();
    // Mounted Jewel
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(0, -3 * s, 2.5 * s, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Gold coin pile
    ctx.fillStyle = '#eab308';
    ctx.beginPath();
    ctx.arc(-2 * s, 1 * s, 3 * s, 0, Math.PI * 2);
    ctx.arc(2 * s, 2 * s, 3.5 * s, 0, Math.PI * 2);
    ctx.arc(0, -1 * s, 3 * s, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}
