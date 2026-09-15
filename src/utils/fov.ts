import { TileType, VisibilityState } from '../types';

/**
 * Computes Field of View (FOV) and updates the visibility matrix.
 * Tiles currently in line-of-sight become VISIBLE.
 * Previously seen tiles remain EXPLORED (dimmed memory of terrain).
 * Unseen tiles remain UNEXPLORED (pure black fog).
 */
export function computeFOV(
  width: number,
  height: number,
  tiles: TileType[][],
  visibility: VisibilityState[][],
  playerX: number,
  playerY: number,
  radius: number
): VisibilityState[][] {
  // First, downgrade all currently VISIBLE tiles to EXPLORED
  const newVis: VisibilityState[][] = visibility.map(row => 
    row.map(state => (state === VisibilityState.VISIBLE ? VisibilityState.EXPLORED : state))
  );

  // Player position is always visible
  if (playerX >= 0 && playerX < width && playerY >= 0 && playerY < height) {
    newVis[playerY][playerX] = VisibilityState.VISIBLE;
  }

  // Cast rays in a circle to cover all angles smoothly
  const numRays = 180;
  for (let i = 0; i < numRays; i++) {
    const angle = (i * 2 * Math.PI) / numRays;
    const sin = Math.sin(angle);
    const cos = Math.cos(angle);

    for (let d = 1; d <= radius; d++) {
      const targetX = Math.round(playerX + cos * d);
      const targetY = Math.round(playerY + sin * d);

      if (targetX < 0 || targetX >= width || targetY < 0 || targetY >= height) {
        break;
      }

      newVis[targetY][targetX] = VisibilityState.VISIBLE;

      // Obstacles (walls, closed doors) block light from passing further
      const tile = tiles[targetY][targetX];
      if (tile === 'wall' || tile === 'door_closed') {
        break;
      }
    }
  }

  return newVis;
}

/**
 * Checks if a tile is currently in direct field of view
 */
export function isTileVisible(visibility: VisibilityState[][], x: number, y: number): boolean {
  if (!visibility || y < 0 || y >= visibility.length || x < 0 || x >= visibility[0].length) {
    return false;
  }
  return visibility[y][x] === VisibilityState.VISIBLE;
}
