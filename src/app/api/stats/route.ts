import { NextRequest, NextResponse } from 'next/server';
import { dbGetStats } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin access required' },
        { status: 403 }
      );
    }

    const stats = await dbGetStats();
    return NextResponse.json({ success: true, stats });
  } catch (error) {
    console.error('API /stats GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch store statistics' },
      { status: 500 }
    );
  }
}
