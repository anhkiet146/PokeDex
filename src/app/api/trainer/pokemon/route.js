import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Trainer from '@/lib/models/Trainer';
import { getSession } from '@/lib/auth';

export async function POST(request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized session' }, { status: 401 });
    }

    await dbConnect();
    const { pokemonId, action } = await request.json(); // action: 'add' | 'remove'
    const idNum = Number(pokemonId);

    if (!idNum) {
      return NextResponse.json({ error: 'Invalid Pokémon ID' }, { status: 400 });
    }

    let update = {};
    if (action === 'add') {
      update = { $addToSet: { ownedPokemon: idNum } };
    } else if (action === 'remove') {
      update = { $pull: { ownedPokemon: idNum } };
    } else {
      return NextResponse.json({ error: 'Invalid collection action' }, { status: 400 });
    }

    const trainer = await Trainer.findByIdAndUpdate(
      session._id,
      update,
      { new: true }
    ).select('-password');

    return NextResponse.json({ success: true, trainer });
  } catch (error) {
    console.error('Trainer Pokemon Update API Error:', error);
    return NextResponse.json({ error: 'Internal server error occurred' }, { status: 500 });
  }
}
