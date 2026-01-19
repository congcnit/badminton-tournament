import mongoose, { Schema, model, models } from 'mongoose';

export interface IPlayer {
  _id?: string;
  id: string;
  name: string;
  gender: 'M' | 'F';
  level: 'Luyện Khí Kỳ' | 'Trúc Cơ' | 'Kết Đan' | 'Nguyên Anh';
}

const PlayerSchema = new Schema<IPlayer>(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    gender: { type: String, required: true, enum: ['M', 'F'] },
    level: { type: String, required: true, enum: ['Luyện Khí Kỳ', 'Trúc Cơ', 'Kết Đan', 'Nguyên Anh'] },
  },
  { timestamps: true }
);

export const Player = models.Player || model<IPlayer>('Player', PlayerSchema);

