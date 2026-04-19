import { NextResponse } from 'next/server';
import { getOrCreateUser, logAction, getActions, resyncUser } from '@/lib/db';
import { getActionById } from '@/lib/actions';
import { getTierForXp } from '@/lib/tiers';

export async function POST(req) {
  try {
    const { actionId, userId = 'default-user', description, clientXp = 0, clientCo2 = 0 } = await req.json();

    // Resync DB from client if this Lambda instance just cold-started with empty /tmp
    if (clientXp > 0) resyncUser(userId, clientXp, clientCo2);

    const actionDef = getActionById(actionId);
    if (!actionDef) return NextResponse.json({ error: 'Unknown action' }, { status: 400 });

    const prevUser = getOrCreateUser(userId);
    const prevTier = getTierForXp(prevUser.total_xp);

    const updatedUser = logAction(
      userId, actionId, actionDef.category,
      actionDef.xp, actionDef.co2,
      description ?? actionDef.label
    );

    const newTier = getTierForXp(updatedUser.total_xp);
    const tierChanged = newTier.id !== prevTier.id;

    return NextResponse.json({
      success: true,
      xp: actionDef.xp,
      co2: actionDef.co2,
      newTotalXp: updatedUser.total_xp,
      newTotalCo2: updatedUser.total_co2_saved,
      newTier,
      tierChanged,
    });
  } catch (err) {
    console.error('POST /api/actions error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function GET(req) {
  const userId = req.nextUrl.searchParams.get('userId') ?? 'default-user';
  const actions = getActions(userId, 20);
  return NextResponse.json({ actions });
}
