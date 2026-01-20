import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/apiAuth';
import connectDB from '@/lib/mongodb';
import { Player } from '@/models/Player';

export async function GET() {
  try {
    await connectDB();
    const players = await Player.find({}).lean();
    return NextResponse.json(players);
  } catch (error) {
    console.error('Error fetching players:', error);
    return NextResponse.json({ error: 'Failed to fetch players' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const unauthorized = requireAdmin();
  if (unauthorized) {
    return unauthorized;
  }

  try {
    await connectDB();
    const body = await request.json();
    const players = Array.isArray(body) ? body : [body];
    
    // Upsert players (update if exists, insert if not)
    const operations = players.map((player: any) => ({
      updateOne: {
        filter: { id: player.id },
        update: { $set: player },
        upsert: true,
      },
    }));
    
    await Player.bulkWrite(operations);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving players:', error);
    return NextResponse.json({ error: 'Failed to save players' }, { status: 500 });
  }
}




