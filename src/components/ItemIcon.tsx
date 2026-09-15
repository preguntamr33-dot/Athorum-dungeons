import React from 'react';
import { Item, ItemRarity } from '../types';
import { WeaponPreviewCanvas } from './WeaponPreviewCanvas';
import { 
  Sword, 
  Shield, 
  Gem, 
  FlaskConical, 
  Scroll, 
  Sparkles, 
  Wand2, 
  Axe, 
  Coins, 
  Eye, 
  Flame, 
  Zap,
  Crosshair,
  Feather
} from 'lucide-react';

interface ItemIconProps {
  item: Item;
  size?: 'sm' | 'md' | 'lg';
  showRarityGlow?: boolean;
}

export const ItemIcon: React.FC<ItemIconProps> = ({ 
  item, 
  size = 'md',
  showRarityGlow = false 
}) => {
  const iconSizeClass = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-8 h-8' : 'w-5 h-5';
  const containerSizeClass = size === 'sm' ? 'w-7 h-7' : size === 'lg' ? 'w-12 h-12' : 'w-9 h-9';

  const getRarityColors = (rarity: ItemRarity) => {
    switch (rarity) {
      case 'legendary':
        return {
          border: 'border-amber-500/60 shadow-amber-500/20',
          bg: 'bg-amber-950/40 text-amber-400',
        };
      case 'epic':
        return {
          border: 'border-purple-500/60 shadow-purple-500/20',
          bg: 'bg-purple-950/40 text-purple-400',
        };
      case 'rare':
        return {
          border: 'border-sky-500/60 shadow-sky-500/20',
          bg: 'bg-sky-950/40 text-sky-400',
        };
      default:
        return {
          border: 'border-slate-700 shadow-none',
          bg: 'bg-slate-800 text-slate-300',
        };
    }
  };

  const colors = getRarityColors(item.rarity);
  const key = (item.iconKey || item.name || item.type).toLowerCase();

  const renderIcon = () => {
    if (item.type === 'potion') {
      return <FlaskConical className={iconSizeClass} />;
    }
    if (item.type === 'scroll') {
      return <Scroll className={iconSizeClass} />;
    }
    if (item.type === 'ring') {
      if (key.includes('ojo') || key.includes('búho')) return <Eye className={iconSizeClass} />;
      if (key.includes('amuleto') || key.includes('místico')) return <Sparkles className={iconSizeClass} />;
      return <Gem className={iconSizeClass} />;
    }
    if (item.type === 'armor') {
      if (key.includes('capa')) return <Feather className={iconSizeClass} />;
      return <Shield className={iconSizeClass} />;
    }
    if (item.type === 'weapon') {
      if (item.weaponParts) {
        const pSize = size === 'sm' ? 24 : size === 'lg' ? 42 : 32;
        return <WeaponPreviewCanvas weaponParts={item.weaponParts} size={pSize} animated={showRarityGlow} />;
      }
      if (key.includes('hacha')) return <Axe className={iconSizeClass} />;
      if (key.includes('báculo') || key.includes('vara')) return <Wand2 className={iconSizeClass} />;
      if (key.includes('daga')) return <Crosshair className={iconSizeClass} />;
      return <Sword className={iconSizeClass} />;
    }
    return <Coins className={iconSizeClass} />;
  };

  return (
    <div
      className={`${containerSizeClass} rounded-xl border flex items-center justify-center transition-all ${
        colors.border
      } ${colors.bg} ${showRarityGlow ? 'shadow-md' : ''}`}
    >
      {renderIcon()}
    </div>
  );
};
