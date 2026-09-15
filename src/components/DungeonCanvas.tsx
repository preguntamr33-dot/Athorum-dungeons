import React, { useEffect, useRef, useState } from 'react';
import { DungeonMap, FloatingText, Item, PlayerClassId, Position, VisibilityState } from '../types';
import { 
  drawBridgeTexture, 
  drawFloorTexture, 
  drawLavaTexture, 
  drawWallTexture, 
  drawWaterTexture, 
  drawWoodTexture,
  drawStairsDownTexture,
  drawChestTexture,
  drawBarrelTexture,
  drawShrineTexture,
  drawTrapTexture,
  drawMerchantNPCTexture,
  drawBarrelExplosiveTexture,
  drawCrackedWallTexture,
  drawAcidTexture,
  drawIceTexture,
  drawWebTexture,
  drawBloodShrineTexture,
  drawObeliskTexture
} from '../utils/tileTextures';
import { 
  drawGroundItemSprite, 
  drawMonsterCharacter, 
  drawPlayerCharacter 
} from '../utils/characterSprites';

interface DungeonCanvasProps {
  dungeon: DungeonMap;
  playerPos: Position;
  playerClassId: PlayerClassId;
  equippedWeapon?: Item | null;
  floatingTexts: FloatingText[];
  onTileClick: (x: number, y: number) => void;
  onSwipeMove?: (dx: number, dy: number) => void;
}

