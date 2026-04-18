'use client';
import { Graphics, useTick } from '@pixi/react';
import { useRef, useState, useCallback } from 'react';

const CLOUD_DEFS = [
  { x: 80,  y: 48,  r: 28, speed: 0.28 },
  { x: 350, y: 28,  r: 38, speed: 0.18 },
  { x: 620, y: 58,  r: 24, speed: 0.22 },
];

function Cloud({ def, tierId }) {
  const xRef = useRef(def.x);
  const [x, setX] = useState(def.x);

  // Cloud color: grey at low tiers, white at high tiers
  const color  = tierId <= 2 ? 0x888899 : 0xffffff;
  const alpha  = tierId <= 1 ? 0.45 : 0.8;
  const { r } = def;

  const draw = useCallback((g) => {
    g.clear();
    g.beginFill(color, alpha);
    // Puff cloud: 3 overlapping circles
    g.drawCircle(0,      0,   r);
    g.drawCircle(r * 1.1, -r * 0.3, r * 0.8);
    g.drawCircle(-r * 0.9, -r * 0.2, r * 0.7);
    g.endFill();
  }, [color, alpha, r]);

  useTick((delta) => {
    xRef.current += def.speed * delta;
    if (xRef.current > 920) xRef.current = -160;
    setX(xRef.current);
  });

  return <Graphics draw={draw} x={x} y={def.y} />;
}

export default function CloudLayer({ tierId }) {
  return (
    <>
      {CLOUD_DEFS.map((def, i) => (
        <Cloud key={i} def={def} tierId={tierId} />
      ))}
    </>
  );
}
