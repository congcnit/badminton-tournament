import mongoose, { Schema, model, models } from 'mongoose';

export interface ITeam {
  _id?: string;
  id: string;
  name: string;
  players: string[]; // Array of player IDs
}

const TeamSchema = new Schema<ITeam>(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    players: [{ type: String }],
  },
  { timestamps: true }
);

export const Team = models.Team || model<ITeam>('Team', TeamSchema);




