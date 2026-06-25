import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Trainer from '@/lib/models/Trainer';
import { getSession } from '@/lib/auth';

export async function POST(request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
    }

    await dbConnect();
    const { pokemonId, action } = await request.json(); // action: 'add' | 'remove'
    const idNum = Number(pokemonId);

    if (!idNum) {
      return NextResponse.json({ error: 'ID Pokémon không hợp lệ' }, { status: 400 });
    }

    let update = {};
    if (action === 'add') {
      update = { $addToSet: { ownedPokemon: idNum } };
    } else if (action === 'remove') {
      update = { $pull: { ownedPokemon: idNum } };
    } else {
      return NextResponse.json({ error: 'Hành động không hợp lệ' }, { status: 400 });
    }

    const trainer = await Trainer.findByIdAndUpdate(
      session._id,
      update,
      { new: true }
    ).select('-password');

    return NextResponse.json({ success: true, trainer });
  } catch (error) {
    console.error('Trainer Pokemon Update API Error:', error);
    return NextResponse.json({ error: 'Đã xảy ra lỗi hệ thống' }, { status: 500 });
  }
}
