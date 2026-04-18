'use client';
import { Graphics } from '@pixi/react';
import { useCallback } from 'react';

export default function SmogLayer({ tierId }) {
  // Smog fades from 0.55 at tier 1 to 0 at tier 4+
  const alpha = Math.max(0, (4 - tierId) * 0.18);

  const draw = useCallback((g) => {
    g.clear();
    g.beginFill(0x6b7280, alpha);
    g.drawRect(0, 0, 800, 450);
    g.endFill();
  }, [alpha]);

  return <Graphics draw={draw} />;
}
