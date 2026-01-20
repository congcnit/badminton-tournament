'use client';

import { useEffect, useMemo, useState } from 'react';
import Navigation from '@/components/Navigation';
import PlayerCard from '@/components/PlayerCard';
import { useTournamentStore } from '@/store/tournamentStore';
import { useAuthStore } from '@/store/authStore';
import { Player, Gender, Level, Round, Team } from '@/types';

interface PlayersClientProps {
  initialPlayers: Player[];
  initialTeams: Team[];
  initialRounds: Round[];
}

const sortPlayers = (playersList: Player[]) => {
  return [...playersList].sort((a, b) => {
    if (a.gender !== b.gender) {
      return a.gender === 'F' ? -1 : 1;
    }
    return a.name.localeCompare(b.name);
  });
};

export default function PlayersClient({
  initialPlayers,
  initialTeams,
  initialRounds,
}: PlayersClientProps) {
  const {
    players,
    addPlayer,
    updatePlayer,
    deletePlayer,
    isLoading,
    error,
    hasHydrated,
    hydrate,
  } = useTournamentStore();
  const { role, isAuthenticated } = useAuthStore();
  const isAdmin = isAuthenticated && role === 'admin';
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    gender: 'M' as Gender,
    level: 'Luyện Khí Kỳ' as Level,
  });
  const [draggedPlayerId, setDraggedPlayerId] = useState<string | null>(null);

  useEffect(() => {
    if (!hasHydrated) {
      hydrate({ players: initialPlayers, teams: initialTeams, rounds: initialRounds });
    }
  }, [hasHydrated, hydrate, initialPlayers, initialRounds, initialTeams]);

  const playersByLevel = useMemo(
    () => ({
      'Nguyên Anh': sortPlayers(players.filter((p) => p.level === 'Nguyên Anh')),
      'Kết Đan': sortPlayers(players.filter((p) => p.level === 'Kết Đan')),
      'Trúc Cơ': sortPlayers(players.filter((p) => p.level === 'Trúc Cơ')),
      'Luyện Khí Kỳ': sortPlayers(players.filter((p) => p.level === 'Luyện Khí Kỳ')),
    }),
    [players]
  );

  const playersByGender = useMemo(
    () => ({
      M: players.filter((p) => p.gender === 'M'),
      F: players.filter((p) => p.gender === 'F'),
    }),
    [players]
  );

  const sortedAllPlayers = useMemo(() => sortPlayers(players), [players]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      if (editingPlayer) {
        await updatePlayer(editingPlayer.id, formData);
        setEditingPlayer(null);
      } else {
        await addPlayer(formData);
      }
      setFormData({ name: '', gender: 'M', level: 'Luyện Khí Kỳ' });
      setShowAddForm(false);
    } catch (err) {
      console.error(`Failed to ${editingPlayer ? 'update' : 'add'} player:`, err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (player: Player) => {
    setEditingPlayer(player);
    setFormData({
      name: player.name,
      gender: player.gender,
      level: player.level,
    });
    setShowAddForm(true);
  };

  const handleCancel = () => {
    if (isSubmitting) return;
    setEditingPlayer(null);
    setFormData({ name: '', gender: 'M', level: 'Luyện Khí Kỳ' });
    setShowAddForm(false);
    setIsSubmitting(false);
  };

  const handleDelete = async (playerId: string) => {
    if (confirm('Are you sure you want to delete this player?')) {
      try {
        await deletePlayer(playerId);
      } catch (err) {
        console.error('Failed to delete player:', err);
      }
    }
  };

  const handleDragStart = (playerId: string) => {
    setDraggedPlayerId(playerId);
  };

  const handleDragEnd = () => {
    setDraggedPlayerId(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    const target = e.currentTarget as HTMLElement;
    target.classList.add('ring-2', 'ring-blue-500');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    const target = e.currentTarget as HTMLElement;
    target.classList.remove('ring-2', 'ring-blue-500');
  };

  const handleDrop = async (targetLevel: Level) => {
    if (!draggedPlayerId) return;

    const player = players.find((p) => p.id === draggedPlayerId);
    if (!player || player.level === targetLevel) {
      setDraggedPlayerId(null);
      return;
    }

    try {
      await updatePlayer(draggedPlayerId, { level: targetLevel });
    } catch (err) {
      console.error('Failed to update player level:', err);
    } finally {
      setDraggedPlayerId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Players Management</h1>
            <p className="text-gray-400">Manage tournament players</p>
          </div>
          {isAdmin && (
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-all hover:shadow-lg hover:shadow-blue-500/50"
            >
              {showAddForm ? 'Cancel' : '+ Add Player'}
            </button>
          )}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {isAdmin && showAddForm && (
          <div className="mb-8 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
            <h2 className="text-xl font-bold text-white mb-4">
              {editingPlayer ? 'Edit Player' : 'Add New Player'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                  placeholder="Enter player name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Gender
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as Gender })}
                    required
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Level
                  </label>
                  <select
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value as Level })}
                    required
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Luyện Khí Kỳ">Luyện Khí Kỳ</option>
                    <option value="Trúc Cơ">Trúc Cơ</option>
                    <option value="Kết Đan">Kết Đan</option>
                    <option value="Nguyên Anh">Nguyên Anh</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`${
                    isSubmitting
                      ? 'bg-gray-500 cursor-not-allowed opacity-60'
                      : 'bg-green-600 hover:bg-green-700'
                  } text-white font-semibold py-2 px-6 rounded-lg transition-all flex items-center gap-2`}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {editingPlayer ? 'Updating...' : 'Adding...'}
                    </>
                  ) : (
                    editingPlayer ? 'Update Player' : 'Add Player'
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                  className={`${
                    isSubmitting
                      ? 'bg-gray-500 cursor-not-allowed opacity-60'
                      : 'bg-gray-600 hover:bg-gray-700'
                  } text-white font-semibold py-2 px-6 rounded-lg transition-all`}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-400">Loading players...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-2">Total Players</h3>
                <p className="text-3xl font-bold text-blue-400">{players.length}</p>
              </div>
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-2">Men</h3>
                <p className="text-3xl font-bold text-blue-400">{playersByGender.M.length}</p>
              </div>
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-2">Women</h3>
                <p className="text-3xl font-bold text-pink-400">{playersByGender.F.length}</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">By Level</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => {
                      e.preventDefault();
                      const target = e.currentTarget as HTMLElement;
                      target.classList.remove('ring-2', 'ring-blue-500');
                      handleDrop('Nguyên Anh');
                    }}
                    className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-yellow-500/30 p-6 transition-all min-h-[200px]"
                  >
                    <h3 className="text-lg font-semibold text-yellow-400 mb-4">
                      Nguyên Anh ({playersByLevel['Nguyên Anh'].length})
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {playersByLevel['Nguyên Anh'].map((player) => (
                        <div key={player.id} className="relative group">
                          <PlayerCard
                            player={player}
                            size="sm"
                            draggable={isAdmin}
                            onDragStart={() => handleDragStart(player.id)}
                            onDragEnd={handleDragEnd}
                          />
                          <div className="absolute -top-2 -right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                            <button
                              onClick={() => handleEdit(player)}
                              disabled={isSubmitting || showAddForm}
                              className={`${
                                isSubmitting || showAddForm
                                  ? 'bg-gray-500 cursor-not-allowed opacity-50'
                                  : 'bg-blue-600 hover:bg-blue-700'
                              } text-white rounded-full w-6 h-6 flex items-center justify-center text-xs shadow-lg transition-all`}
                              title="Edit player"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => handleDelete(player.id)}
                              className="bg-red-600 hover:bg-red-700 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs shadow-lg"
                              title="Delete player"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      ))}
                      {playersByLevel['Nguyên Anh'].length === 0 && (
                        <p className="text-gray-500 text-sm italic w-full text-center py-4">
                          Drop players here
                        </p>
                      )}
                    </div>
                  </div>

                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => {
                      e.preventDefault();
                      const target = e.currentTarget as HTMLElement;
                      target.classList.remove('ring-2', 'ring-blue-500');
                      handleDrop('Kết Đan');
                    }}
                    className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-purple-500/30 p-6 transition-all min-h-[200px]"
                  >
                    <h3 className="text-lg font-semibold text-purple-400 mb-4">
                      Kết Đan ({playersByLevel['Kết Đan'].length})
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {playersByLevel['Kết Đan'].map((player) => (
                        <div key={player.id} className="relative group">
                          <PlayerCard
                            player={player}
                            size="sm"
                            draggable={isAdmin}
                            onDragStart={() => handleDragStart(player.id)}
                            onDragEnd={handleDragEnd}
                          />
                          <div className="absolute -top-2 -right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                            <button
                              onClick={() => handleEdit(player)}
                              disabled={isSubmitting || showAddForm}
                              className={`${
                                isSubmitting || showAddForm
                                  ? 'bg-gray-500 cursor-not-allowed opacity-50'
                                  : 'bg-blue-600 hover:bg-blue-700'
                              } text-white rounded-full w-6 h-6 flex items-center justify-center text-xs shadow-lg transition-all`}
                              title="Edit player"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => handleDelete(player.id)}
                              className="bg-red-600 hover:bg-red-700 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs shadow-lg"
                              title="Delete player"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      ))}
                      {playersByLevel['Kết Đan'].length === 0 && (
                        <p className="text-gray-500 text-sm italic w-full text-center py-4">
                          Drop players here
                        </p>
                      )}
                    </div>
                  </div>

                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => {
                      e.preventDefault();
                      const target = e.currentTarget as HTMLElement;
                      target.classList.remove('ring-2', 'ring-blue-500');
                      handleDrop('Trúc Cơ');
                    }}
                    className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-blue-500/30 p-6 transition-all min-h-[200px]"
                  >
                    <h3 className="text-lg font-semibold text-blue-400 mb-4">
                      Trúc Cơ ({playersByLevel['Trúc Cơ'].length})
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {playersByLevel['Trúc Cơ'].map((player) => (
                        <div key={player.id} className="relative group">
                          <PlayerCard
                            player={player}
                            size="sm"
                            draggable={isAdmin}
                            onDragStart={() => handleDragStart(player.id)}
                            onDragEnd={handleDragEnd}
                          />
                          <div className="absolute -top-2 -right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                            <button
                              onClick={() => handleEdit(player)}
                              disabled={isSubmitting || showAddForm}
                              className={`${
                                isSubmitting || showAddForm
                                  ? 'bg-gray-500 cursor-not-allowed opacity-50'
                                  : 'bg-blue-600 hover:bg-blue-700'
                              } text-white rounded-full w-6 h-6 flex items-center justify-center text-xs shadow-lg transition-all`}
                              title="Edit player"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => handleDelete(player.id)}
                              className="bg-red-600 hover:bg-red-700 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs shadow-lg"
                              title="Delete player"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      ))}
                      {playersByLevel['Trúc Cơ'].length === 0 && (
                        <p className="text-gray-500 text-sm italic w-full text-center py-4">
                          Drop players here
                        </p>
                      )}
                    </div>
                  </div>

                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => {
                      e.preventDefault();
                      const target = e.currentTarget as HTMLElement;
                      target.classList.remove('ring-2', 'ring-blue-500');
                      handleDrop('Luyện Khí Kỳ');
                    }}
                    className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-green-500/30 p-6 transition-all min-h-[200px]"
                  >
                    <h3 className="text-lg font-semibold text-green-400 mb-4">
                      Luyện Khí Kỳ ({playersByLevel['Luyện Khí Kỳ'].length})
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {playersByLevel['Luyện Khí Kỳ'].map((player) => (
                        <div key={player.id} className="relative group">
                          <PlayerCard
                            player={player}
                            size="sm"
                            draggable={isAdmin}
                            onDragStart={() => handleDragStart(player.id)}
                            onDragEnd={handleDragEnd}
                          />
                          <div className="absolute -top-2 -right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                            <button
                              onClick={() => handleEdit(player)}
                              disabled={isSubmitting || showAddForm}
                              className={`${
                                isSubmitting || showAddForm
                                  ? 'bg-gray-500 cursor-not-allowed opacity-50'
                                  : 'bg-blue-600 hover:bg-blue-700'
                              } text-white rounded-full w-6 h-6 flex items-center justify-center text-xs shadow-lg transition-all`}
                              title="Edit player"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => handleDelete(player.id)}
                              className="bg-red-600 hover:bg-red-700 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs shadow-lg"
                              title="Delete player"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      ))}
                      {playersByLevel['Luyện Khí Kỳ'].length === 0 && (
                        <p className="text-gray-500 text-sm italic w-full text-center py-4">
                          Drop players here
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-white mb-4">All Players</h2>
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
                  {sortedAllPlayers.length > 0 ? (
                    <div className="flex flex-wrap gap-3">
                      {sortedAllPlayers.map((player) => (
                        <div key={player.id} className="relative group">
                          <PlayerCard player={player} />
                          <div className="absolute -top-2 -right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                            <button
                              onClick={() => handleEdit(player)}
                              className="bg-blue-600 hover:bg-blue-700 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm shadow-lg"
                              title="Edit player"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => handleDelete(player.id)}
                              className="bg-red-600 hover:bg-red-700 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm shadow-lg"
                              title="Delete player"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">No players yet. Add your first player!</p>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
