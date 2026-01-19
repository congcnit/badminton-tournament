'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import { useTournamentStore } from '@/store/tournamentStore';

export default function Dashboard() {
  const { players, teams, rounds, fetchAll, isLoading } = useTournamentStore();

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const completedRounds = rounds.filter((r) => r.completed).length;
  const totalPlayers = players.length;
  const assignedPlayers = teams.reduce((sum, team) => sum + team.players.length, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Tournament Dashboard</h1>
          <p className="text-gray-400">Manage your badminton tournament</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Total Players</p>
                <p className="text-3xl font-bold text-white">{totalPlayers}</p>
              </div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">👥</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Teams Created</p>
                <p className="text-3xl font-bold text-white">{teams.length}</p>
              </div>
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🏆</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Rounds Completed</p>
                <p className="text-3xl font-bold text-white">{completedRounds}</p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">✓</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
            <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link
                href="/teams"
                className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-all hover:shadow-lg hover:shadow-blue-500/50"
              >
                Build Teams
              </Link>
              <Link
                href="/rounds"
                className="block w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition-all hover:shadow-lg hover:shadow-purple-500/50"
              >
                Manage Rounds
              </Link>
              <Link
                href="/standings"
                className="block w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-all hover:shadow-lg hover:shadow-green-500/50"
              >
                View Standings
              </Link>
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
            <h2 className="text-xl font-bold text-white mb-4">Tournament Status</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Players Assigned</span>
                <span className="text-white font-semibold">
                  {assignedPlayers} / {totalPlayers}
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${(assignedPlayers / totalPlayers) * 100}%` }}
                />
              </div>
              <div className="flex justify-between items-center mt-4">
                <span className="text-gray-400">Teams Ready</span>
                <span className="text-white font-semibold">
                  {teams.filter((t) => t.players.length === 8).length} / {teams.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

