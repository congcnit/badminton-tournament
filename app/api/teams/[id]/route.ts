import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Team } from '@/models/Team';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const result = await Team.deleteOne({ id: params.id });
    
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting team:', error);
    return NextResponse.json({ error: 'Failed to delete team' }, { status: 500 });
  }
}


