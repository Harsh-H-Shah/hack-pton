'use client';
import { Graphics, Sprite, Container } from '@pixi/react';
import { useCallback, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { WORLD_ELEMENTS } from '@/lib/worldElements';

// Ground color per tier
const GROUND_COLORS = [0x7a6a40, 0x8a8a50, 0x5a8a3a, 0x3d7a3d, 0x2d7030, 0x1a6020];

function UnlockedSprite({ texture, el, elementId }) {
  const spriteRef = useRef(null);

  useEffect(() => {
    if (spriteRef.current) {
      gsap.from(spriteRef.current, { pixi: { alpha: 0, y: el.y + 30 }, duration: 0.8, ease: 'back.out(1.5)' });
    }
  }, []);

  if (!texture) {
    // Emoji fallback rendered as a placeholder div — not visible in PixiJS canvas,
    // but we skip gracefully
    return null;
  }

  return (
    <Sprite
      ref={spriteRef}
      texture={texture}
      x={el.x} y={el.y}
      scale={el.scale}
      anchor={0.5}
      interactive
      cursor="pointer"
    />
  );
}

export default function GroundLayer({ tierId, textures, unlockedElements, environment }) {
  const groundColor = GROUND_COLORS[tierId - 1] ?? GROUND_COLORS[0];

  const drawGround = useCallback((g) => {
    g.clear();
    // Main ground band
    g.beginFill(groundColor);
    g.drawRect(0, 370, 800, 80);
    g.endFill();
    // Lighter ground strip
    g.beginFill(groundColor + 0x101010);
    g.drawRect(0, 370, 800, 12);
    g.endFill();
  }, [groundColor]);

  // Ground-level elements only (not structure layer)
  const groundEls = Object.entries(WORLD_ELEMENTS).filter(([, el]) => {
    if (el.env !== 'all' && el.env !== environment) return false;
    if (!unlockedElements.includes(el.env === 'all' ? Object.keys(WORLD_ELEMENTS).find(k => WORLD_ELEMENTS[k] === el) : null) &&
        !unlockedElements.some(uid => WORLD_ELEMENTS[uid] === el)) return false;
    return true;
  });

  return (
    <Container>
      <Graphics draw={drawGround} />
      {unlockedElements.map(id => {
        const el = WORLD_ELEMENTS[id];
        if (!el) return null;
        if (el.env !== 'all' && el.env !== environment) return null;
        // Skip structure-layer elements (handled by StructureLayer)
        if (id.includes('energy-1') || id.includes('energy-facade')) return null;
        const texture = textures[el.sprite];
        return (
          <UnlockedSprite key={id} texture={texture} el={el} elementId={id} />
        );
      })}
    </Container>
  );
}
