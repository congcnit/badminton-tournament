import { Team, Round } from '@/types';
import { TeamStanding } from '@/types';

export interface HeadToHeadStat {
  opponentId: string;
  matchDiff: number;
  gameDiff: number;
  pointDiff: number;
  matchesWon: number;
  matchesLost: number;
  gamesWon: number;
  gamesLost: number;
  pointsFor: number;
  pointsAgainst: number;
}

interface HeadToHeadEntry extends HeadToHeadStat {
  teamId: string;
}

const buildHeadToHeadMap = (teams: Team[], rounds: Round[]) => {
  const completedRounds = rounds.filter((round) => round.completed);
  const map = new Map<string, Map<string, HeadToHeadEntry>>();

  teams.forEach((team) => {
    map.set(team.id, new Map());
  });

  const ensureEntry = (teamId: string, opponentId: string) => {
    const teamMap = map.get(teamId);
    if (!teamMap) return null;
    const existing = teamMap.get(opponentId);
    if (existing) return existing;
    const entry: HeadToHeadEntry = {
      teamId,
      opponentId,
      matchDiff: 0,
      gameDiff: 0,
      pointDiff: 0,
      matchesWon: 0,
      matchesLost: 0,
      gamesWon: 0,
      gamesLost: 0,
      pointsFor: 0,
      pointsAgainst: 0,
    };
    teamMap.set(opponentId, entry);
    return entry;
  };

  completedRounds.forEach((round) => {
    const team1Id = round.team1Id;
    const team2Id = round.team2Id;
    const team1Entry = ensureEntry(team1Id, team2Id);
    const team2Entry = ensureEntry(team2Id, team1Id);
    if (!team1Entry || !team2Entry) return;

    round.matches.forEach((match) => {
      if (!match.completedAt || !match.winner) return;

      const winnerId = match.winner === 'team1' ? team1Id : team2Id;
      if (winnerId === team1Id) {
        team1Entry.matchesWon += 1;
        team2Entry.matchesLost += 1;
        team1Entry.matchDiff += 1;
        team2Entry.matchDiff -= 1;
      } else {
        team2Entry.matchesWon += 1;
        team1Entry.matchesLost += 1;
        team2Entry.matchDiff += 1;
        team1Entry.matchDiff -= 1;
      }

      (match.games || []).forEach((game) => {
        const team1Score = game.team1Score;
        const team2Score = game.team2Score;

        team1Entry.pointsFor += team1Score;
        team1Entry.pointsAgainst += team2Score;
        team2Entry.pointsFor += team2Score;
        team2Entry.pointsAgainst += team1Score;
        team1Entry.pointDiff += team1Score - team2Score;
        team2Entry.pointDiff += team2Score - team1Score;

        if (team1Score > team2Score) {
          team1Entry.gamesWon += 1;
          team2Entry.gamesLost += 1;
          team1Entry.gameDiff += 1;
          team2Entry.gameDiff -= 1;
        } else if (team2Score > team1Score) {
          team2Entry.gamesWon += 1;
          team1Entry.gamesLost += 1;
          team2Entry.gameDiff += 1;
          team1Entry.gameDiff -= 1;
        }
      });
    });
  });

  return map;
};

const computeOverallGameDiffs = (teams: Team[], rounds: Round[]) => {
  const completedRounds = rounds.filter((round) => round.completed);
  const diffs = new Map<string, number>();
  teams.forEach((team) => diffs.set(team.id, 0));

  completedRounds.forEach((round) => {
    const team1Id = round.team1Id;
    const team2Id = round.team2Id;
    round.matches.forEach((match) => {
      if (!match.completedAt || !match.winner) return;
      (match.games || []).forEach((game) => {
        const team1Score = game.team1Score;
        const team2Score = game.team2Score;
        if (team1Score > team2Score) {
          diffs.set(team1Id, (diffs.get(team1Id) || 0) + 1);
          diffs.set(team2Id, (diffs.get(team2Id) || 0) - 1);
        } else if (team2Score > team1Score) {
          diffs.set(team2Id, (diffs.get(team2Id) || 0) + 1);
          diffs.set(team1Id, (diffs.get(team1Id) || 0) - 1);
        }
      });
    });
  });

  return diffs;
};

const computeOverallPointDiffs = (teams: Team[], rounds: Round[]) => {
  const completedRounds = rounds.filter((round) => round.completed);
  const diffs = new Map<string, number>();
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
};

