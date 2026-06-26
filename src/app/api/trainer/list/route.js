import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Trainer from '@/lib/models/Trainer';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized session' }, { status: 401 });
    }

    await dbConnect();
    // Fetch all trainers except the current one and the default 'admin'
    const trainers = await Trainer.find({
      _id: { $ne: session._id },
      username: { $ne: 'admin' }
    })
    .select('_id displayName avatar teams ownedPokemon createdAt')
    .sort({ displayName: 1 });

    return NextResponse.json({ success: true, trainers });
  } catch (error) {
    console.error('Fetch Trainer List API Error:', error);
    return NextResponse.json({ error: 'Internal server error occurred' }, { status: 500 });
  }
}
