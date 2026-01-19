import mongoose, { Schema, model, models } from 'mongoose';

export interface IGame {
  team1Score: number;
  team2Score: number;
  winner?: 'team1' | 'team2';
}

export interface IMatch {
  id: string;
  type: "Men's Doubles" | "Mixed Doubles" | "Women's Doubles";
  team1Players: string[];
  team2Players: string[];
  games: IGame[]; // best of three games
  winner?: 'team1' | 'team2';
  startedAt?: string; // ISO timestamp
  completedAt?: string; // ISO timestamp
}

export interface IRound {
  _id?: string;
  id: string;
  name: string;
  team1Id: string;
  team2Id: string;
  team1Lineup: string[];
  team2Lineup: string[];
  matches: IMatch[];
  completed: boolean;
}

const GameSchema = new Schema<IGame>({
  team1Score: { type: Number, required: true, default: 0 },
  team2Score: { type: Number, required: true, default: 0 },
  winner: { type: String, enum: ['team1', 'team2'] },
});

const MatchSchema = new Schema<IMatch>({
  id: { type: String, required: true },
  type: { type: String, required: true, enum: ["Men's Doubles", "Mixed Doubles", "Women's Doubles"] },
  team1Players: [{ type: String }],
  team2Players: [{ type: String }],
  games: [GameSchema],
  winner: { type: String, enum: ['team1', 'team2'] },
  startedAt: { type: String },
  completedAt: { type: String },
});

const RoundSchema = new Schema<IRound>(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    team1Id: { type: String, required: true },
    team2Id: { type: String, required: true },
    team1Lineup: [{ type: String }],
    team2Lineup: [{ type: String }],
    matches: [MatchSchema],
    completed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Round = models.Round || model<IRound>('Round', RoundSchema);



