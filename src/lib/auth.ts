import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { NextRequest } from 'next/server';
import { IUser } from './types';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'super-secret-jwt-key-for-modern-ecommerce-platform-2026'
);

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export async function signToken(user: IUser): Promise<string> {
  return new SignJWT({
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<IUser | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      _id: (payload.id as string) || (payload.sub as string),
      name: payload.name as string,
      email: payload.email as string,
      role: payload.role as 'admin' | 'customer',
    };
  } catch {
    return null;
  }
}

export async function getUserFromRequest(req: NextRequest): Promise<IUser | null> {
  // Check Authorization Bearer header first
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const user = await verifyToken(token);
    if (user) return user;
  }

  // Check auth cookie
  const cookie = req.cookies.get('token');
  if (cookie?.value) {
    const user = await verifyToken(cookie.value);
    if (user) return user;
  }

  return null;
}
