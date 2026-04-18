export const TIERS = [
  { id: 1, name: "Barren",      minXp: 0,    emoji: "🌫️", description: "A grey, polluted landscape. Every action helps.",       skyColor: 0x3a3a4a },
  { id: 2, name: "Stirring",    minXp: 50,   emoji: "🌱", description: "The first signs of life are appearing.",                 skyColor: 0x4a6a5a },
  { id: 3, name: "Growing",     minXp: 150,  emoji: "🌿", description: "Green patches spread. The air is clearing.",             skyColor: 0x5b9bd5 },
  { id: 4, name: "Thriving",    minXp: 350,  emoji: "🌳", description: "A healthy ecosystem is taking shape.",                   skyColor: 0x87ceeb },
  { id: 5, name: "Flourishing", minXp: 700,  emoji: "🌸", description: "Nature is abundant. Wildlife has returned.",             skyColor: 0x1e90ff },
  { id: 6, name: "Eden",        minXp: 1200, emoji: "🌍", description: "A paradise. Your choices changed the world.",            skyColor: 0xffd580 },
];

export function getTierForXp(xp) {
  return [...TIERS].reverse().find(t => xp >= t.minXp) ?? TIERS[0];
}

export function getNextTier(xp) {
  return TIERS.find(t => t.minXp > xp) ?? null;
}
