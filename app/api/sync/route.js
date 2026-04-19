import { NextResponse } from 'next/server';
import { resyncUser } from '@/lib/db';

export async function POST(req) {
  try {
    const { userId = 'default-user', xp = 0, co2 = 0 } = await req.json();
    if (xp > 0) resyncUser(userId, xp, co2);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false });
  }
}
