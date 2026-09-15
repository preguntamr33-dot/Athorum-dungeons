import { VisibilityState } from '../types';

/**
 * Procedural Tile & Environment Textures Renderer
 * Renders rich pixel/stylized canvas textures without using any emojis.
 */

// Helper to get pseudo-random deterministic number for a coordinate
function pseudoRandom(x: number, y: number, seed: number = 1): number {
  const n = Math.sin(x * 12.9898 + y * 78.233 + seed * 37.719) * 43758.5453;
  return n - Math.floor(n);
}

/**
 * Draws a textured stone brick wall with optional wall sconce torches
 */
export function drawWallTexture(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  tileSize: number,
  vis: VisibilityState,
  themeColor: string,
  gridX: number,
  gridY: number,
  hasFloorBelow: boolean = false,
  time: number = 0
) {
  const isVisible = vis === VisibilityState.VISIBLE;
  const baseColor = isVisible ? '#273549' : '#141d2b';
  const mortarColor = isVisible ? '#0f172a' : '#080d17';
  const highlightColor = isVisible ? '#3d4f68' : '#1e293b';
  const shadowColor = isVisible ? '#192333' : '#0b1018';

  // Base fill
  ctx.fillStyle = baseColor;
  ctx.fillRect(x, y, tileSize, tileSize);

  // Brick rows (3 rows of bricks per tile)
  const rowHeight = tileSize / 3;
  const brickGap = 1.5;

  for (let r = 0; r < 3; r++) {
    const rowY = y + r * rowHeight;
    const isOdd = (r + gridY) % 2 === 1;
    const offset = isOdd ? tileSize * 0.45 : 0;

    // Draw horizontal mortar line
    ctx.fillStyle = mortarColor;
    ctx.fillRect(x, rowY + rowHeight - brickGap, tileSize, brickGap);

    // Draw vertical mortar cuts
    const cut1 = x + ((offset + tileSize * 0.5) % tileSize);
    ctx.fillRect(cut1, rowY, brickGap, rowHeight);

    // Individual brick highlights & textures
    const brickRand = pseudoRandom(gridX * 3 + r, gridY * 3);
    const brickLight = isVisible 
      ? (brickRand > 0.6 ? highlightColor : brickRand < 0.3 ? shadowColor : baseColor)
      : baseColor;

    ctx.fillStyle = brickLight;
    ctx.fillRect(x + (isOdd ? 0 : 2), rowY + 1, (isOdd ? tileSize * 0.4 : tileSize * 0.45) - 2, rowHeight - brickGap - 2);

    // Subtle brick crack occasionally
    if (brickRand > 0.85) {
      ctx.strokeStyle = mortarColor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x + tileSize * 0.2, rowY + 2);
      ctx.lineTo(x + tileSize * 0.35, rowY + rowHeight * 0.6);
      ctx.stroke();
    }
  }

  // Top and left wall 3D bevel / chiseled stone edge
  ctx.fillStyle = highlightColor;
  ctx.fillRect(x, y, tileSize, 2);
  ctx.fillRect(x, y, 2, tileSize);

  // Bottom shadow
  ctx.fillStyle = shadowColor;
  ctx.fillRect(x, y + tileSize - 2, tileSize, 2);
  ctx.fillRect(x + tileSize - 2, y, 2, tileSize);

  // Occasional wall sconce with animated torch if visible and on a wall facing down or room edge
  const torchChance = (gridX * 17 + gridY * 31) % 11 === 0;
  if (torchChance && isVisible) {
    const torchX = x + tileSize / 2;
    const torchY = y + tileSize * 0.45;

    // Iron wall bracket
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(torchX - 2, torchY, 4, tileSize * 0.35);
    ctx.fillRect(torchX - 4, torchY + tileSize * 0.15, 8, 2);

    // Torch head (wood)
    ctx.fillStyle = '#78350f';
    ctx.fillRect(torchX - 2, torchY - 4, 4, 6);

    // Animated Flame
    const flicker = Math.sin(time * 0.008 + gridX * 2) * 1.5;
    const flameH = 7 + Math.sin(time * 0.012 + gridY * 3) * 2;

    // Outer warm glow
    const glowGrad = ctx.createRadialGradient(torchX, torchY - 6, 2, torchX, torchY - 6, tileSize * 0.9);
    glowGrad.addColorStop(0, 'rgba(251, 191, 36, 0.35)');
    glowGrad.addColorStop(0.5, 'rgba(245, 158, 11, 0.12)');
    glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(torchX, torchY - 6, tileSize * 0.9, 0, Math.PI * 2);
    ctx.fill();

    // Flame body (yellow/orange/red)
    ctx.fillStyle = '#ea580c';
    ctx.beginPath();
    ctx.ellipse(torchX + flicker * 0.3, torchY - 5, 4, flameH, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.ellipse(torchX + flicker * 0.5, torchY - 5, 2.5, flameH * 0.7, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(torchX + flicker * 0.2, torchY - 3, 1, 0, Math.PI * 2);
    ctx.fill();
  }
}

/**
 * Draws standard stone floor flagstones
 */
export function drawFloorTexture(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  tileSize: number,
  vis: VisibilityState,
  gridX: number,
  gridY: number
) {
  const isVisible = vis === VisibilityState.VISIBLE;
  const rand = pseudoRandom(gridX, gridY);

  // Subtle floor color variation
  const baseShade = isVisible
    ? rand > 0.7 ? '#1a2436' : rand < 0.3 ? '#141c2b' : '#172030'
    : '#0b111c';

  ctx.fillStyle = baseShade;
  ctx.fillRect(x, y, tileSize, tileSize);

  // 4 Flagstone pavers per tile
  const half = tileSize / 2;
  const mortar = isVisible ? 'rgba(15, 23, 42, 0.6)' : 'rgba(5, 8, 15, 0.8)';
  ctx.strokeStyle = mortar;
  ctx.lineWidth = 1;

  // Split lines
  ctx.beginPath();
  ctx.moveTo(x, y + half);
  ctx.lineTo(x + tileSize, y + half);
  ctx.moveTo(x + half, y);
  ctx.lineTo(x + half, y + tileSize);
  ctx.stroke();

  // Paver highlights
  if (isVisible) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.fillRect(x + 1, y + 1, half - 2, 1);
    ctx.fillRect(x + half + 1, y + half + 1, half - 2, 1);

    // Rare moss or pebble spot
    if (rand > 0.82) {
      ctx.fillStyle = 'rgba(16, 185, 129, 0.25)'; // Moss spot
      ctx.beginPath();
      ctx.arc(x + tileSize * (0.2 + rand * 0.5), y + tileSize * (0.2 + rand * 0.5), 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Border outline
  ctx.strokeStyle = isVisible ? 'rgba(71, 85, 105, 0.2)' : 'rgba(30, 41, 59, 0.3)';
  ctx.strokeRect(x, y, tileSize, tileSize);
}

/**
 * Draws rich wood plank flooring
 */
export function drawWoodTexture(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  tileSize: number,
  vis: VisibilityState,
  gridX: number,
  gridY: number
) {
  const isVisible = vis === VisibilityState.VISIBLE;
  const numPlanks = 4;
  const plankH = tileSize / numPlanks;

  for (let p = 0; p < numPlanks; p++) {
    const py = y + p * plankH;
    const plankRand = pseudoRandom(gridX, gridY * 4 + p);

    // Natural wood tones (warm amber-brown / walnut)
    let plankColor: string;
    if (isVisible) {
      plankColor = plankRand > 0.6 ? '#78350f' : plankRand > 0.3 ? '#854d0e' : '#652d0d';
    } else {
      plankColor = '#2b1406';
    }

    ctx.fillStyle = plankColor;
    ctx.fillRect(x, py, tileSize, plankH);

    // Wood grain lines
    if (isVisible) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.fillRect(x, py + plankH * 0.45, tileSize, 1);
      ctx.fillStyle = 'rgba(254, 215, 170, 0.08)';
      ctx.fillRect(x, py + 1, tileSize, 1);

      // Nails at the ends of the plank
      ctx.fillStyle = '#292524';
      ctx.fillRect(x + 3, py + plankH * 0.3, 1.5, 1.5);
      ctx.fillRect(x + tileSize - 4, py + plankH * 0.3, 1.5, 1.5);
    }

    // Plank seam
    ctx.fillStyle = isVisible ? '#361505' : '#140802';
    ctx.fillRect(x, py + plankH - 1, tileSize, 1);
  }

  // Border outline
  ctx.strokeStyle = isVisible ? 'rgba(120, 53, 15, 0.4)' : 'rgba(40, 18, 5, 0.5)';
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, tileSize, tileSize);
}

/**
 * Draws dynamic rippling water tile
 */
export function drawWaterTexture(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  tileSize: number,
  vis: VisibilityState,
  gridX: number,
  gridY: number,
  time: number
) {
  const isVisible = vis === VisibilityState.VISIBLE;

  // Deep underwater base
  ctx.fillStyle = isVisible ? '#0c4a6e' : '#041f2e';
  ctx.fillRect(x, y, tileSize, tileSize);

  // Animated wave calculation
  const waveOffset = Math.sin(time * 0.003 + gridX * 0.8 + gridY * 0.5) * 3;
  const waveOffset2 = Math.cos(time * 0.004 + gridY * 0.9) * 2;

  // Midtone water ripple
  ctx.fillStyle = isVisible ? '#0284c7' : '#034464';
  ctx.beginPath();
  ctx.arc(x + tileSize * 0.5 + waveOffset, y + tileSize * 0.5 + waveOffset2, tileSize * 0.4, 0, Math.PI * 2);
  ctx.fill();

  // Water highlight ripples
  if (isVisible) {
    ctx.strokeStyle = 'rgba(186, 230, 253, 0.45)';
    ctx.lineWidth = 1.5;

    // Wave ripple 1
    ctx.beginPath();
    ctx.ellipse(
      x + tileSize * 0.4 + waveOffset,
      y + tileSize * 0.35,
      tileSize * 0.3,
      tileSize * 0.12,
      0.1,
      0,
      Math.PI
    );
    ctx.stroke();

    // Wave ripple 2
    ctx.beginPath();
    ctx.ellipse(
      x + tileSize * 0.6 - waveOffset,
      y + tileSize * 0.7,
      tileSize * 0.25,
      tileSize * 0.1,
      -0.1,
      0,
      Math.PI
    );
    ctx.stroke();

    // Foam glints
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fillRect(x + tileSize * 0.3 + waveOffset, y + tileSize * 0.35, 2, 1);
    ctx.fillRect(x + tileSize * 0.7 - waveOffset, y + tileSize * 0.65, 2, 1);
  }

  // Water edge border
  ctx.strokeStyle = isVisible ? 'rgba(56, 189, 248, 0.3)' : 'rgba(12, 74, 110, 0.4)';
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, tileSize, tileSize);
}

