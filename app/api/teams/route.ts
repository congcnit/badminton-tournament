import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Team } from '@/models/Team';

export async function GET() {
  try {
    await connectDB();
    const teams = await Team.find({}).lean();
    return NextResponse.json(teams);
  } catch (error) {
    console.error('Error fetching teams:', error);
    return NextResponse.json({ error: 'Failed to fetch teams' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const team = await Team.findOneAndUpdate(
      { id: body.id },
      { $set: body },
      { upsert: true, new: true }
    );
    return NextResponse.json(team);
  } catch (error) {
    console.error('Error saving team:', error);
    return NextResponse.json({ error: 'Failed to save team' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { id, ...updateData } = body;
    
    const team = await Team.findOneAndUpdate(
      { id },
      { $set: updateData },
      { new: true }
    );
    
    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }
    
    return NextResponse.json(team);
  } catch (error) {
    console.error('Error updating team:', error);
    return NextResponse.json({ error: 'Failed to update team' }, { status: 500 });
  }
}




