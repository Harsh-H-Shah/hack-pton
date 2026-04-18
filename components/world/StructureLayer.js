'use client';
import { Graphics, Container, Sprite } from '@pixi/react';
import { useRef, useEffect, useCallback } from 'react';
import { gsap } from 'gsap';
import { WORLD_ELEMENTS } from '@/lib/worldElements';

// Draw building with PixiJS Graphics — no sprite needed
function drawHome(g, tierId) {
  g.clear();
  const wallColor  = tierId >= 4 ? 0xf0e8d0 : tierId >= 2 ? 0xd4c8a8 : 0x9a9080;
  const roofColor  = tierId >= 4 ? 0xc0392b : tierId >= 2 ? 0x8b4513 : 0x5a4030;
  const doorColor  = 0x5a3a1a;
  const windowColor = tierId >= 3 ? 0x87ceeb : 0x6a6a7a;
  const glowColor  = tierId >= 5 ? 0xffffaa : windowColor;

  // Main wall
  g.beginFill(wallColor); g.drawRect(280, 220, 240, 150); g.endFill();
  // Roof (triangle)
  g.beginFill(roofColor);
  g.moveTo(265, 222); g.lineTo(400, 130); g.lineTo(535, 222); g.closePath();
  g.endFill();
  // Door
  g.beginFill(doorColor); g.drawRoundedRect(382, 300, 36, 70, 3); g.endFill();
  // Windows
  g.beginFill(glowColor); g.drawRoundedRect(305, 248, 48, 40, 3); g.endFill();
  g.beginFill(glowColor); g.drawRoundedRect(447, 248, 48, 40, 3); g.endFill();
  // Chimney
  g.beginFill(wallColor); g.drawRect(460, 142, 22, 58); g.endFill();
}

function drawOffice(g, tierId) {
  g.clear();
  const wallColor   = tierId >= 4 ? 0xd0e8f0 : tierId >= 2 ? 0xa0b8c8 : 0x7a8898;
  const glassColor  = tierId >= 3 ? 0x87ceeb : 0x6a8090;
  const frameColor  = tierId >= 4 ? 0xffffff : 0xaaaaaa;
  const accentColor = tierId >= 4 ? 0x10b981 : 0x446655;

  // Main tower
  g.beginFill(wallColor); g.drawRect(300, 120, 200, 250); g.endFill();
  // Roof bar
  g.beginFill(accentColor); g.drawRect(295, 116, 210, 10); g.endFill();
  // Glass windows grid
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 3; col++) {
      g.beginFill(glassColor);
      g.drawRoundedRect(315 + col * 58, 135 + row * 44, 44, 32, 2);
      g.endFill();
    }
  }
  // Entry door area
  g.beginFill(glassColor); g.drawRect(365, 330, 70, 40); g.endFill();
  // Green stripe (tier 4+)
  if (tierId >= 4) {
    g.beginFill(0x10b981, 0.4);
    g.drawRect(300, 120, 10, 250);
    g.drawRect(490, 120, 10, 250);
    g.endFill();
  }
}

function drawNeighborhood(g, tierId) {
  g.clear();
  const houseColor = tierId >= 4 ? 0xe8d4b0 : tierId >= 2 ? 0xc8b898 : 0x8a7a68;
  const roofColor  = tierId >= 4 ? 0x8b2020 : tierId >= 2 ? 0x5a3010 : 0x3a2810;
  const grassColor = tierId >= 4 ? 0x4a9a2a : tierId >= 2 ? 0x6a8a3a : 0x5a6a2a;

  // Two houses
  const houses = [{ x:155, w:130 }, { x:515, w:150 }];
  houses.forEach(h => {
    g.beginFill(houseColor); g.drawRect(h.x, 255, h.w, 115); g.endFill();
    g.beginFill(roofColor);
    g.moveTo(h.x - 12, 257);
    g.lineTo(h.x + h.w/2, 185);
    g.lineTo(h.x + h.w + 12, 257);
    g.closePath(); g.endFill();
  });
  // Park path in center
  g.beginFill(0xc8b870, 0.4); g.drawRoundedRect(340, 310, 120, 60, 8); g.endFill();
  // Ground overlay
  g.beginFill(grassColor, 0.2); g.drawRect(0, 360, 800, 30); g.endFill();
}

const DRAW_FNS = { home: drawHome, office: drawOffice, neighborhood: drawNeighborhood };

// Solar panel overlay (tier 3+ for energy unlocks on home/office)
function SolarPanelOverlay({ environment, tierId, unlocked }) {
  const hasSolar = unlocked.includes(`${environment}-energy-1`);
  if (!hasSolar) return null;

  const panelX = environment === 'home' ? 370 : 350;
  const panelY = environment === 'home' ? 165 : 130;

  const draw = useCallback((g) => {
    g.clear();
    g.beginFill(0x1a3a5c);
    for (let i = 0; i < 3; i++) {
      g.drawRoundedRect(panelX + i * 30, panelY, 26, 18, 2);
    }
    g.endFill();
    g.lineStyle(1, 0x4a9adc, 0.6);
    for (let i = 0; i < 3; i++) {
      // vertical divider
      g.moveTo(panelX + i * 30 + 13, panelY);
      g.lineTo(panelX + i * 30 + 13, panelY + 18);
      // horizontal divider
      g.moveTo(panelX + i * 30, panelY + 9);
      g.lineTo(panelX + i * 30 + 26, panelY + 9);
    }
  }, [panelX, panelY]);

  return <Graphics draw={draw} />;
}

function AnimatedSprite({ texture, x, y, scale }) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) {
      gsap.from(ref.current, { pixi: { alpha: 0, scaleX: scale * 0.5, scaleY: scale * 0.5 }, duration: 0.7, ease: 'elastic.out(1, 0.5)' });
    }
  }, []);
  if (!texture) return null;
  return <Sprite ref={ref} texture={texture} x={x} y={y} scale={scale} anchor={0.5} />;
}

export default function StructureLayer({ environment, tierId, textures, unlockedElements }) {
  const drawFn = DRAW_FNS[environment] ?? drawHome;
  const draw = useCallback((g) => drawFn(g, tierId), [environment, tierId]);

  return (
    <Container>
      <Graphics draw={draw} />
      <SolarPanelOverlay environment={environment} tierId={tierId} unlocked={unlockedElements} />
    </Container>
  );
}
