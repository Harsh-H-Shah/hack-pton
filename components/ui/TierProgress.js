'use client';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export default function TierProgress({ currentXp, tier, nextTier }) {
  const barRef = useRef(null);
  const pct = nextTier
    ? Math.min(100, ((currentXp - tier.minXp) / (nextTier.minXp - tier.minXp)) * 100)
    : 100;

  useEffect(() => {
    if (barRef.current) {
      gsap.to(barRef.current, { width: `${pct}%`, duration: 0.6, ease: 'power2.out' });
    }
  }, [pct]);

  return (
    <div className="tier-progress">
      <div className="tier-progress-info">
        <span className="tier-name">{tier.emoji} {tier.name}</span>
        <span className="tier-xp">
          {currentXp} XP {nextTier ? `· ${nextTier.minXp - currentXp} to ${nextTier.name}` : '· MAX TIER'}
        </span>
      </div>
      <div className="tier-bar-track">
        <div ref={barRef} className="tier-bar-fill" style={{ width: 0 }} />
      </div>
    </div>
  );
}
