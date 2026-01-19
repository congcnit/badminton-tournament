export type Gender = "M" | "F";
export type Level = "Luyện Khí Kỳ" | "Trúc Cơ" | "Kết Đan" | "Nguyên Anh";
export type MatchType = "Men's Doubles" | "Mixed Doubles" | "Women's Doubles";

export interface Player {
  id: string;
  name: string;
  gender: Gender;
  level: Level;
}

export interface Team {
  id: string;
  name: string;
  players: Player[];
}

export interface Game {
  team1Score: number;
  team2Score: number;
  winner?: "team1" | "team2";
}

export interface Match {
  id: string;
  type: MatchType;
  team1Players: string[]; // player IDs
  team2Players: string[]; // player IDs
  games: Game[]; // best of three games
  winner?: "team1" | "team2";
  startedAt?: string; // ISO timestamp
  completedAt?: string; // ISO timestamp
}

export interface Round {
  id: string;
  name: string;
  team1Id: string;
  team2Id: string;
  team1Lineup: string[]; // player IDs
  team2Lineup: string[]; // player IDs
  matches: Match[];
  completed: boolean;
}

export interface TeamStanding {
  teamId: string;
  teamName: string;
  roundsPlayed: number;
  wins: number;
  losses: number;
  totalPoints: number;
}

export interface TournamentState {
  players: Player[];
  teams: Team[];
  rounds: Round[];
}

