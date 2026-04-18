'use client';
import { Graphics, Sprite, Container } from '@pixi/react';
import { useCallback, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { WORLD_ELEMENTS } from '@/lib/worldElements';

// Ground color per tier
const GROUND_COLORS = [0x6a5a30, 0x7a7a40, 0x5a8a3a, 0x3d7a3d, 0x2d7030, 0x1a6020];

function UnlockedSprite({ texture, el }) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) {
      gsap.from(ref.current, {
        pixi: { alpha: 0, y: el.y + 25 },
        duration: 0.8,
        ease: 'back.out(1.4)',
      });
    }
  }, []);

  if (!texture) return null;
  return (
    <Sprite
      ref={ref}
      texture={texture}
      x={el.x} y={el.y}
      scale={el.scale}
      anchor={[0.5, 1]}
    />
  );
}

export default function GroundLayer({ tierId, textures, unlockedElements, environment }) {
  const groundColor = GROUND_COLORS[Math.max(0, Math.min(5, tierId - 1))];

  const drawGround = useCallback((g) => {
    g.clear();
    g.beginFill(groundColor);
    g.drawRect(0, 368, 800, 82);
    g.endFill();
    // Lighter top strip
    g.beginFill(groundColor + 0x181808);
    g.drawRect(0, 368, 800, 10);
    g.endFill();
  }, [groundColor]);

  // Render every unlocked element whose sprite is ground-level
  // (structure-layer elements like solar panels are handled in StructureLayer)
  const STRUCTURE_IDS = new Set(['home-energy-1', 'office-energy-1', 'nbhd-energy-1']);

  return (
    <Container>
      <Graphics draw={drawGround} />
      {unlockedElements.map(id => {
        if (STRUCTURE_IDS.has(id)) return null;
        const el = WORLD_ELEMENTS[id];
        if (!el) return null;
        const texture = textures[el.sprite];
        return <UnlockedSprite key={id} texture={texture} el={el} />;
      })}
    </Container>
  );
}
