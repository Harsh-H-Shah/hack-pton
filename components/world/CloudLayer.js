'use client';
import { Sprite, useTick } from '@pixi/react';
import { useRef, useState } from 'react';

const CLOUDS = [
  { x: 80,  y: 50, scale: 0.6, speed: 0.3 },
  { x: 350, y: 30, scale: 0.9, speed: 0.2 },
  { x: 620, y: 60, scale: 0.7, speed: 0.25 },
];

function Cloud({ texture, initialX, y, scale, speed, tierId }) {
  const xRef = useRef(initialX);
  const [x, setX] = useState(initialX);

  useTick((delta) => {
    xRef.current += speed * delta;
    if (xRef.current > 900) xRef.current = -150;
    setX(xRef.current);
  });

  // Grey tint at low tiers, white at high tiers
  const tint = tierId <= 2 ? 0x999999 : 0xffffff;
  const alpha = tierId <= 1 ? 0.5 : 0.85;

  if (!texture) return null;
  return <Sprite texture={texture} x={x} y={y} scale={scale} tint={tint} alpha={alpha} anchor={0.5} />;
}

export default function CloudLayer({ textures, tierId }) {
  const cloudTex = textures['cloudA.png'] ?? textures['cloud.png'];
  return (
    <>
      {CLOUDS.map((c, i) => (
        <Cloud key={i} texture={cloudTex} initialX={c.x} y={c.y}
               scale={c.scale} speed={c.speed} tierId={tierId} />
      ))}
    </>
  );
}
