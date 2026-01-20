import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/apiAuth';
import connectDB from '@/lib/mongodb';
import { Player } from '@/models/Player';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const unauthorized = requireAdmin();
  if (unauthorized) {
    return unauthorized;
  }

  try {
    await connectDB();
    const body = await request.json();
    const { id, ...updateData } = body;
    
    const player = await Player.findOneAndUpdate(
      { id: params.id },
      { $set: updateData },
      { new: true }
    );
    
    if (!player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 });
    }
    
    return NextResponse.json(player);
  } catch (error) {
    console.error('Error updating player:', error);
    return NextResponse.json({ error: 'Failed to update player' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const unauthorized = requireAdmin();
  if (unauthorized) {
    return unauthorized;
  }

  try {
    await connectDB();
    const result = await Player.deleteOne({ id: params.id });
    
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting player:', error);
    return NextResponse.json({ error: 'Failed to delete player' }, { status: 500 });
  }
}

