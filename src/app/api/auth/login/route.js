import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/db';
import Trainer from '@/lib/models/Trainer';
import { signToken } from '@/lib/auth';

export async function POST(request) {
  try {
    await dbConnect();
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Missing username or password' }, { status: 400 });
    }

    const trainer = await Trainer.findOne({ username: username.toLowerCase() });
    if (!trainer) {
      return NextResponse.json({ error: 'Incorrect username or password' }, { status: 400 });
    }

    const isMatch = await bcrypt.compare(password, trainer.password);
    if (!isMatch) {
      return NextResponse.json({ error: 'Incorrect username or password' }, { status: 400 });
    }

    // Sign JWT
    const token = await signToken({ userId: trainer._id });

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return NextResponse.json({
      success: true,
      trainer: {
        id: trainer._id,
        username: trainer.username,
        displayName: trainer.displayName,
        avatar: trainer.avatar,
      }
    });

  } catch (error) {
    console.error('Login API Error:', error);
    return NextResponse.json({ error: 'Internal server error occurred' }, { status: 500 });
  }
}
