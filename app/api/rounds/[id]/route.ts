import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/apiAuth';
import connectDB from '@/lib/mongodb';
import { Round } from '@/models/Round';

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
    const result = await Round.deleteOne({ id: params.id });
    
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Round not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting round:', error);
    return NextResponse.json({ error: 'Failed to delete round' }, { status: 500 });
  }
}

