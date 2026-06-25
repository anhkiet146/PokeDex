import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Build from '@/lib/models/Build';
import { getSession } from '@/lib/auth';

export async function GET(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;
    const pokemonId = Number(id);

    if (!pokemonId) {
      return NextResponse.json({ error: 'ID Pokémon không hợp lệ' }, { status: 400 });
    }

    const builds = await Build.find({ pokemonId }).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, builds });
  } catch (error) {
    console.error('Fetch Pokemon Builds API Error:', error);
    return NextResponse.json({ error: 'Đã xảy ra lỗi hệ thống' }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;
    const pokemonId = Number(id);

    if (!pokemonId) {
      return NextResponse.json({ error: 'ID Pokémon không hợp lệ' }, { status: 400 });
    }

    const { buildTitle, moves, item, nature, description, teamComps } = await request.json();

    if (!buildTitle || !description) {
      return NextResponse.json({ error: 'Thiếu thông tin tiêu đề hoặc mô tả build' }, { status: 400 });
    }

    const newBuild = await Build.create({
      pokemonId,
      trainerId: session._id,
      trainerName: session.displayName,
      buildTitle,
      moves: Array.isArray(moves) ? moves : [],
      item,
      nature,
      description,
      teamComps: Array.isArray(teamComps) ? teamComps.map(Number) : []
    });

    return NextResponse.json({ success: true, build: newBuild });
  } catch (error) {
    console.error('Create Pokemon Build API Error:', error);
    return NextResponse.json({ error: 'Đã xảy ra lỗi hệ thống' }, { status: 500 });
  }
}