export function getHeadToHeadStats(teams: Team[], rounds: Round[]) {
  const map = buildHeadToHeadMap(teams, rounds);
  const result = new Map<string, HeadToHeadStat[]>();
  map.forEach((opponentMap, teamId) => {
    const stats = Array.from(opponentMap.values()).map((entry) => ({
      opponentId: entry.opponentId,
      matchDiff: entry.matchDiff,
      gameDiff: entry.gameDiff,
      pointDiff: entry.pointDiff,
      matchesWon: entry.matchesWon,
      matchesLost: entry.matchesLost,
      gamesWon: entry.gamesWon,
      gamesLost: entry.gamesLost,
      pointsFor: entry.pointsFor,
      pointsAgainst: entry.pointsAgainst,
    }));
    result.set(teamId, stats);
  });
  return result;
}

export function calculateStandings(teams: Team[], rounds: Round[]): TeamStanding[] {
  const standingsMap = new Map<string, TeamStanding>();
  const completedRounds = rounds.filter((round) => round.completed);

  // Initialize standings for all teams
  teams.forEach((team) => {
    standingsMap.set(team.id, {
      teamId: team.id,
      teamName: team.name,
      roundsPlayed: 0,
      wins: 0,
      losses: 0,
      totalPoints: 0,
    });
  });

  // Process completed rounds
  completedRounds.forEach((round) => {
      const team1Standing = standingsMap.get(round.team1Id);
      const team2Standing = standingsMap.get(round.team2Id);

      if (!team1Standing || !team2Standing) return;

      // Count individual match wins and losses for each team
      round.matches.forEach((match) => {
        // Only count matches that are completed (have completedAt timestamp) and have a winner
        if (match.completedAt && match.winner) {
          if (match.winner === 'team1') {
            team1Standing.wins++;
            team2Standing.losses++;
            team1Standing.totalPoints += 1;
          } else if (match.winner === 'team2') {
            team2Standing.wins++;
            team1Standing.losses++;
            team2Standing.totalPoints += 1;
          }
        }
      });

      // Count rounds played (if there's at least one completed match in the round)
      const hasCompletedMatches = round.matches.some(
        (match) => match.completedAt && match.winner
      );
      if (hasCompletedMatches) {
        team1Standing.roundsPlayed++;
        team2Standing.roundsPlayed++;
      }
    });

  const standings = Array.from(standingsMap.values());
  const overallGameDiffs = computeOverallGameDiffs(teams, rounds);
  const overallPointDiffs = computeOverallPointDiffs(teams, rounds);
  const headToHeadRawMap = buildHeadToHeadMap(teams, rounds);

  const headToHeadAggregate = new Map<string, { matchDiff: number; gameDiff: number; pointDiff: number }>();
  const pointsGroups = new Map<number, TeamStanding[]>();
  standings.forEach((standing) => {
    const group = pointsGroups.get(standing.totalPoints) || [];
    group.push(standing);
    pointsGroups.set(standing.totalPoints, group);
  });

  pointsGroups.forEach((group) => {
    if (group.length < 2) return;
    const tiedIds = new Set(group.map((standing) => standing.teamId));
    group.forEach((standing) => {
      let matchDiff = 0;
      let gameDiff = 0;
      let pointDiff = 0;
      const opponentMap = headToHeadRawMap.get(standing.teamId);
      if (opponentMap) {
        opponentMap.forEach((entry, opponentId) => {
          if (!tiedIds.has(opponentId)) return;
          matchDiff += entry.matchDiff;
          gameDiff += entry.gameDiff;
          pointDiff += entry.pointDiff;
        });
      }
      headToHeadAggregate.set(standing.teamId, { matchDiff, gameDiff, pointDiff });
    });
  });

  return standings.sort((a, b) => {
    if (b.totalPoints !== a.totalPoints) {
      return b.totalPoints - a.totalPoints;
    }

    const aOverallGameDiff = overallGameDiffs.get(a.teamId) || 0;
    const bOverallGameDiff = overallGameDiffs.get(b.teamId) || 0;
    if (bOverallGameDiff !== aOverallGameDiff) {
      return bOverallGameDiff - aOverallGameDiff;
    }

    const aOverallPointDiff = overallPointDiffs.get(a.teamId) || 0;
    const bOverallPointDiff = overallPointDiffs.get(b.teamId) || 0;
    if (bOverallPointDiff !== aOverallPointDiff) {
      return bOverallPointDiff - aOverallPointDiff;
    }

    const aStats = headToHeadAggregate.get(a.teamId);
    const bStats = headToHeadAggregate.get(b.teamId);
    if (aStats && bStats) {
      if (bStats.matchDiff !== aStats.matchDiff) {
        return bStats.matchDiff - aStats.matchDiff;
      }
      if (bStats.gameDiff !== aStats.gameDiff) {
        return bStats.gameDiff - aStats.gameDiff;
      }
      if (bStats.pointDiff !== aStats.pointDiff) {
        return bStats.pointDiff - aStats.pointDiff;
      }
    }

    return a.teamName.localeCompare(b.teamName);
  });
}




