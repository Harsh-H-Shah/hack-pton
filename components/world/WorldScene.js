'use client';
import { Stage, Graphics, Container } from '@pixi/react';
import { useCallback, useRef, forwardRef, useImperativeHandle } from 'react';
import { gsap } from 'gsap';
import { useTextures } from './useTextures';
import SmogLayer from './SmogLayer';
import CloudLayer from './CloudLayer';
import StructureLayer from './StructureLayer';
import GroundLayer from './GroundLayer';

// Sky colors per tier (hex numbers for PixiJS)
const SKY_COLORS = [0x3a3a4a, 0x4a6a5a, 0x5b9bd5, 0x87ceeb, 0x1e90ff, 0xffd580];

function WorldSkeleton() {
  return (
    <div style={{
      width: '100%', aspectRatio: '16/9', maxHeight: 450,
      background: 'linear-gradient(to bottom, #2a2a3a, #3a3a4a)',
      borderRadius: 12, display: 'flex', alignItems: 'center',
      justifyContent: 'center', color: '#666', fontSize: 14,
    }}>
      Loading world...
    </div>
  );
}

const WorldScene = forwardRef(function WorldScene(
  { environment = 'home', tier, unlockedElements = [] },
  ref
) {
  const { textures, loaded } = useTextures();
  const skyColor = SKY_COLORS[(tier?.id ?? 1) - 1] ?? SKY_COLORS[0];

  // Expose burst() for XP sparkle from parent
  useImperativeHandle(ref, () => ({
    burst: () => {
      // Simple DOM sparkle fallback — PixiJS particle emitter would need more setup
      // The ActionCard handles the visual pop; this is a placeholder for canvas particles
    },
  }));

  if (!loaded) return <WorldSkeleton />;

  return (
    <div style={{ width: '100%', borderRadius: 12, overflow: 'hidden', lineHeight: 0 }}>
      <Stage
        width={800} height={450}
        options={{ backgroundColor: skyColor, antialias: true, resolution: 1 }}
        style={{ width: '100%', height: 'auto', display: 'block' }}
      >
        <SmogLayer tierId={tier?.id ?? 1} />
        <CloudLayer tierId={tier?.id ?? 1} />
        <StructureLayer
          environment={environment}
          tierId={tier?.id ?? 1}
          textures={textures}
          unlockedElements={unlockedElements}
        />
        <GroundLayer
          tierId={tier?.id ?? 1}
          textures={textures}
          unlockedElements={unlockedElements}
          environment={environment}
        />
      </Stage>
    </div>
  );
});

export default WorldScene;
