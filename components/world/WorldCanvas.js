'use client';
import { useRef, useEffect, useCallback } from 'react';
import { WORLD_ELEMENTS } from '@/lib/worldElements';

// ── Tier-based visual config ────────────────────────────────────────────────
const TIER_SKY = [
  { top: '#2a2a3c', bot: '#3a3a52' }, // 1 Barren
  { top: '#3a5040', bot: '#557060' }, // 2 Stirring
  { top: '#3a72b0', bot: '#5a9ed5' }, // 3 Growing
  { top: '#2080c8', bot: '#87ceeb' }, // 4 Thriving
  { top: '#1060b8', bot: '#60b0e8' }, // 5 Flourishing
  { top: '#e87020', bot: '#f0c040' }, // 6 Eden (golden hour)
];
const TIER_GROUND = ['#5a4a28','#6a6a30','#4a7a2a','#2a6820','#1a5818','#104810'];
const TIER_SMOG   = [0.55, 0.38, 0.18, 0.05, 0, 0];

// ── Building draw functions ─────────────────────────────────────────────────
function drawHome(ctx, tierId, W, H) {
  const T  = tierId - 1;
  const wall   = T >= 3 ? '#f0e4c8' : T >= 1 ? '#c8b890' : '#8a7860';
  const roof   = T >= 3 ? '#b83020' : T >= 1 ? '#7a3a10' : '#4a2810';
  const door   = '#4a2a0a';
  const win    = T >= 2 ? '#a8d8f0' : '#606070';
  const glow   = T >= 4 ? '#ffffa0' : win;

  // Main wall
  ctx.fillStyle = wall;
  ctx.fillRect(260, 220, 280, 150);
  // Roof
  ctx.beginPath(); ctx.moveTo(245, 222); ctx.lineTo(400, 125); ctx.lineTo(555, 222);
  ctx.closePath(); ctx.fillStyle = roof; ctx.fill();
  // Chimney
  ctx.fillStyle = wall; ctx.fillRect(468, 138, 22, 58);
  // Door
  ctx.fillStyle = door; ctx.beginPath();
  ctx.roundRect(382, 302, 36, 68, 3); ctx.fill();
  // Windows
  ctx.fillStyle = glow;
  ctx.beginPath(); ctx.roundRect(288, 248, 52, 40, 3); ctx.fill();
  ctx.beginPath(); ctx.roundRect(460, 248, 52, 40, 3); ctx.fill();
  // Window glow at high tiers
  if (T >= 4) {
    ctx.save(); ctx.globalAlpha = 0.3;
    const grd = ctx.createRadialGradient(400, 260, 10, 400, 260, 140);
    grd.addColorStop(0, '#ffffaa'); grd.addColorStop(1, 'transparent');
    ctx.fillStyle = grd; ctx.fillRect(260, 180, 280, 180);
    ctx.restore();
  }
}

function drawOffice(ctx, tierId, W, H) {
  const T     = tierId - 1;
  const wall  = T >= 3 ? '#c8e0f0' : T >= 1 ? '#90a8c0' : '#6a7a8a';
  const glass = T >= 2 ? '#78c0e8' : '#506070';
  const green = T >= 3 ? '#10b981' : '#336655';

  // Tower body
  ctx.fillStyle = wall; ctx.fillRect(300, 110, 200, 260);
  // Top accent bar
  ctx.fillStyle = green; ctx.fillRect(296, 106, 208, 10);
  // Window grid
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 3; col++) {
      ctx.fillStyle = glass;
      ctx.beginPath();
      ctx.roundRect(318 + col * 58, 128 + row * 44, 42, 32, 2); ctx.fill();
    }
  }
  // Entry doors
  ctx.fillStyle = glass; ctx.fillRect(362, 330, 76, 40);
  // Green side stripes at tier 4+
  if (T >= 3) {
    ctx.save(); ctx.globalAlpha = 0.5;
    ctx.fillStyle = '#10b981';
    ctx.fillRect(300, 110, 8, 260); ctx.fillRect(492, 110, 8, 260);
    ctx.restore();
  }
}

function drawNeighborhood(ctx, tierId, W, H) {
  const T = tierId - 1;
  const house = T >= 3 ? '#e0c890' : T >= 1 ? '#b09870' : '#786850';
  const roof  = T >= 3 ? '#802020' : T >= 1 ? '#4a2810' : '#302010';

  const houses = [{x:145, w:140}, {x:515, w:150}];
  houses.forEach(h => {
    ctx.fillStyle = house; ctx.fillRect(h.x, 252, h.w, 118);
    ctx.beginPath();
    ctx.moveTo(h.x - 14, 254); ctx.lineTo(h.x + h.w/2, 178); ctx.lineTo(h.x + h.w + 14, 254);
    ctx.closePath(); ctx.fillStyle = roof; ctx.fill();
    // door
    ctx.fillStyle = '#3a2010';
    ctx.beginPath(); ctx.roundRect(h.x + h.w/2 - 14, 320, 28, 50, 2); ctx.fill();
  });
  // Centre path / park
  ctx.save(); ctx.globalAlpha = 0.35;
  ctx.fillStyle = T >= 2 ? '#88b840' : '#c0a840';
  ctx.beginPath(); ctx.roundRect(300, 300, 200, 70, 8); ctx.fill();
  ctx.restore();
}

const DRAW_BUILDING = { home: drawHome, office: drawOffice, neighborhood: drawNeighborhood };

