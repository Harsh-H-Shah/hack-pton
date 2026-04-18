import { WORLD_ELEMENTS } from './worldElements.js';
import { getTierForXp, getNextTier } from './tiers.js';

export function computeWorldState(environment, categoryCounts, totalXp) {
  const tier = getTierForXp(totalXp);
  const nextTier = getNextTier(totalXp);
  const unlocked = new Set();

  for (const [id, el] of Object.entries(WORLD_ELEMENTS)) {
    if (el.env !== 'all' && el.env !== environment) continue;
    if (el.tier != null && tier.id >= el.tier) { unlocked.add(id); continue; }
    if (el.category != null && (categoryCounts[el.category] ?? 0) >= el.threshold) {
      unlocked.add(id);
    }
  }

  return { tier, nextTier, unlockedElements: [...unlocked] };
}
