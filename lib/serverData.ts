import { unstable_noStore as noStore } from 'next/cache';
import connectDB from '@/lib/mongodb';
import { Player as PlayerModel } from '@/models/Player';
import { Team as TeamModel } from '@/models/Team';
import { Round as RoundModel } from '@/models/Round';
import { Player, Team, Round } from '@/types';

interface DbTeam {
  id: string;
  name: string;
  players?: string[];
}

interface DbRound {
  id: string;
  name: string;
  team1Id: string;
  team2Id: string;
  team1Lineup?: string[];
  team2Lineup?: string[];
  matches?: Array<{
    id: string;
    type: "Men's Doubles" | "Mixed Doubles" | "Women's Doubles";
    team1Players: string[];
    team2Players: string[];
    games?: Array<{ team1Score: number; team2Score: number; winner?: 'team1' | 'team2' }>;
    winner?: 'team1' | 'team2';
    startedAt?: string;
    completedAt?: string;
  }>;
  completed?: boolean;
  subRounds?: string[][];
}

export async function getTournamentData(): Promise<{
  players: Player[];
  teams: Team[];
  rounds: Round[];
}> {
  noStore();
  await connectDB();

  const [playerDocs, teamDocs, roundDocs] = await Promise.all([
    PlayerModel.find({}).lean(),
    TeamModel.find({}).lean<DbTeam[]>(),
    RoundModel.find({}).lean<DbRound[]>(),
  ]);

  const players: Player[] = playerDocs.map((player) => ({
    id: player.id,
    name: player.name,
    gender: player.gender,
    level: player.level,
  }));

  const playerMap = new Map(players.map((player) => [player.id, player]));

  const teams: Team[] = teamDocs.map((team) => ({
    id: team.id,
    name: team.name,
    players: (team.players || [])
      .map((playerId) => playerMap.get(playerId))
      .filter((player): player is Player => Boolean(player)),
  }));

  const rounds: Round[] = roundDocs.map((round) => ({
    id: round.id,
    name: round.name,
    team1Id: round.team1Id,
    team2Id: round.team2Id,
    team1Lineup: round.team1Lineup || [],
    team2Lineup: round.team2Lineup || [],
    matches: (round.matches || []).map((match) => ({
      id: match.id,
      type: match.type,
      team1Players: match.team1Players || [],
      team2Players: match.team2Players || [],
      games: (match.games || []).map((game) => ({
        team1Score: game.team1Score,
        team2Score: game.team2Score,
        winner: game.winner,
      })),
      winner: match.winner,
      startedAt: match.startedAt,
      completedAt: match.completedAt,
    })),
    completed: round.completed || false,
    subRounds: round.subRounds || [],
  }));

  return { players, teams, rounds };
}
