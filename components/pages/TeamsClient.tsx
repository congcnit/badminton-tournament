'use client';

import { useEffect, useMemo, useState } from 'react';
import Navigation from '@/components/Navigation';
import TeamCard from '@/components/TeamCard';
import PlayerCard from '@/components/PlayerCard';
import { useTournamentStore } from '@/store/tournamentStore';
import { useAuthStore } from '@/store/authStore';
import { Player, Round, Team } from '@/types';

interface TeamsClientProps {
  initialPlayers: Player[];
  initialTeams: Team[];
  initialRounds: Round[];
}

export default function TeamsClient({
  initialPlayers,
  initialTeams,
  initialRounds,
}: TeamsClientProps) {
  const {
    players,
    teams,
    createTeam,
    updateTeamName,
    deleteTeam,
    movePlayer,
    hasHydrated,
    hydrate,
  } = useTournamentStore();
  const { role, isAuthenticated } = useAuthStore();
  const isAdmin = isAuthenticated && role === 'admin';

  const [draggedPlayerId, setDraggedPlayerId] = useState<string | null>(null);
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [teamName, setTeamName] = useState('');
  const [showCreateTeamForm, setShowCreateTeamForm] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');

  useEffect(() => {
    if (!hasHydrated) {
      hydrate({ players: initialPlayers, teams: initialTeams, rounds: initialRounds });
    }
  }, [hasHydrated, hydrate, initialPlayers, initialRounds, initialTeams]);

  const unassignedPlayers = useMemo(
    () =>
      players.filter(
        (player) => !teams.some((team) => team.players.some((p) => p.id === player.id))
      ),
    [players, teams]
  );

  const sortPlayers = (a: Player, b: Player) => {
    if (a.gender !== b.gender) {
      return a.gender === 'F' ? -1 : 1;
    }
    return a.name.localeCompare(b.name);
  };

  const unassignedPlayersByLevel = useMemo(
    () => ({
      'Nguyên Anh': [...unassignedPlayers]
        .filter((p) => p.level === 'Nguyên Anh')
        .sort(sortPlayers),
      'Kết Đan': [...unassignedPlayers]
        .filter((p) => p.level === 'Kết Đan')
        .sort(sortPlayers),
      'Trúc Cơ': [...unassignedPlayers]
        .filter((p) => p.level === 'Trúc Cơ')
        .sort(sortPlayers),
      'Luyện Khí Kỳ': [...unassignedPlayers]
        .filter((p) => p.level === 'Luyện Khí Kỳ')
        .sort(sortPlayers),
    }),
    [unassignedPlayers]
  );

  const handleDragStart = (playerId: string) => (e: React.DragEvent) => {
    if (!isAdmin) {
      e.preventDefault();
      return;
    }
    setDraggedPlayerId(playerId);
    e.dataTransfer.setData('text/plain', playerId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedPlayerId(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add('border-blue-500');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('border-blue-500');
  };

  const handleDrop = (teamId: string) => (e: React.DragEvent) => {
    if (!isAdmin) {
      e.preventDefault();
      return;
    }
    e.preventDefault();
    e.currentTarget.classList.remove('border-blue-500');

    const playerId = e.dataTransfer.getData('text/plain') || draggedPlayerId;
    if (playerId) {
      const sourceTeam = teams.find((team) => team.players.some((p) => p.id === playerId));
      movePlayer(playerId, sourceTeam?.id || null, teamId);
      setDraggedPlayerId(null);
    }
  };

  const handleEditTeamName = (teamId: string, currentName: string) => {
    setEditingTeamId(teamId);
    setTeamName(currentName);
  };

  const handleSaveTeamName = (teamId: string) => {
    if (!isAdmin || !teamName.trim()) return;
    updateTeamName(teamId, teamName.trim());
    setEditingTeamId(null);
    setTeamName('');
  };

  const handleDeleteTeam = async (teamId: string) => {
    if (!isAdmin) return;
    if (confirm('Are you sure you want to delete this team? All players will be unassigned.')) {
      try {
        await deleteTeam(teamId);
      } catch (error) {
        console.error('Error deleting team:', error);
      }
    }
  };

  const handleCreateTeam = async () => {
    if (!isAdmin || !newTeamName.trim()) return;
    try {
      await createTeam(newTeamName.trim());
      setNewTeamName('');
      setShowCreateTeamForm(false);
    } catch (error) {
      console.error('Error creating team:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Team Builder</h1>
            <p className="text-gray-400">Drag and drop players to build your teams</p>
          </div>
          {isAdmin && (
            <button
              onClick={() => setShowCreateTeamForm(!showCreateTeamForm)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-all hover:shadow-lg hover:shadow-blue-500/50"
            >
              {showCreateTeamForm ? 'Cancel' : '+ Create Team'}
            </button>
          )}
        </div>

        {isAdmin && showCreateTeamForm && (
          <div className="mb-8 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
            <h2 className="text-xl font-bold text-white mb-4">Create New Team</h2>
            <div className="flex gap-3">
              <input
                type="text"
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateTeam();
                  if (e.key === 'Escape') {
                    setShowCreateTeamForm(false);
                    setNewTeamName('');
                  }
                }}
                placeholder="Enter team name"
                className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                autoFocus
              />
              <button
                onClick={handleCreateTeam}
                disabled={!newTeamName.trim()}
                className={`${
                  !newTeamName.trim()
                    ? 'bg-gray-500 cursor-not-allowed opacity-60'
                    : 'bg-green-600 hover:bg-green-700'
                } text-white font-semibold py-2 px-6 rounded-lg transition-all`}
              >
                Create
              </button>
              <button
                onClick={() => {
                  setShowCreateTeamForm(false);
                  setNewTeamName('');
                }}
                className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-6 rounded-lg transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Unassigned Players</h2>
          {unassignedPlayers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-yellow-500/30 p-4">
                <h3 className="text-sm font-semibold text-yellow-400 mb-3">
                  Nguyên Anh ({unassignedPlayersByLevel['Nguyên Anh'].length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {unassignedPlayersByLevel['Nguyên Anh'].map((player) => (
                    <PlayerCard
                      key={player.id}
                      player={player}
                      draggable={isAdmin}
                      onDragStart={isAdmin ? handleDragStart(player.id) : undefined}
                      onDragEnd={isAdmin ? handleDragEnd : undefined}
                      size="sm"
                    />
                  ))}
                </div>
              </div>

              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-purple-500/30 p-4">
                <h3 className="text-sm font-semibold text-purple-400 mb-3">
                  Kết Đan ({unassignedPlayersByLevel['Kết Đan'].length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {unassignedPlayersByLevel['Kết Đan'].map((player) => (
                    <PlayerCard
                      key={player.id}
                      player={player}
                      draggable={isAdmin}
                      onDragStart={isAdmin ? handleDragStart(player.id) : undefined}
                      onDragEnd={isAdmin ? handleDragEnd : undefined}
                      size="sm"
                    />
                  ))}
                </div>
              </div>

              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-blue-500/30 p-4">
                <h3 className="text-sm font-semibold text-blue-400 mb-3">
                  Trúc Cơ ({unassignedPlayersByLevel['Trúc Cơ'].length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {unassignedPlayersByLevel['Trúc Cơ'].map((player) => (
                    <PlayerCard
                      key={player.id}
                      player={player}
                      draggable={isAdmin}
                      onDragStart={isAdmin ? handleDragStart(player.id) : undefined}
                      onDragEnd={isAdmin ? handleDragEnd : undefined}
                      size="sm"
                    />
                  ))}
                </div>
              </div>

              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-green-500/30 p-4">
                <h3 className="text-sm font-semibold text-green-400 mb-3">
                  Luyện Khí Kỳ ({unassignedPlayersByLevel['Luyện Khí Kỳ'].length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {unassignedPlayersByLevel['Luyện Khí Kỳ'].map((player) => (
                    <PlayerCard
                      key={player.id}
                      player={player}
                      draggable={isAdmin}
                      onDragStart={isAdmin ? handleDragStart(player.id) : undefined}
                      onDragEnd={isAdmin ? handleDragEnd : undefined}
                      size="sm"
                    />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
              <p className="text-gray-500 text-center py-4">All players assigned</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {teams.map((team) => (
            <div key={team.id}>
              {isAdmin && editingTeamId === team.id ? (
                <div className="mb-4 flex gap-2">
                  <input
                    type="text"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveTeamName(team.id);
                      if (e.key === 'Escape') {
                        setEditingTeamId(null);
                        setTeamName('');
                      }
                    }}
                    className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                    autoFocus
                  />
                  <button
                    onClick={() => handleSaveTeamName(team.id)}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setEditingTeamId(null);
                      setTeamName('');
                    }}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="mb-4 flex items-center gap-2">
                  <h2 className="text-xl font-bold text-white">{team.name}</h2>
                  {isAdmin && (
                    <>
                      <button
                        onClick={() => handleEditTeamName(team.id, team.name)}
                        className="text-gray-400 hover:text-white text-sm"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDeleteTeam(team.id)}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        🗑️ Delete
                      </button>
                    </>
                  )}
                </div>
              )}
              <TeamCard
                team={team}
                onDrop={isAdmin ? handleDrop(team.id) : undefined}
                onDragOver={isAdmin ? handleDragOver : undefined}
                onDragLeave={isAdmin ? handleDragLeave : undefined}
                onPlayerDragStart={isAdmin ? handleDragStart : undefined}
                onPlayerDragEnd={isAdmin ? handleDragEnd : undefined}
                editable={isAdmin}
              />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
