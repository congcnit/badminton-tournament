'use client';

import Navigation from '@/components/Navigation';
import { useTournamentStore } from '@/store/tournamentStore';
import { calculateStandings } from '@/utils/standings';

export default function StandingsPage() {
  const { teams, rounds } = useTournamentStore();
  const standings = calculateStandings(teams, rounds);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Tournament Standings</h1>
          <p className="text-gray-400">Live tournament leaderboard</p>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Team
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Rounds Played
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Wins
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Losses
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Total Points
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {standings.map((standing, index) => {
                  const isTopThree = index < 3;
                  return (
                    <tr
                      key={standing.teamId}
                      className={`hover:bg-gray-700/50 transition-colors ${
                        isTopThree ? 'bg-gradient-to-r from-yellow-500/10 to-transparent' : ''
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {index === 0 && <span className="text-2xl mr-2">🥇</span>}
                          {index === 1 && <span className="text-2xl mr-2">🥈</span>}
                          {index === 2 && <span className="text-2xl mr-2">🥉</span>}
                          <span className={`text-lg font-bold ${
                            isTopThree ? 'text-yellow-400' : 'text-gray-300'
                          }`}>
                            {index + 1}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-white font-semibold text-lg">
                          {standing.teamName}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-gray-300">
                        {standing.roundsPlayed}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="text-green-400 font-semibold">
                          {standing.wins}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="text-red-400 font-semibold">
                          {standing.losses}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="text-blue-400 font-bold text-lg">
                          {standing.totalPoints}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {standings.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      No rounds completed yet. Complete some rounds to see standings.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}




