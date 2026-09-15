import React, { useEffect, useRef } from 'react';
import { Item, PlayerClassId } from '../types';
import { drawPlayerCharacter } from '../utils/characterSprites';

interface CharacterAvatarProps {
  classId: PlayerClassId;
  equippedWeapon?: Item | null;
  size?: number;
  animated?: boolean;
  className?: string;
}

export const CharacterAvatar: React.FC<CharacterAvatarProps> = ({
  classId,
  equippedWeapon,
  size = 48,
  animated = false,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;

    const render = () => {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, size, size);

      const time = animated ? Date.now() : 0;
      drawPlayerCharacter(ctx, classId, size / 2, size * 0.55, size * 0.75, time, equippedWeapon);

      if (animated) {
        animId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [classId, equippedWeapon, size, animated]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: `${size}px`, height: `${size}px` }}
      className={`inline-block ${className}`}
    />
  );
};
