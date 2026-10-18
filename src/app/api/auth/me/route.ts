import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ success: true, user: null });
    }
    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('API /auth/me GET error:', error);
    return NextResponse.json({ success: true, user: null });
  }
}

export async function POST() {
  const response = NextResponse.json({ success: true, message: 'Logged out successfully' });
  response.cookies.set('token', '', {
    httpOnly: true,
    expires: new Date(0),
    path: '/',
  });
  return response;
}
