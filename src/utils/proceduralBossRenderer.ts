import { Monster } from '../types';
import { ProceduralBossData } from './proceduralBosses';

/**
 * Procedural Boss Canvas Renderer
 * Renders epic, high-detail pixel/stylized procedural bosses with elemental auras,
 * animated wings/limbs, horns, crowns, and enrage states without any emojis.
 */
export function drawProceduralBossSprite(
  ctx: CanvasRenderingContext2D,
  monster: Monster,
  cx: number,
  cy: number,
  size: number,
  time: number
) {
  const bossData = monster.bossData as ProceduralBossData | undefined;
  const s = size / 32;
  const isEnraged = bossData ? bossData.phase === 2 || bossData.hasEnraged : monster.hp <= monster.maxHp * 0.5;
  const primaryColor = bossData ? bossData.primaryColor : monster.color || '#dc2626';
  const accentColor = bossData ? bossData.accentColor : '#fbbf24';
  const archetype = bossData?.archetype || 'colossus';

  ctx.save();
  ctx.translate(cx, cy);

  // 1. Grand Elemental Aura Pulse
  const auraPulse = Math.sin(time * 0.006) * (isEnraged ? 6 : 3) * s;
  const auraRad = 18 * s + auraPulse;
  const auraGrad = ctx.createRadialGradient(0, 0, 4 * s, 0, 0, auraRad);
  auraGrad.addColorStop(0, `${primaryColor}66`);
  auraGrad.addColorStop(0.7, `${accentColor}33`);
  auraGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = auraGrad;
  ctx.beginPath();
  ctx.arc(0, 0, auraRad, 0, Math.PI * 2);
  ctx.fill();

  // 2. Rotating Arcane Energy Glyphs around Boss
  const rot = time * (isEnraged ? 0.005 : 0.002);
  ctx.strokeStyle = `${accentColor}88`;
  ctx.lineWidth = 1.5 * s;
  ctx.beginPath();
  ctx.arc(0, 0, 16 * s, rot, rot + Math.PI * 0.7);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 0, 16 * s, rot + Math.PI, rot + Math.PI * 1.7);
  ctx.stroke();

  // 3. Archetype-Specific Geometry
  switch (archetype) {
    case 'demon': {
      // Flapping Demonic Wings
      const flap = Math.sin(time * 0.009) * 4 * s;
      ctx.fillStyle = '#450a0a';
      // Left wing
      ctx.beginPath();
      ctx.moveTo(-6 * s, -2 * s);
      ctx.lineTo(-20 * s, -16 * s + flap);
      ctx.lineTo(-18 * s, 2 * s);
      ctx.lineTo(-12 * s, 6 * s);
      ctx.closePath();
      ctx.fill();
      // Right wing
      ctx.beginPath();
      ctx.moveTo(6 * s, -2 * s);
      ctx.lineTo(20 * s, -16 * s + flap);
      ctx.lineTo(18 * s, 2 * s);
      ctx.lineTo(12 * s, 6 * s);
      ctx.closePath();
      ctx.fill();

      // Wing bones highlight
      ctx.strokeStyle = primaryColor;
      ctx.lineWidth = 1.5 * s;
      ctx.beginPath();
      ctx.moveTo(-6 * s, -2 * s);
      ctx.lineTo(-20 * s, -16 * s + flap);
      ctx.moveTo(6 * s, -2 * s);
      ctx.lineTo(20 * s, -16 * s + flap);
      ctx.stroke();

      // Muscular Torso
      ctx.fillStyle = primaryColor;
      ctx.beginPath();
      ctx.roundRect(-8 * s, -4 * s, 16 * s, 15 * s, 3 * s);
      ctx.fill();

      // Demon Head & Horns
      ctx.fillStyle = '#1c1917';
      ctx.beginPath();
      ctx.arc(0, -9 * s, 6.5 * s, 0, Math.PI * 2);
      ctx.fill();

      // Giant curved horns
      ctx.fillStyle = accentColor;
      ctx.beginPath();
      ctx.moveTo(-5 * s, -11 * s);
      ctx.quadraticCurveTo(-15 * s, -20 * s, -14 * s, -8 * s);
      ctx.lineTo(-3 * s, -9 * s);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(5 * s, -11 * s);
      ctx.quadraticCurveTo(15 * s, -20 * s, 14 * s, -8 * s);
      ctx.lineTo(3 * s, -9 * s);
      ctx.closePath();
      ctx.fill();
      break;
    }

    case 'lich': {
      // Floating royal tattered robe
      const sway = Math.sin(time * 0.005) * 2 * s;
      ctx.fillStyle = '#1e1b4b';
      ctx.beginPath();
      ctx.moveTo(-8 * s, -4 * s);
      ctx.lineTo(-12 * s + sway, 14 * s);
      ctx.lineTo(12 * s + sway, 14 * s);
      ctx.lineTo(8 * s, -4 * s);
      ctx.closePath();
      ctx.fill();

      // Dark chestplate with glowing crystal
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-6 * s, -4 * s, 12 * s, 10 * s);
      ctx.fillStyle = accentColor;
      ctx.beginPath();
      ctx.arc(0, 1 * s, 3 * s, 0, Math.PI * 2);
      ctx.fill();

      // Skeletal Skull
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.arc(0, -9 * s, 6 * s, 0, Math.PI * 2);
      ctx.fill();

      // Golden Crown of Thorns
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.moveTo(-7 * s, -11 * s);
      ctx.lineTo(-8 * s, -18 * s);
      ctx.lineTo(-4 * s, -13 * s);
      ctx.lineTo(0, -19 * s);
      ctx.lineTo(4 * s, -13 * s);
      ctx.lineTo(8 * s, -18 * s);
      ctx.lineTo(7 * s, -11 * s);
      ctx.closePath();
      ctx.fill();

      // Levitating Arcane Grimoire / Floating Orb
      const orbFloat = Math.sin(time * 0.007) * 3 * s;
      ctx.fillStyle = accentColor;
      ctx.beginPath();
      ctx.arc(11 * s, -3 * s + orbFloat, 3.5 * s, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'void_herald': {
      // Writhing Shadow Tentacles
      for (let t = 0; t < 4; t++) {
        const tAngle = (t / 4) * Math.PI * 2 + time * 0.004;
        const tx = Math.cos(tAngle) * 14 * s;
        const ty = Math.sin(tAngle) * 14 * s;
        ctx.strokeStyle = primaryColor;
        ctx.lineWidth = 3 * s;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(tx * 0.5, ty * 0.5, tx, ty);
        ctx.stroke();
      }

      // Cosmic Core Body
      ctx.fillStyle = '#09090b';
      ctx.beginPath();
      ctx.arc(0, 0, 9 * s, 0, Math.PI * 2);
      ctx.fill();

      // Eldritch Central Eye Cluster
      ctx.fillStyle = accentColor;
      ctx.beginPath();
      ctx.ellipse(0, -1 * s, 4 * s, 6 * s, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#000000';
      ctx.fillRect(-1 * s, -3 * s, 2 * s, 4 * s);
      break;
    }

    case 'frost_titan': {
      // Glacial Crystal Shoulders
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.moveTo(-10 * s, -10 * s);
      ctx.lineTo(-16 * s, -4 * s);
      ctx.lineTo(-8 * s, 2 * s);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(10 * s, -10 * s);
      ctx.lineTo(16 * s, -4 * s);
      ctx.lineTo(8 * s, 2 * s);
      ctx.closePath();
      ctx.fill();

      // Solid Frost Stone Body
      ctx.fillStyle = '#0c4a6e';
      ctx.beginPath();
      ctx.roundRect(-9 * s, -5 * s, 18 * s, 16 * s, 4 * s);
      ctx.fill();

      // Helmet & Cold Horns
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.arc(0, -9 * s, 7 * s, 0, Math.PI * 2);
      ctx.fill();

      // Ice Spikes on Crown
      ctx.fillStyle = '#e0f2fe';
      ctx.beginPath();
      ctx.moveTo(-6 * s, -11 * s);
      ctx.lineTo(-9 * s, -18 * s);
      ctx.lineTo(-3 * s, -13 * s);
      ctx.lineTo(0, -20 * s);
      ctx.lineTo(3 * s, -13 * s);
      ctx.lineTo(9 * s, -18 * s);
      ctx.lineTo(6 * s, -11 * s);
      ctx.closePath();
      ctx.fill();
      break;
    }

    case 'corrupted_knight': {
      // Royal War Cloak
      ctx.fillStyle = '#4c0519';
      ctx.fillRect(-8 * s, -4 * s, 16 * s, 18 * s);

      // Heavy Dark Plate
      ctx.fillStyle = '#18181b';
      ctx.fillRect(-7 * s, -5 * s, 14 * s, 14 * s);
      ctx.fillStyle = primaryColor;
      ctx.fillRect(-5 * s, -3 * s, 10 * s, 2 * s);

      // Great Helm
      ctx.fillStyle = '#27272a';
      ctx.beginPath();
      ctx.arc(0, -9 * s, 6.5 * s, 0, Math.PI * 2);
      ctx.fill();

      // Helm Crest Plume
      ctx.fillStyle = primaryColor;
      ctx.beginPath();
      ctx.moveTo(-2 * s, -14 * s);
      ctx.quadraticCurveTo(0, -22 * s, 6 * s, -16 * s);
      ctx.lineTo(2 * s, -14 * s);
      ctx.closePath();
      ctx.fill();

      // Giant Zweihander Greatsword
      ctx.fillStyle = '#71717a';
      ctx.fillRect(9 * s, -18 * s, 3 * s, 28 * s);
      ctx.fillStyle = accentColor;
      ctx.fillRect(7 * s, -10 * s, 7 * s, 2 * s);
      break;
    }

    case 'hydra': {
      // Beast Chitinous Body
      ctx.fillStyle = '#14532d';
      ctx.beginPath();
      ctx.ellipse(0, 4 * s, 10 * s, 11 * s, 0, 0, Math.PI * 2);
      ctx.fill();

      // Multiple serpentine heads swaying
      for (let h = -1; h <= 1; h++) {
        const hSway = Math.sin(time * 0.006 + h * 1.5) * 3 * s;
        const hx = h * 8 * s + hSway;
        const hy = -8 * s - Math.abs(h) * 2 * s;

        // Neck
        ctx.strokeStyle = '#166534';
        ctx.lineWidth = 4 * s;
        ctx.beginPath();
        ctx.moveTo(h * 4 * s, 0);
        ctx.lineTo(hx, hy);
        ctx.stroke();

        // Head
        ctx.fillStyle = '#15803d';
        ctx.beginPath();
        ctx.arc(hx, hy, 4 * s, 0, Math.PI * 2);
        ctx.fill();

        // Glowing venom eyes
        ctx.fillStyle = accentColor;
        ctx.beginPath();
        ctx.arc(hx - 1.5 * s, hy - 1 * s, 1.2 * s, 0, Math.PI * 2);
        ctx.arc(hx + 1.5 * s, hy - 1 * s, 1.2 * s, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }

    case 'colossus':
    default: {
      // Stone/Iron Runic Golem
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.roundRect(-10 * s, -6 * s, 20 * s, 18 * s, 4 * s);
      ctx.fill();

      // Stone Head
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(0, -10 * s, 7 * s, 0, Math.PI * 2);
      ctx.fill();

      // Glowing Runic Core in Chest
      ctx.fillStyle = accentColor;
      ctx.beginPath();
      ctx.arc(0, 2 * s, 4 * s, 0, Math.PI * 2);
      ctx.fill();

      // Stone Horns / Spikes
      ctx.fillStyle = '#475569';
      ctx.fillRect(-8 * s, -16 * s, 3 * s, 7 * s);
      ctx.fillRect(5 * s, -16 * s, 3 * s, 7 * s);

      // Heavy Iron Fists
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(-11 * s, 6 * s, 4.5 * s, 0, Math.PI * 2);
      ctx.arc(11 * s, 6 * s, 4.5 * s, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
  }

  // 4. Burning Soul-Fire Eyes (Flaming in Phase 2!)
  const eyeColor = isEnraged ? '#ef4444' : accentColor;
  ctx.fillStyle = eyeColor;
  ctx.beginPath();
  ctx.arc(-3 * s, -9 * s, 1.8 * s, 0, Math.PI * 2);
  ctx.arc(3 * s, -9 * s, 1.8 * s, 0, Math.PI * 2);
  ctx.fill();

  // If enraged, dramatic fire embers from eyes!
  if (isEnraged) {
    const fireFlicker = Math.sin(time * 0.02) * 2 * s;
    ctx.fillStyle = '#f97316';
    ctx.fillRect(-4 * s, -13 * s + fireFlicker, 2 * s, 3 * s);
    ctx.fillRect(2 * s, -13 * s - fireFlicker, 2 * s, 3 * s);
  }

  // 5. Boss Crown / Star Badge Over Head
  ctx.fillStyle = '#f59e0b';
  ctx.beginPath();
  ctx.arc(0, -18 * s, 2.5 * s, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}
