import React, { useEffect, useRef } from 'react';
import { WeaponModularParts } from '../types';
import { drawProceduralWeapon } from '../utils/proceduralWeapons';

interface WeaponPreviewCanvasProps {
  weaponParts: WeaponModularParts;
  size?: number;
  animated?: boolean;
  angle?: number;
  className?: string;
}

export const WeaponPreviewCanvas: React.FC<WeaponPreviewCanvasProps> = ({
  weaponParts,
  size = 48,
  animated = false,
  angle = -Math.PI / 4,
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
      const baseScale = (size / 38);

      // Center in canvas
      drawProceduralWeapon(
        ctx,
        weaponParts,
        size / 2,
        size / 2,
        baseScale,
        angle,
        time,
        { showAura: true }
      );

      if (animated) {
        animId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [weaponParts, size, animated, angle]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: `${size}px`, height: `${size}px` }}
      className={`inline-block ${className}`}
    />
  );
};
