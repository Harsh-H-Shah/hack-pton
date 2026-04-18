'use client';
import { Sprite, Container } from '@pixi/react';
import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { WORLD_ELEMENTS } from '@/lib/worldElements';

const BUILDING_SPRITES = {
  home:         'houseA.png',
  office:       'buildingA.png',
  neighborhood: 'houseTall.png',
};

// Which element IDs are "structure layer" (mounted on or near the building)
const STRUCTURE_IDS = ['home-energy-1', 'office-energy-1'];

function AnimatedSprite({ texture, x, y, scale, anchor = 0.5 }) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) {
      gsap.from(ref.current, { pixi: { alpha: 0, scaleX: scale * 0.6, scaleY: scale * 0.6 }, duration: 0.7, ease: 'elastic.out(1, 0.5)' });
    }
  }, []);
  if (!texture) return null;
  return <Sprite ref={ref} texture={texture} x={x} y={y} scale={scale} anchor={anchor} />;
}

export default function StructureLayer({ environment, textures, unlockedElements }) {
  const buildingSprite = BUILDING_SPRITES[environment] ?? 'houseA.png';
  const buildingTex = textures[buildingSprite];

  const structureUnlocked = unlockedElements.filter(id => STRUCTURE_IDS.includes(id));

  return (
    <Container>
      {/* Main building */}
      {buildingTex && (
        <Sprite texture={buildingTex} x={400} y={280} scale={1.4} anchor={[0.5, 1]} />
      )}
      {/* Structure-mounted upgrades */}
      {structureUnlocked.map(id => {
        const el = WORLD_ELEMENTS[id];
        if (!el) return null;
        const tex = textures[el.sprite];
        return <AnimatedSprite key={id} texture={tex} x={el.x} y={el.y} scale={el.scale} />;
      })}
    </Container>
  );
}