export const DungeonCanvas: React.FC<DungeonCanvasProps> = ({
  dungeon,
  playerPos,
  playerClassId,
  equippedWeapon,
  floatingTexts,
  onTileClick,
  onSwipeMove,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [dimensions, setDimensions] = useState({ width: 360, height: 360 });

  // Touch tracking for swipe
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

  // Resize observer to fill container cleanly
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setDimensions({
            width: Math.floor(width),
            height: Math.floor(height),
          });
        }
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Continuous animation loop for dynamic water, torches, lava and breathing characters
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrameId: number;

    const render = () => {
      const time = Date.now();
      const dpr = window.devicePixelRatio || 1;

      // Handle HiDPI scaling
      if (canvas.width !== dimensions.width * dpr || canvas.height !== dimensions.height * dpr) {
        canvas.width = dimensions.width * dpr;
        canvas.height = dimensions.height * dpr;
      }
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);

      const tileSize = Math.max(34, Math.min(48, Math.floor(dimensions.width / 9)));
      const centerX = dimensions.width / 2;
      const centerY = dimensions.height / 2;

      // Camera offset centering the player
      const offsetX = Math.floor(centerX - playerPos.x * tileSize - tileSize / 2);
      const offsetY = Math.floor(centerY - playerPos.y * tileSize - tileSize / 2);

      // Deep void background
      ctx.fillStyle = '#05070d';
      ctx.fillRect(0, 0, dimensions.width, dimensions.height);

      // Visible tile bounds
      const startCol = Math.max(0, Math.floor(-offsetX / tileSize) - 1);
      const endCol = Math.min(dungeon.width, Math.ceil((dimensions.width - offsetX) / tileSize) + 1);
      const startRow = Math.max(0, Math.floor(-offsetY / tileSize) - 1);
      const endRow = Math.min(dungeon.height, Math.ceil((dimensions.height - offsetY) / tileSize) + 1);

      // 1. Draw Textured Base Tiles
      for (let y = startRow; y < endRow; y++) {
        for (let x = startCol; x < endCol; x++) {
          const vis = dungeon.visibility[y]?.[x] ?? VisibilityState.UNEXPLORED;
          if (vis === VisibilityState.UNEXPLORED) {
            continue; // pure darkness
          }

          const screenX = offsetX + x * tileSize;
          const screenY = offsetY + y * tileSize;
          const tile = dungeon.tiles[y][x];

          // Draw Base Terrain Texture
          if (tile === 'wall') {
            drawWallTexture(ctx, screenX, screenY, tileSize, vis, dungeon.themeColor, x, y, false, time);
          } else if (tile === 'cracked_wall') {
            drawCrackedWallTexture(ctx, screenX, screenY, tileSize, vis, dungeon.themeColor, x, y);
          } else if (tile === 'wood') {
            drawWoodTexture(ctx, screenX, screenY, tileSize, vis, x, y);
          } else if (tile === 'water') {
            drawWaterTexture(ctx, screenX, screenY, tileSize, vis, x, y, time);
          } else if (tile === 'acid') {
            drawAcidTexture(ctx, screenX, screenY, tileSize, vis, time);
          } else if (tile === 'ice') {
            drawIceTexture(ctx, screenX, screenY, tileSize, vis);
          } else if (tile === 'bridge') {
            drawBridgeTexture(ctx, screenX, screenY, tileSize, vis, x, y, time);
          } else if (tile === 'lava') {
            drawLavaTexture(ctx, screenX, screenY, tileSize, vis, x, y, time);
          } else {
            // Standard stone floor or floor underneath objects
            drawFloorTexture(ctx, screenX, screenY, tileSize, vis, x, y);
          }

          // Draw Overlay Terrain Decor
          if (tile === 'web') {
            drawWebTexture(ctx, screenX, screenY, tileSize, vis);
          }

          // Draw Interactable Tile Objects
          if (tile === 'stairs_down') {
            drawStairsDownTexture(ctx, screenX, screenY, tileSize, vis, time);
          } else if (tile === 'chest') {
            drawChestTexture(ctx, screenX, screenY, tileSize, vis, false);
          } else if (tile === 'chest_open') {
            drawChestTexture(ctx, screenX, screenY, tileSize, vis, true);
          } else if (tile === 'barrel') {
            drawBarrelTexture(ctx, screenX, screenY, tileSize, vis);
          } else if (tile === 'barrel_explosive') {
            drawBarrelExplosiveTexture(ctx, screenX, screenY, tileSize, vis, time);
          } else if (tile === 'shrine') {
            drawShrineTexture(ctx, screenX, screenY, tileSize, vis, time);
          } else if (tile === 'shrine_blood') {
            drawBloodShrineTexture(ctx, screenX, screenY, tileSize, vis, time);
          } else if (tile === 'obelisk') {
            drawObeliskTexture(ctx, screenX, screenY, tileSize, vis, time);
          } else if (tile === 'trap') {
            drawTrapTexture(ctx, screenX, screenY, tileSize, vis);
          } else if (tile === 'merchant') {
            drawMerchantNPCTexture(ctx, screenX, screenY, tileSize, vis, time);
          }

          // Draw Boss Telegraphed AoE Danger Zone (Pulsing glowing warning runes)
          const isTelegraphed = dungeon.bossTelegraphTiles?.some(p => p.x === x && p.y === y);
          if (isTelegraphed && vis !== VisibilityState.UNEXPLORED) {
            const dangerPulse = (Math.sin(time * 0.01) + 1) * 0.5;
            ctx.fillStyle = `rgba(239, 68, 68, ${0.3 + dangerPulse * 0.35})`;
            ctx.fillRect(screenX, screenY, tileSize, tileSize);
            ctx.strokeStyle = '#ef4444';
            ctx.lineWidth = 2;
            ctx.strokeRect(screenX + 2, screenY + 2, tileSize - 4, tileSize - 4);

            // Warning danger crosshair / skull mark
            ctx.fillStyle = '#fef08a';
            ctx.beginPath();
            ctx.arc(screenX + tileSize / 2, screenY + tileSize / 2, 3 + dangerPulse * 2, 0, Math.PI * 2);
            ctx.fill();
          }

          // Draw Ground Item Sprite (if any)
          const groundItem = dungeon.items.get(`${x},${y}`);
          if (groundItem) {
            drawGroundItemSprite(ctx, groundItem, screenX + tileSize / 2, screenY + tileSize / 2, tileSize * 0.72, time);

            // Rarity highlight ring for high tier items
            if (vis === VisibilityState.VISIBLE && groundItem.rarity !== 'common') {
              ctx.strokeStyle =
                groundItem.rarity === 'legendary'
                  ? '#fbbf24'
                  : groundItem.rarity === 'epic'
                  ? '#c084fc'
                  : '#38bdf8';
              ctx.lineWidth = 1.5;
              ctx.strokeRect(screenX + 2, screenY + 2, tileSize - 4, tileSize - 4);
            }
          }

          // Fog of War Dimming for EXPLORED tiles (previously visited, but currently out of FOV line of sight)
          if (vis === VisibilityState.EXPLORED) {
            ctx.fillStyle = 'rgba(5, 9, 18, 0.75)';
            ctx.fillRect(screenX, screenY, tileSize, tileSize);
          }
        }
      }

      // 2. Draw Dynamic Monster Characters (Only currently VISIBLE monsters!)
      for (const monster of dungeon.monsters) {
        const vis = dungeon.visibility[monster.y]?.[monster.x];
        if (vis !== VisibilityState.VISIBLE) {
          continue; // completely hidden in the fog of war!
        }

        const screenX = offsetX + monster.x * tileSize;
        const screenY = offsetY + monster.y * tileSize;

        // Ground shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.beginPath();
        ctx.ellipse(
          screenX + tileSize / 2,
          screenY + tileSize * 0.85,
          tileSize * (monster.isBoss ? 0.45 : 0.35),
          tileSize * 0.14,
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();

        // Boss mystical aura
        if (monster.isBoss) {
          const auraPulse = Math.sin(time * 0.006) * 4;
          ctx.fillStyle = 'rgba(239, 68, 68, 0.2)';
          ctx.beginPath();
          ctx.arc(screenX + tileSize / 2, screenY + tileSize / 2, tileSize * 0.6 + auraPulse, 0, Math.PI * 2);
          ctx.fill();
        }

        // Draw the fully drawn character monster sprite (NO EMOJIS, NO LETTERS)
        drawMonsterCharacter(
          ctx,
          monster,
          screenX + tileSize / 2,
          screenY + tileSize / 2,
          tileSize * (monster.isBoss ? 1.05 : 0.88),
          time
        );

        // Monster Mini HP Bar
        const barW = tileSize * 0.8;
        const barH = 3.5;
        const barX = screenX + (tileSize - barW) / 2;
        const barY = screenY + 2;

        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.fillRect(barX, barY, barW, barH);

        const hpPercent = Math.max(0, monster.hp / monster.maxHp);
        ctx.fillStyle = hpPercent > 0.5 ? '#22c55e' : hpPercent > 0.25 ? '#eab308' : '#ef4444';
        ctx.fillRect(barX, barY, barW * hpPercent, barH);
      }

      // 3. Draw Player Character
      const playerScreenX = offsetX + playerPos.x * tileSize;
      const playerScreenY = offsetY + playerPos.y * tileSize;

      // Atmospheric Torchlight Radial Glow from Player
      const torchFlicker = Math.sin(time * 0.007) * (tileSize * 0.15);
      const torchGrad = ctx.createRadialGradient(
        playerScreenX + tileSize / 2,
        playerScreenY + tileSize / 2,
        tileSize * 0.3,
        playerScreenX + tileSize / 2,
        playerScreenY + tileSize / 2,
        tileSize * 3.6 + torchFlicker
      );
      torchGrad.addColorStop(0, 'rgba(251, 191, 36, 0.15)');
      torchGrad.addColorStop(0.6, 'rgba(245, 158, 11, 0.05)');
      torchGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = torchGrad;
      ctx.beginPath();
      ctx.arc(playerScreenX + tileSize / 2, playerScreenY + tileSize / 2, tileSize * 3.6 + torchFlicker, 0, Math.PI * 2);
      ctx.fill();

      // Player Ground Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
      ctx.beginPath();
      ctx.ellipse(
        playerScreenX + tileSize / 2,
        playerScreenY + tileSize * 0.85,
        tileSize * 0.38,
        tileSize * 0.14,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();

      // Draw the Player Character Sprite with equipped weapon in hand (NO EMOJIS)
      drawPlayerCharacter(
        ctx,
        playerClassId,
        playerScreenX + tileSize / 2,
        playerScreenY + tileSize / 2,
        tileSize * 0.92,
        time,
        equippedWeapon
      );

      // Subtle Hero Ring Reticle Indicator
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.2;
      ctx.strokeRect(playerScreenX + 3, playerScreenY + 3, tileSize - 6, tileSize - 6);

      // 4. Floating Combat Damage & Status Texts
      for (const ft of floatingTexts) {
        const elapsed = (time - ft.createdAt) / 1000;
        if (elapsed > 1.2) continue;

        const ftScreenX = offsetX + ft.x * tileSize + tileSize / 2;
        const ftScreenY = offsetY + ft.y * tileSize - elapsed * 32;

        ctx.save();
        ctx.globalAlpha = Math.max(0, 1 - elapsed / 1.2);
        ctx.font = 'bold 15px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Dark text outline for clarity against any background
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.strokeText(ft.text, ftScreenX, ftScreenY);

        ctx.fillStyle = ft.color;
        ctx.fillText(ft.text, ftScreenX, ftScreenY);
        ctx.restore();
      }

      animFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameId) cancelAnimationFrame(animFrameId);
    };
  }, [dungeon, playerPos, playerClassId, floatingTexts, dimensions]);

  // Click / Tap Handler
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    touchStartRef.current = {
      x: clientX,
      y: clientY,
      time: Date.now(),
    };
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!touchStartRef.current) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    const dx = clientX - touchStartRef.current.x;
    const dy = clientY - touchStartRef.current.y;
    const dt = Date.now() - touchStartRef.current.time;

    // Detect swipe (distance > 30px within 350ms)
    if (dt < 350 && (Math.abs(dx) > 30 || Math.abs(dy) > 30) && onSwipeMove) {
      if (Math.abs(dx) > Math.abs(dy)) {
        onSwipeMove(dx > 0 ? 1 : -1, 0);
      } else {
        onSwipeMove(0, dy > 0 ? 1 : -1);
      }
      touchStartRef.current = null;
      return;
    }

    // Otherwise standard tap on tile
    const tileSize = Math.max(34, Math.min(48, Math.floor(dimensions.width / 9)));
    const centerX = dimensions.width / 2;
    const centerY = dimensions.height / 2;
    const offsetX = Math.floor(centerX - playerPos.x * tileSize - tileSize / 2);
    const offsetY = Math.floor(centerY - playerPos.y * tileSize - tileSize / 2);

    const tileX = Math.floor((clientX - offsetX) / tileSize);
    const tileY = Math.floor((clientY - offsetY) / tileSize);

    if (tileX >= 0 && tileX < dungeon.width && tileY >= 0 && tileY < dungeon.height) {
      onTileClick(tileX, tileY);
    }
    touchStartRef.current = null;
  };

  return (
    <div
      ref={containerRef}
      id="dungeon-canvas-container"
      className="relative w-full h-full flex items-center justify-center overflow-hidden bg-slate-950 select-none touch-none cursor-crosshair"
    >
      <canvas
        ref={canvasRef}
        id="dungeon-canvas"
        className="w-full h-full block"
        style={{ width: dimensions.width, height: dimensions.height }}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
      />
    </div>
  );
};
