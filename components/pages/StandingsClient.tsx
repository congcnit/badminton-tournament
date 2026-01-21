'use client';

import { Fragment, useEffect, useMemo, useState } from 'react';
import Navigation from '@/components/Navigation';
import { useTournamentStore } from '@/store/tournamentStore';
import { calculateStandings, getHeadToHeadStats } from '@/utils/standings';
import { Player, Round, Team } from '@/types';

interface StandingsClientProps {
  initialPlayers: Player[];
  initialTeams: Team[];
  initialRounds: Round[];
}

export default function StandingsClient({
  initialPlayers,
  initialTeams,
  initialRounds,
}: StandingsClientProps) {
  const { teams, rounds, hasHydrated, hydrate } = useTournamentStore();
  const [expandedTeams, setExpandedTeams] = useState<string[]>([]);

  useEffect(() => {
    if (!hasHydrated) {
      hydrate({ players: initialPlayers, teams: initialTeams, rounds: initialRounds });
    }
  }, [hasHydrated, hydrate, initialPlayers, initialRounds, initialTeams]);

  const standings = useMemo(() => calculateStandings(teams, rounds), [teams, rounds]);
  const headToHeadStats = useMemo(() => getHeadToHeadStats(teams, rounds), [teams, rounds]);
  const overallGameDiffs = useMemo(() => {
    const diffs = new Map<string, number>();
    const completedRounds = rounds.filter((round) => round.completed);
    teams.forEach((team) => diffs.set(team.id, 0));
    completedRounds.forEach((round) => {
      const team1Id = round.team1Id;
      const team2Id = round.team2Id;
      round.matches.forEach((match) => {
        if (!match.completedAt || !match.winner) return;
        (match.games || []).forEach((game) => {
          if (game.team1Score > game.team2Score) {
            diffs.set(team1Id, (diffs.get(team1Id) || 0) + 1);
            diffs.set(team2Id, (diffs.get(team2Id) || 0) - 1);
          } else if (game.team2Score > game.team1Score) {
            diffs.set(team2Id, (diffs.get(team2Id) || 0) + 1);
            diffs.set(team1Id, (diffs.get(team1Id) || 0) - 1);
          }
        });
      });
    });
    return diffs;
  }, [teams, rounds]);
  const overallPointDiffs = useMemo(() => {
    const diffs = new Map<string, number>();
    const completedRounds = rounds.filter((round) => round.completed);
    teams.forEach((team) => diffs.set(team.id, 0));
    completedRounds.forEach((round) => {
      const team1Id = round.team1Id;
      const team2Id = round.team2Id;
      round.matches.forEach((match) => {
        if (!match.completedAt || !match.winner) return;
        (match.games || []).forEach((game) => {
          diffs.set(team1Id, (diffs.get(team1Id) || 0) + (game.team1Score - game.team2Score));
          diffs.set(team2Id, (diffs.get(team2Id) || 0) + (game.team2Score - game.team1Score));
        });
      });
    });
    return diffs;
  }, [teams, rounds]);
  const teamNameById = useMemo(() => {
    const map = new Map<string, string>();
    teams.forEach((team) => map.set(team.id, team.name));
    return map;
  }, [teams]);

  const toggleExpanded = (teamId: string) => {
    setExpandedTeams((prev) =>
      prev.includes(teamId) ? prev.filter((id) => id !== teamId) : [...prev, teamId]
    );
  };

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
                    Game Diff
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Point Diff
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Head-to-Head
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {standings.map((standing, index) => {
                  const isTopThree = index < 3;
                  const isExpanded = expandedTeams.includes(standing.teamId);
                  const headToHead = headToHeadStats.get(standing.teamId) || [];
                  const gameDiff = overallGameDiffs.get(standing.teamId) || 0;
                  const pointDiff = overallPointDiffs.get(standing.teamId) || 0;
                  return (
                    <Fragment key={standing.teamId}>
                      <tr
                        className={`hover:bg-gray-700/50 transition-colors ${
                          isTopThree ? 'bg-gradient-to-r from-yellow-500/10 to-transparent' : ''
                        }`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {index === 0 && <span className="text-2xl mr-2">🥇</span>}
                            {index === 1 && <span className="text-2xl mr-2">🥈</span>}
                            {index === 2 && <span className="text-2xl mr-2">🥉</span>}
                            <span
                              className={`text-lg font-bold ${
                                isTopThree ? 'text-yellow-400' : 'text-gray-300'
                              }`}
                            >
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
                          <span
                            className={`font-semibold ${
                              gameDiff > 0
                                ? 'text-green-400'
                                : gameDiff < 0
                                ? 'text-red-400'
                                : 'text-gray-300'
                            }`}
                          >
                            {gameDiff}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span
                            className={`font-semibold ${
                              pointDiff > 0
                                ? 'text-green-400'
                                : pointDiff < 0
                                ? 'text-red-400'
                                : 'text-gray-300'
                            }`}
                          >
                            {pointDiff}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <button
                            onClick={() => toggleExpanded(standing.teamId)}
                            className="text-xs font-semibold text-blue-300 hover:text-blue-200"
                          >
                            {isExpanded ? 'Hide' : 'Show'}
                          </button>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr>
                          <td colSpan={8} className="px-6 py-4 bg-gray-900/40">
                            {headToHead.length === 0 ? (
                              <div className="text-sm text-gray-400">
                                No head-to-head stats yet.
                              </div>
                            ) : (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {headToHead.map((stat) => (
                                  <div
                                    key={`${standing.teamId}-${stat.opponentId}`}
                                    className="border border-gray-700 rounded-lg p-3 bg-gray-800/60"
                                  >
                                    <div className="text-sm font-semibold text-white mb-2">
                                      vs {teamNameById.get(stat.opponentId) || stat.opponentId}
                                    </div>
                                    <div className="text-xs text-gray-300 grid grid-cols-2 gap-2">
                                      <span>
                                        Matches: {stat.matchesWon}-{stat.matchesLost}
                                      </span>
                                      <span>Match diff: {stat.matchDiff}</span>
                                      <span>
                                        Games: {stat.gamesWon}-{stat.gamesLost}
                                      </span>
                                      <span>Game diff: {stat.gameDiff}</span>
                                      <span>
                                        Points: {stat.pointsFor}-{stat.pointsAgainst}
                                      </span>
                                      <span>Point diff: {stat.pointDiff}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </Fragment>
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