/**
 * Draws wooden bridge crossing over water or chasms
 */
export function drawBridgeTexture(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  tileSize: number,
  vis: VisibilityState,
  gridX: number,
  gridY: number,
  time: number
) {
  // First draw water underneath
  drawWaterTexture(ctx, x, y, tileSize, vis, gridX, gridY, time);

  const isVisible = vis === VisibilityState.VISIBLE;

  // Side support ropes / logs
  const ropeColor = isVisible ? '#451a03' : '#1a0b02';
  ctx.fillStyle = ropeColor;
  ctx.fillRect(x, y + 2, tileSize, 3);
  ctx.fillRect(x, y + tileSize - 5, tileSize, 3);

  // Planks across (vertical planks)
  const numPlanks = 4;
  const pw = tileSize / numPlanks;

  for (let i = 0; i < numPlanks; i++) {
    const px = x + i * pw;
    const plankColor = isVisible
      ? i % 2 === 0 ? '#92400e' : '#78350f'
      : '#2c1406';

    ctx.fillStyle = plankColor;
    ctx.fillRect(px + 1, y + 3, pw - 2, tileSize - 6);

    // Wood highlight
    if (isVisible) {
      ctx.fillStyle = 'rgba(254, 215, 170, 0.15)';
      ctx.fillRect(px + 1, y + 4, pw - 2, 1);
      // Nail heads
      ctx.fillStyle = '#1c1917';
      ctx.fillRect(px + 2, y + 4, 1.5, 1.5);
      ctx.fillRect(px + 2, y + tileSize - 6, 1.5, 1.5);
    }
  }
}

