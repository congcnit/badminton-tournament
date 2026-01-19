'use client';

import { Player } from '@/types';

interface PlayerCardProps {
  player: Player;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  size?: 'sm' | 'md' | 'lg';
}

const levelColors: Record<string, string> = {
  'Luyện Khí Kỳ': 'bg-green-500/20 border-green-500/50 text-green-300',
  'Trúc Cơ': 'bg-blue-500/20 border-blue-500/50 text-blue-300',
  'Kết Đan': 'bg-purple-500/20 border-purple-500/50 text-purple-300',
  'Nguyên Anh': 'bg-yellow-500/20 border-yellow-500/50 text-yellow-300',
};

const genderAccent: Record<string, string> = {
  M: '',
  F: 'ring-2 ring-pink-500/50',
};

export default function PlayerCard({
  player,
  draggable = false,
  onDragStart,
  onDragEnd,
  size = 'md',
}: PlayerCardProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2',
  };

  return (
    <div
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={`
        inline-flex items-center gap-2 rounded-lg border
        ${levelColors[player.level]}
        ${genderAccent[player.gender]}
        ${sizeClasses[size]}
        ${draggable ? 'cursor-move hover:scale-105 transition-transform' : ''}
        ${draggable ? 'shadow-lg' : 'shadow'}
      `}
    >
      <span className="font-medium">{player.name}</span>
      <span className="text-xs opacity-70">
        {player.gender === 'F' ? '♀' : '♂'}
      </span>
    </div>
  );
}

