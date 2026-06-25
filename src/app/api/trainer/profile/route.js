import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Trainer from '@/lib/models/Trainer';
import { getSession } from '@/lib/auth';

export async function PUT(request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized session' }, { status: 401 });
    }

    await dbConnect();
    const { displayName, dob, avatar } = await request.json();

    const updateFields = {};
    if (displayName !== undefined) updateFields.displayName = displayName;
    if (dob !== undefined) updateFields.dob = dob ? new Date(dob) : null;
    if (avatar !== undefined) updateFields.avatar = avatar;

    const trainer = await Trainer.findByIdAndUpdate(
      session._id,
      { $set: updateFields },
      { new: true }
    ).select('-password');

    return NextResponse.json({ success: true, trainer });
  } catch (error) {
    console.error('Trainer Profile Update API Error:', error);
    return NextResponse.json({ error: 'Internal server error occurred' }, { status: 500 });
  }
}
