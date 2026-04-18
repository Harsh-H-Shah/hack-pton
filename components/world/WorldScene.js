'use client';
import WorldCanvas from './WorldCanvas';

// Thin wrapper kept for API compatibility with dynamic import in app/page.js
export default function WorldScene({ environment, tier, unlockedElements }) {
  return (
    <div style={{ width: '100%', borderRadius: 12, overflow: 'hidden', lineHeight: 0 }}>
      <WorldCanvas
        environment={environment}
        tier={tier}
        unlockedElements={unlockedElements}
      />
    </div>
  );
}
