'use client';

import { useEffect, useMemo, useState } from 'react';
import Navigation from '@/components/Navigation';
import MatchCard from '@/components/MatchCard';
import { useTournamentStore } from '@/store/tournamentStore';
import { useAuthStore } from '@/store/authStore';
import { MatchType, Player, Round, Team } from '@/types';
import { validatePlayerGenderForMatch } from '@/utils/matchValidation';
import { validatePlayerAdditionToMatch, validateRoundPlayerAssignments } from '@/utils/roundValidation';

const MATCH_TYPES: MatchType[] = ["Mixed Doubles", "Men's Doubles","Women's Doubles"];

interface RoundsClientProps {
  initialPlayers: Player[];
  initialTeams: Team[];
  initialRounds: Round[];
}

export default function RoundsClient({
  initialPlayers,
  initialTeams,
  initialRounds,
}: RoundsClientProps) {
  const {
    players,
    teams,
    rounds,
    createRound,
    deleteRound,
    addMatchToRound,
    removeMatchFromRound,
    updateMatchPlayers,
    updateGameScore,
    startMatch,
    stopMatch,
    completeMatch,
    completeRound,
    updateRound,
    hasHydrated,
    hydrate,
  } = useTournamentStore();
  const { role, isAuthenticated } = useAuthStore();
  const isAdmin = isAuthenticated && role === 'admin';

  const [selectedRoundId, setSelectedRoundId] = useState<string | null>(
    initialRounds[0]?.id ?? null
  );
  const [newRoundName, setNewRoundName] = useState('');
  const [newRoundTeam1, setNewRoundTeam1] = useState('');
  const [newRoundTeam2, setNewRoundTeam2] = useState('');
  const [showNewRoundForm, setShowNewRoundForm] = useState(false);

  useEffect(() => {
    if (!hasHydrated) {
      hydrate({ players: initialPlayers, teams: initialTeams, rounds: initialRounds });
    }
  }, [hasHydrated, hydrate, initialPlayers, initialRounds, initialTeams]);

  useEffect(() => {
    if (rounds.length > 0 && !selectedRoundId) {
      setSelectedRoundId(rounds[0].id);
    }
  }, [rounds, selectedRoundId]);

  const selectedRound = useMemo(
    () => rounds.find((r) => r.id === selectedRoundId),
    [rounds, selectedRoundId]
  );
  const team1 = useMemo(
    () => teams.find((t) => t.id === selectedRound?.team1Id),
    [teams, selectedRound?.team1Id]
  );
  const team2 = useMemo(
    () => teams.find((t) => t.id === selectedRound?.team2Id),
    [teams, selectedRound?.team2Id]
  );
  const startDisabledReasons = useMemo(() => {
    const reasons = new Map<string, string | null>();
    if (!selectedRound) {
      return reasons;
    }

    const hasUnassignedMatch = selectedRound.matches.some(
      (match) => match.team1Players.length < 2 || match.team2Players.length < 2
    );
    if (hasUnassignedMatch) {
      selectedRound.matches.forEach((match) => {
        reasons.set(match.id, 'Assign players for all matches before starting');
      });
      return reasons;
    }

    if (!selectedRound.subRounds || selectedRound.subRounds.length !== 2) {
      return reasons;
    }

    const groups = selectedRound.subRounds;
    const activeSubRoundIndex = groups.findIndex((group) =>
      group.some((matchId) => {
        const match = selectedRound.matches.find((m) => m.id === matchId);
        return match?.startedAt && !match?.completedAt;
      })
    );
    if (activeSubRoundIndex === -1) {
      return reasons;
    }
    groups.forEach((group, index) => {
      if (index === activeSubRoundIndex) {
        return;
      }
      group.forEach((matchId) => {
        reasons.set(matchId, 'Another sub-round is already in progress');
      });
    });
    return reasons;
  }, [selectedRound]);
  const roundScores = useMemo(() => {
    const scores = new Map<string, { team1: number; team2: number }>();
    rounds.forEach((round) => {
      let team1Wins = 0;
      let team2Wins = 0;
      round.matches.forEach((match) => {
        if (match.winner === 'team1') {
          team1Wins += 1;
        } else if (match.winner === 'team2') {
          team2Wins += 1;
        }
      });
      scores.set(round.id, { team1: team1Wins, team2: team2Wins });
    });
    return scores;
  }, [rounds]);

  const handleCreateRound = () => {
    if (!isAdmin) return;
    if (newRoundName && newRoundTeam1 && newRoundTeam2 && newRoundTeam1 !== newRoundTeam2) {
      createRound(newRoundName, newRoundTeam1, newRoundTeam2);
      setNewRoundName('');
      setNewRoundTeam1('');
      setNewRoundTeam2('');
      setShowNewRoundForm(false);
    }
  };

  useEffect(() => {
    if (rounds.length > 0) {
      const lastRound = rounds[rounds.length - 1];
      if (!selectedRoundId || !rounds.find((r) => r.id === selectedRoundId)) {
        setSelectedRoundId(lastRound.id);
      }
    }
  }, [rounds.length, rounds, selectedRoundId]);

  const handleAddMatch = (matchType: MatchType) => {
    if (!isAdmin || !selectedRound) return;

    const matchesOfType = selectedRound.matches.filter((m) => m.type === matchType).length;
    let maxMatches = 0;

    switch (matchType) {
      case "Men's Doubles":
        maxMatches = 3;
        break;
      case "Mixed Doubles":
        maxMatches = 2;
        break;
      case "Women's Doubles":
        maxMatches = 1;
        break;
    }

    if (matchesOfType >= maxMatches) {
      alert(
        `Maximum ${maxMatches} ${matchType} match${maxMatches > 1 ? 'es' : ''} per round. Please remove a ${matchType} match before adding another one.`
      );
      return;
    }

    const matchId = `match-${Date.now()}-${Math.random()}`;
    const newMatch = {
      id: matchId,
      type: matchType,
      team1Players: [],
      team2Players: [],
      games: [],
    };

    addMatchToRound(selectedRound.id, newMatch);
  };

  const handleRemoveMatch = (matchId: string) => {
    if (!isAdmin || !selectedRound) return;
    if (confirm('Are you sure you want to remove this match?')) {
      removeMatchFromRound(selectedRound.id, matchId);
    }
  };

  const handleAddPlayer = (matchId: string, team: 'team1' | 'team2', playerId: string) => {
    if (!isAdmin || !selectedRound || !team1 || !team2) return;

    const match = selectedRound.matches.find((m) => m.id === matchId);
    if (!match) return;

    const currentPlayers = team === 'team1' ? match.team1Players : match.team2Players;

    const isDoubles = ["Men's Doubles", "Mixed Doubles", "Women's Doubles"].includes(match.type);
    if (isDoubles && currentPlayers.length >= 2) {
      alert('Doubles matches can only have 2 players per team');
      return;
    }

    const player = players.find((p) => p.id === playerId);
    if (!player) {
      alert('Player not found');
      return;
    }

    const genderValidation = validatePlayerGenderForMatch(
      match.type,
      player.gender,
      currentPlayers,
      players
    );

    if (!genderValidation.isValid) {
      alert(genderValidation.errorMessage || 'Invalid player for this match type');
      return;
    }

    const team1PlayerIds = team1.players.map((p) => p.id);
    const team2PlayerIds = team2.players.map((p) => p.id);
    const roundValidation = validatePlayerAdditionToMatch(
      selectedRound,
      matchId,
      team,
      playerId,
      team1PlayerIds,
      team2PlayerIds
    );

    if (!roundValidation.isValid) {
      alert(roundValidation.errorMessage || 'Invalid player assignment for this round');
      return;
    }

    if (!currentPlayers.includes(playerId)) {
      updateMatchPlayers(selectedRound.id, matchId, team, [...currentPlayers, playerId]);
    }
  };

  const handleRemovePlayer = (matchId: string, team: 'team1' | 'team2', playerId: string) => {
    if (!isAdmin || !selectedRound) return;

    const match = selectedRound.matches.find((m) => m.id === matchId);
    if (!match) return;

    const currentPlayers = team === 'team1' ? match.team1Players : match.team2Players;
    updateMatchPlayers(selectedRound.id, matchId, team, currentPlayers.filter((id) => id !== playerId));
  };

  const handleGameScoreUpdate = (
    matchId: string,
    gameIndex: number,
    team1Score: number,
    team2Score: number
  ) => {
    if (!selectedRound) return;
    updateGameScore(selectedRound.id, matchId, gameIndex, team1Score, team2Score);
  };

  const handleStartMatch = (matchId: string) => {
    if (!isAdmin) return;
    if (!selectedRound || !team1 || !team2) return;

    const team1PlayerIds = team1.players.map((p) => p.id);
    const team2PlayerIds = team2.players.map((p) => p.id);
    const allPlayersInRound = [...team1.players, ...team2.players];
    const validation = validateRoundPlayerAssignments(
      selectedRound,
      team1PlayerIds,
      team2PlayerIds,
      allPlayersInRound
    );

    if (!validation.isValid) {
      const errorMessage = validation.errors.join('\n');
      alert(`Cannot start match. Please fix the following issues:\n${errorMessage}`);
      return;
    }

    startMatch(selectedRound.id, matchId);
  };

  const handleStopMatch = (matchId: string) => {
    if (!isAdmin) return;
    if (!selectedRound) return;
    if (confirm('Stop this match? Scores and winner will be cleared.')) {
      stopMatch(selectedRound.id, matchId);
    }
  };

  const handleCompleteMatch = (matchId: string) => {
    if (!isAdmin) return;
    if (!selectedRound) return;
    completeMatch(selectedRound.id, matchId);
  };

  const arrangeSubRounds = (round: Round) => {
    const matches = round.matches;
    if (matches.length !== 6) {
      return null;
    }
    const hasUnassigned = matches.some(
      (match) => match.team1Players.length < 2 || match.team2Players.length < 2
    );
    if (hasUnassigned) {
      return null;
    }

    const matchIds = matches.map((match) => match.id);
    const matchPlayers = new Map(
      matches.map((match) => [
        match.id,
        new Set([...match.team1Players, ...match.team2Players]),
      ])
    );

    const hasConflict = (a: string, b: string) => {
      const aPlayers = matchPlayers.get(a);
      const bPlayers = matchPlayers.get(b);
      if (!aPlayers || !bPlayers) return false;
      for (const playerId of aPlayers) {
        if (bPlayers.has(playerId)) {
          return true;
        }
      }
      return false;
    };

    const isGroupValid = (group: string[]) => {
      for (let i = 0; i < group.length; i += 1) {
        for (let j = i + 1; j < group.length; j += 1) {
          if (hasConflict(group[i], group[j])) {
            return false;
          }
        }
      }
      return true;
    };

    let arranged: string[][] | null = null;
    for (let i = 0; i < matchIds.length && !arranged; i += 1) {
      for (let j = i + 1; j < matchIds.length && !arranged; j += 1) {
        for (let k = j + 1; k < matchIds.length && !arranged; k += 1) {
          const groupA = [matchIds[i], matchIds[j], matchIds[k]];
          if (!isGroupValid(groupA)) {
            continue;
          }
          const groupB = matchIds.filter((id) => !groupA.includes(id));
          if (groupB.length !== 3) {
            continue;
          }
          if (isGroupValid(groupB)) {
            arranged = [groupA, groupB];
          }
        }
      }
    }

    if (!arranged) {
      return null;
    }

    const normalizeGroup = (group: string[]) => [...group].sort().join('|');
    const arrangedKey = arranged.map(normalizeGroup).sort().join('::');
    const currentSubRounds = round.subRounds || [];
    const currentKey =
      currentSubRounds.length === 2
        ? currentSubRounds.map(normalizeGroup).sort().join('::')
        : '';

    if (currentKey && currentKey === arrangedKey) {
      return null;
    }

    const arrangedMatches = arranged
      .flat()
      .map((matchId) => matches.find((item) => item.id === matchId))
      .filter((match): match is (typeof matches)[number] => Boolean(match));

    return { subRounds: arranged, matches: arrangedMatches };
  };

  useEffect(() => {
    if (!isAdmin || !selectedRound) return;
    if (selectedRound.matches.length !== 6) return;
    if (
      selectedRound.matches.some(
        (match) => match.team1Players.length < 2 || match.team2Players.length < 2
      )
    ) {
      return;
    }
    const arrangement = arrangeSubRounds(selectedRound);
    if (!arrangement) return;
    updateRound({ ...selectedRound, ...arrangement });
  }, [isAdmin, selectedRound, updateRound]);

  const handleCompleteRound = () => {
    if (!isAdmin || !selectedRound || !team1 || !team2) return;

    if (selectedRound.matches.length === 0) {
      alert('Cannot complete round: No matches have been added.');
      return;
    }

    const incompleteMatches = selectedRound.matches.filter(
      (match) => !match.winner || !match.completedAt
    );

    if (incompleteMatches.length > 0) {
      alert(
        `Cannot complete round: ${incompleteMatches.length} match${incompleteMatches.length > 1 ? 'es have' : ' has'} not been completed. Please complete all matches by entering scores and clicking "Complete Match".`
      );
      return;
    }

    const team1PlayerIds = team1.players.map((p) => p.id);
    const team2PlayerIds = team2.players.map((p) => p.id);
    const allPlayersInRound = [...team1.players, ...team2.players];
    const validation = validateRoundPlayerAssignments(
      selectedRound,
      team1PlayerIds,
      team2PlayerIds,
      allPlayersInRound
    );

    if (!validation.isValid) {
      const errorMessage = validation.errors.join('\n');
      alert(`Cannot complete round:\n${errorMessage}`);
      return;
    }

    if (confirm('Mark this round as completed?')) {
      completeRound(selectedRound.id);
    }
  };

  const handleDeleteRound = async (roundId: string) => {
    if (!isAdmin) return;
    if (confirm('Are you sure you want to delete this round? This action cannot be undone.')) {
      try {
        await deleteRound(roundId);
        if (selectedRoundId === roundId) {
          const remainingRounds = rounds.filter((r) => r.id !== roundId);
          setSelectedRoundId(remainingRounds.length > 0 ? remainingRounds[0].id : null);
        }
      } catch (error) {
        console.error('Error deleting round:', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            {isAdmin ? 'Match Manager' : 'Matches'}
          </h1>
          <p className="text-gray-400">
            {isAdmin ? 'Create rounds and manage matches' : 'View rounds and matches'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Rounds</h2>
                {isAdmin && (
                  <button
                    onClick={() => setShowNewRoundForm(!showNewRoundForm)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-sm transition-all"
                  >
                    + New
                  </button>
                )}
              </div>

              {showNewRoundForm && (
                <div className="mb-4 p-3 bg-gray-700/50 rounded-lg space-y-2">
                  <input
                    type="text"
                    placeholder="Round name"
                    value={newRoundName}
                    onChange={(e) => setNewRoundName(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                  />
                  <select
                    value={newRoundTeam1}
                    onChange={(e) => {
                      setNewRoundTeam1(e.target.value);
                      if (e.target.value === newRoundTeam2) {
                        setNewRoundTeam2('');
                      }
                    }}
                    className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Select Team 1</option>
                    {teams
                      .filter((team) => team.id !== newRoundTeam2)
                      .map((team) => (
                        <option key={team.id} value={team.id}>
                          {team.name}
                        </option>
                      ))}
                  </select>
                  <select
                    value={newRoundTeam2}
                    onChange={(e) => {
                      setNewRoundTeam2(e.target.value);
                      if (e.target.value === newRoundTeam1) {
                        setNewRoundTeam1('');
                      }
                    }}
                    className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Select Team 2</option>
                    {teams
                      .filter((team) => team.id !== newRoundTeam1)
                      .map((team) => (
                        <option key={team.id} value={team.id}>
                          {team.name}
                        </option>
                      ))}
                  </select>
                  <div className="flex gap-2">
                    <button
                      onClick={handleCreateRound}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm"
                    >
                      Create
                    </button>
                    <button
                      onClick={() => {
                        setShowNewRoundForm(false);
                        setNewRoundName('');
                        setNewRoundTeam1('');
                        setNewRoundTeam2('');
                      }}
                      className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {rounds.map((round) => {
                  const roundTeam1 = teams.find((t) => t.id === round.team1Id);
                  const roundTeam2 = teams.find((t) => t.id === round.team2Id);
                  const roundScore = roundScores.get(round.id);
                  return (
                    <div
                      key={round.id}
                      className={`group relative w-full p-3 rounded-lg transition-all ${
                        selectedRoundId === round.id
                          ? 'bg-blue-600 text-white'
                          : round.completed
                          ? 'bg-green-900/40 text-green-100 border border-green-500/40'
                          : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      <button
                        onClick={() => setSelectedRoundId(round.id)}
                        className="w-full text-left"
                      >
                        <div className="font-semibold">{round.name}</div>
                        <div className="text-xs mt-1 opacity-75">
                          {roundTeam1?.name} vs {roundTeam2?.name}
                        </div>
                        {round.completed && (
                          <div className="mt-2 flex items-center gap-2">
                            <span className="text-xs text-green-300">✓ Completed</span>
                            {roundScore && (
                              <span className="text-xs font-semibold bg-green-500/20 text-green-200 border border-green-400/40 px-2 py-0.5 rounded-full">
                                {roundScore.team1} - {roundScore.team2}
                              </span>
                            )}
                          </div>
                        )}
                      </button>
                      {isAdmin && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteRound(round.id);
                          }}
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300 text-sm"
                          title="Delete round"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  );
                })}
                {rounds.length === 0 && (
                  <p className="text-gray-500 text-sm text-center py-4">
                    {isAdmin ? 'No rounds created yet' : 'No rounds available yet'}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            {selectedRound ? (
              <div className="space-y-6">
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-2">{selectedRound.name}</h2>
                      <p className="text-gray-400">
                        {team1?.name} vs {team2?.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {selectedRound.completed && roundScores.get(selectedRound.id) && (
                        <span className="inline-flex items-center gap-2 text-sm font-bold bg-green-500/20 text-green-100 border border-green-400/40 px-3 py-1 rounded-full">
                          Round score {roundScores.get(selectedRound.id)?.team1} - {roundScores.get(selectedRound.id)?.team2}
                        </span>
                      )}
                      {isAdmin &&
                        !selectedRound.completed &&
                        selectedRound.matches.length > 0 &&
                        selectedRound.matches.every((match) => match.winner && match.completedAt) && (
                          <button
                            onClick={handleCompleteRound}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-all"
                            title="Mark this round as completed"
                          >
                            Complete Round
                          </button>
                        )}
                    </div>
                  </div>

                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-white mb-3">Matches</h3>
                    {isAdmin && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {MATCH_TYPES.map((matchType) => {
                          const matchesOfType = selectedRound.matches.filter(
                            (m) => m.type === matchType
                          ).length;
                          let maxMatches = 0;

                          switch (matchType) {
                            case "Men's Doubles":
                              maxMatches = 3;
                              break;
                            case "Mixed Doubles":
                              maxMatches = 2;
                              break;
                            case "Women's Doubles":
                              maxMatches = 1;
                              break;
                          }

                          const isDisabled = matchesOfType >= maxMatches;

                          return (
                            <button
                              key={matchType}
                              onClick={() => handleAddMatch(matchType)}
                              disabled={isDisabled}
                              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                                isDisabled
                                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed opacity-60'
                                  : 'bg-purple-600 hover:bg-purple-700 text-white'
                              }`}
                              title={
                                isDisabled
                                  ? `Maximum ${maxMatches} ${matchType} match${maxMatches > 1 ? 'es' : ''} per round`
                                  : `Add ${matchType} match`
                              }
                            >
                              + {matchType} ({matchesOfType}/{maxMatches})
                            </button>
                          );
                        })}
                      </div>
                    )}

                    <div className="space-y-3">
                      {selectedRound.subRounds && selectedRound.subRounds.length === 2
                        ? selectedRound.subRounds.map((group, index) => (
                            <div
                              key={`subround-${index}`}
                              className="bg-gray-900/40 border border-gray-700 rounded-xl p-4 space-y-3"
                            >
                              <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                                <span className="text-sm font-semibold text-emerald-200">
                                  Sub-round {index + 1}
                                </span>
                              </div>
                              {group.map((matchId) => {
                                const match = selectedRound.matches.find((m) => m.id === matchId);
                                if (!match) {
                                  return null;
                                }
                                const matchTeam1Players = (team1?.players || []).filter((p) =>
                                  match.team1Players.includes(p.id)
                                );
                                const matchTeam2Players = (team2?.players || []).filter((p) =>
                                  match.team2Players.includes(p.id)
                                );
                                return (
                                  <MatchCard
                                    key={match.id}
                                    match={match}
                                    team1Name={team1?.name || ''}
                                    team2Name={team2?.name || ''}
                                    team1Players={matchTeam1Players}
                                    team2Players={matchTeam2Players}
                                    allTeam1Players={team1?.players || []}
                                    allTeam2Players={team2?.players || []}
                                    allMatches={selectedRound.matches}
                                    round={selectedRound}
                                    team1PlayerIds={team1?.players.map((p) => p.id) || []}
                                    team2PlayerIds={team2?.players.map((p) => p.id) || []}
                                    onGameScoreUpdate={(gameIndex, team1Score, team2Score) =>
                                      handleGameScoreUpdate(match.id, gameIndex, team1Score, team2Score)
                                    }
                                    onAddPlayer={(team, playerId) =>
                                      handleAddPlayer(match.id, team, playerId)
                                    }
                                    onPlayerRemove={(team, playerId) =>
                                      handleRemovePlayer(match.id, team, playerId)
                                    }
                                    onRemove={() => handleRemoveMatch(match.id)}
                                    onStartMatch={() => handleStartMatch(match.id)}
                                    onStopMatch={() => handleStopMatch(match.id)}
                                    onCompleteMatch={() => handleCompleteMatch(match.id)}
                                    startDisabledReason={startDisabledReasons.get(match.id) || null}
                                    editable={isAdmin && !selectedRound.completed}
                                  />
                                );
                              })}
                            </div>
                          ))
                        : selectedRound.matches.map((match) => {
                            const matchTeam1Players = (team1?.players || []).filter((p) =>
                              match.team1Players.includes(p.id)
                            );
                            const matchTeam2Players = (team2?.players || []).filter((p) =>
                              match.team2Players.includes(p.id)
                            );
                            
                            return (
                              <MatchCard
                                key={match.id}
                                match={match}
                                team1Name={team1?.name || ''}
                                team2Name={team2?.name || ''}
                                team1Players={matchTeam1Players}
                                team2Players={matchTeam2Players}
                                allTeam1Players={team1?.players || []}
                                allTeam2Players={team2?.players || []}
                                allMatches={selectedRound.matches}
                                round={selectedRound}
                                team1PlayerIds={team1?.players.map((p) => p.id) || []}
                                team2PlayerIds={team2?.players.map((p) => p.id) || []}
                                onGameScoreUpdate={(gameIndex, team1Score, team2Score) =>
                                  handleGameScoreUpdate(match.id, gameIndex, team1Score, team2Score)
                                }
                                onAddPlayer={(team, playerId) =>
                                  handleAddPlayer(match.id, team, playerId)
                                }
                                onPlayerRemove={(team, playerId) =>
                                  handleRemovePlayer(match.id, team, playerId)
                                }
                                onRemove={() => handleRemoveMatch(match.id)}
                                onStartMatch={() => handleStartMatch(match.id)}
                                onStopMatch={() => handleStopMatch(match.id)}
                                onCompleteMatch={() => handleCompleteMatch(match.id)}
                                startDisabledReason={startDisabledReasons.get(match.id) || null}
                                editable={isAdmin && !selectedRound.completed}
                              />
                            );
                          })}
                      {selectedRound.matches.length === 0 && (
                        <p className="text-gray-500 text-center py-4">
                          {isAdmin
                            ? 'No matches added yet. Click buttons above to add matches.'
                            : 'No matches available yet.'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-12 text-center">
                <p className="text-gray-400 text-lg">
                  {rounds.length === 0
                    ? isAdmin
                      ? 'Create your first round to get started'
                      : 'No rounds available yet'
                    : 'Select a round to view details'}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
