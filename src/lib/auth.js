import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import dbConnect from './db';
import Trainer from './models/Trainer';

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'pokedex_super_secret_session_token_key_123456');

export async function signToken(payload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(SECRET);
}

export async function verifyToken(token) {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload;
  } catch (err) {
    return null;
  }
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return null;
  
  const payload = await verifyToken(token);
  if (!payload) return null;
  
  try {
    await dbConnect();
    const trainer = await Trainer.findById(payload.userId).select('-password');
    return trainer;
  } catch (error) {
    console.error('Session retrieval DB error:', error);
    return null;
  }
}
