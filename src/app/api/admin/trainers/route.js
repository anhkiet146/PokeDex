import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Trainer from '@/lib/models/Trainer';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'admin' && session.username !== 'admin')) {
      return NextResponse.json({ error: 'Unauthorized admin access' }, { status: 403 });
    }

    await dbConnect();
    const trainers = await Trainer.find({}).select('-password').sort({ createdAt: -1 });
    return NextResponse.json({ success: true, trainers });
  } catch (error) {
    console.error('Admin Fetch Trainers Error:', error);
    return NextResponse.json({ error: 'Internal server error occurred' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'admin' && session.username !== 'admin')) {
      return NextResponse.json({ error: 'Unauthorized admin access' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing trainer ID' }, { status: 400 });
    }

    await dbConnect();
    const targetTrainer = await Trainer.findById(id);
    if (!targetTrainer) {
      return NextResponse.json({ error: 'Trainer not found' }, { status: 404 });
    }

    // Prevent admin from deleting themselves
    if (targetTrainer.username === 'admin') {
      return NextResponse.json({ error: 'Cannot delete the main admin account' }, { status: 400 });
    }

    await Trainer.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin Delete Trainer Error:', error);
    return NextResponse.json({ error: 'Internal server error occurred' }, { status: 500 });
  }
}
