import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Player } from '@/models/Player';
import { Team } from '@/models/Team';
import playersData from '@/data/players.json';
import teamsData from '@/data/teams.json';

export async function POST() {
  try {
    await connectDB();

    // Seed players
    const players = playersData as any[];
    await Player.deleteMany({});
    await Player.insertMany(players);

    // Seed teams
    const teams = teamsData as any[];
    await Team.deleteMany({});
    await Team.insertMany(teams);

    return NextResponse.json({ 
      success: true, 
      message: 'Database seeded successfully',
      players: players.length,
      teams: teams.length
    });
  } catch (error) {
    console.error('Error seeding database:', error);
    return NextResponse.json({ error: 'Failed to seed database' }, { status: 500 });
  }
}




