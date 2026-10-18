import { NextRequest, NextResponse } from 'next/server';
import { dbFindUserByEmail, dbCreateUser } from '@/lib/db';
import { hashPassword, signToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, role = 'customer' } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    const existing = await dbFindUserByEmail(email);
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);
    const userRole = role === 'admin' ? 'admin' : 'customer';

    const newUser = await dbCreateUser({
      name,
      email,
      passwordHash,
      role: userRole,
    });

    const token = await signToken(newUser);

    const response = NextResponse.json({
      success: true,
      user: newUser,
      token,
      message: 'Registration successful!',
    });

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error('API /auth/register error:', error);
    return NextResponse.json(
      { success: false, error: 'Registration failed' },
      { status: 500 }
    );
  }
}
