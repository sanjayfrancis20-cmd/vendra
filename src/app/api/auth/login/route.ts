import { NextRequest, NextResponse } from 'next/server';
import { dbFindUserByEmail } from '@/lib/db';
import { comparePassword, signToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const userWithHash = await dbFindUserByEmail(email);
    if (!userWithHash) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const isMatch = await comparePassword(password, userWithHash.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const user = {
      _id: userWithHash._id,
      name: userWithHash.name,
      email: userWithHash.email,
      role: userWithHash.role,
    };

    const token = await signToken(user);

    const response = NextResponse.json({
      success: true,
      user,
      token,
      message: `Welcome back, ${user.name}!`,
    });

    // Set secure cookie
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error('API /auth/login error:', error);
    return NextResponse.json(
      { success: false, error: 'Login failed due to internal error' },
      { status: 500 }
    );
  }
}
