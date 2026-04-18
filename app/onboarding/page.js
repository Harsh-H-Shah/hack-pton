'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const ENVIRONMENTS = [
  { id: 'home',         emoji: '🏠', name: 'Home',         desc: 'House, apartment, yard — your personal space' },
  { id: 'office',       emoji: '🏢', name: 'Office',       desc: 'Workplace, co-working space, campus' },
  { id: 'neighborhood', emoji: '🏙️', name: 'Neighborhood', desc: 'Streets, parks, community spaces' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [selecting, setSelecting] = useState(null);

  const handleSelect = async (envId) => {
    setSelecting(envId);
    try {
      await fetch('/api/world', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'default-user', environment: envId }),
      });
      localStorage.setItem('ecoverse-env', envId);
      router.push('/');
    } catch {
      setSelecting(null);
    }
  };

  return (
    <div className="onboarding-page">
      <div className="onboarding-header">
        <span className="onboarding-logo">🌿</span>
        <h1>Welcome to EcoVerse</h1>
        <p>Your sustainable choices build a living world. Choose your environment to begin.</p>
      </div>
      <div className="env-grid">
        {ENVIRONMENTS.map(env => (
          <button
            key={env.id}
            className={`env-card ${selecting === env.id ? 'env-card--selecting' : ''}`}
            onClick={() => handleSelect(env.id)}
            disabled={selecting !== null}
          >
            <span className="env-emoji">{env.emoji}</span>
            <span className="env-name">{env.name}</span>
            <span className="env-desc">{env.desc}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
