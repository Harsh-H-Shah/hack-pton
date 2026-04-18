import { NextResponse } from 'next/server';
import { getOrCreateUser, getCategoryCounts, setEnvironment } from '@/lib/db';
import { computeWorldState } from '@/lib/worldState';
import { getNextTier } from '@/lib/tiers';

export async function GET(req) {
  const userId = req.nextUrl.searchParams.get('userId') ?? 'default-user';
  const user = getOrCreateUser(userId);
  const categoryCounts = getCategoryCounts(userId);
  const { tier, nextTier, unlockedElements } = computeWorldState(
    user.environment, categoryCounts, user.total_xp
  );

  return NextResponse.json({
    tier,
    nextTier,
    environment: user.environment,
    unlockedElements,
    totalXp: user.total_xp,
    categoryCounts,
  });
}

export async function POST(req) {
  const { userId = 'default-user', environment } = await req.json();
  if (environment) setEnvironment(userId, environment);

  const user = getOrCreateUser(userId);
  const categoryCounts = getCategoryCounts(userId);
  const { tier, nextTier, unlockedElements } = computeWorldState(
    user.environment, categoryCounts, user.total_xp
  );

  return NextResponse.json({
    tier,
    nextTier,
    environment: user.environment,
    unlockedElements,
    totalXp: user.total_xp,
    categoryCounts,
  });
}