/**
 * Draws animated volcanic lava pool
 */
export function drawLavaTexture(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  tileSize: number,
  vis: VisibilityState,
  gridX: number,
  gridY: number,
  time: number
) {
  const isVisible = vis === VisibilityState.VISIBLE;

  // Base dark magma
  ctx.fillStyle = isVisible ? '#7f1d1d' : '#330808';
  ctx.fillRect(x, y, tileSize, tileSize);

  // Magma flow calculation
  const flow = Math.sin(time * 0.002 + gridX * 0.7 + gridY * 0.6) * 4;

  // Molten orange swirl
  ctx.fillStyle = isVisible ? '#dc2626' : '#570e0e';
  ctx.beginPath();
  ctx.arc(x + tileSize * 0.5 + flow, y + tileSize * 0.5, tileSize * 0.42, 0, Math.PI * 2);
  ctx.fill();

  // White-hot core
  if (isVisible) {
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.ellipse(x + tileSize * 0.5 - flow * 0.5, y + tileSize * 0.5, tileSize * 0.25, tileSize * 0.12, 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Hot bubble
    const bubbleTime = (time * 0.004 + gridX * 3 + gridY * 7) % 6;
    if (bubbleTime < 3) {
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(x + tileSize * 0.35 + flow, y + tileSize * 0.35, bubbleTime * 1.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Crusty border
  ctx.strokeStyle = isVisible ? '#450a0a' : '#1f0404';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x, y, tileSize, tileSize);
}

/**
 * Draws carved stone stairs descending into the dark abyss (NO EMOJIS)
 */
export function drawStairsDownTexture(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  tileSize: number,
  vis: VisibilityState,
  time: number
) {
  const isVisible = vis === VisibilityState.VISIBLE;

  // Step 1: Base stone surround
  ctx.fillStyle = isVisible ? '#1e293b' : '#0f172a';
  ctx.fillRect(x, y, tileSize, tileSize);

  // Carved arch opening
  const pad = 3;
  const archW = tileSize - pad * 2;
  const archH = tileSize - pad * 2;
  const archX = x + pad;
  const archY = y + pad;

  // Dark doorway hole
  ctx.fillStyle = '#020617';
  ctx.fillRect(archX, archY, archW, archH);

  // 4 Concentric descending stone steps with perspective
  const steps = 4;
  for (let s = 0; s < steps; s++) {
    const stepH = (archH / steps);
    const sy = archY + s * stepH;
    const inset = s * 3;

    // Step face (top highlight)
    ctx.fillStyle = isVisible ? (s === 0 ? '#64748b' : s === 1 ? '#475569' : s === 2 ? '#334155' : '#1e293b') : '#1e293b';
    ctx.fillRect(archX + inset, sy, archW - inset * 2, 3);

    // Step tread
    ctx.fillStyle = isVisible ? (s === 0 ? '#475569' : s === 1 ? '#334155' : s === 2 ? '#1e293b' : '#0f172a') : '#0f172a';
    ctx.fillRect(archX + inset, sy + 3, archW - inset * 2, stepH - 3);

    // Riser shadow
    ctx.fillStyle = '#020617';
    ctx.fillRect(archX + inset, sy + stepH - 1, archW - inset * 2, 1);
  }

  // Stone arch border with carved keystones
  ctx.strokeStyle = isVisible ? '#f59e0b' : '#78350f';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(archX, archY, archW, archH);

  // Glowing magical descent glyph (animated chevron arrow)
  if (isVisible) {
    const pulse = (Math.sin(time * 0.006) + 1) / 2;
    ctx.fillStyle = `rgba(251, 191, 36, ${0.7 + pulse * 0.3})`;
    
    // Draw crisp chevron arrow
    const cx = x + tileSize / 2;
    const cy = y + tileSize * 0.55;
    const arrowW = tileSize * 0.25;

    ctx.beginPath();
    ctx.moveTo(cx - arrowW, cy - 4);
    ctx.lineTo(cx, cy + 4);
    ctx.lineTo(cx + arrowW, cy - 4);
    ctx.lineTo(cx, cy);
    ctx.closePath();
    ctx.fill();

    // Small label
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 8px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('BAJAR', cx, y + tileSize - 3);
  }
}

/**
 * Draws wooden treasure chest (Closed or Open) (NO EMOJIS)
 */
export function drawChestTexture(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  tileSize: number,
  vis: VisibilityState,
  isOpen: boolean
) {
  const isVisible = vis === VisibilityState.VISIBLE;
  const cx = x + tileSize / 2;
  const cy = y + tileSize / 2;
  const w = tileSize * 0.72;
  const h = tileSize * 0.58;
  const bx = cx - w / 2;
  const by = cy - h / 2 + (isOpen ? 2 : 0);

  // Ground drop shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
  ctx.beginPath();
  ctx.ellipse(cx, by + h + 2, w * 0.55, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  if (!isOpen) {
    // === CLOSED CHEST ===
    // Main wooden box body
    ctx.fillStyle = isVisible ? '#854d0e' : '#3c2406';
    ctx.fillRect(bx, by + h * 0.35, w, h * 0.65);

    // Domed lid
    ctx.fillStyle = isVisible ? '#a16207' : '#4a2c07';
    ctx.beginPath();
    ctx.ellipse(cx, by + h * 0.35, w / 2, h * 0.35, 0, Math.PI, 0);
    ctx.fill();

    // Wood plank seams
    ctx.strokeStyle = isVisible ? '#713f12' : '#291804';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(bx + w * 0.33, by + h * 0.35);
    ctx.lineTo(bx + w * 0.33, by + h);
    ctx.moveTo(bx + w * 0.66, by + h * 0.35);
    ctx.lineTo(bx + w * 0.66, by + h);
    ctx.stroke();

    // Iron reinforcing bands
    const ironColor = isVisible ? '#334155' : '#1e293b';
    const ironHighlight = isVisible ? '#64748b' : '#334155';
    ctx.fillStyle = ironColor;
    ctx.fillRect(bx + 3, by + 1, 4, h - 1);
    ctx.fillRect(bx + w - 7, by + 1, 4, h - 1);

    // Iron rivets
    ctx.fillStyle = ironHighlight;
    ctx.fillRect(bx + 4, by + 4, 2, 2);
    ctx.fillRect(bx + 4, by + h * 0.6, 2, 2);
    ctx.fillRect(bx + w - 6, by + 4, 2, 2);
    ctx.fillRect(bx + w - 6, by + h * 0.6, 2, 2);

    // Gold padlock in center
    ctx.fillStyle = isVisible ? '#f59e0b' : '#78350f';
    ctx.fillRect(cx - 3, by + h * 0.35 - 2, 6, 8);
    // Keyhole
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(cx - 1, by + h * 0.35 + 1, 2, 3);
  } else {
    // === OPEN CHEST ===
    // Chest base
    ctx.fillStyle = isVisible ? '#713f12' : '#2c1806';
    ctx.fillRect(bx, by + h * 0.45, w, h * 0.55);

    // Dark interior cavity
    ctx.fillStyle = '#1e1b18';
    ctx.fillRect(bx + 3, by + h * 0.45, w - 6, h * 0.3);

    // Sparkling gold & jewels inside
    if (isVisible) {
      ctx.fillStyle = '#fbbf24'; // Gold coins
      ctx.beginPath();
      ctx.arc(cx - 4, by + h * 0.55, 3, 0, Math.PI * 2);
      ctx.arc(cx + 1, by + h * 0.52, 3.5, 0, Math.PI * 2);
      ctx.arc(cx + 6, by + h * 0.57, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Ruby gem
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(cx - 2, by + h * 0.6, 2, 0, Math.PI * 2);
      ctx.fill();

      // Sapphire gem
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(cx + 4, by + h * 0.58, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Open lid flipped backward
    ctx.fillStyle = isVisible ? '#a16207' : '#4a2c07';
    ctx.beginPath();
    ctx.ellipse(cx, by + h * 0.25, w / 2, h * 0.22, 0, 0, Math.PI * 2);
    ctx.fill();

    // Iron bands
    ctx.fillStyle = isVisible ? '#334155' : '#1e293b';
    ctx.fillRect(bx + 3, by + h * 0.45, 4, h * 0.55);
    ctx.fillRect(bx + w - 7, by + h * 0.45, 4, h * 0.55);
  }
}

/**
 * Draws wooden stave barrel (NO EMOJIS)
 */
export function drawBarrelTexture(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  tileSize: number,
  vis: VisibilityState
) {
  const isVisible = vis === VisibilityState.VISIBLE;
  const cx = x + tileSize / 2;
  const cy = y + tileSize / 2;
  const w = tileSize * 0.62;
  const h = tileSize * 0.7;
  const bx = cx - w / 2;
  const by = cy - h / 2;

  // Drop shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
  ctx.beginPath();
  ctx.ellipse(cx, by + h + 2, w * 0.5, 3.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Barrel curved wooden body (convex staves)
  ctx.fillStyle = isVisible ? '#854d0e' : '#3c2406';
  ctx.beginPath();
  ctx.roundRect(bx, by, w, h, 8);
  ctx.fill();

  // Vertical wood stave seams
  ctx.strokeStyle = isVisible ? '#5c3307' : '#1f1203';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(bx + w * 0.25, by);
  ctx.lineTo(bx + w * 0.22, by + h);
  ctx.moveTo(bx + w * 0.5, by);
  ctx.lineTo(bx + w * 0.5, by + h);
  ctx.moveTo(bx + w * 0.75, by);
  ctx.lineTo(bx + w * 0.78, by + h);
  ctx.stroke();

  // Dark iron hoops (top, middle, bottom)
  const hoopColor = isVisible ? '#1e293b' : '#0f172a';
  ctx.fillStyle = hoopColor;
  ctx.fillRect(bx + 1, by + 4, w - 2, 3);
  ctx.fillRect(bx - 1, by + h * 0.5 - 2, w + 2, 4);
  ctx.fillRect(bx + 1, by + h - 7, w - 2, 3);

  // Top wood bung plug
  ctx.fillStyle = isVisible ? '#a16207' : '#4a2c07';
  ctx.beginPath();
  ctx.arc(cx - 2, by + h * 0.5, 2.5, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * Draws mystical stone shrine with floating glowing crystal (NO EMOJIS)
 */
export function drawShrineTexture(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  tileSize: number,
  vis: VisibilityState,
  time: number
) {
  const isVisible = vis === VisibilityState.VISIBLE;
  const cx = x + tileSize / 2;
  const cy = y + tileSize / 2;

  // Base stone pedestal (stepped plinth)
  ctx.fillStyle = isVisible ? '#334155' : '#1e293b';
  ctx.fillRect(cx - tileSize * 0.35, cy + tileSize * 0.15, tileSize * 0.7, tileSize * 0.25);

  ctx.fillStyle = isVisible ? '#475569' : '#334155';
  ctx.fillRect(cx - tileSize * 0.25, cy + tileSize * 0.05, tileSize * 0.5, tileSize * 0.15);

  // Pedestal top rim
  ctx.fillStyle = isVisible ? '#64748b' : '#334155';
  ctx.fillRect(cx - tileSize * 0.28, cy + tileSize * 0.05, tileSize * 0.56, 3);

  // Glowing runic engravings on pedestal
  if (isVisible) {
    ctx.strokeStyle = '#c084fc';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx - 6, cy + tileSize * 0.22);
    ctx.lineTo(cx, cy + tileSize * 0.18);
    ctx.lineTo(cx + 6, cy + tileSize * 0.22);
    ctx.stroke();
  }

  // Floating mystical diamond crystal (levitating bobbing animation)
  const bob = Math.sin(time * 0.005) * 3;
  const crystalY = cy - tileSize * 0.18 + bob;
  const cSize = tileSize * 0.22;

  // Arcane glow aura
  if (isVisible) {
    const aura = ctx.createRadialGradient(cx, crystalY, 2, cx, crystalY, tileSize * 0.6);
    aura.addColorStop(0, 'rgba(168, 85, 247, 0.6)');
    aura.addColorStop(0.6, 'rgba(192, 132, 252, 0.15)');
    aura.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = aura;
    ctx.beginPath();
    ctx.arc(cx, crystalY, tileSize * 0.6, 0, Math.PI * 2);
    ctx.fill();
  }

  // Crystal facets
  ctx.fillStyle = isVisible ? '#a855f7' : '#581c87';
  ctx.beginPath();
  ctx.moveTo(cx, crystalY - cSize);
  ctx.lineTo(cx + cSize * 0.7, crystalY);
  ctx.lineTo(cx, crystalY + cSize);
  ctx.lineTo(cx - cSize * 0.7, crystalY);
  ctx.closePath();
  ctx.fill();

  // Crystal highlight facet
  if (isVisible) {
    ctx.fillStyle = '#e9d5ff';
    ctx.beginPath();
    ctx.moveTo(cx, crystalY - cSize);
    ctx.lineTo(cx, crystalY + cSize);
    ctx.lineTo(cx - cSize * 0.7, crystalY);
    ctx.closePath();
    ctx.fill();
  }
}

/**
 * Draws spike trap plate (NO EMOJIS)
 */
export function drawTrapTexture(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  tileSize: number,
  vis: VisibilityState
) {
  const isVisible = vis === VisibilityState.VISIBLE;
  const cx = x + tileSize / 2;
  const cy = y + tileSize / 2;
  const plateW = tileSize * 0.65;
  const plateH = tileSize * 0.65;

  // Dark recessed steel plate
  ctx.fillStyle = isVisible ? '#1e293b' : '#0f172a';
  ctx.fillRect(cx - plateW / 2, cy - plateH / 2, plateW, plateH);

  // Plate border
  ctx.strokeStyle = isVisible ? '#991b1b' : '#450a0a';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(cx - plateW / 2, cy - plateH / 2, plateW, plateH);

  // 4 Spike Holes with sharp steel spikes
  const holes = [
    { dx: -plateW * 0.25, dy: -plateH * 0.25 },
    { dx: plateW * 0.25, dy: -plateH * 0.25 },
    { dx: -plateW * 0.25, dy: plateH * 0.25 },
    { dx: plateW * 0.25, dy: plateH * 0.25 },
  ];

  for (const h of holes) {
    const hx = cx + h.dx;
    const hy = cy + h.dy;

    // Dark pit hole
    ctx.fillStyle = '#020617';
    ctx.beginPath();
    ctx.arc(hx, hy, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Pointed steel spike
    if (isVisible) {
      ctx.fillStyle = '#cbd5e1';
      ctx.beginPath();
      ctx.moveTo(hx - 2, hy + 2);
      ctx.lineTo(hx, hy - 4);
      ctx.lineTo(hx + 2, hy + 2);
      ctx.closePath();
      ctx.fill();

      // Blood-rusted tip
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.moveTo(hx - 1, hy - 1);
      ctx.lineTo(hx, hy - 4);
      ctx.lineTo(hx + 1, hy - 1);
      ctx.closePath();
      ctx.fill();
    }
  }
}

/**
 * Draws wandering hooded merchant NPC with booth and lantern (NO EMOJIS)
 */
export function drawMerchantNPCTexture(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  tileSize: number,
  vis: VisibilityState,
  time: number
) {
  const isVisible = vis === VisibilityState.VISIBLE;
  const cx = x + tileSize / 2;
  const cy = y + tileSize / 2;

  // Ground shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.beginPath();
  ctx.ellipse(cx, cy + tileSize * 0.35, tileSize * 0.38, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Merchant Cloak & Hood
  // Body (Dark teal/brown traveler's cloak)
  ctx.fillStyle = isVisible ? '#14532d' : '#052e16';
  ctx.beginPath();
  ctx.moveTo(cx - 8, cy + tileSize * 0.25);
  ctx.lineTo(cx - 10, cy - 2);
  ctx.lineTo(cx + 10, cy - 2);
  ctx.lineTo(cx + 8, cy + tileSize * 0.25);
  ctx.closePath();
  ctx.fill();

  // Leather backpack on side
  ctx.fillStyle = isVisible ? '#78350f' : '#3b1805';
  ctx.fillRect(cx + 7, cy - 4, 6, 12);
  ctx.fillStyle = '#ca8a04';
  ctx.fillRect(cx + 8, cy, 4, 2);

  // Hood & Face
  ctx.fillStyle = isVisible ? '#166534' : '#064e3b';
  ctx.beginPath();
  ctx.arc(cx, cy - 8, 8, 0, Math.PI * 2);
  ctx.fill();

  // Shadow inside hood with friendly glowing eyes
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.ellipse(cx, cy - 7, 5.5, 4.5, 0, 0, Math.PI * 2);
  ctx.fill();

  if (isVisible) {
    ctx.fillStyle = '#fde047';
    ctx.fillRect(cx - 3, cy - 8, 1.5, 1.5);
    ctx.fillRect(cx + 1.5, cy - 8, 1.5, 1.5);
  }

  // Wooden Merchant Counter in front
  ctx.fillStyle = isVisible ? '#854d0e' : '#3c2406';
  ctx.fillRect(cx - tileSize * 0.4, cy + 4, tileSize * 0.8, tileSize * 0.28);
  ctx.strokeStyle = isVisible ? '#5c3307' : '#201102';
  ctx.lineWidth = 1;
  ctx.strokeRect(cx - tileSize * 0.4, cy + 4, tileSize * 0.8, tileSize * 0.28);

  // Goods on counter (Potion phial & coins)
  if (isVisible) {
    // Red potion phial
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(cx - 8, cy + 1, 3.5, 5);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(cx - 7, cy - 1, 1.5, 2);

    // Blue potion phial
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(cx - 2, cy + 1, 3.5, 5);

    // Gold coin stack
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(cx + 5, cy + 3, 4, 3);
  }

  // Hanging Brass Lantern
  if (isVisible) {
    const lanternX = cx - 11;
    const lanternY = cy - 2;

    // Pole / wire
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx - 6, cy - 12);
    ctx.lineTo(lanternX, lanternY - 4);
    ctx.stroke();

    // Lantern warm glow
    const lGlow = ctx.createRadialGradient(lanternX, lanternY, 1, lanternX, lanternY, 16);
    lGlow.addColorStop(0, 'rgba(251, 191, 36, 0.4)');
    lGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = lGlow;
    ctx.beginPath();
    ctx.arc(lanternX, lanternY, 16, 0, Math.PI * 2);
    ctx.fill();

    // Lantern metal cage & flame
    ctx.fillStyle = '#d97706';
    ctx.fillRect(lanternX - 2.5, lanternY - 3, 5, 6);
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(lanternX - 1.5, lanternY - 1.5, 3, 3);
  }

  // Label
  if (isVisible) {
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 8px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('TIENDA', cx, y + 5);
  }
}

/**
 * Explosive Barrel: Red volatile gunpowder keg with warning hazard markings
 */
export function drawBarrelExplosiveTexture(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  tileSize: number,
  vis: VisibilityState,
  time: number = 0
) {
  const isVisible = vis === VisibilityState.VISIBLE;
  const cx = x + tileSize / 2;
  const cy = y + tileSize / 2;
  const bw = tileSize * 0.58;
  const bh = tileSize * 0.72;

  // Shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
  ctx.beginPath();
  ctx.ellipse(cx, y + tileSize - 3, bw * 0.6, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Red gunpowder keg body
  ctx.fillStyle = isVisible ? '#b91c1c' : '#450a0a';
  ctx.beginPath();
  ctx.roundRect(cx - bw / 2, cy - bh / 2, bw, bh, 3);
  ctx.fill();

  // Iron reinforcement bands
  ctx.fillStyle = isVisible ? '#1e293b' : '#0f172a';
  ctx.fillRect(cx - bw / 2, cy - bh * 0.35, bw, 2.5);
  ctx.fillRect(cx - bw / 2, cy + bh * 0.25, bw, 2.5);

  // Skull / Hazard Fire Symbol
  if (isVisible) {
    ctx.fillStyle = '#facc15';
    ctx.fillRect(cx - 3, cy - 2, 6, 4);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(cx - 1.5, cy - 1, 3, 2);

    // Burning sparkling fuse on top
    const spark = Math.sin(time * 0.02) * 1.5;
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(cx, cy - bh / 2);
    ctx.lineTo(cx + 3, cy - bh / 2 - 4);
    ctx.stroke();

    // Spark flame
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(cx + 3 + spark * 0.5, cy - bh / 2 - 5, 2 + Math.abs(spark) * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }
}

/**
 * Cracked Wall: Fractured stone wall that can be destroyed to reveal secrets
 */
export function drawCrackedWallTexture(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  tileSize: number,
  vis: VisibilityState,
  themeColor: string,
  gridX: number,
  gridY: number
) {
  // Draw base wall first
  drawWallTexture(ctx, x, y, tileSize, vis, themeColor, gridX, gridY);

  if (vis === VisibilityState.UNEXPLORED) return;

  const isVisible = vis === VisibilityState.VISIBLE;

  // Prominent fissures / cracks
  ctx.strokeStyle = isVisible ? '#020617' : '#000000';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x + tileSize * 0.3, y + 2);
  ctx.lineTo(x + tileSize * 0.45, y + tileSize * 0.4);
  ctx.lineTo(x + tileSize * 0.35, y + tileSize * 0.7);
  ctx.lineTo(x + tileSize * 0.6, y + tileSize - 2);
  ctx.stroke();

  // Branch crack
  ctx.beginPath();
  ctx.moveTo(x + tileSize * 0.45, y + tileSize * 0.4);
  ctx.lineTo(x + tileSize * 0.75, y + tileSize * 0.55);
  ctx.stroke();

  // Crumbling stone pebbles at base
  if (isVisible) {
    ctx.fillStyle = '#475569';
    ctx.fillRect(x + tileSize * 0.35, y + tileSize - 4, 3, 2.5);
    ctx.fillRect(x + tileSize * 0.55, y + tileSize - 3, 2.5, 2);
  }
}

/**
 * Acid Puddle: Bubbling green toxic pool
 */
export function drawAcidTexture(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  tileSize: number,
  vis: VisibilityState,
  time: number = 0
) {
  const isVisible = vis === VisibilityState.VISIBLE;

  // Floor border
  ctx.fillStyle = isVisible ? '#064e3b' : '#022c22';
  ctx.fillRect(x, y, tileSize, tileSize);

  // Toxic pool
  ctx.fillStyle = isVisible ? '#15803d' : '#052e16';
  ctx.beginPath();
  ctx.ellipse(x + tileSize / 2, y + tileSize / 2, tileSize * 0.44, tileSize * 0.38, 0, 0, Math.PI * 2);
  ctx.fill();

  // Lighter glowing sludge core
  if (isVisible) {
    ctx.fillStyle = 'rgba(74, 222, 128, 0.4)';
    ctx.beginPath();
    ctx.ellipse(x + tileSize / 2, y + tileSize / 2, tileSize * 0.3, tileSize * 0.25, 0, 0, Math.PI * 2);
    ctx.fill();

    // Animated rising acid bubbles
    for (let b = 0; b < 3; b++) {
      const bTime = (time * 0.002 + b * 1.8) % 3;
      const bx = x + tileSize * (0.3 + b * 0.22);
      const by = y + tileSize * (0.65 - bTime * 0.15);
      const bRad = 1.5 + Math.sin(time * 0.005 + b) * 0.8;

      ctx.fillStyle = '#86efac';
      ctx.beginPath();
      ctx.arc(bx, by, Math.max(1, bRad), 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

/**
 * Slippery Ice: Crystalline glacial floor
 */
export function drawIceTexture(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  tileSize: number,
  vis: VisibilityState
) {
  const isVisible = vis === VisibilityState.VISIBLE;

  ctx.fillStyle = isVisible ? '#0284c7' : '#0c4a6e';
  ctx.fillRect(x, y, tileSize, tileSize);

  if (isVisible) {
    // Frost sheen diagonal reflection
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.beginPath();
    ctx.moveTo(x + 2, y + 2);
    ctx.lineTo(x + tileSize * 0.5, y + 2);
    ctx.lineTo(x + 2, y + tileSize * 0.5);
    ctx.closePath();
    ctx.fill();

    // Frost crack lines
    ctx.strokeStyle = 'rgba(224, 242, 254, 0.6)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + tileSize * 0.2, y + tileSize * 0.3);
    ctx.lineTo(x + tileSize * 0.6, y + tileSize * 0.7);
    ctx.lineTo(x + tileSize * 0.8, y + tileSize * 0.65);
    ctx.stroke();
  }
}

/**
 * Spider Web: Sticky web netting slowing movement
 */
export function drawWebTexture(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  tileSize: number,
  vis: VisibilityState
) {
  drawFloorTexture(ctx, x, y, tileSize, vis, 0, 0);

  if (vis === VisibilityState.UNEXPLORED) return;

  const isVisible = vis === VisibilityState.VISIBLE;
  ctx.strokeStyle = isVisible ? 'rgba(241, 245, 249, 0.5)' : 'rgba(148, 163, 184, 0.25)';
  ctx.lineWidth = 1;

  // Web spokes radiating from corner or center
  const cx = x + tileSize * 0.4;
  const cy = y + tileSize * 0.4;

  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(cx, cy);
  ctx.moveTo(x + tileSize, y);
  ctx.lineTo(cx, cy);
  ctx.moveTo(x, y + tileSize);
  ctx.lineTo(cx, cy);
  ctx.moveTo(x + tileSize, y + tileSize);
  ctx.lineTo(cx, cy);

  // Concentric arc rings
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy, tileSize * 0.2, 0, Math.PI * 2);
  ctx.arc(cx, cy, tileSize * 0.35, 0, Math.PI * 2);
  ctx.stroke();
}

/**
 * Blood Shrine: Dark sacrificial altar
 */
export function drawBloodShrineTexture(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  tileSize: number,
  vis: VisibilityState,
  time: number = 0
) {
  drawFloorTexture(ctx, x, y, tileSize, vis, 0, 0);

  const isVisible = vis === VisibilityState.VISIBLE;
  const cx = x + tileSize / 2;
  const cy = y + tileSize / 2;

  // Dark obsidian plinth
  ctx.fillStyle = isVisible ? '#1c1917' : '#0c0a09';
  ctx.fillRect(cx - tileSize * 0.35, cy - tileSize * 0.3, tileSize * 0.7, tileSize * 0.6);

  // Blood basin on top
  ctx.fillStyle = isVisible ? '#991b1b' : '#450a0a';
  ctx.beginPath();
  ctx.ellipse(cx, cy - tileSize * 0.05, tileSize * 0.25, tileSize * 0.15, 0, 0, Math.PI * 2);
  ctx.fill();

  // Pulsing crimson rune glow
  if (isVisible) {
    const pulse = Math.sin(time * 0.005);
    ctx.strokeStyle = `rgba(239, 68, 68, ${0.5 + pulse * 0.3})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy - tileSize * 0.05, tileSize * 0.32, 0, Math.PI * 2);
    ctx.stroke();

    // Red skull symbol
    ctx.fillStyle = '#f43f5e';
    ctx.beginPath();
    ctx.arc(cx, cy - tileSize * 0.05, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }
}

/**
 * Arcane Obelisk: Ancient stone pillar radiating celestial powers
 */
export function drawObeliskTexture(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  tileSize: number,
  vis: VisibilityState,
  time: number = 0
) {
  drawFloorTexture(ctx, x, y, tileSize, vis, 0, 0);

  const isVisible = vis === VisibilityState.VISIBLE;
  const cx = x + tileSize / 2;
  const cy = y + tileSize / 2;

  // Shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.beginPath();
  ctx.ellipse(cx, y + tileSize - 3, tileSize * 0.3, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Tapered stone pillar
  ctx.fillStyle = isVisible ? '#334155' : '#1e293b';
  ctx.beginPath();
  ctx.moveTo(cx - tileSize * 0.2, y + tileSize - 4);
  ctx.lineTo(cx - tileSize * 0.1, y + 4);
  ctx.lineTo(cx, y + 1); // point
  ctx.lineTo(cx + tileSize * 0.1, y + 4);
  ctx.lineTo(cx + tileSize * 0.2, y + tileSize - 4);
  ctx.closePath();
  ctx.fill();

  // Floating glowing arcane crystal on top
  if (isVisible) {
    const floatY = Math.sin(time * 0.005) * 2;
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.moveTo(cx, y - 2 + floatY);
    ctx.lineTo(cx - 3, y + 2 + floatY);
    ctx.lineTo(cx, y + 6 + floatY);
    ctx.lineTo(cx + 3, y + 2 + floatY);
    ctx.closePath();
    ctx.fill();

    // Cyan energy aura
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }
}

