import { NextResponse } from 'next/server';
import { getUserStats, getActions } from '@/lib/db';
import { getTierForXp, getNextTier } from '@/lib/tiers';
import { calculateEquivalencies } from '@/lib/impact';

export async function GET(req) {
  const userId = req.nextUrl.searchParams.get('userId') ?? 'default-user';
  const { user, categoryCounts, actionsToday, categoryBreakdown } = getUserStats(userId);
  const tier = getTierForXp(user.total_xp);
  const nextTier = getNextTier(user.total_xp);
  const equivalencies = calculateEquivalencies(user.total_co2_saved);
  const recentActions = getActions(userId, 10);

  return NextResponse.json({
    user,
    tier,
    nextTier,
    equivalencies,
    categoryCounts,
    actionsToday,
    categoryBreakdown,
    recentActions,
  });
}
