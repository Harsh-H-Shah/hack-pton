'use client';
import { useEffect, useState } from 'react';
import { Assets, Texture } from 'pixi.js';
import { WORLD_ELEMENTS } from '@/lib/worldElements';

// All unique sprite filenames used across all elements
const SPRITE_FILES = [...new Set(Object.values(WORLD_ELEMENTS).map(e => e.sprite))];

export function useTextures() {
  const [textures, setTextures] = useState({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const load = async () => {
      const results = {};
      await Promise.all(
        SPRITE_FILES.map(async (file) => {
          try {
            const url = `/assets/kenney/${file}`;
            const tex = await Assets.load(url);
            results[file] = tex;
          } catch {
            // Graceful fallback — component renders a colored placeholder rect
            results[file] = null;
          }
        })
      );
      setTextures(results);
      setLoaded(true);
    };
    load();
  }, []);

  return { textures, loaded };
}
