'use client';

import { Team } from '@/types';
import { calculateTeamStrength } from '@/utils/teamValidation';
import PlayerCard from './PlayerCard';

interface TeamCardProps {
  team: Team;
  onDrop?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDragLeave?: (e: React.DragEvent) => void;
  onPlayerDragStart?: (playerId: string) => (e: React.DragEvent) => void;
  onPlayerDragEnd?: () => void;
  onPlayerRemove?: (playerId: string) => void;
  editable?: boolean;
}

export default function TeamCard({
  team,
  onDrop,
  onDragOver,
  onDragLeave,
  onPlayerDragStart,
  onPlayerDragEnd,
  onPlayerRemove,
  editable = false,
}: TeamCardProps) {
  const strength = calculateTeamStrength(team);

  const men = team.players.filter((p) => p.gender === 'M');
  const women = team.players.filter((p) => p.gender === 'F');

  // Sort function for players by name
  const sortByName = (a: typeof team.players[0], b: typeof team.players[0]) => 
    a.name.localeCompare(b.name);

  const nguyenAnhPlayers = team.players.filter((p) => p.level === 'Nguyên Anh').sort(sortByName);
  const ketDanPlayers = team.players.filter((p) => p.level === 'Kết Đan').sort(sortByName);
  const trucCoPlayers = team.players.filter((p) => p.level === 'Trúc Cơ').sort(sortByName);
  const luyenKhiKyPlayers = team.players.filter((p) => p.level === 'Luyện Khí Kỳ').sort(sortByName);

  return (
    <div
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      className={`
        bg-gray-800/50 backdrop-blur-sm rounded-xl border-2 p-6
        transition-all duration-200
        border-green-500/50
        ${editable ? 'hover:border-blue-500/50' : ''}
        ${editable ? 'min-h-[400px]' : ''}
      `}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-white">{team.name}</h3>
          <div className="text-xs text-gray-400 mt-1">
            Men ({men.length}), Women ({women.length})
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">Strength:</span>
          <span className="text-lg font-bold text-blue-400">{strength}</span>
        </div>
      </div>

      <div className="space-y-4">
        {team.players.length > 0 && (
          <div className="space-y-2">
            {nguyenAnhPlayers.length > 0 && (
              <div>
                <span className="text-xs text-yellow-400">Nguyên Anh ({nguyenAnhPlayers.length}):</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {nguyenAnhPlayers.map((player) => (
                    <PlayerCard
                      key={player.id}
                      player={player}
                      size="sm"
                      draggable={editable && !!onPlayerDragStart}
                      onDragStart={onPlayerDragStart ? onPlayerDragStart(player.id) : undefined}
                      onDragEnd={onPlayerDragEnd}
                    />
                  ))}
                </div>
              </div>
            )}
            {ketDanPlayers.length > 0 && (
              <div>
                <span className="text-xs text-purple-400">Kết Đan ({ketDanPlayers.length}):</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {ketDanPlayers.map((player) => (
                    <PlayerCard
                      key={player.id}
                      player={player}
                      size="sm"
                      draggable={editable && !!onPlayerDragStart}
                      onDragStart={onPlayerDragStart ? onPlayerDragStart(player.id) : undefined}
                      onDragEnd={onPlayerDragEnd}
                    />
                  ))}
                </div>
              </div>
            )}
            {trucCoPlayers.length > 0 && (
              <div>
                <span className="text-xs text-blue-400">Trúc Cơ ({trucCoPlayers.length}):</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {trucCoPlayers.map((player) => (
                    <PlayerCard
                      key={player.id}
                      player={player}
                      size="sm"
                      draggable={editable && !!onPlayerDragStart}
                      onDragStart={onPlayerDragStart ? onPlayerDragStart(player.id) : undefined}
                      onDragEnd={onPlayerDragEnd}
                    />
                  ))}
                </div>
              </div>
            )}
            {luyenKhiKyPlayers.length > 0 && (
              <div>
                <span className="text-xs text-green-400">Luyện Khí Kỳ ({luyenKhiKyPlayers.length}):</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {luyenKhiKyPlayers.map((player) => (
                    <PlayerCard
                      key={player.id}
                      player={player}
                      size="sm"
                      draggable={editable && !!onPlayerDragStart}
                      onDragStart={onPlayerDragStart ? onPlayerDragStart(player.id) : undefined}
                      onDragEnd={onPlayerDragEnd}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {editable && team.players.length === 0 && (
          <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-700 rounded-lg">
            Drop players here
          </div>
        )}
      </div>
    </div>
  );
}