// ── Sun / Moon ──────────────────────────────────────────────────────────────
function drawSun(ctx, tierId) {
  if (tierId < 3) return;
  const T = tierId - 1;
  const alpha = Math.min(1, (T - 1) * 0.3);
  const radius = T >= 5 ? 32 : 22;
  const x = tierId === 6 ? 680 : 680;
  const y = tierId === 6 ? 60  : 55;
  ctx.save(); ctx.globalAlpha = alpha;
  // Glow
  const grd = ctx.createRadialGradient(x, y, 0, x, y, radius * 2.5);
  grd.addColorStop(0, tierId === 6 ? '#fff0a0' : '#fff8c0');
  grd.addColorStop(1, 'transparent');
  ctx.fillStyle = grd; ctx.beginPath(); ctx.arc(x, y, radius * 2.5, 0, Math.PI*2); ctx.fill();
  // Core
  ctx.fillStyle = tierId === 6 ? '#ffdd40' : '#ffe88a';
  ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI*2); ctx.fill();
  ctx.restore();
}

// ── Smog ────────────────────────────────────────────────────────────────────
function drawSmog(ctx, tierId, W, H) {
  const alpha = TIER_SMOG[Math.min(5, tierId - 1)];
  if (alpha <= 0) return;
  ctx.save(); ctx.globalAlpha = alpha;
  ctx.fillStyle = '#8a8a9a';
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

// ── Clouds (drawn at offset provided by animation loop) ─────────────────────
const CLOUD_DEFS = [
  { baseX: 80,  y: 50, r: 30, speed: 0.35 },
  { baseX: 350, y: 30, r: 42, speed: 0.22 },
  { baseX: 620, y: 62, r: 26, speed: 0.28 },
];

function drawCloud(ctx, x, y, r, tierId) {
  const color = tierId <= 2 ? '#8888a0' : '#ffffff';
  const alpha = tierId <= 1 ? 0.4 : 0.85;
  ctx.save(); ctx.globalAlpha = alpha; ctx.fillStyle = color;
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2);
  ctx.arc(x + r*1.1, y - r*0.3, r*0.75, 0, Math.PI*2);
  ctx.arc(x - r*0.85, y - r*0.2, r*0.65, 0, Math.PI*2);
  ctx.fill(); ctx.restore();
}

// ── Sprite cache ─────────────────────────────────────────────────────────────
const imageCache = {};
function loadImage(src) {
  if (imageCache[src]) return imageCache[src];
  const p = new Promise((resolve) => {
    const img = new Image();
    img.onload  = () => resolve(img);
    img.onerror = () => resolve(null);  // graceful: just skip
    img.src = src;
  });
  imageCache[src] = p;
  return p;
}

// ── Main component ──────────────────────────────────────────────────────────
export default function WorldCanvas({ environment = 'home', tier, unlockedElements = [] }) {
  const canvasRef = useRef(null);
  const rafRef    = useRef(null);
  const cloudX    = useRef(CLOUD_DEFS.map(c => c.baseX));
  const spritesRef = useRef({});   // loaded Image objects keyed by filename
  const tierId = tier?.id ?? 1;

  // Load all sprites needed for unlocked elements
  useEffect(() => {
    const filenames = [...new Set(
      unlockedElements
        .map(id => WORLD_ELEMENTS[id]?.sprite)
        .filter(Boolean)
    )];
    Promise.all(
      filenames.map(async f => {
        const img = await loadImage(`/assets/kenney/${f}`);
        if (img) spritesRef.current[f] = img;
      })
    );
  }, [unlockedElements]);

  // Main draw function (called every rAF tick)
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;

    // Sky gradient
    const sky = TIER_SKY[Math.min(5, tierId - 1)];
    const skyGrd = ctx.createLinearGradient(0, 0, 0, H * 0.8);
    skyGrd.addColorStop(0, sky.top);
    skyGrd.addColorStop(1, sky.bot);
    ctx.fillStyle = skyGrd;
    ctx.fillRect(0, 0, W, H);

    // Sun
    drawSun(ctx, tierId);

    // Clouds (animated)
    CLOUD_DEFS.forEach((def, i) => {
      drawCloud(ctx, cloudX.current[i], def.y, def.r, tierId);
    });

    // Building
    const buildFn = DRAW_BUILDING[environment] ?? drawHome;
    buildFn(ctx, tierId, W, H);

    // Ground
    const groundColor = TIER_GROUND[Math.min(5, tierId - 1)];
    ctx.fillStyle = groundColor;
    ctx.fillRect(0, 368, W, H - 368);
    // Ground highlight strip
    ctx.save(); ctx.globalAlpha = 0.25;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 368, W, 8);
    ctx.restore();

    // Unlocked sprites
    unlockedElements.forEach(id => {
      const el = WORLD_ELEMENTS[id];
      if (!el) return;
      const img = spritesRef.current[el.sprite];
      if (!img) return;
      const w = img.naturalWidth  * el.scale;
      const h = img.naturalHeight * el.scale;
      ctx.drawImage(img, el.x - w/2, el.y - h, w, h);
    });

    // Smog overlay
    drawSmog(ctx, tierId, W, H);
  }, [environment, tierId, unlockedElements]);

  // Animation loop
  useEffect(() => {
    let last = performance.now();

    const loop = (now) => {
      const delta = (now - last) / 16.67; // normalise to ~60fps
      last = now;

      // Move clouds
      CLOUD_DEFS.forEach((def, i) => {
        cloudX.current[i] += def.speed * delta;
        if (cloudX.current[i] > 950) cloudX.current[i] = -170;
      });

      draw();
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={450}
      style={{ width: '100%', height: 'auto', display: 'block', borderRadius: 12 }}
    />
  );
}
