import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/apiAuth';
import connectDB from '@/lib/mongodb';
import { Round } from '@/models/Round';

export async function GET() {
  try {
    await connectDB();
    const rounds = await Round.find({}).lean();
    return NextResponse.json(rounds);
  } catch (error) {
    console.error('Error fetching rounds:', error);
    return NextResponse.json({ error: 'Failed to fetch rounds' }, { status: 500 });
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
    const round = await Round.findOneAndUpdate(
      { id: body.id },
      { $set: body },
      { upsert: true, new: true }
    );
    return NextResponse.json(round);
  } catch (error) {
    console.error('Error saving round:', error);
    return NextResponse.json({ error: 'Failed to save round' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const unauthorized = requireAdmin();
  if (unauthorized) {
    return unauthorized;
  }

  try {
    await connectDB();
    const body = await request.json();
    const { id, ...updateData } = body;
    
    const round = await Round.findOneAndUpdate(
      { id },
      { $set: updateData },
      { new: true }
    );
    
    if (!round) {
      return NextResponse.json({ error: 'Round not found' }, { status: 404 });
    }
    
    return NextResponse.json(round);
  } catch (error) {
    console.error('Error updating round:', error);
    return NextResponse.json({ error: 'Failed to update round' }, { status: 500 });
  }
}




