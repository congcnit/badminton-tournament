import { Team, Round } from '@/types';
import { TeamStanding } from '@/types';

export function calculateStandings(teams: Team[], rounds: Round[]): TeamStanding[] {
  const standingsMap = new Map<string, TeamStanding>();

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
  rounds
    .filter((round) => round.completed)
    .forEach((round) => {
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

  return Array.from(standingsMap.values()).sort((a, b) => {
    // Sort by wins first, then by total points
    if (b.wins !== a.wins) {
      return b.wins - a.wins;
    }
    return b.totalPoints - a.totalPoints;
  });
}




